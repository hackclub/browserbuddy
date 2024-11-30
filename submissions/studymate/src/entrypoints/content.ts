export default defineContentScript({
  matches: ['*://*.google.com/*'],
  main() {
    console.log(`debug> content matches: ${location.href}`);
  },
});
