// Background script for Firefox
// Handle extension installation
browser.runtime.onInstalled.addListener((details) => {
    console.log('Multi Tab Opener extension installed/updated');
    
    if (details.reason === 'install') {
        // Set default custom URLs on first install
        const defaultCustomUrls = [];
        browser.storage.local.set({ customUrls: defaultCustomUrls });
    }
});

// Handle messages from popup or content scripts
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openTabs') {
        openMultipleTabs(request.urls).then(result => {
            sendResponse({ success: true, count: result });
        }).catch(error => {
            console.error('Error opening tabs:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Will respond asynchronously
    }
});

// Function to open multiple tabs
async function openMultipleTabs(urls) {
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        throw new Error('No valid URLs provided');
    }
    
    let successCount = 0;
    const errors = [];
    
    for (const url of urls) {
        try {
            // Validate URL
            new URL(url); // This will throw if URL is invalid
            
            // Create new tab
            await browser.tabs.create({
                url: url,
                active: false // Don't make the new tab active
            });
            
            successCount++;
        } catch (error) {
            console.error(`Failed to open tab for URL: ${url}`, error);
            errors.push({ url, error: error.message });
        }
    }
    
    if (errors.length > 0) {
        console.warn('Some tabs failed to open:', errors);
    }
    
    return successCount;
}

// Handle browser action click (fallback)
browser.browserAction.onClicked.addListener(async (tab) => {
    console.log('Browser action clicked, opening default tabs');
    
    const defaultUrls = [
        'https://www.google.com',
        'https://www.github.com',
        'https://www.stackoverflow.com',
        'https://www.youtube.com',
        'https://www.wikipedia.org'
    ];
    
    try {
        await openMultipleTabs(defaultUrls);
    } catch (error) {
        console.error('Error in fallback tab opening:', error);
    }
});

// Handle context menu
browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
        id: 'openMultipleTabs',
        title: 'Open Multiple Tabs',
        contexts: ['page', 'selection']
    });
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'openMultipleTabs') {
        const defaultUrls = [
            'https://www.google.com',
            'https://www.github.com',
            'https://www.stackoverflow.com',
            'https://www.youtube.com',
            'https://www.wikipedia.org'
        ];
        
        try {
            await openMultipleTabs(defaultUrls);
        } catch (error) {
            console.error('Error opening tabs from context menu:', error);
        }
    }
});
