const SLOT_LIST = ["兵刃","暗器","頭冠","戰袍","護手","腰帶","護腿","鞋履","項飾","戒指一","戒指二"];
const SLOT_LEAN = {
  "兵刃":["臂力"],"暗器":["身法"],"頭冠":["內息"],"戰袍":["體魄"],"護手":["臂力"],
  "腰帶":["內息","罡氣"],"護腿":["身法"],"鞋履":["身法"],"項飾":["罡氣"],
  "戒指一":["臂力","身法","內息","罡氣","體魄"],"戒指二":["臂力","身法","內息","罡氣","體魄"],
};

const TIER_TABLE = [
  {req:0, mult:0, hpBonus:0, mpBonus:0},
  {req:500, mult:0.10, hpBonus:0, mpBonus:0.15},
  {req:2000, mult:0.25, hpBonus:0.20, mpBonus:0.30},
  {req:8000, mult:0.35, hpBonus:0.20, mpBonus:0.30},
  {req:25000, mult:0.45, hpBonus:0.20, mpBonus:0.30},
  {req:80000, mult:0.60, hpBonus:0.20, mpBonus:0.30},
];
const MARTIAL_TIER_TABLE = [0,50,150,300,600,1000,1600,2500,4000];

const INTERNAL_POOL = [
  {id:"tuna", name:"基礎吐納訣", sect:null, affinity:"太極"},
  {id:"jiuyang", name:"九陽神功", sect:null, affinity:"陽剛"},
  {id:"beiming", name:"北冥神功", sect:null, affinity:"陰柔"},
  {id:"taiji_qi", name:"太極玄功", sect:"wudang", affinity:"太極"},
];
const MARTIAL_POOL = {
  "拳掌":[{id:"luohan",name:"羅漢拳",affinity:"陽剛",dmgType:"外功",special:"擊退"},{id:"jingang",name:"金剛伏魔指",affinity:"陽剛",dmgType:"外功",special:"暈眩"}],
  "劍法":[{id:"taiji_jian",name:"太極劍",affinity:"太極",dmgType:"外功",special:"降低對方防禦"},{id:"jiuyin_jian",name:"九陰劍法",affinity:"陰柔",dmgType:"內功",special:"流血"}],
  "棍法":[{id:"dagou",name:"打狗棒法",affinity:"陰柔",dmgType:"外功",special:"擊退",need:0},{id:"jianglong",name:"降龍十八掌",affinity:"陽剛",dmgType:"外功",special:"暈眩",need:2}],
  "暗器":[{id:"feibiao",name:"追魂奪命鏢",affinity:"陰柔",dmgType:"外功",special:"流血"},{id:"duzhen",name:"含沙射影針",affinity:"陰柔",dmgType:"外功",special:"中毒疊層"}],
  "刀法":[{id:"modao",name:"魔刀連環斬",affinity:"陽剛",dmgType:"外功",special:"流血"},{id:"shenghuo",name:"聖火焚天",affinity:"陽剛",dmgType:"內功",special:"降低對方防禦"}],
};
const MONSTER_NAMES = ["山賊","采花盜","黑衣死士","毒蛺蝶","江湖惡霸","蒙面殺手","邪派弟子","山中猛虎"];

const HUNTING_ZONES = [
  {id:"heifeng", name:"黑風寨", tag:"魔教外圍", desc:"魔教外圍據點，嘍囉與盜匪盤據，適合初入江湖歷練。",
    levelMod:0, monsters:["黑風寨嘍囉","魔教爪牙","蒙面殺手","山賊"]},
  {id:"xueyu", name:"血域刑堂", tag:"魔教中樞", desc:"魔教刑堂所在，氣氛肅殺，駐守弟子實力明顯較強。",
    levelMod:6, monsters:["血袍死士","刑堂打手","邪派長老","黑衣死士"]},
  {id:"jile", name:"極樂谷", tag:"魔教禁地", desc:"魔教秘境，妖異瘴氣瀰漫，深處似有護法級人物坐鎮。",
    levelMod:13, monsters:["毒瘴妖獸","極樂谷守衛","魔教護法","采花盜"]},
];

const CONSUMABLES = [
  {id:"jinchuang", name:"金瘡藥", desc:"外敷傷藥，立即恢復 30% 氣血上限。", effect:"healHp", value:0.30, price:5},
  {id:"huoxue", name:"活血丹", desc:"溫養內息，立即恢復 30% 內力上限。", effect:"healMp", value:0.30, price:5},
  {id:"dahuandan", name:"大還丹", desc:"少林三大神丹之一，氣血內力當場全滿，江湖難尋。", effect:"healFull", value:1, price:60},
  {id:"peiyuandan", name:"培元丹", desc:"服下後臨時提升外功／內功威力 15%，持續 20 次交手。", effect:"buffAtk", value:0.15, duration:20, price:40},
];
