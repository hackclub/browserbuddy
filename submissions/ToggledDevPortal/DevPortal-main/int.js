let search1 = false;
chrome.storage.sync.get(['github'], result => {
    search1 = result.github;
    console.log(search1)
    if (search1) {
        document.getElementById('gh').checked = true
    document.getElementById('ghint').remove()
    }
  });

if (search1) {
    document.getElementById('gh').checked = true
    document.getElementById('ghint').remove()
}

if(new URLSearchParams(window.location.search).get('ghun')) {
    // window.localStorage.setItem('github', new URLSearchParams(window.location.search).get('ghun'))
    chrome.storage.sync.set({ github: new URLSearchParams(window.location.search).get('ghun') }, () => {
        window.location = 'integrations.html'
    })    
}

if(new URLSearchParams(window.location.search).get('repl')) {
    // window.localStorage.setItem('github', new URLSearchParams(window.location.search).get('ghun'))
    const user = JSON.parse(new URLSearchParams(window.location.search).get('repl'))

    const name = user.user
    const uid = user.uid
    const url = user.url
    const pfp = user.pfp
    const bio = user.bio
    const teams = user.teams
    const roles = user.roles

    chrome.storage.sync.set({ replname: name }, () => {
        chrome.storage.sync.set({ repluid: uid }, () => {
            chrome.storage.sync.set({ replurl: url }, () => {
                chrome.storage.sync.set({ replpfp: pfp }, () => {
                    chrome.storage.sync.set({ replbio: bio }, () => {
                        chrome.storage.sync.set({ replit: true }, () => {
                            window.location = 'integrations.html'
                        }) 
                    }) 
                }) 
            }) 
        }) 
    })    
}

document.getElementById('so').addEventListener('click', function() {
    chrome.storage.sync.set({ stack: true }, () => {
        window.location = 'integrations.html'
    })
})
document.getElementById('repl').addEventListener('click', function() {
    window.location = 'https://developer-portal.cosmixcom.repl.co'
    // chrome.storage.sync.set({ replit: true }, () => {
    //     window.location = 'integrations.html'
    // })
})
document.getElementById('pen').addEventListener('click', function() {
    chrome.storage.sync.set({ codepen: true }, () => {
        window.location = 'integrations.html'
    })
})
document.getElementById('pg').addEventListener('click', function() {
    chrome.storage.sync.set({ playground: true }, () => {
        window.location = 'integrations.html'
    })
})

chrome.storage.sync.get(['stack'], result => {
    if (result.stack == true) {
      document.getElementById('so').innerText = 'Disable Integration'
      document.getElementById('st').checked = true
    
      document.getElementById('so').addEventListener('click', function() {
        chrome.storage.sync.set({ stack: false }, () => {
            window.location = 'integrations.html'
        })
    })
    }
  })
  chrome.storage.sync.get(['replit'], result => {
    if (result.replit == true) {
        document.getElementById('repl').innerText = 'Disable Integration'
        document.getElementById('rt').checked = true
      
        document.getElementById('repl').addEventListener('click', function() {
          chrome.storage.sync.set({ replit: false }, () => {
              window.location = 'integrations.html'
          })
        })
    }
  })

  chrome.storage.sync.get(['codepen'], result => {
    if (result.codepen == true) {
        document.getElementById('pen').innerText = 'Disable Integration'
        document.getElementById('ct').checked = true
      
        document.getElementById('pen').addEventListener('click', function() {
          chrome.storage.sync.set({ codepen: false }, () => {
              window.location = 'integrations.html'
          })
        })
    }
  })

  chrome.storage.sync.get(['playground'], result => {
    if (result.playground == true) {
        document.getElementById('pg').innerText = 'Disable Integration'
        document.getElementById('pt').checked = true
      
        document.getElementById('pg').addEventListener('click', function() {
          chrome.storage.sync.set({ playground: false }, () => {
              window.location = 'integrations.html'
          })
        })
    }
  })
//   chrome.storage.sync.get(['github'], result => {
//     if (!result.stack == true) {
//       document.getElementById('github').remove()
//     }
//   })