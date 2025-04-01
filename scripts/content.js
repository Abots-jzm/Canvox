// This is the entry point for the content script of the Canvox extension. It initializes speech recognition, handles hotkeys, and manages microphone state.
// It also listens for messages from the popup and updates the UI accordingly.
(function () {
	const { speechDisplay, speechContainer } = window.injectElements();

	// Check for navigation confirmation messages
	function checkNavigationMessages() {
		try {
			const navigationData = sessionStorage.getItem("canvoxNavigation");
			if (navigationData) {
				const { message, timestamp } = JSON.parse(navigationData);

				// Only process messages that are less than 5 seconds old
				if (Date.now() - timestamp < 5000) {
					// Play the confirmation message
					setTimeout(() => {
						textToSpeech(message);
					}, 500); // Small delay to ensure the page has loaded
				}

				// Clear the message after processing
				sessionStorage.removeItem("canvoxNavigation");
			}
		} catch (error) {
			console.error("Error processing navigation message:", error);
		}
	}

	// Check if the browser supports the SpeechRecognition API
	// If not, exit early to avoid errors
	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	if (!SpeechRecognition) return;

	let recognition = null;
	let isRecognizing = false;

	// Run the navigation message check when the page loads
	checkNavigationMessages();

	// Also check after any page state changes
	window.addEventListener("popstate", checkNavigationMessages);

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
			} catch (e) {
				console.warn("This browser doesn't support selecting audio input devices for SpeechRecognition:", e);
			}
		}

		// This event is fired when speech recognition starts
		recognition.onresult = (event) => {
			let transcript = "";
			for (let i = event.resultIndex; i < event.results.length; i++) {
				transcript += event.results[i][0].transcript;
			}
			speechDisplay.textContent = transcript;

			// We want to wait a bit before sending the transcript to actions to avoid flooding it with too many calls
			// This debounce mechanism ensures that we only call actions once the user has paused speaking
			clearTimeout(window.debounceTimer);
			window.debounceTimer = setTimeout(() => {
				// IMPORTANT: This is where we call pass control to the actions.js script
				// to handle the speech commands. The actions function should be defined in actions.js.
				window.actions(transcript);
			}, 1000);
		};

		// This event is fired when speech recognition detects no speech for a while and stops
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

		// Start recognition if it was previously active
		// This ensures that if the user had the microphone active before, it will restart automatically
		// We can decide to remove this if we want to avoid auto-starting recognition on page load
		// but for now, it provides a smoother user experience
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

		// Update the storage to keep popup UI in sync. So that when the user presses hotkey, the popup reflects the correct state
		// of the microphone (active/inactive).
		chrome.storage.sync.set({ microphoneActive: isRecognizing });
	}

	window.toggleMicrophone = toggleMicrophone; // Expose the function to the global scope for use in popup or other scripts

	// Function to adjust volume
	function adjustVolume(destination) {
		// This function can be used to adjust the volume of the speech synthesis or any other audio output
		// For now, it's a placeholder as SpeechRecognition doesn't have a direct volume control
		// You can implement this based on your requirements

		let action;
		let currVol;
		let newVol;

		// Get the current volume from storage
		chrome.storage.sync.get("volume", (data) => {
			currVol = parseInt(data.volume) // Retrieve current volume
			if (currVol === undefined) {
				// If volume is not set, default to 50
				currVol = DEFAULT_SETTINGS.volume;
			}
		});

		setTimeout(function () {
			action = destination.split(" ")[1]; // Extract the volume change from the destination string
			if (action == "mute") {
				newVol = 0;
			} else if (action == "up") {
				newVol = Math.min(100, currVol + 10); // Increase volume by 10, max 100
			} else if (action == "down") {
				newVol = Math.max(0, currVol - 10); // Decrease volume by 10, min 0
			}

			chrome.storage.sync.set({volume: newVol});		
			console.log(`Volume adjusted to: ${newVol}`); // Log the new volume for debugging
		}, 100); // Change newVol and store after a short delay to ensure currVol is set correctly
	}

	window.adjustVolume = adjustVolume;

	function setVolume(volume) {
		// This function can be used to set the volume of the speech synthesis or any other audio output

		// Ensure volume is between 0 and 100
		volume = Math.min(100, volume); 
		volume = Math.max(0, volume);

		// Set the volume in the storage
		chrome.storage.sync.set({ volume: volume });

		setTimeout(function(){
			console.log(`Volume set to: ${volume}`); // Log the new volume
		}, 100);

	}

	window.setVolume = setVolume;

	/**
	 * Determines if a keyboard event matches the configured hotkey
	 * This function supports two formats of hotkey configuration:
	 * 1. Legacy format (simple string) - for single-key shortcuts
	 * 2. Object format - for complex shortcuts with modifier keys
	 *
	 * This dual support allows backward compatibility while enabling
	 * more advanced keyboard combinations.
	 */
	function isHotkeyMatch(event, hotkey) {
		// Handle legacy format (string)
		if (typeof hotkey === "string") {
			return event.key.toLowerCase() === hotkey.toLowerCase();
		}

		// New format (object with modifiers)
		// Ensure the hotkey object has a key property to prevent errors
		return (
			(!hotkey.ctrl || event.ctrlKey) &&
			(!hotkey.alt || event.altKey) &&
			(!hotkey.shift || event.shiftKey) &&
			event.key.toLowerCase() === (hotkey.key || "").toLowerCase()
		);
	}

	/**
	 * Global keyboard shortcut handler
	 * We use document-level event listener to capture keypresses anywhere on the page,
	 * regardless of which element has focus, ensuring consistent access to functionality.
	 */
	document.addEventListener("keydown", (e) => {
		// Microphone hotkey - dynamically fetch user preference to respect any settings
		// changes without requiring page reload
		getSettingWithDefault("hotkeyMicrophone", DEFAULT_SETTINGS.hotkeyMicrophone).then((hotkey) => {
			if (isHotkeyMatch(e, hotkey)) {
				toggleMicrophone();
				e.preventDefault(); // Prevent browser's default handling of this key
			}
		});

		// Transcript visibility hotkey - toggle the transcript panel's visibility
		// This is kept separate from microphone control to allow independent operation
		getSettingWithDefault("hotkeyTranscript", DEFAULT_SETTINGS.hotkeyTranscript).then((hotkey) => {
			if (isHotkeyMatch(e, hotkey)) {
				window.toggleTranscript();
				e.preventDefault(); // Prevent browser's default handling of this key
			}
		});
	});

	// Listen for input from the text area to allow manual input of speech commands
	// This is for users who may not want to use the microphone or have accessibility needs
	document.querySelector(".voice-input").addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			window.actions(e.target.value);
		}
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
