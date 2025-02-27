function dashboardActionsRouter(transcript) {

	// If statement to check if the transcript matches a pattern
	// "/open\s+(.+)/i" checks for the word "open"
	// One or more whitespace characters "\s+"
	// Any characters after "(.+)"
	// The "i" flag makes the match case-insensitive
	if (transcript.match(/open\s+(.+)/i)) {

		// transcript.split(/\s+/) splits the transcript into an array of words
		// .slice(1) removes the first word "open"
		// .join(" ") joins the remaining words into a string
		// .trim() removes any extra whitespace at the beginning or end
		// .toLowerCase() converts the string to lowercase 
		const courseName = transcript.split(/\s+/).slice(1).join(" ").trim().toLowerCase();

		// Calls the openCourse function with the courseName
		openCourse(courseName);
	}
}

// Function	to open a course by name
function openCourse(courseName) {

	// Assigns the list of found elements to the variable courseCards
	// document.querySelectorAll() finds all HTML elements with the class "ic-DashboardCard"
	// document. is a built-in object provided by the browser (part of the DOM - Document Object Model) and provides access to all HTML elements
	// "ic-DashboardCard" is found from the HTML document of the Canvas page
	// query.SelectorAll() is a method that returns a list of the document's elements that match the specified group of selectors
	const courseCards = document.querySelectorAll(".ic-DashboardCard");

	// Loop to iterate through each course card
	// Checks if the courseName is included in the card text
	for (const card of courseCards) {

		// Gets all the text inside the card with the .textContent property
		// Converts the text to lowercase with .toLowerCase()
		// Checks if it contains the course we're looking for with .includes()
		if (card.textContent.toLowerCase().includes(courseName)) {

			// Looks for either an <a> or <button> element inside the card
			// and stores it in the 'link' variable
			const link = card.querySelector("a, button");

			// Operator the if "link" was found (not null), clicks on the link
			// If no link, clicks on the card itself
			(link ? link : card).click();

			// Exit loop after course is found
			break;
		}
	}
}

// Open account on the side bar
function openAccount() {

	// getElementById() finds the element with the specified ID
	// The element ID "global-nav-profile-link" is responsible for navigating to the profile page on canvas
	// click() simulates a mouse click
	document.getElementById("global_nav_profile_link").click();
}

// Open calendar on the side bar
function openCalendar() {
	document.getElementById("global_nav_calendar_link").click();
}

// Open inbox on the side bar
function openInbox() {
	document.getElementById("global_nav_conversations_link").click();
}

// View groups on the side bar
function openGroup(groupName) {

	// Click on the "Groups" tab on the side bar
	document.getElementById("global_nav_groups_link").click();

	// setTimeout(function, delay) calls a function after a specified delay
	// The delay is in milliseconds
	setTimeout(() => {
	
		// Assign all elements with class name "css-uuhc4b-view-link" into a variable groupLinks
		const groupLinks = document.querySelectorAll(".css-uuhc4b-view-link");

		// Loop through each group link
		for (const link of groupLinks) {

			// Check if the group name is included in the link text
			if (link.textContent.toLowerCase().includes(groupName)) {

				// Click on the link
				link.click();

				break;
			}
		}
	}, 500);	// Adjust the timeout as needed for menu to open
}

window.dashboardActionsRouter = dashboardActionsRouter;
