// stats.js — pure functions. Implemented across the following tasks.

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Monday as start of week.
export function startOfWeek(ts) {
  const d = new Date(startOfDay(ts));
  const dow = (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
  d.setDate(d.getDate() - dow);
  return d.getTime();
}

export function countInPeriod(logs, period, now) {
  if (period === 'all') return logs.length;
  if (period === 'today') {
    const start = startOfDay(now);
    const end = start + 24 * 60 * 60 * 1000;
    return logs.filter(l => l.timestamp >= start && l.timestamp < end).length;
  }
  if (period === 'week') {
    const start = startOfWeek(now);
    return logs.filter(l => l.timestamp >= start && l.timestamp <= now).length;
  }
  if (period === 'month') {
    const n = new Date(now);
    return logs.filter(l => {
      const d = new Date(l.timestamp);
      return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
    }).length;
  }
  return 0;
}

export function countsByType(logs, menu) {
  const counts = new Map(menu.map(m => [m.id, 0]));
  for (const l of logs) {
    if (counts.has(l.menuItemId)) counts.set(l.menuItemId, counts.get(l.menuItemId) + 1);
  }
  return menu
    .map(m => ({ id: m.id, name: m.name, color: m.color, count: counts.get(m.id) }))
    .sort((a, b) => b.count - a.count);
}

export function hourlyCounts(logs) {
  const buckets = new Array(24).fill(0);
  for (const l of logs) buckets[new Date(l.timestamp).getHours()]++;
  return buckets;
}
