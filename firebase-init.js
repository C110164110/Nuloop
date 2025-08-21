// ===== Firebase 初始化 =====
// 1) 到 Firebase Console 建立專案 -> 建立 Web App
// 2) 複製 config 物件，貼到下方 FIREBASE_CONFIG
// 3) 啟用 Authentication：Email/Password、Google
// 4) （選用）在 Authentication > 使用者，先建立你的管理員帳號

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC-1c7MOx-tZ7ftvTBH1pZor_or3JofEIk",
  authDomain: "nuloop-fb031.firebaseapp.com",
  projectId: "nuloop-fb031",
  appId: "1:575191714041:web:bd4e629374ac39339dba28",
};

if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}
window.firebaseAuth = firebase.auth();

// ====== 管理員白名單（只有這些 email 能進 admin.html） ======
window.ADMIN_ALLOWLIST = [
  "y7539088@gmail.com"
];
