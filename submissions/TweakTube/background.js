const shorts="https://youtube.com/shorts";

chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url.startsWith(shorts)) {
        chrome.tabs.update(tab.id, { url: "https://www.youtube.com" });
    }
  });

  function setTheme(theme,tabID){
    console.log("The theme is being changed to",theme);
    chrome.scripting.insertCSS({
      files: [`themes/${theme}.css`],
      target: { tabId: tabID },
    });
  }



chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return; // No active tab
    chrome.storage.local.get("theme", (data) => {
        if(data.theme==undefined){
          chrome.storage.local.set({theme:"default"});
        }else{
          setTheme(data.theme,tabs[0].id)
        }
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
if(message.theme!==undefined && message.tabID!==undefined){
    setTheme(message.theme,message.tabID);
     // sending message to worker to apply theme
    chrome.runtime.sendMessage({ action: "applyCSS",theme:message.theme,tabID:message.tabID });
}
});
