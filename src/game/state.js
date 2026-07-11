let S = null;

function newGame(sectKey){
  const sect = SECTS[sectKey];
  const equipment = {};
  SLOT_LIST.forEach(slot=>{
    const lean = SLOT_LEAN[slot][0];
    const bonus = slot==="兵刃" ? 8 : (slot.startsWith("戒指") ? 0 : 3);
    equipment[slot] = {name:`初階${slot}`, bonus:{[lean]:bonus}, slot, kind:"equipment", tierKey:"wood", jadeGrade:null, awakened:[], locked:false};
  });
  const knownMartial = {};
  const starter = MARTIAL_POOL[sect.weaponType].filter(m=>!m.need);
  starter.forEach(m=> knownMartial[m.id] = {proficiency:0, layer:1});
  const starterInternalId = STARTER_INTERNAL_ID[sectKey] || "tuna";
  const knownInternal = {[starterInternalId]:{invested:0}};
  S = {
    sectKey, sect, primary:{...sect.base}, equipment, inventory:[],
    knownInternal, activeInternal:starterInternalId,
    knownMartial, martialSlots:[starter[0]?.id||null, starter[1]?.id||null, null, null],
    qiPool:0, gold:20, materials:{淬鍊石:0, 洗髓丹:0, 精鐵砂:0, 美玉錠:0}, respecCooldown:0,
    profession:{level:1, exp:0}, forgeTarget:null,
    buffAtk:0, buffAtkTicks:0,
    autoHeal:{hpPct:30, hpItem:"", mpPct:30, mpItem:"", hpAutoBuy:false, mpAutoBuy:false},
    combatOptions:{fleeBoss:false},
    sectContribution:0, sectRank:0, quest:null, warningModal:null, warningCooldown:0,
    shaolinBlockStack:0, wudangProc:false, gaibangComboKills:0, gaibangComboReady:false, gaibangInvuln:false, tangmenPoison:0,
    statusEffects:[], triggerFlash:{},
    hp:1, hpMax:1, mp:1, mpMax:1,
    monster:null, killCount:0,
    log:[], tab:"overview", tick:0, floatPlayer:"", floatEnemy:"",
    equipSubTab:"gear", pickerSlot:null, pickerSnapshot:[], codexSubTab:"guide", bagFilter:"all",
    codexInternalSect:null, codexInternalSkillId:null, changelogPage:0, monsterInfoOpen:false,
    mapSubTab:"zones", huntingZone:"heifeng", location:"heifeng", visitingSect:null, dialogueNpc:null,
    internalExpanded:{}, martialExpanded:{}, sideExpanded:{primary:true, buffs:true, autoheal:true}, logFilters:{}, navCollapsed:false,
    navHintSeen:false,
    hitEnemy:false, hitEnemyCrit:false, hitPlayer:false, lastUsedMoveId:null, stageEffects:[],
  };
  spawnMonster(); recalc(true); render(); saveGame();
}
