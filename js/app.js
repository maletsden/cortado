import * as storage from './storage.js';
import * as stats from './stats.js';
import * as charts from './charts.js';
import { DEFAULT_MENU, HERO_PHOTO, PHOTO_GALLERY, COLOR_SWATCHES } from './defaults.js';

const hero = document.getElementById('hero');
const screen = document.getElementById('screen');
const nav = document.getElementById('nav');
const toastEl = document.getElementById('toast');

let current = 'menu';

function init() {
  storage.ensureSeeded(DEFAULT_MENU);
  nav.addEventListener('click', e => {
    const btn = e.target.closest('.nav-item');
    if (btn) go(btn.dataset.screen);
  });
  go('menu');
}

function go(name) {
  current = name;
  for (const b of nav.querySelectorAll('.nav-item')) b.classList.toggle('active', b.dataset.screen === name);
  renderHero();
  ({ menu: renderMenu, stats: renderStats, manage: renderManage, settings: renderSettings }[name])();
}

function renderHero() {
  const logs = storage.getLogs();
  const menu = storage.getMenu();
  const settings = storage.getSettings();
  const now = Date.now();
  const cups = stats.countInPeriod(logs, 'today', now);
  const mg = stats.caffeineToday(logs, menu, now);
  const streak = stats.currentStreak(logs, now);
  const pct = Math.min(100, (mg / settings.caffeineCeiling) * 100);
  const over = mg > settings.caffeineCeiling;
  hero.innerHTML = `
    <img src="${HERO_PHOTO}" alt="">
    <div class="overlay"></div>
    <div class="content">
      <div class="eyebrow">${greeting()}</div>
      <h1>${cups} ${cups === 1 ? 'cup' : 'cups'} today</h1>
      <div class="sub">${mg} / ${settings.caffeineCeiling} mg caffeine${streak ? ` · ${streak}-day streak` : ''}</div>
      <div class="meter ${over ? 'over' : ''}"><div style="width:${pct}%"></div></div>
    </div>`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function renderMenu() {
  const menu = storage.getMenu();
  const logs = storage.getLogs();
  const counts = new Map(stats.countsByType(logs, menu).map(r => [r.id, r.count]));
  if (menu.length === 0) {
    screen.innerHTML = `<p style="color:var(--dim);text-align:center;margin-top:40px">No coffees yet. Add some in MANAGE.</p>`;
    return;
  }
  screen.innerHTML = menu.map(m => `
    <div class="card" data-log="${m.id}">
      <div class="fallback"></div>
      <img src="${charts.escapeHtml(m.photo)}" alt="" onerror="this.style.display='none'">
      <div class="veil"></div>
      <button class="add" data-log="${m.id}" aria-label="Log ${charts.escapeHtml(m.name)}">＋</button>
      <div class="label">
        <div class="name">${charts.escapeHtml(m.name)}</div>
        <div class="meta">${m.caffeineMg} mg · ${counts.get(m.id) || 0} logged</div>
      </div>
    </div>`).join('');
  screen.querySelectorAll('[data-log]').forEach(el =>
    el.addEventListener('click', () => logCoffee(el.dataset.log)));
}

function logCoffee(menuItemId) {
  storage.addLog({ menuItemId, timestamp: Date.now() });
  renderHero();
  renderMenu();
  checkDailyLimit();
}

function checkDailyLimit() {
  const settings = storage.getSettings();
  if (settings.dailyLimit == null) return;
  const cups = stats.countInPeriod(storage.getLogs(), 'today', Date.now());
  if (cups > settings.dailyLimit) toast(`That's ${cups} today — over your limit of ${settings.dailyLimit}.`);
  else toast('Logged ☕');
}

let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2200);
}

function renderStats() {
  const logs = storage.getLogs();
  const menu = storage.getMenu();
  const now = Date.now();
  const totals = charts.bigStats([
    { num: stats.countInPeriod(logs, 'today', now), cap: 'Today' },
    { num: stats.countInPeriod(logs, 'week', now), cap: 'Week' },
    { num: stats.countInPeriod(logs, 'month', now), cap: 'Month' },
    { num: stats.countInPeriod(logs, 'all', now), cap: 'All time' },
  ]);
  const week = stats.weekComparison(logs, now);
  const streak = stats.currentStreak(logs, now);
  screen.innerHTML = `
    <div class="stat-block"><h2>Totals</h2>${totals}</div>
    <div class="stat-block"><h2>By type</h2>${charts.byTypeChart(stats.countsByType(logs, menu))}</div>
    <div class="stat-block"><h2>Time of day</h2>${charts.hoursChart(stats.hourlyCounts(logs))}</div>
    <div class="stat-block"><h2>Streak &amp; this week</h2>${charts.bigStats([
      { num: streak, cap: 'Day streak' },
      { num: week.thisWeek, cap: 'This week' },
      { num: week.lastWeek, cap: 'Last week' },
    ])}</div>`;
}

