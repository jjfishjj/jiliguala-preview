import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { collection, collectionGroup, deleteDoc, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc, writeBatch } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { firebaseConfig } from "../methods/firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const bootstrapEmail = "guocheju@gmail.com";
const loginView = document.querySelector("#login-view");
const adminView = document.querySelector("#admin-view");
const form = document.querySelector("#method-form");
const courseForm = document.querySelector("#course-form");
const message = document.querySelector("#form-message");
let methods = [];
let courses = [];
let defaultIds = new Set();
let defaultMethodsCache = null;

function setMessage(element, text, success = false) {
  element.textContent = text;
  element.classList.toggle("success", success);
}

function values(id) { return document.querySelector(id); }

function adminDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function adminDayOffset(key, offset) {
  const date = new Date(`${key}T12:00:00+08:00`);
  date.setDate(date.getDate() + offset);
  return adminDateKey(date);
}

function adminWeekStart() {
  const today = adminDateKey();
  const date = new Date(`${today}T12:00:00+08:00`);
  return adminDayOffset(today, -((date.getDay() + 6) % 7));
}

function renderAnalyticsBars(selector, rows, valueLabel = value => String(value)) {
  const container = values(selector);
  const max = Math.max(1, ...rows.map(row => row.value));
  if (!rows.length) { container.innerHTML = '<p class="empty">目前還沒有足夠資料。</p>'; return; }
  container.replaceChildren(...rows.map(row => {
    const item = document.createElement("div");
    item.className = "analytics-bar";
    const label = document.createElement("span");
    label.textContent = row.label;
    const track = document.createElement("div");
    track.className = "analytics-track";
    const bar = document.createElement("i");
    bar.style.width = `${Math.round((row.value / max) * 100)}%`;
    track.append(bar);
    const value = document.createElement("strong");
    value.textContent = valueLabel(row.value, row);
    item.append(label, track, value);
    return item;
  }));
}

async function loadAnalytics() {
  values("#analytics-status").textContent = "正在讀取會員學習資料…";
  try {
    const [profilesSnapshot, practiceSnapshot, activitySnapshot] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collectionGroup(db, "practice")),
      getDocs(collectionGroup(db, "activity"))
    ]);
    const profiles = profilesSnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    const totalPractices = profiles.reduce((sum, item) => sum + (item.practiceCount || 0), 0);
    const weekStart = adminWeekStart();
    const active = profiles.filter(item => item.lastPracticeDate >= weekStart).length;
    values("#analytics-members").textContent = profiles.length;
    values("#analytics-practices").textContent = totalPractices;
    values("#analytics-active").textContent = active;
    values("#analytics-average").textContent = profiles.length ? (totalPractices / profiles.length).toFixed(1) : "0";

    const today = adminDateKey();
    const days = Array.from({ length: 7 }, (_, index) => adminDayOffset(today, index - 6));
    const dailyCounts = new Map(days.map(day => [day, 0]));
    activitySnapshot.docs.forEach(item => { if (dailyCounts.has(item.id)) dailyCounts.set(item.id, dailyCounts.get(item.id) + (item.data().count || 0)); });
    const maxDaily = Math.max(1, ...dailyCounts.values());
    values("#admin-trend").replaceChildren(...days.map(day => {
      const count = dailyCounts.get(day);
      const column = document.createElement("div");
      column.innerHTML = `<b>${count}</b><i style="height:${Math.max(4, Math.round((count / maxDaily) * 105))}px"></i><span>${day.slice(5)}</span>`;
      return column;
    }));

    const methodCounts = new Map();
    const completedByUser = new Map();
    practiceSnapshot.docs.forEach(item => {
      const data = item.data();
      const userId = item.ref.parent.parent?.id;
      methodCounts.set(item.id, (methodCounts.get(item.id) || 0) + (data.count || 0));
      if (userId) {
        if (!completedByUser.has(userId)) completedByUser.set(userId, new Set());
        completedByUser.get(userId).add(item.id);
      }
    });
    const popular = [...methodCounts.entries()].map(([id, value]) => ({ label: methods.find(method => method.id === id)?.title || id, value })).sort((a, b) => b.value - a.value).slice(0, 5);
    renderAnalyticsBars("#popular-methods", popular, value => `${value} 次`);

    const courseRows = courses.filter(course => course.published !== false).map(course => {
      const completed = [...completedByUser.values()].filter(ids => (course.methodIds || []).every(id => ids.has(id))).length;
      return { label: course.title, value: completed, members: profiles.length };
    });
    renderAnalyticsBars("#course-analytics", courseRows, (value, row) => `${value}/${row.members}`);
    values("#analytics-status").textContent = `資料更新於 ${new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Taipei" }).format(new Date())}`;
  } catch {
    values("#analytics-status").textContent = "統計資料暫時無法讀取，請確認 Firestore 規則已部署。";
  }
}

