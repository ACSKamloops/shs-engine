from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from . import search_index


def _read_contradictions(path: Path) -> List[Dict[str, str]]:
    if not path.exists():
        return []
    try:
        import csv

        with path.open("r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f, delimiter="\t")
            return list(reader)
    except Exception:
        return []


def build_graph(
    index_path: Path,
    queues_dir: Path,
    contradictions_path: Path,
    tenant_id: Optional[str] = None,
    limit_docs: int = 2000,
    theme_filter: Optional[str] = None,
    include_entities: bool = True,
    max_entities_per_type_per_doc: int = 5,
    include_contradictions: bool = True,
    max_contradictions: int = 500,
) -> Dict[str, Any]:
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []

    theme_nodes: Dict[str, str] = {}
    doc_nodes: Dict[int, str] = {}

    theme_filter_lc = (theme_filter or "").strip().lower()

    # Themes from queue shards
    for p in queues_dir.glob("Queue_*.tsv"):
        if p.is_file():
            theme = p.stem.replace("Queue_", "")
            if theme_filter_lc and theme_filter_lc not in theme.lower():
                continue
            if theme not in theme_nodes:
                nid = f"theme:{theme}"
                theme_nodes[theme] = nid
                nodes.append({"id": nid, "type": "theme", "label": theme})

    # Docs
    docs = list(
        search_index.list_docs(
            index_path,
            limit=limit_docs,
            tenant_id=tenant_id,
            theme=theme_filter if theme_filter_lc else None,
        )
    )
    for d in docs:
        did = int(d.get("id"))
        nid = f"doc:{did}"
        doc_nodes[did] = nid
        label = d.get("stable_id") or f"Doc {did}"
        nodes.append(
            {
                "id": nid,
                "type": "doc",
                "label": label,
                "data": {
                    "title": d.get("title"),
                    "theme": d.get("theme"),
                    "doc_type": d.get("doc_type"),
                    "inferred_date": d.get("inferred_date"),
                    "provenance": d.get("provenance"),
                },
            }
        )
        theme = (d.get("theme") or "").strip()
        if theme:
            if theme not in theme_nodes:
                tnode = f"theme:{theme}"
                theme_nodes[theme] = tnode
                nodes.append({"id": tnode, "type": "theme", "label": theme})
            edges.append({"source": theme_nodes[theme], "target": nid, "type": "has_doc"})

        # Entities (if present) -> lightweight nodes
        if include_entities:
            entities_json = d.get("entities_json")
            if entities_json:
                try:
                    ents = json.loads(entities_json)
                except Exception:
                    ents = None
                if isinstance(ents, dict):
                    for etype, values in ents.items():
                        if not isinstance(values, list):
                            continue
                        for v in values[: max(0, max_entities_per_type_per_doc)]:
                            if not isinstance(v, str):
                                continue
                            enid = f"entity:{etype}:{v}"
                            if not any(n["id"] == enid for n in nodes):
                                nodes.append(
                                    {
                                        "id": enid,
                                        "type": "entity",
                                        "label": v,
                                        "data": {"entity_type": etype},
                                    }
                                )
                            edges.append({"source": nid, "target": enid, "type": "mentions"})

    # Contradictions
    if include_contradictions:
        contradictions = _read_contradictions(contradictions_path)
        for idx, row in enumerate(contradictions[: max(0, max_contradictions)]):
            theme = (row.get("Theme") or "").strip()
            if theme_filter_lc and theme_filter_lc not in theme.lower():
                continue
            cid = f"contradiction:{idx}"
            nodes.append(
                {
                    "id": cid,
                    "type": "contradiction",
                    "label": row.get("DocID") or theme or f"Contradiction {idx}",
                    "data": row,
                }
            )
            if theme:
                if theme not in theme_nodes:
                    tnode = f"theme:{theme}"
                    theme_nodes[theme] = tnode
                    nodes.append({"id": tnode, "type": "theme", "label": theme})
                edges.append({"source": theme_nodes[theme], "target": cid, "type": "has_contradiction"})
            doc_id = row.get("DocID")
            if doc_id and doc_id.isdigit():
                did = int(doc_id)
                dnode = doc_nodes.get(did)
                if dnode:
                    edges.append({"source": dnode, "target": cid, "type": "contradicts"})

    return {"nodes": nodes, "edges": edges}
