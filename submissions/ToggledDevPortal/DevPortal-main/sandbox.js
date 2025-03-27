window.addEventListener("message", (event) => {
    if (event.data.action === "parse") {
      try {
        // Convert received script to an object safely
        const appInstance = new Function(`"use strict"; return (${event.data.script})`)();
        const details = appInstance.details;
        const blocks = appInstance.exporter ? appInstance.exporter() : [];

        // Send the parsed data back to the extension
        event.source.postMessage({ action: "parsed", details, blocks }, event.origin);
      } catch (error) {
        event.source.postMessage({ action: "error", error: error.message }, event.origin);
      }
    }
  });