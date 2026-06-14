import * as storage from './storage.js';
import * as stats from './stats.js';
import * as charts from './charts.js';
import { DEFAULT_MENU, HERO_PHOTO, PHOTO_GALLERY, COLOR_SWATCHES } from './defaults.js';

const hero = document.getElementById('hero');
const screen = document.getElementById('screen');
const nav = document.getElementById('nav');
const toastEl = document.getElementById('toast');
const confirmEl = document.getElementById('confirm');
const detailEl = document.getElementById('detail');
const editEl = document.getElementById('edit');

let current = 'menu';

function init() {
  storage.ensureSeeded(DEFAULT_MENU);
  nav.addEventListener('click', e => {
    const btn = e.target.closest('.nav-item');
    if (btn) go(btn.dataset.screen);
  });
  go('menu');
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
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
  const sorted = [...menu].sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0));
  screen.innerHTML = sorted.map(m => `
    <div class="card" data-log="${m.id}">
      <div class="fallback"></div>
      <img src="${charts.escapeHtml(m.photo)}" alt="" onerror="this.style.display='none'">
      <div class="veil"></div>
      <button class="add" aria-label="Log ${charts.escapeHtml(m.name)}">＋</button>
      <div class="label">
        <div class="name">${charts.escapeHtml(m.name)}</div>
        <div class="meta">${m.caffeineMg} mg · ${counts.get(m.id) || 0} logged</div>
      </div>
    </div>`).join('');
  screen.querySelectorAll('[data-log]').forEach(el =>
    el.addEventListener('click', () => openDetail(el.dataset.log)));
}

// Open the coffee detail modal. Logging only happens via its Add button.
function openDetail(menuItemId) {
  const item = storage.getMenu().find(m => m.id === menuItemId);
  if (!item) return;
  const count = stats.countsByType(storage.getLogs(), storage.getMenu())
    .find(r => r.id === menuItemId)?.count || 0;
  detailEl.querySelector('#detail-img').src = item.photo || '';
  detailEl.querySelector('#detail-name').textContent = item.name;
  const desc = detailEl.querySelector('#detail-desc');
  desc.textContent = item.description || '';
  desc.hidden = !item.description;
  detailEl.querySelector('#detail-meta').textContent = `${item.caffeineMg} mg · ${count} logged`;
  detailEl.hidden = false;

  const add = detailEl.querySelector('#detail-add');
  const close = detailEl.querySelector('#detail-close');
  const done = () => {
    detailEl.hidden = true;
    add.removeEventListener('click', onAdd);
    close.removeEventListener('click', done);
    detailEl.removeEventListener('click', onBackdrop);
  };
  const onAdd = () => { done(); logCoffee(menuItemId); };
  const onBackdrop = e => { if (e.target === detailEl) done(); };
  add.addEventListener('click', onAdd);
  close.addEventListener('click', done);
  detailEl.addEventListener('click', onBackdrop);
}

function logCoffee(menuItemId) {
  storage.addLog({ menuItemId, timestamp: Date.now() });
  renderHero();
  renderMenu();
  checkDailyLimit();
}

// Themed yes/no modal. Resolves true on confirm, false on cancel / backdrop tap.
function confirmDialog(message, confirmLabel = 'Confirm') {
  return new Promise(resolve => {
    confirmEl.querySelector('#confirm-msg').textContent = message;
    confirmEl.querySelector('#confirm-yes').textContent = confirmLabel;
    confirmEl.hidden = false;
    const done = result => {
      confirmEl.hidden = true;
      yes.removeEventListener('click', onYes);
      no.removeEventListener('click', onNo);
      confirmEl.removeEventListener('click', onBackdrop);
      resolve(result);
    };
    const yes = confirmEl.querySelector('#confirm-yes');
    const no = confirmEl.querySelector('#confirm-no');
    const onYes = () => done(true);
    const onNo = () => done(false);
    const onBackdrop = e => { if (e.target === confirmEl) done(false); };
    yes.addEventListener('click', onYes);
    no.addEventListener('click', onNo);
    confirmEl.addEventListener('click', onBackdrop);
  });
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
        <div class="desc">${m.description ? charts.escapeHtml(m.description) : 'No description'}</div>
      </div>
      <button class="edit" data-edit="${m.id}">Edit</button>
      <button class="del" data-del="${m.id}">Delete</button>
    </div>`).join('');
  screen.innerHTML = `
    <div class="stat-block"><h2>Your coffees</h2>${list || '<p style="color:var(--dim)">None yet.</p>'}</div>
    <div class="stat-block"><h2>Add a coffee</h2>
      <div id="add-form"></div>
      <button class="btn" id="f-add">Add coffee</button>
    </div>`;

  const addForm = buildCoffeeForm(screen.querySelector('#add-form'), {});

  screen.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', async () => {
      const id = b.dataset.del;
      const item = storage.getMenu().find(m => m.id === id);
      const n = storage.getLogs().filter(l => l.menuItemId === id).length;
      const warn = n ? ` Its ${n} logged ${n === 1 ? 'entry' : 'entries'} will be orphaned.` : '';
      if (!await confirmDialog(`Delete ${item ? item.name : 'this coffee'}?${warn} Can't be undone.`, 'Delete')) return;
      storage.saveMenu(storage.getMenu().filter(m => m.id !== id));
      renderManage();
      toast('Coffee deleted');
    }));

  screen.querySelectorAll('[data-edit]').forEach(b =>
    b.addEventListener('click', () => openEdit(b.dataset.edit)));

  screen.querySelector('#f-add').addEventListener('click', () => {
    const v = addForm.getValues();
    if (!v.name) { toast('Name required'); return; }
    const menu = storage.getMenu();
    menu.push({ id: crypto.randomUUID(), ...v, photo: v.photo || PHOTO_GALLERY[0] });
    if (!storage.saveMenu(menu)) { toast('Storage full — try a smaller photo'); return; }
    renderManage();
    toast('Coffee added');
  });
}

