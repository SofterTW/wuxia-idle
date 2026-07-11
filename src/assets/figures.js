// 角色小人採共用「人形模板」產生，只需替換袍色／髮型／武器，
// 避免六個門派各自手刻座標、風格不一致。

function fighterWeaponMarkup(type, id){
  const glow = `filter:drop-shadow(0 0 3px rgba(212,175,55,.9))`;
  if(type==="fist"){
    return `
    <path d="M40 26 Q53 29 56 41 Q53 46 47 44 Q43 37 38 29Z" fill="url(#robe-${id})"/>
    <circle cx="53" cy="43" r="6.5" fill="#e8dcc0" stroke="#8a6d3b" stroke-width="1.4"/>
    <path d="M49 41 L57 41 M49 45 L57 45" stroke="#5a4325" stroke-width="1"/>
    <circle cx="53" cy="43" r="9" fill="none" stroke="#d4af37" stroke-width="1.2" opacity="0.55" style="${glow}"/>`;
  }
  if(type==="sword"){
    return `
    <path d="M40 26 Q51 30 54 40 Q51 44 46 42 Q42 35 38 29Z" fill="url(#robe-${id})"/>
    <g transform="rotate(-32 53 40)" style="${glow}">
      <rect x="51.3" y="6" width="3.4" height="34" rx="1" fill="url(#blade-${id})" stroke="#e9e4d2" stroke-width="0.4"/>
      <rect x="49.5" y="39" width="7" height="3" rx="1" fill="#7a5a1e"/>
      <rect x="52" y="41" width="2" height="9" rx="1" fill="#3a2810"/>
      <circle cx="53" cy="51.5" r="1.8" fill="#d4af37"/>
    </g>`;
  }
  if(type==="staff"){
    return `
    <path d="M40 26 Q50 30 53 40 Q50 44 45 41 Q41 35 38 29Z" fill="url(#robe-${id})"/>
    <g transform="rotate(18 50 40)" style="${glow}">
      <rect x="48.5" y="2" width="3.2" height="66" rx="1.5" fill="#8a6d3b" stroke="#4a3818" stroke-width="0.4"/>
      <circle cx="50" cy="4" r="4.2" fill="#d4af37"/>
      <circle cx="50" cy="66" r="4.2" fill="#d4af37"/>
    </g>`;
  }
  if(type==="dart"){
    return `
    <path d="M40 26 Q50 28 53 37 Q50 41 45 39 Q41 33 38 27Z" fill="url(#robe-${id})"/>
    <g style="${glow}" fill="#d4af37">
      <path d="M52 26 L60 30 L52 32Z"/>
      <path d="M53 35 L62 35 L53 37Z"/>
      <path d="M52 40 L59 45 L51 42Z"/>
    </g>`;
  }
  // blade（明教魔刀）
  return `
    <path d="M40 26 Q52 29 55 40 Q52 45 46 43 Q42 36 38 29Z" fill="url(#robe-${id})"/>
    <g transform="rotate(-18 52 40)" style="${glow}">
      <path d="M50 6 Q56 20 52 40 L48 40 Q47 20 46 8Z" fill="url(#blade-${id})" stroke="#3a1210" stroke-width="0.4"/>
      <rect x="46.5" y="39" width="7" height="3" rx="1" fill="#3a1210"/>
      <rect x="49" y="41" width="2" height="8" rx="1" fill="#2a0d0a"/>
    </g>`;
}

function fighterHairMarkup(kind){
  if(kind==="monk"){
    // 少林光頭，無髮
    return `<path d="M21.5 11 Q30 4 38.5 11" fill="none" stroke="#c9a24a" stroke-width="0.6" opacity="0.5"/>`;
  }
  if(kind==="topknot"){
    return `
    <path d="M21 10 Q30 2 39 10 Q39 6 30 4 Q21 6 21 10Z" fill="#1c140c"/>
    <circle cx="30" cy="4.5" r="3" fill="#1c140c"/>
    <rect x="27" y="1.5" width="6" height="2.4" rx="1" fill="#d4af37"/>`;
  }
  if(kind==="nun"){
    return `<path d="M20.5 9 Q30 1.5 39.5 9 Q39 15 36 17 Q30 12 24 17 Q21 15 20.5 9Z" fill="#e9e2cf" opacity="0.94"/>`;
  }
  if(kind==="beggar"){
    return `
    <path d="M20.5 10 Q30 3 39.5 10 Q38 7 30 5.5 Q22 7 20.5 10Z" fill="#4a3a26"/>
    <path d="M19 9 L41 9 L39 12.5 L21 12.5Z" fill="#6b5335" opacity="0.85"/>`;
  }
  if(kind==="tangmen"){
    return `<path d="M20.5 10 Q30 2 39.5 10 Q39 5 30 3 Q21 5 20.5 10Z" fill="#160f08"/>`;
  }
  // mingjiao：束髮＋火紋額帶
  return `
  <path d="M21 10 Q30 3 39 10 Q39 6 30 4 Q21 6 21 10Z" fill="#20130f"/>
  <path d="M23 9 L37 9 L36 11.5 L24 11.5Z" fill="#a5332c"/>`;
}

