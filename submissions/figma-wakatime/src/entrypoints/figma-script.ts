import pWaitFor from "p-wait-for";
import { log } from "@/lib/util";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";
import { m2iMessenger } from "@/lib/messaging/m2i-messaging";

// People often ponder their designs or use sites like Dribbble for inspiration.
// This can lead to long periods of inactivity and leave the user annoyed when
// all their time hasn't been tracked. To prevent this, we'll allow them to be inactive
// for up to 6 minutes before we stop sending heartbeats.
const MAX_INACTIVITY_MS = 60 * 6 * 1000;
const HEARTBEAT_INTERVAL_MS = 60 * 1000;
let lastHeartbeatTs: number | null = null;
let lastDocUpdateTs: number | null = null;

export default defineUnlistedScript(async () => {
  log.info("Unlisted content script loaded");

  try {
    await pWaitFor(
      () => window.figma !== undefined && typeof window.figma === "object",
      { interval: 5000, timeout: 15500 }
    );
  } catch (e) {
    alert(
      "Uh oh, the Figma object hasn't been loaded. Please make sure to stay focused on the page while we refresh!"
    );
    log.error("Figma object not loaded", e);
    location.reload();
  }
  log.debug("Figma object loaded");

  let docHash: string | null = null;
  let isWrite = false;
  const interval = setIntervalAsync(async () => {
    if (!figma) return; // Might be removed on page navigation
    const root = await figma.getNodeByIdAsync(figma.root.id);
    if (!root) {
      log.error("Could not find root node. This should never happen.");
      return;
    }

    try {
      const newDocHash = await m2iMessenger.sendMessage("getDocHash", figma.fileKey!);
      if (newDocHash !== docHash) {
        log.debug("Document changed!");
        lastDocUpdateTs = Date.now();
        docHash = newDocHash;
        isWrite = true;
      }
    } catch (e) {
      log.error("Failed to get document hash", e);
    }

    if (shouldSendHeartbeat()) {
      log.debug("Sending heartbeat...");
      const entity = getEntity();
      await m2iMessenger.sendMessage("emitHeartbeat", {
        project: figma.root.name,
        entity: entity.name,
        lines: "children" in entity ? entity.children.length : 0,
        time: Math.floor(Date.now() / 1000),
        type: "file",
        language: "Figma",
        category: "designing",
        is_write: isWrite,
      });
      isWrite = false;
    }
  }, 12000);
  log.info(`Listening for changes to document \`${figma.root.name}\``);

  m2iMessenger.onMessage("uninject", async () => {
    log.info("Uninjecting content script");
    await clearIntervalAsync(interval);
    return;
  });

  await figma.notify("WakaTime for Figma is running!");
});

function getEntity() {
  const currentSelection = figma.currentPage.selection;
  if (currentSelection && currentSelection.length > 0) {
    return currentSelection[0];
  }
  return figma.root;
}

function shouldSendHeartbeat(): boolean {
  const now = Date.now();
  const heartbeatStale =
    lastHeartbeatTs === null || now - lastHeartbeatTs > HEARTBEAT_INTERVAL_MS;
  const active =
    document.hasFocus() && now - lastDocUpdateTs! < MAX_INACTIVITY_MS;
  const result = heartbeatStale && lastDocUpdateTs !== null && active;
  if (result) {
    lastHeartbeatTs = now;
  }
  log.debug(
    `Should send heartbeat: ${result} (heartbeatStale: ${heartbeatStale}, active: ${active}, now: ${now}, lastDocUpdateTs: ${lastDocUpdateTs}, lastHeartbeatTs: ${lastHeartbeatTs})`
  );

  return result;
}
