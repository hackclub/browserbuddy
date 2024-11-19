function createCheckbox(labelText, storageKey) {
  const container = document.getElementById("settings");

  const label = document.createElement("label");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "uk-checkbox";

  chrome.storage.local.get([storageKey], function (result) {
    if (result[storageKey] === undefined) {
      chrome.storage.local.set({ [storageKey]: true });
      checkbox.checked = true;
    } else {
      checkbox.checked = result[storageKey];
    }
  });

  checkbox.addEventListener("change", function () {
    chrome.storage.local.set({ [storageKey]: checkbox.checked });
  });

  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(" " + labelText));

  container.appendChild(label);
}

function createSection(sectionName) {
  const container = document.getElementById("settings");

  container.appendChild(document.createElement("br"));

  const sectionHeader = document.createElement("h2");
  sectionHeader.textContent = sectionName;
  sectionHeader.className = "uk-h4";

  container.appendChild(sectionHeader);
}

createSection("Discord");
createCheckbox("Hide blocked messages", "discord.hideBlockedMessages");
createSection("Scratch");
createCheckbox("Use turbowarp embed", "scratch.useTurbowarpEmbed");
createCheckbox(
  "Use turbowarp embed even if it's a cloud project",
  "scratch.useTurbowarpEmbedOnCloud"
);
createSection("Twitter");
createCheckbox('Inline "show more" in tweets', "twitter.inlineShowMore");
createCheckbox(
  'Rename "X" to "Twitter", and "Posts" to "Tweets"',
  "twitter.twitterNaming"
);
createSection("Youtube");
createCheckbox("Show dislike counter", "youtube.showDislikeCounter");
createCheckbox(
  'Show the "Play All" button on a channel\'s videos',
  "youtube.showPlayAllChannelVideosButton"
);
