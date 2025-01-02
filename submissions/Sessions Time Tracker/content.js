class ReadingTimeEstimator {
  constructor() {
    this.wordsPerMinute = 200;
    this.badge = null;
    this.snowflakes = [];
  }

  isChristmasSeason() {
    const today = new Date();
    const month = today.getMonth();
    return month === 10 || month === 11; // November (10) or December (11)
  }

  calculateReadingTime() {
    const text = document.body.innerText;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount / this.wordsPerMinute);
  }

  createBadge() {
    const readingTime = this.calculateReadingTime();
    const isChristmas = this.isChristmasSeason();
    
    this.badge = document.createElement('div');
    this.badge.className = `reading-time-badge ${isChristmas ? 'christmas-theme' : 'regular-theme'}`;
    
    let timeText = `${readingTime} min read`;
    if (isChristmas) {
      timeText = this.getChristmasMessage(readingTime);
    }
    
    this.badge.textContent = timeText;
    document.body.appendChild(this.badge);

    if (isChristmas) {
      this.initSnowfall();
    }
  }

  getChristmasMessage(minutes) {
    const messages = [
      `${minutes} festive mins`,
      `${minutes} merry minutes`,
      `${minutes} jolly minutes`,
      `${minutes} holiday mins`,
      `${minutes} magical mins`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.style.left = `${Math.random() * 100}vw`;
    snowflake.style.opacity = Math.random() * 0.7 + 0.3;
    snowflake.style.fontSize = `${Math.random() * 20 + 10}px`;
    snowflake.textContent = '❄';
    
    const duration = Math.random() * 5 + 5; // 5-10 seconds
    snowflake.style.animation = `fall ${duration}s linear forwards`;
    
    document.body.appendChild(snowflake);
    this.snowflakes.push(snowflake);
    
    setTimeout(() => {
      document.body.removeChild(snowflake);
      const index = this.snowflakes.indexOf(snowflake);
      if (index > -1) {
        this.snowflakes.splice(index, 1);
      }
    }, duration * 1000);
  }

  initSnowfall() {
    // Create new snowflakes periodically
    setInterval(() => {
      if (this.snowflakes.length < 50) { // Limit maximum snowflakes
        this.createSnowflake();
      }
    }, 200);
  }
}

// Initialize when page loads
function init() {
  const estimator = new ReadingTimeEstimator();
  estimator.createBadge();
}

// Handle various page load scenarios
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
