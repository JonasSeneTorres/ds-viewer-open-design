import { defineConfig, devices } from "@playwright/test";

// E2E: sobe o site com o http-server (já é devDependency) e roda nos navegadores pedidos.
//   npm run test:e2e                                 só Chromium (o padrão)
//   PW_BROWSERS=chromium,firefox,webkit npm run test:e2e
//   PW_CHANNEL=msedge npm run test:e2e               Chromium pelo Edge instalado, sem baixar navegador
// O CSS usa recursos recentes (color-mix, dvh, :has, color-scheme); o CI roda os três motores.
const PORT = 8318;

const ENGINES = {
  chromium: { ...devices["Desktop Chrome"], channel: process.env.PW_CHANNEL || undefined },
  firefox: { ...devices["Desktop Firefox"] },
  webkit: { ...devices["Desktop Safari"] },
};
const wanted = (process.env.PW_BROWSERS || "chromium").split(",").map((s) => s.trim()).filter(Boolean);
for (const name of wanted) {
  if (!ENGINES[name]) throw new Error(`PW_BROWSERS: navegador desconhecido "${name}" (use chromium, firefox ou webkit)`);
}

export default defineConfig({
  testDir: "tests",
  testMatch: "*.spec.mjs", // tests/unit/ roda no node:test e no unittest, não aqui
  timeout: 45_000, // o Firefox no CI carrega o catálogo de 143 cartões mais devagar
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: "pt-BR",
  },
  projects: wanted.map((name) => ({ name, use: ENGINES[name] })),
  webServer: {
    command: `npx http-server -p ${PORT} -a 127.0.0.1 -c-1 -s .`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
