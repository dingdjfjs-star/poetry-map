/* =====================================================================
 * 诗词地图 · 前端交互
 * 点击点位 → 全诗 + 注释 + 地名考释 + 诗人游历路线；
 * 水墨离线底图（经纬网 + 概化长江黄河水系 + 地域题字），可切 Esri 暗色 / OSM 街道。
 * ===================================================================== */
'use strict';
const D = window.SHICI_MAP_DATA;
const poemById = new Map(D.poems.map(p => [p.id, p]));
const placeById = new Map(D.places.map(p => [p.id, p]));
const routeByName = new Map(D.routes.map(r => [r.name, r]));

const FLAG_TXT = { corrected: '修正', debated: '存疑', region: '示意', 'ambiguous-default': '默认裁决', pinned: '补钉' };
const state = { poemId: null, placeId: null, poetId: null, dynasty: '全部', kw: '', debOnly: false };

/* ---------------- 地图初始化 ---------------- */
const map = L.map('map', { zoomSnap: 0.5, attributionControl: false, zoomControl: true, preferCanvas: false });
L.control.attribution({ prefix: false, position: 'bottomright' }).addAttribution('诗词地图 · 地名坐标为人工考订近似值').addTo(map);

const tiles = {
  dark: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 17 }),
  osm: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 })
};

/* 水墨图层：经纬网 + 概化水系 + 地域题字（离线可用） */
const RIVERS = [
  { name: '黄河', label: [40.9, 109.2], pts: [[35.9, 96.5], [36.1, 99.5], [35.9, 101.8], [36.5, 103.2], [36.06, 103.8], [37.4, 105.0], [39.0, 106.5], [40.4, 108.0], [40.5, 110.0], [39.6, 111.5], [38.5, 110.4], [37.0, 110.5], [35.6, 110.3], [34.8, 110.4], [34.9, 111.5], [35.2, 113.0], [34.9, 113.6], [35.2, 114.5], [35.9, 115.9], [37.0, 117.9], [37.8, 118.9]] },
  { name: '长江', label: [29.4, 113.3], pts: [[33.4, 91.0], [32.5, 97.0], [31.5, 98.5], [30.0, 99.5], [28.6, 101.0], [28.8, 103.5], [28.77, 104.6], [29.3, 105.5], [29.6, 106.55], [30.3, 107.9], [30.8, 108.4], [31.0, 109.55], [30.9, 110.6], [30.7, 111.3], [30.5, 112.2], [29.9, 113.2], [29.71, 116.0], [30.0, 117.0], [31.3, 117.3], [31.7, 118.5], [32.05, 118.75], [32.2, 119.45], [31.9, 120.3], [31.4, 120.7], [31.4, 121.3], [31.3, 121.9]] },
  { name: '珠江', label: [22.85, 112.9], pts: [[23.5, 112.8], [23.1, 113.3], [22.9, 113.55], [22.4, 113.6]] },
  { name: '淮河', label: [32.75, 115.8], pts: [[32.5, 112.5], [32.6, 114.0], [32.9, 116.5], [33.0, 118.5], [33.3, 120.2]] }
];
const REGIONS = [
  ['西域', 83.0, 40.0], ['塞北', 108.0, 42.8], ['陇右', 104.2, 36.2], ['关中', 109.9, 33.3],
  ['河东', 111.6, 36.9], ['中原', 114.8, 35.9], ['齐鲁', 117.9, 36.6], ['幽燕', 117.2, 41.0],
  ['巴蜀', 103.4, 29.7], ['荆楚', 111.9, 30.7], ['江淮', 118.6, 32.7], ['吴越', 121.3, 31.1],
  ['江西', 115.6, 27.6], ['潇湘', 111.6, 27.0], ['岭南', 112.6, 23.4], ['黔中', 107.4, 27.4],
  ['吐蕃', 88.0, 31.0], ['辽东', 123.8, 41.6]
];
const inkLayer = L.layerGroup();
(function buildInk() {
  for (let lng = 80; lng <= 130; lng += 10) inkLayer.addLayer(L.polyline([[18, lng], [54, lng]], { className: 'grat-line', interactive: false }));
  for (let lat = 20; lat <= 50; lat += 10) inkLayer.addLayer(L.polyline([[lat, 74], [lat, 136]], { className: 'grat-line', interactive: false }));
  for (const r of RIVERS) {
    inkLayer.addLayer(L.polyline(r.pts, { className: 'river', interactive: false }));
    inkLayer.addLayer(L.marker(r.label, { interactive: false, icon: L.divIcon({ className: '', html: `<div class="river-label">${r.name}</div>`, iconSize: [0, 0] }) }));
  }
  for (const [n, lat, lng] of REGIONS) inkLayer.addLayer(L.marker([lat, lng], { interactive: false, icon: L.divIcon({ className: '', html: `<div class="region-label">${n}</div>`, iconSize: [0, 0] }) }));
})();

