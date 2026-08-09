# SwapLoop Station Service prototype

This TypeScript/Express service provides station-side simulation used by SwapLoop prototypes: QR-code scanning and last charging-event telemetry. QR-code records are stored in [`src/data/qr-codes.json`](src/data/qr-codes.json). Charging telemetry reports are stored in [`src/data/charging-telemetry.json`](src/data/charging-telemetry.json). The currently selected QR code is kept in memory and is cleared whenever the service restarts.

**Station-only model:** each seeded station from Module C (`station-001` … `station-005`) has exactly one QR. The payload is an HTTPS deep link:

```text
https://app.swaploop.test/stations/{stationId}
```

Unit, cabinet, and battery QR codes are out of scope. `station-004` (SUSPENDED in the DB seed) is stored as `DISABLED` so assessors can still select it for negative-path simulation.

## Requirements

- Node.js 20 or later

## Run locally

```bash
npm install
npm run dev
```

The default URL is `http://localhost:4020`. Set `PORT` to use another port.

## Endpoints

### List every QR code

```http
GET /api/qr-codes
```

Returns every record from the JSON file, including disabled QR codes.

### Select the current QR code

```http
POST /api/qr/current
Content-Type: application/json

{
  "qrId": "qr-001"
}
```

Any stored QR code can be selected, including a disabled code. This allows clients to test negative paths. The Station Service simulates scanning only; the Main Backend is responsible for validating station lifecycle and authorization.

### Read the current payload

```http
GET /api/qr/current
```

Successful response:

```json
{
  "payload": "https://app.swaploop.test/stations/station-001"
}
```

The endpoint returns `404 CURRENT_QR_NOT_SET` until a QR code has been selected.

### Last charging-event telemetry

```http
GET /api/batteries/{batteryId}/last-charging-telemetry
```

Unauthenticated. Returns the last completed charging event’s raw sample series for a managed swap battery. Station Service does **not** evaluate quarantine rules.

Seeded reports:

| `batteryId` | Role |
| ----------- | ---- |
| `battery-001` | OK (safe temperatures) |
| `battery-005` | Spike sample above 55 °C |
| `battery-007` | Sustained heat (5-minute mean above 50 °C, no spike) |
| `battery-008` | OK (safe temperatures; fallback pack on `station-002`) |
| `battery-002`, `battery-003`, `battery-006`, `battery-010` | Known batteries with empty `telemetryData` → `404 NO_TELEMETRY` |

Successful response fields: `batteryId`, `startTime`, `endTime`, `telemetryData[]` with `time`, `temperature`, `chargingVoltage` only.

Errors: `404 NOT_FOUND` (unknown battery), `404 NO_TELEMETRY` (battery known but no completed charging event / empty samples), `422 VALIDATION_ERROR` (invalid `batteryId`).

### Live bike-bay charging sessions (integrated e-bike)

In-memory simulation for Module C charging services (default **15 seconds**):

```http
POST /api/bike-bays/{unitId}/charging/sessions
Content-Type: application/json

{ "serviceId": "service-…", "durationSeconds": 15 }
```

```http
GET /api/bike-bays/{unitId}/charging/sessions/current
```

While running: `status: "CHARGING"` plus growing `samples` (`time`, `socPercent`, `chargingPowerKw`, `temperature`). After the duration: `status: "COMPLETED"` with full series and `endedAt`.

```http
DELETE /api/bike-bays/{unitId}/charging/sessions/current
```

Clears the session (Module C calls this after collect). Active session already running → `409 CONFLICT`.

## Verify

```bash
npm test
npm run build
```

An importable Bruno collection is available under [`bruno/`](bruno/). Start the service, open that directory in Bruno, select the `Local` environment, and run the `qr`, `charging-telemetry`, and `bike-bay-charging` folders.
