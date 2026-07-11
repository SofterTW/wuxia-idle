function render(){
  const root = document.getElementById('wxgRoot');
  if(!S){ root.innerHTML = `<div class="wxg-noise"></div>` + renderSectPick(); bindSectPick(); return; }
  recalc(false);
  const prevLogEl = document.getElementById('wxgLogScroll');
  const prevScrollTop = prevLogEl ? prevLogEl.scrollTop : 0;
  root.innerHTML = `
    <div class="wxg-noise"></div>
    <div class="wxg-banner">
      <div class="wxg-title">江湖夜行<small>${S.sect.name}弟子 · 主修「${INTERNAL_POOL.find(t=>t.id===S.activeInternal).name}」第${getInternalTier(S.activeInternal)+1}層 · 目前所在：${locationName()}</small></div>
      <div class="wxg-stats-strip"><span>擊殺 <b>${S.killCount}</b></span><span>金錢 <b>${S.gold}</b>兩</span><span>修為 <b>${S.qiPool}</b></span>${S.buffAtkTicks>0?`<span style="color:var(--gold-lt)">培元丹生效中 <b>${S.buffAtkTicks}</b></span>`:''}${S.location!=="jinling"?`<button class="wxg-btn crimson small" data-gotown="1">回城</button>`:''}</div>
    </div>
    ${renderStage()}
    <div class="wxg-body">
      <div class="wxg-side ${S.navCollapsed?'collapsed':''}">${renderNavList()}${renderSide()}</div>
      <div class="wxg-main">${renderTab()}</div>
    </div>
    ${S.pickerSlot?renderPicker():""}
    ${S.dialogueNpc?renderNpcDialogue():""}
    ${S.warningModal?renderWarningModal():""}
  `;
  const newLogEl = document.getElementById('wxgLogScroll');
  if(newLogEl && prevScrollTop>4) newLogEl.scrollTop = prevScrollTop;
  bindGlobal();
}

function renderPicker(){
  const slot = S.pickerSlot;
  const cur = S.equipment[slot];
  const candidates = S.inventory.map((it,idx)=>({it,idx})).filter(x=>x.it.slot===slot);
  const curBonus = cur ? bonusTextHtml(cur.bonus) : "（無）";
  const rows = candidates.length>0 ? candidates.map(({it,idx})=>{
    const cmp = compareBonusHtml(it, cur);
    return `<div class="wxg-pickitem" data-pickitem="${idx}" style="flex-direction:column; align-items:stretch;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>${rarityNameHtml(it)} ${it.locked?'<span title="已鎖定">🔒</span>':''}</div>
        <div style="display:flex; gap:6px;">
          <button class="wxg-btn small" data-locktoggle="${idx}" style="padding:3px 8px;">${it.locked?'解鎖':'鎖定'}</button>
          <button class="wxg-btn small" data-pickequip="${idx}">裝備</button>
        </div>
      </div>
      <div class="wxg-hint" style="margin:4px 0 2px; color:var(--gold-lt);">與目前裝備比較：</div>
      ${cmp}
    </div>`;
  }).join("") : `<div class="wxg-hint">背包內沒有可替換的「${slot}」道具，繼續戰鬥有機率掉落</div>`;

  return `
  <div class="wxg-modal-overlay" data-closepicker="1">
    <div class="wxg-modal" data-stop="1">
      <div class="wxg-panel-head"><span class="dot"></span><h3>選擇「${slot}」裝備</h3></div>
      <div class="wxg-hint" style="margin-bottom:8px;">目前裝備：${cur?rarityNameHtml(cur):"（無）"}　${curBonus} ${cur&&cur.locked?'🔒':''}</div>
      <div class="wxg-pickitem-list">${rows}</div>
      <button class="wxg-btn crimson small" data-closepicker="1" style="margin-top:10px;">關閉</button>
    </div>
  </div>`;
}

function renderWarningModal(){
  return `
  <div class="wxg-modal-overlay" data-closewarning="1">
    <div class="wxg-modal" data-stop="1" style="border-color:var(--crimson);">
      <div class="wxg-panel-head" style="border-bottom-color:var(--crimson);"><span class="dot" style="background:var(--crimson);"></span><h3 style="color:#ff8a7a;">⚠ 自動購買警告</h3></div>
      <div class="wxg-hint" style="margin:10px 0; line-height:1.8; color:var(--ink-text); font-size:12.5px;">${S.warningModal}</div>
      <button class="wxg-btn crimson small" data-closewarning="1">知道了</button>
    </div>
  </div>`;
}

function renderNpcDialogue(){
  const [sectKey, role] = S.dialogueNpc.split(":");
  const s = SECTS[sectKey];
  const title = SECT_NPC_TITLES[sectKey][role];
  const isOwnSect = sectKey===S.sectKey;

  if(role==="clerk"){
    let body;
    if(!isOwnSect){
      body = `<div class="wxg-hint" style="margin:10px 0; line-height:1.8; color:var(--ink-text); font-size:12.5px;">「你非本門弟子，任務委託恕不受理。」</div>`;
    } else if(S.quest){
      const done = S.quest.killsDone>=S.quest.killsNeeded;
      body = `
        <div class="wxg-hint" style="margin:10px 0 6px; color:var(--ink-text); font-size:12.5px;">
          「委託：前往『${S.quest.zoneName}』剿滅魔教爪牙 ${S.quest.killsNeeded} 名。」
        </div>
        <div class="wxg-row"><span>目前進度</span><b>${S.quest.killsDone} / ${S.quest.killsNeeded}</b></div>
        <div class="wxg-row"><span>完成獎勵</span><b>門派貢獻度 +${S.quest.reward}</b></div>
        <button class="wxg-btn gold small" style="margin-top:8px;" ${done?'':'disabled'} data-turninquest="1">回報任務</button>
        ${!done?`<div class="wxg-hint">尚未達成，請前往「${S.quest.zoneName}」繼續剿滅魔教爪牙。</div>`:''}
      `;
    } else {
      body = `<div class="wxg-hint" style="margin:10px 0 8px; color:var(--ink-text); font-size:12.5px;">「近來魔教猖獗，可願替本門走一趟？」</div>
        <div class="wxg-pickitem-list">
          ${QUEST_TEMPLATES.map(q=>`<div class="wxg-pickitem">
            <div><b>剿滅魔教：${q.zoneName}</b><div class="wxg-hint" style="margin-top:2px;">擊殺 ${q.killsNeeded} 名，獎勵貢獻度 +${q.reward}</div></div>
            <button class="wxg-btn small" data-acceptquest="${q.zoneId}">接下</button>
          </div>`).join("")}
        </div>`;
    }
    return `
    <div class="wxg-modal-overlay" data-closedialogue="1">
      <div class="wxg-modal" data-stop="1">
        <div class="wxg-panel-head"><span class="dot"></span><h3>${s.name} · ${title}</h3></div>
        ${body}
        <button class="wxg-btn crimson small" style="margin-top:10px;" data-closedialogue="1">告辭</button>
      </div>
    </div>`;
  }

  if(role==="rank"){
    let body;
    if(!isOwnSect){
      body = `<div class="wxg-hint" style="margin:10px 0; line-height:1.8; color:var(--ink-text); font-size:12.5px;">「地位考核僅限本門弟子，外人不便置喙。」</div>`;
    } else {
      const cur = RANK_TABLE[S.sectRank];
      const next = RANK_TABLE[S.sectRank+1];
      const rankRows = RANK_TABLE.map((r,i)=>`<div class="wxg-row" style="${i===S.sectRank?'color:var(--gold-lt)':''}">${i===S.sectRank?'▶ ':'　'}${r.name}${i>0?`（需貢獻 ${r.req}、材料 ${r.mat}）`:''}</div>`).join("");
      body = `
        <div class="wxg-hint" style="margin:10px 0 6px; color:var(--ink-text); font-size:12.5px;">「你目前是本門「${cur.name}」，論功而行，一步一步來。」</div>
        <div class="wxg-hint" style="line-height:1.7;">${rankRows}</div>
        <div class="wxg-row" style="margin-top:8px;"><span>目前貢獻度</span><b>${S.sectContribution}</b></div>
        <div class="wxg-row"><span>持有淬鍊石</span><b>${S.materials.淬鍊石}</b></div>
        ${next?`<button class="wxg-btn gold small" style="margin-top:8px;" ${(S.sectContribution>=next.req && S.materials.淬鍊石>=next.mat)?'':'disabled'} data-promote="1">晉升為「${next.name}」</button>`
              :`<div class="wxg-hint" style="color:var(--gold-lt);">已是本門最高位階「掌門」</div>`}
      `;
    }
    return `
    <div class="wxg-modal-overlay" data-closedialogue="1">
      <div class="wxg-modal" data-stop="1">
        <div class="wxg-panel-head"><span class="dot"></span><h3>${s.name} · ${title}</h3></div>
        ${body}
        <button class="wxg-btn crimson small" style="margin-top:10px;" data-closedialogue="1">告辭</button>
      </div>
    </div>`;
  }

  const line = NPC_ROLE_DESC[role];
  return `
  <div class="wxg-modal-overlay" data-closedialogue="1">
    <div class="wxg-modal" data-stop="1">
      <div class="wxg-panel-head"><span class="dot"></span><h3>${s.name} · ${title}</h3></div>
      <div class="wxg-hint" style="margin:10px 0; line-height:1.8; color:var(--ink-text); font-size:12.5px;">
        「${line}」
      </div>
      <button class="wxg-btn crimson small" data-closedialogue="1">告辭</button>
    </div>
  </div>`;
}

