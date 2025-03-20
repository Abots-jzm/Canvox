function injectElements() {
	const speechContainer = document.createElement("div");
	Object.assign(speechContainer.style, {
		position: "fixed",
		bottom: "0",
		left: "0",
		width: "100%",
		background: "rgba(0, 0, 0, 0.8)",
		zIndex: "9999",
	});

	const header = document.createElement("div");
	Object.assign(header.style, {
		padding: "5px 10px",
		color: "white",
		fontSize: "14px",
		fontWeight: "bold",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	});

	const headerText = document.createElement("span");
	headerText.textContent = "Transcript";

	const toggleButton = document.createElement("button");
	toggleButton.textContent = "Show Text Input";
	Object.assign(toggleButton.style, {
		padding: "3px 8px",
		backgroundColor: "#444",
		color: "white",
		border: "1px solid #666",
		borderRadius: "3px",
		cursor: "pointer",
		fontSize: "12px",
	});

	header.appendChild(headerText);
	header.appendChild(toggleButton);

	const speechDisplay = document.createElement("div");
	speechDisplay.id = "speech-display";
	Object.assign(speechDisplay.style, {
		padding: "10px",
		color: "white",
		fontSize: "16px",
	});
	speechDisplay.textContent = "";

	const textInput = document.createElement("input");
	textInput.className = "voice-input";
	// Initially hide the text input
	textInput.style.display = "none";

	// Add event listener for toggle button
	toggleButton.addEventListener("click", () => {
		if (textInput.style.display === "none") {
			textInput.style.display = "block";
			toggleButton.textContent = "Hide Text Input";
		} else {
			textInput.style.display = "none";
			toggleButton.textContent = "Show Text Input";
		}
	});

	speechContainer.appendChild(header);
	speechContainer.appendChild(speechDisplay);
	speechContainer.appendChild(textInput);
	document.body.appendChild(speechContainer);

	// Set initial visibility based on saved preference
	chrome.storage.sync.get("transcriptVisible", (data) => {
		if (data.transcriptVisible === false) {
			speechContainer.style.display = "none";
		} else {
			speechContainer.style.display = "block";
		}
	});

	// Function to toggle transcript visibility
	function toggleTranscript() {
		const isVisible = speechContainer.style.display !== "none";
		speechContainer.style.display = isVisible ? "none" : "block";

		// Save the state to storage
		chrome.storage.sync.set({ transcriptVisible: !isVisible });

		return !isVisible; // Return the new visibility state
	}

	window.toggleTranscript = toggleTranscript;

	return { speechDisplay, speechContainer };
}

window.injectElements = injectElements;
