// Define default settings
const DEFAULT_SETTINGS = {
	// Theme
	theme: "dark",

	// Hotkeys
	hotkeyMicrophone: { ctrl: false, alt: false, shift: false, key: "x" },
	hotkeyTranscript: { ctrl: true, alt: false, shift: false, key: " " }, // Ctrl + Space
	hotkeyReadoutDown: { ctrl: false, alt: false, shift: false, key: "Down" },
	hotkeyReadoutUp: { ctrl: false, alt: false, shift: false, key: "Up" },

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
	} else if (reason === "update") {
		// Migrate legacy hotkeys to new format if needed
		chrome.storage.sync.get(
			["hotkeyMicrophone", "hotkeyTranscript", "hotkeyReadoutDown", "hotkeyReadoutUp"],
			(data) => {
				const updates = {};

				// Check and migrate each hotkey
				["hotkeyMicrophone", "hotkeyTranscript", "hotkeyReadoutDown", "hotkeyReadoutUp"].forEach((key) => {
					// If it exists and is a string (old format), convert to new format
					if (data[key] && typeof data[key] === "string") {
						const isTranscript = key === "hotkeyTranscript";
						updates[key] = {
							ctrl: isTranscript, // Transcript uses Ctrl by default
							alt: false,
							shift: false,
							key: data[key],
						};
					}
				});

				// Save updates if any
				if (Object.keys(updates).length > 0) {
					chrome.storage.sync.set(updates, () => {
						console.log("Migrated legacy hotkeys to new format");
					});
				}
			}
		);
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