function renderManage() {
  const menu = storage.getMenu();
  const list = menu.map(m => `
    <div class="manage-item">
      <img src="${charts.escapeHtml(m.photo)}" alt="" onerror="this.style.visibility='hidden'">
      <div class="info">
        <div>${charts.escapeHtml(m.name)}</div>
        <div style="font-size:12px;color:var(--dim)">${m.caffeineMg} mg</div>
      </div>
      <button class="del" data-del="${m.id}">Delete</button>
    </div>`).join('');
  screen.innerHTML = `
    <div class="stat-block"><h2>Your coffees</h2>${list || '<p style="color:var(--dim)">None yet.</p>'}</div>
    <div class="stat-block"><h2>Add a coffee</h2>
      <div class="field"><label>Name</label><input id="f-name" placeholder="Cortado"></div>
      <div class="field"><label>Caffeine (mg)</label><input id="f-caf" type="number" inputmode="numeric" value="75"></div>
      <div class="field"><label>Photo URL</label><input id="f-photo" placeholder="https://...">
        <div class="gallery" id="f-gallery">${PHOTO_GALLERY.map(u =>
          `<img src="${u}" data-photo="${u}" alt="">`).join('')}</div></div>
      <div class="field"><label>Color</label>
        <div class="swatches" id="f-swatches">${COLOR_SWATCHES.map(c =>
          `<span data-color="${c}" style="background:${c}"></span>`).join('')}</div></div>
      <button class="btn" id="f-add">Add coffee</button>
    </div>`;

  let photo = '';
  let color = COLOR_SWATCHES[0];

  screen.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', () => {
      storage.saveMenu(storage.getMenu().filter(m => m.id !== b.dataset.del));
      renderManage();
    }));

  const photoInput = screen.querySelector('#f-photo');
  screen.querySelectorAll('#f-gallery img').forEach(img =>
    img.addEventListener('click', () => {
      photo = img.dataset.photo;
      photoInput.value = photo;
      screen.querySelectorAll('#f-gallery img').forEach(i => i.classList.toggle('sel', i === img));
    }));

  screen.querySelectorAll('#f-swatches span').forEach(s =>
    s.addEventListener('click', () => {
      color = s.dataset.color;
      screen.querySelectorAll('#f-swatches span').forEach(x => x.classList.toggle('sel', x === s));
    }));
  screen.querySelector('#f-swatches span').classList.add('sel');

  screen.querySelector('#f-add').addEventListener('click', () => {
    const name = screen.querySelector('#f-name').value.trim();
    const caffeineMg = parseInt(screen.querySelector('#f-caf').value, 10) || 0;
    const photoVal = photoInput.value.trim() || photo;
    if (!name) { toast('Name required'); return; }
    const menu = storage.getMenu();
    menu.push({ id: crypto.randomUUID(), name, caffeineMg, color,
      photo: photoVal || PHOTO_GALLERY[0] });
    storage.saveMenu(menu);
    renderManage();
    toast('Coffee added');
  });
}

function renderSettings() {
  const s = storage.getSettings();
  screen.innerHTML = `
    <div class="stat-block"><h2>Limits</h2>
      <div class="field"><label>Daily coffee limit (blank = off)</label>
        <input id="s-limit" type="number" inputmode="numeric" value="${s.dailyLimit ?? ''}" placeholder="e.g. 3"></div>
      <div class="field"><label>Daily caffeine ceiling (mg)</label>
        <input id="s-ceil" type="number" inputmode="numeric" value="${s.caffeineCeiling}"></div>
      <button class="btn" id="s-save">Save</button>
    </div>`;
  screen.querySelector('#s-save').addEventListener('click', () => {
    const limitRaw = screen.querySelector('#s-limit').value.trim();
    const ceil = parseInt(screen.querySelector('#s-ceil').value, 10);
    storage.saveSettings({
      dailyLimit: limitRaw === '' ? null : (parseInt(limitRaw, 10) || null),
      caffeineCeiling: Number.isFinite(ceil) && ceil > 0 ? ceil : 400,
    });
    renderHero();
    toast('Settings saved');
  });
}

init();
