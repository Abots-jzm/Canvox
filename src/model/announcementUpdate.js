function checkNewAnnouncements() {
    // 1. Create unique storage key for each page 
    const pageKey = `canvas-h3-${window.location.pathname}`;
    
    // 2. Get all H3 elemtrs with the class name and store their text content
    const currentH3s = Array.from(document.querySelectorAll('h3.css-cv5a3j-view-heading'))
      .map(h3 => h3.textContent.trim());
    
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
        // if theire are no new announcements detected console.log that there is nothing new
      } else{
        console.log('No new announcements found.');
      }
      
      // 6. Update storage to be able to compare for future checks
      chrome.storage.local.set({ [pageKey]: currentH3s }, () => {
        console.log(`[checkNewAnnouncements] Storage updated for ${pageKey}`);
      });;

    });
  }
  
  // Run with delay when page loads

  export { checkNewAnnouncements };