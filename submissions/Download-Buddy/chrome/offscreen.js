chrome.runtime.onMessage.addListener(handleMessages);

async function handleMessages(message) {
    if (message.target !== 'offscreen') {
      return;
    }
  
    if (message.type === 'convertUrl') {
      const { url, filename, target } = message.data;
      
      let img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = function() {
          let canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          let ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          let dataURL = canvas.toDataURL(`image/${target}`);
          let blob = dataURItoBlob(dataURL);
          let url = URL.createObjectURL(blob);
            chrome.runtime.sendMessage({
                type: 'download',
                target: 'background',
                data: { url, filename }
            });
      }
    }
}

// copilot helped me with this one 😢
const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}