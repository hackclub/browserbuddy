importScripts('libs/browser-polyfill.min.js')
// Log a message when the extension is installed
browser.runtime.onInstalled.addListener(() => {
    console.log("Mood-Boosting Quotes extension installed!");
});

async function getRandomQuote() {
    const apiUrl = 'https://qapi.vercel.app/api/random'
    try {
        const response = await fetch(apiUrl);
        console.log("Response", response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Return the content and author
        const quote = data.quote || "Quote not found";
        const author = data.author || "Author not found"
        console.log("Quote Data:", data);
        return `${quote} - ${author}`;
    } catch (error) {
        console.error('Error fetching quote:', error);
        return "Sorry, couldn't fetch a quote right now.", error;
    }
}

// Listen for messages from other parts of the extension
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getQuote") {
        getRandomQuote().then((quote) => {
            sendResponse({ quote });
        });
    }
    return true; // Required for asynchronous sendResponse
});