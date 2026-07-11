const RANK_TABLE = [
  {name:"外門弟子", req:0, mat:0, bonus:0},
  {name:"內門弟子", req:50, mat:10, bonus:0.02},
  {name:"記名弟子", req:150, mat:25, bonus:0.04},
  {name:"護法", req:350, mat:50, bonus:0.07},
  {name:"長老", req:700, mat:100, bonus:0.11},
  {name:"掌門", req:1500, mat:200, bonus:0.18},
];

const QUEST_TEMPLATES = HUNTING_ZONES.map(z=>({
  zoneId:z.id, zoneName:z.name, killsNeeded:5, reward:10+z.levelMod*3,
}));

const TOWN_NPCS = [
  {id:"blacksmith", name:"鑄劍閣 · 鑄劍老王", desc:"熔煉兵刃、收購用不到的裝備，換點盤纏。", action:"sell"},
  {id:"forge", name:"煉器閣 · 老煉器師", desc:"精通開光之術，能為裝備注入額外詞條，煉器技藝隨經驗成長。", action:"forge"},
  {id:"pharmacy", name:"回春堂 · 藥鋪掌櫃", desc:"販售療傷藥材與珍稀丹藥，一手交錢一手交貨。", action:"shop"},
  {id:"escort", name:"威遠鏢局 · 鏢頭", desc:"承接鏢運委託，日後開放江湖任務系統。", action:null},
  {id:"auction", name:"聚寶樓 · 拍賣行掌事", desc:"江湖奇珍異寶競標之處，日後開放玩家間交易。", action:null},
  {id:"inn", name:"悅來客棧 · 說書先生", desc:"一張醒木、一壺茶，說盡江湖恩怨與傳聞軼事。", action:null},
  {id:"blackmarket", name:"黑風地窖 · 神秘客", desc:"行蹤不定的地下商人，據說能弄到些見不得光的稀罕物。", action:null},
  {id:"stable", name:"驛馬行 · 馬夫老李", desc:"提供快馬代步，往返各大門派與狩獵區更省腳程（傳送功能開發中）。", action:null},
  {id:"guildhall", name:"江湖行會 · 知客", desc:"登記江湖身份、查看懸賞榜與英雄排行（功能開發中）。", action:null},
];