let markers = new Map(); // placeId -> marker
const markerLayer = L.layerGroup().addTo(map);
const routeLayer = L.layerGroup().addTo(map);

function renderMarkers(list) {
  markerLayer.clearLayers(); markers.clear();
  for (const pl of list) {
    const cnt = pl.poems.length;
    const html = `<div class="pm${pl.debated ? ' deb' : ''}${cnt >= 3 ? ' hot' : ''}" data-id="${pl.id}">
      <span class="dot"></span>${cnt > 1 ? `<span class="cnt">${cnt}</span>` : ''}<span class="lbl">${pl.name}</span></div>`;
    const mk = L.marker([pl.lat, pl.lng], { icon: L.divIcon({ className: '', html, iconSize: [0, 0] }), riseOnHover: true, zIndexOffset: pl.debated ? 200 : 0 });
    mk.on('click', () => openPlace(pl.id));
    mk.bindTooltip(`${pl.name} · ${pl.modern}${cnt > 1 ? `（${cnt} 首）` : ''}`, { direction: 'top', offset: [0, -6], opacity: 0.9 });
    markerLayer.addLayer(mk);
    markers.set(pl.id, mk);
  }
}

function setBasemap(kind) {
  document.getElementById('map').classList.remove('darkmode');
  Object.values(tiles).forEach(t => map.removeLayer(t));
  if (kind === 'ink') { map.addLayer(inkLayer); document.getElementById('map').classList.add('ink'); }
  else {
    map.removeLayer(inkLayer);
    document.getElementById('map').classList.remove('ink');
    map.addLayer(tiles[kind]);
    if (kind === 'dark') document.getElementById('map').classList.add('darkmode');
  }
  document.querySelectorAll('#basemapSeg button').forEach(b => b.classList.toggle('on', b.dataset.bm === kind));
}
document.getElementById('basemapSeg').addEventListener('click', e => {
  const b = e.target.closest('button'); if (b) setBasemap(b.dataset.bm);
});

map.on('zoomend', () => document.getElementById('map').classList.toggle('zoom-low', map.getZoom() < 5));

/* ---------------- 侧栏：筛选与列表 ---------------- */
const dynasties = ['全部', ...new Set(D.poems.map(p => p.dynasty))];
const chipBox = document.getElementById('dynastyChips');
chipBox.innerHTML = dynasties.map(d => `<button class="chip${d === '全部' ? ' on' : ''}" data-d="${d}">${d}</button>`).join('');
chipBox.addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  state.dynasty = b.dataset.d;
  chipBox.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b));
  renderList();
});

const poetSel = document.getElementById('poetSel');
D.routes.slice().sort((a, b) => a.dynasty.localeCompare(b.dynasty) || a.name.localeCompare(b.name, 'zh'))
  .forEach(r => poetSel.insertAdjacentHTML('beforeend', `<option value="${r.id}">${r.name}（${r.stops.length} 站）</option>`));
