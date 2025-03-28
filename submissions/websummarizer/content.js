let hasInitialized = false;
const observer = new MutationObserver(checkForContent);

function startObservation() {
  if (!hasInitialized) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });
  }
}

async function checkForContent() {
  const fullText = extractAllText();
  if (fullText.length > 100 && !hasInitialized) {
    hasInitialized = true;
    createQueryInput();
    observer.takeRecords();
  }
}

function extractAllText() {
  const article = document.querySelector('.post-content') || 
                 document.querySelector('article') || 
                 document.body;
  
  return article.innerText
    .replace(/\s+/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

function createQueryInput() {
  if (document.getElementById('flashcard-input-container')) return;

  const container = document.createElement('div');
  container.id = 'flashcard-input-container';
  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    :host {
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      background: white !important;
      padding: 15px !important;
      border-radius: 10px !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15) !important;
      min-width: 300px !important;
    }
    input {
      padding: 10px !important;
      border: 1px solid #ccc !important;
      border-radius: 5px !important;
      width: 100% !important;
      margin-bottom: 10px !important;
    }
    button {
      padding: 8px 12px !important;
      border: none !important;
      border-radius: 5px !important;
      cursor: pointer !important;
      flex: 1 !important;
    }
  `;

  const inputField = document.createElement('input');
  inputField.placeholder = 'Enter your question...';

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '8px';

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Ask';
  submitButton.style.backgroundColor = '#007bff';
  submitButton.style.color = 'white';
  submitButton.onclick = async () => {
    const query = inputField.value.trim();
    if (query) await handleUserQuery(query);
    inputField.value = '';
  };

  const viewButton = document.createElement('button');
  viewButton.textContent = 'View Cards';
  viewButton.style.backgroundColor = '#28a745';
  viewButton.style.color = 'white';
  viewButton.onclick = () => window.open(chrome.runtime.getURL('popup.html'), '_blank');

  buttonContainer.append(submitButton, viewButton);
  shadow.append(style, inputField, buttonContainer);
  document.body.appendChild(container);
}

async function handleUserQuery(query) {
  try {
    const fullText = extractAllText().slice(0, 5000);
    const response = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ZfZOfBjMo21gD3vvU14Bl0aLN9EDU6dMqZYrhCtz"
      },
      body: JSON.stringify({
        max_tokens: 300,
        model: "command-r",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant. Return answers like flashcard responses. Return answers in a couple of sentences, not questions and answers." 
          },
          { 
            role: "user", 
            content: `Based on this content: "${fullText}", answer: "${query}"`
          }
        ]
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const answer = data.message.content[0].text;

    if (!chrome?.storage?.local) {
      alert("Storage API unavailable - Check extension permissions");
      return;
    }

    chrome.storage.local.get({ flashcards: [] }, (data) => {
      const newFlashcard = {
        id: Date.now(),
        question: query,
        answer: answer,
        source: window.location.href
      };
      chrome.storage.local.set({ flashcards: [...data.flashcards, newFlashcard] }, () => {
        if (chrome.runtime.lastError) {
          console.error("Storage error:", chrome.runtime.lastError);
          alert("Failed to save flashcard. Check console for details.");
          return;
        }
        alert(`Flashcard saved!\nQ: ${query}\nA: ${answer.slice(0, 100)}...`);
      });
    });

  } catch (error) {
    console.error("Error:", error);
    alert("Failed to save. Check console for details.");
  }
}
document.addEventListener('DOMContentLoaded', () => {
  startObservation();
  checkForContent(); // Check for content on page load since DOMContentLoaded may not be triggered
});
window.addEventListener('load', startObservation);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) checkForContent();
});