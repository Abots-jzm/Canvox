function openCourse(transcript) {
	const pattern = /open\s+(.+)/i;
	const match = transcript.match(pattern);
	if (match) {
		const courseName = match[1].trim().toLowerCase();
		const courseCards = document.querySelectorAll(".ic-DashboardCard");
		for (const card of courseCards) {
			if (card.textContent.toLowerCase().includes(courseName)) {
				const link = card.querySelector("a, button");
				(link ? link : card).click();
				break;
			}
		}
	}
}

window.openCourse = openCourse;
