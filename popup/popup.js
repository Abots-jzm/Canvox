document.addEventListener("DOMContentLoaded", () => {
	const toggleButton = document.querySelector(".theme-toggle");
	const transcriptButton = document.querySelector(".transcript");
	const hotkeyButton = document.querySelector(".change-hotkeys");
	const micToggle = document.getElementById("micToggle");
	const audioInput = document.getElementById("audioInput");
	const audioOutput = document.getElementById("audioOutput");
	const volumeSlider = document.getElementById("volumeAdjust");

	// Default settings
	const DEFAULT_SETTINGS = {
		theme: "dark",
		hotkeyMicrophone: "x",
		hotkeyTranscript: "t",
		hotkeyReadoutDown: "ArrowDown",
		hotkeyReadoutUp: "ArrowUp",
		microphoneActive: false,
		audioInput: "",
		audioOutput: "",
		volume: 100,
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

	function themetoggle() {
		if (!toggleButton || !transcriptButton || !hotkeyButton) {
			console.error("One or more theme toggle elements are missing.");
			return;
		}

		document.body.classList.toggle("light-mode");
		toggleButton.classList.toggle("button-light-mode");
		transcriptButton.classList.toggle("button-light-mode");
		hotkeyButton.classList.toggle("button-light-mode");

		const currentTheme = document.body.classList.contains("light-mode") ? "light" : "dark";
		chrome.storage.sync.set({ theme: currentTheme }, () => {
			console.log("Theme saved:", currentTheme);
		});
	}

	if (toggleButton) {
		toggleButton.addEventListener("click", themetoggle);
	}

	// Load the theme from storage with default
	getSettingWithDefault("theme", DEFAULT_SETTINGS.theme).then((theme) => {
		if (theme === "light") {
			document.body.classList.add("light-mode");
			if (toggleButton) toggleButton.classList.add("button-light-mode");
			if (transcriptButton) transcriptButton.classList.add("button-light-mode");
			if (hotkeyButton) hotkeyButton.classList.add("button-light-mode");
		}
	});

	// Hotkey Settings Panel
	const changeHotkeysBtn = document.querySelector(".change-hotkeys");
	const settingsPanel = document.querySelector(".hotkey-settings");
	const closeSettingsBtn = document.getElementById("close-settings");

	if (changeHotkeysBtn && settingsPanel && closeSettingsBtn) {
		// Show settings panel
		changeHotkeysBtn.addEventListener("click", () => {
			settingsPanel.style.display = "block";
		});

		// Hide settings panel
		closeSettingsBtn.addEventListener("click", () => {
			settingsPanel.style.display = "none";
		});
	} else {
		console.error("One or more hotkey settings elements are missing.");
	}

	// Hotkey Assignments
	function saveHotkey(inputId, storageKey) {
		const inputField = document.getElementById(inputId);
		inputField.addEventListener("keyup", (event) => {
			chrome.storage.sync.set({ [storageKey]: event.key }, () => {
				console.log(`Hotkey for ${storageKey} set to:`, event.key);
			});
		});
	}

	saveHotkey("hotkey-microphone", "hotkeyMicrophone");
	saveHotkey("hotkey-transcript", "hotkeyTranscript");
	saveHotkey("hotkey-readoutdown", "hotkeyReadoutDown");
	saveHotkey("hotkey-readoutup", "hotkeyReadoutUp");

	// Load Stored Hotkeys with defaults
	Promise.all([
		getSettingWithDefault("hotkeyMicrophone", DEFAULT_SETTINGS.hotkeyMicrophone),
		getSettingWithDefault("hotkeyTranscript", DEFAULT_SETTINGS.hotkeyTranscript),
		getSettingWithDefault("hotkeyReadoutDown", DEFAULT_SETTINGS.hotkeyReadoutDown),
		getSettingWithDefault("hotkeyReadoutUp", DEFAULT_SETTINGS.hotkeyReadoutUp),
	]).then(([micHotkey, transcriptHotkey, readoutDownHotkey, readoutUpHotkey]) => {
		document.getElementById("hotkey-microphone").value = micHotkey;
		document.getElementById("hotkey-transcript").value = transcriptHotkey;
		document.getElementById("hotkey-readoutdown").value = readoutDownHotkey;
		document.getElementById("hotkey-readoutup").value = readoutUpHotkey;
	});

	// Transcript Button (Placeholder for Future)
	transcriptButton.addEventListener("click", () => {
		console.log("Transcript button clicked - Implement functionality here");
		// You can add a function to fetch and display transcript data here
	});

	// Microphone Toggle
	micToggle.addEventListener("change", () => {
		const isMicActive = micToggle.checked;
		chrome.storage.sync.set({ microphoneActive: isMicActive }, () => {
			console.log("Microphone Status:", isMicActive);
		});
	});

	// Load Microphone State with default
	getSettingWithDefault("microphoneActive", DEFAULT_SETTINGS.microphoneActive).then((isActive) => {
		micToggle.checked = isActive;
	});

	// Audio Input Selection
	navigator.mediaDevices.enumerateDevices().then((devices) => {
		const inputDevices = devices.filter((device) => device.kind === "audioinput");
		inputDevices.forEach((device) => {
			let option = document.createElement("option");
			option.value = device.deviceId;
			option.textContent = device.label || `Microphone ${audioInput.length + 1}`;
			audioInput.appendChild(option);
		});
	});

	// Audio Output Selection
	navigator.mediaDevices.enumerateDevices().then((devices) => {
		const outputDevices = devices.filter((device) => device.kind === "audiooutput");
		outputDevices.forEach((device) => {
			let option = document.createElement("option");
			option.value = device.deviceId;
			option.textContent = device.label || `Speaker ${audioOutput.length + 1}`;
			audioOutput.appendChild(option);
		});
	});

	// Save Audio Input/Output Selection
	audioInput.addEventListener("change", () => {
		chrome.storage.sync.set({ audioInput: audioInput.value });
	});

	audioOutput.addEventListener("change", () => {
		chrome.storage.sync.set({ audioOutput: audioOutput.value });
	});

	// Load Saved Audio Preferences with defaults
	Promise.all([
		getSettingWithDefault("audioInput", DEFAULT_SETTINGS.audioInput),
		getSettingWithDefault("audioOutput", DEFAULT_SETTINGS.audioOutput),
	]).then(([inputDevice, outputDevice]) => {
		if (inputDevice) audioInput.value = inputDevice;
		if (outputDevice) audioOutput.value = outputDevice;
	});

	// Volume Slider
	volumeSlider.addEventListener("input", () => {
		chrome.storage.sync.set({ volume: volumeSlider.value }, () => {
			console.log("Volume Set:", volumeSlider.value);
		});
	});

	// Load Volume Settings with default
	getSettingWithDefault("volume", DEFAULT_SETTINGS.volume).then((vol) => {
		volumeSlider.value = vol;
	});
});
