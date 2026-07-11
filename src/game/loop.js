function isEditingUI(){
  const el = document.activeElement;
  return !!(el && (el.tagName==='SELECT' || el.tagName==='INPUT'));
}

function tickGame(){
  combatTick();
  if(!isEditingUI()) render();
}

document.addEventListener('focusout', (e)=>{
  if(S && e.target && (e.target.tagName==='SELECT' || e.target.tagName==='INPUT')){
    setTimeout(()=>{ if(S) render(); }, 60);
  }
});

if(window.__wxgInterval) clearInterval(window.__wxgInterval);
window.__wxgInterval = setInterval(()=>{ if(S) tickGame(); }, 1200);
render();
