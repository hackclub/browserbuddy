document.getElementById('open').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'createFloatingWindow' });
});