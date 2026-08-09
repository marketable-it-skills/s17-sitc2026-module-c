export const DEFAULT_CHARGING_DURATION_SECONDS = 15;

export type LiveChargingSample = {
  time: string;
  socPercent: number;
  chargingPowerKw: number;
  temperature: number;
};

export type LiveChargingSessionView = {
  unitId: string;
  serviceId: string | null;
  status: "CHARGING" | "COMPLETED";
  startedAt: string;
  endsAt: string;
  endedAt: string | null;
  samples: LiveChargingSample[];
};

type SessionRecord = {
  unitId: string;
  serviceId: string | null;
  startedAtMs: number;
  durationSeconds: number;
};

function buildSample(
  startedAtMs: number,
  secondIndex: number,
  durationSeconds: number,
): LiveChargingSample {
  const progress =
    durationSeconds <= 0 ? 1 : Math.min(1, secondIndex / durationSeconds);
  const socPercent = Math.round(42 + progress * 53);
  const chargingPowerKw = Number((3.2 + (1 - progress) * 0.4).toFixed(2));
  const temperature = Number((27.5 + progress * 4.5).toFixed(1));

  return {
    time: new Date(startedAtMs + secondIndex * 1000).toISOString(),
    socPercent,
    chargingPowerKw,
    temperature,
  };
}

function buildSamples(
  startedAtMs: number,
  durationSeconds: number,
  nowMs: number,
): { samples: LiveChargingSample[]; completed: boolean; endedAtMs: number } {
  const endsAtMs = startedAtMs + durationSeconds * 1000;
  const completed = nowMs >= endsAtMs;
  const elapsedSeconds = Math.min(
    durationSeconds,
    Math.max(0, Math.floor((Math.min(nowMs, endsAtMs) - startedAtMs) / 1000)),
  );

  const samples: LiveChargingSample[] = [];
  for (let second = 0; second <= elapsedSeconds; second += 1) {
    samples.push(buildSample(startedAtMs, second, durationSeconds));
  }

  return { samples, completed, endedAtMs: endsAtMs };
}

export type StartLiveChargingResult =
  | { ok: true; session: LiveChargingSessionView }
  | { ok: false; reason: "ALREADY_ACTIVE" };

export type GetLiveChargingResult =
  | { ok: true; session: LiveChargingSessionView }
  | { ok: false; reason: "NOT_FOUND" };

export class BikeBayChargingSessionStore {
  private readonly sessions = new Map<string, SessionRecord>();

  start(
    unitId: string,
    options: {
      serviceId?: string | null;
      durationSeconds?: number;
      nowMs?: number;
    } = {},
  ): StartLiveChargingResult {
    const existing = this.sessions.get(unitId);
    const nowMs = options.nowMs ?? Date.now();

    if (existing) {
      const view = this.toView(existing, nowMs);
      if (view.status === "CHARGING") {
        return { ok: false, reason: "ALREADY_ACTIVE" };
      }
      // Replace completed session with a new one.
      this.sessions.delete(unitId);
    }

    const durationSeconds = Math.max(
      1,
      Math.floor(
        options.durationSeconds ?? DEFAULT_CHARGING_DURATION_SECONDS,
      ),
    );

    const record: SessionRecord = {
      unitId,
      serviceId: options.serviceId ?? null,
      startedAtMs: nowMs,
      durationSeconds,
    };
    this.sessions.set(unitId, record);

    return { ok: true, session: this.toView(record, nowMs) };
  }

  getCurrent(
    unitId: string,
    nowMs: number = Date.now(),
  ): GetLiveChargingResult {
    const record = this.sessions.get(unitId);
    if (!record) {
      return { ok: false, reason: "NOT_FOUND" };
    }
    return { ok: true, session: this.toView(record, nowMs) };
  }

  clear(unitId: string): boolean {
    return this.sessions.delete(unitId);
  }

  private toView(record: SessionRecord, nowMs: number): LiveChargingSessionView {
    const { samples, completed, endedAtMs } = buildSamples(
      record.startedAtMs,
      record.durationSeconds,
      nowMs,
    );

    return {
      unitId: record.unitId,
      serviceId: record.serviceId,
      status: completed ? "COMPLETED" : "CHARGING",
      startedAt: new Date(record.startedAtMs).toISOString(),
      endsAt: new Date(endedAtMs).toISOString(),
      endedAt: completed ? new Date(endedAtMs).toISOString() : null,
      samples,
    };
  }
}
