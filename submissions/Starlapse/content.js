class DarkModeTransformer {
  constructor() {
    this.isActive = false;
    this.darkModeId = 'black-hole-dark-mode';
    this.originalStyles = new Map();
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'activateDarkMode') {
        this.activateDarkMode();
        sendResponse({ success: true });
      } else if (request.action === 'deactivateDarkMode') {
        this.deactivateDarkMode();
        sendResponse({ success: true });
      } else if (request.action === 'checkState') {
        sendResponse({ isActive: this.isActive });
      }
    });
  }
  
  activateDarkMode() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.createDarkModeStyles();
    this.addSuckingAnimation();
  }
  
  deactivateDarkMode() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.removeDarkModeStyles();
    this.removeAnimations();
  }
  
  createDarkModeStyles() {
    const existing = document.getElementById(this.darkModeId);
    if (existing) existing.remove();
    
    const style = document.createElement('style');
    style.id = this.darkModeId;
    style.textContent = `
      
      html {
        filter: invert(1) hue-rotate(180deg) !important;
        transition: all 2s ease-in-out !important;
      }
      
      img, video, iframe, svg, canvas, embed, object {
        filter: invert(1) hue-rotate(180deg) !important;
      }
      
      [style*="background-image"], 
      [style*="background: url"], 
      [style*="background:url"] {
        filter: invert(1) hue-rotate(180deg) !important;
      }
      
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(circle at 20% 80%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(58, 134, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255, 107, 53, 0.05) 0%, transparent 50%);
        pointer-events: none;
        z-index: 9999;
        animation: cosmic-drift 10s ease-in-out infinite alternate;
      }
      
      @keyframes cosmic-drift {
        0% { opacity: 0.3; transform: translateX(-10px) translateY(-5px); }
        100% { opacity: 0.1; transform: translateX(10px) translateY(5px); }
      }
      
      h1, h2, h3, h4, h5, h6 {
        text-shadow: 0 0 5px rgba(138, 43, 226, 0.3) !important;
      }
      
      button, input, select, textarea, a {
        box-shadow: 0 0 3px rgba(138, 43, 226, 0.2) !important;
        transition: box-shadow 0.3s ease !important;
      }
      
      button:hover, input:focus, select:focus, textarea:focus, a:hover {
        box-shadow: 0 0 8px rgba(138, 43, 226, 0.4) !important;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  addSuckingAnimation() {
    const suckEffect = document.createElement('div');
    suckEffect.id = 'black-hole-suck-effect';
    suckEffect.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%);
      z-index: 999999;
      pointer-events: none;
      animation: suck-in 3s ease-in-out forwards;
    `;
    
    const keyframes = `
      @keyframes suck-in {
        0% {
          transform: scale(10) rotate(0deg);
          opacity: 0;
        }
        50% {
          transform: scale(1) rotate(180deg);
          opacity: 0.8;
        }
        100% {
          transform: scale(0.1) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(suckEffect);
    
    setTimeout(() => {
      if (suckEffect.parentNode) {
        suckEffect.parentNode.removeChild(suckEffect);
      }
      if (styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
      }
    }, 3000);
  }
  
  removeDarkModeStyles() {
    const style = document.getElementById(this.darkModeId);
    if (style) {
      style.remove();
    }
  }
  
  removeAnimations() {
    const suckEffect = document.getElementById('black-hole-suck-effect');
    if (suckEffect) {
      suckEffect.remove();
    }
  }
}

new DarkModeTransformer();