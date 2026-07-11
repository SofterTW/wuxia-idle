const FIGHTER_FIGURES = {
  // 少林：拳套小人
  shaolin:`<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="15" r="9" fill="#e8dcc0"/>
    <path d="M18 26 Q30 21 42 26 L45 62 Q30 70 15 62 Z" fill="#8a6d3b"/>
    <path d="M20 60 L14 96 L23 96 L28 62 Z" fill="#3a2810"/>
    <path d="M38 60 L46 92 L38 96 L32 62 Z" fill="#3a2810"/>
    <path d="M18 32 L6 44 L11 49 L23 38 Z" fill="#e8dcc0"/>
    <path d="M42 32 L55 38 L52 46 L40 40 Z" fill="#e8dcc0"/>
    <circle cx="55" cy="40" r="6" fill="none" stroke="#d4af37" stroke-width="2"/>
  </svg>`,
  // 武當／峨嵋：持劍小人
  wudang:`<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="15" r="9" fill="#e8dcc0"/>
    <path d="M19 26 Q30 22 41 26 L44 62 Q30 70 16 62 Z" fill="#3f5d4e"/>
    <path d="M20 60 L15 96 L23 96 L27 62 Z" fill="#241708"/>
    <path d="M37 60 L44 92 L36 96 L31 62 Z" fill="#241708"/>
    <path d="M19 32 L9 48 L15 52 L24 37 Z" fill="#e8dcc0"/>
    <path d="M40 32 L52 36 L50 43 L38 40 Z" fill="#e8dcc0"/>
    <line x1="50" y1="39" x2="72" y2="30" stroke="#d4af37" stroke-width="2.5"/>
    <line x1="46" y1="41" x2="50" y2="39" stroke="#8a6d3b" stroke-width="4"/>
  </svg>`,
  emei:`<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="15" r="9" fill="#e8dcc0"/>
    <path d="M19 26 Q30 22 41 26 L44 62 Q30 70 16 62 Z" fill="#8a6d9b"/>
    <path d="M20 60 L15 96 L23 96 L27 62 Z" fill="#241708"/>
    <path d="M37 60 L44 92 L36 96 L31 62 Z" fill="#241708"/>
    <path d="M19 32 L9 48 L15 52 L24 37 Z" fill="#e8dcc0"/>
    <path d="M40 32 L52 36 L50 43 L38 40 Z" fill="#e8dcc0"/>
    <line x1="50" y1="39" x2="72" y2="30" stroke="#d4af37" stroke-width="2.5"/>
    <line x1="46" y1="41" x2="50" y2="39" stroke="#8a6d3b" stroke-width="4"/>
  </svg>`,
  // 丐幫：持棒小人
  gaibang:`<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="15" r="9" fill="#e8dcc0"/>
    <path d="M18 26 Q30 22 42 26 L45 62 Q30 70 15 62 Z" fill="#5a4530"/>
    <path d="M19 60 L13 96 L22 96 L27 62 Z" fill="#241708"/>
    <path d="M38 60 L46 92 L38 96 L32 62 Z" fill="#241708"/>
    <path d="M18 32 L8 46 L13 51 L23 38 Z" fill="#e8dcc0"/>
    <path d="M41 32 L53 37 L50 44 L39 40 Z" fill="#e8dcc0"/>
    <line x1="50" y1="41" x2="70" y2="16" stroke="#8a6d3b" stroke-width="3"/>
    <circle cx="70" cy="16" r="4" fill="#d4af37"/>
  </svg>`,
  // 唐門：暗器小人
  tangmen:`<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="15" r="9" fill="#e8dcc0"/>
    <path d="M19 26 Q30 22 41 26 L43 60 Q30 68 17 60 Z" fill="#241708"/>
    <path d="M20 58 L15 96 L23 96 L27 60 Z" fill="#160f08"/>
    <path d="M36 58 L43 92 L35 96 L30 60 Z" fill="#160f08"/>
    <path d="M19 32 L9 46 L14 51 L24 38 Z" fill="#e8dcc0"/>
    <path d="M40 32 L54 34 L53 41 L39 39 Z" fill="#e8dcc0"/>
    <g fill="#d4af37"><path d="M54 30 L62 34 L54 36Z"/><path d="M54 38 L64 38 L54 40Z"/><path d="M54 40 L60 46 L53 42Z"/></g>
  </svg>`,
  // 明教：魔刀小人
  mingjiao:`<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="15" r="9" fill="#e8dcc0"/>
    <path d="M18 26 Q30 21 42 26 L45 62 Q30 70 15 62 Z" fill="#5c1a15"/>
    <path d="M19 60 L14 96 L23 96 L27 62 Z" fill="#241708"/>
    <path d="M38 60 L46 92 L38 96 L32 62 Z" fill="#241708"/>
    <path d="M18 32 L7 47 L13 52 L23 38 Z" fill="#e8dcc0"/>
    <path d="M42 32 L54 36 L51 43 L40 40 Z" fill="#e8dcc0"/>
    <path d="M51 40 Q66 30 70 15 Q64 32 78 34 Q62 38 51 40Z" fill="#a5332c"/>
  </svg>`,
};

