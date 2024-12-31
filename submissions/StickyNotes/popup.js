document.addEventListener('DOMContentLoaded', async () => {
    const resultDiv = document.getElementById('results');
    resultDiv.innerText = 'Fetching coupon codes...';

    try {
        // Get the current active tab
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = new URL(currentTab.url);

        // Fetch coupon codes from your API using the domain
        const response = await fetch(`https://api.phyotp.dev/stickynotes/find?w=${encodeURIComponent(currentTab.url)}`);
        const couponText = await response.text(); 
		console.log(couponText);
        resultDiv.innerText = 'Applying coupon codes...';

        // Inject content script and send coupon codes
        await chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['content.js']
        });

        // Extract coupon codes using regex
        const couponCodes = [...couponText.matchAll(/\b[A-Z0-9]{5,10}\b/g)].map(match => match[0]);
		console.log(couponCodes);
        // Send coupon codes to the content script
        chrome.tabs.sendMessage(currentTab.id, { coupons: couponCodes });
    } catch (error) {
        console.error('Failed to fetch coupon codes:', error);
        resultDiv.innerText = 'Failed to fetch coupon codes. Try again later.';
    }
});

// Listen for messages from content.js
chrome.runtime.onMessage.addListener((message) => {
    const resultDiv = document.getElementById('results');

    console.log('Message from content.js:', message); // Debugging log

    if (message.validCoupon) {
        resultDiv.innerText = `🎉 Valid Coupon Found: ${message.validCoupon}`;
    } else if (message.results) {
        resultDiv.innerText = 'Results:\n' + message.results.map(r => `${r.code}: ${r.status}`).join('\n');
    } else if (message.status) {
        resultDiv.innerText = message.status;
    } else {
        resultDiv.innerText = 'Unexpected message received!';
    }
});
