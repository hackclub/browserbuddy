document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const totalIntakeEl = document.getElementById('total-intake');
  const goalEl = document.getElementById('goal');
  const progressBarEl = document.getElementById('progress-bar');
  const intakeLogEl = document.getElementById('intake-log');
  const customAmountEl = document.getElementById('custom-amount');
  const addCustomBtn = document.getElementById('add-custom');
  const dailyGoalEl = document.getElementById('daily-goal');
  const saveGoalBtn = document.getElementById('save-goal');
  const resetDayBtn = document.getElementById('reset-day');
  const intakeBtns = document.querySelectorAll('.intake-btn');
  
  // Data structure
  let waterData = {
    date: getCurrentDate(),
    goal: 2000,
    totalIntake: 0,
    intakeLog: []
  };
  
  // Initialize
  loadData();
  
  // Event listeners
  intakeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const amount = parseInt(this.getAttribute('data-amount'));
      addWaterIntake(amount);
    });
  });
  
  addCustomBtn.addEventListener('click', function() {
    const amount = parseInt(customAmountEl.value);
    if (amount > 0) {
      addWaterIntake(amount);
      customAmountEl.value = '';
    }
  });
  
  saveGoalBtn.addEventListener('click', function() {
    const newGoal = parseInt(dailyGoalEl.value);
    if (newGoal > 0) {
      waterData.goal = newGoal;
      saveData();
      updateUI();
      dailyGoalEl.value = '';
    }
  });
  
  resetDayBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset today\'s data?')) {
      resetTodayData();
    }
  });
  
  // Functions
  function getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  
  function addWaterIntake(amount) {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    waterData.intakeLog.push({
      time: currentTime,
      amount: amount
    });
    
    waterData.totalIntake += amount;
    saveData();
    updateUI();
  }
  
  function loadData() {
    chrome.storage.local.get(['waterData'], function(result) {
      if (result.waterData) {
        // Check if the stored data is for today
        if (result.waterData.date === getCurrentDate()) {
          waterData = result.waterData;
        } else {
          // If the data is from a different day, keep the goal but reset other data
          waterData = {
            date: getCurrentDate(),
            goal: result.waterData.goal || 2000,
            totalIntake: 0,
            intakeLog: []
          };
          saveData();
        }
      }
      updateUI();
    });
  }
  
  function saveData() {
    chrome.storage.local.set({ waterData: waterData });
  }
  
  function updateUI() {
    // Update totals
    totalIntakeEl.textContent = waterData.totalIntake;
    goalEl.textContent = waterData.goal;
    
    // Update progress bar
    const progressPercentage = Math.min((waterData.totalIntake / waterData.goal) * 100, 100);
    progressBarEl.style.width = `${progressPercentage}%`;
    
    // Update intake log
    intakeLogEl.innerHTML = '';
    waterData.intakeLog.slice().reverse().forEach(entry => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${entry.time}</span><span>${entry.amount} ml</span>`;
      intakeLogEl.appendChild(li);
    });
  }
  
  function resetTodayData() {
    waterData.totalIntake = 0;
    waterData.intakeLog = [];
    saveData();
    updateUI();
  }
});
