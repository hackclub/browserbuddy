chrome.storage.sync.get(
  ["font", "fontSize", "letterSpacing", "lineSpacing", "bgColor", "tts"],
  (data) => {
    if (data.font) {
      let fontFamily = "sans-serif"; // default fallback
      if (data.font === "OpenDyslexic") {
        fontFamily = "'OpenDyslexic', sans-serif";
      } else if (data.font === "Dyslexie") {
        fontFamily = "'Dyslexie', sans-serif";
      } else if (data.font === "Lexend") {
        fontFamily = "'Lexend', sans-serif";
      }
      document.body.style.fontFamily = fontFamily;
    }
    if (data.fontSize) {
      document.body.style.fontSize = data.fontSize + "px";
    }
    if (data.letterSpacing) {
      document.body.style.letterSpacing = data.letterSpacing + "em";
    }
    if (data.lineSpacing) {
      document.body.style.lineHeight = data.lineSpacing;
    }
    if (data.bgColor) {
      document.body.style.backgroundColor = data.bgColor;
    }
    if (data.tts && data.tts === true) {
      const utterance = new SpeechSynthesisUtterance(document.body.innerText);
      speechSynthesis.speak(utterance);
    }
  }
);
