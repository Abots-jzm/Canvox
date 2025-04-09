// start speech recognition with appropriate audio device
function startRecogition(deviceId = null) {
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
