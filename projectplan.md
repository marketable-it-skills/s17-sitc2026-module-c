# Project plan – s17-sitc2026-module-c (Process 1: Update content)

## Goal

Rewrite competitor-facing content for SwapLoop Module C to match the refined product model in:

- `sitc2026-test-project-creation/brain-stormings/.../system-description.hu.md`
- `sitc2026-test-project-creation/brain-stormings/.../module-c-prd.md`

Style/structure template: `project-tasks/references/s17-es2027-hu-r3-module_c-skillshare-academy-lms-rest-api-backend/project-description.md`.

**Process 1 files:** `project-description.md`, `metadata.json`, `README.md` (+ this `projectplan.md`).

**Also required for truthful links:** repack `assets/` (OpenAPI, SQL seed, station-service, qr-code-emulator, Bruno).

**Out of scope this pass:** marking scheme (`marking/marking-scheme.json` remains stub until Process 2).

## Competition scope (resolved)

Competitors implement the **PRD competition core** (Delivery priority / HU reference section):

| In scope | Out of scope |
| -------- | ------------ |
| Auth login/register → opaque bearer | JWT libraries / OAuth / refresh |
| Mode-driven vehicle profile | Separate voltageClass column |
| Stations list/detail + filters + compatibility + optional riderAvailability | Required `GET /stations/{id}/availability` |
| Station poster HTTPS deep link only | Cabinet/bay/battery QR, `/qr/resolve`, access grants |
| Unified `services` lifecycle + 15 min hold | Separate reservations / service_sessions tables as competitor schema |
| Station Service last-charge + live bike-bay sessions | Mock-telemetry ingest API as primary path; health-band cycle table as primary |
| PAYG `price_list` + snapshot on confirm/collect; `GET /price-list` | Subscriptions, proration, real Alipay |
| Seed: users, stations, station_units, services, price_list | Full 13-table competition schema |
| `POST /reset` | Incidents / safety-cutoff automation APIs |

## Conflicts (HU ↔ PRD) and resolutions

| Topic | Resolution used in brief |
| ----- | ------------------------ |
| Alipay at register | HU two-step is Module D UX; Module C only register/login API (no Alipay fields) |
| `GET /price-list` | In competitor minimum routes (PRD “implemented” list was stale) |
| Asset/solution paths | Competition assets under `assets/`; author solutions under `sitc2026-test-project-creation/solutions/` |
| Roles | Rider + assessor/reset; no required staff APIs |
| Broader acceptance items | Incidents/subscriptions/availability-endpoint out of 3h module scope |

## Requirement → section traceability

| Source requirement | Destination in project-description |
| ------------------ | ---------------------------------- |
| SwapLoop narrative / station types | Introduction; General Description |
| Auth email/password → token | ### Authentication; ##### login/register |
| Vehicle profile mode-driven | ### Vehicle profiles |
| Station list/detail/filters/riderAvailability | #### Stations endpoints |
| Station QR deep link | ### Station QR; Introduction assets |
| Swap workflow + STARTED + confirm inventory | ### Unified services; Swap #####s |
| Charging + SS session + charging-status + collect | Charging #####s |
| Last-charge spike/sustained/NO_TELEMETRY | ### Battery safety; evaluate endpoint |
| PAYG price_list + snapshot | ### Pay-as-you-go; price-list #####; confirm/collect responses |
| Atomic holds / idempotency / errors | Technical constraints; Error Handling |
| Reset seed | ##### POST /reset |
| OpenAPI contract | Requirements opening; Assessment |
| Station Service / QR emulator provided | Environment and provided assets |
| Out of scope (payments, hardware, cabinet QR, subscriptions) | Introduction + Technical constraints |

## Implementation checklist

1. [x] Document scope + conflicts in this plan
2. [x] Repack assets from solutions
3. [x] Rewrite project-description.md (SkillShare style)
4. [x] Update metadata.json + README.md
5. [x] Review section below after implementation

## Review

**Completed:** Process 1 content rewrite + asset repack.

**Coverage check (competition core):**

| Area | Present in project-description? |
| ---- | ------------------------------- |
| Auth login/register opaque token | Yes |
| Mode-driven vehicle profile | Yes |
| Stations list/detail/filters/riderAvailability | Yes |
| Station QR deep link only | Yes |
| Unified services + 15 min hold | Yes |
| Swap start/confirm/cancel + inventory | Yes |
| Charging start/status/ready/collect | Yes |
| Last-charge spike/sustained/NO_TELEMETRY | Yes |
| PAYG price_list + snapshot + GET /price-list | Yes |
| Reset | Yes |
| OpenAPI + Station Service + Bruno assets linked | Yes |
| Out of scope (subscriptions, cabinet QR, incidents APIs) | Yes |

**PRD/HU conflicts resolved in brainstorm:** Alipay wording; `GET /price-list` on implemented list; solution path note.

**Remaining (not this process):** Process 2 marking scheme (`marking/marking-scheme.json` still `{}`); optional English `system-description.md` (README no longer requires it).

**Style:** Follows ES2027 SkillShare Module C skeleton (`##### METHOD /path`, JSON examples, mermaid ER, Assessment bullets, WSOS table).