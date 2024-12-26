document.getElementById('search-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      const query = event.target.value;
      if (query.trim()) {
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        chrome.tabs.create({ url: youtubeSearchUrl });
      }
      event.target.value = ''; // Clear input after search
      window.close(); // Close the popup after search
    }
  });
  