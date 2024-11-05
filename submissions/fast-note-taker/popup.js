document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        let tab = tabs[0];
        let websiteTitle = tab.title;
        let websiteURL = tab.url;

        document.getElementById('websiteTitle').textContent = websiteTitle; 

        function updateDateTime() {
            let now = new Date();
            document.getElementById('dateTime').textContent = now.toLocaleString();
        }

        updateDateTime();
        setInterval(updateDateTime, 1000);

        let currentEditingNote = null; 

        function loadAllNotes() {
            chrome.storage.sync.get(['allNotes'], (result) => {
                let notes = result.allNotes || [];
                const noteListDiv = document.getElementById('noteList');
                noteListDiv.innerHTML = '';

                if (notes.length === 0) {
                    noteListDiv.innerHTML = '<p>No notes found.</p>';
                    return;
                }

                notes.reverse().forEach((noteData) => {
                    const noteItem = document.createElement('div');
                    noteItem.className = 'noteItem';

                    const noteText = document.createElement('span');
                    const truncatedWebsiteName = noteData.websiteTitle.length > 35 ? noteData.websiteTitle.substring(0, 35) + '...' : noteData.websiteTitle;
                    const truncatedURL = noteData.websiteURL.length > 30 ? noteData.websiteURL.substring(0, 30) + '...' : noteData.websiteURL;
                    const fullNote = noteData.note.length > 75 ? noteData.note.substring(0, 75) + '...' : noteData.note;
                    const formattedNote = fullNote.match(/.{1,20}/g)?.join('<br>') || fullNote;

                    noteText.innerHTML = `
                        <small>${noteData.dateTime}</small> <br>
                        <strong>${truncatedWebsiteName}</strong> <br>
                        <a href="${noteData.websiteURL}" target="_blank" style="color: #007BFF; text-decoration: underline;">${truncatedURL}</a> <br>
                        <p style="margin: 0;">${formattedNote}</p>`;

                    noteText.addEventListener('click', () => {
                        currentEditingNote = noteData;
                        document.getElementById('note').value = noteData.note;
                    });

                    const removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
                    removeButton.addEventListener('click', () => {
                        notes = notes.filter(n => n !== noteData);
                        chrome.storage.sync.set({ allNotes: notes }, () => {
                            loadAllNotes();
                        });
                    });

                    noteItem.appendChild(noteText);
                    noteItem.appendChild(removeButton);
                    noteListDiv.appendChild(noteItem);
                });
            });
        }

        loadAllNotes();

        document.getElementById('saveNote').addEventListener('click', () => {
            let note = document.getElementById('note').value.trim();
            let dateTime = document.getElementById('dateTime').textContent;

            if (note === '') {
                alert('Note cannot be empty.');
                return;
            }

            let noteData = {
                websiteTitle,
                websiteURL,
                dateTime,
                note,
            };

            chrome.storage.sync.get(['allNotes'], (result) => {
                let notes = result.allNotes || [];
                
                if (currentEditingNote) {
                    notes = notes.map(n => 
                        (n.websiteTitle === currentEditingNote.websiteTitle && n.dateTime === currentEditingNote.dateTime ? noteData : n)
                    );
                    currentEditingNote = null; 
                } else {
                    notes.push(noteData);
                }

                chrome.storage.sync.set({ allNotes: notes }, () => {
                    loadAllNotes();
                    document.getElementById('note').value = ''; 
                });
            });
        });

        document.getElementById('openDashboard').addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
        });

        document.getElementById('clearNote').addEventListener('click', function () {
            document.getElementById('note').value = '';
            currentEditingNote = null; 
        });
    });
});
