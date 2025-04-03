// this script contains functions that will parse the user's voice input and route it to the appropriate action
// it also contains functions that will gather information from the page to help the user navigate

// This function routes the user's voice input to sidebar actions
function sidebarActionsRouter(destination) {
	let wasASidebarAction = true;

	destination = destination.trim().toLowerCase();

	if (destination.includes("dashboard")) {
		window.location.href = window.location.origin;
	} else if (destination.includes("calendar")) {
		window.location.href = `${window.location.origin}/calendar`;
	} else if (destination.includes("courses") || destination.includes("classes")) {
		window.location.href = window.location.origin; // This isn't /course because the dashboard is a much better place to view courses
	} else if (destination.includes("groups")) {
		window.location.href = `${window.location.origin}/groups`;
	} else if (destination.includes("inbox") || destination.includes("messages")) {
		window.location.href = `${window.location.origin}/conversations`;
	} else if (destination.includes("home")) {
		// Only navigate to home if we're not in a courses page
		if (!window.location.pathname.includes("/courses/")) {
			window.location.href = window.location.origin;
		} else {
			wasASidebarAction = false;
		}
	} else if (destination.includes("back")) {
		window.history.back();
	} else {
		wasASidebarAction = false;
	}

	return wasASidebarAction;
}

window.sidebarActionsRouter = sidebarActionsRouter;

// This function routes the user's voice input to extension-specific actions
function extensionActionRouter(destination) {
	// This function routes to extension-specific actions
	// based on the destination provided

	// First check if destination is a volume set command
	// since the case block would need 100 cases for each possible regex here
	if (destination.match(/volume\s[0-9]+/)){
		destination = destination.replace(/volume\s/, "")
		window.setVolume(destination);
		return true;
	}

	// Handle other extension actions
	switch (destination) {
		case "micmute":
			// Handle microphone mute action
			window.toggleMicrophone(); // Call the function to toggle the microphone state
			break;
		case "volume up":
		case "volume down":
		case "volume mute":
			// Handle volume adjustment actions
			window.adjustVolume(destination);
			break;
		case "toggletranscript":
			// Handle toggle transcript action
			window.toggleTranscript(); // Call the function to toggle the transcript visibility
			break;
		default:
			return false; // No matching action found
	}
	return true; // Successfully handled an extension action
}

window.extensionActionRouter = extensionActionRouter;

// This function routes the user's voice input to discussion box actions
function wasATextAction(transcript) {
	//R
	if (/^(open|click|start)\s+reply/i.test(transcript)) {
		return openDiscussionReply();
	}

	// Handle "reply with X" - opens discussion reply and enters text
	const replyMatch = /(reply|respond)\s+(?:with|saying)\s+(.+)/i.exec(transcript);
	if (replyMatch) {
		// Ensure match exists and has the expected groups before trying to access
		const textToEnter = replyMatch[2].trim();

		// First open the reply box
		const replyOpened = openDiscussionReply();

		// Then try to enter the text (with a small delay to allow the editor to load)
		if (replyOpened) {
			setTimeout(() => {
				// Use the existing function to write to the discussion box
				const textCommand = `write ${textToEnter}`;
				handleDiscussionBoxCommand(textCommand);
			}, 500);
			return true;
		} else {
			console.warn("Failed to open the discussion reply box.");
			return false;
		}
	}

	if (handleDiscussionBoxCommand(transcript)) {
		return true;
	} // Check if it's a discussion box command

	// Check for submit commands anywhere in the transcript
	if (/submit|send|post/i.test(transcript)) {
		return submitDiscussionReply();
	}

	return false; // No text action matched
	//R
}

window.wasATextAction = wasATextAction;

