class TabDragDropManager {
    constructor() {
        this.init();
    }

    init() {
        this.trackPageTime();
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            background: #000000 !important;
            color: #ffffff !important;
            padding: 20px 25px !important;
            border: 4px solid #ffffff !important;
            font-family: 'Courier New', monospace !important;
            font-size: 16px !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            letter-spacing: 2px !important;
            box-shadow: 8px 8px 0px #ffffff !important;
            z-index: 999997 !important;
            transform: translateX(500px) !important;
            transition: all 0.4s ease !important;
            white-space: nowrap !important;
        `;
        
        notification.textContent = `◼ ${message.toUpperCase()}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(500px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 400);
        }, 3000);
    }

    trackPageTime() {
        let startTime = Date.now();
        let isVisible = true;
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                if (isVisible) {
                    const timeSpent = Date.now() - startTime;
                    try {
                        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                            chrome.runtime.sendMessage({
                                action: 'trackPageTime',
                                url: window.location.href,
                                title: document.title,
                                timeSpent: timeSpent
                            });
                        }
                    } catch (error) {
                        console.log(`Page time: ${timeSpent}ms on ${document.title}`);
                    }
                    isVisible = false;
                }
            } else {
                startTime = Date.now();
                isVisible = true;
            }
        });
        
        window.addEventListener('beforeunload', () => {
            if (isVisible) {
                const timeSpent = Date.now() - startTime;
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                        chrome.runtime.sendMessage({
                            action: 'trackPageTime',
                            url: window.location.href,
                            title: document.title,
                            timeSpent: timeSpent
                        });
                    }
                } catch (error) {
                    console.log(`Page time on unload: ${timeSpent}ms on ${document.title}`);
                }
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TabDragDropManager();
    });
} else {
    new TabDragDropManager();
}