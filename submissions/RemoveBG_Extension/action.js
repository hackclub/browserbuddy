const browser = globalThis.browser ?? globalThis.chrome;

let apiKeys = [];

function fetchApiKeys() {
  fetch("https://removebg-api-two.vercel.app/api/strings")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch API");
      }
      return response.json();
    })
    .then((keys) => {
      apiKeys = keys;
      // chrome storage
      browser.storage.local.set({ apiKeys: keys });
      console.log("API keys fetched and stored successfully.");
    })
    .catch((error) => {
      console.error("Error fetching API keys:", error);
    });
}

// init API on extension load
browser.runtime.onInstalled.addListener(function () {
  fetchApiKeys();
  browser.contextMenus.create(
    {
      title: "Remove Background",
      contexts: ["image"],
      id: "image",
    },
    function () {
      if (browser.runtime.lastError) {
        console.error(
          "Error creating context menu:",
          browser.runtime.lastError
        );
      } else {
        console.log("Context menu item created successfully.");
      }
    }
  );
});

browser.storage.local.get("apiKeys", (result) => {
  if (result.apiKeys) {
    apiKeys = result.apiKeys;
  } else {
    fetchApiKeys(); // if not in storage
  }
});

function base64ToBlob(base64, contentType = "") {
  if (!base64) {
    console.error("Invalid input: base64String or mimeType is missing.");
    return;
  }
  try {
    const base64Data = base64.split(",")[1];
    if (!base64Data) {
      throw new Error("Base64 data is missing.");
    }
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
    return null;
  }
}

function showNotification(title, message) {
  browser.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: title,
    message: message,
  });
}

function removeImageBackground(imageInput) {
  if (apiKeys.length === 0) {
    console.error("No API keys available.");
    return;
  }
  const randomIndex = Math.floor(Math.random() * apiKeys.length);
  const randomApiKey = apiKeys[randomIndex];
  let formData = new FormData();

  if (imageInput.startsWith("data:image/")) {
    const contentType = imageInput.split(";")[0].split(":")[1];
    const blob = base64ToBlob(imageInput, contentType);
    formData.append("image_file", blob);
  } else if (
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
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to remove background");
      }
      return response.blob();
    })
    .then((blob) => {
      const reader = new FileReader();
      reader.onloadend = function () {
        const base64data = reader.result;

        browser.runtime.sendMessage({ type: "COPY_IMAGE", url: base64data });
        browser.runtime.sendMessage({
          type: "COPY_TO_CLIPBOARD",
          data: base64data,
        });

        showNotification("Background Removal", "Image processed successfully!");
      };
      reader.readAsDataURL(blob);
    })
    .catch((error) => {
      console.error("Error:", error);
      showNotification("Error", "Failed to process image");
      browser.runtime.sendMessage({
        type: "SHOW_ALERT",
        message: `Failed to process image.`,
      });
    });
}

function genericOnClick(info) {
  if (info.menuItemId === "image") {
    removeImageBackground(info.srcUrl);

    showNotification("Background Removal", "Nothing Yet...");

    browser.storage.local
      .set({ alertMessage: "Nothing Yet..." })
      .then(() => {
        try {
          browser.action.setPopup({ popup: "popup.html" });
          if (browser.action.openPopup) {
            browser.action.openPopup();
          }
        } catch (error) {
          console.log("Popup not supported in this browser");
        }
      });
  } else {
    console.log("Standard context menu item clicked.");
  }
}

browser.contextMenus.onClicked.addListener(genericOnClick);
