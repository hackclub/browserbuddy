document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('save');
    const clearButton = document.getElementById('clear');
    const noteText = document.getElementById('note');
  
    // Load saved note from localStorage
    chrome.storage.local.get('note', (data) => {
      if (data.note) {
        noteText.value = data.note;
      }
    });
  
    // Save the note
    saveButton.addEventListener('click', () => {
      const noteContent = noteText.value;
      chrome.storage.local.set({ 'note': noteContent });
    });
  
    // Clear the note
    clearButton.addEventListener('click', () => {
      noteText.value = '';
      chrome.storage.local.remove('note');
    });
  });
  