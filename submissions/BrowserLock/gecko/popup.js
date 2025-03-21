// Use the appropriate API namespace (browser for Firefox, chrome for Chrome)
const api = typeof browser !== 'undefined' ? browser : chrome;

document.getElementById('startLock').addEventListener('click', async () => {
  try {
    const duration = document.getElementById('duration').value;
    if (duration < 1) {
      alert('Please enter a valid duration (minimum 1 minute)');
      return;
    }

    const endTime = Date.now() + duration * 60 * 1000;
    await api.storage.local.set({ lockEndTime: endTime });
    
    // Create an alarm for when the lock should end
    await api.alarms.create('lockEnd', {
      when: endTime
    });

    // Send message to background script to start the lock
    api.runtime.sendMessage({ action: 'startLock' });
    window.close();
  } catch (error) {
    console.error('Error starting lock:', error);
    alert('An error occurred while starting the lock. Please try again.');
  }
}); 