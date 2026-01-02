# Local Walkthrough (offline)

Purpose: a repeatable local flow that exercises intake-scan → worker (prefilter on) → hybrid-capable search/map using the demo project config without external services.

## Prereqs
- Python deps installed (`pip install -r requirements.txt`).
- Do **not** start the API/worker yet; this script will run a single worker iteration inline.

## Quick run (scripted)
```bash
./scripts/local_walkthrough.sh
```
What it does:
- Seeds a throwaway workspace under `/tmp/pukaist_walkthrough` (override with `PUKAIST_WALKTHROUGH_DIR`).
- Copies `tests/foo.txt` into `Incoming`.
- Runs `scripts/intake_scan.py` to enqueue the file.
- Runs `worker.run_once()` once (LLM offline, embeddings/OCR off).
- Executes a direct search against the index to show the ingested doc.
- Prints a hint to start the API: `PUKAIST_WORKSPACE=/tmp/pukaist_walkthrough make api`.
- Tip: run the console against this workspace and upload with an intent payload (allowed_exts/prefilter/llm_mode) to see the intent appear in doc detail.
- Optional: with the API running, run `API_BASE=http://localhost:8000 API_KEY=dev-token ./scripts/smoke_filters.sh` to exercise filtered `/tasks` and `/search`/`/docs` endpoints.

## Manual steps (if you prefer to drive)
1) Set a temporary workspace:
   ```bash
   export PUKAIST_WORKSPACE=/tmp/pukaist_walkthrough
   export PUKAIST_INCOMING_DIR=$PUKAIST_WORKSPACE/incoming
   export PUKAIST_STAGING_DIR=$PUKAIST_WORKSPACE/staging
   export PUKAIST_INDEX_PATH=$PUKAIST_WORKSPACE/index.db
   export PUKAIST_QUEUE_DB=$PUKAIST_WORKSPACE/queue.db
   export PUKAIST_LOG_DIR=$PUKAIST_WORKSPACE/logs
   export PUKAIST_REFINED_DIR=$PUKAIST_WORKSPACE/reports
   export PUKAIST_ALLOWED_EXTS=txt
   export PUKAIST_LLM_OFFLINE=true
   mkdir -p "$PUKAIST_INCOMING_DIR"
   ```
2) Drop a file in Incoming:
   ```bash
   cp tests/foo.txt "$PUKAIST_INCOMING_DIR"/sample.txt
   ```
3) Enqueue:
   ```bash
   python3 -m scripts.intake_scan
   ```
4) Process one task:
   ```bash
   python3 - <<'PY'
   from src import worker
   print("worker processed:", worker.run_once())
   PY
   ```
5) Verify search results:
   ```bash
   python3 - <<'PY'
   from src import search_index, config
   s = config.Settings.load()
   search_index.init(s.index_path)
   rows = search_index.search(s.index_path, "foo", limit=5, tenant_id=None)
   print([dict(r) for r in rows])
   PY
   ```
6) Start the API for the console:
   ```bash
   PUKAIST_WORKSPACE=$PUKAIST_WORKSPACE make api
   ```
7) Open `frontend/index.html` in your browser, set API base/key, load `projects/demo.json`, and use the map/search panels (hybrid search works when embeddings are enabled).

Notes:
- Prefilter keywords/min length come from `projects/demo.json` or your own project config; the worker still enforces server-side rules.
- LLM stays offline by default; switch via env (`PUKAIST_LLM_OFFLINE=false`, model settings) if you need real calls.
