"use strict";

/**
 * Storage manager.
 * TODO: also use firefox's browser namespace
 */
export class BrowserStorage {
    /**
     * get a setting from storage.
     * from https://stackoverflow.com/a/54261558
     * @param {String} key key to get. set to null for all settings
     * @returns {*} setting value, or undefined
     */
    static get = async key =>
        new Promise((resolve, reject) =>
            chrome.storage.local.get(
                key,
                result =>
                    chrome.runtime.lastError
                        ? reject(Error(chrome.runtime.lastError.message))
                        : resolve(result)
            )
        );

    /**
     * set a setting to storage.
     * TODO: maybe change to this https://stackoverflow.com/a/54261558
     * @param {String} setting setting id
     * @param {*} value new value
     */
    static set = async (id, value) => {
        chrome.storage.local.set({ [id]: value });
    };

    static async getAll() {
        return await this.get(null);
    }
}
