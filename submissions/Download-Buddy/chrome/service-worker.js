let creating; 
async function setupOffscreenDocument(path) {

  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['BLOBS'],
      justification: 'need to convert a webp image to png',
    });
    await creating;
    creating = null;
  }
}

chrome.downloads.onCreated.addListener(
    async function (downloadItem) {
        console.log("Downloaded: " + downloadItem.finalUrl);
        console.log("Downloaded: " + downloadItem.mime);

        let rules = [];
        chrome.storage.sync.get('rules', (data) => {
            rules = data.rules || [];
            let mimeToFormat = {
                "image/png": "png",
                "image/jpeg": "jpeg",
                "image/webp": "webp",
                "image/bmp": "bmp",
                "image/x-icon": "ico",
                "image/tiff": "tiff",
                "image/avif": "avif"
            }
    
            rules.forEach(async rule => {
                console.log(rule.source, mimeToFormat[downloadItem.mime]);
                if (rule.source == mimeToFormat[downloadItem.mime]) {
                    let url = downloadItem.finalUrl;
                    let filename = downloadItem.filename || `image.${rule.target}`;
                    chrome.downloads.cancel(downloadItem.id);
    
                    await setupOffscreenDocument('offscreen.html');
                    chrome.runtime.sendMessage({
                        type: 'convertUrl',
                        target: 'offscreen',
                        data: { url, filename, target: rule.target }
                    });
                }
            })
        });
    }    
)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target != "background") {
        return;
    }

    if (message.type == "download") {
        chrome.downloads.download({
            url: message.data.url,
            filename: message.data.filename
        });
    }
});