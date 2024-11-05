document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length === 0) {
            console.error('No active tabs found.');
            return;
        }

        let tab = tabs[0];
        let websiteTitle = tab.title;
        let websiteURL = tab.url;

        const websiteTitleElement = document.getElementById('websiteTitle');
        const websiteURLElement = document.getElementById('websiteURL');

        if (websiteTitleElement) {
            websiteTitleElement.textContent = websiteTitle;
        }

        if (websiteURLElement) {
            websiteURLElement.textContent = websiteURL;
        }
    });

    function loadAllNotes(searchTerm = '') {
        chrome.storage.sync.get(['allNotes'], (result) => {
            const notes = result.allNotes || [];
            const allNotesListDiv = document.getElementById('allNotesList');
            if (allNotesListDiv) {
                allNotesListDiv.innerHTML = '';

                const filteredNotes = notes.filter(noteData =>
                    noteData.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    noteData.websiteTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    noteData.websiteURL.toLowerCase().includes(searchTerm.toLowerCase())
                );

                if (filteredNotes.length === 0) {
                    allNotesListDiv.innerHTML = '<p>No notes found.</p>';
                    return;
                }

                filteredNotes.reverse();

                filteredNotes.forEach((noteData, index) => {
                    const noteItem = document.createElement('div');
                    noteItem.className = 'noteItem';
                    noteItem.style.fontSize = noteData.textSize || '14px';

                    const noteIndex = index + 1;

                    noteItem.innerHTML = `
                        <strong>Note ${noteIndex}</strong>
                        <div><strong>Website Name:</strong> ${noteData.websiteTitle || 'Unknown'}</div>
                        <div><strong>Website URL:</strong> <a href="${noteData.websiteURL || '#'}" target="_blank">${noteData.websiteURL || 'No URL'}</a></div>
                        <div>${noteData.dateTime || 'No date available'}</div>
                        <div>${noteData.note || 'No content'}</div>
                        <button class="editButton" data-index="${index}">Edit</button>
                        <button class="removeButton" data-index="${index}">Remove</button>
                        <div class="editContainer" style="display: none;"></div>
                    `;

                    noteItem.querySelector('.removeButton').addEventListener('click', function () {
                        const confirmRemove = confirm('Are you sure you want to remove this note?');
                        if (confirmRemove) {
                            chrome.storage.sync.get(['allNotes'], (result) => {
                                const notes = result.allNotes || [];
                                notes.splice(index, 1);
                                chrome.storage.sync.set({ allNotes: notes }, () => {
                                    loadAllNotes(searchTerm);
                                });
                            });
                        }
                    });

                    noteItem.querySelector('.editButton').addEventListener('click', function () {
                        const editContainer = noteItem.querySelector('.editContainer');
                        editContainer.innerHTML = `
                            <textarea id="noteText${index}" rows="4" style="width: 100%;">${noteData.note}</textarea>
                            <button class="saveNote" data-index="${index}">Save</button>
                            <button class="cancelEdit">Cancel</button>
                        `;
                        editContainer.style.display = 'block';

                        editContainer.querySelector('.saveNote').addEventListener('click', function () {
                            const newNote = document.getElementById(`noteText${index}`).value;
                            const textSize = '14px';

                            chrome.storage.sync.get(['allNotes'], (result) => {
                                const notes = result.allNotes || [];
                                notes[index].note = newNote;
                                notes[index].textSize = textSize;
                                chrome.storage.sync.set({ allNotes: notes }, () => {
                                    loadAllNotes(searchTerm);
                                });
                            });
                        });

                        editContainer.querySelector('.cancelEdit').addEventListener('click', function () {
                            editContainer.style.display = 'none';
                        });
                    });

                    allNotesListDiv.appendChild(noteItem);
                });
            } else {
                console.error('Element with ID "allNotesList" not found.');
            }
        });
    }

    document.getElementById('saveNote').addEventListener('click', () => {
        const note = document.getElementById('noteText').value.trim();
        const websiteTitle = document.getElementById('websiteTitle').textContent;
        const websiteURL = document.getElementById('websiteURL').textContent;
        const dateTime = new Date().toLocaleString();

        const noteData = {
            websiteTitle,
            websiteURL,
            dateTime,
            note,
        };

        chrome.storage.sync.get(['allNotes'], (result) => {
            let notes = result.allNotes || [];
            notes.push(noteData);
            chrome.storage.sync.set({ allNotes: notes }, () => {
                loadAllNotes();
                document.getElementById('noteText').value = '';
            });
        });
    });

    document.getElementById('searchButton').addEventListener('click', () => {
        const searchTerm = document.getElementById('searchInput').value.trim();
        loadAllNotes(searchTerm);
    });

    document.getElementById('clearSearch').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        loadAllNotes();
    });

    loadAllNotes();
});
