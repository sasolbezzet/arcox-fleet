#!/bin/bash
set -e

FRAMES_DIR="/home/ubuntu/arcox-fleet/media/frames"
VIDEO_OUT="/home/ubuntu/arcox-fleet/public/arcox-fleet-demo.mp4"
TMP_LIST="/home/ubuntu/arcox-fleet/media/concat_list_perfect.txt"

cat << CONCAT_EOF > "$TMP_LIST"
file '${FRAMES_DIR}/slide_1.png'
duration 35
file '${FRAMES_DIR}/slide_2.png'
duration 40
file '${FRAMES_DIR}/slide_3.png'
duration 50
file '${FRAMES_DIR}/slide_4.png'
duration 45
file '${FRAMES_DIR}/slide_5.png'
duration 35
file '${FRAMES_DIR}/slide_6.png'
duration 20
file '${FRAMES_DIR}/slide_6.png'
CONCAT_EOF

echo "Encoding 1080p MP4 Video with ffmpeg (Total Duration: ~3:45 minutes)..."

ffmpeg -y \
  -f concat -safe 0 -i "$TMP_LIST" \
  -f lavfi -i "aevalsrc=sin(220*2*PI*t)*0.01:s=44100:d=225" \
  -c:v libx264 -pix_fmt yuv420p -r 30 -preset ultrafast \
  -c:a aac -b:a 128k \
  -shortest \
  -movflags +faststart \
  "$VIDEO_OUT"

echo "Video compiled successfully to: $VIDEO_OUT"
ls -lh "$VIDEO_OUT"
