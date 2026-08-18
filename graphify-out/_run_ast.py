#!/usr/bin/env python3
"""Focused Graphify AST pipeline for 嗨洛塔/HiRota (exclude media assets)."""
from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path("/Users/yr/嗨洛塔少儿启蒙APP").resolve()
OUT = ROOT / "graphify-out"
OUT.mkdir(exist_ok=True)

from graphify.extract import extract
from graphify.build import build_from_json
from graphify.cluster import cluster, cohesion_score, label_communities_by_hub
from graphify.export import generate_html
from graphify.report import generate as generate_report
from graphify.wiki import to_wiki
from graphify.analyze import god_nodes
import networkx as nx

KEEP_ROOTS = [
    ROOT / "apps",
    ROOT / "backend" / "src",
    ROOT / "auth",
    ROOT / "docs",
    ROOT / "packages",
    ROOT / "migrations",
    ROOT / "scripts",
    ROOT / "tools",
]
ROOT_GLOBS = ["*.js", "*.html", "*.css", "*.md", "*.json", "*.mjs", "*.cjs"]
SKIP_NAMES = {"package-lock.json", "yarn.lock", "pnpm-lock.yaml"}
CODE_EXT = {".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".md", ".json", ".html", ".css", ".yml", ".yaml"}


def collect_files() -> list[Path]:
    files: list[Path] = []
    for r in KEEP_ROOTS:
        if not r.exists():
            continue
        for p in r.rglob("*"):
            if not p.is_file():
                continue
            s = str(p)
            if "node_modules" in s or "/.git/" in s or "/output/" in s or "/graphify-out/" in s:
                continue
            if p.suffix.lower() in CODE_EXT:
                files.append(p)
    for g in ROOT_GLOBS:
        for p in ROOT.glob(g):
            if p.is_file() and p.name not in SKIP_NAMES:
                files.append(p)
    seen: set[Path] = set()
    uniq: list[Path] = []
    for p in files:
        rp = p.resolve()
        if rp in seen:
            continue
        seen.add(rp)
        uniq.append(rp)
    return sorted(uniq)


def god_nodes(G: nx.Graph, top_n: int = 25) -> list[dict]:
    deg = sorted(G.degree(), key=lambda x: x[1], reverse=True)
    out = []
    for nid, d in deg[:top_n]:
        data = G.nodes[nid]
        out.append(
            {
                "id": nid,
                "label": data.get("label", nid),
                "degree": d,
                "source_file": data.get("source_file", ""),
                "file_type": data.get("file_type", ""),
            }
        )
    return out


def main() -> int:
    files = collect_files()
    detect_payload = {
        "root": str(ROOT),
        "file_count": len(files),
        "excluded": ["assets/** (media)", "node_modules", "output", ".git", "graphify-out"],
        "note": "media-heavy corpus narrowed; NOT a full-repo graph",
        "date": str(date.today()),
    }
    (OUT / ".graphify_detect.json").write_text(json.dumps(detect_payload, indent=2, ensure_ascii=False))
    (OUT / ".graphify_root").write_text(str(ROOT) + "\n")
    print(f"[graphify] files={len(files)}", flush=True)

    # CRITICAL: parallel=False — ProcessPool often yields 0 nodes here
    extraction = extract(files, parallel=False, root=ROOT, cache_root=OUT / "cache")
    nodes = extraction.get("nodes") or []
    edges = extraction.get("edges") or []
    print(f"[graphify] extract nodes={len(nodes)} edges={len(edges)}", flush=True)
    (OUT / "graph_data.json").write_text(json.dumps(extraction, ensure_ascii=False))

    if len(nodes) == 0:
        print("[graphify] EMPTY extraction — abort", flush=True)
        return 2

    G = build_from_json(extraction, directed=False, root=ROOT)
    print(f"[graphify] graph n={G.number_of_nodes()} e={G.number_of_edges()}", flush=True)

    communities = cluster(G)
    labels = label_communities_by_hub(G, communities)
    cohesion = {cid: cohesion_score(G, nodes) for cid, nodes in communities.items()}
    gods = god_nodes(G)

    # Persist graph.json (node-link)
    from networkx.readwrite import json_graph

    payload = json_graph.node_link_data(G)
    payload["communities"] = {str(k): v for k, v in communities.items()}
    payload["community_labels"] = {str(k): v for k, v in labels.items()}
    (OUT / "graph.json").write_text(json.dumps(payload, ensure_ascii=False))
    (OUT / "community_labels.json").write_text(json.dumps(labels, ensure_ascii=False, indent=2))

    html_path = str(OUT / "graph.html")
    generate_html(G, communities, html_path, community_labels=labels)
    print(f"[graphify] html -> {html_path}", flush=True)

    detection_result = {
        "total_files": len(files),
        "total_words": 0,
        "files": len(files),
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges(),
        "communities": len(communities),
        "excluded": detect_payload["excluded"],
        "note": detect_payload["note"],
        "warning": (
            f"Focused corpus: {len(files)} code/doc files; assets/** media excluded — "
            "not a full-repo graph. "
            f"Graph: {G.number_of_nodes()} nodes · {G.number_of_edges()} edges · "
            f"{len(communities)} communities."
        ),
    }
    token_cost = {
        "input": extraction.get("input_tokens") or 0,
        "output": extraction.get("output_tokens") or 0,
        "cost": 0,
        "input_tokens": extraction.get("input_tokens") or 0,
        "output_tokens": extraction.get("output_tokens") or 0,
    }
    report_md = generate_report(
        G,
        communities,
        cohesion,
        labels,
        gods,
        surprise_list=[],
        detection_result=detection_result,
        token_cost=token_cost,
        root=str(ROOT),
        min_community_size=2,
    )
    (OUT / "GRAPH_REPORT.md").write_text(report_md)
    print(f"[graphify] report -> {OUT / 'GRAPH_REPORT.md'}", flush=True)

    wiki_dir = OUT / "wiki"
    wiki_dir.mkdir(exist_ok=True)
    n_wiki = to_wiki(G, communities, wiki_dir, community_labels=labels, cohesion=cohesion, god_nodes_data=gods)
    print(f"[graphify] wiki pages={n_wiki} -> {wiki_dir}", flush=True)

    # index for humans
    index = f"""# Graphify index — 嗨洛塔 / HiRota（宝宝闯关）

- Date: {date.today()}
- Project root: `{ROOT}`
- Focused files: **{len(files)}** (code/docs only)
- Graph: **{G.number_of_nodes()}** nodes · **{G.number_of_edges()}** edges · **{len(communities)}** communities
- Excluded: `assets/**` media, node_modules, output, .git — **not** a full-repo corpus graph
- Outputs:
  - [GRAPH_REPORT.md](./GRAPH_REPORT.md)
  - [graph.html](./graph.html) (open in browser)
  - [graph.json](./graph.json)
  - [wiki/](./wiki/)
- Team docs matrix: [../docs/graphify-team/README.md](../docs/graphify-team/README.md)
"""
    (OUT / "README.md").write_text(index)
    print("[graphify] DONE", flush=True)
    print(json.dumps(detection_result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
