"use strict";

import constants from "../../utils/constants";

export const sme_unblockRevisionNotes = () => {
    let found = false;

    const observer = new MutationObserver((mutations, observer) => {
        if (found) return;
        if (document.querySelector(".revision-notes_blur__iugNW")) {
            found = true;
            observer.disconnect();
            unlock();
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });
};

const unlock = () => {
    const notice = `
        <div class="Card_card__7rJy4 bg-body-secondary rounded-3 p-4 pmt-buddy-notice">
            <img src="${constants.image.pmt_sketch}" alt="pmt-buddy-icon" width=40 height=40>
            <h4 class="h5">pmtbuddy-title</h4>
            <div>
                <p>pmtbuddy-text</p>
            </div>
        </div>`;
    // used some of their classes to make it look fancy
    // pmt-buddy-notice is a custom class

    // get blurred part
    const blurred = document.querySelector(".revision-notes_blur__iugNW");

    // get blocked notes
    let notes = document.querySelectorAll(".Parts_parts__KB319"); // preferred
    if (notes.length === 0) notes = document.querySelectorAll(".row.g-4"); // fallback
    if (notes.length === 0) {
        blurred.insertAdjacentHTML(
            "beforebegin",
            notice
                .replace("pmtbuddy-title", "Failed to unlock")
                .replace("pmtbuddy-text", "Try reloading the page")
        );
        return;
    }

    blurred.insertAdjacentHTML(
        "beforebegin",
        notice
            .replace("pmtbuddy-title", "Unlocked by PMT Buddy")
            .replace(
                "pmtbuddy-text",
                `<a href="mailto:${constants.contact_email}">Contact me</a> if you run into any issues.`
            )
    );
    let next = blurred;

    // insert notes
    notes.forEach(note => {
        next.insertAdjacentElement("afterend", note);
        next = note;
    });

    // delete sign up card
    const signUpCard = document.querySelector(".SignUpCard_card__0U5gw");
    signUpCard?.remove();
};
