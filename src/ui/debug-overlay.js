// 開發用除錯看板：畫面截圖工具在此開發環境常故障，看不到實際畫面效果，
// 所以在 localhost（或手動設 window.DEBUG=true）時，於畫面角落即時顯示核心 state 的 JSON 快照，
// 讓開發時可以直接讀資料確認邏輯是否正確，不必依賴截圖。
window.DEBUG = (typeof window.DEBUG === "boolean")
  ? window.DEBUG
  : (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.protocol === "file:");

let __wxgRenderCount = 0;
let __wxgDebugCollapsed = false;

// 開發用：因為所有遊戲邏輯都包在 build.sh 產生的單一 IIFE 裡，瀏覽器主控台原本完全碰不到
// S／newGame／recalc 這些東西。DEBUG 模式下把它們掛到 window.wxg，方便直接下指令做戰鬥測試
// （例如 window.wxg.S.knownInternal[...].invested = 999999; window.wxg.recalc(true)）。
if(typeof window!=="undefined" && window.DEBUG){
  window.wxg = { get S(){ return S; }, set S(v){ S=v; }, newGame, recalc, getInternalTier, combatTick,
    spawnMonster, INTERNAL_POOL, INTERNAL_EFFECT_TABLE, rollInternalTrigger, saveGame, deleteSaveAndRestart, render };
}

function updateDebugOverlay(){
  if(!window.DEBUG) return;
  __wxgRenderCount++;
  let el = document.getElementById("wxgDebugOverlay");
  if(!el){
    el = document.createElement("div");
    el.id = "wxgDebugOverlay";
    el.style.cssText = `
      position:fixed; bottom:8px; right:8px; z-index:99999; max-width:360px; max-height:70vh;
      overflow:auto; background:rgba(10,8,5,.9); color:#8fe0b8; border:1px solid #3a2a17;
      border-radius:6px; padding:8px 10px; font:11px/1.5 "JetBrains Mono",monospace;
      white-space:pre-wrap; box-shadow:0 4px 16px rgba(0,0,0,.6);
    `.replace(/\n\s*/g, " ");
    el.title = "點擊收合／展開";
    el.addEventListener("click", ()=>{ __wxgDebugCollapsed = !__wxgDebugCollapsed; updateDebugOverlay(); });
    document.body.appendChild(el);
  }
  if(__wxgDebugCollapsed){
    el.textContent = `[DEBUG] render#${__wxgRenderCount}（點擊展開）`;
    return;
  }
  const snap = {
    render次數: __wxgRenderCount,
    S存在: !!S,
    地點: S ? S.location : null,
    門派: S ? S.sectKey : null,
    分頁: S ? S.tab : null,
    拜訪中門派: S ? S.visitingSect : null,
    對話中NPC: S ? (S.dialogueNpc ? S.dialogueNpc.id || S.dialogueNpc : null) : null,
    tick: S ? S.tick : null,
    氣血: S ? `${Math.round(S.hp)}/${Math.round(S.hpMax)}` : null,
    內力: S ? `${Math.round(S.mp)}/${Math.round(S.mpMax)}` : null,
    怪物: S && S.monster ? {名稱:S.monster.name, 氣血:`${Math.round(S.monster.hp)}/${Math.round(S.monster.hpMax)}`, 首領:!!S.monster.isBoss} : null,
    擊殺數: S ? S.killCount : null,
    彈窗: S ? {picker:!!S.pickerSlot, warning:!!S.warningModal} : null,
  };
  el.textContent = "[DEBUG]（點擊收合）\n" + JSON.stringify(snap, null, 1);
}
