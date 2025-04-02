// This script handles the actions for navigating the sidebar based on user voice input. 
// It contains most of the logic for interpreting user commands and deciding what to do with them.

// This list is necessary to give GPT a better idea of what the user might be trying to say.
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
];

// This function decides what to do with the user's voice input.
function actions(transcript) {
    // If the current page is the inbox page, try handling inbox-specific commands first.
    // This assumes that the inbox page URL contains "inbox". Adjust the check as needed.
    if (window.location.href.includes("inbox") && handleInboxVoiceCommand(transcript)) {
        return;
    }

	const destination = extractDestination(transcript);

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
			extensionActionRouter(destination);
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

// This function handles voice commands specific to the inbox page.
// It looks for commands like "next message", "previous message", "open message", "delete message", and "reply".
// If a command is handled, it returns true.
function handleInboxVoiceCommand(transcript) {
	if (/next\s+message/i.test(transcript)) {
		if (window.selectNextMessage) {
			window.selectNextMessage();
			sessionStorage.setItem(
				"canvoxNavigation",
				JSON.stringify({
					message: "Selected next message",
					timestamp: Date.now(),
				})
			);
			return true;
		}
	}
	if (/previous\s+message/i.test(transcript)) {
		if (window.selectPreviousMessage) {
			window.selectPreviousMessage();
			sessionStorage.setItem(
				"canvoxNavigation",
				JSON.stringify({
					message: "Selected previous message",
					timestamp: Date.now(),
				})
			);
			return true;
		}
	}
	if (/open\s+message/i.test(transcript)) {
		if (window.openSelectedMessage) {
			window.openSelectedMessage();
			sessionStorage.setItem(
				"canvoxNavigation",
				JSON.stringify({
					message: "Opened selected message",
					timestamp: Date.now(),
				})
			);
			return true;
		}
	}
	if (/delete\s+message/i.test(transcript)) {
		if (window.deleteSelectedMessage) {
			window.deleteSelectedMessage();
			sessionStorage.setItem(
				"canvoxNavigation",
				JSON.stringify({
					message: "Deleted selected message",
					timestamp: Date.now(),
				})
			);
			return true;
		}
	}
	if (/reply/i.test(transcript)) {
		if (window.replyToMessage) {
			window.replyToMessage();
			sessionStorage.setItem(
				"canvoxNavigation",
				JSON.stringify({
					message: "Replied to message",
					timestamp: Date.now(),
				})
			);
			return true;
		}
	}
	// No inbox-specific command matched.
	return false;
}

// This function uses RegEx to extract a destination from the user's voice input.
function extractDestination(transcript) {
	const directCommands =
		/(?:go(?:\s+to)?|open|show(?:\s+me)?|navigate\s+to|take\s+me\s+to|view|access|display)(?:\s+my)?\s+([a-z0-9\s]+?)(?:\s+course(?:s)?)?$/i;
	const questionForms =
		/(?:where\s+(?:are|is)(?:\s+my)?|can\s+I\s+see(?:\s+my)?|how\s+do\s+I\s+get\s+to(?:\s+my)?)\s+([a-z0-9\s]+)/i;
	const specificNeeds =
		/(?:show\s+(?:all|my)(?:\s+my)?|list\s+my(?:\s+current)?|display\s+my(?:\s+enrolled)?|find\s+my)\s+([a-z0-9\s]+)/i;
	const contextNavigation = /(?:return\s+to|back\s+to|switch\s+to|change\s+to|go\s+back(?:\s+to)?)\s+([a-z0-9\s]+|$)/i;
	const conversationalPhrases =
		/(?:I\s+(?:need|want)\s+to\s+(?:see|check)(?:\s+my)?|let\s+me\s+see(?:\s+what)?|show\s+me\s+what(?:\s+I'm)?)\s+([a-z0-9\s]+)/i;
	const clickPressActions =
		/(?:click|press|select|choose|tap(?:\s+on)?|hit)\s+(?:the\s+)?([a-z0-9\s]+)(?:\s+button|link)?/i;
	const narrateContent = /(read|speak|narrate)(\s+the)?(\s+(main|this|page))?(\s+content)?/i;
	const microphoneMute =
		/(mute)?\s*(?:the|my\s+)?mic(rophone)?(mute)?/i;
	const volumeShift =
		/(turn|change)?\s*volume\s+(up|down|mute)/i;
	const setVolume =
		/(set|change)?\s*volume\s*(to|set)?\s*(\d+)/i;
	const toggleTranscript =
		/(show|hide|toggle)\s+transcript/i;

	let match;
	let destination;

	if ((match = microphoneMute.exec(transcript))) {
		destination = "micmute";
	} else if ((match = volumeShift.exec(transcript))) {
		destination = match[match.length - 1] === "mute" ? "volume mute" : match[match.length - 1] === "up" ? "volume up" : "volume down";
	} else if ((match = setVolume.exec(transcript))) {
		destination = `volume ${match[match.length - 1]}`;
	} else if ((match = toggleTranscript.exec(transcript))) {
		destination = "toggletranscript";
	} else if ((match = contextNavigation.exec(transcript))) {
		destination = match[1];
	} else if ((match = clickPressActions.exec(transcript))) {
		destination = match[1];
	} else if ((match = specificNeeds.exec(transcript))) {
		destination = match[1];
	} else if ((match = conversationalPhrases.exec(transcript))) {
		destination = match[1];
	} else if ((match = questionForms.exec(transcript))) {
		destination = match[1];
	} else if ((match = directCommands.exec(transcript))) {
		destination = match[1];
	} else if ((match = narrateContent.exec(transcript))) {
		return "narrate";
	}
	if (destination) {
		destination = destination
			.replace(/please|pls|plz/gi, "")
			.trim()
			.toLowerCase();
	}
	return destination;
}

// This function collects all unique link texts from the page, removing duplicates and substrings.
function collectUniqueDestinations() {
	const layoutWrapper = document.querySelector(".ic-Layout-wrapper");
	if (!layoutWrapper) return [];

	const rightSideWrapper = layoutWrapper.querySelector("#right-side-wrapper");
	const links = [];
	const allLinks = layoutWrapper.querySelectorAll("a");

	for (const link of allLinks) {
		if (rightSideWrapper && rightSideWrapper.contains(link)) {
			continue;
		}
		links.push(link);
	}

	const allTexts = [];
	for (const link of links) {
		if (link.textContent.trim()) {
			allTexts.push(link.textContent.trim().toLowerCase());
		}
		if (link.title && link.title.trim()) {
			allTexts.push(link.title.trim().toLowerCase());
		}
		for (const child of link.children) {
			if (child.textContent.trim()) {
				allTexts.push(child.textContent.trim().toLowerCase());
			}
			if (child.title && child.title.trim()) {
				allTexts.push(child.title.trim().toLowerCase());
			}
		}
	}

	const uniqueTexts = [...new Set(allTexts)];
	const filteredTexts = [];

	for (let i = 0; i < uniqueTexts.length; i++) {
		let isSubstring = false;
		for (let j = 0; j < uniqueTexts.length; j++) {
			if (i === j) continue;
			if (uniqueTexts[j].includes(uniqueTexts[i]) && uniqueTexts[i].length < uniqueTexts[j].length) {
				isSubstring = true;
				break;
			}
		}
		if (!isSubstring && uniqueTexts[i].length > 2) {
			filteredTexts.push(uniqueTexts[i]);
		}
	}

	return filteredTexts;
}

// This function calls the GPT API to interpret the user's command when RegEx fails to find a match.
async function useGPT(transcript) {
	try {
		console.log("Calling API...");
		const possibleDestinations = [
			...POSSIBLE_SIDEBAR_DESTINATIONS,
			...POSSIBLE_EXTENSION_ACTIONS,
			...collectUniqueDestinations(),
		];
		console.log("Possible destinations:", possibleDestinations);

		const response = await fetch(
			"https://glacial-sea-18791-40c840bc91e9.herokuapp.com/api/gpt",
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
			const destination = data.response
				.trim()
				.replace(/^["']|["']$/g, "")
				.toLowerCase();
			console.log("Destination from GPT:", destination);

			if (destination === "narrate") {
				textToSpeech("Calling text to speech from use GPT.");
			} else {
				const wasASidebarAction = window.sidebarActionsRouter(destination);
				if (wasASidebarAction) {
					sessionStorage.setItem(
						"canvoxNavigation",
						JSON.stringify({
							message: `Opened ${destination}`,
							timestamp: Date.now(),
						})
					);
					return;
				}

				const wasAnExtensionAction = extensionActionRouter(destination);
				if (!wasASidebarAction && !wasAnExtensionAction) {
					navigate(destination, transcript);
				}
			}
		}
	} catch (error) {
		console.error("Error calling API:", error);
	}
}

function extensionActionRouter(destination) {
	if (destination.match(/volume\s[0-9]+/)){
		destination = destination.replace(/volume\s/, "");
		window.setVolume(destination);
		return true;
	}

	switch (destination) {
		case "micmute":
			window.toggleMicrophone();
			break;
		case "volume up":
		case "volume down":
		case "volume mute":
			window.adjustVolume(destination);
			break;
		case "toggletranscript":
			window.toggleTranscript();
			break;
		default:
			return false;
	}
	return true;
}

function navigate(destination) {
	const layoutWrapper = document.querySelector(".ic-Layout-wrapper");
	const links = layoutWrapper ? layoutWrapper.querySelectorAll("a") : [];

	for (const link of links) {
		if (
			link.textContent.toLowerCase().includes(destination) ||
			(link.title && link.title.toLowerCase().includes(destination))
		) {
			sessionStorage.setItem(
				"canvoxNavigation",
				JSON.stringify({
					message: `Opened ${destination}`,
					timestamp: Date.now(),
				})
			);
			link.click();
			return true;
		}

		for (const child of link.children) {
			if (
				child.textContent.toLowerCase().includes(destination) ||
				(child.title && child.title.toLowerCase().includes(destination))
			) {
				sessionStorage.setItem(
					"canvoxNavigation",
					JSON.stringify({
						message: `Opened ${destination}`,
						timestamp: Date.now(),
					})
				);
				link.click();
				return true;
			}
		}
	}

	return false;
}

async function textToSpeech(narrateContent) {
	try {
		console.log("Calling API (TTS)...");
		const audioElement = document.createElement("audio");
		audioElement.controls = false;
		audioElement.style.display = "none";
		document.body.appendChild(audioElement);

		const response = await fetch(
			"https://glacial-sea-18791-40c840bc91e9.herokuapp.com/api/tts",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ narrate_Content: narrateContent }),
			}
		);

		if (!response.ok) {
			throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
		}

		const audioBlob = await response.blob();
		const audioUrl = URL.createObjectURL(audioBlob);
		audioElement.src = audioUrl;
		await audioElement.play();

		const ttsEvent = new CustomEvent("tts-ready", { detail: { audioElement } });
		document.dispatchEvent(ttsEvent);
	} catch (error) {
		console.error("Error in textToSpeech function:", error);
	}
}
