

function waitForCanvas() {
    if (!window.location.href.includes("cad.onshape.com")) {
        return
    }
    if (document.getElementById("canvas")) {

        a = document.getElementById("canvas")
        a.addEventListener("click",
            handleClick
        );
        return true;
    }
    window.setTimeout(waitForCanvas, 500);
}
const core = new WakaCore();
function handleClick() {
    if (!window.location.href.includes("cad.onshape.com")) {
        return
    }
    let url = window.location.href;
    let heatbeat = core.buildHeartbeat(url);
    console.log(heatbeat);
    try{
        chrome.storage.local.get("heartbeats").then((item) => {
            if (!item.heartbeats) {
                item.heartbeats = []
            }
            item.heartbeats.push(heatbeat)
            chrome.storage.local.set({ heartbeats: item.heartbeats })
          });
    }catch(e){
        alert("A error has occured! Usally this is because you have not refreshed your page after installing the extension. Please refresh the page and try again.")
    }

}

waitForCanvas()