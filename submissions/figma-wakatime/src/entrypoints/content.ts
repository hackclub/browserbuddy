import { m2iMessenger } from "@/lib/messaging/m2i-messaging";
import { i2bMessenger } from "@/lib/messaging/i2b-messaging";
import { log } from "@/lib/util";

const watchPattern = new MatchPattern("*://*.figma.com/design/*")
export default defineContentScript({
  matches: ["*://*.figma.com/*"],
  async main(ctx) {
    log.info("Content script loaded");
    m2iMessenger.onMessage("emitHeartbeat", async (message) => {
      log.debug("I have a heartbeat! Yay!");
      return await i2bMessenger.sendMessage("emitHeartbeat", message.data);
    });
    m2iMessenger.onMessage("getDocHash", async (message) => {
      return await i2bMessenger.sendMessage("getDocHash", message.data);
    });

    let injected = false;
    ctx.addEventListener(window, 'wxt:locationchange', async ({ newUrl }) => {
      log.debug(`Location changed to ${newUrl}`);
      const match = watchPattern.includes(newUrl);
      if (match && !injected) {
        log.debug("Injecting content script");
        await injectScript("/figma-script.js");
        injected = true;
      } else if (!match && injected) {
        log.debug("Uninjecting content script");
        await m2iMessenger.sendMessage("uninject", void 0);
        injected = false;
      }
    });
  },
});
