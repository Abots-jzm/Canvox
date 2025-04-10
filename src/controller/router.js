import { wasATextAction } from "../model/text.js";

function routeActions(transcript) {
	//check for text actions first
	if (wasATextAction(transcript)) return;
}

export { routeActions };
