import chargingTelemetryJson from "./data/charging-telemetry.json";

export interface TelemetrySample {
  time: string;
  temperature: number;
  chargingVoltage: number;
}

export interface ChargingTelemetryReport {
  batteryId: string;
  startTime: string | null;
  endTime: string | null;
  telemetryData: TelemetrySample[];
}

export type GetChargingTelemetryResult =
  | { ok: true; report: ChargingTelemetryReport }
  | { ok: false; reason: "NOT_FOUND" | "NO_TELEMETRY" };

export class ChargingTelemetryStore {
  private readonly reportsByBatteryId: ReadonlyMap<string, ChargingTelemetryReport>;

  constructor(
    reports: readonly ChargingTelemetryReport[] = chargingTelemetryJson as ChargingTelemetryReport[],
  ) {
    const map = new Map<string, ChargingTelemetryReport>();

    for (const report of reports) {
      map.set(report.batteryId, {
        batteryId: report.batteryId,
        startTime: report.startTime,
        endTime: report.endTime,
        telemetryData: report.telemetryData.map((sample) => ({ ...sample })),
      });
    }

    this.reportsByBatteryId = map;
  }

  getByBatteryId(batteryId: string): GetChargingTelemetryResult {
    const report = this.reportsByBatteryId.get(batteryId);

    if (!report) {
      return { ok: false, reason: "NOT_FOUND" };
    }

    if (report.telemetryData.length === 0) {
      return { ok: false, reason: "NO_TELEMETRY" };
    }

    return {
      ok: true,
      report: {
        batteryId: report.batteryId,
        startTime: report.startTime,
        endTime: report.endTime,
        telemetryData: report.telemetryData.map((sample) => ({ ...sample })),
      },
    };
  }
}
