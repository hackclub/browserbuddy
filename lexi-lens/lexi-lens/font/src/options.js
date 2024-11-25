document.getElementById("save").addEventListener("click", () => {
  const tts = document.getElementById("tts").checked;

  chrome.storage.sync.set(
    {
      tts,
    },
    () => {
      console.log("Options saved");
    }
  );
});
