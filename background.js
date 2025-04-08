// Import settings.js file directly
importScripts("scripts/settings.js");

// Listen for installation
chrome.runtime.onInstalled.addListener(({ reason }) => {
	if (reason === "install") {
		// Save defaults to Chrome storage using the imported DEFAULT_SETTINGS
		chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
			console.log("Default settings initialized");
		});
	}
});

// Set up message passing between popup and content scripts if needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "getMicrophoneStatus") {
		// Relay microphone status requests if needed
		chrome.storage.sync.get("microphoneActive", (data) => {
			sendResponse({ microphoneActive: data.microphoneActive || false });
		});
		return true; // Required for async sendResponse
	}
});
