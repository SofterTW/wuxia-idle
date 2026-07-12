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
// __wxgPointerActive 正常情況下靠 pointerup/pointercancel 重置，但滑鼠按下後拖到視窗外
// 放開、或分頁被切走等情況下，這兩個事件可能都不會觸發，導致旗標卡在 true 永遠出不來，
// 畫面重繪的節流判斷會永遠跳過、整個畫面看起來像凍結了（底層 tick 其實還在跑，只是不重繪）。
// 這裡加一個 failsafe：pointerdown 之後如果超過這個時間都沒等到 pointerup/pointercancel
// 來重置，就自己強制重置掉，避免真的卡死不會恢復。
const WXG_POINTER_STUCK_TIMEOUT_MS = 5000;
let __wxgPointerActive = false;
let __wxgPointerStuckTimer = null;
document.addEventListener('pointerdown', ()=>{
  __wxgPointerActive = true;
  clearTimeout(__wxgPointerStuckTimer);
  __wxgPointerStuckTimer = setTimeout(()=>{ __wxgPointerActive = false; }, WXG_POINTER_STUCK_TIMEOUT_MS);
});
document.addEventListener('pointerup', ()=>{
  __wxgPointerActive = false;
  clearTimeout(__wxgPointerStuckTimer);
  setTimeout(()=>{ if(S && !isEditingUI()) render(); }, 0);
});
document.addEventListener('pointercancel', ()=>{ __wxgPointerActive = false; clearTimeout(__wxgPointerStuckTimer); });

function maybeRenderAndSave(){
  const now = Date.now();
  if(!isEditingUI() && !__wxgPointerActive && now - __wxgLastRenderAt > WXG_RENDER_MIN_INTERVAL_MS){
    __wxgLastRenderAt = now;
    // render() 也包一層 try/catch：如果某個特定畫面狀態剛好讓 render() 本身丟例外，沒接住
    // 的話往後每次節流時間到了都會在同一個地方再炸一次，DOM 從此不會再更新，效果跟
    // combatTick() 丟例外一樣是「畫面凍結」。這裡至少讓存檔（下面那行）不會被連帶卡住。
    try{ render(); }
    catch(err){ console.error('[render 發生例外，畫面這次沒有更新成功]', err); }
  }
  if(now - __wxgLastSaveAt > 1000){
    __wxgLastSaveAt = now;
    try{ saveGame(); }
    catch(err){ console.error('[saveGame 發生例外，這次存檔沒有成功]', err); }
  }
}
// combatTick() 裡的戰鬥判定牽涉很多互相影響的系統（內功特效、武學招式、狀態效果……），
// 萬一某個特定狀態組合觸發了沒接住的例外，會讓這個 tick 直接中斷、後面的 maybeRenderAndSave()
// 永遠執行不到——計時器還是會繼續每 tick 呼叫，但因為狀態沒變，會在同一個地方一直重複拋出
// 同樣的例外，畫面就永遠停在出錯前那一格，玩家會感覺「戰鬥畫面整個停住了」。用 try/catch
// 包住，讓單一 tick 出錯不會拖垮後面的重繪／存檔，錯誤印到 console 方便之後追查。
function tickGame(){
  try{ combatTick(); }
  catch(err){ console.error('[combatTick 發生例外，這個 tick 的邏輯可能沒跑完]', err); }
  maybeRenderAndSave();
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
