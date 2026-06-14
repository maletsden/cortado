// storage.js — the ONLY module that touches localStorage.
const K = { menu: 'coffee.menu', logs: 'coffee.logs', settings: 'coffee.settings' };
const DEFAULT_SETTINGS = { dailyLimit: null, caffeineCeiling: 400 };

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getMenu() { return read(K.menu, []); }
export function saveMenu(menu) { return write(K.menu, menu); }

export function getLogs() { return read(K.logs, []); }

export function addLog({ menuItemId, timestamp }) {
  const log = { id: crypto.randomUUID(), menuItemId, timestamp };
  const logs = getLogs();
  logs.push(log);
  write(K.logs, logs);
  return log;
}

export function deleteLog(id) {
  return write(K.logs, getLogs().filter(l => l.id !== id));
}

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(K.settings, {}) };
}
export function saveSettings(partial) {
  return write(K.settings, { ...getSettings(), ...partial });
}

export function ensureSeeded(seedMenu) {
  if (getMenu().length === 0) saveMenu(seedMenu);
}
