/* =====================================================================
 * 诗词地图 · 批量导入 + 地名识别 + 地理编码 + 排查报告 构建脚本
 * ---------------------------------------------------------------------
 * 流程：读源数据（诗词/地名库/路线/人工修正）→
 *       ① 识别：在题名与诗句中扫描地名库条目名+别名（最长优先、去重叠）
 *       ② 消歧：同名多条目时按 redirects / defaultFor / 人工裁决
 *       ③ 编码：命中条目 → 坐标打点，置信度与旗标（存疑/示意/修正…）
 *       ④ 后缀启发式：扫出未收录地名候选，供人工增补
 *       ⑤ 输出：data/data.js（页面数据）+ report/核查报告.md
 * 用法：node tools/build.js
 * ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const gaz = require(path.join(ROOT, 'data/gazetteer.js'));
const poems = require(path.join(ROOT, 'data/poems.source.js'));
const routes = require(path.join(ROOT, 'data/routes.js'));
const fixes = require(path.join(ROOT, 'data/fixes.js'));

/* ---------- ① 别名索引 ---------- */
const byId = new Map(gaz.map(e => [e.id, e]));
const aliasIndex = new Map(); // alias -> [entryId]
for (const e of gaz) {
  for (const a of [e.name, ...(e.alias || [])]) {
    if (!a || a.length < 2) continue;
    if (!aliasIndex.has(a)) aliasIndex.set(a, []);
    aliasIndex.get(a).push(e.id);
  }
}

/* ---------- ② 后缀启发式停用词（高频非地名） ---------- */
const SUFFIX = /[山江河湖水州城村关寺楼亭台桥峡津浦渡滩原川岭矶峰潭泉溪宫阁岛洲塔陵]/;
const NOISE = '不未有在过到见望出入登上下似如满尽断生结落挂飞流垂遍连含成作起收还又更且将欲会能自相两' +
  '之一二三四五六七八九十百千万亿数几谁何此其之以而为与非无未已知是闻吾我君卿客行平碧春残孤寒清空旧古新深斜烟雨云雪月风花秋日夜' +
  '天中前后东西南北高低远近大小多少重游题呈饮与争野冻吹惊卧对痴寻步醉倦悔恨愁思忆梦隔恰犹都赢得魄壮随依绕吟笑看'
  + '重当关青分满和声衫船身嘶时层海名回塞众破洒山江村京朱酹色池冰里转歌波银板阳渡岩水楼溪外临津露蘋闲枫九脉怜镜阴沉画拂河妆长归阔零凰惟';
/* 已知候选的审读意见（人工研判结果，进入报告） */
const CANDIDATE_NOTES = {
  '长河': '学界有黄河/黑河诸说，存辨不落点', '淮水': '此处指秦淮河，已由金陵点位覆盖',
  '云梦泽': '古泽已湮，泛称', '楚江': '长江楚地段泛称', '楚天': '泛称', '楚山': '泛指江南江北之山',
  '江东': '泛称（项羽吴中/吴地），由乌江亭等点位承担', '三秦': '泛称关中',
  '瀛洲': '虚构仙山，不落点', '赤城': '可考虑收录赤城山（天台）', '天街': '即长安朱雀大街，由长安覆盖',
  '春风十里': '杜牧咏扬州语，可加作扬州别名', '神州': '泛称中国', '中原': '泛称',
  '琼楼': '虚拟月宫', '瑶台': '虚拟月宫',
  '巫山': '可考虑收录巫山', '雪山': '指祁连山，泛称不落点', '碧溪': '姜尚磻溪垂钓之典，不落点',
  '瘴江': '泛指岭南江河，不落点', '烟波江': '泛指江上烟波，不落点',
  '贾亭': '贾公亭（唐贞元间贾全建），今已不存，不落点', '北贾亭': '贾公亭，今已不存，不落点',
  '千寻塔': '飞来峰之塔，由飞来峰点位覆盖', '孤山': '孤山寺已单独收录', '香山': '洛阳龙门香山寺可考虑收录',
  '长亭': '泛指送别长亭，不落点', '南浦': '南昌南浦，由滕王阁覆盖', '西山': '南昌西山，泛称',
  '青枫浦': '泛指水滨（双枫成浦），不落点', '清江': '赣江上游，由郁孤台覆盖', '重湖': '西湖里外湖，由西湖覆盖',
  '三吴': '吴兴吴郡会稽泛称', '鱼梁': '襄阳鱼梁洲，可考虑收录', '造口': '万安造口驿近惶恐滩，可考虑收录',
  '汀洲': '泛称水洲', '秦苑': '咸阳秦故苑，由咸阳覆盖', '汉宫': '泛称汉家宫阙，由长安/咸阳覆盖',
  '潮水': '泛指江潮，不落点', '渭水': '渭河绕咸阳东流，由渭城/咸阳一带覆盖', '武陵': '武陵郡（常德），虚指桃源，可考虑收录',
  '秦楼': '萧史弄玉凤台之典，指闺楼，不落点'
};

