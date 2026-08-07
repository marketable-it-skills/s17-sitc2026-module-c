import { useEffect, useState } from "react";

const serviceUrl = (import.meta.env.VITE_STATION_SERVICE_URL || "http://localhost:4020").replace(/\/$/, "");

function stationLabel(qrCode) {
  return qrCode.station_name || qrCode.resource_id;
}

export default function App() {
  const [qrCodes, setQrCodes] = useState([]);
  const [selectedQrId, setSelectedQrId] = useState("");
  const [controllerState, setControllerState] = useState({ type: "loading", message: "Loading QR codes…" });
  const [scannedPayload, setScannedPayload] = useState("");
  const [scanRequestId, setScanRequestId] = useState(0);
  const [cancelRequestId, setCancelRequestId] = useState(0);
  const [resetRequestId, setResetRequestId] = useState(0);
  const [scanState, setScanState] = useState({
    state: "idle",
    message: "Ready to scan a simulated QR code."
  });

  useEffect(() => {
    const handleScan = (event) => setScannedPayload(event.detail.payload);
    const handleScanState = (event) => setScanState(event.detail);
    window.addEventListener("qr-scan", handleScan);
    window.addEventListener("qr-scan-state", handleScanState);
    return () => {
      window.removeEventListener("qr-scan", handleScan);
      window.removeEventListener("qr-scan-state", handleScanState);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadQrCodes() {
      try {
        const response = await fetch(`${serviceUrl}/api/qr-codes`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setQrCodes(data);
        setSelectedQrId(data[0]?.id || "");
        setControllerState({ type: "ready", message: `${data.length} QR codes available` });
      } catch (error) {
        if (error.name !== "AbortError") {
          setControllerState({ type: "error", message: "Station Service is not available on port 4020." });
        }
      }
    }

    loadQrCodes();
    return () => controller.abort();
  }, []);

  async function selectCurrentQr() {
    if (!selectedQrId) return;
    setControllerState({ type: "loading", message: "Updating simulator…" });

    try {
      const response = await fetch(`${serviceUrl}/api/qr/current`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrId: selectedQrId })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || `HTTP ${response.status}`);
      setControllerState({ type: "success", message: `${body.qrId} is ready to scan` });
      setScannedPayload("");
      setScanState({ state: "idle", message: "Ready to scan a simulated QR code." });
      setResetRequestId((value) => value + 1);
    } catch (error) {
      setControllerState({ type: "error", message: error.message });
    }
  }

  function startScan() {
    setScannedPayload("");
    setScanRequestId((value) => value + 1);
  }

  function cancelScan() {
    setCancelRequestId((value) => value + 1);
  }

  const selectedQrCode = qrCodes.find((qrCode) => qrCode.id === selectedQrId);
  const scanIsActive = scanState.state === "scanning";

  return (
    <main className="page-shell">
      <header className="hero">
        <div className="eyebrow"><span></span> Station Service prototype</div>
        <h1>QR scanner emulator</h1>
        <p>
          Select a SwapLoop station QR deep link, publish it, then scan it through
          the reusable Web Component. Each payload opens the station hub in the SPA.
        </p>
      </header>

      <section className="workspace">
        <article className="controller-card">
          <div className="step-label">Simulator controller</div>
          <h2>Choose the next station QR</h2>
          <p className="muted">
            This panel represents the assessor-side control surface. Only station
            posters are simulated. Disabled codes remain selectable for negative-path testing.
          </p>

          <label htmlFor="qr-code">Station QR-code record</label>
          <select id="qr-code" value={selectedQrId} onChange={(event) => setSelectedQrId(event.target.value)} disabled={!qrCodes.length}>
            {qrCodes.map((qrCode) => (
              <option key={qrCode.id} value={qrCode.id}>
                {qrCode.id} · {stationLabel(qrCode)} ({qrCode.resource_id})
                {qrCode.status === "DISABLED" ? " (disabled)" : ""}
              </option>
            ))}
          </select>

          {selectedQrCode && (
            <div className="record-preview">
              <div>
                <span>Station name</span>
                <strong>{stationLabel(selectedQrCode)}</strong>
              </div>
              <div>
                <span>Station</span>
                <strong>{selectedQrCode.resource_id}</strong>
              </div>
              <div>
                <span>Deep link</span>
                <strong className="payload-preview">{selectedQrCode.qr_payload}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong className={selectedQrCode.status === "ACTIVE" ? "active" : "disabled"}>{selectedQrCode.status}</strong>
              </div>
            </div>
          )}

          <button className="publish-button" type="button" onClick={selectCurrentQr} disabled={!selectedQrId}>
            Set as current QR code
            <span aria-hidden="true">→</span>
          </button>

          <div className={`controller-status ${controllerState.type}`} role="status">
            <span className="status-light"></span>
            {controllerState.message}
          </div>

        </article>

        <div className="scanner-column">
          <div className="step-label">Customer application</div>
          <swaploop-qr-emulator
            service-url={serviceUrl}
            scan-duration="2500"
            scan-request-id={scanRequestId}
            cancel-request-id={cancelRequestId}
            reset-request-id={resetRequestId}
          ></swaploop-qr-emulator>

          <section className="scanner-controls" aria-live="polite">
            <p className={`scan-message ${scanState.state}`}>{scanState.message}</p>
            {scannedPayload && <output className="scan-payload">{scannedPayload}</output>}
            <div className="scan-actions">
              <button
                className="scan-button primary"
                type="button"
                onClick={startScan}
                disabled={scanIsActive}
              >
                {scanIsActive ? "Scanning…" : scanState.state === "success" ? "Scan another code" : "Start simulated scan"}
              </button>
              {scanIsActive && (
                <button className="scan-button secondary" type="button" onClick={cancelScan}>
                  Cancel
                </button>
              )}
            </div>
          </section>
        </div>
      </section>

      <footer>
        <span>Station Service</span>
        <code>{serviceUrl}</code>
      </footer>
    </main>
  );
}
