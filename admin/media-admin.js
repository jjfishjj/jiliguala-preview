import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { deleteObject, getDownloadURL, getMetadata, getStorage, ref, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-storage.js";
import { firebaseConfig } from "../methods/firebase-config.js";

const bootstrapEmail = "guocheju@gmail.com";
const maxImageBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const page = document.querySelector("#admin-view");
const heroRef = ref(storage, "site-images/homepage/hero");
let currentUser = null;
let mediaMethods = [];

function byId(id) { return document.getElementById(id); }

function setStatus(element, text, success = false) {
  element.textContent = text;
  element.classList.toggle("success", success);
}

function safeImageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "firebasestorage.googleapis.com" ? url.href : "";
  } catch { return ""; }
}

function versionedUrl(url, updatedAt) {
  const result = new URL(url);
  const parsed = Date.parse(updatedAt || "");
  result.searchParams.set("v", String(Number.isFinite(parsed) ? parsed : Date.now()));
  return result.href;
}

function validateImage(file) {
  if (!file) throw new Error("請先選擇圖片。");
  if (!allowedImageTypes.has(file.type)) throw new Error("圖片格式限 PNG、JPG 或 WebP。");
  if (file.size > maxImageBytes) throw new Error("圖片不可超過 5 MB。");
  return file;
}

function uploadWithProgress(file, path, progress) {
  const task = uploadBytesResumable(ref(storage, path), file, {
    contentType: file.type,
    cacheControl: "public,max-age=0,must-revalidate",
    customMetadata: { updatedBy: currentUser.uid }
  });
  return new Promise((resolve, reject) => {
    let unsubscribe = () => {};
    unsubscribe = task.on("state_changed", snapshot => {
      progress.value = snapshot.totalBytes ? Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100) : 0;
    }, error => {
      unsubscribe();
      reject(error);
    }, () => {
      unsubscribe();
      resolve(task.snapshot);
    });
  });
}

function displayStorageError(error) {
  if (error?.code === "storage/unauthorized") return "沒有上傳權限；請確認 Storage 規則已部署，且目前帳號在管理員名單內。";
  if (error?.code === "storage/object-not-found") return "目前沒有已上傳的圖片。";
  if (error?.code === "permission-denied") return "沒有 Firestore 管理員權限，請確認目前帳號仍在管理員名單內。";
  return "操作失敗，請確認網路、檔案格式與管理員權限後再試。";
}

function methodImagePath(methodId) {
  if (!/^[a-z0-9-]{1,80}$/.test(methodId || "")) throw new Error("方法 ID 格式不正確，無法建立圖片路徑。");
  return `site-images/methods/${methodId}/cover`;
}

function currentMethod() {
  return mediaMethods.find(method => method.id === byId("media-method-select").value) || null;
}

function renderMethodPreview() {
  const target = byId("method-image-preview");
  const method = currentMethod();
  target.replaceChildren();
  const imageUrl = safeImageUrl(method?.imageUrl);
  if (!method) {
    target.textContent = "請先選擇方法。";
    return;
  }
  if (!imageUrl) {
    target.textContent = "這個方法目前沒有配圖。";
    return;
  }
  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = `${method.title}目前的圖片`;
  image.loading = "lazy";
  target.append(image);
}

function setMethods(methods) {
  if (!Array.isArray(methods)) return;
  mediaMethods = methods;
  const select = byId("media-method-select");
  const selected = select.value;
  select.replaceChildren(...methods.map(method => {
    const option = document.createElement("option");
    option.value = method.id;
    option.textContent = `${method.title} · ${method.id}`;
    return option;
  }));
  if (methods.some(method => method.id === selected)) select.value = selected;
  renderMethodPreview();
}

async function refreshHeroPreview() {
  const preview = byId("hero-image-preview");
  const fallback = new URL("../brand/hero-frog.png", window.location.href).href;
  try {
    const [url, metadata] = await Promise.all([getDownloadURL(heroRef), getMetadata(heroRef)]);
    preview.onerror = () => { preview.onerror = null; preview.src = fallback; };
    preview.src = versionedUrl(url, metadata.updated);
  } catch {
    preview.onerror = null;
    preview.src = fallback;
  }
}

