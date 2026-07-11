function bonusTextHtml(bonus){
  return Object.entries(bonus).map(([k,v])=>`<span style="color:${PRIMARY_COLORS[k]||'inherit'}">${k}+${v}</span>`).join("、");
}

function effectiveStats(item){
  const total = {...(item?item.bonus:{}||{})};
  (item&&item.awakened||[]).forEach(a=> total[a.stat] = (total[a.stat]||0)+a.value);
  return total;
}
function compareBonusHtml(newItem, curItem){
  const newB = effectiveStats(newItem);
  const curB = effectiveStats(curItem);
  const keys = Array.from(new Set([...Object.keys(newB), ...Object.keys(curB)]));
  if(keys.length===0) return "";
  return keys.map(k=>{
    const nv = newB[k]||0, cv = curB[k]||0, diff = nv-cv;
    const diffColor = diff>0 ? "#4ade80" : (diff<0 ? "#ef4444" : "#8a7d63");
    const diffTxt = diff>0 ? `+${diff}` : `${diff}`;
    return `<div class="wxg-row" style="padding:2px 0;"><span style="color:${PRIMARY_COLORS[k]||'inherit'}">${k}</span><b>${cv} → ${nv} <span style="color:${diffColor};">（${diffTxt}）</span></b></div>`;
  }).join("");
}

function equipSellValue(item){
  const baseSum = Object.values(item.bonus).reduce((a,b)=>a+b,0);
  const awakenSum = (item.awakened||[]).reduce((a,b)=>a+b.value,0);
  const tierIdx = TIER_LIST.findIndex(t=>t.key===item.tierKey);
  const gradeMult = item.tierKey==="jade" ? 1+((item.jadeGrade||1)-1)*0.3 : 1;
  return Math.round((baseSum+awakenSum) * (1.5+tierIdx*0.5) * gradeMult);
}

function findConsumable(id){ return CONSUMABLES.find(c=>c.id===id); }

const PRIMARY_COLORS = {
  臂力:"#e2685c", 身法:"#7ec9a2", 內息:"#6db3e0", 罡氣:"#c084fc", 體魄:"#f3a03c",
};

