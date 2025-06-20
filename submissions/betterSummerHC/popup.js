const tabsBtns = document.querySelectorAll('.tabs button');

function toggleTab(tabName) {
    tabsBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content').forEach(tab => tab.classList.remove('active'));

    const bt = document.querySelector(`button[data-tab="${tabName}"]`);
    if (!bt) {
        console.error(`Button for tab '${tabName}' not found.`);
        return;
    }
    bt.classList.add('active');
    document.querySelector(`#${bt.dataset.tab}`).classList.add('active');
}

tabsBtns.forEach(bt => {
    if (bt.dataset.url != undefined) {
        const url = `https://summer.hackclub.com${bt.dataset.url}`;

        browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
            const currentTab = tabs[0];
            if (currentTab.url === url) {
                toggleTab(bt.dataset.tab);
            }
        }).catch(err => console.error('Error querying tabs:', err));
    }

    bt.addEventListener('click', () => {
        if (bt.dataset.url != undefined) {
            const url = `https://summer.hackclub.com${bt.dataset.url}`;

            browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
                const currentTab = tabs[0];
                if (!currentTab.url === url) {
                    browser.tabs.update(currentTab.id, { url: url });
                }
            }).catch(err => console.error('Error querying tabs:', err));
        }
        toggleTab(bt.dataset.tab);
    });
});

(async () => {
    const result = await browser.storage.sync.get(["shopHidden"]);
    if (!result) {
        browser.storage.sync.set({ shopHidden: [] }, () => {
            console.warn("No hidden items found. Creating new list.");
        });
        return;
    }

    const shopHidden = result.shopHidden || [];

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