// Check for navigation confirmation messages
function giveNavigationFeedback() {
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
		console.warn("Error processing navigation message:", error);
	}
}

// Add this new function below collectMainContent
async function narratePage(transcript = "") {
	try {
		console.log("Preparing page narration with content summary...");

		// Get the page content
		let pageContent = collectMainContent();

		// Get the page title
		const pageTitle = document.title || "Current page";

		// Clean up the content - remove excessive whitespace
		pageContent = pageContent.replace(/\s+/g, " ").trim();

		// Create a summary prompt
		const narrateText = `Page title: ${pageTitle}. Content: ${pageContent}`;

		// Create audio element to play the response
		const audioElement = document.createElement("audio");
		audioElement.controls = false;
		audioElement.style.display = "none";
		document.body.appendChild(audioElement);

		// Make a direct call to the narration API endpoint
		const response = await fetch(
			"https://glacial-sea-18791-40c840bc91e9.herokuapp.com/api/narrate",
			// Uncomment the line below, and comment the line above to test locally
			// 'http://localhost:3000/api/narrate',
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					page_content: narrateText,
					user_transcript: transcript,
					summarize: true,
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
		}

		// Create a URL for the audio blob
		const audioBlob = await response.blob();
		const audioUrl = URL.createObjectURL(audioBlob);

		// Set the source and play
		audioElement.src = audioUrl;
		await audioElement.play();

		// Dispatch a custom event that content.js will listen for
		const narrateEvent = new CustomEvent("narrate-ready", { detail: { audioElement } });
		document.dispatchEvent(narrateEvent);

		return true;
	} catch (error) {
		console.warn("Error in narratePage function:", error);
		return false;
	}
}

function collectMainContent() {
	// Collect the main content of the page for narration
	const mainContent = document.querySelector(".ic-Layout-contentMain");
	if (mainContent) {
		return mainContent.textContent || "";
	}
	return "";
}

async function textToSpeech(narrateContent) {
	try {
		console.log("Calling API (TTS)...");

		// Create an audio element to play the response
		const audioElement = document.createElement("audio");
		audioElement.controls = false;
		audioElement.style.display = "none";
		document.body.appendChild(audioElement);

		// Set the volume of the audio element
		const data = await chrome.storage.sync.get("volume");
		audioElement.volume = parseInt(data.volume) / 100;

		const response = await fetch(
			"https://glacial-sea-18791-40c840bc91e9.herokuapp.com/api/tts",
			// Uncomment the line below, and comment the line above to test locally
			// 'http://localhost:3000/api/tts',
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ narrate_Content: narrateContent }),
			}
		);

		if (!response.ok) {
			throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
		}

		// Create a URL for the audio blob
		const audioBlob = await response.blob();
		const audioUrl = URL.createObjectURL(audioBlob);

		// Set the source and play
		audioElement.src = audioUrl;
		await audioElement.play();

		// Dispatch a custom event that content.js will listen for
		const ttsEvent = new CustomEvent("tts-ready", { detail: { audioElement } });
		document.dispatchEvent(ttsEvent);
	} catch (error) {
		console.error("Error in textToSpeech function:", error);
	}
}

export { giveNavigationFeedback, narratePage, textToSpeech };
