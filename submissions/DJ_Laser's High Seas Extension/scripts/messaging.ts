export type Message =
  | VisitedSiteMessage
  | StorageUpdatedMessage
  | SetFavoutitesMessage
  | InjectUpdatedDataMessage
  | NullMessage;

export type SendResponse = (respose: Message) => void;
export async function sendMessageToWorker(
  message: Message,
  options?: browser.runtime._SendMessageOptions,
) {
  return await browser.runtime.sendMessage(message, options);
}

export async function sendMessageToScript(
  tabId: number,
  message: Message,
  options?: browser.tabs._SendMessageOptions,
) {
  return await browser.tabs.sendMessage(tabId, message, options);
}

// Sends messages to all scripts on the high seas urls
export async function sendMessageToAllScripts(
  message: Message,
  options?: browser.tabs._SendMessageOptions,
) {
  const tabs = await browser.tabs.query({
    url: [
      "https://highseas.hackclub.com/*",
      "https://high-seas.hackclub.dev/*",
    ],
  });

  const promises = tabs.flatMap((tab) =>
    tab.id ? sendMessageToScript(tab.id, message, options) : [],
  );

  return await Promise.all(promises);
}

export interface NullMessage {
  id: "null";
}

export interface VisitedSiteMessage {
  id: "visitedSite";
  localStorage: [string, string][];
}

export interface SetFavoutitesMessage {
  id: "setFavourites";
  value: string[];
}

export interface StorageUpdatedMessage {
  id: "storageUpdated";
  key: string;
  value: string;
}

export interface InjectUpdatedDataMessage {
  id: "injectUpdatedData";
}
