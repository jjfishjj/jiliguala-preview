export const firebaseConfig = {
  apiKey: "AIzaSyASeYZ1IgvUzOw23H9l-VYPN4G99f0j8rQ",
  authDomain: "jiliguala-methods.firebaseapp.com",
  projectId: "jiliguala-methods",
  storageBucket: "jiliguala-methods.firebasestorage.app",
  messagingSenderId: "402358385730",
  appId: "1:402358385730:web:0f64f9414c6d09cfbd41db"
};

export const isFirebaseConfigured = !Object.values(firebaseConfig).some(value => value.startsWith("__FIREBASE_"));
