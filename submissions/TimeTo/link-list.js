const urlParams = new URLSearchParams(window.location.search);
    const modeName = urlParams.get("mode");
    document.getElementById("mode-name").textContent = modeName;
    const storageKey = `savedURL_${modeName}`;
    const savedURLs = JSON.parse(localStorage.getItem(storageKey)) || [];

    const loadLinks = () => {
        const linkList = document.getElementById("link-list");
        savedURLs.forEach((url) => {
            const linkItem = document.createElement("div");
            linkItem.className = "urlItem";
            linkItem.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;
            linkList.appendChild(linkItem);
        });
    };

    document.getElementById("back-button").addEventListener("click", () => {
        window.history.back();
    });

    // Load links when the page loads
    loadLinks();