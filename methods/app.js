let methods = [
  { id: "scene-hook", title: "情境鉤子卡", category: "remember", sense: ["visual", "doing"], time: 7, desc: "把內容放進真實場景，再關掉提示回想。", suitableFor: "適合需要把單字、事件或抽象概念連到熟悉情境的內容。", selfTest: "遮住原文，只看場景說回關鍵內容；隔天再試一次。", tags: ["單字", "概念", "情境"], output: "一段情境對話＋一個可回想場景", steps: ["選一個今天要記住的小內容。", "替它安排一個熟悉地點、人物和事件。", "移開原文，只看場景把內容說回來。"] },
  { id: "table", title: "資料轉表格訓練", category: "understand", sense: ["reading", "visual"], time: 8, desc: "把雜亂資料整理成欄位、分類、規則與摘要。", suitableFor: "適合需要分類、比較多項資料，或找出共同規則的內容。", selfTest: "遮住表格，用一句話說出分類規則，並舉一個新例子。", tags: ["筆記", "分類", "摘要"], output: "一張清楚表格＋一段學習摘要", steps: ["圈出重複出現的資訊類型。", "把類型變成欄位，將內容放入對應位置。", "用一句話說出表格顯示的規則。"] },
  { id: "shadowing", title: "聲音跟讀卡", category: "express", sense: ["auditory"], time: 6, desc: "用節奏、重音和遮稿複述建立音韻記憶。", suitableFor: "適合語言發音、重音、語調與聽說節奏練習。", selfTest: "關掉音檔與文字，自己複述；再比對漏掉或說錯的部分。", tags: ["口說", "語言", "節奏"], output: "三輪：純聽 → 跟讀 → 遮稿複述", steps: ["不看文字，完整聽一次。", "跟著聲音同步模仿語調與停頓。", "關掉聲音與文字，自己說一次。"] },
  { id: "story", title: "情感故事卡", category: "remember", sense: ["auditory", "reading"], time: 8, desc: "把新概念放進有人物、情緒和反應的故事。", suitableFor: "適合有因果、順序或人物關係的概念；故事不能取代事實核對。", selfTest: "不看原文重述故事，檢查人物、因果與關鍵事實是否正確。", tags: ["故事", "情緒", "複述"], output: "一段故事＋一次口說或文字複述", steps: ["替內容選一個有目標的人物。", "加入阻礙、情緒與一個明確結果。", "不看原文，把故事和知識一起重述。"] },
  { id: "concept-web", title: "概念織網卡", category: "understand", sense: ["visual", "reading"], time: 7, desc: "用類比、隱喻和跨域連結建立知識網。", suitableFor: "適合需要連結新概念與已知概念的理解任務。", selfTest: "逐條遮住連線標籤，說明兩個概念為何相關；類比不等於證明。", tags: ["概念圖", "類比", "連結"], output: "一張概念地圖＋每條連結的解釋", steps: ["把新概念寫在紙張中央。", "連到三個已經懂的事物。", "替每條線補上『它們因為什麼有關』。"] },
  { id: "feynman", title: "費曼原理卡", category: "understand", sense: ["reading", "auditory"], time: 9, desc: "先問為什麼，再用自己的話教給另一個人。", suitableFor: "適合檢查自己是否能清楚解釋一個概念。", selfTest: "不看筆記向新手解釋；把卡住或只會背術語的地方列出再補學。", tags: ["理解", "教學", "原理"], output: "一段不靠術語、可以教人的解釋", steps: ["挑一個你以為自己懂的概念。", "假裝講給第一次聽的人，避開專業詞。", "找出說不清楚的地方，回去補完再講一次。"] },
  { id: "instant", title: "即時輸出卡", category: "express", sense: ["auditory", "doing"], time: 5, desc: "不準備，直接說、演或示範，讓輸出留下記憶。", suitableFor: "適合口說、簡報或短時間提取重點的練習。", selfTest: "用 30 秒輸出後對照目標重點，記下缺漏，再說一次修正版。", tags: ["即興", "口說", "表達"], output: "三回合即興輸出＋一個修正版", steps: ["給自己 10 秒準備。", "用 30 秒直接說出目前記得的內容。", "對照缺漏後，再做一個更清楚的版本。"] },
  { id: "palace", title: "記憶宮殿", category: "remember", sense: ["visual", "doing"], time: 8, desc: "把公式、歷史或單字變成物件，放進熟悉空間。", suitableFor: "適合少量、有順序的清單或步驟，不適合取代概念理解。", selfTest: "不看清單走過五個位置，按序取回內容並核對順序。", tags: ["空間", "圖像", "順序"], output: "五個位置的圖像放置與空間回想", steps: ["選一條很熟悉的空間路線。", "把最多五個重點誇張化，分別放進固定位置。", "閉眼走一次路線，把內容依序取回。"] },
  { id: "image", title: "AI 圖像變形記", category: "remember", sense: ["visual"], time: 7, desc: "把難背內容變成荒謬、高彩度的視覺錨點。", suitableFor: "適合具體詞彙或可視化事實；圖像只作線索，答案要核對原文。", selfTest: "只看圖像線索說回原內容，再檢查有沒有把聯想當成事實。", tags: ["圖像", "AI", "聯想"], output: "一張誇張圖像提示詞＋變形規則", steps: ["抓出內容裡最具體的名詞。", "放大、縮小或混合成不合理的畫面。", "請 AI 產圖，隔一段時間看圖回想原文。"] },
  { id: "highlight", title: "結構化標記筆記", category: "understand", sense: ["visual", "reading"], time: 6, desc: "先讀懂再少量標記重點；搭配遮稿回想，避免只畫線。", suitableFor: "適合先讀懂後整理長文的關鍵資訊；單純畫線不等於學會。", selfTest: "蓋住標記頁面，說出主旨與因果；若說不出，重做提取而非多畫顏色。", tags: ["筆記", "重點", "顏色"], output: "一套顏色規則＋一張符號化筆記＋一次遮稿回想", steps: ["只設定三種顏色，各自代表一種功能。", "先讀完一段，再標示關鍵字。", "用箭頭補上因果或順序，最後口頭解釋。"] },
  { id: "rap", title: "Rap 節奏覆誦", category: "remember", sense: ["auditory", "doing"], time: 5, desc: "把長單字或考點拆成節拍、重音和副歌。", suitableFor: "適合音節、順序或短清單的節奏提示。", selfTest: "拿掉節拍與口訣，獨立說出內容，再核對每一項是否正確。", tags: ["節奏", "單字", "跟讀"], output: "節奏拆音＋一輪影子跟讀", steps: ["把難詞依音節切開。", "替重音加上拍手或桌面節拍。", "連續念三遍，再拿掉節拍自己重現。"] },
  { id: "podcast", title: "Podcast 說書人", category: "express", sense: ["auditory", "reading"], time: 8, desc: "假裝廣播主持人，用 60 秒把知識講給聽眾。", suitableFor: "適合把已學內容整理成短講、摘要或口頭表達。", selfTest: "不看稿重講 60 秒，檢查三個關鍵詞與核心關係是否完整。", tags: ["摘要", "口說", "簡報"], output: "一段 60 秒說書稿＋關鍵字檢核", steps: ["寫下三個一定要出現的關鍵字。", "用開場、重點、結尾錄一段 60 秒內容。", "回聽並檢查三個關鍵字是否說清楚。"] },
  { id: "mnemonic", title: "諧音迷因與口訣", category: "remember", sense: ["auditory", "visual"], time: 6, desc: "把年份、單字、流程變成順口溜、冷笑話或迷因。", suitableFor: "適合難記的名稱、順序或任意事實；口訣需保留正確含義。", selfTest: "遮住原文由口訣還原答案，逐項核對拼寫、順序和意義。", tags: ["口訣", "諧音", "年份"], output: "一組口訣＋一次立即提取測驗", steps: ["找出內容裡最難抓住的聲音或順序。", "改寫成押韻、荒謬或有畫面的短句。", "把原文遮住，從口訣還原正確答案。"] },
  { id: "roleplay", title: "情境式 AI 劇本殺", category: "express", sense: ["doing", "auditory"], time: 9, desc: "把單字、歷史或概念包裝成角色扮演任務。", suitableFor: "適合在情境中練習語言或專業詞彙的使用。", selfTest: "對話後不看提示解釋五個目標詞，並用可靠資料核對 AI 生成內容。", tags: ["角色", "AI", "情境"], output: "一段角色扮演＋五個核心詞", steps: ["設定角色、目標與一個必須解決的問題。", "要求 AI 在對話裡自然帶入五個核心詞。", "完成任務後，用自己的話解釋五個詞。"] },
  { id: "gesture", title: "微動作記憶法", category: "remember", sense: ["doing"], time: 5, desc: "把抽象概念綁定手勢、姿勢或小道具。", suitableFor: "適合能用動作表示的流程或概念；可依身體狀況改用手勢或圖示。", selfTest: "只看動作線索說出步驟；若動作造成干擾，改用圖示重測。", tags: ["動作", "身體", "概念"], output: "五個身體動作錨點＋卡住提示", steps: ["替每個概念挑一個不會混淆的動作。", "邊說內容邊完成動作。", "只做動作，測試能否想回對應內容。"] },
  { id: "walk", title: "番茄鐘走讀術", category: "remember", sense: ["doing", "visual"], time: 25, desc: "以 20 分鐘專注和 5 分鐘走讀休息，為不同主題建立空間線索。", suitableFor: "適合需要短休息並用熟悉空間分類多個主題的情境。", selfTest: "完成 20 分鐘專注後，在 5 分鐘休息走讀時不看筆記回想各位置內容。", tags: ["走讀", "專注", "分類"], output: "一份 20/5 走讀計畫＋空間分類表", steps: ["替不同主題指定房間裡的位置。", "每 20 分鐘專注一個位置的內容。", "休息時走過所有位置，快速回想一次。"] },
  { id: "roots", title: "字根字首拆解樹", category: "understand", sense: ["reading", "visual"], time: 7, desc: "把長單字拆成 Prefix、Root、Suffix 的文字樂高。", suitableFor: "適合有規則字根、字首或字尾的詞彙，不適用於所有單字。", selfTest: "遮住拆解結果，說出各詞素的意思，再用同根新詞檢查是否理解。", tags: ["單字", "字根", "結構"], output: "一棵字根拆解樹＋同根延伸", steps: ["標出字首、字根與字尾。", "分別寫出每一塊的意思。", "找三個同根單字，畫成一棵延伸樹。"] },
  { id: "map", title: "知識地圖連連看", category: "understand", sense: ["visual", "reading"], time: 9, desc: "把破碎知識拖成『因為 A，所以 B』的因果網絡。", suitableFor: "適合需要解釋因果、順序或概念關係的內容。", selfTest: "從結果往回說明每條因果線，檢查每個連結是否有原資料支持。", tags: ["因果", "地圖", "架構"], output: "一張因果鏈地圖＋邏輯鏈檢查", steps: ["把每個重點寫成獨立節點。", "用因為、所以、但是連出關係。", "從結果往回走，檢查每一條線能否說通。"] },
  { id: "debug", title: "AI 挑錯任務", category: "improve", sense: ["reading"], time: 8, desc: "扮演抓漏專家，修正 AI 故意寫錯的摘要或解題。", suitableFor: "適合辨認常見錯誤、檢查解題步驟或摘要品質。", selfTest: "先獨立找錯，再用教材逐項驗證；不要把 AI 故意寫錯的內容當答案。", tags: ["除錯", "AI", "辨析"], output: "錯誤清單＋原因＋修正版", steps: ["請 AI 產生含三個錯誤的內容。", "逐句找錯，先不要看答案。", "說明為什麼錯，再寫出完整修正版。"] },
  { id: "number", title: "數字轉碼訓練", category: "remember", sense: ["visual", "auditory"], time: 6, desc: "把年份、公式與代碼轉成可看見、可說的規則。", suitableFor: "適合少量年份、代碼或公式中的數字片段。", selfTest: "不看轉碼線索還原原數字，逐位核對；轉碼不可取代公式理解。", tags: ["數字", "年份", "公式"], output: "一組數字記憶碼＋立即提取測驗", steps: ["將數字分成二至三位一組。", "替每組數字配一個固定圖像或聲音。", "把圖像串成故事，再從故事還原數字。"] },
  { id: "contrast", title: "相似概念拆解", category: "understand", sense: ["reading", "visual"], time: 7, desc: "拆相似單字、公式或概念，做差異表與聯想鉤子。", suitableFor: "適合容易混淆的詞、公式或相近概念。", selfTest: "隱藏差異表後，說出各項最關鍵差異並判斷新例子屬於哪一類。", tags: ["比較", "易混淆", "表格"], output: "一張差異表＋每組一個聯想鉤子", steps: ["把容易混淆的項目並排。", "只寫會影響判斷的差異。", "替每個差異配一個畫面或短句，立刻測一次。"] },
  { id: "repair", title: "錯誤修正回路", category: "improve", sense: ["reading", "doing"], time: 5, desc: "找出錯在哪、為什麼，再重做一次形成記憶。", suitableFor: "適合分析錯題、辨認錯誤來源並練習修正。", selfTest: "蓋住正確答案重做一次，說明錯誤原因與這次改變的步驟。", tags: ["錯題", "修正", "回想"], output: "一次錯誤診斷＋一份修正版答案", steps: ["保留原本的錯誤，不急著擦掉。", "標記錯在知識、步驟還是粗心。", "蓋住答案重做，並說出這次改了什麼。"] },
  { id: "teachback", title: "看圖說回來", category: "express", sense: ["visual", "auditory"], time: 5, desc: "只看一張圖或幾個符號，把完整內容說回來。", suitableFor: "適合把已學內容濃縮成提示，再練習完整複述。", selfTest: "只看三至五個提示說回重點，對照原文補上遺漏或錯誤。", tags: ["圖像", "複述", "回想"], output: "一張提示圖＋一次不看原文的解說", steps: ["把內容濃縮成三到五個圖像符號。", "移開原文，只保留圖像。", "依圖像順序說回完整內容，補上漏掉的地方。"] }
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

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[character]);
}

