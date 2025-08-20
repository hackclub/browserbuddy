(async () => {
    const originalFetch = fetch;
    let port = 8998;

    console.log("TecnoMap - Using port", port);

    window.fetch = async (...args) => {
        if (typeof args[0] === "object" && args[0].url) {
            try {
                if (args[0].url.includes("markers.json"))
                    return originalFetch(`http://localhost:${port}/markers`);
                else if (args[0].url.includes("players.json"))
                    return originalFetch(`http://localhost:${port}/position`);
            } catch (error) {
                console.log("TecnoMap - Error when fetching", error);
            }
        }
        return originalFetch(...args);
    };
    
    console.log("TecnoMap - Content script loaded");
})();