const ZONE_SCENES = {
  jinling:`<svg viewBox="0 0 500 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="skyJl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a2410"/><stop offset="60%" stop-color="#1c1108"/><stop offset="100%" stop-color="#100a05"/>
    </linearGradient></defs>
    <rect width="500" height="150" fill="url(#skyJl)"/>
    <circle cx="420" cy="30" r="16" fill="#f3d878" opacity="0.85"/>
    <circle cx="420" cy="30" r="26" fill="#f3d878" opacity="0.15"/>
    <path d="M0 110 L20 95 L40 108 L60 88 L85 106 L110 92 L140 110 L170 90 L200 108 L230 94 L260 110 L290 92 L320 108 L350 90 L380 106 L410 92 L440 108 L470 96 L500 110 L500 150 L0 150 Z" fill="#0d0805" opacity="0.9"/>
    <path d="M60 88 L60 70 L54 70 L67 55 L80 70 L74 70 L74 88Z" fill="#241708"/>
    <path d="M230 94 L230 76 L224 76 L237 60 L250 76 L244 76 L244 94Z" fill="#241708"/>
    <path d="M380 106 L380 84 L373 84 L389 66 L405 84 L398 84 L398 106Z" fill="#241708"/>
    <circle cx="67" cy="82" r="2.4" fill="#d4af37" opacity="0.8"/>
    <circle cx="237" cy="88" r="2.4" fill="#d4af37" opacity="0.8"/>
    <circle cx="389" cy="98" r="2.4" fill="#d4af37" opacity="0.8"/>
  </svg>`,
  heifeng:`<svg viewBox="0 0 500 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="skyHf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#141810"/><stop offset="70%" stop-color="#0d0f0a"/><stop offset="100%" stop-color="#080907"/>
    </linearGradient></defs>
    <rect width="500" height="150" fill="url(#skyHf)"/>
    <path d="M0 120 Q60 90 120 118 Q180 85 260 116 Q330 88 400 118 Q460 95 500 120 L500 150 L0 150Z" fill="#1a1f14" opacity="0.85"/>
    <path d="M420 105 L420 60 L414 60 L390 105Z" fill="#0d0f0a"/>
    <path d="M420 60 L436 40 L420 40Z" fill="#0d0f0a"/>
    <circle cx="120" cy="130" r="10" fill="#c9622a" opacity="0.5"/>
    <circle cx="120" cy="130" r="4" fill="#f3a03c" opacity="0.7"/>
  </svg>`,
  xueyu:`<svg viewBox="0 0 500 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="skyXy" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a1210"/><stop offset="60%" stop-color="#1c0806"/><stop offset="100%" stop-color="#0d0403"/>
    </linearGradient></defs>
    <rect width="500" height="150" fill="url(#skyXy)"/>
    <circle cx="90" cy="35" r="20" fill="#a5332c" opacity="0.6"/>
    <path d="M180 120 L180 55 L172 55 L172 120Z" fill="#160705"/>
    <path d="M220 120 L220 45 L210 45 L210 120Z" fill="#160705"/>
    <path d="M260 120 L260 55 L252 55 L252 120Z" fill="#160705"/>
    <path d="M160 55 L280 55 L270 42 L170 42Z" fill="#1c0a08"/>
    <path d="M0 122 L500 122 L500 150 L0 150Z" fill="#0d0403"/>
  </svg>`,
  jile:`<svg viewBox="0 0 500 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="skyJc" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a1030"/><stop offset="60%" stop-color="#150a1c"/><stop offset="100%" stop-color="#0c0810"/>
    </linearGradient></defs>
    <rect width="500" height="150" fill="url(#skyJc)"/>
    <path d="M0 115 L50 70 L100 112 L150 60 L210 110 L270 75 L330 114 L390 65 L440 110 L500 80 L500 150 L0 150Z" fill="#1a0f22" opacity="0.9"/>
    <ellipse cx="100" cy="130" rx="220" ry="18" fill="#3f7d63" opacity="0.18"/>
    <circle cx="150" cy="55" r="3" fill="#5eab88" opacity="0.7"/>
    <circle cx="330" cy="70" r="2.2" fill="#5eab88" opacity="0.6"/>
    <circle cx="420" cy="90" r="2.6" fill="#8a6d9b" opacity="0.6"/>
  </svg>`,
};

function zoneBgClass(){
  if(S.location==="jinling") return "jinling";
  if(S.location==="heifeng") return "heifeng";
  if(S.location==="xueyu") return "xueyu";
  if(S.location==="jile") return "jile";
  return "jinling";
}

function pillbar(tag, tagCls, cur, max, fillCls, flashCls){
  const pct = max>0 ? Math.max(0, Math.min(100, cur/max*100)) : 0;
  return `<div class="wxg-pillrow">
    <span class="wxg-pilltag ${tagCls}">${tag}</span>
    <div class="wxg-gauge${flashCls?' '+flashCls:''}">
      <div class="wxg-gauge-fill ${fillCls}" style="width:${pct}%"></div>
      <div class="wxg-gauge-text">${Math.max(0,Math.round(cur))}/${Math.round(max)}</div>
    </div>
  </div>`;
}

