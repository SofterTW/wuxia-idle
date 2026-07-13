function bindSectPick(){ document.querySelectorAll('[data-sect]').forEach(el=>{ el.onclick = ()=> newGame(el.dataset.sect); }); }

// 通用懸浮提示：獨立掛在 <body> 底下（不是 #root 裡面），render() 每次重繪不會動到它，
// 也不會被側欄 overflow-y:auto 裁切（側欄裁切了橫向溢出，直接掛在裡面的提示框會被切掉）。
function getFloatTooltipEl(){
  let el = document.getElementById('wxg-float-tooltip');
  if(!el){ el = document.createElement('div'); el.id = 'wxg-float-tooltip'; document.body.appendChild(el); }
  return el;
}
function positionFloatTooltip(tip, anchorEl){
  tip.style.display = "block";
  const rect = anchorEl.getBoundingClientRect();
  let left = rect.right + 8;
  let top = rect.top;
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  if(left + tw > window.innerWidth) left = Math.max(4, rect.left - 8 - tw);
  if(top + th > window.innerHeight) top = Math.max(4, window.innerHeight - th - 4);
  tip.style.left = left + "px";
  tip.style.top = top + "px";
}

function bindGlobal(){
  document.querySelectorAll('[data-logfilter]').forEach(el=> el.onclick=()=>{
    const k = el.dataset.logfilter;
    S.logFilters[k] = (S.logFilters[k]===false) ? true : false;
    render();
  });
  document.querySelectorAll('[data-acceptquest]').forEach(el=> el.onclick=()=>{
    const tpl = QUEST_TEMPLATES.find(q=>q.zoneId===el.dataset.acceptquest);
    if(!tpl) return;
    S.quest = {zoneId:tpl.zoneId, zoneName:tpl.zoneName, killsNeeded:tpl.killsNeeded, killsDone:0, reward:tpl.reward};
    addLog(`接下委託：前往「${tpl.zoneName}」剿滅魔教爪牙 ${tpl.killsNeeded} 名`, 'system');
    render();
  });
  document.querySelectorAll('[data-turninquest]').forEach(el=> el.onclick=()=>{
    if(!S.quest || S.quest.killsDone<S.quest.killsNeeded) return;
    S.sectContribution += S.quest.reward;
    addLog(`回報任務成功，獲得門派貢獻度 +${S.quest.reward}`, 'loot');
    S.quest = null;
    render();
  });
  document.querySelectorAll('[data-promote]').forEach(el=> el.onclick=()=>{
    const next = RANK_TABLE[S.sectRank+1];
    if(!next || S.sectContribution<next.req || S.materials.淬鍊石<next.mat) return;
    S.materials.淬鍊石 -= next.mat;
    S.sectRank += 1;
    addLog(`論功考核通過！晉升為本門「${next.name}」`, 'system');
    recalc(false); render();
  });
  document.querySelectorAll('[data-visitsect]').forEach(el=> el.onclick=()=>{
    if(S.location!=="jinling"){
      S.location="jinling"; S.monster=null; S.monsters=[];
      addLog(`你先動身返回金凌城，再前往拜訪門派。`, 'system');
    }
    S.visitingSect = el.dataset.visitsect;
    render();
  });
  document.querySelectorAll('[data-leavesect]').forEach(el=> el.onclick=()=>{ S.visitingSect = null; render(); });
  document.querySelectorAll('[data-npctalk]').forEach(el=> el.onclick=()=>{ S.dialogueNpc = el.dataset.npctalk; render(); });
  document.querySelectorAll('[data-closedialogue]').forEach(el=> el.onclick=(e)=>{ if(e.target!==el) return; S.dialogueNpc=null; render(); });
  document.querySelectorAll('.wxg-modal button[data-closedialogue]').forEach(el=> el.onclick=()=>{ S.dialogueNpc=null; render(); });
  document.querySelectorAll('[data-autopct]').forEach(el=>{
    el.onchange = ()=>{
      const key = el.dataset.autopct==="hp" ? "hpPct" : "mpPct";
      let v = parseInt(el.value); if(isNaN(v)) v=0; v=Math.max(0,Math.min(100,v));
      S.autoHeal[key]=v; render();
    };
  });
  document.querySelectorAll('[data-autoitem]').forEach(el=>{
    el.onchange = ()=>{
      const key = el.dataset.autoitem==="hp" ? "hpItem" : "mpItem";
      S.autoHeal[key]=el.value; render();
    };
  });
  document.querySelectorAll('[data-autobuy]').forEach(el=>{
    el.onchange = ()=>{
      const key = el.dataset.autobuy==="hp" ? "hpAutoBuy" : "mpAutoBuy";
      S.autoHeal[key]=el.checked; render();
    };
  });
  document.querySelectorAll('[data-fleeboss]').forEach(el=>{
    el.onchange = ()=>{ S.combatOptions.fleeBoss = el.checked; render(); };
  });
  document.querySelectorAll('[data-restartgame]').forEach(el=> el.onclick=()=>{
    if(!confirm('確定要清除存檔、重新開始嗎？目前的進度將無法復原。')) return;
    deleteSaveAndRestart();
  });
  document.querySelectorAll('[data-exportsave]').forEach(el=> el.onclick=()=> exportSave());
  document.querySelectorAll('[data-importsave]').forEach(el=>{
    el.onchange = (e)=>{
      const file = e.target.files[0];
      if(file) importSaveFromFile(file);
      e.target.value = "";
    };
  });
  document.querySelectorAll('[data-tab]').forEach(el=> el.onclick = ()=>{
    S.tab = el.dataset.tab;
    if(S.tab!=="overview") S.navHintSeen = true;
    if(S.tab!=="map") S.visitingSect = null; // 離開地圖頁籤視同離開門派，戰鬥才能繼續
    render();
  });
  document.querySelectorAll('[data-navcollapse]').forEach(el=> el.onclick = ()=>{ S.navCollapsed = !S.navCollapsed; render(); });
  document.querySelectorAll('[data-invest]').forEach(el=> el.onclick = (e)=>{
    e.stopPropagation();
    const amt = el.dataset.amt==='all' ? S.qiPool : parseInt(el.dataset.amt);
    investQi(el.dataset.invest, amt);
  });
  document.querySelectorAll('[data-setmain]').forEach(el=> el.onclick=(e)=>{ e.stopPropagation(); setMainInternal(el.dataset.setmain); });
  document.querySelectorAll('[data-respec]').forEach(el=> el.onclick=(e)=>{ e.stopPropagation(); respecTech(el.dataset.respec); });
  document.querySelectorAll('[data-upgrade]').forEach(el=> el.onclick=(e)=>{ e.stopPropagation(); upgradeMartial(el.dataset.upgrade); });
  document.querySelectorAll('[data-toggleint]').forEach(el=> el.onclick=()=>{ const id=el.dataset.toggleint; S.internalExpanded[id]=!S.internalExpanded[id]; render(); });
  document.querySelectorAll('[data-togglezoneinfo]').forEach(el=> el.onclick=()=>{ const id=el.dataset.togglezoneinfo; S.zoneInfoExpanded[id]=!S.zoneInfoExpanded[id]; render(); });
  document.querySelectorAll('[data-wudangtoggle]').forEach(el=> el.onclick=(e)=>{
    e.stopPropagation();
    const id = el.dataset.wudangtoggle;
    const m = WUDANG_MOVE_LIST.find(x=>x.id===id);
    if(!m) return;
    const arr = S.wudangSlots[m.type];
    const idx = arr.indexOf(id);
    if(idx>=0) arr.splice(idx,1);
    else if(arr.length<WUDANG_SLOT_CAPS[m.type]) arr.push(id);
    render();
  });
  // 快捷列格子：桌機滑鼠用原生拖放（dragover/drop），觸控裝置原生拖放不會動作，改用
  // 「點招式池卡片選取→點格子放入」的兩步點選流程共用同一個 wudangDropMoveIntoSlot()。
  // 格子本身沒有選取中的招式時，點擊有招式的格子＝卸下（沿用原本 data-wudangunequip 的行為，
  // 現在併進同一個 handler，因為兩者共用同一個 DOM 節點，分開綁 onclick 只有後綁的會生效）。
  document.querySelectorAll('[data-wudangslot]').forEach(el=>{
    const [type, idxStr] = el.dataset.wudangslot.split(":");
    const idx = parseInt(idxStr, 10);
    el.ondragover = (e)=>{ e.preventDefault(); el.classList.add('dragover'); };
    el.ondragleave = ()=>{ el.classList.remove('dragover'); };
    el.ondrop = (e)=>{
      e.preventDefault();
      el.classList.remove('dragover');
      const moveId = e.dataTransfer.getData('text/plain');
      if(moveId){ wudangDropMoveIntoSlot(moveId, type, idx); render(); }
    };
    el.onclick = (e)=>{
      e.stopPropagation();
      if(S.wudangPoolSelected){
        wudangDropMoveIntoSlot(S.wudangPoolSelected, type, idx);
        S.wudangPoolSelected = null;
        render();
        return;
      }
      const arr = S.wudangSlots[type]||[];
      if(idx < arr.length){ arr.splice(idx, 1); render(); }
    };
  });
  document.querySelectorAll('[data-wudangdragsrc]').forEach(el=> el.ondragstart=(e)=>{
    e.dataTransfer.setData('text/plain', el.dataset.wudangdragsrc);
    e.dataTransfer.effectAllowed = 'move';
  });
  document.querySelectorAll('[data-wudangpoolpick]').forEach(el=> el.onclick=(e)=>{
    e.stopPropagation();
    const id = el.dataset.wudangpoolpick;
    S.wudangPoolSelected = (S.wudangPoolSelected===id) ? null : id;
    render();
  });
  document.querySelectorAll('[data-wudangtogglemovesetactive]').forEach(el=> el.onclick=()=>{
    const k = el.dataset.wudangtogglemovesetactive;
    S.wudangMovesetActive[k] = !(S.wudangMovesetActive[k]!==false);
    render();
  });
  // 施放順序：技能欄裡的排列順序就是 AI 見招拆招時，同類型招式的優先順序（見 combat.js
  // pickWudangMove 的 byType(t)[0]），用▲▼交換陣列裡的順序即可，不用動戰鬥引擎。
  document.querySelectorAll('[data-wudangmoveup]').forEach(el=> el.onclick=(e)=>{
    e.stopPropagation();
    const [type, idx] = el.dataset.wudangmoveup.split(":");
    const i = parseInt(idx,10);
    if(i>0){ const arr=S.wudangSlots[type]; [arr[i-1],arr[i]]=[arr[i],arr[i-1]]; render(); }
  });
  document.querySelectorAll('[data-wudangmovedown]').forEach(el=> el.onclick=(e)=>{
    e.stopPropagation();
    const [type, idx] = el.dataset.wudangmovedown.split(":");
    const i = parseInt(idx,10);
    const arr = S.wudangSlots[type];
    if(i<arr.length-1){ [arr[i],arr[i+1]]=[arr[i+1],arr[i]]; render(); }
  });
  document.querySelectorAll('[data-togglenside]').forEach(el=> el.onclick=()=>{ const k=el.dataset.togglenside; S.sideExpanded[k]=!S.sideExpanded[k]; render(); });
  document.querySelectorAll('[data-wudangtogglemoveset]').forEach(el=> el.onclick=()=>{
    const k = el.dataset.wudangtogglemoveset; S.wudangMovesetExpanded[k] = !S.wudangMovesetExpanded[k]; render();
  });
  document.querySelectorAll('[data-wudangfiltertype]').forEach(el=> el.onchange=()=>{ S.wudangFilterType = el.value; render(); });
  document.querySelectorAll('[data-wudangfilterrarity]').forEach(el=> el.onchange=()=>{ S.wudangFilterRarity = el.value; render(); });
  document.querySelectorAll('[data-internalfilteraffinity]').forEach(el=> el.onchange=()=>{ S.internalFilterAffinity = el.value; render(); });
  document.querySelectorAll('[data-wudangmovehover]').forEach(el=>{
    el.onmouseenter = ()=>{
      const m = WUDANG_MOVE_LIST.find(x=>x.id===el.dataset.wudangmovehover);
      if(!m) return;
      const tip = getFloatTooltipEl();
      tip.innerHTML = wudangMoveTooltipHtml(m);
      positionFloatTooltip(tip, el);
    };
    el.onmouseleave = ()=>{ getFloatTooltipEl().style.display = "none"; };
  });
  // 戰鬥邏輯分頁：每招的施放條件（HP/MP 高於/低於 X%），存進 S.wudangMoveConditions[moveId]。
  function ensureWudangCond(id){
    if(!S.wudangMoveConditions[id]) S.wudangMoveConditions[id] = {resource:"HP", compare:"above", pct:null};
    return S.wudangMoveConditions[id];
  }
  document.querySelectorAll('[data-wudangcondresource]').forEach(el=> el.onchange=()=>{
    ensureWudangCond(el.dataset.wudangcondresource).resource = el.value; render();
  });
  document.querySelectorAll('[data-wudangcondcompare]').forEach(el=> el.onchange=()=>{
    ensureWudangCond(el.dataset.wudangcondcompare).compare = el.value; render();
  });
  document.querySelectorAll('[data-wudangcondpct]').forEach(el=> el.onchange=()=>{
    let v = parseInt(el.value,10);
    if(isNaN(v)) v = null; else v = Math.max(1, Math.min(100, v));
    ensureWudangCond(el.dataset.wudangcondpct).pct = v;
    render();
  });
  document.querySelectorAll('[data-wudangcondclear]').forEach(el=> el.onclick=(e)=>{
    e.stopPropagation();
    delete S.wudangMoveConditions[el.dataset.wudangcondclear];
    render();
  });
  document.querySelectorAll('[data-primarykey]').forEach(el=>{
    el.onmouseenter = ()=>{
      const k = el.dataset.primarykey;
      const tip = getFloatTooltipEl();
      const rows = primaryContributions(k).map(c=>`<div class="wxg-tip-row"><span>${c.stat}</span><b>+${Math.round(c.val)}</b></div>`).join("");
      tip.innerHTML = `<div class="wxg-tip-title" style="color:${PRIMARY_COLORS[k]};">${k} 換算・二級戰鬥屬性</div>${rows}`;
      positionFloatTooltip(tip, el);
    };
    el.onmouseleave = ()=>{ getFloatTooltipEl().style.display = "none"; };
  });
  // 通用「?」說明圖示：data-tip 存的是已跳脫過的說明文字，滑鼠移過去彈懸浮視窗。
  document.querySelectorAll('[data-tip]').forEach(el=>{
    el.onmouseenter = (e)=>{
      e.stopPropagation();
      const tip = getFloatTooltipEl();
      tip.innerHTML = `<div class="wxg-tip-row">${escapeHtml(el.dataset.tip)}</div>`;
      positionFloatTooltip(tip, el);
    };
    el.onmouseleave = ()=>{ getFloatTooltipEl().style.display = "none"; };
  });
  document.querySelectorAll('[data-titletip]').forEach(el=>{
    el.onmouseenter = (e)=>{
      e.stopPropagation();
      const tip = getFloatTooltipEl();
      const rows = Object.keys(S.knownInternal||{}).map(techId=>{
        const skill = INTERNAL_POOL.find(t=>t.id===techId);
        if(!skill) return null;
        const rank = internalRankOf(techId);
        const ppl = INTERNAL_RANK_POINTS_PER_LAYER[rank] || 1.0;
        const layer = getInternalTier(techId)+1;
        const pts = Math.round(layer*ppl*10)/10;
        return {name:skill.name, layer, pts};
      }).filter(Boolean).sort((a,b)=>b.pts-a.pts)
        .map(r=>`<div class="wxg-tip-row"><span>${r.name}（第${r.layer}層）</span><b>${r.pts}</b></div>`).join("");
      const next = nextTitleForPoints(S.titlePoints);
      const nextRow = next ? `<div class="wxg-tip-row" style="margin-top:4px; border-top:1px dotted #4a3818; padding-top:4px;"><span>下一階「${next.name}」</span><b>還差 ${Math.round((next.req-S.titlePoints)*10)/10} 點</b></div>` : `<div class="wxg-tip-row" style="margin-top:4px; border-top:1px dotted #4a3818; padding-top:4px;"><span>已是最高稱號</span></div>`;
      tip.innerHTML = `<div class="wxg-tip-title" style="color:var(--gold-lt);">稱號點數：${S.titlePoints}</div>${rows}${nextRow}`;
      positionFloatTooltip(tip, el);
    };
    el.onmouseleave = ()=>{ getFloatTooltipEl().style.display = "none"; };
  });
  document.querySelectorAll('[data-setspeed]').forEach(el=> el.onclick=(e)=>{
    e.stopPropagation();
    setTickSpeed(parseInt(el.dataset.setspeed,10));
  });
  document.querySelectorAll('[data-savegame]').forEach(el=> el.onclick=(e)=>{
    e.stopPropagation();
    saveGame();
    addLog("已手動存檔", "system");
    render();
  });
  document.querySelectorAll('[data-togglemartial]').forEach(el=> el.onclick=()=>{ const id=el.dataset.togglemartial; S.martialExpanded[id]=!S.martialExpanded[id]; render(); });
  document.querySelectorAll('[data-usemartial]').forEach(el=> el.onclick=(e)=>{
    e.stopPropagation();
    const id = el.dataset.usemartial;
    const curIdx = S.martialSlots.indexOf(id);
    if(curIdx>=0){ S.martialSlots[curIdx]=null; addLog(`卸下了「${Object.values(MARTIAL_POOL).flat().find(m=>m.id===id).name}」`, 'system'); }
    else {
      const emptyIdx = S.martialSlots.indexOf(null);
      if(emptyIdx>=0){ S.martialSlots[emptyIdx]=id; addLog(`裝上了「${Object.values(MARTIAL_POOL).flat().find(m=>m.id===id).name}」`, 'system'); }
      else { addLog(`武學欄已滿（4/4），請先卸下其他招式`, 'warn'); }
    }
    render();
  });
  document.querySelectorAll('[data-unequipslot]').forEach(el=> el.onclick=()=>{
    const idx = parseInt(el.dataset.unequipslot);
    const id = S.martialSlots[idx];
    S.martialSlots[idx] = null;
    if(id) addLog(`卸下了「${Object.values(MARTIAL_POOL).flat().find(m=>m.id===id).name}」`, 'system');
    render();
  });
  document.querySelectorAll('[data-equip]').forEach(el=> el.onclick=()=>equipItem(S.inventory[parseInt(el.dataset.equip)]));
  document.querySelectorAll('[data-useconsumable]').forEach(el=> el.onclick=()=> useConsumable(parseInt(el.dataset.useconsumable)));
  document.querySelectorAll('[data-usemanual]').forEach(el=> el.onclick=()=> useManual(parseInt(el.dataset.usemanual)));
  document.querySelectorAll('[data-forgeitem]').forEach(el=> el.onclick=()=>{
    if(S.location!=="jinling" || S.visitingSect) return;
    const ref = el.dataset.forgeitem;
    let item = null;
    if(ref.startsWith('eq:')) item = S.equipment[ref.slice(3)];
    else if(ref.startsWith('bag:')) item = S.inventory[parseInt(ref.slice(4))];
    performAwaken(item);
  });
  document.querySelectorAll('[data-buyitem]').forEach(el=> el.onclick=()=>{
    if(S.location!=="jinling" || S.visitingSect) return;
    const c = findConsumable(el.dataset.buyitem);
    if(!c || S.gold<c.price) return;
    S.gold -= c.price;
    addConsumable(c.id, 1);
    addLog(`向回春堂買了「${c.name}」，花費 ${formatMoney(c.price)}`, 'system');
    render();
  });
  // 背包販售：不再跳瀏覽器 confirm() 彈窗，改成點下去先在原地換成「確認賣出／取消」，
  // 用 uid 記住是哪一件（背包陣列順序可能因為新掉落/賣出而變動，idx 不可靠）。
  document.querySelectorAll('[data-bagsell]').forEach(el=> el.onclick=()=>{
    const idx = parseInt(el.dataset.bagsell);
    const item = S.inventory[idx];
    if(!item) return;
    if(item.locked){ addLog(`「${item.name}」已鎖定，無法販售`, 'warn'); render(); return; }
    S.bagSellConfirmUid = item.uid;
    render();
  });
  document.querySelectorAll('[data-bagsellcancel]').forEach(el=> el.onclick=()=>{ S.bagSellConfirmUid = null; render(); });
  document.querySelectorAll('[data-bagsellconfirm]').forEach(el=> el.onclick=()=>{
    const idx = parseInt(el.dataset.bagsellconfirm);
    const item = S.inventory[idx];
    S.bagSellConfirmUid = null;
    if(!item || item.locked){ render(); return; }
    if(item.kind==="consumable"){
      S.gold += 1;
      item.qty -= 1;
      if(item.qty<=0) S.inventory = S.inventory.filter(it=>it!==item);
      addLog(`把一份「${item.name}」隨手賣了，得 1 銅錢`, 'system');
      render();
      return;
    }
    S.gold += 1;
    S.inventory = S.inventory.filter((_,i)=>i!==idx);
    addLog(`把「${item.name}」隨手賣了，得 1 銅錢`, 'system');
    render();
  });
  document.querySelectorAll('[data-equipsub]').forEach(el=> el.onclick=()=>{ S.equipSubTab = el.dataset.equipsub; render(); });
  document.querySelectorAll('[data-bagfilter]').forEach(el=> el.onclick=()=>{ S.bagFilter = el.dataset.bagfilter; render(); });
  document.querySelectorAll('[data-autoselltier]').forEach(el=> el.onchange=()=>{ S.autoSellTiers[el.dataset.autoselltier] = el.checked; render(); });
  document.querySelectorAll('[data-autosellrun]').forEach(el=> el.onclick=()=> autoSellByTier());
  document.querySelectorAll('[data-codexsub]').forEach(el=> el.onclick=()=>{
    S.codexSubTab = el.dataset.codexsub;
    S.codexInternalSect = null; S.codexInternalSkillId = null; // 切換百科分類時重置內功心法的鑽入層級
    render();
  });
  document.querySelectorAll('[data-codexinternalsect]').forEach(el=> el.onclick=()=>{ S.codexInternalSect = el.dataset.codexinternalsect; S.codexInternalSkillId = null; render(); });
  document.querySelectorAll('[data-codexinternalskill]').forEach(el=> el.onclick=()=>{ S.codexInternalSkillId = el.dataset.codexinternalskill; render(); });
  document.querySelectorAll('[data-codexinternalback]').forEach(el=> el.onclick=()=>{
    if(el.dataset.codexinternalback==="skill") S.codexInternalSkillId = null;
    else { S.codexInternalSect = null; S.codexInternalSkillId = null; }
    render();
  });
  document.querySelectorAll('[data-changelogpage]').forEach(el=> el.onclick=()=>{
    const perPage = 10;
    const totalPages = Math.max(1, Math.ceil(CHANGELOG.length/perPage));
    const dir = el.dataset.changelogpage==="next" ? 1 : -1;
    S.changelogPage = Math.min(totalPages-1, Math.max(0, (S.changelogPage||0)+dir));
    render();
  });
  document.querySelectorAll('[data-mapsub]').forEach(el=> el.onclick=()=>{
    S.mapSubTab = el.dataset.mapsub;
    if(S.mapSubTab!=="sects") S.visitingSect = null; // 切到金凌城／狩獵區視同離開門派
    render();
  });
  document.querySelectorAll('[data-gotown]').forEach(el=> el.onclick=()=>{
    S.location="jinling"; S.monster=null; S.monsters=[]; S.visitingSect=null; addLog(`你動身返回金凌城休整。`, 'system'); render();
  });
  document.querySelectorAll('[data-zone]').forEach(el=> el.onclick=()=>{
    S.location = el.dataset.zone;
    S.visitingSect = null;
    const zoneName = HUNTING_ZONES.find(z=>z.id===S.location).name;
    addLog(`你動身前往「${zoneName}」，開始新的狩獵`, 'system');
    spawnMonster(); render();
  });
  document.querySelectorAll('[data-sellitem]').forEach(el=> el.onclick=()=>{
    if(S.location!=="jinling" || S.visitingSect) return;
    const idx = parseInt(el.dataset.sellitem);
    const item = S.inventory[idx];
    if(!item) return;
    if(item.locked){ addLog(`「${item.name}」已鎖定，無法販售`, 'warn'); render(); return; }
    const val = equipSellValue(item);
    if(!confirm(`確定要把「${item.name}」賣給鑄劍閣換 ${formatMoney(val)}嗎？`)) return;
    S.gold += val;
    S.inventory = S.inventory.filter((_,i)=>i!==idx);
    addLog(`把「${item.name}」賣給了鐵匠鋪，得 ${formatMoney(val)}`, 'system');
    render();
  });
  document.querySelectorAll('[data-slotview]').forEach(el=> el.onclick=()=>{
    const slot = el.dataset.slotview;
    S.pickerSlot = slot;
    S.pickerSnapshot = S.inventory.filter(it=>it.slot===slot);
    render();
  });
  document.querySelectorAll('[data-monsterinfohover]').forEach(el=>{
    el.onmouseenter = ()=>{
      // 武當卡片列每張怪物卡都可以 hover（不像舊版地圖只有「目前交手對象」那一張有這個屬性），
      // 要用 data-mobuid 找出「這張卡片對應的是哪一隻」，不能再籠統地抓 S.monsters[0]。
      const uid = el.dataset.mobuid;
      const m = uid!=null ? (S.monsters||[]).find(x=>String(x.uid)===uid) : (S.monster || (S.monsters && S.monsters[0]));
      if(!m) return;
      const tip = getFloatTooltipEl();
      tip.innerHTML = monsterInfoTooltipHtml(m);
      positionFloatTooltip(tip, el);
    };
    el.onmouseleave = ()=>{ getFloatTooltipEl().style.display = "none"; };
  });
  document.querySelectorAll('[data-closewarning]').forEach(el=> el.onclick=(e)=>{ if(e.target!==el) return; S.warningModal=null; S.warningCooldown=20; render(); });
  document.querySelectorAll('.wxg-modal button[data-closewarning]').forEach(el=> el.onclick=()=>{ S.warningModal=null; S.warningCooldown=20; render(); });
  document.querySelectorAll('[data-closepicker]').forEach(el=> el.onclick=(e)=>{ if(e.target!==el) return; S.pickerSlot=null; S.pickerSnapshot=[]; render(); });
  document.querySelectorAll('.wxg-modal button[data-closepicker]').forEach(el=> el.onclick=()=>{ S.pickerSlot=null; S.pickerSnapshot=[]; render(); });
  document.querySelectorAll('[data-pickequip]').forEach(el=> el.onclick=()=>{ equipItem(S.inventory[parseInt(el.dataset.pickequip)]); S.pickerSlot=null; render(); });
  document.querySelectorAll('[data-pickersell]').forEach(el=> el.onclick=()=>{
    const idx = parseInt(el.dataset.pickersell);
    const item = S.inventory[idx];
    if(!item || item.locked) return;
    const val = equipSellValue(item);
    if(!confirm(`確定要把「${item.name}」賣掉換 ${formatMoney(val)}嗎？`)) return;
    S.gold += val;
    S.inventory = S.inventory.filter((_,i)=>i!==idx);
    addLog(`把「${item.name}」隨手賣了，得 ${formatMoney(val)}`, 'system');
    render();
  });
  document.querySelectorAll('[data-locktoggle]').forEach(el=> el.onclick=()=>{
    const item = S.inventory[parseInt(el.dataset.locktoggle)];
    if(item){ item.locked = !item.locked; addLog(`「${item.name}」已${item.locked?'鎖定':'解鎖'}`, 'system'); }
    render();
  });
}
