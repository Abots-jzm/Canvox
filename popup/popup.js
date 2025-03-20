document.addEventListener("DOMContentLoaded", () => {
	const toggleButton = document.querySelector(".theme-toggle");
	const transcriptButton = document.querySelector(".transcript");
	const hotkeyButton = document.querySelector(".change-hotkeys");

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

	// Load the theme from storage
	chrome.storage.sync.get("theme", (data) => {
		if (data && data.theme === "light") {
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
});

document.addEventListener("DOMContentLoaded", () => {
	const toggleButton = document.querySelector(".theme-toggle");
	const transcriptButton = document.querySelector(".transcript");
	const hotkeyButton = document.querySelector(".change-hotkeys");
	const micToggle = document.getElementById("micToggle");
	const audioInput = document.getElementById("audioInput");
	const audioOutput = document.getElementById("audioOutput");
	const volumeSlider = document.getElementById("volumeAdjust");

	// Microphone Toggle
	micToggle.addEventListener("change", () => {
		const isMicActive = micToggle.checked;
		chrome.storage.sync.set({ microphoneActive: isMicActive }, () => {
			console.log("Microphone Status:", isMicActive);
		});
	});

	// Load Microphone State
	chrome.storage.sync.get("microphoneActive", (data) => {
		if (data.microphoneActive !== undefined) {
			micToggle.checked = data.microphoneActive;
		}
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

	// Load Saved Audio Preferences
	chrome.storage.sync.get(["audioInput", "audioOutput"], (data) => {
		if (data.audioInput) audioInput.value = data.audioInput;
		if (data.audioOutput) audioOutput.value = data.audioOutput;
	});

	// Volume Slider
	volumeSlider.addEventListener("input", () => {
		chrome.storage.sync.set({ volume: volumeSlider.value }, () => {
			console.log("Volume Set:", volumeSlider.value);
		});
	});

	// Load Volume Settings
	chrome.storage.sync.get("volume", (data) => {
		if (data.volume !== undefined) {
			volumeSlider.value = data.volume;
		}
	});

	// Theme Toggle
	function themetoggle() {
		document.body.classList.toggle("light-mode");
		toggleButton.classList.toggle("button-light-mode");
		transcriptButton.classList.toggle("button-light-mode");
		hotkeyButton.classList.toggle("button-light-mode");

		const currentTheme = document.body.classList.contains("light-mode") ? "light" : "dark";
		chrome.storage.sync.set({ theme: currentTheme }, () => {
			console.log("Theme saved:", currentTheme);
		});
	}

	toggleButton.addEventListener("click", themetoggle);

	// Load Theme from Storage
	chrome.storage.sync.get("theme", (data) => {
		if (data.theme === "light") {
			document.body.classList.add("light-mode");
			toggleButton.classList.add("button-light-mode");
			transcriptButton.classList.add("button-light-mode");
			hotkeyButton.classList.add("button-light-mode");
		}
	});

	// Hotkey Settings Panel
	const settingsPanel = document.querySelector(".hotkey-settings");
	const closeSettingsBtn = document.getElementById("close-settings");

	hotkeyButton.addEventListener("click", () => {
		settingsPanel.style.display = "block";
	});

	closeSettingsBtn.addEventListener("click", () => {
		settingsPanel.style.display = "none";
	});

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

	// Load Stored Hotkeys
	chrome.storage.sync.get(["hotkeyMicrophone", "hotkeyTranscript", "hotkeyReadoutDown", "hotkeyReadoutUp"], (data) => {
		if (data.hotkeyMicrophone) document.getElementById("hotkey-microphone").value = data.hotkeyMicrophone;
		if (data.hotkeyTranscript) document.getElementById("hotkey-transcript").value = data.hotkeyTranscript;
		if (data.hotkeyReadoutDown) document.getElementById("hotkey-readoutdown").value = data.hotkeyReadoutDown;
		if (data.hotkeyReadoutUp) document.getElementById("hotkey-readoutup").value = data.hotkeyReadoutUp;
	});

	// Transcript Button (Placeholder for Future)
	transcriptButton.addEventListener("click", () => {
		console.log("Transcript button clicked - Implement functionality here");
		// You can add a function to fetch and display transcript data here
	});
});
