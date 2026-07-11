// 開發模式：直接用相對路徑載入圖檔。
// 正式建置時，這些常數會被替換成 base64 內嵌版本（見 build.sh／build.js 的 __CHARACTER_IMAGES__）。
// 素材來源：Fantasy Character Portrait (FREE Asset Pack) by oicaroh（見 CREDITS.md）。
// 這組素材只有 5 張、且是西方奇幻風格，跟六門派、野怪、首領（共 8 個角色）對不上，
// 所以用重複素材 + CSS filter 調色的方式做出區隔，屬於權宜之計。
const HERO1_IMG = "src/assets/img/characters/hero1.png";
const HERO2_IMG = "src/assets/img/characters/hero2.png";
const HERO3_IMG = "src/assets/img/characters/hero3.png";
const HERO4_IMG = "src/assets/img/characters/hero4.png";
const HERO5_IMG = "src/assets/img/characters/hero5.png";

const SECT_PORTRAIT = {
  shaolin:  {src:HERO1_IMG, filter:"saturate(1.1) sepia(0.15)"},
  wudang:   {src:HERO2_IMG, filter:"none"},
  emei:     {src:HERO3_IMG, filter:"hue-rotate(250deg) saturate(1.2) brightness(1.05)"},
  gaibang:  {src:HERO4_IMG, filter:"saturate(0.7) sepia(0.35) brightness(0.95)"},
  tangmen:  {src:HERO5_IMG, filter:"hue-rotate(200deg) saturate(1.4) brightness(0.8) contrast(1.1)"},
  mingjiao: {src:HERO1_IMG, filter:"hue-rotate(320deg) saturate(1.7) brightness(0.9) contrast(1.15)"},
};
const MONSTER_PORTRAIT = {src:HERO4_IMG, filter:"hue-rotate(95deg) saturate(1.5) brightness(0.75) contrast(1.15)"};
const BOSS_PORTRAIT = {src:HERO5_IMG, filter:"hue-rotate(-25deg) saturate(1.9) brightness(0.6) contrast(1.35)"};

function portraitImgHtml(p, extraStyle){
  return `<img src="${p.src}" class="wxg-portrait-img" style="filter:${p.filter};${extraStyle||''}" alt=""/>`;
}
