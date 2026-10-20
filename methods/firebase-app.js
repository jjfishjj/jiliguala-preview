import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const authDialog = document.querySelector("#auth-dialog");
const authButton = document.querySelector("#auth-button");
const authButtonLabel = document.querySelector("#auth-button-label");
const accountAvatar = document.querySelector("#account-avatar");
const signedOutView = document.querySelector("#signed-out-view");
const signedInView = document.querySelector("#signed-in-view");
const emailForm = document.querySelector("#email-auth-form");
const emailInput = document.querySelector("#auth-email");
const passwordInput = document.querySelector("#auth-password");
const authSubmit = document.querySelector("#email-auth-submit");
const authMessage = document.querySelector("#auth-message");
const toggleMode = document.querySelector("#toggle-auth-mode");
const toast = document.querySelector("#toast");
let registerMode = false;
let currentUser = null;
let auth;
let db;
let toastTimer;
let currentDailyMethod = null;
const categoryLabels = {
  remember: "記得住",
  understand: "想得懂",
  express: "說得出",
  improve: "改得好"
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
  date.setDate(date.getDate() + offset);
  return dateKey(date);
}

function catalog() {
  return window.JILIGUALA_METHODS || [];
}

function dailyMethodFor(user) {
  const items = catalog();
  if (!items.length) return null;
  const seed = `${dateKey()}${user.uid}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return items[seed % items.length];
}

async function loadPublishedCatalog() {
  const snapshot = await getDocs(collection(db, "methods"));
  if (snapshot.empty) return;
  const merged = new Map((window.JILIGUALA_DEFAULT_METHODS || []).map(method => [method.id, method]));
  snapshot.docs.forEach(item => {
    const data = item.data();
    if (data.published === false) merged.delete(item.id);
    else merged.set(item.id, { ...(merged.get(item.id) || {}), id: item.id, ...data });
  });
  const items = [...merged.values()]
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  window.dispatchEvent(new CustomEvent("jiliguala:catalog-loaded", { detail: items }));
}

async function loadPublishedCourses() {
  const snapshot = await getDocs(collection(db, "courses"));
  const merged = new Map((window.JILIGUALA_DEFAULT_COURSES || []).map(course => [course.id, { ...course, methodIds: [...course.methodIds] }]));
  snapshot.docs.forEach(item => {
    const data = item.data();
    if (data.published === false) merged.delete(item.id);
    else merged.set(item.id, { ...(merged.get(item.id) || {}), id: item.id, ...data });
  });
  window.JILIGUALA_COURSES = [...merged.values()].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  window.dispatchEvent(new CustomEvent("jiliguala:courses-loaded", { detail: window.JILIGUALA_COURSES }));
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3000);
}

function showMessage(message, success = false) {
  authMessage.textContent = message;
  authMessage.classList.toggle("success", success);
}

function readableError(error) {
  const errors = {
    "auth/email-already-in-use": "這個 Email 已經註冊，可以直接登入。",
    "auth/invalid-credential": "Email 或密碼不正確。",
    "auth/invalid-email": "請輸入正確的 Email。",
    "auth/popup-closed-by-user": "登入視窗已關閉，尚未完成登入。",
    "auth/too-many-requests": "嘗試次數過多，請稍後再試。",
    "auth/weak-password": "密碼至少需要 6 個字元。"
  };
  return errors[error?.code] || "目前無法完成操作，請稍後再試。";
}

function avatarContent(user) {
  if (user.photoURL) return `<img src="${user.photoURL}" alt="" referrerpolicy="no-referrer" />`;
  return (user.displayName || user.email || "人").trim().slice(0, 1).toUpperCase();
}

function openAuth() {
  if (!isFirebaseConfigured) {
    showToast("Firebase 正在設定中，稍後即可使用會員功能。");
    return;
  }
  authDialog.showModal();
}

async function ensureProfile(user) {
  const profileRef = doc(db, "users", user.uid);
  await setDoc(profileRef, {
    displayName: user.displayName || "",
    email: user.email || "",
    photoURL: user.photoURL || "",
    lastLoginAt: serverTimestamp()
  }, { merge: true });
}

function dateLabel(timestamp) {
  if (!timestamp?.toDate) return "剛剛更新";
  return new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric" }).format(timestamp.toDate());
}

function timestampValue(timestamp) {
  return timestamp?.toMillis?.() || 0;
}

function renderLearningList(selector, items, emptyText, detailFor) {
  const list = document.querySelector(selector);
  list.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "learning-empty";
    empty.textContent = emptyText;
    list.append(empty);
    return;
  }
  items.slice(0, 3).forEach(item => {
    const button = document.createElement("button");
    button.className = "learning-item";
    button.type = "button";
    button.dataset.dashboardMethod = item.id;
    const title = document.createElement("strong");
    title.textContent = item.data.title || item.id;
    const detail = document.createElement("small");
    detail.textContent = detailFor(item.data);
    const arrow = document.createElement("span");
    arrow.textContent = "→";
    button.append(title, detail, arrow);
    list.append(button);
  });
}

function renderWeeklyChart(activity) {
  const chart = document.querySelector("#weekly-chart");
  const today = dateKey();
  const counts = new Map(activity.map(item => [item.id, item.data.count || 0]));
  const days = Array.from({ length: 7 }, (_, index) => dayOffset(today, index - 6));
  const max = Math.max(1, ...days.map(day => counts.get(day) || 0));
  chart.replaceChildren(...days.map(day => {
    const count = counts.get(day) || 0;
    const column = document.createElement("div");
    column.className = `week-bar${day === today ? " active" : ""}`;
    const bar = document.createElement("i");
    bar.style.height = `${Math.max(count ? 14 : 4, (count / max) * 82)}px`;
    bar.title = `${day}：${count} 次練習`;
    const label = document.createElement("span");
    label.textContent = new Intl.DateTimeFormat("zh-TW", { weekday: "short", timeZone: "Asia/Taipei" }).format(new Date(`${day}T12:00:00+08:00`));
    column.append(bar, label);
    return column;
  }));
}

function renderCategoryProgress(practice) {
  const container = document.querySelector("#category-progress");
  const totals = catalog().reduce((result, method) => {
    result[method.category] = (result[method.category] || 0) + 1;
    return result;
  }, {});
  const completed = practice.reduce((result, item) => {
    const category = item.data.category || catalog().find(method => method.id === item.id)?.category;
    if (category) result[category] = (result[category] || 0) + 1;
    return result;
  }, {});
  container.replaceChildren(...Object.keys(categoryLabels).map(category => {
    const row = document.createElement("div");
    row.className = "category-row";
    const label = document.createElement("span");
    label.textContent = categoryLabels[category];
    const track = document.createElement("div");
    const bar = document.createElement("i");
    const done = completed[category] || 0;
    const total = totals[category] || 0;
    bar.style.width = `${total ? Math.round((done / total) * 100) : 0}%`;
    track.append(bar);
    const value = document.createElement("strong");
    value.textContent = `${done}/${total}`;
    row.append(label, track, value);
    return row;
  }));
}

function renderDailyTask(daily, method) {
  const panel = document.querySelector(".daily-task");
  const action = document.querySelector("#daily-task-action");
  const complete = Boolean(daily?.completed);
  panel.classList.toggle("complete", complete);
  document.querySelector("#daily-task-title").textContent = complete ? `已完成：${method.title}` : method.title;
  document.querySelector("#daily-task-description").textContent = complete
    ? `今天已完成 ${daily.completedCount || 1} 次練習，明天會有新的推薦。`
    : `${method.desc}，大約 ${method.time} 分鐘可以開始。`;
  action.textContent = complete ? "再練一次 →" : "開始今日任務 →";
  action.dataset.methodId = method.id;
}

function renderMemberLevel(practiceCount, uniqueCount, streak) {
  const xp = (practiceCount * 20) + (uniqueCount * 30) + (streak * 10);
  const levels = [
    { number: 1, name: "起步者", min: 0 },
    { number: 2, name: "探索者", min: 100 },
    { number: 3, name: "練習家", min: 250 },
    { number: 4, name: "記法家", min: 500 },
    { number: 5, name: "引路人", min: 900 }
  ];
  const current = [...levels].reverse().find(level => xp >= level.min) || levels[0];
  const next = levels[current.number] || null;
  const progress = next ? Math.round(((xp - current.min) / (next.min - current.min)) * 100) : 100;
  document.querySelector("#member-level-number").textContent = current.number;
  document.querySelector("#member-level-title").textContent = current.name;
  document.querySelector("#member-level-xp").textContent = `${xp} XP`;
  document.querySelector("#member-level-bar").style.width = `${Math.min(100, progress)}%`;
  document.querySelector("#member-level-next").textContent = next
    ? `再累積 ${next.min - xp} XP 升到 Lv.${next.number} ${next.name}`
    : "已達目前最高等級，繼續累積你的學習紀錄。";
}

function renderBadges({ practiceCount, uniqueCount, streak, favorites, notes, practice }) {
  const completedCategories = new Set(practice.map(item => item.data.category || catalog().find(method => method.id === item.id)?.category).filter(Boolean));
  const badges = [
    { icon: "✦", title: "第一步", detail: "完成首次練習", earned: practiceCount >= 1 },
    { icon: "🔥", title: "連續七天", detail: "連續學習 7 天", earned: streak >= 7 },
    { icon: "♥", title: "方法收藏家", detail: "收藏 5 種方法", earned: favorites >= 5 },
    { icon: "✎", title: "筆記研究員", detail: "留下 3 篇筆記", earned: notes >= 3 },
    { icon: "◎", title: "探索家", detail: "完成 5 種方法", earned: uniqueCount >= 5 },
    { icon: "♛", title: "四路全開", detail: "四類各完成一種", earned: completedCategories.size >= 4 }
  ];
  const grid = document.querySelector("#badge-grid");
  grid.replaceChildren(...badges.map(badge => {
    const item = document.createElement("div");
    item.className = `badge-item ${badge.earned ? "unlocked" : "locked"}`;
    const icon = document.createElement("span");
    icon.className = "badge-icon";
    icon.textContent = badge.earned ? badge.icon : "?";
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = badge.title;
    const detail = document.createElement("small");
    detail.textContent = badge.detail;
    copy.append(title, detail);
    item.append(icon, copy);
    return item;
  }));
  document.querySelector("#badge-summary").textContent = `${badges.filter(badge => badge.earned).length} / ${badges.length}`;
}

function renderCourseProgress(practice) {
  const completed = new Set(practice.map(item => item.id));
  const list = document.querySelector("#course-progress-list");
  list.replaceChildren(...(window.JILIGUALA_COURSES || []).map(course => {
    const methodIds = (course.methodIds || []).filter(id => catalog().some(method => method.id === id));
    const done = methodIds.filter(id => completed.has(id)).length;
    const nextId = methodIds.find(id => !completed.has(id)) || methodIds[0];
    const nextMethod = catalog().find(method => method.id === nextId);
    const card = document.createElement("article");
    card.className = "course-progress-card";
    const head = document.createElement("div");
    const title = document.createElement("h4");
    title.textContent = course.title;
    const score = document.createElement("strong");
    score.textContent = `${done}/${methodIds.length}`;
    head.append(title, score);
    const description = document.createElement("p");
    description.textContent = course.description;
    const track = document.createElement("div");
    track.className = "course-mini-track";
    const bar = document.createElement("span");
    bar.style.width = `${methodIds.length ? Math.round((done / methodIds.length) * 100) : 0}%`;
    track.append(bar);
    card.append(head, description, track);
    if (nextMethod) {
      const action = document.createElement("button");
      action.className = "course-next";
      action.type = "button";
      action.dataset.courseMethod = nextMethod.id;
      action.textContent = done === methodIds.length ? `重新練習：${nextMethod.title} →` : `下一個：${nextMethod.title} →`;
      card.append(action);
    }
    return card;
  }));
}

async function updateAdminLink(user) {
  const link = document.querySelector("#admin-link");
  const bootstrapAdmin = user.email === "guocheju@gmail.com";
  let assignedAdmin = false;
  try { assignedAdmin = (await getDoc(doc(db, "admins", user.uid))).exists(); } catch { assignedAdmin = false; }
  link.hidden = !(bootstrapAdmin || assignedAdmin);
}

async function loadMemberData(user) {
  currentDailyMethod = dailyMethodFor(user);
  const today = dateKey();
  const [favoritesSnapshot, laterSnapshot, practiceSnapshot, notesSnapshot, activitySnapshot, dailySnapshot, profile] = await Promise.all([
    getDocs(collection(db, "users", user.uid, "favorites")),
    getDocs(collection(db, "users", user.uid, "later")),
    getDocs(collection(db, "users", user.uid, "practice")),
    getDocs(collection(db, "users", user.uid, "notes")),
    getDocs(collection(db, "users", user.uid, "activity")),
    getDoc(doc(db, "users", user.uid, "daily", today)),
    getDoc(doc(db, "users", user.uid))
  ]);
  const favoriteItems = favoritesSnapshot.docs.map(item => ({ id: item.id, data: item.data() }))
    .sort((a, b) => timestampValue(b.data.savedAt) - timestampValue(a.data.savedAt));
  const favorites = favoriteItems.map(item => item.id);
  const later = laterSnapshot.docs.map(item => ({ id: item.id, data: item.data() }))
    .sort((a, b) => timestampValue(b.data.savedAt) - timestampValue(a.data.savedAt));
  const practice = practiceSnapshot.docs.map(item => ({ id: item.id, data: item.data() }))
    .sort((a, b) => timestampValue(b.data.lastCompletedAt) - timestampValue(a.data.lastCompletedAt));
  const notes = notesSnapshot.docs.map(item => ({ id: item.id, data: item.data() }))
    .sort((a, b) => timestampValue(b.data.updatedAt) - timestampValue(a.data.updatedAt));
  const activity = activitySnapshot.docs.map(item => ({ id: item.id, data: item.data() }));
  const daily = dailySnapshot.data();
  if (daily?.methodId) currentDailyMethod = catalog().find(method => method.id === daily.methodId) || currentDailyMethod;
  const practiceCount = profile.data()?.practiceCount || 0;
  const progress = Math.min(100, Math.round((practice.length / Math.max(1, catalog().length)) * 100));

  window.dispatchEvent(new CustomEvent("jiliguala:favorites-updated", { detail: favorites }));
  document.querySelector("#favorite-count").textContent = favorites.length;
  document.querySelector("#practice-count").textContent = practiceCount;
  document.querySelector("#later-count").textContent = later.length;
  document.querySelector("#note-count").textContent = notes.length;
  document.querySelector("#streak-count").textContent = profile.data()?.streak || 0;
  document.querySelector("#favorite-summary").textContent = `${favorites.length} 項`;
  document.querySelector("#later-summary").textContent = `${later.length} 項`;
  document.querySelector("#progress-percent").textContent = `${progress}%`;
  document.querySelector("#progress-bar").style.width = `${progress}%`;
  document.querySelector("#progress-copy").textContent = practice.length
    ? `已完成 ${practice.length} 種方法，共練習 ${practiceCount} 次。`
    : "完成任一方法後，這裡會開始記錄進度。";

  renderLearningList("#favorite-list", favoriteItems, "還沒有收藏的方法。", data => `收藏於 ${dateLabel(data.savedAt)}`);
  renderLearningList("#later-list", later, "還沒有待練習的方法。", data => `${data.categoryLabel || "學習方法"} · 加入 ${dateLabel(data.savedAt)}`);
  renderLearningList("#recent-practice-list", practice, "完成方法後會顯示在這裡。", data => `${data.count || 0} 次 · 最近 ${dateLabel(data.lastCompletedAt)}`);
  renderLearningList("#notes-list", notes, "你的方法筆記會顯示在這裡。", data => data.content || "空白筆記");
  renderWeeklyChart(activity);
  renderCategoryProgress(practice);
  renderMemberLevel(practiceCount, practice.length, profile.data()?.streak || 0);
  renderBadges({ practiceCount, uniqueCount: practice.length, streak: profile.data()?.streak || 0, favorites: favorites.length, notes: notes.length, practice });
  renderCourseProgress(practice);
  if (currentDailyMethod) {
    if (!dailySnapshot.exists()) {
      await setDoc(doc(db, "users", user.uid, "daily", today), {
        methodId: currentDailyMethod.id,
        title: currentDailyMethod.title,
        assignedAt: serverTimestamp(),
        completed: false
      });
    }
    renderDailyTask(daily || { completed: false }, currentDailyMethod);
  }
}

function renderUser(user) {
  currentUser = user;
  signedOutView.hidden = Boolean(user);
  signedInView.hidden = !user;
  authDialog.classList.toggle("member-open", Boolean(user));
  if (!user) {
    authButtonLabel.textContent = "會員登入";
    accountAvatar.textContent = "人";
    document.querySelector("#admin-link").hidden = true;
    window.dispatchEvent(new CustomEvent("jiliguala:favorites-updated", { detail: [] }));
    return;
  }
  const name = user.displayName || user.email?.split("@")[0] || "學習者";
  authButtonLabel.textContent = name;
  accountAvatar.innerHTML = avatarContent(user);
  document.querySelector("#member-avatar").innerHTML = avatarContent(user);
  document.querySelector("#member-name").textContent = name;
  document.querySelector("#member-email").textContent = user.email || "";
}

authButton.addEventListener("click", openAuth);
document.querySelector(".auth-dialog-close").addEventListener("click", () => authDialog.close());
authDialog.addEventListener("click", event => { if (event.target === authDialog) authDialog.close(); });
document.addEventListener("click", event => {
  const dashboardItem = event.target.closest("[data-dashboard-method]");
  if (!dashboardItem) return;
  authDialog.close();
  window.dispatchEvent(new CustomEvent("jiliguala:open-method", { detail: dashboardItem.dataset.dashboardMethod }));
});

toggleMode.addEventListener("click", () => {
  registerMode = !registerMode;
  authSubmit.textContent = registerMode ? "建立會員" : "登入";
  toggleMode.textContent = registerMode ? "已經有帳號？回到登入" : "還沒有帳號？建立會員";
  passwordInput.autocomplete = registerMode ? "new-password" : "current-password";
  showMessage("");
});

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  loadPublishedCatalog().catch(() => {});
  loadPublishedCourses().catch(() => {});

  document.querySelector("#google-sign-in").addEventListener("click", async () => {
    showMessage("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      authDialog.close();
      showToast("登入成功，歡迎回來！");
    } catch (error) { showMessage(readableError(error)); }
  });

  emailForm.addEventListener("submit", async event => {
    event.preventDefault();
    authSubmit.disabled = true;
    showMessage(registerMode ? "正在建立會員…" : "正在登入…", true);
    try {
      if (registerMode) await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
      else await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
      emailForm.reset();
      authDialog.close();
      showToast(registerMode ? "會員建立成功！" : "登入成功，歡迎回來！");
    } catch (error) { showMessage(readableError(error)); }
    finally { authSubmit.disabled = false; }
  });

  document.querySelector("#reset-password").addEventListener("click", async () => {
    if (!emailInput.value) { showMessage("請先填寫 Email，再按忘記密碼。"); emailInput.focus(); return; }
    try {
      await sendPasswordResetEmail(auth, emailInput.value);
      showMessage("重設密碼信已寄出，請查看信箱。", true);
    } catch (error) { showMessage(readableError(error)); }
  });

  document.querySelector("#sign-out").addEventListener("click", async () => {
    await signOut(auth);
    authDialog.close();
    showToast("已安全登出。");
  });

  onAuthStateChanged(auth, async user => {
    renderUser(user);
    if (user) {
      try {
        await Promise.all([loadPublishedCatalog(), loadPublishedCourses()]);
        await ensureProfile(user);
        await Promise.all([loadMemberData(user), updateAdminLink(user)]);
      }
      catch { showToast("登入成功，但同步資料時發生問題。"); }
    }
  });
} else {
  renderUser(null);
}

window.addEventListener("jiliguala:favorite", async event => {
  if (!currentUser) { openAuth(); return; }
  const method = event.detail;
  const favoriteRef = doc(db, "users", currentUser.uid, "favorites", method.id);
  try {
    const current = await getDoc(favoriteRef);
    if (current.exists()) {
      await deleteDoc(favoriteRef);
      showToast(`已取消收藏「${method.title}」`);
    } else {
      await setDoc(favoriteRef, { methodId: method.id, title: method.title, savedAt: serverTimestamp() });
      showToast(`已收藏「${method.title}」`);
    }
    await loadMemberData(currentUser);
  } catch { showToast("收藏同步失敗，請稍後再試。"); }
});

window.addEventListener("jiliguala:practice", async event => {
  if (!currentUser) { document.querySelector("#method-dialog")?.close(); openAuth(); return; }
  const method = event.detail;
  try {
    const today = dateKey();
    const profileRef = doc(db, "users", currentUser.uid);
    const profile = await getDoc(profileRef);
    const previousDate = profile.data()?.lastPracticeDate;
    const nextStreak = previousDate === today
      ? (profile.data()?.streak || 1)
      : previousDate === dayOffset(today, -1) ? (profile.data()?.streak || 0) + 1 : 1;
    await setDoc(doc(db, "users", currentUser.uid, "practice", method.id), {
      methodId: method.id,
      title: method.title,
      category: method.category,
      count: increment(1),
      lastCompletedAt: serverTimestamp()
    }, { merge: true });
    await Promise.all([
      setDoc(profileRef, { practiceCount: increment(1), streak: nextStreak, lastPracticeDate: today }, { merge: true }),
      setDoc(doc(db, "users", currentUser.uid, "activity", today), { count: increment(1), updatedAt: serverTimestamp() }, { merge: true }),
      currentDailyMethod?.id === method.id
        ? setDoc(doc(db, "users", currentUser.uid, "daily", today), {
          completed: true,
          completedCount: increment(1),
          completedAt: serverTimestamp()
        }, { merge: true })
        : Promise.resolve()
    ]);
    await deleteDoc(doc(db, "users", currentUser.uid, "later", method.id));
    document.querySelector("#method-dialog")?.close();
    await loadMemberData(currentUser);
    showToast(`完成「${method.title}」一次！`);
  } catch { showToast("練習紀錄同步失敗，請稍後再試。"); }
});

document.querySelector("#daily-task-action").addEventListener("click", event => {
  const methodId = event.currentTarget.dataset.methodId;
  if (!methodId) return;
  authDialog.close();
  window.dispatchEvent(new CustomEvent("jiliguala:open-method", { detail: methodId }));
});

document.querySelector("#course-progress-list").addEventListener("click", event => {
  const button = event.target.closest("[data-course-method]");
  if (!button) return;
  authDialog.close();
  window.dispatchEvent(new CustomEvent("jiliguala:open-method", { detail: button.dataset.courseMethod }));
});

window.addEventListener("jiliguala:method-opened", async event => {
  const method = event.detail;
  if (!currentUser) {
    window.dispatchEvent(new CustomEvent("jiliguala:method-state", {
      detail: { id: method.id, note: "", savedForLater: false, signedIn: false }
    }));
    return;
  }
  try {
    const [later, note] = await Promise.all([
      getDoc(doc(db, "users", currentUser.uid, "later", method.id)),
      getDoc(doc(db, "users", currentUser.uid, "notes", method.id))
    ]);
    window.dispatchEvent(new CustomEvent("jiliguala:method-state", {
      detail: { id: method.id, note: note.data()?.content || "", savedForLater: later.exists(), signedIn: true }
    }));
  } catch { showToast("方法資料載入失敗，請稍後再試。"); }
});

window.addEventListener("jiliguala:later", async event => {
  if (!currentUser) { document.querySelector("#method-dialog")?.close(); openAuth(); return; }
  const method = event.detail;
  const laterRef = doc(db, "users", currentUser.uid, "later", method.id);
  try {
    const current = await getDoc(laterRef);
    if (current.exists()) {
      await deleteDoc(laterRef);
      showToast(`已從稍後練習移除「${method.title}」`);
    } else {
      await setDoc(laterRef, {
        methodId: method.id,
        title: method.title,
        category: method.category,
        categoryLabel: categoryLabels[method.category] || "學習方法",
        savedAt: serverTimestamp()
      });
      showToast(`已把「${method.title}」加入稍後練習`);
    }
    await loadMemberData(currentUser);
    window.dispatchEvent(new CustomEvent("jiliguala:method-state", {
      detail: { id: method.id, note: document.querySelector("#method-note")?.value || "", savedForLater: !current.exists(), signedIn: true }
    }));
  } catch { showToast("稍後練習同步失敗，請稍後再試。"); }
});

window.addEventListener("jiliguala:note", async event => {
  if (!currentUser) { document.querySelector("#method-dialog")?.close(); openAuth(); return; }
  const { method, content } = event.detail;
  const noteRef = doc(db, "users", currentUser.uid, "notes", method.id);
  try {
    const cleanContent = content.trim();
    if (cleanContent) {
      await setDoc(noteRef, {
        methodId: method.id,
        title: method.title,
        content: cleanContent,
        updatedAt: serverTimestamp()
      });
      showToast(`已儲存「${method.title}」的筆記`);
    } else {
      await deleteDoc(noteRef);
      showToast("空白筆記已清除");
    }
    await loadMemberData(currentUser);
    const status = document.querySelector("#method-note-status");
    if (status) status.textContent = "剛剛已同步";
  } catch { showToast("筆記儲存失敗，請稍後再試。"); }
});
