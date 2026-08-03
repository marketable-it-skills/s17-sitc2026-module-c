import QRCode from "qrcode";

const elementName = "swaploop-qr-emulator";

export class SwapLoopQrEmulator extends HTMLElement {
  static observedAttributes = ["service-url", "scan-duration"];

  #abortController = null;
  #scanning = false;
  #state = "idle";
  #qrImage = "";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#render();
  }

  disconnectedCallback() {
    this.#stopRequest();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.#render();
    }
  }

  get serviceUrl() {
    return (this.getAttribute("service-url") || "http://localhost:4020").replace(/\/$/, "");
  }

  set serviceUrl(value) {
    this.setAttribute("service-url", value);
  }

  get scanDuration() {
    const configuredValue = Number(this.getAttribute("scan-duration") || 2500);
    return Number.isFinite(configuredValue) && configuredValue >= 0 ? configuredValue : 2500;
  }

  async startScan() {
    this.#stopRequest();
    this.#scanning = true;
    this.#qrImage = "";
    const controller = new AbortController();
    this.#abortController = controller;
    this.#updateState("scanning", "Reading the current QR code…");
    await this.#fetchCurrentQr(controller);
  }

  cancelScan() {
    this.#stopRequest();
    this.#updateState("idle", "Scan cancelled.");
  }

  reset() {
    this.#stopRequest();
    this.#qrImage = "";
    this.#updateState("idle", "Ready to scan a simulated QR code.");
  }

  async #fetchCurrentQr(controller) {
    if (!this.#scanning) return;

    try {
      let response;
      let requestError;

      await Promise.all([
        fetch(`${this.serviceUrl}/api/qr/current`, {
          headers: { Accept: "application/json" },
          signal: controller.signal
        })
          .then((result) => { response = result; })
          .catch((error) => { requestError = error; }),
        this.#waitForScanEffect(controller.signal)
      ]);

      if (requestError) throw requestError;

      if (response.status === 404) {
        this.#scanning = false;
        this.#updateState("error", "No QR code is currently selected.");
        return;
      }

      if (!response.ok) {
        throw new Error(`Station Service returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (typeof data.payload !== "string" || data.payload.length === 0) {
        throw new Error("The Station Service returned an invalid QR payload");
      }

      this.#qrImage = await QRCode.toDataURL(data.payload, {
        width: 260,
        margin: 2,
        color: { dark: "#102a2a", light: "#ffffff" },
        errorCorrectionLevel: "M"
      });
      this.#scanning = false;
      this.#updateState("success", "QR code scanned successfully.");

      this.dispatchEvent(new CustomEvent("qr-scan", {
        detail: { payload: data.payload },
        bubbles: true,
        composed: true
      }));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      this.#scanning = false;
      this.#updateState(
        "error",
        error instanceof Error ? error.message : "Unable to reach the Station Service"
      );
    } finally {
      if (this.#abortController === controller) {
        this.#abortController = null;
      }
    }
  }

  #waitForScanEffect(signal) {
    return new Promise((resolve) => {
      const finish = () => {
        window.clearTimeout(timer);
        signal.removeEventListener("abort", finish);
        resolve();
      };
      const timer = window.setTimeout(finish, this.scanDuration);
      signal.addEventListener("abort", finish, { once: true });
    });
  }

  #updateState(state, message) {
    this.#state = state;
    this.#render();
    this.dispatchEvent(new CustomEvent("qr-scan-state", {
      detail: { state, message },
      bubbles: true,
      composed: true
    }));
  }

  #stopRequest() {
    this.#abortController?.abort();
    this.#abortController = null;
    this.#scanning = false;
  }

  #render() {
    const isActive = this.#state === "scanning";
    const statusLabel = {
      idle: "Ready",
      scanning: "Scanning",
      success: "Scanned",
      error: "Error"
    }[this.#state];

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: #102a2a;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        * { box-sizing: border-box; }

        .scanner {
          overflow: hidden;
          border: 1px solid rgba(16, 42, 42, 0.12);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 24px 60px rgba(16, 42, 42, 0.14);
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 22px;
          border-bottom: 1px solid #e6ece9;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          font-size: 15px;
          font-weight: 750;
          letter-spacing: -0.01em;
        }

        .mark {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border-radius: 11px;
          color: #fff;
          background: #0d766e;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.18);
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 28px;
          padding: 5px 10px;
          border-radius: 999px;
          color: #31504d;
          background: #eef5f2;
          font-size: 12px;
          font-weight: 700;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${this.#state === "error" ? "#d97706" : this.#state === "success" ? "#0d9488" : "#6b817e"};
          ${isActive ? "animation: pulse 1.4s ease-in-out infinite;" : ""}
        }

        .body { padding: 22px; }

        .viewport {
          position: relative;
          display: grid;
          min-height: 330px;
          place-items: center;
          overflow: hidden;
          border-radius: 21px;
          color: #d9f5ee;
          background:
            radial-gradient(circle at 25% 15%, rgba(35, 166, 153, .24), transparent 35%),
            linear-gradient(145deg, #173d3a, #0b2524 72%);
        }

        .grid {
          position: absolute;
          inset: 0;
          opacity: .13;
          background-image:
            linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .frame {
          position: relative;
          display: grid;
          width: 230px;
          height: 230px;
          place-items: center;
        }

        .corner {
          position: absolute;
          width: 42px;
          height: 42px;
          border-color: #73e1cc;
          border-style: solid;
        }
        .tl { top: 0; left: 0; border-width: 3px 0 0 3px; border-radius: 14px 0 0 0; }
        .tr { top: 0; right: 0; border-width: 3px 3px 0 0; border-radius: 0 14px 0 0; }
        .bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; border-radius: 0 0 0 14px; }
        .br { right: 0; bottom: 0; border-width: 0 3px 3px 0; border-radius: 0 0 14px 0; }

        .scan-line {
          position: absolute;
          z-index: 2;
          top: 18px;
          right: 13px;
          left: 13px;
          height: 2px;
          opacity: ${isActive ? 1 : 0};
          background: linear-gradient(90deg, transparent, #73e1cc 15%, #fff 50%, #73e1cc 85%, transparent);
          filter: drop-shadow(0 0 7px #73e1cc);
          animation: scan 2.4s ease-in-out infinite;
        }

        .placeholder {
          width: 112px;
          text-align: center;
          color: rgba(224, 250, 244, .82);
          font-size: 13px;
          line-height: 1.45;
        }

        .placeholder svg { margin-bottom: 10px; opacity: .84; }

        .qr {
          z-index: 1;
          width: 194px;
          height: 194px;
          padding: 8px;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 16px 35px rgba(0,0,0,.28);
        }

        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(192px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: .45; transform: scale(.85); }
          50% { opacity: 1; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
        }
      </style>

      <section class="scanner" aria-label="SwapLoop QR scanner emulator">
        <header class="header">
          <div class="brand">
            <span class="mark" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M15 14h2v2h-2zM19 14h1v5h-5v1M14 18h2"/>
              </svg>
            </span>
            SwapLoop scanner
          </div>
          <span class="status"><span class="dot"></span>${statusLabel}</span>
        </header>

        <div class="body">
          <div class="viewport">
            <div class="grid"></div>
            <div class="frame">
              <span class="corner tl"></span><span class="corner tr"></span>
              <span class="corner bl"></span><span class="corner br"></span>
              <span class="scan-line"></span>
              ${this.#qrImage
                ? `<img class="qr" src="${this.#qrImage}" alt="Simulated QR code" />`
                : `<div class="placeholder">
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                      <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M7 7h3v3H7zM14 7h3v3h-3zM7 14h3v3H7zM14 14h1v1h-1zM17 14v3h-3"/>
                    </svg>
                    Position the simulated code inside the frame
                  </div>`}
            </div>
          </div>
        </div>
      </section>
    `;
  }
}

if (!customElements.get(elementName)) {
  customElements.define(elementName, SwapLoopQrEmulator);
}