function card(method) {
  const courseNames = coursesForMethod(method.id).map(course => escapeHtml(course.title));
  const id = escapeHtml(method.id);
  const title = escapeHtml(method.title);
  const category = escapeHtml(categoryNames[method.category] || "學習方法");
  const favorite = favoriteIds.has(method.id);
  const tags = (method.tags || []).map(tag => `<span>${escapeHtml(tag)}</span>`).join("");
  return `<article class="method-card">
    <div class="method-meta"><span class="category-pill">${category}</span><span class="method-card-actions"><span class="method-time">約 ${escapeHtml(method.time)} 分鐘</span><button class="favorite-button${favorite ? " active" : ""}" data-favorite="${id}" type="button" aria-label="${favorite ? "取消收藏" : "收藏"}${title}" aria-pressed="${favorite}">${favorite ? "♥" : "♡"}</button></span></div>
    <h3>${title}</h3>
    <p>${escapeHtml(method.desc)}</p>
    <p class="method-suitable"><strong>適合：</strong>${escapeHtml(method.suitableFor || "依照當下任務試做，再用回想檢查效果。")}</p>
    ${courseNames.length ? `<div class="method-courses">${courseNames.map(name => `<span>${name}</span>`).join("")}</div>` : ""}
    <div class="method-tags">${tags}</div>
    <button class="method-open" data-open-method="${id}">打開方法卡 <span>→</span></button>
  </article>`;
}

