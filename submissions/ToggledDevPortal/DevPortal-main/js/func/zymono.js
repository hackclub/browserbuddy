if (String(window.location).includes('pay.zymono') && String(window.location).includes('#') && String(window.location).includes('%')) {
    chrome.runtime.sendMessage({ sub1: true }, function (response) {
        // This callback function is optional, you can handle the response if needed.
        if (response && response.success) {
          console.log('Redirection successful!');
          window.close()
        }
      });
}

window.addEventListener('hashchange', handleHashChange);

function handleHashChange() {
    console.log(window.location.hash)
    if (String(window.location).includes('pay.zymono') && String(window.location).includes('#') && String(window.location).includes('%')) {
        chrome.runtime.sendMessage({ sub1: true }, function (response) {
            // This callback function is optional, you can handle the response if nee14ded.
            if (response && response.success) {
              console.log('Redirection successful!');
              window.close()
            }
          });
    }
}