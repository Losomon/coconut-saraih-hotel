const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Base URL for the application
    baseUrl: 'http://localhost:3000',
    
    // Support file
    supportFile: 'tests/e2e/support/e2e.js',
    
    // Spec file patterns
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Video and screenshot settings
    video: false,
    screenshotOnRunFailure: true,
    screenshotFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Default timeout
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    
    // Retries
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Environment variables
    env: {
      apiUrl: 'http://localhost:3000/api',
      backendUrl: 'http://localhost:3000'
    },
    
    // Setup node events
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      return config;
    }
  },
  
  // Component testing configuration
  component: {
    devServer: {
      framework: 'html',
      bundler: 'webpack'
    }
  }
});
