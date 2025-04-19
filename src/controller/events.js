import { initRecognition } from "../model/recognition.js";
import { toggleMicrophone, getSettingWithDefault, DEFAULT_SETTINGS, isHotkeyMatch } from "../model/settings.js";
import { giveNavigationFeedback } from "../model/tts.js";
import { toggleTranscript, stopAudio } from "./injectElements.js";
import { routeActions } from "./router.js";

function setupListeners(recognitionState) {
	// Navigation event listener
	window.addEventListener("popstate", giveNavigationFeedback);

	//Hotkeys event listener
	document.addEventListener("keydown", async (e) => {
		// Microphone hotkey
		const hotkey = await getSettingWithDefault("hotkeyMicrophone", DEFAULT_SETTINGS.hotkeyMicrophone);
		if (isHotkeyMatch(e, hotkey)) {
			// Stop audio if microphone is being turned on
			if (!recognitionState.isRecognizing) {
				stopAudio();
			}
			toggleMicrophone(recognitionState);
			e.preventDefault(); // Prevent browser's default handling of this key
		}

		// Transcript hotkey
		getSettingWithDefault("hotkeyTranscript", DEFAULT_SETTINGS.hotkeyTranscript).then((hotkey) => {
			if (isHotkeyMatch(e, hotkey)) {
				toggleTranscript();
				e.preventDefault(); // Prevent browser's default handling of this key
			}
		});
	});

	// Listen for the TTS events
	document.addEventListener("tts-ready", async (event) => {
		const audioElement = event.detail.audioElement;

		// Add event listeners for tracking playback
		audioElement.addEventListener("play", () => {
			console.log("TTS audio playback started");
		});

		audioElement.addEventListener("ended", () => {
			console.log("TTS audio playback completed");
			// Remove the audio element after playback
			document.body.removeChild(audioElement);
		});

		audioElement.addEventListener("error", (e) => {
			console.error("Audio playback error:", e);
			document.body.removeChild(audioElement);
		});

		// Start playing the audio
		try {
			await audioElement.play();
			console.log("Playing TTS audio");
		} catch (error) {
			console.error("Error playing TTS audio:", error);
		}
	});

	// Listen for changes to the microphone state from the popup
	chrome.storage.onChanged.addListener(async (changes) => {
		if (changes.microphoneActive && changes.microphoneActive.newValue !== recognitionState.isRecognizing) {
			if (changes.microphoneActive.newValue === true && !recognitionState.isRecognizing) {
				if (!recognitionState.recognition) {
					const deviceId = await getSettingWithDefault("audioInput", DEFAULT_SETTINGS.audioInput);
					initRecognition(recognitionState, deviceId);
					recognitionState.recognition.start();
					recognitionState.isRecognizing = true;
				} else {
					recognitionState.recognition.start();
					recognitionState.isRecognizing = true;
				}
			} else if (changes.microphoneActive.newValue === false && recognitionState.isRecognizing) {
				recognitionState.recognition.stop();
				recognitionState.isRecognizing = false;
			}
		}

		// Listen for audio input device changes
		if (changes.audioInput) {
			initRecognition(recognitionState, changes.audioInput.newValue);
		}
	});

	// Listen for messages from popup
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.action === "updateAudioInput") {
			initRecognition(recognitionState, message.deviceId);
			sendResponse({ success: true });
			return true;
		}

		if (message.action === "toggleTranscript") {
			const newVisibility = toggleTranscript();
			sendResponse({ success: true, isVisible: newVisibility });
			return true;
		}
	});

	// This is for users who may not want to use the microphone or have accessibility needs
	document.querySelector(".voice-input").addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			routeActions(e.target.value);
			e.target.value = ""; // Clear the input after processing
		}
	});
}

export { setupListeners };