function buildFighter({id, robeTop, robeBot, trim, blade1, blade2, skin, weapon, hair}){
  return `<svg viewBox="0 0 62 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="robe-${id}" x1="0.1" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stop-color="${robeTop}"/>
        <stop offset="100%" stop-color="${robeBot}"/>
      </linearGradient>
      <radialGradient id="skin-${id}" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stop-color="${skin||'#f5e8cf'}"/>
        <stop offset="100%" stop-color="#d9c4a0"/>
      </radialGradient>
      <linearGradient id="blade-${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${blade1||'#eef0e8'}"/>
        <stop offset="55%" stop-color="${blade2||'#c7cdbf'}"/>
        <stop offset="100%" stop-color="${blade1||'#eef0e8'}"/>
      </linearGradient>
    </defs>

    <!-- 後方衣袖 -->
    <path d="M21 27 Q10 33 11 49 Q15 52 19 47 Q21 37 23 29Z" fill="${robeBot}" opacity="0.85"/>

    <!-- 雙腿 -->
    <path d="M23 63 Q17 79 18 95 L27 95 Q28 79 30 63Z" fill="${robeBot}"/>
    <path d="M39 63 Q45 79 44 95 L35 95 Q34 79 32 63Z" fill="${robeBot}"/>
    <path d="M23 63 Q17 79 18 95 L21 95 Q21 79 26 63Z" fill="#000" opacity="0.12"/>

    <!-- 靴 -->
    <path d="M16 91 L28 91 L27 97 L14 97Z" fill="#1c130a"/>
    <path d="M34 91 L46 91 L48 97 L35 97Z" fill="#1c130a"/>
    <path d="M16 91 L28 91 L27.5 93.5 L16.5 93.5Z" fill="#3a2810"/>
    <path d="M34 91 L46 91 L46.4 93.5 L34.4 93.5Z" fill="#3a2810"/>

    <!-- 身軀／長袍 -->
    <path d="M20 25 Q31 18 42 25 L46 47 Q43 59 31 65 Q19 59 16 47Z" fill="url(#robe-${id})" stroke="#160e07" stroke-width="0.6"/>
    <path d="M31 25 L31 63" stroke="#000" stroke-width="0.6" opacity="0.15"/>

    <!-- 衣領 -->
    <path d="M25.5 25 Q31 31.5 36.5 25 L34.5 22.5 Q31 27 27.5 22.5Z" fill="${trim}"/>

    <!-- 腰帶 -->
    <rect x="19.5" y="45" width="23" height="4.2" rx="1.6" fill="${trim}"/>
    <circle cx="31" cy="47.1" r="2.1" fill="#d4af37"/>

    <!-- 前方衣袖／武器 -->
    ${fighterWeaponMarkup(weapon, id)}

    <!-- 頸 -->
    <rect x="27.5" y="18.5" width="7" height="6.5" fill="url(#skin-${id})"/>

    <!-- 頭 -->
    <circle cx="31" cy="13" r="9" fill="url(#skin-${id})"/>

    <!-- 髮型／頭飾 -->
    ${fighterHairMarkup(hair)}

    <!-- 五官 -->
    <path d="M26.5 14 q1.6 -1.6 3.2 0" stroke="#2a1c10" stroke-width="0.9" fill="none" stroke-linecap="round"/>
    <path d="M32.3 14 q1.6 -1.6 3.2 0" stroke="#2a1c10" stroke-width="0.9" fill="none" stroke-linecap="round"/>
    <path d="M29.5 19.5 q1.5 1 3 0" stroke="#8a5a44" stroke-width="0.7" fill="none" stroke-linecap="round" opacity="0.7"/>
  </svg>`;
}

