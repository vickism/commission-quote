export default {
  baseUrl: 'http://localhost:3000',
  ai: {
    provider: 'openai',
    model: process.env.AI_UI_TEST_MODEL || 'gpt-6-luna',
    apiKey: process.env.OPENAI_API_KEY || 'sk-...', 
    maxIterations: 40,
  },
  browser: {
    browserType: 'chromium',
    headless: false,
    viewport: { width: 1280, height: 720 },
    timeout: 30000,
  },
  screenshots: {
    dir: './output/ai-ui-tests/screenshots',
    onFailure: true,
    onSuccess: false,
  },
  memory: {
    enabled: false,
  },
};
