import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const entry = fileURLToPath(new URL("./src/swaploop-qr-emulator.js", import.meta.url));

export default defineConfig({
  build: {
    outDir: "dist-component",
    emptyOutDir: true,
    minify: "esbuild",
    lib: {
      entry,
      name: "SwapLoopQrEmulator",
      formats: ["iife"],
      fileName: () => "swaploop-qr-emulator.js"
    }
  }
});
