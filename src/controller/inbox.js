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
	if (!window.location.href.includes("instructure.com/conversations#filter=type=")) return false;

	const lastMessagePattern =
		/\b(show|see|view|get|check|read|display|open|access)\b.+\b(last|latest|recent|newest)\b.+\b(message|msg|email|mail|conversation|inbox item)\b/i;

	if (lastMessagePattern.test(transcript)) {
		console.log("User wants to see their last message");
		return true;
	}

	return true;
}

// function clickMessage(params) {}

export { assignMessages, wasAnInboxAction };
