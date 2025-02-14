document.getElementById('open').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'createFloatingWindow' });
});

document.getElementById('clear').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'clearWindow' });
});