poetSel.addEventListener('change', () => { state.poetId = poetSel.value || null; drawRoute(); });
document.getElementById('btnClearRoute').addEventListener('click', () => { state.poetId = null; poetSel.value = ''; drawRoute(); });

document.getElementById('debOnly').addEventListener('change', e => { state.debOnly = e.target.checked; renderList(); });

document.getElementById('search').addEventListener('input', e => { state.kw = e.target.value.trim(); renderList(); });

function filteredPoems() {
  const kw = state.kw;
  return D.poems.filter(p => {
    if (state.dynasty !== '全部' && p.dynasty !== state.dynasty) return false;
    if (state.debOnly && !p.places.some(x => placeById.get(x.entryId).debated)) return false;
    if (!kw) return true;
    if (p.title.includes(kw) || p.author.includes(kw) || p.dynasty.includes(kw)) return true;
    if (p.places.some(x => { const pl = placeById.get(x.entryId); return pl.name.includes(kw) || pl.modern.includes(kw) || x.alias.includes(kw); })) return true;
    if (p.text.join('').includes(kw)) return true;
    return false;
  });
}

function poemFlags(p) {
  const f = [];
  if (p.places.some(x => x.flags.includes('debated'))) f.push('存疑');
  if (p.places.some(x => x.flags.includes('corrected'))) f.push('已纠错');
  if (p.places.some(x => x.flags.includes('pinned'))) f.push('补钉');
  return f;
}

function renderList() {
  const list = filteredPoems();
  const ul = document.getElementById('poemList');
  document.getElementById('listCount').textContent = `${list.length} / ${D.poems.length} 首`;
  if (!list.length) { ul.innerHTML = '<li class="nores">未检得。试试「扬州」「李白」或「巴山」。</li>'; return; }
  ul.innerHTML = list.map(p => {
    const names = p.places.slice(0, 3).map(x => placeById.get(x.entryId).name.replace(/（.*?）/g, ''));
    const f = poemFlags(p);
    return `<li data-id="${p.id}" class="${p.id === state.poemId ? 'on' : ''}">
      <div class="t"><b>《${p.title}》</b></div>
      <div class="m"><span>${p.author} · ${p.dynasty}</span><span class="pn">${names.join(' · ')}${p.places.length > 3 ? ' …' : ''}</span>
      ${f.map(x => `<span class="flag">${x}</span>`).join('')}</div></li>`;
  }).join('');
}
document.getElementById('poemList').addEventListener('click', e => {
  const li = e.target.closest('li[data-id]'); if (li) openPoem(li.dataset.id, { fly: true });
});
document.getElementById('poemList').addEventListener('mouseover', e => {
  const li = e.target.closest('li[data-id]'); if (!li) return;
  const p = poemById.get(li.dataset.id);
  if (p && p.places[0]) markers.get(p.places[0].entryId)?.getElement()?.classList.add('sel');
});
document.getElementById('poemList').addEventListener('mouseout', () => {
  markers.forEach(mk => { if (mk._el && !mk._el.dataset.sel) mk.getElement()?.classList.remove('sel'); });
});

/* ---------------- 详情面板 ---------------- */
const detail = document.getElementById('detail');
document.getElementById('detailClose').addEventListener('click', () => { detail.classList.add('hidden'); state.poemId = null; markListOn(); });

function highlightLine(line, places) {
  const items = places.filter(x => !x.inTitle && x.lineIdx >= 0 && x.alias !== '（系年补钉）')
    .map(x => ({ alias: x.alias, entryId: x.entryId, flags: x.flags })).sort((a, b) => b.alias.length - a.alias.length);
  let out = line, done = [];
  for (const it of items) {
    let idx;
    while ((idx = out.indexOf(it.alias)) >= 0 && !done.some(([s, e]) => idx < e && idx + it.alias.length > s)) {
      const isPin = it.flags.includes('pinned');
      out = out.slice(0, idx) + `<a class="pl${isPin ? ' pin' : ''}" data-entry="${it.entryId}">${it.alias}</a>` + out.slice(idx + it.alias.length);
      done.push([idx, idx + it.alias.length + 60]); // 粗略区间（含标签偏移）
      break;
    }
  }
  return out;
}

