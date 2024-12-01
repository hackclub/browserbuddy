document.getElementById("startTyping").addEventListener("click", () => {
  const textToType = document.getElementById("textToType").value;
  chrome.runtime.sendMessage({ action: "startTyping", text: textToType });
});
