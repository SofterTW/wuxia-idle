function equippedMoveList(){ return S.martialSlots.filter(id=>id && S.knownMartial[id]); }

function regenMultFor(activeTech, kind){
  // 兩儀護心功：內力低於門檻時加速回復；逍遙訣：氣血回復加速；雙修訣：氣血內力都加速
  if(activeTech.id==="liangyi" && kind==="mp" && S.mpMax && S.mp/S.mpMax < activeTech.specialValue.mpThreshold) return activeTech.specialValue.regenMult;
  if(activeTech.id==="xiaoyao" && kind==="hp") return activeTech.specialValue.regenMult;
  if(activeTech.id==="shuangxiu") return activeTech.specialValue.regenMult;
  return 1;
}

function combatTick(){
  if(S.sectKey==="wudang"){ combatTickWudang(); return; }
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

// ============================================================================
// 武當專用：實/虛/架/氣/怒 五招制戰鬥引擎，取代武當的舊版招式系統（其他門派完全不受影響，
// combatTick() 一開頭就分流出去）。核心邏輯：
//   1) 怪物每個 tick 用權重機率骰出這次的「招式類型」（stance）——一般小怪偏愛硬拼實招，
//      首領比較會擋、偶爾騙招。
//   2) 玩家（自動）依「見招拆招」的邏輯反應：對方架招就用虛招破防、對方虛招（露出破綻）就
//      用實招痛打、對方實招就用架招擋下；有怒氣就優先開大；平常穿插氣招維持狀態。
//   3) 剪刀石頭布：實破虛（等於白打，這裡簡化成正常出招，因為沒有「對方施法中被打斷」的
//      機制—怪物沒有施法前搖）、虛破架（破防+強力減益）、架擋實（大減傷+觸發被動）。
// ============================================================================

const WUDANG_DMG_TIER_MULT = {"低":0.7, "中":1.0, "高":1.4};
function wudangDmgTierMult(tier){ return WUDANG_DMG_TIER_MULT[tier] || 0; }

// 招式類型／觸發分類的配色，「對決」下方的訊息橫幅跟武學分頁的招式標籤共用這組色票。
const WUDANG_TYPE_COLOR = {"實招":"#d1564c","虛招":"#e2685c","架招":"#4dd0c8","氣招":"#7ec9a2","怒氣大招":"#f3a03c"};
const WUDANG_CATEGORY_COLOR = {
  "實招命中":"#d1564c", "實招被擋":"#8a7d63", "虛招破防":"#e2685c", "虛招命中":"#e2685c",
  "架招成功":"#4dd0c8", "架招加成":"#4dd0c8", "架招落空":"#8a7d63",
  "氣招發動":"#7ec9a2", "怒氣大招":"#f3a03c", "持續傷害":"#c084fc", "招式落空":"#8a7d63",
  "換招冷卻":"#8a7d63",
};
// 組出「對決」下方訊息橫幅的 HTML：套路名稱／招式名稱／分類標籤各自上色，一眼就看得出來源跟結果。
function wudangBannerHtml(move, msg, category){
  const typeColor = WUDANG_TYPE_COLOR[move.type] || 'var(--gold-lt)';
  const catColor = WUDANG_CATEGORY_COLOR[category] || 'var(--dim-text)';
  const setName = move.movesetName ? `<span style="color:var(--gold-lt);">${move.movesetName}</span>・` : '';
  const body = msg ? `・${msg}` : '';
  return `${setName}<span style="color:${typeColor}; font-weight:700;">${move.name}</span>${body}<span style="color:${catColor}; margin-left:5px;">〔${category}〕</span>`;
}

function wudangMonsterStance(m){
  const w = m.isBoss ? {實招:0.55,架招:0.30,虛招:0.15} : {實招:0.75,架招:0.20,虛招:0.05};
  const r = Math.random();
  if(r < w.實招) return "實招";
  if(r < w.實招+w.架招) return "架招";
  return "虛招";
}

function wudangMoveStatValue(move){
  const p = S.derivedPrimary;
  const a = move.statA ? (p[move.statA]||0) : 0;
  const b = move.statB ? (p[move.statB]||0) : 0;
  return a + b*0.5;
}

function wudangBuffActive(name){ return S.statusEffects.some(e=>e.wudangName===name); }
function wudangBuffStacks(name){ const e = S.statusEffects.find(e=>e.wudangName===name); return e ? (e.stacks||0) : 0; }
function wudangMonsterMarkStacks(m, name){ const e = m.statusEffects.find(e=>e.wudangMark===name); return e ? (e.stacks||0) : 0; }

function firstAliveMonster(){ return (S.monsters||[]).find(m=>m.hp>0) || null; }

function wudangMoveOffCd(move){
  const st = S.wudangMoveState[move.id];
  return !st || (st.cdRemaining||0)<=0;
}
function wudangSetCd(move){
  if(!S.wudangMoveState[move.id]) S.wudangMoveState[move.id] = {cdRemaining:0};
  S.wudangMoveState[move.id].cdRemaining = move.cd||0;
}

function wudangEquippedIds(){
  const s = S.wudangSlots || {};
  return new Set(Object.values(s).flat().filter(Boolean));
}

// 戰鬥邏輯分頁設定的施放條件：{resource:"HP"|"MP", compare:"above"|"below", pct:1~100}。
// 沒設定條件（或 pct 空白）的招式永遠視為條件成立，不影響原本的見招拆招邏輯。
function wudangConditionMet(moveId){
  const c = S.wudangMoveConditions[moveId];
  if(!c || !c.pct) return true;
  const val = c.resource==="MP" ? (S.mpMax? S.mp/S.mpMax*100 : 0) : (S.hpMax? S.hp/S.hpMax*100 : 0);
  return c.compare==="below" ? val<c.pct : val>c.pct;
}

// 新角色／舊存檔補欄位用的預設技能欄：依 WUDANG_MOVE_LIST 原本的順序，把已解鎖套路的招式
// 依類型塞進技能欄，塞滿該類型上限（WUDANG_SLOT_CAPS）就換下一招，玩家可以之後自己在
// 「武學」分頁調整。
function defaultWudangSlots(){
  const slots = {}; WUDANG_SLOT_TYPES.forEach(t=> slots[t]=[]);
  WUDANG_MOVE_LIST.forEach(m=>{
    if(!S.wudangMovesetsUnlocked[m.moveset]) return;
    if(slots[m.type].length < WUDANG_SLOT_CAPS[m.type]) slots[m.type].push(m.id);
  });
  return slots;
}

// 見招拆招 AI：依對方目前的招式類型決定這次要用什麼招。
// 內力/怒氣不夠付的招式一律先濾掉，不會出現「選了招但打不出來、整個 tick 白白浪費」的情況——
// 架招全部不吃內力（mpCost:0），永遠會是最後的保底選項。
// 只會從技能欄有裝備的招式挑（見 renderMartialWudang），沒裝備的招式即使已經解鎖也不會自動出手。
// 換套路限制：上一招用的套路如果跟這次不同，要等換套路冷卻（wudangSwitchCd）歸零才能真的換過去；
// 同一套路內連續出招沒有這個限制。
function pickWudangMove(target){
  const equipped = wudangEquippedIds();
  let known = WUDANG_MOVE_LIST.filter(m=>
    S.wudangMovesetsUnlocked[m.moveset] && equipped.has(m.id) && wudangMoveOffCd(m) && (!m.mpCost || S.mp>=m.mpCost) && wudangConditionMet(m.id));
  if(S.wudangLastMoveset && S.wudangSwitchCd>0){
    known = known.filter(m=>m.moveset===S.wudangLastMoveset);
  }
  const byType = t=> known.filter(m=>m.type===t);
  const ult = byType("怒氣大招").find(m=> S.rage >= (m.rageCost||0));
  if(ult) return ult;
  // 氣招維護：有還沒生效的氣招時，有機率優先補上，不然「見招拆招」邏輯太強，氣招永遠排不到隊。
  const qi = byType("氣招").find(m=> !wudangBuffActive(m.name));
  if(qi && Math.random()<0.35) return qi;
  if(target){
    if(target.stance==="架招"){ const m=byType("虛招")[0]; if(m) return m; }
    if(target.stance==="虛招"){ const m=byType("實招")[0]; if(m) return m; }
    if(target.stance==="實招"){ const m=byType("架招")[0]; if(m) return m; }
  }
  if(qi) return qi;
  const atk = byType("實招")[0];
  if(atk) return atk;
  const guard = byType("架招")[0]; // 內力見底時的保底：架招不吃內力，至少能防禦
  if(guard) return guard;
  return null;
}

// 招式效果分發：把 martial-techniques.js 裡每招的 effect 物件轉成實際的戰鬥影響。
function applyWudangEffect(effect, move, target, ctx){
  if(!effect) return;
  if(effect.type==="delayEnemy"){
    S.wudangMoveState[`__monsterDelay_${target.row}`] = {cdRemaining: (S.wudangMoveState[`__monsterDelay_${target.row}`]?.cdRemaining||0) + effect.ticks};
  } else if(effect.type==="heavyStagger"){
    if(!ctx.blocked) target.staggerTicks = Math.max(target.staggerTicks, effect.ticks);
  } else if(effect.type==="selfBuff"){
    S.statusEffects.push({kind:"buff", stat:"", value:0, remainingTicks:effect.duration, wudangName:effect.name, mpOnHit:effect.mpOnHit||0});
  } else if(effect.type==="selfRegen"){
    S.statusEffects.push({kind:"regen", stat:effect.resource, value:Math.round((effect.resource==="mp"?S.mpMax:S.hpMax)*effect.pct), remainingTicks:effect.duration, wudangName:effect.name});
  } else if(effect.type==="convertResource"){
    const amt = Math.round((effect.from==="mp"?S.mp:S.hp) * effect.pct);
    if(effect.from==="mp"){ S.mp = Math.max(0, S.mp-amt); S.hp = Math.min(S.hpMax, S.hp+amt); }
    else { S.hp = Math.max(1, S.hp-amt); S.mp = Math.min(S.mpMax, S.mp+amt); }
    addLog(`「${move.name}」將 ${amt} 點${effect.from==="mp"?"內力":"氣血"}轉化為${effect.to==="hp"?"氣血":"內力"}`, 'skill');
  } else if(effect.type==="selfShield"){
    // 護盾是固定容量的血量池（不是每次都重算的百分比減傷），吸滿就沒了；convertToMp 開啟時，
    // 吸收多少 %氣血上限的傷害，就回多少 %內力上限；breakStunTicks 是碎盾當下震暈所有敵人的硬直。
    const pool = Math.round(S.hpMax*effect.absorbPct);
    S.statusEffects.push({kind:"buff", stat:"", value:0, remainingTicks:effect.duration, wudangName:move.name,
      shieldPool:pool, shieldPoolMax:pool, convertToMp:!!effect.convertToMp, breakStunTicks:effect.breakStunTicks||0});
  } else if(effect.type==="stackBuff"){
    let e = S.statusEffects.find(e=>e.wudangName===effect.name);
    if(!e){ e = {kind:"buff", stat:"", value:0, remainingTicks:effect.duration, wudangName:effect.name, stacks:0, valuePerStack:effect.statValuePerStack, maxStacks:effect.maxStacks}; S.statusEffects.push(e); }
    else { e.remainingTicks = effect.duration; }
  } else if(effect.type==="dotMark"){
    let e = target.statusEffects.find(e=>e.wudangMark===effect.name);
    if(!e){ e = {kind:"dot_debuff", element:"陰", dmgPerTick:effect.dmgPerTick, remainingTicks:effect.duration, totalDuration:effect.duration, firedCount:0, wudangMark:effect.name, stacks:1, maxStacks:effect.maxStacks}; target.statusEffects.push(e); }
    else { e.stacks = Math.min(effect.maxStacks, e.stacks+1); e.remainingTicks = effect.duration; e.totalDuration = effect.duration; e.firedCount = 0; }
  } else if(effect.type==="lockTarget"){
    target.staggerTicks = Math.max(target.staggerTicks, effect.duration);
    target.statusEffects.push({kind:"dot_debuff", element:"陰", dmgPerTick:effect.dmgPerTick, remainingTicks:effect.duration, totalDuration:effect.duration, firedCount:0, wudangMark:"如封似閉"});
  } else if(effect.type==="ultimate"){
    S.statusEffects.push({kind:"buff", stat:"", value:0, remainingTicks:effect.duration, wudangName:"霸體", immuneControl:true, immuneAll:effect.guard==="red"});
  }
}

// 虛招破防成功時套用的減益（跟一般效果分開處理，因為要掛在被破防的目標身上）。
function applyGuardBreak(effect, target){
  if(!effect) return;
  target.defReduceTicks = Math.max(target.defReduceTicks, effect.duration||8);
  target.wudangGuardBreakPct = effect.defReducePct||0.25;
  if(effect.clearShield) target.statusEffects = target.statusEffects.filter(e=>!e.shieldPool);
}

// 架招格擋成功時的加成（明鏡止水的下次必爆、方外遨遊的完全格擋等）。
function applyBlockBonus(move, target){
  if(!move.effect || move.effect.type!=="blockBonus") return;
  if(Math.random() >= move.effect.procChance) return;
  const eff = move.effect;
  if(eff.bonus==="fullBlock"){ S.wudangFullBlockNext = true; S.stageEffects.push(wudangBannerHtml(move, "下次完全化解！", "架招加成")); }
  else if(eff.bonus==="crit"){ S.wudangCritNext = true; S.stageEffects.push(wudangBannerHtml(move, "蓄勢必殺！", "架招加成")); }
  else if(eff.bonus==="stack" && eff.stackName){
    let e = S.statusEffects.find(e=>e.wudangName===eff.stackName);
    if(e){ e.stacks = Math.min(e.maxStacks||10, (e.stacks||0)+1); }
    S.stageEffects.push(wudangBannerHtml(move, "借力！", "架招加成"));
  } else if(eff.bonus==="interrupt"){ S.stageEffects.push(wudangBannerHtml(move, "借力打力！", "架招加成")); }
  S.rage = Math.min(100, S.rage+1);
}

function resolveWudangPlayerMove(move, target, activeTech){
  if(move.mpCost && S.mp<move.mpCost){
    addLog(`內力不足，「${move.name}」無法施展`, 'system');
    S.stageEffects.push(wudangBannerHtml(move, "內力不足", "招式落空"));
    return;
  }
  if(move.rageCost && S.rage<move.rageCost){ return; }
  if(move.mpCost) S.mp -= move.mpCost;
  if(move.rageCost) S.rage = Math.max(0, S.rage-move.rageCost);
  wudangSetCd(move);
  S.lastUsedMoveId = move.id;
  // 換套路限制：跟上一招不是同一套路，要重新鎖 5 回合才能再換下一次；同套路內連續出招不受影響。
  if(S.wudangLastMoveset && S.wudangLastMoveset!==move.moveset) S.wudangSwitchCd = 5;
  S.wudangLastMoveset = move.moveset;

  let mult = 1;
  if(move.effect && move.effect.type==="comboBonus"){
    if(move.effect.monsterStack){
      if(wudangMonsterMarkStacks(target, move.effect.buff)>0) mult += move.effect.mult;
    } else if(!move.effect.minStacks || wudangBuffStacks(move.effect.buff)>=move.effect.minStacks){
      if(wudangBuffActive(move.effect.buff)) mult += move.effect.mult;
    }
  }
  const base = wudangMoveStatValue(move) * wudangDmgTierMult(move.dmgTier) * mult;
  const aff = 1.16; // 武當招式一律太極屬性，固定吃這個相剋倍率

  if(move.type==="實招"){
    const blocked = target.stance==="架招";
    let dmg = Math.max(1, Math.round(base*aff - target.def*(move.dmgType==="外功"?1:0.5)));
    if(blocked) dmg = Math.max(1, Math.round(dmg*0.10));
    if(S.wudangCritNext){ dmg = Math.round(dmg*1.5); S.wudangCritNext = false; }
    target.hp -= dmg;
    S.floatEnemy = `-${dmg}${blocked?'（被格擋）':''}`;
    S.hitEnemy = true;
    addLog(`你以「${move.name}」擊中${target.name}，造成 ${dmg} 傷害${blocked?'（被格擋，大幅減傷）':''}`, 'attack');
    if(!blocked){
      applyWudangEffect(move.effect, move, target, {blocked});
      S.rage = Math.min(100, S.rage+2);
      S.stageEffects.push(wudangBannerHtml(move, `命中（-${dmg}）`, "實招命中"));
    } else {
      S.rage = Math.min(100, S.rage+1);
      S.stageEffects.push(wudangBannerHtml(move, `被${target.name}擋下`, "實招被擋"));
    }
  } else if(move.type==="虛招"){
    if(target.stance==="架招"){
      const dmg = Math.max(1, Math.round(base*aff*0.5));
      target.hp -= dmg;
      applyGuardBreak(move.effect, target);
      S.floatEnemy = `-${dmg}（破防！）`;
      S.hitEnemy = true;
      addLog(`「${move.name}」擊破${target.name}的架勢，造成 ${dmg} 傷害並使其陷入破綻`, 'skill');
      S.stageEffects.push(wudangBannerHtml(move, `破防！（-${dmg}）`, "虛招破防"));
      S.triggerFlash[`martial_${move.id}`] = true;
    } else {
      const dmg = Math.max(1, Math.round(base*aff*0.6));
      target.hp -= dmg;
      S.floatEnemy = `-${dmg}`;
      S.hitEnemy = true;
      addLog(`你以「${move.name}」擊中${target.name}，造成 ${dmg} 傷害`, 'attack');
      S.stageEffects.push(wudangBannerHtml(move, `命中（-${dmg}）`, "虛招命中"));
    }
    S.rage = Math.min(100, S.rage+2);
  } else if(move.type==="架招"){
    S.wudangGuardingThisTick = move; // 是否真的擋到，要等怪物出手才知道，見 resolveWudangMonsterAttack
  } else if(move.type==="氣招"){
    applyWudangEffect(move.effect, move, target, {});
    addLog(`你運起「${move.name}」`, 'skill');
    S.stageEffects.push(wudangBannerHtml(move, "", "氣招發動"));
    S.triggerFlash[`martial_${move.id}`] = true;
  } else if(move.type==="怒氣大招"){
    let dmg = target ? Math.max(1, Math.round(base*aff*1.6 - target.def*0.5)) : 0;
    const targets = (move.effect && move.effect.aoe) ? S.monsters.filter(m=>m.hp>0) : (target?[target]:[]);
    targets.forEach(t=>{ t.hp -= dmg; });
    applyWudangEffect(move.effect, move, target, {});
    S.floatEnemy = `-${dmg}（怒氣大招！）`;
    S.hitEnemyCrit = true; S.hitEnemy = true;
    addLog(`你施展「${move.name}」，造成 ${dmg} 傷害！`, 'attack');
    S.stageEffects.push(wudangBannerHtml(move, `怒氣爆發！（-${dmg}）`, "怒氣大招"));
    S.triggerFlash.sectPassive = true;
  }
}

function resolveWudangMonsterAttack(target, playerMove){
  const playerBlocking = playerMove && playerMove.type==="架招";
  const playerUltImmune = S.statusEffects.some(e=>e.immuneControl);
  let dmg = Math.max(1, Math.round(target.atk - S.secondary.外功防禦*0.3));
  if(playerBlocking){
    if(S.wudangFullBlockNext){
      dmg = 0; S.wudangFullBlockNext = false;
      addLog(`「${playerMove.name}」完全化解了${target.name}的攻擊`, 'skill');
      S.stageEffects.push(wudangBannerHtml(playerMove, "完全化解！", "架招成功"));
    } else {
      dmg = Math.max(0, Math.round(dmg*0.10));
      S.stageEffects.push(wudangBannerHtml(playerMove, "格擋成功", "架招成功"));
    }
    applyBlockBonus(playerMove, target);
    S.rage = Math.min(100, S.rage+4);
  } else {
    S.rage = Math.min(100, S.rage+5);
  }
  const shieldBuff = S.statusEffects.find(e=>e.shieldPool>0 && e.remainingTicks>0);
  if(shieldBuff && dmg>0){
    const absorb = Math.min(dmg, shieldBuff.shieldPool);
    dmg = Math.max(0, dmg-absorb);
    shieldBuff.shieldPool -= absorb;
    if(shieldBuff.convertToMp && absorb>0){
      const mpRestore = Math.round(S.mpMax * (absorb/S.hpMax));
      S.mp = Math.min(S.mpMax, S.mp+mpRestore);
      addLog(`「${shieldBuff.wudangName}」吸收 ${absorb} 點傷害，轉化為 ${mpRestore} 點內力`, 'skill');
    }
    if(shieldBuff.shieldPool<=0){
      S.statusEffects = S.statusEffects.filter(e=>e!==shieldBuff);
      if(shieldBuff.breakStunTicks>0){
        S.monsters.forEach(m=>{ if(m.hp>0) m.staggerTicks = Math.max(m.staggerTicks, shieldBuff.breakStunTicks); });
        addLog(`「${shieldBuff.wudangName}」碎盾！震暈了周圍的敵人`, 'skill');
        S.stageEffects.push(`<span style="color:#4dd0c8; font-weight:700;">${shieldBuff.wudangName}</span>・碎盾震暈！<span style="color:#4dd0c8; margin-left:5px;">〔氣招發動〕</span>`);
      }
    }
  }
  if(dmg>0){
    S.hp -= dmg;
    S.floatPlayer = `-${dmg}`;
    S.hitPlayer = true;
    addLog(`${target.name} 攻來，你受到 ${dmg} 傷害${playerBlocking?'（已格擋大部分傷害）':''}`, 'enemy');
  } else {
    S.floatPlayer = playerBlocking ? "格擋成功！" : "";
  }
}

function onKillWudang(target){
  const lvl = target.level;
  const qiGain = 8+lvl*3, goldGain = 4+lvl*2;
  S.qiPool += qiGain; S.gold += goldGain;
  addLog(`擊殺了 ${target.name}！獲得內功修為 +${qiGain}、錢財 +${formatMoney(goldGain)}`, 'loot');
  if(Math.random()<0.55) S.materials.淬鍊石 += 1+Math.floor(Math.random()*2);
  if(Math.random()<0.04){ S.materials.洗髓丹 += 1; addLog(`意外獲得「洗髓丹」x1`, 'loot'); }
  if(Math.random()<0.18){ const n=1+Math.floor(Math.random()*2); S.materials.精鐵砂 += n; addLog(`獲得「精鐵砂」x${n}`, 'loot'); }
  if(Math.random() < (target.isBoss?0.4:0.03)){ S.materials.美玉錠 += 1; addLog(`獲得珍稀的「美玉錠」x1`, 'loot'); }
  if(S.quest && S.quest.zoneId===S.location && S.quest.killsDone<S.quest.killsNeeded){
    S.quest.killsDone++;
    addLog(`任務進度：${S.quest.killsDone} / ${S.quest.killsNeeded}`, 'system');
  }
  if(Math.random() < 0.20){
    const c = CONSUMABLES[Math.floor(Math.random()*(CONSUMABLES.length-1))];
    addConsumable(c.id, 1);
    addLog(`獲得藥品掉落：${c.name}`, 'loot');
  }
  if(Math.random() < 0.12){
    const slot = SLOT_LIST[Math.floor(Math.random()*SLOT_LIST.length)];
    const zone = HUNTING_ZONES.find(z=>z.id===target.zone);
    const item = generateEquipment(slot, zone?zone.levelMod:0);
    S.inventory.push(item);
    const tierInfo = TIER_LIST.find(t=>t.key===item.tierKey);
    const gradeTxt = item.tierKey==="jade" ? `${["","一","二","三","四","五","六","七"][item.jadeGrade]}品` : tierInfo.name;
    addLog(`獲得裝備掉落：${item.name}（${gradeTxt}）`, 'loot');
  }
  S.killCount++;
  if(S.monsters.every(m=>m.hp<=0)) spawnMonstersWudang(S.monsters.length);
}

function combatTickWudang(){
  const activeTech = INTERNAL_POOL.find(t=>t.id===S.activeInternal) || INTERNAL_POOL[0];
  if(S.location==="jinling" || S.visitingSect){
    recalc(false);
    if(S.warningCooldown>0) S.warningCooldown--;
    S.hp = Math.min(S.hpMax, S.hp + Math.max(1, Math.round(S.derivedPrimary.體魄*0.5)));
    S.mp = Math.min(S.mpMax, S.mp + Math.max(1, Math.round(S.derivedPrimary.罡氣*0.3))+1);
    S.floatPlayer=""; S.floatEnemy=""; S.stageEffects=[];
    checkAutoHeal();
    return;
  }
  if(!S.monsters || S.monsters.length===0 || S.monsters.every(m=>m.hp<=0)) spawnMonstersWudang();
  recalc(false);
  if(S.respecCooldown>0) S.respecCooldown--;
  if(S.warningCooldown>0) S.warningCooldown--;
  tickStatusEffects(S.statusEffects);
  S.monsters.forEach(m=> m.hp>0 && tickStatusEffects(m.statusEffects));
  S.hp = Math.min(S.hpMax, S.hp + Math.max(1, Math.round(S.derivedPrimary.體魄*0.3)));
  S.mp = Math.min(S.mpMax, S.mp + Math.max(1, Math.round(S.derivedPrimary.罡氣*0.2))+1);
  checkAutoHeal();
  S.floatPlayer=""; S.floatEnemy=""; S.hitEnemy=false; S.hitEnemyCrit=false; S.hitPlayer=false;
  S.stageEffects=[]; S.triggerFlash={};

  Object.values(S.wudangMoveState).forEach(st=>{ if(st.cdRemaining>0) st.cdRemaining--; });
  if(S.wudangSwitchCd>0) S.wudangSwitchCd--;

  // 怪物身上的印記/DOT 持續傷害：firedCount 是「已經觸發第幾次」，跟 remainingTicks 分開算，
  // 用來在畫面上顯示「X/Y回合」的持續進度，不受 tickStatusEffects() 的扣減順序影響。
  S.monsters.forEach(m=>{
    if(m.hp<=0) return;
    m.statusEffects.forEach(e=>{
      if(e.kind!=="dot_debuff") return;
      const dmg = e.dmgPerTick * (e.stacks||1);
      m.hp -= dmg;
      e.firedCount = (e.firedCount||0)+1;
      addLog(`${m.name} 受到「${e.wudangMark||'內傷'}」持續傷害 ${dmg}`, 'dot');
      const catColor = WUDANG_CATEGORY_COLOR["持續傷害"];
      S.stageEffects.push(`<span style="color:#c084fc; font-weight:700;">${e.wudangMark||'內傷'}</span>・持續發作（-${dmg}，${e.firedCount}/${e.totalDuration||'?'}回合）<span style="color:${catColor}; margin-left:5px;">〔持續傷害〕</span>`);
    });
  });

  const target = firstAliveMonster();
  if(target) target.stance = wudangMonsterStance(target);

  const move = target ? pickWudangMove(target) : null;
  if(move) resolveWudangPlayerMove(move, target, activeTech);
  else if(target && S.wudangLastMoveset && S.wudangSwitchCd>0){
    S.stageEffects.push(`<span style="color:var(--dim-text);">正在換招式，${S.wudangSwitchCd} 回合後才能使出其他套路</span><span style="color:${WUDANG_CATEGORY_COLOR["換招冷卻"]}; margin-left:5px;">〔換招冷卻〕</span>`);
  }

  if(target && target.hp>0 && target.stance==="實招"){
    resolveWudangMonsterAttack(target, move);
  } else if(move && move.type==="架招" && target){
    S.stageEffects.push(wudangBannerHtml(move, "凝神戒備，但對方沒有出手", "架招落空"));
  }

  S.monsters.forEach(m=>{
    if(m.staggerTicks>0) m.staggerTicks--;
    if(m.defReduceTicks>0) m.defReduceTicks--;
  });

  if(target && target.hp<=0) onKillWudang(target);
  if(S.hp<=0){
    addLog(`你身受重傷，昏死過去……同門將你送回金凌城療傷。`, 'warn');
    S.location = "jinling"; S.monsters = [];
    S.hp = Math.max(1, Math.round(S.hpMax*0.3));
    S.floatPlayer=""; S.floatEnemy=""; S.stageEffects=[];
  }
  S.tick++;
}
