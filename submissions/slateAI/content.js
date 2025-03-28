// Create a floating button that stays on top of every page
function initializeButton() {
  console.log("Slate extension: Initializing button");
  
  // Check if button already exists (prevent duplicates)
  if (document.querySelector('.slate-save-button')) {
    return;
  }
  
  // Create the button element
  const floatingButton = document.createElement('div');
  floatingButton.className = 'slate-save-button';
  
  // Set position styles to make it float on top of the page
  floatingButton.style.position = 'fixed';
  floatingButton.style.top = '20px';
  floatingButton.style.right = '20px';
  floatingButton.style.zIndex = '9999999';
  floatingButton.style.width = '60px';  // Increased size by 50%
  floatingButton.style.height = '60px'; // Increased size by 50%
  floatingButton.style.borderRadius = '4px';
  floatingButton.style.cursor = 'pointer';
  floatingButton.style.transition = 'all 0.3s ease';
  floatingButton.style.backgroundColor = 'transparent'; // Remove blue background
  floatingButton.style.display = 'flex';
  floatingButton.style.alignItems = 'center';
  floatingButton.style.justifyContent = 'center';
  floatingButton.style.overflow = 'hidden';
  floatingButton.style.boxShadow = 'none'; // Remove shadow
  
  // Create image element
  const buttonImage = document.createElement('img');
  // Use the correct path to the image in the images folder
  buttonImage.src = chrome.runtime.getURL('images/slate-logo-btn.png');
  buttonImage.style.width = '100%'; // Use full container width
  buttonImage.style.height = '100%'; // Use full container height
  buttonImage.style.objectFit = 'contain';
  buttonImage.style.border = 'none'; // Remove border
  buttonImage.className = 'slate-button-image';
  
  // Create text element (hidden by default)
  const buttonText = document.createElement('span');
  buttonText.textContent = 'Save to slate';
  buttonText.className = 'slate-button-text';
  buttonText.style.color = 'white';
  buttonText.style.display = 'none'; // Hidden by default
  buttonText.style.whiteSpace = 'nowrap';
  buttonText.style.backgroundColor = '#4285f4'; // Add background to text only
  buttonText.style.padding = '0 12px';
  buttonText.style.borderRadius = '4px';
  
  // Add image and text to button
  floatingButton.appendChild(buttonImage);
  floatingButton.appendChild(buttonText);
  
  // Handle hover effects
  floatingButton.addEventListener('mouseenter', function() {
    // Hide image, show text
    buttonImage.style.display = 'none';
    buttonText.style.display = 'block';
    floatingButton.style.width = 'auto'; // Expand to fit text
    floatingButton.style.backgroundColor = 'transparent'; // Keep transparent
  });
  
  floatingButton.addEventListener('mouseleave', function() {
    // Show image, hide text
    buttonImage.style.display = 'block';
    buttonText.style.display = 'none';
    floatingButton.style.width = '60px'; // Back to square but 50% larger
    floatingButton.style.backgroundColor = 'transparent'; // Keep transparent
  });

  // Add click event listener to the button
  floatingButton.addEventListener('click', function() {
    console.log("Slate button clicked");
    
    // Get any selected text
    const selectedText = window.getSelection().toString().trim();
    
    // Create an overlay backdrop
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '9999998';
    document.body.appendChild(overlay);
    
    // Create note input container
    const inputContainer = document.createElement('div');
    inputContainer.style.position = 'fixed';
    inputContainer.style.top = '50%';
    inputContainer.style.left = '50%';
    inputContainer.style.transform = 'translate(-50%, -50%)';
    inputContainer.style.backgroundColor = 'white';
    inputContainer.style.padding = '20px';
    inputContainer.style.borderRadius = '8px';
    inputContainer.style.zIndex = '9999999';
    inputContainer.style.width = '300px';
    
    // Create label
    const label = document.createElement('div');
    label.textContent = 'Add a note (optional):';
    label.style.marginBottom = '10px';
    
    // Create input field
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Add a note...';
    inputField.style.width = '100%';
    inputField.style.padding = '8px';
    inputField.style.marginBottom = '15px';
    inputField.style.boxSizing = 'border-box';
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'space-between';
    
    // Create Save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.padding = '8px 15px';
    saveButton.style.backgroundColor = '#4285f4';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    
    // Create Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 15px';
    cancelButton.style.backgroundColor = '#f1f1f1';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    
    // Add buttons to container
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(saveButton);
    
    // Add elements to input container
    inputContainer.appendChild(label);
    inputContainer.appendChild(inputField);
    inputContainer.appendChild(buttonsContainer);
    
    // Add container to body
    document.body.appendChild(inputContainer);
    
    // Focus input field
    inputField.focus();
    
    // Function to process and send text
    function processAndSend() {
      const userInput = inputField.value.trim();
      let textToProcess = '';
      
      if (selectedText) {
        textToProcess = selectedText + "\n\n\n" + userInput;
      } else {
        textToProcess = document.body.textContent.trim() + "\n\n\n" + userInput;
      }
      
      // Remove UI elements
      overlay.remove();
      inputContainer.remove();
      
      // Send to background.js for processing
      sendToBackground(textToProcess);
    }
    
    // Handle save button click
    saveButton.addEventListener('click', processAndSend);
    
    // Handle cancel button click
    cancelButton.addEventListener('click', function() {
      overlay.remove();
      inputContainer.remove();
    });
    
    // Handle enter key press
    inputField.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        processAndSend();
      }
    });
    
    // Also close on overlay click
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.remove();
        inputContainer.remove();
      }
    });
  });
  
  // Function to send text to background script for processing
  function sendToBackground(text) {
    try {
      // Check if runtime is available and not in an error state
      if (typeof chrome !== 'undefined' && chrome.runtime && !chrome.runtime.id) {
        console.error("Extension context invalidated. Reloading extension may fix this.");
        alert('Extension context error. Please reload the page or restart the browser.');
        return;
      }
      
      chrome.runtime.sendMessage({
        action: 'processText',
        text: text,
        url: window.location.href
      }, function(response) {
        // Check for runtime errors first
        if (chrome.runtime.lastError) {
          console.error("Error sending to background:", chrome.runtime.lastError);
          // Handle specific case of context invalidation
          if (chrome.runtime.lastError.message.includes("Extension context invalidated")) {
            alert('Extension needs to be reloaded. Please refresh the page or restart your browser.');
          } else {
            alert('Error processing text: ' + chrome.runtime.lastError.message);
          }
          return;
        }
      });
    } catch (error) {
      console.error("Exception when sending message:", error);
      alert('Error communicating with the extension. Please reload the page and try again.');
    }
  }
  
  document.body.appendChild(floatingButton);
  console.log("Slate button added to page");
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeButton);
} else {
  initializeButton();
}

window.addEventListener('load', initializeButton);