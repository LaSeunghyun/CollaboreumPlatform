#!/usr/bin/env bash
set -e
violations=$(grep -REn "(bg|text|border|ring)-(red|blue|green|slate|gray|neutral|zinc|stone|emerald|indigo|violet|pink)-" src \
  | grep -v "src/shared/ui" | grep -v "src/shared/theme" || true)
hex=$(grep -REn "#[0-9a-fA-F]{3,6}" src | grep -v "src/shared/ui" | grep -v "src/shared/theme" || true)
rgb=$(grep -REn "rgb\\s*\\(" src | grep -v "src/shared/ui" | grep -v "src/shared/theme" || true)
if [ -n "$violations$hex$rgb" ]; then
  echo "❌ Forbidden raw color usage detected:"
  [ -n "$violations" ] && echo "$violations"
  [ -n "$hex" ] && echo "$hex"
  [ -n "$rgb" ] && echo "$rgb"
  exit 1
fi
echo "✅ No forbidden color classes or raw colors."
