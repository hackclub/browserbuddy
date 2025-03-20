setInterval(() => {
  chrome.runtime.sendMessage({ action: "logStudyTime", time: 10 }, response => {
    if (chrome.runtime.lastError) {
      console.warn("Background script is inactive.");
    } else {
      console.log(response.status);
    }
  });
}, 10000); // Send data every 10 seconds