/* ---------- ③ 文本扫描 ---------- */
function scanText(text) {
  const found = [];
  for (const [alias, ids] of aliasIndex) {
    let from = 0;
    for (;;) {
      const i = text.indexOf(alias, from);
      if (i < 0) break;
      found.push({ alias, i, len: alias.length, ids });
      from = i + 1;
    }
  }
  return found;
}

/* 最长优先 + 去重叠 */
function dedupe(found) {
  const sorted = found.slice().sort((a, b) => a.i - b.i || b.len - a.len);
  const out = [];
  let lastEnd = -1;
  for (const m of sorted) {
    if (m.i >= lastEnd) { out.push(m); lastEnd = m.i + m.len; }
  }
  return out;
}

/* 后缀启发式：在未被命中的文本段里找"XX+地理后缀"的候选（人工研判用）。
 * 已有人工审读意见的词（CANDIDATE_NOTES）全量直扫；其余按后缀位取 1 字前缀，
 * 前缀字为虚词/数词/动词者视为噪声丢弃。 */
function heuristicCandidates(text, covered) {
  const cands = [];
  const seenTok = new Set();
  const push = token => { if (!seenTok.has(token)) { seenTok.add(token); cands.push({ token }); } };
  const segs = [];
  let cursor = 0;
  for (const [s, e] of covered.slice().sort((a, b) => a[0] - b[0])) {
    if (s > cursor) segs.push([cursor, s]);
    cursor = Math.max(cursor, e);
  }
  if (cursor < text.length) segs.push([cursor, text.length]);
  for (const [a, b] of segs) {
    const str = text.slice(a, b);
    const pos = [];
    const S = /[山江河湖水州城村关寺楼亭台桥峡津浦渡滩原川岭矶峰潭泉溪宫阁岛洲塔陵泽]/g;
    let m;
    while ((m = S.exec(str))) pos.push(m.index);
    for (const p of pos) {
      for (const k of [1, 2]) {
        const token = str.slice(p - k, p + 1);
        if (!/^[\u4e00-\u9fa5]{2,3}$/.test(token)) continue;
        if (CANDIDATE_NOTES[token]) { push(token); continue; }
        if (k !== 1) continue;
        if (aliasIndex.has(token)) continue;
        if (!NOISE.includes(token[0])) push(token);
      }
    }
    for (const key of Object.keys(CANDIDATE_NOTES)) {
      if (str.includes(key)) push(key);
    }
  }
  return cands;
}

/* ---------- ④ 主流程 ---------- */
const issues = [];
function issue(type, severity, o) { issues.push({ type, severity, ...o }); }

