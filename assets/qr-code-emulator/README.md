# SwapLoop QR-code emulator

This asset contains:

- a framework-independent `<swaploop-qr-emulator>` Web Component;
- a Vite + React JavaScript application that demonstrates and tests the component;
- a simple simulator controller that lists Station Service QR codes and selects the current code.

## Run the complete demo

Start the Station Service first:

```bash
cd ../station-service
npm install
npm run dev
```

In another terminal, start the React demo:

```bash
cd ../qr-code-emulator
npm install
npm run dev
```

Open `http://localhost:5173`.

## Use the Web Component

Import [`src/swaploop-qr-emulator.js`](src/swaploop-qr-emulator.js), then add:

```html
<swaploop-qr-emulator
  service-url="http://localhost:4020"
  scan-duration="2500"
></swaploop-qr-emulator>
```

The Web Component contains only the scanner visualization and request logic. Its host application owns the instructions, payload display, and action buttons. Start or cancel scanning through the public methods:

```js
scanner.startScan();
scanner.cancelScan();
scanner.reset();
```

Listen for the framework-independent events:

```js
scanner.addEventListener("qr-scan", (event) => {
  console.log(event.detail.payload);
});

scanner.addEventListener("qr-scan-state", (event) => {
  console.log(event.detail.state, event.detail.message);
});
```

When the user starts a scan, the component sends exactly one `GET /api/qr/current` request. It does not poll or retry automatically. A successful response is rendered as a real QR image; an error is reported through `qr-scan-state`, and the host application may let the user try again.

## Configuration

- `service-url`: Station Service base URL; default `http://localhost:4020`.
- `scan-duration`: minimum duration of the visual scanning effect in milliseconds; default `2500`.
- `VITE_STATION_SERVICE_URL`: optional Station Service URL for the React demo.

## Verify

```bash
npm test
npm run build
```