function resetForm() {
  form.reset();
  values("#method-time").value = 7;
  values("#method-order").value = 100;
  values("#method-published").checked = true;
  values("#method-id").disabled = false;
  values("#form-heading").textContent = "新增方法";
  document.querySelectorAll('[name="method-course"]').forEach(input => { input.checked = false; });
  setMessage(message, "");
}

function methodFromForm() {
  return {
    title: values("#method-title").value.trim(),
    category: values("#method-category").value,
    time: Number(values("#method-time").value),
    sortOrder: Number(values("#method-order").value),
    desc: values("#method-desc").value.trim(),
    tags: values("#method-tags").value.split(/[,，]/).map(value => value.trim()).filter(Boolean),
    sense: [...document.querySelectorAll('[name="sense"]:checked')].map(input => input.value),
    output: values("#method-output").value.trim(),
    steps: values("#method-steps").value.split("\n").map(value => value.trim()).filter(Boolean),
    published: values("#method-published").checked,
    updatedAt: serverTimestamp()
  };
}

function fillForm(method) {
  values("#form-heading").textContent = `編輯：${method.title}`;
  values("#method-id").value = method.id;
  values("#method-id").disabled = true;
  values("#method-title").value = method.title || "";
  values("#method-category").value = method.category || "remember";
  values("#method-time").value = method.time || 7;
  values("#method-order").value = method.sortOrder ?? 100;
  values("#method-desc").value = method.desc || "";
  values("#method-tags").value = (method.tags || []).join(", ");
  document.querySelectorAll('[name="sense"]').forEach(input => { input.checked = (method.sense || []).includes(input.value); });
  values("#method-output").value = method.output || "";
  values("#method-steps").value = (method.steps || []).join("\n");
  values("#method-published").checked = method.published !== false;
  document.querySelectorAll('[name="method-course"]').forEach(input => {
    input.checked = courses.some(course => course.id === input.value && course.methodIds.includes(method.id));
  });
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderMethodCourseOptions() {
  const fieldset = values("#method-courses");
  const legend = fieldset.querySelector("legend");
  fieldset.replaceChildren(legend);
  courses.filter(course => course.published !== false).forEach(course => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "method-course";
    input.value = course.id;
    label.append(input, document.createTextNode(` ${course.title}`));
    fieldset.append(label);
  });
}

function renderMethods() {
  const list = values("#method-list");
  values("#method-total").textContent = `${methods.length} 種`;
  list.replaceChildren();
  if (!methods.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "尚未建立方法，可先匯入現有 23 種方法。";
    list.append(empty);
    return;
  }
  methods.forEach(method => {
    const article = document.createElement("article");
    article.className = "admin-method";
    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = method.title;
    const detail = document.createElement("p");
    detail.textContent = `${method.id} · ${method.time} 分鐘 · 排序 ${method.sortOrder ?? 100}`;
    copy.append(title, detail);
    const state = document.createElement("span");
    state.className = `method-state${method.published === false ? " off" : ""}`;
    state.textContent = method.published === false ? "已下架" : "上架中";
    const actions = document.createElement("div");
    actions.className = "method-actions";
    [["編輯", "edit"], [method.published === false ? "上架" : "下架", "toggle"], ["刪除", "delete"]].forEach(([label, action]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.action = action;
      button.dataset.id = method.id;
      if (action === "delete") button.className = "danger";
      actions.append(button);
    });
    article.append(copy, state, actions);
    list.append(article);
  });
}

