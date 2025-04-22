import { useGPT } from "../model/gpt.js";
import { navigate } from "../model/navigation.js"; // Remove direct import of navigate
import { extensionActionRouter } from "../model/settings.js";
import { sidebarActionsRouter } from "../model/sidebar.js";
import { wasATextAction } from "../model/text.js";
import { narratePage } from "../model/tts.js";
import { main } from "./main.js"; // Import main to access the agent
import { textToSpeech } from "../model/tts.js"; // Import textToSpeech

function routeActions(transcript, recognitionState) {
	// check for text actions first
	if (wasATextAction(transcript)) return;

	const extracted = extractDestination(transcript);

	// Handles narration requests
	if (extracted && extracted.action === "narrate") {
		narratePage(transcript);
		return;
	}

	// Handles "help" requests
	if (extracted && extracted.action === "help") {
		handleHelpCommand();
		return;
	}

	// If there's a destination, create a navigation goal for the agent
	if (extracted && extracted.action === "Navigate") {
		const goal = {
			action: "Navigate",
			target: extracted.target,
		};
		// Access the agent instance and add the goal to the queue
		main.agent.addGoal(goal);
		return;
	} else if (/(micmute|volume.*|toggletranscript)/i.test(transcript)) {
		// If the destination is related to microphone, volume, or transcript, trigger the action directly
		// Call the extension action router to handle specific actions'
		extensionActionRouter(transcript, recognitionState);
		return;
	} else {
		// No destination was found, use GPT to interpret
		useGPT(transcript, recognitionState);
	}
}

function extractDestination(transcript) {
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
	// Pattern 7: Narration - "Read the main content", "What's on my screen", etc.
	const narrateContent =
		/(read|speak|narrate|tell me about)(\s+the)?(\s+(main|this|page))?(\s+content)?|(what'?s|what is)(\s+on)?(\s+my|\s+this|\s+the)?(\s+screen|page|window|display)/i;

	// Extension actions - "mute microphone", "volume up", etc.
	// Pattern 7: microphone mute
	const microphoneMute = /(mute)?\s*(?:the|my\s+)?mic(rophone)?(mute)?/i;
	// Pattern 8: Volume mute, up, down
	const volumeShift = /(turn|change)?\s*volume\s+(up|down|mute)/i;
	// Pattern 9: Set volume to specific number
	const setVolume = /(set|change)?\s*volume\s*(to|set)?\s*(\d+)/i;
	// Pattern 10: Toggle transcript
	const toggleTranscript = /(show|hide|toggle)\s+transcript/i;

	// HELP intent
	const helpCommands = /(what can i do|what are my options|how do i use this|help)/i;

	let match;
	let extracted = {};

	// Assign extension-related actions
	if ((match = microphoneMute.exec(transcript))) {
		extracted.action = "extension";
		extracted.target = "micmute";
	} else if ((match = volumeShift.exec(transcript))) {
		extracted.action = "extension";
		extracted.target =
			match[match.length - 1] === "mute"
				? "volume mute"
				: match[match.length - 1] === "up"
					? "volume up"
					: "volume down";
	} else if ((match = setVolume.exec(transcript))) {
		extracted.action = "extension";
		extracted.target = `volume ${match[match.length - 1]}`;
	} else if ((match = toggleTranscript.exec(transcript))) {
		extracted.action = "extension";
		extracted.target = "toggletranscript";
	}

	// Assigns an action to an according
	else if ((match = contextNavigation.exec(transcript))) {
		extracted.action = "Navigate";
		extracted.target = match[1];
	} else if ((match = clickPressActions.exec(transcript))) {
		extracted.action = "Navigate";
		extracted.target = match[1];
	} else if ((match = specificNeeds.exec(transcript))) {
		extracted.action = "Navigate";
		extracted.target = match[1];
	} else if ((match = conversationalPhrases.exec(transcript))) {
		extracted.action = "Navigate";
		extracted.target = match[1];
	} else if ((match = questionForms.exec(transcript))) {
		extracted.action = "Navigate";
		extracted.target = match[1];
	} else if ((match = directCommands.exec(transcript))) {
		extracted.action = "Navigate";
		extracted.target = match[1];
	} else if ((match = narrateContent.exec(transcript))) {
		extracted.action = "narrate";
	} else if ((match = helpCommands.exec(transcript))) {
		extracted.action = "help";
	}

	// If there was a RegEx match for navigation,
	// remove words like "please", "pls", "plz".
	if (extracted.action === "Navigate" && extracted.target) {
		extracted.target = extracted.target
			.replace(/please|pls|plz/gi, "")
			.trim()
			.toLowerCase();
	}

	return extracted;
}

const availableActions = [
	"Navigate to a page (e.g., 'Go to assignments', 'Open modules')",
	"Summarize content (e.g., 'Summarize this assignment')",
	"Control microphone (e.g., 'Mute microphone')",
	"Adjust volume (e.g., 'Volume up', 'Set volume to 50')",
	"Toggle transcript (e.g., 'Show transcript', 'Hide transcript')",
	"Get help (e.g., 'What can I do?', 'Help')",
	// Add more actions as you implement them
];

function handleHelpCommand() {
	let response = "Here are some of the things I can do:\n";
	response += availableActions.map((action) => `- ${action}`).join("\n");
	textToSpeech(response);
}

export { routeActions, extractDestination };
