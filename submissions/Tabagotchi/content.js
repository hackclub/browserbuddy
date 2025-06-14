
chrome.storage.local.get("mood", ({ mood }) => {
    applyDomainFilterAndUpdateUI(mood);
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.mood) {
        applyDomainFilterAndUpdateUI(changes.mood.newValue);
    }
});

function applyDomainFilterAndUpdateUI(mood) {
    chrome.storage.local.get("excludedWebsites", ({ excludedWebsites }) => {
        excludedWebsites = excludedWebsites || [];
        const currentDomain = window.location.hostname;

        // Check if the current domain is excluded
        if (!excludedWebsites.includes(currentDomain)) {
            updateTabagotchiUI(mood);
        } else {
            console.log(`${currentDomain} is excluded. Tabagotchi will not update.`);
        }
    });
}

function updateTabagotchiUI(mood) {
    let pet = document.getElementById("tabagotchi");
    if (!pet) {
        pet = document.createElement("div");
        pet.id = "tabagotchi";
        pet.style.position = "fixed";
        pet.style.bottom = "10px";
        pet.style.right = "10px";
        pet.style.padding = "10px";
        pet.style.backgroundColor = "yellow";
        pet.style.border = "1px solid black";
        document.body.appendChild(pet);
    }

    pet.textContent = `Tabagotchi is feeling ${mood}!`;
    pet.style.backgroundColor = mood === "happy" ? "lightgreen" : "orange";
}