function chipHtml(x) {
  const pl = placeById.get(x.entryId);
  const fgs = x.flags.map(f => FLAG_TXT[f] ? `<span class="fg">${FLAG_TXT[f]}</span>` : '').join('');
  return `<span class="pchip" data-entry="${x.entryId}">${pl.name}<small>·${pl.modern}</small>${fgs}</span>`;
}

function openPoem(id, opts = {}) {
  const p = poemById.get(id);
  state.poemId = id; state.placeId = null;
  const poet = routeByName.get(p.author);
  const body = document.getElementById('detailBody');
  const lines = (p.text || []).map((t, i) => {
    const pl = p.places.filter(x => x.lineIdx === i);
    return `<span class="ln">${pl.length ? highlightLine(t, pl) : t}</span>`;
  }).join('');
  const fixes = p.places.filter(x => x.fixNote);
  body.innerHTML = `
    <div class="d-form">${p.dynasty} · ${p.form} · 置信度 ${Math.min(...p.places.map(x => x.confidence)).toFixed(2)}</div>
    <div class="d-title">${p.title}</div>
    <div class="d-author"><b>${p.author}</b> · ${p.dynasty}</div>
    <div class="d-context">${p.context}</div>
    <div class="d-text">${lines}</div>
    <div class="d-sec">诗中地名（${p.places.length}）</div>
    <div class="d-places">${p.places.map(chipHtml).join('')}</div>
    ${fixes.map(f => `<div class="d-fix">◉ 考辨：${f.fixNote}</div>`).join('')}
    <div class="d-sec">注释</div>
    <ul class="d-notes">${p.notes.map(n => `<li>${n}</li>`).join('')}</ul>
    ${poet ? `<button class="d-route-btn" id="btnRoute">◎ ${p.author}游历路线 · ${poet.stops.length} 站（自 ${poet.stops[0].year} 年）</button>`
           : '<button class="d-route-btn" disabled>该诗人暂未收录游历路线</button>'}
  `;
  body.querySelector('#btnRoute')?.addEventListener('click', () => {
    const r = D.routes.find(x => x.name === p.author);
    if (r) { state.poetId = r.id; poetSel.value = r.id; drawRoute(); }
  });
  body.querySelectorAll('.pchip').forEach(el => el.addEventListener('click', () => focusPlace(el.dataset.entry)));
  body.querySelectorAll('.pl').forEach(el => el.addEventListener('click', () => focusPlace(el.dataset.entry)));
  detail.classList.remove('hidden');
  markListOn();
  if (opts.fly) {
    const first = p.places[0] && placeById.get(p.places[0].entryId);
    if (first) focusPlace(first.id, { noDetail: true });
  }
  // 自动联动诗人路线
  const r = poet ? D.routes.find(x => x.name === p.author) : null;
  state.poetId = r ? r.id : null;
  poetSel.value = state.poetId || '';
  drawRoute();
}

function openPlace(placeId) {
  const pl = placeById.get(placeId);
  state.placeId = placeId;
  focusPlace(placeId, { noDetail: true });
  const body = document.getElementById('detailBody');
  if (pl.poems.length === 1) { openPoem(pl.poems[0]); return; }
  state.poemId = null;
  body.innerHTML = `
    <div class="d-form">${pl.debated ? '存疑点位 · ' : ''}${pl.poems.length} 首诗词</div>
    <div class="d-title">${pl.name}</div>
    <div class="d-author">今属 ${pl.modern}</div>
    ${pl.note ? `<div class="d-context">${pl.note}</div>` : ''}
    <div class="d-sec">此处题咏（点击读诗）</div>
    <div class="place-poems">${pl.poems.map(pid => {
      const p = poemById.get(pid);
      return `<div class="pp" data-id="${pid}"><b>《${p.title}》</b><span>${p.author} · ${p.dynasty} · ${p.form}</span></div>`;
    }).join('')}</div>`;
  body.querySelectorAll('.pp').forEach(el => el.addEventListener('click', () => openPoem(el.dataset.id)));
  detail.classList.remove('hidden');
  markListOn();
}

