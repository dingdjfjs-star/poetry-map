/* =====================================================================
 * 诗词地图 · 一键部署到 GitHub Pages（tools/github-deploy.js）
 * 流程：git init + 提交 → GCM 凭据 → API 建仓(公开) → push → 开启 Pages → 轮询构建 → 验证
 * 用法：node tools/github-deploy.js [仓库名]（默认 poetry-map）
 * ===================================================================== */
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REPO_NAME = process.argv[2] || 'poetry-map';
const DESC = '诗词地图 · 唐诗宋词里的山河（地名考据版）：137 首经典诗词 × 187 个古地名，点击点位看全诗/注释/诗人游历路线';

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', cwd: ROOT, ...opts });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
};
const api = async (token, method, urlPath, body) => {
  const res = await fetch('https://api.github.com' + urlPath, {
    method, headers: { Authorization: 'token ' + token, 'User-Agent': 'poetry-map-deploy', Accept: 'application/vnd.github+json' },
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  return { status: res.status, data };
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  /* ① 取 GCM 存储的 GitHub 凭据（无存储时会弹出浏览器登录，请完成授权） */
  console.log('① 获取 GitHub 凭据（如弹出登录窗口，请在浏览器完成授权）…');
  const cred = spawnSync('git', ['credential', 'fill'], { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', timeout: 180000 });
  const m = (cred.stdout || '').match(/password=(.+)/);
  if (!m) { console.error('✗ 未取得凭据：', (cred.stderr || cred.stdout || '').slice(0, 300)); process.exit(1); }
  const token = m[1].trim();

  const me = await api(token, 'GET', '/user');
  if (me.status !== 200) { console.error('✗ 凭据无效或权限不足：', me.status, JSON.stringify(me.data).slice(0, 200)); process.exit(1); }
  const login = me.data.login;
  console.log(`  ✓ 已登录 GitHub：${login}`);

  /* ② 本地仓库：init + .gitignore + 提交 */
  console.log('② 初始化本地仓库并提交…');
  if (!fs.existsSync(path.join(ROOT, '.git'))) {
    console.log('  ', run('git', ['init', '-b', 'main']).out.trim());
  }
  const gi = path.join(ROOT, '.gitignore');
  if (!fs.existsSync(gi)) fs.writeFileSync(gi, '.zcode-site/\nnode_modules/\nThumbs.db\n', 'utf8');
  run('git', ['config', 'user.name', login]);
  run('git', ['config', 'user.email', `${login}@users.noreply.github.com`]);
  run('git', ['add', '-A']);
  const commit = run('git', ['commit', '-m', '诗词地图：137 首经典诗词 × 187 古地名打点（自动匹配+人工核查流水线）']);
  console.log(commit.code === 0 ? '   ✓ 已提交' : commit.out.includes('nothing to commit') ? '   - 无新变更' : '  ! ' + commit.out.slice(0, 200));

  /* ③ 创建远端仓库（公开，Pages 免费版要求） */
  console.log('③ 创建 GitHub 仓库（公开）…');
  let repo = await api(token, 'GET', `/repos/${login}/${REPO_NAME}`);
  if (repo.status === 404) {
    repo = await api(token, 'POST', '/user/repos', { name: REPO_NAME, description: DESC, private: false, auto_init: false });
    if (repo.status >= 300) { console.error('✗ 建仓失败：', JSON.stringify(repo.data).slice(0, 300)); process.exit(1); }
    console.log(`  ✓ 已创建 ${login}/${REPO_NAME}`);
  } else console.log(`  - 仓库已存在 ${login}/${REPO_NAME}`);

  /* ④ 推送 */
  console.log('④ 推送代码…');
  const remote = run('git', ['remote', 'add', 'origin', `https://github.com/${login}/${REPO_NAME}.git`]);
  if (remote.code !== 0) run('git', ['remote', 'set-url', 'origin', `https://github.com/${login}/${REPO_NAME}.git`]);
  const push = run('git', ['push', '-u', 'origin', 'main'], { timeout: 300000 });
  if (push.code !== 0) { console.error('✗ push 失败：', push.out.slice(0, 400)); process.exit(1); }
  console.log('  ✓ 已推送 main 分支');

  /* ⑤ 开启 GitHub Pages（main 分支根目录） */
  console.log('⑤ 开启 GitHub Pages…');
  const pages = await api(token, 'GET', `/repos/${login}/${REPO_NAME}/pages`);
  if (pages.status === 404) {
    const en = await api(token, 'POST', `/repos/${login}/${REPO_NAME}/pages`, { source: { branch: 'main', path: '/' } });
    if (en.status >= 300) { console.error('✗ 开启 Pages 失败：', JSON.stringify(en.data).slice(0, 300)); process.exit(1); }
  } else if (pages.status !== 200) { console.error('✗ Pages 查询失败：', pages.status); process.exit(1); }
  console.log('  ✓ Pages 已配置（main /）');

  /* ⑥ 轮询构建直到上线 */
  const siteUrl = `https://${login}.github.io/${REPO_NAME}/`;
  process.stdout.write('⑥ 等待 Pages 构建');
  let ok = false;
  for (let i = 0; i < 20; i++) {
    await sleep(6000);
    const b = await api(token, 'GET', `/repos/${login}/${REPO_NAME}/pages/builds/latest`);
    process.stdout.write('.');
    if (b.data && b.data.status === 'built') {
      const test = await fetch(siteUrl);
      if (test.ok) { ok = true; break; }
    }
    if (b.data && b.data.status === 'errored') { console.log('\n✗ Pages 构建失败：', JSON.stringify(b.data.error || {}).slice(0, 300)); break; }
  }
  console.log('');
  if (ok) {
    console.log(`\n✔ 部署完成！`);
    console.log(`  仓库：https://github.com/${login}/${REPO_NAME}`);
    console.log(`  在线：${siteUrl}`);
  } else {
    console.log(`\n- 仓库已推送，Pages 还在构建中，几分钟后访问：${siteUrl}`);
  }
})().catch(e => { console.error('✗ 异常：', e.message); process.exit(1); });
