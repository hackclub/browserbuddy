let isChristmasified = false;
let snowInterval;

function applySnow() {
    if (document.getElementById('snow-container')) return;

    const container = document.createElement('div');
    container.id = 'snow-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';

    snowInterval = setInterval(() => {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerText = '❄️';
        snowflake.style.position = 'absolute';
        snowflake.style.left = Math.random() * window.innerWidth + 'px';
        snowflake.style.top = '-50px';
        snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
        snowflake.style.opacity = Math.random();
        snowflake.style.animation = `fall 5s linear infinite`;
        container.appendChild(snowflake);

        setTimeout(() => snowflake.remove(), 5000);
    }, 200);

    document.body.appendChild(container);
}

// function applyBackground() {
//     document.body.style.background = 'url(https://www.designyourway.net/blog/wp-content/uploads/2024/04/christmas-wallpaper-from-designyourway-1200x700.jpg) no-repeat center center fixed #FFF';
//     document.body.style.backgroundSize = 'cover';
//     document.body.style.opacity = '1.5';
// }

function removeDecorations() {
    // document.getElementById('christmas-lights-container')?.remove();
    document.getElementById('snow-container')?.remove();
    // document.body.style.background = '';
    clearInterval(snowInterval);
}

function applyChristmasify() {
    if (isChristmasified) return;
    applySnow();
    isChristmasified = true;
}
  
function removeChristmasify() {
    if (!isChristmasified) return;
    removeDecorations();
    isChristmasified = false;
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'applyChristmasify') applyChristmasify();
    if (message.action === 'removeChristmasify') removeChristmasify();
});