function focusPlace(placeId, opts = {}) {
  const pl = placeById.get(placeId);
  if (!pl) return;
  const z = Math.max(map.getZoom(), 6);
  map.flyTo([pl.lat, pl.lng], Math.min(z, 8), { duration: 0.8 });
  markers.forEach((mk, pid) => {
    const el = mk.getElement(); if (!el) return;
    const div = el.querySelector('.pm'); if (!div) return;
    div.classList.toggle('sel', pid === placeId);
  });
  if (!opts.noDetail) { /* 预留：无 */ }
}

function markListOn() {
  document.querySelectorAll('#poemList li').forEach(li => li.classList.toggle('on', li.dataset.id === state.poemId));
}

/* ---------------- 诗人路线 ---------------- */
function drawRoute() {
  routeLayer.clearLayers();
  document.getElementById('routeCard').classList.add('hidden');
  if (!state.poetId) return;
  const r = D.routes.find(x => x.id === state.poetId);
  if (!r) return;
  const ll = r.stops.map(s => [s.lat, s.lng]);
  routeLayer.addLayer(L.polyline(ll, { className: 'route-line' }));
  r.stops.forEach((s, i) => {
    const mk = L.marker([s.lat, s.lng], {
      icon: L.divIcon({ className: '', html: `<div class="stop-mk"><div class="n">${i + 1}</div><div class="y">${s.year}</div></div>`, iconSize: [0, 0] }),
      zIndexOffset: 500
    });
    mk.bindPopup(`<div class="stop-pop"><span class="yy">${s.year} 年</span><br><b>${i + 1}. ${s.name}</b><br>${s.label}</div>`, { closeButton: false, offset: [0, 4] });
    mk.on('click', () => { renderRouteCard(r, i); });
    routeLayer.addLayer(mk);
  });
  renderRouteCard(r, -1);
  map.flyToBounds(L.latLngBounds(ll).pad(0.18), { duration: 0.9, maxZoom: 6 });
}

function renderRouteCard(r, activeIdx) {
  const body = document.getElementById('routeBody');
  body.innerHTML = `
    <div class="r-name">◎ <b>${r.name}</b> 游历路线</div>
    <div class="r-desc">${r.desc || ''}（${r.stops.length} 站，据通行生平资料简绘，点击条目定位）</div>
    ${r.stops.map((s, i) => `<div class="stop-item" data-i="${i}">
      <span class="no">${i + 1}</span>
      <span class="tx"><b>${s.name}</b><span class="yy">${s.year}</span><p>${s.label}</p></span></div>`).join('')}`;
  body.querySelectorAll('.stop-item').forEach(el => el.addEventListener('click', () => {
    const s = r.stops[+el.dataset.i];
    map.flyTo([s.lat, s.lng], Math.max(map.getZoom(), 7), { duration: 0.8 });
  }));
  document.getElementById('routeCard').classList.remove('hidden');
}
document.getElementById('routeClose').addEventListener('click', () => document.getElementById('routeCard').classList.add('hidden'));

/* ---------------- 核查台 ---------------- */
document.getElementById('btnAudit').addEventListener('click', renderAudit);
document.getElementById('auditClose').addEventListener('click', () => document.getElementById('auditModal').classList.add('hidden'));
document.getElementById('auditModal').addEventListener('click', e => { if (e.target.id === 'auditModal') e.currentTarget.classList.add('hidden'); });

