function extractTextFromSelection() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return '';

  const range = selection.getRangeAt(0);
  const container = document.createElement('div');
  container.appendChild(range.cloneContents());

  // Remove unwanted elements
  const unwantedElements = container.querySelectorAll('img, script, style, noscript, iframe');
  unwantedElements.forEach(el => el.remove());

  // Extract text content
  const textNodes = [];
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip if parent is hidden
        if (node.parentElement?.style?.display === 'none') {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip if empty or only whitespace
        if (!node.textContent.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node.textContent.trim());
  }

  // Join text with proper spacing and clean up
  return textNodes
    .join(' ')
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_SELECTION") {
    const text = extractTextFromSelection();
    sendResponse({ selectedText: text });
  }
});