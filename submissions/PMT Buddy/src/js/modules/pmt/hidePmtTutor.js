"use strict";

// TODO: use MutationObserver

export const pmt_HidePmtTutor = () => {
    // top banner
    const banners = document.querySelectorAll(".info-banner");
    if (banners) banners.forEach(banner => {
        const link = banner.querySelector(".info-button")?.href ?? "";
        if (/https:\/\/www\.pmt\.education\/tutor\/.*/.test(link))
            banner.remove();
    });

    // TODO: also hide tutor buttons in the top

    // tutor profile box(es)
    const tutors = document.querySelectorAll(".tutor-profile-box");
    tutors.forEach(el => el.remove());

    // preparation courses
    const courses = document.querySelectorAll(".dropshadowboxes-container");
    courses.forEach(el => {
        const links = el.getElementsByTagName("a");
        if (links)
            Array.from(links).forEach(link => {
                const literalLink = link?.href ?? "";
                console.log(literalLink);
                if (/https:\/\/www\.pmt\.education\/(courses|tutor)\/.*/.test(literalLink))
                    el.remove();
                    return;
        });
    })
};