document.addEventListener('DOMContentLoaded', () => {
    const vocabForm = document.getElementById('vocab-form');
    const vocabInput = document.getElementById('vocab-input');
    const vocabList = document.getElementById('vocab-list');

    if (!vocabForm || !vocabInput || !vocabList) {
        console.error("One or more elements are missing in the HTML.");
        return;
    }

    const loadVocab = () => {
        chrome.storage.sync.get('vocabWords', (data) => {
            const vocabWords = data.vocabWords || [];
            // vocabList.innerHTML='';
            vocabWords.forEach(addWordToList);
        });
    };

    const saveVocab = (vocabWords) => {
        chrome.storage.sync.set({ vocabWords });
    };

    const addWordToList = (wordText) => {
        const li = document.createElement('li');
        li.className = 'vocab-item';
        li.textContent = wordText;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remove';
        deleteButton.addEventListener('click', () => {
            li.remove();
            const vocabWords = [...document.querySelectorAll('.vocab-item')]
                .map(item => item.textContent.replace('Remove', '').trim());
            saveVocab(vocabWords);
        });

        li.appendChild(deleteButton);
        vocabList.appendChild(li);
    };

    vocabForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const wordText = vocabInput.value.trim();
        if (wordText) {
            addWordToList(wordText);
            const vocabWords = [...document.querySelectorAll('.vocab-item')]
                .map(item => item.textContent.replace('Remove', '').trim());
            saveVocab(vocabWords);
            vocabInput.value = '';
        }
    });

    loadVocab();

});
