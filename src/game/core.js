function addLog(msg, type){ S.log.unshift({msg, type: type||'system', t: S.tick}); if(S.log.length>60) S.log.pop(); }

function getEquipTotal(){
  const total = {臂力:0,身法:0,內息:0,罡氣:0,體魄:0};
  Object.values(S.equipment).forEach(it=>{ if(!it) return; Object.entries(it.bonus).forEach(([k,v])=> total[k]+=v); });
  return total;
}
function getInternalTier(techId){
  const inv = S.knownInternal[techId]?.invested || 0;
  const cap = MAX_OBTAINABLE_TIER - 1; // 目前只有前 6 層能透過投入修為練到
  let tier = 0;
  for(let i=cap;i>=0;i--){ if(inv >= TIER_TABLE[i].req){ tier=i; break; } }
  return tier;
}
function recalc(fullRestore){
  const eq = getEquipTotal();
  const awaken = getAwakenTotals();
  const rankBonus = 1 + (RANK_TABLE[S.sectRank]?.bonus||0);
  const tier = getInternalTier(S.activeInternal);
  const techDef = INTERNAL_POOL.find(t=>t.id===S.activeInternal) || INTERNAL_POOL[0];
  const layer = techDef.layers[tier]; // 練到第幾層，就直接用那一層自己的數值——不是套公式算出來的
  const p = {};
  ["臂力","身法","內息","罡氣","體魄"].forEach(k=> p[k] = (S.primary[k] + eq[k] + (awaken.primary[k]||0) + (layer.bonusStat[k]||0)) * rankBonus);
  S.derivedPrimary = p;
  const xiaoyaoAtkBuff = S.statusEffects.reduce((s,e)=> e.kind==="regen" ? s+(e.atkBuff||0) : s, 0);
  let atkBuff = 1 + (S.buffAtkTicks>0 ? S.buffAtk : 0) + xiaoyaoAtkBuff;
  // 明教：天魔解體，氣血過低時外功內功攻擊大幅提升（赤火功練成後門檻提高，更容易進入爆發狀態）
  const tianmoThreshold = techDef.id==="chihuo" ? techDef.specialValue.hpThreshold : 0.5;
  if(S.sectKey==="mingjiao" && S.hpMax>0 && S.hp/S.hpMax < tianmoThreshold) atkBuff *= 1.35;
  const asec = awaken.secondary;
  S.secondary = {
    近身威力: p.臂力*atkBuff + (asec.近身威力||0), 遠程威力: p.身法*atkBuff + (asec.遠程威力||0),
    內功威力: p.內息*techDef.powerMult*atkBuff + (asec.內功威力||0),
    外功命中: p.身法 + (asec.外功命中||0), 內功命中: p.罡氣 + (asec.內功命中||0),
    外功暴擊: p.臂力*0.5 + (asec.外功暴擊||0), 內功暴擊: p.罡氣*0.5 + (techDef.id==="qizhuang"?techDef.specialValue.critBonus:0) + (asec.內功暴擊||0),
    閃避值: (p.身法*0.6)*(techDef.id==="xuanyuan"?techDef.specialValue.dodgeMult:1) + (asec.閃避值||0),
    封勁: p.體魄*0.5 + (asec.封勁||0), 招架耐力上限: p.體魄*21,
    外功防禦: p.體魄*0.8+p.臂力*0.2 + (S.sectKey==="shaolin"?S.shaolinBlockStack*3:0) + (asec.外功防禦||0)
      + p.體魄*0.8*getStatusBonus(S.statusEffects,"buff","外功防禦"),
    內功防禦: p.罡氣*0.2*techDef.defMult + (asec.內功防禦||0)
      + p.罡氣*0.2*techDef.defMult*getStatusBonus(S.statusEffects,"buff","內功防禦"),
    破防: asec.破防||0,
  };
  S.hpMax = Math.round(p.臂力*2 + p.體魄*7*techDef.hpMult + (layer.hpBonus||0));
  S.mpMax = Math.round(p.內息*4*techDef.mpMult + p.罡氣*1 + (layer.mpBonus||0));
  if(fullRestore){ S.hp=S.hpMax; S.mp=S.mpMax; } else { S.hp=Math.min(S.hp,S.hpMax); S.mp=Math.min(S.mp,S.mpMax); }
  S.titlePoints = computeTitlePoints();
  S.title = titleForPoints(S.titlePoints).name;
}
// 五大主屬性懸浮提示用：算出某一項主屬性目前實際換算成了哪些二級戰鬥屬性、各多少點。
// 公式跟 recalc() 裡 S.secondary 的算法要保持一致，只是拆出單一主屬性的那一項。
function primaryContributions(key){
  const p = S.derivedPrimary;
  const tier = getInternalTier(S.activeInternal);
  const techDef = INTERNAL_POOL.find(t=>t.id===S.activeInternal) || INTERNAL_POOL[0];
  const xiaoyaoAtkBuff = S.statusEffects.reduce((s,e)=> e.kind==="regen" ? s+(e.atkBuff||0) : s, 0);
  let atkBuff = 1 + (S.buffAtkTicks>0 ? S.buffAtk : 0) + xiaoyaoAtkBuff;
  const tianmoThreshold = techDef.id==="chihuo" ? techDef.specialValue.hpThreshold : 0.5;
  if(S.sectKey==="mingjiao" && S.hpMax>0 && S.hp/S.hpMax < tianmoThreshold) atkBuff *= 1.35;
  if(key==="臂力") return [
    {stat:"近身威力", val:p.臂力*atkBuff},
    {stat:"外功暴擊", val:p.臂力*0.5},
    {stat:"外功防禦", val:p.臂力*0.2},
    {stat:"氣血上限", val:p.臂力*2},
  ];
  if(key==="身法") return [
    {stat:"遠程威力", val:p.身法*atkBuff},
    {stat:"外功命中", val:p.身法},
    {stat:"閃避值", val:p.身法*0.6*(techDef.id==="xuanyuan"?techDef.specialValue.dodgeMult:1)},
  ];
  if(key==="內息") return [
    {stat:"內功威力", val:p.內息*techDef.powerMult*atkBuff},
    {stat:"內力上限", val:p.內息*4*techDef.mpMult},
  ];
  if(key==="罡氣") return [
    {stat:"內功命中", val:p.罡氣},
    {stat:"內功暴擊", val:p.罡氣*0.5},
    {stat:"內功防禦", val:p.罡氣*0.2*techDef.defMult},
    {stat:"內力上限", val:p.罡氣*1},
  ];
  if(key==="體魄") return [
    {stat:"外功防禦", val:p.體魄*0.8},
    {stat:"封勁", val:p.體魄*0.5},
    {stat:"招架耐力上限", val:p.體魄*21},
    {stat:"氣血上限", val:p.體魄*7*techDef.hpMult},
  ];
  return [];
}
function affinityMultiplier(a,m){ if(a==="太極") return 1.16; if(a===m) return 1.20; if(m==="太極") return 1.16; return 1.0; }

