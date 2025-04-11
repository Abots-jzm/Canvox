/**
 * Text-to-Speech utilities for Canvox
 * This file contains all functionality related to speech synthesis
 * and audio narration for the Canvox extension.
 */

/**
 * Converts text to speech using the TTS API
 * @param {string} textContent - The text to be spoken
 * @returns {Promise<boolean>} - Success status of the TTS operation
 */
async function textToSpeech(textContent) {
    try {
        console.log("Calling API (TTS)...");

        // Create an audio element to play the response
        const audioElement = document.createElement("audio");
        audioElement.controls = false;
        audioElement.style.display = "none";
        document.body.appendChild(audioElement);

        // Set the volume of the audio element
        const data = await chrome.storage.sync.get("volume");
        audioElement.volume = (parseInt(data.volume)) / 100;

        const response = await fetch(
            "https://glacial-sea-18791-40c840bc91e9.herokuapp.com/api/tts",
            // Uncomment the line below, and comment the line above to test locally
            // 'http://localhost:3000/api/tts',
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ narrate_Content: textContent }),
            }
        );

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        // Create a URL for the audio blob
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Set the source and play
        audioElement.src = audioUrl;
        await audioElement.play();

        // Dispatch a custom event that content.js will listen for
        const ttsEvent = new CustomEvent("tts-ready", { detail: { audioElement } });
        document.dispatchEvent(ttsEvent);
        
        return true;
    } catch (error) {
        console.error("Error in textToSpeech function:", error);
        return false;
    }
}

/**
 * Collects the main content of the page for narration
 * @returns {string} - The main content text
 */
function collectMainContent() {
    // Collect the main content of the page for narration
    const mainContent = document.querySelector(".ic-Layout-contentMain");
    if (mainContent) {
        return mainContent.textContent || "";
    }
    return "";
}

/**
 * Collects the names of courses
 * @returns {string} - The formatted course information
 */
function collectCourses() {
    // Get all course rows by their class name
    const courseRows = document.querySelectorAll("tr.course-list-table-row");

    if (!courseRows || courseRows.length === 0) {
        console.log("No course rows found.");
        return "No course list found on this page.";
    }

    try {
        let courseInfo = [];

        // Extract course names and relevant information
        courseRows.forEach(row => {
            // Course title is in the course-list-course-title-column class
            const courseTitleCell = row.querySelector(".course-list-course-title-column");
            const courseNameElement = courseTitleCell ? courseTitleCell.querySelector("a span.name") : null;
            const courseName = courseNameElement ? courseNameElement.textContent.trim() : "";
            
            // Term is in the course-list-term-column class
            const termCell = row.querySelector(".course-list-term-column");
            const term = termCell ? termCell.textContent.trim() : "";
            
            // Enrollment type is in the course-list-enrolled-as-column class
            const enrolledAsCell = row.querySelector(".course-list-enrolled-as-column");
            const enrolledAs = enrolledAsCell ? enrolledAsCell.textContent.trim() : "";
            
            if (courseName) {
                courseInfo.push(`${courseName}. Term: ${term}. Enrolled as: ${enrolledAs}`);
            }
        });
        
        if (courseInfo.length === 0) {
            return "No course information could be extracted.";
        }
        
        return `You are enrolled in ${courseInfo.length} courses. ${courseInfo.join(". ")}`;
    } catch (error) {
        console.error("Error collecting course information:", error);
        return "There was an error collecting course information.";
    }
}

/**
 * Narrates the current page content
 * @param {string} transcript - The original user transcript that requested narration
 * @returns {Promise<boolean>} - Success status of the narration
 */
async function narratePage(transcript = "") {
    try {
        console.log("Preparing page narration with content summary...");

        // Get the current URL
        const currentUrl = window.location.href;

        // Get the page title
        const pageTitle = document.title || "Current page";
        
        // Get the page content
        let pageContent = "";
        let contentType = "general";

        // Check what page and adjust the content accordingly
        if (/\/courses\/?$/.test(currentUrl)) {
            // We're on the courses list page
            pageContent = collectCourses();
            contentType = "courses";
            console.log("Detected courses page, using courses collector");
        } else {
            // For all other pages, use general content collection
            pageContent = collectMainContent();
            console.log("Using general content collector for page: " + currentUrl);
        }
        
        // Clean up the content - remove excessive whitespace
        pageContent = pageContent.replace(/\s+/g, ' ').trim();
        
        // Create a summary prompt
        const narrateText = `Page title: ${pageTitle}. Content: ${pageContent}`;
        
        // Create audio element to play the response
        const audioElement = document.createElement("audio");
        audioElement.controls = false;
        audioElement.style.display = "none";
        document.body.appendChild(audioElement);
        
        // Make a direct call to the narration API endpoint
        const response = await fetch(
            "https://glacial-sea-18791-40c840bc91e9.herokuapp.com/api/narrate",
            // Uncomment the line below, and comment the line above to test locally
            // 'http://localhost:3000/api/narrate',
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    page_content: narrateText,
                    user_transcript: transcript,
                    summarize: true
                }),
            }
        );
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        
        // Create a URL for the audio blob
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Set the volume of the audio element
        const data = await chrome.storage.sync.get("volume");
        audioElement.volume = (parseInt(data.volume) || 100) / 100;

        // Set the source and play
        audioElement.src = audioUrl;
        await audioElement.play();

        // Dispatch a custom event that content.js will listen for
        const narrateEvent = new CustomEvent("tts-ready", { detail: { audioElement } });
        document.dispatchEvent(narrateEvent);

        return true;
    } catch (error) {
        console.error("Error in narratePage function:", error);
        return false;
    }
}

// Export the functions to make them available globally
window.textToSpeech = textToSpeech;
window.narratePage = narratePage;