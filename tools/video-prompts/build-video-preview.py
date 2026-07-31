#!/usr/bin/env python3
"""Build a local HTML gallery for all output/media-production/**/final/*.mp4."""

from __future__ import annotations

import html
import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PROD = ROOT / "output" / "media-production"
GALLERY = Path(__file__).resolve().parent / "preview-generated-videos.html"
INDEX_JSON = ROOT / "output" / "qa" / "video-preview" / "index.json"


def collect() -> list[dict]:
    items: list[dict] = []
    for p in sorted(PROD.glob("**/final/*.mp4")):
        rel = p.relative_to(ROOT).as_posix()
        m = re.search(r"desert-level-(\d+)", p.as_posix())
        n = int(m.group(1)) if m else None
        parent = p.parent.parent.name
        ver = parent
        if m and parent.startswith("desert-level-"):
            ver = parent.split("-", 3)[-1] if parent.count("-") >= 3 else parent
            # desert-level-006-my-name-is-v1 -> my-name-is-v1
            prefix = f"desert-level-{m.group(1)}-"
            if parent.startswith(prefix):
                ver = parent[len(prefix) :]
        cs_dir = p.parent.parent / "contact-sheets"
        cs = next(iter(sorted(cs_dir.glob("*.jpg")) + sorted(cs_dir.glob("*.png"))), None)
        items.append(
            {
                "level": n,
                "name": p.name,
                "path": rel,
                "version": ver,
                "size_mb": round(p.stat().st_size / (1024 * 1024), 2),
                "contact": cs.relative_to(ROOT).as_posix() if cs else None,
                "mtime": datetime.fromtimestamp(p.stat().st_mtime).strftime("%Y-%m-%d %H:%M"),
                "mtime_ts": p.stat().st_mtime,
            }
        )
    items.sort(key=lambda x: (x["level"] is None, x["level"] or 9999, -x["mtime_ts"]))
    return items


