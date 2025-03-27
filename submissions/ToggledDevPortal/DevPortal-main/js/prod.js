// let search1 = false;
// chrome.storage.sync.get(['github'], result => {
//     search1 = result.github;
//     console.log(search1)
//     if (search1) {
//         document.getElementById('gh').checked = true
//     document.getElementById('ghint').remove()
//     }
//   });

// if (search1) {
//     document.getElementById('gh').checked = true
//     document.getElementById('ghint').remove()
// }
document.getElementById('ghint').addEventListener('click', function() {
    chrome.storage.sync.set({ news: true }, () => {
        window.location = 'productivity.html'
    })
})

chrome.storage.sync.get(['news'], result => {
    if (result.news == true) {
      document.getElementById('ghint').innerText = 'Disable Integration'
      document.getElementById('gh').checked = true
    
      document.getElementById('ghint').addEventListener('click', function() {
        chrome.storage.sync.set({ news: false }, () => {
            window.location = 'productivity.html'
        })
    })
    }
  })

  document.getElementById('sint').addEventListener('click', function() {
    chrome.storage.sync.set({ snippet: true }, () => {
        window.location = 'productivity.html'
    })
})

chrome.storage.sync.get(['snippet'], result => {
    if (result.snippet == true) {
      document.getElementById('sint').innerText = 'Disable Integration'
      document.getElementById('sch').checked = true
    
      document.getElementById('sint').addEventListener('click', function() {
        chrome.storage.sync.set({ snippet: false }, () => {
            window.location = 'productivity.html'
        })
    })
    }
  })

document.getElementById('lint').addEventListener('click', function() {
    chrome.storage.sync.set({ lighthouse: true }, () => {
        window.location = 'productivity.html'
    })
})

chrome.storage.sync.get(['lighthouse'], result => {
    if (result.lighthouse == true) {
      document.getElementById('lint').innerText = 'Disable Integration'
      document.getElementById('lch').checked = true
    
      document.getElementById('lint').addEventListener('click', function() {
        chrome.storage.sync.set({ lighthouse: false }, () => {
            window.location = 'productivity.html'
        })
    })
    }
  })

  document.getElementById('jokes').addEventListener('click', function() {
    chrome.storage.sync.set({ jokes: true }, () => {
        window.location = 'productivity.html'
    })
})

chrome.storage.sync.get(['jokes'], result => {
  if (result.jokes == true) {
    document.getElementById('jokes').innerText = 'Disable Integration'
    document.getElementById('jt').checked = true
  
    document.getElementById('jokes').addEventListener('click', function() {
      chrome.storage.sync.set({ jokes: false }, () => {
          window.location = 'productivity.html'
      })
  })
  }
})
//   chrome.storage.sync.get(['github'], result => {
//     if (!result.stack == true) {
//       document.getElementById('github').remove()
//     }
//   })

document.getElementById('openai').addEventListener('click', function() {
  if (window.confirm('By clicking "Ok" you agree for toggled to vist ChatGPT on your behalf and scrape your profile picture and name from the page.')) {
    window.location = 'https://chat.openai.com/?toggledAuth'
  }
})

chrome.storage.sync.get(['openai'], result => {
  if (result.openai) {
    document.getElementById('openai').innerText = 'Disable Integration'
    document.getElementById('ot').checked = true
    console.log(result.openai)
  
    document.getElementById('openai').addEventListener('click', function() {
      chrome.storage.sync.set({ openai: false }, () => {
          window.location = 'productivity.html'
      })
  })
  }
})

if (new URLSearchParams(window.location.search).get('openai')) {
  chrome.storage.sync.set({ openai: new URLSearchParams(window.location.search).get('openai') }, () => {
    window.location = 'productivity.html'
  //   chrome.storage.sync.set({ openaipfp: new URLSearchParams(window.location.search).get('pfp') }, () => {
  //     window.location = 'productivity.html'
  // })
})
}