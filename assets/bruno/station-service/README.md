# Station Service Bruno collection

1. Start the Station Service from the parent directory with `npm run dev`.
2. Open this `bruno/` directory as a collection in Bruno.
3. Select the `Local` environment.
4. Run folders in order: **reset** (optional), **qr**, **charging-telemetry**, then **bike-bay-charging**.

## Folders

### `qr/`

| # | Request | Expected |
| - | ------- | -------- |
| 01 | List all QR codes | `200`, 5 station QR records |
| 02 | Select active QR code | `200`, `qr-002` payload |
| 03 | Get current QR payload | `200`, deep-link for `station-002` |
| 04 | Select disabled QR for simulation | `200`, `qr-004` |
| 05 | Get disabled current QR payload | `200`, deep-link for `station-004` |
| 06 | Reject unknown QR code | `404 QR_CODE_NOT_FOUND` |
| 07 | Reject invalid selection request | `400 INVALID_REQUEST` |

### `charging-telemetry/`

| # | Request | Expected |
| - | ------- | -------- |
| 01 | Get OK charging telemetry (`battery-001`) | `200`, dense safe samples, no derived fields |
| 02 | Get spike charging telemetry (`battery-005`) | `200`, max temperature `62.7` |
| 03 | Get sustained charging telemetry (`battery-007`) | `200`, no spike; ≥5 min mean `> 50` |
| 04 | Reject unknown battery | `404 NOT_FOUND` |
| 05 | Reject known battery without telemetry (`battery-002`) | `404 NO_TELEMETRY` |

Environment variables (see `environments/Local.bru`): `baseUrl`, `batteryOkId`, `batterySpikeId`, `batterySustainedId`, `batteryNoTelemetryId`, `batteryUnknownId`.

### `reset/`

| # | Request | Expected |
| - | ------- | -------- |
| 01 | Reset Module C database | `200`, `{ "status": "ok" }` |
