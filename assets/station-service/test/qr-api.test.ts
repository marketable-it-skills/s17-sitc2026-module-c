import assert from "node:assert/strict";
import { test } from "node:test";

import request from "supertest";

import { createApp } from "../src/app";

test("GET /api/qr-codes returns every stored QR code", async () => {
  const response = await request(createApp()).get("/api/qr-codes");

  assert.equal(response.status, 200);
  assert.equal(response.body.length, 9);
  assert.equal(response.body[0].id, "qr-001");
  assert.equal(response.body[3].status, "DISABLED");
});

test("an active QR code can be selected and its payload retrieved", async () => {
  const app = createApp();

  const selection = await request(app)
    .post("/api/qr/current")
    .send({ qrId: "qr-101" });

  assert.equal(selection.status, 200);
  assert.deepEqual(selection.body, {
    qrId: "qr-101",
    payload: "sl_qr_unit_A1F9K2"
  });

  const current = await request(app).get("/api/qr/current");
  assert.equal(current.status, 200);
  assert.deepEqual(current.body, { payload: "sl_qr_unit_A1F9K2" });
});

test("GET /api/qr/current returns 404 before a selection", async () => {
  const response = await request(createApp()).get("/api/qr/current");

  assert.equal(response.status, 404);
  assert.equal(response.body.code, "CURRENT_QR_NOT_SET");
});

test("a disabled QR code can be selected for negative-path simulation", async () => {
  const app = createApp();
  const selection = await request(app)
    .post("/api/qr/current")
    .send({ qrId: "qr-004" });

  assert.equal(selection.status, 200);
  assert.equal(selection.body.payload, "sl_qr_stn_2N5W8F");

  const current = await request(app).get("/api/qr/current");
  assert.equal(current.status, 200);
  assert.deepEqual(current.body, { payload: "sl_qr_stn_2N5W8F" });
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
