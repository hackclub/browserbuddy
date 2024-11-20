// Log a message when the extension is installed
browser.runtime.onInstalled.addListener(() => {
    console.log("Mood-Boosting Quotes extension installed!");
});

async function getRandomQuote() {
    try {
        const response = await fetch('https://type.fit/api/quotes');
        const data = await response.json();
        
        // Return the content and author
        return `${data.text} — ${data.author}`;
    } catch (error) {
        console.error('Error fetching quote:', error);
        return "Sorry, couldn't fetch a quote right now.";
    }
}

// Listen for messages from other parts of the extension
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getQuote") {
        getRandomQuote().then((quote) => {
            sendResponse({ quote: quote });
        });
    }
    return true; // Required for asynchronous sendResponse
});