function renderStage(){
  const sectIcon = FIGHTER_FIGURES[S.sectKey];
  const zoneKey = zoneBgClass();
  const sceneSvg = `<div class="wxg-scene">${ZONE_SCENES[zoneKey]}</div>`;
  if(S.location==="jinling"){
    return `
    <div class="wxg-stage bg-${zoneKey}">
      ${sceneSvg}
      <div class="wxg-corner tl"></div><div class="wxg-corner tr"></div><div class="wxg-corner bl"></div><div class="wxg-corner br"></div>
      <div class="wxg-fighter">
        <div class="wxg-portrait-wrap">
          <div class="wxg-portrait big">${sectIcon}</div>
          <div class="wxg-ground-shadow"></div>
        </div>
        <div class="wxg-fname">${S.sect.name}弟子</div>
        <div class="wxg-gauge-wrap">
          ${pillbar('氣','hp',S.hp,S.hpMax,'hp')}
          ${pillbar('內','mp',S.mp,S.mpMax,'mp')}
        </div>
      </div>
      <div class="wxg-vs-col">
        <div class="wxg-vs" style="font-size:16px;">金凌城中休整</div>
        <div class="wxg-stage-hint">氣血、內力自動恢復中 · 前往「地圖」選擇狩獵區才能繼續戰鬥</div>
      </div>
      <div class="wxg-fighter">
        <div class="wxg-portrait-wrap"><div class="wxg-portrait big enemy" style="opacity:.25;">${MONSTER_FIGURE}</div></div>
        <div class="wxg-fname" style="color:#8a7d63;">（尚無目標）</div>
      </div>
    </div>`;
  }
  const m = S.monster;
  const monsterIcon = m && m.isBoss ? BOSS_FIGURE : MONSTER_FIGURE;
  const zone = HUNTING_ZONES.find(z=>z.id===S.location) || HUNTING_ZONES[0];
  const stageShake = (S.hitEnemyCrit)?' wxg-stage-shake':'';
  const playerHitCls = S.hitPlayer ? ' hit-shake hit-flash' : '';
  const enemyHitCls = S.hitEnemy ? (' hit-shake hit-flash'+(S.hitEnemyCrit?' hit-crit':'')) : '';
  return `
  <div class="wxg-stage bg-${zoneKey}${stageShake}">
    ${sceneSvg}
    <div class="wxg-corner tl"></div><div class="wxg-corner tr"></div><div class="wxg-corner bl"></div><div class="wxg-corner br"></div>
    ${S.hitEnemy?`<div class="wxg-projectile fwd"></div>`:""}
    ${S.hitPlayer?`<div class="wxg-projectile back"></div>`:""}
    <div class="wxg-fighter">
      <div class="wxg-portrait-wrap">
        ${S.floatPlayer?`<div class="wxg-float self">${S.floatPlayer}</div>`:""}
        <div class="wxg-portrait big${playerHitCls}">${sectIcon}</div>
        <div class="wxg-ground-shadow"></div>
      </div>
      <div class="wxg-fname">${S.sect.name}弟子</div>
      <div class="wxg-gauge-wrap">
        ${pillbar('氣','hp',S.hp,S.hpMax,'hp',S.hitPlayer?'gauge-flash':'')}
        ${pillbar('內','mp',S.mp,S.mpMax,'mp')}
      </div>
    </div>
    <div class="wxg-vs-col">
      <div class="wxg-vs">對　決</div>
      <div class="wxg-stage-hint">目前狩獵區：${zone.name}</div>
      ${S.stageEffects && S.stageEffects.length>0 ? S.stageEffects.map((t,i)=>`<div class="wxg-effect-banner" style="animation-delay:${i*0.15}s;">${t}</div>`).join("") : ""}
    </div>
    <div class="wxg-fighter">
      <div class="wxg-portrait-wrap">
        ${S.floatEnemy?`<div class="wxg-float foe${S.hitEnemyCrit?' crit':''}">${S.floatEnemy}</div>`:""}
        <div class="wxg-portrait big enemy${enemyHitCls}">${monsterIcon}</div>
        <div class="wxg-ground-shadow"></div>
      </div>
      <div class="wxg-fname">${m?m.name:"—"}</div>
      <div class="wxg-fsub">Lv.${m?m.level:0}</div>
      <div class="wxg-gauge-wrap">
        ${pillbar('氣','en',m?m.hp:0,m?m.hpMax:1,'en',S.hitEnemy?'gauge-flash':'')}
      </div>
    </div>
  </div>`;
}

function renderNavList(){
  const tabColors = {overview:"#d4af37", internal:"#5eab88", martial:"#d1564c", equip:"#a78bd6", map:"#4dd0c8", quest:"#4a86c0"};
  const tabLabels = {overview:"總覽", internal:"內功", martial:"武學", equip:"裝備", map:"地圖", quest:"任務"};
  const badges = {
    overview: "",
    internal: `第${getInternalTier(S.activeInternal)+1}層`,
    martial: `${Object.keys(S.knownMartial).length}招`,
    equip: `${Object.values(S.equipment).filter(Boolean).length}/${SLOT_LIST.length}`,
    map: locationName(),
    quest: S.quest ? (S.quest.killsDone>=S.quest.killsNeeded ? "可回報" : `${S.quest.killsDone}/${S.quest.killsNeeded}`) : "",
  };
  const items = ["overview","internal","martial","equip","map","quest"].map(t=>{
    const c = tabColors[t];
    const active = S.tab===t;
    const badge = badges[t];
    return `<div class="wxg-navitem ${active?'active':''}" data-tab="${t}" style="--navc:${c};">
      <span class="wxg-navdot" style="background:${c}; box-shadow:0 0 6px ${c};"></span>
      <span class="wxg-navlabel">${tabLabels[t]}</span>
      ${badge?`<span class="wxg-navbadge" style="color:${c}; border-color:${c}55;">${badge}</span>`:''}
    </div>`;
  }).join("");
  return `
    <div class="wxg-navlist">
      <div class="wxg-navcollapse" data-navcollapse="1" title="收合／展開導覽列">${S.navCollapsed?'»':'«'}</div>
      ${items}
    </div>`;
}

