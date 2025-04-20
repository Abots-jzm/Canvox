// Global variables to store message elements
let allMessages = [];
let unreadMessage = [];
let starredMessage = [];

// Arrays to store message data
let messageObjects = [];

/**
 * Assigns message elements to their respective variables and extracts message data
 */
function assignMessages() {
    // Get all messages with class css-138gh4t-view
    allMessages = document.querySelectorAll('.css-138gh4t-view');
    
    // Get all unread messages by finding elements with data-testid="unread-badge"
    unreadMessage = document.querySelectorAll('[data-testid="unread-badge"]');
    
    // Get starred messages
    starredMessage = document.querySelectorAll('[data-testid="visible-starred"]');

    // Assign data for each message object
    messageObjects = allMessages.map(message => {
        // Extract date
        const dateElement = message.querySelector('.css-1bw2jwe-text');
        const date = dateElement ? dateElement.textContent : '';
        
        // Extract names
        const nameElement = message.querySelector('.css-c31sii-text');
        const names = nameElement ? nameElement.textContent : '';
        
        // Check if message is unread
        const isUnread = !!message.querySelector('[data-testid="unread-badge"]');
        
        // Check if message is starred
        const isStarred = !!message.querySelector('[data-testid="visible-starred"]');
        
        // Return the structured message object
        return {
            element: message,
            date: date,
            names: names,
            isUnread: isUnread,
            isStarred: isStarred
        };
    });

    console.log('Total messages:', allMessages.length);
    console.log('Unread messages:', unreadMessages.length);
    console.log('Message objects:', messageObjects);
}

// Export the function and necessary variables
export { assignMessages, allMessages, unreadMessage, starredMessage, messageDates, messageNames };
