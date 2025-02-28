function sidebarActionsRouter(destination) {
	let wasASidebarAction = true;

	destination = destination.trim().toLowerCase();

	if (destination === "dashboard") {
		window.location.href = window.location.origin;
	} else if (destination === "calendar") {
		window.location.href = `${window.location.origin}/calendar`;
	} else if (destination === "courses") {
		window.location.href = window.location.origin;
	} else if (destination === "groups") {
		window.location.href = `${window.location.origin}/groups`;
	} else if (destination === "inbox") {
		window.location.href = `${window.location.origin}/conversations`;
	} else if (destination === "home") {
		// Only navigate to home if we're not in a courses page
		if (!window.location.pathname.includes("/courses/")) {
			window.location.href = window.location.origin;
		} else {
			wasASidebarAction = false;
		}
	} else if (destination === "back") {
		window.history.back();
	} else {
		wasASidebarAction = false;
	}

	return wasASidebarAction;
}

window.sidebarActionsRouter = sidebarActionsRouter;