function renderSide(){
  const exp = S.sideExpanded;
  const buffs = [];
  if(S.buffAtkTicks>0){
    buffs.push(`<div class="wxg-row effect-flash"><span>培元丹（威力+${Math.round(S.buffAtk*100)}%）</span><b>${S.buffAtkTicks} 回合</b></div>`);
  }
  const buffBody = buffs.length>0 ? buffs.join("") : `<div class="wxg-hint">暫無生效中的狀態效果（技能／門派特效觸發時會顯示在戰鬥舞台上）</div>`;
  const buffPanel = `<div class="wxg-panel">
    <div class="wxg-panel-head" data-togglenside="buffs" style="cursor:pointer;"><span class="dot"></span><h3>目前狀態效果</h3><span class="wxg-chevron" style="margin-left:auto; color:var(--dim-text); font-size:10px;">${exp.buffs?'▾':'▸'}</span></div>
    ${exp.buffs?buffBody:''}
  </div>`;

  const hpOptions = CONSUMABLES.filter(c=>c.effect==="healHp"||c.effect==="healFull");
  const mpOptions = CONSUMABLES.filter(c=>c.effect==="healMp"||c.effect==="healFull");
  const autoBody = `
      <div class="wxg-hint" style="margin-top:0;">氣血／內力低於門檻時，自動使用背包內指定藥品；勾選自動購買後，存量剩 1 瓶會自動補貨 100 瓶。</div>
      <div style="margin-top:8px;">
        <div class="wxg-row"><span>氣血低於</span></div>
        <select data-autopct="hp" style="width:100%; background:#100e0a; color:var(--ink-text); border:1px solid #4a3818; border-radius:3px; padding:4px; font-size:11px;">
          ${[10,20,30,40,50,60,70,80,90].map(v=>`<option value="${v}" ${S.autoHeal.hpPct===v?'selected':''}>低於 ${v}%</option>`).join("")}
        </select>
        <select data-autoitem="hp" style="width:100%; margin-top:4px; background:#100e0a; color:var(--ink-text); border:1px solid #4a3818; border-radius:3px; padding:4px; font-size:11px;">
          <option value="">不自動使用</option>
          ${hpOptions.map(c=>`<option value="${c.id}" ${S.autoHeal.hpItem===c.id?'selected':''}>${c.name}</option>`).join("")}
        </select>
        <label style="display:flex; align-items:center; gap:6px; margin-top:5px; font-size:11px; color:var(--dim-text); cursor:pointer;">
          <input type="checkbox" data-autobuy="hp" ${S.autoHeal.hpAutoBuy?'checked':''}> 存量不足時自動購買（扣款）
        </label>
      </div>
      <div style="margin-top:10px;">
        <div class="wxg-row"><span>內力低於</span></div>
        <select data-autopct="mp" style="width:100%; background:#100e0a; color:var(--ink-text); border:1px solid #4a3818; border-radius:3px; padding:4px; font-size:11px;">
          ${[10,20,30,40,50,60,70,80,90].map(v=>`<option value="${v}" ${S.autoHeal.mpPct===v?'selected':''}>低於 ${v}%</option>`).join("")}
        </select>
        <select data-autoitem="mp" style="width:100%; margin-top:4px; background:#100e0a; color:var(--ink-text); border:1px solid #4a3818; border-radius:3px; padding:4px; font-size:11px;">
          <option value="">不自動使用</option>
          ${mpOptions.map(c=>`<option value="${c.id}" ${S.autoHeal.mpItem===c.id?'selected':''}>${c.name}</option>`).join("")}
        </select>
        <label style="display:flex; align-items:center; gap:6px; margin-top:5px; font-size:11px; color:var(--dim-text); cursor:pointer;">
          <input type="checkbox" data-autobuy="mp" ${S.autoHeal.mpAutoBuy?'checked':''}> 存量不足時自動購買（扣款）
        </label>
      </div>`;
  const autoPanel = `<div class="wxg-panel">
    <div class="wxg-panel-head" data-togglenside="autoheal" style="cursor:pointer;"><span class="dot"></span><h3>自動回復設定</h3><span class="wxg-chevron" style="margin-left:auto; color:var(--dim-text); font-size:10px;">${exp.autoheal?'▾':'▸'}</span></div>
    ${exp.autoheal?autoBody:''}
  </div>`;

  const primaryBody = ["臂力","身法","內息","罡氣","體魄"].map(k=>`<div class="wxg-row"><span style="color:${PRIMARY_COLORS[k]};">${k}</span><b style="color:${PRIMARY_COLORS[k]};">${S.derivedPrimary[k]}</b></div>`).join("");
  const primaryPanel = `<div class="wxg-panel">
    <div class="wxg-panel-head" data-togglenside="primary" style="cursor:pointer;"><span class="dot"></span><h3>五大主屬性</h3><span class="wxg-chevron" style="margin-left:auto; color:var(--dim-text); font-size:10px;">${exp.primary?'▾':'▸'}</span></div>
    ${exp.primary?primaryBody:''}
  </div>`;

  return `
    ${primaryPanel}
    ${buffPanel}
    ${autoPanel}
  `;
}

function renderTab(){
  if(S.tab==="overview") return renderOverview();
  if(S.tab==="internal") return renderInternal();
  if(S.tab==="martial") return renderMartial();
  if(S.tab==="equip") return renderEquip();
  if(S.tab==="map") return renderMap();
  if(S.tab==="quest") return renderQuest();
}

function sectMechanicStatus(){
  if(S.sectKey==="shaolin") return `目前格擋疊層 ${S.shaolinBlockStack} / 5（每層 +3 外功防禦，被閃避會歸零）`;
  if(S.sectKey==="wudang") return S.wudangProc ? "以柔克剛已觸發，下次攻擊將追加內功一擊" : "閃避成功後會觸發下次內功追擊";
  if(S.sectKey==="emei") return "內力回復速度 +60%（已生效）";
  if(S.sectKey==="gaibang") return `降龍連擊：${S.gaibangComboKills} / 5（集滿後下擊 +60% 傷害並無敵化解一次攻擊）`;
  if(S.sectKey==="tangmen") return S.monster ? `目前中毒層數：${S.monster.poisonStacks||0} / 5（每層每回合 4 點持續傷害）` : "普攻會為敵人疊加中毒層數";
  if(S.sectKey==="mingjiao") return S.hpMax && S.hp/S.hpMax<0.5 ? "天魔解體已觸發：威力 +35%" : "氣血低於 50% 時會觸發天魔解體，威力大增";
  return "";
}

const LOG_TYPE_META = {
  attack:{label:"攻擊", color:"#4a86c0", bg:"rgba(74,134,192,.10)"},
  skill:{label:"技能", color:"#a855f7", bg:"rgba(168,85,247,.11)"},
  enemy:{label:"敵方", color:"#ef4444", bg:"rgba(239,68,68,.10)"},
  dot:{label:"持續傷害", color:"#5eab88", bg:"rgba(94,171,136,.11)"},
  dodge:{label:"閃避", color:"#4dd0c8", bg:"rgba(77,208,200,.10)"},
  loot:{label:"戰利品", color:"#d4af37", bg:"rgba(212,175,55,.12)"},
  warn:{label:"警告", color:"#ff6b4a", bg:"rgba(255,107,74,.12)"},
  system:{label:"系統", color:"#8a7d63", bg:"rgba(138,125,99,.08)"},
};

function renderCombatLogPanel(){
  const filters = S.logFilters;
  const pills = Object.entries(LOG_TYPE_META).map(([k,meta])=>{
    const on = filters[k]!==false;
    return `<span class="wxg-logpill" data-logfilter="${k}" style="color:${meta.color}; border-color:${on?meta.color:'#3a2a17'}; background:${on?meta.bg:'transparent'}; opacity:${on?1:.45};">${meta.label}</span>`;
  }).join("");
  const entries = S.log.filter(l=>filters[l.type]!==false);
  const rows = entries.map(l=>{
    const meta = LOG_TYPE_META[l.type] || LOG_TYPE_META.system;
    return `<div class="wxg-logline" style="border-left-color:${meta.color}; background:${meta.bg};"><span style="color:${meta.color}; font-weight:700;">◆</span> ${l.msg}</div>`;
  }).join("");
  return `
    <div class="wxg-panel">
      <div class="wxg-panel-head"><span class="dot"></span><h3>戰鬥紀錄</h3></div>
      <div class="wxg-logpills">${pills}</div>
      <div class="wxg-log" id="wxgLogScroll">${rows || '<div class="wxg-hint">尚無紀錄</div>'}</div>
    </div>`;
}

