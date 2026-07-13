function render(){
  const root = document.getElementById('wxgRoot');
  if(!S){ root.innerHTML = `<div class="wxg-noise"></div>` + renderSectPick(); bindSectPick(); updateDebugOverlay(); return; }
  recalc(false);
  const prevLogEl = document.getElementById('wxgLogScroll');
  const prevScrollTop = prevLogEl ? prevLogEl.scrollTop : 0;
  const prevPickerModalEl = document.getElementById('wxgPickerModalScroll');
  const prevPickerModalScroll = prevPickerModalEl ? prevPickerModalEl.scrollTop : 0;
  const prevPickerListEl = document.getElementById('wxgPickerListScroll');
  const prevPickerListScroll = prevPickerListEl ? prevPickerListEl.scrollTop : 0;
  root.innerHTML = `
    <div class="wxg-noise"></div>
    <div class="wxg-banner">
      <div class="wxg-title">江湖夜行<small><span class="wxg-title-badge" data-titletip="1">「${S.title}」</span>${S.sect.name}弟子 · 主修「${INTERNAL_POOL.find(t=>t.id===S.activeInternal).name}」第${getInternalTier(S.activeInternal)+1}層 · 目前所在：${locationName()}</small></div>
      <div class="wxg-stats-strip">
        <span class="wxg-respill"><span class="icon">💰</span>錢財 <b>${formatMoney(S.gold)}</b></span>
        <span class="wxg-respill"><span class="icon">⚔️</span>擊殺 <b>${S.killCount}</b></span>
        <span class="wxg-respill"><span class="icon">☯</span>修為 <b>${S.qiPool}</b></span>
        ${S.buffAtkTicks>0?`<span class="wxg-respill" style="color:var(--gold-lt); border-color:var(--gold-dk);"><span class="icon">💊</span>培元丹 <b>${S.buffAtkTicks}</b></span>`:''}
        ${S.location!=="jinling"?`<button class="wxg-btn crimson small" data-gotown="1">回城</button>`:''}
      </div>
    </div>
    <div class="wxg-layout">
      <div class="wxg-side ${S.navCollapsed?'collapsed':''}">${renderNavList()}${renderSide()}</div>
      <div class="wxg-content">
        ${renderStage()}
        <div class="wxg-main">${renderTab()}</div>
      </div>
    </div>
    ${S.pickerSlot?renderPicker():""}
    ${S.dialogueNpc?renderNpcDialogue():""}
    ${S.warningModal?renderWarningModal():""}
  `;
  const newLogEl = document.getElementById('wxgLogScroll');
  if(newLogEl && prevScrollTop>4) newLogEl.scrollTop = prevScrollTop;
  const newPickerModalEl = document.getElementById('wxgPickerModalScroll');
  if(newPickerModalEl && prevPickerModalScroll>4) newPickerModalEl.scrollTop = prevPickerModalScroll;
  const newPickerListEl = document.getElementById('wxgPickerListScroll');
  if(newPickerListEl && prevPickerListScroll>4) newPickerListEl.scrollTop = prevPickerListScroll;
  bindGlobal();
  updateDebugOverlay();
}

