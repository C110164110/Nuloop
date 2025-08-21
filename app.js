// ====== 狀態與元素 ======
let state = DB.load();
let currentCat = state.cats[0]?.id || 'drinks';
let cart = [];

const el = s => document.querySelector(s);
const rack = el('#rack');
const tabs = el('#tabs');
const q = el('#q');
const catList = el('#catList');
const cartList = el('#cartItems');
const cartTotal = el('#cartTotal');
const cartCount = el('#cartCount');
const YEAR = el('#year');
const authChip = el('#authChip');
const authModal = el('#authModal');

YEAR.textContent = new Date().getFullYear();

// ====== Auth UI ======
const btnLogin = el('#btnLogin');
const btnLogout = el('#btnLogout');
const btnEmailSignUp = el('#btnEmailSignUp');
const btnEmailSignIn = el('#btnEmailSignIn');
const btnGoogle = el('#btnGoogle');
const btnCloseModal = el('#btnCloseModal');
const email = el('#email');
const password = el('#password');
const authMsg = el('#authMsg');

function openAuth(){ authModal.classList.add('show'); authModal.setAttribute('aria-hidden','false'); }
function closeAuth(){ authModal.classList.remove('show'); authModal.setAttribute('aria-hidden','true'); authMsg.textContent=''; }

btnLogin?.addEventListener('click', openAuth);
btnCloseModal?.addEventListener('click', closeAuth);

btnEmailSignUp?.addEventListener('click', async () => {
  try{
    const userCred = await firebaseAuth.createUserWithEmailAndPassword(email.value, password.value);
    authMsg.textContent = `註冊成功：${userCred.user.email}`;
  }catch(e){ authMsg.textContent = e.message; }
});

btnEmailSignIn?.addEventListener('click', async () => {
  try{
    const userCred = await firebaseAuth.signInWithEmailAndPassword(email.value, password.value);
    authMsg.textContent = `登入成功：${userCred.user.email}`;
    setTimeout(closeAuth, 600);
  }catch(e){ authMsg.textContent = e.message; }
});

btnGoogle?.addEventListener('click', async () => {
  try{
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebaseAuth.signInWithPopup(provider);
    authMsg.textContent = `Google 登入成功`;
    setTimeout(closeAuth, 600);
  }catch(e){ authMsg.textContent = e.message; }
});

btnLogout?.addEventListener('click', () => firebaseAuth.signOut());

firebaseAuth.onAuthStateChanged(user => {
  if(user){
    authChip.textContent = user.email || '已登入';
    btnLogin.style.display = 'none';
    btnLogout.style.display = 'inline-flex';
  }else{
    authChip.textContent = '未登入';
    btnLogin.style.display = 'inline-flex';
    btnLogout.style.display = 'none';
  }
});

// ====== 類別與商品渲染 ======
function renderCats(){
  // 側欄
  catList.innerHTML = state.cats.map(c => `
    <div class="cat" data-id="${c.id}" data-active="${c.id===currentCat}">
      <div class="ic">${c.icon}</div>
      <div>
        <div>${c.name}</div>
        <div class="meta">ID: ${c.id}</div>
      </div>
    </div>
  `).join('');
  catList.querySelectorAll('.cat').forEach(x => x.onclick = () => {
    currentCat = x.dataset.id;
    renderTabs(); renderRack(); renderCats();
  });

  // 上方 tabs
  renderTabs();
}
function renderTabs(){
  tabs.innerHTML = state.cats.map(c => `
    <button class="tab" data-active="${c.id===currentCat}" data-id="${c.id}">${c.icon} ${c.name}</button>
  `).join('');
  tabs.querySelectorAll('.tab').forEach(b => b.onclick = () => {
    currentCat = b.dataset.id; renderTabs(); renderRack();
  });
}
function renderRack(){
  const keyword = q.value.trim().toLowerCase();
  let items = state.products.filter(p => p.cat===currentCat);
  if(keyword){
    items = state.products.filter(p =>
      p.name.toLowerCase().includes(keyword) || p.slot.toLowerCase().includes(keyword) || p.cat.toLowerCase().includes(keyword)
    );
  }
  rack.innerHTML = items.map(p => slotHTML(p)).join('');
  rack.querySelectorAll('.add').forEach(btn => btn.onclick = () => addToCart(btn.dataset.id));
}
function slotHTML(p){
  const soldout = p.stock<=0;
  return `
  <div class="slot" aria-label="商品 ${p.name}">
    <div class="slot-code">${p.slot}</div>
    <div class="pimg">${p.img?`<img src="${p.img}" alt="${p.name}" style="max-width:100%; max-height:100%; border-radius:10px"/>`:'❓'}</div>
    <div class="row">
      <div>
        <div class="pname">${p.name}</div>
        <div class="stock">${soldout?'<span style="color:var(--danger);font-weight:700">售罄</span>':`庫存 ${p.stock}`}</div>
      </div>
      <div style="text-align:right">
        <div class="price">NT$ ${p.price}</div>
        <button class="add" ${soldout?'disabled':''} data-id="${p.id}">投入</button>
      </div>
    </div>
  </div>`;
}

