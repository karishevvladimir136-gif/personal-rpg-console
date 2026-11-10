# Mem0 beside the repo (pinned, never vendored)

```bash
mkdir -p /home/user/authority-1-mem0 && cd /home/user/authority-1-mem0
uv venv --python 3.13 .venv
uv pip install --python .venv/bin/python "mem0ai[nlp]==2.2.1" "fastembed==0.7.3" \
  "en_core_web_sm @ https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl"
# the two local models, once (install step; afterwards the runs load them from this cache only)
FASTEMBED_CACHE_PATH=/home/user/authority-1-mem0/models .venv/bin/python -c \
  "from fastembed import TextEmbedding, SparseTextEmbedding; TextEmbedding('BAAI/bge-small-en-v1.5'); SparseTextEmbedding('Qdrant/bm25')"
```

Exact versions of everything installed: `requirements.lock.txt` (its hash is in the freeze). No Mem0 cloud key is needed
or used. Run: `/home/user/authority-1-mem0/.venv/bin/python -I scripts/authority-1/run.py <command>` from the repo root.
