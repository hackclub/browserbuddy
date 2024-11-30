"use strict";

import "../css/popup.css";
import { SettingsInstance } from "./background";
import { BrowserStorage } from "./utils/BrowserStorage";

(function() {
    const initSettings = async () => {
        // get settings
        const storage = await BrowserStorage.getAll();

        // if there's still undefined initialise the storage
        // TODO: make this only check existing settings and not everything
        if (Object.values(storage).some(s => s === undefined)) {
            await SettingsInstance.initStorage();
        }

        document
            .getElementsByClassName("settings")[0]
            .insertAdjacentHTML("afterbegin", SettingsInstance.getHTML());

        // get all settings options
        const all = document.getElementsByClassName("setting");

        for (let element of all) {
            // load setting state
            const input = element.querySelector("input");
            const id = input.id;

            input.checked = storage[id] === true;

            // register listener
            input.addEventListener("change", async () => {
                BrowserStorage.set(id, input.checked);
            });
        }
    };

    document.addEventListener("DOMContentLoaded", initSettings);
})();

console.log("hello");
