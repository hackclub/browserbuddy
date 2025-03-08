document.addEventListener('DOMContentLoaded', () => {

    //reload button
    const reloadButton = document.getElementById('reload-button');
    if(reloadButton){
        reloadButton.addEventListener('click', refreshPage);
    }

    //default words button
    const addDefaultWordsButton = document.getElementById('default-words');
    if(addDefaultWordsButton){
        addDefaultWordsButton.addEventListener('click', addDefaultWords)
    }

    //flashcards
    const vocabDisplay = document.getElementById('vocab-display');
    chrome.storage.sync.get('vocabWords', (data) => {
        const vocabWords = data.vocabWords || [];

        if (vocabWords.length === 0) {
            vocabDisplay.innerHTML = "<p>No words added yet!</p>";
        } else {
            const randomWord = vocabWords[Math.floor(Math.random() * vocabWords.length)];
            //dictionary api
            const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const wordData = data[0]; 
                    console.log(`Word: ${wordData.word}`);
                    wordData.meanings.forEach(meaning => {
                        console.log(`Part of Speech: ${meaning.partOfSpeech}`);
                        meaning.definitions.forEach(def => {
                            console.log(`Definition: ${def.definition}`);
                            console.log(`Example: ${def.example}`);
                        });
                    });

                    vocabDisplay.innerHTML = `
                        <h1>word: ${randomWord}</h1>
                        <ul>
                            ${wordData.meanings.map(meaning => `
                                <li><h2>${meaning.partOfSpeech}</h2> ${meaning.definitions.map(def => `
                                    <p>Definition: ${def.definition}</p>
                                    ${def.example ? `<p>Example: ${def.example}</p>` : ''}
                                `).join('')}
                                </li>
                            `).join('')}
                        </ul>
                    `;
                })
                .catch(error => console.error('Error fetching data:', error));
        }
    });
});

//reload function
function refreshPage(){
    location.reload();
}

//add my list
function addDefaultWords(){
    const defaultWords = ['advocate', 'underscore', 'undermine', 'anecdote', 'corroborate', 'substantiate', 'concede', 'skeptical', 'reconcile', 'infer', 'innovative', 'diverge', 'contend', 'refute', 'inevitable', 'shortcoming', 'counterargument', 'foreshadow', 'phenomenon', 'obsolete', 'indifferent', 'ambivalent', 'apprehensive', 'dismay', 'evoke', 'conventional', 'undertake', 'cultivate', 'ironic', 'hypothetical', 'speculate', 'conjecture', 'superficial', 'allude', 'implication', 'condemn', 'denounce', 'rebuke', 'reproach', 'empathy', 'extol', 'revere', 'impede', 'inhibit', 'hinder', 'hamper', 'deter', 'thwart', 'forestall', 'bolster', 'endorse', 'espouse', 'proponent', 'enhance', 'supplement', 'earnest', 'pragmatic', 'indignation', 'resentment', 'disdian', 'contempt', 'scorn', 'cynical', 'reluctant', 'misgivings', 'resignation', 'pessimistic', 'optimistic', 'objective', 'subjective', 'tentative', 'ambiguous', 'unequivocal', 'empathetic', 'divert', 'digress', 'detract', 'innate', 'inherent', 'intrinsic', 'compromise', 'qualify', 'temper', 'moderate', 'mitigate', 'relent', 'supplant', 'extraneous', 'implicit', 'empirical', 'unfounded', 'repudiate', 'debunk', 'assert', 'elaborate', 'reiterate', 'replicate', 'simulate', 'cognitive', 'subsequently', 'corrupt', 'objectionable', 'yield', 'prompt', 'spur', 'groundbreaking', 'safeguard', 'prevalent', 'pervasive', 'prolific', 'proliferate', 'disseminate', 'burgeon', 'facilitate', 'noxious', 'detrimental', 'satirical', 'wry', 'paradox', 'exemplary', 'exemplify', 'anomaly', 'oddity', 'disparity', 'egregious', 'erratic', 'volatile', 'futile', 'diligent', 'scrupulous', 'scrutinize', 'understate', 'dramatize', 'melodramatic', 'ornate', 'lavish', 'frugal', 'exploit', 'exert', 'viable', 'appreciable', 'auspicious', 'ominous', 'complacent', 'naive', 'susceptible', 'adept', 'resilient', 'tangential', 'dissent', 'conversely', 'adversary', 'brevity', 'curtail', 'eradicate', 'lament', 'eloquent', 'spontaneous', 'arduous', 'contemporary', 'subtle', 'unprecedented', 'arbitrary', 'conviction', 'deference', 'juxtapose', 'sovereignty'];

    chrome.storage.sync.get('vocabWords', (data) => {
        const vocabWords = data.vocabWords || [];
        const newWords = [...new Set([...vocabWords, ...defaultWords])];

        chrome.storage.sync.set({ vocabWords: newWords }, () => {
            console.log("Default words added.");
        });
    });
}