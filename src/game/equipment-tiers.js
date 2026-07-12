const TIER_LIST = [
  {key:"wood",   name:"木", color:"#a8916b", mult:1.0, awakenSlots:0},
  {key:"bronze", name:"銅", color:"#d98e4a", mult:1.3, awakenSlots:1},
  {key:"iron",   name:"鐵", color:"#9ca3af", mult:1.6, awakenSlots:2},
  {key:"silver", name:"銀", color:"#cbd5e1", mult:2.0, awakenSlots:3},
  {key:"gold",   name:"金", color:"#fbbf24", mult:2.5, awakenSlots:4},
  {key:"jade",   name:"玉", color:"#5eead4", mult:3.0, awakenSlots:null}, // 玉裝開光欄位改用品級決定
];
const TIER_DROP_WEIGHTS = [50, 26, 12, 7, 4, 1]; // 對應 TIER_LIST 順序，越後面越稀有
const JADE_GRADE_WEIGHTS = [40, 24, 15, 10, 6, 3, 2]; // 一品~七品掉落權重

function rollTier(zoneLevelMod){
  // 高階狩獵區(levelMod越高)稍微提升高階裝備權重
  const bonus = Math.min(2, (zoneLevelMod||0)/6);
  const weights = TIER_DROP_WEIGHTS.map((w,i)=> i>=3 ? w+bonus*(i-2) : w);
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for(let i=0;i<TIER_LIST.length;i++){ r-=weights[i]; if(r<=0) return TIER_LIST[i]; }
  return TIER_LIST[0];
}
function rollJadeGrade(){
  const total = JADE_GRADE_WEIGHTS.reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for(let i=0;i<JADE_GRADE_WEIGHTS.length;i++){ r-=JADE_GRADE_WEIGHTS[i]; if(r<=0) return i+1; }
  return 1;
}
function tierAwakenSlots(item){
  if(item.tierKey==="jade") return item.jadeGrade||1;
  const t = TIER_LIST.find(t=>t.key===item.tierKey);
  return t ? t.awakenSlots : 0;
}
function itemRarity(item){
  if(!item) return TIER_LIST[0];
  const t = TIER_LIST.find(t=>t.key===item.tierKey) || TIER_LIST[0];
  return t;
}
function rarityNameHtml(item){
  const r = itemRarity(item);
  const uc = item.unique ? "#ff8a4a" : r.color;
  const gradeTxt = item.tierKey==="jade" ? `${["","一","二","三","四","五","六","七"][item.jadeGrade||1]}品玉` : r.name;
  const filled = (item.awakened||[]).length, slots = tierAwakenSlots(item);
  const uniqueTag = item.unique ? `<span style="font-size:9px; color:${uc}; border:1px solid ${uc}; border-radius:3px; padding:0 4px; margin-left:3px;">至寶</span>` : '';
  return `<span style="color:${uc}; font-weight:800; text-shadow:0 0 6px ${uc}55;">${item.name}</span> <span style="font-size:9px; color:${r.color}; border:1px solid ${r.color}; border-radius:3px; padding:0 4px;">${gradeTxt}</span>${uniqueTag}${slots>0?`<span style="font-size:9px; color:var(--dim-text); margin-left:3px;">開光 ${filled}/${slots}</span>`:''}`;
}

const AWAKEN_POOLS = {
  weapon: ["近身威力","遠程威力","內功威力","破防"],
  armor: ["臂力","身法","內息","罡氣","體魄","外功防禦","內功防禦"],
  accessory: ["外功命中","內功命中","外功暴擊","內功暴擊","閃避值","封勁"],
};
function slotCategory(slot){
  if(slot==="兵刃"||slot==="暗器") return "weapon";
  if(slot==="項飾"||slot==="戒指一"||slot==="戒指二") return "accessory";
  return "armor";
}
function awakenValueRange(tierKey, jadeGrade){
  const tierIdx = TIER_LIST.findIndex(t=>t.key===tierKey);
  const base = 2 + tierIdx*2;
  const gradeBonus = tierKey==="jade" ? (jadeGrade||1)*1.5 : 0;
  return {min:Math.round(base+gradeBonus*0.6), max:Math.round(base*1.8+gradeBonus)};
}

function generateEquipment(slot, levelMod){
  const lean = SLOT_LEAN[slot][Math.floor(Math.random()*SLOT_LEAN[slot].length)];
  const tier = rollTier(levelMod);
  const jadeGrade = tier.key==="jade" ? rollJadeGrade() : null;
  const baseVal = Math.round((3+Math.floor((levelMod||0)*0.8)+Math.floor(Math.random()*4)) * tier.mult);
  const namePrefix = {wood:"粗製",bronze:"精銅",iron:"寒鐵",silver:"素銀",gold:"赤金",jade:"美玉"}[tier.key];
  return {
    name:`${namePrefix}${slot}`, bonus:{[lean]:baseVal}, slot, kind:"equipment",
    tierKey:tier.key, jadeGrade, awakened:[], locked:false, uid:allocUid(),
  };
}
