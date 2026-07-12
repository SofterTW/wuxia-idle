function equippedMoveList(){ return S.martialSlots.filter(id=>id && S.knownMartial[id]); }

function regenMultFor(activeTech, kind){
  // 兩儀護心功：內力低於門檻時加速回復；逍遙訣：氣血回復加速；雙修訣：氣血內力都加速
  if(activeTech.id==="liangyi" && kind==="mp" && S.mpMax && S.mp/S.mpMax < activeTech.specialValue.mpThreshold) return activeTech.specialValue.regenMult;
  if(activeTech.id==="xiaoyao" && kind==="hp") return activeTech.specialValue.regenMult;
  if(activeTech.id==="shuangxiu") return activeTech.specialValue.regenMult;
  return 1;
}

function combatTick(){
  const activeTech = INTERNAL_POOL.find(t=>t.id===S.activeInternal);
  if(S.location==="jinling" || S.visitingSect){
    // 拜訪門派中視同在城裡休整，不會有戰鬥發生（一個人不能同時在門派裡又在外地打鬥）。
    recalc(false);
    if(S.warningCooldown>0) S.warningCooldown--;
    S.hp = Math.min(S.hpMax, S.hp + Math.max(1, Math.round(S.derivedPrimary.體魄*0.5*regenMultFor(activeTech,"hp"))));
    S.mp = Math.min(S.mpMax, S.mp + Math.max(1, Math.round(S.derivedPrimary.罡氣*0.3*regenMultFor(activeTech,"mp")))+1);
    S.floatPlayer=""; S.floatEnemy=""; S.stageEffects=[];
    checkAutoHeal();
    return;
  }
  if(!S.monster) spawnMonster();
  recalc(false);
  if(S.buffAtkTicks>0) S.buffAtkTicks--;
  if(S.respecCooldown>0) S.respecCooldown--;
  if(S.warningCooldown>0) S.warningCooldown--;
  tickStatusEffects(S.statusEffects);
  tickStatusEffects(S.monster.statusEffects);
  S.hp = Math.min(S.hpMax, S.hp + Math.max(1, Math.round(S.derivedPrimary.體魄*0.3*regenMultFor(activeTech,"hp"))));
  S.mp = Math.min(S.mpMax, S.mp + Math.max(1, Math.round(S.derivedPrimary.罡氣*0.2*(S.sectKey==="emei"?1.6:1)*regenMultFor(activeTech,"mp")))+1);
  const xiaoyaoRegen = S.statusEffects.reduce((s,e)=> e.kind==="regen" && e.stat==="mp" ? s+e.value : s, 0);
  if(xiaoyaoRegen>0) S.mp = Math.min(S.mpMax, S.mp+xiaoyaoRegen);
  checkAutoHeal();
  const moves = equippedMoveList();
  const activeAff = activeTech.affinity;
  S.floatPlayer = ""; S.floatEnemy = ""; S.hitEnemy=false; S.hitEnemyCrit=false; S.hitPlayer=false;
  S.stageEffects = [];
  S.triggerFlash = {}; // 側欄「目前狀態效果」清單用：這個 tick 哪些擁有的特效真的觸發了，觸發就閃一下
  const wasLowHp = S.hpMax && (S.hp/S.hpMax < (activeTech.id==="chihuo" ? activeTech.specialValue.hpThreshold : 0.5));

  if(moves.length>0){
    const moveId = moves[S.tick % moves.length];
    const moveDef = Object.values(MARTIAL_POOL).flat().find(m=>m.id===moveId);
    const known = S.knownMartial[moveId];
    const layerMult = 1 + (known.layer-1)*0.08 + (known.layer>=9?0.07:0);
    const aff = affinityMultiplier(activeAff, moveDef.affinity);
    // 北冥神功：內功招式的內力消耗降低
    const mpCost = Math.max(1, Math.round(5 * (activeTech.id==="beiming" ? activeTech.specialValue.mpCostMult : 1)));
    const monsterDefDebuff = S.monster.statusEffects.reduce((s,e)=> e.debuffStat==="外功防禦" ? s+e.debuffValue : s, 0);
    let effDef = Math.max(0, S.monster.def * (S.monster.defReduceTicks>0 ? 0.7 : 1) * (1-monsterDefDebuff) - S.secondary.破防);
    let dmg, isCrit;
    if(moveDef.dmgType==="內功"){
      if(S.mp<mpCost){ dmg = Math.max(1, S.secondary.近身威力*0.5); }
      else { S.mp -= mpCost; dmg = S.secondary.內功威力*layerMult*aff - effDef*0.5; }
      isCrit = Math.random()*100 < S.secondary.內功暴擊;
    } else {
      const power = S.sect.weaponType==="暗器" ? S.secondary.遠程威力 : S.secondary.近身威力;
      dmg = power*layerMult*aff - effDef;
      isCrit = Math.random()*100 < S.secondary.外功暴擊;
    }
    S.lastUsedMoveId = moveId;
    // 丐幫：降龍霸體，擊殺連擊達門檻時下一擊威力大增
    let comboTag = "";
    if(S.sectKey==="gaibang" && S.gaibangComboReady){
      dmg *= 1.6; S.gaibangComboReady=false; comboTag="（降龍霸體！）";
      S.stageEffects.push("降龍霸體・強化一擊！");
      S.triggerFlash.sectPassive = true;
    }
    dmg = Math.max(1, Math.round(dmg*(isCrit?1.5:1)));
    S.monster.hp -= dmg;
    S.floatEnemy = `-${dmg}${isCrit?"（爆擊）":""}${comboTag}`;
    S.hitEnemy = true; S.hitEnemyCrit = isCrit;
    addLog(`你以「${moveDef.name}」擊中${S.monster.name}，造成 ${dmg} 傷害${isCrit?"（爆擊！）":""}${comboTag}`, 'attack');
    // 君子堂：通慧功，招式熟練度獲取加快
    if(known.layer < 9) known.proficiency += (activeTech.id==="tonghui" ? activeTech.specialValue.proficiencyMult : 1);

    // 武當：以柔克剛，剛才閃避成功則本次追加內功一擊
    if(S.sectKey==="wudang" && S.wudangProc){
      const bonusDmg = Math.max(1, Math.round(S.secondary.內功威力*0.6 - S.monster.def*0.5));
      S.monster.hp -= bonusDmg;
      addLog(`以柔克剛：順勢內功追擊，追加 ${bonusDmg} 傷害`, 'skill');
      S.wudangProc = false;
      S.stageEffects.push("以柔克剛！");
      S.triggerFlash.sectPassive = true;
    }
    // 唐門：淬毒，普攻附加中毒疊層（七絕經練成後額外多疊一層）
    if(S.sectKey==="tangmen" && S.monster.hp>0){
      const before = S.monster.poisonStacks||0;
      const qijueBonus = activeTech.id==="qijue" ? activeTech.specialValue.extraPoisonStack : 0;
      const gain = 1 + qijueBonus;
      S.monster.poisonStacks = Math.min(5, before+gain);
      if(S.monster.poisonStacks>before){
        S.stageEffects.push(`淬毒！（${S.monster.poisonStacks}層）`);
        S.triggerFlash.sectPassive = true;
        if(qijueBonus>0) S.triggerFlash.internalSpecial = true;
      }
    }
    // 明教：天魔解體，跨過門檻時觸發提示（僅在剛進入低血狀態當下顯示一次；赤火功會提高門檻）
    const tianmoThreshold = activeTech.id==="chihuo" ? activeTech.specialValue.hpThreshold : 0.5;
    if(S.sectKey==="mingjiao" && !wasLowHp && S.hpMax && S.hp/S.hpMax<tianmoThreshold){
      S.stageEffects.push("天魔解體！");
      S.triggerFlash.sectPassive = true;
    }
    // 一內特效：攻擊觸發（七絕經／赤火功，對怪物附加持續傷害＋減益）
    if(S.monster.hp>0){
      // getInternalTier() 回傳的是 layers[] 陣列索引（0-indexed，0=層1），INTERNAL_EFFECT_TABLE
      // 的區塊邊界是照 desc 文字的「第N層」寫的（1-indexed），這裡要 +1 轉換。
      const attackTier = getInternalTier(activeTech.id)+1;
      const invAtkEff = rollInternalTrigger(activeTech, attackTier, 'onAttack');
      if(invAtkEff){
        applyMonsterStatusEffect(invAtkEff);
        S.stageEffects.push(`${activeTech.name}・${invAtkEff.element==="陰"?"中毒":"灼傷"}！`);
        S.triggerFlash.internalLayer = true;
      }
    }
    // 武學層數 3 以上的附加效果，機率觸發
    if(known.layer>=3 && S.monster.hp>0 && Math.random()<0.3){
      const special = moveDef.special;
      let fired = true;
      if(special==="暈眩"){ S.monster.stunned=true; S.stageEffects.push(`${moveDef.name}・暈眩！`); }
      else if(special==="流血"){ S.monster.bleedStacks=Math.min(5,(S.monster.bleedStacks||0)+1); S.stageEffects.push(`${moveDef.name}・流血！`); }
      else if(special==="擊退"){ S.monster.staggerTicks=3; S.stageEffects.push(`${moveDef.name}・擊退！`); }
      else if(special==="降低對方防禦"){ S.monster.defReduceTicks=3; S.stageEffects.push(`${moveDef.name}・破防！`); }
      else if(special==="中毒疊層"){
        // 唐門淬毒被動已經會把中毒層數疊到 5 層上限，招式本身的「中毒疊層」效果
        // 改為突破上限再疊 2 層（最高 8 層），這樣練出來才會跟被動有實際差異。
        S.monster.poisonStacks=Math.min(8,(S.monster.poisonStacks||0)+2);
        S.stageEffects.push(`${moveDef.name}・劇毒！`);
      } else { fired = false; }
      if(fired) S.triggerFlash[`martial_${moveId}`] = true;
    }
  }

  // 持續傷害結算：中毒／流血
  if(S.monster && S.monster.hp>0 && S.monster.poisonStacks>0){
    const poisonDmg = S.monster.poisonStacks*4;
    S.monster.hp -= poisonDmg;
    addLog(`${S.monster.name} 中毒發作，持續受到 ${poisonDmg} 傷害（${S.monster.poisonStacks} 層）`, 'dot');
  }
  if(S.monster && S.monster.hp>0 && S.monster.bleedStacks>0){
    const bleedDmg = S.monster.bleedStacks*3;
    S.monster.hp -= bleedDmg;
    addLog(`${S.monster.name} 傷口崩裂，流血造成 ${bleedDmg} 傷害（${S.monster.bleedStacks} 層）`, 'dot');
  }
  if(S.monster && S.monster.hp>0){
    S.monster.statusEffects.forEach(e=>{
      if(e.kind!=="dot_debuff") return;
      S.monster.hp -= e.dmgPerTick;
      addLog(`${S.monster.name} 受到「${activeTech.name}」持續${e.element}傷害 ${e.dmgPerTick}`, 'dot');
      if(e.selfMpRestoreOnTick) S.mp = Math.min(S.mpMax, S.mp+e.dmgPerTick);
    });
  }

  if(S.monster.hp > 0){
    if(S.sectKey==="gaibang" && S.gaibangInvuln){
      S.gaibangInvuln = false;
      S.floatPlayer = "攻擊被無敵化解";
      addLog(`降龍霸體護體，${S.monster.name} 的攻擊被完全化解`, 'skill');
      S.stageEffects.push("降龍霸體・無敵化解！");
      S.triggerFlash.sectPassive = true;
    } else if(S.monster.stunned){
      S.monster.stunned = false;
      S.floatEnemy = "被擊暈，無法行動";
      addLog(`${S.monster.name} 被擊暈，無法行動`, 'skill');
    } else {
      const monsterHitDebuff = S.monster.statusEffects.reduce((s,e)=> e.debuffStat==="命中" ? s+e.debuffValue : s, 0);
      const dodge = Math.random()*100 < Math.min(50+monsterHitDebuff*100, S.secondary.閃避值*0.4+monsterHitDebuff*100);
      if(dodge){
        S.floatPlayer = "身法閃避！";
        addLog(`${S.monster.name} 攻來，你身法一閃避開了`, 'dodge');
        if(S.sectKey==="wudang") S.wudangProc = true;
        if(S.sectKey==="shaolin") S.shaolinBlockStack = 0;
      } else if(activeTech.id==="chanding" && Math.random()<activeTech.specialValue.chance){
        // 禪定功：受擊時有機率入定，直接免疫該次傷害
        S.floatPlayer = "禪定・免疫！";
        addLog(`${S.monster.name} 攻來，你禪定入靜，這一擊渾然不覺`, 'skill');
        S.stageEffects.push("禪定功・入定！");
        S.triggerFlash.internalSpecial = true;
      } else {
        let atkMult = S.monster.staggerTicks>0 ? 0.5 : 1;
        const mitigateFlat = S.statusEffects.reduce((s,e)=> e.kind==="buff" ? s+(e.mitigateFlat||0) : s, 0);
        let mdmg = Math.max(1, Math.round(S.monster.atk*atkMult - S.secondary.外功防禦*0.3 - mitigateFlat));
        // 太極玄功：受擊時有機率格擋，格擋傷害降低
        if(activeTech.id==="taiji_qi" && Math.random()<activeTech.specialValue.chance){
          mdmg = Math.max(1, Math.round(mdmg*(1-activeTech.specialValue.dmgReduce)));
          S.stageEffects.push("太極玄功・格擋！");
          S.triggerFlash.internalSpecial = true;
        }
        // 九陽神功：氣血過低時受到的傷害降低
        if(activeTech.id==="jiuyang" && S.hpMax && S.hp/S.hpMax < activeTech.specialValue.hpThreshold){
          mdmg = Math.max(1, Math.round(mdmg*(1-activeTech.specialValue.dmgReduce)));
          S.stageEffects.push("九陽神功・氣血翻湧！");
        }
        // 一內特效：受擊觸發（禪定功／氣樁功防禦增益、兩儀護心功護盾、逍遙訣內力持續回復）
        const hitTier = getInternalTier(activeTech.id)+1; // layers[] 索引轉成 1-indexed 層數
        const invHitEff = rollInternalTrigger(activeTech, hitTier, 'onHit');
        if(invHitEff){
          if(invHitEff.kind==="shield"){
            const absorb = invHitEff.absorbFlat!=null ? invHitEff.absorbFlat : Math.round(S.hpMax*invHitEff.absorbPct);
            const absorbed = Math.min(mdmg, absorb);
            mdmg = Math.max(0, mdmg-absorbed);
            const mpRestore = Math.round(S.mpMax*invHitEff.breakRestorePct);
            S.mp = Math.min(S.mpMax, S.mp+mpRestore);
            S.stageEffects.push(`${activeTech.name}・真氣護體（吸收${absorbed}）！`);
            addLog(`真氣護體吸收了 ${absorbed} 點傷害，碎盾回復 ${mpRestore} 點內力`, 'skill');
          } else {
            applyPlayerStatusEffect(invHitEff, activeTech);
            S.stageEffects.push(`${activeTech.name}・${invHitEff.kind==="regen"?"逍遙":invHitEff.stat+"提升"}！`);
          }
          S.triggerFlash.internalLayer = true;
        }
        S.hp -= mdmg;
        S.floatPlayer = mdmg>0 ? `-${mdmg}` : "真氣護體化解！";
        S.hitPlayer = mdmg>0;
        addLog(`${S.monster.name} 反擊，你受到 ${mdmg} 傷害`, 'enemy');
        if(S.sectKey==="shaolin"){
          S.shaolinBlockStack = Math.min(5, S.shaolinBlockStack+1);
          if(S.shaolinBlockStack===1 || S.shaolinBlockStack===5) S.stageEffects.push(`金剛護體（${S.shaolinBlockStack}層）！`);
          S.triggerFlash.sectPassive = true;
        }
      }
    }
  }
  if(S.monster.staggerTicks>0) S.monster.staggerTicks--;
  if(S.monster.defReduceTicks>0) S.monster.defReduceTicks--;

  if(S.monster.hp <= 0) onKill();
  if(S.hp <= 0){
    addLog(`你身受重傷，昏死過去……同門將你送回金凌城療傷。`, 'warn');
    S.location = "jinling";
    S.monster = null;
    S.hp = Math.max(1, Math.round(S.hpMax*0.3));
    S.floatPlayer=""; S.floatEnemy=""; S.stageEffects=[];
  }
  S.tick++;
}


