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
	if (wasATextAction(transcript)) return;

	const destination = extractDestination(transcript);

	// Handles narration requests
	if (destination === "narrate") {
		narratePage(transcript);
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
			...collectUniqueDestinations(),
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

function collectMainContent() {
    // Collect the main content of the page for narration
    const mainContent = document.querySelector(".ic-Layout-contentMain");
    if (mainContent) {
        return mainContent.textContent || "";
    }
    return "";
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
        pageContent = pageContent.replace(/\s+/g, ' ').trim();
        
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
                    summarize: true
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
        console.error("Error in narratePage function:", error);
        return false;
    }
}