const outPoems = [];
const placeAgg = new Map(); // entryId -> {entry, poems:Set, routeStops:Set}
for (const p of poems) {
  const fr = fixes.redirects[p.id] || {};
  const ex = fixes.excludes[p.id] || {};
  const pins = fixes.pins[p.id] || [];
  // 强制匹配：重定向别名若不在任何条目中（如"山东"），也纳入扫描
  const forceAliases = Object.keys(fr).filter(a => !aliasIndex.has(a));

  const matched = [];       // 输出的地名匹配
  const covered = [];       // 已被命中的区间（防重复/供启发式）
  const seen = new Set();   // entryId 去重
  const logged = new Set(); // 同一诗同一别名的审读意见只记一次
  const once = (type, severity, o) => {
    const k = `${type}:${o.alias}`;
    if (logged.has(k)) return;
    logged.add(k); issue(type, severity, o);
  };

  const scan = (text, inTitle) => {
    const found = scanText(text).slice();
    for (const a of forceAliases) { // 强制匹配别名（如"山东"）
      let from = 0;
      for (;;) { const i = text.indexOf(a, from); if (i < 0) break; found.push({ alias: a, i, len: a.length, ids: null }); from = i + 1; }
    }
    for (const m of dedupe(found)) {
      covered.push([m.i, m.i + m.len]);
      let entryId = null, flags = [], fixNote = null;
      if (ex[m.alias]) { // 人工排除
        once('excluded', 'fix', { poemId: p.id, poem: `${p.title}`, alias: m.alias, detail: ex[m.alias] });
        continue;
      }
      if (fr[m.alias]) { // 人工重定向（含强制匹配别名）
        entryId = fr[m.alias].e; fixNote = fr[m.alias].reason;
        flags.push('corrected');
        const orig = m.ids ? m.ids.map(i => byId.get(i).name).join('/') : m.alias;
        once('redirect', 'fix', { poemId: p.id, poem: `${p.title}`, alias: m.alias, detail: `原候选[${orig}] → ${byId.get(entryId).name}；${fixNote}` });
      } else if (m.ids === null) { continue; } else if (m.ids.length > 1) { // 同名歧义
        const d = m.ids.find(id => (byId.get(id).defaultFor || []).includes(m.alias));
        if (d) { entryId = d; flags.push('ambiguous-default'); once('ambiguous', 'warn', { poemId: p.id, poem: `${p.title}`, alias: m.alias, detail: `歧义命中[${m.ids.map(i => byId.get(i).name).join('/')}]，取默认：${byId.get(d).name}（${byId.get(d).note || ''}）` }); }
        else { issue('ambiguity-unresolved', 'error', { poemId: p.id, poem: `${p.title}`, alias: m.alias, detail: `歧义未决[${m.ids.map(i => byId.get(i).name).join('/')}]，未落点，需人工在 fixes.js 裁决` }); continue; }
      } else entryId = m.ids[0];

      const e = byId.get(entryId);
      if (!e) { issue('bad-entry', 'error', { poemId: p.id, poem: p.title, alias: m.alias, detail: `条目不存在：${entryId}` }); continue; }
      if (seen.has(entryId)) continue;
      seen.add(entryId);
      if (e.debated) flags.push('debated');
      if (e.region) flags.push('region');
      let conf = (e.name === m.alias || (e.alias || []).includes(m.alias)) && e.name === m.alias ? 1.0 : 0.9;
      if (inTitle) conf = Math.min(conf, 0.85);
      if (e.region) conf = Math.min(conf, 0.7);
      if (flags.includes('ambiguous-default')) conf = Math.min(conf, 0.8);
      const line = inTitle ? p.title : (p.text || []).find(t => t.includes(m.alias)) || '';
      const rec = { entryId, alias: m.alias, inTitle, lineIdx: inTitle ? -1 : (p.text || []).findIndex(t => t.includes(m.alias)), confidence: +conf.toFixed(2), flags, fixNote };
      matched.push(rec);
      if (!placeAgg.has(entryId)) placeAgg.set(entryId, { entry: e, poems: new Set() });
      placeAgg.get(entryId).poems.add(p.id);
    }
  };
  scan(p.title, true);
  for (const t of (p.text || [])) scan(t, false);

  for (const pin of pins) {
    const e = byId.get(pin.e);
    if (!e) { issue('bad-pin', 'error', { poemId: p.id, poem: p.title, alias: '', detail: `pin 条目不存在：${pin.e}` }); continue; }
    if (seen.has(pin.e)) continue;
    seen.add(pin.e);
    const flags = ['pinned'].concat(e.debated ? ['debated'] : []).concat(e.region ? ['region'] : []);
    matched.push({ entryId: pin.e, alias: '（系年补钉）', inTitle: false, lineIdx: -1, confidence: 1.0, flags, fixNote: pin.reason });
    issue('pinned', 'fix', { poemId: p.id, poem: p.title, alias: byId.get(pin.e).name, detail: pin.reason });
    if (!placeAgg.has(pin.e)) placeAgg.set(pin.e, { entry: e, poems: new Set() });
    placeAgg.get(pin.e).poems.add(p.id);
  }

  // 候选未收录（启发式）
  const candSeen = new Set();
  const cands = [];
  for (const t of [p.title, ...(p.text || [])]) {
    for (const c of heuristicCandidates(t, covered)) {
      if (candSeen.has(c.token)) continue;
      candSeen.add(c.token);
      const note = CANDIDATE_NOTES[c.token] || '未收录，待人工研判';
      cands.push({ token: c.token, note });
      issue('candidate', 'info', { poemId: p.id, poem: p.title, alias: c.token, detail: note });
    }
  }

  outPoems.push({ id: p.id, title: p.title, author: p.author, dynasty: p.dynasty, form: p.form, context: p.context, text: p.text, notes: p.notes, places: matched, candidates: cands });
}