async function loadAdmins() {
  const target = byId("manager-list");
  try {
    const snapshot = await getDocs(collection(db, "admins"));
    const rows = snapshot.docs.map(item => ({ uid: item.id, ...item.data() }))
      .sort((a, b) => String(a.email || a.uid).localeCompare(String(b.email || b.uid)));
    byId("manager-total").textContent = `${rows.length} 位`;
    target.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "尚未有管理員紀錄。";
      target.append(empty);
      return;
    }
    rows.forEach(manager => {
      const item = document.createElement("article");
      item.className = "manager-item";
      const details = document.createElement("div");
      const email = document.createElement("strong");
      email.textContent = manager.email || "Email 未記錄";
      const uid = document.createElement("small");
      uid.textContent = manager.uid;
      details.append(email, uid);
      const isBootstrap = manager.email?.toLowerCase() === bootstrapEmail;
      const isSelf = manager.uid === currentUser?.uid;
      const badge = document.createElement("span");
      badge.className = "manager-badge";
      badge.textContent = isBootstrap ? "初始管理員" : isSelf ? "目前帳號" : "管理員";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "manager-remove";
      remove.textContent = "移除權限";
      remove.dataset.uid = manager.uid;
      remove.dataset.email = manager.email || "";
      remove.disabled = isBootstrap || isSelf;
      remove.title = remove.disabled ? "不能移除初始管理員或目前登入帳號" : "移除此帳號的管理權限";
      item.append(details, badge, remove);
      target.append(item);
    });
  } catch (error) {
    target.replaceChildren();
    const message = document.createElement("p");
    message.className = "empty";
    message.textContent = displayStorageError(error);
    target.append(message);
  }
}

async function isAuthorized(user) {
  if (user.email === bootstrapEmail) {
    const adminRef = doc(db, "admins", user.uid);
    const assigned = await getDoc(adminRef);
    if (!assigned.exists()) await setDoc(adminRef, { email: user.email, createdAt: serverTimestamp() }, { merge: true });
    return true;
  }
  const assigned = await getDoc(doc(db, "admins", user.uid));
  return assigned.exists();
}

async function uploadHero() {
  const status = byId("hero-media-status");
  const progress = byId("hero-upload-progress");
  try {
    const file = validateImage(byId("hero-image-file").files[0]);
    if (!currentUser) throw new Error("請先登入管理員帳號。");
    setStatus(status, "正在上傳首頁圖片…");
    progress.value = 0;
    const snapshot = await uploadWithProgress(file, "site-images/homepage/hero", progress);
    const [url, metadata] = await Promise.all([getDownloadURL(snapshot.ref), getMetadata(snapshot.ref)]);
    const preview = byId("hero-image-preview");
    preview.onerror = () => { preview.onerror = null; preview.src = "../brand/hero-frog.png"; };
    preview.src = versionedUrl(url, metadata.updated);
    byId("hero-image-file").value = "";
    setStatus(status, "首頁主視覺已更新。", true);
  } catch (error) {
    setStatus(status, error.message && !error.code ? error.message : displayStorageError(error));
  }
}

async function removeHero() {
  const status = byId("hero-media-status");
  if (!window.confirm("移除已上傳的首頁主視覺？網站會改用原本的預設圖片。")) return;
  try {
    await deleteObject(heroRef);
    byId("hero-image-preview").src = "../brand/hero-frog.png";
    setStatus(status, "已移除上傳圖片，網站會使用預設圖。", true);
  } catch (error) {
    setStatus(status, displayStorageError(error));
  }
}

async function uploadMethodImage() {
  const status = byId("method-media-status");
  const progress = byId("method-upload-progress");
  try {
    const method = currentMethod();
    if (!method) throw new Error("請先選擇方法。");
    const file = validateImage(byId("method-image-file").files[0]);
    if (!currentUser) throw new Error("請先登入管理員帳號。");
    setStatus(status, `正在上傳「${method.title}」的圖片…`);
    progress.value = 0;
    const snapshot = await uploadWithProgress(file, methodImagePath(method.id), progress);
    const url = versionedUrl(await getDownloadURL(snapshot.ref), snapshot.metadata.updated);
    await setDoc(doc(db, "methods", method.id), {
      imageUrl: url,
      imageUpdatedAt: serverTimestamp(),
      imageUpdatedBy: currentUser.uid,
      updatedAt: serverTimestamp()
    }, { merge: true });
    method.imageUrl = url;
    window.JILIGUALA_ADMIN_METHODS = mediaMethods;
    window.dispatchEvent(new CustomEvent("jiliguala:admin-methods-loaded", { detail: mediaMethods }));
    byId("method-image-file").value = "";
    renderMethodPreview();
    setStatus(status, `「${method.title}」圖片已更新。`, true);
  } catch (error) {
    setStatus(status, error.message && !error.code ? error.message : displayStorageError(error));
  }
}

