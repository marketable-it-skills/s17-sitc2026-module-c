import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";

import App from "../src/App";
import "../src/swaploop-qr-emulator";

it("keeps scan messages, payload output, and controls in the React application", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ([{
      id: "qr-001",
      resource_type: "STATION",
      resource_id: "station-001",
      station_name: "Haitang Garden East Gate",
      qr_payload: "https://app.swaploop.test/stations/station-001",
      status: "ACTIVE"
    }])
  })));

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<App />);
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  });

  const scanner = container.querySelector("swaploop-qr-emulator");
  expect(container.querySelector(".scanner-controls")).not.toBeNull();
  expect(container.querySelector(".scan-message")).not.toBeNull();
  expect(container.querySelector(".scan-button")).not.toBeNull();
  expect(scanner.getAttribute("scan-request-id")).toBe("0");
  expect(scanner.hasAttribute("ref")).toBe(false);
  expect(scanner.shadowRoot.querySelector(".scan-message")).toBeNull();
  expect(scanner.shadowRoot.querySelector("button")).toBeNull();

  await act(async () => root.unmount());
});
