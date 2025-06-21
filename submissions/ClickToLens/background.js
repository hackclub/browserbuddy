chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchWithGoogleLens",
    title: "Search with Google Lens",
    contexts: ["image"]
  });

  chrome.contextMenus.create({
    id: "searchOtherEnginesParent",
    title: "Search with Other Engines",
    contexts: ["image"]
  });

  chrome.contextMenus.create({
    id: "searchBingImages",
    title: "Bing Images",
    parentId: "searchOtherEnginesParent",
    contexts: ["image"]
  });

  chrome.contextMenus.create({
    id: "searchYandexImages",
    title: "Yandex Images",
    parentId: "searchOtherEnginesParent",
    contexts: ["image"]
  });

  chrome.contextMenus.create({
    id: "searchTinEye",
    title: "TinEye",
    parentId: "searchOtherEnginesParent",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "searchOtherEnginesParent") {
    return;
  }
  
  const imageUrl = info.srcUrl;
  let searchUrl = '';

  if (!imageUrl) {
    console.error("No image URL found for the clicked item.");
    return;
  }

  switch (info.menuItemId) {
    case "searchWithGoogleLens":
      searchUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`;
      break;
    case "searchBingImages":
      searchUrl = `https://www.bing.com/images/search?view=detailv2&iss=SBI&form=SBIIRP&sbisrc=UrlPaste&q=imgurl:${encodeURIComponent(imageUrl)}`;
      break;
    case "searchYandexImages":
      searchUrl = `https://yandex.com/images/search?url=${encodeURIComponent(imageUrl)}&rpt=imageview`;
      break;
    case "searchTinEye":
      searchUrl = `https://tineye.com/search?url=${encodeURIComponent(imageUrl)}`;
      break;
    default:
      console.error("Unknown menu item ID clicked:", info.menuItemId);
      return;
  }

  if (searchUrl) {
    chrome.tabs.create({
      url: searchUrl,
      index: tab.index + 1
    });
  }
});
