import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Minimal localStorage mock installed before importing storage.js.
function installMock() {
  const map = new Map();
  globalThis.localStorage = {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: k => map.delete(k),
    clear: () => map.clear(),
    _map: map,
  };
}
installMock();

const storage = await import('../js/storage.js');

beforeEach(() => globalThis.localStorage.clear());

test('getMenu/getLogs default to empty arrays', () => {
  assert.deepEqual(storage.getMenu(), []);
  assert.deepEqual(storage.getLogs(), []);
});

test('getSettings returns defaults when unset', () => {
  assert.deepEqual(storage.getSettings(), { dailyLimit: null, caffeineCeiling: 400 });
});

test('saveMenu round-trips', () => {
  const menu = [{ id: 'm1', name: 'Espresso', photo: 'p', color: '#a', caffeineMg: 65 }];
  storage.saveMenu(menu);
  assert.deepEqual(storage.getMenu(), menu);
});

test('addLog persists a log with a generated id', () => {
  const log = storage.addLog({ menuItemId: 'm1', timestamp: 123 });
  assert.ok(log.id);
  assert.equal(log.menuItemId, 'm1');
  assert.equal(log.timestamp, 123);
  assert.deepEqual(storage.getLogs(), [log]);
});

test('deleteLog removes by id', () => {
  const a = storage.addLog({ menuItemId: 'm1', timestamp: 1 });
  const b = storage.addLog({ menuItemId: 'm2', timestamp: 2 });
  storage.deleteLog(a.id);
  assert.deepEqual(storage.getLogs(), [b]);
});

test('saveSettings merges over defaults', () => {
  storage.saveSettings({ dailyLimit: 3 });
  assert.deepEqual(storage.getSettings(), { dailyLimit: 3, caffeineCeiling: 400 });
});

test('corrupt JSON falls back to default', () => {
  globalThis.localStorage.setItem('coffee.menu', '{not json');
  assert.deepEqual(storage.getMenu(), []);
});

test('ensureSeeded seeds only when menu empty', () => {
  const seed = [{ id: 's1', name: 'Seed', photo: 'p', color: '#a', caffeineMg: 60 }];
  storage.ensureSeeded(seed);
  assert.deepEqual(storage.getMenu(), seed);
  storage.saveMenu([]);                 // user cleared menu deliberately...
  storage.ensureSeeded(seed);           // empty -> seeds again (acceptable for v1)
  assert.deepEqual(storage.getMenu(), seed);
});
