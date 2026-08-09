import assert from "node:assert/strict";
import { test } from "node:test";

import request from "supertest";

import { createApp } from "../src/app";

test("GET last-charging-telemetry returns the seeded OK report for battery-001", async () => {
  const response = await request(createApp()).get(
    "/api/batteries/battery-001/last-charging-telemetry",
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.batteryId, "battery-001");
  assert.equal(response.body.startTime, "2026-08-15T08:00:00+08:00");
  assert.equal(response.body.endTime, "2026-08-15T10:30:00+08:00");
  assert.ok(Array.isArray(response.body.telemetryData));
  assert.ok(response.body.telemetryData.length > 100);
  assert.equal(
    Object.keys(response.body.telemetryData[0]).sort().join(","),
    "chargingVoltage,temperature,time",
  );
  assert.equal(response.body.maxTemperature, undefined);
  assert.equal(response.body.anomalyFlag, undefined);
  assert.equal(response.body.serviceUnitId, undefined);

  const maxTemp = Math.max(
    ...response.body.telemetryData.map((sample: { temperature: number }) => sample.temperature),
  );
  assert.ok(maxTemp <= 55);
});

test("GET last-charging-telemetry returns the spike report for battery-005", async () => {
  const response = await request(createApp()).get(
    "/api/batteries/battery-005/last-charging-telemetry",
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.batteryId, "battery-005");
  assert.ok(response.body.telemetryData.length > 100);

  const maxTemp = Math.max(
    ...response.body.telemetryData.map((sample: { temperature: number }) => sample.temperature),
  );
  assert.equal(maxTemp, 62.7);
});

test("GET last-charging-telemetry returns the sustained report for battery-007", async () => {
  const response = await request(createApp()).get(
    "/api/batteries/battery-007/last-charging-telemetry",
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.batteryId, "battery-007");
  assert.ok(response.body.telemetryData.length > 100);

  const temps = response.body.telemetryData.map(
    (sample: { temperature: number }) => sample.temperature,
  );
  assert.ok(Math.max(...temps) <= 55);
});

test("GET last-charging-telemetry returns 404 NOT_FOUND for an unknown battery", async () => {
  const response = await request(createApp()).get(
    "/api/batteries/battery-unknown/last-charging-telemetry",
  );

  assert.equal(response.status, 404);
  assert.equal(response.body.code, "NOT_FOUND");
});

test("GET last-charging-telemetry returns 404 NO_TELEMETRY for a known battery without samples", async () => {
  const response = await request(createApp()).get(
    "/api/batteries/battery-002/last-charging-telemetry",
  );

  assert.equal(response.status, 404);
  assert.equal(response.body.code, "NO_TELEMETRY");
});

test("GET last-charging-telemetry returns 404 NO_TELEMETRY for other seeded empty batteries", async () => {
  for (const batteryId of ["battery-003", "battery-006", "battery-010"]) {
    const response = await request(createApp()).get(
      `/api/batteries/${batteryId}/last-charging-telemetry`,
    );
    assert.equal(response.status, 404, batteryId);
    assert.equal(response.body.code, "NO_TELEMETRY", batteryId);
  }
});
