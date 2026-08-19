#!/usr/bin/env node
/**
 * Run the Module C Bruno collection via Bruno CLI and produce:
 *   - reports/bruno-raw.{json,html,xml}  (Bruno native)
 *   - reports/marking-report.json         (aspect-aligned)
 *   - reports/marking-report.md
 *
 * Usage (from this collection root):
 *   node scripts/run-bruno-report.js
 *   node scripts/run-bruno-report.js --env swaploop-module-c-local --exclude F7
 *   node scripts/run-bruno-report.js --out ./reports --dry-parse ./reports/bruno-raw.json
 */

'use strict';

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const LABEL_RE = /^([A-G]\d+)\s*-\s*/;
const COLLECTION_ROOT = path.resolve(__dirname, '..');
const DEFAULT_MARKING = path.resolve(
  COLLECTION_ROOT,
  '..',
  '..',
  '..',
  'marking',
  'marking-scheme.json',
);

const COMPETITORS_JSON = path.resolve(__dirname, 'competitors.json');
const ENV_YML = path.resolve(__dirname, '..', 'environments', 'swaploop-module-c-local.yml');

/**
 * Interactively prompt the user to pick a competitor.
 * Returns the selected competitor object (or null if skipped).
 */
async function selectCompetitor() {
  if (!fs.existsSync(COMPETITORS_JSON)) {
    console.warn(`competitors.json not found at ${COMPETITORS_JSON} — skipping competitor selection.`);
    return null;
  }

  const competitors = JSON.parse(fs.readFileSync(COMPETITORS_JSON, 'utf8'));
  if (!Array.isArray(competitors) || competitors.length === 0) return null;

  console.log('\nCompetitors:');
  competitors.forEach((c, i) => {
    console.log(`  [${i + 1}] ${c.username}  ${c.name}  (${c.country})`);
  });
  console.log(`  [0] Skip / use current environment as-is`);
  console.log('');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question('Select competitor number: ', (a) => { rl.close(); resolve(a.trim()); });
  });

  const idx = parseInt(answer, 10);
  if (!answer || isNaN(idx) || idx === 0) return null;
  if (idx < 1 || idx > competitors.length) {
    console.warn(`Invalid selection "${answer}" — skipping competitor selection.`);
    return null;
  }
  return competitors[idx - 1];
}

/**
 * Update swaploop-module-c-local.yml so that:
 *   baseUrl              → https://<un>-<pw>-module-c-solution.sitc.skillsit.eu/api/v1
 *   stationServiceBaseUrl → https://<un>-<pw>-station-service.sitc.skillsit.eu
 */
function updateEnvYml(competitor) {
  const { username: un, pin: pw } = competitor;
  const baseUrl = `https://${un}-${pw}-module-c-solution.sitc.skillsit.eu/api/v1`;
  const stationUrl = `https://${un}-${pw}-station-service.sitc.skillsit.eu`;

  let yml = fs.readFileSync(ENV_YML, 'utf8');

  // Replace only the two active URL variables (not the *Deployment variants)
  yml = yml.replace(
    /(- name: baseUrl\s*\n\s*value: )(\S+)/,
    `$1${baseUrl}`,
  );
  yml = yml.replace(
    /(- name: stationServiceBaseUrl\s*\n\s*value: )(\S+)/,
    `$1${stationUrl}`,
  );

  fs.writeFileSync(ENV_YML, yml, 'utf8');
  console.log(`Updated env → baseUrl: ${baseUrl}`);
  console.log(`Updated env → stationServiceBaseUrl: ${stationUrl}`);
}

