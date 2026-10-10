import { defineConfig } from "@playwright/test";

// E2E básico: sobe o site com o http-server (já é devDependency) e roda em um Chromium.
// Local, sem baixar navegador: PW_CHANNEL=msedge npm run test:e2e
const PORT = 8318;

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: "pt-BR",
    channel: process.env.PW_CHANNEL || undefined,
  },
  webServer: {
    command: `npx http-server -p ${PORT} -a 127.0.0.1 -c-1 -s .`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
