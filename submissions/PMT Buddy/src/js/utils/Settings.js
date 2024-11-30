'use strict';

import { BrowserStorage } from "./BrowserStorage";

/**
 * A handler for all things settings
 */
export class Settings {
    constructor() {
        this.settings = {};
        this.categories = [];
    }

    /**
     * Add a checkbox.
     * // TODO: add javadocs
     */
    addSetting({
        name = null,
        id,
        category = "None",
        defaultValue = false,
        info = ""
    }) {
        // creates the category if it doesn't exist
        if (this.settings[category] === undefined) {
            this.settings[category] = [];
            this.categories.push(category);
        }

        const setting = {
            name: name ?? id,
            id: id,
            defaultValue: defaultValue,
            info: info
        };

        this.settings[category].push(setting);
        return this;

    }

    /**
     * Gets all settings.
     * Should only be run after all categories and settings are added.
     */
    getSettings() {
        return this.settings
    }

    getCategories() {
        return this.categories
    }

    /**
     * Gets the settings HTML.
     * Should only be run after all categories and settings are added.
     * @returns {String} HTML
     */
    getHTML() {
        let html = '';
        this.categories.forEach(categoryName => {
            html += 
                    '<details class="settings-category">' +
                    `    <summary>${categoryName}</summary>`

            this.settings[categoryName].forEach(setting => {
                html +=
                    `    <label class="setting" title="${setting.info}">` +
                    `        ${setting.name}` +
                    `        <input type="checkbox" id="${setting.id}"/>` +
                    '    </label>';
            });
            html += 
                    '</details>'
        });

        if (html === '') {
            html = '<p>No settings available</p>';
        }
        return html;
    }

    /**
     * Sets the setting default values to storage.
     */
    async initStorage() {
        const storage = await BrowserStorage.getAll();
        const settings = this.getSettings();
        this.getCategories().forEach(categoryName => {
            settings[categoryName].forEach(async setting => {
                if (storage[setting.id] === undefined) {
                    await BrowserStorage.set(setting.id, setting.defaultValue);
                }
            });
        });
    };
};
