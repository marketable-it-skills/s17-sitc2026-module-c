import { describe, expect, it, vi } from "vitest";

vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn(async () => "data:image/png;base64,mock-qr")
  }
}));

await import("../src/swaploop-qr-emulator");

describe("swaploop-qr-emulator", () => {
  it("registers a reusable custom element", () => {
    expect(customElements.get("swaploop-qr-emulator")).toBeDefined();
  });

  it("retrieves the current payload and emits qr-scan", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      status: 200,
      ok: true,
      json: async () => ({ payload: "sl_qr_stn_7H2K9M" })
    })));

    const element = document.createElement("swaploop-qr-emulator");
    element.setAttribute("service-url", "http://localhost:4020");
    element.setAttribute("scan-duration", "0");
    document.body.append(element);

    const eventPromise = new Promise((resolve) => element.addEventListener("qr-scan", resolve, { once: true }));
    await element.startScan();
    const event = await eventPromise;

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("http://localhost:4020/api/qr/current");
    expect(options.headers).toEqual({ Accept: "application/json" });
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(event.detail).toEqual({ payload: "sl_qr_stn_7H2K9M" });
    expect(element.shadowRoot.querySelector(".qr")).not.toBeNull();
    expect(element.shadowRoot.querySelector(".payload")).toBeNull();
    expect(element.shadowRoot.querySelector("button")).toBeNull();
  });

  it("reports an error without retrying when no current QR code is selected", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ status: 404, ok: false })));

    const element = document.createElement("swaploop-qr-emulator");
    element.setAttribute("scan-duration", "0");
    document.body.append(element);
    let latestState;
    element.addEventListener("qr-scan-state", (event) => {
      latestState = event.detail;
    });
    await element.startScan();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(latestState).toEqual({
      state: "error",
      message: "No QR code is currently selected."
    });
    expect(element.shadowRoot.textContent).toContain("Error");
  });

  it("keeps the default scanning effect visible for at least 2.5 seconds", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn(async () => ({
      status: 200,
      ok: true,
      json: async () => ({ payload: "sl_qr_stn_7H2K9M" })
    })));

    const element = document.createElement("swaploop-qr-emulator");
    document.body.append(element);
    const scanHandler = vi.fn();
    element.addEventListener("qr-scan", scanHandler);

    const scanPromise = element.startScan();
    await vi.advanceTimersByTimeAsync(2499);
    expect(scanHandler).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await scanPromise;
    expect(scanHandler).toHaveBeenCalledOnce();
  });
});
