chrome.storage.local.get("discord.hideBlockedMessages", function (result) {
  if (result["discord.hideBlockedMessages"] === true) {
    hideBlockedMessages();
  }
});

function hideBlockedMessages() {
  let observer = new MutationObserver(onDOMChange);
  observer.observe(document.body, { childList: true, subtree: true });

  let chatMessages = undefined;

  function onDOMChange(records) {
    if (chatMessages == undefined) {
      let chatMessages = document.querySelector(
        "ol[data-list-id='chat-messages']"
      );

      if (chatMessages != undefined) {
        observer.disconnect();
        observer = new MutationObserver(onDOMChange);
        observer.observe(chatMessages, { childList: true, subtree: true });
      }
    }

    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (
          node.textContent.endsWith("Show messages") ||
          node.textContent.endsWith("Show message")
        ) {
          node.style.display = "none";
        }
      });
    });
  }
}
