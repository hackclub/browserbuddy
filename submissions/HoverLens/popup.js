
document.getElementById("magnification").addEventListener("input", (e) => {
  const magnification = e.target.value;
  chrome.storage.sync.set({ magnification });
});
    