function spawnMonster(avoidBoss){
  const zone = HUNTING_ZONES.find(z=>z.id===S.location) || HUNTING_ZONES[0];
  const isBoss = !avoidBoss && S.killCount>0 && S.killCount%10===0;
  const bossDef = BOSS_ROSTER[zone.id];
  if(isBoss && S.combatOptions && S.combatOptions.fleeBoss){
    addLog(`遇上首領「${bossDef.name}」，依設定自動逃跑，繼續尋找下一場戰鬥。`, 'system');
    spawnMonster(true);
    return;
  }
  const roster = MONSTER_ROSTER[zone.id] || [];
  const def = isBoss ? bossDef : roster[Math.floor(Math.random()*roster.length)];
  S.monster = { name: isBoss?`【首領】${def.name}`:def.name, level:def.level, zone:zone.id,
    hpMax: def.hpMax, hp:0,
    atk: def.atk, def: def.def, isBoss };
  S.monster.hp = S.monster.hpMax;
  S.monster.poisonStacks = 0;
  S.monster.bleedStacks = 0;
  S.monster.stunned = false;
  S.monster.staggerTicks = 0;
  S.monster.defReduceTicks = 0;
  S.monster.statusEffects = [];
}

// 武當專用：S.monsters 是陣列（1~5隻，前排到後排），現階段一般狩獵區固定 1 隻，
// count 參數留給日後的多人副本用。跟 S.monster（單一物件，其他門派用）完全分開，互不影響。
function spawnMonstersWudang(count, avoidBoss){
  const n = count || 1;
  const zone = HUNTING_ZONES.find(z=>z.id===S.location) || HUNTING_ZONES[0];
  const isBoss = !avoidBoss && S.killCount>0 && S.killCount%10===0;
  const bossDef = BOSS_ROSTER[zone.id];
  if(isBoss && S.combatOptions && S.combatOptions.fleeBoss){
    addLog(`遇上首領「${bossDef.name}」，依設定自動逃跑，繼續尋找下一場戰鬥。`, 'system');
    spawnMonstersWudang(count, true);
    return;
  }
  const roster = MONSTER_ROSTER[zone.id] || [];
  S.monsters = [];
  for(let i=0;i<n;i++){
    const useBoss = isBoss && i===0;
    const def = useBoss ? bossDef : roster[Math.floor(Math.random()*roster.length)];
    S.monsters.push({
      name: useBoss?`【首領】${def.name}`:def.name, level:def.level, zone:zone.id,
      hpMax:def.hpMax, hp:def.hpMax, atk:def.atk, def:def.def, isBoss:useBoss, row:i,
      stunned:false, staggerTicks:0, defReduceTicks:0, statusEffects:[], stance:"實招",
    });
  }
}
