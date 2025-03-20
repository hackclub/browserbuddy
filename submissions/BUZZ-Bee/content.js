// Function to load and parse the CSV file
async function loadBuzzwords() {
    let response = await fetch(chrome.runtime.getURL("buzzwords.csv"));
    let text = await response.text();
    let lines = text.split("\n").slice(1); // Skip the header
    let buzzwords = {};

    lines.forEach(line => {
        let [word, category] = line.split(",").map(item => item.trim());
        if (word) {
            buzzwords[word.toLowerCase()] = category || "Unknown";
        }
    });

    return buzzwords;
}

(async function() {
    if (!window.buzzBeeInjected) {
        window.buzzBeeInjected = true;

        let buzzwords = await loadBuzzwords();
        let text = document.body.innerText.toLowerCase();
        let words = text.split(/\s+/).filter(word => word.length > 1); // Count only meaningful words
        let totalWords = words.length;
        let count = 0;
        let detectedWords = {};

        Object.keys(buzzwords).forEach(word => {
            let matches = text.match(new RegExp(`\\b${word}\\b`, "gi"));
            if (matches) {
                count += matches.length;
                detectedWords[word] = {
                    count: matches.length,
                    category: buzzwords[word]
                };
            }
        });

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "getBuzzWords") {
                sendResponse({ count, detectedWords, totalWords });
            }
            return true;
        });
    }
})();
