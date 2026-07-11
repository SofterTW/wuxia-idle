// 開發模式：直接用相對路徑載入圖檔。
// 正式建置時，這些常數會被替換成 base64 內嵌版本（見 build.sh／build.js 的 __SECT_IMAGES__）。
// 素材來源：LinXueLian 的免費背景包（見 CREDITS.md），只有 3 張圖，
// 用重複素材 + CSS filter 調色的方式做出六門派的視覺區隔。
const SECT_GARDEN_IMG = "src/assets/img/sect-garden.jpg";
const SECT_VILLA_IMG = "src/assets/img/sect-villa.jpg";

const SECT_BG = {
  shaolin:  {src:SECT_VILLA_IMG,  filter:"sepia(0.4) saturate(1.3) brightness(0.85) hue-rotate(-8deg)"},
  wudang:   {src:SECT_VILLA_IMG,  filter:"saturate(0.9) brightness(0.95) hue-rotate(150deg)"},
  emei:     {src:SECT_GARDEN_IMG, filter:"saturate(1.05) brightness(1.02)"},
  gaibang:  {src:JINLING_BG_IMG,  filter:"saturate(0.55) sepia(0.3) brightness(0.8)"},
  tangmen:  {src:SECT_VILLA_IMG,  filter:"saturate(1.3) brightness(0.55) hue-rotate(230deg) contrast(1.2)"},
  mingjiao: {src:SECT_GARDEN_IMG, filter:"saturate(1.6) brightness(0.65) hue-rotate(-45deg) contrast(1.25)"},
};
