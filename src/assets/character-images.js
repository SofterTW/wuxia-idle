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

// 統一疊加的「水墨暗黑武俠」色調，壓低彩度、提高對比、整體轉暗，
// 蓋掉素材本身的西幻感，讓 8 個角色在頭像框裡看起來像同一套美術。
const DARK_WASH = "sepia(0.6) contrast(1.2) brightness(0.8)";

const SECT_PORTRAIT = {
  shaolin:  {src:HERO1_IMG, filter:`saturate(1.1) ${DARK_WASH} hue-rotate(0deg)`},
  wudang:   {src:HERO2_IMG, filter:`${DARK_WASH} hue-rotate(10deg)`},
  emei:     {src:HERO3_IMG, filter:`saturate(1.2) ${DARK_WASH} hue-rotate(250deg)`},
  gaibang:  {src:HERO4_IMG, filter:`saturate(0.7) ${DARK_WASH} hue-rotate(0deg)`},
  tangmen:  {src:HERO5_IMG, filter:`saturate(1.4) contrast(1.3) ${DARK_WASH} hue-rotate(200deg)`},
  mingjiao: {src:HERO1_IMG, filter:`saturate(1.7) contrast(1.35) ${DARK_WASH} hue-rotate(320deg)`},
};
const MONSTER_PORTRAIT = {src:HERO4_IMG, filter:`saturate(1.5) contrast(1.35) ${DARK_WASH} hue-rotate(95deg)`};
const BOSS_PORTRAIT = {src:HERO5_IMG, filter:`saturate(1.9) contrast(1.55) ${DARK_WASH} hue-rotate(-25deg)`};

function portraitImgHtml(p, extraStyle){
  return `<img src="${p.src}" class="wxg-portrait-img" style="filter:${p.filter};${extraStyle||''}" alt=""/>`;
}
