function getCurrentTabUrl(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    callback(tab.url);
  });
}


function saveRating(rating) {
  getCurrentTabUrl(function(url) {
    chrome.storage.local.get(['ratings'], function(result) {
      let ratings = result.ratings || {};
      ratings[url] = rating;
      chrome.storage.local.set({ 'ratings': ratings });
    });
  });
}

function loadRating() {
  getCurrentTabUrl(function(url) {
    chrome.storage.local.get(['ratings'], function(result) {
      let ratings = result.ratings || {};
      let rating = ratings[url];
      if (rating) {
        document.getElementById('result-message').textContent = `You rated this tab ${rating} stars!`;
      }
    });
  });
}

function displayTopSites() {
  chrome.storage.local.get(['ratings'], function(result) {
    let ratings = result.ratings || {};
    let sortedRatings = Object.keys(ratings).sort((a, b) => ratings[b] - ratings[a]);
    let topSitesList = document.getElementById('top-sites-list');
    topSitesList.innerHTML = ''; // Clear list

    sortedRatings.slice(0, 10).forEach(url => {
      let li = document.createElement('li');
      li.textContent = `${url} - ${ratings[url]} stars`;
      topSitesList.appendChild(li);
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const ratingButtons = document.querySelectorAll('.rate-btn');
  const topSitesBtn = document.getElementById('top-sites-btn');

  loadRating();

  ratingButtons.forEach(button => {
    button.addEventListener('click', function() {
      const rating = this.getAttribute('data-rating');
      saveRating(rating);
      document.getElementById('result-message').textContent = `You rated this tab ${rating} stars!`;
    });
  });

  topSitesBtn.addEventListener('click', displayTopSites);
  const themeSwitch = document.getElementById('theme-switch');
  themeSwitch.addEventListener('change', function() {
    if (this.checked) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  });
});
