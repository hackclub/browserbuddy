document.querySelectorAll('.tabs button').forEach(bt => {
    bt.addEventListener('click', () => {
        if (bt.dataset.url != undefined) {
            const url = `https://summer.hackclub.com${bt.dataset.url}`;
            console.log(`Opening URL: ${url}`);

            browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
                const currentTab = tabs[0];
                if (currentTab.url === url) {
                    console.log('URL is already open in the current tab.');
                } else {
                    browser.tabs.update(currentTab.id, { url: url });
                }
            }).catch(err => console.error('Error querying tabs:', err));
        }

        document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.content').forEach(tab => tab.classList.remove('active'));
        bt.classList.add('active');
        document.querySelector(`#${bt.dataset.tab}`).classList.add('active');
    });
});

(async () => {
    const result = await browser.storage.sync.get(["shopHidden"]);
    if (!result) {
        browser.storage.sync.set({ shopHidden: [] }, () => {
            console.log("No hidden items found. Creating new list.");
        });
        return;
    }

    const shopHidden = result.shopHidden || [];
    console.log("Loaded hidden items:", shopHidden);

    const hideDiv = document.querySelector('.hidden > div');
    hideDiv.innerHTML = '';
    shopHidden.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.textContent = item.split(".")[1].trim();

        const unhideButton = document.createElement('button');
        unhideButton.textContent = 'Unhide';
        unhideButton.addEventListener('click', () => {
            browser.storage.sync.get(["shopHidden"]).then(res => {
                const updated = res.shopHidden.filter(i => i !== item);
                browser.storage.sync.set({ shopHidden: updated }).then(() => {
                    itemElement.remove();
                    console.log(`Item '${item}' unhidden.`);
                });

                browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
                    const activeTab = tabs[0];
                    browser.tabs.sendMessage(activeTab.id, { action: 'unhide', id: item })
                        .catch(err => console.warn('Content script may not be loaded in this tab:', err));
                });
            });
        });

        itemElement.appendChild(unhideButton);
        hideDiv.appendChild(itemElement);
    });

    document.querySelector('.hidden').style.display = shopHidden.length > 0 ? 'block' : 'none';
})().catch(err => console.error('Error loading hidden items:', err));