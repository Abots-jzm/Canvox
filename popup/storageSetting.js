// Handles Theme Toggle and Storage
function themetoggle() {
    document.body.classList.toggle("light-mode");
    toggleButton.classList.toggle("button-light-mode");
    transcriptButton.classList.toggle("button-light-mode");
    hotkeyButton.classList.toggle("button-light-mode");

    const currentTheme = document.body.classList.contains("light-mode") ? "light" : "dark";
    chrome.storage.sync.set({ theme: currentTheme });
}

// Load stored theme on page load
chrome.storage.sync.get("theme", (data) => {
    if (data.theme === "light") {
        document.body.classList.add("light-mode");
        toggleButton.classList.add("button-light-mode");
        transcriptButton.classList.add("button-light-mode");
        hotkeyButton.classList.add("button-light-mode");
    }
});

// Handles Hotkey Panel Persistence
document.addEventListener("DOMContentLoaded", () => {
    if (!changeHotkeysBtn || !settingsPanel || !closeSettingsBtn) return;

    chrome.storage.sync.get("hotkeyPanelVisible", (data) => {
        if (data.hotkeyPanelVisible) {
            settingsPanel.style.display = "block";
        }
    });

    changeHotkeysBtn.addEventListener("click", () => {
        settingsPanel.style.display = "block";
        chrome.storage.sync.set({ hotkeyPanelVisible: true });
    });

    closeSettingsBtn.addEventListener("click", () => {
        settingsPanel.style.display = "none";
        chrome.storage.sync.set({ hotkeyPanelVisible: false });
    });
});

// Handles Microphone Checkbox Persistence
microphoneCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({ microphoneActive: microphoneCheckbox.checked });
});

chrome.storage.sync.get("microphoneActive", (data) => {
    if (data.microphoneActive !== undefined) {
        microphoneCheckbox.checked = data.microphoneActive;
    }
});

// Handles Voice Readout Volume Persistence
volumeSlider.addEventListener("input", () => {
    chrome.storage.sync.set({ volume: volumeSlider.value });
});

chrome.storage.sync.get("volume", (data) => {
    if (data.volume !== undefined) {
        volumeSlider.value = data.volume;
    }
});

// Handles Audio Input & Output Select Persistence
audioInputSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ audioInput: audioInputSelect.value });
});

audioOutputSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ audioOutput: audioOutputSelect.value });
});

chrome.storage.sync.get(["audioInput", "audioOutput"], (data) => {
    if (data.audioInput) {
        audioInputSelect.value = data.audioInput;
    }
    if (data.audioOutput) {
        audioOutputSelect.value = data.audioOutput;
    }
});
