// Use the appropriate API namespace (browser for Firefox, chrome for Chrome)
const api = typeof browser !== 'undefined' ? browser : chrome;

async function updateTimer() {
  try {
    const data = await api.storage.local.get(['lockEndTime']);
    const lockEndTime = data.lockEndTime;
    if (!lockEndTime) return;

    const now = Date.now();
    const timeLeft = Math.max(0, lockEndTime - now);

    if (timeLeft === 0) {
      window.close();
      return;
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error updating timer:', error);
  }
}

// Update timer every second
setInterval(updateTimer, 1000);
updateTimer(); // Initial update 