// Code for handling the sidebar menu
// Account, Dashboard, Calendar, Courses, Groups, Inbox

// Function to handle sidebar actions
function sidebarActionsRouter(transcript) {

	// Variable to check if the action was a sidebar action
	let wasASidebarAction = true;

	// transcript is the text from the voice input that needs to be processed
	// includes() checks if the text includes the specified string
	// In this case it checks for the word "open"
	if (transcript.includes("open")) {

		// transcript.split("open ")[1] splits the transcript into an array of words
		// .split()[1] removes the first word "open"
		// .trim() removes any extra whitespace at the beginning or end
		// .toLowerCase() converts the string to lowercase
		const sideBarMenu = transcript.split("open ")[1].trim().toLowerCase();

		// If statement to check which sidebar menu to open
		// The window property is a global object that represents the browser window
		// The location property contains information about the current URL and provides methods to navigate to new URLs
		// href is found on the HTML document and is used to get or set the entire URL
		if (sideBarMenu === "dashboard") {

			// If the second element in the array of words is "dashboard", redirects to the home page/dashboard
			// origin returns the base URL of the current page
			// For this, the origin is https://canvas.instructure.com
			window.location.href = window.location.origin;

		} else if (sideBarMenu === "calendar") {

			// If the user says "open calendar", redirects to the calendar page
			// ${...} is syntax for embedding an expression
			// The "/calendar" adds on to the origin URL resulting in "https://canvas.instructure.com/calendar"
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

// Function to select a group
function openGroup(groupName) {

	// Bool to check if the group is found
	let groupFound = true;

	// Assigns the list of elements of groups into the variable "normalizedGroupName" in lowercase
	const normalizedGroupName = groupName.toLowerCase();

	// Look for links with the href containing "/groups/XXXXXX" where XXXXXX is the group ID
	// The 'a' in the argument targets all anchor (<a>) elements in the document
	// [ ] is an attribute selector
	// 'href' targets the href attribute of the element
	// '^=' is the "starts with" operator
	// "/groups/" is the string to match the beginning of href
	// For example, group 11s HTML element is <a href="/groups/222569">SE Project Group 11</a>
	const groupLinks = document.querySelectorAll('a[href^="/groups/"]');

	// Loop through all potential group links
	for (const link of groupLinks) {

		// Check if the link text contains the group name we're looking for
		if (link.textContent.toLowerCase().includes(normalizedGroupName)) {

			// Click on the link
			link.click();

			return groupFound;
		}
	}

	// If no match found, a more general approach
	// Searches all the anchor (<a>)elements in the document
	const allLinks = document.querySelectorAll("a");

	for (const link of allLinks) {
		if (link.textContent.toLowerCase().includes(normalizedGroupName)) {
			link.click();
			return groupFound;
		}
	}

	// Group not found
	groupFound = false;
	console.log(`Group "${groupName}" not found`);		// Writes a message to the browser console
	return groupFound;
}

window.sidebarActionsRouter = sidebarActionsRouter;
