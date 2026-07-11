// 固定命名的「門派至寶」：素質固定，不像一般裝備隨機生成。
// 六件為各門派鎮派之寶，預設供奉於各自門派大殿（見 renderMap 的門派拜訪頁）；
// 另兩件不屬於任何門派，僅收錄於圖鑑。
// 目前預設「無法取得」（見 game/combat.js 註解），保留給日後開放的玩法（例如盜取、奇遇任務）。
const UNIQUE_EQUIPMENT = [
  {id:"xiangmo_quan", name:"降魔金剛拳", slot:"兵刃", sect:"shaolin", bonus:{臂力:38, 體魄:14},
    desc:"少林鎮寺之寶，拳勁如金剛不壞。", obtain:"目前尚無取得途徑，日後開放相關玩法才能盜取或求得。"},
  {id:"taixu_jian", name:"太虛劍胎", slot:"兵刃", sect:"wudang", bonus:{身法:22, 內息:26},
    desc:"武當祖傳劍胚，劍氣渾然天成。", obtain:"目前尚無取得途徑，日後開放相關玩法才能盜取或求得。"},
  {id:"bailian_sui", name:"白蓮劍穗", slot:"兵刃", sect:"emei", bonus:{內息:30, 罡氣:18},
    desc:"峨嵋鎮派信物，劍穗所指、心念隨至。", obtain:"目前尚無取得途徑，日後開放相關玩法才能盜取或求得。"},
  {id:"longtou_bang", name:"龍頭打狗棒", slot:"兵刃", sect:"gaibang", bonus:{臂力:26, 身法:22},
    desc:"丐幫幫主信物，代代相傳的打狗棒法真傳。", obtain:"目前尚無取得途徑，日後開放相關玩法才能盜取或求得。"},
  {id:"qianji_nang", name:"千機暗器囊", slot:"暗器", sect:"tangmen", bonus:{身法:36, 罡氣:12},
    desc:"唐門機關暗器囊，出手快如鬼魅。", obtain:"目前尚無取得途徑，日後開放相關玩法才能盜取或求得。"},
  {id:"shenghuo_dao", name:"聖火魔刀", slot:"兵刃", sect:"mingjiao", bonus:{臂力:30, 內息:20},
    desc:"明教聖物，刀鋒映著聖火餘焰。", obtain:"目前尚無取得途徑，日後開放相關玩法才能盜取或求得。"},
  {id:"xuantie_jing", name:"玄鐵護心鏡", slot:"戰袍", sect:null, bonus:{體魄:32, 罡氣:16},
    desc:"江湖罕見的玄鐵鑄甲，可護心脈周全，不屬任何一門一派。", obtain:"目前尚無取得途徑。"},
  {id:"tianji_yupei", name:"天機玉珮", slot:"項飾", sect:null, bonus:{臂力:8, 身法:8, 內息:8, 罡氣:8, 體魄:8},
    desc:"傳聞出自異人之手，五行俱通、屬性均衡，不屬任何一門一派。", obtain:"目前尚無取得途徑。"},
];

function instantiateUniqueEquipment(u){
  return {
    name:u.name, bonus:{...u.bonus}, slot:u.slot, kind:"equipment",
    tierKey:"jade", jadeGrade:7, awakened:[], locked:false, unique:true, uniqueId:u.id,
  };
}

// 判斷玩家目前是否「持有」（已裝備或在背包中）某件門派至寶——
// 持有中＝已從門派大殿被取走（被盜取）；未持有＝仍供奉於大殿之中。
function ownsUniqueEquipment(id){
  if(!S) return false;
  const equipped = Object.values(S.equipment).some(it=>it && it.uniqueId===id);
  if(equipped) return true;
  return S.inventory.some(it=>it.uniqueId===id);
}

function sectUniqueEquipment(sectKey){
  return UNIQUE_EQUIPMENT.find(u=>u.sect===sectKey) || null;
}
