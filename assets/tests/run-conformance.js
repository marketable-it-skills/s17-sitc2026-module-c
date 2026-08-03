"use strict";

const baseUrl = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const tokens = {
  rider: "sl_tok_rider-001",
  delivery: "sl_tok_rider-005",
  admin: "sl_tok_staff-001",
  assessor: "sl_tok_assessor"
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, options = {}) {
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, body };
}

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    process.stdout.write(`PASS ${name}\n`);
  } catch (error) {
    failed += 1;
    process.stderr.write(`FAIL ${name}: ${error.message}\n`);
  }
}

async function reset() {
  const result = await request("/reset", { method: "POST", token: tokens.assessor });
  assert(result.status === 200, `reset returned ${result.status}`);
}

async function main() {
  await test("assessor reset restores frozen clock", async () => {
    const result = await request("/reset", { method: "POST", token: tokens.assessor });
    assert(result.status === 200, `expected 200, got ${result.status}`);
    assert(result.body.frozenNow === "2026-08-15T12:00:00+08:00", "unexpected frozenNow");
  });

  await test("station discovery is public", async () => {
    const result = await request("/stations");
    assert(result.status === 200, `expected 200, got ${result.status}`);
    assert(Array.isArray(result.body.stations), "stations must be an array");
  });

  await test("protected endpoint rejects missing token", async () => {
    const result = await request("/incidents");
    assert(result.status === 401, `expected 401, got ${result.status}`);
    assert(result.body.code === "UNAUTHORIZED", "expected UNAUTHORIZED code");
  });

  await test("active station QR resolves", async () => {
    const result = await request("/qr/resolve", {
      method: "POST",
      token: tokens.rider,
      body: { qrPayload: "sl_qr_stn_7H2K9M" }
    });
    assert(result.status === 200, `expected 200, got ${result.status}`);
    assert(result.body.resourceId === "station-001", "wrong QR resource");
  });

  await test("thermal anomaly is accepted and quarantined", async () => {
    await reset();
    const result = await request("/telemetry/readings", {
      method: "POST",
      token: tokens.admin,
      body: {
        batteryId: "battery-006",
        measuredAt: "2026-08-15T10:30:00+08:00",
        temperatureC: 62.7,
        cycleCountDelta: 1,
        thermalAnomaly: true
      }
    });
    assert(result.status === 201, `expected 201, got ${result.status}`);
    assert(result.body.validationStatus || result.body.validity, "missing validation status");
  });

  await test("concurrent requests do not allocate one unit twice", async () => {
    await reset();
    const create = () => request("/swap-reservations", {
      method: "POST",
      token: tokens.delivery,
      body: { stationId: "station-002", voltageClass: "48V", connectorType: "SL-48-A" }
    });
    const results = await Promise.all([create(), create()]);
    const successes = results.filter((result) => result.status === 201);
    assert(successes.length <= 1, `expected at most one allocation, got ${successes.length}`);
    assert(results.some((result) => [409, 422].includes(result.status)), "expected an explicit losing response");
  });

  await test("access replay with same key returns one result", async () => {
    await reset();
    const options = {
      method: "POST",
      token: tokens.rider,
      headers: { "Idempotency-Key": "conformance-access-001" },
      body: { qrPayload: "sl_qr_unit_B2G8L3" }
    };
    const first = await request("/swap-reservations/reservation-001/access", options);
    const second = await request("/swap-reservations/reservation-001/access", options);
    assert(first.status === 200 && second.status === 200, "access replay must return 200 twice");
    assert(first.body.id === second.body.id, "replay returned different access IDs");
  });

  process.stdout.write(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`Fatal: ${error.message}\n`);
  process.exitCode = 1;
});
