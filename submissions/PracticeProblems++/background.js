let executedTabs = {};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "search") {
    const query = request.query;

    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " practice problems")}`;
    chrome.tabs.create({ url: youtubeSearchUrl }, function (youtubeTab) {
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + " practice problems")}`;
      chrome.tabs.create({ url: googleSearchUrl }, function (googleTab) {
        chrome.tabs.group(
          { tabIds: [youtubeTab.id, googleTab.id] },
          function (groupId) {
            chrome.tabs.onUpdated.addListener(
              function listener(tabId, changeInfo) {
                if (changeInfo.status === "complete") {
                  if (tabId === youtubeTab.id && !executedTabs[youtubeTab.id]) {
                    executedTabs[youtubeTab.id] = true;
                    chrome.scripting
                      .executeScript({
                        target: { tabId: youtubeTab.id },
                        func: openTopVideos,
                      })
                      .catch(console.error);
                  }

                  if (tabId === googleTab.id && !executedTabs[googleTab.id]) {
                    executedTabs[googleTab.id] = true;
                    chrome.scripting
                      .executeScript({
                        target: { tabId: googleTab.id },
                        func: openTopGoogleLinks,
                      })
                      .then(() => {
                        chrome.tabs.remove(googleTab.id);
                      })
                      .catch(console.error);
                  }
                }
              },
            );

            chrome.tabGroups.update(groupId, { collapsed: false });
          },
        );
      });
    });
  }
});

function openTopGoogleLinks() {
  const resultLinks = Array.from(
    document.querySelectorAll('a[jsname="UWckNb"][href]'),
  );

  resultLinks.slice(0, 5).forEach((link) => {
    window.open(link.href, "_blank");
  });
}

function openTopVideos() {
  const videoLinks = Array.from(
    document.querySelectorAll("a#video-title[href]"),
  );

  videoLinks.slice(0, 5).forEach((link) => {
    window.open(link.href, "_blank");
  });
}
