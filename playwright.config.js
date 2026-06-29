const { defineConfig } = require("@playwright/test");

const testPort = process.env.PLAYWRIGHT_PORT || "4321";
const baseURL = `http://127.0.0.1:${testPort}`;

module.exports = defineConfig({
  testDir: "./tests",
  use: {
    baseURL,
  },
  webServer: {
    command: `npx astro dev --host 127.0.0.1 --port ${testPort}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
