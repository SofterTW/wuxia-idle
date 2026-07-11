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
