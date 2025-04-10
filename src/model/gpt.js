import { collectUniqueDestinations, navigate } from "./navigation.js";
import { POSSIBLE_EXTENSION_ACTIONS } from "./settings.js";
import { POSSIBLE_SIDEBAR_DESTINATIONS, sidebarActionsRouter } from "./sidebar.js";
import { textToSpeech } from "./tts.js";
import { extensionActionRouter } from "./settings.js";

// This is the function that handles calling the GPT API to interpret the user's command when RegEx fails to find a match. It sends the user's voice input and the possible destinations to the API, and then processes the response to navigate to the appropriate destination. If the API call fails, it logs the error to the console.
async function useGPT(transcript, recognitionState) {
	// If the RegEx fails to match,
	// we can fallback to a GPT check
	try {
		console.log("Calling API...");

		// Collect possible destinations to help GPT make better decisions
		const possibleDestinations = [
			...POSSIBLE_SIDEBAR_DESTINATIONS,
			...POSSIBLE_EXTENSION_ACTIONS,
			...collectUniqueDestinations(),
		];

		// console.log("Possible destinations:", possibleDestinations);

		const response = await fetch(
			"https://glacial-sea-18791-40c840bc91e9.herokuapp.com/api/gpt",
			// Uncomment the line below, and comment the line above to test locally
			// 'http://localhost:3000/api/gpt',
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					voice_input: transcript,
					possible_destinations: possibleDestinations,
				}),
			}
		);
		const data = await response.json();
		if (data && data.response) {
			//trim and remove quotes at the start and end if there is any
			const destination = data.response
				.trim()
				.replace(/^["']|["']$/g, "")
				.toLowerCase();
			console.log("Destination from GPT:", destination);

			// Check if destination is a narration request
			if (destination === "narrate") {
				textToSpeech("Calling text to speech from use GPT.");
			} else {
				// After getting the destination, trigger navigation
				const wasASidebarAction = sidebarActionsRouter(destination);

				if (wasASidebarAction) {
					// Store the confirmation message in sessionStorage
					sessionStorage.setItem(
						"canvoxNavigation",
						JSON.stringify({
							message: `Opened ${destination}`,
							timestamp: Date.now(),
						})
					);
					return;
				}

				const wasAnExtensionAction = extensionActionRouter(destination, recognitionState);
				if (!wasASidebarAction && !wasAnExtensionAction) {
					navigate(destination);
				}
			}
		}
	} catch (error) {
		console.error("Error calling API:", error);
	}
}

export { useGPT };
