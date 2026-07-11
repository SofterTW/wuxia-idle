// 將 src/ 底下的原始檔依序串接，輸出成單一可嵌入的 HTML 片段（無 <html>/<head>/<body>）。
// 用法：node build.js [輸出檔名]（預設輸出到 dist/wuxia_idle.html）

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const OUT = path.join(__dirname, "dist", process.argv[2] || "wuxia_idle.html");

const JS_FILES = [
  "data/sects.js",
  "assets/figures.js",
  "__SCENE_IMAGES__",
  "__SECT_IMAGES__",
  "__CHARACTER_IMAGES__",
  "data/weapon.js",
  "data/armor.js",
  "data/inner-power.js",
  "data/martial-techniques.js",
  "data/tables.js",
  "data/etcitem.js",
  "data/unique-equipment.js",
  "game/helpers.js",
  "game/equipment-tiers.js",
  "game/profession.js",
  "data/npc-tables.js",
  "data/monster-roster.js",
  "data/changelog.js",
  "game/state.js",
  "game/core.js",
  "game/combat.js",
  "game/inventory.js",
  "ui/render.js",
  "ui/events.js",
  "game/loop.js",
];

const css = fs.readFileSync(path.join(SRC, "style.css"), "utf8").trim();
// 建置時把圖檔內嵌成 base64，讓輸出的單一 HTML 片段不依賴外部圖檔。
const jinlingImgB64 = fs.readFileSync(path.join(SRC, "assets/img/jinling-town.jpg")).toString("base64");
const charImagesSrc = fs.readFileSync(path.join(SRC, "assets/character-images.js"), "utf8");
const charImagesRest = charImagesSrc.slice(charImagesSrc.indexOf("const SECT_PORTRAIT"));
const heroConsts = [1, 2, 3, 4, 5]
  .map(i => {
    const b64 = fs.readFileSync(path.join(SRC, `assets/img/characters/hero${i}.png`)).toString("base64");
    return `const HERO${i}_IMG = "data:image/png;base64,${b64}";`;
  })
  .join("\n");
const sectImagesSrc = fs.readFileSync(path.join(SRC, "assets/sect-images.js"), "utf8");
const sectImagesRest = sectImagesSrc.slice(sectImagesSrc.indexOf("const SECT_BG"));
const gardenB64 = fs.readFileSync(path.join(SRC, "assets/img/sect-garden.jpg")).toString("base64");
const villaB64 = fs.readFileSync(path.join(SRC, "assets/img/sect-villa.jpg")).toString("base64");
const js = JS_FILES
  .map(f => {
    if (f === "__SCENE_IMAGES__") return `const JINLING_BG_IMG = "data:image/jpeg;base64,${jinlingImgB64}";`;
    if (f === "__SECT_IMAGES__") return `const SECT_GARDEN_IMG = "data:image/jpeg;base64,${gardenB64}";\nconst SECT_VILLA_IMG = "data:image/jpeg;base64,${villaB64}";\n${sectImagesRest}`;
    if (f === "__CHARACTER_IMAGES__") return `${heroConsts}\n${charImagesRest}`;
    return fs.readFileSync(path.join(SRC, f), "utf8").trimEnd();
  })
  .join("\n\n");

const output = `<style>
${css}
</style>

<div class="wxg" id="wxgRoot"></div>

<script>
(function(){

${js}

})();
</script>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, output, "utf8");
console.log(`已輸出：${path.relative(__dirname, OUT)}（${output.length} 字元）`);
