// Global variables to store message elements
let allMessages = null;
let unreadMessage = null;
let starredMessage = null;
let lastMessage = null;

// Arrays to store message data
let messageObjects = [];

// Assigns message elements to their respective variables and extracts message data
function assignMessages() {
	// Get all messages with class css-138gh4t-view
	allMessages = document.querySelectorAll('[data-testid="conversationListItem-Item"]');

	// Get all unread messages by finding elements with data-testid="unread-badge"
	unreadMessage = document.querySelectorAll('[data-testid="unread-badge"]');

	// Get starred messages
	starredMessage = document.querySelectorAll('[data-testid="visible-starred"]');

	// Assign data for each message object
	messageObjects = Array.from(allMessages).map((message) => {
		// Extract date
		const dateElement = message.querySelector(".css-1bw2jwe-text");
		const date = dateElement ? dateElement.textContent : "";

		// Extract names
		const nameElement = message.querySelector(".css-c31sii-text");
		const names = nameElement ? nameElement.textContent : "";

		// Extract header
		const headerElement = message.querySelector(".css-cv5a3j-view-heading");
		const header = headerElement ? headerElement.textContent : "";

		// Check if message is unread
		const isUnread = !!message.querySelector('[data-testid="unread-badge"]');

		// Check if message is starred
		const isStarred = !!message.querySelector('[data-testid="visible-starred"]');

		// Return the structured message object
		return {
			element: message,
			date: date,
			names: names,
			header: header,
			isUnread: isUnread,
			isStarred: isStarred,
		};
	});

	// console.log("Total messages:", allMessages.length);
	// console.log("Unread messages:", unreadMessage.length);
	// console.log("Starred messages:", starredMessage.length);
	// console.log("Message objects:", messageObjects);

	// Log detailed information about the first message if available
	if (messageObjects.length > 0) {
		lastMessage = messageObjects[0];
		// console.log("First message details:", {
		// 	date: firstMessage.date,
		// 	names: firstMessage.names,
		// 	header: firstMessage.header,
		// 	isUnread: firstMessage.isUnread,
		// 	isStarred: firstMessage.isStarred,
		// });
	} else {
		console.log("No messages found to display details");
	}

	console.log("Message objects:", messageObjects);
}

function wasAnInboxAction(transcript) {
	if (!window.location.href.includes("conversations")) return false;

	const lastMessagePattern =
		/\b(show|see|view|get|check|read|display|open|access)\b.+\b(last|latest|recent|newest)\b.+\b(message|msg|email|mail|conversation|inbox item)\b$/i;

	if (lastMessagePattern.test(transcript)) {
		clickLastMessage();
		return true;
	}

	return false;
}

function clickLastMessage() {
	if (!lastMessage) {
		console.warn("No last message found to click.");
		return;
	}

	// console.log(`Clicking last message: ${lastMessage.header}`);
	lastMessage.element.click();
}

function clickMessage(input) {
	if (!allMessages || allMessages.length === 0) {
		console.warn("No messages found to click.");
		return;
	}

	// Extract the title Y from format "message X: Y names: ..."
	let title = input;
	const match = input.match(/message\s+\d+:\s+(.*?)\s+names:/i);
	if (match && match[1]) {
		title = match[1].trim();
	}

	// Find the message that matches the extracted title
	let found = false;
	messageObjects.forEach((message) => {
		if (message.header.toLowerCase().includes(title.toLowerCase())) {
			console.log(`Clicking message with title: ${title}`);
			message.element.click();
			found = true;
			return;
		}
	});

	if (!found) {
		console.warn(`No message found with title: ${title}`);
	}
}

export { assignMessages, wasAnInboxAction, messageObjects, clickMessage };