function renderPicker(){
  const slot = S.pickerSlot;
  const cur = S.equipment[slot];
  // 用開窗當下拍的快照決定清單與順序，戰鬥中新掉落的裝備不會插進來打亂正在看的內容，
  // 關閉再重新打開才會看到最新掉落；已被賣掉／裝備走的項目會自然從清單消失。
  const candidates = (S.pickerSnapshot||[])
    .map(it=>({it, idx:S.inventory.indexOf(it)}))
    .filter(x=>x.idx>=0);
  const curBonus = cur ? bonusTextHtml(cur.bonus) : "（無）";
  const rows = candidates.length>0 ? candidates.map(({it,idx})=>{
    const cmp = compareBonusHtml(it, cur);
    return `<div class="wxg-pickitem" data-pickitem="${idx}" style="flex-direction:column; align-items:stretch;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>${rarityNameHtml(it)} ${it.locked?'<span title="已鎖定">🔒</span>':''}</div>
        <div style="display:flex; gap:6px;">
          <button class="wxg-btn small" data-locktoggle="${idx}" style="padding:3px 8px;">${it.locked?'解鎖':'鎖定'}</button>
          <button class="wxg-btn small" data-pickequip="${idx}">裝備</button>
          ${!it.locked?`<button class="wxg-btn crimson small" data-pickersell="${idx}">賣掉（${formatMoney(equipSellValue(it))}）</button>`:''}
        </div>
      </div>
      <div class="wxg-hint" style="margin:4px 0 2px; color:var(--gold-lt);">與目前裝備比較：</div>
      ${cmp}
    </div>`;
  }).join("") : `<div class="wxg-hint">背包內沒有可替換的「${slot}」道具，繼續戰鬥有機率掉落</div>`;

  return `
  <div class="wxg-modal-overlay" data-closepicker="1">
    <div class="wxg-modal" data-stop="1" id="wxgPickerModalScroll">
      <div class="wxg-panel-head"><span class="dot"></span><h3>選擇「${slot}」裝備</h3></div>
      <div class="wxg-hint" style="margin-bottom:8px;">目前裝備：${cur?rarityNameHtml(cur):"（無）"}　${curBonus} ${cur&&cur.locked?'🔒':''}</div>
      <div class="wxg-pickitem-list" id="wxgPickerListScroll">${rows}</div>
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

// 敵人素質懸浮視窗的內容（滑鼠移到敵人頭像上才顯示，見 events.js 的 data-monsterinfohover）。
function monsterInfoTooltipHtml(m){
  if(!m) return "";
  const statusRows = [];
  if(m.poisonStacks>0) statusRows.push(`<div class="wxg-tip-row"><span>中毒</span><b>${m.poisonStacks} 層（每回合 ${m.poisonStacks*4} 傷害）</b></div>`);
  if(m.bleedStacks>0) statusRows.push(`<div class="wxg-tip-row"><span>流血</span><b>${m.bleedStacks} 層（每回合 ${m.bleedStacks*3} 傷害）</b></div>`);
  if(m.stunned) statusRows.push(`<div class="wxg-tip-row"><span>暈眩</span><b>下回合無法行動</b></div>`);
  if(m.staggerTicks>0) statusRows.push(`<div class="wxg-tip-row"><span>擊退／硬直</span><b>剩 ${m.staggerTicks} 回合</b></div>`);
  if(m.defReduceTicks>0) statusRows.push(`<div class="wxg-tip-row"><span>破防</span><b>防禦力降低，剩 ${m.defReduceTicks} 回合</b></div>`);
  (m.statusEffects||[]).forEach(e=>{
    if(e.kind==="dot_debuff"){
      const label = e.wudangMark || `${e.element||''}屬性中毒／灼傷`;
      statusRows.push(`<div class="wxg-tip-row"><span>${label}</span><b>每回合 ${e.dmgPerTick} 傷害${e.debuffValue?`，${e.debuffStat}降低 ${Math.round(e.debuffValue*100)}%`:''}，剩 ${e.remainingTicks} 回合</b></div>`);
    }
  });
  return `
    <div class="wxg-tip-title" style="color:var(--gold-lt);">${m.name}${m.isBoss?'　【首領】':''}</div>
    <div class="wxg-tip-row"><span>等級</span><b>Lv.${m.level}</b></div>
    <div class="wxg-tip-row"><span>氣血</span><b>${Math.round(m.hp)} / ${m.hpMax}</b></div>
    <div class="wxg-tip-row"><span>攻擊力</span><b>${m.atk}</b></div>
    <div class="wxg-tip-row"><span>防禦力</span><b>${m.def}</b></div>
    ${statusRows.length>0?`<div class="wxg-tip-title" style="margin-top:5px;">目前異常狀態</div>${statusRows.join("")}`:`<div class="wxg-tip-row"><span>目前沒有異常狀態</span></div>`}
  `;
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
  heifeng:`<svg viewBox="0 0 500 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyHf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1c2416"/><stop offset="55%" stop-color="#10140c"/><stop offset="100%" stop-color="#080907"/>
      </linearGradient>
      <radialGradient id="fireHf" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f3a03c"/><stop offset="100%" stop-color="#c9622a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="500" height="150" fill="url(#skyHf)"/>
    <path d="M0 95 Q70 78 140 96 Q220 74 300 94 Q380 76 460 94 L500 90 L500 150 L0 150Z" fill="#141a10" opacity="0.75"/>
    <path d="M0 118 Q60 92 120 116 Q180 86 260 114 Q330 90 400 116 Q460 96 500 118 L500 150 L0 150Z" fill="#1a1f14"/>
    <path d="M420 104 L420 58 L414 58 L390 104Z" fill="#0d0f0a"/>
    <path d="M420 58 L436 38 L420 38Z" fill="#0d0f0a"/>
    <path d="M70 116 L70 82 L64 82 L48 116Z" fill="#10140c"/>
    <path d="M64 82 L78 60 L64 60Z" fill="#10140c"/>
    <circle cx="120" cy="128" r="26" fill="url(#fireHf)"/>
    <circle cx="120" cy="130" r="9" fill="#c9622a" opacity="0.75"/>
    <circle cx="120" cy="130" r="4" fill="#f3d878" opacity="0.9"/>
    <circle cx="112" cy="116" r="1" fill="#f3a03c" opacity="0.8"/>
    <circle cx="128" cy="108" r="0.8" fill="#f3a03c" opacity="0.6"/>
    <circle cx="118" cy="98" r="0.7" fill="#f3a03c" opacity="0.5"/>
    <ellipse cx="250" cy="145" rx="260" ry="10" fill="#000" opacity="0.4"/>
  </svg>`,
  xueyu:`<svg viewBox="0 0 500 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyXy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4a1712"/><stop offset="55%" stop-color="#22090b"/><stop offset="100%" stop-color="#0d0403"/>
      </linearGradient>
      <radialGradient id="moonXy" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#d1564c"/><stop offset="100%" stop-color="#a5332c" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="500" height="150" fill="url(#skyXy)"/>
    <circle cx="90" cy="35" r="42" fill="url(#moonXy)"/>
    <circle cx="90" cy="35" r="17" fill="#a5332c" opacity="0.85"/>
    <path d="M0 118 L500 118 L500 150 L0 150Z" fill="#1c0806" opacity="0.6"/>
    <path d="M170 120 L170 50 L162 50 L162 120Z" fill="#160705"/>
    <path d="M215 120 L215 40 L205 40 L205 120Z" fill="#160705"/>
    <path d="M260 120 L260 50 L252 50 L252 120Z" fill="#160705"/>
    <path d="M155 50 L285 50 L273 36 L167 36Z" fill="#20090a"/>
    <path d="M162 50 L170 50 L166 42Z" fill="#3a1210" opacity="0.6"/>
    <path d="M205 40 L215 40 L210 30Z" fill="#3a1210" opacity="0.6"/>
    <path d="M252 50 L260 50 L256 42Z" fill="#3a1210" opacity="0.6"/>
    <path d="M162 62 Q160 90 164 118" stroke="#3a1210" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M252 62 Q250 90 254 118" stroke="#3a1210" stroke-width="1" fill="none" opacity="0.5"/>
    <ellipse cx="250" cy="130" rx="220" ry="16" fill="#5c1a15" opacity="0.35"/>
    <ellipse cx="250" cy="146" rx="260" ry="10" fill="#000" opacity="0.45"/>
  </svg>`,
  jile:`<svg viewBox="0 0 500 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyJc" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a1240"/><stop offset="55%" stop-color="#1c0d26"/><stop offset="100%" stop-color="#0c0810"/>
      </linearGradient>
      <radialGradient id="glowJc" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#5eab88"/><stop offset="100%" stop-color="#5eab88" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="500" height="150" fill="url(#skyJc)"/>
    <path d="M0 105 L45 65 L95 100 L145 55 L205 98 L265 68 L325 102 L385 58 L435 98 L500 72 L500 150 L0 150 Z" fill="#241130" opacity="0.6"/>
    <path d="M0 118 L50 72 L100 114 L150 62 L210 112 L270 78 L330 116 L390 68 L440 112 L500 82 L500 150 L0 150Z" fill="#1a0f22"/>
    <ellipse cx="100" cy="132" rx="240" ry="20" fill="#3f7d63" opacity="0.22"/>
    <ellipse cx="380" cy="128" rx="150" ry="14" fill="#8a6d9b" opacity="0.16"/>
    <circle cx="150" cy="55" r="14" fill="url(#glowJc)"/>
    <circle cx="150" cy="55" r="3" fill="#8fe0b8" opacity="0.9"/>
    <circle cx="330" cy="70" r="10" fill="url(#glowJc)"/>
    <circle cx="330" cy="70" r="2.2" fill="#8fe0b8" opacity="0.8"/>
    <circle cx="420" cy="90" r="10" fill="#8a6d9b" opacity="0.2"/>
    <circle cx="420" cy="90" r="2.6" fill="#c9a8e0" opacity="0.8"/>
    <circle cx="60" cy="100" r="1.6" fill="#8fe0b8" opacity="0.7"/>
    <circle cx="260" cy="118" r="1.4" fill="#8fe0b8" opacity="0.6"/>
    <ellipse cx="250" cy="146" rx="260" ry="10" fill="#000" opacity="0.4"/>
  </svg>`,
};

// 新的 6 個狩獵區還沒有各自手繪的戰鬥背景 SVG（見 ZONE_SCENES），先借用氛圍最接近的既有
// 3 張場景頂著用，之後有空再個別畫新場景。
const ZONE_BG_FALLBACK = {canglang:"jile", wanshe:"jile", tiansha:"xueyu", youming:"xueyu", fentian:"heifeng", mozong:"jile"};
function zoneBgClass(){
  if(S.location==="jinling") return "jinling";
  if(S.location==="heifeng") return "heifeng";
  if(S.location==="xueyu") return "xueyu";
  if(S.location==="jile") return "jile";
  if(ZONE_BG_FALLBACK[S.location]) return ZONE_BG_FALLBACK[S.location];
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

// 武當敵人身上的持續性狀態（印記DOT／破防／硬直），每次 render 都要顯示，不是只有觸發那個
// tick 才閃一下——DOT 用 firedCount/totalDuration 顯示「已經發作幾次／總共幾回合」的進度。
function wudangMonsterDebuffHtml(m){
  const rows = [];
  (m.statusEffects||[]).forEach(e=>{
    if(e.kind!=="dot_debuff") return;
    const fired = Math.min(e.firedCount||0, e.totalDuration||e.remainingTicks||1);
    rows.push(`<div class="wxg-tag" style="margin-top:3px; border-color:#c084fc; color:#c084fc;">${e.wudangMark||'內傷'}　${fired}/${e.totalDuration||'?'}回合</div>`);
  });
  if(m.defReduceTicks>0){
    rows.push(`<div class="wxg-tag" style="margin-top:3px; border-color:#e2685c; color:#e2685c;">破防（防禦-${Math.round((m.wudangGuardBreakPct||0.25)*100)}%）　剩餘${m.defReduceTicks}回合</div>`);
  }
  if(m.staggerTicks>0){
    rows.push(`<div class="wxg-tag" style="margin-top:3px; border-color:#d1564c; color:#d1564c;">硬直中　剩餘${m.staggerTicks}回合</div>`);
  }
  return rows.join("");
}

// 撞擊感文字（身法閃避／禪定免疫／無敵化解）改灰字「MISS」風格，跟一般傷害飄字（黃/紅字）區分開。
function isMissFloatText(t){
  return t==="身法閃避！" || t==="禪定・免疫！" || t==="攻擊被無敵化解";
}

// 武當專用：玩家卡＋最多幾張怪物卡並排的戰鬥卡片列，取代掉「地圖走位、頭像面對面」的舊版
// 對決畫面——角色固定站在卡片裡不移動，只靠 hit-flash／hit-knock 之類的簡單受擊動畫表現戰鬥
// 節奏，之後要疊更花俏的特效直接加在卡片的頭像上即可，不用再管座標系統。其他門派因為戰鬥
// 引擎還是單一目標（S.monster），沿用下面 renderStage() 原本的兩人對決版面。
function renderWudangArenaStage(){
  const zoneKey = zoneBgClass();
  const sceneSvg = `<div class="wxg-scene">${ZONE_SCENES[zoneKey]}</div>`;
  const zone = HUNTING_ZONES.find(z=>z.id===S.location) || HUNTING_ZONES[0];
  const target = firstAliveMonster();
  const sectIcon = portraitImgHtml(SECT_PORTRAIT[S.sectKey]);

  const playerHitCls = S.hitPlayer ? ' hit-knock-self hit-flash' : '';
  const wudangShieldBuff = (S.statusEffects||[]).find(e=>e.shieldPool>0);

  const playerCard = `
    <div class="wxg-ccard wxg-ccard-player">
      ${S.floatPlayer?`<div class="wxg-float self${isMissFloatText(S.floatPlayer)?' miss':''}">${S.floatPlayer}</div>`:""}
      <div class="wxg-portrait wxg-idle-bob${playerHitCls}">${sectIcon}</div>
      <div class="wxg-ccard-name">「${S.title}」${S.sect.name}弟子</div>
      <div class="wxg-gauge-wrap">
        ${pillbar('氣','hp',S.hp,S.hpMax,'hp',S.hitPlayer?'gauge-flash':'')}
        ${pillbar('內','mp',S.mp,S.mpMax,'mp')}
        ${pillbar('怒','rage',S.rage,100,'rage')}
        ${wudangShieldBuff ? pillbar('盾','shield',wudangShieldBuff.shieldPool,wudangShieldBuff.shieldPoolMax,'shield') : ''}
      </div>
    </div>`;

  const mobCards = (S.monsters||[]).filter(m=>m.hp>0).map(m=>{
    const isTarget = target===m;
    const hostile = m.aggressive || m.aggroed;
    const enemyHitCls = (isTarget && S.hitEnemy) ? (' hit-knock-enemy hit-flash'+(S.hitEnemyCrit?' hit-crit':'')) : '';
    const monsterIcon = portraitImgHtml(m.isBoss?BOSS_PORTRAIT:MONSTER_PORTRAIT);
    const aggroTag = m.isBoss ? '' : (hostile ? `<span class="wxg-map-mob-tag hostile">${m.aggroed&&!m.aggressive?'已激怒':'主動'}</span>` : `<span class="wxg-map-mob-tag passive">尚未參戰</span>`);
    const stanceTag = isTarget ? `<div class="wxg-tag" style="margin-top:3px; ${m.stance==='架招'?'border-color:#4dd0c8;color:#4dd0c8;':m.stance==='虛招'?'border-color:#e2685c;color:#e2685c;':'border-color:#d1564c;color:#d1564c;'}">招式：${m.stance||'實招'}</div>` : '';
    const debuffRows = wudangMonsterDebuffHtml(m);
    return `<div class="wxg-ccard wxg-ccard-enemy${m.isBoss?' boss':''}${hostile?' hostile':''}${isTarget?' target':''}" data-monsterinfohover="1" data-mobuid="${m.uid}">
      ${isTarget && S.floatEnemy?`<div class="wxg-float foe${S.hitEnemyCrit?' crit':''}">${S.floatEnemy}</div>`:""}
      <div class="wxg-portrait enemy wxg-idle-bob${enemyHitCls}">${monsterIcon}</div>
      <div class="wxg-ccard-name">${m.isBoss?'👑 ':''}${m.name}${aggroTag}</div>
      <div class="wxg-fsub">Lv.${m.level}</div>
      ${stanceTag}
      ${debuffRows}
      <div class="wxg-map-mob-hpbar"><div class="wxg-map-mob-hpfill" style="width:${Math.max(0,m.hp/m.hpMax*100)}%;"></div></div>
    </div>`;
  }).join("");

  return `
  <div class="wxg-arena-stage">
    ${sceneSvg}
    <div class="wxg-corner tl"></div><div class="wxg-corner tr"></div><div class="wxg-corner bl"></div><div class="wxg-corner br"></div>
    <div class="wxg-card-row">
      ${playerCard}
      <div class="wxg-card-row-enemies">${mobCards}</div>
    </div>
  </div>
  <div class="wxg-map-hud">
    <div class="wxg-vs-col" style="flex:1;">
      <div class="wxg-vs" style="font-size:14px;">目前狩獵區：${zone.name}</div>
      ${S.stageEffects && S.stageEffects.length>0 ? S.stageEffects.map((t,i)=>`<div class="wxg-effect-banner" style="animation-delay:${i*0.15}s;">${t}</div>`).join("") : ""}
    </div>
  </div>`;
}

function renderStage(){
  if(S.sectKey==="wudang" && S.location!=="jinling" && !S.visitingSect) return renderWudangArenaStage();
  const sectIcon = portraitImgHtml(SECT_PORTRAIT[S.sectKey]);
  const zoneKey = zoneBgClass();
  const sceneSvg = zoneKey==="jinling"
    ? `<div class="wxg-scene bg-photo" style="background-image:url('${JINLING_BG_IMG}')"></div>`
    : `<div class="wxg-scene">${ZONE_SCENES[zoneKey]}</div>`;
  if(S.location==="jinling"){
    return `
    <div class="wxg-stage bg-${zoneKey}">
      ${sceneSvg}
      <div class="wxg-corner tl"></div><div class="wxg-corner tr"></div><div class="wxg-corner bl"></div><div class="wxg-corner br"></div>
      <div class="wxg-fighter">
        <div class="wxg-portrait-wrap wxg-idle-bob">
          <div class="wxg-portrait big">${sectIcon}</div>
          <div class="wxg-ground-shadow"></div>
        </div>
        <div class="wxg-fname">「${S.title}」${S.sect.name}弟子</div>
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
        <div class="wxg-portrait-wrap wxg-idle-bob" style="animation-delay:.6s;"><div class="wxg-portrait big enemy" style="opacity:.25;">${portraitImgHtml(MONSTER_PORTRAIT)}</div></div>
        <div class="wxg-fname" style="color:#8a7d63;">（尚無目標）</div>
      </div>
    </div>`;
  }
  const m = S.monster || (S.monsters && S.monsters[0]);
  const monsterIcon = portraitImgHtml(m && m.isBoss ? BOSS_PORTRAIT : MONSTER_PORTRAIT);
  const wudangStanceTag = (S.sectKey==="wudang" && m && m.hp>0) ? `<div class="wxg-tag" style="margin-top:3px; ${m.stance==='架招'?'border-color:#4dd0c8;color:#4dd0c8;':m.stance==='虛招'?'border-color:#e2685c;color:#e2685c;':'border-color:#d1564c;color:#d1564c;'}">對方招式：${m.stance||'實招'}</div>` : '';
  const wudangDebuffRows = (S.sectKey==="wudang" && m && m.hp>0) ? wudangMonsterDebuffHtml(m) : '';
  const wudangShieldBuff = S.sectKey==="wudang" ? (S.statusEffects||[]).find(e=>e.shieldPool>0) : null;
  const zone = HUNTING_ZONES.find(z=>z.id===S.location) || HUNTING_ZONES[0];
  const stageShake = (S.hitEnemyCrit)?' wxg-stage-shake':'';
  // 攻擊方頭像走過去撞防守方（wxg-arena-avatar 的 walking），防守方頭像原地受擊反饋
  // （wxg-portrait 的 hit-knock/hit-flash）——兩層分開後不會再互搶同一個 animation。
  const playerWalking = S.hitEnemy ? ' walking' : '';
  const enemyWalking = S.hitPlayer ? ' walking' : '';
  const playerHitCls = S.hitPlayer ? ' hit-knock-self hit-flash' : '';
  const enemyHitCls = S.hitEnemy ? (' hit-knock-enemy hit-flash'+(S.hitEnemyCrit?' hit-crit':'')) : '';
  const deathGhost = S.deathFlash ? `<div class="wxg-death-ghost">${portraitImgHtml(S.deathFlash.isBoss?BOSS_PORTRAIT:MONSTER_PORTRAIT)}</div>` : '';
  return `
  <div class="wxg-stage bg-${zoneKey}${stageShake}">
    ${sceneSvg}
    <div class="wxg-corner tl"></div><div class="wxg-corner tr"></div><div class="wxg-corner bl"></div><div class="wxg-corner br"></div>
    <div class="wxg-arena-avatar self wxg-idle-bob${playerWalking}">
      ${S.floatPlayer?`<div class="wxg-float self${isMissFloatText(S.floatPlayer)?' miss':''}">${S.floatPlayer}</div>`:""}
      <div class="wxg-portrait big${playerHitCls}">${sectIcon}</div>
      <div class="wxg-ground-shadow"></div>
    </div>
    <div class="wxg-arena-avatar foe wxg-idle-bob${enemyWalking}" style="animation-delay:.6s;"${m?` data-monsterinfohover="1"`:''}>
      ${S.floatEnemy?`<div class="wxg-float foe${S.hitEnemyCrit?' crit':''}">${S.floatEnemy}</div>`:""}
      <div class="wxg-portrait big enemy${enemyHitCls}">${monsterIcon}</div>
      <div class="wxg-ground-shadow"></div>
      ${deathGhost}
    </div>
    <div class="wxg-fighter">
      <div class="wxg-fname">「${S.title}」${S.sect.name}弟子</div>
      <div class="wxg-gauge-wrap">
        ${pillbar('氣','hp',S.hp,S.hpMax,'hp',S.hitPlayer?'gauge-flash':'')}
        ${pillbar('內','mp',S.mp,S.mpMax,'mp')}
        ${S.sectKey==="wudang" ? pillbar('怒','rage',S.rage,100,'rage') : ''}
        ${wudangShieldBuff ? pillbar('盾','shield',wudangShieldBuff.shieldPool,wudangShieldBuff.shieldPoolMax,'shield') : ''}
      </div>
    </div>
    <div class="wxg-vs-col">
      <div class="wxg-vs">對　決</div>
      <div class="wxg-stage-hint">目前狩獵區：${zone.name}</div>
      ${S.stageEffects && S.stageEffects.length>0 ? S.stageEffects.map((t,i)=>`<div class="wxg-effect-banner" style="animation-delay:${i*0.15}s;">${t}</div>`).join("") : ""}
    </div>
    <div class="wxg-fighter">
      <div class="wxg-fname">${m?m.name:"—"}</div>
      <div class="wxg-fsub">Lv.${m?m.level:0}</div>
      ${wudangStanceTag}
      ${wudangDebuffRows}
      ${m?`<div class="wxg-stage-hint" style="font-size:10px; opacity:.75;">🖱️ 滑鼠移到頭像查看屬性</div>`:''}
      <div class="wxg-gauge-wrap">
        ${pillbar('氣','en',m?m.hp:0,m?m.hpMax:1,'en',S.hitEnemy?'gauge-flash':'')}
      </div>
    </div>
  </div>`;
}

function renderNavList(){
  const tabColors = {overview:"#d4af37", internal:"#5eab88", martial:"#d1564c", equip:"#a78bd6", map:"#4dd0c8", quest:"#4a86c0", wudanglogic:"#4a86c0", codex:"#f3a03c", settings:"#8a7d63"};
  const tabLabels = {overview:"總覽", internal:"內功", martial:"武學", equip:"裝備", map:"地圖", quest:"任務", wudanglogic:"戰鬥邏輯", codex:"遊戲百科", settings:"設定"};
  const tabIcons = {overview:"📜", internal:"☯", martial:"⚔️", equip:"🎒", map:"🗺️", quest:"📯", wudanglogic:"🧭", codex:"📚", settings:"⚙️"};
  const wudangCondCount = Object.values(S.wudangMoveConditions||{}).filter(c=>c && c.pct).length;
  const badges = {
    overview: "",
    internal: `第${getInternalTier(S.activeInternal)+1}層`,
    martial: `${Object.keys(S.knownMartial).length}招`,
    equip: `${Object.values(S.equipment).filter(Boolean).length}/${SLOT_LIST.length}`,
    map: locationName(),
    quest: S.quest ? (S.quest.killsDone>=S.quest.killsNeeded ? "可回報" : `${S.quest.killsDone}/${S.quest.killsNeeded}`) : "",
    wudanglogic: wudangCondCount>0 ? `${wudangCondCount}條件` : "",
    codex: "",
    settings: "",
  };
  const tabOrder = ["overview","internal","martial","equip","map","quest"];
  if(S.sectKey==="wudang") tabOrder.push("wudanglogic");
  tabOrder.push("codex");
  tabOrder.push("settings");
  const items = tabOrder.map(t=>{
    const c = tabColors[t];
    const active = S.tab===t;
    const badge = badges[t];
    return `<div class="wxg-navitem ${active?'active':''}" data-tab="${t}" style="--navc:${c};">
      <span class="wxg-navicon">${tabIcons[t]}</span>
      <span class="wxg-navlabel">${tabLabels[t]}</span>
      ${badge?`<span class="wxg-navbadge" style="color:${c}; border-color:${c}55;">${badge}</span>`:''}
    </div>`;
  }).join("");
  const hintBubble = (!S.navHintSeen && !S.navCollapsed) ? `<div class="wxg-navhint-bubble">◀ <b>新手提示</b>：點下面的頁籤可以查看<b>武學</b>、<b>裝備</b>、<b>地圖</b>等內容！</div>` : '';
  return `
    ${hintBubble}
    <div class="wxg-navlist ${(!S.navHintSeen && !S.navCollapsed)?'hint':''}">
      <div class="wxg-navcollapse" data-navcollapse="1" title="收合／展開導覽列">${S.navCollapsed?'»':'«'}</div>
      ${items}
    </div>`;
}

// 「戰鬥選項」面板內容（自動吃藥、遇首領自動逃跑），非武當在側欄顯示，武當整合進「戰鬥邏輯」分頁。
function renderAutoHealBody(){
  const hpOptions = CONSUMABLES.filter(c=>c.effect==="healHp"||c.effect==="healFull");
  const mpOptions = CONSUMABLES.filter(c=>c.effect==="healMp"||c.effect==="healFull");
  // 這行冷卻提示戰鬥中每隔幾回合就會出現/消失一次（S.potionCd 歸零又重新倒數），高倍速時
  // 頻率非常高，如果整個 div 直接不渲染，面板高度會跟著一直跳動。改成永遠佔住這個位置、
  // 只是切換 visibility，畫面高度就不會再變化。
  const cdHint = `<div class="wxg-hint" style="color:#e2685c; ${S.potionCd>0?'':'visibility:hidden;'}">戰鬥中服藥冷卻中，還要 ${S.potionCd||0} 回合才能再次服藥（不論自動或手動）。</div>`;
  return `
      <div class="wxg-hint" style="margin-top:0;">氣血／內力低於門檻時，自動使用背包內指定藥品；勾選自動購買後，存量剩 1 瓶會自動補貨 100 瓶。戰鬥中服藥（不論自動或手動）共用 10 回合冷卻，離開戰鬥（金凌城／拜訪門派）不受此限制。</div>
      ${cdHint}
      <div style="margin-top:8px;">
        <div class="wxg-row"><span>氣血低於</span></div>
        <select data-autopct="hp" style="width:100%; background:#100e0a; color:var(--ink-text); border:1px solid #4a3818; border-radius:3px; padding:4px; font-size:11px;">
          ${[10,20,30,40,50,60,70,80,90].map(v=>`<option value="${v}" ${S.autoHeal.hpPct===v?'selected':''}>低於 ${v}%</option>`).join("")}
        </select>
        <select data-autoitem="hp" style="width:100%; margin-top:4px; background:#100e0a; color:var(--ink-text); border:1px solid #4a3818; border-radius:3px; padding:4px; font-size:11px;">
          <option value="">不自動使用</option>
          ${hpOptions.map(c=>`<option value="${c.id}" ${S.autoHeal.hpItem===c.id?'selected':''}>${c.name}</option>`).join("")}
        </select>
        ${S.autoHeal.hpItem?`<div class="wxg-hint" style="margin-top:2px;">效果：${consumableEffectText(CONSUMABLES.find(c=>c.id===S.autoHeal.hpItem))}</div>
        <div class="wxg-hint" style="margin-top:2px;">目前剩餘量：${S.inventory.find(it=>it.kind==="consumable"&&it.refId===S.autoHeal.hpItem)?.qty||0} 瓶</div>`:''}
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
        ${S.autoHeal.mpItem?`<div class="wxg-hint" style="margin-top:2px;">效果：${consumableEffectText(CONSUMABLES.find(c=>c.id===S.autoHeal.mpItem))}</div>
        <div class="wxg-hint" style="margin-top:2px;">目前剩餘量：${S.inventory.find(it=>it.kind==="consumable"&&it.refId===S.autoHeal.mpItem)?.qty||0} 瓶</div>`:''}
        <label style="display:flex; align-items:center; gap:6px; margin-top:5px; font-size:11px; color:var(--dim-text); cursor:pointer;">
          <input type="checkbox" data-autobuy="mp" ${S.autoHeal.mpAutoBuy?'checked':''}> 存量不足時自動購買（扣款）
        </label>
      </div>
      <div style="margin-top:10px; padding-top:10px; border-top:1px dotted #382c1c;">
        <label style="display:flex; align-items:center; gap:6px; font-size:11px; color:var(--dim-text); cursor:pointer;">
          <input type="checkbox" data-fleeboss="1" ${S.combatOptions.fleeBoss?'checked':''}> 遇見首領（BOSS）自動逃跑，直接繼續下一場戰鬥
        </label>
      </div>`;
}
// 「目前狀態效果」面板：原本常駐在左側欄，現在移進「總覽」分頁顯示（見 renderOverview）。
function renderBuffPanel(){
  const exp = S.sideExpanded;
  const flash = S.triggerFlash || {};
  const rows = [];

  // 目前生效中的倒數計時效果（培元丹、內功特效觸發後的持續狀態）
  if(S.buffAtkTicks>0){
    rows.push(`<div class="wxg-row effect-flash"><span>培元丹（威力+${Math.round(S.buffAtk*100)}%）</span><b>${S.buffAtkTicks} 回合</b></div>`);
  }
  (S.statusEffects||[]).forEach(e=>{
    if(e.wudangName){
      // 武當五招制的自身狀態（攬雀尾／三環套月／太極氣盾／陰陽之氣／霸體等）不是單純的
      // 「某屬性 +X%」，用專屬文字顯示，不要走下面通用的 stat/value 格式（那樣會顯示成
      // 沒意義的「提升0%」，因為這些效果的 stat/value 欄位本來就是空的佔位值）。
      let label = e.wudangName;
      if(e.wudangName==="霸體") label = `霸體（${e.immuneAll?'紅霸體，免疫僵直與所有控制':'黃霸體，免疫受擊僵直'}）`;
      else if(e.shieldPoolMax) label = `${e.wudangName}（護盾剩餘 ${Math.round(e.shieldPool)}／${e.shieldPoolMax}${e.convertToMp?'，吸收會轉化為內力':''}）`;
      else if(e.stacks!=null) label = `${e.wudangName}　${e.stacks}／${e.maxStacks}層`;
      else if(e.mpOnHit) label = `${e.wudangName}（命中回復內力 ${e.mpOnHit}）`;
      else if(e.kind==="regen") label = `${e.wudangName}（${e.stat==="mp"?"內力":"氣血"}持續回復中）`;
      rows.push(`<div class="wxg-row effect-flash"><span>${label}</span><b>${e.remainingTicks} 回合</b></div>`);
    } else if(e.kind==="buff"){
      rows.push(`<div class="wxg-row effect-flash"><span>${e.stat}提升 +${Math.round(e.value*100)}%</span><b>${e.remainingTicks} 回合</b></div>`);
    } else if(e.kind==="regen"){
      rows.push(`<div class="wxg-row effect-flash"><span>逍遙（內力回復中${e.atkBuff?`，威力+${Math.round(e.atkBuff*100)}%`:''}）</span><b>${e.remainingTicks} 回合</b></div>`);
    }
  });

  // 門派天賦：常駐顯示，觸發時（金剛護體疊層／以柔克剛追擊／降龍霸體／淬毒／天魔解體等）閃一下
  rows.push(`<div class="wxg-row ${flash.sectPassive?'effect-flash':''}"><span>門派天賦・${S.sect.passive}</span></div>`);

  // 內功特效：主修心法本身的固定被動 + 目前層數對應的機率觸發特效，兩者都是「擁有」就常駐顯示
  const activeTech = INTERNAL_POOL.find(t=>t.id===S.activeInternal);
  if(activeTech){
    if(activeTech.special){
      rows.push(`<div class="wxg-row ${flash.internalSpecial?'effect-flash':''}"><span>內功・${activeTech.name}：${activeTech.special}</span></div>`);
    }
    const tier = getInternalTier(activeTech.id);
    const layerDesc = activeTech.layers[tier] && activeTech.layers[tier].desc;
    if(layerDesc){
      rows.push(`<div class="wxg-row ${flash.internalLayer?'effect-flash':''}"><span>內功・${activeTech.name}（第${tier+1}層）：${layerDesc}</span></div>`);
    }
  }

  // 武學特效：已裝備且練到第3層以上（解鎖附加效果）的招式，各自獨立一行
  equippedMoveList().forEach(moveId=>{
    const moveDef = Object.values(MARTIAL_POOL).flat().find(m=>m.id===moveId);
    const known = S.knownMartial[moveId];
    if(!moveDef || !known || known.layer<3) return;
    rows.push(`<div class="wxg-row ${flash[`martial_${moveId}`]?'effect-flash':''}"><span>武學・${moveDef.name}：${moveDef.special}</span></div>`);
  });

  const buffBody = rows.length>0 ? rows.join("") : `<div class="wxg-hint">尚未擁有任何生效中的特效。</div>`;
  // 高倍速時狀態效果會頻繁增減、剩餘回合數字也一直變（尤其武當的招式buff），內容筆數/文字長度
  // 一直變會讓這個面板一直大小變化，把下面的面板擠得跟著上下跳動、點不到。這裡故意用「固定
  // height」而不是「max-height」——max-height 內容比上限矮時還是會跟著縮小，一樣會跳動；
  // 固定 height + 內部捲動才能保證不管裡面幾筆效果，面板本身的高度永遠不變。
  return `<div class="wxg-panel">
    <div class="wxg-panel-head" data-togglenside="buffs" style="cursor:pointer;"><span class="dot"></span><h3>目前狀態效果</h3><span class="wxg-chevron" style="margin-left:auto; color:var(--dim-text); font-size:10px;">${exp.buffs?'▾':'▸'}</span></div>
    ${exp.buffs?`<div style="height:180px; overflow-y:auto;">${buffBody}</div>`:''}
  </div>`;
}

// 「五大主屬性」面板：原本常駐在左側欄，現在移進「總覽」分頁顯示（見 renderOverview）。
function renderPrimaryPanel(){
  const exp = S.sideExpanded;
  const primaryBody = ["臂力","身法","內息","罡氣","體魄"].map(k=>
    `<div class="wxg-row wxg-primary-row" data-primarykey="${k}"><span style="color:${PRIMARY_COLORS[k]};">${k}</span><b style="color:${PRIMARY_COLORS[k]};">${S.derivedPrimary[k]}</b></div>`
  ).join("");
  return `<div class="wxg-panel">
    <div class="wxg-panel-head" data-togglenside="primary" style="cursor:pointer;"><span class="dot"></span><h3>五大主屬性</h3><span class="wxg-chevron" style="margin-left:auto; color:var(--dim-text); font-size:10px;">${exp.primary?'▾':'▸'}</span></div>
    ${exp.primary?primaryBody:''}
  </div>`;
}

// 左側欄現在只剩「戰鬥選項」（武當已整合進「戰鬥邏輯」分頁，這裡不重複顯示）。
function renderSide(){
  const exp = S.sideExpanded;
  return S.sectKey==="wudang" ? '' : `<div class="wxg-panel">
    <div class="wxg-panel-head" data-togglenside="autoheal" style="cursor:pointer;"><span class="dot"></span><h3>戰鬥選項</h3><span class="wxg-chevron" style="margin-left:auto; color:var(--dim-text); font-size:10px;">${exp.autoheal?'▾':'▸'}</span></div>
    ${exp.autoheal?renderAutoHealBody():''}
  </div>`;
}

// Melvor Idle 風格的「目前狀態卡」：大圖示＋名稱＋層數/進度條，放在分頁最上方顯示玩家目前主修/裝備中的項目。
function renderSkillStatusCard({icon, name, tag, tierText, progressPct, progressLabel, extraRows}){
  const pct = Math.max(0, Math.min(100, progressPct||0));
  return `<div class="wxg-statuscard">
    <div class="wxg-statuscard-icon">${icon||'☯'}</div>
    <div class="wxg-statuscard-body">
      <div class="wxg-statuscard-name">${name}${tag?` <span class="wxg-tag gold">${tag}</span>`:''}</div>
      <div class="wxg-statuscard-tier">${tierText||''}</div>
      ${progressPct!=null?`<div class="wxg-progress-wrap"><div class="wxg-progress jade" style="width:${pct}%"></div></div>
      ${progressLabel?`<div class="wxg-statuscard-tier">${progressLabel}</div>`:''}`:''}
      ${extraRows||''}
    </div>
  </div>`;
}

// Melvor Idle 風格的「可選項目卡片格」：取代原本逐條展開的手風琴清單，一項一張小卡並排。
// items: {icon, name, tag, meta, active, disabled, dataAttrs（原始 data-* 字串，沿用既有 events.js 綁定）}
function renderSkillCardGrid(items){
  const cells = items.map(it=>{
    const cls = `wxg-skillcard${it.active?' active':''}${it.disabled?' disabled':''}`;
    return `<div class="${cls}" ${it.dataAttrs||''}>
      ${it.active?'<span class="wxg-skillcard-active-flag">● 使用中</span>':''}
      <div class="wxg-skillcard-icon">${it.icon||'⚔️'}</div>
      <div class="wxg-skillcard-name">${it.name}${it.tag?` <span class="wxg-tag ${it.tagCls||'jade'}" style="margin-left:2px;">${it.tag}</span>`:''}</div>
      ${it.meta?`<div class="wxg-skillcard-meta">${it.meta}</div>`:''}
    </div>`;
  }).join("");
  return `<div class="wxg-cardgrid">${cells}</div>`;
}

function renderTab(){
  if(S.tab==="overview") return renderOverview();
  if(S.tab==="internal") return renderInternal();
  if(S.tab==="martial") return renderMartial();
  if(S.tab==="equip") return renderEquip();
  if(S.tab==="map") return renderMap();
  if(S.tab==="quest") return renderQuest();
  if(S.tab==="wudanglogic") return renderWudangLogic();
  if(S.tab==="codex") return renderCodex();
  if(S.tab==="settings") return renderSettings();
}

// 「設定」分頁：全局加速（測試用調速）＋存檔（存檔/匯出/匯入/重新開始），原本常駐在左側欄，
// 移進獨立分頁後側欄只留「戰鬥選項」。
function renderSettings(){
  const exp = S.sideExpanded;
  const curSpeed = S.tickSpeedMult||1;
  const speedPanel = `<div class="wxg-panel">
    <div class="wxg-panel-head" data-togglenside="speed" style="cursor:pointer;"><span class="dot"></span><h3>全局加速</h3><span class="wxg-help-icon" data-tip="${escapeHtml('測試用功能：縮短戰鬥 tick 間隔讓遊戲跑更快，不影響數值計算結果，只是變快而已。')}">?</span><span class="wxg-chevron" style="margin-left:auto; color:var(--dim-text); font-size:10px;">${exp.speed?'▾':'▸'}</span></div>
    ${exp.speed?`
    <div style="display:flex; gap:6px; margin-top:8px;">
      ${[1,10,100].map(m=>`<button class="wxg-btn small ${curSpeed===m?'gold':''}" data-setspeed="${m}">${m}倍</button>`).join("")}
    </div>
    `:''}
  </div>`;

  const savePanel = `<div class="wxg-panel">
    <div class="wxg-panel-head" data-togglenside="save" style="cursor:pointer;"><span class="dot"></span><h3>存檔</h3><span class="wxg-help-icon" data-tip="${escapeHtml('進度會自動存在這台電腦的瀏覽器裡，換瀏覽器或清瀏覽器資料會遺失，跟其他人共用同一個網址不會互相影響。可以匯出存檔備份，或搬到別的瀏覽器／電腦時匯入。')}">?</span><span class="wxg-chevron" style="margin-left:auto; color:var(--dim-text); font-size:10px;">${exp.save?'▾':'▸'}</span></div>
    ${exp.save?`
    <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
      <button class="wxg-btn small" data-savegame="1">存檔</button>
      <button class="wxg-btn small" data-exportsave="1">匯出存檔</button>
      <label class="wxg-btn small" style="cursor:pointer; margin:0; display:inline-flex; align-items:center;">
        匯入存檔
        <input type="file" accept="application/json,.json" data-importsave="1" style="display:none;">
      </label>
    </div>
    <button class="wxg-btn crimson small" data-restartgame="1" style="margin-top:8px;">重新開始（清除存檔）</button>
    `:''}
  </div>`;

  return `
    ${speedPanel}
    ${savePanel}
  `;
}

function sectMechanicStatus(){
  if(S.sectKey==="shaolin") return `目前格擋疊層 ${S.shaolinBlockStack} / 5（每層 +3 外功防禦，被閃避會歸零）`;
  if(S.sectKey==="wudang") return S.wudangProc ? "以柔克剛已觸發，下次攻擊將追加內功一擊" : "閃避成功後會觸發下次內功追擊";
  if(S.sectKey==="emei") return "內力回復速度 +60%（已生效）";
  if(S.sectKey==="gaibang") return `降龍連擊：${S.gaibangComboKills} / 5（集滿後下擊 +60% 傷害並無敵化解一次攻擊）`;
  if(S.sectKey==="tangmen") return S.monster ? `目前中毒層數：${S.monster.poisonStacks||0} / 8（每層每回合 4 點持續傷害，普攻上限 5 層，含沙射影針第 3 層特效可突破至 8 層）` : "普攻會為敵人疊加中毒層數";
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
    ${renderPrimaryPanel()}
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
    ${renderBuffPanel()}
    ${renderCombatLogPanel()}
  `;
}

