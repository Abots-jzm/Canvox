function sidebarActionsRouter(destination) {
	let wasASidebarAction = true;

	destination = destination.trim().toLowerCase();

	if (destination.includes("dashboard")) {
		window.location.href = window.location.origin;
	} else if (destination.includes("calendar")) {
		window.location.href = `${window.location.origin}/calendar`;
	} else if (destination.includes("courses") || destination.includes("classes")) {
		window.location.href = window.location.origin; // This isn't /course because the dashboard is a much better place to view courses
	} else if (destination.includes("groups")) {
		window.location.href = `${window.location.origin}/groups`;
	} else if (destination.includes("inbox") || destination.includes("messages")) {
		window.location.href = `${window.location.origin}/conversations`;
	} else if (destination.includes("home")) {
		// Only navigate to home if we're not in a courses page
		if (!window.location.pathname.includes("/courses/")) {
			window.location.href = window.location.origin;
		} else {
			wasASidebarAction = false;
		}
	} else if (destination.includes("back")) {
		window.history.back();
	} else {
		wasASidebarAction = false;
	}

	return wasASidebarAction;
}

window.sidebarActionsRouter = sidebarActionsRouter;
