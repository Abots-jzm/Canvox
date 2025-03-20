(function () {
	const { speechDisplay } = window.injectElements();

	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	if (!SpeechRecognition) return;

	const recognition = new SpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;
	recognition.lang = "en-US";

	let isRecognizing = false;

	// Default settings
	const DEFAULT_SETTINGS = {
		hotkeyMicrophone: "x",
		microphoneActive: false,
	};

	// Helper function to get settings with defaults
	function getSettingWithDefault(key, defaultValue) {
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

	// Function to toggle microphone state
	function toggleMicrophone() {
		if (isRecognizing) {
			recognition.stop();
			isRecognizing = false;
		} else {
			recognition.start();
			isRecognizing = true;
		}

		// Update the storage to keep popup UI in sync
		chrome.storage.sync.set({ microphoneActive: isRecognizing }, () => {
			console.log("Microphone Status (from content):", isRecognizing);
		});
	}

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

	// Listen for hotkey presses
	document.addEventListener("keydown", (e) => {
		// Get the current microphone hotkey
		getSettingWithDefault("hotkeyMicrophone", DEFAULT_SETTINGS.hotkeyMicrophone).then((hotkey) => {
			if (e.key.toLowerCase() === hotkey.toLowerCase()) {
				toggleMicrophone();
			}
		});
	});

	document.querySelector(".voice-input").addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			window.actions(e.target.value);
		}
	});

	recognition.onend = () => {
		isRecognizing = false;
		// Update storage when recognition ends
		chrome.storage.sync.set({ microphoneActive: false });
	};

	recognition.onerror = () => {
		isRecognizing = false;
		// Update storage when recognition errors
		chrome.storage.sync.set({ microphoneActive: false });
	};

	// Listen for changes to the microphone state from the popup
	chrome.storage.onChanged.addListener((changes) => {
		if (changes.microphoneActive && changes.microphoneActive.newValue !== isRecognizing) {
			if (changes.microphoneActive.newValue === true && !isRecognizing) {
				recognition.start();
				isRecognizing = true;
			} else if (changes.microphoneActive.newValue === false && isRecognizing) {
				recognition.stop();
				isRecognizing = false;
			}
		}
	});

	// Initialize microphone state from storage
	getSettingWithDefault("microphoneActive", DEFAULT_SETTINGS.microphoneActive).then((isActive) => {
		if (isActive && !isRecognizing) {
			recognition.start();
			isRecognizing = true;
		}
	});
})();
