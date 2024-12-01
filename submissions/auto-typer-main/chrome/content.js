let stopTypingFlag = false;

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "startTyping") {
    stopTypingFlag = false; // Reset the flag when starting

    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) {
        console.warn("Clipboard is empty.");
        return;
      }

      const text = clipboardText.split("");
      let index = 0;

      const typeChar = () => {
        if (stopTypingFlag) {
          console.log("Typing stopped.");
          return;
        }

        const activeElement = document.activeElement;

        if (activeElement && (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "DIV")) {
          activeElement.dispatchEvent(new InputEvent("input", { bubbles: true }));
          if (activeElement.tagName === "DIV") {
            activeElement.textContent += text[index];
          } else if (activeElement.tagName === "TEXTAREA") {
            activeElement.value += text[index];
          }

          index++;

          if (index < text.length) {
            setTimeout(typeChar, Math.random() * 150 + 50); // Random delay for realism
          }
        } else {
          console.warn("Active element is not editable.");
        }
      };

      typeChar();
    } catch (error) {
      console.error("Error reading clipboard or typing:", error);
    }
  } else if (message.action === "stopTyping") {
    stopTypingFlag = true;
  }
});