function renderOverview(){
  return `
    <div class="wxg-panel"><div class="wxg-panel-head"><span class="dot"></span><h3>二級戰鬥屬性</h3></div>
      <div class="wxg-grid2">
        <div class="wxg-row"><span>近身威力</span><b>${fmt(S.secondary.近身威力)}</b></div>
        <div class="wxg-row"><span>遠程威力</span><b>${fmt(S.secondary.遠程威力)}</b></div>
        <div class="wxg-row"><span>內功威力</span><b>${fmt(S.secondary.內功威力)}</b></div>
        <div class="wxg-row"><span>外功暴擊</span><b>${fmt(S.secondary.外功暴擊)}%</b></div>
        <div class="wxg-row"><span>內功暴擊</span><b>${fmt(S.secondary.內功暴擊)}%</b></div>
        <div class="wxg-row"><span>閃避值</span><b>${fmt(S.secondary.閃避值)}</b></div>
        <div class="wxg-row"><span>外功防禦</span><b>${fmt(S.secondary.外功防禦)}</b></div>
        <div class="wxg-row"><span>內功防禦</span><b>${fmt(S.secondary.內功防禦)}</b></div>
      </div>
      <div class="wxg-hint">門派專屬機制：${S.sect.passive}</div>
      <div class="wxg-hint" style="color:var(--gold-lt);">${sectMechanicStatus()}</div>
    </div>
    ${renderCombatLogPanel()}
  `;
}

const TIER_DESC = [
  "第一層（引氣入體）：內力上限 +0%",
  "第二層（小周天）：內力上限 +15%、內功威力 +10%",
  "第三層（大周天）：內力上限 +30%、內功威力 +25%、氣血回復 +20%",
  "第四層（化勁）：內功防禦 +30%、解鎖「內功反震」被動",
  "第五層（返璞歸真）：全屬性 +10%、內力消耗 -15%",
  "第六層（天人合一）：全屬性 +20%、解鎖門派奧義武學上限",
];

function renderInternal(){
  return `
    <div class="wxg-panel"><div class="wxg-panel-head internal"><span class="dot"></span><h3>內功修為池：${S.qiPool} 點</h3></div>
      <div class="wxg-hint">投入不可拆分收回，需用洗髓丹洗點（返還七折，冷卻 20 次戰鬥）。點標題列可展開/收合詳情。</div>
      <div class="wxg-row" style="margin-top:6px;"><span>持有洗髓丹</span><b>${S.materials.洗髓丹}</b></div>
      <div class="wxg-row"><span>洗點冷卻</span><b>${S.respecCooldown>0?S.respecCooldown+' 次戰鬥':'可用'}</b></div>
    </div>
    ${INTERNAL_POOL.map(t=>{
      const known = S.knownInternal[t.id];
      if(!known) return `<div class="wxg-panel" style="opacity:.4"><div class="wxg-panel-head internal"><span class="dot"></span><h3>未知心法</h3></div><div class="wxg-hint">擊殺 Boss 有機率習得</div></div>`;
      const tier = getInternalTier(t.id);
      const tierInfo = TIER_TABLE[tier];
      const nextReq = TIER_TABLE[Math.min(tier+1,5)].req;
      const isMain = S.activeInternal===t.id;
      const expanded = !!S.internalExpanded[t.id];
      const tierList = TIER_DESC.map((desc,i)=>`<div class="wxg-row" style="${i===tier?'color:var(--gold-lt)':''}">${i===tier?'▶ ':'　'}${desc}</div>`).join("");
      return `
      <div class="wxg-panel ${isMain?'active-main':''}">
        <div class="wxg-panel-head internal" data-toggleint="${t.id}" style="cursor:pointer;">
          <span class="dot"></span><h3>${t.name}</h3>
          <span class="wxg-tag ${t.affinity==='太極'?'gold':'jade'}">${t.affinity}</span>
          <span class="wxg-chevron" style="margin-left:6px; color:var(--dim-text); font-size:10px;">${expanded?'▾':'▸'}</span>
          ${isMain?`<span class="wxg-tag gold" style="margin-left:auto;">主修中</span>`:`<button class="wxg-btn gold small" data-setmain="${t.id}" style="margin-left:auto;">使用</button>`}
        </div>
        ${expanded?`
        <div class="wxg-row"><span>目前層數</span><b>第 ${tier+1} 層</b></div>
        <div class="wxg-row"><span>已投入</span><b>${known.invested} ${tier<5?`／需 ${nextReq}`:'（頂層）'}</b></div>
        <div class="wxg-progress-wrap"><div class="wxg-progress jade" style="width:${tier<5?Math.min(100,(known.invested-TIER_TABLE[tier].req)/(nextReq-TIER_TABLE[tier].req)*100):100}%"></div></div>
        <div class="wxg-hint" style="line-height:1.7; margin-top:6px;">${tierList}</div>
        <div style="display:flex; gap:6px; margin-top:9px; flex-wrap:wrap;">
          <button class="wxg-btn jade small" data-invest="${t.id}" data-amt="100">投入100</button>
          <button class="wxg-btn jade small" data-invest="${t.id}" data-amt="all">全投入</button>
          <button class="wxg-btn crimson small" data-respec="${t.id}">洗點</button>
        </div>`:``}
      </div>`;
    }).join("")}
  `;
}

function martialLayerDesc(def, layerIdx){
  // layerIdx 1~9
  if(layerIdx===1) return "招式基礎效果";
  if(layerIdx===3) return `傷害 +8%，解鎖附加效果：${def.special}`;
  if(layerIdx===5) return "傷害 +8%，內力消耗 -10%";
  if(layerIdx===9) return "傷害 +15%，解鎖終極追加效果（大成）";
  return "傷害 +8%";
}

function renderMartial(){
  const slots = S.martialSlots.map((id,idx)=>{
    const known = id?S.knownMartial[id]:null;
    const def = id?Object.values(MARTIAL_POOL).flat().find(m=>m.id===id):null;
    return `<div class="wxg-medal" ${def?`data-unequipslot="${idx}"`:''} style="overflow:hidden; ${def?'cursor:pointer;':'opacity:.5;'}">
      <div class="ring ${def?(def.dmgType==='外功'?'wai':'nei'):''}">${idx+1}</div>
      <div style="padding-top:2px;">${def?`${def.name}<br><span style="color:#c9bd9e;font-size:10.5px">第${known.layer}層 · 點擊卸下</span>`:"（空）"}</div>
    </div>`;
  }).join("");

  const known = Object.entries(S.knownMartial).map(([id,k])=>{
    const def = Object.values(MARTIAL_POOL).flat().find(m=>m.id===id);
    const need = MARTIAL_TIER_TABLE[k.layer] ?? null;
    const canUp = k.layer<9 && k.proficiency>=need;
    const expanded = !!S.martialExpanded[id];
    const equippedSlot = S.martialSlots.indexOf(id);
    const isEquipped = equippedSlot>=0;
    const layerList = [1,2,3,4,5,6,7,8,9].map(li=>{
      const cur = li===k.layer;
      return `<div class="wxg-row" style="${cur?'color:var(--gold-lt)':''}">${cur?'▶ ':'　'}第${li}層：${martialLayerDesc(def,li)}</div>`;
    }).join("");
    return `
      <div class="wxg-panel ${isEquipped?'active-main':''}">
        <div class="wxg-panel-head martial" data-togglemartial="${id}" style="cursor:pointer;">
          <span class="dot"></span><h3>${def.name}</h3>
          <span class="wxg-tag crimson">${def.dmgType}</span><span class="wxg-tag jade">${def.affinity}</span>
          <span class="wxg-tag gold">第${k.layer}層</span>
          <span class="wxg-chevron" style="margin-left:6px; color:var(--dim-text); font-size:10px;">${expanded?'▾':'▸'}</span>
          <button class="wxg-btn ${isEquipped?'crimson':'gold'} small" data-usemartial="${id}" style="margin-left:auto;">${isEquipped?'卸下':'使用'}</button>
        </div>
        ${expanded?`
        <div class="wxg-row"><span>${k.layer<9?'熟練度':'狀態'}</span><b>${k.layer<9?`${k.proficiency} / ${need}`:'大成'}</b></div>
        <div class="wxg-progress-wrap"><div class="wxg-progress crimson" style="width:${k.layer<9?Math.min(100,k.proficiency/need*100):100}%"></div></div>
        <div class="wxg-hint" style="line-height:1.7; margin:6px 0;">${layerList}</div>
        <button class="wxg-btn small" ${canUp?'':'disabled'} data-upgrade="${id}">升級（淬鍊石 x${k.layer*3}）</button>`:``}
      </div>`;
  }).join("");

  return `
    <div class="wxg-panel"><div class="wxg-panel-head martial"><span class="dot"></span><h3>武學技能欄</h3></div>
      <div class="wxg-slotgrid">${slots}</div>
      <div class="wxg-hint" style="margin-top:6px;">在下方招式列表點「使用」直接裝入空位，點技能欄圖示可卸下。</div>
      <div class="wxg-row" style="margin-top:6px;"><span>持有淬鍊石</span><b>${S.materials.淬鍊石}</b></div>
    </div>
    ${known}
  `;
}

