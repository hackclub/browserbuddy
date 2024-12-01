document.getElementById("addMode").addEventListener("click", () => {
    window.location.href = "add_url.html";
});

const openLinksForMode = (modeName) => { window.location.href = `link-list.html?mode=${modeName}`; };

const editMode = (modeName) => {
    const storageKey = `savedURL_${modeName}`;
    let savedURLs = JSON.parse(localStorage.getItem(storageKey)) || [];
    let newURLs = prompt(`Edit URLs for ${modeName} (separate multiple URLs with commas):`, savedURLs.join(","));
    if (newURLs !== null) {
        savedURLs = newURLs.split(",").map(url => url.trim());
        localStorage.setItem(storageKey, JSON.stringify(savedURLs));
        alert(`URLs for ${modeName} updated successfully!`);
    }
};

const loadModes = () => {
    const modesContainer = document.getElementById("modes-container");
    modesContainer.innerHTML = ''; // Clear existing content
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('savedURL_')) {
            const modeName = key.replace('savedURL_', '');
            const modeDiv = document.createElement('div');
            modeDiv.className = 'mode';
            modeDiv.innerHTML = `
                <a class="play-button-a" href="#">
                    <img class="play-button" src="icons/play.svg" alt="play-button">
                </a>
                <h2 class="mode-name nunito">${modeName}</h2>
                <img src="icons/edit.svg" alt="edit icon" class="edit_icon" data-mode-name="${modeName}">
            `;
            modesContainer.appendChild(modeDiv);
        }
    }

    
    const playButtons = document.querySelectorAll(".play-button-a");
    playButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault(); 
            const modeName = button.nextElementSibling.textContent.trim();
            console.log(`Clicked mode: ${modeName}`);
            openLinksForMode(modeName);
        });
    });

    
    const editButtons = document.querySelectorAll(".edit_icon");
    editButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            const modeName = button.dataset.modeName.trim();
          
            window.location.href = `edit_mode.html?mode=${modeName}`;
        });
    });
};

// Load modes when the page loads
window.onload = loadModes;