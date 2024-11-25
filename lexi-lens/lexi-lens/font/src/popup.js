document.getElementById("apply").addEventListener("click", () => {
  const font = document.getElementById("font").value;
  const fontSize = document.getElementById("fontsize").value;
  const letterSpacing = document.getElementById("letterspacing").value;
  const lineSpacing = document.getElementById("linespacing").value;
  const bgColor = document.getElementById("bgcolor").value;

  chrome.storage.sync.set(
    {
      font,
      fontSize,
      letterSpacing,
      lineSpacing,
      bgColor,
    },
    () => {
      console.log("Settings saved");
    }
  );
});
