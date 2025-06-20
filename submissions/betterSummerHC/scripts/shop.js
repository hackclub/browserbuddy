function getID(card, index) {
    return index + ". " + card.querySelector(".flex-grow h3.font-bold").textContent.trim();
}

function listenerFn(message) {
    if (message.action === 'unhide') {
        const id = message.id.split(".")[0].trim();
        const item = Array.from(cards)[id];

        if (!item) return;

        item.style.display = 'block';
        browser.storage.sync.get(["shopHidden"]).then(res => {
            const updated = res.shopHidden.filter(i => i !== id);
            browser.storage.sync.set({ shopHidden: updated })
        });
    }
}

const shopFn = async (loc = window.location) => {
    if (!(loc.url || loc.href).includes("shop"))
        return;

    // made with AI because it's too hard. sorry :(
    await (
        new Promise(resolve => {
            const checkExist = setInterval(() => {
                if (document.querySelector('.card-with-gradient[data-padding="md"]')) {
                    clearInterval(checkExist);
                    resolve();
                }
            }, 100);
        })
    )

    const cards = document.querySelectorAll('.my-6 .flex.flex-col .card-with-gradient[data-padding="md"]');

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
            }
        });

        card.appendChild(btn);
    });

    const result = await browser.storage.sync.get(["shopHidden"]);
    if (!result) {
        browser.storage.sync.set({ shopHidden: [] }, () => {});
    }

    const shopHidden = result.shopHidden || [];

    cards.forEach((item, index) => {
        const ID = getID(item, index);

        if (shopHidden.includes(ID)) {
            item.style.display = "none";
        }
    });
    console.info("Hide buttons set up for shop items.");
    console.info("Shop items hidden based on stored preferences.");

    try {
        browser.runtime.onMessage.removeListener(listenerFn);
    } catch (e) { } 
    browser.runtime.onMessage.addListener(listenerFn);
};

/**
 * Me del futuro: questo controlla se l'url è cambiato e esegue il codice
 * https://stackoverflow.com/a/52809105
 */
// window.navigation.addEventListener("navigate", (event) => {
//     shopFn(event.destination);
// });
// FIx for firefox from chatgpt 
window.addEventListener("custom:navigation", (e) => {
    shopFn(new URL(e.detail.url));
});
shopFn();