const MONSTER_FIGURE = `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 8 Q42 6 44 16 Q54 20 50 34 Q56 46 46 58 Q48 76 30 82 Q12 76 14 58 Q4 46 10 34 Q6 20 16 16 Q18 6 30 8Z" fill="#3f5d4e"/>
  <circle cx="22" cy="34" r="4.5" fill="#0d0906"/><circle cx="38" cy="34" r="4.5" fill="#0d0906"/>
  <circle cx="22" cy="33" r="1.6" fill="#c9622a"/><circle cx="38" cy="33" r="1.6" fill="#c9622a"/>
  <path d="M18 50 Q30 58 42 50" stroke="#0d0906" stroke-width="2.5" fill="none"/>
  <path d="M14 58 L4 78 L14 74Z" fill="#2e4a3c"/><path d="M46 58 L56 78 L46 74Z" fill="#2e4a3c"/>
  <path d="M18 78 L12 98 L22 98 L26 80Z" fill="#26392e"/><path d="M42 78 L48 98 L38 98 L34 80Z" fill="#26392e"/>
</svg>`;

const BOSS_FIGURE = `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 6 Q46 4 48 16 Q60 20 55 36 Q62 50 50 62 Q53 80 30 86 Q7 80 10 62 Q-2 50 5 36 Q0 20 12 16 Q14 4 30 6Z" fill="#8c2f2f"/>
  <path d="M18 14 L10 2 L20 10Z" fill="#5c1a15"/><path d="M42 14 L50 2 L40 10Z" fill="#5c1a15"/>
  <circle cx="21" cy="36" r="5.5" fill="#f3d878"/><circle cx="39" cy="36" r="5.5" fill="#f3d878"/>
  <circle cx="21" cy="36" r="2" fill="#3a1210"/><circle cx="39" cy="36" r="2" fill="#3a1210"/>
  <path d="M16 54 Q30 64 44 54" stroke="#3a1210" stroke-width="3" fill="none"/>
  <path d="M10 62 L-2 84 L12 80Z" fill="#6b2320"/><path d="M50 62 L62 84 L48 80Z" fill="#6b2320"/>
  <path d="M16 84 L9 100 L21 100 L26 86Z" fill="#4a1815"/><path d="M44 84 L51 100 L39 100 L34 86Z" fill="#4a1815"/>
</svg>`;

const ICONS = {
  monster:`<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="19" ry="17" fill="#5eab88"/><circle cx="25" cy="30" r="4" fill="#0d0906"/><circle cx="39" cy="30" r="4" fill="#0d0906"/><path d="M21 44 Q32 51 43 44" stroke="#0d0906" stroke-width="2" fill="none"/></svg>`,
  boss:`<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="23" ry="19" fill="#d1564c"/><circle cx="23" cy="28" r="5" fill="#f3d878"/><circle cx="41" cy="28" r="5" fill="#f3d878"/><path d="M17 46 Q32 55 47 46" stroke="#f3d878" stroke-width="3" fill="none"/></svg>`,
};

