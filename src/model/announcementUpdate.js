function checkNewAnnouncements() {
    // 1. Create unique storage key for each page 
    const pageKey = `canvas-h3-${window.location.pathname}`;
    
    // 2. Get all H3 elements with the class name and store their normalized text content
    const currentH3s = Array.from(document.querySelectorAll('h3.css-cv5a3j-view-heading'))
      .map(h3 => h3.textContent.replace(/^unread,\s*/i, '').trim());
    
    console.log(`[checkNewAnnouncements] Scanned current h3s on page:`, currentH3s);
  
    // 3. Check storage for old page content and compare
    chrome.storage.local.get([pageKey], (result) => {
      const previousH3s = result[pageKey] || [];
      
      console.log(`[checkNewAnnouncements] Previous h3s stored for this page:`, previousH3s);
  
      // 4. Find new additions
      const newH3s = currentH3s.filter(text => !previousH3s.includes(text));
      
      // 5. Notify if new content is found
      if (newH3s.length > 0) {
        console.log('New announcements detected:', newH3s);
      } else {
        console.log('No new announcements found.');
      }
      
      // 6. Update storage to be able to compare for future checks
      chrome.storage.local.set({ [pageKey]: currentH3s }, () => {
        console.log(`[checkNewAnnouncements] Storage updated for ${pageKey}`);
      });
    });
  }
  

  
function checkNewModuleItems() {
// 1. Create a unique storage key for this course's modules page
const pageKey = `canvas-modules-${window.location.pathname}`;

// 2. Select only <span> elements with class "title locked_title" and extract their title attribute
const currentModuleTitles = Array.from(document.querySelectorAll('span.title.locked_title'))
    .map(span => span.getAttribute("title")?.trim())
    .filter(title => title); // Filter out null/undefined

console.log(`[checkNewModuleItems] Current module items found:`, currentModuleTitles);

// 3. Get previously stored titles
chrome.storage.local.get([pageKey], (result) => {
    const previousModuleTitles = result[pageKey] || [];

    console.log(`[checkNewModuleItems] Previously stored module items:`, previousModuleTitles);

    // 4. Identify new module items
    const newModuleTitles = currentModuleTitles.filter(title => !previousModuleTitles.includes(title));

    // 5. Notify if new items are found
    if (newModuleTitles.length > 0) {
    console.log('New module items detected:', newModuleTitles);
    } else {
    console.log('No new module items found.');
    }

    // 6. Save current titles for future comparisons
    chrome.storage.local.set({ [pageKey]: currentModuleTitles }, () => {
    console.log(`[checkNewModuleItems] Storage updated for ${pageKey}`);
    });
});
}
  

export { checkNewModuleItems };
export { checkNewAnnouncements };
  