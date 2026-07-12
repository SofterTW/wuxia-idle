const MARTIAL_TIER_TABLE = [0,50,150,300,600,1000,1600,2500,4000];

// 武當「實/虛/架/氣/怒」五招制武學——取代武當的舊版 MARTIAL_POOL 招式系統（只有武當用新引擎，
// 見 game/combat.js 的 combatTickWudang()，其他門派完全不受影響）。
// 資料來源：武俠掛機/武學列表.xlsx 的「武當武學」分頁，逐招對照過。
//
// 欄位說明：
//   type: "實招"|"虛招"|"架招"|"氣招"|"怒氣大招" —— 剪刀石頭布五種招式類型
//   cd: 冷卻時間，單位是「幾次 combatTickWudang() 結算」（不是秒，也不是 xlsx 原文裡那種
//       即時動作遊戲的細 Tick，兩者刻意不對齊——原文的「射程幾米」「移動速度」「起手XX Ticks」
//       這類位置/位移相關敘述，這裡一律當純風味文字，不做真的機制（使用者已確認位移/擊退先跳過）
//   dmgTier: "低"|"中"|"高"|0 —— 傷害倍率分級，0 表示這招本身不直接造成傷害
//   statA/statB: 影響招式威力的一/二主屬性
//   rageCost/mpCost: 消耗怒氣／內力，兩者不會同時扣（怒氣大招只扣怒氣）
//   effect: 給 combatTickWudang() 讀的結構化效果，null 表示純傷害沒有額外機制。
//           所有效果的實際數值都是根據 xlsx 效果說明「盡量還原精神、簡化成可執行的機制」，
//           不是逐字對應（原文很多是即時動作遊戲的細節，掛機引擎裝不下，見上面 cd 說明）。
const WUDANG_MOVESETS = [
  {key:"taiji_jian", name:"太極劍法", rarity:2, weaponSub:"單劍", moves:[
    {id:"wd_qingting_dianshui", name:"蜻蜓點水", type:"實招", affinity:"太極", dmgType:"內功", statA:"內息", statB:"臂力",
      cd:6, mpCost:10, dmgTier:"中", effect:{type:"comboBonus", buff:"攬雀尾", mult:0.20},
      desc:"鎖定技，連續三段揮劍。若自身處於「攬雀尾」狀態下施展，傷害額外提升20%。"},
    {id:"wd_yanzi_chaoshui", name:"燕子抄水", type:"實招", affinity:"太極", dmgType:"內功", statA:"內息",
      cd:8, mpCost:12, dmgTier:"中", effect:{type:"delayEnemy", ticks:2},
      desc:"扇形劍氣掃出，命中未格擋目標會延遲其下一次出手。"},
    {id:"wd_shizi_yaotou", name:"獅子搖頭", type:"實招", affinity:"太極", dmgType:"內功", statA:"內息", statB:"體魄",
      cd:15, mpCost:18, dmgTier:"中", effect:{type:"heavyStagger", ticks:3},
      desc:"蓄力重擊，命中未格擋目標會造成長時間硬直。"},
    {id:"wd_taiji_jianwu", name:"太極劍舞", type:"怒氣大招", affinity:"太極", dmgType:"內功", statA:"內息", statB:"臂力",
      cd:10, rageCost:50, dmgTier:"高", effect:{type:"ultimate", guard:"red", duration:6},
      desc:"多段絞殺大招，釋放期間紅霸體（免疫僵直與所有控制技）。"},
    {id:"wd_lanqueewei_jian", name:"攬雀尾", type:"氣招", affinity:"太極", dmgType:"內功", statA:"內息",
      cd:15, mpCost:20, dmgTier:0, effect:{type:"selfRegen", name:"攬雀尾", resource:"mp", pct:0.06, duration:12},
      desc:"核心續航技，開啟「化勁」狀態，持續回復內力。"},
    {id:"wd_tianma_xingkong", name:"天馬行空", type:"氣招", affinity:"太極", dmgType:"內功", statA:"內息",
      cd:25, mpCost:0, dmgTier:0, effect:{type:"convertResource", from:"mp", to:"hp", pct:0.40},
      desc:"核心轉換技，瞬間將自身40%內力值轉化為氣血值。"},
    {id:"wd_sanhuan_taoyue", name:"三環套月", type:"氣招", affinity:"太極", dmgType:"內功", statA:"內息",
      cd:20, mpCost:15, dmgTier:0, effect:{type:"selfBuff", name:"三環套月", statBonus:{stat:"內功命中", value:0}, mpOnHit:15, duration:20},
      desc:"開啟後，任何招式命中未格擋目標都會回復固定內力。"},
    {id:"wd_fengchui_heye", name:"風吹荷葉", type:"虛招", affinity:"太極", dmgType:"內功", statA:"內息",
      cd:5, mpCost:10, dmgTier:"低", effect:{type:"guardBreak", defReducePct:0.30, duration:8},
      desc:"破防技，動作極快。擊破目標格擋時使其外功防禦大減。"},
    {id:"wd_fangwai_aoyou", name:"方外遨遊", type:"架招", affinity:"太極", dmgType:"內功", statA:"內息", statB:"體魄",
      cd:0, mpCost:0, dmgTier:0, effect:{type:"blockBonus", procChance:0.20, bonus:"fullBlock"},
      desc:"被動格擋架勢，格擋成功時有機率直接免除該次攻擊的所有傷害。"},
  ]},
  {key:"liangyi_jian", name:"兩儀劍法", rarity:1, weaponSub:"雙劍", moves:[
    {id:"wd_riyue_jiaohui", name:"日月交輝", type:"實招", affinity:"太極", dmgType:"外功", statA:"臂力", statB:"內息",
      cd:6, mpCost:10, dmgTier:"中", effect:{type:"comboBonus", buff:"陰陽之氣", mult:0.15, minStacks:5},
      desc:"鎖定技，四段快速連擊。若「陰陽之氣」疊加5層以上，傷害額外提升。"},
    {id:"wd_kuaimo_rufeng", name:"快墨如風", type:"實招", affinity:"太極", dmgType:"外功", statA:"臂力", statB:"內息",
      cd:8, mpCost:12, dmgTier:"中", effect:null,
      desc:"揮舞雙劍連續揮砍三段。"},
    {id:"wd_jimu_yuantiao", name:"極目遠眺", type:"實招", affinity:"太極", dmgType:"外功", statA:"臂力", statB:"內息",
      cd:12, mpCost:14, dmgTier:"中", effect:{type:"heavyStagger", ticks:2},
      desc:"甩出交錯劍氣，命中未格擋目標強制陷入硬直。"},
    {id:"wd_jiansheng_taiji", name:"劍生太極", type:"怒氣大招", affinity:"太極", dmgType:"外功", statA:"臂力", statB:"內息",
      cd:10, rageCost:50, dmgTier:"高", effect:{type:"ultimate", guard:"yellow", duration:5},
      desc:"大範圍多段傷害，釋放期間黃霸體（免疫受擊僵直）。"},
    {id:"wd_yinyang_jiaocuo", name:"陰陽交錯", type:"氣招", affinity:"太極", dmgType:"外功", statA:"臂力", statB:"內息",
      cd:10, mpCost:15, dmgTier:0, effect:{type:"stackBuff", name:"陰陽之氣", statValuePerStack:0.02, maxStacks:10, duration:15},
      desc:"激活後每次命中疊加「陰陽之氣」，提升自身威力，最高10層。"},
    {id:"wd_heguang_tongchen", name:"和光同塵", type:"虛招", affinity:"太極", dmgType:"外功", statA:"臂力", statB:"內息",
      cd:5, mpCost:10, dmgTier:"低", effect:{type:"guardBreak", defReducePct:0.20, duration:10, clearShield:true},
      desc:"破防技，擊破目標格擋時清除其護盾並降低外功防禦。"},
    {id:"wd_suibo_zhuliu", name:"隨波逐流", type:"架招", affinity:"太極", dmgType:"外功", statA:"體魄", statB:"內息",
      cd:0, mpCost:0, dmgTier:0, effect:{type:"blockBonus", procChance:0.50, bonus:"stack", stackName:"陰陽之氣"},
      desc:"被動格擋架勢，格擋成功時有機率獲得一層「陰陽之氣」。"},
  ]},
  {key:"qingfeng_jian", name:"清風劍法", rarity:2, weaponSub:"單劍", moves:[
    {id:"wd_qingfeng_xulai", name:"清風徐來", type:"實招", affinity:"太極", dmgType:"內功", statA:"內息", statB:"身法",
      cd:3, mpCost:8, dmgTier:"低", effect:{type:"dotMark", name:"清風", dmgPerTick:6, maxStacks:3, duration:6},
      desc:"遠程主輸出，命中未格擋目標附加「清風」印記，可疊加3層、持續造成內功傷害。"},
    {id:"wd_yuanyuan_liuchang", name:"源遠流長", type:"實招", affinity:"太極", dmgType:"內功", statA:"內息", statB:"身法",
      cd:6, mpCost:12, dmgTier:"中", effect:{type:"comboBonus", buff:"清風", mult:0.5, monsterStack:true},
      desc:"鎖定遠程衝鋒招，若目標帶有「清風」印記，傷害額外提升。"},
    {id:"wd_zhuolang_paikong", name:"濁浪排空", type:"實招", affinity:"太極", dmgType:"內功", statA:"內息",
      cd:14, mpCost:16, dmgTier:"中", effect:{type:"heavyStagger", ticks:3},
      desc:"群體控制技，命中未格擋目標直接擊倒。"},
    {id:"wd_fenglang_qiqing", name:"風朗氣清", type:"怒氣大招", affinity:"太極", dmgType:"內功", statA:"內息",
      cd:10, rageCost:50, dmgTier:"高", effect:{type:"ultimate", guard:"yellow", duration:5, aoe:true},
      desc:"劍氣風暴大招，範圍傷害，釋放期間黃霸體。"},
    {id:"wd_yinfeng_chuihuo", name:"引風吹火", type:"虛招", affinity:"太極", dmgType:"內功", statA:"內息", statB:"身法",
      cd:5, mpCost:10, dmgTier:"低", effect:{type:"guardBreak", defReducePct:0.25, duration:8},
      desc:"遠程破防技，擊破目標格擋時使其陷入「散招」狀態。"},
    {id:"wd_mingjing_zhishui", name:"明鏡止水", type:"架招", affinity:"太極", dmgType:"內功", statA:"內息", statB:"身法",
      cd:0, mpCost:0, dmgTier:0, effect:{type:"blockBonus", procChance:0.30, bonus:"crit"},
      desc:"被動格擋架勢，格擋成功時有機率使下一次攻擊必定爆擊。"},
  ]},
  {key:"taiji_quan", name:"太極拳", rarity:4, weaponSub:"徒手", moves:[
    {id:"wd_jiaolong_chuhai", name:"蛟龍出海", type:"實招", affinity:"太極", dmgType:"內功", statA:"臂力", statB:"內息",
      cd:6, mpCost:10, dmgTier:"中", effect:null,
      desc:"鎖定技，雙拳化勁對目標進行連續重擊。"},
    {id:"wd_fanhua_wuxiu", name:"翻花舞袖", type:"實招", affinity:"太極", dmgType:"內功", statA:"臂力", statB:"體魄",
      cd:10, mpCost:14, dmgTier:"中", effect:{type:"heavyStagger", ticks:2},
      desc:"近身雙推掌，第二掌命中未格擋目標會造成站立眩暈。"},
    {id:"wd_lanqueewei_quan", name:"攬雀尾", type:"氣招", affinity:"太極", dmgType:"內功", statA:"內息", statB:"體魄",
      cd:20, mpCost:22, dmgTier:0, effect:{type:"selfShield", absorbPct:0.20, duration:10, convertToMp:true, breakStunTicks:3},
      desc:"太極拳防禦核心。開啟後獲得一個「太極氣盾」，可吸收自身最大生命值20%的任何傷害並轉化成內力（每吸收1%氣血上限就補充1%內力上限）。氣盾被打破（碎盾）時，瞬間震暈周圍敵人。"},
    {id:"wd_kai_taiji", name:"開太極", type:"怒氣大招", affinity:"太極", dmgType:"內功", statA:"臂力", statB:"內息",
      cd:10, rageCost:50, dmgTier:"高", effect:{type:"ultimate", guard:"red", duration:5, aoe:true},
      desc:"全遊戲最強核武，釋放時紅霸體，強行破壞敵方陣型並造成大範圍毀滅性控制。"},
    {id:"wd_xubu_yazhou", name:"虛步壓肘", type:"虛招", affinity:"太極", dmgType:"內功", statA:"臂力",
      cd:5, mpCost:10, dmgTier:"低", effect:{type:"guardBreak", defReducePct:0.40, duration:8},
      desc:"破防技，成功擊破目標格擋時使其招式內力消耗大增，並反噬內傷。"},
    {id:"wd_yema_fenzong", name:"野馬分鬃", type:"架招", affinity:"太極", dmgType:"內功", statA:"體魄", statB:"內息",
      cd:12, mpCost:0, dmgTier:0, effect:{type:"blockBonus", procChance:0.30, bonus:"interrupt"},
      desc:"格擋反擊架勢，格擋值全滿時成功格擋敵人衝鋒招式，有機率借力打力中斷敵人連招。"},
    {id:"wd_rufeng_sibi", name:"如封似閉", type:"氣招", affinity:"太極", dmgType:"內功", statA:"內息",
      cd:18, mpCost:20, dmgTier:"高", effect:{type:"lockTarget", duration:5, dmgPerTick:8},
      desc:"單體強控制，引導太極氣流封印目標，使其持續受創且無法行動。"},
  ]},
];
const WUDANG_MOVE_LIST = WUDANG_MOVESETS.flatMap(s=>s.moves.map(m=>({...m, moveset:s.key, movesetName:s.name, rarity:s.rarity, weaponSub:s.weaponSub})));

