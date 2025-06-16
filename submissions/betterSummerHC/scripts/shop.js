const cards = document.querySelectorAll('.card-with-gradient[data-padding="md"]');

function getID(card, index) {
    return index + ". " + card.querySelector(".flex-grow h3.font-bold").textContent.trim();
}

cards.forEach((card, index) => {
    const ID = getID(card, index);
    const btn = document.createElement('button');
    btn.textContent = 'Hide';

    btn.style.position = 'absolute';
    btn.style.top = '20px';
    btn.style.left = '15px';
    btn.style.backgroundColor = 'rgba(224, 73, 27, 0.8)';
    btn.style.border = '1px solid #ccc';
    btn.style.borderRadius = '24px';
    btn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    btn.style.color = '#FFF';


    btn.style.zIndex = '1000';
    btn.style.padding = '4px 8px';
    btn.style.fontSize = '12px';
    btn.style.cursor = 'pointer';

    card.style.position = card.style.position || 'relative';

    btn.addEventListener('click', async () => {
        const res = await browser.storage.sync.get(["shopHidden"]);

        if (!res) {
            browser.storage.sync.set({ shopHidden: [ID] }, () => {
                item.style.display = "none";
            });

            return;
        }

        const shopHidden = res.shopHidden || [];

        if (!shopHidden.includes(ID)) {
            shopHidden.push(ID);

            await browser.storage.sync.set({ shopHidden });
            card.style.display = "none";
            console.log(`Item with ID '${ID}' hidden.`);
        }
    });

    card.appendChild(btn);
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

    cards.forEach((item, index) => {
        const ID = getID(item, index);

        if (shopHidden.includes(ID)) {
            item.style.display = "none";
        }
    });
    console.log("Hide buttons set up for shop items.");
    console.log("Shop items hidden based on stored preferences.");
})();

browser.runtime.onMessage.addListener((message) => {
    console.log("Received message:", message);
    if (message.action === 'unhide') {
        const id = message.id.split(".")[0].trim();
        const item = Array.from(cards)[id];
        
        if (!item) return;

        item.style.display = 'block';
        browser.storage.sync.get(["shopHidden"]).then(res => {
            const updated = res.shopHidden.filter(i => i !== id);
            browser.storage.sync.set({ shopHidden: updated }).then(() => {
                console.log(`Item with ID '${id}' unhidden.`);
            });
        });
    }
});
