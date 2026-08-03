# Project plan – s17-sitc2026-module-c (Process 1: Update content)

## Goal

Standardize **only** `project-description.md`, `metadata.json`, and `README.md` for SwapLoop Module C against the MITS Project Task Creation Guide, using the ES2027 SkillShare Academy LMS REST API backend description as the **structural and clarity** reference.

**Out of scope for this process:** marking scheme (`marking/marking-scheme.json` remains untouched), inventing missing competition assets, fabricating per-endpoint JSON schemas that are not in the original brief.

## Source material

| Item | Path |
| ---- | ---- |
| Staging project | `project-tasks/staging/s17-sitc2026-module-c/` |
| Original brief (current) | `project-description.md` (SwapLoop REST API Backend) |
| Structural reference | `project-tasks/references/s17-es2027-hu-r3-module_c-skillshare-academy-lms-rest-api-backend/project-description.md` |
| MITS guide | `.claude/guide/mits-project-task-creation-guide.md` |
| Assets | `assets/data/module-c-seed/`, `assets/data/seed-data/`, `assets/README.md` |

## Structural model (from ES2027 Module C reference)

Adopt the reference’s information architecture **without** copying SkillShare domain content:

1. **Document title** – `# Test Project Outline – Module C – …`
2. **Competition time** – short prose with bold duration (e.g. Competitors will have **3 hours**…)
3. **Introduction** – product/context narrative and module purpose (backend contract for later frontend modules)
4. **General Description of Project and Tasks**
   - High-level bullet overview of main work packages, with links/anchors to Requirements
   - Environment / stack / seed import notes
   - `###` subsections for cross-cutting concerns (auth, common behaviour / errors, technical constraints, seed & reset, submission)
5. **Requirements**
   - Goal statement + domain `###` subsections
   - Where helpful, `####` for workflows, rule tables, and route groups (like the reference’s endpoint subsections)
   - Keep behaviour rules; do **not** invent request/response JSON examples that the original brief does not define (OpenAPI remains competitor deliverable)
6. **Assessment**
7. **Mark distribution** – keep draft WSOS table; note final criterion points live in `marking/marking-scheme.json`

## Planned file changes

### `project-description.md`

Reorganize and clarify language; preserve every requirement.

Proposed outline:

```markdown
# Test Project Outline – Module C – SwapLoop REST API Backend

## Competition time
Competitors will have **3 hours** to complete this module.

## Introduction
[SwapLoop narrative + purpose as API for later frontend modules]

## General Description of Project and Tasks
[High-level task bullets → Requirements]
### Environment and stack
### Technical constraints
### Common API behaviour and errors
### Authentication and roles
### Seed data and reset
### Submission

## Requirements
### Stations, resources, and availability
### QR identification and access grants
### Battery telemetry and health
### Swap reservations and confirmation
#### Swap workflow
### Charging reservations and sessions
#### Charging workflow
### Rider activity and receipts
### Accounts, plans, and billing
### Incidents and safety inspections
### Funding and rollout extension
### Minimum routes

## Assessment
## Mark distribution
```

Clarity edits (meaning unchanged):

- Split long paragraphs into scannable lists where the reference does so
- Make competition-core vs secondary vs extension scope explicit in General Description
- Present minimum routes as a clear method/path table (same routes as original)
- Call out asset paths and the known gaps documented in `assets/README.md` (charging-rule handout, mock telemetry, starter OpenAPI, test suite) as “required before competition release / to be supplied” — **without inventing those files**
- Keep health classification table and deterministic rule order verbatim in substance
- Keep frozen time `2026-08-15T12:00:00+08:00`, timezone `Asia/Shanghai`, and seed paths

### `metadata.json`

- Keep identity fields (`name`, `displayName`, `url`, `competition`, `estTime`, `authors`)
- Tighten `description` to action-verb style listing purpose + key capabilities + technical constraints (MySQL, OpenAPI, concurrency/idempotency), matching reference description density
- Align `technologies` / `tags` with stack mentioned in the brief (REST, OpenAPI, MySQL, JSON; optionally note Node/PHP frameworks available in environment without implying a mandatory stack)

### `README.md`

