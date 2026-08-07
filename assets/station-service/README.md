# SwapLoop Station Service prototype

This TypeScript/Express service provides the QR-code simulation used by the SwapLoop frontend prototype. QR-code records are stored in [`src/data/qr-codes.json`](src/data/qr-codes.json). The currently selected QR code is kept in memory and is cleared whenever the service restarts.

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

## Verify

```bash
npm test
npm run build
```

An importable Bruno collection is available under [`bruno/`](bruno/). Start the service, open that directory in Bruno, select the `Local` environment, and run the requests in sequence.
