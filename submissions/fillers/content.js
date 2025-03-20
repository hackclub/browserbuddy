// Global variables
let isActive = false;
let currentItem = '';
let hoveredElement = null;
let hoverTooltip = null;

// Initialize when content script is loaded
initialize();

// Initialize extension state
function initialize() {
  // Check if extension is active
  chrome.storage.local.get(['isActive', 'currentItem'], function(result) {
    isActive = result.isActive || false;
    currentItem = result.currentItem || '';
    
    if (isActive) {
      setupEventListeners();
    }
  });
  
  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'toggleActive') {
      isActive = message.isActive;
      
      if (isActive) {
        setupEventListeners();
      } else {
        removeEventListeners();
        removeTooltip();
      }
    } else if (message.action === 'setCurrentItem') {
      currentItem = message.text;
    }
  });
}

// Setup event listeners for form fields
function setupEventListeners() {
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('click', handleClick);
  
  // Add styles for tooltip
  if (!document.getElementById('smart-form-filler-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'smart-form-filler-styles';
    styleElement.textContent = `
      .smart-form-filler-tooltip {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
        font-size: 12px;
        z-index: 10000;
        pointer-events: none;
      }
      .smart-form-fillable {
        outline: 2px solid #4285f4 !important;
      }
    `;
    document.head.appendChild(styleElement);
  }
}

// Remove event listeners
function removeEventListeners() {
  document.removeEventListener('mouseover', handleMouseOver);
  document.removeEventListener('mouseout', handleMouseOut);
  document.removeEventListener('click', handleClick);
  
  // Remove highlight from any currently highlighted element
  const highlightedElements = document.querySelectorAll('.smart-form-fillable');
  highlightedElements.forEach(el => {
    el.classList.remove('smart-form-fillable');
  });
  
  // Remove styles
  const styleElement = document.getElementById('smart-form-filler-styles');
  if (styleElement) {
    styleElement.remove();
  }
}

// Handle mouse over event
function handleMouseOver(event) {
  if (!isActive || !currentItem) return;
  
  const target = event.target;
  
  // Check if the element is a fillable form element
  if (isFillableElement(target)) {
    hoveredElement = target;
    hoveredElement.classList.add('smart-form-fillable');
    
    // Create and show tooltip
    createTooltip(event.clientX, event.clientY);
  }
}

// Handle mouse out event
function handleMouseOut(event) {
  if (!isActive || !hoveredElement) return;
  
  if (event.target === hoveredElement) {
    hoveredElement.classList.remove('smart-form-fillable');
    hoveredElement = null;
    removeTooltip();
  }
}

// Handle click event
function handleClick(event) {
  if (!isActive || !hoveredElement || !currentItem) return;
  
  if (event.target === hoveredElement) {
    // Fill the form field with the current item
    fillFormField(hoveredElement, currentItem);
    
    // Remove the highlight and tooltip
    hoveredElement.classList.remove('smart-form-fillable');
    hoveredElement = null;
    removeTooltip();
  }
}

// Check if element is a fillable form element
function isFillableElement(element) {
  const fillableTypes = [
    'text', 'email', 'password', 'search', 'tel', 'url', 'number'
  ];
  
  return (
    (element.tagName === 'INPUT' && fillableTypes.includes(element.type)) ||
    element.tagName === 'TEXTAREA' ||
    element.isContentEditable
  );
}

// Fill form field with text
function fillFormField(element, text) {
  if (element.isContentEditable) {
    element.textContent = text;
  } else {
    element.value = text;
    
    // Trigger input event to notify the page of the change
    const inputEvent = new Event('input', { bubbles: true });
    const changeEvent = new Event('change', { bubbles: true });
    
    element.dispatchEvent(inputEvent);
    element.dispatchEvent(changeEvent);
  }
}

// Create tooltip
function createTooltip(x, y) {
  removeTooltip(); // Remove any existing tooltip
  
  hoverTooltip = document.createElement('div');
  hoverTooltip.className = 'smart-form-filler-tooltip';
  hoverTooltip.textContent = 'Click to fill with: ' + truncateText(currentItem, 30);
  
  // Position the tooltip near the cursor
  hoverTooltip.style.left = (x + 10) + 'px';
  hoverTooltip.style.top = (y + 10) + 'px';
  
  document.body.appendChild(hoverTooltip);
  
  // Reposition tooltip if it goes off-screen
  const rect = hoverTooltip.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    hoverTooltip.style.left = (x - rect.width - 10) + 'px';
  }
  if (rect.bottom > window.innerHeight) {
    hoverTooltip.style.top = (y - rect.height - 10) + 'px';
  }
}

// Remove tooltip
function removeTooltip() {
  if (hoverTooltip) {
    hoverTooltip.remove();
    hoverTooltip = null;
  }
}

// Truncate text if it's too long
function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}
