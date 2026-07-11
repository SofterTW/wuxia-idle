function bindSectPick(){ document.querySelectorAll('[data-sect]').forEach(el=>{ el.onclick = ()=> newGame(el.dataset.sect); }); }

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
      S.location="jinling"; S.monster=null;
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
  document.querySelectorAll('[data-togglenside]').forEach(el=> el.onclick=()=>{ const k=el.dataset.togglenside; S.sideExpanded[k]=!S.sideExpanded[k]; render(); });
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
  document.querySelectorAll('[data-bagsell]').forEach(el=> el.onclick=()=>{
    const idx = parseInt(el.dataset.bagsell);
    const item = S.inventory[idx];
    if(!item) return;
    if(item.locked){ addLog(`「${item.name}」已鎖定，無法販售`, 'warn'); render(); return; }
    if(item.kind==="consumable"){
      if(!confirm(`確定要賣掉一份「${item.name}」換 1 銅錢嗎？（目前 x${item.qty}）`)) return;
      S.gold += 1;
      item.qty -= 1;
      if(item.qty<=0) S.inventory = S.inventory.filter(it=>it!==item);
      addLog(`把一份「${item.name}」隨手賣了，得 1 銅錢`, 'system');
      render();
      return;
    }
    if(!confirm(`確定要把「${item.name}」賣掉換 1 銅錢嗎？`)) return;
    S.gold += 1;
    S.inventory = S.inventory.filter((_,i)=>i!==idx);
    addLog(`把「${item.name}」隨手賣了，得 1 銅錢`, 'system');
    render();
  });
  document.querySelectorAll('[data-equipsub]').forEach(el=> el.onclick=()=>{ S.equipSubTab = el.dataset.equipsub; render(); });
  document.querySelectorAll('[data-bagfilter]').forEach(el=> el.onclick=()=>{ S.bagFilter = el.dataset.bagfilter; render(); });
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
    S.location="jinling"; S.monster=null; S.visitingSect=null; addLog(`你動身返回金凌城休整。`, 'system'); render();
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
