// 固定命名的絕世裝備：素質固定，不像一般裝備隨機生成。
// 目前統一透過「極樂谷擊殺首領」的稀有機率掉落取得（見 game/combat.js 的 onKill）。
const UNIQUE_EQUIPMENT = [
  {id:"xiangmo_quan", name:"降魔金剛拳", slot:"兵刃", bonus:{臂力:38, 體魄:14},
    desc:"少林鎮寺之寶，拳勁如金剛不壞。", obtain:"極樂谷擊殺首領，約 2% 機率掉落"},
  {id:"taixu_jian", name:"太虛劍胎", slot:"兵刃", bonus:{身法:22, 內息:26},
    desc:"武當祖傳劍胚，劍氣渾然天成。", obtain:"極樂谷擊殺首領，約 2% 機率掉落"},
  {id:"bailian_sui", name:"白蓮劍穗", slot:"兵刃", bonus:{內息:30, 罡氣:18},
    desc:"峨嵋鎮派信物，劍穗所指、心念隨至。", obtain:"極樂谷擊殺首領，約 2% 機率掉落"},
  {id:"longtou_bang", name:"龍頭打狗棒", slot:"兵刃", bonus:{臂力:26, 身法:22},
    desc:"丐幫幫主信物，代代相傳的打狗棒法真傳。", obtain:"極樂谷擊殺首領，約 2% 機率掉落"},
  {id:"qianji_nang", name:"千機暗器囊", slot:"暗器", bonus:{身法:36, 罡氣:12},
    desc:"唐門機關暗器囊，出手快如鬼魅。", obtain:"極樂谷擊殺首領，約 2% 機率掉落"},
  {id:"shenghuo_dao", name:"聖火魔刀", slot:"兵刃", bonus:{臂力:30, 內息:20},
    desc:"明教聖物，刀鋒映著聖火餘焰。", obtain:"極樂谷擊殺首領，約 2% 機率掉落"},
  {id:"xuantie_jing", name:"玄鐵護心鏡", slot:"戰袍", bonus:{體魄:32, 罡氣:16},
    desc:"江湖罕見的玄鐵鑄甲，可護心脈周全。", obtain:"極樂谷擊殺首領，約 2% 機率掉落"},
  {id:"tianji_yupei", name:"天機玉珮", slot:"項飾", bonus:{臂力:8, 身法:8, 內息:8, 罡氣:8, 體魄:8},
    desc:"傳聞出自異人之手，五行俱通、屬性均衡。", obtain:"極樂谷擊殺首領，約 2% 機率掉落"},
];

function instantiateUniqueEquipment(u){
  return {
    name:u.name, bonus:{...u.bonus}, slot:u.slot, kind:"equipment",
    tierKey:"jade", jadeGrade:7, awakened:[], locked:false, unique:true,
  };
}
