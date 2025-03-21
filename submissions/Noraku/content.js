if (!chrome.runtime?.id) {
    console.warn("❌ Extension context invalidated. Content script won't run.");
} else {

    let audio = document.createElement("audio");
    audio.style.display = "none";

    const bd = document.querySelector("body");
    bd.appendChild(audio);

    let scrollCooldown = false;
    let lastScrollTime = 0;
    const SCROLL_DELAY = 300;

    function playSound(soundName) {
        let now = Date.now();
        if (scrollCooldown || now - lastScrollTime < SCROLL_DELAY) return;

        lastScrollTime = now;

        if (chrome.runtime?.id) {
            chrome.storage.local.get(["volumes"], (data) => {
                const volumes = data.volumes || {};
                const volume = volumes[soundName] !== undefined ? volumes[soundName] / 100 : 0.5; // Default 50%
        
                if (chrome.runtime?.id) {  // Additional check before accessing runtime API
                    audio.src = chrome.runtime.getURL(`sounds/${soundName}.mp3`);
                    audio.volume = volume;
        
                    audio.play().catch(() => {
                        // Catch and ignore any play() errors (e.g., user didn't interact)
                    });
                }
            });
        }

        scrollCooldown = true;
        setTimeout(() => (scrollCooldown = false), SCROLL_DELAY);
    }

    window.addEventListener("wheel", () => playSound("scroll"), { passive: true });
    window.addEventListener("touchmove", () => playSound("scroll"), { passive: true });

    window.addEventListener("keydown", (event) => {
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(event.key)) {
            playSound("scroll");
        }
    });

    document.addEventListener("scroll", () => playSound("scroll"), { passive: true });

    document.addEventListener("submit", () => {
        chrome.runtime.sendMessage({ action: "playSound", sound: "form_submit" })
    });

    document.addEventListener("click", (event) => {
        const element = event.target;

        if (
            element.tagName === "INPUT" && element.type === "text" ||  
            element.tagName === "INPUT" && element.type === "search" || 
            element.tagName === "TEXTAREA" || 
            element.isContentEditable 
        ) {
            playSound("search_focus");
        }
    });

    document.addEventListener("keydown", (event) => {
        let soundName = null;
        let key = event.key; 

        if (key.match(/^[a-z]$/i)) {
            soundName = "A_Z"; // A-Z and a-z keys
        } else if (key.match(/^[0-9]$/)) {
            soundName = "num-keys"; // Number keys above A-Z
        } else if (["Control", "Shift", "Tab", "CapsLock", "Alt"].includes(key)) {
            soundName = "special-keys"; // Special keys
        } else if (key === "Enter") {
            soundName = "enter"; // Enter key sound
        } else if (key === "Backspace") {
            soundName = "backspace"; // Backspace key
        } else if (key === "Escape") {
            soundName = "escape"; // Escape key
        } 
        else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
            playWithCooldown("arrow-keys", 150); 
            return;
        } else if (key === " ") {
            playWithCooldown("spacebar", 200); 
            return;
        } else if (key.match(/^F[1-9]$|^F1[0-2]$/)) {
            playWithCooldown("function-keys", 300); 
            return;
        }

        if (soundName) {
            playSound(soundName);
        }
    });
    
    // Function to handle cooldown-based key sounds
    let keyCooldown = false;
    function playWithCooldown(sound, delay) {
        if (keyCooldown) return;
        
        playSound(sound);
        keyCooldown = true;
        
        setTimeout(() => {
            keyCooldown = false;
        }, delay);
    }

    function detectVideos(root = document) {
        root.querySelectorAll("video").forEach(video => {
            if (!video.dataset.hasListener) {
                video.dataset.hasListener = "true";

                video.addEventListener("play", () => playSound("video_play"));
                video.addEventListener("pause", () => playSound("video_pause"));
            }
        });
    }

    const observer = new MutationObserver(() => {
        detectVideos();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    detectVideos();

    if (window.location.hostname.includes("youtube.com")) {
        setInterval(detectVideos, 1000);
    }

    document.addEventListener("click", () => playSound("click"));

    document.addEventListener("mouseover", (event) => {
        const element = event.target;

        if (
            element.tagName === "A" ||
            element.tagName === "BUTTON" ||
            element.hasAttribute("role") && element.getAttribute("role") === "button" ||
            element.hasAttribute("data-clickable")
        ) {
            playSound("hover");
        }
    });

    document.addEventListener("contextmenu", (event) => {
        // Do nothing special, allow the default right-click behavior
    });

    document.addEventListener("keydown", (event) => {
        const blockedShortcuts = ["s", "u", "i", "j"];
        if (event.ctrlKey && blockedShortcuts.includes(event.key.toLowerCase())) {
            event.preventDefault();
            playSound("error");
        }
    });

    // ✅ Form Validation Errors
    document.addEventListener("invalid", (event) => {
        playSound("error");
    }, true);

    // ✅ Clicking Disabled Buttons
    document.addEventListener("click", (event) => {
        if (event.target.tagName === "BUTTON" && event.target.disabled) {
            playSound("error");
        }
    });

    // ✅ Download Failures
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "downloadFailed") {
            playSound("error");
        }
    });
}


