const inputText = document.getElementById('inputText');
const saveButton = document.getElementById('saveButton');
const outputText = document.getElementById('outputText');
const applyStylesButton = document.getElementById('applyStyles');
const mainColorInput = document.getElementById('mainColor');
const presetColors = document.getElementById('presetColors');
const effectButtons = document.querySelectorAll('.effect-btn');
var i = 0;

// Object to track effect states
const effectStates = {
    enableSoundEffects: true,
    enableSpeechBubbles: true,
    enableTurtle: true,
    enablePong: true,
    enableinvert: true,
    enablePigRoaster: true,
    enableNerdSummarizer: true,
    enableRGB: true
};


chrome.storage.sync.get(['savedText'], function (result) {
    if (result.savedText) {
        outputText.textContent = `Saved: ${result.savedText}`;
    }
});


chrome.storage.sync.get(['cartoonifyPrefs'], function (result) {
    if (result.cartoonifyPrefs) {
        const prefs = result.cartoonifyPrefs;
        mainColorInput.value = prefs.mainColor || '#ef5350';
        
        // Update effect states and button appearances
        Object.keys(effectStates).forEach(effectKey => {
            effectStates[effectKey] = prefs[effectKey] !== false;
            const button = document.querySelector(`[data-effect="${effectKey}"]`);
            if (button) {
                if (effectStates[effectKey]) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            }
        });
        
        updateColorPreview(mainColorInput.value);
    }
});




function updateColorPreview(color) {
    document.documentElement.style.setProperty('--preview-color', color);
}


function savePreferences() {
    const prefs = {
        mainColor: mainColorInput.value,
        ...effectStates
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

// Add event listeners for effect buttons
effectButtons.forEach(button => {
    button.addEventListener('click', () => {
        const effect = button.getAttribute('data-effect');
        effectStates[effect] = !effectStates[effect];
        
        if (effectStates[effect]) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
        
        savePreferences();
    });
});

mainColorInput.addEventListener('change', savePreferences);

updateColorPreview(mainColorInput.value);


applyStylesButton.addEventListener('click', () => {
    i++;
    if (i%2==1){
        applyStylesButton.innerHTML = "🛑 UNTOGGLE COMIC MODE 🛑"
    }
    else{
        applyStylesButton.innerHTML = "🚀 TOGGLE COMIC MODE 🚀"
    }
    const prefs = {
        mainColor: mainColorInput.value,
        ...effectStates
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
                outputText.textContent = "❌ Error: Please refresh the page and try again";
                return;
            }
            
            if (response && response.status) {
                outputText.textContent = "🎉 " + response.status + " 🎉";
                
                document.body.classList.add('activated');
                setTimeout(() => {
                    document.body.classList.remove('activated');
                }, 500);
            }
        });
    });
});
