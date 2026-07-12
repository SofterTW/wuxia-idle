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

// 光是節流重繪頻率還不夠：render() 每次都整個 innerHTML 重建，如果使用者的滑鼠按下（mousedown）
// 到放開（mouseup）之間剛好夾了一次重繪，原本按下去的按鈕節點被整個換掉，click 事件就不會發生在
// 新的節點上——玩家會感覺「要抓時機」才按得到。用 pointerdown/pointerup 記錄「目前是否正在操作
// 中」，操作中就先不重繪，放開滑鼠後才補畫一次，這樣任何一次按下-放開的過程都保證在同一份 DOM
// 上完成，不會被 tick 打斷。
// 事件順序是 pointerdown → mousedown → pointerup → mouseup → click，click 在 pointerup 之後才會
// 觸發。上一版在 pointerup 監聽器裡直接同步呼叫 render()，等於在 click 事件要發生之前就把整個
// DOM 換掉了——原本按下去的按鈕節點被抽換，瀏覽器發現目標節點已經不在畫面上，click 事件根本
// 不會再發生，變成每次點擊都保證失敗（比原本偶發的問題還嚴重）。改用 setTimeout(...,0) 把補畫
// 這件事丟到下一個 macrotask，讓 click 事件跟它自己的 handler（可能也會呼叫 render()）先完整跑完
// 才輪到我們補畫，兩者不會再搶著動同一份 DOM。
// 點下拉選單（<select>）open 也是走 pointerdown→pointerup 這個順序：pointerup 當下選單其實才
// 剛要打開，瀏覽器的原生下拉選項清單是額外疊在上面的一層，不是靠畫面上那個 <select> 節點撐著。
// 如果這裡不分青紅皂白補畫一次，<select> 節點被整個換掉，瀏覽器就會直接把剛打開的下拉選單關掉
// （玩家會看到「一點開就縮回去」）。isEditingUI() 判斷的是「現在 focus 在 SELECT/INPUT 上」，
// 點下拉選單那一刻它必然是 focus 目標，用同一個判斷跳過補畫，選單開著的期間完全不會被打斷；
// 使用者選好選項、選單關閉、焦點離開時，原本就有的 focusout 監聽器會負責補畫一次。
let __wxgPointerActive = false;
document.addEventListener('pointerdown', ()=>{ __wxgPointerActive = true; });
document.addEventListener('pointerup', ()=>{
  __wxgPointerActive = false;
  setTimeout(()=>{ if(S && !isEditingUI()) render(); }, 0);
});
document.addEventListener('pointercancel', ()=>{ __wxgPointerActive = false; });

function tickGame(){
  combatTick();
  const now = Date.now();
  if(!isEditingUI() && !__wxgPointerActive && now - __wxgLastRenderAt > WXG_RENDER_MIN_INTERVAL_MS){
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