def render(items: list[dict]) -> str:
    cards = []
    for it in items:
        href = "../../" + it["path"]
        if it.get("contact"):
            cs = (
                f'<img src="../../{html.escape(it["contact"])}" alt="contact" loading="lazy"/>'
            )
        else:
            cs = '<div class="no-cs">无 contact sheet</div>'
        lvl = f"L{it['level']:03d}" if it["level"] is not None else "—"
        cards.append(
            f"""
    <article class="card" data-level="{it['level'] if it['level'] is not None else ''}" data-ver="{html.escape(it['version'])}" data-mtime="{it['mtime_ts']}">
      <header>
        <strong>{lvl}</strong>
        <span class="ver">{html.escape(it['version'])}</span>
        <span class="meta">{it['size_mb']} MB · {html.escape(it['mtime'])}</span>
      </header>
      <div class="cs">{cs}</div>
      <video controls preload="none" src="{html.escape(href)}"></video>
      <footer>
        <code>{html.escape(it['path'])}</code>
        <a href="{html.escape(href)}" download>下载</a>
      </footer>
    </article>"""
        )

    levels = sorted({it["level"] for it in items if it["level"] is not None})
    level_span = (
        f"{levels[0]}–{levels[-1]}（{len(levels)} 关有片）" if levels else "无 final"
    )
    n = len(items)

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>已生成视频预览 · {n} 条</title>
<style>
  :root {{
    --bg: #f6f1e8; --card: #fffdf8; --ink: #2c2416; --muted: #7a6a55;
    --line: #e6dccb; --accent: #2f6f5e;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0; font-family: "SF Pro Text", "PingFang SC", sans-serif;
    background: var(--bg); color: var(--ink);
  }}
  header.top {{
    position: sticky; top: 0; z-index: 10;
    backdrop-filter: blur(10px);
    background: rgba(246,241,232,.92);
    border-bottom: 1px solid var(--line);
    padding: 12px 18px;
    display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center;
  }}
  header.top h1 {{ font-size: 16px; margin: 0; font-weight: 700; }}
  header.top .stats {{ color: var(--muted); font-size: 13px; }}
  .controls {{ display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-left: auto; }}
  input, button {{
    font: inherit; border: 1px solid var(--line); background: #fff;
    border-radius: 10px; padding: 8px 10px;
  }}
  button {{ cursor: pointer; background: var(--accent); color: #fff; border-color: var(--accent); }}
  button.secondary {{ background: #fff; color: var(--ink); border-color: var(--line); }}
  main {{
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 14px;
  }}
  .card {{
    background: var(--card); border: 1px solid var(--line); border-radius: 16px;
    overflow: hidden; display: flex; flex-direction: column; gap: 8px;
    padding: 10px;
  }}
  .card header {{ display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: baseline; }}
  .card header strong {{ font-size: 18px; }}
  .ver {{
    color: var(--accent); font-size: 12px; background: #e7f3ef;
    padding: 2px 8px; border-radius: 999px;
  }}
  .meta {{ color: var(--muted); font-size: 12px; margin-left: auto; }}
  .cs img {{
    width: 100%; height: 120px; object-fit: cover; border-radius: 10px; background: #eee;
  }}
  .no-cs {{ height: 40px; display:flex; align-items:center; color: var(--muted); font-size: 12px; }}
  video {{ width: 100%; border-radius: 12px; background: #111; max-height: 220px; }}
  footer {{ display: flex; gap: 8px; align-items: start; justify-content: space-between; }}
  footer code {{ font-size: 10px; color: var(--muted); word-break: break-all; }}
  footer a {{ font-size: 12px; color: var(--accent); white-space: nowrap; }}
  .empty {{ grid-column: 1/-1; text-align: center; color: var(--muted); padding: 40px; }}
  .hint {{ width: 100%; font-size: 12px; color: var(--muted); margin: 0; }}
</style>
</head>
<body>
  <header class="top">
    <h1>已生成视频预览</h1>
    <div class="stats">{n} 个 final · 关卡 {html.escape(level_span)}</div>
    <div class="controls">
      <label>关卡 <input id="levelFilter" type="number" min="1" max="99" placeholder="6" style="width:72px"/></label>
      <label>版本 <input id="verFilter" type="text" placeholder="v1 / r4" style="width:100px"/></label>
      <button type="button" class="secondary" id="onlyLatest">每关只看最新</button>
      <button type="button" class="secondary" id="pauseAll">全部暂停</button>
    </div>
    <p class="hint">请用本地服务器打开（推荐 <code>npm run preview:videos</code>）。数据源：<code>output/media-production/**/final/*.mp4</code>。无 final 的关不会出现。同时只播一个视频。</p>
  </header>
  <main id="grid">
    {"".join(cards) if cards else '<p class="empty">没有找到 final/*.mp4</p>'}
  </main>
<script>
const cards = [...document.querySelectorAll('.card')];
const latest = new Map();
for (const c of cards) {{
  const lv = c.dataset.level;
  if (!lv) continue;
  const ts = Number(c.dataset.mtime || 0);
  const prev = latest.get(lv);
  if (!prev || ts >= prev.ts) latest.set(lv, {{ ts, el: c }});
}}
for (const c of cards) {{
  const lv = c.dataset.level;
  if (lv && latest.get(lv)?.el === c) c.dataset.latest = '1';
}}
function apply() {{
  const lv = document.getElementById('levelFilter').value.trim();
  const ver = document.getElementById('verFilter').value.trim().toLowerCase();
  const only = document.body.dataset.onlyLatest === '1';
  let shown = 0;
  for (const c of cards) {{
    let ok = true;
    if (lv) {{
      const n = String(Number(lv));
      if (c.dataset.level !== lv && c.dataset.level !== n) ok = false;
    }}
    if (ver && !(c.dataset.ver || '').toLowerCase().includes(ver)) ok = false;
    if (only && c.dataset.level && c.dataset.latest !== '1') ok = false;
    c.style.display = ok ? '' : 'none';
    if (ok) shown++;
  }}
  document.querySelector('.stats').textContent = '显示 ' + shown + ' / {n} · 筛选中';
}}
document.getElementById('levelFilter').addEventListener('input', apply);
document.getElementById('verFilter').addEventListener('input', apply);
document.getElementById('onlyLatest').addEventListener('click', () => {{
  document.body.dataset.onlyLatest = document.body.dataset.onlyLatest === '1' ? '0' : '1';
  document.getElementById('onlyLatest').textContent =
    document.body.dataset.onlyLatest === '1' ? '显示全部版本' : '每关只看最新';
  apply();
}});
document.getElementById('pauseAll').addEventListener('click', () => {{
  document.querySelectorAll('video').forEach((v) => v.pause());
}});
document.querySelectorAll('video').forEach((v) => {{
  v.addEventListener('play', () => {{
    document.querySelectorAll('video').forEach((o) => {{ if (o !== v) o.pause(); }});
  }});
}});
</script>
</body>
</html>
"""


def main() -> None:
    items = collect()
    GALLERY.write_text(render(items), encoding="utf-8")
    INDEX_JSON.parent.mkdir(parents=True, exist_ok=True)
    slim = [{k: v for k, v in it.items() if k != "mtime_ts"} for it in items]
    INDEX_JSON.write_text(json.dumps(slim, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    levels = sorted({it["level"] for it in items if it["level"] is not None})
    print(f"gallery: {GALLERY}")
    print(f"index:   {INDEX_JSON}")
    print(f"finals:  {len(items)} files · levels {levels[0] if levels else '—'}–{levels[-1] if levels else '—'} ({len(levels)} levels)")


if __name__ == "__main__":
    main()
