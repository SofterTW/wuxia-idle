#!/usr/bin/env bash
# 將 src/ 底下的原始檔依序串接，輸出成單一可嵌入的 HTML 片段（無 <html>/<head>/<body>）。
# 用法：./build.sh [輸出檔名]（預設輸出到 dist/wuxia_idle.html）
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

OUT="dist/${1:-wuxia_idle.html}"
mkdir -p dist

# 載入順序的唯一事實來源：src/manifest.json（index.html／build.sh／build.js 都讀這份清單）。
# 新增檔案時只需要改 manifest.json 一個地方；下面三個特殊資產檔在建置時要內嵌 base64 圖片，
# 所以用 __XXX__ token 取代成對應的特殊處理邏輯。
mapfile -t MANIFEST_FILES < <(grep -oP '"\K[^"]+(?=")' src/manifest.json | grep '/')
JS_FILES=()
for f in "${MANIFEST_FILES[@]}"; do
  case "$f" in
    src/assets/scene-images.js)    JS_FILES+=("__SCENE_IMAGES__") ;;
    src/assets/sect-images.js)     JS_FILES+=("__SECT_IMAGES__") ;;
    src/assets/character-images.js) JS_FILES+=("__CHARACTER_IMAGES__") ;;
    *) JS_FILES+=("$f") ;;
  esac
done

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
    elif [ "$f" = "__SECT_IMAGES__" ]; then
      GARDEN_B64=$(base64 -w0 src/assets/img/sect-garden.jpg)
      VILLA_B64=$(base64 -w0 src/assets/img/sect-villa.jpg)
      echo "const SECT_GARDEN_IMG = \"data:image/jpeg;base64,${GARDEN_B64}\";"
      echo "const SECT_VILLA_IMG = \"data:image/jpeg;base64,${VILLA_B64}\";"
      sed -n '/^const SECT_BG/,$p' src/assets/sect-images.js
    elif [ "$f" = "__CHARACTER_IMAGES__" ]; then
      for i in 1 2 3 4 5; do
        HERO_B64=$(base64 -w0 "src/assets/img/characters/hero$i.png")
        echo "const HERO${i}_IMG = \"data:image/png;base64,${HERO_B64}\";"
      done
      # 保留原檔案中常數宣告以外的內容（DARK_WASH／SECT_PORTRAIT 對照表與 portraitImgHtml 函式）
      sed -n '/^const DARK_WASH/,$p' src/assets/character-images.js
    else
      cat "$f"
    fi
    echo
  done
  echo "})();"
  echo "</script>"
} > "$OUT"

echo "已輸出：$OUT（$(wc -l < "$OUT") 行）"
