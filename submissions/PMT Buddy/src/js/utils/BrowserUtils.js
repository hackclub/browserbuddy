// wip
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background#browser_support

export class BrowserUtils {
    static getNamespace() {
        const broswerNamespace = typeof browser;
        console.log(broswerNamespace);
        switch (broswerNamespace) {
            case "undefined":
                return "chrome";
            case "browser":
                return "firefox";
            default:
                return "unknown";
        }
    }
}
