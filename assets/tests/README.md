# Automated conformance runner

Requires Node.js 20+ and a running competitor API.

```bash
npm test
```

Use a different API URL with:

```bash
BASE_URL=http://localhost:8080 npm test
```

The runner resets state between mutating scenarios and checks public discovery, authentication, QR resolution, thermal handling, concurrent reservation allocation, and idempotent access replay.
