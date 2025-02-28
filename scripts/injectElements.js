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
	});
	header.textContent = "Transcript (might remove later)";

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

	speechContainer.appendChild(header);
	speechContainer.appendChild(speechDisplay);
	speechContainer.appendChild(textInput);
	document.body.appendChild(speechContainer);

	return { speechDisplay };
}

window.injectElements = injectElements;
