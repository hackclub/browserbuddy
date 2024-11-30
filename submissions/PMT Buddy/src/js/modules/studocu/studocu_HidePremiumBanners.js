"use strict";

export const studocu_HidePremiumBanners = () => {
    let found = false;

    const observer = new MutationObserver((mutations, observer) => {
        if (found) return;
        if (document.querySelector("._761ee514a558")) {
            found = true;
            observer.disconnect();
            deleteBanners();
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });
};

const deleteBanners = () => {
    const banners = document.querySelectorAll("._761ee514a558");
    banners.forEach(banner => banner.remove());
};
