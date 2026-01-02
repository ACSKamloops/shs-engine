# Domain-Specific Intelligence — Pukaist Engine

This note describes the initial "insights" structure produced by the worker and how it can evolve into richer, domain-specific intelligence using LLMs and additional heuristics.

## Current Insights Shape

The worker now derives a small, heuristic `insights` object for each processed document and stores it in the per-task JSON artifact under `99_Working_Files/Evidence_Staging/<task_id>.json`, as well as summarizing key fields in the theme notebooks.

The current shape:

```json
{
  "theme": "string | null",
  "doc_type": "string | null",
  "has_geo": true,
  "coord_count": 3,
  "top_terms": ["term1", "term2", "term3"],
  "sample_coords": [
    { "lat": 49.25, "lon": -123.1 }
  ]
}
```

Notes:
- `theme` and `doc_type` come from existing metadata inference.
- `has_geo` and `coord_count` reflect the coordinates found by `geo.extract_coords`.
- `top_terms` are the most frequent non-trivial tokens in the document (simple local heuristic).
- `sample_coords` is a small sample of coordinates for quick inspection.

## Purpose

The `insights` object is meant to be:
- A stable, extensible container for derived intelligence about each document.
- A bridge between pure text/metadata and richer, domain-specific analytics.
- Safe to compute locally without LLMs; richer fields can be added and populated by LLMs later.

## LLM-Enhanced Insights (Future)

In future iterations, you can extend `insights` with fields such as:
- `entities`: key people/organizations/places extracted from the text.
- `topics`: high-level topics or categories for the document.
- `risks` or `issues`: structured descriptions of risks, issues, or anomalies relevant to your domain.
- `actions`: suggested follow-up actions or checks.

These can be populated by:
- Adding a separate LLM call in the worker (or batch pipeline) that:
  - Takes the text and metadata.
  - Produces a structured JSON object matching an expanded `insights` schema.
  - Is validated and merged with the heuristic fields before storage.
- Or by offline analysis scripts that read the existing artifacts and write back enriched `insights`.

## Integration Points

- **Artifacts & notebooks**
  - `insights` is included in the JSON artifact and summarized in the theme notebooks under an "Insights (heuristic)" section.
- **Search & dashboards**
  - Future work can:
    - Index selected insights fields (e.g., topics, entities) into the search index.
    - Drive UI filters or dashboards using these fields.

This document and the corresponding `insights` implementation complete the first step of the Domain-Specific Intelligence workstream in `MASTER_PLAN.md` (designing a schema and adding an initial extraction pipeline), while keeping the system local-first and LLM-optional.

