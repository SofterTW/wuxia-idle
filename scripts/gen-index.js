// 依 src/manifest.json 重新產生 index.html 裡 <!-- SCRIPTS:START/END --> 之間的 <script> 標籤，
// 讓 index.html 的載入順序永遠跟 manifest.json 一致，不用手動維護。
// 每個 <script> 跟 <link rel="stylesheet"> 都會加上 ?v=目前版本號 的快取破壞參數——GitHub Pages
// 預設的 Cache-Control 讓瀏覽器可能長期快取這些檔案，玩家如果沒有手動 Ctrl+F5 強制重新整理，
// 更新後可能還在跑舊的 JS/CSS。版本號一變，URL 就跟著變，瀏覽器就會當成新資源重新抓取，
// 不需要玩家自己清快取。版本號直接從 src/data/changelog.js 最新（陣列第一筆）的 version 讀取，
// 所以只要 changelog 有記新版本，重新執行這支腳本就會自動套用到快取參數，不用另外維護版本號。
// 用法：node scripts/gen-index.js
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "src/manifest.json"), "utf8"));
const indexPath = path.join(ROOT, "index.html");
const indexHtml = fs.readFileSync(indexPath, "utf8");

const changelogSrc = fs.readFileSync(path.join(ROOT, "src/data/changelog.js"), "utf8");
const versionMatch = changelogSrc.match(/version:\s*"([^"]+)"/);
if(!versionMatch){
  console.error("在 src/data/changelog.js 找不到 version 欄位，無法產生快取破壞參數。");
  process.exit(1);
}
const version = versionMatch[1];

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
  "     新增/調整載入順序時：改 src/manifest.json，再執行 `node scripts/gen-index.js` 重新產生。",
  "     每個檔案結尾的 ?v=版本號 是快取破壞參數，版本號直接讀 changelog.js 最新版本，不用手動改。 -->",
  ...manifest.map(f => `<script src="${f}?v=${version}"></script>`),
  END,
].join("\n");

let next = indexHtml.slice(0, startIdx) + block + indexHtml.slice(endIdx + END.length);
// 樣式表不在 SCRIPTS:START/END 區塊內，另外用正則處理同一個快取破壞參數。
next = next.replace(/(<link rel="stylesheet" href="src\/style\.css)(\?v=[^"]*)?(">)/, `$1?v=${version}$3`);

fs.writeFileSync(indexPath, next, "utf8");
console.log(`已依 src/manifest.json（${manifest.length} 個檔案）重新產生 index.html 的載入清單，快取破壞版本號 v=${version}。`);
