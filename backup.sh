#!/usr/bin/env bash
set -euo pipefail

src_dir="$(pwd)"
base_name="$(basename "$src_dir")"
timestamp="$(date +"%Y%m%d%H%M")"
dest_dir="$(dirname "$src_dir")/${timestamp}-${base_name}"

mkdir -p "$dest_dir"

# Copy only desired file types, keep directory structure, skip node_modules and everything else
rsync -av \
  --exclude 'node_modules/' \
  --exclude '.git/' \
  --include '*/' \
  --include '*.js' \
  --include '*.ts' \
  --include '*.json' \
  --include '*.html' \
  --include '*.htm' \
  --include '*.md' \
  --exclude '*' \
  "$src_dir"/ "$dest_dir"/

echo "Copied to: $dest_dir"