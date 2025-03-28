/**
 * Default settings for Canvox extension
 * This file centralizes all default values used across the application
 */
window.DEFAULT_SETTINGS = {
	// Theme
	theme: "dark",

	// Hotkeys - now using objects for key combinations
	hotkeyMicrophone: { ctrl: false, alt: false, shift: false, key: "x" },
	hotkeyTranscript: { ctrl: true, alt: false, shift: false, key: " " }, // Ctrl + Space
	hotkeyReadoutDown: { ctrl: false, alt: false, shift: false, key: "Down" },
	hotkeyReadoutUp: { ctrl: false, alt: false, shift: false, key: "Up" },

	// Microphone state
	microphoneActive: false,

	// Transcript visibility
	transcriptVisible: true,

	// Audio preferences
	audioInput: "default",
	audioOutput: "default",

	// Volume
	volume: 50, // Scale 0-100
};

/**
 * Helper function to get setting with default
 * This centralizes the logic for fetching settings with defaults
 */
window.getSettingWithDefault = function (key, defaultValue) {
	return new Promise((resolve) => {
		chrome.storage.sync.get(key, (result) => {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError);
			}

			// If setting doesn't exist, save and use default
			if (result[key] === undefined) {
				chrome.storage.sync.set({ [key]: defaultValue || window.DEFAULT_SETTINGS[key] });
				resolve(defaultValue || window.DEFAULT_SETTINGS[key]);
			} else {
				resolve(result[key]);
			}
		});
	});
};