function renderEquip(){
  const subTabs = `
    <div class="wxg-subtabs">
      <div class="wxg-subtab ${S.equipSubTab==='gear'?'active':''}" data-equipsub="gear">裝備</div>
      <div class="wxg-subtab ${S.equipSubTab==='bag'?'active':''}" data-equipsub="bag">背包 ${S.inventory.length>0?`(${S.inventory.length})`:''}</div>
    </div>`;

  if(S.equipSubTab==="bag"){
    const inv = S.inventory.map((it,idx)=>{
      if(it.kind==="consumable"){
        const c = findConsumable(it.refId);
        return `<div class="wxg-panel"><div class="wxg-panel-head"><span class="dot"></span><h3>${it.name}</h3><span class="wxg-tag jade">藥品 x${it.qty}</span></div>
          <div class="wxg-hint">${c?c.desc:''}</div>
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button class="wxg-btn jade small" data-useconsumable="${idx}">使用</button>
            <button class="wxg-btn crimson small" data-bagsell="${idx}">販售一份（1兩）</button>
          </div></div>`;
      }
      if(it.kind==="manual"){
        const already = it.manualType==="martial" ? !!S.knownMartial[it.targetId] : !!S.knownInternal[it.targetId];
        return `<div class="wxg-panel"><div class="wxg-panel-head"><span class="dot"></span><h3>${it.name}</h3><span class="wxg-tag gold">秘笈</span></div>
          <div class="wxg-hint">${already?'已學過此招／心法，使用後將轉換為熟練度或修為，不會浪費。':'尚未習得，使用後直接學會。'}</div>
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button class="wxg-btn gold small" data-usemanual="${idx}">使用</button>
            <button class="wxg-btn crimson small" data-bagsell="${idx}">販售（1兩）</button>
          </div></div>`;
      }
      // equipment
      const bonusText = bonusTextHtml(it.bonus);
      const awakenText = (it.awakened||[]).length>0 ? `<div class="wxg-hint" style="color:var(--gold-lt);">開光：${it.awakened.map(a=>`${a.stat}+${a.value}`).join('、')}</div>` : '';
      return `<div class="wxg-panel"><div class="wxg-panel-head"><span class="dot"></span><h3>${rarityNameHtml(it)} ${it.locked?'🔒':''}</h3><span class="wxg-tag">${it.slot}</span></div>
        <div class="wxg-hint">${bonusText}</div>${awakenText}
        <div style="display:flex; gap:6px; margin-top:6px;">
          <button class="wxg-btn small" data-equip="${idx}">裝備</button>
          <button class="wxg-btn small" data-locktoggle="${idx}">${it.locked?'解鎖':'鎖定'}</button>
          ${!it.locked?`<button class="wxg-btn crimson small" data-bagsell="${idx}">販售（1兩）</button>`:''}
        </div></div>`;
    }).join("") || `<div class="wxg-hint">背包空空如也，繼續戰鬥有機率掉落裝備、藥品與秘笈</div>`;
    return subTabs + inv;
  }

  const slots = SLOT_LIST.map(slot=>{
    const it = S.equipment[slot];
    const bonusText = it ? bonusTextHtml(it.bonus) : "";
    const availCount = S.inventory.filter(x=>x.slot===slot).length;
    const awakenSum = it && it.awakened && it.awakened.length>0 ? `<br><span class="bonus" style="color:var(--gold-lt);">開光：${it.awakened.map(a=>`${a.stat}+${a.value}`).join('、')}</span>` : '';
    return `<div class="wxg-equip-slot" data-slotview="${slot}"><span class="slotname">${slot}</span>：${it?rarityNameHtml(it):"（無）"}${it&&it.locked?' 🔒':''}<br><span class="bonus">${bonusText}</span>${awakenSum}${availCount>0?`<span class="wxg-tag gold" style="float:right;">可換 ${availCount}</span>`:''}</div>`;
  }).join("");

  return subTabs + `
    <div class="wxg-panel"><div class="wxg-panel-head"><span class="dot"></span><h3>目前裝備（${SLOT_LIST.length} 部位）</h3></div><div class="wxg-slotgrid">${slots}</div></div>
    <div class="wxg-hint">點擊任一部位可開啟選擇框，替換背包內同部位的道具。</div>
  `;
}

const SECT_NPC_TITLES = {
  shaolin:{leader:"方丈",elder:"達摩院首座",enforcer:"戒律院首座",clerk:"知客僧",quarter:"庫房知客",smith:"兵器堂頭陀",healer:"藥王殿醫僧",senior:"大師兄",instructor:"羅漢堂教頭",guard:"山門護法",bard:"掃地老僧",vault:"藏經閣老僧",rank:"論功堂首座"},
  wudang:{leader:"掌教真人",elder:"傳功長老",enforcer:"清虛監院",clerk:"知客道人",quarter:"庫房道人",smith:"鑄劍真人",healer:"丹房道長",senior:"大師兄",instructor:"練劍教習",guard:"山門弟子",bard:"雲遊道人",vault:"藏劍閣守閣人",rank:"論功真人"},
  emei:{leader:"掌門師太",elder:"傳功師太",enforcer:"戒律堂師太",clerk:"知客弟子",quarter:"庫房師姐",smith:"兵器師姐",healer:"藥王殿師太",senior:"大師姐",instructor:"劍術教習",guard:"山門弟子",bard:"說書師姐",vault:"藏經閣師太",rank:"論功堂師太"},
  gaibang:{leader:"幫主",elder:"傳功長老",enforcer:"執法長老",clerk:"接待弟子",quarter:"庫房長老",smith:"打鐵匠",healer:"療傷婆婆",senior:"大師兄",instructor:"棒法教頭",guard:"分舵護院",bard:"說書乞兒",vault:"祕笈看守長老",rank:"論功長老"},
  tangmen:{leader:"門主",elder:"傳功長老",enforcer:"家法堂主",clerk:"接待弟子",quarter:"庫房管事",smith:"暗器坊匠人",healer:"毒藥堂醫師",senior:"大公子",instructor:"暗器教頭",guard:"門口護衛",bard:"說書門人",vault:"密宗閣看守",rank:"論功堂主"},
  mingjiao:{leader:"教主",elder:"傳功長老",enforcer:"刑堂長老",clerk:"接引使者",quarter:"庫房護法",smith:"鑄魔匠人",healer:"毒經堂醫師",senior:"光明左使",instructor:"魔功教頭",guard:"聖火令護衛",bard:"說書信徒",vault:"魔藏閣看守",rank:"論功護法"},
};

