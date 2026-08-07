import assert from "node:assert/strict";
import { test } from "node:test";

import request from "supertest";

import { createApp } from "../src/app";

test("GET /api/qr-codes returns every stored station QR code", async () => {
  const response = await request(createApp()).get("/api/qr-codes");

  assert.equal(response.status, 200);
  assert.equal(response.body.length, 5);
  assert.equal(response.body[0].id, "qr-001");
  assert.equal(response.body[0].resource_type, "STATION");
  assert.equal(response.body[0].station_name, "Haitang Garden East Gate");
  assert.equal(
    response.body[0].qr_payload,
    "https://app.swaploop.test/stations/station-001",
  );
  assert.equal(response.body[3].resource_id, "station-004");
  assert.equal(response.body[3].station_name, "South Gate Exchange");
  assert.equal(response.body[3].status, "DISABLED");
  assert.equal(response.body[4].resource_id, "station-005");
  assert.equal(response.body[4].station_name, "South Gate Night Hub");
});

test("an active station QR can be selected and its deep-link payload retrieved", async () => {
  const app = createApp();

  const selection = await request(app)
    .post("/api/qr/current")
    .send({ qrId: "qr-002" });

  assert.equal(selection.status, 200);
  assert.deepEqual(selection.body, {
    qrId: "qr-002",
    payload: "https://app.swaploop.test/stations/station-002",
  });

  const current = await request(app).get("/api/qr/current");
  assert.equal(current.status, 200);
  assert.deepEqual(current.body, {
    payload: "https://app.swaploop.test/stations/station-002",
  });
});

test("GET /api/qr/current returns 404 before a selection", async () => {
  const response = await request(createApp()).get("/api/qr/current");

  assert.equal(response.status, 404);
  assert.equal(response.body.code, "CURRENT_QR_NOT_SET");
});

test("a disabled station QR can be selected for negative-path simulation", async () => {
  const app = createApp();
  const selection = await request(app)
    .post("/api/qr/current")
    .send({ qrId: "qr-004" });

  assert.equal(selection.status, 200);
  assert.equal(
    selection.body.payload,
    "https://app.swaploop.test/stations/station-004",
  );

  const current = await request(app).get("/api/qr/current");
  assert.equal(current.status, 200);
  assert.deepEqual(current.body, {
    payload: "https://app.swaploop.test/stations/station-004",
  });
});

test("an unknown QR code returns 404", async () => {
  const response = await request(createApp())
    .post("/api/qr/current")
    .send({ qrId: "qr-unknown" });

  assert.equal(response.status, 404);
  assert.equal(response.body.code, "QR_CODE_NOT_FOUND");
});

test("an invalid selection request returns 400", async () => {
  const response = await request(createApp())
    .post("/api/qr/current")
    .send({});

  assert.equal(response.status, 400);
  assert.equal(response.body.code, "INVALID_REQUEST");
});
