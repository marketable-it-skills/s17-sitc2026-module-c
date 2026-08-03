import { createApp } from "./app";

const port = Number(process.env.PORT ?? 4020);
const app = createApp();

app.listen(port, "0.0.0.0", () => {
  process.stdout.write(`SwapLoop Station Service listening on http://localhost:${port}\n`);
});
