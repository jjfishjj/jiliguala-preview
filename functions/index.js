const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const { METHOD_CATALOG, dateKey, weekStartKey, nextStreak } = require("./logic");

initializeApp();
const db = getFirestore();

exports.recordPractice = onCall({
  region: "asia-east1",
  maxInstances: 10,
  cors: ["https://jiliguala-methods.vercel.app", /https:\/\/jiliguala-methods-[a-z0-9-]+\.vercel\.app/, "http://localhost:4173"]
}, async request => {
  if (!request.auth) throw new HttpsError("unauthenticated", "請先登入會員。");
  const methodId = typeof request.data?.methodId === "string" ? request.data.methodId : "";
  if (!/^[a-z0-9-]{1,80}$/.test(methodId)) throw new HttpsError("invalid-argument", "方法 ID 格式不正確。");

  const userId = request.auth.uid;
  const today = dateKey();
  const weekKey = weekStartKey(today);
  const profileRef = db.doc(`users/${userId}`);
  const practiceRef = db.doc(`users/${userId}/practice/${methodId}`);
  const activityRef = db.doc(`users/${userId}/activity/${today}`);
  const dailyRef = db.doc(`users/${userId}/daily/${today}`);
  const leaderboardRef = db.doc(`leaderboard/${userId}`);
  const methodRef = db.doc(`methods/${methodId}`);

  return db.runTransaction(async transaction => {
    const [methodSnapshot, profileSnapshot, practiceSnapshot, activitySnapshot, dailySnapshot, leaderboardSnapshot] = await Promise.all([
      transaction.get(methodRef),
      transaction.get(profileRef),
      transaction.get(practiceRef),
      transaction.get(activityRef),
      transaction.get(dailyRef),
      transaction.get(leaderboardRef)
    ]);
    const method = methodSnapshot.exists
      ? { ...METHOD_CATALOG[methodId], ...methodSnapshot.data() }
      : METHOD_CATALOG[methodId];
    if (!method || method.published === false || !method.title || !["remember", "understand", "express", "improve"].includes(method.category)) {
      throw new HttpsError("invalid-argument", "找不到可練習的學習方法。");
    }
    const profile = profileSnapshot.data() || {};
    const practice = practiceSnapshot.data() || {};
    const activity = activitySnapshot.data() || {};
    const daily = dailySnapshot.data() || {};
    const leaderboard = leaderboardSnapshot.data() || {};
    const practiceCount = (profile.practiceCount || 0) + 1;
    const streak = nextStreak(profile.lastPracticeDate, profile.streak, today);
    const weeklyCount = leaderboard.weekKey === weekKey ? (leaderboard.weeklyCount || 0) + 1 : 1;
    const displayName = request.auth.token.name || `學習者 ${userId.slice(0, 4).toUpperCase()}`;
    const timestamp = FieldValue.serverTimestamp();

    transaction.set(profileRef, { practiceCount, streak, lastPracticeDate: today }, { merge: true });
    transaction.set(practiceRef, {
      methodId,
      title: method.title,
      category: method.category,
      count: (practice.count || 0) + 1,
      lastCompletedAt: timestamp
    }, { merge: true });
    transaction.set(activityRef, { count: (activity.count || 0) + 1, updatedAt: timestamp }, { merge: true });
    transaction.set(leaderboardRef, { displayName, weeklyCount, totalPracticeCount: practiceCount, weekKey, updatedAt: timestamp });
    if (dailySnapshot.exists && daily.methodId === methodId) {
      transaction.set(dailyRef, {
        completed: true,
        completedCount: (daily.completedCount || 0) + 1,
        completedAt: timestamp
      }, { merge: true });
    }
    transaction.delete(db.doc(`users/${userId}/later/${methodId}`));

    return { methodId, practiceCount, streak, weeklyCount, weekKey, today };
  });
});
