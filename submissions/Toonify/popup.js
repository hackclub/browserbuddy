const inputText = document.getElementById('inputText');
const saveButton = document.getElementById('saveButton');
const outputText = document.getElementById('outputText');
const applyStylesButton = document.getElementById('applyStyles');
const mainColorInput = document.getElementById('mainColor');
const soundEffectsCheckbox = document.getElementById('enableSoundEffects');
const speechBubblesCheckbox = document.getElementById('enableSpeechBubbles');
const turtleCheckbox = document.getElementById('enableTurtle');
const pongCheckbox = document.getElementById('enablePong');
const presetColors = document.getElementById('presetColors');
const invertCheckbox = document.getElementById('enableinvert');
const pigRoasterCheckbox = document.getElementById('enablePigRoaster');
const nerdSummarizerCheckbox = document.getElementById('enableNerdSummarizer');
const rgbCheckbox = document.getElementById('enableRGB');
var i = 0;


chrome.storage.sync.get(['savedText'], function (result) {
    if (result.savedText) {
        outputText.textContent = `Saved: ${result.savedText}`;
    }
});


chrome.storage.sync.get(['cartoonifyPrefs'], function (result) {
    if (result.cartoonifyPrefs) {
        const prefs = result.cartoonifyPrefs;
        mainColorInput.value = prefs.mainColor || '#ef5350';
        soundEffectsCheckbox.checked = prefs.enableSoundEffects !== false;
        speechBubblesCheckbox.checked = prefs.enableSpeechBubbles !== false;
        turtleCheckbox.checked = prefs.enableTurtle !== false;
        pongCheckbox.checked = prefs.enablePong !== false;
        invertCheckbox.checked = prefs.enableinvert !== false;
        pigRoasterCheckbox.checked = prefs.enablePigRoaster !== false;
        nerdSummarizerCheckbox.checked = prefs.enableNerdSummarizer !== false;
        rgbCheckbox.checked = prefs.enableRGB !== false;
        
        updateColorPreview(mainColorInput.value);
    }
});




function updateColorPreview(color) {
    document.documentElement.style.setProperty('--preview-color', color);
}


function savePreferences() {
    const prefs = {
        mainColor: mainColorInput.value,
        enableSoundEffects: soundEffectsCheckbox.checked,
        enableSpeechBubbles: speechBubblesCheckbox.checked,
        enableTurtle: turtleCheckbox.checked,
        enablePong: pongCheckbox.checked,
        enableinvert: invertCheckbox.checked,
        enablePigRoaster: pigRoasterCheckbox.checked,
        enableNerdSummarizer: nerdSummarizerCheckbox.checked,
        enableRGB: rgbCheckbox.checked,
    };
    
    chrome.storage.sync.set({ cartoonifyPrefs: prefs });
    updateColorPreview(prefs.mainColor);
}


const colorPresets = ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc', '#26c6da'];
colorPresets.forEach(color => {
    const colorButton = document.createElement('button');
    colorButton.className = 'color-preset';
    colorButton.style.backgroundColor = color;
    colorButton.title = color;
    colorButton.addEventListener('click', () => {
        mainColorInput.value = color;
        updateColorPreview(color);
        savePreferences();
    });
    presetColors.appendChild(colorButton);
});

mainColorInput.addEventListener('change', savePreferences);
soundEffectsCheckbox.addEventListener('change', savePreferences);
speechBubblesCheckbox.addEventListener('change', savePreferences);
turtleCheckbox.addEventListener('change', savePreferences);
pongCheckbox.addEventListener('change', savePreferences);
invertCheckbox.addEventListener('change', savePreferences);
pigRoasterCheckbox.addEventListener('change', savePreferences);
nerdSummarizerCheckbox.addEventListener('change', savePreferences);
rgbCheckbox.addEventListener('change', savePreferences)

updateColorPreview(mainColorInput.value);


applyStylesButton.addEventListener('click', () => {
    i++;
    if (i%2==1){
        applyStylesButton.innerHTML = "UNTOGGLE COMIC MODE"
    }
    else{
        applyStylesButton.innerHTML = "TOGGLE COMIC MODE"
    }
    const prefs = {
        mainColor: mainColorInput.value,
        enableSoundEffects: soundEffectsCheckbox.checked,
        enableSpeechBubbles: speechBubblesCheckbox.checked,
        enableTurtle: turtleCheckbox.checked,
        enablePong: pongCheckbox.checked,
        enableinvert: invertCheckbox.checked,
        enablePigRoaster: pigRoasterCheckbox.checked,
        enableNerdSummarizer: nerdSummarizerCheckbox.checked,
        enableRGB: rgbCheckbox.checked,
    };
    chrome.storage.sync.set({ userPrefs: prefs }, () => {
        console.log("Preferences saved.");
    });

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "applyStyles",
            prefs: prefs
        }, function(response) {
            if (chrome.runtime.lastError) {
                console.error("Connection error:", chrome.runtime.lastError.message);
                outputText.textContent = "Error: Please refresh the page and try again";
                return;
            }
            
            if (response && response.status) {
                outputText.textContent = response.status;
                
                document.body.classList.add('activated');
                setTimeout(() => {
                    document.body.classList.remove('activated');
                }, 500);
            }
        });
    });
});
