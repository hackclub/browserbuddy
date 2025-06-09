// Cross-browser compatibility
const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

// Default URLs to open
const defaultUrls = [
    'https://www.google.com',
    'https://www.github.com',
    'https://www.stackoverflow.com',
    'https://www.youtube.com',
    'https://www.wikipedia.org'
];

// Custom URLs storage
let customUrls = [];

// Load custom URLs from storage
function loadCustomUrls() {
    if (isFirefox) {
        browser.storage.local.get('customUrls').then(result => {
            customUrls = result.customUrls || [];
            updateUrlList();
        });
    } else {
        chrome.storage.local.get('customUrls', (result) => {
            customUrls = result.customUrls || [];
            updateUrlList();
        });
    }
}

// Save custom URLs to storage
function saveCustomUrls() {
    const data = { customUrls: customUrls };
    if (isFirefox) {
        browser.storage.local.set(data);
    } else {
        chrome.storage.local.set(data);
    }
}

// Update URL list display
function updateUrlList() {
    const urlList = document.getElementById('urlList');
    urlList.innerHTML = '';
    
    customUrls.forEach((url, index) => {
        const urlItem = document.createElement('div');
        urlItem.className = 'url-item';
        urlItem.innerHTML = `
            <span>${url}</span>
            <button class="remove-url" data-index="${index}">×</button>
        `;
        urlList.appendChild(urlItem);
    });
    
    // Add remove listeners
    document.querySelectorAll('.remove-url').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            customUrls.splice(index, 1);
            saveCustomUrls();
            updateUrlList();
        });
    });
}

// Validate URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Add URL to custom list
function addCustomUrl() {
    const urlInput = document.getElementById('urlInput');
    let url = urlInput.value.trim();
    
    if (!url) {
        showStatus('Please enter a URL', 'error');
        return;
    }
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    if (!isValidUrl(url)) {
        showStatus('Please enter a valid URL', 'error');
        return;
    }
    
    if (customUrls.includes(url)) {
        showStatus('URL already exists', 'error');
        return;
    }
    
    customUrls.push(url);
    saveCustomUrls();
    updateUrlList();
    urlInput.value = '';
    showStatus('URL added successfully', 'success');
}

// Show status message
function showStatus(message, type = 'info') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.style.color = type === 'error' ? '#ff6b6b' : type === 'success' ? '#51cf66' : 'white';
    
    setTimeout(() => {
        status.textContent = '';
    }, 3000);
}

// Open tabs function
async function openTabs(urls) {
    if (!urls || urls.length === 0) {
        showStatus('No URLs to open', 'error');
        return;
    }
    
    try {
        let successCount = 0;
        
        for (const url of urls) {
            try {
                if (isFirefox) {
                    await browser.tabs.create({ url: url, active: false });
                } else {
                    await new Promise((resolve) => {
                        chrome.tabs.create({ url: url, active: false }, resolve);
                    });
                }
                successCount++;
            } catch (error) {
                console.error('Error opening tab:', url, error);
            }
        }
        
        showStatus(`Opened ${successCount} of ${urls.length} tabs`, 'success');
        
        // Close popup after a short delay
        setTimeout(() => {
            window.close();
        }, 1500);
        
    } catch (error) {
        console.error('Error opening tabs:', error);
        showStatus('Error opening tabs. Check permissions.', 'error');
    }
}

// Toggle custom section
function toggleCustomSection() {
    const customSection = document.getElementById('customSection');
    const isVisible = customSection.style.display !== 'none';
    customSection.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        loadCustomUrls();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Open predefined tabs
    document.getElementById('openPredefined').addEventListener('click', () => {
        openTabs(defaultUrls);
    });
    
    // Toggle custom tabs section
    document.getElementById('openCustom').addEventListener('click', toggleCustomSection);
    
    // Add custom URL
    document.getElementById('addUrl').addEventListener('click', addCustomUrl);
    
    // Enter key to add URL
    document.getElementById('urlInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCustomUrl();
        }
    });
    
    // Load initial data
    loadCustomUrls();
});

// Handle popup unload
window.addEventListener('beforeunload', () => {
    saveCustomUrls();
});
