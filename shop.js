// 共用資料（localStorage）
const DB = {
  key: 'vendoshop-db-v1',
  load(){
    const raw = localStorage.getItem(this.key);
    if(!raw){
      const seed = seedData();
      localStorage.setItem(this.key, JSON.stringify(seed));
      return seed;
    }
    try{ return JSON.parse(raw) }catch{
      const seed = seedData();
      localStorage.setItem(this.key, JSON.stringify(seed));
      return seed;
    }
  },
  save(data){ localStorage.setItem(this.key, JSON.stringify(data)) }
};

function seedData(){
  const cats = [
    { id:'drinks', name:'Drinks 飲品', icon:'🥤' },
    { id:'snacks', name:'Snacks 零食', icon:'🍫' },
    { id:'gadgets', name:'Gadgets 小物', icon:'⚙️' },
    { id:'home',   name:'Home 居家',   icon:'🏠' },
  ];
  const products = [
    p('氣泡水',45,'drinks','A1',10,'🥤'),
    p('冷萃咖啡',65,'drinks','A2',8,'☕'),
    p('運動飲料',55,'drinks','A3',9,'🧃'),
    p('綠茶',40,'drinks','A4',12,'🍵'),
    p('洋芋片',35,'snacks','B1',15,'🍟'),
    p('巧克力棒',30,'snacks','B2',14,'🍫'),
    p('堅果包',50,'snacks','B3',10,'🥜'),
    p('餅乾',28,'snacks','B4',20,'🍪'),
    p('Type-C 線',120,'gadgets','C1',7,'🔌'),
    p('行動電源',650,'gadgets','C2',5,'🔋'),
    p('藍牙耳機',990,'gadgets','C3',3,'🎧'),
    p('手機支架',150,'gadgets','C4',9,'📱'),
    p('護手霜',120,'home','D1',11,'🧴'),
    p('香氛蠟燭',280,'home','D2',6,'🕯️'),
    p('濕紙巾',45,'home','D3',16,'🧻'),
    p('清潔布',60,'home','D4',10,'🧼'),
  ];
  return { cats, products, orders: [] };

  function p(name, price, cat, slot, stock, emoji){
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : (Date.now()+Math.random()).toString(36),
      name, price, cat, slot, stock, img: buildSVG(emoji, name)
    };
  }
}

function buildSVG(emoji, label){
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='512' height='384'>
      <defs><linearGradient id='g' x1='0' x2='0' y1='0' y2='1'>
        <stop offset='0%' stop-color='#14234f'/>
        <stop offset='100%' stop-color='#0c1739'/>
      </linearGradient></defs>
      <rect width='100%' height='100%' rx='28' fill='url(#g)'/>
      <circle cx='420' cy='-20' r='180' fill='rgba(80,214,255,0.25)'/>
      <text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' font-size='140'>${emoji}</text>
      <text x='50%' y='76%' dominant-baseline='middle' text-anchor='middle' fill='#b8d4ff' font-family='sans-serif' font-size='28'>${label}</text>
    </svg>
  `;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}
