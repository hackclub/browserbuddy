const storage = (function() {
  if (typeof browser !== "undefined") {
    return browser.storage.local;
  } else if (typeof chrome !== "undefined") {
    return chrome.storage.local;
  } else {
    throw new Error("Unsupported browser");
  }
})();

function initializeKey(key, index) {
  const urlList = document.querySelectorAll('.urlList');
  storage.get([key], (result) => {
    if (result[key] === undefined) {
      storage.set({ [key]: '' }, () => {
        console.log(`Key "${key}" was missing; initialized to an empty string.`);
      });
      urlList[index].value = "Enter URL";
    } else {
      urlList[index].value = result[key];
      updateList(index, urlList[index].value);
    }
  });
}

initializeKey('url1', 0);
initializeKey('url2', 1);
initializeKey('url3', 2);

document.getElementById("pingButton").addEventListener("click",()=>{
    const url = document.getElementById("url").value;
    document.getElementById("result").textContent = "Loading...";
    chrome.runtime.sendMessage({ action: "ping", url }, (response) => {
        const result = response.reachable
          ? "Website is reachable!"
          : "Website is not reachable.";
        document.getElementById("result").textContent = result;
        if (result=="Website is reachable!"){
            document.getElementById("pingColor").style.backgroundColor='rgb(69, 169, 69)';
        }else{
            document.getElementById("pingColor").style.backgroundColor='rgb(225, 91, 91)';
        }
      });
});    

document.querySelectorAll('.urlList').forEach((element,index)=>{
  element.addEventListener('change', (event) => {
    const url = event.target.value;
    if (index == 0){chrome.storage.local.set({ url1: url })}
    if (index == 1){chrome.storage.local.set({ url2: url })}
    if (index == 2){chrome.storage.local.set({ url3: url })}
    updateList(index,url);
  });
})

function updateList(index,url){
    chrome.runtime.sendMessage({ action: "ping", url }, (response) => {
      const result = response.reachable
          ? "Website is reachable!"
          : "Website is not reachable.";
      console.log(`${result}, index:${index}`);
      const colours = document.querySelectorAll('.pingListColor');
      if (index<colours.length){
        if (result=="Website is reachable!"){
          colours[index].style.backgroundColor='rgb(69, 169, 69)';
        }else{
          colours[index].style.backgroundColor='rgb(225, 91, 91)';
        }
      }
    });
}