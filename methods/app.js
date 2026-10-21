let methods = [
  { id: "scene-hook", title: "情境鉤子卡", category: "remember", sense: ["visual", "doing"], time: 7, desc: "把內容放進真實場景，再關掉提示回想。", tags: ["單字", "概念", "情境"], output: "一段情境對話＋一個可回想場景", steps: ["選一個今天要記住的小內容。", "替它安排一個熟悉地點、人物和事件。", "移開原文，只看場景把內容說回來。"] },
  { id: "table", title: "資料轉表格訓練", category: "understand", sense: ["reading", "visual"], time: 8, desc: "把雜亂資料整理成欄位、分類、規則與摘要。", tags: ["筆記", "分類", "摘要"], output: "一張清楚表格＋一段學習摘要", steps: ["圈出重複出現的資訊類型。", "把類型變成欄位，將內容放入對應位置。", "用一句話說出表格顯示的規則。"] },
  { id: "shadowing", title: "聲音跟讀卡", category: "express", sense: ["auditory"], time: 6, desc: "用節奏、重音和遮稿複述建立音韻記憶。", tags: ["口說", "語言", "節奏"], output: "三輪：純聽 → 跟讀 → 遮稿複述", steps: ["不看文字，完整聽一次。", "跟著聲音同步模仿語調與停頓。", "關掉聲音與文字，自己說一次。"] },
  { id: "story", title: "情感故事卡", category: "remember", sense: ["auditory", "reading"], time: 8, desc: "把新概念放進有人物、情緒和反應的故事。", tags: ["故事", "情緒", "複述"], output: "一段故事＋一次口說或文字複述", steps: ["替內容選一個有目標的人物。", "加入阻礙、情緒與一個明確結果。", "不看原文，把故事和知識一起重述。"] },
  { id: "concept-web", title: "概念織網卡", category: "understand", sense: ["visual", "reading"], time: 7, desc: "用類比、隱喻和跨域連結建立知識網。", tags: ["概念圖", "類比", "連結"], output: "一張概念地圖＋每條連結的解釋", steps: ["把新概念寫在紙張中央。", "連到三個已經懂的事物。", "替每條線補上『它們因為什麼有關』。"] },
  { id: "feynman", title: "費曼原理卡", category: "understand", sense: ["reading", "auditory"], time: 9, desc: "先問為什麼，再用自己的話教給另一個人。", tags: ["理解", "教學", "原理"], output: "一段不靠術語、可以教人的解釋", steps: ["挑一個你以為自己懂的概念。", "假裝講給第一次聽的人，避開專業詞。", "找出說不清楚的地方，回去補完再講一次。"] },
  { id: "instant", title: "即時輸出卡", category: "express", sense: ["auditory", "doing"], time: 5, desc: "不準備，直接說、演或示範，讓輸出留下記憶。", tags: ["即興", "口說", "表達"], output: "三回合即興輸出＋一個修正版", steps: ["給自己 10 秒準備。", "用 30 秒直接說出目前記得的內容。", "對照缺漏後，再做一個更清楚的版本。"] },
  { id: "palace", title: "記憶宮殿 3D", category: "remember", sense: ["visual", "doing"], time: 8, desc: "把公式、歷史或單字變成物件，放進熟悉空間。", tags: ["空間", "圖像", "順序"], output: "十個位置的圖像放置與空間回想", steps: ["選一條很熟悉的空間路線。", "把每個重點誇張化，放到固定位置。", "閉眼走一次路線，把內容依序取回。"] },
  { id: "image", title: "AI 圖像變形記", category: "remember", sense: ["visual"], time: 7, desc: "把難背內容變成荒謬、高彩度的視覺錨點。", tags: ["圖像", "AI", "聯想"], output: "一張誇張圖像提示詞＋變形規則", steps: ["抓出內容裡最具體的名詞。", "放大、縮小或混合成不合理的畫面。", "請 AI 產圖，隔一段時間看圖回想原文。"] },
  { id: "highlight", title: "螢光色階筆記術", category: "understand", sense: ["visual", "reading"], time: 6, desc: "用三色原則、符號和箭頭把課文變成藏寶圖。", tags: ["筆記", "重點", "顏色"], output: "一套顏色規則＋一張符號化筆記", steps: ["只設定三種顏色，各自代表一種功能。", "先讀完一段，再標示關鍵字。", "用箭頭補上因果或順序，最後口頭解釋。"] },
  { id: "rap", title: "Rap 節奏覆誦", category: "remember", sense: ["auditory", "doing"], time: 5, desc: "把長單字或考點拆成節拍、重音和副歌。", tags: ["節奏", "單字", "跟讀"], output: "節奏拆音＋一輪影子跟讀", steps: ["把難詞依音節切開。", "替重音加上拍手或桌面節拍。", "連續念三遍，再拿掉節拍自己重現。"] },
  { id: "podcast", title: "Podcast 說書人", category: "express", sense: ["auditory", "reading"], time: 8, desc: "假裝廣播主持人，用 60 秒把知識講給聽眾。", tags: ["摘要", "口說", "簡報"], output: "一段 60 秒說書稿＋關鍵字檢核", steps: ["寫下三個一定要出現的關鍵字。", "用開場、重點、結尾錄一段 60 秒內容。", "回聽並檢查三個關鍵字是否說清楚。"] },
  { id: "mnemonic", title: "諧音迷因與口訣", category: "remember", sense: ["auditory", "visual"], time: 6, desc: "把年份、單字、流程變成順口溜、冷笑話或迷因。", tags: ["口訣", "諧音", "年份"], output: "一組口訣＋一次立即提取測驗", steps: ["找出內容裡最難抓住的聲音或順序。", "改寫成押韻、荒謬或有畫面的短句。", "把原文遮住，從口訣還原正確答案。"] },
  { id: "roleplay", title: "情境式 AI 劇本殺", category: "express", sense: ["doing", "auditory"], time: 9, desc: "把單字、歷史或概念包裝成角色扮演任務。", tags: ["角色", "AI", "情境"], output: "一段角色扮演＋五個核心詞", steps: ["設定角色、目標與一個必須解決的問題。", "要求 AI 在對話裡自然帶入五個核心詞。", "完成任務後，用自己的話解釋五個詞。"] },
  { id: "gesture", title: "微動作記憶法", category: "remember", sense: ["doing"], time: 5, desc: "把抽象概念綁定手勢、姿勢或小道具。", tags: ["動作", "身體", "概念"], output: "五個身體動作錨點＋卡住提示", steps: ["替每個概念挑一個不會混淆的動作。", "邊說內容邊完成動作。", "只做動作，測試能否想回對應內容。"] },
  { id: "walk", title: "番茄鐘走讀術", category: "remember", sense: ["doing", "visual"], time: 6, desc: "把不同內容分配到空間角落，用移動分類記憶。", tags: ["走讀", "專注", "分類"], output: "一份 20/5 走讀計畫＋空間分類表", steps: ["替不同主題指定房間裡的位置。", "每 20 分鐘專注一個位置的內容。", "休息時走過所有位置，快速回想一次。"] },
  { id: "roots", title: "字根字首拆解樹", category: "understand", sense: ["reading", "visual"], time: 7, desc: "把長單字拆成 Prefix、Root、Suffix 的文字樂高。", tags: ["單字", "字根", "結構"], output: "一棵字根拆解樹＋同根延伸", steps: ["標出字首、字根與字尾。", "分別寫出每一塊的意思。", "找三個同根單字，畫成一棵延伸樹。"] },
  { id: "map", title: "知識地圖連連看", category: "understand", sense: ["visual", "reading"], time: 9, desc: "把破碎知識拖成『因為 A，所以 B』的因果網絡。", tags: ["因果", "地圖", "架構"], output: "一張因果鏈地圖＋邏輯鏈檢查", steps: ["把每個重點寫成獨立節點。", "用因為、所以、但是連出關係。", "從結果往回走，檢查每一條線能否說通。"] },
  { id: "debug", title: "AI 挑錯任務", category: "improve", sense: ["reading"], time: 8, desc: "扮演抓漏專家，修正 AI 故意寫錯的摘要或解題。", tags: ["除錯", "AI", "辨析"], output: "錯誤清單＋原因＋修正版", steps: ["請 AI 產生含三個錯誤的內容。", "逐句找錯，先不要看答案。", "說明為什麼錯，再寫出完整修正版。"] },
  { id: "number", title: "數字轉碼訓練", category: "remember", sense: ["visual", "auditory"], time: 6, desc: "把年份、公式與代碼轉成可看見、可說的規則。", tags: ["數字", "年份", "公式"], output: "一組數字記憶碼＋立即提取測驗", steps: ["將數字分成二至三位一組。", "替每組數字配一個固定圖像或聲音。", "把圖像串成故事，再從故事還原數字。"] },
  { id: "contrast", title: "相似概念拆解", category: "understand", sense: ["reading", "visual"], time: 7, desc: "拆相似單字、公式或概念，做差異表與聯想鉤子。", tags: ["比較", "易混淆", "表格"], output: "一張差異表＋每組一個聯想鉤子", steps: ["把容易混淆的項目並排。", "只寫會影響判斷的差異。", "替每個差異配一個畫面或短句，立刻測一次。"] },
  { id: "repair", title: "錯誤修正回路", category: "improve", sense: ["reading", "doing"], time: 5, desc: "找出錯在哪、為什麼，再重做一次形成記憶。", tags: ["錯題", "修正", "回想"], output: "一次錯誤診斷＋一份修正版答案", steps: ["保留原本的錯誤，不急著擦掉。", "標記錯在知識、步驟還是粗心。", "蓋住答案重做，並說出這次改了什麼。"] },
  { id: "teachback", title: "看圖說回來", category: "express", sense: ["visual", "auditory"], time: 5, desc: "只看一張圖或幾個符號，把完整內容說回來。", tags: ["圖像", "複述", "回想"], output: "一張提示圖＋一次不看原文的解說", steps: ["把內容濃縮成三到五個圖像符號。", "移開原文，只保留圖像。", "依圖像順序說回完整內容，補上漏掉的地方。"] }
];

