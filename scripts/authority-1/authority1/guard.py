"""Egress guard: nothing leaves the sandbox except this harness's own calls to openrouter.ai.

Installed first thing in every process, before Mem0, openai, httpx or posthog are imported:
- the proxy variables are taken out of the environment (kept privately for the one client that may use them), so no
  library can discover the sandbox's egress proxy;
- `MEM0_TELEMETRY=False`, `HF_HUB_OFFLINE=1`, `HF_HUB_DISABLE_TELEMETRY=1`, `DO_NOT_TRACK=1`; no Mem0, OpenAI or
  OpenRouter key is put into the environment;
- `socket.getaddrinfo` and `socket.socket.connect` are wrapped: loopback only. A connection to the egress proxy port is
  allowed only while the harness's own client holds the thread-local permit, and that client only tunnels to
  openrouter.ai:443. Every attempt is recorded; a blocked one raises and is counted.
"""
from __future__ import annotations

import os
import socket
import threading
import urllib.parse

ALLOWED_TUNNEL = "openrouter.ai"
_PROXY_VARS = ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy", "ALL_PROXY", "all_proxy",
               "YARN_HTTPS_PROXY", "GLOBAL_AGENT_HTTPS_PROXY", "DOCKER_HTTPS_PROXY", "ELECTRON_GET_USE_PROXY"]
_state = {"installed": False, "proxy": None, "attempts": [], "blocked": [], "lock": threading.Lock()}
_permit = threading.local()
LOOPBACK = {"127.0.0.1", "::1", "localhost"}


def install(role: str):
    if _state["installed"]:
        return
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    if proxy:
        u = urllib.parse.urlparse(proxy)
        _state["proxy"] = (u.hostname, u.port)
    for v in _PROXY_VARS:
        os.environ.pop(v, None)
    for k in ("OPENROUTER_API_KEY", "OPENAI_API_KEY", "MEM0_API_KEY", "ANTHROPIC_API_KEY"):
        os.environ.pop(k, None)
    os.environ["MEM0_TELEMETRY"] = "False"
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
    os.environ["DO_NOT_TRACK"] = "1"
    os.environ["NO_PROXY"] = "*"
    os.environ["no_proxy"] = "*"

    real_gai = socket.getaddrinfo
    real_connect = socket.socket.connect

    def record(kind, target, ok):
        with _state["lock"]:
            _state["attempts"].append((role, kind, str(target), ok))
            if not ok:
                _state["blocked"].append((role, kind, str(target)))

    def gai(host, *a, **k):
        h = host.decode() if isinstance(host, bytes) else str(host)
        ok = h in LOOPBACK
        record("dns", h, ok)
        if not ok:
            raise OSError(f"egress guard: DNS lookup of {h} blocked")
        return real_gai(host, *a, **k)

    def connect(self, address):
        if self.family in (socket.AF_INET, socket.AF_INET6) and isinstance(address, tuple):
            host, port = address[0], address[1]
            ok = host in LOOPBACK
            if ok and _state["proxy"] and port == _state["proxy"][1] and not getattr(_permit, "on", False):
                ok = False
            record("connect", f"{host}:{port}", ok)
            if not ok:
                raise OSError(f"egress guard: connect to {host}:{port} blocked")
        return real_connect(self, address)

    socket.getaddrinfo = gai
    socket.socket.connect = connect
    _state["installed"] = True


class permit:
    """Held only by the harness's own OpenRouter client while it opens its tunnel."""

    def __enter__(self):
        _permit.on = True

    def __exit__(self, *exc):
        _permit.on = False


def proxy():
    return _state["proxy"]


def report():
    with _state["lock"]:
        kinds = {}
        for role, kind, target, ok in _state["attempts"]:
            if ok:
                kinds.setdefault(target, 0)
                kinds[target] += 1
        return {"blocked": list(_state["blocked"]), "allowed_targets": kinds}
