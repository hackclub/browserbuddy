document.addEventListener("DOMContentLoaded", () => {


document.getElementById("summarise").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    document.getElementById("summarise").disabled = true;

    document.getElementById("load").style.display = "block";
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractText
    }, async (injectionResults) => {
        console.log("Injection Results:", injectionResults);  // Debugging log

        if (!injectionResults || injectionResults.length === 0 || !injectionResults[0].result) {
        document.getElementById("load").style.display = "none";
    document.getElementById("summarise").disabled = false;
            alert("Failed to extract text!");
            return;
        }

        let text = injectionResults[0].result;  // ✅ Correctly accessing the extracted text
        console.log("Extracted text:", text);

        let summary = await summarizeWithGemini(text);
        document.getElementById("area").innerHTML = summary;
    });
});
function extractText() {

    let paragraphs = document.querySelectorAll("p, h1, h2, h3, li, span");
    var textContent = "";
    paragraphs.forEach(p => textContent += p.innerText + " ");
    textContent = textContent.substring(0, 35000) + "...";  // ✅ Truncate safely

    return textContent;
}


async function summarizeWithGemini(text) {
    const API_KEY = "AIzaSyCe203ORvShvYC_3ajJvRCve3OmRk6Xa_U"; // Replace with your actual API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    const question = document.getElementById("question").value;
    const requestBody = {
        contents: [
            {
                parts: [
                    { text: `Summarize this text: "${text}" in a few sentences. The user has this question and u have to answer it. If empty means user has no question: ${question} Return response in HTML format within a p. Start with <p> and end with </p>. If there is a link, add <a></a> tags as well` }
                ]
            }
        ]
    };


    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        console.log("Response from Gemini:", data);  // Debugging log
        document.getElementById("load").style.display = "none";
    document.getElementById("summarise").disabled = false;
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available.";

    } catch (error) {
        alert("Error fetching summary.");
        console.log("Response from Gemini:", data);  // Debugging log
        document.getElementById("load").style.display = "none";
    document.getElementById("summarise").disabled = false;
        console.error("Error summarizing:", error);
        return "Error fetching summary.";
    }
}});