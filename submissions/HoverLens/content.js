// Add hover magnification and overlay functionality
document.addEventListener("mouseover", (e) => {
  const target = e.target;

  // Check if the target is an image or text element
  if (target.tagName === "IMG" || target.tagName === "P" || target.tagName === "SPAN" || target.tagName === "DIV") {
    // Apply magnification effect
    target.style.transition = "transform 0.2s ease";
    target.style.transform = "scale(1.5)";
    target.style.zIndex = "9999";
    target.style.position = "relative";

    // Create and show overlay
    const overlay = document.createElement("div");
    overlay.className = "hover-overlay";
    overlay.innerText = `Hovering over: ${target.tagName}`;
    overlay.style.position = "absolute";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    overlay.style.color = "#fff";
    overlay.style.padding = "8px";
    overlay.style.borderRadius = "4px";
    overlay.style.top = `${e.pageY + 10}px`;
    overlay.style.left = `${e.pageX + 10}px`;
    overlay.style.pointerEvents = "none";
    document.body.appendChild(overlay);

    // Remove magnification and overlay on mouseout
    target.addEventListener(
      "mouseout",
      () => {
        target.style.transform = "none";
        document.body.removeChild(overlay);
      },
      { once: true }
    );
  }
});
