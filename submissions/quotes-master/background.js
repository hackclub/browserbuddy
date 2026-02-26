// List of motivational quotes
const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
  "The only limit to our realization of tomorrow is our doubts of today. - Franklin D. Roosevelt",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
  "Strive not to be a success, but rather to be of value. - Albert Einstein",
  "Don't let yesterday take up too much of today. - Will Rogers",
  "The secret of getting ahead is getting started. - Mark Twain",
  "Quality is not an act, it is a habit. - Aristotle",
  "Life is 10% what happens to you and 90% how you react to it. - Charles R. Swindoll",
  "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
  "The best way to predict the future is to create it. - Peter Drucker",
  "Aim for the moon. If you miss, you may hit a star. - W. Clement Stone",
  "Everything you've ever wanted is on the other side of fear. - George Addair",
  "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
  "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson"
];

// Variables to control the quote display
let intervalId = null;
let isActive = false;

// Function to display a random quote notification
function showQuoteNotification() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  
  chrome.notifications.create({
    type: 'basic',
    title: 'Motivational Quote',
    message: randomQuote,
    priority: 2
  });
}

// Message handling
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "startQuotes" && !isActive) {
    isActive = true;
    showQuoteNotification(); // Show first quote immediately
    intervalId = setInterval(showQuoteNotification, 7000); // Then every 7 seconds
    sendResponse({status: "success"});
  } 
  else if (request.action === "stopQuotes" && isActive) {
    isActive = false;
    clearInterval(intervalId);
    intervalId = null;
    sendResponse({status: "success"});
  }
  else if (request.action === "getStatus") {
    sendResponse({isActive: isActive});
  }
  return true; // Keep the message channel open for async response
});

// Handle extension installation or update
chrome.runtime.onInstalled.addListener(function() {
  console.log("Motivational Quotes extension installed/updated!");
});
