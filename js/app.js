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

// Placeholders filled in later tasks:
function renderStats() { screen.innerHTML = ''; }
function renderManage() { screen.innerHTML = ''; }
function renderSettings() { screen.innerHTML = ''; }

init();
