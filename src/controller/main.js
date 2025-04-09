"use strict";

import { injectElements, toggleTranscript } from "./injectElements.js";

//Entry point for the extension
export async function main() {
	const { speechDisplay } = injectElements();
}