function parseArgs(argv) {
  const opts = {
    env: 'swaploop-module-c-local',
    out: path.join(COLLECTION_ROOT, 'reports'),
    marking: DEFAULT_MARKING,
    exclude: ['F7'],
    sandbox: 'developer',
    dryParse: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--env') opts.env = argv[++i];
    else if (a === '--out') opts.out = path.resolve(argv[++i]);
    else if (a === '--marking') opts.marking = path.resolve(argv[++i]);
    else if (a === '--sandbox') opts.sandbox = argv[++i];
    else if (a === '--dry-parse') opts.dryParse = path.resolve(argv[++i]);
    else if (a === '--exclude') {
      const raw = argv[++i] || '';
      opts.exclude = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (a === '--no-exclude') {
      opts.exclude = [];
    } else {
      console.error(`Unknown argument: ${a}`);
      opts.help = true;
    }
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node scripts/run-bruno-report.js [options]

Options:
  --env <name>           Bruno environment (default: swaploop-module-c-local)
  --out <dir>            Report output directory (default: ./reports)
  --marking <path>       marking-scheme.json path
  --exclude <ids>        Comma-separated aspect ids to exclude from exit fail
                         (default: F7). Use --no-exclude to include all.
  --sandbox <mode>       Bruno JS sandbox: developer|safe (default: developer)
  --dry-parse <json>     Skip bru run; parse an existing bruno-raw.json
  -h, --help             Show help
`);
}

function extractLabel(text) {
  if (!text || typeof text !== 'string') return null;
  const m = text.trim().match(LABEL_RE);
  return m ? m[1] : null;
}

function loadMarkingAspects(markingPath) {
  const scheme = JSON.parse(fs.readFileSync(markingPath, 'utf8'));
  const aspects = [];
  for (const sc of scheme.subCriterions || []) {
    for (const a of sc.aspects || []) {
      const id = extractLabel(a.description);
      aspects.push({
        id,
        description: a.description,
        maxMark: a.maxMark,
        wsosSection: a.wsosSection,
        subCriterion: sc.name,
        extraDescription: a.extraDescription || '',
      });
    }
  }
  return { scheme, aspects };
}

function flattenBrunoResults(raw) {
  // Bruno 4 JSON reporter: array of iterations { iterationIndex, summary, results[] }
  const iterations = Array.isArray(raw) ? raw : raw?.iterations || [raw];
  const requests = [];
  for (const iteration of iterations) {
    const list = iteration?.results || iteration?.items || [];
    for (const r of list) {
      requests.push(r);
    }
  }
  return { iterations, requests };
}

function collectTests(result) {
  const bags = [
    result.preRequestTestResults,
    result.testResults,
    result.postResponseTestResults,
  ];
  const tests = [];
  for (const bag of bags) {
    if (!Array.isArray(bag)) continue;
    for (const t of bag) {
      tests.push({
        description: t.description || t.name || '',
        status: t.status || (t.error ? 'fail' : 'pass'),
        error: t.error || null,
      });
    }
  }
  if (Array.isArray(result.assertionResults)) {
    for (const a of result.assertionResults) {
      tests.push({
        description: `${a.lhsExpr || ''} ${a.operator || ''} ${a.rhsExpr || ''}`.trim(),
        status: a.status || (a.error ? 'fail' : 'pass'),
        error: a.error || null,
      });
    }
  }
  return tests;
}

function requestPassed(result, tests) {
  if (result.skipped) return 'skipped';
  if (result.error) return 'fail';
  if (tests.length === 0) {
    // No tests — treat HTTP error as fail when present
    const status = result.response?.status ?? result.status;
    if (typeof status === 'number' && status >= 400) return 'fail';
    return 'pass';
  }
  return tests.every((t) => t.status === 'pass') ? 'pass' : 'fail';
}

function labelsFromRequest(result, tests) {
  const labels = new Set();
  const nameLabel = extractLabel(result.name);
  if (nameLabel) labels.add(nameLabel);
  const fileLabel = extractLabel(path.basename(result.test?.filename || result.path || ''));
  if (fileLabel) labels.add(fileLabel);
  for (const t of tests) {
    const id = extractLabel(t.description);
    if (id) labels.add(id);
  }
  return [...labels];
}

function normalizeFsPath(p) {
  return String(p || '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
}

function brunoPathsFromExtra(extraDescription) {
  if (!extraDescription) return [];
  const paths = [];
  // e.g. "Bruno: auth/B1 - login.yml — ..." or "Bruno: foo.yml and bar.yml"
  const re = /([\w./\\-]+(?:\s+-\s+[\w./\\-]+)*\.yml)/g;
  let m;
  while ((m = re.exec(extraDescription))) {
    paths.push(normalizeFsPath(m[1].trim()));
  }
  return [...new Set(paths)];
}

function resolveBucketForAspect(aspect, byLabel, byFile) {
  const id = aspect.id;
  if (id && byLabel.has(id)) return byLabel.get(id);

  const paths = brunoPathsFromExtra(aspect.extraDescription);
  const matched = [];
  for (const p of paths) {
    const base = path.basename(p);
    const hit =
      byFile.get(normalizeFsPath(p)) ||
      byFile.get(base) ||
      [...byFile.entries()].find(([k]) => k.endsWith('/' + base) || k.endsWith('\\' + base) || k === base)?.[1];
    if (hit) matched.push(hit);
  }
  if (!matched.length) return null;

  return {
    requests: matched,
    tests: matched.flatMap((r) => r.tests),
    statuses: matched.map((r) => r.status),
  };
}

function buildReport({ raw, markingPath, env, collectionPath, bruVersion, durationMs, excludeIds }) {
  const { scheme, aspects: markingAspects } = loadMarkingAspects(markingPath);
  const { iterations, requests } = flattenBrunoResults(raw);
  const exclude = new Set(excludeIds.map((x) => x.toUpperCase()));

  const byLabel = new Map(); // id -> { requests: [], tests: [], statuses: [] }
  const byFile = new Map(); // filename / relative path -> entry
  const setup = [];

  for (const result of requests) {
    const tests = collectTests(result);
    const status = requestPassed(result, tests);
    const labels = labelsFromRequest(result, tests);
    const filename = result.test?.filename || result.path || '';
    const entry = {
      name: result.name || '',
      path: result.path || filename,
      filename,
      runDuration: result.runDuration ?? null,
      status,
      error: result.error || null,
      tests,
      labels,
    };

    const norm = normalizeFsPath(filename);
    if (norm) {
      byFile.set(norm, entry);
      byFile.set(path.basename(norm), entry);
    }

    if (labels.length === 0) {
      setup.push(entry);
      continue;
    }

    for (const id of labels) {
      if (!byLabel.has(id)) {
        byLabel.set(id, { requests: [], tests: [], statuses: [] });
      }
      const bucket = byLabel.get(id);
      bucket.requests.push(entry);
      bucket.tests.push(
        ...tests.filter((t) => extractLabel(t.description) === id || !extractLabel(t.description)),
      );
      bucket.statuses.push(status);
    }
  }

  const aspects = [];
  const gaps = [];

  for (const aspect of markingAspects) {
    const id = aspect.id;
    if (!id) {
      gaps.push({ ...aspect, reason: 'no-label-in-description' });
      continue;
    }

    const bucket = resolveBucketForAspect(aspect, byLabel, byFile);

    if (exclude.has(id.toUpperCase())) {
      aspects.push({
        id,
        description: aspect.description,
        maxMark: aspect.maxMark,
        wsosSection: aspect.wsosSection,
        subCriterion: aspect.subCriterion,
        status: 'excluded',
        requestName: bucket?.requests?.[0]?.name || null,
        file: bucket?.requests?.[0]?.filename || null,
        tests: bucket?.tests || [],
        error: null,
      });
      continue;
    }

    if (!bucket) {
      aspects.push({
        id,
        description: aspect.description,
        maxMark: aspect.maxMark,
        wsosSection: aspect.wsosSection,
        subCriterion: aspect.subCriterion,
        status: 'missing',
        requestName: null,
        file: null,
        tests: [],
        error: 'No Bruno result matched this aspect label or Bruno path in extraDescription',
      });
      continue;
    }

    const failed = bucket.statuses.some((s) => s === 'fail');
    const allSkipped = bucket.statuses.every((s) => s === 'skipped');
    aspects.push({
      id,
      description: aspect.description,
      maxMark: aspect.maxMark,
      wsosSection: aspect.wsosSection,
      subCriterion: aspect.subCriterion,
      status: failed ? 'fail' : allSkipped ? 'skipped' : 'pass',
      requestName: bucket.requests.map((r) => r.name).join('; '),
      file: bucket.requests.map((r) => r.filename || r.path).filter(Boolean).join('; '),
      tests: bucket.tests,
      error: failed
        ? bucket.requests
            .filter((r) => r.status === 'fail')
            .map((r) => r.error || r.tests.find((t) => t.status === 'fail')?.error)
            .filter(Boolean)
            .join(' | ') || 'test failed'
        : null,
    });
  }

  // Labeled Bruno results not in marking scheme
  const markingIds = new Set(markingAspects.map((a) => a.id).filter(Boolean));
  const unlabeledAspectHits = [];
  for (const [id, bucket] of byLabel) {
    if (!markingIds.has(id)) {
      unlabeledAspectHits.push({
        id,
        status: bucket.statuses.some((s) => s === 'fail') ? 'fail' : 'pass',
        requests: bucket.requests.map((r) => r.name),
      });
    }
  }

  const scored = aspects.filter((a) => a.status !== 'excluded');
  const summary = {
    requests: requests.length,
    setupRequests: setup.length,
    aspectsTotal: aspects.length,
    aspectsPass: scored.filter((a) => a.status === 'pass').length,
    aspectsFail: scored.filter((a) => a.status === 'fail').length,
    aspectsMissing: scored.filter((a) => a.status === 'missing').length,
    aspectsExcluded: aspects.filter((a) => a.status === 'excluded').length,
    aspectsSkipped: scored.filter((a) => a.status === 'skipped').length,
    marksAvailable: scored
      .filter((a) => a.status === 'pass')
      .reduce((s, a) => s + (Number(a.maxMark) || 0), 0),
    marksPossible: scored.reduce((s, a) => s + (Number(a.maxMark) || 0), 0),
    totalMarkDeclared: scheme.totalMark,
  };

  const iterationSummary = iterations[0]?.summary || null;

  return {
    meta: {
      timestamp: new Date().toISOString(),
      env,
      collectionPath,
      markingPath,
      bruVersion,
      durationMs,
      exclude: [...exclude],
    },
    summary,
    brunoSummary: iterationSummary,
    aspects,
    setup,
    gaps,
    extraBrunoLabels: unlabeledAspectHits,
  };
}

function toMarkdown(report) {
  const lines = [];
  lines.push('# Module C Bruno marking report');
  lines.push('');
  lines.push(`- Generated: ${report.meta.timestamp}`);
  lines.push(`- Environment: \`${report.meta.env}\``);
  lines.push(`- Duration: ${report.meta.durationMs} ms`);
  lines.push(`- Bruno: ${report.meta.bruVersion || 'unknown'}`);
  if (report.meta.exclude?.length) {
    lines.push(`- Excluded aspects: ${report.meta.exclude.join(', ')}`);
  }
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(
    `| Aspects pass | fail | missing | excluded | Marks earned / possible |`,
  );
  lines.push(`| --- | --- | --- | --- | --- |`);
  lines.push(
    `| ${report.summary.aspectsPass} | ${report.summary.aspectsFail} | ${report.summary.aspectsMissing} | ${report.summary.aspectsExcluded} | ${report.summary.marksAvailable} / ${report.summary.marksPossible} (declared ${report.summary.totalMarkDeclared}) |`,
  );
  lines.push('');
  lines.push('## Aspects');
  lines.push('');
  lines.push('| Aspect | Status | Marks | Request |');
  lines.push('| --- | --- | --- | --- |');
  for (const a of report.aspects) {
    const req = (a.requestName || '-').replace(/\|/g, '\\|');
    lines.push(`| ${a.id} | ${a.status} | ${a.maxMark} | ${req} |`);
  }

  const fails = report.aspects.filter((a) => a.status === 'fail' || a.status === 'missing');
  if (fails.length) {
    lines.push('');
    lines.push('## Failures / missing');
    lines.push('');
    for (const a of fails) {
      lines.push(`### ${a.id} — ${a.status}`);
      lines.push('');
      lines.push(a.description);
      if (a.error) lines.push(`\n\`${a.error}\``);
      lines.push('');
    }
  }

  if (report.setup?.length) {
    lines.push('');
    lines.push('## Setup / unlabeled requests');
    lines.push('');
    for (const s of report.setup) {
      lines.push(`- **${s.status}** ${s.name || s.path}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function statusBadge(status) {
  const colors = { pass: '#22c55e', fail: '#ef4444', missing: '#f59e0b', excluded: '#a3a3a3', skipped: '#a3a3a3' };
  const bg = colors[status] || '#a3a3a3';
  return `<span style="background:${bg};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;">${escHtml(status)}</span>`;
}

function wsosLabel(section) {
  const names = {
    1: 'Work Organization & Management',
    2: 'Communication & Interpersonal Skills',
    3: 'Design Implementation',
    4: 'Front-End Development',
    5: 'Back-End Development',
  };
  return names[section] || `Section ${section}`;
}

function toHtml(report, title) {
  const s = report.summary;
  const pct = s.marksPossible > 0 ? ((s.marksAvailable / s.marksPossible) * 100).toFixed(1) : '0.0';
  const dur = report.meta.durationMs >= 1000
    ? (report.meta.durationMs / 1000).toFixed(1) + 's'
    : report.meta.durationMs + 'ms';
  const excluded = report.meta.exclude?.length ? ` &bull; Excluded: ${escHtml(report.meta.exclude.join(', '))}` : '';

  const lines = [];
  lines.push(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Marking Report – ${escHtml(title)}</title>
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
<h1>Marking Report – ${escHtml(title)}</h1>
<p class="meta">${escHtml(report.meta.timestamp)} &bull; env: ${escHtml(report.meta.env)} &bull; Bruno ${escHtml(report.meta.bruVersion || 'unknown')} &bull; ${dur}${excluded}</p>

<div class="progress-bar"><div class="fill" style="width:${pct}%"></div></div>

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
<tbody>`);

  let lastSub = '';
  for (const a of report.aspects) {
    if (a.subCriterion !== lastSub) {
      lastSub = a.subCriterion;
      lines.push(`<tr class="group-header"><td colspan="5">${escHtml(a.subCriterion)} <small>(WSOS ${a.wsosSection} – ${escHtml(wsosLabel(a.wsosSection))})</small></td></tr>`);
    }
    const earnedMark = a.status === 'pass' ? a.maxMark : 0;
    const testsHtml = a.tests && a.tests.length
      ? a.tests.map((t) => `<div class="test ${t.status}">${escHtml(t.description)}</div>`).join('')
      : '<em>—</em>';
    lines.push(`<tr class="aspect ${a.status}">
      <td class="id">${escHtml(a.id)}</td>
      <td>${statusBadge(a.status)}</td>
      <td class="mark">${earnedMark} / ${a.maxMark}</td>
      <td class="desc">${escHtml(a.description)}</td>
      <td class="tests">${testsHtml}</td>
    </tr>`);
  }

  lines.push(`
</tbody>
</table>

`);

  const fails = report.aspects.filter((a) => a.status === 'fail' || a.status === 'missing');
  if (fails.length) {
    lines.push('<h2>Failures / Missing</h2>');
    for (const a of fails) {
      lines.push(`<div style="margin:12px 0;padding:12px;background:#fef2f2;border-radius:6px;border-left:4px solid #ef4444;">
  <strong>${escHtml(a.id)}</strong> — ${escHtml(a.status)}<br>
  ${escHtml(a.description)}${a.error ? `<br><code class="err">${escHtml(a.error)}</code>` : ''}
</div>`);
    }
  }

  lines.push(`
</body>
</html>`);
  return lines.join('\n');
}

function bruVersion() {
  const r = spawnSync('bru', ['--version'], { encoding: 'utf8', shell: true });
  return (r.stdout || r.stderr || '').trim() || null;
}

function runBruno({ env, outDir, sandbox, excludeIds }) {
  const jsonPath = path.join(outDir, 'bruno-raw.json');
  const htmlPath = path.join(outDir, 'bruno-raw.html');
  const junitPath = path.join(outDir, 'bruno-raw.xml');

  const exclude = (excludeIds || []).map((x) => x.trim()).filter(Boolean);

  const args = [
    'run',
    '-r',
    '.',
    '--env',
    env,
    '--sandbox',
    sandbox,
    '--reporter-json',
    jsonPath,
    '--reporter-html',
    htmlPath,
    '--reporter-junit',
    junitPath,
    '--reporter-skip-body',
  ];

  // Requests tagged with the aspect id (e.g. info.tags: [F7]) are omitted from the CLI run.
  if (exclude.length) {
    args.push('--exclude-tags', exclude.join(','));
    console.log(`Excluding Bruno tags: ${exclude.join(', ')}`);
  }

  console.log(`> bru ${args.join(' ')}`);
  console.log(`  cwd: ${COLLECTION_ROOT}`);

  const started = Date.now();
  const result = spawnSync('bru', args, {
    cwd: COLLECTION_ROOT,
    encoding: 'utf8',
    shell: true,
    stdio: 'inherit',
  });
  const durationMs = Date.now() - started;

  return {
    durationMs,
    exitCode: result.status ?? 1,
    jsonPath,
    htmlPath,
    junitPath,
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  // Competitor selection — runs unless --out was explicitly supplied
  const outExplicit = process.argv.slice(2).includes('--out');
  const competitor = outExplicit ? null : await selectCompetitor();
  if (competitor) {
    updateEnvYml(competitor);
    // Place reports in a subfolder named by the competitor's username
    opts.out = path.join(COLLECTION_ROOT, 'reports', competitor.username);
    console.log(`Reports will be written to: ${opts.out}\n`);
  }

  if (!fs.existsSync(opts.marking)) {
    console.error(`marking-scheme.json not found: ${opts.marking}`);
    process.exit(2);
  }

  fs.mkdirSync(opts.out, { recursive: true });

  const version = bruVersion();
  let durationMs = 0;
  let jsonPath = opts.dryParse;

  if (!opts.dryParse) {
    const run = runBruno({
      env: opts.env,
      outDir: opts.out,
      sandbox: opts.sandbox,
      excludeIds: opts.exclude,
    });
    durationMs = run.durationMs;
    jsonPath = run.jsonPath;
    if (!fs.existsSync(jsonPath)) {
      console.error(`Bruno did not write JSON report at ${jsonPath} (exit ${run.exitCode})`);
      process.exit(run.exitCode || 1);
    }
  } else {
    console.log(`Dry-parse: ${jsonPath}`);
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const report = buildReport({
    raw,
    markingPath: opts.marking,
    env: opts.env,
    collectionPath: COLLECTION_ROOT,
    bruVersion: version,
    durationMs,
    excludeIds: opts.exclude,
  });

  const jsonOut = path.join(opts.out, 'marking-report.json');
  const mdOut = path.join(opts.out, 'marking-report.md');
  const htmlOut = path.join(opts.out, 'marking-report.html');
  const reportTitle = competitor ? competitor.username : path.basename(opts.out);
  fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdOut, toMarkdown(report));
  fs.writeFileSync(htmlOut, toHtml(report, reportTitle));

  console.log('');
  console.log(`Wrote ${jsonOut}`);
  console.log(`Wrote ${mdOut}`);
  console.log(`Wrote ${htmlOut}`);
  console.log(
    `Aspects: ${report.summary.aspectsPass} pass, ${report.summary.aspectsFail} fail, ${report.summary.aspectsMissing} missing, ${report.summary.aspectsExcluded} excluded`,
  );
  console.log(
    `Marks: ${report.summary.marksAvailable} / ${report.summary.marksPossible} (scheme total ${report.summary.totalMarkDeclared})`,
  );

  const hardFail =
    report.summary.aspectsFail > 0 || report.summary.aspectsMissing > 0;
  process.exit(hardFail ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
