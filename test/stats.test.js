import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countInPeriod } from '../js/stats.js';

// Reference "now": Wed 2026-06-17, 10:00 local.
const NOW = new Date(2026, 5, 17, 10, 0).getTime();
const log = (y, mo, d, h = 9) => ({ id: `${y}${mo}${d}${h}`, menuItemId: 'm1', timestamp: new Date(y, mo, d, h).getTime() });

test('today counts only logs on the current calendar day', () => {
  const logs = [log(2026, 5, 17, 8), log(2026, 5, 17, 20), log(2026, 5, 16, 23)];
  assert.equal(countInPeriod(logs, 'today', NOW), 2);
});

test('week counts Monday..now (week starts Monday)', () => {
  // Week of NOW starts Mon 2026-06-15. Sunday 06-14 is previous week.
  const logs = [log(2026, 5, 15), log(2026, 5, 17), log(2026, 5, 14)];
  assert.equal(countInPeriod(logs, 'week', NOW), 2);
});

test('month counts the current calendar month', () => {
  const logs = [log(2026, 5, 1), log(2026, 5, 17), log(2026, 4, 30)];
  assert.equal(countInPeriod(logs, 'month', NOW), 2);
});

test('all counts everything', () => {
  const logs = [log(2025, 0, 1), log(2026, 5, 17)];
  assert.equal(countInPeriod(logs, 'all', NOW), 2);
});

import { countsByType } from '../js/stats.js';

const MENU = [
  { id: 'm1', name: 'Espresso', color: '#a', caffeineMg: 65 },
  { id: 'm2', name: 'Latte', color: '#b', caffeineMg: 75 },
];

test('countsByType returns counts per menu item, descending', () => {
  const logs = [
    { id: '1', menuItemId: 'm2', timestamp: 1 },
    { id: '2', menuItemId: 'm1', timestamp: 2 },
    { id: '3', menuItemId: 'm1', timestamp: 3 },
  ];
  const r = countsByType(logs, MENU);
  assert.deepEqual(r, [
    { id: 'm1', name: 'Espresso', color: '#a', count: 2 },
    { id: 'm2', name: 'Latte', color: '#b', count: 1 },
  ]);
});

test('countsByType ignores logs for deleted menu items', () => {
  const logs = [{ id: '1', menuItemId: 'gone', timestamp: 1 }];
  assert.deepEqual(countsByType(logs, MENU), [
    { id: 'm1', name: 'Espresso', color: '#a', count: 0 },
    { id: 'm2', name: 'Latte', color: '#b', count: 0 },
  ]);
});
