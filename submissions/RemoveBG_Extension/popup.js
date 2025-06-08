document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("alertMessage", (data) => {
    const messageElement = document.getElementById("message");
    messageElement.textContent = data.alertMessage || "Nothing yet";
  });

  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "SHOW_ALERT") {
      document.getElementById("message").textContent = request.message;
    } else if (request.type === "COPY_TO_CLIPBOARD") {
      handleClipboardCopy(request.data);
    }
  });

  document.getElementById("close").addEventListener("click", () => window.close());

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "COPY_IMAGE") {
      copyImageToClipboard(message.url);
    }
  });
});

function handleClipboardCopy(data) {
  navigator.clipboard.writeText(data)
    .then(() => {
      const messageElement = document.getElementById("message");
      messageElement.textContent = "Success!";
      const a = document.createElement("a");
      a.textContent = "View Image";
      a.style.color = "blue";
      a.href = "#";
      a.addEventListener("click", () => openImageInNewTab(data));
      messageElement.appendChild(document.createElement("br"));
      messageElement.appendChild(a);
    })
    .catch((error) => {
      console.error("Failed to copy data to clipboard:", error);
      document.getElementById("message").textContent = "Failed to copy data to clipboard.";
    });
}

function copyImageToClipboard(imageUrl) {
  fetch(imageUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.blob();
    })
    .then((blob) => {
      const reader = new FileReader();
      reader.onloadend = function () {
        createCanvasAndCopyToClipboard(reader.result);
      };
      reader.readAsDataURL(blob);
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
      document.getElementById("status").textContent = "Error fetching image.";
    });
}

function createCanvasAndCopyToClipboard(dataUrl) {
  const image = new Image();
  image.onload = function () {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    canvas.toBlob((blob) => {
      if (navigator.clipboard) {
        const clipboardItem = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([clipboardItem])
          .then(() => {
            document.getElementById("status").textContent = "Image copied to clipboard.";
          })
          .catch((error) => {
            console.error("Failed to copy image to clipboard:", error);
            document.getElementById("status").textContent = "Failed to copy image.";
          });
      } else {
        console.error("Clipboard API not supported.");
      }
    }, "image/png");
  };
  image.src = dataUrl;
}

function openImageInNewTab(dataUrl) {
  const base64Data = dataUrl.split(",")[1];
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length).fill().map((_, i) => slice.charCodeAt(i));
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  const blob = new Blob(byteArrays, { type: "image/png" });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
}
