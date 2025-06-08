const cursedLinks = [
  "https://pointerpointer.com",
  "https://zoomquilt.org",
  "https://www.omfgdogs.com",
  "https://www.fallingfalling.com",
  "https://thisman.org",
  "https://theuselessweb.com",
  "https://koalastothemax.com",
  "https://longdogechallenge.com"
];

chrome.action.onClicked.addListener(() => {
  const random = Math.floor(Math.random() * cursedLinks.length);
  chrome.tabs.create({ url: cursedLinks[random] });
});