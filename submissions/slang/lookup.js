document.addEventListener("DOMContentLoaded", function () {
    const cancelButton = document.getElementById("cancel");
    const definitionElement = document.getElementById("definition");

    cancelButton.addEventListener("click", function () {
        window.close();
    });

    chrome.storage.local.get("lookupResult", function (data) {
        if (chrome.runtime.lastError) {
            definitionElement.innerHTML = `<p>Error: Unable to retrieve the lookup result. Please try again.</p>`;
            return;
        }

        if (data.lookupResult && data.lookupResult.length > 0) {
            
            definitionElement.innerHTML = `<p>${data.lookupResult}</p>`;
        } else {
            definitionElement.innerHTML = "<p>No definition found or data unavailable.</p>";
        }
    });
});
