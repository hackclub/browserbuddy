let activeAudio = {}; 

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "playSoundOffscreen") {  
        let soundPath = `sounds/${message.sound}.mp3`;
        let audio = new Audio(chrome.runtime.getURL(soundPath));

        audio.volume = message.volume !== undefined ? message.volume : 0.5; 

        if (activeAudio[message.sound]) {
            activeAudio[message.sound].pause();
            activeAudio[message.sound].currentTime = 0;
        }
        activeAudio[message.sound] = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                document.addEventListener("click", () => audio.play(), { once: true });
                document.addEventListener("keydown", () => audio.play(), { once: true });
            });
        }
    }
});
