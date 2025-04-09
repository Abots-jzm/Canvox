import { giveNavigationFeedback } from "../model/tts.js";

function setupListeners() {
	window.addEventListener("popstate", giveNavigationFeedback);
}

export { setupListeners };
