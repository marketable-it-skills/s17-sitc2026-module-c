# Test Project Outline – Module C – SwapLoop REST API Backend

## Competition time

Competitors will have **3 hours** to complete this module.

## Introduction

SwapLoop is a fictional Shanghai community pilot exploring safer alternatives to charging e-bike batteries indoors. Riders exchange compatible removable batteries at swap stations or charge e-bikes with built-in batteries in monitored bike bays; delivery partners can receive controlled priority access; and operators and safety inspectors monitor assets and incidents.

This competition does **not** ask for a finished production platform. Across the modules you build **working prototypes** of selected parts of SwapLoop. This module is the backend prototype: a deterministic REST API that later frontend modules will consume.

## General Description of Project and Tasks

Implement an independently runnable REST API according to the provided contract. Frontend modules must be able to use it without reproducing backend business rules. Predictable behaviour and clear machine-readable errors are essential.

The following is a high-level overview of the required capabilities; detailed specifications are in the [Requirements](#requirements) section:

- **Stations:** list and detail nearby swap, bike-charging, and hybrid stations, with live availability based on resource state and reservations
- **QR access:** resolve opaque station, unit, and battery QR codes; issue transient short-lived access grants only after authentication, ownership, and safety checks
- **Swap workflow:** let a rider book a station bay and a ready outgoing battery, unlock the bay with a QR scan, then confirm the physical battery exchange; concurrent bookings must never assign the same bay or battery twice, and unlock/confirm must be safe to retry
- **Charging workflow:** reserve a bike-charging bay, then run separate idempotent access, start-charging, and collection steps with server-calculated timings
- **Battery safety:** accept telemetry, classify health bands, quarantine or retire unsafe batteries, and keep append-only assessment history
- **Authorization:** enforce fixed bearer-token roles so riders only act on their own reservations and staff/inspectors only reach allowed operations
- **Accounts and billing:** track plan usage, proration, plan changes, and service receipts for seeded rider and partner subscriptions
- **Incidents:** auto-create and manage safety incidents from thermal anomalies and charging cutoffs; allow rider reports and inspector resolution
- **Reset:** restore the canonical seeded dataset and frozen competition clock for repeatable assessment

### Environment and stack

Build the API using a server-side language and framework available in the competition environment. 

- Use **MySQL** for persistence.
- Import the supplied seed database from [`assets/data/module-c-seed/swaploop-api.mysql.sql`](./assets/data/module-c-seed/swaploop-api.mysql.sql).
- The database is intentionally limited to **13 tables**. Dataset metadata and import order are described in [`assets/data/module-c-seed/manifest.json`](./assets/data/module-c-seed/manifest.json); the three canonical JSON fixtures are in the same directory.
- Implement the API exactly according to the provided OpenAPI document at [`assets/api/swaploop-api.openapi.yaml`](./assets/api/swaploop-api.openapi.yaml). That document is the authoritative contract for paths, requests, responses, security, and errors.
- Use the fixed authentication tokens and roles in [`assets/handouts/handout-authentication-and-test-identities.md`](./assets/handouts/handout-authentication-and-test-identities.md).
- Use the deterministic charging rules in [`assets/handouts/handout-charging-rules.md`](./assets/handouts/handout-charging-rules.md).
- Run the supplied mock telemetry feed from [`assets/mock-telemetry-api/`](./assets/mock-telemetry-api/).
- A Bruno collection is provided under [`assets/bruno/`](./assets/bruno/), and the automated conformance runner is under [`assets/tests/`](./assets/tests/).

The supplied assets are complete for this draft and use only deterministic local data.

### Technical constraints

- Implement every endpoint defined in [`assets/api/swaploop-api.openapi.yaml`](./assets/api/swaploop-api.openapi.yaml). Do not invent alternate paths or response shapes; the provided OpenAPI document is the contract assessors and later frontend modules will use.
- Return JSON for all normal and error responses.
- Use `Asia/Shanghai` as the business timezone. Return timestamps as ISO 8601 strings with an explicit offset.
- Treat the dataset's frozen time, `2026-08-15T12:00:00+08:00`, as the deterministic clock after reset. Time-dependent testing must not depend on the workstation clock.
- Persist state in MySQL. Reservation allocation and all state transitions must be atomic under concurrent requests.
- Do not silently substitute a different station, resource, voltage class, connector, or service when the requested option is unavailable.
- QR payloads are untrusted opaque identifiers. They are identifiers only and must never act as authorization credentials.
- Physical locks and charging hardware are simulated through logical state transitions and short-lived access grants. Access grants and QR scan attempts are runtime values and do not require database tables.
- Real payment processing, real IoT integration, route optimization, geodata routing, native mobile applications, machine learning, battery chemistry simulation, and physical device control are out of scope.

### Common API behaviour and errors

Every successful mutation must return a stable resource ID, its current state, and a server-generated timestamp.

The access, swap-confirmation, charging-start, and charging-collection operations must accept an **idempotency key**:

- Repeating the same operation with the same key and equivalent input must return the original result and must not create a second resource or transition.
- Reusing a key with conflicting input must return a conflict error.

Use consistent error objects containing at least a machine-readable `code`, a human-readable `message`, and relevant field details where appropriate. Apply HTTP status codes consistently:

| Status | When to use |
| ------ | ----------- |
| `401` | Missing or invalid authentication |
| `403` | Insufficient role, suspended account, failed ownership, or unauthorized resource access |
| `404` | Unknown resource or QR identifier where disclosure is safe |
| `409` | Reservation collisions, invalid state transitions, duplicate use, or idempotency conflicts |
| `422` | Syntactically valid requests that fail validation, compatibility, or business rules |
| `429` | Rate-limited operations |
| `5xx` | Unexpected server failures only |

### Authentication and roles

Use the fixed bearer-token scheme defined in [`assets/handouts/handout-authentication-and-test-identities.md`](./assets/handouts/handout-authentication-and-test-identities.md) and [`assets/api/test-identities.json`](./assets/api/test-identities.json). The same identities are used by the provided Bruno collection under [`assets/bruno/`](./assets/bruno/).

Send the token on protected routes as:

```http
Authorization: Bearer sl_tok_rider-001
```

Rules:

- Missing or unknown tokens → `401`.
- Suspended rider (`sl_tok_rider-006`) may authenticate but must receive `403` on state-changing rider operations.
- Role and ownership checks follow the handout; insufficient role or failed ownership → `403`.
- State-changing rider operations must be bound to the authenticated rider and their active reservation.
- `POST /reset` accepts only `Authorization: Bearer sl_tok_assessor`.

| Bearer token | Actor | Role | Status |
| ------------ | ----- | ---- | ------ |
| `sl_tok_rider-001` | `rider-001` | `RIDER` | `ACTIVE` |
| `sl_tok_rider-002` | `rider-002` | `RIDER` | `ACTIVE` |
| `sl_tok_rider-003` | `rider-003` | `RIDER` | `ACTIVE` |
| `sl_tok_rider-004` | `rider-004` | `DELIVERY_RIDER` | `ACTIVE` |
| `sl_tok_rider-005` | `rider-005` | `DELIVERY_RIDER` | `ACTIVE` |
| `sl_tok_rider-006` | `rider-006` | `RIDER` | `SUSPENDED` |
| `sl_tok_staff-001` | `staff-001` | `OPERATOR_ADMIN` | `ACTIVE` |
| `sl_tok_staff-002` | `staff-002` | `SAFETY_INSPECTOR` | `ACTIVE` |
| `sl_tok_staff-003` | `staff-003` | `PARTNER_OPERATOR` | `ACTIVE` |
| `sl_tok_assessor` | `assessor` | `ASSESSOR` | `ACTIVE` |

### Seed data and reset

Import the supplied seed database before running the API. The seeded API must preserve stable identifiers and contain scenarios for:

- swap service
- bike charging (`BIKE_BAY`)
- QR mismatch
- disabled and unknown QR identifiers
- thermal anomaly
- stale and malformed telemetry
- partner priority
- charging safety cutoff
- plan proration
- a suspended station

The required persistence tables are `users`, `delivery_partners`, `stations`, `station_units`, `qr_identifiers`, `batteries`, `telemetry_readings`, `health_assessments`, `incidents`, `reservations`, `service_sessions`, `subscriptions`, and `priority_windows`. Swap bays and bike charging bays share `station_units`; all reservation types share `reservations`; swap and charging histories share `service_sessions`.

`POST /reset` must restore the canonical dataset exactly, including the frozen time and all identifiers, and must remove mutations created since the previous reset. Authorize this operation only with `Authorization: Bearer sl_tok_assessor`.

## Requirements

The SwapLoop API shall implement the behaviours below. All routes, request bodies, responses, and errors must conform to [`assets/api/swaploop-api.openapi.yaml`](./assets/api/swaploop-api.openapi.yaml) (see also [Minimum routes](#minimum-routes)).

### Stations, resources, and availability

Implement station list, station detail, and station availability operations.

- The station list must support nearby or location-based filtering and filters relevant to service type and compatibility.
- A station has type `SWAP`, `CHARGING`, or `HYBRID` and exposes its lifecycle state, location, service radius, compatibility, and current public availability.
- Availability must be derived from current resource state and active reservations.

Report:

- ready swap bays grouped or filterable by voltage class and reservation status
- bike charging bays, including supported connector and voltage class, occupancy, and charging state
- capacity excluded because it is suspended, faulted, maintenance-blocked, safety-blocked, occupied, or reserved

A suspended station remains discoverable but must not offer reservable capacity.

### QR identification and access grants

Support durable opaque QR identifiers for stations, swap bays, charging units, and managed batteries. QR payloads must contain no availability, reservation, payment, or personal information.

- Resolving an active station QR returns current public station details and availability.
- Resolving a bay or charging-unit QR identifies the physical resource but grants no access.
- A battery QR may verify that the managed battery returned during a swap is the expected battery.
- Unknown, disabled, replaced, or mismatched QR identifiers return explicit machine-readable errors.
- QR identifiers can be disabled and replaced without changing the underlying resource ID.

Before issuing an `AccessGrant` for a state-changing operation, validate authentication, reservation ownership, reservation state and time window, station match, physical-resource match, compatibility, and safety state. A valid grant is a transient response containing its rider, reservation, physical resource, purpose, issue time, and expiry time. It does not require an access-grant or QR-scan database table. A copied QR code must not bypass any validation.

### Battery telemetry and health

Accept raw telemetry readings from the mock feed and preserve both the received payload and validation result. Handle malformed, partial, late, and stale readings deterministically without corrupting valid history.

Create append-only, versioned health assessments using the supplied seeded health records and the fixed table below.

| Cycle count | Maximum charging temperature during the last cycle | Health band | Required action |
| ----------- | -------------------------------------------------- | ----------- | --------------- |
| `< 300` | `< 45 °C` | `HEALTHY` | Eligible for swap |
| `300–600` | `< 45 °C` | `HEALTHY` | Eligible for swap |
| `300–600` | `45–55 °C` | `WATCH` | Eligible; inspect on next return |
| `> 600` and `≤ 900` | `≤ 55 °C` | `WATCH` | Eligible; inspect on next return |
| any count `≤ 900` | `> 55 °C` | `QUARANTINE` | Withdraw immediately |
| `> 900` | any temperature | `RETIRE` | Withdraw and schedule disposal |

Apply rules in this deterministic order:

1. A telemetry `thermalAnomaly` flag first forces `QUARANTINE`.
2. Otherwise a cycle count above 900 produces `RETIRE`.
3. Otherwise apply the temperature/cycle-count rows.

A thermal anomaly must immediately quarantine the affected battery and automatically create an incident, even when ordinary classification would produce another band.

Telemetry readings and health assessments must not be overwritten. Preserve effective dates so the health band valid at any historical service time can be reproduced. Batteries in `QUARANTINE`, `RETIRE`, or `UNKNOWN` health/lifecycle states, including batteries with stale telemetry, must never be offered as swap eligible.

### Swap reservations and confirmation

Implement the complete swap workflow. Expose reservation status so clients can display its current state and server-determined expiry. Failed access or confirmation must not partially change inventory.

#### Swap workflow

1. Validate the authenticated rider, vehicle profile, requested station, voltage class, connector, and service compatibility.
2. Select only eligible ready batteries and available swap bays at the requested station.
3. During an active delivery-partner priority window, apply reserved-bay priority only to eligible riders belonging to that partner. Priority must never bypass compatibility, authorization, or safety rules.
4. Atomically create one short-lived reservation. Two concurrent requests must never reserve the same bay or outgoing battery.
5. Validate the scanned bay QR through a separate idempotent access operation and issue a short-lived access grant.
6. Confirm the physical swap through a separate idempotent operation. An optional battery QR may validate the returned managed battery.
7. Create exactly one swap transaction, release the reservation, assign the outgoing battery, move the returned battery to reassessment, and record the health band that was valid at the swap timestamp.
8. Expire unused reservations safely and release their resources exactly once.

### Charging reservations and sessions

Support e-bikes with integrated batteries in compatible `BIKE_BAY` units. Validate battery mode, voltage class, connector, station state, unit state, and safety status before reservation. Removable batteries that are not compatible with SwapLoop are outside this pilot's scope.

Implement the charging workflow as explicit transitions:

`reserved` → `charging` → `ready_for_collection` → `collected`

Also support terminal or exceptional states `expired` and `safety_cutoff`.

Prevent overlapping reservations, double start, double collection, use of a faulted or blocked unit, and client-supplied transition timestamps. All eligibility and resulting timestamps are server determined.

#### Charging workflow

1. Atomically create a time-bounded reservation for exactly one compatible unit.
2. Validate the unit QR through a separate idempotent access operation and issue a short-lived access grant.
3. Start charging only from `reserved`, using a dedicated idempotent operation.
4. Calculate charging duration, readiness, collection deadline, and safety cutoffs using [`assets/handouts/handout-charging-rules.md`](./assets/handouts/handout-charging-rules.md).
5. Mark the session `ready_for_collection` at the calculated time. A collection timeout leaves this state unchanged but prevents any new reservation for that unit.
6. Collect only from `ready_for_collection`, using a dedicated idempotent operation, then release the unit.
7. On a safety cutoff, move the session to `safety_cutoff`, create an incident, and block the charging unit pending inspection.
8. Expire an unused charging reservation and release the unit safely.

### Rider activity and receipts

Provide an authenticated activity view combining the rider's swap and charging history. Each completed service must have a stable transaction or session ID and an accessible receipt containing the service type, time, station, resource, billing result, and currency.

### Accounts, plans, and billing

Support the seeded pay-per-use, monthly-quota, and partner-fleet plans. Implement deterministic quota consumption and overage charges. Support plan-change preview, confirmed plan change, and cancellation.

Proration must use exact calendar days in the active billing period and round the final monetary values to the nearest whole yuan (`NEAREST_WHOLE_CNY`). A preview and its corresponding change must produce reproducible results at billing boundaries. Do not contact a payment provider.

### Incidents and safety inspections

Automatically create an incident when a thermal anomaly or charging-unit safety cutoff occurs. Immediately quarantine the affected battery or block the affected capacity. Riders may report safety concerns. Operators and authorized safety inspectors can list incidents, while only authorized inspectors can record inspection and resolution actions.

Preserve the full incident lifecycle and history, including source, affected resources, detection time, severity, assignment, actions, resolution, resolver, and resolution time. Resolving an incident must not silently return an asset to service unless its safety state explicitly permits that transition.

### Minimum routes

Implement the operations defined in [`assets/api/swaploop-api.openapi.yaml`](./assets/api/swaploop-api.openapi.yaml). The required routes are summarized below. QR access, swap confirmation, charging start, and charging collection are separate operations in that contract and must remain so.

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET` | `/stations` | Station list with location and compatibility filters |
| `GET` | `/stations/{stationId}` | Station detail |
| `GET` | `/stations/{stationId}/availability` | Live availability |
| `POST` | `/qr/resolve` | Resolve opaque QR payload |
| `GET` | `/batteries/{batteryId}/health-history` | Append-only health assessments |
| `POST` | `/telemetry/readings` | Accept mock telemetry readings |
| `POST` | `/swap-reservations` | Create swap reservation |
| `GET` | `/swap-reservations/{id}` | Reservation status |
| `POST` | `/swap-reservations/{id}/access` | Idempotent bay access grant |
| `POST` | `/swap-reservations/{id}/confirm` | Idempotent swap confirmation |
| `POST` | `/charging-reservations` | Create charging reservation |
| `GET` | `/charging-reservations/{id}` | Reservation / session status |
| `POST` | `/charging-reservations/{id}/access` | Idempotent unit access grant |
| `POST` | `/charging-reservations/{id}/start` | Idempotent start charging |
| `POST` | `/charging-reservations/{id}/collect` | Idempotent collection |
| `GET` | `/me/activity` | Authenticated rider activity |
| `GET` | `/transactions/{id}/receipt` | Service receipt |
| `GET` | `/subscriptions/{id}/usage` | Plan usage |
| `POST` | `/subscriptions/{id}/preview-change` | Plan-change preview |
| `POST` | `/subscriptions/{id}/change` | Confirm plan change |
| `POST` | `/subscriptions/{id}/cancel` | Cancel subscription |
| `GET` | `/incidents` | List incidents (authorized roles) |
| `POST` | `/incidents` | Report incident |
| `POST` | `/incidents/{id}/resolve` | Resolve incident (inspectors) |
| `POST` | `/reset` | Restore canonical seed (assessor-protected) |

## Assessment

The solution will be assessed through automated HTTP tests (including the provided Bruno suite) against the OpenAPI contract, concurrent-request tests, database inspection, and expert review. Assessment will focus on observable API behaviour rather than the chosen framework.

At minimum, tests will verify that:

- concurrent requests cannot reserve the same swap bay, outgoing battery, or charging unit
- replaying an operation with the same idempotency key creates exactly one result
- thermal anomalies override ordinary health classification and quarantine the battery
- stale or unknown-health batteries are excluded from swap availability
- only integrated-battery profiles can reserve bike charging bays; incompatible removable batteries are rejected as out of scope
- partner priority is scoped correctly and never bypasses safety
- QR scans cannot bypass authentication, ownership, expiry, compatibility, or resource matching
- a charging safety cutoff creates an incident and blocks the unit
- billing calculations are deterministic
- reset restores the supplied scenarios
- common errors use the documented status and machine-readable error shape

## Mark distribution

The following is a draft distribution. Final criterion-level points must be defined in `marking/marking-scheme.json`.

| WSOS SECTION | Description                            | Points |
| ------------ | -------------------------------------- | -----: |
| 1            | Work organization and self-management  |      5 |
| 2            | Communication and interpersonal skills |      5 |
| 5            | Back-End Development                   |     90 |
| **Total**    |                                        | **100** |
