chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "saveSnippet",
      title: "highlight text to save",
      contexts: ["selection"]
    });
  
    chrome.storage.local.get("snippets", function (data) {
      chrome.storage.local.set({ snippets: data.snippets || [] });
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "saveSnippet") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: highlightAndSave,
        args: [info.selectionText, tab.url, tab.title]
      });
    }
  });
  
  function highlightAndSave(selectedText, url, pageTitle) {
    let range = window.getSelection().getRangeAt(0);
    let span = document.createElement("span");
  
    let pastelColors = ["#FFDDEE", "#DDF0FF", "#E8DFFF", "#FFF4C2", "#DAF0CC", "#F0D9CC"];
    let randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
  
    span.textContent = selectedText;
    span.style.backgroundColor = randomColor;
    span.style.padding = "2px 4px";
    span.style.borderRadius = "4px";
    span.style.fontWeight = "500";
  
    range.deleteContents();
    range.insertNode(span);
  
    chrome.storage.local.get({ snippets: [] }, function (data) {
      let snippets = data.snippets;
      snippets.push({
        text: selectedText,
        url: url,
        color: randomColor,
        heading: pageTitle || "New Snippet" 
      });
      chrome.storage.local.set({ snippets: snippets });
    });
  }
  