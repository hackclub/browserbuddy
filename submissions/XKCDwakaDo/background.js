chrome.commands.onCommand.addListener((command) => {
  console.log(`Command received: ${command}`);
  if (command === "trigger-content-script") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(`Error querying tabs: ${chrome.runtime.lastError.message}`);
        return;
      }
      console.log(`Tabs found: ${tabs.length}`);
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "runScript" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(`Error sending message: ${chrome.runtime.lastError.message}`);
          } else {
            console.log('Message sent successfully:', response);
          }
        });
      } else {
        console.warn('No active tabs found.');
      }
    });
  }
});