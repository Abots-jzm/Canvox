function dashboardActionsRouter(transcript) {
	if (transcript.match(/open\s+(.+)/i)) {
		const courseName = transcript.split(/\s+/).slice(1).join(" ").trim().toLowerCase();
		openCourse(courseName);
	}
}

function openCourse(courseName) {
	const courseCards = document.querySelectorAll(".ic-DashboardCard");
	for (const card of courseCards) {
		if (card.textContent.toLowerCase().includes(courseName)) {
			const link = card.querySelector("a, button");
			(link ? link : card).click();
			break;
		}
	}
}

window.dashboardActionsRouter = dashboardActionsRouter;
