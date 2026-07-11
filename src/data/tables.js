const SLOT_LIST = [...WEAPON_SLOTS, ...ARMOR_SLOTS];
const SLOT_LEAN = {...WEAPON_SLOT_LEAN, ...ARMOR_SLOT_LEAN};

const MONSTER_NAMES = ["山賊","采花盜","黑衣死士","毒蛺蝶","江湖惡霸","蒙面殺手","邪派弟子","山中猛虎"];

const HUNTING_ZONES = [
  {id:"heifeng", name:"黑風寨", tag:"魔教外圍", desc:"魔教外圍據點，嘍囉與盜匪盤據，適合初入江湖歷練。",
    levelMod:0, monsters:["黑風寨嘍囉","魔教爪牙","蒙面殺手","山賊"]},
  {id:"xueyu", name:"血域刑堂", tag:"魔教中樞", desc:"魔教刑堂所在，氣氛肅殺，駐守弟子實力明顯較強。",
    levelMod:6, monsters:["血袍死士","刑堂打手","邪派長老","黑衣死士"]},
  {id:"jile", name:"極樂谷", tag:"魔教禁地", desc:"魔教秘境，妖異瘴氣瀰漫，深處似有護法級人物坐鎮。",
    levelMod:13, monsters:["毒瘴妖獸","極樂谷守衛","魔教護法","采花盜"]},
];
