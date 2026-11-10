"""AUTHORITY_1's gateway, unchanged, under a thin subclass: the money, stops, retries, ledger and refusal breaker are
AUTHORITY_1's `Gateway.call`. Added here only:
- the worst case of a call in flight also holds the input of messages whose content is a list of text blocks (the
  parent counts a string's characters; for block lists it would count blocks);
- prompt caching: Anthropic models get `cache_control` (a block marked in the message, or the top-level automatic
  mark), OpenAI and DeepInfra cache identical prefixes by themselves; caching changes the price, never the tokens a
  model sees;
- a loopback server with the routes the workers use (/llm with extras, /embed, /status).
"""
from __future__ import annotations

import base64
import json
import re
import struct
import threading

from authority1.gateway import Gateway
from authority1.specs import worst_cost


def _chars(messages):
    n = 0
    for m in messages:
        c = m.get("content")
        if isinstance(c, str):
            n += len(c)
        elif isinstance(c, list):
            n += sum(len(b.get("text") or "") for b in c if isinstance(b, dict))
    return n


def _parent_chars(messages):
    return sum(len(m.get("content") or "") for m in messages)


class Gateway3(Gateway):
    def call(self, spec_name, messages, **kw):
        extra_in = max(0.0, worst_cost(spec_name, _chars(messages), 0) - worst_cost(spec_name, _parent_chars(messages), 0))
        if extra_in:
            why = self._hold(extra_in)
            if why:
                return {"spec": spec_name, "text": None, "stopped": why, "error": None, "refused": False, "attempts": 0,
                        "latency_ms": 0, "usage": {}, "cost": 0.0}
        try:
            return super().call(spec_name, messages, **kw)
        finally:
            if extra_in:
                self._release(extra_in, 0.0)

    def serve(self):
        gw = self
        from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

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
                try:
                    if self.path == "/embed/v1/embeddings":
                        inp = body.get("input")
                        inp = [inp] if isinstance(inp, str) else list(inp)
                        vecs = gw.embed(inp)
                        b64 = body.get("encoding_format") == "base64"
                        data = [{"object": "embedding", "index": i,
                                 "embedding": base64.b64encode(struct.pack(f"<{len(v)}f", *v)).decode() if b64 else v}
                                for i, v in enumerate(vecs)]
                        return self._send(200, {"object": "list", "data": data, "model": body.get("model"),
                                                "usage": {"prompt_tokens": 0, "total_tokens": 0}})
                    if self.path == "/llm":
                        r = gw.call(body["spec"], body["messages"], family=body["family"], arm=body["arm"],
                                    lane=body["lane"], key=body["key"], max_tokens=body.get("max_tokens"),
                                    response_format=body.get("response_format"), reasoning=body.get("reasoning"),
                                    extra=body.get("extra"))
                        r.pop("raw_openai", None)
                        return self._send(200, r)
                    if self.path == "/status":
                        return self._send(200, {"stop": gw.stop_reason, "spent": gw.spent, "held": gw.held})
                    return self._send(404, {"error": "no route"})
                except Exception as e:
                    return self._send(500, {"error": {"message": f"gateway: {type(e).__name__}: {e}"}})

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), H)
        self.server.daemon_threads = True
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        return self.server.server_address[1]


ANTHROPIC = re.compile(r"^anthropic/")


def is_anthropic(spec_name):
    from authority1.specs import SPECS
    return bool(ANTHROPIC.match(SPECS[spec_name]["model"]))
