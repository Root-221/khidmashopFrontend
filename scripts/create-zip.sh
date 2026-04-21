#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ZIP_NAME="khidma-shop.zip"

cd "$ROOT_DIR"
rm -f "$ZIP_NAME"
zip -r "$ZIP_NAME" . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*" \
  -x "$ZIP_NAME"

echo "Created $ZIP_NAME"