// ====== 購物車 ======
function addToCart(pid){
  const p = state.products.find(x=>x.id===pid);
  if(!p || p.stock<=0) return;
  const exist = cart.find(x=>x.id===pid);
  if(exist){ exist.qty++; } else { cart.push({ id:pid, qty:1 }); }
  p.stock--;
  DB.save(state);
  renderRack(); renderCart(); renderProductsTable?.();
}
function renderCart(){
  if(cart.length===0){
    cartList.innerHTML = '<div class="hint">購物車是空的</div>';
    cartTotal.textContent='NT$ 0'; cartCount.textContent='0 件'; return;
  }
  cartList.innerHTML = cart.map(ci => {
    const p = state.products.find(x=>x.id===ci.id);
    return `<div class="citem">
      <div class="ic" style="width:36px; height:36px; display:grid; place-items:center; border:1px solid rgba(255,255,255,.12); border-radius:8px; background:#0a1530">
        ${p ? `<img src='${p.img}' alt='' style='width:100%;height:100%;object-fit:cover;border-radius:6px'/>` : '🧺'}
      </div>
      <div>
        <div style="font-weight:700">${p?.name || '未知商品'}</div>
        <div class="hint">${p?.slot || ''}</div>
      </div>
      <div class="qty">
        <button aria-label="減少" onclick="changeQty('${ci.id}',-1)">−</button>
        <div aria-live="polite">${ci.qty}</div>
        <button aria-label="增加" onclick="changeQty('${ci.id}',1)">＋</button>
      </div>
    </div>`;
  }).join('');
  const total = cart.reduce((sum,ci)=>{
    const p = state.products.find(x=>x.id===ci.id); return sum + (p?p.price:0) * ci.qty;
  },0);
  cartTotal.textContent = 'NT$ ' + total.toLocaleString();
  cartCount.textContent = cart.reduce((s,x)=>s+x.qty,0) + ' 件';
}
window.changeQty = function(pid,delta){
  const idx = cart.findIndex(x=>x.id===pid); if(idx<0) return;
  const p = state.products.find(x=>x.id===pid);
  cart[idx].qty += delta;
  if(cart[idx].qty<=0){ cart.splice(idx,1); }
  if(delta<0){ p.stock++; }
  if(delta>0){
    if(p.stock>0){ p.stock--; } else { cart[idx].qty-=1; alert('庫存不足'); }
  }
  DB.save(state); renderCart(); renderRack(); renderProductsTable?.();
}

const btnClearCart = el('#btnClearCart');
btnClearCart.onclick = ()=>{
  if(confirm('清空購物車？')){
    cart.forEach(ci=>{ const p = state.products.find(x=>x.id===ci.id); if(p) p.stock += ci.qty; });
    cart=[]; DB.save(state); renderCart(); renderRack(); renderProductsTable?.();
  }
};

const btnCheckout = el('#btnCheckout');
btnCheckout.onclick = ()=>{
  if(cart.length===0) return alert('購物車為空');
  // 需要登入才可結帳（示範）
  if(!firebaseAuth.currentUser){ return alert('請先登入再結帳'); }
  const payment = prompt('選擇付款方式：cash / card / mobile','mobile') || 'cash';
  const items = cart.map(ci=>{ const p = state.products.find(x=>x.id===ci.id); return { id:ci.id, name:p?.name||'', price:p?.price||0, qty:ci.qty }; });
  const total = items.reduce((s,i)=>s+i.price*i.qty,0);
  state.orders.unshift({ id:'O'+Date.now(), time:new Date().toLocaleString(), items, total, payment, uid: firebaseAuth.currentUser.uid });
  cart = []; DB.save(state); renderCart(); renderOrdersTable?.(); alert('感謝購買！訂單已建立。');
};

// ====== 搜尋 ======
q.addEventListener('input', ()=> renderRack());

// ====== 啟動 ======
function init(){ renderCats(); renderRack(); renderCart(); }
init();
