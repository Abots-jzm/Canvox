// This script handles the actions for navigating the sidebar based on user voice input. Think of it as the "brain" of the extension. It will contain most of the logic for interpreting user commands and deciding what to do with them.

// This list is neccessary to give GPT a better idea of what the user might be trying to say. It contains all the possible sidebar destinations that we can navigate to. This is used when we can't find a match using RegEx, and we need to call GPT to interpret the user's command.
const POSSIBLE_SIDEBAR_DESTINATIONS = [
	"home",
	"dashboard",
	"calendar",
	"courses",
	"classes",
	"groups",
	"inbox",
	"messages",
	"back",
];

const POSSIBLE_EXTENSION_ACTIONS = [
	"micmute",
	"volume up",
	"volume down",
	"volume mute",
	"volume [0-9]{1,3}",
	"toggletranscript",
]

// This function decides what to do with the user's voice input. It first tries to extract a destination using RegEx patterns. If it finds one, it checks if it's a sidebar action and navigates accordingly. If it doesn't find a match, it calls the useGPT function to interpret the command using GPT.
function actions(transcript) {
	if (window.wasATextAction(transcript)) return;

	const destination = window.extractDestination(transcript);

	// Handles narration requests
	if (destination === "narrate") {
		textToSpeech("Calling text to speech from actions.");
		return;
	}

	// Handles navigation requests
	if (destination) {
		// Check if the destination is a sidebar action
		const wasASidebarAction = window.sidebarActionsRouter(destination);
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
		if (/(micmute|volume.*|toggletranscript)/i.test(destination)) {
			// If the destination is related to microphone, volume, or transcript, trigger the action directly
			// Call the extension action router to handle specific actions'
			window.extensionActionRouter(destination);
			return;
		}

		const navigationSuccessful = navigate(destination, transcript);
		if (!navigationSuccessful) {
			// Only call useGPT if navigation failed
			useGPT(transcript);
		}
	} else {
		// No destination was found, use GPT to interpret
		useGPT(transcript);
	}
}

//R
function submitDiscussionReply() {
	// Find the reply button using the exact selector from your Canvas HTML
	const submitButton = document.querySelector('button[data-testid="DiscussionEdit-submit"]');

	if (submitButton) {
		submitButton.click();
		console.log("Successfully clicked the Reply button");
		return true;
	} else {
		console.warn("Reply button not found - are you on a discussion page?");
		return false;
	}
}

function openDiscussionReply() {
	// Find the reply button using the exact selector from your Canvas HTML
	const replyButton = document.querySelector('button[data-testid="discussion-topic-reply"]');

	if (replyButton) {
		replyButton.click();
		console.log("Successfully clicked the Reply button");
		return true;
	} else {
		console.warn("Reply button not found - are you on a discussion page?");
		return false;
	}
}

function handleDiscussionBoxCommand(transcript) {
	// 1. Extract text from commands
	const inputRegex =
		/(?:write|type|paste|input|can you)\s+(?:in\s+)?(?:the\s+)?(?:discussion\s+box|text\s+box|input\s+field)?\s*(.+)/i;
	const match = inputRegex.exec(transcript);

	if (!match) return false; // Not a discussion box command
	const textToPaste = match[1].trim();

	if (!textToPaste) return false;

	// 2. Find the Canvas editor iframe
	const iframe = document.querySelector("iframe.tox-edit-area__iframe, #message-body-root_ifr");
	if (!iframe) {
		console.warn("Canvas editor not found - are you on a discussion page?");
		return false;
	}
	try {
		// 3. Focus the editor
		iframe.focus();
		const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

		// 4. Find or create the paragraph element
		let paragraph = iframeDoc.querySelector("p");

		// 5. Insert text and trigger all necessary events
		paragraph.textContent = textToPaste;

		// These events make Canvas detect the changes
		["input", "change", "keydown", "keyup", "blur"].forEach((eventType) => {
			paragraph.dispatchEvent(new Event(eventType, { bubbles: true }));
		});
		console.log("Success! Pasted:", textToPaste);
		return true;
	} catch (error) {
		console.error("Failed to paste text:", error);
		return false;
	}
}
//R

// This is the function that handles calling the GPT API to interpret the user's command when RegEx fails to find a match. It sends the user's voice input and the possible destinations to the API, and then processes the response to navigate to the appropriate destination. If the API call fails, it logs the error to the console.
async function useGPT(transcript) {
	// If the RegEx fails to match,
	// we can fallback to a GPT check
	try {
		console.log("Calling API...");

		// Collect possible destinations to help GPT make better decisions
		const possibleDestinations = [
			...POSSIBLE_SIDEBAR_DESTINATIONS,
			...POSSIBLE_EXTENSION_ACTIONS,
			...window.collectUniqueDestinations(),
		];
		console.log("Possible destinations:", possibleDestinations);

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
				const wasASidebarAction = window.sidebarActionsRouter(destination);
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

				const wasAnExtensionAction = window.extensionActionRouter(destination);
				if (!wasASidebarAction && !wasAnExtensionAction) {
					navigate(destination, transcript);
				}
			}
		}
	} catch (error) {
		console.error("Error calling API:", error);
	}
}

function navigate(destination) {
	//select all links in the layout wrapper
	const layoutWrapper = document.querySelector(".ic-Layout-wrapper");
	const links = layoutWrapper ? layoutWrapper.querySelectorAll("a") : [];

	//search for the appropriate link and navigate
	for (const link of links) {
		if (
			link.textContent.toLowerCase().includes(destination) ||
			(link.title && link.title.toLowerCase().includes(destination))
		) {
			// Store the confirmation message in sessionStorage for audio confirmation
			sessionStorage.setItem(
				"canvoxNavigation",
				JSON.stringify({
					message: `Opened ${destination}`,
					timestamp: Date.now(),
				})
			);

			// Then navigate
			link.click();
			return true;
		}

		for (const child of link.children) {
			if (
				child.textContent.toLowerCase().includes(destination) ||
				(child.title && child.title.toLowerCase().includes(destination))
			) {
				// Store the confirmation message in sessionStorage for audio confirmation
				sessionStorage.setItem(
					"canvoxNavigation",
					JSON.stringify({
						message: `Opened ${destination}`,
						timestamp: Date.now(),
					})
				);

				// Then navigate
				link.click();
				return true;
			}
		}
	}

	// No matching link found
	return false;
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
		audioElement.volume = (parseInt(data.volume)) / 100;

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
