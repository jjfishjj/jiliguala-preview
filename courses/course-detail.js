import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { doc, getDoc, getFirestore } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "../methods/firebase-config.js";

const courseId = new URLSearchParams(window.location.search).get("course") || document.body.dataset.course;
const defaultCourse = (window.JILIGUALA_DEFAULT_COURSES || []).find(course => course.id === courseId);

function render(course) {
  if (!course) {
    document.querySelector("#course-detail").innerHTML = "<h1>找不到這門課程</h1><p>請回到課程介紹重新選擇。</p>";
    return;
  }
  document.title = `${course.title}｜記理呱啦`;
  document.querySelector("#course-kicker").textContent = `SELF-PACED COURSE · ${(course.chapters || []).length} 章`;
  document.querySelector("#course-title").textContent = course.title;
  document.querySelector("#course-description").textContent = course.description;
  document.querySelector("#course-outcome").textContent = course.outcome || "完成所有章節，建立一條可以重複使用的學習流程。";
  document.querySelector("#course-duration").textContent = `${course.duration || "約 35"} 分鐘`;
  document.querySelector("#course-chapter-count").textContent = `${(course.chapters || []).length} 個章節`;
  document.querySelector("#course-chapters").replaceChildren(...(course.chapters || []).map((chapter, index) => {
    const article = document.createElement("article");
    article.className = "chapter-card";
    article.innerHTML = `<div class="chapter-number">${String(index + 1).padStart(2, "0")}</div>
      <div class="chapter-copy"><small>CHAPTER ${index + 1} · 約 ${chapter.time || 7} 分鐘</small><h2>${chapter.title}</h2><p>${chapter.summary}</p><strong>本章任務：${chapter.task}</strong></div>
      <a href="../methods/?open=${encodeURIComponent(chapter.methodId)}">打開方法卡 <span>→</span></a>`;
    return article;
  }));
  document.querySelector("#course-start").href = `../methods/?open=${encodeURIComponent(course.chapters?.[0]?.methodId || course.methodIds?.[0] || "")}`;
}

render(defaultCourse);

if (isFirebaseConfigured && defaultCourse) {
  const db = getFirestore(initializeApp(firebaseConfig));
  getDoc(doc(db, "courses", courseId)).then(snapshot => {
    if (!snapshot.exists() || snapshot.data().published === false) return;
    const data = snapshot.data();
    const chapterByMethod = new Map((defaultCourse.chapters || []).map(chapter => [chapter.methodId, chapter]));
    const chapters = (data.methodIds || defaultCourse.methodIds).map(methodId => chapterByMethod.get(methodId)).filter(Boolean);
    render({ ...defaultCourse, ...data, chapters: chapters.length ? chapters : defaultCourse.chapters });
  }).catch(() => {});
}
