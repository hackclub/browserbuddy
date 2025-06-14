document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveKeyBtn = document.getElementById('saveKey');
  const emailContent = document.getElementById('emailContent');
  const generateBtn = document.getElementById('generateBtn');
  const resultsDiv = document.getElementById('results');

  chrome.storage.sync.get(['apiKey'], (result) => {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
  });

  saveKeyBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({ apiKey }, () => {
        alert('API key saved successfully!');
      });
    }
  });

  generateBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const content = emailContent.value.trim();

    if (!apiKey) {
      alert('Please enter your Gemini API key first!');
      return;
    }

    if (!content) {
      alert('Please enter some email content first!');
      return;
    }

    generateBtn.disabled = true;
    resultsDiv.innerHTML = 'Generating subject lines...';

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate 5 catchy email subject lines for the following email content. Make them engaging and click-worthy, but not clickbait. Format each subject line on a new line:\n\n${content}`
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const subjectLines = data.candidates[0].content.parts[0].text.split('\n').filter(line => line.trim());
        resultsDiv.innerHTML = subjectLines.map(line => 
          `<div class="subject-line" onclick="navigator.clipboard.writeText('${line.replace(/'/g, "\\'")}')">${line}</div>`
        ).join('');
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      resultsDiv.innerHTML = `Error: ${error.message}`;
    } finally {
      generateBtn.disabled = false;
    }
  });
}); 