Align section casing and MITS blurb style with the ES2027 reference (`Task origin`, `About the project`) while keeping accurate SITC 2026 / SwapLoop / author facts.

## Explicit non-changes

- Do not alter `assets/` contents or invent missing handouts/OpenAPI/tests
- Do not change or generate `marking/marking-scheme.json` in this process
- Do not add SkillShare/LMS content, health-check endpoints, or other scope not present in the SwapLoop brief
- Do not invent concrete JSON request/response bodies for routes

## Todo list

| ID | Task | Status |
| -- | ---- | ------ |
| T1 | Draft and approve this plan (user gate) | completed |
| T2 | Rewrite `project-description.md` to the outline above | completed |
| T3 | Update `metadata.json` description / tech tags | completed |
| T4 | Align `README.md` with MITS + reference style | completed |
| T5 | Requirement coverage double-check → Review section below | completed |

---

## Requirement traceability checklist

Every original instruction / deliverable mapped to the planned updated location. **O** = original `project-description.md`; **A** = `assets/`.

| # | Original requirement / deliverable | Source | Planned location in updated task |
| - | ---------------------------------- | ------ | -------------------------------- |
| 1 | Competition duration: 3 hours | O Competition time | Competition time |
| 2 | SwapLoop Shanghai pilot narrative (battery swap + integrated-bike charging bays, delivery priority, operators/inspectors) | O Introduction | Introduction |
| 3 | Build deterministic REST API; backend contract for later frontend modules | O Introduction | Introduction + General Description |
| 4 | Independently runnable JSON REST API; allowed env stack (MySQL 8.4, Node, PHP, frameworks listed) | O General Description | General Description → Environment and stack |
| 5 | Persist with MySQL; import `assets/data/module-c-seed/swaploop-api.mysql.sql` | O General Description | Environment and stack + Seed data and reset |
| 6 | Canonical JSON / manifest under `assets/data/seed-data/` for reference | O General Description | Environment and stack + Seed data and reset |
| 7 | Competition core: stations/availability, QR, atomic reservations, separate idempotent access/confirm/start/collect, telemetry/health/safety, RBAC/ownership, reset | O General Description | General Description overview bullets + matching Requirements subsections |
| 8 | Secondary scope: accounts, subscriptions, billing, incidents, funding, rollout | O General Description | General Description (scope) + Requirements subsections |
| 9 | Extension if time limited: funding and rollout analytics | O General Description | General Description (scope) + Funding and rollout extension |
| 10 | OpenAPI-first; submit OpenAPI for every implemented route | O Technical constraints | Technical constraints + Submission |
| 11 | JSON for all normal and error responses | O Technical constraints | Technical constraints + Common API behaviour |
| 12 | Timezone `Asia/Shanghai`; ISO 8601 with explicit offset | O Technical constraints | Technical constraints |
| 13 | Frozen clock `2026-08-15T12:00:00+08:00` after reset; no workstation clock dependency | O Technical constraints | Technical constraints + Seed data and reset |
| 14 | Atomic reservation allocation and state transitions under concurrency | O Technical constraints | Technical constraints + swap/charging Requirements |
| 15 | No silent substitution of station/resource/voltage/connector/service | O Technical constraints | Technical constraints |
| 16 | QR payloads untrusted opaque IDs; never authorization credentials | O Technical constraints + QR section | Technical constraints + QR Requirements |
| 17 | Physical locks/hardware simulated via logical state + short-lived grants | O Technical constraints | Technical constraints + QR / workflows |
| 18 | Out of scope: real payments, IoT, routing, native apps, ML, chemistry sim, physical control | O Technical constraints | Technical constraints |
| 19 | Successful mutations return stable ID, state, server timestamp | O Common API behaviour | Common API behaviour and errors |
| 20 | Idempotency key on access, swap-confirm, charging-start, charging-collect; same key+input → original; conflict on reuse with different input | O Common API behaviour | Common API behaviour + Minimum routes |
| 21 | Error object: `code`, `message`, field details; status codes 401/403/404/409/422/429/5xx | O Common API behaviour | Common API behaviour and errors |
| 22 | Auth via seeded credentials or bearer tokens; document in OpenAPI + README | O Common API behaviour | Authentication and roles + Submission |
| 23 | Roles: riders, delivery riders, delivery-partner operators, operator/admin, safety inspectors | O Common API behaviour | Authentication and roles |
| 24 | Rider state-changing ops bound to authenticated rider + active reservation | O Common API behaviour | Authentication and roles + swap/charging |
| 25 | Station list/detail/availability; nearby/location filters; service/compatibility filters | O Stations… | Requirements → Stations… |
| 26 | Station types `SWAP`/`CHARGING`/`HYBRID`; lifecycle, location, radius, compatibility, public availability | O Stations… | Requirements → Stations… |
| 27 | Availability from resource state + reservations; swap bays by voltage/reservation; bike charging bays; excluded capacity reasons | O Stations… | Requirements → Stations… |
| 28 | Suspended station discoverable but not reservable | O Stations… | Requirements → Stations… |
| 29 | Durable opaque QR for stations, bays, units, batteries; no availability/reservation/payment/PII in payload | O QR… | Requirements → QR… |
| 30 | Resolve station QR → public details + availability; bay/unit QR identifies only; battery QR may verify returned battery | O QR… | Requirements → QR… |
| 31 | Unknown/disabled/replaced/mismatched QR → explicit errors; disable/replace QR without changing resource ID | O QR… | Requirements → QR… |
| 32 | AccessGrant validations (auth, ownership, state/window, station/resource match, compatibility, safety); short-lived; auditable; copied QR cannot bypass | O QR… | Requirements → QR… |
| 33 | Telemetry: accept mock feed; preserve payload + validation; malformed/partial/late/stale handled without corrupting history | O Battery… | Requirements → Battery telemetry and health |
| 34 | Append-only versioned health assessments; seeded records + fixed classification table | O Battery… | Requirements → Battery telemetry and health |
| 35 | Deterministic classification order: thermalAnomaly→QUARANTINE; else cycles>900→RETIRE; else table; thermal creates incident | O Battery… | Requirements → Battery telemetry and health |
| 36 | No overwrite of readings/assessments; effective dates; QUARANTINE/RETIRE/UNKNOWN/stale never swap-eligible | O Battery… | Requirements → Battery telemetry and health |
| 37 | Swap workflow steps 1–8 (validate, select eligible, partner priority, atomic reserve, access, confirm, transaction, expire once) | O Swap… | Requirements → Swap… / Swap workflow |
| 38 | Expose reservation status + server expiry; failed access/confirm must not partially change inventory | O Swap… | Requirements → Swap… |
| 39 | Charging: integrated-battery bikes use `BIKE_BAY`; validate mode/profile/voltage/connector/station/unit/safety; incompatible removable batteries are out of scope | O Charging… | Requirements → Charging… |
| 40 | Charging states `reserved`→`charging`→`ready_for_collection`→`collected` (+ `expired`, `safety_cutoff`) | O Charging… | Requirements → Charging… / Charging workflow |
| 41 | Charging workflow steps 1–8; durations from charging-rule handout + seed; client timestamps forbidden | O Charging… | Requirements → Charging… (+ asset gap note) |
| 42 | Prevent overlap, double start/collect, faulted/blocked unit use | O Charging… | Requirements → Charging… |
| 43 | Authenticated rider activity; receipts with service type/time/station/resource/billing/currency | O Rider activity… | Requirements → Rider activity and receipts |
| 44 | Plans: pay-per-use, monthly-quota, partner-fleet; quota/overage; preview/change/cancel; proration calendar days; `NEAREST_WHOLE_CNY`; no payment provider | O Accounts… | Requirements → Accounts, plans, and billing |
| 45 | Auto incidents on thermal anomaly / safety cutoff; quarantine/block; rider reports; list vs resolve permissions; full lifecycle; no silent return-to-service | O Incidents… | Requirements → Incidents… |
| 46 | Funding ledger append-only; derived grant dependency ratio; rollout targets reproducible from records + frozen time | O Funding… | Requirements → Funding and rollout extension |
| 47 | Minimum route list (stations…reset); paths adjustable except separate QR access / confirm / start / collect | O Minimum routes | Requirements → Minimum routes |
| 48 | Seed scenarios listed (swap, bike-bay charging, QR mismatch, disabled/unknown QR, thermal, stale/malformed telemetry, partner priority, safety cutoff, proration, suspended station) | O Seed data and reset + A manifest | Seed data and reset |
| 49 | `POST /reset` restores canonical dataset + frozen time + IDs; removes post-reset mutations; protected from riders; document assessor auth | O Seed data and reset | Seed data and reset |
| 50 | Submission package: source, deps/env, DB import/reset docs, OpenAPI, README (setup/auth/identities/design), automated tests where practical | O Submission | Submission |
| 51 | API independently runnable; Modules D/E consume without reimplementing business rules | O Submission | Submission / Introduction |
| 52 | Assessment methods: automated HTTP, concurrency, DB inspection, OpenAPI validation, expert review; focus on observable behaviour | O Assessment | Assessment |
| 53 | Assessment minimum checks (concurrency, idempotency, thermal override, stale health exclusion, charging compatibility, partner priority, QR bypass prevention, safety cutoff incident, deterministic billing/funding, reset, error shape) | O Assessment | Assessment |
| 54 | Draft mark distribution WSOS 1/2/5 = 5/5/90; final criteria in marking-scheme.json | O Mark distribution | Mark distribution |
| 55 | Asset: MySQL seed `swaploop-api.mysql.sql` + module-c-seed manifest | A | Environment / Seed; README content link |
| 56 | Asset: seed-data JSON + scenarios; generator retained for traceability | A | Environment / Seed; assets README note retained |
| 57 | Known missing release assets (mock telemetry, starter OpenAPI, charging-rule handout, conformance tests) — not fabricated | A README | General Description / Charging / Submission notes pointing to `assets/README.md` |