const NPC_ROLE_DESC = {
  leader:"門派最高象徵，主持重大劇情與掌門更迭（功能開發中）",
  elder:"傳授高階內功與武學，門派貢獻與修為足夠時可請益（功能開發中）",
  enforcer:"維護門規紀律，處理殺戮值過高或違反門規的懲處（功能開發中）",
  clerk:"門派日常任務發布者，可委託前往魔教勢力範圍剿敵，回報後獲得門派貢獻度",
  quarter:"門派貢獻度兌換點，換取專屬裝備、秘笈與稱號（功能開發中）",
  smith:"提供裝備維修、拆解與強化，門派專屬神兵鍛造之處（功能開發中）",
  healer:"販售療傷回內藥物，解除中毒、內傷等異常狀態（功能開發中）",
  senior:"門派實力排名之首，可向其挑戰爭奪大弟子頭銜（功能開發中）",
  instructor:"木人樁教習所在，練習連段、測試傷害輸出（功能開發中）",
  guard:"駐守門派入口，警戒生人與殺戮值過高者",
  bard:"交代門派歷史與江湖八卦，亦可辦理往返傳送（功能開發中）",
  vault:"深藏不露，唯有奇遇或極高機緣才能窺見絕世武學線索",
  rank:"憑門派貢獻度與材料，為你考核晉升門派地位，由外門弟子一路晉升至掌門",
};

const NPC_REGIONS = [
  {region:"前院（接待與後勤）", roles:["clerk","quarter","smith","healer"]},
  {region:"中庭（修煉與日常）", roles:["senior","instructor","guard","bard"]},
  {region:"大殿／後山（核心掌權與禁地）", roles:["leader","elder","enforcer","vault","rank"]},
];

function renderQuest(){
  if(!S.quest){
    return `<div class="wxg-panel"><div class="wxg-panel-head"><span class="dot"></span><h3>目前無委託任務</h3></div>
      <div class="wxg-hint">尚未接取任務。到「地圖 → 各大門派 → 前往本門 → 知客」處，可委託剿滅魔教勢力，完成後回報可獲得門派貢獻度。</div></div>`;
  }
  const done = S.quest.killsDone>=S.quest.killsNeeded;
  return `
    <div class="wxg-panel active-main">
      <div class="wxg-panel-head"><span class="dot"></span><h3>剿滅魔教：${S.quest.zoneName}</h3>${done?'<span class="wxg-tag gold">可回報</span>':''}</div>
      <div class="wxg-row"><span>目前進度</span><b>${S.quest.killsDone} / ${S.quest.killsNeeded}</b></div>
      <div class="wxg-progress-wrap"><div class="wxg-progress crimson" style="width:${Math.min(100,S.quest.killsDone/S.quest.killsNeeded*100)}%"></div></div>
      <div class="wxg-row" style="margin-top:6px;"><span>完成獎勵</span><b>門派貢獻度 +${S.quest.reward}</b></div>
      <div class="wxg-hint" style="margin-top:8px;">${done?`已達成！請回本門找知客回報任務。`:`請前往「${S.quest.zoneName}」繼續剿滅魔教爪牙。`}</div>
    </div>`;
}