async function loadMethods() {
  const defaults = await loadDefaultMethods();
  const snapshot = await getDocs(collection(db, "methods"));
  const merged = new Map(defaults.map(item => [item.id, item]));
  snapshot.docs.forEach(item => merged.set(item.id, { ...(merged.get(item.id) || {}), id: item.id, ...item.data() }));
  methods = [...merged.values()]
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}

async function loadCourses() {
  const snapshot = await getDocs(collection(db, "courses"));
  const merged = new Map((window.JILIGUALA_DEFAULT_COURSES || []).map(course => [course.id, { ...course, methodIds: [...course.methodIds] }]));
  snapshot.docs.forEach(item => merged.set(item.id, { ...(merged.get(item.id) || {}), id: item.id, ...item.data() }));
  courses = [...merged.values()].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}

async function loadContent() {
  await Promise.all([loadMethods(), loadCourses()]);
  renderMethodCourseOptions();
  renderMethods();
  renderCourseMethodOptions();
  renderCourses();
}

function renderCourseMethodOptions() {
  const select = values("#course-methods");
  select.replaceChildren(...methods.filter(method => method.published !== false).map(method => {
    const option = document.createElement("option");
    option.value = method.id;
    option.textContent = `${method.title}（${method.id}）`;
    return option;
  }));
}

function resetCourseForm() {
  courseForm.reset();
  values("#course-id").disabled = false;
  values("#course-order").value = 100;
  values("#course-published").checked = true;
  setMessage(values("#course-message"), "");
}

function fillCourseForm(course) {
  values("#course-id").value = course.id;
  values("#course-id").disabled = true;
  values("#course-title").value = course.title || "";
  values("#course-description").value = course.description || "";
  values("#course-order").value = course.sortOrder ?? 100;
  values("#course-published").checked = course.published !== false;
  [...values("#course-methods").options].forEach(option => { option.selected = (course.methodIds || []).includes(option.value); });
  courseForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderCourses() {
  values("#course-total").textContent = `${courses.length} 門`;
  const list = values("#course-list");
  list.replaceChildren(...courses.map(course => {
    const article = document.createElement("article");
    article.className = "course-card-admin";
    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = course.title;
    const description = document.createElement("p");
    description.textContent = course.description || "";
    copy.append(title, description);
    const state = document.createElement("span");
    state.className = `method-state${course.published === false ? " off" : ""}`;
    state.textContent = course.published === false ? "已下架" : "上架中";
    const chips = document.createElement("div");
    chips.className = "course-method-chips";
    (course.methodIds || []).forEach(id => {
      const chip = document.createElement("span");
      chip.textContent = methods.find(method => method.id === id)?.title || id;
      chips.append(chip);
    });
    const actions = document.createElement("div");
    actions.className = "method-actions";
    [["編輯課程", "edit-course"], [course.published === false ? "上架" : "下架", "toggle-course"]].forEach(([label, action]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.action = action;
      button.dataset.id = course.id;
      actions.append(button);
    });
    article.append(copy, state, chips, actions);
    return article;
  }));
}

async function updateMethodCourses(methodId) {
  const selected = new Set([...document.querySelectorAll('[name="method-course"]:checked')].map(input => input.value));
  await Promise.all(courses.map(course => {
    const ids = (course.methodIds || []).filter(id => id !== methodId);
    if (selected.has(course.id)) ids.push(methodId);
    return setDoc(doc(db, "courses", course.id), { methodIds: ids, updatedAt: serverTimestamp() }, { merge: true });
  }));
}

async function loadDefaultMethods() {
  if (defaultMethodsCache) return defaultMethodsCache;
  const source = await fetch("../methods/app.js").then(response => response.text());
  const match = source.match(/let methods = (\[[\s\S]*?\]);\n\nconst categoryNames/);
  if (!match) throw new Error("catalog-not-found");
  defaultMethodsCache = Function(`"use strict"; return ${match[1]}`)()
    .map((method, index) => ({ ...method, sortOrder: index, published: true }));
  defaultIds = new Set(defaultMethodsCache.map(method => method.id));
  return defaultMethodsCache;
}

async function authorize(user) {
  const assigned = await getDoc(doc(db, "admins", user.uid));
  if (user.email !== bootstrapEmail && !assigned.exists()) return false;
  if (user.email === bootstrapEmail && !assigned.exists()) {
    await setDoc(doc(db, "admins", user.uid), { email: user.email, createdAt: serverTimestamp() });
  }
  return true;
}

document.querySelector("#google-login").addEventListener("click", async () => {
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch { setMessage(values("#login-message"), "Google 登入沒有完成，請再試一次。"); }
});

document.querySelector("#email-login").addEventListener("submit", async event => {
  event.preventDefault();
  try { await signInWithEmailAndPassword(auth, values("#email").value, values("#password").value); }
  catch { setMessage(values("#login-message"), "Email、密碼或管理員權限不正確。"); }
});

onAuthStateChanged(auth, async user => {
  if (!user) { loginView.hidden = false; adminView.hidden = true; return; }
  try {
    if (!(await authorize(user))) {
      await signOut(auth);
      setMessage(values("#login-message"), "這個帳號沒有管理員權限。");
      return;
    }
    loginView.hidden = true;
    adminView.hidden = false;
    values("#admin-identity").textContent = `目前登入：${user.email}`;
    await loadContent();
    await loadAnalytics();
  } catch { setMessage(values("#login-message"), "無法確認管理員權限，請稍後再試。"); }
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  const id = values("#method-id").value.trim();
  try {
    await setDoc(doc(db, "methods", id), methodFromForm(), { merge: true });
    await updateMethodCourses(id);
    setMessage(message, "方法已儲存並同步到網站。", true);
    await loadContent();
  } catch { setMessage(message, "方法儲存失敗，請檢查管理員權限。"); }
});

values("#method-list").addEventListener("click", async event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const method = methods.find(item => item.id === button.dataset.id);
  if (!method) return;
  if (button.dataset.action === "edit") { fillForm(method); return; }
  if (button.dataset.action === "toggle") {
    await setDoc(doc(db, "methods", method.id), { published: method.published === false, updatedAt: serverTimestamp() }, { merge: true });
    await loadContent();
    return;
  }
  if (button.dataset.action === "delete" && window.confirm(`確定刪除「${method.title}」？`)) {
    if (defaultIds.has(method.id)) {
      await setDoc(doc(db, "methods", method.id), { published: false, updatedAt: serverTimestamp() }, { merge: true });
    } else {
      await deleteDoc(doc(db, "methods", method.id));
    }
    await loadContent();
  }
});

