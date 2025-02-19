let catReplacementEnabled = true;
let positivityBubbleEnabled = true;
let observer;
let positivityBubbleTimer;

const EXCLUDED_DOMAINS = [
    'cataas.com',
    'api.cataas.com'
];

// Check if current site is in excluded domains
const isExcludedDomain = EXCLUDED_DOMAINS.some(domain => 
    window.location.hostname === domain || 
    window.location.hostname.endsWith('.' + domain)
);

if (isExcludedDomain) {
    console.log('CATAAS or related site detected, deactivating extension features.');
    // Set state variables
    catReplacementEnabled = false;
    positivityBubbleEnabled = false;
    
    // Clean up any existing observers and timers
    if (typeof observer !== 'undefined') {
        observer.disconnect();
    }
    if (typeof positivityBubbleTimer !== 'undefined') {
        clearTimeout(positivityBubbleTimer);
    }
    
    // Early exit
    console.log('Extension deactivated on excluded site');
    throw new Error('Extension disabled on excluded site');
}

const BORDER_COLOR = '#4b2e83'; // Purple border color
const BATCH_SIZE = 15; // Increased batch size
const MOTIVATIONAL_QUOTES = [
"Keep going, you're closer than you think.",
"You've got this, just keep pushing!",
"Believe in yourself and all that you are.",
"Every step forward is a step closer.",
"Don't stop now, you're almost there.",
"The only limit is the one you set for yourself.",
"You’re stronger than you think.",
"The journey is tough, but so are you.",
"Stay focused, stay strong.",
"Success is just around the corner.",
"One day at a time, you’ll get there.",
"You have everything you need to succeed.",
"Don’t give up, you’re on the right path.",
"Push through the challenges, you're capable.",
"Your hard work will pay off.",
"Don’t wait for opportunity, create it.",
"Believe in the power of your dreams.",
"You can conquer anything you set your mind to.",
"The best is yet to come.",
"Trust the process and keep going.",
"Progress, not perfection.",
"Keep your head high and your spirits higher.",
"Keep fighting, you're stronger than you know.",
"You are capable of more than you think.",
"Every setback is a setup for a comeback.",
"Don’t stop until you're proud.",
"You've come so far, don't quit now.",
"Make today your masterpiece.",
"There’s no limit to what you can achieve.",
"Stay brave, stay bold, stay you.",
"Nothing is impossible unless you believe it is.",
"Dream big and work hard.",
"You’re on the path to greatness.",
"Keep your dreams alive, you’re almost there.",
"Your potential is endless.",
"Believe in the magic of your dreams.",
"Keep striving, you’re closer than you think.",
"You have the power to make it happen.",
"No challenge is too big for you.",
"You’re capable of overcoming anything.",
"Great things are coming your way.",
"Don’t doubt yourself, trust your journey.",
"Success starts with the belief that you can.",
"You have what it takes to succeed.",
"Today is the perfect day to begin.",
"Keep pushing, the finish line is in sight.",
"Rise up and keep going.",
"Your future is as bright as your determination.",
"Don’t just dream it, do it.",
"The sky’s the limit when you keep going!"
];

function generateUniqueSeed() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function isCatImage(img) {
    return img.style.borderColor === BORDER_COLOR || 
           img.hasAttribute('data-cat-replaced') ||
           img.closest('[data-cat-circle]'); // Skip images in positivity circle
}

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
}

async function preloadCatImage(width, height) {
    const uniqueSeed = generateUniqueSeed();
    const newSrc = `https://cataas.com/cat/cute?width=${width}&height=${height}&seed=${uniqueSeed}`;
    
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject('Timeout'), 3000);
        const img = new Image();
        img.onload = () => {
            clearTimeout(timeout);
            resolve(newSrc);
        };
        img.onerror = () => {
            clearTimeout(timeout);
            reject('Failed to load');
        };
        img.src = newSrc;
    });
}

// Modified image replacement function
async function replaceImage(img) {
    if (isCatImage(img) || img.hasAttribute('data-processing')) return;

    img.setAttribute('data-processing', 'true');
    
    try {
        const width = Math.max(img.naturalWidth || img.width || 300, 100);
        const height = Math.max(img.naturalHeight || img.height || 300, 100);
        const newSrc = await preloadCatImage(width, height);

        if (catReplacementEnabled && !isCatImage(img)) {
            img.setAttribute('data-original-src', img.src);
            img.src = newSrc;
            img.setAttribute('data-cat-replaced', 'true');
            img.style.border = `3px solid ${BORDER_COLOR}`;
            img.style.borderRadius = '8px';
        }
    } catch (error) {
        console.error('Failed to replace image:', error);
    } finally {
        img.removeAttribute('data-processing');
    }
}

async function processBatch(images) {
    const currentBatch = Array.from(images).slice(0, BATCH_SIZE);

    await Promise.all(currentBatch.map(replaceImage));

    if (images.length > BATCH_SIZE) {
        requestAnimationFrame(() => processBatch(images.slice(BATCH_SIZE)));
    }
}

// Initialize the mutation observer with error handling
function initializeObserver() {
    try {
        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver((mutations) => {
            if (!catReplacementEnabled) return;

            const newImages = new Set();
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'IMG' && !isCatImage(node)) {
                        newImages.add(node);
                    } else if (node.getElementsByTagName) {
                        const images = node.getElementsByTagName('img');
                        Array.from(images)
                            .filter(img => !isCatImage(img))
                            .forEach(img => newImages.add(img));
                    }
                });

                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'src' && 
                    mutation.target.tagName === 'IMG' && 
                    !isCatImage(mutation.target)) {
                    newImages.add(mutation.target);
                }
            });

            if (newImages.size > 0) {
                processBatch(Array.from(newImages));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src']
        });
    } catch (error) {
        console.error('Failed to initialize observer:', error);
    }
}

