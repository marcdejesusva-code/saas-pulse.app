#!/usr/bin/env python3
"""Static file server for the EHZ registration tracker.

Drop-in replacement for `python3 -m http.server`, with three fixes:

  * ThreadingHTTPServer  — serves styles.css / app.js concurrently instead of
    queuing them behind each other (stdlib default is single-threaded).
  * HTTP/1.1 + Content-Length — keeps assets on one connection.
  * Cache-Control: no-store + conditional headers dropped — the tracker is
    edited live, so the browser must never revalidate into a stale app.js
    (an If-Modified-Since 304 was doing exactly that). The favicon is served
    as an inline SVG instead of 404ing on every load.

Binds 0.0.0.0 so the sandbox preview proxy can reach it. No host/origin
allowlist: any Host header is accepted, and no iframe-blocking headers are set.
"""
import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("PORT", "8000"))
ROOT = os.path.dirname(os.path.abspath(__file__))

FAVICON = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
    '<rect width="64" height="64" rx="14" fill="#161b23"/>'
    '<rect x="10" y="10" width="44" height="44" rx="10" '
    'fill="#3ea6ff"/>'
    '<text x="32" y="42" font-family="monospace" font-size="22" '
    'font-weight="bold" text-anchor="middle" fill="#04121f">EZ</text>'
    "</svg>"
).encode()


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def do_GET(self):
        # Ignore validators entirely: never answer 304, always send the bytes.
        for h in ("If-Modified-Since", "If-None-Match", "If-Range"):
            if h in self.headers:
                del self.headers[h]

        if self.path.split("?")[0] == "/favicon.ico":
            self.send_response(200)
            self.send_header("Content-Type", "image/svg+xml")
            self.send_header("Content-Length", str(len(FAVICON)))
            self.end_headers()
            self.wfile.write(FAVICON)
            return
        super().do_GET()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


def main():
    os.chdir(ROOT)
    if not os.path.exists("index.html"):
        sys.exit("index.html not found in %s" % ROOT)

    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), partial(Handler, directory=ROOT))
    httpd.daemon_threads = True
    print("EHZ tracker serving %s on http://0.0.0.0:%d" % (ROOT, PORT), flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
