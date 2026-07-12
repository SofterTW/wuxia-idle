function isEditingUI(){
  const el = document.activeElement;
  return !!(el && (el.tagName==='SELECT' || el.tagName==='INPUT'));
}

// 每次 tick 都存檔會拖慢高倍速（100倍時 tick 間隔只剩 12ms，每12ms寫一次 localStorage 會很吃效能），
// 改成存檔頻率跟遊戲倍速脫鉤，固定大約每 1 秒（真實時間）存一次，跟原本 1200ms 一輪的頻率差不多。
let __wxgLastSaveAt = 0;
function tickGame(){
  combatTick();
  if(!isEditingUI()) render();
  const now = Date.now();
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
