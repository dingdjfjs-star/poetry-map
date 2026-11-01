/* 构建 ZCode Sites 发布 stage：tools/make-stage.js */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKILL = 'C:/Users/jiangfei/.zcode/cli/plugins/cache/zcode-plugins-official/zcode-site/0.4.2/skills/site-deploy/templates';
const S = path.join(ROOT, '.zcode-site', 'stage');

fs.rmSync(S, { recursive: true, force: true });
fs.mkdirSync(path.join(S, 'dist'), { recursive: true });

/* 静态资源：只拷运行必需文件（页面 + 数据 + leaflet 核心） */
for (const f of ['index.html', 'css', 'js', 'data']) {
  fs.cpSync(path.join(ROOT, f), path.join(S, 'dist', f), { recursive: true });
}
fs.mkdirSync(path.join(S, 'dist', 'vendor', 'leaflet', 'images'), { recursive: true });
for (const f of ['leaflet.css', 'leaflet.js']) {
  fs.copyFileSync(path.join(ROOT, 'vendor', 'leaflet', f), path.join(S, 'dist', 'vendor', 'leaflet', f));
}
for (const f of fs.readdirSync(path.join(ROOT, 'vendor', 'leaflet', 'images'))) {
  fs.copyFileSync(path.join(ROOT, 'vendor', 'leaflet', 'images', f), path.join(S, 'dist', 'vendor', 'leaflet', 'images', f));
}
/* 服务器模板 + start.sh（LF 行尾） */
fs.copyFileSync(path.join(SKILL, 'static-server.mjs'), path.join(S, 'static-server.mjs'));
const startSh = [
  '#!/usr/bin/env bash',
  '# ZCode Sites start.sh for a static site. Copy static-server.mjs next to this file.',
  'set -euo pipefail',
  'cd "$(dirname "${BASH_SOURCE[0]}")"',
  '',
  'SITE_DIR=dist',
  'export SPA_FALLBACK=0',
  '',
  'export PORT="${PORT:-3000}"',
  'exec node static-server.mjs "$SITE_DIR"',
  ''
].join('\n');
fs.writeFileSync(path.join(S, 'start.sh'), startSh, 'utf8');

let files = 0, bytes = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else { files++; bytes += fs.statSync(p).size; }
  }
})(S);
console.log(`stage 构建完成: ${files} 个文件, ${(bytes / 1024).toFixed(0)} KB`);
console.log('  → ' + S);
