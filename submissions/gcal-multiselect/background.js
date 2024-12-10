let calendarId = "";
let isExtensionActive = false;
let authToken = null;


chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.storage.sync.set({ isExtensionActive: false });
    chrome.storage.sync.get("calendarId", (data) => {
        calendarId = data.calendarId || "";
    });
});


chrome.runtime.onStartup.addListener(() => {
    chrome.storage.sync.get(["isExtensionActive", "calendarId"], (data) => {
        isExtensionActive = data.isExtensionActive || false;
        let badgeText = "";
        if (isExtensionActive) {
            badgeText = "ON";
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0].id) {
                    let promise = checkAndInjectContentScript(tabs[0].id);
                    promise.then(
                        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleExtensionState", active: isExtensionActive })
                    )
                }
            });
        } else {
            badgeText = "OFF";
        }
        chrome.action.setBadgeText({ text: badgeText });
        calendarId = data.calendarId || "";
    });
});


// When page is reloaded
chrome.webNavigation.onCommitted.addListener(() => {
    chrome.storage.sync.get(["isExtensionActive", "calendarId"], (data) => {
        if (isExtensionActive) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0].id) {
                    let promise = checkAndInjectContentScript(tabs[0].id);
                    promise.then(
                        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleExtensionState", active: isExtensionActive })
                    )
                }
            });
        }
        calendarId = data.calendarId || "";
    });
}, {
    url: [{ hostContains: "calendar.google.com/calendar" }]
});


// When user switches to a different week/day, which changes the tab's url
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.url.startsWith("https://calendar.google.com/calendar/")) {
        chrome.storage.sync.get(["isExtensionActive", "calendarId"], (data) => {
            if (isExtensionActive && calendarId) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "deselectAllEvents", newCalendarId: data.calendarId })
                });
            }
        });
    }
});


function checkAndInjectContentScript(tabId) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, { action: "isContentScriptRunning"}, (response) => {
            if (chrome.runtime.lastError || !response || !response.running) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["content.js"]
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Failed to inject content script:", chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                    } else {
                        console.log("Content script injected successfully.");
                        resolve();
                    }
                });
            } else {
                console.log("Content script is already running.");
                resolve();
            }
        })
    })
}


function getAuthToken() {
    return new Promise((resolve, reject) => {
        if (authToken) {
            resolve(authToken);
        } else {
            chrome.identity.getAuthToken({ interactive: true }, (token) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    authToken = token;
                    resolve(token);
                }
            });
        }
    });
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.action === "toggleExtensionState") {
        isExtensionActive = request.active;
        let badgeText = "";
        if (isExtensionActive) {
            badgeText = "ON";
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0].id) {
                    let promise = checkAndInjectContentScript(tabs[0].id);
                    promise.then(
                        result => chrome.tabs.sendMessage(tabs[0].id, { action: "toggleExtensionState", active: isExtensionActive }),
                        error => console.error("Error with checkAndInjectContentScript promise.")
                    )
                }
            });
        } else {
            badgeText = "OFF";
        }
        chrome.action.setBadgeText({ text: badgeText });
    }

    if (request.action === "updateCalendarId") {
        const newCalendarId = request.calendarId;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "updateCalendarId", newCalendarId });
            }
        });
        const listener = (contentRequest) => {
            if (contentRequest.action === "deselectedAllEvents") {
                calendarId = contentRequest.calendarId;
                chrome.runtime.onMessage.removeListener(listener);
            }
        };
        chrome.runtime.onMessage.addListener(listener);
        return true;
    }

    if (request.action === "getEventsList") {
        const { timeMin, timeMax } = request;

        getAuthToken().then((token) => {
            const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
            fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        console.error("Error response from API:", error);
                        throw new Error(`HTTP error! status: ${response.status}, message: ${error.message}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                sendResponse({ events: data.items });
            })
            .catch(error => {
                console.error("Error fetching events:", error);
                sendResponse({ error: error.toString() });
            });

            return true;
        })
        .catch(error => {
            console.error("Error getting auth token:", error);
            sendResponse({ error: error.message });
        });

        return true;
    }

    if (request.action === "getEventDetails") {
        const eventId = request.eventId;

        getAuthToken().then((token) => {
            const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`;
            fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        console.error("Error response from API:", error);
                        throw new Error(`HTTP error! status: ${response.status}, message: ${error.message}`);
                    });
                }
                return response.json();
            })
            .then(event => {
                sendResponse({ event });
            })
            .catch(error => {
                console.error("Error fetching event details:", error);
                sendResponse({ error: error.toString() });
            });

            return true;
        })
        .catch(error => {
            console.error("Error getting auth token:", error);
            sendResponse({ error: error.message });
        });

        return true;
    }
    
    if (request.action === "updateEvent") {
        const { eventId, newStartTime, newEndTime } = request;

        getAuthToken().then((token) => {
            const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`;
            const eventPatch = {
                start: {
                    dateTime: newStartTime
                },
                end: {
                    dateTime: newEndTime
                }
            };

            fetch(url, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(eventPatch)
            })
            .then(response => response.json())
            .then(event => {
                sendResponse({ event });
            })
            .catch(error => {
                console.error("Error updating event:", error);
                sendResponse({ error: error.toString() });
            });

            return true;
        })
        .catch(error => {
            console.error("Error getting auth token:", error);
            sendResponse({ error: error.message });
        });

        return true;
    }

    if (request.action === "deleteEvent") {
        const eventId = request.eventId;

        getAuthToken().then((token) => {
            const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`;
            fetch(url, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        console.error("Error response from API:", error);
                        throw new Error(`HTTP error! status: ${response.status}, message: ${error.message}`);
                    });
                }
                sendResponse({ success: true });
            })
            .catch(error => {
                console.error("Error deleting event:", error);
                sendResponse({ error: error.toString() });
            });

            return true;
        })
        .catch(error => {
            console.error("Error getting auth token:", error);
            sendResponse({ error: error.message });
        });

        return true;
    }
});
