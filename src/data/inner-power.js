// 內功層數表：第 1～6 層是目前實際能透過投入修為練到的範圍（數值跟以前完全一樣，平衡不變）。
// 第 7～36 層的資料已經先建好（之後會用在別的取得管道上），但目前還沒有辦法練到，
// MAX_OBTAINABLE_TIER 就是用來擋住這件事的上限。
const TIER_TABLE = [
  {req:0, mult:0, hpBonus:0, mpBonus:0},
  {req:500, mult:0.10, hpBonus:0, mpBonus:0.15},
  {req:2000, mult:0.25, hpBonus:0.20, mpBonus:0.30},
  {req:8000, mult:0.35, hpBonus:0.20, mpBonus:0.30},
  {req:25000, mult:0.45, hpBonus:0.20, mpBonus:0.30},
  {req:80000, mult:0.60, hpBonus:0.20, mpBonus:0.30},
];
const MAX_OBTAINABLE_TIER = TIER_TABLE.length; // 目前 = 6

(function extendTierTableTo36(){
  let prev = TIER_TABLE[TIER_TABLE.length-1];
  for(let layer=TIER_TABLE.length+1; layer<=36; layer++){
    const req = Math.round(prev.req * 1.35);
    const mult = Math.round((prev.mult + 0.03) * 100) / 100;
    const hpBonus = Math.round((prev.hpBonus + 0.01) * 100) / 100;
    const mpBonus = Math.round((prev.mpBonus + 0.01) * 100) / 100;
    const tierRow = {req, mult, hpBonus, mpBonus};
    TIER_TABLE.push(tierRow);
    prev = tierRow;
  }
})();

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

  // 以下為各門派專屬的第一本心法（對應使用者提供的「一內」名稱），每門派限定。

  {id:"chanding", name:"禪定功", sect:"shaolin", affinity:"太極",
    bonusStat:{體魄:35, 內息:20}, powerMult:1.00, hpMult:1.20, mpMult:1.00, defMult:1.15,
    special:"受擊時有 12% 機率入定，直接免疫該次傷害", specialValue:{chance:0.12},
    desc:"少林入門必修，靜坐觀心、萬念歸一，受創之際偶有一瞬渾然不覺。"},

  {id:"liangyi", name:"兩儀護心功", sect:"wudang", affinity:"太極",
    bonusStat:{內息:25, 罡氣:25}, powerMult:1.00, hpMult:1.00, mpMult:1.15, defMult:1.15,
    special:"內力低於 50% 時，內力回復速度提升一倍", specialValue:{mpThreshold:0.50, regenMult:2.00},
    desc:"武當基礎護心心法，陰陽兩儀相生相濟，內力將盡時反而能加速回轉。"},

  {id:"qizhuang", name:"氣樁功", sect:"emei", affinity:"陰柔",
    bonusStat:{內息:35, 罡氣:20}, powerMult:1.10, hpMult:0.95, mpMult:1.10, defMult:1.00,
    special:"內功爆擊率固定 +15", specialValue:{critBonus:15},
    desc:"峨嵋樁功打底，氣沉丹田、意隨氣走，內功招式格外容易找準破綻。"},

  {id:"xiaoyao", name:"逍遙訣", sect:"gaibang", affinity:"陽剛",
    bonusStat:{體魄:30, 身法:25}, powerMult:1.00, hpMult:1.15, mpMult:1.00, defMult:1.00,
    special:"氣血回復速度提升 50%", specialValue:{regenMult:1.50},
    desc:"丐幫弟子四海為家、風餐露宿練出來的底子，氣血消耗總能很快補回來。"},

  {id:"qijue", name:"七絕經", sect:"tangmen", affinity:"陰柔",
    bonusStat:{身法:30, 罡氣:25}, powerMult:1.05, hpMult:0.95, mpMult:1.05, defMult:1.00,
    special:"普攻額外疊加 1 層中毒", specialValue:{extraPoisonStack:1},
    desc:"唐門不傳之秘，七步之內見血封喉，出手便已下毒，毒上加毒。"},

  {id:"chihuo", name:"赤火功", sect:"mingjiao", affinity:"陽剛",
    bonusStat:{內息:35, 臂力:20}, powerMult:1.10, hpMult:1.00, mpMult:0.95, defMult:1.00,
    special:"天魔解體觸發門檻由氣血低於 50% 提高到 65%，更容易進入爆發狀態", specialValue:{hpThreshold:0.65},
    desc:"明教聖火根本心法，體內赤焰時刻蠢動，稍有損傷便烈焰翻騰。"},

  // 以下 3 門對應尚未開放的門派（君子堂／極樂／錦衣衛），資料先建好，
  // 因為 COMING_SOON_SECTS 目前無法被選為 S.sectKey，這幾門心法暫時沒有玩家能實際使用。

  {id:"tonghui", name:"通慧功", sect:"junzitang", affinity:"太極",
    bonusStat:{內息:30, 罡氣:30}, powerMult:1.05, hpMult:1.00, mpMult:1.05, defMult:1.05,
    special:"武學招式的熟練度獲取速度提升 50%", specialValue:{proficiencyMult:1.50},
    desc:"君子堂看家心法，讀書明理、觸類旁通，練起招式來比旁人領悟得快。"},

  {id:"shuangxiu", name:"雙修訣", sect:"jile_sect", affinity:"陰柔",
    bonusStat:{內息:30, 體魄:25}, powerMult:1.05, hpMult:1.10, mpMult:1.10, defMult:0.95,
    special:"氣血與內力回復速度同時提升 30%", specialValue:{regenMult:1.30},
    desc:"極樂宗門獨有法門，陰陽調和、氣血雙補，恢復能力遠勝常人。"},

  {id:"xuanyuan", name:"玄元經", sect:"jinyiwei", affinity:"陰柔",
    bonusStat:{身法:35, 罡氣:20}, powerMult:1.00, hpMult:0.95, mpMult:1.00, defMult:1.05,
    special:"閃避值提升 20%", specialValue:{dodgeMult:1.20},
    desc:"錦衣衛秘傳輕身心法，行動如鬼似魅，尋常攻擊很難沾上邊。"},
];
