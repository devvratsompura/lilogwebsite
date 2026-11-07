#!/bin/sh
# Double-click (macOS) or run ./start-mac-linux.command to serve the site at http://localhost:4321
cd "$(dirname "$0")" || exit 1
URL=http://localhost:4321/film.html
( sleep 1; (open "$URL" || xdg-open "$URL") >/dev/null 2>&1 ) &
if command -v node >/dev/null 2>&1; then exec node serve.js; fi
echo "Node.js not found - using Python instead."
exec python3 -m http.server 4321
