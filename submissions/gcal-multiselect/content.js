let calendarId = "";
let isExtensionActive = false;
let listenersAdded = false;
let selectedEvents = [];
let initialEventTimes = {};
let observer = null;


chrome.storage.sync.get("calendarId", (data) => {
    if (data.calendarId) {
        calendarId = data.calendarId;
    }
});


// Add event listeners if the extension is already active when the page loads
chrome.storage.sync.get("isExtensionActive", (data) => {
    if (data.isExtensionActive) {
        isExtensionActive = data.isExtensionActive;
        if (isExtensionActive) {
            addEventListeners();
            observeDOMChanges();
        }
    }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "isContentScriptRunning") {
        sendResponse({ running: true });
    }

    if (request.action === "setExistingCalendarId") {
        calendarId = request.calendarId;
    }

    if (request.action === "showAlert") {
        alert(request.message);
    }

    if (request.action === "updateCalendarId" || request.action === "deselectAllEvents") {
        const deselectPromises = selectedEvents.map(({ element }) => toggleSelection(element));
        Promise.all(deselectPromises).then(() => {
            calendarId = request.newCalendarId;
            chrome.runtime.sendMessage({ action: "deselectedAllEvents", calendarId });
        }).catch(error => {
            console.error("Error deselecting events:", error);
        });
    }

    if (request.action === "toggleExtensionState") {
        isExtensionActive = request.active;
        if (isExtensionActive) {
            if (!listenersAdded) {
                addEventListeners();
                observeDOMChanges();
            }
        } else {
            const deselectPromises = selectedEvents.map(({ element }) => toggleSelection(element));
            Promise.all(deselectPromises).then(() => {
                removeEventListeners();
                selectedEvents = [];
                initialEventTimes = {};
                if (observer) {
                    observer.disconnect();
                    observer = null;
                }
            }).catch(error => {
                console.error("Error deselecting events:", error);
            });
        }
    }
});


function addEventListeners() {
    if (!listenersAdded) {
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("keydown", handleKeyDown);
        listenersAdded = true;
    }
}


function removeEventListeners() {
    if (listenersAdded) {
        document.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("keydown", handleKeyDown);
        listenersAdded = false;
    }
}


function handleMouseDown(e) {
    if (!isExtensionActive) return;
    if (e.ctrlKey || e.metaKey) {
        const eventElement = e.target.closest("[role='button']");
        if (eventElement) {
            toggleSelection(eventElement);
        }
    } else if (e.shiftKey) {
        const eventElement = e.target.closest("[role='button']");
        if (eventElement) {
            toggleSelection(eventElement);

            const sortedInitialEventTimesArray = sortInitialEventTimes();
            if (sortedInitialEventTimesArray.length === 0) {
                return;
            }

            const latestSelectedEvent = sortedInitialEventTimesArray[sortedInitialEventTimesArray.length - 1];
            const latestSelectedEventStartTime = latestSelectedEvent[1].start.toISOString();

            const eventId = fetchEventId(eventElement);
            fetchEventDetails(eventId).then(event => {
                const eventElementStartTime = new Date(event.start.dateTime).toISOString();

                getEventsList(latestSelectedEventStartTime, eventElementStartTime).then(events => {
                    const elements = document.querySelectorAll("[jslog]");

                    events.forEach(event => {                            
                        let eventElement = null;
                        for (const element of elements) {
                            const jslog = element.getAttribute("jslog");
                            if (jslog && jslog.includes(event.id)) {
                                eventElement = element;
                            }
                        }
                        if (eventElement) {
                            const alreadySelected = selectedEvents.some(selectedEvent => selectedEvent.id === event.id);
                            if (!alreadySelected) {
                                toggleSelection(eventElement);
                            }
                        }
                    });
                }).catch(error => {
                    console.error("Error fetching events list:", error);
                });
            }).catch(error => {
                console.error("Error fetching event details:", error);
            });
        }
    }
}


function sortInitialEventTimes() {
    const initialEventTimesArray = Object.entries(initialEventTimes);
    const sortedArray = initialEventTimesArray.sort((a, b) => {
        const startTimeA = a[1].start.getTime();
        const startTimeB = b[1].start.getTime();
        return startTimeA - startTimeB;
    });
    return sortedArray;
}


function getEventsList(timeMin, timeMax) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "getEventsList", timeMin, timeMax }, (response) => {
            if (response.error) {
                console.error("Error fetching events list:", response.error);
                reject(response.error);
            } else {
                resolve(response.events);
            }
        });
    });
}


