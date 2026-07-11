// 將 src/ 底下的原始檔依序串接，輸出成單一可嵌入的 HTML 片段（無 <html>/<head>/<body>）。
// 用法：node build.js [輸出檔名]（預設輸出到 dist/wuxia_idle.html）

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const OUT = path.join(__dirname, "dist", process.argv[2] || "wuxia_idle.html");

// 載入順序的唯一事實來源：src/manifest.json（index.html／build.sh／build.js 都讀這份清單）。
// 新增檔案時只需要改 manifest.json 一個地方；下面這張表列出建置時需要內嵌 base64 圖片的
// 特殊資產檔，對應到既有的 __XXX__ 特殊處理邏輯。
const BUILD_TOKEN_MAP = {
  "assets/scene-images.js": "__SCENE_IMAGES__",
  "assets/sect-images.js": "__SECT_IMAGES__",
  "assets/character-images.js": "__CHARACTER_IMAGES__",
};
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "src/manifest.json"), "utf8"));
const JS_FILES = manifest
  .map(f => f.replace(/^src\//, ""))
  .map(f => BUILD_TOKEN_MAP[f] || f);

const css = fs.readFileSync(path.join(SRC, "style.css"), "utf8").trim();
// 建置時把圖檔內嵌成 base64，讓輸出的單一 HTML 片段不依賴外部圖檔。
const jinlingImgB64 = fs.readFileSync(path.join(SRC, "assets/img/jinling-town.jpg")).toString("base64");
const charImagesSrc = fs.readFileSync(path.join(SRC, "assets/character-images.js"), "utf8");
const charImagesRest = charImagesSrc.slice(charImagesSrc.indexOf("const DARK_WASH"));
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
