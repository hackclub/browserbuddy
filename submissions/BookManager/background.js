// Initialize default state when extension is first installed
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get('books', function(data) {
    if (!data.books) {
      chrome.storage.sync.set({books: []});
    }
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getStats') {
    chrome.storage.sync.get('books', function(data) {
      const books = data.books || [];
      const totalBooks = books.length;
      const completedBooks = books.filter(book => book.isCompleted).length;
      const inProgressBooks = totalBooks - completedBooks;
      
      sendResponse({
        totalBooks,
        completedBooks,
        inProgressBooks
      });
    });
    return true; // Required for asynchronous sendResponse
  }
});
