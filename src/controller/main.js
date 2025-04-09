"use strict";

import { injectElements, toggleTranscript } from "./injectElements.js";
import { setupListeners } from "./listeners.js";
import { giveNavigationFeedback } from "../model/tts.js";

//Entry point for the extension
export async function main() {
	//Initialize Transcript bar
	const { speechDisplay } = injectElements();

	// Check if the browser supports the SpeechRecognition API
	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	if (!SpeechRecognition) {
		speechDisplay.innerHTML = "Speech Recognition not supported in this browser.";
		return;
	}

	const recognitionState = {
		recognition: null,
		isRecognizing: false,
		speechDisplay,
	};

	setupListeners();
	giveNavigationFeedback();
}
