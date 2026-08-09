import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import { BikeBayChargingSessionStore } from "./bike-bay-charging-session-store";
import { ChargingTelemetryStore } from "./charging-telemetry-store";
import { QrStore } from "./qr-store";

export function createApp(
  qrStore: QrStore = new QrStore(),
  chargingTelemetryStore: ChargingTelemetryStore = new ChargingTelemetryStore(),
  bikeBayChargingStore: BikeBayChargingSessionStore = new BikeBayChargingSessionStore(),
) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/qr-codes", (_request, response) => {
    response.json(qrStore.list());
  });

  app.post("/api/qr/current", (request, response) => {
    const qrId = request.body?.qrId;

    if (typeof qrId !== "string" || qrId.trim() === "") {
      return response.status(400).json({
        code: "INVALID_REQUEST",
        message: "qrId must be a non-empty string"
      });
    }

    const result = qrStore.select(qrId);

    if (!result.ok) {
      return response.status(404).json({
        code: "QR_CODE_NOT_FOUND",
        message: `QR code '${qrId}' does not exist`
      });
    }

    return response.json({
      qrId: result.qrCode.id,
      payload: result.qrCode.qr_payload
    });
  });

  app.get("/api/qr/current", (_request, response) => {
    const currentQrCode = qrStore.getCurrent();

    if (!currentQrCode) {
      return response.status(404).json({
        code: "CURRENT_QR_NOT_SET",
        message: "No QR code is currently selected"
      });
    }

    return response.json({ payload: currentQrCode.qr_payload });
  });

  app.get("/api/batteries/:batteryId/last-charging-telemetry", (request, response) => {
    const batteryId = request.params.batteryId;

    if (typeof batteryId !== "string" || batteryId.trim() === "") {
      return response.status(422).json({
        code: "VALIDATION_ERROR",
        message: "batteryId must be a non-empty string"
      });
    }

    const result = chargingTelemetryStore.getByBatteryId(batteryId.trim());

    if (!result.ok) {
      if (result.reason === "NO_TELEMETRY") {
        return response.status(404).json({
          code: "NO_TELEMETRY",
          message: `No completed charging telemetry stored for battery '${batteryId.trim()}'`
        });
      }

      return response.status(404).json({
        code: "NOT_FOUND",
        message: `Battery '${batteryId}' was not found`
      });
    }

    return response.json(result.report);
  });

  app.post("/api/bike-bays/:unitId/charging/sessions", (request, response) => {
    const unitId = String(request.params.unitId ?? "").trim();
    if (!unitId) {
      return response.status(422).json({
        code: "VALIDATION_ERROR",
        message: "unitId must be a non-empty string",
      });
    }

    const serviceId =
      typeof request.body?.serviceId === "string"
        ? request.body.serviceId.trim()
        : null;
    const durationSeconds =
      typeof request.body?.durationSeconds === "number"
        ? request.body.durationSeconds
        : undefined;

    const result = bikeBayChargingStore.start(unitId, {
      serviceId,
      durationSeconds,
    });

    if (!result.ok) {
      return response.status(409).json({
        code: "CONFLICT",
        message: `Bike bay '${unitId}' already has an active charging session.`,
      });
    }

    return response.status(201).json(result.session);
  });

  app.get(
    "/api/bike-bays/:unitId/charging/sessions/current",
    (request, response) => {
      const unitId = String(request.params.unitId ?? "").trim();
      if (!unitId) {
        return response.status(422).json({
          code: "VALIDATION_ERROR",
          message: "unitId must be a non-empty string",
        });
      }

      const result = bikeBayChargingStore.getCurrent(unitId);
      if (!result.ok) {
        return response.status(404).json({
          code: "NOT_FOUND",
          message: `No charging session for bike bay '${unitId}'.`,
        });
      }

      return response.status(200).json(result.session);
    },
  );

  app.delete(
    "/api/bike-bays/:unitId/charging/sessions/current",
    (request, response) => {
      const unitId = String(request.params.unitId ?? "").trim();
      if (!unitId) {
        return response.status(422).json({
          code: "VALIDATION_ERROR",
          message: "unitId must be a non-empty string",
        });
      }

      bikeBayChargingStore.clear(unitId);
      return response.status(204).send();
    },
  );

  app.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
    if (error instanceof SyntaxError && "body" in error) {
      return response.status(400).json({
        code: "INVALID_JSON",
        message: "Request body must contain valid JSON"
      });
    }

    return next(error);
  });

  return app;
}
