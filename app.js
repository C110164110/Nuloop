const YEAR = document.querySelector('#year');
YEAR.textContent = new Date().getFullYear();

// DOM
const rack = document.querySelector('#rack');
const tabs = document.querySelector('#tabs');
const q = document.querySelector('#q');
const catList = document.querySelector('#catList');
const btnShop = document.querySelector('#btnShop');
const btnAdmin = document.querySelector('#btnAdmin');
const cartList = document.querySelector('#cartItems');
const cartTotal = document.querySelector('#cartTotal');
const cartCount = document.querySelector('#cartCount');
const adminSection = document.querySelector('#admin');
const shopSection = document.querySelector('#shop');

// 狀態
let state = JSON.parse(localStorage.getItem('vendoshop-db')) || seedData();
let cart = [];
let currentCat = state.cats[0].id;

// 初始資料
function seedData() {
  const cats = [
    { id: 'drinks', name: 'Drinks', icon: '🥤' },
    { id: 'snacks', name: 'Snacks', icon: '🍫' },
    { id: 'gadgets', name: 'Gadgets', icon: '⚙️' },
    { id: 'home', name: 'Home', icon: '🏠' }
  ];
  const products = [
    { id: '1', name: '氣泡水', price: 45, cat: 'drinks', stock: 10, img: 'https://via.placeholder.com/120' },
    { id: '2', name: '巧克力棒', price: 30, cat: 'snacks', stock: 15, img: 'https://via.placeholder.com/120' },
    { id: '3', name: '耳機', price: 450, cat: 'gadgets', stock: 5, img: 'https://via.placeholder.com/120' },
    { id: '4', name: '抱枕', price: 350, cat: 'home', stock: 8, img: 'https://via.placeholder.com/120' }
  ];
  return { cats, products, orders: [] };
}

// 存檔
function saveDB() { localStorage.setItem('vendoshop-db', JSON.stringify(state)); }

// 顯示分類
function renderCats() {
  catList.innerHTML = '';
  state.cats.forEach(c => {
    const div = document.createElement('div');
    div.className = 'cat';
    div.dataset.id = c.id;
    div.textContent = `${c.icon} ${c.name}`;
    if (c.id === currentCat) div.dataset.active = true;
    div.onclick = () => { currentCat = c.id; renderRack(); renderCats(); };
    catList.appendChild(div);
  });
}

// 顯示商品
function renderRack() {
  const keyword = q.value.toLowerCase();
  const filtered = state.products.filter(p =>
    p.cat === currentCat &&
    (p.name.toLowerCase().includes(keyword) || p.id.toLowerCase().includes(keyword))
  );
  rack.innerHTML = '';
  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'slot-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}"/>
      <div>${p.name}</div>
      <div>NT$ ${p.price}</div>
      <div>庫存: ${p.stock}</div>
      <button ${p.stock === 0 ? 'disabled' : ''}>加入購物車</button>
    `;
    card.querySelector('button').onclick = () => addToCart(p.id);
    rack.appendChild(card);
  });
}

// 購物車
function addToCart(pid) {
  const item = state.products.find(p => p.id === pid);
  if (!item || item.stock <= 0) return alert('庫存不足！');
  const cartItem = cart.find(c => c.id === pid);
  if (cartItem) cartItem.qty++;
  else cart.push({ id: pid, qty: 1 });
  updateCart();
}

function updateCart() {
  cartList.innerHTML = '';
  let total = 0, count = 0;
  cart.forEach(c => {
    const p = state.products.find(p => p.id === c.id);
    total += p.price * c.qty;
    count += c.qty;
    const div = document.createElement('div');
    div.className = 'slot-card';
    div.innerHTML = `
      <div>${p.name} x ${c.qty}</div>
      <div>NT$ ${p.price * c.qty}</div>
      <button>移除</button>
    `;
    div.querySelector('button').onclick = () => {
      cart = cart.filter(x => x.id !== c.id);
      updateCart();
    };
    cartList.appendChild(div);
  });
  cartTotal.textContent = `NT$ ${total}`;
  cartCount.textContent = `${count} 件`;
}

// 結帳
document.querySelector('#btnCheckout').onclick = () => {
  if (cart.length === 0) return alert('購物車是空的！');
  cart.forEach(c => {
    const p = state.products.find(p => p.id === c.id);
    p.stock -= c.qty;
  });
  state.orders.push({ date: new Date(), items: [...cart] });
  cart = [];
  saveDB();
  renderRack();
  updateCart();
  alert('結帳完成！');
};
document.querySelector('#btnClearCart').onclick = () => { cart = []; updateCart(); };

// 搜尋
q.oninput = () => renderRack();

// 後台切換
btnShop.onclick = () => { shopSection.style.display = 'block'; adminSection.style.display = 'none'; };
btnAdmin.onclick = () => { shopSection.style.display = 'none'; renderAdmin(); adminSection.style.display = 'block'; };

// 後台
function renderAdmin() {
  const grid = document.querySelector('#adminGrid');
  grid.innerHTML = '';
  state.products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'admin-card';
    div.innerHTML = `
      <input placeholder="名稱" value="${p.name}" />
      <input placeholder="價格" type="number" value="${p.price}" />
      <input placeholder="庫存" type="number" value="${p.stock}" />
      <input placeholder="分類" value="${p.cat}" />
      <button>更新</button>
      <button>刪除</button>
    `;
    const [inpName, inpPrice, inpStock, inpCat] = div.querySelectorAll('input');
    const [btnUpdate, btnDelete] = div.querySelectorAll('button');
    btnUpdate.onclick = () => {
      p.name = inpName.value;
      p.price = parseInt(inpPrice.value) || 0;
      p.stock = parseInt(inpStock.value) || 0;
      p.cat = inpCat.value;
      saveDB(); renderRack(); renderAdmin();
    };
    btnDelete.onclick = () => {
      state.products = state.products.filter(x => x.id !== p.id);
      saveDB(); renderRack(); renderAdmin();
    };
    grid.appendChild(div);
  });
}

// 初始化
renderCats();
renderRack();
updateCart();
