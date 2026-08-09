# Module C assets

| Path | Purpose |
| ---- | ------- |
| [`api/main-backend.openapi.yaml`](./api/main-backend.openapi.yaml) | Authoritative Main Backend OpenAPI (`/api/v1`) |
| [`db/swaploop_db.sql`](./db/swaploop_db.sql) | MySQL seed dump (import or `POST /reset`) |
| [`station-service/`](./station-service/) | Provided Station Service (QR, last-charge telemetry, live bike-bay sessions) |
| [`qr-code-emulator/`](./qr-code-emulator/) | Station poster QR emulator (used mainly by Module D) |
| [`bruno/`](./bruno/) | Bruno / OpenCollection HTTP suite for the Main Backend |
| [`handouts/`](./handouts/) | Auth identities, last-charge rules, live charging notes |

Default local URLs:

- Main Backend: `http://localhost:5000/api/v1`
- Station Service: `http://localhost:4020`
