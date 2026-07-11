const MARTIAL_TIER_TABLE = [0,50,150,300,600,1000,1600,2500,4000];

const MARTIAL_POOL = {
  "拳掌":[{id:"luohan",name:"羅漢拳",affinity:"陽剛",dmgType:"外功",special:"擊退"},{id:"jingang",name:"金剛伏魔指",affinity:"陽剛",dmgType:"外功",special:"暈眩"}],
  "劍法":[{id:"taiji_jian",name:"太極劍",affinity:"太極",dmgType:"外功",special:"降低對方防禦"},{id:"jiuyin_jian",name:"九陰劍法",affinity:"陰柔",dmgType:"內功",special:"流血"}],
  "棍法":[{id:"dagou",name:"打狗棒法",affinity:"陰柔",dmgType:"外功",special:"擊退",need:0},{id:"jianglong",name:"降龍十八掌",affinity:"陽剛",dmgType:"外功",special:"暈眩",need:2}],
  "暗器":[{id:"feibiao",name:"追魂奪命鏢",affinity:"陰柔",dmgType:"外功",special:"流血"},{id:"duzhen",name:"含沙射影針",affinity:"陰柔",dmgType:"外功",special:"中毒疊層"}],
  "刀法":[{id:"modao",name:"魔刀連環斬",affinity:"陽剛",dmgType:"外功",special:"流血"},{id:"shenghuo",name:"聖火焚天",affinity:"陽剛",dmgType:"內功",special:"降低對方防禦"}],
};
