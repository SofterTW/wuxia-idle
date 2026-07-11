#!/usr/bin/env bash
# 將 src/ 底下的原始檔依序串接，輸出成單一可嵌入的 HTML 片段（無 <html>/<head>/<body>）。
# 用法：./build.sh [輸出檔名]（預設輸出到 dist/wuxia_idle.html）
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

OUT="dist/${1:-wuxia_idle.html}"
mkdir -p dist

JS_FILES=(
  src/data/sects.js
  src/assets/figures.js
  __SCENE_IMAGES__
  src/data/weapon.js
  src/data/armor.js
  src/data/inner-power.js
  src/data/martial-techniques.js
  src/data/tables.js
  src/data/etcitem.js
  src/data/unique-equipment.js
  src/game/helpers.js
  src/game/equipment-tiers.js
  src/game/profession.js
  src/data/npc-tables.js
  src/game/state.js
  src/game/core.js
  src/game/combat.js
  src/game/inventory.js
  src/ui/render.js
  src/ui/events.js
  src/game/loop.js
)

{
  echo "<style>"
  cat src/style.css
  echo "</style>"
  echo
  echo '<div class="wxg" id="wxgRoot"></div>'
  echo
  echo "<script>"
  echo "(function(){"
  echo
  for f in "${JS_FILES[@]}"; do
    if [ "$f" = "__SCENE_IMAGES__" ]; then
      # 建置時把圖檔內嵌成 base64，讓輸出的單一 HTML 片段不依賴外部圖檔。
      IMG_B64=$(base64 -w0 src/assets/img/jinling-town.jpg)
      echo "const JINLING_BG_IMG = \"data:image/jpeg;base64,${IMG_B64}\";"
    else
      cat "$f"
    fi
    echo
  done
  echo "})();"
  echo "</script>"
} > "$OUT"

echo "已輸出：$OUT（$(wc -l < "$OUT") 行）"
