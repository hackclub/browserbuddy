class GalacticReader {
  constructor() {
    this.isActive = false;
    this.readerModeId = 'galactic-reader-mode';
    this.readingStartTime = null;
    this.currentGalaxy = 'andromeda';
    this.readingProgress = 0;
    this.animationFrameId = null;
    this.starField = [];
    this.quantumParticles = [];
    this.stopwatchInterval = null;
    this.focusModeActive = false;
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'activateGalacticMode') {
        this.activateGalacticReader();
        sendResponse({ success: true });
      } else if (request.action === 'deactivateGalacticMode') {
        this.deactivateGalacticReader();
        sendResponse({ success: true });
      } else if (request.action === 'checkState') {
        sendResponse({ isActive: this.isActive });
      } else if (request.action === 'changeGalaxy') {
        this.changeGalaxy(request.galaxy);
        sendResponse({ success: true });
      } else if (request.action === 'triggerCosmicEvent') {
        this.triggerCosmicEvent(request.event);
        sendResponse({ success: true });
      }
    });
    
    this.checkPersistentMode();
  }
  
  async checkPersistentMode() {
    try {
      const hostname = window.location.hostname;
      const data = await chrome.storage.local.get([`galactic_${hostname}`]);
      if (data[`galactic_${hostname}`]) {
        setTimeout(() => this.activateGalacticReader(), 1000);
      }
    } catch (error) {
      console.log('Could not check persistent mode:', error);
    }
  }
  
  async activateGalacticReader() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.readingStartTime = Date.now();
    
    const hostname = window.location.hostname;
    try {
      await chrome.storage.local.set({ [`galactic_${hostname}`]: true });
    } catch (error) {
      console.log('Could not save persistent state:', error);
    }
    
    this.createInterstellarGalacticReader();
    this.initializeInterstellarBackground();
    this.startAnimationLoop();
    this.setupReadingProgress();
    this.initializeQuantumEffects();
    this.startStopwatch();
  }
  
  async deactivateGalacticReader() {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    const hostname = window.location.hostname;
    try {
      await chrome.storage.local.remove(`galactic_${hostname}`);
    } catch (error) {
      console.log('Could not remove persistent state:', error);
    }
    
    this.removeGalacticReader();
    this.stopAnimationLoop();
    this.stopStopwatch();
  }
  
  createInterstellarGalacticReader() {
    const existing = document.getElementById(this.readerModeId);
    if (existing) existing.remove();
    
    const content = this.extractMainContent();
    
    const readerOverlay = document.createElement('div');
    readerOverlay.id = this.readerModeId;
    readerOverlay.innerHTML = `
      <div class="galactic-universe-interstellar galaxy-${this.currentGalaxy}">
        <!-- Enhanced Interstellar Background System -->
        <div class="interstellar-backdrop">
          <div class="deep-space-void"></div>
          <div class="galaxy-spiral-arms"></div>
          <div class="stellar-nursery"></div>
          <div class="cosmic-radiation"></div>
          <div class="gravitational-waves"></div>
          <div class="quantum-foam"></div>
          <div class="dark-matter-web"></div>
        </div>
        
        <!-- Enhanced Cinematic Black Hole System -->
        <div class="interstellar-black-hole">
          <div class="event-horizon-ring"></div>
          <div class="accretion-disk-main"></div>
          <div class="photon-sphere"></div>
          <div class="ergosphere"></div>
          <div class="relativistic-jets"></div>
        </div>
        
        <!-- Enhanced Floating Celestial Bodies -->
        <div class="celestial-system">
          <div class="stellar-object star-1"></div>
          <div class="stellar-object star-2"></div>
          <div class="stellar-object star-3"></div>
          <div class="stellar-object nebula-1"></div>
          <div class="stellar-object nebula-2"></div>
          <div class="stellar-object planet-1"></div>
          <div class="stellar-object planet-2"></div>
          <div class="stellar-object comet-1"></div>
          <div class="quasar-beam"></div>
        </div>
        
        <!-- Professional Reading Interface -->
        <div class="reading-interface-interstellar">
          <!-- Enhanced Header -->
          <div class="reader-header-pro">
            <div class="galaxy-selector-pro">
              <span class="galaxy-name-pro">${this.getGalaxyName()}</span>
              <div class="galaxy-dots-pro">
                <div class="dot-pro active" data-galaxy="andromeda" title="Andromeda Galaxy">
                  <div class="dot-glow"></div>
                </div>
                <div class="dot-pro" data-galaxy="milkyway" title="Milky Way Galaxy">
                  <div class="dot-glow"></div>
                </div>
                <div class="dot-pro" data-galaxy="whirlpool" title="Whirlpool Galaxy">
                  <div class="dot-glow"></div>
                </div>
                <div class="dot-pro" data-galaxy="sombrero" title="Sombrero Galaxy">
                  <div class="dot-glow"></div>
                </div>
                <div class="dot-pro" data-galaxy="pinwheel" title="Pinwheel Galaxy">
                  <div class="dot-glow"></div>
                </div>
              </div>
            </div>
            
            <div class="progress-system">
              <div class="progress-track-pro">
                <div class="progress-fill-pro"></div>
                <div class="progress-glow"></div>
                <div class="progress-particles"></div>
              </div>
              <span class="progress-text-pro">0%</span>
            </div>
            
            <div class="reader-controls-pro">
              <div class="stopwatch-display" id="stopwatch" title="Reading Time">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
                  <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                </svg>
                <span id="stopwatchTime">00:00</span>
              </div>
              <button class="control-btn-pro focus-btn" id="focusMode" title="Quantum Focus Mode">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                </svg>
              </button>
              <button class="control-btn-pro exit-btn" id="exitReader" title="Exit Reader Mode">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Immersive Reading Content -->
          <div class="reader-scroll-interstellar" id="readerScroll">
            <article class="reader-content-interstellar">
              ${content}
            </article>
          </div>
        </div>
        
        <!-- Enhanced Cosmic Events -->
        <div class="cosmic-events-interstellar"></div>
        <div class="quantum-particles-container"></div>
      </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      #${this.readerModeId} {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        animation: interstellar-entrance 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        overflow: hidden;
      }
      
      @keyframes interstellar-entrance {
        0% { 
          opacity: 0; 
          transform: scale(0.8) perspective(1000px) rotateX(10deg);
          filter: blur(20px);
        }
        50% {
          opacity: 0.7;
          transform: scale(0.95) perspective(1000px) rotateX(5deg);
          filter: blur(10px);
        }
        100% { 
          opacity: 1; 
          transform: scale(1) perspective(1000px) rotateX(0deg);
          filter: blur(0);
        }
      }
      
      .galactic-universe-interstellar {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      /* Enhanced Interstellar Background System */
      .interstellar-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        transition: opacity 0.6s ease;
      }
      
      .deep-space-void {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(ellipse at 30% 20%, rgba(0, 0, 0, 1) 0%, rgba(5, 5, 15, 0.9) 40%, rgba(10, 10, 20, 0.8) 100%),
          radial-gradient(ellipse at 70% 80%, rgba(0, 0, 0, 1) 0%, rgba(8, 5, 20, 0.9) 50%, rgba(15, 10, 25, 0.7) 100%);
        animation: void-pulse 25s ease-in-out infinite alternate;
      }
      
      @keyframes void-pulse {
        0% { transform: scale(1) rotate(0deg); opacity: 0.9; }
        100% { transform: scale(1.03) rotate(1deg); opacity: 1; }
      }
      
      .galaxy-spiral-arms {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          conic-gradient(from 0deg at 80% 20%, 
            transparent 0deg, 
            rgba(255, 140, 0, 0.08) 60deg, 
            rgba(255, 100, 0, 0.12) 120deg, 
            rgba(200, 80, 20, 0.06) 180deg, 
            transparent 240deg),
          conic-gradient(from 180deg at 20% 80%, 
            transparent 0deg, 
            rgba(100, 50, 200, 0.06) 45deg, 
            rgba(138, 43, 226, 0.1) 90deg, 
            rgba(75, 25, 150, 0.04) 135deg, 
            transparent 180deg);
        animation: spiral-rotation 60s linear infinite;
        opacity: 0.7;
      }
      
      @keyframes spiral-rotation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .stellar-nursery {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(ellipse 800px 300px at 10% 30%, rgba(100, 50, 200, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 600px 400px at 90% 70%, rgba(50, 150, 200, 0.12) 0%, transparent 60%),
          radial-gradient(ellipse 400px 600px at 50% 90%, rgba(200, 100, 50, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse 500px 200px at 70% 20%, rgba(255, 100, 150, 0.06) 0%, transparent 40%);
        animation: stellar-flow 35s ease-in-out infinite alternate;
      }
      
      @keyframes stellar-flow {
        0% { 
          transform: translateX(-30px) translateY(-20px) rotate(-1deg);
          opacity: 0.8;
        }
        100% { 
          transform: translateX(30px) translateY(20px) rotate(1deg);
          opacity: 1;
        }
      }
      
      .cosmic-radiation {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image:
          radial-gradient(1px 1px at 25px 35px, rgba(255,255,255,0.9) 100%, transparent 0),
          radial-gradient(1px 1px at 85px 75px, rgba(255,255,255,0.7) 100%, transparent 0),
          radial-gradient(1px 1px at 145px 45px, rgba(255,255,255,0.8) 100%, transparent 0),
          radial-gradient(1px 1px at 195px 85px, rgba(255,255,255,0.6) 100%, transparent 0),
          radial-gradient(0.5px 0.5px at 65px 125px, rgba(200,200,255,0.8) 100%, transparent 0),
          radial-gradient(0.5px 0.5px at 165px 15px, rgba(255,200,200,0.7) 100%, transparent 0);
        background-repeat: repeat;
        background-size: 220px 140px;
        animation: radiation-drift 60s linear infinite;
        opacity: 0.5;
      }
      
      @keyframes radiation-drift {
        0% { transform: translateX(0) translateY(0); }
        100% { transform: translateX(-220px) translateY(-140px); }
      }
      
      .gravitational-waves {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.025) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(200, 150, 255, 0.02) 0%, transparent 60%);
        animation: gravitational-ripple 20s ease-in-out infinite;
      }
      
      @keyframes gravitational-ripple {
        0%, 100% { 
          transform: scale(1);
          opacity: 0.4;
        }
        50% { 
          transform: scale(1.05);
          opacity: 0.7;
        }
      }
      
      .quantum-foam {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(1px 1px at 15% 25%, rgba(150, 255, 150, 0.3) 0%, transparent 50%),
          radial-gradient(1px 1px at 85% 75%, rgba(255, 150, 255, 0.3) 0%, transparent 50%),
          radial-gradient(1px 1px at 45% 85%, rgba(150, 150, 255, 0.3) 0%, transparent 50%);
        animation: quantum-fluctuation 8s ease-in-out infinite;
        opacity: 0.2;
      }
      
      @keyframes quantum-fluctuation {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(1.02); }
      }
      
      .dark-matter-web {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          linear-gradient(45deg, transparent 48%, rgba(80, 80, 120, 0.1) 49%, rgba(80, 80, 120, 0.1) 51%, transparent 52%),
          linear-gradient(-45deg, transparent 48%, rgba(120, 80, 80, 0.1) 49%, rgba(120, 80, 80, 0.1) 51%, transparent 52%);
        background-size: 200px 200px;
        animation: web-drift 45s linear infinite;
        opacity: 0.3;
      }
      
      @keyframes web-drift {
        0% { transform: translateX(0) translateY(0); }
        100% { transform: translateX(-200px) translateY(-200px); }
      }
      
      /* Enhanced Cinematic Black Hole System */
      .interstellar-black-hole {
        position: absolute;
        top: 15%;
        right: 8%;
        width: 250px;
        height: 250px;
        opacity: 0.4;
        animation: black-hole-system-rotation 120s linear infinite;
      }
      
      @keyframes black-hole-system-rotation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .event-horizon-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 70px;
        height: 70px;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, transparent 30%, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0.8) 50%, transparent 55%);
        border-radius: 50%;
        box-shadow: 
          inset 0 0 40px rgba(0, 0, 0, 1),
          0 0 60px rgba(255, 140, 0, 0.3);
      }
      
      .accretion-disk-main {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200px;
        height: 200px;
        transform: translate(-50%, -50%);
        background: 
          conic-gradient(from 0deg, 
            transparent 0deg, 
            rgba(255, 140, 0, 0.4) 45deg, 
            rgba(255, 100, 0, 0.5) 90deg, 
            rgba(200, 80, 20, 0.3) 135deg, 
            rgba(150, 60, 0, 0.15) 180deg, 
            rgba(100, 40, 0, 0.08) 225deg, 
            rgba(80, 30, 0, 0.04) 270deg, 
            transparent 315deg);
        border-radius: 50%;
        animation: accretion-main-spin 15s linear infinite;
        mask: radial-gradient(circle, transparent 35%, white 40%, white 80%, transparent 85%);
        -webkit-mask: radial-gradient(circle, transparent 35%, white 40%, white 80%, transparent 85%);
      }
      
      @keyframes accretion-main-spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      
      .photon-sphere {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 140px;
        height: 140px;
        transform: translate(-50%, -50%);
        border: 2px solid rgba(255, 255, 255, 0.15);
        border-radius: 50%;
        animation: photon-orbit 8s linear infinite;
      }
      
      @keyframes photon-orbit {
        0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
        50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.05); }
        100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
      }
      
      .relativistic-jets {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4px;
        height: 300px;
        transform: translate(-50%, -50%);
        background: linear-gradient(0deg, 
          transparent 0%, 
          rgba(100, 150, 255, 0.3) 20%, 
          rgba(150, 200, 255, 0.5) 50%, 
          rgba(100, 150, 255, 0.3) 80%, 
          transparent 100%);
        animation: jet-pulse 4s ease-in-out infinite;
      }
      
      @keyframes jet-pulse {
        0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scaleY(1); }
        50% { opacity: 0.7; transform: translate(-50%, -50%) scaleY(1.2); }
      }
      
      /* Enhanced Floating Celestial Bodies */
      .celestial-system {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      
      .stellar-object {
        position: absolute;
        border-radius: 50%;
        opacity: 0.7;
      }
      
      .star-1 {
        top: 20%;
        left: 15%;
        width: 10px;
        height: 10px;
        background: radial-gradient(circle, #ffffff 0%, rgba(255, 255, 255, 0.9) 40%, transparent 100%);
        animation: stellar-twinkle 4s ease-in-out infinite, stellar-drift-1 30s ease-in-out infinite alternate;
        box-shadow: 0 0 25px rgba(255, 255, 255, 0.5);
      }
      
      .star-2 {
        top: 70%;
        left: 85%;
        width: 8px;
        height: 8px;
        background: radial-gradient(circle, #ffeb3b 0%, rgba(255, 235, 59, 0.9) 40%, transparent 100%);
        animation: stellar-twinkle 6s ease-in-out infinite, stellar-drift-2 25s ease-in-out infinite alternate;
        box-shadow: 0 0 20px rgba(255, 235, 59, 0.5);
      }
      
      .star-3 {
        top: 40%;
        left: 90%;
        width: 6px;
        height: 6px;
        background: radial-gradient(circle, #ff6b6b 0%, rgba(255, 107, 107, 0.9) 40%, transparent 100%);
        animation: stellar-twinkle 5s ease-in-out infinite, stellar-drift-3 35s ease-in-out infinite alternate;
        box-shadow: 0 0 18px rgba(255, 107, 107, 0.5);
      }
      
      .nebula-1 {
        top: 40%;
        left: 5%;
        width: 50px;
        height: 50px;
        background: radial-gradient(ellipse, rgba(138, 43, 226, 0.4) 0%, rgba(138, 43, 226, 0.15) 60%, transparent 100%);
        animation: nebula-pulse 12s ease-in-out infinite, nebula-drift 40s ease-in-out infinite alternate;
        filter: blur(2px);
      }
      
      .nebula-2 {
        top: 80%;
        left: 10%;
        width: 60px;
        height: 40px;
        background: radial-gradient(ellipse, rgba(50, 150, 200, 0.3) 0%, rgba(50, 150, 200, 0.1) 60%, transparent 100%);
        animation: nebula-pulse 15s ease-in-out infinite, nebula-drift-2 45s ease-in-out infinite alternate;
        filter: blur(3px);
      }
      
      .planet-1 {
        top: 60%;
        left: 20%;
        width: 14px;
        height: 14px;
        background: linear-gradient(45deg, #4fc3f7, #29b6f6);
        animation: planetary-orbit 45s linear infinite;
        box-shadow: 0 0 12px rgba(79, 195, 247, 0.4);
      }
      
      .planet-2 {
        top: 80%;
        left: 70%;
        width: 12px;
        height: 12px;
        background: linear-gradient(45deg, #ff8a65, #ff7043);
        animation: planetary-orbit 60s linear infinite reverse;
        box-shadow: 0 0 10px rgba(255, 138, 101, 0.4);
      }
      
      .comet-1 {
        top: 30%;
        left: 70%;
        width: 6px;
        height: 6px;
        background: radial-gradient(circle, #ffffff, #e3f2fd);
        animation: comet-trail 25s linear infinite;
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
      }
      
      .quasar-beam {
        position: absolute;
        top: 10%;
        left: 80%;
        width: 2px;
        height: 100px;
        background: linear-gradient(0deg, transparent, rgba(100, 255, 255, 0.6), transparent);
        animation: quasar-pulse 8s ease-in-out infinite;
        filter: blur(1px);
      }
      
      @keyframes stellar-twinkle {
        0%, 100% { opacity: 0.7; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.4); }
      }
      
      @keyframes stellar-drift-1 {
        0% { transform: translateX(0) translateY(0); }
        100% { transform: translateX(25px) translateY(-15px); }
      }
      
      @keyframes stellar-drift-2 {
        0% { transform: translateX(0) translateY(0); }
        100% { transform: translateX(-20px) translateY(20px); }
      }
      
      @keyframes stellar-drift-3 {
        0% { transform: translateX(0) translateY(0); }
        100% { transform: translateX(-10px) translateY(-25px); }
      }
      
      @keyframes nebula-pulse {
        0%, 100% { opacity: 0.7; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.3); }
      }
      
      @keyframes nebula-drift {
        0% { transform: translateX(0) translateY(0) rotate(0deg); }
        100% { transform: translateX(35px) translateY(-25px) rotate(15deg); }
      }
      
      @keyframes nebula-drift-2 {
        0% { transform: translateX(0) translateY(0) rotate(0deg); }
        100% { transform: translateX(-25px) translateY(15px) rotate(-10deg); }
      }
      
      @keyframes planetary-orbit {
        0% { transform: translateX(0) translateY(0) rotate(0deg); }
        25% { transform: translateX(35px) translateY(-20px) rotate(90deg); }
        50% { transform: translateX(0) translateY(-40px) rotate(180deg); }
        75% { transform: translateX(-35px) translateY(-20px) rotate(270deg); }
        100% { transform: translateX(0) translateY(0) rotate(360deg); }
      }
      
      @keyframes comet-trail {
        0% { 
          transform: translateX(100px) translateY(-50px) rotate(45deg); 
          opacity: 0; 
        }
        10% { opacity: 1; }
        90% { opacity: 0.8; }
        100% { 
          transform: translateX(-400px) translateY(300px) rotate(45deg); 
          opacity: 0; 
        }
      }
      
      @keyframes quasar-pulse {
        0%, 100% { opacity: 0.3; transform: scaleY(1); }
        50% { opacity: 0.8; transform: scaleY(1.5); }
      }
      
      /* Professional Reading Interface */
      .reading-interface-interstellar {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 10;
      }
      
      .reader-header-pro {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        height: 70px;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(30px);
        border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 40px;
        z-index: 20;
        animation: header-slide-in 1s ease-out 0.5s both;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }
      
      @keyframes header-slide-in {
        0% { transform: translateY(-100%); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      .galaxy-selector-pro {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      
      .galaxy-name-pro {
        font-size: 16px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.95);
        letter-spacing: 1px;
        text-transform: uppercase;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
      }
      
      .galaxy-dots-pro {
        display: flex;
        gap: 12px;
      }
      
      .dot-pro {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
        overflow: hidden;
      }
      
      .dot-glow {
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: inherit;
        border-radius: 50%;
        filter: blur(4px);
        opacity: 0;
        transition: opacity 0.4s ease;
      }
      
      .dot-pro:hover {
        background: rgba(255, 255, 255, 0.7);
        transform: scale(1.4);
      }
      
      .dot-pro:hover .dot-glow {
        opacity: 0.8;
      }
      
      .dot-pro.active {
        transform: scale(1.3);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.7);
      }
      
      .dot-pro.active .dot-glow {
        opacity: 1;
      }
      
      .progress-system {
        display: flex;
        align-items: center;
        gap: 18px;
        flex: 1;
        max-width: 300px;
        margin: 0 40px;
      }
      
      .progress-track-pro {
        flex: 1;
        height: 10px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
        overflow: hidden;
        position: relative;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
      }
      
      .progress-fill-pro {
        height: 100%;
        width: 0%;
        border-radius: 5px;
        transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
        overflow: hidden;
      }
      
      .progress-glow {
        position: absolute;
        top: 0;
        right: 0;
        width: 25px;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5));
        animation: progress-shimmer 2s ease-in-out infinite;
      }
      
      .progress-particles {
        position: absolute;
        top: 50%;
        right: 0;
        width: 6px;
        height: 6px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        transform: translateY(-50%);
        animation: particle-flow 1s ease-in-out infinite;
      }
      
      @keyframes progress-shimmer {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
      }
      
      @keyframes particle-flow {
        0%, 100% { opacity: 0.5; transform: translateY(-50%) scale(1); }
        50% { opacity: 1; transform: translateY(-50%) scale(1.3); }
      }
      
      .progress-text-pro {
        font-size: 14px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.9);
        min-width: 45px;
        text-align: right;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
      }
      
      .reader-controls-pro {
        display: flex;
        align-items: center;
        gap: 18px;
      }
      
      .stopwatch-display {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.08);
        border: 2px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-weight: 600;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      }
      
      .control-btn-pro {
        width: 44px;
        height: 44px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        color: rgba(255, 255, 255, 0.8);
        position: relative;
        overflow: hidden;
      }
      
      .control-btn-pro::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s;
      }
      
      .control-btn-pro:hover::before {
        left: 100%;
      }
      
      .control-btn-pro:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.4);
        color: rgba(255, 255, 255, 1);
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      }
      
      .control-btn-pro.active {
        background: rgba(138, 43, 226, 0.4);
        border-color: rgba(138, 43, 226, 0.8);
        color: #ffffff;
        box-shadow: 0 0 25px rgba(138, 43, 226, 0.5);
      }
      
      .focus-btn.active {
        background: rgba(0, 191, 255, 0.4);
        border-color: rgba(0, 191, 255, 0.8);
        box-shadow: 0 0 25px rgba(0, 191, 255, 0.5);
      }
      
      .exit-btn:hover {
        background: rgba(255, 59, 48, 0.3) !important;
        border-color: rgba(255, 59, 48, 0.6) !important;
        box-shadow: 0 0 20px rgba(255, 59, 48, 0.4) !important;
      }
      
      /* Immersive Reading Content */
      .reader-scroll-interstellar {
        height: calc(100vh - 70px);
        overflow-y: auto;
        scroll-behavior: smooth;
        animation: content-fade-in 1.5s ease-out 1s both;
      }
      
      @keyframes content-fade-in {
        0% { opacity: 0; transform: translateY(40px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      .reader-scroll-interstellar::-webkit-scrollbar {
        width: 12px;
      }
      
      .reader-scroll-interstellar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
      }
      
      .reader-scroll-interstellar::-webkit-scrollbar-thumb {
        border-radius: 6px;
        transition: background 0.3s ease;
      }
      
      .reader-scroll-interstellar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.4);
      }
      
      .reader-content-interstellar {
        max-width: 900px;
        margin: 0 auto;
        padding: 90px 70px 180px;
        color: #e8f4fd;
        font-family: 'Georgia', 'Times New Roman', serif;
        font-size: 20px;
        line-height: 1.8;
        font-weight: 400;
        position: relative;
        transition: filter 0.6s ease, text-shadow 0.6s ease;
      }
      
      .reader-content-interstellar::selection {
        background: rgba(138, 43, 226, 0.5);
        color: #ffffff;
      }
      
      .reader-content-interstellar h1 {
        font-size: 3em;
        font-weight: 800;
        line-height: 1.2;
        margin: 0 0 2.5em 0;
        color: #ffffff;
        text-align: center;
        position: relative;
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
      }
      
      .reader-content-interstellar h1::after {
        content: '';
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        width: 140px;
        height: 4px;
        border-radius: 2px;
      }
      
      .reader-content-interstellar h2 {
        font-size: 2.2em;
        font-weight: 700;
        line-height: 1.3;
        margin: 3.5em 0 1.5em 0;
        color: #b8d4f0;
        position: relative;
        padding-left: 30px;
      }
      
      .reader-content-interstellar h2::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.3em;
        width: 6px;
        height: 1.6em;
        border-radius: 3px;
      }
      
      .reader-content-interstellar h3 {
        font-size: 1.8em;
        font-weight: 600;
        line-height: 1.4;
        margin: 3em 0 1.2em 0;
        color: #94a3b8;
      }
      
      .reader-content-interstellar p {
        margin: 2em 0;
        color: #cbd5e1;
        text-align: justify;
        hyphens: auto;
      }
      
      .reader-content-interstellar p:first-of-type {
        font-size: 1.2em;
        color: #e2e8f0;
        font-weight: 500;
        line-height: 1.7;
      }
      
      .reader-content-interstellar a {
        color: #60a5fa;
        text-decoration: none;
        border-bottom: 2px solid rgba(96, 165, 250, 0.4);
        transition: all 0.3s ease;
      }
      
      .reader-content-interstellar a:hover {
        color: #93c5fd;
        border-bottom-color: #93c5fd;
        text-shadow: 0 0 10px rgba(147, 197, 253, 0.5);
      }
      
      .reader-content-interstellar img {
        max-width: 100%;
        height: auto;
        border-radius: 18px;
        margin: 3.5em 0;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
        border: 3px solid rgba(255, 255, 255, 0.1);
      }
      
      .reader-content-interstellar blockquote {
        margin: 3.5em 0;
        padding: 2.5em 3em;
        background: rgba(30, 41, 59, 0.5);
        border-left: 6px solid;
        border-radius: 0 15px 15px 0;
        font-style: italic;
        color: #94a3b8;
        position: relative;
        backdrop-filter: blur(15px);
      }
      
      .reader-content-interstellar blockquote::before {
        content: '"';
        position: absolute;
        top: -20px;
        left: 25px;
        font-size: 5em;
        font-family: Georgia, serif;
        opacity: 0.4;
      }
      
      .reader-content-interstellar code {
        background: rgba(15, 23, 42, 0.9);
        color: #a78bfa;
        padding: 0.4em 0.6em;
        border-radius: 8px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
        font-size: 0.9em;
        border: 1px solid rgba(167, 139, 250, 0.3);
      }
      
      .reader-content-interstellar pre {
        background: rgba(15, 23, 42, 0.95);
        padding: 2.5em;
        border-radius: 15px;
        overflow-x: auto;
        margin: 3.5em 0;
        border: 2px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(15px);
      }
      
      .reader-content-interstellar pre code {
        background: none;
        border: none;
        color: #e2e8f0;
        padding: 0;
      }
      
      /* Enhanced Galaxy Themes with Full Page Theming */
      .galaxy-andromeda {
        background: 
          radial-gradient(ellipse at 30% 20%, rgba(138, 43, 226, 0.25) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(255, 20, 147, 0.2) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 50%, rgba(186, 85, 211, 0.15) 0%, transparent 70%),
          linear-gradient(135deg, #0a0a0f 0%, #1a0f2e 30%, #2a1540 50%, #1a0f2e 70%, #0a0a0f 100%);
      }
      
      .galaxy-andromeda .progress-fill-pro {
        background: linear-gradient(90deg, #8a2be2, #ff1493, #da70d6, #ba55d3);
        box-shadow: 0 0 15px rgba(138, 43, 226, 0.5);
      }
      
      .galaxy-andromeda .reader-content-interstellar h1::after {
        background: linear-gradient(90deg, #8a2be2, #ff1493);
        box-shadow: 0 0 20px rgba(138, 43, 226, 0.6);
      }
      
      .galaxy-andromeda .reader-content-interstellar h2::before {
        background: linear-gradient(180deg, #8a2be2, #ff1493);
      }
      
      .galaxy-andromeda .reader-content-interstellar blockquote {
        border-left-color: #8a2be2;
        background: rgba(138, 43, 226, 0.1);
      }
      
      .galaxy-andromeda .reader-content-interstellar blockquote::before {
        color: rgba(138, 43, 226, 0.4);
      }
      
      .galaxy-andromeda .reader-scroll-interstellar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #8a2be2, #ff1493);
      }
      
      .galaxy-andromeda .dot-pro.active {
        background: linear-gradient(45deg, #8a2be2, #ff1493);
      }
      
      .galaxy-milkyway {
        background: 
          radial-gradient(ellipse at 25% 30%, rgba(255, 215, 0, 0.2) 0%, transparent 60%),
          radial-gradient(ellipse at 75% 70%, rgba(255, 140, 0, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(255, 165, 0, 0.12) 0%, transparent 70%),
          linear-gradient(135deg, #0a0a0f 0%, #2a1f0f 30%, #3a2f1f 50%, #2a1f0f 70%, #0a0a0f 100%);
      }
      
      .galaxy-milkyway .progress-fill-pro {
        background: linear-gradient(90deg, #ffd700, #ffb347, #ff8c00, #daa520);
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
      }
      
      .galaxy-milkyway .reader-content-interstellar h1::after {
        background: linear-gradient(90deg, #ffd700, #ff8c00);
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
      }
      
      .galaxy-milkyway .reader-content-interstellar h2::before {
        background: linear-gradient(180deg, #ffd700, #ff8c00);
      }
      
      .galaxy-milkyway .reader-content-interstellar blockquote {
        border-left-color: #ffd700;
        background: rgba(255, 215, 0, 0.08);
      }
      
      .galaxy-milkyway .reader-content-interstellar blockquote::before {
        color: rgba(255, 215, 0, 0.4);
      }
      
      .galaxy-milkyway .reader-scroll-interstellar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #ffd700, #ff8c00);
      }
      
      .galaxy-milkyway .dot-pro.active {
        background: linear-gradient(45deg, #ffd700, #ff8c00);
      }
      
      .galaxy-whirlpool {
        background: 
          radial-gradient(ellipse at 20% 70%, rgba(0, 191, 255, 0.2) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 30%, rgba(64, 224, 208, 0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(0, 206, 209, 0.15) 0%, transparent 70%),
          linear-gradient(135deg, #0a0a0f 0%, #0f1f2a 30%, #1f2f3a 50%, #0f1f2a 70%, #0a0a0f 100%);
      }
      
      .galaxy-whirlpool .progress-fill-pro {
        background: linear-gradient(90deg, #00bfff, #40e0d0, #00ced1, #5f9ea0);
        box-shadow: 0 0 15px rgba(0, 191, 255, 0.5);
      }
      
      .galaxy-whirlpool .reader-content-interstellar h1::after {
        background: linear-gradient(90deg, #00bfff, #40e0d0);
        box-shadow: 0 0 20px rgba(0, 191, 255, 0.6);
      }
      
      .galaxy-whirlpool .reader-content-interstellar h2::before {
        background: linear-gradient(180deg, #00bfff, #40e0d0);
      }
      
      .galaxy-whirlpool .reader-content-interstellar blockquote {
        border-left-color: #00bfff;
        background: rgba(0, 191, 255, 0.08);
      }
      
      .galaxy-whirlpool .reader-content-interstellar blockquote::before {
        color: rgba(0, 191, 255, 0.4);
      }
      
      .galaxy-whirlpool .reader-scroll-interstellar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #00bfff, #40e0d0);
      }
      
      .galaxy-whirlpool .dot-pro.active {
        background: linear-gradient(45deg, #00bfff, #40e0d0);
      }
      
      .galaxy-sombrero {
        background: 
          radial-gradient(ellipse at 30% 40%, rgba(255, 107, 71, 0.2) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 60%, rgba(255, 142, 60, 0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(255, 165, 0, 0.15) 0%, transparent 70%),
          linear-gradient(135deg, #0a0a0f 0%, #2a1510 30%, #3a2520 50%, #2a1510 70%, #0a0a0f 100%);
      }
      
      .galaxy-sombrero .progress-fill-pro {
        background: linear-gradient(90deg, #ff6b47, #ff8e3c, #ffa500, #cd853f);
        box-shadow: 0 0 15px rgba(255, 107, 71, 0.5);
      }
      
      .galaxy-sombrero .reader-content-interstellar h1::after {
        background: linear-gradient(90deg, #ff6b47, #ffa500);
        box-shadow: 0 0 20px rgba(255, 107, 71, 0.6);
      }
      
      .galaxy-sombrero .reader-content-interstellar h2::before {
        background: linear-gradient(180deg, #ff6b47, #ffa500);
      }
      
      .galaxy-sombrero .reader-content-interstellar blockquote {
        border-left-color: #ff6b47;
        background: rgba(255, 107, 71, 0.08);
      }
      
      .galaxy-sombrero .reader-content-interstellar blockquote::before {
        color: rgba(255, 107, 71, 0.4);
      }
      
      .galaxy-sombrero .reader-scroll-interstellar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #ff6b47, #ffa500);
      }
      
      .galaxy-sombrero .dot-pro.active {
        background: linear-gradient(45deg, #ff6b47, #ffa500);
      }
      
      .galaxy-pinwheel {
        background: 
          radial-gradient(ellipse at 25% 25%, rgba(50, 205, 50, 0.2) 0%, transparent 60%),
          radial-gradient(ellipse at 75% 75%, rgba(0, 255, 127, 0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(152, 251, 152, 0.15) 0%, transparent 70%),
          linear-gradient(135deg, #0a0a0f 0%, #0f2a15 30%, #1f3a25 50%, #0f2a15 70%, #0a0a0f 100%);
      }
      
      .galaxy-pinwheel .progress-fill-pro {
        background: linear-gradient(90deg, #32cd32, #00ff7f, #98fb98, #90ee90);
        box-shadow: 0 0 15px rgba(50, 205, 50, 0.5);
      }
      
      .galaxy-pinwheel .reader-content-interstellar h1::after {
        background: linear-gradient(90deg, #32cd32, #00ff7f);
        box-shadow: 0 0 20px rgba(50, 205, 50, 0.6);
      }
      
      .galaxy-pinwheel .reader-content-interstellar h2::before {
        background: linear-gradient(180deg, #32cd32, #00ff7f);
      }
      
      .galaxy-pinwheel .reader-content-interstellar blockquote {
        border-left-color: #32cd32;
        background: rgba(50, 205, 50, 0.08);
      }
      
      .galaxy-pinwheel .reader-content-interstellar blockquote::before {
        color: rgba(50, 205, 50, 0.4);
      }
      
      .galaxy-pinwheel .reader-scroll-interstellar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #32cd32, #00ff7f);
      }
      
      .galaxy-pinwheel .dot-pro.active {
        background: linear-gradient(45deg, #32cd32, #00ff7f);
      }
      
      /* Focus Mode - Fixed to only affect backdrop opacity */
      .focus-mode-active .interstellar-backdrop {
        opacity: 0.3;
      }
      
      .focus-mode-active .reader-content-interstellar {
        filter: contrast(1.15) brightness(1.05);
        text-shadow: 0 0 6px rgba(255, 255, 255, 0.15);
      }
      
      .focus-mode-active .celestial-system {
        opacity: 0.4;
      }
      
      .focus-mode-active .interstellar-black-hole {
        opacity: 0.2;
      }
      
      .quantum-particles-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 5;
      }
      
      .quantum-particle {
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(100, 200, 255, 0.8);
        border-radius: 50%;
        animation: quantum-drift 10s linear infinite;
      }
      
      @keyframes quantum-drift {
        0% { 
          transform: translateX(0) translateY(0) scale(1);
          opacity: 0;
        }
        10% { opacity: 1; }
        90% { opacity: 0.8; }
        100% { 
          transform: translateX(-100px) translateY(-200px) scale(0.5);
          opacity: 0;
        }
      }
      
      /* Responsive Design */
      @media (max-width: 768px) {
        .reader-header-pro {
          padding: 0 25px;
          height: 65px;
        }
        
        .galaxy-name-pro {
          font-size: 14px;
        }
        
        .progress-system {
          max-width: 200px;
          margin: 0 20px;
        }
        
                .stopwatch-display {
          font-size: 12px;
          padding: 6px 10px;
        }
        
        .reader-content-interstellar {
          padding: 70px 40px 140px;
          font-size: 18px;
        }
        
        .reader-content-interstellar h1 {
          font-size: 2.4em;
        }
        
        .reader-content-interstellar h2 {
          font-size: 1.9em;
        }
        
        .interstellar-black-hole {
          width: 180px;
          height: 180px;
          opacity: 0.25;
        }
        
        .control-btn-pro {
          width: 40px;
          height: 40px;
        }
        
        .reader-controls-pro {
          gap: 12px;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(readerOverlay);
    document.body.style.overflow = 'hidden';
    
    this.setupInteractiveElements();
  }
  
  setupInteractiveElements() {
    document.querySelectorAll('.dot-pro').forEach(dot => {
      dot.addEventListener('click', (e) => {
        document.querySelectorAll('.dot-pro').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.changeGalaxy(dot.dataset.galaxy);
        this.triggerGalaxyTransition();
      });
    });
    
    const focusBtn = document.getElementById('focusMode');
    if (focusBtn) {
      focusBtn.addEventListener('click', () => {
        this.toggleFocusMode();
      });
    }
    
    const exitBtn = document.getElementById('exitReader');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        this.deactivateGalacticReader();
      });
    }
  }
  
  setupReadingProgress() {
    const scrollContainer = document.querySelector('.reader-scroll-interstellar');
    const progressFill = document.querySelector('.progress-fill-pro');
    const progressText = document.querySelector('.progress-text-pro');
    
    if (!scrollContainer || !progressFill || !progressText) return;
    
    const updateProgress = () => {
      const scrollTop = scrollContainer.scrollTop;
      const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const progress = Math.min((scrollTop / scrollHeight) * 100, 100);
      
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${Math.round(progress)}%`;
      
      this.readingProgress = progress;
      
      if (progress >= 25 && progress < 26) {
        this.triggerMilestoneEffect(25);
      } else if (progress >= 50 && progress < 51) {
        this.triggerMilestoneEffect(50);
      } else if (progress >= 75 && progress < 76) {
        this.triggerMilestoneEffect(75);
      } else if (progress >= 100) {
        this.triggerMilestoneEffect(100);
      }
    };
    
    scrollContainer.addEventListener('scroll', updateProgress);
    setTimeout(updateProgress, 100);
  }
  
  triggerMilestoneEffect(milestone) {
    const progressTrack = document.querySelector('.progress-track-pro');
    if (!progressTrack) return;
    
    const effect = document.createElement('div');
    effect.style.cssText = `
      position: absolute;
      top: -5px;
      left: ${milestone}%;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent);
      border-radius: 50%;
      animation: milestone-burst 1s ease-out forwards;
      pointer-events: none;
      z-index: 10;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes milestone-burst {
        0% { transform: scale(0); opacity: 1; }
        50% { transform: scale(2); opacity: 0.8; }
        100% { transform: scale(4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    progressTrack.appendChild(effect);
    
    setTimeout(() => {
      effect.remove();
      style.remove();
    }, 1000);
    
    if (milestone === 100) {
      this.triggerCosmicEvent('celebration');
    }
  }
  
  changeGalaxy(galaxy) {
    this.currentGalaxy = galaxy;
    const universe = document.querySelector('.galactic-universe-interstellar');
    const galaxyName = document.querySelector('.galaxy-name-pro');
    
    if (universe) {
      universe.className = `galactic-universe-interstellar galaxy-${galaxy}`;
    }
    
    if (galaxyName) {
      galaxyName.textContent = this.getGalaxyName(galaxy);
    }
  }
  
  triggerGalaxyTransition() {
    const universe = document.querySelector('.galactic-universe-interstellar');
    if (!universe) return;
    
    universe.style.transform = 'scale(1.05)';
    universe.style.filter = 'brightness(1.2)';
    
    setTimeout(() => {
      universe.style.transform = 'scale(1)';
      universe.style.filter = 'brightness(1)';
    }, 500);
  }
  
  getGalaxyName(galaxy = this.currentGalaxy) {
    const names = {
      andromeda: 'Andromeda',
      milkyway: 'Milky Way', 
      whirlpool: 'Whirlpool',
      sombrero: 'Sombrero',
      pinwheel: 'Pinwheel'
    };
    return names[galaxy] || 'Andromeda';
  }
  
  toggleFocusMode() {
    const btn = document.getElementById('focusMode');
    const universe = document.querySelector('.galactic-universe-interstellar');
    
    this.focusModeActive = !this.focusModeActive;
    
    if (this.focusModeActive) {
      btn.classList.add('active');
      universe.classList.add('focus-mode-active');
      this.createQuantumFocusField();
    } else {
      btn.classList.remove('active');
      universe.classList.remove('focus-mode-active');
    }
  }
  
  createQuantumFocusField() {
    const content = document.querySelector('.reader-content-interstellar');
    if (!content) return;
    
    const field = document.createElement('div');
    field.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 50% 50%, transparent 60%, rgba(0, 191, 255, 0.05) 100%);
      border-radius: 20px;
      animation: focus-pulse 3s ease-in-out infinite;
      pointer-events: none;
      z-index: -1;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes focus-pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.02); }
      }
    `;
    document.head.appendChild(style);
    
    content.appendChild(field);
    
    setTimeout(() => {
      field.remove();
      style.remove();
    }, 6000);
  }

  triggerCosmicEvent(eventType) {
    const container = document.querySelector('.cosmic-events-interstellar');
    if (!container) return;
    
    switch(eventType) {
      case 'supernova':
        this.createCinematicSupernova(container);
        break;
      case 'meteor':
        this.createCinematicMeteor(container);
        break;
      case 'aurora':
        this.createCinematicAurora(container);
        break;
      case 'celebration':
        this.createCelebrationFireworks(container);
        break;
    }
  }
  
  createCinematicSupernova(container) {
    const supernova = document.createElement('div');
    supernova.style.cssText = `
      position: absolute;
      top: ${20 + Math.random() * 30}%;
      right: ${20 + Math.random() * 30}%;
      width: 6px;
      height: 6px;
      background: #ffffff;
      border-radius: 50%;
      animation: cinematic-supernova 4s ease-out forwards;
      pointer-events: none;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cinematic-supernova {
        0% { 
          transform: scale(1); 
          opacity: 1; 
          box-shadow: 0 0 15px #ffffff; 
        }
        20% { 
          transform: scale(8); 
          opacity: 0.95; 
          box-shadow: 0 0 50px #ffffff, 0 0 100px rgba(255,255,255,0.7); 
        }
        40% { 
          transform: scale(25); 
          opacity: 0.8; 
          box-shadow: 0 0 150px #ffffff, 0 0 300px rgba(255,255,255,0.5); 
        }
        100% { 
          transform: scale(60); 
          opacity: 0; 
          box-shadow: 0 0 400px rgba(255,255,255,0.2); 
        }
      }
    `;
    document.head.appendChild(style);
    
    container.appendChild(supernova);
    
    setTimeout(() => {
      supernova.remove();
      style.remove();
    }, 4000);
  }
  
  createCinematicMeteor(container) {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const meteor = document.createElement('div');
        meteor.style.cssText = `
          position: absolute;
          top: ${Math.random() * 40}%;
          left: ${85 + Math.random() * 15}%;
          width: 3px;
          height: ${15 + Math.random() * 25}px;
          background: linear-gradient(180deg, transparent 0%, #ffffff 30%, #ffeb3b 70%, #ff9800 100%);
          animation: cinematic-meteor 3s linear forwards;
          pointer-events: none;
          border-radius: 50%;
        `;
        
        container.appendChild(meteor);
        
        setTimeout(() => meteor.remove(), 3000);
      }, i * 200);
    }
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cinematic-meteor {
        0% { 
          transform: translateX(0) translateY(0) rotate(45deg); 
          opacity: 0; 
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
        }
        15% { opacity: 1; }
        85% { opacity: 0.9; }
        100% { 
          transform: translateX(-500px) translateY(500px) rotate(45deg); 
          opacity: 0; 
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
        }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => style.remove(), 5000);
  }
  
  createCinematicAurora(container) {
    const aurora = document.createElement('div');
    aurora.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 50%;
      background: linear-gradient(180deg, 
        rgba(0, 255, 127, 0.2) 0%, 
        rgba(138, 43, 226, 0.12) 30%,
        rgba(255, 20, 147, 0.08) 60%, 
        transparent 100%);
      animation: cinematic-aurora 15s ease-in-out forwards;
      pointer-events: none;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cinematic-aurora {
        0%, 100% { 
          opacity: 0; 
          transform: translateY(-40px) skewX(-4deg); 
        }
        20% { 
          opacity: 0.7; 
          transform: translateY(-20px) skewX(2deg); 
        }
        40% { 
          opacity: 0.9; 
          transform: translateY(-10px) skewX(-1deg); 
        }
        60% { 
          opacity: 1; 
          transform: translateY(0) skewX(3deg); 
        }
        80% { 
          opacity: 0.8; 
          transform: translateY(-15px) skewX(-2deg); 
        }
      }
    `;
    document.head.appendChild(style);
    
    container.appendChild(aurora);
    
    setTimeout(() => {
      aurora.remove();
      style.remove();
    }, 15000);
  }
  
  createCelebrationFireworks(container) {
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const firework = document.createElement('div');
        firework.style.cssText = `
          position: absolute;
          top: ${60 + Math.random() * 30}%;
          left: ${10 + Math.random() * 80}%;
          width: 4px;
          height: 4px;
          background: ${['#ff1493', '#00bfff', '#32cd32', '#ffd700', '#ff6b47'][Math.floor(Math.random() * 5)]};
          border-radius: 50%;
          animation: celebration-burst 2s ease-out forwards;
          pointer-events: none;
        `;
        
        container.appendChild(firework);
        
        setTimeout(() => firework.remove(), 2000);
      }, i * 150);
    }
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes celebration-burst {
        0% { 
          transform: scale(1); 
          opacity: 1; 
          box-shadow: 0 0 10px currentColor;
        }
        50% { 
          transform: scale(15); 
          opacity: 0.8; 
          box-shadow: 0 0 50px currentColor;
        }
        100% { 
          transform: scale(25); 
          opacity: 0; 
          box-shadow: 0 0 100px currentColor;
        }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => style.remove(), 4000);
  }
  
  startStopwatch() {
    const stopwatchTime = document.getElementById('stopwatchTime');
    if (!stopwatchTime) return;
    
    this.stopwatchInterval = setInterval(() => {
      if (!this.isActive || !this.readingStartTime) return;
      
      const elapsed = Date.now() - this.readingStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      
      stopwatchTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }
  
  stopStopwatch() {
    if (this.stopwatchInterval) {
      clearInterval(this.stopwatchInterval);
      this.stopwatchInterval = null;
    }
  }
  
  initializeInterstellarBackground() {
    this.createInterstellarStars();
    this.startQuantumParticles();
  }
  
  initializeQuantumEffects() {
    this.createQuantumParticles();
  }
  
  createQuantumParticles() {
    const container = document.querySelector('.quantum-particles-container');
    if (!container) return;
    
    setInterval(() => {
      if (!this.isActive) return;
      
      if (Math.random() < 0.3) {
        const particle = document.createElement('div');
        particle.className = 'quantum-particle';
        particle.style.cssText = `
          top: ${Math.random() * 100}%;
          left: ${90 + Math.random() * 10}%;
          background: rgba(${100 + Math.random() * 155}, ${150 + Math.random() * 105}, 255, 0.8);
        `;
        
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 10000);
      }
    }, 2000);
  }
  
  startQuantumParticles() {
    this.createQuantumParticles();
  }
  
  createInterstellarStars() {
    setInterval(() => {
      if (!this.isActive) return;
      
      if (Math.random() < 0.15) {
        const star = document.createElement('div');
        star.style.cssText = `
          position: fixed;
          top: ${Math.random() * 50}%;
          left: ${70 + Math.random() * 30}%;
          width: 1px;
          height: ${15 + Math.random() * 15}px;
          background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.9) 100%);
          animation: interstellar-shooting-star 6s linear forwards;
          pointer-events: none;
          z-index: 5;
        `;
        
        document.body.appendChild(star);
        
        setTimeout(() => star.remove(), 6000);
      }
    }, 4000);
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes interstellar-shooting-star {
        0% { 
          transform: translateX(0) translateY(0) rotate(45deg); 
          opacity: 0; 
        }
        15% { opacity: 1; }
        85% { opacity: 0.9; }
        100% { 
          transform: translateX(-500px) translateY(500px) rotate(45deg); 
          opacity: 0; 
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  startAnimationLoop() {
    const animate = () => {
      if (!this.isActive) return;
      
      this.updateQuantumParticles();
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  updateQuantumParticles() {
    this.quantumParticles.forEach((particle, index) => {
      if (particle.parentNode) {
        const currentLeft = parseFloat(particle.style.left);
        if (currentLeft < -5) {
          particle.remove();
          this.quantumParticles.splice(index, 1);
        }
      }
    });
  }
  
  stopAnimationLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  extractMainContent() {
    const selectors = [
      'article',
      'main',
      '[role="main"]',
      '.post-content',
      '.entry-content',
      '.article-content',
      '.content-area',
      '.main-content',
      '.post-body',
      '.story-body',
      '.article-body',
      '.entry-text',
      '.content',
      '.text'
    ];
    
    let contentElement = null;
    
    for (const selector of selectors) {
      contentElement = document.querySelector(selector);
      if (contentElement && contentElement.innerText.length > 300) {
        break;
      }
    }
    
    if (!contentElement) {
      const candidates = document.querySelectorAll('div, section, p');
      let maxText = 0;
      
      candidates.forEach(candidate => {
        const textLength = candidate.innerText?.length || 0;
        if (textLength > maxText && textLength > 500) {
          maxText = textLength;
          contentElement = candidate;
        }
      });
    }
    
    if (!contentElement || contentElement.innerText.length < 200) {
      return `
        <h1>🌌 Starlapse V2: Enhanced Galactic Reading Experience</h1>
        <p>Welcome to the most advanced cosmic reading mode ever created! Experience literature like never before with our enhanced interstellar environment.</p>
        
        <h2>🚀 V2 Features</h2>
        <p><strong>Reading Stopwatch:</strong> Track your time spent in the cosmic reading environment with a beautiful stopwatch display.</p>
        <p><strong>Quantum Focus:</strong> Enhanced concentration mode that dims distractions while preserving galaxy themes.</p>
        <p><strong>Enhanced Galaxy Themes:</strong> More vibrant and immersive backgrounds for each galaxy with deeper color palettes.</p>
        <p><strong>Reading Milestones:</strong> Celebrate your progress with burst effects at 25%, 50%, 75%, and completion.</p>
        <p><strong>Quantum Particles:</strong> Floating cosmic particles that respond to your reading activity.</p>
        
        <h2>🌌 Galaxy Collection</h2>
        <p><strong>Andromeda Galaxy:</strong> Rich purples and magentas with enhanced spiral arms and stellar nurseries.</p>
        <p><strong>Milky Way:</strong> Golden cosmic dust with warm stellar formations and enhanced accretion disks.</p>
        <p><strong>Whirlpool Galaxy:</strong> Cool blue-teal cosmic streams with dynamic spiral patterns.</p>
        <p><strong>Sombrero Galaxy:</strong> Warm orange-red cosmic fire with enhanced gravitational effects.</p>
        <p><strong>Pinwheel Galaxy:</strong> Fresh green cosmic energy with vibrant stellar formations.</p>
        
        <h2>⚡ Interactive Controls</h2>
        <p><strong>Stopwatch:</strong> Monitor your reading time with a cosmic stopwatch that shows minutes and seconds.</p>
        <p><strong>Quantum Focus:</strong> Click the eye icon for enhanced concentration with reduced background opacity.</p>
        <p><strong>Galaxy Switching:</strong> Click any colored dot to instantly transport to a different galactic environment.</p>
        
        <h2>🎯 Advanced Features</h2>
        <p><strong>Enhanced Black Hole:</strong> More realistic event horizon with relativistic jets and photon sphere.</p>
        <p><strong>Celestial Bodies:</strong> Additional stars, nebulae, planets, and comets with realistic orbital mechanics.</p>
        <p><strong>Dark Matter Web:</strong> Subtle cosmic web structure visible in the background.</p>
        <p><strong>Quantum Foam:</strong> Microscopic space-time fluctuations for ultimate realism.</p>
        <p><strong>Progress Particles:</strong> Your reading progress generates cosmic particle effects.</p>
        
        <h2>🌟 Usage Tips</h2>
        <p>Switch galaxy themes to match your mood or content type. Use Quantum Focus for deep reading sessions while maintaining the beauty of your selected galaxy theme.</p>
        
        <p>This enhanced reader mode preserves the original website structure while adding an immersive cosmic layer that makes every reading session an interstellar journey!</p>
      `;
    }
    
    const clonedContent = contentElement.cloneNode(true);
    
    const unwantedSelectors = [
      'script', 'style', 'nav', 'aside', 'header', 'footer',
      '.ad', '.ads', '.advertisement', '.banner', '.popup',
      '.sidebar', '.navigation', '.menu', '.social', '.share',
      '.comments', '.related', '.recommended', '.widget',
      '[class*="ad-"]', '[id*="ad-"]', '[class*="sidebar"]',
      '.comment', '.reply', '.author-bio', '.tags', '.categories'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = clonedContent.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    const allElements = clonedContent.querySelectorAll('*');
    allElements.forEach(el => {
      el.removeAttribute('onclick');
      el.removeAttribute('onload');
      el.removeAttribute('onerror');
      el.removeAttribute('style');
      
      if (el.className && typeof el.className === 'string') {
        el.className = '';
      }
    });
    
    return clonedContent.innerHTML;
  }
  
  removeGalacticReader() {
    const readerMode = document.getElementById(this.readerModeId);
    if (readerMode) {
      readerMode.style.animation = 'interstellar-exit 2s ease-in forwards';
      
      const exitStyle = document.createElement('style');
      exitStyle.textContent = `
        @keyframes interstellar-exit {
          0% { 
            opacity: 1; 
            transform: scale(1) perspective(1000px) rotateX(0deg);
            filter: blur(0);
          }
          30% {
            opacity: 0.7;
            transform: scale(1.03) perspective(1000px) rotateX(-3deg);
            filter: blur(3px);
          }
          70% {
            opacity: 0.3;
            transform: scale(1.1) perspective(1000px) rotateX(-10deg);
            filter: blur(10px);
          }
          100% { 
            opacity: 0; 
            transform: scale(1.3) perspective(1000px) rotateX(-20deg);
            filter: blur(25px);
          }
        }
      `;
      document.head.appendChild(exitStyle);
      
      setTimeout(() => {
        readerMode.remove();
        exitStyle.remove();
      }, 2000);
    }
    
    document.body.style.overflow = '';
  }
}

new GalacticReader();
