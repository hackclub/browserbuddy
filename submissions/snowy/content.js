function createLightString() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const spacing = 50; 
    const positions = [];
    
    for (let x = 0; x <= windowWidth; x += spacing) {
      positions.push({ 
        x,
        y: 0,
        angle: 0
      });
    }
    
    return positions;
}

function createLight(position) {
    const light = document.createElement('div');
    light.classList.add('holiday-light');
    
    light.style.left = position.x + 'px';
    light.style.top = position.y + 'px';
    light.style.transform = `rotate(${position.angle}deg)`;
    
    const colors = ['#ff4444', '#44ff44', '#ffff44', '#4444ff', '#ff44ff'];
    light.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    document.body.appendChild(light);
    return light;
}

function createRope() {
    const rope = document.createElement('svg');
    rope.style.position = 'fixed';
    rope.style.top = '0';
    rope.style.left = '0';
    rope.style.width = '100%';
    rope.style.height = '100%';
    rope.style.pointerEvents = 'none';
    rope.style.zIndex = '9999';
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', '#2a5a1b');
    path.setAttribute('stroke-width', '4');
    path.setAttribute('fill', 'none');
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const d = `
      M 0,0 
      L ${windowWidth},0
      M ${windowWidth},0
      L ${windowWidth},${windowHeight}
      M 0,0
      L 0,${windowHeight}
    `;
    
    path.setAttribute('d', d);
    rope.appendChild(path);
    document.body.appendChild(rope);
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
    createRope();
    const positions = createLightString();
    const lights = positions.map(pos => createLight(pos));
    
    const lightInterval = setInterval(() => {
      lights.forEach(light => {
        light.style.opacity = Math.random() * 0.3 + 0.7;
        
        if (Math.random() < 0.05) {
          const colors = ['#ff4444', '#44ff44', '#ffff44', '#4444ff', '#ff44ff'];
          light.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        }
      });
    }, 500);  
  
    window.addEventListener('resize', () => {
      lights.forEach(light => light.remove());
      const newPositions = createLightString();
      lights.length = 0;
      lights.push(...newPositions.map(pos => createLight(pos)));
    });
  
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