// This function uses RegEx to extract a destination from the user's voice input. It looks for various patterns that indicate what the user wants to do, such as "go to", "show me", "click", etc. If it finds a match, it cleans up the extracted text and returns it as the destination. If no match is found, it returns undefined.
function extractDestination(transcript) {
	// The following code makes tries to do as much as possible locally before falling back to the chatgpt server.
	// RegEx = Regular Expression, test here https://regex101.com/

	// The section recognizes words or phrases and assigns to a command/variable
	// Pattern 1: Direct commands - "go to X", "open X", etc.
	const directCommands =
		/(?:go(?:\s+to)?|open|show(?:\s+me)?|navigate\s+to|take\s+me\s+to|view|access|display)(?:\s+my)?\s+([a-z0-9\s]+?)(?:\s+course(?:s)?)?$/i;
	// Pattern 2: Question forms - "where are my X?", etc.
	const questionForms =
		/(?:where\s+(?:are|is)(?:\s+my)?|can\s+I\s+see(?:\s+my)?|how\s+do\s+I\s+get\s+to(?:\s+my)?)\s+([a-z0-9\s]+)/i;
	// Pattern 3: Specific needs - "show all my X", etc.
	const specificNeeds =
		/(?:show\s+(?:all|my)(?:\s+my)?|list\s+my(?:\s+current)?|display\s+my(?:\s+enrolled)?|find\s+my)\s+([a-z0-9\s]+)/i;
	// Pattern 4: Context navigation - "return to X" etc.
	const contextNavigation = /(?:return\s+to|back\s+to|switch\s+to|change\s+to|go\s+back(?:\s+to)?)\s+([a-z0-9\s]+|$)/i;
	// Pattern 5: Conversational - "I need to see my X", etc.
	const conversationalPhrases =
		/(?:I\s+(?:need|want)\s+to\s+(?:see|check)(?:\s+my)?|let\s+me\s+see(?:\s+what)?|show\s+me\s+what(?:\s+I'm)?)\s+([a-z0-9\s]+)/i;
	// Pattern 6: Click/Press actions - "click X", "press X", etc.
	const clickPressActions =
		/(?:click|press|select|choose|tap(?:\s+on)?|hit)\s+(?:the\s+)?([a-z0-9\s]+)(?:\s+button|link)?/i;
	// Pattern 7: Narration - "Read the main content", etc.
	const narrateContent = /(read|speak|narrate)(\s+the)?(\s+(main|this|page))?(\s+content)?/i;

	// Extension actions - "mute microphone", "volume up", etc.
	// Pattern 7: microphone mute
	const microphoneMute =
		/(mute)?\s*(?:the|my\s+)?mic(rophone)?(mute)?/i;
	// Pattern 8: Volume mute, up, down
	const volumeShift =
		/(turn|change)?\s*volume\s+(up|down|mute)/i;
	// Pattern 9: Set volume to specific number
	const setVolume =
		/(set|change)?\s*volume\s*(to|set)?\s*(\d+)/i;
	// Pattern 10: Toggle transcript
	const toggleTranscript =
		/(show|hide|toggle)\s+transcript/i;


	let match;
	let destination;

	// Assign extension-related actions
	if ((match = microphoneMute.exec(transcript))) {
		destination = "micmute";
	} else if ((match = volumeShift.exec(transcript))) {
		destination = match[match.length - 1] === "mute" ? "volume mute" : match[match.length - 1] === "up" ? "volume up" : "volume down";
	} else if ((match = setVolume.exec(transcript))) {
		destination = `volume ${match[match.length - 1]}`;
	} else if ((match = toggleTranscript.exec(transcript))) {
		destination = "toggletranscript";
	}

	// Assigns an action to an according
	else if ((match = contextNavigation.exec(transcript))) {
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
	// If there was a RegEx match,
	// remove words like "please", "pls", "plz".
	if (destination) {
		destination = destination
			.replace(/please|pls|plz/gi, "")
			.trim()
			.toLowerCase();
	}
	return destination;
}

window.extractDestination = extractDestination;

// This function collects all unique link texts from the page, removing duplicates and substrings. It basically extracts all the possible navigation destinations for chatGPT to consider when interpreting the user's command. It excludes links from the right-side-wrapper to avoid cluttering the results with irrelevant links.
function collectUniqueDestinations() {
	const layoutWrapper = document.querySelector(".ic-Layout-wrapper");
	if (!layoutWrapper) return [];

	// Exclude the right-side-wrapper and its children
	const rightSideWrapper = layoutWrapper.querySelector("#right-side-wrapper");

	// Get all links except those in the right-side-wrapper
	const links = [];
	const allLinks = layoutWrapper.querySelectorAll("a");

	for (const link of allLinks) {
		// Check if the link is a descendant of right-side-wrapper
		if (rightSideWrapper && rightSideWrapper.contains(link)) {
			continue; // Skip links inside right-side-wrapper
		}
		links.push(link);
	}

	// Collect all possible link texts
	const allTexts = [];
	for (const link of links) {
		if (link.textContent.trim()) {
			allTexts.push(link.textContent.trim().toLowerCase());
		}
		if (link.title && link.title.trim()) {
			allTexts.push(link.title.trim().toLowerCase());
		}

		// Check children elements of the link
		for (const child of link.children) {
			if (child.textContent.trim()) {
				allTexts.push(child.textContent.trim().toLowerCase());
			}
			if (child.title && child.title.trim()) {
				allTexts.push(child.title.trim().toLowerCase());
			}
		}
	}

	// Remove duplicates first by using Set
	const uniqueTexts = [...new Set(allTexts)];

	// Remove substrings (if text is contained within another)
	const filteredTexts = [];

	for (let i = 0; i < uniqueTexts.length; i++) {
		let isSubstring = false;
		for (let j = 0; j < uniqueTexts.length; j++) {
			// Skip self-comparison
			if (i === j) continue;

			// Check if uniqueTexts[i] is a substring of uniqueTexts[j]
			if (uniqueTexts[j].includes(uniqueTexts[i]) && uniqueTexts[i].length < uniqueTexts[j].length) {
				isSubstring = true;
				break;
			}
		}

		// Only add if not a substring of another element
		if (!isSubstring && uniqueTexts[i].length > 2) {
			// Ignore very short strings (likely not useful)
			filteredTexts.push(uniqueTexts[i]);
		}
	}

	return filteredTexts;
}

window.collectUniqueDestinations = collectUniqueDestinations;