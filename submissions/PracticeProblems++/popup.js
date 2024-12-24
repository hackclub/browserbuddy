document.getElementById("searchBtn").addEventListener("click", function () {
    const query = document.getElementById("query").value.trim();
  
    if (query) {
      document.getElementById("loading").style.display = "block";
      chrome.runtime.sendMessage({ action: "search", query: query });
      setTimeout(() => {
        document.getElementById("loading").style.display = "none";
      }, 1000);
    }
  });
  