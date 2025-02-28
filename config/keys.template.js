/**
 * API Keys Configuration Template
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to keys.js in the same directory
 * 2. Replace the placeholder values with your actual API keys
 * 3. Never commit keys.js to version control
 */

const API_KEYS = {
  OPENAI_API_KEY: 'your-openai-api-key-here',
  // Add other API keys as needed
  // GOOGLE_API_KEY: 'your-google-api-key-here',
  // CUSTOM_SERVICE_API_KEY: 'your-custom-service-api-key-here',
};

// Make the API keys available globally
window.API_KEYS = API_KEYS;

// Example usage in other files:
// const openAiKey = window.API_KEYS.OPENAI_API_KEY;
