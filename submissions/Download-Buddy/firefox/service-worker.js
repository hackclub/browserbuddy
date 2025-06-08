browser.downloads.onCreated.addListener(
    async function (downloadItem) {
        let mime;

        console.log("Downloaded: " + downloadItem.url);

        fetch(downloadItem.url, { method: 'HEAD' })
        .then(response => {
          mime = response.headers.get('content-type');
          console.log("Downloaded: " + mime);

        let rules = [];
        browser.storage.local.get('rules', (data) => {
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
                console.log(rule.source, mimeToFormat[mime]);
                if (rule.source == mimeToFormat[mime]) {
                    let url = downloadItem.url;
                    let filename = downloadItem.filename || `image.${rule.target}`;
                    filename = filename.replace(/\.[^/.]+$/, `.${rule.target}`);
                    filename = filename.split("/").pop().split("\\").pop();
                    try {
                      browser.downloads.cancel(downloadItem.id);
                    }
                    catch (e) {
                      console.error('Error cancelling download:', e);
                    }
    
                    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                      if (tabs.length === 0) {
                          console.error("No active tab found.");
                          return;
                      }
                  
                      const tabId = tabs[0].id;

                      browser.tabs.sendMessage(tabId, {
                          type: 'convertUrl',
                          target: 'content',
                          data: { url, filename, target: rule.target }
                      });

                      console.log("Message sent");
                    });
                }
            })
        });

        })
        .catch(err => console.error('Error fetching MIME type:', err))
    }    
)