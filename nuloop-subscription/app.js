// app.js
// === 你的 Firebase 設定 (這裡要換成 Firebase console 給你的) ===
const firebaseConfig = {
  apiKey: "AIzaSyC-1c7MOx-tZ7ftvTBH1pZor_or3JofEIk",
  authDomain: "nuloop-fb031.firebaseapp.com",
  projectId: "nuloop-fb031",
  storageBucket: "nuloop-fb031.firebasestorage.app",
  messagingSenderId: "575191714041",
  appId: "1:575191714041:web:bd4e629374ac39339dba28",
  measurementId: "G-3ECY1QQN0D"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const mySubsSection = document.getElementById("my-subscriptions");
const subsList = document.getElementById("subscriptions-list");

// Google 登入
loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
});

// 登出
logoutBtn.addEventListener("click", () => {
  auth.signOut();
});

// 監聽登入狀態
auth.onAuthStateChanged(user => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    mySubsSection.style.display = "block";
    loadSubscriptions(user.uid);
  } else {
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    mySubsSection.style.display = "none";
  }
});

// 訂閱商品
function subscribe(product, price) {
  const user = auth.currentUser;
  if (!user) {
    alert("請先登入！");
    return;
  }

  db.collection("subscriptions").add({
    uid: user.uid,
    product,
    price,
    startDate: new Date(),
    status: "active"
  });
}

// 載入我的訂閱
function loadSubscriptions(uid) {
  db.collection("subscriptions").where("uid", "==", uid).get().then(snapshot => {
    subsList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      subsList.innerHTML += `
        <div class="card">
          <h3>${data.product}</h3>
          <p>每月 $${data.price}</p>
          <p>狀態：${data.status}</p>
          <button onclick="renew('${doc.id}',${data.price})">續訂 (9折)</button>
          <button onclick="endSub('${doc.id}')">結束訂閱</button>
        </div>
      `;
    });
  });
}

// 續訂
function renew(id, price) {
  db.collection("subscriptions").doc(id).update({
    price: Math.floor(price * 0.9),
    status: "renewed"
  });
}

// 結束訂閱
function endSub(id) {
  db.collection("subscriptions").doc(id).update({
    status: "ended"
  });
}
