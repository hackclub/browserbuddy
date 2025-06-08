document.getElementById("refresh")?.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "refresh" });
});