// 把 effect 物件轉成完整寫出所有數字的說明文字——desc 欄位是風味文字，常常只寫「大減」「提升」
// 這種模糊講法，玩家看不到實際數值；這個函式直接從 effect 的參數生成精確描述，數值永遠跟
// 實際機制同步（以後調數值只要改 effect，這段文字自動跟著對，不用另外找 desc 手動改）。
function wudangEffectDetailText(m){
  const e = m.effect;
  if(!e) return "純粹造成傷害，沒有額外機制。";
  if(e.type==="comboBonus"){
    const cond = e.minStacks ? `「${e.buff}」疊加達 ${e.minStacks} 層以上` : (e.monsterStack ? `目標帶有「${e.buff}」印記` : `自身處於「${e.buff}」狀態`);
    return `若${cond}時施展，傷害額外提升 ${Math.round(e.mult*100)}%。`;
  }
  if(e.type==="delayEnemy") return `命中未格擋目標時，延遲其下一次出手 ${e.ticks} 回合。`;
  if(e.type==="heavyStagger") return `命中未格擋目標時，造成 ${e.ticks} 回合的硬直。`;
  if(e.type==="selfBuff") return `施展後持續 ${e.duration} 回合，期間任何招式命中未格擋目標都會回復 ${e.mpOnHit} 點內力。`;
  if(e.type==="selfRegen") return `施展後持續 ${e.duration} 回合，期間每回合回復${e.resource==="mp"?"內力":"氣血"}上限的 ${Math.round(e.pct*100)}%。`;
  if(e.type==="convertResource") return `施放當下立即把自身 ${Math.round(e.pct*100)}% 的${e.from==="mp"?"內力":"氣血"}轉化為${e.to==="hp"?"氣血":"內力"}。`;
  if(e.type==="selfShield"){
    const conv = e.convertToMp ? `，吸收的傷害會依比例轉化為內力（每吸收1%氣血上限回1%內力上限）` : "";
    const brk = e.breakStunTicks ? `，護盾耗盡（碎盾）時會震暈敵人 ${e.breakStunTicks} 回合` : "";
    return `施展後獲得持續 ${e.duration} 回合、可吸收最大氣血 ${Math.round(e.absorbPct*100)}% 傷害的護盾${conv}${brk}。`;
  }
  if(e.type==="stackBuff") return `施展後持續 ${e.duration} 回合，期間每次命中未格擋目標可疊加一層「${e.name}」，每層提升自身威力 ${Math.round(e.statValuePerStack*100)}%，最高疊加 ${e.maxStacks} 層。`;
  if(e.type==="dotMark") return `命中未格擋目標時附加「${e.name}」印記，每層每回合造成 ${e.dmgPerTick} 點傷害，最高疊加 ${e.maxStacks} 層，單層持續 ${e.duration} 回合。`;
  if(e.type==="lockTarget") return `封印目標 ${e.duration} 回合，使其無法行動，並每回合造成 ${e.dmgPerTick} 點傷害。`;
  if(e.type==="guardBreak"){
    const clr = e.clearShield ? "，並清除其護盾" : "";
    return `擊破對方格擋時，使其防禦力降低 ${Math.round(e.defReducePct*100)}%，持續 ${e.duration} 回合${clr}。`;
  }
  if(e.type==="blockBonus"){
    const bonusTxt = e.bonus==="fullBlock" ? "直接免除該次攻擊的所有傷害"
      : e.bonus==="crit" ? "使自身下一次攻擊必定爆擊"
      : e.bonus==="stack" ? `獲得一層「${e.stackName}」`
      : e.bonus==="interrupt" ? "中斷敵人的連招動作" : "觸發額外效果";
    return `格擋成功時有 ${Math.round(e.procChance*100)}% 機率${bonusTxt}。`;
  }
  if(e.type==="ultimate"){
    const guardTxt = e.guard==="red" ? "紅霸體（免疫僵直與所有控制技）" : "黃霸體（免疫受擊僵直）";
    const aoeTxt = e.aoe ? "，範圍傷害會命中所有存活的敵人" : "";
    return `釋放期間持續 ${e.duration} 回合的${guardTxt}${aoeTxt}。`;
  }
  return "";
}

