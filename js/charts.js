// charts.js — numbers in, HTML strings out. No storage, no compute.

export function byTypeChart(rows) {
  const max = Math.max(1, ...rows.map(r => r.count));
  return rows.map(r => `
    <div class="bar-row">
      <span class="name">${escapeHtml(r.name)}</span>
      <div class="bar" style="width:${(r.count / max) * 60}px;background:${r.color}"></div>
      <span class="n">${r.count}</span>
    </div>`).join('');
}

export function hoursChart(buckets) {
  const max = Math.max(1, ...buckets);
  return `<div class="hours">${buckets.map(c =>
    `<div class="h" style="height:${(c / max) * 100}%"></div>`).join('')}</div>`;
}

export function bigStats(items) {
  // items: [{num, cap}]
  return `<div class="big-stats">${items.map(i =>
    `<div class="item"><div class="num">${i.num}</div><div class="cap">${escapeHtml(i.cap)}</div></div>`).join('')}</div>`;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
