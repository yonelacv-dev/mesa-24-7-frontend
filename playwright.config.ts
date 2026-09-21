import path from 'node:path'

import { defineConfig, devices } from '@playwright/test'

const BACKEND_PORT = 8001
const FRONTEND_PORT = 5174
// Backend y frontend son repos separados: por defecto se asume una carpeta hermana llamada "backend"
// (como en este checkout). Si el tuyo se llama distinto o está en otro lado, pon BACKEND_DIR=/ruta.
const BACKEND_DIR = process.env.BACKEND_DIR
  ? path.resolve(process.env.BACKEND_DIR)
  : new URL('../backend', import.meta.url).pathname

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  workers: 2, // el back de desarrollo es un solo proceso (uvicorn sin --workers): no lo saturamos
  timeout: 45_000, // back real (MySQL + SSE), no mocks: más margen que el default bajo la carga de la suite
  expect: { timeout: 10_000 },
  // Un back real (MySQL + SSE) bajo la carga de la suite completa puede ser algo lento puntualmente;
  // un reintento absorbe eso sin esconder un fallo de verdad (que no desaparece al reintentar).
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${FRONTEND_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Tres anchos de dispositivo desconocido: celular chico, tablet y escritorio. Cada spec corre en los tres.
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 780 } } }, // Pixel 7 usa Chromium
    // (no un dispositivo Apple con WebKit, que este entorno no tiene instalado): tablet Android típica, en horizontal.
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 }, hasTouch: true } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: [
    {
      command: 'poetry run uvicorn app.main:app --port 8001',
      cwd: BACKEND_DIR,
      env: { MYSQL_DATABASE: 'waiting_list_e2e', RATE_LIMIT_ENABLED: 'false' },
      url: `http://127.0.0.1:${BACKEND_PORT}/health`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      // --host 127.0.0.1: Vite escucha por defecto en 'localhost', que aquí resuelve a IPv6 (::1);
      // se fuerza IPv4 para que coincida con la URL que este archivo usa para comprobar que ya está listo.
      command: `npx vite --port ${FRONTEND_PORT} --host 127.0.0.1 --strictPort`,
      env: { VITE_PROXY_TARGET: `http://127.0.0.1:${BACKEND_PORT}` },
      url: `http://127.0.0.1:${FRONTEND_PORT}`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
})
