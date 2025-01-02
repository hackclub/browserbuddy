chrome.runtime.onInstalled.addListener(() => {
    console.log('NoteTaker extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SAVE_NOTE') {
        saveNote(message.note);
        sendResponse({ status: 'success' });
    }
});

function saveNote(note) {
    chrome.storage.local.get({ notes: [] }, (result) => {
        const notes = result.notes;
        notes.push(note);
        chrome.storage.local.set({ notes: notes }, () => {
            console.log('Note saved');
        });
    });
}