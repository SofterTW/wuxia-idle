function addConsumable(refId, amount){
  const c = findConsumable(refId);
  if(!c) return;
  const stack = S.inventory.find(it=>it.kind==="consumable" && it.refId===refId);
  if(stack) stack.qty += amount;
  else S.inventory.push({kind:"consumable", refId, name:c.name, qty:amount, uid:allocUid()});
}

function buyConsumableBulk(refId, amount, isAuto){
  const c = findConsumable(refId);
  if(!c) return 0;
  const affordable = Math.min(amount, Math.floor(S.gold/c.price));
  if(affordable<=0){
    if(isAuto){
      addLog(`[自動購買] 錢財不足，無法補貨「${c.name}」`, 'warn');
      if(!S.warningModal && S.warningCooldown<=0){
        S.warningModal = `自動購買失敗：錢財不足，無法購買「${c.name}」（需要 ${formatMoney(c.price)}，目前僅有 ${formatMoney(S.gold)}）。`;
      }
    }
    return 0;
  }
  S.gold -= c.price*affordable;
  addConsumable(refId, affordable);
  addLog(`${isAuto?'[自動購買] ':''}購入「${c.name}」x${affordable}，花費 ${formatMoney(c.price*affordable)}`, 'system');
  return affordable;
}

function applyConsumableByRef(refId, autoTag){
  const stack = S.inventory.find(it=>it.kind==="consumable" && it.refId===refId);
  if(!stack || stack.qty<=0) return false;
  const c = findConsumable(refId);
  if(!c) return false;
  recalc(false);
  const prefix = autoTag ? `[自動${autoTag}] ` : "";
  if(c.effect==="healHp"){ S.hp = Math.min(S.hpMax, S.hp + Math.round(S.hpMax*c.value)); addLog(`${prefix}服用「${c.name}」，恢復氣血`, 'system'); }
  else if(c.effect==="healMp"){ S.mp = Math.min(S.mpMax, S.mp + Math.round(S.mpMax*c.value)); addLog(`${prefix}服用「${c.name}」，恢復內力`, 'system'); }
  else if(c.effect==="healFull"){ S.hp = S.hpMax; S.mp = S.mpMax; addLog(`${prefix}服用「${c.name}」，氣血內力當場全滿！`, 'system'); }
  else if(c.effect==="buffAtk"){ S.buffAtk = c.value; S.buffAtkTicks = c.duration; addLog(`${prefix}服用「${c.name}」，威力暫時提升 ${Math.round(c.value*100)}%，持續 ${c.duration} 次交手`, 'system'); }
  stack.qty -= 1;
  if(stack.qty<=0) S.inventory = S.inventory.filter(it=>it!==stack);
  return true;
}

function useConsumable(idx){
  const item = S.inventory[idx];
  if(!item || item.kind!=="consumable") return;
  applyConsumableByRef(item.refId, null);
  render();
}

function autoHealSide(itemId, pct, autoBuy, curPct, tag){
  if(!itemId || curPct>=pct) return;
  let stack = S.inventory.find(it=>it.kind==="consumable" && it.refId===itemId);
  if((!stack || stack.qty<=0) && autoBuy){
    buyConsumableBulk(itemId, 100, true);
    stack = S.inventory.find(it=>it.kind==="consumable" && it.refId===itemId);
  }
  if(!stack || stack.qty<=0) return;
  applyConsumableByRef(itemId, tag);
  // 藥品存量剩 1 瓶（含）以下時，自動補貨 100 瓶
  if(autoBuy && stack.qty<=1){
    buyConsumableBulk(itemId, 100, true);
  }
}

function checkAutoHeal(){
  const cfg = S.autoHeal;
  const hpPct = S.hpMax>0 ? S.hp/S.hpMax*100 : 100;
  const mpPct = S.mpMax>0 ? S.mp/S.mpMax*100 : 100;
  autoHealSide(cfg.hpItem, cfg.hpPct, cfg.hpAutoBuy, hpPct, "補血");
  autoHealSide(cfg.mpItem, cfg.mpPct, cfg.mpAutoBuy, mpPct, "補內力");
}

