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
