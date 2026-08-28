#!/bin/bash
set -e

FRAMES_DIR="/home/ubuntu/arcox-fleet/media/frames"
VIDEO_OUT="/home/ubuntu/arcox-fleet/public/arcox-fleet-demo.mp4"
TMP_LIST="/home/ubuntu/arcox-fleet/media/concat_list.txt"

# Create concat list with exact durations
cat << CONCAT_EOF > "$TMP_LIST"
file '${FRAMES_DIR}/slide_1.png'
duration 40
file '${FRAMES_DIR}/slide_2.png'
duration 45
file '${FRAMES_DIR}/slide_3.png'
duration 50
file '${FRAMES_DIR}/slide_4.png'
duration 45
file '${FRAMES_DIR}/slide_5.png'
duration 30
file '${FRAMES_DIR}/slide_5.png'
CONCAT_EOF

echo "Encoding 1080p MP4 Video with ffmpeg (Duration: ~3.5 minutes)..."

ffmpeg -y \
  -f concat -safe 0 -i "$TMP_LIST" \
  -f lavfi -i "aevalsrc=sin(220*2*PI*t)*0.01:s=44100:d=210" \
  -c:v libx264 -pix_fmt yuv420p -r 30 -preset fast \
  -c:a aac -b:a 128k \
  -shortest \
  -movflags +faststart \
  "$VIDEO_OUT"

echo "Video rendered successfully to: $VIDEO_OUT"
ls -lh "$VIDEO_OUT"