function handleKeyDown(e) {
    if (!isExtensionActive || selectedEvents.length === 0) return;
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        let differenceCount = 0;
        let differences = [];

        const fetchPromises = [];

        selectedEvents.forEach(({ id }) => {
            const fetchPromise = fetchEventDetails(id)
            .then(event => {
                const initialStartTime = initialEventTimes[id].start;
                const currentStartTime = new Date(event.start.dateTime);
                if (currentStartTime.getTime() !== initialStartTime.getTime()) {
                    differenceCount++;
                    const timeDifference = currentStartTime.getTime() - initialStartTime.getTime();
                    differences.push({ id: id, timeDifference: timeDifference });
                }
            })
            .catch(error => {
                console.error("Error fetching event details:", error);
            });

            fetchPromises.push(fetchPromise);
        });

        Promise.all(fetchPromises).then(() => {
            if (differenceCount === 0) {
                console.log("No events have been moved. Ignoring key press.");
                return;
            } else if (differenceCount === 1) {
                const timeDifference = differences[0].timeDifference;
                selectedEvents.forEach(({ id }) => {
                    if (id !== differences[0].id && initialEventTimes[id]) {
                        const initialEventTime = initialEventTimes[id];
                        if (!initialEventTime) return;
        
                        const newStartTime = new Date(initialEventTime.start.getTime() + timeDifference);
                        const newEndTime = new Date(initialEventTime.end.getTime() + timeDifference);
        
                        updateEvent(id, newStartTime, newEndTime);
                    } else if (id === differences[0].id && initialEventTimes[id]) {
                        toggleSelection(selectedEvents.find(event => event.id === id).element);
                    }
                });
                alert("Events have been moved successfully. Please wait a moment or refresh the page to see the changes reflected in the calendar.");
            } else if (differenceCount > 1) {
                differences.forEach(({ id }) => {
                    const index = differences.findIndex(difference => difference.id === id);
                    const initialEventTime = initialEventTimes[id];
                    const newStartTime = new Date(initialEventTime.start.getTime() + differences[index].timeDifference);
                    const newEndTime = new Date(initialEventTime.end.getTime() + differences[index].timeDifference);

                    updateEvent(id, newStartTime, newEndTime);
                });
                console.log("Multiple events have been moved. Ignoring key press.");
                alert("Multiple events have been moved. Please move only one event at a time.");
                return;
            }
        });
    } else if (e.key === "Delete") {
        selectedEvents.forEach(({ id }) => {
            deleteEvent(id);
        });
        alert("Events have been deleted successfully. Please wait a moment or refresh the page to see the changes reflected in the calendar.");
    }
}


function fetchEventId(element) {
    /* Note: This is how to get the event ID from the element! 
    Not the data-eventid attribute, which I was misled by :( 
    The data-eventid attribute is not the event ID, it's from the event's htmlLink */

    let jslog = element.getAttribute("jslog");
    if (!jslog) {
        console.log("No jslog found on the element. Likely a wrong element selected.");
        return 1;
    }

    let match1 = jslog.match(/1:\["([^"]*)"/);
    let selectedEventCalendarId = match1 ? match1[1] : null;
    if (!selectedEventCalendarId) {
        console.error("No calendar ID found on the element.");
        return 1;
    }
    if (selectedEventCalendarId !== calendarId) {
        console.log("Selected event does not belong to the correct calendar.");
        return 1;
    }

    let match2 = jslog.match(/2:\["([^"]*)"/);
    let eventId = match2 ? match2[1] : null;
    if (!eventId) {
        console.error("No event ID found on the element.");
        return 1;
    }

    return eventId;
}


function fetchEventDetails(eventId) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "getEventDetails", eventId }, (response) => {
            if (response.error) {
                console.error("Error fetching event details:", response.error);
                reject(response.error);
            } else {
                resolve(response.event);
            }
        });
    });
}


function toggleSelection(element) {
    return new Promise((resolve, reject) => {
        let eventId = fetchEventId(element);
        if (eventId === 1) {
            resolve();
            return;
        };
        
        fetchEventDetails(eventId).then(event => {
            if (!event.start.dateTime) {
                console.log("All-day event detected. Ignoring selection.");
                resolve();
                return;
            }
    
            const index = selectedEvents.findIndex(event => event.id === eventId);
            if (index === -1) {
                selectedEvents.push({ id: eventId, element });
                element.style.border = "2px solid black";
                
                initialEventTimes[eventId] = {
                    start: new Date(event.start.dateTime),
                    end: new Date(event.end.dateTime),
                };
    
            } else {
                selectedEvents.splice(index, 1);
                element.style.border = "";
                delete initialEventTimes[eventId];
            }

            resolve();    
        }).catch(error => {
            console.error("Error fetching event details:", error);
            reject(error);
        });
    });
}


function updateEvent(eventId, newStartTime, newEndTime) {
    chrome.runtime.sendMessage({
        action: "updateEvent",
        eventId, 
        newStartTime: newStartTime.toISOString(), 
        newEndTime: newEndTime.toISOString()
    }, (response) => {
        if (response.error) {
            console.error("Error updating event:", response.error);
        }
    });
    toggleSelection(selectedEvents.find(event => event.id === eventId).element);
}


function deleteEvent(eventId) {
    chrome.runtime.sendMessage({ action: "deleteEvent", eventId }, (response) => {
        if (response.error) {
            console.error("Error deleting event:", response.error);
        }
    });
    const index = selectedEvents.findIndex(event => event.id === eventId);
    selectedEvents.splice(index, 1);
    delete initialEventTimes[eventId];
}


function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList" || mutation.type === "attributes") {
                // Reapply border style to all selected events when GCal rerenders the events after you click them
                selectedEvents.forEach(({ element }) => {
                    element.style.border = "2px solid black";
                });
            }
        });
    });

    observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true
    });
}