// Shared editable coffee form. Fills `root`, returns { getValues }.
function buildCoffeeForm(root, initial = {}) {
  root.innerHTML = `
    <div class="field"><label>Name</label><input class="cf-name" placeholder="Cortado"></div>
    <div class="field"><label>Description</label><textarea class="cf-desc" placeholder="Short description"></textarea></div>
    <div class="field"><label>Caffeine (mg)</label><input class="cf-caf" type="number" inputmode="numeric"></div>
    <div class="field"><label>Photo</label><input class="cf-photo" placeholder="https:// or upload / pick below">
      <div class="upload-row">
        <label class="btn secondary upload-btn">Upload from device<input class="cf-file" type="file" accept="image/*" hidden></label>
        <img class="cf-preview preview" alt="" hidden>
      </div>
      <div class="gallery cf-gallery">${PHOTO_GALLERY.map(u =>
        `<img src="${u}" data-photo="${u}" alt="">`).join('')}</div></div>
    <div class="field"><label>Color</label>
      <div class="swatches cf-swatches">${COLOR_SWATCHES.map(c =>
        `<span data-color="${c}" style="background:${c}"></span>`).join('')}</div></div>`;

  const nameEl = root.querySelector('.cf-name');
  const descEl = root.querySelector('.cf-desc');
  const cafEl = root.querySelector('.cf-caf');
  const photoInput = root.querySelector('.cf-photo');
  const preview = root.querySelector('.cf-preview');

  let photo = initial.photo || '';
  let color = initial.color || COLOR_SWATCHES[0];

  nameEl.value = initial.name || '';
  descEl.value = initial.description || '';
  cafEl.value = initial.caffeineMg != null ? initial.caffeineMg : 75;
  if (initial.photo) photoInput.value = initial.photo;

  root.querySelectorAll('.cf-gallery img').forEach(img =>
    img.addEventListener('click', () => {
      photo = img.dataset.photo;
      photoInput.value = photo;
      preview.hidden = true;
      root.querySelectorAll('.cf-gallery img').forEach(i => i.classList.toggle('sel', i === img));
    }));

  root.querySelector('.cf-file').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      photo = await scaleImage(file, 480);
      photoInput.value = '';
      preview.src = photo;
      preview.hidden = false;
      root.querySelectorAll('.cf-gallery img').forEach(i => i.classList.remove('sel'));
    } catch {
      toast('Could not read image');
    }
  });

  root.querySelectorAll('.cf-swatches span').forEach(s =>
    s.addEventListener('click', () => {
      color = s.dataset.color;
      root.querySelectorAll('.cf-swatches span').forEach(x => x.classList.toggle('sel', x === s));
    }));
  root.querySelectorAll('.cf-swatches span').forEach(s =>
    s.classList.toggle('sel', s.dataset.color === color));

  return {
    getValues: () => ({
      name: nameEl.value.trim(),
      description: descEl.value.trim(),
      caffeineMg: parseInt(cafEl.value, 10) || 0,
      color,
      photo: photoInput.value.trim() || photo,
    }),
  };
}

// Edit modal — full edit of an existing coffee.
function openEdit(id) {
  const item = storage.getMenu().find(m => m.id === id);
  if (!item) return;
  const form = buildCoffeeForm(editEl.querySelector('#edit-form'), item);
  editEl.hidden = false;

  const save = editEl.querySelector('#edit-save');
  const cancel = editEl.querySelector('#edit-cancel');
  const close = editEl.querySelector('#edit-close');
  const done = () => {
    editEl.hidden = true;
    save.removeEventListener('click', onSave);
    cancel.removeEventListener('click', done);
    close.removeEventListener('click', done);
    editEl.removeEventListener('click', onBackdrop);
  };
  const onSave = () => {
    const v = form.getValues();
    if (!v.name) { toast('Name required'); return; }
    const menu = storage.getMenu().map(m => m.id === id ? { ...m, ...v, photo: v.photo || m.photo } : m);
    if (!storage.saveMenu(menu)) { toast('Storage full — try a smaller photo'); return; }
    done();
    renderManage();
    toast('Coffee updated');
  };
  const onBackdrop = e => { if (e.target === editEl) done(); };
  save.addEventListener('click', onSave);
  cancel.addEventListener('click', done);
  close.addEventListener('click', done);
  editEl.addEventListener('click', onBackdrop);
}

// Decode, downscale, re-encode as JPEG data URL so localStorage stays small.
function scaleImage(file, max) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode failed')); };
    img.src = url;
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
