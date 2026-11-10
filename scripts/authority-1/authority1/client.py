"""The one door out: OpenRouter's chat completions, through the sandbox's egress proxy, from the main process only.
Standard library only (http.client tunnel + the sandbox CA bundle). The key is read from APP_OPENROUTER_API_KEY and
is never written anywhere."""
from __future__ import annotations

import http.client
import json
import os
import ssl
import time

from . import guard
from .specs import OPENROUTER_CHAT, OPENROUTER_CREDITS, SPECS, TIMEOUT_S

CA = "/root/.ccr/ca-bundle.crt"
_KEY = os.environ.get("APP_OPENROUTER_API_KEY")  # read at import, before the guard scrubs nothing of it (APP_ is not scrubbed)


class Transport(Exception):
    pass


def _request(method: str, url: str, body: dict | None, timeout: float = TIMEOUT_S):
    if not _KEY:
        raise RuntimeError("APP_OPENROUTER_API_KEY is not set (wrong environment?)")
    from urllib.parse import urlparse
    u = urlparse(url)
    assert u.hostname == guard.ALLOWED_TUNNEL, u.hostname
    ctx = ssl.create_default_context(cafile=CA)
    prox = guard.proxy()
    with guard.permit():
        if prox:
            conn = http.client.HTTPSConnection(prox[0], prox[1], timeout=timeout, context=ctx)
            conn.set_tunnel(u.hostname, 443)
        else:
            conn = http.client.HTTPSConnection(u.hostname, 443, timeout=timeout, context=ctx)
        try:
            conn.connect()
        except Exception as e:
            conn.close()
            raise Transport(f"connect: {e}") from e
    try:
        data = json.dumps(body).encode() if body is not None else None
        headers = {"Authorization": f"Bearer {_KEY}", "Content-Type": "application/json", "X-Title": "authority-1"}
        conn.request(method, u.path, body=data, headers=headers)
        resp = conn.getresponse()
        raw = resp.read()
        return resp.status, raw
    except (TimeoutError, OSError, http.client.HTTPException) as e:
        raise Transport(f"{type(e).__name__}: {e}") from e
    finally:
        conn.close()


def credits():
    st, raw = _request("GET", OPENROUTER_CREDITS, None, timeout=60)
    if st != 200:
        return {"error": f"HTTP {st}"}
    d = json.loads(raw)["data"]
    return {"total": d["total_credits"], "usage": d["total_usage"], "left": d["total_credits"] - d["total_usage"]}


def body_for(spec_name: str, messages: list, max_tokens: int, reasoning: dict, response_format=None):
    s = SPECS[spec_name]
    b = {"model": s["model"], "messages": messages, "max_tokens": max_tokens, "reasoning": reasoning,
         "provider": {"order": [s["slug"]], "allow_fallbacks": False, "require_parameters": True},
         "usage": {"include": True}}
    if response_format:
        b["response_format"] = response_format
    return b


def chat_once(spec_name: str, body: dict):
    """One HTTP attempt. Returns (status, parsed-or-text, latency_ms)."""
    t = time.time()
    st, raw = _request("POST", OPENROUTER_CHAT, body)
    ms = int((time.time() - t) * 1000)
    try:
        return st, json.loads(raw), ms
    except Exception:
        return st, raw.decode("utf-8", "replace")[:2000], ms
