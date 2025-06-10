document.addEventListener('DOMContentLoaded', async () => {
  const apiKeySection = document.getElementById('api-key-section');
  const loadingSection = document.getElementById('loading-section');
  const contentSection = document.getElementById('content-section');
  const summaryDiv = document.getElementById('summary');
  const keypointsUl = document.getElementById('keypoints');
  const saveButton = document.getElementById('save-key');
  const apiKeyInput = document.getElementById('api-key');

  // Check for saved API key
  chrome.storage.sync.get(['hf_api_key'], (result) => {
    if (!result.hf_api_key) {
      apiKeySection.style.display = 'block';
      contentSection.style.display = 'none';
      loadingSection.style.display = 'none';
    } else {
      apiKeySection.style.display = 'none';
      loadContent();
    }
  });

  // Save API key handler
  saveButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      alert('Please enter a valid API key');
      return;
    }

    await chrome.storage.sync.set({ hf_api_key: apiKey });
    apiKeySection.style.display = 'none';
    
    // Get currently selected text if any
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(tab.id, {type: "GET_SELECTION"}, async (response) => {
        if (response && response.selectedText) {
          loadingSection.style.display = 'block';
          const result = await chrome.runtime.sendMessage({
            type: "SUMMARIZE",
            text: response.selectedText
          });
          loadContent();
        } else {
          contentSection.style.display = 'block';
        }
      });
    });
  });

  function loadContent() {
    chrome.storage.local.get(['summary', 'keypoints', 'isLoading'], (data) => {
      if (data.isLoading) {
        loadingSection.style.display = 'block';
        contentSection.style.display = 'none';
        return;
      }

      loadingSection.style.display = 'none';
      contentSection.style.display = 'block';

      if (data.summary) {
        summaryDiv.innerText = data.summary;
      }

      if (data.keypoints && data.keypoints.length > 0) {
        keypointsUl.innerHTML = data.keypoints
          .map(point => `<li>${point}</li>`)
          .join('');
      } else {
        keypointsUl.innerHTML = "<li>No key points available.</li>";
      }
    });
  }

  // Storage change listener
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.isLoading || changes.summary || changes.keypoints) {
      loadContent();
    }
  });
});