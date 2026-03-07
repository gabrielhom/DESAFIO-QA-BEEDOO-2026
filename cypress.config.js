const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    screenshotsFolder: "evidencias/screenshots",
    videosFolder: "evidencias/videos",
    // Força a gravação de vídeo quando rodar no terminal
    video: true, 
    baseUrl: "https://creative-sherbet-a51eac.netlify.app", 
  },
});