// 技能欄上限：實/虛/氣各 5 格，架招／怒氣大招各 1 格（見 renderMartialWudang 的裝備介面）。
const WUDANG_SLOT_CAPS = {"實招":5, "虛招":5, "架招":1, "氣招":5, "怒氣大招":1};
const WUDANG_SLOT_TYPES = ["實招","虛招","架招","氣招","怒氣大招"];

// 套路稀有度 1~7 對應的稱號跟色階（跟角色稱號系統是分開的兩套，這個專屬武學套路）。
const MOVESET_RARITY_INFO = [
  null,
  {name:"初入江湖", color:"#f0e6cf"},
  {name:"門派中流", color:"#7ec9a2"},
  {name:"江湖百家", color:"#6db3e0"},
  {name:"一派之尊", color:"#c084fc"},
  {name:"奇緣絕學", color:"#f3a03c"},
  {name:"武林至寶", color:"#4dd0c8"},
  {name:"天道神話", color:"#ff6fb0"},
];

const MARTIAL_POOL = {
  "拳掌":[{id:"luohan",name:"羅漢拳",affinity:"陽剛",dmgType:"外功",special:"擊退"},{id:"jingang",name:"金剛伏魔指",affinity:"陽剛",dmgType:"外功",special:"暈眩"}],
  "劍法":[{id:"taiji_jian",name:"太極劍",affinity:"太極",dmgType:"外功",special:"降低對方防禦"},{id:"jiuyin_jian",name:"九陰劍法",affinity:"陰柔",dmgType:"內功",special:"流血"}],
  "棍法":[{id:"dagou",name:"打狗棒法",affinity:"陰柔",dmgType:"外功",special:"擊退",need:0},{id:"jianglong",name:"降龍十八掌",affinity:"陽剛",dmgType:"外功",special:"暈眩",need:2}],
  "暗器":[{id:"feibiao",name:"追魂奪命鏢",affinity:"陰柔",dmgType:"外功",special:"流血"},{id:"duzhen",name:"含沙射影針",affinity:"陰柔",dmgType:"外功",special:"中毒疊層"}],
  "刀法":[{id:"modao",name:"魔刀連環斬",affinity:"陽剛",dmgType:"外功",special:"流血"},{id:"shenghuo",name:"聖火焚天",affinity:"陽剛",dmgType:"內功",special:"降低對方防禦"}],
};
