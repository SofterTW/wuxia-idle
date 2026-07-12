// 把純文字塞進 innerHTML 前先跳脫 HTML 特殊字元，避免文字裡剛好出現 <script> 之類的字樣
// 被瀏覽器當成真的標籤解析（曾經因為更新紀錄文字裡提到「<script>」導致後面內容整段消失）。
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}

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

// 物品專屬編號：參考 L1J（天堂1 Java版模擬伺服器）的 object_id 設計——單一全域自增計數器，
// 不分武器/裝備/道具分類、不補零、沒有上限，發過的號碼即使物品被賣掉/刪除也不會回收重發。
// 每一件裝備實例（含隨機掉落、門派至寶）跟每一列道具/藥品/秘笈堆疊，第一次被建立時呼叫這個
// 拿一個 uid，之後同一個物件被移動（例如換裝、放回背包）沿用同一個 uid，不重新發號。
function allocUid(){
  if(S.nextUid==null) S.nextUid = 1;
  return String(S.nextUid++);
}

const PRIMARY_COLORS = {
  臂力:"#e2685c", 身法:"#7ec9a2", 內息:"#6db3e0", 罡氣:"#c084fc", 體魄:"#f3a03c",
};

