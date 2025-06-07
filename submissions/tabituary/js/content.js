if (typeof window.tabituaryInitialized === 'undefined') {
  window.tabituaryInitialized = true;
  const DEBUG = true;
  const logInfo = (msg, ...args) => DEBUG && console.log(`Tabituary: ${msg}`, ...args);
  const logError = (msg, ...args) => console.error(`Tabituary: ${msg}`, ...args);
  
  logInfo('Content script loading, window ID:', Math.random().toString(36).substr(2, 9));
  
  class TabituaryAudioSystem {
    constructor() {
      this.audioContext = null;
      this.masterGain = null;
      this.hasUserInteracted = false;
      this.isPlaying = false;
      this.playLock = false;
      this.lastPlayTime = 0;
      this.soundsPlayed = 0;
      this.maxPlaysPerSession = 50;
      this.bufferCache = {};
      
      this.soundDefinitions = {
        obituary: {
          type: 'medievalBell',
          notes: [
            { frequency: 261.63, gain: 0.9, decay: 3.2, type: 'sine' }, 
            { frequency: 329.63, gain: 0.5, decay: 3.0, type: 'sine' },
            { frequency: 392.00, gain: 0.6, decay: 2.8, type: 'sine' },
            { frequency: 523.25, gain: 0.4, decay: 2.6, type: 'sine' }, 
            { frequency: 783.99, gain: 0.15, decay: 1.6, type: 'sine' },
            { frequency: 1046.50, gain: 0.1, decay: 1.4, type: 'sine' },
            { frequency: 266.00, gain: 0.07, decay: 2.0, type: 'sine' },
            { frequency: 1318.00, gain: 0.05, decay: 1.0, type: 'sine' },
          ],
          strikeNoise: {
            duration: 0.1,
            gain: 0.2
          },
          masterVolume: 0.8,
          reverbMix: 0.7,
          reverbTime: 4.0,
          reverbDecay: 0.4
        },
        '404': {
          type: 'medievalBell',
          notes: [
            { frequency: 246.94, gain: 0.8, decay: 4.0, type: 'sine' },
            { frequency: 311.13, gain: 0.5, decay: 3.8, type: 'sine' },
            { frequency: 369.99, gain: 0.6, decay: 3.5, type: 'sine' },
            { frequency: 493.88, gain: 0.4, decay: 3.2, type: 'sine' },
            
            { frequency: 739.99, gain: 0.15, decay: 2.0, type: 'sine' },
            { frequency: 987.77, gain: 0.08, decay: 1.8, type: 'sine' },
            { frequency: 242.00, gain: 0.1, decay: 2.5, type: 'sine' },
            { frequency: 554.37, gain: 0.06, decay: 1.3, type: 'sine' },
          ],
          strikeNoise: {
            duration: 0.15,
            gain: 0.25
          },
          masterVolume: 0.85,
          reverbMix: 0.8,
          reverbTime: 5.0,
          reverbDecay: 0.5
        },
        'test': {
          type: 'medievalBell',
          notes: [
            { frequency: 293.66, gain: 0.7, decay: 2.0, type: 'sine' },
            { frequency: 370.00, gain: 0.4, decay: 1.8, type: 'sine' },
            { frequency: 440.00, gain: 0.5, decay: 1.6, type: 'sine' },
            { frequency: 587.33, gain: 0.3, decay: 1.4, type: 'sine' },
            
            { frequency: 880.00, gain: 0.2, decay: 1.0, type: 'sine' },
            { frequency: 1174.66, gain: 0.1, decay: 0.8, type: 'sine' },
          ],
          strikeNoise: {
            duration: 0.08,
            gain: 0.15
          },
          masterVolume: 0.6,
          reverbMix: 0.5,
          reverbTime: 2.5,
          reverbDecay: 0.3
        }
      };
      
      this.setupInteractionListeners();
      logInfo('Audio system constructed');
    }
    
    setupInteractionListeners() {
      if (typeof document === 'undefined') return;
      
      const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
      
      interactionEvents.forEach(eventType => {
        document.addEventListener(eventType, this.handleUserInteraction.bind(this), { once: false });
      });
      
      logInfo('User interaction listeners set up');
    }
    
    async handleUserInteraction(event) {
      if (this.hasUserInteracted) return;
      
      logInfo('User interaction detected:', event.type);
      this.hasUserInteracted = true;
      
      try {
        await this.initializeAudioContext();
      } catch (error) {
        logError('Error initializing audio on interaction:', error);
      }
      
      this.notifyUserInteraction(event.type);
    }
    
    async initializeAudioContext() {
      if (this.audioContext && this.audioContext.state === 'running') {
        return this.audioContext;
      }
      
      try {
        if (!this.audioContext || this.audioContext.state === 'closed') {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          logInfo('AudioContext created with state:', this.audioContext.state);
          
          this.masterGain = this.audioContext.createGain();
          this.masterGain.gain.value = 1.5;
          this.masterGain.connect(this.audioContext.destination);
        }
        
        if (this.audioContext.state !== 'running') {
          logInfo('Resuming AudioContext from state:', this.audioContext.state);
          await this.audioContext.resume();
          logInfo('AudioContext resumed, new state:', this.audioContext.state);
        }
        
        await this.playSilentSound();
        
        return this.audioContext;
      } catch (error) {
        logError('Error in initializeAudioContext:', error);
        return null;
      }
    }
    
    async playSilentSound() {
      if (!this.audioContext) return false;
      
      try {
        const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(this.audioContext.destination);
        source.start(0);
        logInfo('Silent sound played successfully');
        return true;
      } catch (e) {
        logError('Error playing silent sound:', e);
        return false;
      }
    }
    
    notifyUserInteraction(eventType) {
      try {
        chrome.runtime.sendMessage({
          action: 'userInteraction',
          source: 'contentScript',
          event: eventType
        });
      } catch (e) {
      }
    }
    
    canPlaySound() {
      if (!this.hasUserInteracted) {
        logInfo('Cannot play sound - no user interaction yet');
        return false;
      }
      
      if (this.playLock) {
        logInfo('Cannot play sound - play lock is active');
        return false;
      }
      
      if (this.soundsPlayed >= this.maxPlaysPerSession) {
        logInfo('Cannot play sound - reached maximum plays per session');
        return false;
      }

      const now = Date.now();
      const timeSinceLastPlay = now - this.lastPlayTime;
      if (timeSinceLastPlay < 1000) {
        logInfo('Cannot play sound - too soon since last play:', timeSinceLastPlay, 'ms');
        return false;
      }
      
      return true;
    }
    
    async playSound(type = 'obituary', volume = 0.7) {
      if (!this.canPlaySound()) {
        return false;
      }
      
      this.playLock = true;
      
      try {
        const ctx = await this.initializeAudioContext();
        if (!ctx) {
          throw new Error('Failed to initialize AudioContext');
        }
        
        const soundDef = this.soundDefinitions[type] || this.soundDefinitions.obituary;
        
        if (soundDef.type === 'medievalBell') {
          await this.playMedievalBellSound(soundDef, volume);
        } else {
          throw new Error('Unknown sound type: ' + soundDef.type);
        }
        
        this.lastPlayTime = Date.now();
        this.soundsPlayed++;
        logInfo(`Sound '${type}' played successfully (${this.soundsPlayed}/${this.maxPlaysPerSession})`);
        
        return true;
      } catch (error) {
        logError('Error playing sound:', error);
        
        try {
          await this.playFallbackSound(volume);
          return true;
        } catch (fallbackError) {
          logError('Fallback sound also failed:', fallbackError);
          return false;
        }
      } finally {
        setTimeout(() => {
          this.playLock = false;
        }, 500);
      }
    }
    
    async playMedievalBellSound(soundDef, requestedVolume = 0.5) {
      if (!this.audioContext) throw new Error('AudioContext not initialized');
      
      return new Promise((resolve, reject) => {
        try {
          const actualVolume = soundDef.masterVolume * requestedVolume;
          
          const soundMaster = this.audioContext.createGain();
          soundMaster.gain.value = actualVolume;
          
          const reverb = this.createReverbEffect(soundDef.reverbTime || 3.0, soundDef.reverbDecay || 0.5);
          
          const dryGain = this.audioContext.createGain();
          const wetGain = this.audioContext.createGain();

          dryGain.gain.value = 1 - soundDef.reverbMix;
          wetGain.gain.value = soundDef.reverbMix;
          
          dryGain.connect(soundMaster);
          wetGain.connect(soundMaster);
          reverb.connect(wetGain);
          
          soundMaster.connect(this.masterGain);
          
          const now = this.audioContext.currentTime;
          const endTime = now + 5.0;
          
          if (soundDef.strikeNoise) {
            this.createStrikeNoise(soundDef.strikeNoise, dryGain, wetGain, now);
          }
          
          const bells = soundDef.notes.map(note => 
            this.createBellTone(note, dryGain, reverb, endTime)
          );
          
          bells.forEach(bell => bell.start());
          
          setTimeout(() => {
            resolve(true);
          }, 800);
          
        } catch (error) {
          reject(error);
        }
      });
    }
    
    createStrikeNoise(strikeParams, dryOutput, reverbOutput, startTime) {
      try {
        const duration = strikeParams.duration || 0.1;
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          const phase = i / bufferSize;
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - phase, 2);
        }
        
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = buffer;
        
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.value = strikeParams.gain || 0.2;
        
        noiseGain.gain.setValueAtTime(strikeParams.gain || 0.2, startTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        noiseSource.connect(noiseGain);
        noiseGain.connect(dryOutput);
        noiseGain.connect(reverbOutput);
        
        noiseSource.start(startTime);
        noiseSource.stop(startTime + duration + 0.01);
        
        return noiseSource;
      } catch (error) {
        logError('Error creating strike noise:', error);
        return null;
      }
    }
    
    createBellTone(note, dryOutput, reverbOutput, endTime) {
      const { frequency, gain, decay, type = 'sine' } = note;

      const osc = this.audioContext.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      const gainNode = this.audioContext.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(dryOutput);
      gainNode.connect(reverbOutput);
      
      const detune = Math.random() * 4 - 2;
      osc.detune.setValueAtTime(detune, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime + 0.01);
      gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime + 0.02);
      
      gainNode.gain.setTargetAtTime(0.001, this.audioContext.currentTime + 0.02, decay * 0.333);
      
      return {
        start: () => {
          osc.start();
          osc.stop(endTime);
        }
      };
    }
    
    createReverbEffect(reverbTime, decay) {
      const convolver = this.audioContext.createConvolver();
      const rate = this.audioContext.sampleRate;
      const length = rate * reverbTime;
      const impulse = this.audioContext.createBuffer(2, length, rate);
      
      for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
        const channelData = impulse.getChannelData(channel);
        
        const numReflections = 7;
        const reflectionSpacing = Math.floor(rate * 0.02);
        
        const initialDelay = Math.floor(rate * 0.01);
        
        for (let i = 0; i < channelData.length; i++) {
          channelData[i] = 0;
        }
        
        for (let reflection = 0; reflection < numReflections; reflection++) {
          const reflectionPos = initialDelay + (reflection * reflectionSpacing);
          const reflectionGain = 0.7 * Math.pow(0.6, reflection);
          
          for (let i = 0; i < 20; i++) {
            const sampleIndex = reflectionPos + i;
            if (sampleIndex < channelData.length) {
              channelData[sampleIndex] += (Math.random() * 2 - 1) * reflectionGain;
            }
          }
        }
        
        const tailStart = initialDelay + (numReflections * reflectionSpacing);
        for (let i = tailStart; i < channelData.length; i++) {
          const stereoVariation = channel === 0 ? 1.0 : 0.97;
          const phase = (i - tailStart) / (channelData.length - tailStart);
          
          const noise = Math.random() * 2 - 1;
          
          const lfo = Math.sin(i * 0.0001 * stereoVariation) * 0.1;
          
          channelData[i] += (noise + lfo) * Math.pow(1 - phase, decay) * stereoVariation;
        }
        
        for (let i = 0; i < channelData.length; i++) {
          const phase = i / channelData.length;
          channelData[i] *= Math.pow(1 - phase, decay);
        }
      }
      
      convolver.buffer = impulse;
      return convolver;
    }
    
    async playFallbackSound(volume = 0.5) {
      return new Promise((resolve, reject) => {
        try {
          const audioElement = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
          audioElement.volume = volume;
          
          audioElement.onended = () => {
            resolve(true);
          };
          
          audioElement.onerror = (e) => {
            reject(new Error('Audio element failed to play: ' + e));
          };
          
          const playPromise = audioElement.play();
          if (playPromise) {
            playPromise.catch(reject);
          }

          setTimeout(() => {
            resolve(true);
          }, 1000);
        } catch (error) {
          reject(error);
        }
      });
    }
  }
  
  const audioSystem = new TabituaryAudioSystem();
  
  class TabituaryPopupSystem {
    constructor() {
      this.popupInitialized = false;
      this.audioInitialized = false;
      
      this.initialize();
    }
    
    initialize() {
      logInfo('Popup system initializing');
      
      if (document && document.body) {
        this.setupTabituaryPopup();
        this.initializeAudio();
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          this.setupTabituaryPopup();
          this.initializeAudio();
        });
      }
      
      this.setupMessageListener();
      
      window.addEventListener('load', () => {
        this.initializeAudio();
        
        try {
          chrome.runtime.sendMessage({
            action: 'contentScriptLoaded',
            location: window.location.href
          });
        } catch (e) {
          logError('Error sending load message:', e);
        }
      });
    }
    
    setupTabituaryPopup() {
      if (document.getElementById('tabituary-popup')) {
        this.popupInitialized = true;
        return;
      }
      
      const popupContainer = document.createElement('div');
      popupContainer.id = 'tabituary-popup';
      popupContainer.className = 'tabituary-popup';
      popupContainer.style.display = 'none';
      popupContainer.innerHTML = `
        <div class="tabituary-popup-content">
          <div class="tabituary-popup-header">
            <h2 class="tabituary-popup-title"></h2>
            <button class="tabituary-popup-close">&times;</button>
          </div>
          <div class="tabituary-popup-body">
            <div class="tabituary-popup-divider"></div>
            <p class="tabituary-popup-message"></p>
            <div class="tabituary-popup-time-container">
              <div class="tabituary-popup-time"></div>
            </div>
            <div class="tabituary-popup-actions">
              <button class="tabituary-view-link">Visit Original</button>
              <button class="tabituary-reopen-tab">Resurrect Tab</button>
            </div>
          </div>
        </div>
      `;
      
      try {
        if (document.body) {
          document.body.appendChild(popupContainer);
          
          const closeButton = popupContainer.querySelector('.tabituary-popup-close');
          closeButton.addEventListener('click', this.hidePopup.bind(this));
          
          this.addPopupStyles();
          
          this.popupInitialized = true;
          logInfo('Popup initialized successfully');
        } else {
          logError("Cannot append popup: document.body is not available");
        }
      } catch (error) {
        logError("Error appending popup container:", error);
      }
    }
    
    addPopupStyles() {
      if (document.getElementById('tabituary-popup-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'tabituary-popup-styles';
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        
        .tabituary-popup {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 999999;
          max-width: 350px;
          animation: tabituary-slide-in 0.3s ease-out forwards;
          font-family: 'EB Garamond', Georgia, serif;
          filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.5));
        }
        
        .tabituary-popup-content {
          background-color: #282533;
          border: 1px solid rgba(103, 58, 183, 0.3);
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 
                      inset 0 1px rgba(255, 255, 255, 0.1);
          color: #f8f8f2;
          overflow: hidden;
          position: relative;
        }
        
        .tabituary-popup-content::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background-color: #b39ddb;
        }
        
        .tabituary-popup-header {
          background: linear-gradient(to bottom, rgba(103, 58, 183, 0.8), rgba(103, 58, 183, 0.4));
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .tabituary-popup-title {
          margin: 0;
          font-size: 18px;
          color: #ffcc80;
          font-weight: bold;
          font-family: 'Playfair Display', Georgia, serif;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          letter-spacing: 0.02em;
          line-height: 1.4;
          max-width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .tabituary-popup-close {
          background: rgba(0, 0, 0, 0.2);
          border: none;
          color: #f8f8f2;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          margin: 0;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-left: 10px;
        }
        
        .tabituary-popup-close:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.4);
          transform: scale(1.1);
        }
        
        .tabituary-popup-divider {
          height: 2px;
          background: linear-gradient(to right, transparent, #ffcc80, transparent);
          margin: 0 auto 15px;
          width: 50%;
          opacity: 0.6;
        }
        
        .tabituary-popup-body {
          padding: 18px;
          line-height: 1.6;
          background: linear-gradient(to bottom, rgba(52, 47, 65, 0.6), rgba(40, 37, 51, 0.9));
        }
        
        .tabituary-popup-message {
          margin-bottom: 15px;
          font-size: 16px;
          line-height: 1.6;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        
        .tabituary-popup-time-container {
          margin: 18px 0;
          padding-top: 12px;
          border-top: 1px dotted rgba(255, 255, 255, 0.1);
        }
        
        .tabituary-popup-time {
          font-size: 14px;
          font-style: italic;
          opacity: 0.7;
          text-align: center;
          background: rgba(0, 0, 0, 0.2);
          padding: 8px;
          border-radius: 6px;
          display: inline-block;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }
        
        .tabituary-popup-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 15px;
        }
        
        .tabituary-view-link, .tabituary-reopen-tab {
          background-color: #673ab7;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 14px;
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          flex: 1;
          justify-content: center;
        }
        
        .tabituary-view-link {
          background-color: #342f41;
          border: 1px solid rgba(179, 157, 219, 0.3);
        }
        
        .tabituary-view-link:hover {
          background-color: #403a4e;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          border-color: rgba(179, 157, 219, 0.5);
        }
        
        .tabituary-reopen-tab:hover {
          background-color: #7e57c2;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        
        .tabituary-view-link::before {
          content: "🔗";
          font-size: 16px;
          margin-right: 8px;
          display: inline-block;
        }
        
        .tabituary-reopen-tab::before {
          content: "†";
          font-size: 18px;
          margin-right: 8px;
          transform: rotate(180deg);
          display: inline-block;
        }
        
        @keyframes tabituary-slide-in {
          from {
            opacity: 0;
            transform: translateY(-20px) translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(0);
          }
        }
        
        @keyframes tabituary-fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;
      
      document.head.appendChild(style);
    }
    
    showPopup(obituary) {
      if (!this.popupInitialized) {
        this.setupTabituaryPopup();
      }
      
      let popup = document.getElementById('tabituary-popup');
      if (!popup) {
        logError('Failed to create popup element');
        return;
      }
      
      const tabTitle = this.truncateText(obituary.tabTitle || 'Unknown Tab', 40);
      const processedMessage = this.formatMessage(obituary.message || '');
      
      popup.querySelector('.tabituary-popup-title').textContent = tabTitle;
      popup.querySelector('.tabituary-popup-message').textContent = processedMessage;
      
      const is404 = obituary.is404 || obituary.causeOfDeath === "404 Not Found";
      
      if (is404) {
        popup.querySelector('.tabituary-popup-header').style.background = 
          'linear-gradient(to bottom, rgba(183, 28, 28, 0.8), rgba(183, 28, 28, 0.4))';
        
        popup.querySelector('.tabituary-popup-content').style.borderColor = 'rgba(183, 28, 28, 0.5)';
        
        const actionsContainer = popup.querySelector('.tabituary-popup-actions');
        if (actionsContainer) {
          actionsContainer.style.display = 'none';
        }
        
        const timeContainer = popup.querySelector('.tabituary-popup-time-container');
        if (timeContainer) {
          timeContainer.style.display = 'none';
        }
      } else {
        popup.querySelector('.tabituary-popup-header').style.background = 
          'linear-gradient(to bottom, rgba(103, 58, 183, 0.8), rgba(103, 58, 183, 0.4))';
        popup.querySelector('.tabituary-popup-content').style.borderColor = 'rgba(103, 58, 183, 0.3)';
        
        if (obituary.url) {
          const viewLinkButton = popup.querySelector('.tabituary-view-link');
          if (viewLinkButton) {
            viewLinkButton.style.display = 'block';
            const newViewLinkButton = viewLinkButton.cloneNode(true);
            viewLinkButton.parentNode.replaceChild(newViewLinkButton, viewLinkButton);
            newViewLinkButton.addEventListener('click', () => {
              window.open(obituary.url, '_blank');
            });
          }
          
          const reopenButton = popup.querySelector('.tabituary-reopen-tab');
          if (reopenButton) {
            reopenButton.style.display = 'block';   
            const newReopenButton = reopenButton.cloneNode(true);
            reopenButton.parentNode.replaceChild(newReopenButton, reopenButton);
            newReopenButton.addEventListener('click', () => {
              window.location.href = obituary.url;
              this.hidePopup();
            });
          }
          
          const actionsContainer = popup.querySelector('.tabituary-popup-actions');
          if (actionsContainer) {
            actionsContainer.style.display = 'flex';
          }
        } else {
          const actionsContainer = popup.querySelector('.tabituary-popup-actions');
          if (actionsContainer) {
            actionsContainer.style.display = 'none';
          }
        }
        
        const timeEl = popup.querySelector('.tabituary-popup-time');
        const timeContainer = popup.querySelector('.tabituary-popup-time-container');
        
        if (timeContainer) {
          timeContainer.style.display = 'block';
          timeEl.textContent = `Time of death: ${new Date(obituary.deathTime).toLocaleString()}`;
          if (obituary.timeAlive) {
            timeEl.textContent += ` (Lived for ${obituary.timeAlive})`;
          }
        }
      }
      
      popup.style.display = 'block';
      popup.style.animation = 'tabituary-slide-in 0.3s ease-out forwards';
      
      setTimeout(() => {
        const popup = document.getElementById('tabituary-popup');
        if (popup && popup.style.display === 'block') {
          popup.style.animation = 'tabituary-fade-out 1s forwards';
          setTimeout(() => {
            if (popup) popup.style.display = 'none';
          }, 1000);
        }
      }, 10000);
    }
    
    hidePopup() {
      const popup = document.getElementById('tabituary-popup');
      if (!popup) return;
      
      popup.style.animation = 'tabituary-fade-out 1s forwards';
      setTimeout(() => {
        popup.style.display = 'none';
        popup.style.animation = '';
      }, 1000);
    }
    
    initializeAudio() {
      try {
        logInfo('Initializing audio system from content script');
        
        try {
          chrome.runtime.sendMessage({
            action: 'contentScriptReady',
            message: 'Audio system initialized'
          });
          
          this.audioInitialized = true;
        } catch (e) {
          logError('Error sending ready message:', e);
        }
      } catch (error) {
        logError('Error initializing audio in content script:', error);
      }
    }
    
    setupMessageListener() {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        logInfo('Content script received message:', message.action);
        
        if (message.action === 'showTabObituary') {
          this.setupTabituaryPopup();
          this.showPopup(message.obituary);
          this.initializeAudio();
          
          if (message.playSound) {
            logInfo('Playing sound with popup');
            const soundType = message.obituary.is404 ? '404' : 'obituary';
            audioSystem.playSound(soundType, 1).then(success => {
              logInfo('Sound played result:', success);
            }).catch(err => {
              logError('Error playing sound:', err);
            });
          }

          sendResponse({ success: true });
          return true;
        } else if (message.action === 'ping') {
          sendResponse({ success: true, context: 'content_script' });
          return true;
        } else if (message.action === 'playSound') {
          if (!document.hasFocus()) {
            logInfo('Tab not in focus, cannot play sound');
            sendResponse({ success: false, error: 'Tab not in focus' });
            return true;
          }
          
          audioSystem.playSound(message.sound || 'obituary', message.volume || 0.5)
            .then(success => {
              sendResponse({ success: true, message: 'Sound played successfully' });
            })
            .catch(error => {
              sendResponse({ success: false, error: String(error) });
            });
          
          return true;
        }
      });
    }
    
    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    formatMessage(message) {
      if (!message) return '';
      
      const processedMessage = message.replace(/\S{45,}/g, word => {
        return word.substring(0, 42) + '...';
      });
      
      return processedMessage;
    }
  }
  
  const popupSystem = new TabituaryPopupSystem();
  
  if (DEBUG) {
    window.tabituaryAudioSystem = audioSystem;
    window.tabituaryPopupSystem = popupSystem;
  }
  
  logInfo('Content script fully initialized');
}