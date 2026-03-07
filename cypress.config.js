const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,

  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "evidencias/report",
    overwrite: false,
    html: true,
    json: true,
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    screenshotsFolder: "evidencias/screenshots",
    videosFolder: "evidencias/videos",
    video: true,
    baseUrl: "https://creative-sherbet-a51eac.netlify.app",
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
  },
});
