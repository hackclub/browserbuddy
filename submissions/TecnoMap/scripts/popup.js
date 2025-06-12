if (window.chrome) window.browser = window.chrome;

window.browser.tabs.query({active: true, currentWindow: true}, function (tab) {
    if (!tab[0].url || !tab[0].url.includes("https://mappa.tecnocraft.net/")) {
        window.browser.tabs.create({url: "https://mappa.tecnocraft.net/"});
        window.close();
    }
});