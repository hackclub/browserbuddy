// Listen for text selection
document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    // Send selected text to the background script
    chrome.runtime.sendMessage({ type: "FETCH_DEFINITION", word: selectedText });
  }
});
