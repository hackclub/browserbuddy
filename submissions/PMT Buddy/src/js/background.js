"use strict";

import { Settings } from "./utils/Settings";

/**
 * Instance with all settings.
 */
export const SettingsInstance = new Settings();

SettingsInstance
    // Physics and Maths Tutor (PMT)
    .addSetting({
        name: "Clean up PDFs",
        id: "pmt_CleanUpPdfs",
        category: "Physics and Maths Tutor",
        defaultValue: true,
        info:
            "Redirects PDFs to the original source to remove the white sidebar."
    })
    .addSetting({
        name: "Hide paid tutor content",
        id: "pmt_BlockPmtTutor",
        category: "Physics and Maths Tutor",
        defaultValue: false,
        info: "Hides most paid PMT Education content."
    })
    // SaveMyExams (SME)
    .addSetting({
        name: "Unblock 'Revision Notes'",
        id: "sme_unblockRevisionNotes",
        category: "SaveMyExams",
        defaultValue: true,
        info: "View revision notes without logging in."
    })
    .addSetting({
        name: "Remove premium plan offer banners",
        id: "sme_removePremiumPlanBanners",
        category: "SaveMyExams",
        defaultValue: true,
        info:
            "Removes the premium plan offer banners, including Black Friday sales. (currently broken)"
    })
    // studocu (STUDOCU)
    .addSetting({
        name: "Hide 'Premium' banners",
        id: "studocu_HidePremiumBanners",
        category: "studocu",
        defaultValue: true,
        info:
            "Hides annoying banner on premium documents (cannot unblur pages)."
    })
    .initStorage();
