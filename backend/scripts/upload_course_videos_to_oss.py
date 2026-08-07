#!/usr/bin/env python3
"""Upload workbench-final course mp4s to Aliyun OSS (baobao-chuangguan).

Source of truth (in order):
1) data/content-catalog.json videos[].notes selectedPath=...
2) libtv-workbench tasks.json current videoPath by level
3) catalog localRelPath under repo root

OSS key = videos[].ossKey (assets/video/{desert|ocean}/level-XXX-....mp4)

Idempotent: skip when remote object exists with same Content-Length.
Does NOT re-upload unrelated free-levels / map loops.

Usage:
  python3 backend/scripts/upload_course_videos_to_oss.py
  python3 backend/scripts/upload_course_videos_to_oss.py --dry-run
  python3 backend/scripts/upload_course_videos_to_oss.py --maps desert,ocean
"""

from __future__ import annotations

import argparse
import configparser
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

try:
    import oss2
except ImportError:
    print("NEED: pip install oss2", file=sys.stderr)
    raise

REPO = Path(__file__).resolve().parents[2]
CATALOG = REPO / "data" / "content-catalog.json"
ASSET_PACKS = REPO / "asset-packs.json"
DEFAULT_BUCKET = "baobao-chuangguan"
DEFAULT_ENDPOINT = "https://oss-cn-shanghai.aliyuncs.com"
PUBLIC_BASE = "https://baobao-chuangguan.oss-cn-shanghai.aliyuncs.com"
WB_ROOT = Path.home() / "Library/Application Support/libtv-workbench/projects"
SELECTED_RE = re.compile(r"selectedPath=([^\s]+)")


def load_oss_auth():
    cfg_path = Path.home() / ".ossutilconfig"
    if not cfg_path.is_file():
        raise SystemExit(f"missing {cfg_path}")
    cfg = configparser.ConfigParser()
    cfg.read(str(cfg_path))
    sec = cfg["default"]
    ak = sec["accessKeyID"].strip()
    sk = sec["accessKeySecret"].strip()
    endpoint = sec.get("endpoint", "oss-cn-shanghai.aliyuncs.com").strip()
    if not endpoint.startswith("http"):
        endpoint = "https://" + endpoint
    return oss2.Auth(ak, sk), endpoint


def load_workbench_paths(project_id: str) -> dict[int, Path]:
    """levelId(1-based) -> selected video Path from tasks.json."""
    tasks_path = WB_ROOT / project_id / "tasks.json"
    if not tasks_path.is_file():
        return {}
    data = json.loads(tasks_path.read_text(encoding="utf-8"))
    tasks = data if isinstance(data, list) else data.get("tasks") or []
    out: dict[int, Path] = {}
    for i, t in enumerate(tasks):
        if not isinstance(t, dict):
            continue
        vp = t.get("videoPath")
        if not vp:
            continue
        # prefer explicit level fields
        lvl = t.get("levelId") or t.get("level") or t.get("index")
        if lvl is None:
            lvl = i + 1
        try:
            lvl = int(lvl)
        except Exception:
            lvl = i + 1
        out[lvl] = Path(vp)
    return out


def resolve_local(video: dict, wb_paths: dict[int, Path]) -> Path | None:
    notes = video.get("notes") or ""
    m = SELECTED_RE.search(notes)
    if m:
        p = Path(m.group(1))
        if p.is_file():
            return p
    lid = int(video.get("levelId") or 0)
    if lid in wb_paths and wb_paths[lid].is_file():
        return wb_paths[lid]
    rel = video.get("localRelPath") or ""
    if rel:
        p = REPO / rel
        if p.is_file():
            return p
    # last resort: filename under ~/video projects
    key = video.get("ossKey") or ""
    name = Path(key).name
    map_id = video.get("mapId")
    cand_dirs = []
    if map_id == "desert":
        cand_dirs += [
            Path.home() / "video/baby-desert-levels-v1",
            Path.home() / "video/baby-island-levels-v1",
        ]
    elif map_id == "ocean":
        cand_dirs += [
            Path.home() / "video/baby-island-levels-v1",
            Path.home() / "video/baby-desert-levels-v1",
        ]
    for d in cand_dirs:
        p = d / name
        if p.is_file():
            return p
    return None


