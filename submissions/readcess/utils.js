const ReadingUtils = {
  contentFactors: {
    technical: 0.7,
    academic: 0.75,
    casual: 1.0,
    narrative: 1.2
  },

  complexityIndicators: [
    'algorithm', 'analysis', 'research', 'study', 'theory',
    'implementation', 'methodology', 'framework', 'abstract',
    'technical', 'documentation', 'specification', 'protocol'
  ],

  getVisibleText(element) {
    if (element.nodeType === Node.TEXT_NODE) {
      return element.textContent.trim();
    }
    
    if (element.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    if (element.isContentEditable ||
        element.contentEditable === 'true' ||
        element.tagName === 'TEXTAREA' ||
        element.tagName === 'INPUT' ||
        element.tagName === 'SELECT' ||
        element.closest('form') ||
        element.getAttribute('role') === 'textbox' ||
        element.hasAttribute('contenteditable')) {
      return '';
    }

    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return '';
    }

    const skipTags = [
      'script', 'style', 'noscript', 'nav', 'header', 'footer',
      'code', 'pre', 'iframe', 'aside', 'button',
      'input', 'textarea', 'select', 'option'
    ];
    
    const tagName = element.tagName.toLowerCase();
    const classAndId = (element.className + ' ' + element.id).toLowerCase();
    
    if (skipTags.includes(tagName) ||
        classAndId.includes('comments') ||
        classAndId.includes('sidebar') ||
        classAndId.includes('related') ||
        classAndId.includes('share') ||
        classAndId.includes('newsletter') ||
        classAndId.includes('advertisement') ||
        classAndId.includes('editor') ||
        classAndId.includes('textbox') ||
        classAndId.includes('input') ||
        classAndId.includes('meta')) {
      return '';
    }

    let text = '';
    for (const child of element.childNodes) {
      text += ' ' + this.getVisibleText(child);
    }
    return text.trim();
  },

  countWords(text) {
    const cleanText = text
      .replace(/[""'']/g, '')
      .replace(/[.,\/#!$%\^&\*;:{}=_`~()\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const words = cleanText
      .split(' ')
      .filter(word => {
        const w = word.toLowerCase();
        return word.length > 0 && 
               !/^\d+$/.test(word) &&
               !/^[^a-zA-Z]+$/.test(word);
      });
    
    return words.length;
  },

  analyzeContentType(text) {
    const lowerText = text.toLowerCase();
    
    const complexityScore = this.complexityIndicators.reduce((score, indicator) => {
      return score + (lowerText.includes(indicator) ? 1 : 0);
    }, 0);
    
    const hasCodeBlocks = /<code>|<pre>|```/.test(text);
    const hasTechnicalPatterns = /\b(function|class|const|var|let)\b/.test(lowerText);
    
    if (hasCodeBlocks || hasTechnicalPatterns || complexityScore > 3) {
      return this.contentFactors.technical;
    } else if (complexityScore > 1) {
      return this.contentFactors.academic;
    } else if (text.includes('Chapter') || /\b(said|thought|felt)\b/i.test(text)) {
      return this.contentFactors.narrative;
    }
    
    return this.contentFactors.casual;
  },

  formatTime(minutes) {
    if (minutes < 1) {
      return '1 minute';
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) {
      return `${mins} minute${mins !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
  },

  calculateReadingTime(text, wordsPerMinute) {
    const words = this.countWords(text);
    const contentFactor = this.analyzeContentType(text);
    
    const adjustedSpeed = wordsPerMinute * contentFactor;
    
    let minutes = words / adjustedSpeed;
    
    const imageCount = (text.match(/<img/g) || []).length;
    minutes += imageCount * 0.1;
    
    const codeBlocks = (text.match(/<(pre|code)>|```/g) || []).length;
    minutes += codeBlocks * 0.5;
    
    return Math.ceil(minutes);
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

const StorageManager = {
  async getSettings() {
    console.log('[Readcess] Getting settings...');
    const defaults = {
      readingSpeed: 200,
      breakInterval: 2,
      enabled: true
    };
    
    try {
      if (!chrome.storage || !chrome.storage.sync) {
        console.error('[Readcess] Chrome storage not available');
        return defaults;
      }
      console.log('[Readcess] Checking chrome.storage.sync availability:', !!chrome.storage?.sync);
      const result = await chrome.storage.sync.get(defaults);
      console.log('[Readcess] Storage get result:', result);
      return {
        readingSpeed: parseFloat(result.readingSpeed),
        breakInterval: parseFloat(result.breakInterval),
        enabled: result.enabled
      };
    } catch (error) {
      console.error('[Readcess] Error getting settings:', error);
      console.log('[Readcess] Falling back to defaults');
      return defaults;
    }
  },

  async saveSettings(settings) {
    try {
      await chrome.storage.sync.set({
        readingSpeed: settings.readingSpeed,
        breakInterval: settings.breakInterval,
        enabled: settings.enabled
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }
};

self.ReadingUtils = ReadingUtils;
self.StorageManager = StorageManager;