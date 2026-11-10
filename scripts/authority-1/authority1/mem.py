"""Mem0 open-source in local mode, unmodified: qdrant on local disk, fastembed (ONNX) embeddings on CPU, SQLite
history, telemetry off, its LLM pointed at this harness's loopback gateway (which pins the subject model on
OpenRouter). Mem0 is used only through its public API: Memory.from_config, add, search, get_all."""
from __future__ import annotations

import os
from pathlib import Path

from . import guard

MEM0_HOME = Path(os.environ.get("AUTHORITY1_MEM0_HOME", "/home/user/authority-1-mem0"))
EMBED_MODEL = "BAAI/bge-small-en-v1.5"
EMBED_DIMS = 384
TOP_K = 20            # Mem0's own default for search()
MEM0_LLM_MAX_TOKENS = 8000


def prepare_env():
    guard.install("worker")
    os.environ["FASTEMBED_CACHE_PATH"] = str(MEM0_HOME / "models")
    os.environ["MEM0_DIR"] = str(MEM0_HOME / "mem0-dir")
    # fastembed (a Mem0 dependency) asks the Hugging Face API before loading even a cached model and has no offline
    # switch; here it is made to load from the local cache only (the two models were downloaded once at install:
    # BAAI/bge-small-en-v1.5 for Mem0's dense vectors, Qdrant/bm25 for Mem0's BM25 slot). Mem0's own code is untouched.
    from fastembed.common.model_management import ModelManagement
    if not getattr(ModelManagement, "_authority1_local_only", False):
        orig = ModelManagement.download_model.__func__

        def local_only(cls, model, cache_dir, retries=3, **kw):
            kw["local_files_only"] = True
            return orig(cls, model, cache_dir, 1, **kw)
        ModelManagement.download_model = classmethod(local_only)
        ModelManagement._authority1_local_only = True


def config(store_dir: Path, model: str, gateway_port: int, key: str):
    return {
        "vector_store": {"provider": "qdrant", "config": {
            "collection_name": "authority1", "path": str(store_dir / "qdrant"), "on_disk": True,
            "embedding_model_dims": EMBED_DIMS}},
        "embedder": {"provider": "fastembed", "config": {"model": EMBED_MODEL, "embedding_dims": EMBED_DIMS}},
        "llm": {"provider": "openai", "config": {
            "model": model, "api_key": "loopback-gateway-no-key",
            "openai_base_url": f"http://127.0.0.1:{gateway_port}/mem0/{key}/v1",
            "max_tokens": MEM0_LLM_MAX_TOKENS}},
        "history_db_path": str(store_dir / "history.db"),
    }


def open_store(store_dir: Path, model: str, gateway_port: int, key: str):
    from mem0 import Memory  # imported after the guard
    store_dir.mkdir(parents=True, exist_ok=True)
    return Memory.from_config(config(store_dir, model, gateway_port, key))


def meta_of(it: dict) -> dict:
    m = {"item_id": it["id"], "kind": it["kind"], "item_date": it["date"], "source": it["source"]}
    for k in ("depends_on", "revokes"):
        if it.get(k):
            m[k] = list(it[k])
    for k in ("expires", "due"):
        if it.get(k):
            m[k] = it[k]
    return m


def slim(mem: dict) -> dict:
    md = mem.get("metadata") or {}
    return {"mem_id": mem.get("id"), "text": mem.get("memory"), "score": round(float(mem.get("score") or 0), 4),
            "item_id": md.get("item_id"), "kind": md.get("kind"), "item_date": md.get("item_date"),
            "depends_on": md.get("depends_on") or [], "revokes": md.get("revokes") or [], "expires": md.get("expires"),
            "due": md.get("due"), "source": md.get("source")}
