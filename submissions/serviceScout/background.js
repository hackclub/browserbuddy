async function pingUrl(url){
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://'+url;
    }
    if (!/\b(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\b/i.test(url)){
        
        console.log("not an ip address",url)
        if ((!/\.[a-z]{2,}(\/|$)/i.test(url))){
            console.log("doesn't have domain")
            url = url + '.com';
        }
    }
    
    try{
        const headResponse = await fetch(
            url,
            {
                method: 'HEAD',
                mode: 'no-cors'
            }
        );
        if (headResponse.ok || headResponse.type === 'opaque') {
            return true;
        } else {
            console.log("HEAD request failed")
            return getURL(url);
        }
        
    }catch (error){
        console.log("HEAD request internal error");
        return getURL(url);
    }
}

async function getURL(url){
    try {
        const getResponse = await fetch(
            url,
            {
                method: 'GET',
                mode: 'no-cors'
            }
        );
        if (getResponse.ok){
            return true;
        } else {
            console.log("GET request failed");
            return false;
        }
    } catch (error){
        console.log("GET request internal error");
        return false;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{
    if (message.action === "ping"){
        console.log(message.url);
        pingUrl(message.url).then((isReachable) => {
            sendResponse({reachable: isReachable});
        });
        return true;
    }
})