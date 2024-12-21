function createLight() {
  const light = document.createElement('div');
  light.classList.add('holiday-light');
  
  light.style.left = Math.random() * 100 + 'vw';
  light.style.top = '5px';
  
  const colors = ['#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff'];
  light.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
  
  document.body.appendChild(light);
  return light;
}

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

function startHolidayLights() {
  const lights = [];
  for (let i = 0; i < 40; i++) {
    lights.push(createLight());
  }
  
  const lightInterval = setInterval(() => {
    lights.forEach(light => {
      light.style.opacity = Math.random() * 0.5 + 0.5;
      
      if (Math.random() < 0.1) {
        const colors = ['#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff'];
        light.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      }
    });
  }, 300);

  window.lightInterval = lightInterval;
}

function startSnowing() {
  const snowInterval = setInterval(() => {
    for (let i = 0; i < Math.random() * 3 + 2; i++) {
      createSnow();
    }
  }, 450); 

  window.snowInterval = snowInterval;
}

startSnowing();
startHolidayLights();
