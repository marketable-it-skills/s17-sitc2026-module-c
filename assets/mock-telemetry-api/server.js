"use strict";

const http = require("node:http");

const port = Number(process.env.PORT || 4010);
const frozenNow = "2026-08-15T12:00:00+08:00";

const batches = {
  normal: {
    id: "batch-normal",
    readings: [
      { id: "feed-001", batteryId: "battery-001", measuredAt: "2026-08-15T11:50:00+08:00", temperatureC: 39.8, cycleCountDelta: 0 },
      { id: "feed-002", batteryId: "battery-002", measuredAt: "2026-08-15T11:51:00+08:00", temperatureC: 49.3, cycleCountDelta: 0 }
    ]
  },
  late: {
    id: "batch-late",
    readings: [
      { id: "feed-003", batteryId: "battery-005", measuredAt: "2026-08-15T08:40:00+08:00", receivedAt: "2026-08-15T10:45:00+08:00", temperatureC: 41.5, cycleCountDelta: 1 }
    ]
  },
  thermal: {
    id: "batch-thermal",
    readings: [
      { id: "feed-004", batteryId: "battery-006", measuredAt: "2026-08-15T10:30:00+08:00", temperatureC: 62.7, cycleCountDelta: 1, thermalAnomaly: true }
    ]
  },
  cutoff: {
    id: "batch-cutoff",
    readings: [
      { id: "feed-005", stationUnitId: "unit-008", measuredAt: "2026-08-14T20:41:00+08:00", temperatureC: 56.1, safetyCutoff: true }
    ]
  }
};

let deliveryCounts = {};

function json(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Access-Control-Allow-Origin": "*"
  });
  response.end(payload);
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET" && url.pathname === "/health") {
    return json(response, 200, { status: "ok", frozenNow });
  }

  if (request.method === "POST" && url.pathname === "/reset") {
    deliveryCounts = {};
    return json(response, 200, { status: "RESET_COMPLETE", frozenNow });
  }

  if (request.method === "GET" && url.pathname === "/batches") {
    return json(response, 200, {
      batches: ["normal", "late", "thermal", "cutoff", "malformed"]
    });
  }

  const match = url.pathname.match(/^\/batches\/([a-z-]+)$/);
  if (request.method === "GET" && match) {
    const name = match[1];
    deliveryCounts[name] = (deliveryCounts[name] || 0) + 1;

    if (name === "malformed") {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end("{\"id\":\"batch-malformed\",\"readings\":[{\"batteryId\":,\"temperatureC\":\"hot\"}]}");
    }

    if (!batches[name]) {
      return json(response, 404, { code: "BATCH_NOT_FOUND", message: "Unknown telemetry batch" });
    }

    return json(response, 200, {
      ...batches[name],
      deliveredAt: frozenNow,
      deliveryNumber: deliveryCounts[name]
    });
  }

  return json(response, 404, { code: "NOT_FOUND", message: "Unknown mock telemetry route" });
});

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(`SwapLoop mock telemetry API listening on http://localhost:${port}\n`);
});
