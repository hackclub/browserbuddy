// Avoid multiple initializations
if (!window.cursorEffectInitialized) {
  window.cursorEffectInitialized = true;
  
  // Variables to store cursor settings
  let cursorEnabled = true;
  let cursorType = 'trail';
  let cursorColor = '#FF5733';
  let cursorSize = 10;
  
  // Array to store cursor trail elements
  let cursorElements = [];
  const maxTrailLength = 20;
  
  // Function to create cursor trail element
  function createCursorElement() {
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '9999';
    element.style.transition = 'transform 0.1s ease, opacity 0.3s ease';
    element.style.opacity = '0';
    document.body.appendChild(element);
    return element;
  }
  
  // Function to update cursor element appearance
  function updateCursorElement(element, x, y, index) {
    const opacity = cursorType === 'trail' ? 1 - (index / maxTrailLength) : 1;
    
    element.style.width = `${cursorSize}px`;
    element.style.height = `${cursorSize}px`;
    element.style.borderRadius = cursorType === 'trail' ? '50%' : '0';
    element.style.backgroundColor = cursorColor;
    element.style.opacity = opacity.toString();
    element.style.transform = `translate(${x - cursorSize / 2}px, ${y - cursorSize / 2}px)`;
    
    if (cursorType === 'glow') {
      element.style.boxShadow = `0 0 ${cursorSize * 2}px ${cursorColor}`;
    } else if (cursorType === 'sparkle') {
      element.style.transform += ` rotate(${Math.random() * 360}deg)`;
      element.style.opacity = (Math.random() * 0.5 + 0.5).toString();
    }
  }
  
  // Initialize cursor elements
  for (let i = 0; i < maxTrailLength; i++) {
    cursorElements.push(createCursorElement());
  }
  
  // Track cursor position
  document.addEventListener('mousemove', (e) => {
    if (!cursorEnabled) return;
    
    const x = e.clientX;
    const y = e.clientY;
    
    // Hide native cursor if enabled
    if (cursorType === 'replace') {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = '';
    }
    
    // Update the first cursor element
    updateCursorElement(cursorElements[0], x, y, 0);
    
    // Update the rest of the trail
    if (cursorType === 'trail') {
      for (let i = cursorElements.length - 1; i > 0; i--) {
        // Get the previous element's transform value
        const prevTransform = cursorElements[i - 1].style.transform;
        // Safe parsing of coordinates
        let prevX = 0, prevY = 0;
        
        if (prevTransform) {
          const xMatch = prevTransform.match(/translate\((\d+\.?\d*)px/);
          const yMatch = prevTransform.match(/(\d+\.?\d*)px\)/);
          
          if (xMatch && xMatch[1]) {
            prevX = parseFloat(xMatch[1]) + cursorSize / 2;
          }
          
          if (yMatch && yMatch[1]) {
            prevY = parseFloat(yMatch[1]) + cursorSize / 2;
          }
        }
        
        updateCursorElement(
          cursorElements[i],
          prevX,
          prevY,
          i
        );
      }
    }
  });
  
  // Get cursor settings from storage
  chrome.runtime.sendMessage({ action: 'getCursorSettings' }, (response) => {
    if (response) {
      cursorEnabled = response.cursorEnabled;
      cursorType = response.cursorType;
      cursorColor = response.cursorColor;
      cursorSize = response.cursorSize;
      
      // Apply settings to cursor elements
      cursorElements.forEach((element, index) => {
        if (cursorEnabled) {
          element.style.display = '';
        } else {
          element.style.display = 'none';
        }
      });
    }
  });
  
  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.cursorEnabled) {
      cursorEnabled = changes.cursorEnabled.newValue;
      cursorElements.forEach(element => {
        element.style.display = cursorEnabled ? '' : 'none';
      });
    }
    
    if (changes.cursorType) {
      cursorType = changes.cursorType.newValue;
    }
    
    if (changes.cursorColor) {
      cursorColor = changes.cursorColor.newValue;
    }
    
    if (changes.cursorSize) {
      cursorSize = changes.cursorSize.newValue;
    }
  });
}
