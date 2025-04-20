let inboxMessages = [];

export function fetchInboxMessages(filterType = 'all') {
    // Unified selector for Canvas messages
    const selectorMap = {
        'unread': '.inbox .unread',
        'starred': '.inbox .starred',
        'sent': '.inbox [data-type="sent"]',
        'archived': '.inbox .archived',
        'submission-comments': '.inbox .submission-comment',
        'all': '.inbox .conversation'
    };

    inboxMessages = Array.from(document.querySelectorAll(selectorMap[filterType]));
    
    return inboxMessages.map((msg, index) => ({
        index: index + 1,
        type: msg.querySelector('.message-type')?.innerText || 'message',
        participants: msg.querySelector('.participants')?.innerText || '',
        subject: msg.querySelector('.subject')?.innerText || 'No Subject',
        preview: msg.querySelector('.message-preview')?.innerText.slice(0, 100) || '',
        timestamp: msg.querySelector('.timestamp')?.innerText || '',
        unread: msg.classList.contains('unread')
    }));
}

// Navigation functions
export function navigateInboxSection(section) {
    const sections = {
        'compose': '[aria-label="Compose New Message"]',
        'settings': '.inbox-settings',
        'all courses': '[data-route="all_courses"]',
        'submission comments': '[data-type="submission_comments"]',
        'history': '.conversation-history',
        'archived': '.archived-conversations'
    };

    const element = document.querySelector(sections[section.toLowerCase()]);
    if (element) {
        element.click();
        speak(`Opened ${section}`);
        return true;
    }
    speak(`${section} not found`);
    return false;
}

// Enhanced compose function for Canvas
export function composeNewMessage(recipients = "", subject = "", body = "") {
    const composeBtn = document.querySelector('[aria-label="Compose New Message"]');
    if (!composeBtn) {
        speak("Compose button not found");
        return;
    }
    
    composeBtn.click();
    
    setTimeout(() => {
        const toField = document.querySelector('#compose-message-recipients');
        const subjectField = document.querySelector('#compose-message-subject');
        const bodyField = document.querySelector('#compose-message-body');
        
        if (toField && subjectField && bodyField) {
            toField.value = recipients;
            subjectField.value = subject;
            bodyField.value = body;
            speak(recipients ? `Ready to send to ${recipients}` : "Compose window open");
        }
    }, 1000);
}

// Specialized functions
export function handleSubmissionComments() {
    const comments = document.querySelectorAll('.submission-comment');
    if (comments.length === 0) {
        speak("No submission comments found");
        return;
    }
    
    comments.forEach((comment, index) => {
        const course = comment.closest('.course-link')?.innerText;
        const author = comment.querySelector('.author')?.innerText;
        speak(`Comment ${index + 1} in ${course} by ${author}`);
    });
}
