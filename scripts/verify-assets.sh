#!/usr/bin/env bash
set -euo pipefail

base_url="${BASE_URL:-http://localhost:3000}"
assets=(
  "gwd-official-logo_20959e49.jpg"
  "gwd-hero-dancers_2b7c01fa.jpg"
  "gwd-studio-portrait_de5862bb.jpg"
  "gwd-performance_b1dcb140.jpg"
  "gwd-hero-video_2d7b6989.mp4"
  "gwd-private-session_7005ecd4.jpg"
  "gwd-studio-session_5f59928c.jpg"
  "gwd-online-session_9ae8bc50.jpg"
  "gwd-testimonial-motion-01_1961e85c.jpg"
  "gwd-testimonial-motion-02_d0662300.jpg"
  "gwd-testimonial-motion-03_f0182dca.jpg"
)

for asset in "${assets[@]}"; do
  status=$(curl -L --fail --silent --show-error --max-time 20 -o /dev/null -w "%{http_code}" "$base_url/manus-storage/$asset")
  printf '%-52s %s\n' "$asset" "$status"
done

proxy_status=$(curl -L --fail --silent --show-error --max-time 20 -o /dev/null -w "%{http_code}" "$base_url/api/manus-storage/${assets[0]}")
printf '%-52s %s\n' "api/manus-storage/${assets[0]}" "$proxy_status"
