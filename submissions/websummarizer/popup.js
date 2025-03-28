document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("flashcardsContainer");
    const downloadBtn = document.getElementById("downloadBtn");

    function createFlashcardElement(card) {
        const cardDiv = document.createElement("div");
        cardDiv.className = "flashcard";
        cardDiv.innerHTML = `
            <strong>Question:</strong><br>
            ${card.question}<br><br>
            <strong>Answer:</strong><br>
            ${card.answer}
        `;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = "X";
        deleteBtn.title = "Delete flashcard";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteFlashcard(card.id);
        });

        cardDiv.appendChild(deleteBtn);
        return cardDiv;
    }

    function deleteFlashcard(id) {
        chrome.storage.local.get("flashcards", (data) => {
            const updated = data.flashcards.filter(card => card.id !== id);
            chrome.storage.local.set({ flashcards: updated }, loadFlashcards);
        });
    }

    function loadFlashcards() {
        container.innerHTML = "";
        chrome.storage.local.get("flashcards", (data) => {
            if (data.flashcards && data.flashcards.length > 0) {
                data.flashcards.forEach(card => {
                    container.appendChild(createFlashcardElement(card));
                });
            } else {
                container.innerHTML = "<p>No flashcards saved yet.</p>";
            }
        });
    }

    // Initial load
    loadFlashcards();

    // Download functionality remains the same
    downloadBtn.addEventListener("click", () => {
        chrome.storage.local.get("flashcards", (data) => {
            const flashcards = data.flashcards || [];
            const json = JSON.stringify(flashcards, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.href = url;
            a.download = "flashcards.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });
});