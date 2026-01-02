# Domain Intelligence — Example Flows

This note shows how to use the existing API, artifacts, and notebooks to explore the heuristic `insights` and map overlays that the engine now produces.

## 1. Inspecting Insights Artifacts

For each processed task, the worker writes a JSON artifact under:
- `99_Working_Files/Evidence_Staging/<task_id>.json`

Each artifact includes:
- `metadata` — inferred title/doc_type/theme/date.
- `summary` — optional LLM summary (when enabled).
- `insights` — heuristic intelligence (theme/doc_type, top terms, geo hints, sample coordinates).

Use these artifacts to:
- Prototype additional analytics (e.g., tag extraction, clustering).
- Validate that `insights` fields align with your expectations before adding LLM-based enrichment.

## 2. Notebooks as Domain Reports

Theme notebooks under:
- `01_Internal_Reports/Refined_<theme>.md`

contain:
- Per-task sections with title, doc_type, inferred_date.
- Summary text (or a placeholder if LLM is disabled).
- A short "Insights (heuristic)" block listing top terms and coordinate counts.

You can:
- Open these notebooks in any Markdown viewer as living domain reports.
- Copy/paste sections into your own reporting tools or wikis.

## 3. Search Flows

Use the `/search` endpoint to explore content and derived insights:

- **Free-text search**
  - `GET /search?q=term&limit=20`
  - Returns matches with `title`, `summary`, `doc_type`, `inferred_date`, and a `snippet`.
- **Recent docs**
  - `GET /docs?limit=50`
  - Shows the latest indexed documents; you can cross-reference `task_id` with artifacts/notebooks.

In future iterations, selected `insights` fields (e.g., topics, tags, entities) can be indexed to enable:
- Filtering by topic/category.
- Faceted search on domains of interest.

## 4. Map & AOI Flows

- **GeoJSON**
  - `GET /geojson?limit=100`
  - Returns a FeatureCollection of point features derived from document coordinates.
  - Each feature includes:
    - `theme`, `title`, `task_id`, `doc_id` in `properties`.
- **AOIs**
  - `POST /aoi?name=Demo&theme=MyTheme&coords=[[lon,lat], ...]`
  - `GET /aoi`
  - Lets you overlay Areas of Interest (polygons) on maps, keyed by theme.
- **Manual point assignment**
  - `POST /docs/{doc_id}/coords?lat=<lat>&lon=<lon>`
  - Allows you to attach a point to a specific document manually (for example, after clicking on the map). These points show up alongside auto-extracted coordinates in `/geojson`.

Using the web demo (`docs/web-demo.html`):
- Upload documents, then:
  - Explore search results and summaries.
  - View map overlays combining extracted points and AOIs.

## 5. Putting It Together

Typical analysis loop:
1. Upload a batch of domain documents (e.g., reports for a specific project).
2. Let the worker generate metadata, summaries (if enabled), `insights`, and map points.
3. Use `/search` and `/docs` to find relevant documents by theme, term, or doc_type.
4. Use `/geojson`, `/aoi`, and optional manual points (`/docs/{id}/coords`) to understand spatial distribution and overlaps with Areas of Interest.
5. Inspect artifacts and notebooks to refine:
   - What counts as “useful info”.
   - How you might extend `insights` with LLM-based extraction (topics, entities, risks) in a future iteration.

This doc, combined with `docs/domain-intelligence.md`, completes the initial “example flows” portion of the Domain-Specific Intelligence workstream in `MASTER_PLAN.md`.
