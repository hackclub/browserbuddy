const apiKeys = ["rUQH1mhDaLKQe1ZpkKhFVjxL", "raSQ2Z22YVjDTkRAHBmQZErC"];
const randomIndex = Math.floor(Math.random() * apiKeys.length);
const randomApiKey = apiKeys[randomIndex];

function base64ToBlob(base64, contentType = "") {
  if (!base64) {
    console.error("Invalid input: base64String or mimeType is missing.");
    return;
  }

  try {
    // Remove the data URL prefix if present
    const base64Data = base64.split(",")[1];
    if (!base64Data) {
      throw new Error("Base64 data is missing.");
    }

    // Decode the base64 string
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  } catch (error) {
    console.error("Error in base64ToBlob:", error);
    return null; // Return null or handle the error as needed
  }
}

function removeImageBackground(imageInput) {
  let formData = new FormData();

  // Check if the input is a base64 string
  if (imageInput.startsWith("data:image/")) {
    const contentType = imageInput.split(";")[0].split(":")[1];
    const blob = base64ToBlob(imageInput, contentType);
    formData.append("image_file", blob);
  }
  // Check if the input is a URL starting with http or https
  else if (
    imageInput.startsWith("http://") ||
    imageInput.startsWith("https://")
  ) {
    formData.append("image_url", imageInput);
  }

  formData.append("size", "auto");

  fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": randomApiKey,
    },
    body: formData,
  })
    .then((response) => response.blob())
    .then((blob) => {
      // console.log(blob);
      const reader = new FileReader();
      reader.onloadend = function () {
        const base64data = reader.result;
        // console.log("Base64 Data URL:", base64data);
        chrome.runtime.sendMessage({ type: "COPY_IMAGE", url: base64data });

        // Base64 data send to popup
        chrome.runtime.sendMessage({
          type: "COPY_TO_CLIPBOARD",
          data: base64data,
        });
      };
      reader.readAsDataURL(blob); // to URL
    })
    .catch((error) => {
      console.error("Error:", error);
      chrome.runtime.sendMessage({
        type: "SHOW_ALERT",
        message: `Failed to process image.`,
      });
    });
}

function genericOnClick(info) {
  if (info.menuItemId === "image") {
    // console.log("Image item clicked.");

    // Save message to chrome storage
    // console.log(info.srcUrl);
    removeImageBackground(info.srcUrl);

    chrome.storage.local.set({ alertMessage: "You clicked me!" }, function () {
      chrome.action.setPopup({ popup: "popup.html" });
      chrome.action.openPopup();
    });
  } else {
    console.log("Standard context menu item clicked.");
  }
}

chrome.contextMenus.onClicked.addListener(genericOnClick);

chrome.runtime.onInstalled.addListener(function () {
  let context = "image";
  let title = "image";
  chrome.contextMenus.create(
    {
      title: title,
      contexts: [context],
      id: context,
    },
    function () {
      if (chrome.runtime.lastError) {
        console.error("Error creating context menu:", chrome.runtime.lastError);
      } else {
        console.log("Context menu item created successfully.");
      }
    }
  );
});
