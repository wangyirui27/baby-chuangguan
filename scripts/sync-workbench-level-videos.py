#!/usr/bin/env python3
"""Sync App 关卡 ↔ LibTV Workbench 当前选中定稿视频（1:1）。

规则（yr 2026-08-07）：
- workbench 每关可能有多个 videoCandidates（重做/历史草稿）
- **当前选中的 videoPath = 最终定稿**，只绑定这一条
- 沙漠：baby-desert-levels-v1 → mapId=desert
- 海岛：baby-island-levels-v1 → mapId=ocean（App 海洋地图）

产出：
- data/workbench-level-video-map.json
- data/content-catalog.json（400 关绑定）
- asset-packs.json（publish）
- assets/video/desert-levels/ L1–10 硬链/拷贝定稿
- assets/video/free-levels/ L1–10 用海岛定稿覆盖（保留 .bak）

用法：
  python3 scripts/sync-workbench-level-videos.py
  python3 scripts/sync-workbench-level-videos.py --skip-package-copy
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WB = Path.home() / "Library/Application Support/libtv-workbench/projects"
OCEAN_FREE_SLUG = {
    1: "mom",
    2: "dad",
    3: "grandma",
    4: "grandpa",
    5: "hand",
    6: "rice",
    7: "water",
    8: "car",
    9: "dog",
    10: "book",
}
PROJECTS = {
    "desert": {
        "mapId": "desert",
        "projectId": "baby-desert-levels-v1",
        "tasks": WB / "baby-desert-levels-v1" / "tasks.json",
        "title": "Desert Wonders",
    },
    "ocean": {
        "mapId": "ocean",
        "projectId": "baby-island-levels-v1",
        "tasks": WB / "baby-island-levels-v1" / "tasks.json",
        "title": "Magic Ocean",
    },
}


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def new_id(prefix: str, seed: str) -> str:
    return f"{prefix}_{hashlib.sha1(seed.encode()).hexdigest()[:12]}"


def parse_level(video_name: str):
    m = re.match(r"^level-(\d+)-(.*)$", video_name or "")
    if not m:
        return None, ""
    return int(m.group(1)), m.group(2)


def slug_clean(s: str) -> str:
    s = (s or "").lower().replace("_", "-")
    s = re.sub(r"[^a-z0-9-]+", "", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "level"


def title_from_slug(slug: str) -> str:
    parts = slug.replace("_", "-").split("-")
    out = []
    for p in parts:
        out.append(p.capitalize() if p.isalpha() else p)
    t = " ".join(out)
    reps = [
        (r"\bi m\b", "I'm"),
        (r"\byou re\b", "You're"),
        (r"\bthat s\b", "That's"),
        (r"\blet s\b", "Let's"),
        (r"\bwhat s\b", "What's"),
        (r"\bdon t\b", "Don't"),
    ]
    for a, b in reps:
        t = re.sub(a, b, t, flags=re.I)
    return t


def load_tasks(path: Path):
    tasks = json.loads(path.read_text(encoding="utf-8"))
    by = {}
    for t in tasks:
        vn = t.get("videoName") or ""
        lvl, slug_raw = parse_level(vn)
        if not lvl:
            continue
        vp = (t.get("videoPath") or "").strip()
        cands = t.get("videoCandidates") or []
        cand_paths = []
        for c in cands:
            if isinstance(c, dict):
                p = c.get("path") or ""
                if p:
                    cand_paths.append(p)
            elif isinstance(c, str) and c:
                cand_paths.append(c)
        selected_name = Path(vp).name if vp else ""
        stem = Path(selected_name).stem if selected_name else vn
        m = re.match(r"^level-\d+-(.*)$", stem)
        file_slug = m.group(1) if m else slug_raw
        exists = bool(vp and Path(vp).is_file())
        bytes_total = Path(vp).stat().st_size if exists else 0
        alt = [p for p in cand_paths if p and p != vp]
        by[lvl] = {
            "levelId": lvl,
            "videoName": vn,
            "slug": slug_clean(file_slug),
            "slugRaw": file_slug,
            "title": title_from_slug(file_slug),
            "selectedVideoPath": vp,
            "selectedFileName": selected_name,
            "selectedExists": exists,
            "bytesTotal": bytes_total,
            "candidateCount": len(cand_paths) if cand_paths else (1 if vp else 0),
            "alternateCandidatePaths": alt,
            "status": t.get("status") or "",
            "taskId": t.get("id") or "",
            "updatedAt": t.get("updatedAt") or now_iso(),
            "sourceIndex": t.get("sourceIndex"),
        }
    rows = [by[i] for i in sorted(by)]
    missing = [i for i in range(1, 201) if i not in by]
    return rows, missing


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-package-copy", action="store_true")
    ap.add_argument("--skip-publish", action="store_true")
    args = ap.parse_args()

    NOW = now_iso()
    map_doc = {
        "schemaVersion": 1,
        "updatedAt": NOW,
        "rule": "workbench 当前选中 videoPath = 关卡最终定稿；同关多候选只绑定选中项，不绑定 重做前错误视频/历史草稿",
        "sources": {},
        "maps": {},
    }
    catalog_levels = []
    catalog_videos = []

    for meta in PROJECTS.values():
        if not meta["tasks"].is_file():
            print(f"ERR missing tasks {meta['tasks']}", file=sys.stderr)
            return 2
        rows, missing = load_tasks(meta["tasks"])
        map_id = meta["mapId"]
        map_doc["sources"][map_id] = {
            "workbenchProjectId": meta["projectId"],
            "tasksPath": str(meta["tasks"]),
            "mapId": map_id,
            "title": meta["title"],
        }
        map_doc["maps"][map_id] = {
            "mapId": map_id,
            "workbenchProjectId": meta["projectId"],
            "levelCount": len(rows),
            "missingLevels": missing,
            "multiCandidateLevels": [r["levelId"] for r in rows if r["candidateCount"] > 1],
            "selectedMissingFile": [r["levelId"] for r in rows if not r["selectedExists"]],
            "levels": rows,
        }
        for r in rows:
            lid = r["levelId"]
            tier = "free-levels" if lid <= 10 else "paid-levels"
            fname = r["selectedFileName"] or f"level-{lid:03d}-{r['slug']}.mp4"
            oss_key = f"assets/video/{map_id}/{fname}"
            if map_id == "ocean" and lid <= 10 and lid in OCEAN_FREE_SLUG:
                local_rel = f"assets/video/free-levels/level-{lid:02d}-{OCEAN_FREE_SLUG[lid]}.mp4"
            elif map_id == "desert" and lid <= 10:
                local_rel = f"assets/video/desert-levels/{fname}"
            else:
                local_rel = oss_key
            vid = new_id("vid", f"{map_id}:{lid}:{fname}")
            notes = f"workbench-final selectedPath={r['selectedVideoPath']}"
            if r["candidateCount"] > 1:
                notes += f"; multiCandidates={r['candidateCount']} (bound selected only)"
            catalog_videos.append(
                {
                    "id": vid,
                    "title": f"L{lid:03d} {r['title']}",
                    "ossKey": oss_key,
                    "localRelPath": local_rel,
                    "mapId": map_id,
                    "levelId": lid,
                    "status": "local" if r["selectedExists"] else "registered",
                    "bytesTotal": r["bytesTotal"],
                    "sha256": "",
                    "notes": notes[:500],
                    "updatedAt": NOW,
                }
            )
            catalog_levels.append(
                {
                    "id": f"{map_id}:{lid}",
                    "mapId": map_id,
                    "levelId": lid,
                    "title": r["title"],
                    "slug": r["slug"],
                    "tier": tier,
                    "status": "published" if r["selectedVideoPath"] else "draft",
                    "videoId": vid,
                    "ossKey": oss_key,
                    "localRelPath": local_rel,
                    "downloadUrlOverride": "",
                    "bytesTotal": r["bytesTotal"],
                    "sha256": "",
                    "notes": notes[:500],
                    "updatedAt": NOW,
                }
            )

    map_path = ROOT / "data" / "workbench-level-video-map.json"
    map_path.parent.mkdir(parents=True, exist_ok=True)
    map_path.write_text(json.dumps(map_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    cat_path = ROOT / "data" / "content-catalog.json"
    old = json.loads(cat_path.read_text(encoding="utf-8")) if cat_path.exists() else {}
    oss = old.get("oss") or {
        "publicBaseUrl": "https://cdn.example.hirota.test",
        "keyPrefix": "assets/video",
        "bucket": "",
        "endpoint": "",
        "notes": "publicBaseUrl 优先目录配置。",
    }
    maps = {
        "ocean": {
            "mapId": "ocean",
            "title": "Magic Ocean",
            "status": "active",
            "bundledThroughLevel": 10,
            "packId": "ocean-levels-011-200",
            "packVersion": "20260807.workbench-final",
            "downloadUrl": "",
            "levelVideoUrlTemplate": "",
            "notes": "英语海岛/海洋。视频=workbench baby-island-levels-v1 当前选中 videoPath。",
        },
        "desert": {
            "mapId": "desert",
            "title": "Desert Wonders",
            "status": "active",
            "bundledThroughLevel": 10,
            "packId": "desert-levels-011-200",
            "packVersion": "20260807.workbench-final",
            "downloadUrl": "",
            "levelVideoUrlTemplate": "",
            "notes": "沙漠短语。视频=workbench baby-desert-levels-v1 当前选中 videoPath；多版本只取选中。",
        },
        "castle": (old.get("maps") or {}).get("castle")
        or {
            "mapId": "castle",
            "title": "Magic Castle",
            "status": "coming-soon",
            "bundledThroughLevel": 0,
            "packId": "",
            "packVersion": "",
            "downloadUrl": "",
            "levelVideoUrlTemplate": "",
            "notes": "Coming soon.",
        },
    }
    catalog = {
        "schemaVersion": 1,
        "updatedAt": NOW,
        "oss": oss,
        "maps": maps,
        "videos": catalog_videos,
        "levels": catalog_levels,
        "workbenchMapRef": "data/workbench-level-video-map.json",
        "workbenchMapRule": map_doc["rule"],
    }
    cat_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if not args.skip_package_copy:
        # desert free L1-10
        for r in map_doc["maps"]["desert"]["levels"]:
            if r["levelId"] > 10:
                continue
            src = Path(r["selectedVideoPath"])
            dst = ROOT / "assets" / "video" / "desert-levels" / r["selectedFileName"]
            dst.parent.mkdir(parents=True, exist_ok=True)
            if not src.is_file():
                print("WARN desert free missing", r["levelId"], src)
                continue
            if dst.exists() or dst.is_symlink():
                dst.unlink()
            try:
                os.link(src, dst)
            except OSError:
                shutil.copy2(src, dst)
        # ocean free overwrite from selected
        for r in map_doc["maps"]["ocean"]["levels"]:
            if r["levelId"] > 10:
                continue
            slug = OCEAN_FREE_SLUG[r["levelId"]]
            src = Path(r["selectedVideoPath"])
            dst = ROOT / "assets" / "video" / "free-levels" / f"level-{r['levelId']:02d}-{slug}.mp4"
            if not src.is_file():
                print("WARN ocean free missing", r["levelId"], src)
                continue
            bak = dst.with_suffix(dst.suffix + ".before-workbench-final-20260807.bak")
            if dst.is_file() and not bak.exists():
                shutil.copy2(dst, bak)
            shutil.copy2(src, dst)

    if not args.skip_publish:
        subprocess.check_call(
            [
                "node",
                "-e",
                "const c=require('./backend/src/content-catalog');c.load();console.log(JSON.stringify(c.publishAssetPacks()));",
            ],
            cwd=str(ROOT),
        )

    for mid, block in map_doc["maps"].items():
        print(
            mid,
            "levels",
            block["levelCount"],
            "missing",
            block["missingLevels"],
            "multi",
            len(block["multiCandidateLevels"]),
            "fileMiss",
            block["selectedMissingFile"],
        )
    print("OK", map_path.relative_to(ROOT), cat_path.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
