# QR emulator Web Component

Load the supplied bundle once:

```html
<script src="/swaploop-qr-emulator.js"></script>
```

The Station Service must be available at the configured URL.

Changing `scan-request-id` starts one scan. The component emits `qr-scan`; the payload is available as `event.detail.payload`.

## React

```jsx
import { useEffect, useState } from "react";

const [requestId, setRequestId] = useState(0);

useEffect(() => {
  const receive = (event) => console.log(event.detail.payload);
  window.addEventListener("qr-scan", receive);
  return () => window.removeEventListener("qr-scan", receive);
}, []);

<swaploop-qr-emulator
  service-url="http://localhost:4020"
  scan-request-id={requestId}
/>
<button onClick={() => setRequestId((id) => id + 1)}>Scan</button>
```

## Vue

Configure Vue's `isCustomElement` option for tags starting with `swaploop-`.

```vue
<script>
export default {
  data: () => ({ requestId: 0 }),
  methods: {
    handleScan(event) {
      console.log(event.detail.payload);
    }
  }
};
</script>

<template>
  <swaploop-qr-emulator
    service-url="http://localhost:4020"
    :scan-request-id="requestId"
    @qr-scan="handleScan"
  />
  <button @click="requestId++">Scan</button>
</template>
```

## Angular

Add `CUSTOM_ELEMENTS_SCHEMA` to the component or module schemas.

```html
<swaploop-qr-emulator
  service-url="http://localhost:4020"
  [attr.scan-request-id]="requestId"
  (qr-scan)="handleScan($event)">
</swaploop-qr-emulator>

<button (click)="requestId = requestId + 1">Scan</button>
```

```ts
requestId = 0;

handleScan(event: Event) {
  console.log((event as CustomEvent).detail.payload);
}
```
