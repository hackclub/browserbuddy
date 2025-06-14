toggledShorts=false;

function hideCategories(){
  const categories=document.querySelector("iron-selector#chips");

  if(categories){
    categories.remove();
  }

  const categoriesCont=document.querySelector("ytd-feed-filter-chip-bar-renderer");
  if(categoriesCont){
    categoriesCont.remove();
  }
}

function hideSidebar(){
  const sidebar=document.querySelector("ytd-mini-guide-renderer");
  if(sidebar){
    sidebar.style.display="none";
  }
}

function hideShorts(){
  // Toggling shorts from sidebar
  const sidebarShorts = document.querySelector("ytd-mini-guide-entry-renderer[aria-label='Shorts']");
  if (sidebarShorts && !toggledShorts) {
    sidebarShorts.style.display = "none";
    toggledShorts=true;
  }
  // Toggling shorts from extended sidebar
  const sidebarExShorts=document.querySelector("a.yt-simple-endpoint[title='Shorts']");
  if(sidebarExShorts){
    sidebarExShorts.style.display="none";
  }
  // Toggling shorts sections
  const shortVid=document.querySelectorAll("ytd-rich-item-renderer[is-slim-media]");
  if(shortVid){
    shortVid.forEach((e)=>{
      e.style.display="none";
    });
  }
  // Toggling shorts 
  const shortVidHeader=document.querySelectorAll("div#rich-shelf-header");
  if (shortVidHeader){
    shortVidHeader.forEach((a)=>{
      a.style.display="none";
    });
  }

  // toggling short recommendations while at a video
  const shortRecom=document.querySelectorAll("ytd-reel-shelf-renderer");
  if (shortRecom){
    shortRecom.forEach((e)=>{
      e.style.display="none";
    })
  }

  if (window.location.href.includes("youtube.com/shorts/")) {
    console.log("Redirecting from Shorts...");
    window.location.replace("https://www.youtube.com/");
}

}



const observer = new MutationObserver(() =>{
  chrome.storage.local.get("hideshorts", (data) => {
    if (data.hideshorts) {
        hideShorts();
    } 
  });
  chrome.storage.local.get("hidecategories", (data) => {
    if (data.hidecategories) {
        console.log("Hiding categories");
        hideCategories();
    } 
  });
  chrome.storage.local.get("hidesidebar", (data) => {
    if (data.hidesidebar) {
        hideSidebar();
    } 
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.hideshorts !== undefined) {
      if (message.hideshorts) {
          hideShorts();
      }
  }
  if (message.hidecategories!== undefined){
    if(message.hidecategories){
      hideCategories();
    }
  }
  if(message.hidesidebar!==undefined){
    if(message.hidesidebar){
      hideSidebar();
    }
  }
  if(message.theme!==undefined && message.tabID!==undefined){
      // sending message to worker to apply theme
      chrome.runtime.sendMessage({ action: "applyCSS",theme:message.theme,tabID:message.tabID });
  }
});

observer.observe(document.body, { childList: true, subtree: true });

