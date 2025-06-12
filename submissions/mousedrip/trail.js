// Handles mouse trail animations and emoji rendering
class MouseDrip {
  constructor() {
    // Default config - tweaked after some testing
    this.config = {
      defaultEmoji: "✨",
      trailSpeed: 500,  // ms
      customSites: {},
      isEnabled: true
    };
    
    // Runtime vars
    this._curEmoji = "✨";
    this._fadeTime = 500;
    this._minDelay = 100; // Min delay between spawns
    this._lastTrailTime = 0;
    this._mousemoveHandler = null;
    
    // Boot it up
    this.init();
  }

  async init() {
    await this.loadConfig();
    this.pickEmoji();
    this.removeEvents();
    this.cleanupTrails();
    this.setupEvents();
  }

  async loadConfig() {
    try {
      // Get saved settings with timeout protection
      const storagePromise = chrome.storage.sync.get([
        'defaultEmoji', 'trailSpeed', 'customSites', 'isEnabled'
      ]);
      
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Storage timeout')), 5000);
      });

      // Race between storage and timeout
      const saved = await Promise.race([storagePromise, timeoutPromise]);
      
      // Validate and merge with defaults
      this.config = {
        defaultEmoji: typeof saved.defaultEmoji === 'string' ? saved.defaultEmoji : "✨",
        trailSpeed: Number.isInteger(saved.trailSpeed) && saved.trailSpeed > 0 ? saved.trailSpeed : 500,
        customSites: saved.customSites && typeof saved.customSites === 'object' ? saved.customSites : {},
        isEnabled: typeof saved.isEnabled === 'boolean' ? saved.isEnabled : true
      };

      // Update timings with improved speed scaling
      const speedFactor = (1000 - this.config.trailSpeed) / 900; // Convert 100-1000 range to 0-1
      this._fadeTime = 200 + (speedFactor * 1800); // Scale fade time between 200ms and 2000ms
      this._minDelay = 20 + (speedFactor * 180); // Scale spawn delay between 20ms and 200ms

    } catch(err) {
      console.warn("MouseDrip: Storage error, using defaults", err);
      // Ensure defaults are set even on error
      const speedFactor = (1000 - this.config.trailSpeed) / 900;
      this._fadeTime = 200 + (speedFactor * 1800);
      this._minDelay = 20 + (speedFactor * 180);
    }
  }

  pickEmoji() {
    if (!this.config.isEnabled) return;

    const host = window.location.hostname;
    this._curEmoji = this.config.defaultEmoji;

    // Site-specific emoji?
    for (let site in this.config.customSites) {
      if (host.includes(site)) {
        this._curEmoji = this.config.customSites[site];
        break;
      }
    }
  }

  removeEvents() {
    if (this._mousemoveHandler) {
      document.removeEventListener("mousemove", this._mousemoveHandler, { passive: true });
      this._mousemoveHandler = null;
    }
  }

  cleanupTrails() {
    document.querySelectorAll('.mousedrip-trail').forEach(el => el.remove());
  }

  setupEvents() {
    if (!this.config.isEnabled) return;
    this._mousemoveHandler = (e) => {
      const now = Date.now();
      if (now - this._lastTrailTime < this._minDelay) return;
      this._lastTrailTime = now;
      this.spawnTrail(e.clientX, e.clientY);
    };
    document.addEventListener("mousemove", this._mousemoveHandler, { passive: true });
  }

  spawnTrail(x, y) {
    const trail = document.createElement("div");
    trail.textContent = this._curEmoji;
    trail.className = "mousedrip-trail";
    
    Object.assign(trail.style, {
      position: "fixed",
      left: x + "px",
      top: y + "px",
      pointerEvents: "none",
      zIndex: "999999",
      fontSize: "24px",
      opacity: "1",
      userSelect: "none",
      transform: "translate(-50%, -50%) rotate(0deg)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      filter: "blur(0px)",
      textShadow: "0 0 15px rgba(255,255,255,0.8)"
    });

    document.body.appendChild(trail);

    requestAnimationFrame(() => {
      const timing = this._fadeTime + (Math.random() * 100);
      const rotation = (Math.random() - 0.5) * 90;
      const scale = 0.2 + (Math.random() * 0.3);
      
      trail.style.transition = `all ${timing}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      trail.style.opacity = "0";
      trail.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
      trail.style.filter = "blur(10px)";
    });

    setTimeout(() => trail?.remove(), this._fadeTime + 200);
  }
}

// Boot on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window._mouseDripInstance = new MouseDrip());
} else {
  window._mouseDripInstance = new MouseDrip();
}

// Listen for live settings update from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'refreshMouseDrip' && window._mouseDripInstance) {
    window._mouseDripInstance.init();
  }
});

// Handle SPA navigation
let lastPath = location.href;
new MutationObserver(() => {
  const currentPath = location.href;
  if (currentPath !== lastPath) {
    lastPath = currentPath;
    // Small delay to let the page settle
    setTimeout(() => new MouseDrip(), 1000);
  }
}).observe(document, { subtree: true, childList: true });

// Inject trail CSS if not present
function injectTrailCSS() {
  if (!document.getElementById('mousedrip-style')) {
    const style = document.createElement('style');
    style.id = 'mousedrip-style';
    style.textContent = `
      .mousedrip-trail {
        position: fixed;
        pointer-events: none;
        z-index: 999999;
        font-size: 24px;
        opacity: 1;
        user-select: none;
        transform: translate(-50%, -50%) rotate(0deg);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        filter: blur(0px);
        text-shadow: 0 0 15px rgba(255,255,255,0.8);
      }
    `;
    document.head.appendChild(style);
  }
}

injectTrailCSS();