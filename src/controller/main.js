"use strict";

import { injectElements, toggleTranscript } from "./injectElements.js";
import { setupListeners } from "./listeners.js";
import { giveNavigationFeedback } from "../model/tts.js";

//Entry point for the extension
export async function main() {
	// Check if the browser supports the SpeechRecognition API
	const { speechDisplay } = injectElements();

	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	if (!SpeechRecognition) {
		speechDisplay.innerHTML = "Speech Recognition not supported in this browser.";
		return;
	}

	setupListeners();
	giveNavigationFeedback();

	// let recognition = null;
	// let isRecognizing = false;

	// window.addEventListener("popstate", giveNavigationFeedback);
}
