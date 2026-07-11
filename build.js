// 將 src/ 底下的原始檔依序串接，輸出成單一可嵌入的 HTML 片段（無 <html>/<head>/<body>）。
// 用法：node build.js [輸出檔名]（預設輸出到 dist/wuxia_idle.html）

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const OUT = path.join(__dirname, "dist", process.argv[2] || "wuxia_idle.html");

const JS_FILES = [
  "data/sects.js",
  "assets/figures.js",
  "data/tables.js",
  "game/helpers.js",
  "game/equipment-tiers.js",
  "game/profession.js",
  "data/npc-tables.js",
  "game/state.js",
  "game/core.js",
  "game/combat.js",
  "game/inventory.js",
  "ui/render.js",
  "ui/events.js",
  "game/loop.js",
];

const css = fs.readFileSync(path.join(SRC, "style.css"), "utf8").trim();
const js = JS_FILES
  .map(f => fs.readFileSync(path.join(SRC, f), "utf8").trimEnd())
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
