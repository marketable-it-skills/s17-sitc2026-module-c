#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const REPORTS_ROOT = path.resolve(__dirname, '..', 'reports');

// Accept optional path arg; default to latest c* subfolder or root reports
const arg = process.argv[2];
let reportDir;
if (arg) {
  reportDir = path.resolve(arg);
} else {
  // Find most recent subfolder in reports/
  const dirs = fs.readdirSync(REPORTS_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => ({ name: d.name, mtime: fs.statSync(path.join(REPORTS_ROOT, d.name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  reportDir = dirs.length > 0 ? path.join(REPORTS_ROOT, dirs[0].name) : REPORTS_ROOT;
}

const jsonPath = path.join(reportDir, 'marking-report.json');
if (!fs.existsSync(jsonPath)) {
  console.error(`marking-report.json not found in ${reportDir}`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const s = report.summary;
const m = report.meta;

const WSOS_NAMES = {
  1: 'Work Organization & Management',
  2: 'Communication & Interpersonal Skills',
  3: 'Design',
  4: 'Front-End Development',
  5: 'Back-End Development',
};

function statusBadge(status) {
  const colors = { pass: '#22c55e', fail: '#ef4444', excluded: '#a3a3a3', missing: '#f59e0b', skipped: '#64748b' };
  const bg = colors[status] || '#64748b';
  return `<span style="background:${bg};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;">${status}</span>`;
}

// Group aspects by subCriterion
const groups = [];
let currentGroup = null;
for (const a of report.aspects) {
  if (!currentGroup || currentGroup.name !== a.subCriterion) {
    currentGroup = { name: a.subCriterion, wsosSection: a.wsosSection, aspects: [] };
    groups.push(currentGroup);
  }
  currentGroup.aspects.push(a);
}

let aspectRows = '';
for (const g of groups) {
  aspectRows += `<tr class="group-header"><td colspan="5">${g.name} <small>(WSOS ${g.wsosSection} – ${WSOS_NAMES[g.wsosSection] || ''})</small></td></tr>\n`;
  for (const a of g.aspects) {
    const testsHtml = (a.tests || []).map(t =>
      `<div class="test ${t.status}">${t.description}${t.error ? ` <span class="err">— ${t.error}</span>` : ''}</div>`
    ).join('');
    aspectRows += `<tr class="aspect ${a.status}">
      <td class="id">${a.id || '-'}</td>
      <td>${statusBadge(a.status)}</td>
      <td class="mark">${a.status === 'pass' ? a.maxMark : 0} / ${a.maxMark}</td>
      <td class="desc">${a.description}</td>
      <td class="tests">${testsHtml || '<em>—</em>'}</td>
    </tr>\n`;
  }
}

let setupRows = '';
if (report.setupRequests && report.setupRequests.length > 0) {
  for (const r of report.setupRequests) {
    setupRows += `<tr><td>${statusBadge(r.status)}</td><td>${r.name || r.requestName || ''}</td></tr>\n`;
  }
}

const passRate = s.marksPossible > 0 ? ((s.marksAvailable / s.marksPossible) * 100).toFixed(1) : '0';
const competitor = path.basename(reportDir);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Marking Report – ${competitor}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 24px; line-height: 1.5; }
  h1 { font-size: 1.6rem; margin-bottom: 4px; }
  .meta { color: #64748b; font-size: 0.85rem; margin-bottom: 20px; }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .card { background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); text-align: center; }
  .card .num { font-size: 1.8rem; font-weight: 700; }
  .card .label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .card.pass .num { color: #22c55e; }
  .card.fail .num { color: #ef4444; }
  .card.marks .num { color: #2563eb; }
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 24px; }
  th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.4px; color: #475569; }
  td { padding: 8px 12px; border-top: 1px solid #f1f5f9; font-size: 0.85rem; vertical-align: top; }
  tr.group-header td { background: #f8fafc; font-weight: 600; font-size: 0.9rem; padding: 12px; border-top: 2px solid #e2e8f0; }
  tr.aspect.fail { background: #fef2f2; }
  .id { font-weight: 700; white-space: nowrap; }
  .mark { white-space: nowrap; font-variant-numeric: tabular-nums; }
  .desc { max-width: 340px; }
  .tests { font-size: 0.78rem; color: #475569; }
  .test.fail { color: #dc2626; }
  .err { color: #dc2626; font-style: italic; }
  h2 { font-size: 1.1rem; margin: 24px 0 8px; }
  .progress-bar { height: 8px; border-radius: 4px; background: #e2e8f0; overflow: hidden; margin-bottom: 24px; }
  .progress-bar .fill { height: 100%; background: #22c55e; border-radius: 4px; }
</style>
</head>
<body>
<h1>Marking Report – ${competitor}</h1>
<p class="meta">${m.timestamp} &bull; env: ${m.env} &bull; Bruno ${m.bruVersion} &bull; ${(m.durationMs / 1000).toFixed(1)}s &bull; Excluded: ${m.exclude.join(', ') || 'none'}</p>

<div class="progress-bar"><div class="fill" style="width:${passRate}%"></div></div>

<div class="summary-grid">
  <div class="card marks"><div class="num">${s.marksAvailable} / ${s.marksPossible}</div><div class="label">Marks (of ${s.totalMarkDeclared})</div></div>
  <div class="card pass"><div class="num">${s.aspectsPass}</div><div class="label">Pass</div></div>
  <div class="card fail"><div class="num">${s.aspectsFail}</div><div class="label">Fail</div></div>
  <div class="card"><div class="num">${s.aspectsMissing}</div><div class="label">Missing</div></div>
  <div class="card"><div class="num">${s.aspectsExcluded}</div><div class="label">Excluded</div></div>
  <div class="card"><div class="num">${s.requests}</div><div class="label">Requests</div></div>
</div>

<h2>Aspects</h2>
<table>
<thead><tr><th>ID</th><th>Status</th><th>Marks</th><th>Description</th><th>Tests</th></tr></thead>
<tbody>
${aspectRows}
</tbody>
</table>

${setupRows ? `<h2>Setup / Unlabeled Requests</h2>
<table><thead><tr><th>Status</th><th>Request</th></tr></thead><tbody>${setupRows}</tbody></table>` : ''}

</body>
</html>`;

const htmlPath = path.join(reportDir, 'marking-report.html');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`Wrote ${htmlPath}`);

// Open in default browser
const openCmd = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
execSync(`${openCmd} "${htmlPath}"`, { stdio: 'ignore', shell: true });
console.log('Opened in browser.');
