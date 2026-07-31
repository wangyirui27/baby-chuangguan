#!/usr/bin/env python3
"""Serve repo root and open the generated-video gallery."""

from __future__ import annotations

import functools
import http.server
import os
import socketserver
import subprocess
import sys
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PORT = int(os.environ.get("VIDEO_PREVIEW_PORT", "8765"))
PAGE = "/tools/video-prompts/preview-generated-videos.html"


def main() -> int:
    os.chdir(ROOT)
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    # allow reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
        url = f"http://127.0.0.1:{PORT}{PAGE}"
        print(f"Video preview: {url}")
        print("Ctrl+C to stop")
        try:
            webbrowser.open(url)
        except Exception as exc:  # noqa: BLE001
            print(f"open browser failed: {exc}", file=sys.stderr)
        try:
            # macOS open as fallback
            if sys.platform == "darwin":
                subprocess.run(["open", url], check=False)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