function renderMap(){
  const subTabs = `
    <div class="wxg-subtabs">
      <div class="wxg-subtab ${S.mapSubTab==='town'?'active':''}" data-mapsub="town">金凌城</div>
      <div class="wxg-subtab ${S.mapSubTab==='sects'?'active':''}" data-mapsub="sects">各大門派</div>
      <div class="wxg-subtab ${S.mapSubTab==='zones'?'active':''}" data-mapsub="zones">魔教勢力（狩獵區）</div>
    </div>`;

  if(S.mapSubTab==="town"){
    const inTown = S.location==="jinling";
    const travelCard = `<div class="wxg-panel ${inTown?'active-main':''}">
      <div class="wxg-panel-head"><span class="dot"></span><h3>金凌城城門</h3>${inTown?'<span class="wxg-tag gold">已抵達</span>':''}</div>
      <div class="wxg-hint">${inTown?'你人在城中，可自由與各家商戶交易。':'你目前在外地，需先動身前往金凌城，才能與城內商家交易。'}</div>
      ${!inTown?`<button class="wxg-btn gold small" data-gotown="1" style="margin-top:8px;">前往金凌城</button>`:''}
    </div>`;
    const npcs = TOWN_NPCS.map(n=>{
      let extra = "";
      if(!inTown){
        extra = `<div class="wxg-hint" style="margin-top:6px; color:#8a7d63;">（需先前往金凌城才能交易）</div>`;
      } else if(n.action==="sell"){
        const sellable = S.inventory.map((it,idx)=>({it,idx})).filter(x=>x.it.kind==="equipment");
        extra = sellable.length>0 ? `
          <div class="wxg-pickitem-list" style="margin-top:8px;">
            ${sellable.map(({it,idx})=>{
              const val = equipSellValue(it);
              return `<div class="wxg-pickitem"><div>${rarityNameHtml(it)} ${it.locked?'🔒':''}<div class="wxg-hint" style="margin-top:2px;">${it.slot}</div></div><button class="wxg-btn small" data-sellitem="${idx}" ${it.locked?'disabled title="已鎖定"':''}>${it.locked?'已鎖定':`賣出 ${val}兩`}</button></div>`;
            }).join("")}
          </div>` : `<div class="wxg-hint" style="margin-top:6px;">背包空空如也，沒有可賣的裝備</div>`;
      } else if(n.action==="forge"){
        const expNext = professionExpToNext();
        const allEquip = [
          ...Object.entries(S.equipment).filter(([slot,it])=>it).map(([slot,it])=>({it, label:"（穿戴中）"})),
          ...S.inventory.map(it=>it).filter(it=>it.kind==="equipment").map(it=>({it, label:"（背包）"})),
        ].filter(x=> tierAwakenSlots(x.it) > (x.it.awakened||[]).length);
        const list = allEquip.length>0 ? allEquip.map(({it,label})=>{
          const cost = awakenCost(it);
          const allowed = canAwakenItem(it);
          const afford = S.gold>=cost.gold && (S.materials[cost.mat]||0)>=cost.amt;
          const disabled = !allowed || !afford;
          return `<div class="wxg-pickitem" style="flex-direction:column; align-items:stretch;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>${rarityNameHtml(it)} <span class="wxg-hint" style="display:inline;">${label}</span></div>
              <button class="wxg-btn gold small" data-forgeitem="${it===S.equipment[it.slot]?'eq:'+it.slot:'bag:'+S.inventory.indexOf(it)}" ${disabled?'disabled':''}>開光（${cost.mat}x${cost.amt}、${cost.gold}兩）</button>
            </div>
            ${!allowed?`<div class="wxg-hint" style="color:#ff6b4a;">職業等級不足，無法開光此裝備</div>`:''}
            ${(it.awakened||[]).length>0?`<div class="wxg-hint">已有詞條：${it.awakened.map(a=>`${a.stat}+${a.value}`).join('、')}</div>`:''}
          </div>`;
        }).join("") : `<div class="wxg-hint" style="margin-top:6px;">目前沒有可開光的裝備（開光欄位已滿或身上無裝備）</div>`;
        extra = `
          <div class="wxg-row" style="margin-top:8px;"><span>煉器職業等級</span><b>Lv.${S.profession.level}</b></div>
          ${S.profession.level<7?`<div class="wxg-progress-wrap"><div class="wxg-progress crimson" style="width:${Math.min(100,S.profession.exp/expNext*100)}%"></div></div><div class="wxg-hint">經驗 ${S.profession.exp} / ${expNext}</div>`:`<div class="wxg-hint" style="color:var(--gold-lt);">已達最高等級，可開光七品玉裝</div>`}
          <div class="wxg-hint">目前可開光：${maxJadeGrade()>0?`木～金裝、一～${["","一","二","三","四","五","六","七"][maxJadeGrade()]}品玉裝`:`木～${TIER_LIST[maxAwakenTierIdx()+1]?.name||"銅"}裝（尚無法開玉裝）`}</div>
          <div class="wxg-pickitem-list" style="margin-top:8px;">${list}</div>
        `;
      } else if(n.action==="shop"){
        extra = `<div class="wxg-pickitem-list" style="margin-top:8px;">
          ${CONSUMABLES.map(c=>`<div class="wxg-pickitem">
            <div><b>${c.name}</b><div class="wxg-hint" style="margin-top:2px;">${c.desc}</div></div>
            <button class="wxg-btn gold small" data-buyitem="${c.id}" ${S.gold<c.price?'disabled':''}>${c.price} 兩</button>
          </div>`).join("")}
        </div>`;
      } else {
        extra = `<button class="wxg-btn small" disabled style="margin-top:8px;">功能開發中</button>`;
      }
      return `<div class="wxg-panel"><div class="wxg-panel-head"><span class="dot"></span><h3>${n.name}</h3></div>
        <div class="wxg-hint">${n.desc}</div>${extra}</div>`;
    }).join("");
    return subTabs + `<div class="wxg-hint" style="margin-bottom:8px;">金凌城，中原第一大城，江湖人往來補給、交易、聽消息的必經之地。目前身上有 <b style="color:var(--gold-lt)">${S.gold}</b> 兩。</div>` + travelCard + npcs;
  }

  if(S.mapSubTab==="sects"){
    if(!S.visitingSect){
      const rows = Object.entries(SECTS).map(([key,s])=>{
        const isMine = key===S.sectKey;
        return `<div class="wxg-panel ${isMine?'active-main':''}">
          <div class="wxg-panel-head"><span class="dot"></span><h3>${s.name}</h3>${isMine?'<span class="wxg-tag gold">本門</span>':''}
            <button class="wxg-btn gold small" data-visitsect="${key}" style="margin-left:auto;">前往</button>
          </div>
          <div class="wxg-hint">限定兵刃：${s.weapon}　門派機制：${s.passive}</div>
        </div>`;
      }).join("");
      return subTabs + `<div class="wxg-hint" style="margin-bottom:8px;">江湖六大門派據點，點「前往」可進入拜訪，與駐守的各路人物交談。</div>` + rows;
    }
    const key = S.visitingSect;
    const s = SECTS[key];
    const titles = SECT_NPC_TITLES[key];
    const isMine = key===S.sectKey;
    const rankPanel = isMine ? `
      <div class="wxg-panel active-main">
        <div class="wxg-panel-head"><span class="dot"></span><h3>本門地位</h3></div>
        <div class="wxg-row"><span>目前位階</span><b>${RANK_TABLE[S.sectRank].name}</b></div>
        <div class="wxg-row"><span>門派貢獻度</span><b>${S.sectContribution}</b></div>
        <div class="wxg-hint">找${titles.rank}可用貢獻度晉升位階。</div>
      </div>` : "";
    const regions = NPC_REGIONS.map(r=>`
      <div class="wxg-hint" style="color:var(--gold-lt); margin-top:12px; letter-spacing:1px;">${r.region}</div>
      <div class="wxg-slotgrid">
        ${r.roles.map(role=>`<div class="wxg-medal" data-npctalk="${key}:${role}" style="cursor:pointer;">
          <div class="ring">${titles[role][0]}</div>
          <div style="padding-top:2px;">${titles[role]}<br><span style="color:#c9bd9e;font-size:10.5px">點擊交談</span></div>
        </div>`).join("")}
      </div>
    `).join("");
    return subTabs + `
      <div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot"></span><h3>${s.name}</h3>${isMine?'<span class="wxg-tag gold">本門</span>':''}<button class="wxg-btn small" data-leavesect="1" style="margin-left:auto;">返回列表</button></div>
        <div class="wxg-hint">限定兵刃：${s.weapon}　門派機制：${s.passive}</div>
      </div>
      ${rankPanel}
      ${regions}
    `;
  }

  // zones
  const inTown = S.location==="jinling";
  const townCard = `<div class="wxg-panel ${inTown?'active-main':''}">
    <div class="wxg-panel-head"><span class="dot"></span><h3>金凌城（安全區）</h3>${inTown?'<span class="wxg-tag gold">目前所在</span>':''}</div>
    <div class="wxg-hint">回城休整，氣血內力自動恢復，無法在此戰鬥。</div>
    ${!inTown?`<button class="wxg-btn small" data-gotown="1" style="margin-top:8px;">返回金凌城</button>`:''}
  </div>`;
  const zoneCards = HUNTING_ZONES.map(z=>{
    const active = S.location===z.id;
    return `<div class="wxg-panel ${active?'active-main':''}">
      <div class="wxg-panel-head martial"><span class="dot"></span><h3>${z.name}</h3><span class="wxg-tag crimson">${z.tag}</span>${active?'<span class="wxg-tag gold">狩獵中</span>':''}</div>
      <div class="wxg-hint">${z.desc}</div>
      <div class="wxg-row" style="margin-top:6px;"><span>等級加成</span><b>+${z.levelMod}</b></div>
      <div class="wxg-row"><span>常見敵人</span><b style="font-weight:400; font-family:inherit; color:var(--dim-text);">${z.monsters.join("、")}</b></div>
      ${!active?`<button class="wxg-btn crimson small" data-zone="${z.id}" style="margin-top:8px;">前往此地狩獵</button>`:''}
    </div>`;
  }).join("");
  return subTabs + `<div class="wxg-hint" style="margin-bottom:8px;">魔教勢力範圍分布，等級加成越高代表敵人越強、掉落也越好。</div>` + townCard + zoneCards;
}

function renderSectPick(){
  return `
    <div class="wxg-banner"><div class="wxg-title">江湖夜行<small>請選擇門派入門</small></div></div>
    <div class="wxg-sectpick">
      ${Object.entries(SECTS).map(([key,s])=>`
        <div class="wxg-sectcard" data-sect="${key}">
          <div class="wxg-sect-icon">${SECT_ICONS[key]}</div>
          <h4>${s.name}</h4>
          <p>限定兵刃：${s.weapon}</p>
          <p>${s.passive}</p>
          <p style="margin-top:6px; font-size:10px;"><span style="color:${PRIMARY_COLORS.臂力}">臂${s.base.臂力}</span>／<span style="color:${PRIMARY_COLORS.身法}">身${s.base.身法}</span>／<span style="color:${PRIMARY_COLORS.內息}">息${s.base.內息}</span>／<span style="color:${PRIMARY_COLORS.罡氣}">罡${s.base.罡氣}</span>／<span style="color:${PRIMARY_COLORS.體魄}">體${s.base.體魄}</span></p>
        </div>`).join("")}
    </div>
  `;
}
