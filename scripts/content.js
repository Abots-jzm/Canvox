(function () {
	const { speechDisplay, speechContainer } = window.injectElements();

	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	if (!SpeechRecognition) return;

	let recognition = null;
	let isRecognizing = false;

	// Default settings (fallback in case defaults.js hasn't loaded)
	const DEFAULT_SETTINGS = window.DEFAULT_SETTINGS || {
		hotkeyMicrophone: "x",
		hotkeyTranscript: "t",
		microphoneActive: false,
		transcriptVisible: true,
		audioInput: "default",
	};

	// Helper function to get settings with defaults
	function getSettingWithDefault(key, defaultValue) {
		if (window.getSettingWithDefault) {
			return window.getSettingWithDefault(key, defaultValue);
		}

		// Fallback in case defaults.js hasn't loaded
		return new Promise((resolve) => {
			chrome.storage.sync.get(key, (result) => {
				if (chrome.runtime.lastError) {
					console.error(chrome.runtime.lastError);
				}

				// If setting doesn't exist, save and use default
				if (result[key] === undefined) {
					chrome.storage.sync.set({ [key]: defaultValue });
					resolve(defaultValue);
				} else {
					resolve(result[key]);
				}
			});
		});
	}

	// Initialize speech recognition with appropriate audio device
	function initializeSpeechRecognition(deviceId = null) {
		// If there's an existing recognition object and it's active, stop it
		if (recognition && isRecognizing) {
			recognition.stop();
			isRecognizing = false;
		}

		// Create a new recognition instance
		recognition = new SpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = "en-US";

		// If a specific device ID is provided and it's not the default
		if (deviceId && deviceId !== "default") {
			try {
				// Use the SpeechRecognition API's mediaDeviceId option if supported
				recognition.mediaDeviceId = deviceId;
				console.log("Set microphone to device ID:", deviceId);
			} catch (e) {
				console.warn("This browser doesn't support selecting audio input devices for SpeechRecognition:", e);
			}
		}

		// Set up the event handlers for the new recognition instance
		recognition.onresult = (event) => {
			let transcript = "";
			for (let i = event.resultIndex; i < event.results.length; i++) {
				transcript += event.results[i][0].transcript;
			}
			speechDisplay.textContent = transcript;

			clearTimeout(window.debounceTimer);
			window.debounceTimer = setTimeout(() => {
				window.actions(transcript);
			}, 1000);
		};

		recognition.onend = () => {
			isRecognizing = false;
			// Update storage when recognition ends
			chrome.storage.sync.set({ microphoneActive: false });
		};

		recognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			isRecognizing = false;
			// Update storage when recognition errors
			chrome.storage.sync.set({ microphoneActive: false });
		};

		// If it was active before, restart it
		if (isRecognizing) {
			try {
				recognition.start();
			} catch (e) {
				console.error("Failed to restart speech recognition:", e);
			}
		}

		return recognition;
	}

	// Function to toggle microphone state
	function toggleMicrophone() {
		if (isRecognizing) {
			recognition.stop();
			isRecognizing = false;
		} else {
			if (!recognition) {
				getSettingWithDefault("audioInput", DEFAULT_SETTINGS.audioInput).then((deviceId) => {
					initializeSpeechRecognition(deviceId);
					recognition.start();
					isRecognizing = true;
				});
			} else {
				recognition.start();
				isRecognizing = true;
			}
		}

		// Update the storage to keep popup UI in sync
		chrome.storage.sync.set({ microphoneActive: isRecognizing }, () => {
			console.log("Microphone Status (from content):", isRecognizing);
		});
	}

	// Listen for hotkey presses
	document.addEventListener("keydown", (e) => {
		// Microphone hotkey
		getSettingWithDefault("hotkeyMicrophone", DEFAULT_SETTINGS.hotkeyMicrophone).then((hotkey) => {
			if (e.key.toLowerCase() === hotkey.toLowerCase()) {
				toggleMicrophone();
			}
		});

		// Transcript hotkey (with Ctrl key)
		getSettingWithDefault("hotkeyTranscript", DEFAULT_SETTINGS.hotkeyTranscript).then((hotkey) => {
			if (e.ctrlKey && e.key.toLowerCase() === hotkey.toLowerCase()) {
				window.toggleTranscript();
				e.preventDefault(); // Prevent browser's default action for Ctrl+T
			}
		});
	});

	document.querySelector(".voice-input").addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			window.actions(e.target.value);
		}
	});

	// Listen for changes to the microphone state from the popup
	chrome.storage.onChanged.addListener((changes) => {
		if (changes.microphoneActive && changes.microphoneActive.newValue !== isRecognizing) {
			if (changes.microphoneActive.newValue === true && !isRecognizing) {
				if (!recognition) {
					getSettingWithDefault("audioInput", DEFAULT_SETTINGS.audioInput).then((deviceId) => {
						initializeSpeechRecognition(deviceId);
						recognition.start();
						isRecognizing = true;
					});
				} else {
					recognition.start();
					isRecognizing = true;
				}
			} else if (changes.microphoneActive.newValue === false && isRecognizing) {
				recognition.stop();
				isRecognizing = false;
			}
		}

		// Listen for audio input device changes
		if (changes.audioInput) {
			initializeSpeechRecognition(changes.audioInput.newValue);
		}
	});

	// Listen for messages from popup
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.action === "updateAudioInput") {
			initializeSpeechRecognition(message.deviceId);
			sendResponse({ success: true });
			return true;
		}

		if (message.action === "toggleTranscript") {
			const newVisibility = window.toggleTranscript();
			sendResponse({ success: true, isVisible: newVisibility });
			return true;
		}
	});

	// Initialize microphone state from storage and set up speech recognition
	Promise.all([
		getSettingWithDefault("microphoneActive", DEFAULT_SETTINGS.microphoneActive),
		getSettingWithDefault("audioInput", DEFAULT_SETTINGS.audioInput),
	]).then(([isActive, deviceId]) => {
		// Initialize speech recognition with the saved device ID
		recognition = initializeSpeechRecognition(deviceId);

		// Start recognition if it was previously active
		if (isActive && !isRecognizing) {
			recognition.start();
			isRecognizing = true;
		}
	});
})();
