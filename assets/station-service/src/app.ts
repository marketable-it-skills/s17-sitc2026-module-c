import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import { QrStore } from "./qr-store";

export function createApp(qrStore: QrStore = new QrStore()) {
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
