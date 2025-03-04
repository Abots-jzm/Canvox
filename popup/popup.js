// TODO
const toggleButton = document.querySelector(".theme-toggle");
const transcriptButton = document.querySelector(".transcript");
const hotkeyButton = document.querySelector(".hotkeys");

function themetoggle(){
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


chrome.storage.sync.get("theme", (data) => {
    if (data.theme === "light") {
        document.body.classList.add("light-mode");
        toggleButton.classList.add("button-light-mode");
        transcriptButton.classList.add("button-light-mode");
        hotkeyButton.classList.add("button-light-mode");
    }
});



document.addEventListener("DOMContentLoaded", () => {
    const changeHotkeysBtn = document.getElementById("change-hotkeys");
    const settingsPanel = document.getElementById("hotkey-settings");
    const closeSettingsBtn = document.getElementById("close-settings");

    if (!changeHotkeysBtn || !settingsPanel || !closeSettingsBtn) {
        console.error("One or more elements not found.");
        return;
    }

    // Show settings panel
    changeHotkeysBtn.addEventListener("click", () => {
        settingsPanel.style.display = "block";
    });

    // Hide settings panel
    closeSettingsBtn.addEventListener("click", () => {
        settingsPanel.style.display = "none";
    });
});
