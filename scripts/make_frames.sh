#!/usr/bin/env bash
# Turn a locked-camera video into optimized WebP frames for the hero.
# Usage: bash scripts/make_frames.sh path/to/video.mp4 [fps=24] [width=1280]
set -euo pipefail
VIDEO="${1:?Usage: bash scripts/make_frames.sh video.mp4 [fps] [width]}"
FPS="${2:-24}"; WIDTH="${3:-1280}"
command -v ffmpeg >/dev/null || { echo "ffmpeg not found. Install it with: brew install ffmpeg"; exit 1; }
OUT="public/frames"; mkdir -p "$OUT"; rm -f "$OUT"/f*.webp
ffmpeg -loglevel error -i "$VIDEO" -vf "fps=$FPS,scale=$WIDTH:-2" -c:v libwebp -quality 80 "$OUT/f%03d.webp"
COUNT=$(ls "$OUT"/f*.webp | wc -l | tr -d ' ')
python3 - "$COUNT" "$FPS" <<'PY'
import json,sys
p='public/frames/manifest.json'; m=json.load(open(p))
m['count']=int(sys.argv[1]); m['fps']=int(sys.argv[2]); json.dump(m,open(p,'w'),indent=2)
PY
echo "Wrote $COUNT frames at ${FPS}fps. Now edit public/frames/manifest.json:"
echo "  idle   = frames where you work normally (blinking/breathing)"
echo "  left / right / center = from (idle pose) -> to (peak of the glance or smile)"
echo "Tip: open the frames in Finder to read off the numbers (f042.webp = 42)."
