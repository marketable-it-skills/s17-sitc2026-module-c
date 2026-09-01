# Bruno CLI report runner

Runs the SwapLoop Module C Main Backend Bruno collection from the command line, writes Bruno’s native reports, then builds a **marking-aligned** summary keyed by aspect labels (`A1`, `B2`, …).

## Prerequisites

1. **Bruno CLI** on `PATH` (`npm i -g @usebruno/cli` — tested with 4.0.0).
2. Services running and reachable from the Bruno environment:
   - Main Backend → `baseUrl` (default `http://localhost:5000/api/v1`)
   - Station Service → `stationServiceBaseUrl` (default `http://localhost:4020`)
3. Environment file: [`../environments/swaploop-module-c-local.yml`](../environments/swaploop-module-c-local.yml)

## Usage

From this collection root (`assets/bruno/main-backend`):

```bash
node scripts/run-bruno-report.js
```

Defaults:

- `--env swaploop-module-c-local`
- `--out ./reports`
- `--exclude F7` (fail-closed / Station Service down is assessor-manual; omits the tagged F7 request from `bru run`)
- `--sandbox developer` (needed for `await bru.sleep` waits on F3 / E11)

**F7 note:** Automated runs omit F7 by default. To score it: stop Station Service, create a CHARGING hold, set collection var `failClosedChargingServiceId`, then `node scripts/run-bruno-report.js --no-exclude`. If that var is unset, F7 skips itself (avoids a spurious 404).

Examples:

```bash
# Include F7 in scoring (expect fail unless Station Service is stopped)
node scripts/run-bruno-report.js --no-exclude

# Exclude several aspects from exit-code / mark totals
node scripts/run-bruno-report.js --exclude F7,E11

# Re-parse an existing Bruno JSON without re-running
node scripts/run-bruno-report.js --dry-parse ./reports/bruno-raw.json
```

## Outputs (`reports/`)

| File | Purpose |
| --- | --- |
| `bruno-raw.json` | Bruno CLI JSON reporter |
| `bruno-raw.html` | Bruno HTML report |
| `bruno-raw.xml` | JUnit XML |
| `marking-report.json` | Structured aspect pass/fail vs `marking/marking-scheme.json` |
| `marking-report.md` | Human-readable table |

Do not commit `reports/` (ignored via `opencollection.yml` + `reports/.gitignore`).

## Expected run time

Full suite is **several minutes**:

- **F3** waits ~17s for the bike-bay charging session (Station Service default **15s**)
- **E11** waits ~11s for hold expiry (holds are **10s**)

## Exit code

- `0` — every non-excluded labeled aspect **pass**
- `1` — at least one non-excluded aspect **fail** or **missing**
- `2` — marking scheme path missing / usage error

Setup-only (unlabeled) request failures are listed under “Setup” in the Markdown report but do not by themselves fail the exit code unless they also break a labeled aspect.

## Under the hood

```bash
bru run -r . --env swaploop-module-c-local --sandbox developer \
  --exclude-tags F7 \
  --reporter-json reports/bruno-raw.json \
  --reporter-html reports/bruno-raw.html \
  --reporter-junit reports/bruno-raw.xml \
  --reporter-skip-body
```
