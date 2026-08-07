#!/usr/bin/env python3
"""Upload product mp4 files into baby_content_videos on Aliyun RDS.

Modes (env UPLOAD_MODE):
  workbench-431 (default) — LibTV tasks.json canonical 431 videos under /Users/yr/video
  repo-assets             — app repo assets/video free/paid/math-story only

Credentials: env MYSQL_HOST MYSQL_PORT MYSQL_USER MYSQL_PASSWORD MYSQL_DATABASE
Never print password.
"""
from __future__ import annotations

import hashlib
import json
import os
import socket
import sys
from pathlib import Path

import pymysql

REPO_ROOT = Path(__file__).resolve().parents[2]
ROOTS = [
    REPO_ROOT / "assets/video/free-levels",
    REPO_ROOT / "assets/video/paid-levels",
    REPO_ROOT / "assets/video/math-story",
]
WORKBENCH_PROJECTS = {
    "baby-desert-levels-v1": Path(
        "/Users/yr/Library/Application Support/libtv-workbench/projects/"
        "baby-desert-levels-v1/tasks.json"
    ),
    "baby-island-levels-v1": Path(
        "/Users/yr/Library/Application Support/libtv-workbench/projects/"
        "baby-island-levels-v1/tasks.json"
    ),
    "table-tricks-s1": Path(
        "/Users/yr/Library/Application Support/libtv-workbench/projects/"
        "table-tricks-s1/tasks.json"
    ),
}

DDL = (Path(__file__).resolve().parents[1] / "migrations" / "003_content_videos.sql").read_text(
    encoding="utf-8"
)


def require_env(name: str) -> str:
    val = os.environ.get(name, "").strip()
    if not val:
        raise SystemExit(f"missing env {name}")
    return val


def category_for(rel: str) -> str:
    if rel.startswith("workbench/baby-desert-levels-v1/"):
        return "baby-desert-levels-v1"
    if rel.startswith("workbench/baby-island-levels-v1/"):
        return "baby-island-levels-v1"
    if rel.startswith("workbench/table-tricks-s1/"):
        return "table-tricks-s1"
    if "/free-levels/" in rel:
        return "free-levels"
    if "/paid-levels/" in rel:
        return "paid-levels"
    if "/math-story/" in rel:
        return "math-story"
    return "other"


def iter_repo_assets() -> list[tuple[str, Path]]:
    out: list[tuple[str, Path]] = []
    for root in ROOTS:
        if not root.is_dir():
            continue
        for p in sorted(root.rglob("*.mp4")):
            name = p.name
            if ".before-" in name or name.endswith(".bak"):
                continue
            rel = str(p.relative_to(REPO_ROOT)).replace("\\", "/")
            out.append((rel, p))
    return out


def iter_workbench_431() -> list[tuple[str, Path]]:
    out: list[tuple[str, Path]] = []
    missing: list[str] = []
    for project, tasks_path in WORKBENCH_PROJECTS.items():
        if not tasks_path.is_file():
            raise SystemExit(f"missing tasks.json: {tasks_path}")
        data = json.loads(tasks_path.read_text(encoding="utf-8"))
        tasks = data if isinstance(data, list) else data.get("tasks") or []
        for task in tasks:
            if not isinstance(task, dict):
                continue
            vp = task.get("videoPath")
            if not vp:
                continue
            path = Path(str(vp))
            rel = f"workbench/{project}/{path.name}"
            if not path.is_file():
                missing.append(str(path))
                continue
            out.append((rel, path))
    if missing:
        print(f"missing_files={len(missing)} sample={missing[:5]}", file=sys.stderr)
        raise SystemExit(3)
    # stable order
    out.sort(key=lambda x: x[0])
    return out


def iter_videos(mode: str) -> list[tuple[str, Path]]:
    if mode == "workbench-431":
        return iter_workbench_431()
    if mode == "repo-assets":
        return iter_repo_assets()
    raise SystemExit(f"unknown UPLOAD_MODE={mode}")