/* ---------- ⑤ 路线解析与校验 ---------- */
const outRoutes = [];
for (const r of routes) {
  const stops = r.stops.map((s, i) => {
    if (s.e) {
      const e = byId.get(s.e);
      if (!e) { issue('route-missing', 'error', { poemId: '-', poem: `${r.name} 路线第${i + 1}站`, alias: s.e, detail: '地名库中不存在该条目' }); return null; }
      if (placeAgg.has(s.e)) placeAgg.get(s.e).routeStops = true; else placeAgg.set(s.e, { entry: e, poems: new Set(), routeStops: true });
      return { name: e.name, lat: e.lat, lng: e.lng, year: s.year, label: s.label };
    }
    return { name: s.name, lat: s.lat, lng: s.lng, year: s.year, label: s.label };
  }).filter(Boolean);
  outRoutes.push({ id: r.id, name: r.name, dynasty: r.dynasty, desc: r.desc, stops });
}

/* ---------- ⑥ 输出 ---------- */
const outPlaces = [...placeAgg.entries()].map(([id, v]) => ({
  id, name: v.entry.name, lat: v.entry.lat, lng: v.entry.lng, modern: v.entry.modern,
  type: v.entry.type, note: v.entry.note || '', debated: !!v.entry.debated, region: !!v.entry.region,
  poems: [...v.poems], onRoute: !!v.routeStops
})).sort((a, b) => b.poems.length - a.poems.length);

const counts = {
  poems: outPoems.length,
  poets: new Set(outPoems.map(p => p.author)).size,
  places: outPlaces.length,
  routes: outRoutes.length,
  matches: outPoems.reduce((s, p) => s + p.places.length, 0),
  fixes: issues.filter(i => i.severity === 'fix').length,
  errors: issues.filter(i => i.severity === 'error').length,
  debated: outPlaces.filter(p => p.debated).length,
  regions: outPlaces.filter(p => p.region).length
};

const data = { generatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '), counts, places: outPlaces, poems: outPoems, routes: outRoutes, audit: issues };
const dataJs = `/* 本文件由 tools/build.js 自动生成，请勿手改 */\n(function(root){root.SHICI_MAP_DATA=${JSON.stringify(data)};})(typeof window!=='undefined'?window:globalThis);\n`;
fs.writeFileSync(path.join(ROOT, 'data/data.js'), dataJs, 'utf8');

/* ---------- ⑦ 核查报告 ---------- */
const grp = t => issues.filter(i => i.type === t);
const L = [];
L.push('# 诗词地图 · 地名匹配核查报告');
L.push('');
L.push(`> 生成于 ${data.generatedAt} · 数据：${counts.poems} 首诗 / ${counts.poets} 位诗人 / ${counts.places} 个落点 / ${counts.routes} 条诗人路线`);
L.push(`> 修正动作 **${counts.fixes}** 项（重定向+排除+补钉）· 错误 **${counts.errors}** · 存疑地名 **${counts.debated}** · 示意点 **${counts.regions}**`);
L.push('');
const sec = (title, arr) => {
  if (!arr.length) return;
  L.push(`## ${title}（${arr.length}）`);
  L.push('');
  L.push('| 诗词 | 地名 | 处置 / 说明 |');
  L.push('|---|---|---|');
  for (const i of arr) L.push(`| ${i.poem} | ${i.alias || '—'} | ${i.detail} |`);
  L.push('');
};
sec('① 人工重定向（同名异地纠错）', grp('redirect'));
sec('② 人工排除（虚写/泛称/用典不落点）', grp('excluded'));
sec('③ 系年补钉（诗不点名，据背景落点）', grp('pinned'));
sec('④ 同名歧义默认裁决', grp('ambiguous'));
const deb = outPlaces.filter(p => p.debated);
if (deb.length) {
  L.push(`## ⑤ 存疑地名（${deb.length}）`);
  L.push('');
  L.push('| 地名 | 今址（取说） | 考辨 |');
  L.push('|---|---|---|');
  for (const p of deb) L.push(`| ${p.name} | ${p.modern} | ${p.note} |`);
  L.push('');
}
sec('⑥ 候选未收录地名（后缀启发式，待人工增补）', grp('candidate'));
sec('⑦ 数据错误', grp('ambiguity-unresolved').concat(grp('bad-entry'), grp('bad-pin'), grp('route-missing')));
const noPlace = outPoems.filter(p => !p.places.length);
if (noPlace.length) { L.push(`## ⑧ 未落点诗词（${noPlace.length}）`); L.push(''); for (const p of noPlace) L.push(`- ${p.author}《${p.title}》`); L.push(''); }
fs.writeFileSync(path.join(ROOT, 'report/核查报告.md'), L.join('\n'), 'utf8');

console.log(`✔ build 完成：${counts.poems} 首诗 · ${counts.matches} 处地名命中 · ${counts.places} 个落点 · ${counts.fixes} 项人工修正 · ${counts.errors} 个错误`);
console.log('  → data/data.js, report/核查报告.md');
if (counts.errors) { console.log('!! 存在错误，详见核查报告 ⑦'); }
