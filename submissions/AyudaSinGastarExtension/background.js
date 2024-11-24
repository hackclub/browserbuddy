const AFFILIATE_TAG = 'f2trascender-20';


const productPatterns = [
    /^https:\/\/(?:www\.)?amazon\.com\.mx\/[^\/]+\/dp\/[A-Z0-9]+/i,
    /^https:\/\/(?:www\.)?amazon\.com\.mx\/gp\/product\/[A-Z0-9]+/i
];


function isProductPage(url) {
    return productPatterns.some(pattern => pattern.test(url));
}


function addAffiliateTag(url) {
    try {
        const urlObj = new URL(url);

        urlObj.searchParams.delete('tag');


        urlObj.searchParams.set('tag', AFFILIATE_TAG);

        return urlObj.toString();
    } catch (e) {
        console.error('Error processing URL:', e);
        return url;
    }
}

chrome.webNavigation.onBeforeNavigate.addListener(
    (details) => {

        if (details.frameId !== 0) return;

        const url = details.url;


        if (!isProductPage(url)) return;

        // Add affiliate tag
        const newUrl = addAffiliateTag(url);


        if (newUrl !== url) {
            chrome.tabs.update(details.tabId, { url: newUrl });
        }
    },
    {
        url: [{
            hostSuffix: 'amazon.com.mx'
        }]
    }
);