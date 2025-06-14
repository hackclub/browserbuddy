

document.addEventListener('DOMContentLoaded', function () {
   
    loadAllNotes();

    
    document.getElementById('exportButton').addEventListener('click', () => {
        chrome.storage.sync.get(['allNotes'], (result) => {
            const notes = result.allNotes || [];
            const dataStr = JSON.stringify(notes, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'notes.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });

    
    document.getElementById('importButton').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });

    
    document.getElementById('importFile').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedNotes = JSON.parse(e.target.result);
                    importNotes(importedNotes);
                } catch (error) {
                    alert('Failed to import notes: Invalid JSON format');
                }
            };
            reader.readAsText(file);
        }
    });

    function importNotes(notes) {
        
        if (!Array.isArray(notes)) {
            alert('Invalid notes format. Please ensure it is an array of notes.');
            return;
        }

        chrome.storage.sync.get(['allNotes'], (result) => {
            const existingNotes = result.allNotes || [];
            const newNotes = existingNotes.concat(notes);
            chrome.storage.sync.set({ allNotes: newNotes }, () => {
                loadAllNotes();
                alert('Notes imported successfully!');
            });
        });
    }

    function loadAllNotes(searchTerm = '') {
        chrome.storage.sync.get(['allNotes'], (result) => {
            const notes = result.allNotes || [];
            const allNotesListDiv = document.getElementById('allNotesList');
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
                noteItem.innerHTML = `
                    <strong>Note ${index + 1}</strong>
                    <div><strong>Website Name:</strong> ${noteData.websiteTitle || 'Unknown'}</div>
                    <div><strong>Website URL:</strong> <a href="${noteData.websiteURL || '#'}" target="_blank">${noteData.websiteURL || 'No URL'}</a></div>
                    <div>${noteData.dateTime || 'No date available'}</div>
                    <div>${noteData.note || 'No content'}</div>
                    <button class="editButton" data-index="${index}">Edit</button>
                    <button class="removeButton" data-index="${index}">Remove</button>
                    <div class="editContainer" style="display: none;"></div>
                `;
                allNotesListDiv.appendChild(noteItem);

                // Event listeners for editing and removing notes
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
                        chrome.storage.sync.get(['allNotes'], (result) => {
                            const notes = result.allNotes || [];
                            notes[index].note = newNote;
                            chrome.storage.sync.set({ allNotes: notes }, () => {
                                loadAllNotes(searchTerm);
                            });
                        });
                    });

                    editContainer.querySelector('.cancelEdit').addEventListener('click', function () {
                        editContainer.style.display = 'none';
                    });
                });
            });
        });
    }

    document.getElementById('saveNote').addEventListener('click', () => {
        const note = document.getElementById('noteText').value.trim();
        const websiteTitle = document.getElementById('websiteTitle').textContent;
        const websiteURL = document.getElementById('websiteURL').textContent;
        const dateTime = new Date().toLocaleString();

        if (note) {
            chrome.storage.sync.get(['allNotes'], (result) => {
                const notes = result.allNotes || [];
                notes.push({ note, websiteTitle, websiteURL, dateTime });
                chrome.storage.sync.set({ allNotes: notes }, () => {
                    loadAllNotes();
                    document.getElementById('noteText').value = '';
                });
            });
        } else {
            alert('Please enter a note before saving.');
        }
    });

    document.getElementById('searchButton').addEventListener('click', () => {
        const searchTerm = document.getElementById('searchInput').value;
        loadAllNotes(searchTerm);
    });

    document.getElementById('clearSearch').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        loadAllNotes();
    });
});
