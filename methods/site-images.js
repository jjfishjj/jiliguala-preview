import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getDownloadURL, getMetadata, getStorage, ref } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-storage.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const heroImage = document.querySelector('[data-storage-asset="homepage-hero"]');

function withVersion(url, updatedAt) {
  const result = new URL(url);
  const timestamp = Date.parse(updatedAt || "");
  if (Number.isFinite(timestamp)) result.searchParams.set("v", String(timestamp));
  return result.href;
}

async function loadUploadedHero() {
  if (!isFirebaseConfigured || !heroImage) return;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const heroRef = ref(getStorage(app), "site-images/homepage/hero");
  try {
    const [url, metadata] = await Promise.all([getDownloadURL(heroRef), getMetadata(heroRef)]);
    heroImage.onerror = () => {
      heroImage.onerror = null;
      heroImage.src = "../brand/hero-frog.png";
    };
    heroImage.src = withVersion(url, metadata.updated);
  } catch {
    // A missing upload or temporarily unavailable Storage should keep the bundled hero visible.
  }
}

loadUploadedHero();
