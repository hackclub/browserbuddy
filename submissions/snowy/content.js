function createSnow() {
    const snow = document.createElement('div');
    snow.classList.add('snow');
  
    snow.style.left = Math.random() * 100 + 'vw';
    
    const size = Math.random() * 10 + 7;
    snow.style.width = size + 'px';
    snow.style.height = size + 'px';
    
    const fallDuration = Math.random() * 10 + 10;
    snow.style.animationDuration = fallDuration + 's';
    
    const drift = Math.random() * 20 - 10;
    snow.style.animationDelay = Math.random() * -20 + 's';
    
    if (Math.random() < 0.1) {
      snow.style.boxShadow = '0 0 10px rgb(255, 255, 255)';
    }
    
    snow.style.backgroundColor = 'rgb(255, 255, 255)';
    
    document.body.appendChild(snow);
    
    setTimeout(() => {
      snow.remove();
    }, fallDuration * 1000);
  }
  
  function startSnowing() {
    const snowInterval = setInterval(() => {
      for (let i = 0; i < Math.random() * 3 + 2; i++) {
        createSnow();
      }
    }, 450); 
  
    window.snowInterval = snowInterval;
  }
  
  function stopSnowing() {
    if (window.snowInterval) {
      clearInterval(window.snowInterval);
    }
  }
  
  function toggleSnow() {
    if (window.snowInterval) {
      stopSnowing();
    } else {
      startSnowing();
    }
  }
  
  const snowStyle = document.createElement('style');
  snowStyle.textContent = ``;
  document.head.appendChild(snowStyle);

  startSnowing();