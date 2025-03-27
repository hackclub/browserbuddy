if (String(window.location).includes('openai') && String(window.location).includes('?toggledAuth')) {
    // document.querySelector('[data-cy="header-new-repl-btn"]').click()
    setTimeout(function() {
        // document.querySelector('[data-cy="create-repl-title-input"]').disabled = false
        const un = document.querySelector('[data-headlessui-state]').querySelector('.grow').innerHTML

        chrome.runtime.sendMessage({ openai: un }, function (response) {
            // This callback function is optional, you can handle the response if needed.
            if (response && response.success) {
              console.log('Redirection successful!');
              window.close()
            }
          });
    }, 400)
    // setTimeout(function() {
    //     document.querySelector('[data-cy="create-repl-title-input"]').placeholder = 'Name your DevPortal Repl'
    // }, 1000)
}

if (String(window.location).includes('openai') && String(window.location).includes('?new')) {
  // document.querySelector('[data-cy="header-new-repl-btn"]').click()
  setTimeout(function() {
      // document.querySelector('[data-cy="create-repl-title-input"]').disabled = false
      document.getElementById('prompt-textarea').click()
     document.getElementById('prompt-textarea').innerHTML = new URLSearchParams(window.location.search).get('new')
     document.getElementById('prompt-textarea').value = new URLSearchParams(window.location.search).get('new')
     // Create a new KeyboardEvent for space key
const event = new KeyboardEvent('keydown', {
  key: ' ',      // Key you want to simulate (space)
  keyCode: 32,   // Key code for space key
  which: 32      // Which key
});

// Dispatch the event to a target element (e.g., a text input)
const targetElement = document.getElementById('prompt-textarea');
targetElement.dispatchEvent(event);


    const btn = document.getElementById('prompt-textarea').parentElement.querySelector('button')
        btn.disabled = false
        btn.click()
        

  }, 2000)
  // setTimeout(function() {
  //     document.querySelector('[data-cy="create-repl-title-input"]').placeholder = 'Name your DevPortal Repl'
  // }, 1000)
}