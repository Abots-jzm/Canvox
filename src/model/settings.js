import { initRecognition } from "./recognition.js";

/**
 * Default settings for Canvox extension
 * This file centralizes all default values used across the application
 */
const DEFAULT_SETTINGS = {
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
	volume: 100, // Scale 0-100
};

/**
 * Helper function to get setting with default
 * This centralizes the logic for fetching settings with defaults
 */
function getSettingWithDefault(key, defaultValue) {
	return new Promise((resolve) => {
		chrome.storage.sync.get(key, (result) => {
			if (chrome.runtime.lastError) {
				console.warn(chrome.runtime.lastError);
			}

			// If setting doesn't exist, save and use default
			if (result[key] === undefined) {
				chrome.storage.sync.set({ [key]: defaultValue || DEFAULT_SETTINGS[key] });
				resolve(defaultValue || DEFAULT_SETTINGS[key]);
			} else {
				resolve(result[key]);
			}
		});
	});
}

// Function to toggle microphone state
async function toggleMicrophone(recognitionState) {
	if (recognitionState.isRecognizing) {
		recognitionState.recognition.stop();
		recognitionState.isRecognizing = false;
	} else {
		if (!recognitionState.recognition) {
			const deviceId = await getSettingWithDefault("audioInput", DEFAULT_SETTINGS.audioInput);
			initRecognition(recognitionState, deviceId);
			recognitionState.recognition.start();
			recognitionState.isRecognizing = true;
		} else {
			recognitionState.recognition.start();
			recognitionState.isRecognizing = true;
		}
	}

	// Update the storage to keep popup UI in sync. So that when the user presses hotkey, the popup reflects the correct state
	// of the microphone (active/inactive).
	chrome.storage.sync.set({ microphoneActive: recognitionState.isRecognizing });
}

export { getSettingWithDefault, DEFAULT_SETTINGS, toggleMicrophone };
