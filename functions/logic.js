const METHOD_CATALOG = {
  "scene-hook": { title: "情境鉤子卡", category: "remember" },
  table: { title: "資料轉表格訓練", category: "understand" },
  shadowing: { title: "聲音跟讀卡", category: "express" },
  story: { title: "情感故事卡", category: "remember" },
  "concept-web": { title: "概念織網卡", category: "understand" },
  feynman: { title: "費曼原理卡", category: "understand" },
  instant: { title: "即時輸出卡", category: "express" },
  palace: { title: "記憶宮殿 3D", category: "remember" },
  image: { title: "AI 圖像變形記", category: "remember" },
  highlight: { title: "螢光色階筆記術", category: "understand" },
  rap: { title: "Rap 節奏覆誦", category: "remember" },
  podcast: { title: "Podcast 說書人", category: "express" },
  mnemonic: { title: "諧音迷因與口訣", category: "remember" },
  roleplay: { title: "情境式 AI 劇本殺", category: "express" },
  gesture: { title: "微動作記憶法", category: "remember" },
  walk: { title: "番茄鐘走讀術", category: "remember" },
  roots: { title: "字根字首拆解樹", category: "understand" },
  map: { title: "知識地圖連連看", category: "understand" },
  debug: { title: "AI 挑錯任務", category: "improve" },
  number: { title: "數字轉碼訓練", category: "remember" },
  contrast: { title: "相似概念拆解", category: "understand" },
  repair: { title: "錯誤修正回路", category: "improve" },
  teachback: { title: "看圖說回來", category: "express" }
};

function dateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function dayOffset(key, offset) {
  const date = new Date(`${key}T12:00:00+08:00`);
  date.setUTCDate(date.getUTCDate() + offset);
  return dateKey(date);
}

function weekStartKey(key) {
  const date = new Date(`${key}T12:00:00+08:00`);
  return dayOffset(key, -((date.getUTCDay() + 6) % 7));
}

function nextStreak(previousDate, currentStreak, today) {
  if (previousDate === today) return currentStreak || 1;
  if (previousDate === dayOffset(today, -1)) return (currentStreak || 0) + 1;
  return 1;
}

module.exports = { METHOD_CATALOG, dateKey, dayOffset, weekStartKey, nextStreak };
