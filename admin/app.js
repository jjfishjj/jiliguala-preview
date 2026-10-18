import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc, writeBatch } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { firebaseConfig } from "../methods/firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const bootstrapEmail = "guocheju@gmail.com";
const loginView = document.querySelector("#login-view");
const adminView = document.querySelector("#admin-view");
const form = document.querySelector("#method-form");
const message = document.querySelector("#form-message");
let methods = [];
let defaultIds = new Set();
let defaultMethodsCache = null;

function setMessage(element, text, success = false) {
  element.textContent = text;
  element.classList.toggle("success", success);
}

function values(id) { return document.querySelector(id); }

function resetForm() {
  form.reset();
  values("#method-time").value = 7;
  values("#method-order").value = 100;
  values("#method-published").checked = true;
  values("#method-id").disabled = false;
  values("#form-heading").textContent = "新增方法";
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
  form.scrollIntoView({ behavior: "smooth", block: "start" });
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
  renderMethods();
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
    await loadMethods();
  } catch { setMessage(values("#login-message"), "無法確認管理員權限，請稍後再試。"); }
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  const id = values("#method-id").value.trim();
  try {
    await setDoc(doc(db, "methods", id), methodFromForm(), { merge: true });
    setMessage(message, "方法已儲存並同步到網站。", true);
    await loadMethods();
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
    await loadMethods();
    return;
  }
  if (button.dataset.action === "delete" && window.confirm(`確定刪除「${method.title}」？`)) {
    if (defaultIds.has(method.id)) {
      await setDoc(doc(db, "methods", method.id), { published: false, updatedAt: serverTimestamp() }, { merge: true });
    } else {
      await deleteDoc(doc(db, "methods", method.id));
    }
    await loadMethods();
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
    await loadMethods();
    setMessage(message, `已匯入 ${defaults.length} 種方法。`, true);
  } catch { setMessage(message, "匯入失敗，請稍後再試。"); }
});

values("#reset-form").addEventListener("click", resetForm);
values("#logout").addEventListener("click", () => signOut(auth));
