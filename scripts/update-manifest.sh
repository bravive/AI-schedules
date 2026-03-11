#!/usr/bin/env bash
set -euo pipefail

# Updates the manifest.json that powers the homepage archive section

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/output"
MANIFEST_FILE="$OUTPUT_DIR/manifest.json"
TODAY=$(date -u +"%Y-%m-%d")

mkdir -p "$OUTPUT_DIR"

# Initialize manifest if it doesn't exist
if [ ! -f "$MANIFEST_FILE" ]; then
  echo '{"latest":{},"archive":[]}' > "$MANIFEST_FILE"
fi

# Build today's entry
TASKS_JSON="[]"

if [ -f "$OUTPUT_DIR/ai-learning-engineer/$TODAY.html" ]; then
  TASKS_JSON=$(echo "$TASKS_JSON" | jq --arg path "output/ai-learning-engineer/$TODAY.html" \
    '. + [{"type":"ai-learning-engineer","label":"AI Learning Engineer","path":$path}]')
fi

if [ -f "$OUTPUT_DIR/stock-trader/$TODAY.html" ]; then
  TASKS_JSON=$(echo "$TASKS_JSON" | jq --arg path "output/stock-trader/$TODAY.html" \
    '. + [{"type":"stock-trader","label":"Stock Trader","path":$path}]')
fi

# Update latest pointers
MANIFEST=$(cat "$MANIFEST_FILE")

if [ -f "$OUTPUT_DIR/ai-learning-engineer/$TODAY.html" ]; then
  MANIFEST=$(echo "$MANIFEST" | jq --arg date "$TODAY" \
    --arg path "output/ai-learning-engineer/$TODAY.html" \
    '.latest["ai-learning-engineer"] = {"date":$date,"path":$path}')
fi

if [ -f "$OUTPUT_DIR/stock-trader/$TODAY.html" ]; then
  MANIFEST=$(echo "$MANIFEST" | jq --arg date "$TODAY" \
    --arg path "output/stock-trader/$TODAY.html" \
    '.latest["stock-trader"] = {"date":$date,"path":$path}')
fi

# Add to archive (prepend, avoid duplicates for same date)
MANIFEST=$(echo "$MANIFEST" | jq --arg date "$TODAY" --argjson tasks "$TASKS_JSON" \
  'if ($tasks | length) > 0 then
    .archive = ([{"date":$date,"tasks":$tasks}] + [.archive[] | select(.date != $date)])
   else . end')

echo "$MANIFEST" | jq '.' > "$MANIFEST_FILE"

echo "Manifest updated: $MANIFEST_FILE"
