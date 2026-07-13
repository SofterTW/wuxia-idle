// 每個狩獵區固定的怪物名單與素質，不會隨玩家等級／擊殺數變動。
// 同一隻怪物在同一張地圖裡，強度永遠一樣。
const MONSTER_ROSTER = {
  heifeng: [
    {name:"黑風寨嘍囉", level:1, hpMax:95,  atk:9,  def:4},
    {name:"魔教爪牙",   level:2, hpMax:130, atk:12, def:6},
    {name:"蒙面殺手",   level:3, hpMax:150, atk:15, def:7},
    {name:"山賊",       level:2, hpMax:115, atk:11, def:5},
  ],
  xueyu: [
    {name:"血袍死士", level:8,  hpMax:340, atk:33, def:18},
    {name:"刑堂打手", level:9,  hpMax:380, atk:36, def:20},
    {name:"邪派長老", level:11, hpMax:430, atk:40, def:23},
    {name:"黑衣死士", level:9,  hpMax:360, atk:35, def:19},
  ],
  jile: [
    {name:"毒瘴妖獸",   level:16, hpMax:620, atk:58, def:34},
    {name:"極樂谷守衛", level:17, hpMax:660, atk:62, def:36},
    {name:"魔教護法",   level:19, hpMax:730, atk:68, def:40},
    {name:"采花盜",     level:16, hpMax:600, atk:56, def:33},
  ],
  canglang: [
    {name:"水寨舵手",   level:24, hpMax:980,  atk:92,  def:55},
    {name:"黑水蛟龍",   level:26, hpMax:1080, atk:100, def:60},
    {name:"水匪頭目",   level:27, hpMax:1150, atk:106, def:64},
    {name:"伏擊死士",   level:25, hpMax:1020, atk:96,  def:57},
  ],
  wanshe: [
    {name:"蠱毒祭司",   level:33, hpMax:1650, atk:155, def:92},
    {name:"毒蛇死士",   level:34, hpMax:1720, atk:160, def:95},
    {name:"萬蛇長老",   level:36, hpMax:1900, atk:176, def:105},
    {name:"噬心妖蟲",   level:33, hpMax:1600, atk:150, def:89},
  ],
  tiansha: [
    {name:"天煞死士",   level:42, hpMax:2650, atk:248, def:148},
    {name:"煞氣護法",   level:44, hpMax:2850, atk:265, def:158},
    {name:"魔教教頭",   level:46, hpMax:3050, atk:285, def:170},
    {name:"煉獄修羅",   level:43, hpMax:2750, atk:255, def:152},
  ],
  youming: [
    {name:"幽冥鬼卒",   level:53, hpMax:4300, atk:400, def:238},
    {name:"枯骨劍客",   level:55, hpMax:4550, atk:425, def:253},
    {name:"地宮守衛",   level:57, hpMax:4850, atk:452, def:269},
    {name:"黑棺尊者",   level:54, hpMax:4400, atk:410, def:244},
  ],
  fentian: [
    {name:"叛僧武僧",     level:64, hpMax:6800, atk:635, def:378},
    {name:"伏魔羅漢（叛）", level:66, hpMax:7200, atk:670, def:400},
    {name:"焚天長老",     level:68, hpMax:7650, atk:712, def:424},
    {name:"烈焰金剛",     level:65, hpMax:7000, atk:650, def:387},
  ],
  mozong: [
    {name:"魔教精銳", level:76, hpMax:10800, atk:1005, def:598},
    {name:"四大護法", level:79, hpMax:11500, atk:1070, def:636},
    {name:"天魔尊者", level:82, hpMax:12300, atk:1145, def:680},
    {name:"教主親兵", level:77, hpMax:11000, atk:1025, def:610},
  ],
};

// 每個狩獵區固定的首領素質（每擊殺 10 隻遇到一次）。
const BOSS_ROSTER = {
  heifeng:  {name:"黑風寨寨主", level:5,  hpMax:420,   atk:20,   def:12},
  xueyu:    {name:"刑堂總管",   level:13, hpMax:1450,  atk:48,   def:28},
  jile:     {name:"極樂尊者",   level:22, hpMax:2600,  atk:88,   def:50},
  canglang: {name:"滄浪寨主",   level:29, hpMax:3800,  atk:135,  def:78},
  wanshe:   {name:"萬蛇教主",   level:39, hpMax:6800,  atk:230,  def:132},
  tiansha:  {name:"天煞尊者",   level:50, hpMax:11000, atk:372,  def:212},
  youming:  {name:"幽冥地君",   level:62, hpMax:17500, atk:593,  def:338},
  fentian:  {name:"焚天法王",   level:73, hpMax:27500, atk:930,  def:530},
  mozong:   {name:"魔教教主",   level:86, hpMax:44000, atk:1490, def:845},
};
