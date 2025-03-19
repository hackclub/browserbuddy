// Check if it's a new day and reset data if needed
chrome.runtime.onStartup.addListener(function() {
  checkForNewDay();
});

// Also check when the extension is installed
chrome.runtime.onInstalled.addListener(function() {
  initializeData();
});

function getCurrentDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function checkForNewDay() {
  chrome.storage.local.get(['waterData'], function(result) {
    if (result.waterData) {
      const storedDate = result.waterData.date;
      const currentDate = getCurrentDate();
      
      if (storedDate !== currentDate) {
        // It's a new day, reset the intake data but keep the goal
        const newData = {
          date: currentDate,
          goal: result.waterData.goal || 2000,
          totalIntake: 0,
          intakeLog: []
        };
        
        chrome.storage.local.set({ waterData: newData });
      }
    } else {
      initializeData();
    }
  });
}

function initializeData() {
  const initialData = {
    date: getCurrentDate(),
    goal: 2000,
    totalIntake: 0,
    intakeLog: []
  };
  
  chrome.storage.local.set({ waterData: initialData });
}
