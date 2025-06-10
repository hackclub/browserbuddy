// Handle button clicks
document
  .getElementById("move-tab-to-new-window")
  .addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "move-tab-to-new-window" });
  });

document.getElementById("duplicate-tab").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "duplicate-tab" });
});

document
  .getElementById("duplicate-tab-to-new-window")
  .addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "duplicate-tab-to-new-window" });
  });

document.getElementById("open-gui").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "open-gui" });
});

document.getElementById("edit-shortcuts").addEventListener("click", () => {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});

// Adaptively change the shortcut keybind display in the buttons (user may set them to something different)
const updateShortcuts = async () => {
  const commands = await chrome.commands.getAll();

  for (const command of commands) {
    const button = document.getElementById(command.name);
    const shortcutElement = button?.querySelector(".shortcut");
    if (shortcutElement) {
      shortcutElement.textContent = command.shortcut || "Not set";
    }
  }
};

// Update shortcuts when the popup loads
document.addEventListener("DOMContentLoaded", updateShortcuts);
