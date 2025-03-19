// YouTube Enhancer - Subscription & Comments Feature
        (function() {
            'use strict';

            // Configuration for subscription and comments features
            const SELECTORS = {
                COMMENTS_SECTION: 'ytd-comments#comments',
                SUBSCRIPTION_BUTTON: 'ytd-subscribe-button-renderer',
                COMMENTS_COUNT: 'ytd-comments-header-renderer #count',
                PINNED_COMMENT: 'ytd-comment-thread-renderer[is-pinned]'
            };

            // Initialize the feature
            function init() {
                // Check if extension is enabled
                chrome.storage.local.get(['extensionEnabled', 'commentEnhancementsEnabled'], (result) => {
                    if (result.extensionEnabled === false) return;

                    // Apply enhancements if enabled
                    if (result.commentEnhancementsEnabled !== false) {
                        enhanceComments();
                    }

                    enhanceSubscriptions();
                    observeChanges();
                });
            }

            // Enhance comments section
            function enhanceComments() {
                // Apply styling to comments section
                const commentsSection = document.querySelector(SELECTORS.COMMENTS_SECTION);
                if (commentsSection) {
                    commentsSection.classList.add('youtube-enhancer-comments');

                    // Highlight pinned comments
                    const pinnedComment = document.querySelector(SELECTORS.PINNED_COMMENT);
                    if (pinnedComment) {
                        pinnedComment.classList.add('youtube-enhancer-pinned-comment');
                    }
                }
            }

            // Enhance subscription button
            function enhanceSubscriptions() {
                const subButton = document.querySelector(SELECTORS.SUBSCRIPTION_BUTTON);
                if (subButton) {
                    subButton.classList.add('youtube-enhancer-subscription');
                }
            }

            // Observe DOM changes to apply enhancements to dynamically loaded content
            function observeChanges() {
                const observer = new MutationObserver((mutations) => {
                    // Check if comments section is added
                    const commentsSection = document.querySelector(SELECTORS.COMMENTS_SECTION);
                    if (commentsSection && !commentsSection.classList.contains('youtube-enhancer-comments')) {
                        enhanceComments();
                    }

                    // Check for subscription button changes
                    const subButton = document.querySelector(SELECTORS.SUBSCRIPTION_BUTTON);
                    if (subButton && !subButton.classList.contains('youtube-enhancer-subscription')) {
                        enhanceSubscriptions();
                    }
                });

                // Start observing
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }

            // Initialize on page load
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }
        })();