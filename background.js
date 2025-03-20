// Listen for installation
chrome.runtime.onInstalled.addListener(({ reason }) => {
	if (reason === "install") {
		console.log("Canvox extension installed!");
		// Default settings
		const defaultSettings = {
			// Theme
			theme: "dark",

			// Hotkeys
			hotkeyMicrophone: "m",
			hotkeyTranscript: "t",
			hotkeyReadoutDown: "upArrow",
			hotkeyReadoutUp: "downArrow",

			// Microphone state
			microphoneActive: false,

			// Audio preferences - will be overridden once user selects
			audioInput: "",
			audioOutput: "",

			// Volume
			volume: 100, // Default volume (scale 0-100)
		};

		// Save defaults to Chrome storage
		chrome.storage.sync.set(defaultSettings, () => {
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