def main() -> int:
    host = require_env("MYSQL_HOST")
    port = int(os.environ.get("MYSQL_PORT") or "3306")
    user = require_env("MYSQL_USER")
    password = require_env("MYSQL_PASSWORD")
    database = require_env("MYSQL_DATABASE")
    mode = (os.environ.get("UPLOAD_MODE") or "workbench-431").strip()
    dry = os.environ.get("DRY_RUN", "").strip() in {"1", "true", "yes"}
    progress_every = int(os.environ.get("PROGRESS_EVERY") or "5")

    items = iter_videos(mode)
    if not items:
        print("no videos found", file=sys.stderr)
        return 2

    total_bytes = sum(p.stat().st_size for _, p in items)
    print(f"mode={mode} host={host} db={database} files={len(items)} bytes={total_bytes}")

    if dry:
        for rel, p in items:
            print(f"DRY {rel} {p.stat().st_size}")
        return 0

    conn = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        connect_timeout=20,
        read_timeout=600,
        write_timeout=600,
        charset="utf8mb4",
        autocommit=False,
        max_allowed_packet=1024 * 1024 * 1024,
    )
    source_host = socket.gethostname()
    inserted = updated = skipped = 0
    done_bytes = 0
    try:
        with conn.cursor() as cur:
            for stmt in [s.strip() for s in DDL.split(";") if s.strip()]:
                cur.execute(stmt)
            conn.commit()

            for idx, (rel, path) in enumerate(items, start=1):
                raw = path.read_bytes()
                sha = hashlib.sha256(raw).hexdigest()
                size = len(raw)
                cat = category_for(rel)
                title = path.stem

                cur.execute(
                    "SELECT id, sha256, byte_size FROM baby_content_videos WHERE rel_path=%s",
                    (rel,),
                )
                row = cur.fetchone()
                if row and row[1] == sha and int(row[2]) == size:
                    skipped += 1
                    done_bytes += size
                    if idx % progress_every == 0 or idx == len(items):
                        print(
                            f"PROGRESS {idx}/{len(items)} SKIP {rel} "
                            f"bytes_done={done_bytes}"
                        )
                    continue

                if row:
                    cur.execute(
                        """
                        UPDATE baby_content_videos
                        SET category=%s, title=%s, mime_type='video/mp4', byte_size=%s,
                            sha256=%s, content=%s, source_host=%s, notes=%s
                        WHERE rel_path=%s
                        """,
                        (
                            cat,
                            title,
                            size,
                            sha,
                            raw,
                            source_host,
                            f"upsert:{mode}",
                            rel,
                        ),
                    )
                    updated += 1
                    action = "UPDATE"
                else:
                    cur.execute(
                        """
                        INSERT INTO baby_content_videos
                          (rel_path, category, title, mime_type, byte_size, sha256, content, source_host, notes)
                        VALUES (%s,%s,%s,'video/mp4',%s,%s,%s,%s,%s)
                        """,
                        (
                            rel,
                            cat,
                            title,
                            size,
                            sha,
                            raw,
                            source_host,
                            f"upload:{mode}",
                        ),
                    )
                    inserted += 1
                    action = "INSERT"
                conn.commit()
                done_bytes += size
                if idx % progress_every == 0 or idx == len(items) or action != "SKIP":
                    print(
                        f"PROGRESS {idx}/{len(items)} {action} {rel} {size} "
                        f"bytes_done={done_bytes}"
                    )

            cur.execute(
                """
                SELECT category, COUNT(*), SUM(byte_size)
                FROM baby_content_videos
                GROUP BY category
                ORDER BY category
                """
            )
            print("SUMMARY_BY_CATEGORY")
            for row in cur.fetchall() or []:
                cat, cnt, bsum = row
                print(f"  {cat}: count={cnt} bytes={int(bsum or 0)}")
            cur.execute("SELECT COUNT(*), COALESCE(SUM(byte_size),0) FROM baby_content_videos")
            total_row = cur.fetchone()
            if not total_row:
                raise RuntimeError("failed to read total counts")
            cnt, bsum = total_row
            print(
                f"TOTAL rows={cnt} bytes={int(bsum)} "
                f"inserted={inserted} updated={updated} skipped={skipped}"
            )
            # workbench subset check
            cur.execute(
                """
                SELECT COUNT(*), COALESCE(SUM(byte_size),0)
                FROM baby_content_videos
                WHERE rel_path LIKE 'workbench/%%'
                """
            )
            wrow = cur.fetchone()
            if wrow:
                print(f"WORKBENCH_SUBSET rows={wrow[0]} bytes={int(wrow[1])}")
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
