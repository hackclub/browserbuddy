document.addEventListener("DOMContentLoaded", function () {
    const cancelButton = document.getElementById("cancel");

    cancelButton.addEventListener("click", function () {
        window.close();
    });

    chrome.storage.local.get("lookupResult", function (data) {
        const definitionElement = document.getElementById("definition");
        
        if (data.lookupResult && data.lookupResult.length > 0) {
            const definitions = data.lookupResult[0].meanings.map(meaning => meaning.definitions[0].definition).join("<br><br>");
            definitionElement.innerHTML = `<p>${definitions}</p>`;
        } else {
            definitionElement.innerHTML = "<p>No definition found or data unavailable.</p>";
        }
    });
});
