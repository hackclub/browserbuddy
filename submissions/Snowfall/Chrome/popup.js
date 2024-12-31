document.getElementById('toggleButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggleChristmasify' }, ({ state }) => {
        document.getElementById('toggleButton').textContent = state ? 'Turn Off Snow' : 'Turn On Snow';
    });
});

// document.getElementById('playButton').addEventListener('click', () => {
//     chrome.runtime.sendMessage({ action: 'playMusic' }, response => {
//         chrome.storage.local.set({ musicPlaying: true });
//     });    
// });
  
// document.getElementById('stopButton').addEventListener('click', () => {
//     chrome.runtime.sendMessage({ action: 'stopMusic' }, response => {
//         chrome.storage.local.set({ musicPlaying: false });
//     });
// });
  
chrome.storage.sync.get(['christmasify'], ({ christmasify }) => {
    document.getElementById('toggleButton').textContent = christmasify ? 'Turn Off Snow' : 'Turn On Snow';
});
  
// Countdown to Christmas
function countdown() {
    const now = new Date();
    const nextChristmas = new Date(now.getFullYear(), 11, 25);
    if (now > nextChristmas) nextChristmas.setFullYear(nextChristmas.getFullYear() + 1);
    const diff = nextChristmas - now;
  
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
    document.getElementById('countdown').textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(countdown, 1000);
countdown();
