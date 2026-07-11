const TIER_TABLE = [
  {req:0, mult:0, hpBonus:0, mpBonus:0},
  {req:500, mult:0.10, hpBonus:0, mpBonus:0.15},
  {req:2000, mult:0.25, hpBonus:0.20, mpBonus:0.30},
  {req:8000, mult:0.35, hpBonus:0.20, mpBonus:0.30},
  {req:25000, mult:0.45, hpBonus:0.20, mpBonus:0.30},
  {req:80000, mult:0.60, hpBonus:0.20, mpBonus:0.30},
];

// 內功心法表：一橫排就是一門心法，每門心法都能各自設定素質倍率。
// TIER_TABLE 決定「投入修為後解鎖到第幾層、曲線長怎樣」，這裡的 powerMult／hpMult／mpMult／defMult
// 則是每門心法自己的資質高低——同樣練到頂層，天賦好的心法（例如九陽神功）效果就是比基礎吐納訣強。
// 1.0 代表跟原本吐納訣的基準值相同。
const INTERNAL_POOL = [
  {id:"tuna",     name:"基礎吐納訣", sect:null,     affinity:"太極", powerMult:1.00, hpMult:1.00, mpMult:1.00, defMult:1.00,
    desc:"人人可修的入門心法，四平八穩，沒有明顯短板也沒有明顯長處。"},
  {id:"jiuyang",  name:"九陽神功",   sect:null,     affinity:"陽剛", powerMult:1.15, hpMult:1.30, mpMult:0.90, defMult:1.10,
    desc:"剛猛霸道，練成後氣血渾厚、內功威力驚人，代價是內力消耗較快。"},
  {id:"beiming",  name:"北冥神功",   sect:null,     affinity:"陰柔", powerMult:0.95, hpMult:0.90, mpMult:1.40, defMult:1.00,
    desc:"以吸納借力見長，內力儲備遠勝旁人，但氣血、威力都偏向陰柔內斂。"},
  {id:"taiji_qi", name:"太極玄功",   sect:"wudang", affinity:"太極", powerMult:1.05, hpMult:1.05, mpMult:1.05, defMult:1.30,
    desc:"武當不傳之秘，以柔克剛、以靜制動，各項均衡，內功防禦尤其出色。"},
];
