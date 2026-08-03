# Authentication and test identities

SwapLoop Module C uses a fixed, deterministic bearer-token scheme. Competitors must implement exactly this scheme. The Bruno collection under `assets/bruno/` uses the same tokens.

## Scheme

Protected endpoints require:

```http
Authorization: Bearer <token>
```

- Missing, unknown, or malformed tokens → `401` with machine-readable error `code` `UNAUTHORIZED`.
- Valid token for a suspended account → authenticate the actor, but refuse state-changing rider operations with `403`.
- Valid token with insufficient role for the operation → `403`.
- Do not implement login, registration, password hashing, OAuth, or JWT libraries for this module. Token values are static and listed below.

Public endpoints (no `Authorization` header required) are only those marked without security in [`../api/swaploop-api.openapi.yaml`](../api/swaploop-api.openapi.yaml), currently:

- `GET /stations`
- `GET /stations/{stationId}`
- `GET /stations/{stationId}/availability`

## Token → actor mapping

Tokens are opaque strings. Map each token to the seeded actor in `assets/data/module-c-seed/compact-core.json`. Rider compatibility fields are stored directly on the seeded `users` row.

| Bearer token | Actor ID | Role | Status | Delivery partner | Typical use in tests |
| ------------ | -------- | ---- | ------ | ---------------- | -------------------- |
| `sl_tok_rider-001` | `rider-001` | `RIDER` | `ACTIVE` | — | Swap workflow (48V swappable) |
| `sl_tok_rider-002` | `rider-002` | `RIDER` | `ACTIVE` | — | Bike-bay charging |
| `sl_tok_rider-003` | `rider-003` | `RIDER` | `ACTIVE` | — | Bike-bay charging |
| `sl_tok_rider-004` | `rider-004` | `DELIVERY_RIDER` | `ACTIVE` | `partner-001` | Partner priority swap |
| `sl_tok_rider-005` | `rider-005` | `DELIVERY_RIDER` | `ACTIVE` | `partner-002` | Non-priority delivery rider |
| `sl_tok_rider-006` | `rider-006` | `RIDER` | `SUSPENDED` | — | Suspended-account `403` cases |
| `sl_tok_staff-001` | `staff-001` | `OPERATOR_ADMIN` | `ACTIVE` | — | List incidents and operational status |
| `sl_tok_staff-002` | `staff-002` | `SAFETY_INSPECTOR` | `ACTIVE` | — | Resolve incidents |
| `sl_tok_staff-003` | `staff-003` | `PARTNER_OPERATOR` | `ACTIVE` | `partner-001` | Partner-operator authorization |
| `sl_tok_assessor` | `assessor` | `ASSESSOR` | `ACTIVE` | — | `POST /reset` only |

Machine-readable copy: [`../api/test-identities.json`](../api/test-identities.json).

## Role rules (summary)

| Role | May |
| ---- | --- |
| `RIDER` / `DELIVERY_RIDER` | Own reservations, access/confirm/start/collect, `/me/activity`, own receipts and subscription usage/changes, report incidents |
| `PARTNER_OPERATOR` | Partner-scoped operational reads as required by the OpenAPI (not rider mutations for other riders) |
| `OPERATOR_ADMIN` | List incidents and operational status |
| `SAFETY_INSPECTOR` | List incidents; resolve incidents |
| `ASSESSOR` | `POST /reset` (and nothing else unless also granted by another token) |

State-changing rider operations must be bound to the authenticated rider and their active reservation. Ownership failures return `403`.

## Reset

`POST /reset` accepts only `Authorization: Bearer sl_tok_assessor`. Any other identity, including `OPERATOR_ADMIN`, must receive `403`.
