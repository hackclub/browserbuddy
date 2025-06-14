import { getSlackAuth } from "./slack.js";

async function main() {
  let auth;
  try {
    auth = await getSlackAuth();
  } catch (e) {
    console.error(e);
    await chrome.tabs.create({ url: chrome.runtime.getURL("src/settings.html") });
    return;
  }

  const { enabled, authorized } = await chrome.storage.local.get({ enabled: true, authorized: false });
  if (!authorized) {
    await chrome.tabs.create({ url: chrome.runtime.getURL("src/authorize.html") });
  }

  let lastTabId = -1;
  setInterval(async () => {
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab) return;
    if (enabled && tab.id != lastTabId) updateStatus(tab.id || 0, auth);
    lastTabId = tab.id || 0;
  }, 2000);
}

/**
 * @type (tabId: number, config: { xoxc: string, xoxd: string, teamDomain: string }) => Promise<void>
 */
async function updateStatus(tabId, auth) {
  console.debug("Tab activated:", tabId);
  const tab = await chrome.tabs.get(tabId);
  let results;
  try {
    results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => document.title,
    });
  } catch (e) {
    console.warn(`Tab ${tabId} is not accessible - probably a browser page?`);
    console.warn(e)
    return;
  }
  const title = results[0].result || tab.title;

  const data = new FormData();
  data.append("token", auth.xoxc);
  data.append(
    "profile",
    JSON.stringify({
      status_emoji: ":globe_with_meridians:",
      status_text: await redactAndTemplate(title, new URL(tab.url || tab.pendingUrl || "placeholder.com"), 100),
    }),
  );
  await fetch(`https://${auth.teamDomain}.slack.com/api/users.profile.set`, {
    method: "POST",
    body: data,
    headers: {
      Cookie: `d=${encodeURIComponent(auth.xoxd)}`,
    },
  });
  console.log("Updated status to", title);
}

chrome.action.onClicked.addListener(async () => {
  await chrome.tabs.create({ url: chrome.runtime.getURL("src/settings.html") });
});


/** @type Record<string, string> */
const redactions = {
  "mail.google.com": "Gmail",
  "outlook.live.com": "Outlook",
  "outlook.office.com": "Outlook",
  "teams.microsoft.com": "Teams",
}
const emailRegex = /\b[\w-\.]+@([\w-]+\.)+[\w-]{2,4}\b/g;
/** @type (input: string, url: URL, length: number) => Promise<string> */
async function redactAndTemplate(input, url, length) {
  const { templateText } = await chrome.storage.local.get({ templateText: "On $TITLE" });
  let redactedTitle = input.replaceAll(emailRegex, "[email]");
  const domain = new URL(url).hostname;
  if (redactions[domain]) {
    redactedTitle = redactions[domain];
  }
  const fullTitle = templateText.replaceAll("$TITLE", redactedTitle);
  if (fullTitle.length <= length) return fullTitle;
  if (length < 3) return fullTitle.substring(0, length);
  return fullTitle.substring(0, length - 3) + "...";
}

/** @type (ms: number) => Promise<void> */
async function delay(ms) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

main();
