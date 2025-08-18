// Pulsante Info
async function hideInfoBanner(force = false) {
    const result = await browser.storage.sync.get(["hideInfoBanner"]);
    console.info("Hide Info Banner result:", result);

    const infoBanner = document.querySelector('.tutorial-help-btn');
    
    if (!force && !result.hideInfoBanner) {
        if (infoBanner) {
            infoBanner.style.display = 'block';
        }
        console.info("Info Banner not hidden as per user preference.");
        return;
    }

    if (infoBanner) {
        infoBanner.style.display = 'none';
    }
}
hideInfoBanner();

window.addEventListener("custom:navigation", (e) => {
    hideInfoBanner();
});
browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'hideInfoBanner') {
        hideInfoBanner(message.force);
    }
});