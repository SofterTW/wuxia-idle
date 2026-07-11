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
};

// 每個狩獵區固定的首領素質（每擊殺 10 隻遇到一次）。
const BOSS_ROSTER = {
  heifeng: {name:"黑風寨寨主", level:5,  hpMax:420,  atk:20, def:12},
  xueyu:   {name:"刑堂總管",   level:13, hpMax:1450, atk:48, def:28},
  jile:    {name:"極樂尊者",   level:22, hpMax:2600, atk:88, def:50},
};
