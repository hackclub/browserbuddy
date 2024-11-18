// Listen for messages from the content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "FETCH_DEFINITION") {
      const word = message.word;
  
      try {
        // Fetch definition from DictionaryAPI.dev
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (response.ok) {
          const data = await response.json();
          const definition = data[0]?.meanings[0]?.definitions[0]?.definition || "No definition found.";
          injectDefinition(sender.tab.id, word, definition);
        } else {
          injectDefinition(sender.tab.id, word, "No definition found.");
        }
      } catch (error) {
        injectDefinition(sender.tab.id, word, "Error fetching definition.");
      }
    }
  });
  
  // Function to inject definition into the webpage
  function injectDefinition(tabId, word, definition) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (word, definition) => {
        // Create a floating element for the definition
        const div = document.createElement("div");
        div.textContent = `${word}: ${definition}`;
        div.style.position = "fixed";
        div.style.bottom = "20px";
        div.style.right = "20px";
        div.style.backgroundColor = "black";
        div.style.color = "white";
        div.style.padding = "10px";
        div.style.borderRadius = "5px";
        div.style.zIndex = "10000";
        document.body.appendChild(div);
  
        // Remove the element after 5 seconds
        setTimeout(() => div.remove(), 5000);
      },
      args: [word, definition]
    });
  }
  