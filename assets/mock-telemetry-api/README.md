# Mock telemetry API

Run locally:

```bash
npm start
```

Or with Docker:

```bash
docker build -t swaploop-telemetry .
docker run --rm -p 4010:4010 swaploop-telemetry
```

Routes:

- `GET /health`
- `GET /batches`
- `GET /batches/normal`
- `GET /batches/late`
- `GET /batches/thermal`
- `GET /batches/cutoff`
- `GET /batches/malformed`
- `POST /reset`

The malformed route deliberately returns invalid JSON. All other responses are deterministic.
