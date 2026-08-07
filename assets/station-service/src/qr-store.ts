import qrCodesJson from "./data/qr-codes.json";

export type QrCodeStatus = "ACTIVE" | "DISABLED";

export interface QrCode {
  id: string;
  resource_type: "STATION";
  resource_id: string;
  station_name: string;
  qr_payload: string;
  status: QrCodeStatus;
}

export type SelectQrResult =
  | { ok: true; qrCode: QrCode }
  | { ok: false; reason: "NOT_FOUND" };

export class QrStore {
  private readonly qrCodes: readonly QrCode[];
  private currentQrId: string | null = null;

  constructor(qrCodes: readonly QrCode[] = qrCodesJson as QrCode[]) {
    this.qrCodes = qrCodes.map((qrCode) => ({ ...qrCode }));
  }

  list(): readonly QrCode[] {
    return this.qrCodes.map((qrCode) => ({ ...qrCode }));
  }

  select(qrId: string): SelectQrResult {
    const qrCode = this.qrCodes.find((item) => item.id === qrId);

    if (!qrCode) {
      return { ok: false, reason: "NOT_FOUND" };
    }

    this.currentQrId = qrCode.id;
    return { ok: true, qrCode: { ...qrCode } };
  }

  getCurrent(): QrCode | null {
    if (!this.currentQrId) {
      return null;
    }

    const qrCode = this.qrCodes.find((item) => item.id === this.currentQrId);
    return qrCode ? { ...qrCode } : null;
  }
}
