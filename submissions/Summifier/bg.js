const SUMMARIZE_API_URL = 'https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6';

function extractKeypoints(summary) {
  let sentences = summary.split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);
  const importanceMarkers = [
    'importantly',
    'significantly',
    'notably',
    'key',
    'main',
    'primary',
    'essential',
    'crucial',
    'critical',
    'major'
  ];

  let keypoints = sentences.filter(sentence => 
    importanceMarkers.some(marker => 
      sentence.toLowerCase().includes(marker)
    )
  );

  // If no sentences with importance markers, take the first 3 sentences
  if (keypoints.length === 0) {
    keypoints = sentences.slice(0, 3);
  }

  // Add bullet points and clean up
  return keypoints.map(point => 
    point.charAt(0).toUpperCase() + point.slice(1)
  );
}

async function getApiKey() {
  const result = await chrome.storage.sync.get(['hf_api_key']);
  return result.hf_api_key;
}

async function summarizeText(text) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    return {
      summary: "Please set your Hugging Face API key in extension settings",
      keypoints: ["API key not configured"]
    };
  }
  const MAX_CHARS = 1000;
  const truncatedText = text.length > MAX_CHARS ? 
    text.substring(0, MAX_CHARS) + "..." : 
    text;
  
  try {
    const response = await fetch(SUMMARIZE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: truncatedText,
        parameters: {
          max_length: 150,
          min_length: 40,
          do_sample: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const result = await response.json();
    const summary = result[0]?.summary_text || "Could not generate summary.";
    const keypoints = extractKeypoints(summary);
    return { summary, keypoints };
  } catch (error) {
    console.error('Summarization error:', error);
    return { 
      summary: "Error generating summary.", 
      keypoints: ["Error extracting key points."] 
    };
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarize",
    title: "Summarize selected text",
    contexts: ["selection"]
  });
});

async function checkApiKey() {
  const result = await chrome.storage.sync.get(['hf_api_key']);
  return result.hf_api_key;
}

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (!info.selectionText) return;

  if (info.menuItemId === "summarize") {
    const apiKey = await checkApiKey();
    if (!apiKey) {
      chrome.action.openPopup();
      return;
    }
    
    // Show loading state
    chrome.storage.local.set({ isLoading: true });
    chrome.action.openPopup();
    
    const result = await summarizeText(info.selectionText);
    chrome.storage.local.set({ 
      summary: result.summary, 
      keypoints: result.keypoints,
      isLoading: false 
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SUMMARIZE") {
    summarizeText(request.text).then(result => {
      chrome.storage.local.set({
        summary: result.summary,
        keypoints: result.keypoints,
        isLoading: false
      });
      sendResponse(result);
    });
    return true; // Will respond asynchronously
  }
});
