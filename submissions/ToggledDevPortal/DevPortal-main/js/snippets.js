chrome.storage.sync.get(['snippets'], result => {
    if (result.snippets) {
        console.log(result.snippets)
        const snippets = JSON.parse(result.snippets)

        snippets.forEach(snippet => {
            const trimmedCode = snippet.code.length > 300 ? `${snippet.code.slice(0, 300)}...` : snippet.code;

            const a = `<article class="card">
            <div class="card-header">
                <div>
                  <span><img src="https://i.imgur.com/JQ9Ugph.png" /></span>
                    <a style="color: #e8e8e8; text-decoration: none;" href='#del-${window.btoa({ name: snippet.name, code: snippet.code })}' title="Delete Snippet"><h3>${snippet.name}</h3></a>
                </div>
            </div>
            <div class="card-body">
                <p><code>${trimmedCode}</code></p>
            </div>
            <div class="card-footer">
            <a href="#snippets-${snippet.code}" style="margin-right: 8px;">Share Snippet</a>
                <form action="https://codepen.io/pen/define" method="POST" target="_blank" style="display: flex;">
                <input type="hidden" name="data" value='{"title": "New Dev Pen!", "html": "${snippet.code}"}'>
                    <input type="submit" value="Open in Codepen" class="button">
                </form>
            </div>
        </article>`
  
        const cards = document.getElementById('id')
        cards.innerHTML += a
        });
    }
})

document.getElementById('new').addEventListener('click', function() {
    const prompt = window.prompt('Please choose a name for your code snippet...')

    if (prompt) {
        const prompt2 = window.prompt('Please choose enter code for your snippet...')
        if (prompt2) {
            chrome.storage.sync.get(['snippets'], result => {
                if (result.snippets) {
                    const snippets = JSON.parse(result.snippets)
                    snippets.push({
                        name: prompt,
                        code: prompt2
                    })
                    chrome.storage.sync.set({ snippets: JSON.stringify(snippets) }, () => {
                        window.location = 'snippets.html'
                    })
                } else {
                    const snippets = []
                    snippets.push({
                        name: prompt,
                        code: prompt2
                    })
                    chrome.storage.sync.set({ snippets: JSON.stringify(snippets) }, () => {
                        window.location = 'snippets.html'
                    })
                }
            })
        }
    }
})

function copyToClipboard(text) {
    // Create a temporary textarea element to hold the text
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Make the textarea hidden from the user
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    
    // Append the textarea to the DOM
    document.body.appendChild(textarea);
    
    // Select and copy the text from the textarea
    textarea.select();
    document.execCommand('copy');
    
    // Remove the temporary textarea
    document.body.removeChild(textarea);
    
}

function handleHashChange() {
    console.log(window.location.hash)
    // This function will be called whenever the hash in the URL changes.
    // You can add your logic here to respond to the hash change.
    if (String(window.location.hash).includes('snippets-')) {
      const hash = String(window.location.hash).split('#snippets-')[1]
        copyToClipboard(window.btoa(hash))
       if (window.confirm(`Send this code to another DevPortal user for them to import. (It has been copied to your clipboard) 
       
${window.btoa(hash)}`)) {
        window.location = '#'
       } else {
        window.location = '#'
       }
    }
    if (String(window.location.hash).includes('del-')) {
        const hash = String(window.location.hash).split('#del-')[1]
        chrome.storage.sync.get(['snippets'], result => {
            if (result.snippets) {
                const snippets = JSON.parse(result.snippets)
                let objectToDelete = window.atob(hash);

// Find the index of the object in the array
                let indexToDelete = snippets.findIndex((obj) => obj.id === objectToDelete.id);

                snippets.splice(indexToDelete, 1);
                chrome.storage.sync.set({ snippets: JSON.stringify(snippets) }, () => {
                    window.location = 'snippets.html'
                })
            } else {
                alert("Cannot delete a snippet that doesn't exist!")
            }
        })
      }
  }

  window.addEventListener('hashchange', handleHashChange);

  document.getElementById('import').addEventListener('click', function() {
    const prompt = window.prompt('Please enter a snippet code.')

    if (prompt) {
        // const prompt2 = window.prompt('Please choose enter code for your snippet...')

            chrome.storage.sync.get(['snippets'], result => {
                if (result.snippets) {
                    const snippets = JSON.parse(result.snippets)
                    snippets.push({
                        name: `Snippet ${snippets.length}`,
                        code: window.atob(prompt)
                    })
                    chrome.storage.sync.set({ snippets: JSON.stringify(snippets) }, () => {
                        window.location = 'snippets.html'
                    })
                } else {
                    const snippets = []
                    snippets.push({
                        name: `Snippet ${snippets.length}`,
                        code: window.atob(prompt)
                    })
                    chrome.storage.sync.set({ snippets: JSON.stringify(snippets) }, () => {
                        window.location = 'snippets.html'
                    })
                }
            })
    }
})

// chrome.storage.sync.set({ snippets: JSON.stringify([]) }, () => {
// })