// 每門心法各層的效果說明。優先用該層自己寫好的 desc（之後可個別覆寫），
// 沒寫的話就用該層目前的實際數值自動組一段說明文字當佔位內容。
function internalLayerDesc(skill, layerIdx){
  const layer = skill.layers[layerIdx];
  const parts = [];
  Object.entries(layer.bonusStat||{}).forEach(([k,v])=>{ if(v>0) parts.push(`${k}+${v}`); });
  if(layer.hpBonus>0) parts.push(`氣血+${layer.hpBonus}`);
  if(layer.mpBonus>0) parts.push(`內力+${layer.mpBonus}`);
  const specialText = layer.desc || layer.special;
  if(specialText) parts.push(`特效：${specialText}`);
  return `第${layerIdx+1}層：${parts.length>0?parts.join('、'):'暫無額外效果'}`;
}

const INTERNAL_AFFINITY_ICON = {太極:"☯", 陰柔:"🌙", 陽剛:"☀"};

function renderInternal(){
  const knownList = INTERNAL_POOL.filter(t=>S.knownInternal[t.id]);
  const affinityFilter = S.internalFilterAffinity || "全部";
  const filterBar = knownList.length>1 ? `<div class="wxg-panel">
    <div class="wxg-row" style="flex-wrap:wrap; gap:8px; align-items:center; border-bottom:none;">
      <span style="color:var(--dim-text);">篩選：</span>
      <select data-internalfilteraffinity="1" style="background:#100e0a; color:var(--ink-text); border:1px solid #4a3818; border-radius:3px; padding:4px; font-size:11px;">
        ${["全部","太極","陰柔","陽剛"].map(a=>`<option value="${a}" ${affinityFilter===a?'selected':''}>${a==="全部"?"全部屬性":a}</option>`).join("")}
      </select>
    </div>
  </div>` : '';

  const activeTech = INTERNAL_POOL.find(t=>t.id===S.activeInternal);
  let statusCard = '';
  if(activeTech){
    const activeKnown = S.knownInternal[activeTech.id];
    const cap = MAX_OBTAINABLE_TIER - 1;
    const tier = getInternalTier(activeTech.id);
    const atCap = tier>=cap;
    const nextReq = TIER_TABLE[Math.min(tier+1,cap)].req;
    const pct = !atCap ? Math.min(100,(activeKnown.invested-TIER_TABLE[tier].req)/(nextReq-TIER_TABLE[tier].req)*100) : 100;
    statusCard = renderSkillStatusCard({
      icon: INTERNAL_AFFINITY_ICON[activeTech.affinity]||'☯',
      name: `主修中：${activeTech.name}`,
      tag: activeTech.affinity,
      tierText: `第 ${tier+1} 層／共 36 層　·　修為池 ${S.qiPool} 點`,
      progressPct: pct,
      progressLabel: !atCap ? `已投入 ${activeKnown.invested} ／ 需 ${nextReq}` : `第 ${tier+1} 層（現有途徑已練滿）`,
    });
  }

  const poolPanel = `<div class="wxg-panel"><div class="wxg-panel-head internal"><span class="dot"></span><h3>內功修為池：${S.qiPool} 點</h3></div>
      <div class="wxg-hint">投入不可拆分收回，需用洗髓丹洗點（返還七折，冷卻 20 次戰鬥）。點卡片可展開/收合詳情。</div>
      <div class="wxg-row" style="margin-top:6px;"><span>持有洗髓丹</span><b>${S.materials.洗髓丹}</b></div>
      <div class="wxg-row"><span>洗點冷卻</span><b>${S.respecCooldown>0?S.respecCooldown+' 次戰鬥':'可用'}</b></div>
    </div>`;

  const visibleList = knownList.filter(t=> affinityFilter==="全部" || t.affinity===affinityFilter);
  const grid = renderSkillCardGrid(visibleList.map(t=>{
    const tier = getInternalTier(t.id);
    const isMain = S.activeInternal===t.id;
    return {
      icon: INTERNAL_AFFINITY_ICON[t.affinity]||'☯',
      name: t.name,
      tag: t.affinity,
      tagCls: t.affinity==='太極'?'gold':'jade',
      meta: `第${tier+1}層`,
      active: isMain,
      dataAttrs: `data-toggleint="${t.id}" style="cursor:pointer;"`,
    };
  }));

  const detailPanels = visibleList.filter(t=>S.internalExpanded[t.id]).map(t=>{
    const known = S.knownInternal[t.id];
    const cap = MAX_OBTAINABLE_TIER - 1;
    const tier = getInternalTier(t.id);
    const atCap = tier>=cap;
    const nextReq = TIER_TABLE[Math.min(tier+1,cap)].req;
    const isMain = S.activeInternal===t.id;
    const tierList = `<div class="wxg-row" style="color:var(--gold-lt);">▶ 目前　${internalLayerDesc(t,tier)}</div>`
      + (atCap ? '' : `<div class="wxg-row">　下一層　${internalLayerDesc(t,tier+1)}</div>`);
    const capHint = (atCap && cap+2<=36) ? `<div class="wxg-hint" style="margin-top:6px; color:var(--gold-lt);">你的「${t.name}」目前只學到第 ${tier+1} 層，後面的第 ${cap+2}～36 層需要尋得更高深的心法傳承，目前尚無取得途徑，敬請期待日後版本開放。</div>` : '';
    return `
    <div class="wxg-panel ${isMain?'active-main':''}">
      <div class="wxg-panel-head internal">
        <span class="dot"></span><h3>${t.name}</h3>
        <span class="wxg-tag ${t.affinity==='太極'?'gold':'jade'}">${t.affinity}</span>
        ${isMain?`<span class="wxg-tag gold" style="margin-left:auto;">主修中</span>`:`<button class="wxg-btn gold small" data-setmain="${t.id}" style="margin-left:auto;">使用</button>`}
      </div>
      <div class="wxg-hint">${t.desc}</div>
      <div class="wxg-row" style="margin-top:4px;"><span>資質</span><b style="font-weight:400;">內功威力 x${t.powerMult.toFixed(2)}　氣血 x${t.hpMult.toFixed(2)}　內力 x${t.mpMult.toFixed(2)}　內功防禦 x${t.defMult.toFixed(2)}</b></div>
      ${t.special?`<div class="wxg-row"><span>被動</span><b style="font-weight:400; color:var(--gold-lt);">${t.special}</b></div>`:''}
      ${Object.keys(t.layers[35].bonusStat||{}).length>0?`<div class="wxg-row"><span>第36層滿層加成</span><b style="font-weight:400;">${Object.entries(t.layers[35].bonusStat).map(([k,v])=>`${k}+${v}`).join('、')}</b></div>`:''}
      <div class="wxg-row"><span>目前層數</span><b>第 ${tier+1} 層／共 36 層</b></div>
      <div class="wxg-row"><span>目前可學上限</span><b>第 ${MAX_OBTAINABLE_TIER} 層</b></div>
      <div class="wxg-row"><span>已投入</span><b>${known.invested} ${!atCap?`／需 ${nextReq}`:'（現有途徑已練滿）'}</b></div>
      <div class="wxg-progress-wrap"><div class="wxg-progress jade" style="width:${!atCap?Math.min(100,(known.invested-TIER_TABLE[tier].req)/(nextReq-TIER_TABLE[tier].req)*100):100}%"></div></div>
      <div class="wxg-hint" style="line-height:1.7; margin-top:6px;">${tierList}</div>
      ${capHint}
      <div style="display:flex; gap:6px; margin-top:9px; flex-wrap:wrap;">
        <button class="wxg-btn jade small" data-invest="${t.id}" data-amt="100">投入100</button>
        <button class="wxg-btn jade small" data-invest="${t.id}" data-amt="all">全投入</button>
        <button class="wxg-btn crimson small" data-respec="${t.id}">洗點</button>
      </div>
    </div>`;
  }).join("");

  return `
    ${statusCard}
    ${poolPanel}
    ${knownList.length===0?`<div class="wxg-panel"><div class="wxg-hint">尚未習得任何內功心法，擊殺 Boss 有機率掉落秘笈，於背包使用後習得。</div></div>`:''}
    ${filterBar}
    ${grid}
    ${detailPanels}
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

function renderMartialWudang(){
  const equippedIds = new Set(Object.values(S.wudangSlots||{}).flat().filter(Boolean));

  // 1. 套路啟用清單：點卡片切換「啟用／停用」，下面的招式池只顯示已啟用套路的招式，
  // 已裝備的招式不受啟用狀態影響（停用一套不會自動卸下已經裝好的招式）。
  const movesetToggles = WUDANG_MOVESETS.filter(ms=>S.wudangMovesetsUnlocked[ms.key]).map(ms=>{
    const info = MOVESET_RARITY_INFO[ms.rarity] || {name:"？",color:"var(--dim-text)"};
    const active = S.wudangMovesetActive[ms.key]!==false;
    const color = wudangMovesetColor(ms.key);
    const equippedCount = ms.moves.filter(m=>equippedIds.has(m.id)).length;
    return `<div class="wxg-msettoggle ${active?'active':''}" data-wudangtogglemovesetactive="${ms.key}" style="--msc:${color};">
      <span class="msdot" style="background:${color};"></span>
      <b>${ms.name}</b>
      <span class="wxg-tag" style="border-color:${info.color}; color:${info.color};">${info.name}</span>
      <span class="wxg-tag">${ms.weaponSub}</span>
      <span class="wxg-tag jade">已裝備 ${equippedCount}/${ms.moves.length}</span>
      <span class="wxg-msettoggle-state">${active?'啟用中':'已停用'}</span>
      <button class="wxg-btn gold small" data-wudangequipset="${ms.key}" title="卸下目前所有技能欄招式，改裝備這套路的全部招式">一鍵裝備</button>
    </div>`;
  }).join("");

  // 2. 快捷列：拖放目標，已填格子邊框用套路配色分組，未填格子維持類型底色。
  const slotSection = WUDANG_SLOT_TYPES.map(type=>{
    const cap = WUDANG_SLOT_CAPS[type];
    const ids = S.wudangSlots[type]||[];
    const cells = Array.from({length:cap}, (_,i)=>{
      const id = ids[i];
      const m = id ? WUDANG_MOVE_LIST.find(x=>x.id===id) : null;
      const orderBtns = m ? `<div class="wxg-slotorder-btns">
        <button class="wxg-orderbtn" data-wudangmoveup="${type}:${i}" ${i===0?'disabled':''} title="提前施放順序">▲</button>
        <button class="wxg-orderbtn" data-wudangmovedown="${type}:${i}" ${i===ids.length-1?'disabled':''} title="延後施放順序">▼</button>
      </div>` : '';
      const borderColor = m ? wudangMovesetColor(m.moveset) : WUDANG_TYPE_COLOR[type]+'44';
      return `<div class="wxg-medal ${m?'':'empty'}" style="border-color:${borderColor};" data-wudangslot="${type}:${i}">
        ${orderBtns}
        <div class="ring" style="border-color:${WUDANG_TYPE_COLOR[type]};">${i+1}</div>
        <div style="padding-top:2px;">${m?`${m.name}<br><span style="color:#c9bd9e;font-size:10.5px">${m.movesetName} · 點擊卡片卸下</span>`:"（空／可拖曳招式進來）"}</div>
      </div>`;
    }).join("");
    return `<div style="margin-bottom:8px;">
      <div class="wxg-row" style="border-bottom:none; padding-bottom:2px;"><span style="color:${WUDANG_TYPE_COLOR[type]}; font-weight:700;">${type}</span><b style="font-weight:400; color:var(--dim-text);">${ids.length}／${cap}　<span style="color:var(--dim-text); font-weight:400;">數字＝施放優先順序，用▲▼調整</span></b></div>
      <div class="wxg-slotgrid">${cells}</div>
    </div>`;
  }).join("");

  const filterType = S.wudangFilterType||"全部";
  const filterRarity = S.wudangFilterRarity||"全部";
  const filterBar = `<div class="wxg-panel">
    <div class="wxg-row" style="flex-wrap:wrap; gap:8px; align-items:center; border-bottom:none;">
      <span style="color:var(--dim-text);">篩選：</span>
      <select data-wudangfiltertype="1" style="background:#100e0a; color:var(--ink-text); border:1px solid #4a3818; border-radius:3px; padding:4px; font-size:11px;">
        ${["全部",...WUDANG_SLOT_TYPES].map(t=>`<option value="${t}" ${filterType===t?'selected':''}>${t==="全部"?"全部類型":t}</option>`).join("")}
      </select>
      <select data-wudangfilterrarity="1" style="background:#100e0a; color:var(--ink-text); border:1px solid #4a3818; border-radius:3px; padding:4px; font-size:11px;">
        <option value="全部" ${filterRarity==="全部"?'selected':''}>全部稀有度</option>
        ${[1,2,3,4,5,6,7].map(r=>`<option value="${r}" ${String(filterRarity)===String(r)?'selected':''}>${MOVESET_RARITY_INFO[r].name}（${r}階）</option>`).join("")}
      </select>
    </div>
  </div>`;

  // 3. 招式池：只有「已解鎖＋已啟用套路＋符合篩選＋尚未裝備」的招式會出現，桌機用滑鼠拖進上面
  // 的快捷列格子，觸控裝置原生拖放不會動作，改用「點卡片選取→點格子放入」的兩步點選流程
  // （data-wudangpoolpick／S.wudangPoolSelected，見 events.js）。
  const poolMoves = WUDANG_MOVE_LIST.filter(m=>
    S.wudangMovesetsUnlocked[m.moveset] &&
    (S.wudangMovesetActive[m.moveset]!==false) &&
    (filterType==="全部" || m.type===filterType) &&
    (filterRarity==="全部" || String(m.rarity)===String(filterRarity)) &&
    !equippedIds.has(m.id)
  );
  const poolCards = poolMoves.map(m=>{
    const st = S.wudangMoveState[m.id];
    const cdLeft = st ? Math.max(0, st.cdRemaining||0) : 0;
    const costTxt = m.rageCost ? `怒氣 ${m.rageCost}` : (m.mpCost ? `內力 ${m.mpCost}` : '無消耗');
    const selected = S.wudangPoolSelected===m.id;
    return `<div class="wxg-movepool-card ${selected?'selected':''}" draggable="true" data-wudangdragsrc="${m.id}" data-wudangpoolpick="${m.id}" data-wudangmovehover="${m.id}" style="border-left-color:${wudangMovesetColor(m.moveset)};">
      <span class="wxg-tag" style="border-color:${WUDANG_TYPE_COLOR[m.type]}; color:${WUDANG_TYPE_COLOR[m.type]};">${m.type}</span> ${m.name}
      <div class="wxg-hint" style="margin-top:3px;">${m.movesetName} · CD${m.cd} · ${costTxt}${cdLeft>0?`　<span style="color:#e2685c;">冷卻中(${cdLeft})</span>`:''}</div>
    </div>`;
  }).join("");
  const poolSection = `<div class="wxg-panel">
    <div class="wxg-panel-head martial"><span class="dot"></span><h3>招式池</h3></div>
    ${poolMoves.length>0 ? `<div class="wxg-cardgrid">${poolCards}</div>` : `<div class="wxg-hint">目前沒有可裝備的招式——確認上面有啟用套路，或這套已經全部裝備完畢。</div>`}
  </div>`;

  return `
    <div class="wxg-panel"><div class="wxg-panel-head martial"><span class="dot"></span><h3>武當・實虛架氣怒</h3></div>
      <div class="wxg-hint">武當用的是全新的五招制戰鬥系統，招式會依當下敵我情勢自動見招拆招（實招硬拼、虛招破防、架招格擋、氣招調息、怒氣大招終結）。操作順序：① 下面先選要啟用哪些套路 ② 啟用後招式會出現在「招式池」③ 把招式拖進上方快捷列的格子（實／虛／氣招各5格，架招／怒氣大招各1格）。同一套路內連續出招沒有限制，換到不同套路的招式要等5回合的換招冷卻。目前四套武學已全部解鎖供測試，稀有度兌換系統之後才會真的限制取得。</div>
    </div>
    <div class="wxg-panel"><div class="wxg-panel-head martial"><span class="dot"></span><h3>已學套路</h3></div>${movesetToggles}</div>
    <div class="wxg-panel"><div class="wxg-panel-head martial"><span class="dot"></span><h3>快捷列</h3></div>${slotSection}</div>
    ${filterBar}
    ${poolSection}
  `;
}
// 戰鬥邏輯分頁招式懸浮視窗：滑鼠移到招式名稱上顯示這招的完整資訊。
function wudangMoveTooltipHtml(m){
  if(!m) return "";
  const costTxt = m.rageCost ? `怒氣 ${m.rageCost}` : (m.mpCost ? `內力 ${m.mpCost}` : '無消耗');
  const statTxt = [m.statA, m.statB].filter(Boolean).join('／') || '—';
  return `
    <div class="wxg-tip-title" style="color:${WUDANG_TYPE_COLOR[m.type]};">${m.movesetName}・${m.name}</div>
    <div class="wxg-tip-row"><span>招式類型</span><b>${m.type}</b></div>
    <div class="wxg-tip-row"><span>屬性／傷害屬性</span><b>${m.affinity}／${m.dmgType}</b></div>
    <div class="wxg-tip-row"><span>主要屬性加乘</span><b>${statTxt}</b></div>
    <div class="wxg-tip-row"><span>傷害倍率</span><b>${m.dmgTier||'無直接傷害'}</b></div>
    <div class="wxg-tip-row"><span>冷卻時間</span><b>${m.cd} 回合</b></div>
    <div class="wxg-tip-row"><span>消耗</span><b>${costTxt}</b></div>
    <div class="wxg-tip-row" style="margin-top:4px; border-top:1px dotted #4a3818; padding-top:4px;"><span>${m.desc}</span></div>
    <div class="wxg-tip-row" style="color:var(--gold-lt);"><span>${wudangEffectDetailText(m)}</span></div>
  `;
}
// 戰鬥邏輯：幫每一招已裝備的招式設定施放條件（HP/MP 高於/低於 X%），沒設定條件（百分比欄位
// 空白）的招式永遠視為條件成立，不影響「見招拆招」原本的判斷。
function renderWudangLogic(){
  const combatOptionsPanel = `<div class="wxg-panel">
    <div class="wxg-panel-head martial"><span class="dot"></span><h3>戰鬥選項</h3></div>
    ${renderAutoHealBody()}
  </div>`;
  const equipped = WUDANG_SLOT_TYPES.flatMap(t=>(S.wudangSlots[t]||[]).map(id=>({id,type:t})))
    .map(x=>({...x, def:WUDANG_MOVE_LIST.find(m=>m.id===x.id)}))
    .filter(x=>x.def);
  if(equipped.length===0){
    return combatOptionsPanel + `<div class="wxg-panel"><div class="wxg-panel-head martial"><span class="dot"></span><h3>戰鬥邏輯</h3></div>
      <div class="wxg-hint">先到「武學」分頁的技能欄裝備招式，才能在這裡設定施放條件。</div>
    </div>`;
  }
  const rows = equipped.map(({id,type,def})=>{
    const c = S.wudangMoveConditions[id] || {};
    return `<div class="wxg-row" style="flex-wrap:wrap; gap:6px; align-items:center; padding:6px 2px;">
      <span style="flex:1 1 140px; min-width:120px; cursor:help;" data-wudangmovehover="${id}"><span class="wxg-tag" style="border-color:${WUDANG_TYPE_COLOR[type]}; color:${WUDANG_TYPE_COLOR[type]};">${type}</span> ${def.name}</span>
      <select data-wudangcondresource="${id}" style="background:#100e0a; color:var(--ink-text); border:1px solid #4a3818; border-radius:3px; padding:4px; font-size:11px;">
        <option value="HP" ${(c.resource||"HP")==="HP"?'selected':''}>HP</option>
        <option value="MP" ${c.resource==="MP"?'selected':''}>MP</option>
      </select>
      <select data-wudangcondcompare="${id}" style="background:#100e0a; color:var(--ink-text); border:1px solid #4a3818; border-radius:3px; padding:4px; font-size:11px;">
        <option value="above" ${(c.compare||"above")==="above"?'selected':''}>高於</option>
        <option value="below" ${c.compare==="below"?'selected':''}>低於</option>
      </select>
      <input type="number" min="1" max="100" placeholder="不限" value="${c.pct||''}" data-wudangcondpct="${id}"
        style="width:64px; background:#100e0a; color:var(--ink-text); border:1px solid #4a3818; border-radius:3px; padding:4px; font-size:11px;">
      <span style="color:var(--dim-text); font-size:11px;">%</span>
      ${c.pct?`<button class="wxg-btn crimson small" data-wudangcondclear="${id}">清除</button>`:''}
    </div>`;
  }).join("");
  return combatOptionsPanel + `
    <div class="wxg-panel"><div class="wxg-panel-head martial"><span class="dot"></span><h3>戰鬥邏輯</h3></div>
      <div class="wxg-hint">幫已裝備的招式設定施放條件，例如「HP 低於 30%」才會考慮用這招——不符合條件時，系統會跳過這招、改看下一個優先順位。百分比欄位留空＝不限制，永遠可以用。</div>
    </div>
    <div class="wxg-panel">${rows}</div>
  `;
}
function renderMartial(){
  if(S.sectKey==="wudang") return renderMartialWudang();
  const slots = S.martialSlots.map((id,idx)=>{
    const known = id?S.knownMartial[id]:null;
    const def = id?Object.values(MARTIAL_POOL).flat().find(m=>m.id===id):null;
    return `<div class="wxg-medal" ${def?`data-unequipslot="${idx}"`:''} style="overflow:hidden; ${def?'cursor:pointer;':'opacity:.5;'}">
      <div class="ring ${def?(def.dmgType==='外功'?'wai':'nei'):''}">${idx+1}</div>
      <div style="padding-top:2px;">${def?`${def.name}<br><span style="color:#c9bd9e;font-size:10.5px">第${known.layer}層 · 點擊卸下</span>`:"（空）"}</div>
    </div>`;
  }).join("");

  const knownEntries = Object.entries(S.knownMartial);
  const grid = renderSkillCardGrid(knownEntries.map(([id,k])=>{
    const def = Object.values(MARTIAL_POOL).flat().find(m=>m.id===id);
    const isEquipped = S.martialSlots.indexOf(id)>=0;
    return {
      icon: def.dmgType==='外功' ? '⚔️' : '☯',
      name: def.name,
      tag: def.affinity,
      tagCls: 'jade',
      meta: `第${k.layer}層`,
      active: isEquipped,
      dataAttrs: `data-togglemartial="${id}" style="cursor:pointer;"`,
    };
  }));

  const detailPanels = knownEntries.filter(([id])=>S.martialExpanded[id]).map(([id,k])=>{
    const def = Object.values(MARTIAL_POOL).flat().find(m=>m.id===id);
    const need = MARTIAL_TIER_TABLE[k.layer] ?? null;
    const canUp = k.layer<9 && k.proficiency>=need;
    const isEquipped = S.martialSlots.indexOf(id)>=0;
    const layerList = [1,2,3,4,5,6,7,8,9].map(li=>{
      const cur = li===k.layer;
      return `<div class="wxg-row" style="${cur?'color:var(--gold-lt)':''}">${cur?'▶ ':'　'}第${li}層：${martialLayerDesc(def,li)}</div>`;
    }).join("");
    return `
      <div class="wxg-panel ${isEquipped?'active-main':''}">
        <div class="wxg-panel-head martial">
          <span class="dot"></span><h3>${def.name}</h3>
          <span class="wxg-tag crimson">${def.dmgType}</span><span class="wxg-tag jade">${def.affinity}</span>
          <span class="wxg-tag gold">第${k.layer}層</span>
          <button class="wxg-btn ${isEquipped?'crimson':'gold'} small" data-usemartial="${id}" style="margin-left:auto;">${isEquipped?'卸下':'使用'}</button>
        </div>
        <div class="wxg-row"><span>${k.layer<9?'熟練度':'狀態'}</span><b>${k.layer<9?`${k.proficiency} / ${need}`:'大成'}</b></div>
        <div class="wxg-progress-wrap"><div class="wxg-progress crimson" style="width:${k.layer<9?Math.min(100,k.proficiency/need*100):100}%"></div></div>
        <div class="wxg-hint" style="line-height:1.7; margin:6px 0;">${layerList}</div>
        <button class="wxg-btn small" ${canUp?'':'disabled'} data-upgrade="${id}">升級（淬鍊石 x${k.layer*3}）</button>
      </div>`;
  }).join("");

  return `
    <div class="wxg-panel"><div class="wxg-panel-head martial"><span class="dot"></span><h3>武學技能欄</h3></div>
      <div class="wxg-slotgrid">${slots}</div>
      <div class="wxg-hint" style="margin-top:6px;">點下方招式卡片查看詳情並「使用」直接裝入空位，點技能欄圖示可卸下。</div>
      <div class="wxg-row" style="margin-top:6px;"><span>持有淬鍊石</span><b>${S.materials.淬鍊石}</b></div>
    </div>
    ${knownEntries.length===0?`<div class="wxg-panel"><div class="wxg-hint">尚未習得任何武學招式，擊殺 Boss 有機率掉落秘笈，於背包使用後習得。</div></div>`:''}
    ${grid}
    ${detailPanels}
  `;
}

const BAG_FILTERS = [
  {key:"all", label:"全部"},
  {key:"weapon", label:"武器"},
  {key:"armor", label:"裝備"},
  {key:"martial", label:"武學秘笈"},
  {key:"potion", label:"丹藥"},
  {key:"other", label:"其他"},
];
function bagCategory(it){
  if(it.kind==="equipment") return WEAPON_SLOTS.includes(it.slot) ? "weapon" : "armor";
  if(it.kind==="manual" && it.manualType==="martial") return "martial";
  if(it.kind==="consumable") return "potion";
  return "other";
}

// 背包「販售」原本是跳瀏覽器 confirm() 彈窗二次確認，玩家反應很難點（尤其在小螢幕/高倍速下彈窗
// 會打斷畫面）。改成點下去先在原地換成「確認賣出／取消」兩顆按鈕，再點一次確認賣出才真的賣掉。
// 用 uid（不是 idx）記錄目前是哪一件在等確認，因為背包陣列順序可能因為新掉落/賣出而變動。
function bagSellButtonsHtml(it, idx, label){
  if(S.bagSellConfirmUid===it.uid){
    return `<button class="wxg-btn crimson small" data-bagsellconfirm="${idx}">確認賣出</button><button class="wxg-btn small" data-bagsellcancel="1">取消</button>`;
  }
  return `<button class="wxg-btn crimson small" data-bagsell="${idx}">${label}</button>`;
}

function renderEquip(){
  const subTabs = `
    <div class="wxg-subtabs">
      <div class="wxg-subtab ${S.equipSubTab==='gear'?'active':''}" data-equipsub="gear">裝備</div>
      <div class="wxg-subtab ${S.equipSubTab==='bag'?'active':''}" data-equipsub="bag">背包 ${S.inventory.length>0?`(${S.inventory.length})`:''}</div>
    </div>`;

  if(S.equipSubTab==="bag"){
    const filterTabs = `
      <div class="wxg-subtabs" style="margin-top:-2px;">
        ${BAG_FILTERS.map(f=>`<div class="wxg-subtab ${S.bagFilter===f.key?'active':''}" data-bagfilter="${f.key}">${f.label}</div>`).join("")}
      </div>`;
    const autoSellPanel = `<div class="wxg-panel">
      <div class="wxg-panel-head"><span class="dot"></span><h3>自動賣出</h3></div>
      <div class="wxg-hint">勾選品級後按下方按鈕，會把背包裡符合品級、且沒有鎖定的裝備依實際售價一次全部賣掉。玉裝不開放勾選，避免手滑賣掉稀有裝備。</div>
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin:8px 0;">
        ${TIER_LIST.filter(t=>t.key!=="jade").map(t=>`
          <label style="display:flex; align-items:center; gap:4px; font-size:12px; cursor:pointer; color:${t.color};">
            <input type="checkbox" data-autoselltier="${t.key}" ${S.autoSellTiers[t.key]?'checked':''}> ${t.name}裝
          </label>`).join("")}
      </div>
      <button class="wxg-btn crimson small" data-autosellrun="1">自動賣出</button>
    </div>`;
    const filtered = S.inventory
      .map((it,idx)=>({it,idx}))
      .filter(({it})=> S.bagFilter==="all" || bagCategory(it)===S.bagFilter);
    const inv = filtered.map(({it,idx})=>{
      if(it.kind==="consumable"){
        const c = findConsumable(it.refId);
        const onCd = isInCombat() && S.potionCd>0;
        return `<div class="wxg-panel"><div class="wxg-panel-head"><span class="dot"></span><h3>${it.name}</h3><span class="wxg-tag jade">藥品 x${it.qty}</span></div>
          <div class="wxg-hint">${c?c.desc:''}</div>
          ${onCd?`<div class="wxg-hint" style="color:#e2685c;">戰鬥中服藥冷卻中，還要 ${S.potionCd} 回合</div>`:''}
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button class="wxg-btn jade small" data-useconsumable="${idx}" ${onCd?'disabled':''}>使用</button>
            ${bagSellButtonsHtml(it, idx, "販售一份（1銅錢）")}
          </div></div>`;
      }
      if(it.kind==="manual"){
        const already = it.manualType==="martial" ? !!S.knownMartial[it.targetId] : !!S.knownInternal[it.targetId];
        return `<div class="wxg-panel"><div class="wxg-panel-head"><span class="dot"></span><h3>${it.name}</h3><span class="wxg-tag gold">秘笈</span></div>
          <div class="wxg-hint">${already?'已學過此招／心法，使用後將轉換為熟練度或修為，不會浪費。':'尚未習得，使用後直接學會。'}</div>
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button class="wxg-btn gold small" data-usemanual="${idx}">使用</button>
            ${bagSellButtonsHtml(it, idx, "販售（1銅錢）")}
          </div></div>`;
      }
      // equipment
      const bonusText = bonusTextHtml(it.bonus);
      const awakenText = (it.awakened||[]).length>0 ? `<div class="wxg-hint" style="color:var(--gold-lt);">開光：${it.awakened.map(a=>`${a.stat}+${a.value}`).join('、')}</div>` : '';
      const curEquipped = S.equipment[it.slot];
      const cmpHtml = compareBonusHtml(it, curEquipped);
      return `<div class="wxg-panel"><div class="wxg-panel-head"><span class="dot"></span><h3>${rarityNameHtml(it)} ${it.locked?'🔒':''}</h3><span class="wxg-tag">${it.slot}</span></div>
        <div class="wxg-hint">${bonusText}</div>${awakenText}
        ${cmpHtml?`<div class="wxg-hint" style="margin-top:4px;">與目前「${it.slot}」比較：</div>${cmpHtml}`:''}
        <div style="display:flex; gap:6px; margin-top:6px;">
          <button class="wxg-btn small" data-equip="${idx}">裝備</button>
          <button class="wxg-btn small" data-locktoggle="${idx}">${it.locked?'解鎖':'鎖定'}</button>
          ${!it.locked?bagSellButtonsHtml(it, idx, "販售（1銅錢）"):''}
        </div></div>`;
    }).join("") || (S.inventory.length===0
      ? `<div class="wxg-hint">背包空空如也，繼續戰鬥有機率掉落裝備、藥品與秘笈</div>`
      : `<div class="wxg-hint">這個分類目前沒有道具</div>`);
    return subTabs + autoSellPanel + filterTabs + inv;
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
      <div class="wxg-subtab ${S.mapSubTab==='town'?'active':''}" data-mapsub="town">🏙️ 金凌城</div>
      <div class="wxg-subtab ${S.mapSubTab==='sects'?'active':''}" data-mapsub="sects">🏯 各大門派</div>
      <div class="wxg-subtab ${S.mapSubTab==='zones'?'active':''}" data-mapsub="zones">⚔️ 魔教勢力（狩獵區）</div>
    </div>`;

  if(S.mapSubTab==="town"){
    const inTown = S.location==="jinling" && !S.visitingSect;
    const awayAtSect = S.location==="jinling" && S.visitingSect;
    const travelCard = `<div class="wxg-panel ${inTown?'active-main':''}">
      <div class="wxg-panel-head"><span class="dot"></span><h3>金凌城城門</h3>${inTown?'<span class="wxg-tag gold">已抵達</span>':''}</div>
      <div class="wxg-hint">${inTown?'你人在城中，可自由與各家商戶交易。':awayAtSect?`你人正在「${SECTS[S.visitingSect].name}」拜訪，分身乏術，無法同時在金凌城交易——先從門派頁面「返回列表」離開才行。`:'你目前在外地，需先動身前往金凌城，才能與城內商家交易。'}</div>
      ${!inTown && !awayAtSect?`<button class="wxg-btn gold small" data-gotown="1" style="margin-top:8px;">前往金凌城</button>`:''}
    </div>`;
    const npcs = TOWN_NPCS.map(n=>{
      let extra = "";
      if(!inTown){
        extra = `<div class="wxg-hint" style="margin-top:6px; color:#8a7d63;">（${awayAtSect?'你正在拜訪門派，分身乏術':'需先前往金凌城才能交易'}）</div>`;
      } else if(n.action==="sell"){
        const sellable = S.inventory.map((it,idx)=>({it,idx})).filter(x=>x.it.kind==="equipment");
        extra = sellable.length>0 ? `
          <div class="wxg-pickitem-list" style="margin-top:8px;">
            ${sellable.map(({it,idx})=>{
              const val = equipSellValue(it);
              return `<div class="wxg-pickitem"><div>${rarityNameHtml(it)} ${it.locked?'🔒':''}<div class="wxg-hint" style="margin-top:2px;">${it.slot}</div></div><button class="wxg-btn small" data-sellitem="${idx}" ${it.locked?'disabled title="已鎖定"':''}>${it.locked?'已鎖定':`賣出 ${formatMoney(val)}`}</button></div>`;
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
              <button class="wxg-btn gold small" data-forgeitem="${it===S.equipment[it.slot]?'eq:'+it.slot:'bag:'+S.inventory.indexOf(it)}" ${disabled?'disabled':''}>開光（${cost.mat}x${cost.amt}、${formatMoney(cost.gold)}）</button>
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
            <button class="wxg-btn gold small" data-buyitem="${c.id}" ${S.gold<c.price?'disabled':''}>${formatMoney(c.price)}</button>
          </div>`).join("")}
        </div>`;
      } else {
        extra = `<button class="wxg-btn small" disabled style="margin-top:8px;">功能開發中</button>`;
      }
      return `<div class="wxg-panel"><div class="wxg-panel-head"><span class="dot"></span><h3>${n.name}</h3></div>
        <div class="wxg-hint">${n.desc}</div>${extra}</div>`;
    }).join("");
    return subTabs + `<div class="wxg-hint" style="margin-bottom:8px;">金凌城，中原第一大城，江湖人往來補給、交易、聽消息的必經之地。目前身上有 <b style="color:var(--gold-lt)">${formatMoney(S.gold)}</b>。</div>` + travelCard + npcs;
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
    const relic = sectUniqueEquipment(key);
    const stolen = relic ? ownsUniqueEquipment(relic.id) : false;
    const relicPanel = relic ? `
      <div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot" style="background:#ff8a4a; box-shadow:0 0 5px #ff8a4a;"></span><h3 style="color:#ff8a4a;">門派大殿供奉</h3></div>
        <div class="wxg-row"><span>${relic.name}</span><b style="color:${stolen?'#e2685c':'#5eab88'};">${stolen?'被盜取':'供奉中'}</b></div>
        <div class="wxg-hint">${relic.desc}</div>
        <div class="wxg-hint">${stolen?'此件門派至寶已不在大殿之中，目前由你持有或已收入背包。':'此件門派至寶仍安然供奉於大殿神龕之中。 '+relic.obtain}</div>
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
    const bg = SECT_BG[key];
    const banner = `
      <div class="wxg-sect-banner">
        <div class="wxg-sect-banner-bg" style="background-image:url('${bg.src}'); filter:${bg.filter};"></div>
        <div class="wxg-sect-banner-overlay"></div>
        <div class="wxg-sect-banner-title">${s.name}</div>
      </div>`;
    return subTabs + banner + `
      <div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot"></span><h3>${s.name}</h3>${isMine?'<span class="wxg-tag gold">本門</span>':''}<button class="wxg-btn small" data-leavesect="1" style="margin-left:auto;">返回列表</button></div>
        <div class="wxg-hint">限定兵刃：${s.weapon}　門派機制：${s.passive}</div>
      </div>
      ${relicPanel}
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
  const zoneRows = HUNTING_ZONES.map(z=>{
    const active = S.location===z.id;
    const expanded = !!(S.zoneInfoExpanded||{})[z.id];
    const icon = ZONE_ICON[z.id] || "🗺️";
    const diff = zoneDifficulty(z.levelMod);
    const detail = expanded ? `<div class="wxg-zonerow-detail">
      <div class="wxg-hint" style="margin-top:6px;">${z.desc}</div>
      <div class="wxg-row" style="margin-top:4px;"><span>等級加成</span><b>+${z.levelMod}</b></div>
      <div class="wxg-row"><span>常見敵人</span><b style="font-weight:400; font-family:inherit; color:var(--dim-text);">${z.monsters.join("、")}</b></div>
      ${!active?`<button class="wxg-btn crimson small" data-zone="${z.id}" style="margin-top:8px;">前往此地狩獵</button>`:''}
    </div>` : '';
    return `<div class="wxg-zonerow ${active?'active':''}" data-togglezoneinfo="${z.id}">
        <div class="wxg-zonerow-icon">${icon}</div>
        <div class="wxg-zonerow-main">${z.name} <span class="wxg-tag ${diff.cls}" style="margin-left:6px;">${diff.label}</span>${active?'<span class="wxg-tag gold">狩獵中</span>':''}</div>
        <div class="wxg-zonerow-info">區域資訊 <span class="wxg-chevron">${expanded?'▾':'▸'}</span></div>
      </div>${detail}`;
  }).join("");
  return subTabs + `<div class="wxg-hint" style="margin-bottom:8px;">魔教勢力範圍分布，等級加成越高代表敵人越強、掉落也越好。點區域列可展開查看詳情。</div>` + townCard + `<div class="wxg-zonelist">${zoneRows}</div>`;
}

const ZONE_ICON = {heifeng:"🏚️", xueyu:"⛓️", jile:"🌫️", canglang:"🚤", wanshe:"🐍", tiansha:"⛰️", youming:"⚰️", fentian:"⛩️", mozong:"🏯"};
function zoneDifficulty(levelMod){
  if(levelMod<=0) return {label:"簡單", cls:"diffeasy"};
  if(levelMod<10) return {label:"普通", cls:"diffnormal"};
  return {label:"困難", cls:"diffhard"};
}

const CODEX_EFFECT_LABEL = {healHp:"恢復氣血", healMp:"恢復內力", healFull:"氣血內力全滿", buffAtk:"暫時提升外功／內功威力"};
// 藥品效果的精確數值文字，圖鑑分頁跟戰鬥邏輯／戰鬥選項的藥品下拉選單共用，避免兩處各寫一份、
// 改數值時漏改其中一邊。
function consumableEffectText(c){
  if(c.effect==="buffAtk") return `威力 +${Math.round(c.value*100)}%，持續 ${c.duration} 次交手`;
  if(c.effect==="healFull") return "氣血、內力當場全滿";
  return `恢復上限的 ${Math.round(c.value*100)}%`;
}

function renderCodex(){
  const subTabs = `
    <div class="wxg-subtabs">
      <div class="wxg-subtab ${S.codexSubTab==='guide'?'active':''}" data-codexsub="guide">新手入門</div>
      <div class="wxg-subtab ${S.codexSubTab==='stats'?'active':''}" data-codexsub="stats">主屬性</div>
      <div class="wxg-subtab ${S.codexSubTab==='sects'?'active':''}" data-codexsub="sects">門派總覽</div>
      <div class="wxg-subtab ${S.codexSubTab==='internal'?'active':''}" data-codexsub="internal">內功心法</div>
      <div class="wxg-subtab ${S.codexSubTab==='martial'?'active':''}" data-codexsub="martial">武學招式</div>
      <div class="wxg-subtab ${S.codexSubTab==='slots'?'active':''}" data-codexsub="slots">部位加成</div>
      <div class="wxg-subtab ${S.codexSubTab==='tiers'?'active':''}" data-codexsub="tiers">裝備品級</div>
      <div class="wxg-subtab ${S.codexSubTab==='unique'?'active':''}" data-codexsub="unique">門派至寶</div>
      <div class="wxg-subtab ${S.codexSubTab==='items'?'active':''}" data-codexsub="items">藥品道具</div>
      <div class="wxg-subtab ${S.codexSubTab==='profession'?'active':''}" data-codexsub="profession">生活職業</div>
      <div class="wxg-subtab ${S.codexSubTab==='zones'?'active':''}" data-codexsub="zones">地圖</div>
      <div class="wxg-subtab ${S.codexSubTab==='currency'?'active':''}" data-codexsub="currency">貨幣</div>
      <div class="wxg-subtab ${S.codexSubTab==='misc'?'active':''}" data-codexsub="misc">其他</div>
      <div class="wxg-subtab ${S.codexSubTab==='changelog'?'active':''}" data-codexsub="changelog">更新紀錄</div>
    </div>`;

  if(S.codexSubTab==="changelog"){
    const perPage = 10;
    const totalPages = Math.max(1, Math.ceil(CHANGELOG.length/perPage));
    const page = Math.min(S.changelogPage||0, totalPages-1);
    const pageItems = CHANGELOG.slice(page*perPage, page*perPage+perPage);
    const rows = pageItems.map(v=>`
      <div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot"></span><h3>${v.version}</h3><span class="wxg-tag" style="margin-left:auto;">${v.date}</span></div>
        <div class="wxg-hint" style="line-height:1.8;">${v.changes.map(c=>`・${escapeHtml(c)}`).join('<br>')}</div>
      </div>`).join("");
    const pager = `<div style="display:flex; align-items:center; justify-content:center; gap:10px; margin:12px 0 4px;">
      <button class="wxg-btn small" data-changelogpage="prev" ${page<=0?'disabled':''}>◀ 上一頁</button>
      <span style="color:var(--dim-text); font-size:12px;">第 ${page+1} / ${totalPages} 頁</span>
      <button class="wxg-btn small" data-changelogpage="next" ${page>=totalPages-1?'disabled':''}>下一頁 ▶</button>
    </div>`;
    return subTabs + `<div class="wxg-hint" style="margin-bottom:8px;">每次更新的內容都會記錄在這裡，越新的版本排越前面。共 ${CHANGELOG.length} 筆，每頁 ${perPage} 筆。</div>` + rows + pager;
  }

  if(S.codexSubTab==="guide"){
    return subTabs + `
      <div class="wxg-panel active-main">
        <div class="wxg-panel-head"><span class="dot"></span><h3>遊戲流程</h3></div>
        <div class="wxg-hint" style="line-height:1.9;">
          1. 選擇門派入門，六大門派各有限定兵刃與專屬機制，選定後無法更改。<br>
          2. 選定狩獵區後會自動進入戰鬥，每 1.2 秒結算一回合，擊殺會獲得<b style="color:var(--gold-lt)">內功修為</b>、<b style="color:var(--gold-lt)">錢財</b>，並有機率掉落裝備、藥品、秘笈。<br>
          3. 修為可投入「內功」提升層數，秘笈可在背包使用學會新的「武學」招式，兩者都會直接提升戰鬥屬性。<br>
          4. 「裝備」分部位、品級，撿到更好的可以替換；生活職業(煉器)升級後能為裝備「開光」附加詞條。<br>
          5. 「地圖」可以切換狩獵區、拜訪各大門派、回金凌城交易或休整；「任務」可向本門知客領取剿滅魔教委託換取貢獻度。<br>
          6. 這份「遊戲百科」隨時可查閱所有系統的詳細規則與數值。
        </div>
      </div>
      <div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot"></span><h3>左側導覽列</h3></div>
        <div class="wxg-row"><span>總覽</span><b style="font-weight:400; color:var(--dim-text);">二級戰鬥屬性與戰鬥紀錄</b></div>
        <div class="wxg-row"><span>內功</span><b style="font-weight:400; color:var(--dim-text);">投入修為、切換主修心法</b></div>
        <div class="wxg-row"><span>武學</span><b style="font-weight:400; color:var(--dim-text);">裝上／升級招式</b></div>
        <div class="wxg-row"><span>裝備</span><b style="font-weight:400; color:var(--dim-text);">穿戴部位、查看背包</b></div>
        <div class="wxg-row"><span>地圖</span><b style="font-weight:400; color:var(--dim-text);">金凌城、各大門派、狩獵區</b></div>
        <div class="wxg-row"><span>任務</span><b style="font-weight:400; color:var(--dim-text);">目前接取的委託進度</b></div>
        <div class="wxg-row"><span>遊戲百科</span><b style="font-weight:400; color:var(--dim-text);">你現在看的地方</b></div>
      </div>
      <div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot"></span><h3>戰鬥選項小提醒</h3></div>
        <div class="wxg-hint">戰鬥面板左下「戰鬥選項」可設定氣血／內力低於門檻自動服藥（可勾選存量不足自動購買），以及「遇見首領自動逃跑」，掛機時很實用。</div>
      </div>
    `;
  }

  if(S.codexSubTab==="stats"){
    const rows = [
      {key:"臂力", effect:[
        "「近身威力」的主要來源 —— 拳掌／劍法／棍法／刀法等非暗器招式的外功傷害都靠它",
        "小幅提升外功暴擊",
        "小幅提升外功防禦（貢獻度較體魄低）",
        "小幅提升氣血上限",
      ]},
      {key:"身法", effect:[
        "「遠程威力」的主要來源 —— 唐門暗器類招式的外功傷害靠它",
        "提升外功命中",
        "提升閃避值（降低被敵人打中的機率）",
      ]},
      {key:"內息", effect:[
        "「內功威力」的主要來源 —— 所有內功類招式的傷害核心，會再受主修內功層數加乘",
        "提升內力上限（影響最大的屬性）",
      ]},
      {key:"罡氣", effect:[
        "提升內功命中",
        "提升內功暴擊",
        "提升內功防禦",
        "小幅提升內力上限",
      ]},
      {key:"體魄", effect:[
        "提升氣血上限（影響最大的屬性）",
        "外功防禦的主要來源",
        "提升封勁與招架耐力上限",
      ]},
    ];
    const panels = rows.map(r=>`<div class="wxg-panel">
      <div class="wxg-panel-head"><span class="dot" style="background:${PRIMARY_COLORS[r.key]}; box-shadow:0 0 5px ${PRIMARY_COLORS[r.key]};"></span><h3 style="color:${PRIMARY_COLORS[r.key]};">${r.key}</h3></div>
      <div class="wxg-hint" style="line-height:1.8;">${r.effect.map(e=>`・${e}`).join('<br>')}</div>
    </div>`).join("");
    return subTabs + `<div class="wxg-hint" style="margin-bottom:8px;">五大主屬性來自門派起始值、裝備加成與門派地位加成，數值可在「總覽」的側欄查看。以下是每個屬性實際影響的戰鬥數值。</div>` + panels;
  }

  if(S.codexSubTab==="sects"){
    const rows = Object.entries(SECTS).map(([key,s])=>{
      const statTxt = ["臂力","身法","內息","罡氣","體魄"].map(k=>`<span style="color:${PRIMARY_COLORS[k]};">${k}${s.base[k]}</span>`).join('　');
      return `<div class="wxg-panel ${key===S.sectKey?'active-main':''}">
        <div class="wxg-panel-head"><span class="dot"></span><h3>${s.name}</h3>${key===S.sectKey?'<span class="wxg-tag gold">本門</span>':''}</div>
        <div class="wxg-row"><span>限定兵刃</span><b>${s.weapon}（${s.weaponType}）</b></div>
        <div class="wxg-row"><span>門派機制</span><b style="font-weight:400;">${s.passive}</b></div>
        <div class="wxg-hint" style="margin-top:4px;">起始五圍：${statTxt}</div>
      </div>`;
    }).join("");
    const comingSoonRows = COMING_SOON_SECTS.map(s=>`<div class="wxg-panel" style="opacity:0.6;">
      <div class="wxg-panel-head"><span class="dot" style="background:var(--dim-text);"></span><h3>${s.name}</h3><span class="wxg-tag" style="margin-left:auto;">敬請期待</span></div>
      <div class="wxg-hint">${s.teaser}，尚未開放，暫時無法選擇遊玩。</div>
    </div>`).join("");
    const rankRows = RANK_TABLE.map((r,i)=>`<div class="wxg-row"><span>${r.name}</span><b style="font-weight:400;">${i===0?'預設位階':`需貢獻度 ${r.req}、淬鍊石 ${r.mat}，加成 +${Math.round(r.bonus*100)}%`}</b></div>`).join("");
    const rankPanel = `<div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot"></span><h3>門派地位</h3></div>
        ${rankRows}
        <div class="wxg-hint">在本門「論功堂首座」處，用門派貢獻度＋淬鍊石晉升位階，位階越高戰鬥屬性加成越多。</div>
      </div>`;
    return subTabs + `<div class="wxg-hint" style="margin-bottom:8px;">六大門派各有限定兵刃種類與專屬戰鬥機制，決定了可學的武學招式方向。</div>` + rows + comingSoonRows + rankPanel;
  }

  if(S.codexSubTab==="internal"){
    const RANK_LABELS = ["一內","二內","三內","四內","五內","六內"];
    const allSectEntries = [
      ...Object.keys(SECTS).map(k=>({key:k, name:SECTS[k].name, locked:false})),
      ...COMING_SOON_SECTS.map(s=>({key:s.key, name:s.name, locked:true})),
    ];

    // 第三層：單一心法的完整 1～36 層效果
    if(S.codexInternalSkillId){
      const skill = INTERNAL_POOL.find(t=>t.id===S.codexInternalSkillId);
      if(skill){
        const layerRows = Array.from({length:36}, (_,i)=>i).map(i=>{
          const beyondCap = i>=MAX_OBTAINABLE_TIER;
          return `<div class="wxg-row" style="${beyondCap?'opacity:0.5;':''}"><span>${internalLayerDesc(skill,i)}</span>${beyondCap?'<b style="font-weight:400; color:var(--dim-text); font-size:10px;">尚無取得途徑</b>':''}</div>`;
        }).join("");
        return subTabs + `
          <div class="wxg-panel"><button class="wxg-btn small" data-codexinternalback="skill">◀ 返回「${sectDisplayNameFor(skill.sect)}」心法列表</button></div>
          <div class="wxg-panel">
            <div class="wxg-panel-head internal"><span class="dot"></span><h3>${skill.name}</h3><span class="wxg-tag ${skill.affinity==='太極'?'gold':'jade'}">${skill.affinity}</span></div>
            <div class="wxg-hint">${skill.desc}</div>
            <div class="wxg-row" style="margin-top:4px;"><span>資質倍率</span><b style="font-weight:400;">內功威力 x${skill.powerMult.toFixed(2)}　氣血 x${skill.hpMult.toFixed(2)}　內力 x${skill.mpMult.toFixed(2)}　內功防禦 x${skill.defMult.toFixed(2)}</b></div>
            ${skill.special?`<div class="wxg-row"><span>獨特被動</span><b style="font-weight:400; color:var(--gold-lt);">${skill.special}</b></div>`:''}
            <div class="wxg-row"><span>目前可學上限</span><b>第 ${MAX_OBTAINABLE_TIER} 層／共 36 層</b></div>
          </div>
          <div class="wxg-panel">
            <div class="wxg-panel-head internal"><span class="dot"></span><h3>逐層效果（第 1～36 層）</h3></div>
            <div style="line-height:1.8;">${layerRows}</div>
          </div>
        `;
      }
      S.codexInternalSkillId = null;
    }

    // 第二層：選定門派後，一內～六內的簡介列表
    if(S.codexInternalSect){
      const sectInfo = allSectEntries.find(s=>s.key===S.codexInternalSect);
      if(sectInfo){
        const starterId = STARTER_INTERNAL_ID[sectInfo.key];
        const rankRows = RANK_LABELS.map((label, idx)=>{
          const rank = idx+1;
          const id = rank===1 ? starterId : `${sectInfo.key}_${rank}`;
          const skill = INTERNAL_POOL.find(t=>t.id===id);
          if(!skill){
            return `<div class="wxg-panel" style="opacity:0.5;">
              <div class="wxg-panel-head internal"><span class="dot"></span><h3>${label}</h3><span class="wxg-tag" style="margin-left:auto;">尚未開放</span></div>
            </div>`;
          }
          const isPlaceholder = rank>=2 && skill.desc && skill.desc.includes("效果待補");
          return `<div class="wxg-panel" style="cursor:pointer;" data-codexinternalskill="${skill.id}">
            <div class="wxg-panel-head internal"><span class="dot"></span><h3>${label}・${skill.name}</h3><span class="wxg-tag ${skill.affinity==='太極'?'gold':'jade'}">${skill.affinity}</span><span class="wxg-tag" style="margin-left:auto;">查看36層 ▸</span></div>
            <div class="wxg-hint">${isPlaceholder?'資質與特效尚未正式設計，目前是佔位內容':skill.desc}</div>
            <div class="wxg-row" style="margin-top:2px;"><span>資質倍率</span><b style="font-weight:400;">內功威力 x${skill.powerMult.toFixed(2)}　氣血 x${skill.hpMult.toFixed(2)}　內力 x${skill.mpMult.toFixed(2)}　內功防禦 x${skill.defMult.toFixed(2)}</b></div>
          </div>`;
        }).join("");
        // 少數心法（例如武當「太極玄功」）是門派限定但不屬於一～六內排序，額外列在下面避免找不到。
        const rankedIds = new Set([starterId, ...RANK_LABELS.slice(1).map((_,i)=>`${sectInfo.key}_${i+2}`)]);
        const extraSkills = INTERNAL_POOL.filter(t=>t.sect===sectInfo.key && !rankedIds.has(t.id));
        const extraRows = extraSkills.map(skill=>`<div class="wxg-panel" style="cursor:pointer;" data-codexinternalskill="${skill.id}">
            <div class="wxg-panel-head internal"><span class="dot"></span><h3>${skill.name}</h3><span class="wxg-tag ${skill.affinity==='太極'?'gold':'jade'}">${skill.affinity}</span><span class="wxg-tag" style="margin-left:auto;">查看36層 ▸</span></div>
            <div class="wxg-hint">${skill.desc}</div>
            <div class="wxg-row" style="margin-top:2px;"><span>資質倍率</span><b style="font-weight:400;">內功威力 x${skill.powerMult.toFixed(2)}　氣血 x${skill.hpMult.toFixed(2)}　內力 x${skill.mpMult.toFixed(2)}　內功防禦 x${skill.defMult.toFixed(2)}</b></div>
          </div>`).join("");
        return subTabs + `
          <div class="wxg-panel"><button class="wxg-btn small" data-codexinternalback="sect">◀ 返回門派列表</button></div>
          <div class="wxg-panel">
            <div class="wxg-panel-head internal"><span class="dot"></span><h3>${sectInfo.name}${sectInfo.locked?'（尚未開放）':''}</h3></div>
            <div class="wxg-hint">點下方任一心法可查看完整 1～36 層效果。</div>
          </div>
          ${rankRows}
          ${extraSkills.length>0?`<div class="wxg-hint" style="margin:10px 0 6px;">其他門派限定心法</div>${extraRows}`:''}
        `;
      }
      S.codexInternalSect = null;
    }

    // 第一層：通用心法 + 門派列表
    const genericRows = INTERNAL_POOL.filter(t=>!t.sect).map(t=>`
      <div class="wxg-panel">
        <div class="wxg-panel-head internal"><span class="dot"></span><h3>${t.name}</h3><span class="wxg-tag ${t.affinity==='太極'?'gold':'jade'}">${t.affinity}</span><span class="wxg-tag" style="margin-left:auto;">各門派通用</span></div>
        <div class="wxg-hint">${t.desc}</div>
        <div class="wxg-row" style="margin-top:2px;"><span>資質倍率</span><b style="font-weight:400;">內功威力 x${t.powerMult.toFixed(2)}　氣血 x${t.hpMult.toFixed(2)}　內力 x${t.mpMult.toFixed(2)}　內功防禦 x${t.defMult.toFixed(2)}</b></div>
        ${t.special?`<div class="wxg-row"><span>獨特被動</span><b style="font-weight:400; color:var(--gold-lt);">${t.special}</b></div>`:''}
      </div>`).join("");
    const sectCards = allSectEntries.map(s=>`
      <div class="wxg-panel" style="cursor:pointer; ${s.locked?'opacity:0.6;':''}" data-codexinternalsect="${s.key}">
        <div class="wxg-panel-head internal"><span class="dot"></span><h3>${s.name}${s.locked?'（敬請期待）':''}</h3><span class="wxg-tag" style="margin-left:auto;">查看一～六內 ▸</span></div>
      </div>`).join("");
    const titleRankRows = RANK_LABELS.map((label,i)=>{
      const rank = i+1;
      return `<div class="wxg-row"><span>${label}</span><b style="font-weight:400;">每層 ${INTERNAL_RANK_POINTS_PER_LAYER[rank]} 點</b></div>`;
    }).join("");
    const titleRows = TITLE_TABLE.map(t=>`<div class="wxg-row ${t.name===S.title?'active-main':''}"><span>${t.name}</span><b style="font-weight:400;">${t.req} 點</b></div>`).join("");
    return subTabs + `
      <div class="wxg-panel">
        <div class="wxg-panel-head internal"><span class="dot"></span><h3>內功系統規則</h3></div>
        <div class="wxg-hint">每個門派各有一到六本專屬心法（一內～六內），每本最高 36 層，每一層都有自己專屬的效果，不是統一公式套算出來的。點下方門派可查看該門所有心法，再點心法可查看完整 1～36 層效果。${MAX_OBTAINABLE_TIER<36?`目前只有第 1～${MAX_OBTAINABLE_TIER} 層能透過投入修為練到，第 ${MAX_OBTAINABLE_TIER+1}～36 層需要日後開放的其他取得途徑，敬請期待。`:'投入修為即可一路練到第 36 層（滿層）。'}</div>
      </div>
      <div class="wxg-panel">
        <div class="wxg-panel-head internal"><span class="dot"></span><h3>實力稱號</h3></div>
        <div class="wxg-hint">已學會的每本心法各自換算「目前層數 × 該心法所屬階級的每層點數」，取所有已學會心法裡最高的一個當作稱號點數（不是加總）——練多本不會疊加，看的是練得最深的那一本。點數對應下方稱號門檻，門檻越高的稱號需要練得越深、或練成更高階級的心法。</div>
        ${titleRankRows}
      </div>
      <div class="wxg-panel">
        <div class="wxg-panel-head internal"><span class="dot"></span><h3>稱號對照表${S?`　目前：<span style="color:var(--gold-lt);">${S.title}（${S.titlePoints} 點）</span>`:''}</h3></div>
        ${titleRows}
      </div>
      <div class="wxg-hint" style="margin:6px 0;">通用心法（各門派皆可習得）</div>
      ${genericRows}
      <div class="wxg-hint" style="margin:10px 0 6px;">門派專屬心法（點門派查看）</div>
      ${sectCards}
    `;
  }

  if(S.codexSubTab==="martial"){
    const layerRows = [1,3,5,9].map(li=>`<div class="wxg-row"><span>第 ${li} 層</span><b style="font-weight:400;">${martialLayerDesc({special:'（依招式而定）'}, li)}</b></div>`).join("");
    const groups = Object.entries(MARTIAL_POOL).map(([weaponType, moves])=>{
      const rows = moves.map(m=>`<div class="wxg-row"><span>${m.name}</span><b style="font-weight:400;">${m.dmgType}・${m.affinity}・附加效果：${m.special}${m.need?`（需先升級至第${m.need+1}招解鎖）`:''}</b></div>`).join("");
      return `<div class="wxg-panel">
        <div class="wxg-panel-head martial"><span class="dot"></span><h3>${weaponType}</h3></div>
        ${rows}
      </div>`;
    }).join("");
    const wudangRagePanel = `<div class="wxg-panel">
        <div class="wxg-panel-head martial"><span class="dot"></span><h3>武當・實虛架氣怒（五招制）</h3></div>
        <div class="wxg-hint" style="line-height:1.9;">
          武當用的是獨立於其他門派的「實／虛／架／氣／怒」戰鬥系統：實招硬拼、虛招破防、架招格擋、氣招調息、怒氣大招終結，敵我每回合都會依當下情勢見招拆招（剪刀石頭布：實破虛、虛破架、架擋實）。<br><br>
          <b style="color:var(--gold-lt);">怒氣如何獲得：</b><br>
          ・實招命中且未被對方架招擋下：+2 怒氣（被擋下只有 +1）<br>
          ・虛招命中（不論是否順帶破防）：+2 怒氣<br>
          ・被敵人攻擊時：當下用架招擋下 +4 怒氣，沒有格擋（或架招落空沒接到攻擊）+5 怒氣<br>
          ・部分架招套路格擋成功後有機率觸發額外加成（例如「借力」），再額外 +1 怒氣<br>
          怒氣上限 100，累積到怒氣大招所需門檻（目前四套武學皆為 50）才能施放，AI 見招拆招時會優先使用怒氣大招。
        </div>
      </div>`;
    return subTabs + wudangRagePanel + `
      <div class="wxg-panel">
        <div class="wxg-panel-head martial"><span class="dot"></span><h3>武學系統規則（武當以外門派）</h3></div>
        <div class="wxg-hint">最多同時裝備 4 招，戰鬥時依序輪流施展。每次施展會累積熟練度，達門檻可消耗「淬鍊石」升級（1～9 層），層數越高傷害越高，第 3 層解鎖附加效果、第 9 層為大成。</div>
      </div>
      <div class="wxg-panel">
        <div class="wxg-panel-head martial"><span class="dot"></span><h3>升級門檻（熟練度）</h3></div>
        <div class="wxg-row"><span>各層所需熟練度</span><b style="font-weight:400;">${MARTIAL_TIER_TABLE.join(' → ')}</b></div>
        ${layerRows}
      </div>
      ${groups}
    `;
  }

  if(S.codexSubTab==="currency"){
    return subTabs + `
      <div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot"></span><h3>貨幣系統</h3></div>
        <div class="wxg-row"><span>1 銀兩</span><b>= 1000 銅錢</b></div>
        <div class="wxg-row"><span>1 銀錠</span><b>= 1000 銀兩（= 1,000,000 銅錢）</b></div>
        <div class="wxg-hint">身上錢財會依金額自動顯示為銅／兩／錠的組合。</div>
      </div>
    `;
  }

  if(S.codexSubTab==="profession"){
    return subTabs + `
      <div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot"></span><h3>生活職業・煉器</h3></div>
        <div class="wxg-row"><span>升級所需經驗</span><b style="font-weight:400;">${PROFESSION_EXP_TABLE.slice(1).join(' → ')}</b></div>
        <div class="wxg-hint">於金凌城「煉器閣」為裝備開光可獲得煉器經驗。等級 1～4 依序解鎖木銅／鐵／銀／金裝開光，等級 5～7 依序解鎖一～二品／五品／七品玉裝開光。</div>
      </div>
    `;
  }

  if(S.codexSubTab==="zones"){
    const zoneRows = HUNTING_ZONES.map(z=>{
      const mobRows = (MONSTER_ROSTER[z.id]||[]).map(m=>`<div class="wxg-row" style="padding-left:8px;"><span>${m.name}（Lv.${m.level}）</span><b style="font-weight:400; color:var(--dim-text);">氣血 ${m.hpMax}・攻擊 ${m.atk}・防禦 ${m.def}</b></div>`).join("");
      const boss = BOSS_ROSTER[z.id];
      const bossRow = boss ? `<div class="wxg-row" style="padding-left:8px;"><span style="color:#ff8a4a;">【首領】${boss.name}（Lv.${boss.level}）</span><b style="font-weight:400; color:#ff8a4a;">氣血 ${boss.hpMax}・攻擊 ${boss.atk}・防禦 ${boss.def}</b></div>` : "";
      return `<div style="margin-top:8px;"><b>${z.name}</b><span style="color:var(--dim-text); font-size:11px;">　${z.tag}・裝備等級加成 +${z.levelMod}</span></div>${mobRows}${bossRow}`;
    }).join("");
    return subTabs + `
      <div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot"></span><h3>狩獵區</h3></div>
        ${zoneRows}
        <div class="wxg-hint" style="margin-top:8px;">每隻怪物的素質都是固定的，不會隨你的等級或擊殺數變化；每擊殺 10 隻會遇到一次該地區固定的首領。「裝備等級加成」只影響裝備掉落品級機率，跟怪物強度無關。</div>
      </div>
    `;
  }

  if(S.codexSubTab==="misc"){
    const questRows = QUEST_TEMPLATES.map(q=>`<div class="wxg-row"><span>剿滅魔教：${q.zoneName}</span><b style="font-weight:400;">擊殺 ${q.killsNeeded} 名，獎勵貢獻度 +${q.reward}</b></div>`).join("");
    return subTabs + `
      <div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot"></span><h3>任務範本</h3></div>
        ${questRows}
        <div class="wxg-hint">須先前往本門找知客領取，一次只能接一個委託。</div>
      </div>
    `;
  }

  if(S.codexSubTab==="unique"){
    const rows = UNIQUE_EQUIPMENT.map(u=>{
      const bonusText = Object.entries(u.bonus).map(([k,v])=>`<span style="color:${PRIMARY_COLORS[k]||'inherit'}">${k}+${v}</span>`).join("、");
      const owner = u.sect ? SECTS[u.sect].name+"大殿" : "無門無派";
      return `<div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot" style="background:#ff8a4a; box-shadow:0 0 5px #ff8a4a;"></span><h3 style="color:#ff8a4a;">${u.name}</h3><span class="wxg-tag" style="border-color:#ff8a4a; color:#ff8a4a;">${u.slot}</span><span class="wxg-tag gold" style="margin-left:auto;">${owner}</span></div>
        <div class="wxg-row"><span>固定素質</span><b>${bonusText}</b></div>
        <div class="wxg-hint">${u.desc}</div>
        <div class="wxg-hint">取得方式：${u.obtain}</div>
      </div>`;
    }).join("");
    return subTabs + `<div class="wxg-hint" style="margin-bottom:8px;">門派至寶素質固定，不像一般裝備隨機生成，皆以「玉裝七品」規格計算開光欄位。六件分別供奉於各門派大殿，另兩件不屬任何門派。</div>` + rows;
  }

  if(S.codexSubTab==="tiers"){
    const rows = TIER_LIST.map(t=>{
      const awakenTxt = t.key==="jade" ? "依品級而定（一～七品，對應開光欄位 1～7）" : `${t.awakenSlots} 欄`;
      return `<div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot" style="background:${t.color}; box-shadow:0 0 5px ${t.color};"></span><h3 style="color:${t.color};">${t.name}裝</h3></div>
        <div class="wxg-row"><span>屬性倍率</span><b>x${t.mult.toFixed(2)}</b></div>
        <div class="wxg-row"><span>開光欄位</span><b>${awakenTxt}</b></div>
      </div>`;
    }).join("");
    return subTabs + `
      <div class="wxg-hint" style="margin-bottom:8px;">裝備品級由低到高共六階，品級越高基礎加成與可開光欄位越多。</div>
      ${rows}
      <div class="wxg-hint">取得方式：狩獵各地魔教勢力，擊殺後約有 12% 機率掉落裝備，品級隨機；前往等級加成較高的狩獵區，掉落高品級裝備的機率會提升。</div>
    `;
  }

  if(S.codexSubTab==="items"){
    const dropPool = CONSUMABLES.slice(0, CONSUMABLES.length-1); // 與 onKill() 掉落機率池一致
    const rows = CONSUMABLES.map(c=>{
      const canDrop = dropPool.includes(c);
      const valueTxt = consumableEffectText(c);
      return `<div class="wxg-panel">
        <div class="wxg-panel-head"><span class="dot"></span><h3>${c.name}</h3><span class="wxg-tag gold">${CODEX_EFFECT_LABEL[c.effect]||c.effect}</span></div>
        <div class="wxg-row"><span>效果</span><b>${valueTxt}</b></div>
        <div class="wxg-hint">${c.desc}</div>
        <div class="wxg-hint">取得方式：金凌城「回春堂」購買（${formatMoney(c.price)}）${canDrop?'，戰鬥擊殺也有機率掉落':'，目前僅能用錢財購買，不會從戰鬥掉落'}</div>
      </div>`;
    }).join("");
    return subTabs + `<div class="wxg-hint" style="margin-bottom:8px;">藥品與丹藥可在背包內直接使用，也能在「自動回復設定」中指定門檻自動服用。</div>` + rows;
  }

  // slots
  const weaponRows = WEAPON_SLOTS.map(slot=>{
    const leans = WEAPON_SLOT_LEAN[slot].map(k=>`<span style="color:${PRIMARY_COLORS[k]};">${k}</span>`).join('、');
    return `<div class="wxg-row"><span>${slot}</span><b>${leans}</b></div>`;
  }).join("");
  const armorRows = ARMOR_SLOTS.map(slot=>{
    const leans = ARMOR_SLOT_LEAN[slot].map(k=>`<span style="color:${PRIMARY_COLORS[k]};">${k}</span>`).join('、');
    return `<div class="wxg-row"><span>${slot}</span><b>${leans}</b></div>`;
  }).join("");
  return subTabs + `
    <div class="wxg-panel">
      <div class="wxg-panel-head martial"><span class="dot"></span><h3>武器部位</h3></div>
      ${weaponRows}
      <div class="wxg-hint">武器類部位主要加成近身／遠程威力方向，門派限定的兵刃種類（拳掌／劍法／棍法／暗器／刀法）也由此決定。</div>
    </div>
    <div class="wxg-panel">
      <div class="wxg-panel-head"><span class="dot"></span><h3>防具部位</h3></div>
      ${armorRows}
      <div class="wxg-hint">防具部位主要提升五大主屬性；兩個戒指部位則可隨機加成任一屬性。</div>
    </div>
    <div class="wxg-hint">所有部位皆會隨機生成「木／銅／鐵／銀／金／玉」品級，詳見「裝備品級」頁籤。取得方式：狩獵各地魔教勢力，擊殺後有機率掉落。</div>
  `;
}

function renderSectPick(){
  return `
    <div class="wxg-banner"><div class="wxg-title">江湖夜行<small>請選擇門派入門</small></div></div>
    <div class="wxg-sectpick">
      ${Object.entries(SECTS).map(([key,s])=>{
        const playable = PLAYABLE_SECTS_NOW.includes(key);
        if(!playable){
          return `<div class="wxg-sectcard locked" title="五招制武學系統開發中，暫不開放創角">
            <span class="wxg-lock-badge">開發中</span>
            <div class="wxg-sect-icon">🔒</div>
            <h4>${s.name}</h4>
            <p>${s.passive}</p>
            <p style="margin-top:6px;">新版五招制武學系統製作中，暫不開放創角，敬請期待</p>
          </div>`;
        }
        return `
        <div class="wxg-sectcard" data-sect="${key}">
          <div class="wxg-sect-icon">${SECT_ICONS[key]}</div>
          <h4>${s.name}</h4>
          <p>限定兵刃：${s.weapon}</p>
          <p>${s.passive}</p>
          <p style="margin-top:6px; font-size:10px;"><span style="color:${PRIMARY_COLORS.臂力}">臂${s.base.臂力}</span>／<span style="color:${PRIMARY_COLORS.身法}">身${s.base.身法}</span>／<span style="color:${PRIMARY_COLORS.內息}">息${s.base.內息}</span>／<span style="color:${PRIMARY_COLORS.罡氣}">罡${s.base.罡氣}</span>／<span style="color:${PRIMARY_COLORS.體魄}">體${s.base.體魄}</span></p>
        </div>`;
      }).join("")}
      ${COMING_SOON_SECTS.map(s=>`
        <div class="wxg-sectcard locked" title="尚未開放">
          <span class="wxg-lock-badge">敬請期待</span>
          <div class="wxg-sect-icon">🔒</div>
          <h4>${s.name}</h4>
          <p>${s.teaser}</p>
          <p style="margin-top:6px;">尚未開放，敬請期待</p>
        </div>`).join("")}
    </div>
  `;
}
