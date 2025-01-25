// const { all } = require("core-js/fn/promise");


// const  jsPDF  = window.jspdf && window.jspdf.jsPDF;
// const  svg2pdf  = window.svg2pdf && window.svg2pdf.svg2pdf;

// const  SVGtoPDF = window.svgtopdfkit && window.svgtopdfkit.SVGtoPDF;
// import { BlobClient } from 'https://cdn.jsdelivr.net/npm/@vercel/blob@0.27.0/+esm';
//https://score-snap.vercel.app
console.log("Content script loaded.");
const apiUrl = 'https://score-snap.vercel.app'; // Replace with your server's URL and port

batchUrls = []
batchBlobs = []
chrome.runtime.onMessage.addListener(  (message, sender, sendResponse) => {
    if(message.type === 'pdf'){
        sendAResponse(sendResponse, message.quality)
        return true;  // Keep messaging channel open
 }
 if(message.type === "pdf2"){
    if(message.data.type == 'smash'){
        sendAResponse2(sendResponse, message.data.data)
        return true;
    }
    if(message.data.type == 'batch'){  
        console.log(message.data)
        console.log(message.data.key)

        batchMessage(message.data.key, sendResponse)
    }
    return true;
 }
    if(message.type === 'midi'){
        midi();
        sendResponse({status: 'done'});

    }
    if(message.type === 'audio'){
        sendAResponseAudio(sendResponse)
    }
    if(message.type === 'audio2'){
        sendAResponseAudio2(sendResponse, message.data)
        return true;
    }
    if(message.type === 'status'){
        getStatus(sendResponse, message.data.key)
    }
    return true;
});
async function getStatus(sendResponse, key){
    let batch = batchUrls.find(obj => obj.key == key)
    let current = batch.Acurrent -1;
    if(current == batch.total){
        sendResponse({status: 'done'})
    }
    else{
        sendResponse({status: `Batching: ${current}/${batch.total}`})
    }

}
async function batchMessage(data, sendResponse){
    const response = await(batchFinalize(data))
    sendResponse({status: 'done', data: response});
}
async function sendAResponse(sendResponse, quality){
    const response = await(grabber(quality))
    sendResponse({status: 'done', data: response});
}
async function sendAResponse2(sendResponse, data){
    const response = await(fetchURLS(data))
    if(response.status.includes("error")){
        sendResponse({status: 'error', data: 'Please reload the page and try again, or check your connection'})
    }
    sendResponse({status: 'done'})
}
async function sendAResponseAudio(sendResponse){
    const response = await(audio())
    sendResponse({status: response[0], data: response[1]})
}
async function sendAResponseAudio2(sendResponse, data){
    const response = await(proccessAudio(data))
    sendResponse({status: 'done'})
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function midi(){
    console.log('midi clicking')
    const button = document.getElementById("piano-keyboard-button")
    button.click();
    setTimeout(() => {
        button.click();

    },200);


}
async function batchFinalize(key){
    console.log(batchUrls)
    console.log(key)
    let batch = batchUrls.find(obj => obj.key == key)
    
    console.log(batch)
     while(batch.Acurrent < batch.total){//to ensure they all finish prior to batch finalize
        await delay(1000);
     }


     let blobs = batchBlobs.find(obj => obj.key == key)
     console.log(blobs, 'blobs')
     let spreadBlobs = Object.values(blobs).filter(item => typeof item == "string").flat();
    //  Append image blobs or files here instead of Data URLs
        // spreadBlobs.forEach((imageBlob, index) => {
        //     // Ensure the blob has the correct type
        //     const blob = new Blob([imageBlob], { type:  'application/pdf' });
        //     formData.append('images', blob, `image-${index}.png`);
        // });
        console.log(spreadBlobs, 'spreadBlobs')
        const urlParams = new URLSearchParams({ urls: spreadBlobs.join(',') });
        await fetch(`${apiUrl}/pdffrombatch?${urlParams}`,{
            method: 'POST',
      
            // body: formData
        }).then((response) => response.blob()).then((blob) => {
            let div = document.getElementById('aside-container-unique');
            console.log(div)
            let text = div.querySelector('h1')
            console.log(text)
             text = text.querySelector('span').innerText
             console.log(blob)
            const url = window.URL.createObjectURL(blob); // Create a temporary URL 
            const link = document.createElement('a');
            link.href = url;
            link.download = text+'.pdf'; // Set a filename for download
            document.body.appendChild(link); // Add the link to the DOM
            link.click();
    })

}
function bufferToBlob(buffer) {
    const uint8Array = new Uint8Array(buffer);
    return new Blob([uint8Array], { type: 'image/png' });
}
function processJsonBlob(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const json = JSON.parse(reader.result); 
                resolve(json);
            } catch (error) {
                reject("Error parsing JSON: " + error.message);
            }
        };

        reader.onerror = () => reject("Error reading Blob: " + reader.error);

        reader.readAsText(blob); 
    });
}