---

## Review (Process 1 complete)

**Approved:** user approved the plan (2026-08-02).

### Changes made

1. **`project-description.md`** — Restructured to match the ES2027 Module C reference pattern:
   - Competition time as prose with bold duration
   - General Description overview bullets + core/secondary/extension scope
   - Cross-cutting `###` sections: Environment and stack, Technical constraints, Common API behaviour and errors, Authentication and roles, Seed data and reset, Submission
   - Requirements domain subsections retained; Swap/Charging workflows as `####`
   - Minimum routes converted to a method/path/notes table (same routes; no invented JSON bodies)
   - Asset gap note retained via `assets/README.md` links
2. **`metadata.json`** — Expanded action-verb `description`; added Node.js/PHP to `technologies` (environment options, not a mandated stack)
3. **`README.md`** — Aligned section titles and MITS blurb with the ES2027 reference style; origin facts unchanged

### Coverage verification

- Spot-checked 40+ critical tokens (frozen time, health bands, status codes, routes, plans, roles, asset paths): all present
- Header hierarchy matches MITS guide + planned outline
- Traceability items 1–57: preserved (reorganized or clarified only); no original requirement omitted
- No fabricated request/response JSON schemas
- Marking scheme not modified (`marking/marking-scheme.json` still empty placeholder `{}`)

