import { BackgroundRequest, RequestType } from "@/utils/types";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (request, _, sendResponse) => {
    if ((request as BackgroundRequest).type === RequestType.QUERY_TABS) {
      let tabs = await browser.tabs.query({});
      return tabs;
    }
    if ((request as BackgroundRequest).type === RequestType.CLOSE_TABS) {
      let ids = (request as BackgroundRequest).tabs;
      if(ids?.length) {
        return await browser.tabs.remove(ids);
      }
    }
  }
  );
});