async function batchProccessing(key){
    let batch = batchUrls.find(obj => obj.key == key)
    console.log(batch)
    let index = 0;
    while(batch.Acurrent < batch.total){
        console.log('waiting for batches to finish')
        console.log(batch.current, batch.total)
        if(batch.current<batch.exists ){//try incrementin batch.current beofre and after the fetch
            console.log('fetching batch')
            console.log(batch)
            let url = batch[batch.current+1]//this is all wrong btw, but we can fix l8tr
            console.log(url)
             batch.current += 1;

            // index +=1;
             fetch(url).then((response) => response.json()).then((data) => {
                    // console.log(data.url)
                    // console.log(data['url'])
                    // console.log(data.url.downloadUrl)
                    // blobs = []
                    // dataURLs.forEach((dataURL) => {
                    //     console.log(dataURL)
                    //     console.log(dataURL['data'])
                    //     blobs.push(bufferToBlob(dataURL['data']));
                    // });
                    // blob = new Blob(blob, { type: 'application/pdf' });
                    if(index == 0){
                        console.log('finish proccessing first bach')
                        console.log(data.url.downloadUrl, "url")
                        batchBlobs.push({key: key, total: batch.total, current: 0, [index]: data.url.downloadUrl})
                    }else{
                        console.log('proccessing batch')
                        let edit = batchBlobs.find(obj => obj.key == key)

                        console.log(edit)
                        edit[index] = data.url.downloadUrl;
                    }
                    batch.Acurrent+=1;
                   index++

             

            })
        }else{
            await delay(300)
        }


    }
    batch.current += 1;
}
async function proccessAudio(url){
    let div = document.getElementById('aside-container-unique');
    console.log(div)
    let text = div.querySelector('h1')
    console.log(text)
     text = text.querySelector('span').innerText

    console.log('fetching')
    return new Promise((resolve, reject) => {
        try{
            let fetchurl = apiUrl + "/audio?url=" + encodeURIComponent(url)
            fetch(fetchurl).then((response) => response.blob()).then((blob) => {
                console.log('fetched')
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = text+'.mp3';
                document.body.appendChild(link);
                link.click();
                resolve("done")
            })
        }catch(e){
            console.error(e)
            reject(e)
        }
    })

 
}
async function audio(){
    let audio = document.getElementsByTagName("audio")
    let div = document.getElementById('aside-container-unique');
    console.log(div)
    let text = div.querySelector('h1')
    console.log(text)
     text = text.querySelector('span').innerText
    return new Promise((resolve, reject) => {
        if(audio.length == 0){
            let playbutton = document.getElementById("scorePlayButton")
            playbutton.click()
            // setTimeout(()=>{playbutton.click()},1000)
            setTimeout(async ()=>{
                audio = document.getElementsByTagName("audio")
                let url = audio[0].src
                console.log(url, 'is it custom?') 
                if(!url.includes("data:audio")){
                    if(!url.includes("custom")){
                        const link = document.createElement('a');
                        link.href = url
                        link.download = text+'.mp3';
                        document.body.appendChild(link); 
                        link.click()        
                    resolve(["done", 'none'])
                    }else{
                        resolve(["custom", url])
                    }
                }else{
                    setTimeout(async ()=>{
                        audio = document.getElementsByTagName("audio")
                        let url = audio[0].src
                        console.log(url, 'is it custom?') 
                        if(!url.includes("data:audio")){
                            if(!url.includes("custom")){
                                const link = document.createElement('a');
                                link.href = url
                                link.download = text+'.mp3';
                                document.body.appendChild(link); 
                                link.click()        
                            resolve(["done", 'none'])
                            }else{
                                resolve(["custom", url])
                            }
                        }else{
                            
                        }
                       
                    },500)
                }
               
            },100)
      
        }else{
            console.log(audio)
            let url = audio[0].src
            if(!url.includes("custom")){
                const link = document.createElement('a');
                link.href = url
                link.download = text+'.mp3';
                document.body.appendChild(link); 
                link.click()
                resolve(["done", 'none'])
    
            }else{
                resolve(["custom", url])
    
            }
         
        }
        
    });
 

}
async function grabber(quality){
    console.log("grabbing")
    let maxAttemps = 10;
    const stepComponent = document.getElementById('step-4');
    let pagenum = 0;
    let allLinks = [];
    let classname = "";
        let scrollerComponent = document.getElementById('jmuse-scroller-component');
        const images = scrollerComponent.querySelectorAll('img');
        pagenum = images[0].alt.slice(-10).replace(/^\D+|\D+$/g, "")
        // canvas.width = 1000; // Adjust as needed
        // canvas.height = 2000; 
        console.log(pagenum)
        let index = 1;
        let smash = true
        let key = 0; 
        threshold = 4;
        if(quality.width < 1000){
            threshold = 14
        }
        if(quality.width < 500){
            threshold = 19
        }
        let total = Math.ceil(pagenum/(threshold)) //roudn up
        if(pagenum > threshold){
            smash = false;
            key = (Math.random() + 1) * 164235 + Math.random() * 643267
        }
        return new Promise((resolve, reject) => {
            const scroll = setInterval(async () => {
                console.log("scrolling")
                scrollerComponent.scrollBy(0, 1000);
                scrollerComponent = document.getElementById('jmuse-scroller-component');
                const images = scrollerComponent.querySelectorAll('img');
                if(allLinks.length == 0){
                    classname = images[0].className;
                }
                for(img of images){
                    if(allLinks.includes(img.src)){
                        console.log("already grabbed image")}
                    else{
                        try{
                            if(img.className == classname){
    
                                if(img.src != ""){
                                    if(img.src.includes('.png')){
                                        smash = true;
                                    }
                                    // console.log(img.src)
                                    allLinks.push(img.src);
                                    if((allLinks.length >((threshold)*index )-1 || allLinks.length==pagenum) && !smash){
                                        if(allLinks.length==pagenum){
                                            console.log('reached end')
                                        }
                                        console.log("reached 10 images")
                                        Tenlinks = allLinks.slice((index-1) * threshold, index*threshold)
                                        console.log(allLinks)
                                        console.log(Tenlinks)
                                        Tenlinks.push(quality)
                                        const urlParams = new URLSearchParams({ urls: Tenlinks.join(',') });
                                        const batchedURL = `${apiUrl}/batch?${urlParams.toString()}`;    
                                        if(index==1){
                                            batchUrls.push({key: key,total:total, current: 0, Acurrent:0, exists: 1, [index]: batchedURL})
                                            batchProccessing(key)
                                        }else{
                                            let edit = batchUrls.find(obj => obj.key == key)
                                            edit[index] = batchedURL;
                                            edit.exists += 1;
                                        }
                                        index += 1;

                                    }
                                    // console.log("grabbing image")
        
                                };
    
    
                            }else{
                                console.log("image not part of score")
                            }
                          
    
                        }catch(e){
                            console.error(e)
                            
                        }
                    }
                }
    
      
                if (scrollerComponent.scrollHeight - scrollerComponent.scrollTop <= scrollerComponent.clientHeight + 100 &&(allLinks.length==pagenum)    ) {
                    // Stop scrolling when the bottom is reached
                    console.log(allLinks)
                    console.log(allLinks.length)
                    if(allLinks.length != pagenum){
                        return "Error: Try increasing delay in the settings(top right)"
                    }
                    clearInterval(scroll);
                    allLinks.push(quality)
                    const urlParams = new URLSearchParams({ urls: allLinks.join(',') });
                    const finalUrl = `${apiUrl}/proccess?${urlParams.toString()}`;    
                    if(smash){
                        resolve({data: finalUrl, type: 'smash'})

                    }else{
                        resolve({type: 'batch', key: key})    
                    }
              }
            }, 500);
            console.log(scrollerComponent.innerHTML)

        })

        
    

    
}
async function fetchURLS(finalUrl){
    console.log(finalUrl)
    return new Promise((resolve, reject) => {
        fetch(finalUrl)
    .then(response => {
        if (!response.ok) {
            console.log(response)
        throw new Error('Network response was not ok'); 
        resolve({status: 'error', error: error});

        }
        return response.blob(); // Get the PDF as a Blob
    })
    .then(pdfBlob => {
        let div = document.getElementById('aside-container-unique');
        console.log(div)
        let text = div.querySelector('h1')
        console.log(text)
         text = text.querySelector('span').innerText
        const url = window.URL.createObjectURL(pdfBlob); // Create a temporary URL 
        const link = document.createElement('a');
        link.href = url;
        link.download = text+'.pdf'; // Set a filename for download
        document.body.appendChild(link); // Add the link to the DOM
        resolve({status: 'done' , result: finalUrl});

        link.click(); // Trigger the download
    })
    .catch(error => {
        console.error('Error fetching PDF:', error);
        resolve({status: 'error', error: error});
    });

    })
    
}
window.addEventListener('load', () => {
    // grabber()

})