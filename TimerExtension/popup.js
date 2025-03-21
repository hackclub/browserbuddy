document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const stopwatchTab = document.getElementById('stopwatch-tab');
    const timerTab = document.getElementById('timer-tab');
    const stopwatchSection = document.getElementById('stopwatch-section');
    const timerSection = document.getElementById('timer-section');
    
    stopwatchTab.addEventListener('click', function() {
      stopwatchTab.classList.add('active');
      timerTab.classList.remove('active');
      stopwatchSection.classList.add('active');
      timerSection.classList.remove('active');
    });
    
    timerTab.addEventListener('click', function() {
      timerTab.classList.add('active');
      stopwatchTab.classList.remove('active');
      timerSection.classList.add('active');
      stopwatchSection.classList.remove('active');
    });
    
    // Stopwatch functionality
    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const stopwatchStartBtn = document.getElementById('stopwatch-start');
    const stopwatchPauseBtn = document.getElementById('stopwatch-pause');
    const stopwatchResetBtn = document.getElementById('stopwatch-reset');
    
    let stopwatchInterval;
    let stopwatchSeconds = 0;
    
    function updateStopwatchDisplay() {
      const hours = Math.floor(stopwatchSeconds / 3600);
      const minutes = Math.floor((stopwatchSeconds % 3600) / 60);
      const seconds = stopwatchSeconds % 60;
      
      stopwatchDisplay.textContent = 
        (hours < 10 ? '0' + hours : hours) + ':' +
        (minutes < 10 ? '0' + minutes : minutes) + ':' +
        (seconds < 10 ? '0' + seconds : seconds);
    }
    
    stopwatchStartBtn.addEventListener('click', function() {
      stopwatchInterval = setInterval(function() {
        stopwatchSeconds++;
        updateStopwatchDisplay();
      }, 1000);
      
      stopwatchStartBtn.disabled = true;
      stopwatchPauseBtn.disabled = false;
    });
    
    stopwatchPauseBtn.addEventListener('click', function() {
      clearInterval(stopwatchInterval);
      stopwatchStartBtn.disabled = false;
      stopwatchPauseBtn.disabled = true;
    });
    
    stopwatchResetBtn.addEventListener('click', function() {
      clearInterval(stopwatchInterval);
      stopwatchSeconds = 0;
      updateStopwatchDisplay();
      stopwatchStartBtn.disabled = false;
      stopwatchPauseBtn.disabled = true;
    });
    
    // Timer functionality
    const timerDisplay = document.getElementById('timer-display');
    const timerStartBtn = document.getElementById('timer-start');
    const timerPauseBtn = document.getElementById('timer-pause');
    const timerResetBtn = document.getElementById('timer-reset');
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    
    let timerInterval;
    let timerSeconds = 0;
    let initialTimerSeconds = 0;
    
    function updateTimerDisplay() {
      const hours = Math.floor(timerSeconds / 3600);
      const minutes = Math.floor((timerSeconds % 3600) / 60);
      const seconds = timerSeconds % 60;
      
      timerDisplay.textContent = 
        (hours < 10 ? '0' + hours : hours) + ':' +
        (minutes < 10 ? '0' + minutes : minutes) + ':' +
        (seconds < 10 ? '0' + seconds : seconds);
    }
    
    timerStartBtn.addEventListener('click', function() {
      if (timerSeconds === 0) {
        // Get time from inputs
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        
        initialTimerSeconds = timerSeconds = hours * 3600 + minutes * 60 + seconds;
        
        if (timerSeconds === 0) {
          alert('Please set a time for the timer');
          return;
        }
      }
      
      timerInterval = setInterval(function() {
        if (timerSeconds > 0) {
          timerSeconds--;
          updateTimerDisplay();
        } else {
          clearInterval(timerInterval);
          alert('Timer completed!');
          timerStartBtn.disabled = false;
          timerPauseBtn.disabled = true;
        }
      }, 1000);
      
      timerStartBtn.disabled = true;
      timerPauseBtn.disabled = false;
    });
    
    timerPauseBtn.addEventListener('click', function() {
      clearInterval(timerInterval);
      timerStartBtn.disabled = false;
      timerPauseBtn.disabled = true;
    });
    
    timerResetBtn.addEventListener('click', function() {
      clearInterval(timerInterval);
      timerSeconds = 0;
      updateTimerDisplay();
      hoursInput.value = 0;
      minutesInput.value = 0;
      secondsInput.value = 0;
      timerStartBtn.disabled = false;
      timerPauseBtn.disabled = true;
    });
    
    // Initialize displays
    updateStopwatchDisplay();
    updateTimerDisplay();
  });