window.JILIGUALA_DEFAULT_COURSES = [
  {
    id: "memory-foundations",
    title: "記憶起步課",
    description: "從情境、圖像、節奏與空間開始，建立第一套能重複使用的記憶流程。",
    methodIds: ["scene-hook", "image", "rap", "palace", "mnemonic"],
    sortOrder: 0,
    published: true
  },
  {
    id: "deep-understanding",
    title: "理解整理課",
    description: "把資料重新分類、連結與解釋，從看懂走到能用自己的話說清楚。",
    methodIds: ["table", "highlight", "concept-web", "map", "feynman"],
    sortOrder: 1,
    published: true
  },
  {
    id: "confident-expression",
    title: "表達輸出課",
    description: "透過跟讀、即興、說書與角色任務，把知道的內容變成說得出的能力。",
    methodIds: ["shadowing", "instant", "podcast", "roleplay", "teachback"],
    sortOrder: 2,
    published: true
  },
  {
    id: "review-and-repair",
    title: "複習修正課",
    description: "辨認易混淆處、保留錯誤線索，再用修正版建立穩定的提取路徑。",
    methodIds: ["contrast", "debug", "repair", "number", "roots"],
    sortOrder: 3,
    published: true
  }
];

window.JILIGUALA_COURSES = window.JILIGUALA_DEFAULT_COURSES.map(course => ({ ...course, methodIds: [...course.methodIds] }));
