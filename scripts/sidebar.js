
function sidebarActionsRouter(destination) {
	let wasASidebarAction = true;

	destination = destination.trim().toLowerCase();

	if (destination.includes("dashboard") || destination.includes("home") || destination.includes("homepage")) {
		window.location.href = window.location.origin;
	} else if (destination.includes("calendar")) { 
		window.location.href = `${window.location.origin}/calendar`;
	} else if (destination.includes("courses") || destination.includes("classes")) {
		window.location.href = `${window.location.origin}/courses`;
	} else if (destination.includes("groups")) {
		window.location.href = `${window.location.origin}/groups`;
	} else if (destination.includes("inbox") || destination.includes("messages")) {
		window.location.href = `${window.location.origin}/conversations`;
	} else if (destination.includes("back")) {
		window.history.back();
	} else {
		wasASidebarAction = false;
	}

	return wasASidebarAction;
}

window.sidebarActionsRouter = sidebarActionsRouter;