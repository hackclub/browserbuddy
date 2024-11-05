document.addEventListener("DOMContentLoaded", function () {
    const definitionElement = document.getElementById("definition");
    const searchButton = document.getElementById("searchButton");
    const searchInput = document.getElementById("search");
    const closePopup = document.getElementById("closePopup");

    closePopup.addEventListener("click", function () {
        window.close();
    });

    searchButton.addEventListener("click", function () {
        const word = searchInput.value.trim();
        if (word) {
            fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.list && data.list.length > 0) {
                        const definitions = data.list.map(entry => entry.definition).join("<br><br>");
                        definitionElement.innerHTML = `<p>${definitions}</p>`;
                    } else {
                        definitionElement.innerHTML = "<p>No slang definition found.</p>";
                    }
                })
                .catch(error => {
                    console.error("Error fetching the slang meaning:", error);
                    definitionElement.innerHTML = "<p>Error fetching slang definition.</p>";
                });
        } else {
            definitionElement.innerHTML = "<p>Please enter a word to search.</p>";
        }
    });
});
