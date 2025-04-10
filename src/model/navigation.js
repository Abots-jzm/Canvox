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

export { navigate, collectUniqueDestinations };
