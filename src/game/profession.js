const PROFESSION_EXP_TABLE = [0, 50, 150, 350, 700, 1300, 2200]; // index0=Lv1所需(即0),之後為升到Lv(i+2)所需累積經驗
function professionExpToNext(){
  const lv = S.profession.level;
  return lv<7 ? PROFESSION_EXP_TABLE[lv] : Infinity;
}
function gainProfessionExp(amount){
  if(S.profession.level>=7) return;
  S.profession.exp += amount;
  while(S.profession.level<7 && S.profession.exp >= professionExpToNext()){
    S.profession.exp -= professionExpToNext();
    S.profession.level++;
    addLog(`煉器技藝精進！生活職業提升至 Lv.${S.profession.level}`, 'system');
  }
}
function maxAwakenTierIdx(){
  return Math.min(3, S.profession.level-1); // Lv1~4 分別解鎖 木銅/鐵/銀/金
}
function maxJadeGrade(){
  const lv = S.profession.level;
  if(lv<5) return 0;
  if(lv===5) return 2;
  if(lv===6) return 5;
  return 7;
}
function canAwakenItem(item){
  if(item.tierKey==="jade") return (item.jadeGrade||1) <= maxJadeGrade();
  const idx = TIER_LIST.findIndex(t=>t.key===item.tierKey);
  return idx <= maxAwakenTierIdx()+1; // 木銅算同一階(idx0,1都算Lv1解鎖)
}
function awakenCost(item){
  const idx = TIER_LIST.findIndex(t=>t.key===item.tierKey);
  if(idx<=2) return {gold:20+idx*15, mat:"淬鍊石", amt:3+idx*2};
  if(idx===3) return {gold:60, mat:"精鐵砂", amt:2};
  if(idx===4) return {gold:120, mat:"精鐵砂", amt:5};
  return {gold:200+((item.jadeGrade||1)-1)*80, mat:"美玉錠", amt:(item.jadeGrade||1)};
}

function tryAwaken(item){
  const slots = tierAwakenSlots(item);
  if((item.awakened||[]).length >= slots) return {ok:false, reason:"full"};
  const pool = AWAKEN_POOLS[slotCategory(item.slot)];
  const stat = pool[Math.floor(Math.random()*pool.length)];
  const range = awakenValueRange(item.tierKey, item.jadeGrade);
  const value = range.min + Math.floor(Math.random()*(range.max-range.min+1));
  const success = Math.random() < 0.75; // 開光成功率
  if(success){
    item.awakened = item.awakened || [];
    item.awakened.push({stat, value});
  }
  return {ok:success, stat, value};
}

function performAwaken(item){
  if(!item) return;
  const slots = tierAwakenSlots(item);
  if((item.awakened||[]).length >= slots){ addLog(`「${item.name}」開光欄位已滿`, 'warn'); render(); return; }
  if(!canAwakenItem(item)){ addLog(`煉器技藝尚不足以開光「${item.name}」，需提升生活職業等級`, 'warn'); render(); return; }
  const cost = awakenCost(item);
  if(S.gold < cost.gold || (S.materials[cost.mat]||0) < cost.amt){
    addLog(`開光材料或錢財不足（需要 ${cost.mat} x${cost.amt}、${formatMoney(cost.gold)}）`, 'warn'); render(); return;
  }
  S.gold -= cost.gold;
  S.materials[cost.mat] -= cost.amt;
  const result = tryAwaken(item);
  const idx = TIER_LIST.findIndex(t=>t.key===item.tierKey);
  gainProfessionExp(6+idx*3);
  if(result.ok){
    addLog(`開光成功！「${item.name}」獲得新詞條：${result.stat} +${result.value}`, 'loot');
  } else {
    addLog(`開光失敗，材料已消耗，「${item.name}」未獲得新詞條`, 'warn');
  }
  recalc(false); render();
}

const PRIMARY_KEYS = ["臂力","身法","內息","罡氣","體魄"];
function getAwakenTotals(){
  // 回傳 {主屬性:{...}, 副屬性:{...破防/命中/暴擊/防禦/威力等}}
  const primary = {}, secondary = {};
  Object.values(S.equipment).forEach(item=>{
    if(!item || !item.awakened) return;
    item.awakened.forEach(a=>{
      if(PRIMARY_KEYS.includes(a.stat)) primary[a.stat] = (primary[a.stat]||0) + a.value;
      else secondary[a.stat] = (secondary[a.stat]||0) + a.value;
    });
  });
  return {primary, secondary};
}
