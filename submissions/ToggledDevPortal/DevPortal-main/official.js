chrome.storage.sync.get(['tabs'], result => {
    if (result.tabs) {
      const tabs = JSON.parse(result.tabs)
      document.getElementById('save').addEventListener('click', function() {
        const url = document.getElementById('url').value
        tabs.push(url)
        chrome.storage.sync.set({ tabs: JSON.stringify(tabs) }, () => {
            document.getElementById('todo-popup').style.display = 'none'
        })
      })
      console.log(tabs)
    } else {
        const tabs = []
        document.getElementById('save').addEventListener('click', function() {
            const url = document.getElementById('url').value
            tabs.push(url)
            chrome.storage.sync.set({ tabs: JSON.stringify(tabs) }, () => {
                document.getElementById('todo-popup').style.display = 'none'
            })
          })
          console.log('no tabs')
    }
})

document.getElementById('devportal').addEventListener('click', function() {
    document.getElementById('todo-popup').style.display = 'block'
})

document.getElementById('close').addEventListener('click', function() {
    document.getElementById('todo-popup').style.display = 'none'
})

document.getElementById('remove').addEventListener('click', function() {
  chrome.storage.sync.set({ tabs: false }, () => {
    document.getElementById('todo-popup').style.display = 'none'
})
})

chrome.storage.sync.get(['pin'], result => {
  if (result.pin) {
    // document.getElementById('pin').innerText = 'Edit Integration'
    // document.getElementById('pt').checked = true
  
  //   document.getElementById('pin').addEventListener('click', function() {
  //     chrome.storage.sync.set({ pin: false }, () => {
  //         window.location = 'official.html'
  //     })
  // })
  }
})

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    function() {
      console.log("Text copied to clipboard");
    },
    function(err) {
      console.error("Unable to copy text:", err);
    }
  );
}

// document.getElementById('pin').addEventListener('click', function() {
//   document.getElementById('lock-popup').style.display = 'block'
// })

// document.getElementById('lockclose').addEventListener('click', function() {
//   document.getElementById('lock-popup').style.display = 'none'
// })

// document.getElementById('disable').addEventListener('click', function() {
// chrome.storage.sync.set({ pin: false }, () => {
//   document.getElementById('lock-popup').style.display = 'none'
//   window.location = 'official.html'
// })
// })

// document.getElementById('pinLock').addEventListener('submit', function() {
//   chrome.storage.sync.set({ pin: window.btoa(document.getElementById('pass').value) }, () => {
//     window.location = 'official.html'
// })
// })

chrome.storage.sync.get(null, function(items) {
  var allKeys = Object.keys(items);
  // console.log(allKeys);
  // console.log(items);
  document.getElementById('transfer-code').value = window.btoa(JSON.stringify(items))
});

document.getElementById('transferclose').addEventListener('click', function() {
  document.getElementById('transfer-popup').style.display = 'none'
})

document.getElementById('transfer-trigger').addEventListener('click', function() {
  document.getElementById('transfer-popup').style.display = 'block'
})

document.getElementById('transfer-code').style.cursor = 'pointer'

document.getElementById('transfer-code').addEventListener('click', function() {
  const code = document.getElementById('transfer-code').value

  copyToClipboard(code)

  document.getElementById('transfer-code').value = 'Copied'
})

document.getElementById('transfer').addEventListener('submit', function() {
  event.preventDefault()
  chrome.storage.sync.set(JSON.parse(window.atob(document.getElementById('trans-code').value)), () => {
    window.location = 'official.html'
})
})


// chrome.storage.sync.remove('tabs')

document.getElementById('modules').addEventListener('click', () => {
  document.getElementById('mi-popup').style.display = 'block';
})

document.getElementById('closeMo').addEventListener('click', () => {
  document.getElementById('mi-popup').style.display = 'none';
})

document.getElementById('addModule').addEventListener('click', () => {
  const url = document.getElementById("moduleUrl").value;

  if (!url) {
    alert("Please enter a valid URL.");
    return;
  }

  const confirmDownload = true;
  if (confirmDownload) {
    chrome.storage.sync.get({ modules: [] }, (data) => {
      let modules = data.modules;

      if (!modules.includes(url)) {
        modules.push(url);
        chrome.storage.sync.set({ modules }, () => {
          alert("Module added successfully.");
        });
      } else {
        alert("This module is already added.");
      }
    });
  }
});
