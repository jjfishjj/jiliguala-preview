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

async function loadMemberData(user) {
  const favoritesSnapshot = await getDocs(collection(db, "users", user.uid, "favorites"));
  const favorites = favoritesSnapshot.docs.map(item => item.id);
  window.dispatchEvent(new CustomEvent("jiliguala:favorites-updated", { detail: favorites }));
  document.querySelector("#favorite-count").textContent = favorites.length;
  const profile = await getDoc(doc(db, "users", user.uid));
  document.querySelector("#practice-count").textContent = profile.data()?.practiceCount || 0;
}

function renderUser(user) {
  currentUser = user;
  signedOutView.hidden = Boolean(user);
  signedInView.hidden = !user;
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
    document.querySelector("#method-dialog")?.close();
    await loadMemberData(currentUser);
    showToast(`完成「${method.title}」一次！`);
  } catch { showToast("練習紀錄同步失敗，請稍後再試。"); }
});