const categoryNames = { remember: "記得住", understand: "想得懂", express: "說得出", improve: "改得好" };
const senseNames = { visual: "看圖記", auditory: "聽聲記", reading: "讀寫記", doing: "動手記" };
let activeFilter = "all";
let activeSense = null;
let favoriteIds = new Set();
let openMethodId = null;

const grid = document.querySelector("#method-grid");
const count = document.querySelector("#result-count");
const search = document.querySelector("#method-search");
const empty = document.querySelector("#empty-state");
const dialog = document.querySelector("#method-dialog");
const dialogContent = document.querySelector("#dialog-content");

function coursesForMethod(id) {
  return (window.JILIGUALA_COURSES || []).filter(course => (course.methodIds || []).includes(id));
}

function card(method) {
  const courseNames = coursesForMethod(method.id).map(course => course.title);
  return `<article class="method-card">
    <div class="method-meta"><span class="category-pill">${categoryNames[method.category]}</span><span class="method-card-actions"><span class="method-time">約 ${method.time} 分鐘</span><button class="favorite-button${favoriteIds.has(method.id) ? " active" : ""}" data-favorite="${method.id}" type="button" aria-label="${favoriteIds.has(method.id) ? "取消收藏" : "收藏"}${method.title}" aria-pressed="${favoriteIds.has(method.id)}">${favoriteIds.has(method.id) ? "♥" : "♡"}</button></span></div>
    <h3>${method.title}</h3>
    <p>${method.desc}</p>
    ${courseNames.length ? `<div class="method-courses">${courseNames.map(title => `<span>${title}</span>`).join("")}</div>` : ""}
    <div class="method-tags">${method.tags.map(tag => `<span>${tag}</span>`).join("")}</div>
    <button class="method-open" data-open-method="${method.id}">打開方法卡 <span>→</span></button>
  </article>`;
}

