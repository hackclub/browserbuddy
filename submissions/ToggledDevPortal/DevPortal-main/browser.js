// Function to fetch the title and favicon of a website
async function fetchTitleAndFavicon(url) {
    try {
      const response = await fetch('http://zymono.com/gettitleandfavicon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }  

document.getElementById('google').addEventListener('click', function() {
    set('https://www.google.com/search?q=')
})
document.getElementById('ddg').addEventListener('click', function() {
    set('https://duckduckgo.com/&q=')
})
document.getElementById('bing').addEventListener('click', function() {
    set('https://www.bing.com/search?q=')
})

document.getElementById('ai').addEventListener('click', function() {
  set('https://www.perplexity.ai/search?q=')
})
document.getElementById('custom').addEventListener('click', function() {
    const prompt = window.prompt('Enter a search engine url. (Include /search?q=)')

    if (prompt) {
        set(prompt)
        window.location = 'browsers.html'
    }
})

function set(url) {
    chrome.storage.sync.set({ searchEngine: url }, () => {
        // Update the search form on the homepage
        // const searchForm = chrome.extension.getViews({ type: "tab" })[0]?.document.getElementById('searchForm');
        // if (searchForm) {
        //   searchForm.action = searchEngineURL;
        // }
        alert('Settings saved successfully!');
      });
}

  chrome.storage.sync.get(['searchEngine'], result => {
    const targetURL = result.searchEngine;
fetchTitleAndFavicon(targetURL)
  .then(data => {
    if (data) {
        if (!['google', 'duck', 'bing'].some(substring => targetURL.includes(substring))) {
            document.getElementById('ct').innerText = data.title;
        }
    } else {
      console.log('Failed to fetch data.');
    }
  });
    });