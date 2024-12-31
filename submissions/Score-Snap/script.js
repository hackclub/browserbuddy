
grabbing = false;
let midi_url = null;
let auth = null;
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function grab() {
    const [tab] = await chrome.tabs.query({active: true});
    console.log(tab);
    console.log(tab.url);
    if (tab.url.includes("musescore.com/user")) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: "msg_from_popup"}, function(response) {
            });
        });
        return tab.url;
    } else {
        return 'Could not grab: Not a musescore.com page';
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const regexMatch = /(https:\/\/)?musescore\.com\/user(\/\d+)?\/scores\/\d+/;
    const regexMatch2 =  /musescore\.com\/[^/]+\/scores\/[^/]+/;

    if (!regexMatch.test(tab.url) && !regexMatch2.test(tab.url)) {
        document.getElementById("msg").innerText = "Please go to a musescore.com score page to use this extension";
        return;
    }
    document.getElementById("button").addEventListener("click", async () => {
        document.getElementById("button").setAttribute("disabled", "true");
        document.getElementById("button").style.backgroundColor = "gray";
        document.getElementById("msg").innerText = "Scanning Pages..."
        const quality = document.getElementById("pdfQuality").value;
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

        const response = await new Promise((resolve) => {
            chrome.tabs.sendMessage(tab.id, {type: 'pdf',quality: quality}, (response) => {
                console.log('4. Got response:', response);
                if(response.type == "batch"){
                    document.getElementById("msg").innerText = "Batching... this may take longer than normal"
                }else{
                    document.getElementById("msg").innerText = "Processing PDF..."
                }

                resolve(response.data);
            });
        });
        const response2 =  new Promise((resolve) => {
            chrome.tabs.sendMessage(tab.id, {type: 'pdf2', data: response}, (response) => {
                console.log('4. Got response:', response);
                if(response.status == 'done'){
                    document.getElementById("button").removeAttribute("disabled");
                    document.getElementById("button").style.backgroundColor = "4CAF50";
                    document.getElementById("msg").innerText = "Done!"
                }
                if(response.status == 'error'){
                    document.getElementById("msg").innerText = response.data
                    document.getElementById("button").removeAttribute("disabled");
                    document.getElementById("button").style.backgroundColor = "4CAF50";

                }

                resolve(response);
            });
        });
        console.log('continuing')
        let finished = false;
        if(response.type == "batch"){
            while(!finished) {
                const statusCheck = new Promise((resolve) => {
                    chrome.tabs.sendMessage(tab.id, {type: 'status', data: response}, (response) => {
                        if(response.status === 'done'){
                            finished = true;
                            document.getElementById("msg").innerText = "Almost done...";

                        } else {
                            document.getElementById("msg").innerText = response.status;
                        }
                        resolve(response);
                    });
                });
        
                // Wait for status check to complete
                await statusCheck;
                await delay(1000);
            }
        }
      

        // })
        
    });
    document.getElementById("midi").addEventListener("click", async () => {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        // chrome.tabs.sendMessage(tab.id, {type: 'midi'}, function(response) {
        //     // console.log(response.status);
        // });
        console.log("clicked");
        document.getElementById("midi").setAttribute("disabled", "true");
        document.getElementById("midi").style.backgroundColor = "gray";

        console.log(auth, "auth", midi_url, "midi_url");
        if(midi_url == null || auth == null){
            chrome.tabs.sendMessage(tab.id, {type: 'midi'}, function(response) {
                setTimeout(() => {
                    fetch(midi_url, {
                        headers: {
                            'Authorization': auth
                        }
                    }).then(response => response.json()).then(json => {

                        const url = json.info.url;
                        console.log("url", url);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'midi.midi';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        document.getElementById("midi").removeAttribute("disabled");
                        document.getElementById("midi").style.backgroundColor = "4CAF50";

        
                    });   
                }, 300);
                  });
        }else{
    
            fetch(midi_url, {
                headers: {
                    'Authorization': auth
                }
            }).then(response => response.json()).then(json => {
                const url = json.info.url;
                console.log("url", url);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'midi.midi';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                document.getElementById("midi").removeAttribute("disabled");
                document.getElementById("midi").style.backgroundColor = "4CAF50";

            });
        }
      
   
    
    
    })
    document.getElementById("audio").addEventListener("click", async () => {
        document.getElementById("audio").setAttribute("disabled", "true");
        document.getElementById("audio").style.backgroundColor = "gray";
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        const response = await new Promise((resolve) => {
            chrome.tabs.sendMessage(tab.id, {type: 'audio'}, (response) => {
                console.log('4. Got response:', response);
                if(response.status == 'done'){
                    document.getElementById("audio").removeAttribute("disabled");
                    document.getElementById("audio").style.backgroundColor = "4CAF50";
                }
                if(response.status == 'custom'){
                    console.log('proccess')
                    document.getElementById("msg").innerText = "This audio needs to be processed, please wait..."
                    const response2 = new Promise((resolve) => {
                        chrome.tabs.sendMessage(tab.id, {type: 'audio2', data: response.data}, (response) => {
                            console.log('4. Got response:', response);
                            document.getElementById("audio").removeAttribute("disabled");
                            document.getElementById("audio").style.backgroundColor = "4CAF50";
                            document.getElementById("msg").innerText = "Done!"
                            resolve(response);
                        });
                    });
                }
                resolve(response.data);
            });
        });
    });
})


  chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
    if(details.url.includes("midi")){
        midi_url = details.url;
        auth = details.requestHeaders[1].value;
        console.log(auth);
    }
    },
    { urls: ["https://*.musescore.com/*"] },
    ["requestHeaders"]
  );
  browser.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
      if(details.url.includes("midi")) {
        midi_url = details.url;
        auth = details.requestHeaders.find(h => h.name === 'Authorization')?.value;
        console.log(auth);
      }
    },
    { urls: ["https://*.musescore.com/*"] },
    ["requestHeaders"]
  );