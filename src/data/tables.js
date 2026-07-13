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
  {id:"canglang", name:"滄浪水寨", tag:"魔教水寨", desc:"魔教盤據的水路要道，水匪與蛟龍出沒，過往商旅聞之色變。",
    levelMod:22, monsters:["水寨舵手","黑水蛟龍","水匪頭目","伏擊死士"]},
  {id:"wanshe", name:"萬蛇谷", tag:"魔教蠱教", desc:"魔教蠱術重地，毒蛇遍布、瘴癘橫生，尋常武者不敢輕入。",
    levelMod:32, monsters:["蠱毒祭司","毒蛇死士","萬蛇長老","噬心妖蟲"]},
  {id:"tiansha", name:"天煞峰", tag:"魔教練兵地", desc:"魔教精銳練兵之地，煞氣沖天，日夜操演不休。",
    levelMod:44, monsters:["天煞死士","煞氣護法","魔教教頭","煉獄修羅"]},
  {id:"youming", name:"幽冥地宮", tag:"魔教地宮", desc:"深埋地底的魔教秘穴，鬼氣森森，據傳藏有歷代教主遺物。",
    levelMod:58, monsters:["幽冥鬼卒","枯骨劍客","地宮守衛","黑棺尊者"]},
  {id:"fentian", name:"焚天寺", tag:"魔教叛寺", desc:"本是名剎古寺，遭魔教滲透後淪為叛僧盤據的修羅場。",
    levelMod:74, monsters:["叛僧武僧","伏魔羅漢（叛）","焚天長老","烈焰金剛"]},
  {id:"mozong", name:"魔教總壇", tag:"魔教總壇", desc:"魔教立教根本所在，教主親兵環伺，非絕頂高手不可輕犯。",
    levelMod:92, monsters:["魔教精銳","四大護法","天魔尊者","教主親兵"]},
];
