"use strict";

// currently broken

export const sme_removePremiumPlanBanners = () => {
    let found = false;
    const observer = new MutationObserver((mutations, observer) => {
        if (found) return;
        const banner = document.getElementsByClassName(
            "UpsellBanner_banner__jw3IG"
        );
        if (banner.length > 0) {
            Array.from(banner).forEach(b => b.remove());
			observer?.disconnect();
            found = true;
        }
    });
};
