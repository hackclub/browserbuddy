    // Replace 'YOUR_USERNAME_HERE' with your GitHub username
    let username = false;
    chrome.storage.sync.get(['github'], result => {
        username = result.github;
        console.log(username)
        if (!username) {
          window.location = 'integrations.html'
      }

      // GitHub API URL to fetch user repositories
      const apiUrl = `https://api.github.com/users/${username}/repos`;

    // Fetch the data from the GitHub API
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        // Process the data and display repositories
        const repoList = document.getElementById('repo-list');
        data.forEach(repo => {
          const a = `<article class="card">
          <div class="card-header">
              <div>
                <span><img src="https://assets.codepen.io/285131/github.svg" /></span>
                  <h3>${repo.name}</h3>
              </div>
          </div>
          <div class="card-body">
              <p>${repo.description}.</p>
          </div>
          <div class="card-footer">
              <a href="${repo.html_url}">Open</a>
              <a style="margin-left: 1%">-</a>
              <a href="${repo.html_url}/compare"><button title="New Pull Reqyest" class="btn">🔃</button></a>
          </div>
      </article>`

      const cards = document.getElementById('id')
      cards.innerHTML += a
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

      });
      try {
        chrome.storage.sync.get(['snippet'], result => {
          if (!result.snippet == true) {
            document.getElementById('snippetbtn').remove()
          }
        })
      } catch {}