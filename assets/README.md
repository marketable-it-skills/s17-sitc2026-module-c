# Module C assets

## Included assets

- `api/swaploop-api.openapi.yaml` — authoritative OpenAPI 3.0 contract.
- `api/test-identities.json` — fixed bearer tokens and actor mappings.
- `handouts/handout-authentication-and-test-identities.md` — authentication and role rules.
- `handouts/handout-charging-rules.md` — deterministic duration, expiry, collection, cutoff, and billing rules.
- `handouts/handout-qr-emulator-integration.md` — minimal React, Vue, and Angular integration examples for the supplied Web Component.
- `bruno/` — runnable Bruno endpoint and scenario collection.
- `tests/` — dependency-free Node.js conformance runner with concurrency and replay checks.
- `mock-telemetry-api/` — deterministic Node.js feed with Docker support and normal, late, thermal, cutoff, and malformed batches.
- `station-service/` — TypeScript/Express Station Service prototype for listing QR codes and simulating the currently scanned QR payload.
- `qr-code-emulator/` — framework-independent QR scanner Web Component with a Vite React JavaScript integration demo.
- `data/module-c-seed/swaploop-api.mysql.sql` — self-contained MySQL/MariaDB seed for the compact 13-table schema.
- `data/module-c-seed/manifest.json` and `compact-*.json` — canonical metadata and records.

## Validation entry points

- Import `data/module-c-seed/swaploop-api.mysql.sql`.
- Run `npm start` from `mock-telemetry-api/`, or build its Dockerfile.
- Run `npm install` and `npm run dev` from `station-service/` for the QR simulation API.
- Run `npm install` and `npm run dev` from `qr-code-emulator/` for the Web Component React demo.
- Open `bruno/` in Bruno and select the `Local` environment.
- Run `npm test` from `tests/` against the competitor API.