function render() {
  const query = search.value.trim().toLowerCase();
  const visible = methods.filter(method => {
    const categoryMatch = activeFilter === "all" || method.category === activeFilter;
    const senseMatch = !activeSense || method.sense.includes(activeSense);
    const text = [method.title, method.desc, method.output, ...method.tags].join(" ").toLowerCase();
    return categoryMatch && senseMatch && text.includes(query);
  });
  grid.innerHTML = visible.map(card).join("");
  count.textContent = visible.length;
  empty.hidden = visible.length !== 0;
}

function recommendNext(method) {
  return methods
    .filter(item => item.id !== method.id)
    .map((item, index) => ({
      item,
      index,
      score: (item.category === method.category ? 3 : 0)
        + item.sense.filter(sense => method.sense.includes(sense)).length
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.item;
}

function openMethod(id) {
  const method = methods.find(item => item.id === id);
  if (!method) return;
  const recommendation = recommendNext(method);
  const courseNames = coursesForMethod(method.id).map(course => course.title);
  openMethodId = method.id;
  dialogContent.innerHTML = `<div class="dialog-head">
    <span class="category-pill">${categoryNames[method.category]} · 約 ${method.time} 分鐘</span>
    <h2>${method.title}</h2><p>${method.desc}</p>
  </div><div class="dialog-body"><h3>跟著做一次</h3><ol>${method.steps.map(step => `<li>${step}</li>`).join("")}</ol>
    <div class="dialog-output"><small>完成時，你會得到</small><strong>${method.output}</strong></div>
    ${courseNames.length ? `<p class="dialog-course-line">所屬課程：${courseNames.join("、")}</p>` : ""}
    <p class="method-tags">${method.sense.map(sense => `<span>${senseNames[sense]}</span>`).join("")}</p>
    <div class="dialog-actions">
      <button class="button button-primary" type="button" data-complete-method="${method.id}">完成一次練習 <span>✓</span></button>
      <button class="button button-quiet later-button" type="button" data-practice-later="${method.id}" aria-pressed="false">稍後練習 <span>＋</span></button>
    </div>
    <section class="method-note-panel" aria-labelledby="method-note-title">
      <div><h3 id="method-note-title">個人筆記</h3><small id="method-note-status">登入後可跨裝置保存</small></div>
      <textarea id="method-note" rows="4" maxlength="1200" placeholder="記下這個方法適合用在哪裡、下次要怎麼練…"></textarea>
      <button class="button note-save-button" type="button" data-save-note="${method.id}">儲存筆記</button>
    </section>
    ${recommendation ? `<section class="next-method-panel"><small>下一個推薦方法</small><h3>${recommendation.title}</h3><p>${recommendation.desc}</p><button class="text-button" type="button" data-open-method="${recommendation.id}">接著看這張方法卡 <span>→</span></button></section>` : ""}
  </div>`;
  if (!dialog.open) dialog.showModal();
  window.dispatchEvent(new CustomEvent("jiliguala:method-opened", { detail: method }));
}

document.addEventListener("click", event => {
  const openButton = event.target.closest("[data-open-method]");
  if (openButton) openMethod(openButton.dataset.openMethod);
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    const method = methods.find(item => item.id === favoriteButton.dataset.favorite);
    window.dispatchEvent(new CustomEvent("jiliguala:favorite", { detail: method }));
  }
  const completeButton = event.target.closest("[data-complete-method]");
  if (completeButton) {
    const method = methods.find(item => item.id === completeButton.dataset.completeMethod);
    window.dispatchEvent(new CustomEvent("jiliguala:practice", { detail: method }));
  }
  const laterButton = event.target.closest("[data-practice-later]");
  if (laterButton) {
    const method = methods.find(item => item.id === laterButton.dataset.practiceLater);
    window.dispatchEvent(new CustomEvent("jiliguala:later", { detail: method }));
  }
  const noteButton = event.target.closest("[data-save-note]");
  if (noteButton) {
    const method = methods.find(item => item.id === noteButton.dataset.saveNote);
    const content = document.querySelector("#method-note")?.value || "";
    window.dispatchEvent(new CustomEvent("jiliguala:note", { detail: { method, content } }));
  }
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    activeSense = null;
    document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
    document.querySelectorAll(".sense-card").forEach(item => item.removeAttribute("aria-pressed"));
    render();
  });
});

