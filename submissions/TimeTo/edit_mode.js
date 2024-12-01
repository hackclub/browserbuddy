const urlContainer = document.getElementById("URL-list");
const urlParams = new URLSearchParams(window.location.search);
const modeName = urlParams.get("mode");
let storageKey = `savedURL_${modeName}`;
const savedURLs = JSON.parse(localStorage.getItem(storageKey)) || [];
document.getElementById("modeNameInput").value = modeName;

const loadURLs = () => {
    savedURLs.forEach((url) => {
        const inputContainer = document.createElement("div");
        inputContainer.className = "URL";
        const input = document.createElement("input");
        input.type = "url";
        input.className = "urlInput";
        input.value = url;
        inputContainer.appendChild(input);
        urlContainer.appendChild(inputContainer);
    });
};

const addInputField = () => {
    const inputContainer = document.createElement("div");
    inputContainer.className = "URL";
    const input = document.createElement("input");
    input.type = "url";
    input.className = "urlInput";
    input.placeholder = "URL";
    inputContainer.appendChild(input);
    urlContainer.appendChild(inputContainer);
    input.focus();
};

const saveMode = () => {
    const inputs = document.querySelectorAll(".urlInput");
    const urls = Array.from(inputs).map(input => input.value.trim()).filter(url => url !== "");
    localStorage.setItem(storageKey, JSON.stringify(urls));
    alert(`Mode "${modeName}" updated successfully!`);
};

const deleteMode = () => {
    if (confirm(`Are you sure you want to delete the mode "${modeName}"?`)) {
        localStorage.removeItem(storageKey);
        alert(`Mode "${modeName}" deleted successfully!`);
        window.location.href = "index.html"; // Navigate back to the main page
    }
};

document.getElementById("back-button").addEventListener("click", () => {
    window.history.back();
});

document.getElementById("addInput").addEventListener("click", addInputField);

document.getElementById("save-button").addEventListener("click", saveMode);

document.getElementById("delete-button").addEventListener("click", deleteMode);

// Load URLs when the page loads
loadURLs();