async function removeMethodImage() {
  const status = byId("method-media-status");
  const method = currentMethod();
  if (!method) { setStatus(status, "請先選擇方法。"); return; }
  if (!window.confirm(`移除「${method.title}」的圖片？方法內容不會刪除。`)) return;
  try {
    try { await deleteObject(ref(storage, methodImagePath(method.id))); }
    catch (error) { if (error?.code !== "storage/object-not-found") throw error; }
    await setDoc(doc(db, "methods", method.id), {
      imageUrl: null,
      imageUpdatedAt: serverTimestamp(),
      imageUpdatedBy: currentUser.uid,
      updatedAt: serverTimestamp()
    }, { merge: true });
    method.imageUrl = null;
    window.JILIGUALA_ADMIN_METHODS = mediaMethods;
    window.dispatchEvent(new CustomEvent("jiliguala:admin-methods-loaded", { detail: mediaMethods }));
    renderMethodPreview();
    setStatus(status, `已移除「${method.title}」的圖片。`, true);
  } catch (error) {
    setStatus(status, displayStorageError(error));
  }
}

byId("media-method-select").addEventListener("change", renderMethodPreview);
byId("upload-hero-image").addEventListener("click", uploadHero);
byId("remove-hero-image").addEventListener("click", removeHero);
byId("upload-method-image").addEventListener("click", uploadMethodImage);
byId("remove-method-image").addEventListener("click", removeMethodImage);
byId("manager-form").addEventListener("submit", async event => {
  event.preventDefault();
  const status = byId("manager-status");
  const uid = byId("manager-uid").value.trim();
  const email = byId("manager-email").value.trim().toLowerCase();
  if (!/^[A-Za-z0-9:_-]{1,128}$/.test(uid)) { setStatus(status, "Firebase UID 僅能使用英數字、冒號、底線或連字號。"); return; }
  try {
    const existing = await getDoc(doc(db, "admins", uid));
    if (existing.exists()) { setStatus(status, "這個 UID 已經有管理員權限。"); return; }
    await setDoc(doc(db, "admins", uid), {
      email,
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid
    });
    byId("manager-form").reset();
    setStatus(status, "已授予管理權。對方下次使用此 Firebase 帳號登入即可管理。", true);
    await loadAdmins();
  } catch (error) {
    setStatus(status, displayStorageError(error));
  }
});

byId("manager-list").addEventListener("click", async event => {
  const button = event.target.closest("button[data-uid]");
  if (!button || button.disabled) return;
  const uid = button.dataset.uid;
  if (uid === currentUser?.uid || button.dataset.email?.toLowerCase() === bootstrapEmail) return;
  if (!window.confirm(`移除 ${button.dataset.email || uid} 的管理權限？`)) return;
  try {
    await deleteDoc(doc(db, "admins", uid));
    setStatus(byId("manager-status"), "已移除管理權限。", true);
    await loadAdmins();
  } catch (error) {
    setStatus(byId("manager-status"), displayStorageError(error));
  }
});

byId("hero-image-file").addEventListener("change", () => setStatus(byId("hero-media-status"), ""));
byId("method-image-file").addEventListener("change", () => setStatus(byId("method-media-status"), ""));
window.addEventListener("jiliguala:admin-methods-loaded", event => setMethods(event.detail));
if (Array.isArray(window.JILIGUALA_ADMIN_METHODS)) setMethods(window.JILIGUALA_ADMIN_METHODS);

onAuthStateChanged(auth, async user => {
  currentUser = user;
  if (!user || !page) return;
  try {
    if (!(await isAuthorized(user))) return;
    await Promise.all([loadAdmins(), refreshHeroPreview()]);
  } catch {
    setStatus(byId("manager-status"), "無法確認管理員權限，請重新登入或稍後再試。");
  }
});
