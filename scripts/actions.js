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

function actions(transcript) {
	const destination = extractDestination(transcript);
	if (destination) {
		const wasASidebarAction = window.sidebarActionsRouter(destination);
		if (wasASidebarAction) return;

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
	// Pattern 7: Click/Press actions - "click X", "press X", etc.
	const clickPressActions =
		/(?:click|press|select|choose|tap(?:\s+on)?|hit)\s+(?:the\s+)?([a-z0-9\s]+)(?:\s+button|link)?/i;

	let match;
	let destination;

	// Assigns an action to an according
	if ((match = contextNavigation.exec(transcript))) {
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

// Collects all unique link texts from the page, removing duplicates and substrings
function collectUniqueDestinations() {

	// Links on the main dashboard
	const layoutWrapper = document.querySelector(".ic-Layout-wrapper");

	// Courses and Groups that are allocated dynamically (only accessed after clicking the sidebar button)
	const navTrayPortal = document.querySelector("#nav-tray-portal");
	
	if (!layoutWrapper && !navTrayPortal) return [];

	// Exclude the right-side-wrapper and its children
	const rightSideWrapper = layoutWrapper ? layoutWrapper.querySelector("#right-side-wrapper") : null;

	// Get all links except those in the right-side-wrapper
	const links = [];
	
	// Process links from the layout wrapper
	if (layoutWrapper) {
		const allLinks = layoutWrapper.querySelectorAll("a");
		for (const link of allLinks) {
			// Check if the link is a descendant of right-side-wrapper
			if (rightSideWrapper && rightSideWrapper.contains(link)) {
				continue; // Skip links inside right-side-wrapper
			}
			links.push(link);
		}
	}
	
	// Also get links from the nav-tray-portal if it exists
	if (navTrayPortal && navTrayPortal.getAttribute('aria-hidden') !== 'true') {
		const navTrayLinks = navTrayPortal.querySelectorAll("a");
		for (const link of navTrayLinks) {
			links.push(link);
		}
		
		// Additionally, collect text from other clickable elements in the tray
		const clickableElements = navTrayPortal.querySelectorAll("[role='button'], button, [tabindex='0']");
		for (const element of clickableElements) {
			if (!element.closest("a")) { // Avoid duplicating elements that are inside links
				links.push(element);
			}
		}
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

async function useGPT(transcript) {
	// If the RegEx fails to match,
	// we can fallback to a GPT check
	try {
		console.log("Calling API...");

		// Collect possible destinations to help GPT make better decisions
		const possibleDestinations = [...POSSIBLE_SIDEBAR_DESTINATIONS, ...collectUniqueDestinations()];
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
		console.log("API response:", data);
		if (data && data.response) {
			const destination = data.response.trim().toLowerCase();
			// After getting the destination, trigger navigation
			const wasASidebarAction = window.sidebarActionsRouter(destination);
			if (!wasASidebarAction) {
				navigate(destination, transcript);
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
			link.click();
			return true;
		}

		for (const child of link.children) {
			if (
				child.textContent.toLowerCase().includes(destination) ||
				(child.title && child.title.toLowerCase().includes(destination))
			) {
				link.click();
				return true;
			}
		}
	}

	// No matching link found
	return false;
}
