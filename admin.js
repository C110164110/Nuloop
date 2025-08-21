// ===== 後台存取控制 =====
const authChip = document.querySelector('#authChip');
const YEAR = document.querySelector('#year');
YEAR.textContent = new Date().getFullYear();

firebaseAuth.onAuthStateChanged(user => {
  if(!user){
    authChip.textContent = '未登入'; 
    // 顯示簡易登入流程（導回前台登入即可）
    alert('請先登入後再進入後台'); 
    location.href = 'index.html';
    return;
  }
  authChip.textContent = user.email || '已登入';
  // 檢查白名單
  if(Array.isArray(window.ADMIN_ALLOWLIST) && window.ADMIN_ALLOWLIST.length>0){
    if(!window.ADMIN_ALLOWLIST.includes(user.email)){
      alert('此帳號沒有後台權限');
      location.href = 'index.html';
      return;
    }
  }
  // 有權限 -> 初始化後台
  initAdmin();
});

// ====== 後台資料與表單控制 ======
let state = DB.load();
const el = s => document.querySelector(s);
const fId = el('#f-id');
const fName = el('#f-name');
const fPrice = el('#f-price');
const fStock = el('#f-stock');
const fCat = el('#f-cat');
const fSlot = el('#f-slot');
const fImg = el('#f-img');
const tblProducts = el('#tblProducts tbody');
const tblOrders = el('#tblOrders tbody');

const btnSave = el('#btnSave');
const btnDelete = el('#btnDelete');
const btnClear = el('#btnClear');
const btnExport = el('#btnExport');
const fileImport = el('#fileImport');
const btnLogout = el('#btnLogout');

btnLogout.addEventListener('click', ()=> firebaseAuth.signOut().then(()=>location.href='index.html'));

function initAdmin(){
  // 分類下拉
  fCat.innerHTML = state.cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  renderProductsTable();
  renderOrdersTable();

  btnClear.onclick = ()=> fillForm(null);
  btnSave.onclick = onSave;
  btnDelete.onclick = onDelete;
  btnExport.onclick = onExport;
  fileImport.onchange = onImport;
}

function fillForm(p){
  fId.value = p?.id || '';
  fName.value = p?.name || '';
  fPrice.value = p?.price ?? '';
  fStock.value = p?.stock ?? '';
  fCat.value = p?.cat || state.cats[0]?.id || 'drinks';
  fSlot.value = p?.slot || '';
  fImg.value = p?.img && !p.img.startsWith('data:image/svg+xml') ? p.img : '';
}

async function onSave(){
  const id = fId.value || (crypto.randomUUID ? crypto.randomUUID() : (Date.now()+Math.random()).toString(36));
  const exists = state.products.find(x=>x.id===id);
  const data = {
    id,
    name: fName.value.trim() || '未命名商品',
    price: Math.max(0, Number(fPrice.value||0)),
    stock: Math.max(0, Number(fStock.value||0)),
    cat: fCat.value,
    slot: (fSlot.value||'').toUpperCase().replace(/\s+/g,''),
    img: fImg.value.trim() || buildSVG('🧺', fName.value.trim()||'商品')
  };
  if(exists){ Object.assign(exists, data); } else { state.products.push(data); }
  DB.save(state); renderProductsTable(); alert('已儲存');
}

function onDelete(){
  const id = fId.value;
  if(!id) return alert('請先輸入/選擇要刪除的商品');
  if(!confirm('確定刪除商品？')) return;
  const i = state.products.findIndex(x=>x.id===id);
  if(i>=0){
    state.products.splice(i,1); DB.save(state); renderProductsTable(); fillForm(null); alert('已刪除');
  }
}

function onExport(){
  const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'vendoshop-data.json'; a.click();
  URL.revokeObjectURL(url);
}

async function onImport(e){
  const file = e.target.files?.[0]; if(!file) return;
  const text = await file.text();
  try{
    const data = JSON.parse(text);
    if(!data.products||!data.cats) throw 0;
    state = data; DB.save(state); renderProductsTable(); renderOrdersTable(); alert('匯入完成');
  }catch{ alert('格式不正確'); }
}

function renderProductsTable(){
  const rows = state.products.slice().sort((a,b)=>a.slot.localeCompare(b.slot)).map(p => `
    <tr data-id='${p.id}' style='cursor:pointer'>
      <td>${p.id.slice(0,6)}…</td><td>${p.name}</td><td>${p.cat}</td><td>${p.slot}</td><td>NT$ ${p.price}</td><td>${p.stock}</td>
    </tr>
  `).join('');
  tblProducts.innerHTML = rows || '<tr><td colspan="6" class="hint">尚無商品</td></tr>';
  tblProducts.querySelectorAll('tr[data-id]').forEach(tr => tr.onclick = ()=>{
    const p = state.products.find(x=>x.id===tr.dataset.id);
    fillForm(p); window.scrollTo({ top: document.body.scrollHeight, behavior:'smooth' });
  });
}

function renderOrdersTable(){
  tblOrders.innerHTML = state.orders.map(o => {
    const names = o.items.map(x=>`${x.name}×${x.qty}`).join('、');
    return `<tr><td>${o.id}</td><td>${o.time}</td><td>${names}</td><td>NT$ ${o.total}</td><td>${o.payment}</td></tr>`;
  }).join('') || '<tr><td colspan="5" class="hint">尚無訂單</td></tr>';
}
