const TIER_TABLE = [
  {req:0, mult:0, hpBonus:0, mpBonus:0},
  {req:500, mult:0.10, hpBonus:0, mpBonus:0.15},
  {req:2000, mult:0.25, hpBonus:0.20, mpBonus:0.30},
  {req:8000, mult:0.35, hpBonus:0.20, mpBonus:0.30},
  {req:25000, mult:0.45, hpBonus:0.20, mpBonus:0.30},
  {req:80000, mult:0.60, hpBonus:0.20, mpBonus:0.30},
];

// 內功心法表：一橫排就是一門心法，參考《九陰真經 Online》的內功設計方式——
// 除了「資質倍率」之外，每門心法還會：
//   1) 直接加成特定的主屬性（練到頂層才拿到 100%，練到一半只有一半）
//   2) 帶有一個獨特的機制性被動效果（跟門派專屬機制同等級，寫在 game/combat.js 裡）
const INTERNAL_POOL = [
  {id:"tuna", name:"基礎吐納訣", sect:null, affinity:"太極",
    bonusStat:{}, powerMult:1.00, hpMult:1.00, mpMult:1.00, defMult:1.00,
    special:null, specialValue:null,
    desc:"人人可修的入門心法，四平八穩，沒有明顯短板也沒有明顯長處。"},

  {id:"jiuyang", name:"九陽神功", sect:null, affinity:"陽剛",
    bonusStat:{內息:40, 體魄:25}, powerMult:1.15, hpMult:1.30, mpMult:0.90, defMult:1.10,
    special:"氣血低於 30% 時，受到的傷害降低 25%", specialValue:{hpThreshold:0.30, dmgReduce:0.25},
    desc:"剛猛霸道，氣血雄厚，越是身陷險境越是氣血翻湧、越打越沉穩。"},

  {id:"beiming", name:"北冥神功", sect:null, affinity:"陰柔",
    bonusStat:{內息:30, 罡氣:35}, powerMult:0.95, hpMult:0.90, mpMult:1.40, defMult:1.00,
    special:"內功招式的內力消耗降低 40%", specialValue:{mpCostMult:0.60},
    desc:"以吸納借力見長，內力儲備遠勝旁人，運起內功招式格外省力。"},

  {id:"taiji_qi", name:"太極玄功", sect:"wudang", affinity:"太極",
    bonusStat:{罡氣:30, 體魄:30}, powerMult:1.05, hpMult:1.05, mpMult:1.05, defMult:1.30,
    special:"受擊時有 15% 機率格擋，格擋傷害降低 50%", specialValue:{chance:0.15, dmgReduce:0.50},
    desc:"武當不傳之秘，以柔克剛、以靜制動，各項均衡，內功防禦尤其出色。"},
];