document.querySelectorAll(".sense-card").forEach(button => {
  button.addEventListener("click", () => {
    activeSense = activeSense === button.dataset.sense ? null : button.dataset.sense;
    document.querySelectorAll(".sense-card").forEach(item => item.setAttribute("aria-pressed", String(activeSense === item.dataset.sense)));
    document.querySelector("#library").scrollIntoView({ behavior: "smooth" });
    render();
  });
});

search.addEventListener("input", render);
document.querySelector("#clear-search").addEventListener("click", () => { search.value = ""; activeFilter = "all"; activeSense = null; document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item.dataset.filter === "all")); render(); search.focus(); });
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

window.addEventListener("jiliguala:favorites-updated", event => {
  favoriteIds = new Set(event.detail || []);
  render();
});

window.addEventListener("jiliguala:method-state", event => {
  if (event.detail?.id !== openMethodId) return;
  const note = document.querySelector("#method-note");
  const status = document.querySelector("#method-note-status");
  const laterButton = document.querySelector("[data-practice-later]");
  if (note) note.value = event.detail.note || "";
  if (status) status.textContent = event.detail.signedIn ? "已與會員帳號同步" : "登入後可跨裝置保存";
  if (laterButton) {
    laterButton.classList.toggle("active", Boolean(event.detail.savedForLater));
    laterButton.setAttribute("aria-pressed", String(Boolean(event.detail.savedForLater)));
    laterButton.innerHTML = event.detail.savedForLater ? "已加入稍後練習 <span>✓</span>" : "稍後練習 <span>＋</span>";
  }
});

window.addEventListener("jiliguala:open-method", event => openMethod(event.detail));
window.addEventListener("jiliguala:courses-loaded", render);

window.addEventListener("jiliguala:catalog-loaded", event => {
  if (!Array.isArray(event.detail) || !event.detail.length) return;
  methods = event.detail;
  window.JILIGUALA_METHODS = methods;
  render();
});

window.JILIGUALA_DEFAULT_METHODS = methods.map(method => ({ ...method }));
window.JILIGUALA_METHODS = methods;

render();
const requestedMethod = new URLSearchParams(window.location.search).get("open");
if (requestedMethod) queueMicrotask(() => openMethod(requestedMethod));
