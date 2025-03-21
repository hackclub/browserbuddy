document.addEventListener("DOMContentLoaded", () => {
    async function generateResponse(userMessage) {
        try {
            const response = await fetch("https://api.cohere.com/v2/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer 7ciaxvObjwRoJu8wW2jzg9S0f9pCpuXksaZrMCrj",
                },
                body: JSON.stringify({
                    max_tokens: 300,
                    model: "command-r",
                    messages: [
                        { role: "system", content: "You are a helpful assistant. Return in answers like an answer to a flashcard" },
                        { role: "user", content: userMessage },
                    ],
                }),
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            return data.message.content[0].text;
        } catch (error) {
            console.error("Error:", error);
            return "Error generating response.";
        }
    }

    function extractAllText() {
        return document.body.innerText.trim();
    }

    async function handleUserQuery(query) {
        const fullText = extractAllText();
        if (!fullText) return console.error("No text found on the page.");
        const userMessage = `Based on this content: "${fullText}", answer: "${query}"`;
        const response = await generateResponse(userMessage);
        
        // Save to flashcards with unique ID
        chrome.storage.local.get({ flashcards: [] }, (data) => {
            const newFlashcard = {
                id: Date.now(),
                question: query,
                answer: response
            };
            const newFlashcards = [...data.flashcards, newFlashcard];
            chrome.storage.local.set({ flashcards: newFlashcards });
        });
        
        alert(`Flashcard saved`);
    }

    function createQueryInput() {
        let inputBox = document.getElementById("inputBox");
        if (!inputBox) {
            inputBox = document.createElement("div");
            inputBox.id = "inputBox";
            Object.assign(inputBox.style, {
                position: "fixed",
                bottom: "20px",
                right: "20px",
                backgroundColor: "#fff",
                padding: "10px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                zIndex: "1000",
                display: "flex",
                gap: "10px"
            });

            const inputField = document.createElement("input");
            Object.assign(inputField.style, {
                flex: "1",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px"
            });
            inputField.placeholder = "Ask a question...";

            const submitButton = document.createElement("button");
            Object.assign(submitButton.style, {
                padding: "8px 12px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
            });
            submitButton.innerText = "Ask";
            submitButton.addEventListener("click", () => {
                const query = inputField.value.trim();
                if (query) {
                    handleUserQuery(query);
                    inputField.value = "";
                }
            });

            const viewButton = document.createElement("button");
            Object.assign(viewButton.style, {
                padding: "8px 12px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
            });
            viewButton.innerText = "View Flashcards";
            viewButton.addEventListener("click", () => {
                window.open(chrome.runtime.getURL("popup.html"), "_blank");
            });

            inputBox.appendChild(inputField);
            inputBox.appendChild(submitButton);
            inputBox.appendChild(viewButton);
            document.body.appendChild(inputBox);
        }
    }

    createQueryInput();
});