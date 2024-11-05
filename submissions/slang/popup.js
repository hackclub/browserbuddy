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
            fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.length > 0 && data[0].meanings.length > 0) {
                        const definitions = data[0].meanings.map(meaning => meaning.definitions[0].definition).join("<br><br>");
                        definitionElement.innerHTML = `<p>${definitions}</p>`;
                    } else {
                        definitionElement.innerHTML = "<p>No definition found.</p>";
                    }
                })
                .catch(error => {
                    console.error("Error fetching the slang meaning:", error);
                    definitionElement.innerHTML = "<p>Error fetching definition.</p>";
                });
        } else {
            definitionElement.innerHTML = "<p>Please enter a word to search.</p>";
        }
    });
});