def ensure_public_read_policy(bucket: oss2.Bucket, bucket_name: str) -> None:
    """Best-effort: allow anonymous GetObject on assets/video/*."""
    try:
        try:
            bucket.put_bucket_public_access_block(False)
        except Exception:
            pass
        try:
            bucket.delete_bucket_public_access_block()
        except Exception:
            pass
        policy = {
            "Version": "1",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["oss:GetObject"],
                    "Resource": [f"acs:oss:*:*:{bucket_name}/assets/video/*"],
                }
            ],
        }
        bucket.put_bucket_policy(json.dumps(policy))
        print("policy: assets/video/* public GetObject OK")
    except Exception as e:
        print(f"policy WARN: {type(e).__name__}: {e}")


def update_manifests(uploaded_meta: dict[str, dict], public_base: str) -> None:
    """Rewrite content-catalog + asset-packs download URLs to real OSS base."""
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    cat = json.loads(CATALOG.read_text(encoding="utf-8"))
    cat.setdefault("oss", {})
    cat["oss"]["publicBaseUrl"] = public_base.rstrip("/")
    cat["oss"]["bucket"] = DEFAULT_BUCKET
    cat["oss"]["endpoint"] = "oss-cn-shanghai.aliyuncs.com"
    cat["oss"]["keyPrefix"] = "assets/video"
    cat["updatedAt"] = now

    by_key = {v.get("ossKey"): v for v in cat.get("videos") or []}
    for key, meta in uploaded_meta.items():
        v = by_key.get(key)
        if not v:
            continue
        v["status"] = "oss"
        v["bytesTotal"] = meta["size"]
        if meta.get("sha256"):
            v["sha256"] = meta["sha256"]
        v["updatedAt"] = now
        v["downloadUrl"] = f"{public_base.rstrip('/')}/{key}"

    # levels mirror
    for lv in cat.get("levels") or []:
        key = lv.get("ossKey")
        if key in uploaded_meta:
            lv["bytesTotal"] = uploaded_meta[key]["size"]
            lv["updatedAt"] = now
            if not lv.get("downloadUrlOverride"):
                pass

    CATALOG.write_text(json.dumps(cat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if ASSET_PACKS.is_file():
        packs = json.loads(ASSET_PACKS.read_text(encoding="utf-8"))
        for m in packs.get("maps") or []:
            mid = m.get("mapId")
            if mid not in ("ocean", "desert"):
                continue
            for item in m.get("levels") or []:
                lid = int(item.get("levelId") or 0)
                # find catalog video
                match = next(
                    (
                        v
                        for v in cat.get("videos") or []
                        if v.get("mapId") == mid and int(v.get("levelId") or 0) == lid
                    ),
                    None,
                )
                if not match:
                    continue
                key = match["ossKey"]
                item["downloadUrl"] = f"{public_base.rstrip('/')}/{key}"
                item["bytesTotal"] = int(match.get("bytesTotal") or item.get("bytesTotal") or 0)
            m["packVersion"] = datetime.now(timezone.utc).strftime("%Y%m%d.oss-final")
        ASSET_PACKS.write_text(json.dumps(packs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"updated {ASSET_PACKS}")
    print(f"updated {CATALOG}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--maps", default="desert,ocean", help="comma mapIds")
    ap.add_argument("--bucket", default=DEFAULT_BUCKET)
    ap.add_argument("--public-base", default=PUBLIC_BASE)
    ap.add_argument("--skip-manifest", action="store_true")
    ap.add_argument("--limit", type=int, default=0, help="debug: only first N")
    args = ap.parse_args()

    maps = {m.strip() for m in args.maps.split(",") if m.strip()}
    cat = json.loads(CATALOG.read_text(encoding="utf-8"))
    videos = [
        v
        for v in cat.get("videos") or []
        if v.get("mapId") in maps and v.get("ossKey")
    ]
    videos.sort(key=lambda v: (v.get("mapId") or "", int(v.get("levelId") or 0)))
    if args.limit:
        videos = videos[: args.limit]

    wb_by_map = {
        "desert": load_workbench_paths("baby-desert-levels-v1"),
        "ocean": load_workbench_paths("baby-island-levels-v1"),
    }

    print(f"candidates={len(videos)} maps={sorted(maps)} dry_run={args.dry_run}")

    missing = []
    plan = []
    for v in videos:
        local = resolve_local(v, wb_by_map.get(v.get("mapId") or "", {}))
        if not local:
            missing.append(v)
            continue
        plan.append((v, local))

    if missing:
        print(f"MISSING_LOCAL={len(missing)}")
        for v in missing[:20]:
            print(f"  {v.get('mapId')} L{v.get('levelId')} {v.get('ossKey')}")
        if len(missing) > 20:
            print(f"  ... +{len(missing)-20}")

    if args.dry_run:
        print(f"DRY plan_uploadable={len(plan)}")
        for v, local in plan[:5]:
            print(f"  {v['ossKey']} <- {local} ({local.stat().st_size})")
        return 1 if missing else 0

    auth, endpoint = load_oss_auth()
    bucket = oss2.Bucket(auth, endpoint, args.bucket)
    ensure_public_read_policy(bucket, args.bucket)

    uploaded_meta: dict[str, dict] = {}
    inserted = skipped = failed = 0
    t0 = time.time()
    total_bytes = 0

    for i, (v, local) in enumerate(plan, 1):
        key = v["ossKey"]
        size = local.stat().st_size
        try:
            if bucket.object_exists(key):
                meta = bucket.head_object(key)
                if int(meta.content_length) == size:
                    skipped += 1
                    uploaded_meta[key] = {"size": size}
                    if i % 25 == 0 or i == len(plan):
                        print(
                            f"[{i}/{len(plan)}] skip={skipped} put={inserted} fail={failed} key={key}"
                        )
                    continue
            headers = {"Content-Type": "video/mp4"}
            # multipart for large files
            if size >= 20 * 1024 * 1024:
                oss2.resumable_upload(
                    bucket,
                    key,
                    str(local),
                    multipart_threshold=20 * 1024 * 1024,
                    part_size=10 * 1024 * 1024,
                    num_threads=2,
                    headers=headers,
                )
            else:
                bucket.put_object_from_file(key, str(local), headers=headers)
            inserted += 1
            total_bytes += size
            uploaded_meta[key] = {"size": size}
            print(
                f"[{i}/{len(plan)}] PUT {key} {size}B  "
                f"(put={inserted} skip={skipped} fail={failed})"
            )
        except Exception as e:
            failed += 1
            print(f"[{i}/{len(plan)}] FAIL {key}: {type(e).__name__}: {e}")

    # also mark already-remote from catalog that we skipped entirely? uploaded_meta has skips
    # Include all plan keys that exist now
    for v, local in plan:
        key = v["ossKey"]
        if key in uploaded_meta:
            continue
        try:
            if bucket.object_exists(key):
                meta = bucket.head_object(key)
                uploaded_meta[key] = {"size": int(meta.content_length)}
        except Exception:
            pass

    elapsed = time.time() - t0
    print(
        f"DONE put={inserted} skip={skipped} fail={failed} missing_local={len(missing)} "
        f"bytes_put={total_bytes} elapsed_s={elapsed:.1f}"
    )

    if not args.skip_manifest and failed == 0 and not missing:
        # refresh meta for all planned keys from OSS
        for v, local in plan:
            key = v["ossKey"]
            try:
                meta = bucket.head_object(key)
                uploaded_meta[key] = {"size": int(meta.content_length)}
            except Exception:
                uploaded_meta.setdefault(key, {"size": local.stat().st_size})
        update_manifests(uploaded_meta, args.public_base)
    elif not args.skip_manifest:
        # still update what we have
        if uploaded_meta:
            update_manifests(uploaded_meta, args.public_base)
            print("manifest updated partially (had fail/missing)")

    # probe a few public URLs
    import urllib.request

    probes = []
    for v, _ in plan[:3]:
        probes.append(v["ossKey"])
    for mid in maps:
        vv = next((x for x in videos if x.get("mapId") == mid and int(x.get("levelId") or 0) == 100), None)
        if vv:
            probes.append(vv["ossKey"])
    ok = 0
    for key in probes:
        url = f"{args.public_base.rstrip('/')}/{key}"
        try:
            with urllib.request.urlopen(urllib.request.Request(url, method="HEAD"), timeout=20) as resp:
                print(f"PROBE {resp.status} {resp.headers.get('Content-Length')} {key}")
                if resp.status == 200:
                    ok += 1
        except Exception as e:
            print(f"PROBE FAIL {key}: {e}")
    print(f"PROBE_OK={ok}/{len(probes)}")

    return 0 if failed == 0 and not missing else 2


if __name__ == "__main__":
    raise SystemExit(main())