values("#seed-methods").addEventListener("click", async () => {
  setMessage(message, "正在匯入現有方法…", true);
  try {
    const defaults = await loadDefaultMethods();
    const batch = writeBatch(db);
    defaults.forEach((method, index) => {
      const { id, ...data } = method;
      batch.set(doc(db, "methods", id), { ...data, sortOrder: index, published: true, updatedAt: serverTimestamp() }, { merge: true });
    });
    await batch.commit();
    await loadContent();
    setMessage(message, `已匯入 ${defaults.length} 種方法。`, true);
  } catch { setMessage(message, "匯入失敗，請稍後再試。"); }
});

values("#reset-form").addEventListener("click", resetForm);
courseForm.addEventListener("submit", async event => {
  event.preventDefault();
  const id = values("#course-id").value.trim();
  const methodIds = [...values("#course-methods").selectedOptions].map(option => option.value);
  try {
    await setDoc(doc(db, "courses", id), {
      title: values("#course-title").value.trim(),
      description: values("#course-description").value.trim(),
      methodIds,
      sortOrder: Number(values("#course-order").value),
      published: values("#course-published").checked,
      updatedAt: serverTimestamp()
    }, { merge: true });
    setMessage(values("#course-message"), "課程與方法順序已儲存。", true);
    await loadContent();
  } catch { setMessage(values("#course-message"), "課程儲存失敗，請稍後再試。"); }
});

values("#course-list").addEventListener("click", async event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const course = courses.find(item => item.id === button.dataset.id);
  if (!course) return;
  if (button.dataset.action === "edit-course") { fillCourseForm(course); return; }
  if (button.dataset.action === "toggle-course") {
    await setDoc(doc(db, "courses", course.id), { published: course.published === false, updatedAt: serverTimestamp() }, { merge: true });
    await loadContent();
  }
});

values("#reset-course").addEventListener("click", resetCourseForm);
values("#refresh-analytics").addEventListener("click", loadAnalytics);
values("#logout").addEventListener("click", () => signOut(auth));
