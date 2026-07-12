// 存檔：使用瀏覽器 localStorage，存在玩家自己的電腦/瀏覽器裡（換瀏覽器或清瀏覽器資料會遺失）。
const SAVE_KEY = "wuxia_idle_save_v1";

function saveGame(){
  if(!S) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch(e){ /* 存檔空間不足或被封鎖時靜默失敗 */ }
}

// 讀檔後補齊舊存檔可能缺少的欄位，避免版本更新後載入舊存檔時因為缺欄位而壞掉。
function patchLoadedSave(){
  if(S.combatOptions===undefined) S.combatOptions = {fleeBoss:false};
  if(S.bagFilter===undefined) S.bagFilter = "all";
  if(S.pickerSnapshot===undefined) S.pickerSnapshot = [];
  if(S.navHintSeen===undefined) S.navHintSeen = true;
  if(S.codexSubTab===undefined) S.codexSubTab = "guide";
  if(S.visitingSect===undefined) S.visitingSect = null;
  if(S.materials===undefined) S.materials = {淬鍊石:0, 洗髓丹:0, 精鐵砂:0, 美玉錠:0};
  if(S.profession===undefined) S.profession = {level:1, exp:0};
  if(S.sideExpanded===undefined) S.sideExpanded = {primary:true, buffs:true, autoheal:true};
  if(S.logFilters===undefined) S.logFilters = {};
  if(S.internalExpanded===undefined) S.internalExpanded = {};
  if(S.martialExpanded===undefined) S.martialExpanded = {};
  if(S.statusEffects===undefined) S.statusEffects = [];
  if(S.monster && S.monster.statusEffects===undefined) S.monster.statusEffects = [];
  if(S.triggerFlash===undefined) S.triggerFlash = {};
  if(S.monsterInfoOpen===undefined) S.monsterInfoOpen = false;
  if(S.codexInternalSect===undefined) S.codexInternalSect = null;
  if(S.codexInternalSkillId===undefined) S.codexInternalSkillId = null;
  if(S.changelogPage===undefined) S.changelogPage = 0;
  if(S.nextUid===undefined) S.nextUid = 1;
  // 舊存檔的裝備/道具沒有 uid 欄位，逐一補發，號碼延續 S.nextUid，不會跟之後新產生的物品重複。
  Object.values(S.equipment).forEach(it=>{ if(it && it.uid==null) it.uid = allocUid(); });
  S.inventory.forEach(it=>{ if(it && it.uid==null) it.uid = allocUid(); });
  // 武當專用五招制戰鬥引擎欄位（見 combat.js combatTickWudang()）。
  if(S.rage===undefined) S.rage = 0;
  if(S.wudangMoveState===undefined) S.wudangMoveState = {};
  if(S.wudangMovesetsUnlocked===undefined) S.wudangMovesetsUnlocked = {};
  if(S.monsters===undefined) S.monsters = [];
  if(S.wudangFullBlockNext===undefined) S.wudangFullBlockNext = false;
  if(S.wudangCritNext===undefined) S.wudangCritNext = false;
  if(S.wudangSlots===undefined) S.wudangSlots = {"實招":[],"虛招":[],"架招":[],"氣招":[],"怒氣大招":[]};
  if(S.wudangLastMoveset===undefined) S.wudangLastMoveset = null;
  if(S.wudangSwitchCd===undefined) S.wudangSwitchCd = 0;
  if(S.sectKey==="wudang"){
    WUDANG_MOVESETS.forEach(m=>{ if(S.wudangMovesetsUnlocked[m.key]===undefined) S.wudangMovesetsUnlocked[m.key] = true; });
    if(Object.values(S.wudangSlots).every(arr=>arr.length===0)) S.wudangSlots = defaultWudangSlots();
  }
}

function loadGame(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const loaded = JSON.parse(raw);
    if(!loaded || !loaded.sectKey || !SECTS[loaded.sectKey]) return false;
    S = loaded;
    S.sect = SECTS[S.sectKey]; // 門派資料本身不存進存檔，讀檔後重新指回去
    patchLoadedSave();
    recalc(false);
    return true;
  } catch(e){ return false; }
}

function deleteSaveAndRestart(){
  try { localStorage.removeItem(SAVE_KEY); } catch(e){}
  S = null;
  render();
}

function pad2(n){ return String(n).padStart(2,'0'); }

// 匯出存檔：把目前進度包成 .json 檔案讓玩家下載，可以備份或搬到別的瀏覽器/電腦匯入。
function exportSave(){
  if(!S) return;
  saveGame();
  const data = JSON.stringify(S);
  const blob = new Blob([data], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const t = new Date();
  const fname = `江湖夜行_存檔_${S.sect.name}_${t.getFullYear()}${pad2(t.getMonth()+1)}${pad2(t.getDate())}_${pad2(t.getHours())}${pad2(t.getMinutes())}.json`;
  const a = document.createElement("a");
  a.href = url; a.download = fname;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  addLog(`已匯出存檔：${fname}`, 'system');
  render();
}

// 匯入存檔：讀取先前匯出的 .json 檔案，覆蓋目前進度。
function importSaveFromFile(file){
  const reader = new FileReader();
  reader.onload = ()=>{
    let loaded;
    try { loaded = JSON.parse(reader.result); }
    catch(e){ alert("存檔檔案解析失敗，可能不是有效的存檔檔案。"); return; }
    if(!loaded || !loaded.sectKey || !SECTS[loaded.sectKey]){ alert("存檔檔案格式不正確，無法匯入。"); return; }
    if(!confirm(`匯入這份存檔會覆蓋目前的進度（${S?S.sect.name+'弟子':'目前尚無角色'}），確定要繼續嗎？`)) return;
    S = loaded;
    S.sect = SECTS[S.sectKey];
    patchLoadedSave();
    recalc(true);
    saveGame();
    render();
    addLog(`已匯入存檔：${S.sect.name}弟子`, 'system');
  };
  reader.readAsText(file);
}
