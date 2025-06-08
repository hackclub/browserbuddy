// Defining the switches
const hshorts = document.getElementById("hideshorts");
const hside=document.getElementById("hidesidebar");
const hcats=document.getElementById("hidecategories");


// Checking if they are already set
chrome.storage.local.get("hideshorts", (data) => {
    hshorts.checked = data.hideshorts || false;
});
chrome.storage.local.get("hidesidebar", (data) => {
    hside.checked = data.hidesidebar || false;
});
chrome.storage.local.get("hidecategories", (data) => {
    hcats.checked = data.hidecategories || false;
});

// If the switches are changed, set the local variable
// For shorts
hshorts.addEventListener("change", () => {
    const is_shorts_enabled = hshorts.checked;
    chrome.storage.local.set({ hideshorts:is_shorts_enabled });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { hideshorts: is_shorts_enabled });
        }
    });
});
// For sidebar
hside.addEventListener("change", () => {
    const is_side_enabled = hside.checked;
    chrome.storage.local.set({ hidesidebar:is_side_enabled });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { hidesidebar:is_side_enabled });
        }
    });
});
// For categories section
hcats.addEventListener("change", () => {
    const is_cats_enabled = hcats.checked;
    chrome.storage.local.set({ hidecategories:is_cats_enabled });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { hidecategories:is_cats_enabled });
        }
    });
});

// Theme stuff - ---------------------------------------------------
themeSelect=document.getElementById("theme");

// Checking if there's already a theme set
chrome.storage.local.get("theme", (data) => {
    themeSelect.value=data.theme || "default";
});
// If user changed it, set the new one
themeSelect.addEventListener("change", () => {
    const currTheme = themeSelect.value;
    chrome.storage.local.set({ theme:currTheme});

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { theme:currTheme,tabID:tabs[0].id });
        }
    });
});