function onKill(){
  const lvl = S.monster.level;
  const qiGain = 8+lvl*3, goldGain = 4+lvl*2;
  S.qiPool += qiGain; S.gold += goldGain;
  addLog(`擊殺了 ${S.monster.name}！獲得內功修為 +${qiGain}、錢財 +${formatMoney(goldGain)}`, 'loot');
  if(Math.random()<0.55) S.materials.淬鍊石 += 1+Math.floor(Math.random()*2);
  if(Math.random()<0.04){ S.materials.洗髓丹 += 1; addLog(`意外獲得「洗髓丹」x1`, 'loot'); }
  if(Math.random()<0.18){ const n=1+Math.floor(Math.random()*2); S.materials.精鐵砂 += n; addLog(`獲得「精鐵砂」x${n}`, 'loot'); }
  if(Math.random() < (S.monster.isBoss?0.4:0.03)){ S.materials.美玉錠 += 1; addLog(`獲得珍稀的「美玉錠」x1`, 'loot'); }

  // 丐幫：降龍霸體，擊殺數累積到門檻，觸發大招且短暫無敵
  if(S.sectKey==="gaibang"){
    S.gaibangComboKills++;
    if(S.gaibangComboKills>=5){
      S.gaibangComboKills = 0;
      S.gaibangComboReady = true;
      S.gaibangInvuln = true;
      addLog(`降龍霸體！連擊蓄勢已滿，下一擊威力大增，並可無敵化解一次攻擊`, 'skill');
      S.triggerFlash.sectPassive = true;
    }
  }

  // 任務進度判定：知客委託剿滅魔教
  if(S.quest && S.quest.zoneId===S.location && S.quest.killsDone<S.quest.killsNeeded){
    S.quest.killsDone++;
    addLog(`任務進度：${S.quest.killsDone} / ${S.quest.killsNeeded}`, 'system');
  }

  // 武學秘笈掉落（改成放入背包，需自行使用）
  if(Math.random() < (S.monster.isBoss?0.5:0.06)){
    const pool = MARTIAL_POOL[S.sect.weaponType].filter(m=>!S.knownMartial[m.id]);
    const source = pool.length>0 ? pool : Object.values(MARTIAL_POOL).flat().filter(m=>S.knownMartial[m.id]);
    if(source.length>0){
      const m = source[Math.floor(Math.random()*source.length)];
      S.inventory.push({kind:"manual", manualType:"martial", targetId:m.id, name:`武學秘笈：${m.name}`, uid:allocUid()});
      addLog(`擊殺掉落「武學秘笈：${m.name}」，回背包查看`, 'loot');
    }
  }
  // 內功秘笈掉落（改成放入背包）
  if(Math.random() < (S.monster.isBoss?0.35:0.02)){
    const pool = INTERNAL_POOL.filter(t=>!S.knownInternal[t.id] && (!t.sect||t.sect===S.sectKey));
    const source = pool.length>0 ? pool : INTERNAL_POOL.filter(t=>S.knownInternal[t.id]);
    if(source.length>0){
      const t = source[Math.floor(Math.random()*source.length)];
      S.inventory.push({kind:"manual", manualType:"internal", targetId:t.id, name:`內功秘笈：${t.name}`, uid:allocUid()});
      addLog(`擊殺掉落「內功秘笈：${t.name}」，回背包查看`, 'loot');
    }
  }
  // 藥品掉落
  if(Math.random() < 0.20){
    const c = CONSUMABLES[Math.floor(Math.random()*(CONSUMABLES.length-1))]; // 大還丹不從一般掉落取得
    addConsumable(c.id, 1);
    addLog(`獲得藥品掉落：${c.name}`, 'loot');
  }
  // 門派至寶目前預設無法從戰鬥取得，供奉於各門派大殿（見圖鑑／門派拜訪頁），留給日後開放的玩法。
  // 裝備掉落
  if(Math.random() < 0.12){
    const slot = SLOT_LIST[Math.floor(Math.random()*SLOT_LIST.length)];
    const zone = HUNTING_ZONES.find(z=>z.id===S.monster.zone);
    const item = generateEquipment(slot, zone?zone.levelMod:0);
    S.inventory.push(item);
    const tierInfo = TIER_LIST.find(t=>t.key===item.tierKey);
    const gradeTxt = item.tierKey==="jade" ? `${["","一","二","三","四","五","六","七"][item.jadeGrade]}品` : tierInfo.name;
    addLog(`獲得裝備掉落：${item.name}（${gradeTxt}）`, 'loot');
  }
  S.killCount++; spawnMonster();
}
