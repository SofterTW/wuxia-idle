const TIER_TABLE = [
  {req:0, mult:0, hpBonus:0, mpBonus:0},
  {req:500, mult:0.10, hpBonus:0, mpBonus:0.15},
  {req:2000, mult:0.25, hpBonus:0.20, mpBonus:0.30},
  {req:8000, mult:0.35, hpBonus:0.20, mpBonus:0.30},
  {req:25000, mult:0.45, hpBonus:0.20, mpBonus:0.30},
  {req:80000, mult:0.60, hpBonus:0.20, mpBonus:0.30},
];

const INTERNAL_POOL = [
  {id:"tuna", name:"基礎吐納訣", sect:null, affinity:"太極"},
  {id:"jiuyang", name:"九陽神功", sect:null, affinity:"陽剛"},
  {id:"beiming", name:"北冥神功", sect:null, affinity:"陰柔"},
  {id:"taiji_qi", name:"太極玄功", sect:"wudang", affinity:"太極"},
];