const FIGHTER_FIGURES = {
  shaolin: buildFighter({id:"shaolin", robeTop:"#a8845a", robeBot:"#6b4f28", trim:"#d4af37", skin:"#f2e0bd", weapon:"fist", hair:"monk"}),
  wudang: buildFighter({id:"wudang", robeTop:"#4d7364", robeBot:"#26463a", trim:"#d4af37", blade1:"#f3f6ee", blade2:"#b9c7bd", weapon:"sword", hair:"topknot"}),
  emei: buildFighter({id:"emei", robeTop:"#a58bc4", robeBot:"#6b5390", trim:"#e8dcc0", blade1:"#f3f6ee", blade2:"#c9b9df", weapon:"sword", hair:"nun"}),
  gaibang: buildFighter({id:"gaibang", robeTop:"#8a7550", robeBot:"#5a4a30", trim:"#8a6d3b", weapon:"staff", hair:"beggar"}),
  tangmen: buildFighter({id:"tangmen", robeTop:"#3a3a42", robeBot:"#17171c", trim:"#8a6d9b", weapon:"dart", hair:"tangmen"}),
  mingjiao: buildFighter({id:"mingjiao", robeTop:"#8c3a2f", robeBot:"#4a1712", trim:"#d4af37", blade1:"#f3d878", blade2:"#a5332c", weapon:"blade", hair:"mingjiao"}),
};

const MONSTER_FIGURE = `<svg viewBox="0 0 62 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="mon-body" cx="35%" cy="25%" r="80%">
      <stop offset="0%" stop-color="#6fb894"/>
      <stop offset="100%" stop-color="#33513f"/>
    </radialGradient>
  </defs>
  <path d="M31 8 Q43 6 45 16 Q55 20 51 34 Q57 46 47 58 Q49 76 31 82 Q13 76 15 58 Q5 46 11 34 Q7 20 17 16 Q19 6 31 8Z" fill="url(#mon-body)" stroke="#1c2d22" stroke-width="0.6"/>
  <path d="M20 22 Q31 15 42 22" fill="none" stroke="#1c2d22" stroke-width="1.1" opacity="0.5"/>
  <circle cx="23" cy="34" r="4.6" fill="#0d0906"/><circle cx="39" cy="34" r="4.6" fill="#0d0906"/>
  <circle cx="23" cy="33" r="1.7" fill="#e8823a"/><circle cx="39" cy="33" r="1.7" fill="#e8823a"/>
  <path d="M19 50 Q31 59 43 50" stroke="#0d0906" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M15 58 L5 78 L15 74Z" fill="#2e4a3c"/><path d="M47 58 L57 78 L47 74Z" fill="#2e4a3c"/>
  <path d="M19 78 L13 98 L23 98 L27 80Z" fill="#26392e"/><path d="M43 78 L49 98 L39 98 L35 80Z" fill="#26392e"/>
  <path d="M19 78 L13 98 L16.5 98 L21.5 79.5Z" fill="#152019"/>
</svg>`;

const BOSS_FIGURE = `<svg viewBox="0 0 62 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="boss-body" cx="35%" cy="25%" r="80%">
      <stop offset="0%" stop-color="#c14a3f"/>
      <stop offset="100%" stop-color="#5c1a15"/>
    </radialGradient>
    <radialGradient id="boss-eye" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#fff3c9"/>
      <stop offset="100%" stop-color="#e8b23c"/>
    </radialGradient>
  </defs>
  <path d="M31 6 Q47 4 49 16 Q61 20 56 36 Q63 50 51 62 Q54 80 31 86 Q8 80 11 62 Q-1 50 6 36 Q1 20 13 16 Q15 4 31 6Z" fill="url(#boss-body)" stroke="#2c0a08" stroke-width="0.7"/>
  <path d="M19 14 L11 2 L21 10Z" fill="#5c1a15"/><path d="M43 14 L51 2 L41 10Z" fill="#5c1a15"/>
  <path d="M19 14 L11 2 L15 9Z" fill="#8a2b23"/><path d="M43 14 L51 2 L47 9Z" fill="#8a2b23"/>
  <circle cx="22" cy="36" r="5.6" fill="url(#boss-eye)"/><circle cx="40" cy="36" r="5.6" fill="url(#boss-eye)"/>
  <circle cx="22" cy="36" r="2" fill="#3a1210"/><circle cx="40" cy="36" r="2" fill="#3a1210"/>
  <circle cx="22" cy="36" r="8" fill="none" stroke="#f3d878" stroke-width="0.6" opacity="0.4"/>
  <circle cx="40" cy="36" r="8" fill="none" stroke="#f3d878" stroke-width="0.6" opacity="0.4"/>
  <path d="M17 55 Q31 65 45 55" stroke="#2c0a08" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <path d="M11 62 L-1 84 L13 80Z" fill="#6b2320"/><path d="M51 62 L63 84 L49 80Z" fill="#6b2320"/>
  <path d="M17 84 L10 100 L22 100 L27 86Z" fill="#4a1815"/><path d="M45 84 L52 100 L40 100 L35 86Z" fill="#4a1815"/>
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
