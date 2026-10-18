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
const categoryLabels = {
  remember: "記得住",
  understand: "想得懂",
  express: "說得出",
  improve: "改得好"
};

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

async function loadMemberData(user) {
  const [favoritesSnapshot, laterSnapshot, practiceSnapshot, notesSnapshot, profile] = await Promise.all([
    getDocs(collection(db, "users", user.uid, "favorites")),
    getDocs(collection(db, "users", user.uid, "later")),
    getDocs(collection(db, "users", user.uid, "practice")),
    getDocs(collection(db, "users", user.uid, "notes")),
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
  const practiceCount = profile.data()?.practiceCount || 0;
  const progress = Math.min(100, Math.round((practice.length / 23) * 100));

  window.dispatchEvent(new CustomEvent("jiliguala:favorites-updated", { detail: favorites }));
  document.querySelector("#favorite-count").textContent = favorites.length;
  document.querySelector("#practice-count").textContent = practiceCount;
  document.querySelector("#later-count").textContent = later.length;
  document.querySelector("#note-count").textContent = notes.length;
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
}

function renderUser(user) {
  currentUser = user;
  signedOutView.hidden = Boolean(user);
  signedInView.hidden = !user;
  authDialog.classList.toggle("member-open", Boolean(user));
  if (!user) {
    authButtonLabel.textContent = "會員登入";
    accountAvatar.textContent = "人";
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
      try { await ensureProfile(user); await loadMemberData(user); }
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
    await setDoc(doc(db, "users", currentUser.uid, "practice", method.id), {
      methodId: method.id,
      title: method.title,
      count: increment(1),
      lastCompletedAt: serverTimestamp()
    }, { merge: true });
    await setDoc(doc(db, "users", currentUser.uid), { practiceCount: increment(1) }, { merge: true });
    await deleteDoc(doc(db, "users", currentUser.uid, "later", method.id));
    document.querySelector("#method-dialog")?.close();
    await loadMemberData(currentUser);
    showToast(`完成「${method.title}」一次！`);
  } catch { showToast("練習紀錄同步失敗，請稍後再試。"); }
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
