// features/shorts2long.js

(function() {
    'use strict';

    function init() {
        // Handle current page if it's a shorts URL
        redirectIfShortsPage();
        
        // Set up observers to catch and modify any shorts links on the page
        setupLinkObserver();
        
        return cleanup; // Return cleanup function for content.js
    }

    // Redirect current page if it's a shorts URL
    function redirectIfShortsPage() {
        const currentUrl = new URL(window.location.href);
        if (currentUrl.pathname.startsWith('/shorts/')) {
            const videoId = currentUrl.pathname.split('/shorts/')[1].split('/')[0];
            if (videoId) {
                console.log('YouTube Enhancer: Converting shorts URL to standard video URL');
                const newUrl = new URL('/watch', currentUrl.origin);
                newUrl.searchParams.set('v', videoId);
                
                // Preserve other search parameters
                currentUrl.searchParams.forEach((value, key) => {
                    if (key !== 'v') {
                        newUrl.searchParams.set(key, value);
                    }
                });
                
                // Preserve hash if present
                newUrl.hash = currentUrl.hash;
                
                // Use history API instead of replace to avoid redirect loops
                window.history.replaceState({}, '', newUrl.toString());
                // Force page reload if needed
                window.location.href = newUrl.toString();
            }
        }
    }

    // Intercept clicks on shorts links
    function setupLinkObserver() {
        // Intercept all clicks on the document
        document.addEventListener('click', function(event) {
            // Look for link elements in the event path
            const path = event.composedPath();
            for (const element of path) {
                if (element.tagName === 'A' && element.href && element.href.includes('/shorts/')) {
                    // Prevent default navigation
                    event.preventDefault();
                    event.stopPropagation();
                    
                    // Convert shorts URL to watch URL
                    const shortsUrl = new URL(element.href);
                    const videoId = shortsUrl.pathname.split('/shorts/')[1]?.split('/')[0];
                    
                    if (videoId) {
                        // Create watch URL
                        const watchUrl = new URL('/watch', shortsUrl.origin);
                        watchUrl.searchParams.set('v', videoId);
                        
                        // Preserve other parameters
                        shortsUrl.searchParams.forEach((value, key) => {
                            if (key !== 'v') {
                                watchUrl.searchParams.set(key, value);
                            }
                        });
                        
                        // Navigate to the watch URL
                        window.location.href = watchUrl.toString();
                        return;
                    }
                }
            }
        }, true); // Use capture phase to catch events before they reach the target
        
        // Also modify all existing shorts links on the page
        modifyExistingShortsLinks();
        
        // Set up observer to modify shorts links as they're added to the DOM
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    modifyExistingShortsLinks();
                }
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Find and modify all shorts links on the page
    function modifyExistingShortsLinks() {
        const shortsLinks = document.querySelectorAll('a[href*="/shorts/"]');
        shortsLinks.forEach(link => {
            if (!link.hasAttribute('data-shorts-converted')) {
                const shortsUrl = new URL(link.href);
                const videoId = shortsUrl.pathname.split('/shorts/')[1]?.split('/')[0];
                
                if (videoId) {
                    const watchUrl = new URL('/watch', shortsUrl.origin);
                    watchUrl.searchParams.set('v', videoId);
                    
                    // Preserve other parameters
                    shortsUrl.searchParams.forEach((value, key) => {
                        if (key !== 'v') {
                            watchUrl.searchParams.set(key, value);
                        }
                    });
                    
                    // Update the href
                    link.href = watchUrl.toString();
                    
                    // Mark as converted
                    link.setAttribute('data-shorts-converted', 'true');
                }
            }
        });
    }
    
    // Cleanup function for when feature is disabled
    function cleanup() {
        // Nothing specific to clean up as we're not adding persistent listeners
        // that would need to be removed when the feature is disabled
        console.log('Shorts2Long: Cleanup called');
    }

    // Register with YouTube Enhancer
    window.youtubeEnhancer = window.youtubeEnhancer || {};
    window.youtubeEnhancer.shorts2long = { init };
})();