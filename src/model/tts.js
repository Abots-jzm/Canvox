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

export { giveNavigationFeedback };
