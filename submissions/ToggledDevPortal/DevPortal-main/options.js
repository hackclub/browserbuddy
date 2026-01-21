// Load and save the search engine setting
const optionsForm = document.getElementById('optionsForm');
const searchEngineInput = optionsForm.searchEngine;

// Load the saved search engine URL and populate the input field

// Save the search engine URL when the user submits the form
optionsForm.addEventListener('submit', event => {
  event.preventDefault();
  const searchEngineURL = searchEngineInput.value;
  chrome.storage.sync.set({ searchEngine: searchEngineURL }, () => {
    // Update the search form on the homepage
    const searchForm = chrome.extension.getViews({ type: "tab" })[0]?.document.getElementById('searchForm');
    if (searchForm) {
      searchForm.action = searchEngineURL;
    }
    alert('Settings saved successfully!');
  });
});
