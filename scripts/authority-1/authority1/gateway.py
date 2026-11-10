"""The loopback gateway (main process): the only place money is spent.

- POST /llm                              — the harness's own calls (arms, layer, judges)
- POST /mem0/<family>~<key>/v1/chat/completions — Mem0's own LLM calls (OpenAI-compatible; Mem0 unmodified)
- POST /embed/v1/embeddings              — local ONNX embeddings for Mem0 (fastembed, cached model, local files only)

Holds the cap (every call in flight held at its worst cost), the ledger (one JSON line per paid attempt, no content),
the stops (402, 401/403, policy, 429 after bounded waits), the transport retries and the refusal breaker.
"""
from __future__ import annotations

import base64
import json
import re
import struct
import threading
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from . import client
from .specs import (BREAKER, CAP_USD, JUDGE_REASONING, MAX_TOKENS, REASONING, SPECS, WAITS_429, WAITS_TRANSPORT,
                    worst_cost)


class Gateway:
    def __init__(self, ledger_path: Path, cap: float = CAP_USD, embed_model: str = "BAAI/bge-small-en-v1.5",
                 embed_cache: str = "/home/user/authority-1-mem0/models"):
        self.ledger_path = Path(ledger_path)
        self.cap = cap
        self.lock = threading.Lock()
        self.held = 0.0
        self.spent = 0.0
        self.stop_reason = None
        self.refusals = {}
        self.breakers = {}
        self.calls = 0
        if self.ledger_path.exists():
            for line in self.ledger_path.read_text().splitlines():
                if line.strip():
                    self.spent += float(json.loads(line).get("cost") or 0)
        from fastembed import TextEmbedding
        self.embedder = TextEmbedding(model_name=embed_model, cache_dir=embed_cache, local_files_only=True)
        self.embed_lock = threading.Lock()
        self.server = None

    # ---- money --------------------------------------------------------------------------------------------------
    def _hold(self, worst):
        with self.lock:
            if self.stop_reason:
                return self.stop_reason
            if self.spent + self.held + worst > self.cap:
                self.stop_reason = f"ceiling: ${self.spent:.2f} spent + ${self.held:.2f} in flight + ${worst:.2f} worst case > ${self.cap}"
                return self.stop_reason
            self.held += worst
            return None

    def _release(self, worst, cost):
        with self.lock:
            self.held -= worst
            self.spent += cost

    def stop(self, why):
        with self.lock:
            if not self.stop_reason:
                self.stop_reason = why

    def _ledger(self, row):
        with self.lock:
            with self.ledger_path.open("a") as f:
                f.write(json.dumps(row) + "\n")

    # ---- one logical call (with its bounded retries) --------------------------------------------------------------
    def call(self, spec_name: str, messages: list, *, family: str, arm: str, lane: str, key: str,
             max_tokens: int | None = None, response_format=None, reasoning=None, extra=None):
        out = {"spec": spec_name, "family": family, "arm": arm, "lane": lane, "key": key, "text": None, "error": None,
               "refused": False, "stopped": None, "attempts": 0, "latency_ms": 0, "usage": {}, "cost": 0.0}
        brk = (family, arm)
        if self.breakers.get(brk):
            out["stopped"] = f"breaker: {self.breakers[brk]}"
            return out
        mt = max_tokens or MAX_TOKENS.get(lane.split(".")[-1], 8000)
        reasoning = reasoning or (JUDGE_REASONING if lane in ("judge", "referee") else REASONING)
        body = client.body_for(spec_name, messages, mt, reasoning, response_format)
        if extra:
            body.update(extra)
        out["request"] = {k: v for k, v in body.items() if k != "messages"}
        chars = sum(len(m.get("content") or "") for m in messages)
        worst = worst_cost(spec_name, chars, mt)
        w429, wtr = list(WAITS_429), list(WAITS_TRANSPORT)
        while True:
            why = self._hold(worst)
            if why:
                out["stopped"] = why
                return out
            out["attempts"] += 1
            cost, status, parsed, ms, terr = 0.0, None, None, 0, None
            try:
                status, parsed, ms = client.chat_once(spec_name, body)
            except client.Transport as e:
                terr = str(e)
            if isinstance(parsed, dict):
                cost = float(((parsed.get("usage") or {}).get("cost")) or 0.0)
            self._release(worst, cost)
            out["latency_ms"] += ms
            self._ledger({"at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "family": family, "arm": arm,
                          "lane": lane, "key": key, "model": SPECS[spec_name]["model"], "status": status,
                          "provider": parsed.get("provider") if isinstance(parsed, dict) else None,
                          "usage": {k: v for k, v in ((parsed or {}).get("usage") or {}).items() if k != "cost_details"} if isinstance(parsed, dict) else {},
                          "cost": cost, "latency_ms": ms, "transport_error": terr})
            out["cost"] += cost
            if terr or (status in (500, 502, 503, 504, 529)):
                if wtr:
                    time.sleep(wtr.pop(0))
                    continue
                out["error"] = terr or f"HTTP {status}: {str(parsed)[:300]}"
                return out
            if status == 429:
                txt = json.dumps(parsed) if not isinstance(parsed, str) else parsed
                if "enforced_spend_limit" in txt or "quota" in txt.lower():
                    self.stop(f"429 quota: {txt[:200]}")
                    out["stopped"] = self.stop_reason
                    return out
                if w429:
                    time.sleep(w429.pop(0))
                    continue
                self.stop("429 after six bounded waits")
                out["stopped"] = self.stop_reason
                return out
            if status == 402:
                self.stop(f"402: {str(parsed)[:200]}")
                out["stopped"] = self.stop_reason
                return out
            if status in (401, 403):
                self.stop(f"HTTP {status}: {str(parsed)[:200]}")
                out["stopped"] = self.stop_reason
                return out
            if status != 200 or not isinstance(parsed, dict):
                txt = str(parsed)[:400]
                if re.search(r"suspend|policy|access denied", txt, re.I):
                    self.stop(f"HTTP {status}: {txt[:200]}")
                    out["stopped"] = self.stop_reason
                    return out
                out["error"] = f"HTTP {status}: {txt}"
                return out
            if parsed.get("error"):
                out["error"] = f"error in body: {json.dumps(parsed['error'])[:300]}"
                return out
            # a reply
            spec = SPECS[spec_name]
            out["provider"] = parsed.get("provider")
            out["model"] = parsed.get("model")
            if out["provider"] != spec["provider_name"] or spec["stem"] not in str(out["model"] or ""):
                out["error"] = f"host/model mismatch: {out['provider']} / {out['model']}"
                return out
            ch = (parsed.get("choices") or [{}])[0]
            msg = ch.get("message") or {}
            out["text"] = msg.get("content") or ""
            out["finish_reason"] = ch.get("finish_reason")
            out["native_finish_reason"] = ch.get("native_finish_reason")
            u = parsed.get("usage") or {}
            out["usage"] = {"prompt_tokens": u.get("prompt_tokens"), "completion_tokens": u.get("completion_tokens"),
                            "reasoning_tokens": (u.get("completion_tokens_details") or {}).get("reasoning_tokens"),
                            "cached_tokens": (u.get("prompt_tokens_details") or {}).get("cached_tokens")}
            if out["finish_reason"] == "content_filter" or str(out["native_finish_reason"]).lower() in ("refusal", "content_filter"):
                out["refused"] = True
                with self.lock:
                    self.refusals[brk] = self.refusals.get(brk, 0) + 1
                    if self.refusals[brk] >= BREAKER and not self.breakers.get(brk):
                        self.breakers[brk] = f"{self.refusals[brk]} refusals on {family}/{arm} (last at {key})"
            out["raw_openai"] = {"id": parsed.get("id"), "object": parsed.get("object", "chat.completion"),
                                 "created": parsed.get("created"), "model": parsed.get("model"),
                                 "choices": [{"index": 0, "message": {"role": "assistant", "content": out["text"]},
                                              "finish_reason": out["finish_reason"] or "stop"}],
                                 "usage": {"prompt_tokens": u.get("prompt_tokens") or 0,
                                           "completion_tokens": u.get("completion_tokens") or 0,
                                           "total_tokens": (u.get("prompt_tokens") or 0) + (u.get("completion_tokens") or 0)}}
            return out

    # ---- embeddings ---------------------------------------------------------------------------------------------
    def embed(self, texts):
        with self.embed_lock:
            return [v.tolist() for v in self.embedder.embed(list(texts))]

    # ---- server -------------------------------------------------------------------------------------------------
    def serve(self):
        gw = self
        mem0_calls = {}

        class H(BaseHTTPRequestHandler):
            def log_message(self, *a):
                pass

            def _send(self, code, obj):
                data = json.dumps(obj).encode()
                self.send_response(code)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)

            def do_POST(self):
                n = int(self.headers.get("Content-Length") or 0)
                body = json.loads(self.rfile.read(n) or b"{}")
                p = self.path
                try:
                    if p == "/embed/v1/embeddings":
                        inp = body.get("input")
                        inp = [inp] if isinstance(inp, str) else list(inp)
                        vecs = gw.embed(inp)
                        b64 = body.get("encoding_format") == "base64"
                        data = [{"object": "embedding", "index": i,
                                 "embedding": base64.b64encode(struct.pack(f"<{len(v)}f", *v)).decode() if b64 else v}
                                for i, v in enumerate(vecs)]
                        return self._send(200, {"object": "list", "data": data, "model": body.get("model"),
                                                "usage": {"prompt_tokens": 0, "total_tokens": 0}})
                    m = re.fullmatch(r"/mem0/([a-z]+)~([a-z]+)~([^/]+)/v1/chat/completions", p)
                    if m:
                        family, spec, key = m.group(1), m.group(2), m.group(3)
                        # Mem0's request, as Mem0 built it, minus sampling knobs (no call in this stage sets a
                        # temperature); the subject's pin, budget and reasoning are added by the gateway.
                        rf = body.get("response_format")
                        r = gw.call(spec, body["messages"], family=family, arm="mem0", lane="mem0", key=key,
                                    max_tokens=MAX_TOKENS["mem0"], response_format=rf)
                        r["mem0_request"] = {k: v for k, v in body.items() if k != "messages"}
                        r["mem0_messages"] = body["messages"]
                        mem0_calls.setdefault(f"{family}~{spec}~{key}", []).append(r)
                        if r.get("text") is not None and not r.get("refused"):
                            return self._send(200, r["raw_openai"])
                        return self._send(400, {"error": {"message": r.get("stopped") or r.get("error") or "refused", "type": "gateway"}})
                    if p == "/llm":
                        r = gw.call(body["spec"], body["messages"], family=body["family"], arm=body["arm"],
                                    lane=body["lane"], key=body["key"], max_tokens=body.get("max_tokens"),
                                    response_format=body.get("response_format"))
                        r.pop("raw_openai", None)
                        return self._send(200, r)
                    if p == "/mem0calls":
                        return self._send(200, {"calls": mem0_calls.pop(body["key"], [])})
                    if p == "/status":
                        return self._send(200, {"stop": gw.stop_reason, "spent": gw.spent, "held": gw.held,
                                                "breakers": {f"{a}/{b}": v for (a, b), v in gw.breakers.items()}})
                    return self._send(404, {"error": "no route"})
                except Exception as e:  # never leak a traceback into Mem0 as a reply
                    return self._send(500, {"error": {"message": f"gateway: {type(e).__name__}: {e}"}})

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), H)
        self.server.daemon_threads = True
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        return self.server.server_address[1]
