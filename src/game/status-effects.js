// 通用狀態效果系統：把 inner-power.js 的 INTERNAL_EFFECT_TABLE 接上戰鬥引擎。
// S.statusEffects 是玩家身上的（增益／護盾／內力持續回復），S.monster.statusEffects 是怪物身上的
// （中毒型 DOT／降防降命中 debuff）。跟既有的 poisonStacks/bleedStacks（唐門淬毒被動、武學特效用）
// 是分開的兩組欄位，彼此不互相干擾。

function tickStatusEffects(list){
  for(let i=list.length-1; i>=0; i--){
    list[i].remainingTicks--;
    if(list[i].remainingTicks<=0) list.splice(i,1);
  }
}

function getStatusBonus(list, kind, stat){
  return list.reduce((sum,e)=> (e.kind===kind && e.stat===stat) ? sum+e.value : sum, 0);
}

// 骰一次心法在目前層數是否觸發，回傳效果 payload（含 trigger 類型），沒觸發或條件不符回傳 null。
function rollInternalTrigger(techDef, tier, triggerType){
  const table = INTERNAL_EFFECT_TABLE[techDef.id];
  if(!table || table.trigger!==triggerType) return null;
  if(table.condition && !table.condition(S)) return null;
  const eff = table.resolve(tier);
  if(Math.random() >= eff.chance) return null;
  return eff;
}

function applyPlayerStatusEffect(eff, techDef){
  if(eff.kind==="buff"){
    S.statusEffects.push({kind:"buff", stat:eff.stat, value:eff.value, remainingTicks:eff.duration,
      mitigateFlat:eff.mitigateFlat||0, staggerReduce:eff.staggerReduce||0});
  } else if(eff.kind==="regen"){
    S.statusEffects.push({kind:"regen", stat:eff.stat, value:eff.valuePerTick, remainingTicks:eff.duration,
      atkBuff:eff.atkBuff||0});
  }
}

// 怪物身上的 DOT／debuff（唐門七絕經／明教赤火功攻擊觸發）。
function applyMonsterStatusEffect(eff){
  S.monster.statusEffects.push({kind:"dot_debuff", element:eff.element, dmgPerTick:eff.dmgPerTick,
    debuffStat:eff.debuffStat, debuffValue:eff.debuffValue, remainingTicks:eff.duration,
    selfMpRestoreOnTick:!!(eff.finale && eff.finale.selfMpRestoreOnTick)});
}
