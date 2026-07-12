function isEditingUI(){
  const el = document.activeElement;
  return !!(el && (el.tagName==='SELECT' || el.tagName==='INPUT'));
}

// 每次 tick 都存檔／整頁重繪，在高倍速下會出事：100倍時 tick 間隔只剩 12ms，每12ms寫一次
// localStorage、每12ms整個 innerHTML 重建一次，畫面會瘋狂閃爍，按鈕也常常在點下去那一刻剛好
// 被換掉而點不到。存檔跟畫面重繪都改成跟遊戲倍速脫鉤，固定用真實時間節流——combatTick() 本身
// 還是照倍速全速跑（數值/擊殺數不會變慢），只是畫面沒必要每個 tick 都真的重畫一次。
let __wxgLastSaveAt = 0;
let __wxgLastRenderAt = 0;
const WXG_RENDER_MIN_INTERVAL_MS = 100; // 畫面最多每秒重繪約10次，肉眼看起來還是流暢，但不會閃爍/擋點擊
function tickGame(){
  combatTick();
  const now = Date.now();
  if(!isEditingUI() && now - __wxgLastRenderAt > WXG_RENDER_MIN_INTERVAL_MS){
    __wxgLastRenderAt = now;
    render();
  }
  if(now - __wxgLastSaveAt > 1000){ __wxgLastSaveAt = now; saveGame(); }
}

document.addEventListener('focusout', (e)=>{
  if(S && e.target && (e.target.tagName==='SELECT' || e.target.tagName==='INPUT')){
    setTimeout(()=>{ if(S) render(); }, 60);
  }
});

window.addEventListener('beforeunload', ()=>{ saveGame(); });

// 全局加速（測試用）：1/10/100 倍，縮短 tick 間隔讓 combatTick() 跑得更快。
const WXG_TICK_BASE_MS = 1200;
function applyTickSpeed(){
  if(window.__wxgInterval) clearInterval(window.__wxgInterval);
  const mult = (S && S.tickSpeedMult) || 1;
  window.__wxgInterval = setInterval(()=>{ if(S) tickGame(); }, Math.max(12, Math.round(WXG_TICK_BASE_MS/mult)));
}
function setTickSpeed(mult){
  if(!S) return;
  S.tickSpeedMult = mult;
  applyTickSpeed();
  render();
}

loadGame();
applyTickSpeed();
render();