function useManual(idx){
  const item = S.inventory[idx];
  if(!item || item.kind!=="manual") return;
  if(item.manualType==="martial"){
    const def = Object.values(MARTIAL_POOL).flat().find(m=>m.id===item.targetId);
    if(S.knownMartial[item.targetId]){
      const bonus = 80;
      S.knownMartial[item.targetId].proficiency += bonus;
      addLog(`已學會「${def.name}」，重複的秘笈化為心得，熟練度 +${bonus}`, 'system');
    } else {
      S.knownMartial[item.targetId] = {proficiency:0, layer:1};
      addLog(`參悟秘笈，習得武學：「${def.name}」！`, 'system');
    }
  } else {
    const def = INTERNAL_POOL.find(t=>t.id===item.targetId);
    if(S.knownInternal[item.targetId]){
      const bonus = 300;
      S.qiPool += bonus;
      addLog(`已習得「${def.name}」，重複的秘笈化為修為，內功修為池 +${bonus}`, 'system');
    } else {
      S.knownInternal[item.targetId] = {invested:0};
      addLog(`參悟秘笈，習得內功心法：「${def.name}」！`, 'system');
    }
  }
  S.inventory = S.inventory.filter((_,i)=>i!==idx);
  render();
}

function investQi(techId, amount){
  const known = S.knownInternal[techId];
  const capReq = TIER_TABLE[MAX_OBTAINABLE_TIER-1].req;
  const room = Math.max(0, capReq - known.invested); // 現有途徑練滿後就不能再投入，避免浪費修為
  const avail = Math.min(amount, S.qiPool, room);
  if(avail<=0){
    if(room<=0) addLog(`「${INTERNAL_POOL.find(t=>t.id===techId).name}」已練滿目前可練到的層數，暫時無法再投入`, 'warn');
    render();
    return;
  }
  S.qiPool -= avail; known.invested += avail;
  addLog(`投入 ${avail} 點內功修為到「${INTERNAL_POOL.find(t=>t.id===techId).name}」`, 'system');
  recalc(false); render();
}
function respecTech(techId){
  if(S.materials.洗髓丹 < 1){ addLog("洗髓丹不足，無法洗點", 'warn'); render(); return; }
  if(S.respecCooldown>0){ addLog(`洗點冷卻中，尚餘 ${S.respecCooldown} 次戰鬥`, 'warn'); render(); return; }
  const inv = S.knownInternal[techId].invested;
  const refund = Math.floor(inv*0.7);
  S.knownInternal[techId].invested = 0; S.qiPool += refund; S.materials.洗髓丹 -= 1; S.respecCooldown = 20;
  addLog(`洗點「${INTERNAL_POOL.find(t=>t.id===techId).name}」，返還 ${refund} 點修為（打七折）`, 'system');
  recalc(false); render();
}
function setMainInternal(techId){
  S.activeInternal = techId;
  addLog(`設定主修內功為「${INTERNAL_POOL.find(t=>t.id===techId).name}」`, 'system');
  recalc(false); render();
}
function upgradeMartial(moveId){
  const known = S.knownMartial[moveId];
  const need = MARTIAL_TIER_TABLE[known.layer] ?? Infinity;
  if(known.layer>=9){ addLog("此招式已達大成，無法再升級", 'warn'); render(); return; }
  if(known.proficiency < need){ addLog("熟練度尚未達標，無法升級", 'warn'); render(); return; }
  const matCost = known.layer*3;
  if(S.materials.淬鍊石 < matCost){ addLog(`淬鍊石不足（需要 ${matCost}）`, 'warn'); render(); return; }
  S.materials.淬鍊石 -= matCost; known.proficiency = 0; known.layer += 1;
  const name = Object.values(MARTIAL_POOL).flat().find(m=>m.id===moveId).name;
  addLog(`「${name}」升級至第 ${known.layer} 層！`, 'system'); render();
}
function setMartialSlot(idx, moveId){ S.martialSlots[idx] = moveId; render(); }
function equipItem(item){
  const cur = S.equipment[item.slot];
  S.inventory = S.inventory.filter(i=>i!==item);
  if(cur) S.inventory.push({...cur, slot:item.slot});
  S.equipment[item.slot] = item;
  addLog(`裝備了「${item.name}」`, 'system'); recalc(false); render();
}

function fmt(n){ return Math.round(n*10)/10; }

// 貨幣：1000 銅錢 = 1 銀兩，1000 銀兩 = 1 銀錠。S.gold 內部仍以「銅錢」為最小單位存放。
function formatMoney(amount){
  amount = Math.max(0, Math.round(amount||0));
  const ding = Math.floor(amount/1000000);
  const liang = Math.floor((amount%1000000)/1000);
  const tong = amount%1000;
  const parts = [];
  if(ding>0) parts.push(`${ding}錠`);
  if(ding>0 || liang>0) parts.push(`${liang}兩`);
  parts.push(`${tong}銅`);
  return parts.join(' ');
}

function locationName(){
  if(S.location==="jinling") return "金凌城";
  const zone = HUNTING_ZONES.find(z=>z.id===S.location);
  return zone ? zone.name : "未知之地";
}
