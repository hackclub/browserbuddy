chrome.runtime.onInstalled.addListener(() => {
  updateIcon();
});

function updateIcon() {
  const today = new Date();
  const month = today.getMonth();
  const isChristmas = month === 10 || month === 11; // November or December
  const path = isChristmas ? 'christmas' : 'regular';
  
  chrome.action.setIcon({
    path: {
      "16": `icons/${path}16.png`,
      "48": `icons/${path}48.png`,
      "128": `icons/${path}128.png`
    }
  });
}

// Check date periodically to update icon
setInterval(updateIcon, 1000 * 60 * 60); // Check every hour
