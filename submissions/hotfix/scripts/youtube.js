function addLocationObserver(callback) {
  const config = { attributes: false, childList: true, subtree: false };
  const observer = new MutationObserver(callback);
  observer.observe(document.body, config);
}

function observerCallback() {
  if (window.location.href.startsWith("https://www.youtube.com/watch")) {
    chrome.storage.local.get("youtube.showDislikeCounter", function (result) {
      if (result["youtube.showDislikeCounter"] === true) {
        showDislikeCounter();
      }
    });
  } else if (
    window.location.href.startsWith("https://www.youtube.com/@") &&
    window.location.href.endsWith("/videos")
  ) {
    chrome.storage.local.get(
      "youtube.showPlayAllChannelVideosButton",
      function (result) {
        if (result["youtube.showPlayAllChannelVideosButton"] === true) {
          showPlayAllChannelVideosButton();
        }
      }
    );
  }
}

addLocationObserver(observerCallback);
observerCallback();

async function showDislikeCounter() {
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    } else {
      return num.toString();
    }
  };

  const videoIdRegex =
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*?v=([a-zA-Z0-9_-]{11})/;
  const videoId = window.location.href.match(videoIdRegex)
    ? window.location.href.match(videoIdRegex)[1]
    : null;

  if (!videoId) {
    console.log("No videoId found.");
    return;
  }

  const url = `https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const dislikeCount = (await response.json()).dislikes;

  const addCounter = () => {
    let dislikeButton = document.querySelector(
      '[aria-label="Dislike this video"]'
    );

    if (dislikeButton === null) return;

    if (
      dislikeButton.querySelector(
        ".yt-spec-button-shape-next__button-text-content"
      )
    )
      return;

    let dislikeCounter = this.document.createElement("div");
    dislikeCounter.className = "yt-spec-button-shape-next__button-text-content";
    dislikeCounter.innerText = formatNumber(dislikeCount);
    dislikeButton.append(dislikeCounter);
    dislikeButton.style.width = "auto";
    dislikeButton.querySelector(
      ".yt-spec-button-shape-next__icon"
    ).style.marginRight = "6px";
  };

  addCounter();

  var observer = new MutationObserver(function (mutations) {
    addCounter();
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function showPlayAllChannelVideosButton() {
  if (document.getElementById("play-all-button") != undefined) return;
  let chips = document.getElementById("chips-content");
  if (chips == undefined) return;

  const channelID = document
    .querySelector("link[rel='canonical']")
    .href.split("/")
    .at(-1);
  const url =
    "https://youtube.com/playlist?list=" + channelID.replace("UC", "UU");

  const chip = `<yt-chip-cloud-chip-renderer id="play-all-button" onclick='window.location.replace("${url}");' style="margin-left: 12px;" class="style-scope ytd-feed-filter-chip-bar-renderer" modern="" aria-selected="false" role="tab" tabindex="0" chip-style="STYLE_DEFAULT">Play All</yt-chip-cloud-chip-renderer>`;
  chips.insertAdjacentHTML("beforeend", chip);
}
