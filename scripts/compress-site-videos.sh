#!/usr/bin/env bash
# Re-encode les vidéos du site pour le web (H.264 + AAC, faststart).
# Usage : ./scripts/compress-site-videos.sh
# Prérequis : ffmpeg (brew install ffmpeg)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FFMPEG="${FFMPEG:-ffmpeg}"
FFPROBE="${FFPROBE:-ffprobe}"
BACKUP_DIR="$ROOT/public/.video-backups/$(date +%Y%m%d-%H%M%S)"
TMP_DIR="$ROOT/public/.video-compress-tmp"

mkdir -p "$BACKUP_DIR" "$TMP_DIR"

human_size() {
  local bytes="$1"
  if (( bytes >= 1048576 )); then
    printf '%.1f Mo' "$(echo "scale=1; $bytes/1048576" | bc)"
  else
    printf '%.0f Ko' "$(echo "scale=0; $bytes/1024" | bc)"
  fi
}

file_size() {
  stat -f%z "$1" 2>/dev/null || stat -c%s "$1"
}

is_valid_video() {
  local file="$1"
  [[ -f "$file" ]] || return 1
  local size
  size="$(file_size "$file")"
  (( size > 10000 )) || return 1
  "$FFPROBE" -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$file" >/dev/null 2>&1
}

compress_hero() {
  local input="$1"
  local output="$2"
  local has_audio
  has_audio="$("$FFPROBE" -v error -select_streams a -show_entries stream=index -of csv=p=0 "$input" 2>/dev/null | head -1 || true)"

  local -a maps=( -map 0:v:0 )
  local -a audio_args=( -an )
  if [[ -n "$has_audio" ]]; then
    maps=( -map 0:v:0 -map "0:a?" )
    audio_args=( -c:a aac -b:a 96k -ac 2 )
  fi

  "$FFMPEG" -y -hide_banner -loglevel error -i "$input" \
    "${maps[@]}" \
    -c:v libx264 -preset slow -crf 29 -maxrate 1200k -bufsize 2400k \
    -vf "scale='min(1920,iw)':-2" \
    "${audio_args[@]}" \
    -movflags +faststart -pix_fmt yuv420p \
    "$output"
}

compress_content() {
  local input="$1"
  local output="$2"

  "$FFMPEG" -y -hide_banner -loglevel error -i "$input" \
    -map 0:v:0 -map "0:a?" \
    -c:v libx264 -preset slow -crf 27 -maxrate 2000k -bufsize 4000k \
    -vf "scale='min(1920,iw)':-2" \
    -c:a aac -b:a 96k -ac 2 \
    -movflags +faststart -pix_fmt yuv420p \
    "$output"
}

process() {
  local profile="$1"
  local rel="$2"
  local input="$ROOT/$rel"

  if ! is_valid_video "$input"; then
    echo "⊘ Ignoré (fichier absent ou invalide) : $rel"
    return 0
  fi

  local base
  base="$(basename "$rel")"
  local output="$TMP_DIR/$base"
  local before
  before="$(file_size "$input")"

  echo "▶ [$profile] $rel ($(human_size "$before"))…"

  if [[ "$profile" == hero ]]; then
    compress_hero "$input" "$output"
  else
    compress_content "$input" "$output"
  fi

  local after
  after="$(file_size "$output")"
  cp -p "$input" "$BACKUP_DIR/$base"
  mv "$output" "$input"

  local pct=0
  if (( before > 0 )); then
    pct="$(echo "scale=0; 100 * ($before - $after) / $before" | bc)"
  fi
  echo "  ✓ $(human_size "$before") → $(human_size "$after") (−${pct}%)"
}

echo "Sauvegarde des originaux : $BACKUP_DIR"
echo ""

process hero public/videos/video-hero-wide.mp4
process hero public/videos/video-hero-vertical.mp4
process content public/images/atelier-hero.mp4
process content public/images/atelier-seance.mp4
process content public/images/atelier-video-2.mp4
process content public/images/atelier-video-3.mp4
process content public/images/vernissage.mp4
process content public/images/atelier-video.mp4

rmdir "$TMP_DIR" 2>/dev/null || true

echo ""
echo "Terminé. Originaux dans : $BACKUP_DIR"
