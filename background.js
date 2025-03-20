// Define default settings
const DEFAULT_SETTINGS = {
	// Theme
	theme: "dark",

	// Hotkeys
	hotkeyMicrophone: "x",
	hotkeyTranscript: "t",
	hotkeyReadoutDown: "ArrowDown",
	hotkeyReadoutUp: "ArrowUp",

	// Microphone state
	microphoneActive: false,

	// Audio preferences
	audioInput: "default",
	audioOutput: "default",

	// Volume
	volume: 100, // Scale 0-100
};

// Listen for installation
chrome.runtime.onInstalled.addListener(({ reason }) => {
	if (reason === "install") {
		console.log("Canvox extension installed!");

		// Save defaults to Chrome storage
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
