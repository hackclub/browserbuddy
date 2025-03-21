document.addEventListener("DOMContentLoaded", function () {
    // Handle Show More Toggle
    const expandToggle = document.querySelector(".expand-toggle");
    const moreActions = document.querySelector(".more-actions");
    const expandArrow = expandToggle.querySelector(".arrow");

    expandToggle.addEventListener("click", function () {
        if (moreActions.style.display === "none" || moreActions.style.display === "") {
            moreActions.style.display = "block";
            expandArrow.textContent = "▲ Show Less";
        } else {
            moreActions.style.display = "none";
            expandArrow.textContent = "▼ Show More";
        }
    });

    // Handle Keypress Action Expand/Collapse
    const keypressArrow = document.querySelector(".right-arrow[data-action='keypress']");
    const keypressSubcategories = document.querySelector(".keypress-subcategories");

    keypressArrow.addEventListener("click", function () {
        if (keypressSubcategories.style.display === "none" || keypressSubcategories.style.display === "") {
            keypressSubcategories.style.display = "block";
            this.textContent = "▼"; 
        } else {
            keypressSubcategories.style.display = "none";
            this.textContent = "▶";
        }
    });

    // Handle Volume Slider Expand/Collapse
    document.querySelectorAll(".right-arrow").forEach(arrow => {
        arrow.addEventListener("click", function () {
            const action = this.getAttribute("data-action");
            const sliderContainer = document.getElementById(`slider-container-${action}`);

            if (!sliderContainer) { 
                return;
            }

            if (sliderContainer.style.display === "none" || sliderContainer.style.display === "") {
                sliderContainer.style.display = "block";
                this.textContent = "▼"; 
            } else {
                sliderContainer.style.display = "none";
                this.textContent = "▶"; 
            }
        });
    });

    // Load saved volumes from storage
    chrome.storage.local.get(["volumes"], (data) => {
        const volumes = data.volumes || {};

        document.querySelectorAll(".volume-slider input").forEach(slider => {
            const action = slider.closest(".volume-slider").getAttribute("data-action");
            slider.value = volumes[action] !== undefined ? volumes[action] : 50; 
        });
    });

    // Handle Volume Changes
    document.querySelectorAll(".volume-slider input").forEach(slider => {
        slider.addEventListener("input", function () {
            const action = this.closest(".volume-slider").getAttribute("data-action");
            const volume = this.value;

            chrome.storage.local.get(["volumes"], (data) => {
                const volumes = data.volumes || {};
                volumes[action] = volume;

                chrome.storage.local.set({ volumes }, () => {
                    console.log(`🔊 Saved volume for ${action}: ${volume}`);

                    chrome.runtime.sendMessage({ action: "updateVolume", volumes });
                });
            });
        });
    });

    // Ensure Sound Plays
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "playSound") {
            let audio = new Audio(chrome.runtime.getURL(`sounds/${message.sound}.mp3`));
            audio.volume = 1.0;

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    document.addEventListener("click", () => audio.play(), { once: true });
                    document.addEventListener("keydown", () => audio.play(), { once: true });
                });
            }
        }
    });
});