function renderAudit() {
  const a = D.audit;
  const sec = (title, rows, cls = 'fix') => rows.length ? `<div class="a-sec"><h3>${title}<small>${rows.length} 项</small></h3>${rows.map(i =>
    `<div class="a-row ${cls}"><span class="lnk" data-poem="${i.poemId}">${i.poem}</span> · 「${i.alias}」 <span class="why">${i.detail}</span></div>`).join('')}</div>` : '';
  const debated = D.places.filter(p => p.debated);
  const cands = a.filter(i => i.type === 'candidate');
  const errs = a.filter(i => i.severity === 'error');
  document.getElementById('auditStats').textContent =
    `命中 ${D.counts.matches} 处 · 落点 ${D.counts.places} · 修正 ${D.counts.fixes} · 存疑 ${D.counts.debated} · 示意 ${D.counts.regions} · 错误 ${D.counts.errors}`;
  document.getElementById('auditBody').innerHTML = `
    <div class="a-tip">地名由 <b>tools/build.js</b> 自动识别（题名 + 诗句扫描地名库 ${' '}条目与别名 → 地理编码），下列为全部人工排查记录：
    ① 同名异地纠错 ② 虚写/用典排除 ③ 据系年补钉 ④ 同名歧义默认裁决 ⑤ 存疑地名考辨 ⑥ 未收录候选。点击诗题可跳转验证。</div>
    ${sec('① 同名异地纠错（重定向）', a.filter(i => i.type === 'redirect'))}
    ${sec('② 虚写 / 用典排除（不落点）', a.filter(i => i.type === 'excluded'))}
    ${sec('③ 系年补钉（诗不点名，据背景落点）', a.filter(i => i.type === 'pinned'))}
    ${sec('④ 同名歧义 · 默认裁决', a.filter(i => i.type === 'ambiguous'), 'warn')}
    <div class="a-sec"><h3>⑤ 存疑地名考辨<small>${debated.length} 处</small></h3>
      ${debated.map(p => `<div class="a-row warn"><span class="lnk" data-place="${p.id}">${p.name}</span>（今拟：${p.modern}） <span class="why">${p.note}</span></div>`).join('')}</div>
    ${sec('⑥ 未收录地名候选（后缀启发式）', cands, 'warn')}
    ${errs.length ? sec('⑦ 数据错误', errs, 'err') : ''}
  `;
  document.querySelectorAll('#auditBody .lnk[data-poem]').forEach(el =>
    el.addEventListener('click', () => { document.getElementById('auditModal').classList.add('hidden'); openPoem(el.dataset.poem, { fly: true }); }));
  document.querySelectorAll('#auditBody .lnk[data-place]').forEach(el =>
    el.addEventListener('click', () => { document.getElementById('auditModal').classList.add('hidden'); focusPlace(el.dataset.place); }));
  document.getElementById('auditModal').classList.remove('hidden');
}

/* ---------------- 全域 / 统计 / 启动 ---------------- */
document.getElementById('btnFit').addEventListener('click', () => {
  map.flyToBounds(L.latLngBounds(D.places.map(p => [p.lat, p.lng])).pad(0.06), { duration: 0.9, maxZoom: 6 });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('auditModal').classList.add('hidden');
    detail.classList.add('hidden');
    document.getElementById('routeCard').classList.add('hidden');
  }
});

(function init() {
  document.getElementById('stats').innerHTML =
    `<b>${D.counts.poems}</b> 首诗 · <b>${D.counts.places}</b> 处地名 · <b>${D.counts.poets}</b> 位诗人 · <b>${D.counts.routes}</b> 条游历路线 · 修正 <b>${D.counts.fixes}</b> 项`;
  setBasemap('ink');
  renderMarkers(D.places);
  renderList();
  // 固定初始视野（避免依赖首帧容器量测的竞态），"全域"按钮可再全图 fitBounds
  map.setView([34.6, 110], 4.5);
  if (map.getZoom() < 5) document.getElementById('map').classList.add('zoom-low');
  // 布局稳定后校准地图尺寸，窗口变化时同步
  requestAnimationFrame(() => map.invalidateSize());
  window.addEventListener('resize', () => map.invalidateSize());
  window.addEventListener('load', () => map.invalidateSize());
})();
