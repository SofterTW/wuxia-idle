// 依 src/manifest.json 重新產生 index.html 裡 <!-- SCRIPTS:START/END --> 之間的 <script> 標籤，
// 讓 index.html 的載入順序永遠跟 manifest.json 一致，不用手動維護。
// 用法：node scripts/gen-index.js
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "src/manifest.json"), "utf8"));
const indexPath = path.join(ROOT, "index.html");
const indexHtml = fs.readFileSync(indexPath, "utf8");

const START = "<!-- SCRIPTS:START -->";
const END = "<!-- SCRIPTS:END -->";
const startIdx = indexHtml.indexOf(START);
const endIdx = indexHtml.indexOf(END);
if(startIdx === -1 || endIdx === -1 || endIdx < startIdx){
  console.error("找不到 index.html 裡的 <!-- SCRIPTS:START/END --> 標記，無法自動產生。");
  process.exit(1);
}

const block = [
  START,
  "<!-- 這段由 scripts/gen-index.js 依 src/manifest.json 自動產生，不要手動編輯順序。",
  "     新增/調整載入順序時：改 src/manifest.json，再執行 `node scripts/gen-index.js` 重新產生。 -->",
  ...manifest.map(f => `<script src="${f}"></script>`),
  END,
].join("\n");

const next = indexHtml.slice(0, startIdx) + block + indexHtml.slice(endIdx + END.length);
fs.writeFileSync(indexPath, next, "utf8");
console.log(`已依 src/manifest.json（${manifest.length} 個檔案）重新產生 index.html 的載入清單。`);