const SECT_ICONS = {
  // 少林：山門寶塔剪影
  shaolin:`<svg viewBox="0 0 64 64">
    <path d="M32 4 L38 12 L26 12 Z" fill="#d4af37"/>
    <rect x="27" y="12" width="10" height="6" fill="#d4af37"/>
    <path d="M22 18 L42 18 L40 24 L24 24 Z" fill="#d4af37"/>
    <rect x="26" y="24" width="12" height="7" fill="#c9a24a"/>
    <path d="M18 31 L46 31 L43 38 L21 38 Z" fill="#d4af37"/>
    <rect x="16" y="38" width="32" height="20" fill="#8a6d3b"/>
    <rect x="24" y="44" width="6" height="14" fill="#3a2810"/>
    <rect x="34" y="44" width="6" height="14" fill="#3a2810"/>
    <circle cx="32" cy="47" r="3" fill="#d4af37"/>
  </svg>`,
  // 武當：雲頂寶劍
  wudang:`<svg viewBox="0 0 64 64">
    <path d="M32 4 L35 30 L29 30 Z" fill="#d4af37"/>
    <rect x="29" y="30" width="6" height="4" fill="#8a6d3b"/>
    <rect x="24" y="34" width="16" height="4" fill="#c9a24a"/>
    <rect x="29" y="38" width="6" height="12" fill="#5a4a30"/>
    <path d="M8 42 Q20 34 32 42 Q44 50 56 42 Q44 56 32 50 Q20 56 8 42Z" fill="none" stroke="#d4af37" stroke-width="2" opacity="0.85"/>
    <path d="M6 50 Q20 44 32 50 Q44 44 58 50" fill="none" stroke="#c9a24a" stroke-width="1.5" opacity="0.6"/>
  </svg>`,
  // 峨嵋：白象與蓮花（十方普賢意象）
  emei:`<svg viewBox="0 0 64 64">
    <ellipse cx="32" cy="34" rx="16" ry="12" fill="#e8dcc0"/>
    <path d="M18 34 Q10 30 9 40 Q14 40 18 36Z" fill="#e8dcc0"/>
    <circle cx="24" cy="30" r="2" fill="#3a2810"/>
    <path d="M44 32 L50 40 L44 40Z" fill="#e8dcc0"/>
    <path d="M20 44 L44 44 L40 58 L24 58 Z" fill="#d4af37" opacity="0.9"/>
    <path d="M32 44 L26 58 M32 44 L32 58 M32 44 L38 58" stroke="#8a6d3b" stroke-width="1"/>
  </svg>`,
  // 丐幫：打狗棒與葫蘆
  gaibang:`<svg viewBox="0 0 64 64">
    <rect x="29" y="6" width="4" height="50" fill="#8a6d3b" transform="rotate(8 31 31)"/>
    <circle cx="31" cy="10" r="6" fill="#d4af37" transform="rotate(8 31 31)"/>
    <path d="M18 40 Q18 32 24 32 Q30 32 30 40 Q30 48 24 50 Q18 48 18 40Z" fill="#c9a24a"/>
    <path d="M22 30 Q24 26 26 30" fill="none" stroke="#8a6d3b" stroke-width="2"/>
  </svg>`,
  // 唐門：暗器陣
  tangmen:`<svg viewBox="0 0 64 64">
    <g fill="#d4af37">
      <path d="M32 6 L36 24 L32 20 L28 24 Z"/>
      <path d="M32 58 L36 40 L32 44 L28 40 Z"/>
      <path d="M6 32 L24 28 L20 32 L24 36 Z"/>
      <path d="M58 32 L40 28 L44 32 L40 36 Z"/>
      <path d="M14 14 L28 26 L23 26 L23 31 Z" opacity="0.85"/>
      <path d="M50 50 L36 38 L41 38 L41 33 Z" opacity="0.85"/>
    </g>
    <circle cx="32" cy="32" r="4" fill="#8a6d3b"/>
  </svg>`,
  // 明教：聖火
  mingjiao:`<svg viewBox="0 0 64 64">
    <path d="M32 6 Q40 20 34 26 Q38 22 40 28 Q42 36 32 42 Q22 36 24 28 Q26 22 30 26 Q24 20 32 6Z" fill="#d1564c"/>
    <path d="M32 18 Q36 26 32 32 Q28 26 32 18Z" fill="#f3d878"/>
    <rect x="26" y="42" width="12" height="4" fill="#5a4a30"/>
    <rect x="22" y="46" width="20" height="10" fill="#3a2810"/>
    <circle cx="32" cy="51" r="3" fill="#d4af37"/>
  </svg>`,
};