### Gaps / follow-ups (outside Process 1)

- Missing release assets remain documented in `assets/README.md` (mock telemetry, starter OpenAPI, charging-rule handout, test suite) — not fabricated
- Process 2 (marking scheme) still needed when an Excel source or authoring pass is requested

---

# Revision plan — compact 13-table Module C database

## Goal

Align the draft task with the approved compact Module C architecture. Preserve all rider-facing and safety behaviour while reducing persistence from 29 tables to 13. Funding and rollout remain Module B concerns. QR access tokens and scan attempts remain runtime behaviour but are not persisted as database entities.

## Planned changes

| ID | Change | Files | Status |
| -- | ------ | ----- | ------ |
| C1 | Replace the active Module C seed with the compact 13-table fixture and regenerated MariaDB-compatible dump | `assets/data/module-c-seed/*` | completed |
| C2 | Remove the obsolete detailed seed-data package from the competitor assets to avoid two competing schemas | `assets/data/seed-data/*` | completed |
| C3 | Keep existing actor IDs (`rider-*`, `staff-*`) while storing all actors in one `users` table; embed vehicle compatibility on rider rows | compact JSON, SQL, identity assets | completed |
| C4 | Remove funding and rollout paths, tags, and schemas; retain transient access-grant API responses without a database table | `assets/api/swaploop-api.openapi.yaml` | completed |
| C5 | Update authentication documentation and identity JSON to remove `vehicleProfileId` dependencies and funding/rollout permissions | handout and `test-identities.json` | completed |
| C6 | Update task prose to require exactly 13 persistence tables and describe unified station units, reservations, and service sessions | `project-description.md` | completed |
| C7 | Update repository summaries and asset inventory | `metadata.json`, `README.md`, `assets/README.md` | completed |
| C8 | Validate all JSON, regenerate SQL, confirm exactly 13 `CREATE TABLE` statements, check cross-references and MariaDB compatibility, and validate OpenAPI YAML syntax | all changed task assets | completed |
| C9 | Supply deterministic charging rules, mock telemetry service/container, Bruno collection, and automated conformance runner | `assets/handouts/`, `assets/mock-telemetry-api/`, `assets/bruno/`, `assets/tests/` | completed |
| C10 | Add a concise, non-technical system description organized by user role and service journey | `system-description.md`, `README.md` | completed |
| C11 | Remove separate removable-battery charging; retain swapping and integrated-bike charging bays | task prose, API, handouts, compact seed, SQL, topic briefs | completed |