function syncFilterControls() {
  document.querySelectorAll(".filter").forEach(button => {
    const active = button.dataset.filter === activeFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll(".goal-card").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.goal === activeFilter));
  });
  document.querySelectorAll(".sense-card").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.sense === activeSense));
  });
}

function render() {
  const query = search.value.trim().toLowerCase();
  const visible = methods.filter(method => {
    const categoryMatch = activeFilter === "all" || method.category === activeFilter;
    const senseMatch = !activeSense || (method.sense || []).includes(activeSense);
    const text = [method.title, method.desc, method.output, method.suitableFor, method.selfTest, ...(method.tags || [])].join(" ").toLowerCase();
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
      score: (item.category === method.category ? 4 : 0)
        + (item.tags || []).filter(tag => (method.tags || []).includes(tag)).length * 2
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.item;
}

function openMethod(id) {
  const method = methods.find(item => item.id === id);
  if (!method) return;
  const recommendation = recommendNext(method);
  const courseNames = coursesForMethod(method.id).map(course => escapeHtml(course.title));
  const safeId = escapeHtml(method.id);
  const safeTitle = escapeHtml(method.title);
  const category = escapeHtml(categoryNames[method.category] || "學習方法");
  const steps = (method.steps || []).map(step => `<li>${escapeHtml(step)}</li>`).join("");
  const senses = (method.sense || []).map(sense => `<span>${escapeHtml(senseNames[sense] || "可選偏好")}</span>`).join("");
  openMethodId = method.id;
  dialogContent.innerHTML = `<div class="dialog-head">
    <span class="category-pill">${category} · 約 ${escapeHtml(method.time)} 分鐘</span>
    <h2>${safeTitle}</h2><p>${escapeHtml(method.desc)}</p>
  </div><div class="dialog-body"><h3>跟著做一次</h3><ol>${steps}</ol>
    <div class="dialog-output"><small>完成時，你會得到</small><strong>${escapeHtml(method.output)}</strong></div>
    <section class="method-guidance" aria-label="適用情境與自我檢核">
      <h3>適用情境</h3><p>${escapeHtml(method.suitableFor || "依照當下任務試做，再用回想檢查效果。")}</p>
      <h3>自我檢核</h3><p>${escapeHtml(method.selfTest || "遮住原始提示，試著回想，再對照資料修正。")}</p>
    </section>
    ${courseNames.length ? `<p class="dialog-course-line">所屬課程：${courseNames.join("、")}</p>` : ""}
    <p class="method-tags"><strong>可選感官偏好：</strong>${senses}</p>
    <section class="practice-checkpoint" aria-labelledby="practice-checkpoint-title">
      <h3 id="practice-checkpoint-title">先回想，再對照修正</h3>
      <p>完成上方練習後，先遮住教材，用自己的話寫下或口頭說出記得的內容；再打開原始教材，逐項核對並修正。</p>
      <label for="recall-draft">回想草稿（選填，也可以口頭回想）</label>
      <textarea id="recall-draft" rows="3" maxlength="1200" placeholder="先不要看原文，寫下你記得的重點…"></textarea>
      <label for="practice-recall-rating">這次回想結果</label>
      <select id="practice-recall-rating">
        <option value="">請選擇</option>
        <option value="remembered">大致想起來了</option>
        <option value="partial">想起一部分，仍有遺漏</option>
        <option value="not-yet">還沒想起來或需要再學一次</option>
      </select>
      <label class="review-interval-label" for="practice-review-days">安排下次重測</label>
      <select id="practice-review-days">
        <option value="1">1 天後</option><option value="3">3 天後</option><option value="7">7 天後</option>
      </select>
      <label class="practice-confirm"><input id="practice-recall-confirm" type="checkbox" /> 我已先回想，並對照原始內容修正</label>
      <p class="practice-privacy-note" id="practice-status">回想草稿不會上傳。登入後才會保存方法完成紀錄、自評結果與下次重測日期；到期時會出現在會員中心。</p>
    </section>
    <div class="dialog-actions">
      <button class="button button-primary" type="button" data-complete-method="${safeId}" disabled>完成並安排重測 <span>✓</span></button>
      <button class="button button-quiet later-button" type="button" data-practice-later="${safeId}" aria-pressed="false">稍後練習 <span>＋</span></button>
    </div>
    <section class="method-note-panel" aria-labelledby="method-note-title">
      <div><h3 id="method-note-title">個人筆記</h3><small id="method-note-status">登入後可跨裝置保存</small></div>
      <textarea id="method-note" rows="4" maxlength="1200" placeholder="記下這個方法適合用在哪裡、下次要怎麼練…"></textarea>
      <button class="button note-save-button" type="button" data-save-note="${safeId}">儲存筆記</button>
    </section>
    ${recommendation ? `<section class="next-method-panel"><small>接著試試同一學習目標下的方法</small><h3>${escapeHtml(recommendation.title)}</h3><p>${escapeHtml(recommendation.desc)}</p><button class="text-button" type="button" data-open-method="${escapeHtml(recommendation.id)}">接著看這張方法卡 <span>→</span></button></section>` : ""}
  </div>`;
  if (!dialog.open) dialog.showModal();
  window.dispatchEvent(new CustomEvent("jiliguala:method-opened", { detail: method }));
}

function updatePracticeCompletionState() {
  const button = dialogContent.querySelector("[data-complete-method]");
  if (!button) return;
  const confirmed = dialogContent.querySelector("#practice-recall-confirm")?.checked;
  const rating = dialogContent.querySelector("#practice-recall-rating")?.value;
  button.disabled = !(confirmed && rating);
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
    const recallRating = dialogContent.querySelector("#practice-recall-rating")?.value;
    const reviewIntervalDays = Number(dialogContent.querySelector("#practice-review-days")?.value || 1);
    const recallConfirmed = dialogContent.querySelector("#practice-recall-confirm")?.checked;
    if (!recallConfirmed || !recallRating) return;
    window.dispatchEvent(new CustomEvent("jiliguala:practice", {
      detail: { method, recallRating, reviewIntervalDays }
    }));
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
    syncFilterControls();
    render();
  });
});

document.querySelectorAll(".goal-card").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.goal;
    activeSense = null;
    syncFilterControls();
    document.querySelector("#library").scrollIntoView({ behavior: "smooth" });
    render();
  });
});

document.querySelectorAll(".sense-card").forEach(button => {
  button.addEventListener("click", () => {
    activeSense = activeSense === button.dataset.sense ? null : button.dataset.sense;
    syncFilterControls();
    document.querySelector("#library").scrollIntoView({ behavior: "smooth" });
    render();
  });
});

dialogContent.addEventListener("change", event => {
  if (event.target.matches("#practice-recall-confirm, #practice-recall-rating")) updatePracticeCompletionState();
});

search.addEventListener("input", render);
document.querySelector("#clear-search").addEventListener("click", () => { search.value = ""; activeFilter = "all"; activeSense = null; syncFilterControls(); render(); search.focus(); });
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
    laterButton.textContent = event.detail.savedForLater ? "已加入稍後練習 ✓" : "稍後練習 ＋";
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

syncFilterControls();
render();
const requestedMethod = new URLSearchParams(window.location.search).get("open");
if (requestedMethod) queueMicrotask(() => openMethod(requestedMethod));