function initializeImages() {
    const images = document.getElementsByTagName('img');
    processBatch(Array.from(images));
}

// Initialize extension state
async function initializeExtension() {
    try {
        const result = await chrome.storage.local.get([
            'catReplacementEnabled',
            'positivityBubbleEnabled'
        ]);
        
        catReplacementEnabled = result.catReplacementEnabled ?? true;
        positivityBubbleEnabled = result.positivityBubbleEnabled ?? true;

        if (catReplacementEnabled) {
            initializeImages();
        }
        if (positivityBubbleEnabled) {
            schedulePositivityCircle();
        }
    } catch (error) {
        console.error('Failed to initialize extension:', error);
    }
}

// Update message listener to use async/await
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const handleMessage = async () => {
        switch (request.action) {
            case 'toggleCatReplacement':
                catReplacementEnabled = request.enabled;
                if (catReplacementEnabled) {
                    await initializeImages();
                } else {
                    restoreOriginalImages();
                }
                return { success: true };

            case 'togglePositivityBubble':
                positivityBubbleEnabled = request.enabled;
                if (positivityBubbleEnabled) {
                    schedulePositivityCircle();
                } else {
                    clearTimeout(positivityBubbleTimer);
                }
                return { success: true };

            case 'getStatus':
                return {
                    catReplacementEnabled,
                    positivityBubbleEnabled
                };
        }
    };

    // Handle async response
    handleMessage().then(sendResponse);
    return true; // Keep message channel open for async response
});

// Function to restore original images
function restoreOriginalImages() {
    document.querySelectorAll('img[data-cat-replaced]').forEach(img => {
        if (img.hasAttribute('data-original-src')) {
            img.src = img.getAttribute('data-original-src');
            img.removeAttribute('data-cat-replaced');
            img.removeAttribute('data-original-src');
            img.style.border = '';
            img.style.borderRadius = '';
        }
    });
}

// Load initial state
chrome.storage.local.get(['positivityBubbleEnabled'], function(result) {
    positivityBubbleEnabled = result.positivityBubbleEnabled !== undefined ? 
        result.positivityBubbleEnabled : true;
    if (positivityBubbleEnabled) {
        schedulePositivityCircle();
    }
});

function showPositivityCircle() {
    if (!positivityBubbleEnabled) return;
    
    const uniqueSeed = generateUniqueSeed();
    const quote = getRandomQuote().replace(/\s+/g, '%20');
    const quoteUrl = `https://cataas.com/cat/says/${quote}?width=1280&height=720&fontSize=32&seed=${uniqueSeed}`; // Added size parameter

    const circle = document.createElement('div');
    circle.style.position = 'fixed';
    circle.style.bottom = '20px';
    circle.style.right = '20px';
    circle.style.width = '120px';
    circle.style.height = '120px';
    circle.style.borderRadius = '50%';
    circle.style.backgroundColor = '#4b2e83';
    circle.style.display = 'flex';
    circle.style.justifyContent = 'center';
    circle.style.alignItems = 'center';
    circle.style.cursor = 'pointer';
    circle.style.zIndex = '999999';
    circle.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    circle.style.transition = 'all 0.3s ease-in-out';
    circle.style.transform = 'scale(0)';
    circle.style.opacity = '0';
    circle.setAttribute('data-cat-circle', 'true'); // Prevent cat replacement

    const link = document.createElement('a');
    link.href = quoteUrl;
    link.target = '_blank';
    link.style.color = 'white';
    link.style.textDecoration = 'none';
    link.style.fontSize = '14px'; // Smaller font size
    link.style.textAlign = 'center';
    link.style.padding = '10px';
    link.innerText = '😺\nClick me!';
    link.style.whiteSpace = 'pre-line';
    link.style.lineHeight = '1.2'; // Better spacing for smaller text

    circle.appendChild(link);
    document.body.appendChild(circle);

    // Animate in
    requestAnimationFrame(() => {
        circle.style.transform = 'scale(1)';
        circle.style.opacity = '1';
    });

    // Hover effect
    circle.addEventListener('mouseover', () => {
        circle.style.transform = 'scale(1.1)';
    });

    circle.addEventListener('mouseout', () => {
        circle.style.transform = 'scale(1)';
    });

    // Remove after delay with animation
    setTimeout(() => {
        circle.style.transform = 'scale(0)';
        circle.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(circle)) {
                document.body.removeChild(circle);
            }
        }, 300);
    }, 10000);
}

function schedulePositivityCircle() {
    // Random time between 10-20 minutes (in milliseconds)
    const minTime = 10 * 60 * 1000    
    const maxTime = 20 * 60 * 1000 
    const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    
    positivityBubbleTimer = setTimeout(() => {
        showPositivityCircle();
        schedulePositivityCircle();
    }, randomTime);
}

// Start the circle scheduling
if (positivityBubbleEnabled) {
    schedulePositivityCircle();
}

// Check for excluded domains first
if (!isExcludedDomain) {
    initializeExtension();
    initializeObserver();
} else {
    console.log('Extension deactivated on excluded site');
}

console.log('Content script loaded');