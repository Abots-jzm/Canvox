function sidebarActionsRouter(transcript) {
	let wasASidebarAction = true;

	if (transcript.includes("open")) {
		const sideBarMenu = transcript.split("open ")[1].trim().toLowerCase();
		if (sideBarMenu === "dashboard") {
			window.location.href = window.location.origin;
		} else if (sideBarMenu === "calendar") {
			window.location.href = `${window.location.origin}/calendar`;
		} else if (sideBarMenu === "courses") {
			window.location.href = `${window.location.origin}/courses`;
		} else if (sideBarMenu === "groups") {
			window.location.href = `${window.location.origin}/groups`;
		} else if (sideBarMenu === "inbox") {
			window.location.href = `${window.location.origin}/conversations`;
		} else {
			wasASidebarAction = false;
		}
	} else if (transcript.includes("go home")) {
		window.location.href = window.location.origin;
	} else if (transcript.includes("back") && transcript.endsWith("back")) {
		window.history.back();
	} else {
		wasASidebarAction = false;
	}

	return wasASidebarAction;
}

window.sidebarActionsRouter = sidebarActionsRouter;