## Compact table set

1. `users`
2. `delivery_partners`
3. `stations`
4. `station_units`
5. `qr_identifiers`
6. `batteries`
7. `telemetry_readings`
8. `health_assessments`
9. `incidents`
10. `reservations`
11. `service_sessions`
12. `subscriptions`
13. `priority_windows`

## Requirement traceability for the revision

| Existing task requirement | Compact implementation |
| ------------------------- | ---------------------- |
| Rider, staff, partner identity and compatibility | One `users` table plus `delivery_partners`; compatibility fields live on rider rows |
| Swap bays and bike charging bays | One `station_units` table distinguished by `unit_type` |
| Swap and charging reservations | One `reservations` table distinguished by `service_type` |
| Swap transactions and charging sessions | One `service_sessions` table distinguished by `service_type` |
| QR station/resource resolution | `qr_identifiers`; access tokens remain transient and authorization-bound |
| QR access audit requirement | Observable API result and service-session timestamps; no QR scan-log table required |
| Telemetry safety and historical bands | `telemetry_readings` plus append-only `health_assessments` |
| Idempotency | Unique `idempotency_key` on persisted `service_sessions`; no separate idempotency table |
| Plans, quota, overage, and proration | Plan terms embedded in `subscriptions`; charges stored on `service_sessions` |
| Incidents | `incidents` table with affected station/battery and lifecycle fields |
| Partner priority | `priority_windows` plus unit partner reservation field |
| Funding and rollout | Removed from Module C task and OpenAPI; retained in Module B only |
| Reset and deterministic clock | Compact seed manifest and self-contained SQL dump |

## Explicit non-changes

- Do not modify `marking/marking-scheme.json` in this revision.
- Do not remove QR access, concurrency, idempotency, telemetry safety, charging state, subscription, incident, or reset behaviour.
- Do not add real payments, hardware control, or IoT integration.
- Keep the 3-hour competition duration and frozen Shanghai timestamp.

## Approval gate

Approved by the user on 2026-08-02, with explicit instruction to implement all previously missing competition assets immediately.

## Revision review

- Canonical seed reduced from 29 tables to exactly 13 tables and 71 rows.
- All JSON assets parse successfully.
- Seed relationship checks pass for users, stations, units, batteries, reservations, and sessions.
- SQL contains exactly 13 `CREATE TABLE` statements and no `CAST(... AS JSON)` or MySQL-only `utf8mb4_0900_ai_ci` collation.
- OpenAPI YAML parses successfully, contains 24 paths, and all local `$ref` values resolve.
- Funding and rollout routes, tags, schemas, permissions, and prose were removed from Module C.
- Mock telemetry JavaScript and conformance-runner JavaScript pass syntax checks.
- Mock telemetry `/health` and `/batches/thermal` runtime checks pass.
- Bruno collection, charging handout, mock telemetry container, and automated conformance runner are present; no asset remains marked as pending or “to be supplied.”
- `marking/marking-scheme.json` was not modified.
