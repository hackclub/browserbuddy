function applyYellowFilter(strength) {
    const yellowOverlay = document.getElementById("yellow-tone-filter");
    const filterValue = `sepia(${strength}%)`;
  
    if (yellowOverlay) {
      yellowOverlay.style.backdropFilter = filterValue;
    } else {
      const overlay = document.createElement("div");
      overlay.id = "yellow-tone-filter";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "999999";
      overlay.style.backdropFilter = filterValue;
      overlay.style.mixBlendMode = "multiply";
      document.body.appendChild(overlay);
    }
  }

  chrome.storage.sync.get("strength", ({ strength = 0 }) => {
    applyYellowFilter(strength);
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.strength) {
      applyYellowFilter(changes.strength.newValue);
    }
  });
