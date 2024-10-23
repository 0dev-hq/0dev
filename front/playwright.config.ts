import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  use: {
    // Specify the browsers to be used for testing
    // Example: ['chromium', 'firefox', 'webkit']
    browsers: ["chromium"],
    // Other settings can be specified here
  },
};

export default config;
