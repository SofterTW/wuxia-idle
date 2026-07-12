const SECTS = {
  shaolin:{name:"少林", weapon:"拳套／禪杖", weaponType:"拳掌", passive:"金剛護體：格擋疊加減傷", icon:"fist",
    base:{臂力:15,身法:6,內息:8,罡氣:8,體魄:18}},
  wudang:{name:"武當", weapon:"劍", weaponType:"劍法", passive:"以柔克剛：格擋後觸發內功追擊", icon:"sword",
    base:{臂力:10,身法:10,內息:14,罡氣:10,體魄:10}},
  emei:{name:"峨嵋", weapon:"劍／拂塵", weaponType:"劍法", passive:"靈慧：內力回復加快", icon:"sword",
    base:{臂力:6,身法:8,內息:18,罡氣:14,體魄:6}},
  gaibang:{name:"丐幫", weapon:"棍／打狗棒", weaponType:"棍法", passive:"降龍霸體：擊殺數觸發無敵大招", icon:"staff",
    base:{臂力:18,身法:8,內息:6,罡氣:6,體魄:12}},
  tangmen:{name:"唐門", weapon:"暗器／短刃", weaponType:"暗器", passive:"淬毒：普攻附加中毒疊層", icon:"dart",
    base:{臂力:10,身法:18,內息:6,罡氣:8,體魄:6}},
  mingjiao:{name:"明教", weapon:"魔刀／聖火令", weaponType:"刀法", passive:"天魔解體：氣血低於50%攻擊大增", icon:"blade",
    base:{臂力:16,身法:6,內息:14,罡氣:6,體魄:6}},
};

// 尚未開放的門派：只在選門派畫面／圖鑑露出預告，不能選擇、不能遊玩。
const COMING_SOON_SECTS = [
  {key:"junzitang", name:"君子堂", teaser:"傳聞與「通慧功」有關"},
  {key:"jile_sect", name:"極樂",   teaser:"傳聞與「雙修訣」有關"},
  {key:"jinyiwei",  name:"錦衣衛", teaser:"傳聞與「玄元經」有關"},
];

// 暫時只開放武當創角，其餘五個門派（少林/峨嵋/丐幫/唐門/明教）先鎖在選門派畫面，
// 等各自的實/虛/架/氣/怒五招制武學系統做好後再一個一個依序解鎖（不影響這些門派
// 既有存檔玩家，他們照樣用舊系統玩，只是新角色暫時選不到）。
const PLAYABLE_SECTS_NOW = ["wudang"];
