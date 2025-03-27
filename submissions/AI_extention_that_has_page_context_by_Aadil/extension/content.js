// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getPageContent") {
    // Get the HTML content of the current page
    const html = document.documentElement.outerHTML;
    
    // Send the HTML back to the popup
    sendResponse({html: html});
  }
  return true;  // Keep the message channel open for asynchronous response
});
