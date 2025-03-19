// features/vidplayer.js
(function() {
    'use strict';

    // Configuration - simplified
    const config = {
        defaultVolume: 0.8,
        speedOptions: [0.5, 0.75, 1, 1.25, 1.5, 2],
        defaultGridSize: 4  // Fixed default grid size
    };

    // State management - simplified
    let state = {
        initialized: false,
        player: null
    };

    // Initialize function that will be called when the feature is enabled
    function initialize() {
        if (state.initialized) return;
        
        console.log('YouTube Enhancer: Initializing video player improvements');
        
        // Apply clean UI
        applyCleanUI();
        
        // Apply default video grid layout
        applyDefaultVideoGrid();
        
        // Wait for YouTube player to be ready
        waitForYouTubePlayer()
            .then(setupEnhancedPlayer)
            .catch(err => console.error('YouTube Enhancer: Error initializing player', err));
        
        state.initialized = true;
        
        return cleanup; // Return cleanup function for content.js
    }

    // Apply a cleaner UI by hiding distractions
    function applyCleanUI() {
        // Only add the style once
        if (document.getElementById('youtube-enhancer-clean-view')) {
            return;
        }
        
        // Create a style element to hold our custom hiding rules
        const style = document.createElement('style');
        style.id = 'youtube-enhancer-clean-view';
        style.textContent = `
            /* Hide masthead ad banners */
            #masthead-ad {
                display: none !important;
            }
            
            /* Hide promotional elements */
            ytd-merch-shelf-renderer, 
            ytd-movie-offer-module-renderer,
            .ytp-ce-element,
            .ytp-cards-button,
            #clarify-box,
            ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-structured-description"],
            ytd-info-panel-content-renderer {
                display: none !important;
            }
            
            /* Hide rich shelf headers */
            #rich-shelf-header,
            ytd-rich-shelf-renderer #rich-shelf-header,
            #rich-section-header,
            .ytd-rich-shelf-renderer #rich-shelf-header,
            ytd-rich-grid-renderer #rich-shelf-header {
                display: none !important;
            }
            
            /* Perfect video fit in container */
            .html5-main-video.video-stream {
                width: 100% !important;
                height: 100% !important;
                object-fit: contain !important;
                max-height: 100vh !important;
                position: relative !important;
                left: 0 !important;
                top: 0 !important;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Apply a default grid layout with reasonable values
    function applyDefaultVideoGrid() {
        // Remove any existing grid style
        const existingStyle = document.getElementById('youtube-enhancer-grid-layout');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const gridStyle = document.createElement('style');
        gridStyle.id = 'youtube-enhancer-grid-layout';
        gridStyle.textContent = `
            /* Set video grid to a reasonable default */
            ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer {
                display: grid !important;
                grid-template-columns: repeat(${config.defaultGridSize}, 1fr) !important;
                grid-gap: 16px !important;
                padding: 16px !important;
            }
            
            /* Video item sizing adjustments */
            ytd-rich-item-renderer, 
            ytd-grid-video-renderer,
            ytd-compact-video-renderer {
                width: 100% !important;
                margin: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                height: auto !important;
            }
            
            /* Consistent thumbnail heights */
            ytd-thumbnail {
                width: 100% !important;
                aspect-ratio: 16/9 !important;
                margin-bottom: 8px !important;
            }
            
            /* Fix thumbnail images */
            ytd-thumbnail #thumbnail {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
            }
            
            /* Responsive adjustments */
            @media (max-width: 1200px) {
                ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer {
                    grid-template-columns: repeat(3, 1fr) !important;
                }
            }
            
            @media (max-width: 768px) {
                ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
            }
            
            @media (max-width: 480px) {
                ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer {
                    grid-template-columns: repeat(1, 1fr) !important;
                }
            }
        `;
        
        document.head.appendChild(gridStyle);
    }

    // Wait for YouTube player to be ready
    function waitForYouTubePlayer() {
        return new Promise((resolve) => {
            const checkForPlayer = () => {
                const player = document.querySelector('#movie_player');
                if (player) {
                    resolve(player);
                } else {
                    setTimeout(checkForPlayer, 200);
                }
            };
            checkForPlayer();
        });
    }

    // Setup enhanced player features - simplified
    function setupEnhancedPlayer(player) {
        state.player = player;
        
        // Add focus mode button
        addFocusModeButton();
        
        // Add speed control
        addSpeedControl();
        
        // User-friendly notification
        showNotification('YouTube Enhancer activated');
    }

    // Add focus mode toggle button
    function addFocusModeButton() {
        const controlsRight = state.player.querySelector('.ytp-right-controls');
        if (!controlsRight) return;
        
        // Create focus mode button
        const focusModeButton = document.createElement('button');
        focusModeButton.className = 'ytp-button youtube-enhancer-focus-button';
        focusModeButton.title = 'Focus Mode (Hide Recommendations)';
        
        // Create SVG icon for the button
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", "0 0 36 36");
        
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-5v2h5v3h2v-5h-2v0zm-5-5h5V7h-2v3h-3v2z");
        path.setAttribute("fill", "white");
        
        svg.appendChild(path);
        focusModeButton.appendChild(svg);
        
        let focusModeEnabled = false;
        
        focusModeButton.addEventListener('click', () => {
            focusModeEnabled = !focusModeEnabled;
            
            // Add style for focus mode if not exists
            if (!document.getElementById('youtube-enhancer-focus-mode-style')) {
                const style = document.createElement('style');
                style.id = 'youtube-enhancer-focus-mode-style';
                style.textContent = `
                    body.youtube-enhancer-focus-mode ytd-watch-next-secondary-results-renderer {
                        display: none !important;
                    }
                `;
                document.head.appendChild(style);
            }
            
            if (focusModeEnabled) {
                document.body.classList.add('youtube-enhancer-focus-mode');
                focusModeButton.classList.add('active');
                showNotification('Focus mode enabled');
            } else {
                document.body.classList.remove('youtube-enhancer-focus-mode');
                focusModeButton.classList.remove('active');
                showNotification('Focus mode disabled');
            }
        });
        
        controlsRight.insertBefore(focusModeButton, controlsRight.firstChild);
    }

    // Add custom speed control
    function addSpeedControl() {
        const controlsRight = state.player.querySelector('.ytp-right-controls');
        if (!controlsRight) return;
        
        // Create speed button
        const speedButton = document.createElement('button');
        speedButton.className = 'ytp-button youtube-enhancer-speed-button';
        speedButton.title = 'Playback Speed';
        
        // Create text element for speed display
        const speedText = document.createElement('span');
        speedText.textContent = '1x';
        speedButton.appendChild(speedText);
        
        // Create speed menu
        const speedMenu = document.createElement('div');
        speedMenu.className = 'youtube-enhancer-speed-menu';
        speedMenu.style.display = 'none';
        speedMenu.style.position = 'absolute';
        speedMenu.style.backgroundColor = 'rgba(28, 28, 28, 0.9)';
        speedMenu.style.borderRadius = '4px';
        speedMenu.style.padding = '8px 0';
        speedMenu.style.zIndex = '2000';
        speedMenu.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        
        // Add speed options
        config.speedOptions.forEach(speed => {
            const option = document.createElement('div');
            option.className = 'youtube-enhancer-speed-option';
            option.textContent = `${speed}x`;
            option.style.padding = '8px 16px';
            option.style.color = 'white';
            option.style.cursor = 'pointer';
            option.style.fontSize = '14px';
            
            // Highlight on hover
            option.addEventListener('mouseover', () => {
                option.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            
            option.addEventListener('mouseout', () => {
                option.style.backgroundColor = '';
            });
            
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const video = state.player.querySelector('video');
                if (!video) return;
                
                video.playbackRate = speed;
                speedText.textContent = `${speed}x`;
                speedMenu.style.display = 'none';
                showNotification(`Speed: ${speed}x`);
            });
            
            speedMenu.appendChild(option);
        });
        
        // Toggle speed menu on click
        speedButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (speedMenu.style.display === 'none') {
                speedMenu.style.display = 'block';
                
                // Position menu
                const rect = speedButton.getBoundingClientRect();
                speedMenu.style.top = `${rect.bottom}px`;
                speedMenu.style.right = `${window.innerWidth - rect.right}px`;
            } else {
                speedMenu.style.display = 'none';
            }
        });
        
        // Hide menu when clicking elsewhere
        document.addEventListener('click', () => {
            speedMenu.style.display = 'none';
        });
        
        // Update speed button text when speed changes
        const video = state.player.querySelector('video');
        if (video) {
            video.addEventListener('ratechange', () => {
                speedText.textContent = `${video.playbackRate}x`;
            });
        }
        
        controlsRight.insertBefore(speedButton, controlsRight.firstChild);
        document.body.appendChild(speedMenu);
    }

    // Show notification
    function showNotification(message) {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.youtube-enhancer-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'youtube-enhancer-notification';
        notification.textContent = message;
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.bottom = '24px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(33, 33, 33, 0.9)';
        notification.style.color = 'white';
        notification.style.padding = '8px 16px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '9999';
        notification.style.fontSize = '14px';
        notification.style.fontWeight = 'bold';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Cleanup function (called when feature is disabled)
    function cleanup() {
        if (!state.initialized) return;
        
        console.log('YouTube Enhancer: Cleaning up video player improvements');
        
        // Remove custom styles
        const cleanViewStyle = document.getElementById('youtube-enhancer-clean-view');
        if (cleanViewStyle) {
            cleanViewStyle.remove();
        }
        
        const gridLayoutStyle = document.getElementById('youtube-enhancer-grid-layout');
        if (gridLayoutStyle) {
            gridLayoutStyle.remove();
        }
        
        const focusModeStyle = document.getElementById('youtube-enhancer-focus-mode-style');
        if (focusModeStyle) {
            focusModeStyle.remove();
        }
        
        // Remove focus mode class if active
        document.body.classList.remove('youtube-enhancer-focus-mode');
        
        // Remove custom buttons
        document.querySelectorAll('.youtube-enhancer-focus-button, .youtube-enhancer-speed-button').forEach(el => el.remove());
        
        // Remove speed menu
        const speedMenu = document.querySelector('.youtube-enhancer-speed-menu');
        if (speedMenu) {
            speedMenu.remove();
        }
        
        // Remove notifications
        const notification = document.querySelector('.youtube-enhancer-notification');
        if (notification) {
            notification.remove();
        }
        
        state.initialized = false;
    }

    // Return the public API
    return {
        init: initialize
    };
})();