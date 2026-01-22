(function () {
  const modal = document.createElement("div");
  modal.id = "unblur-modal";
  Object.assign(modal.style, {
    position: "absolute",
    display: "none",
    zIndex: "10000",
    padding: "15px",
    background: "rgba(255, 255, 255, 0.95)", // Soft glass effect
    boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    transition: "opacity 0.3s ease, transform 0.3s ease",
    transform: "scale(0.9)",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  });
  document.body.appendChild(modal);

  function getImageSource(target) {
    // Standard sites (Google Images, etc.)
    let child = target.querySelector("div.RY3tic[data-latest-bg]");
    if (child) return child.getAttribute("data-latest-bg");

    // Facebook images (supports newer DOM structure)
    let fbImg = target.querySelector("img[src]");
    if (fbImg) return fbImg.src;

    return null;
  }

  function showModal(target) {
    modal.innerHTML = "";
    const imgSrc = getImageSource(target);

    if (imgSrc) {
      const img = document.createElement("img");
      img.src = imgSrc;

      Object.assign(img.style, {
        filter: "none",
        width: "100%",
        height: "100%",
        borderRadius: "8px",
        display: "block",
        objectFit: "cover", // Ensures image fills the modal
        maxWidth: "100%",
        maxHeight: "100%",
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
      });

      modal.appendChild(img);

      // Get target image size
      const rect = target.getBoundingClientRect();
      const imgWidth = rect.width;
      const imgHeight = rect.height;

      // Set modal size relative to the image
      const modalWidth = Math.min(imgWidth * 1.2, 600); // Scale but cap at 600px
      const modalHeight = Math.min(imgHeight * 1.2, 500); // Scale but cap at 500px

      const offset = 20;
      let left = rect.left + window.scrollX + rect.width / 2 - modalWidth / 2;
      let top = rect.top + window.scrollY + rect.height + offset;

      // If not enough space below, move above
      if (top + modalHeight > window.innerHeight + window.scrollY) {
        top = rect.top + window.scrollY - modalHeight - offset;
      }

      // Ensure modal stays within viewport
      if (left + modalWidth > window.innerWidth) {
        left = window.innerWidth - modalWidth - 10;
      }
      if (left < 10) {
        left = 10;
      }

      // Apply position & size
      modal.style.width = `${modalWidth}px`;
      modal.style.height = `${modalHeight}px`;
      modal.style.left = `${left}px`;
      modal.style.top = `${top}px`;
      modal.style.display = "flex";
      modal.style.opacity = "1";
      modal.style.transform = "scale(1)";
    }
  }

  function hideModal() {
    modal.style.opacity = "0";
    modal.style.transform = "scale(0.9)";
    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
  }

  function addGalleryListeners() {
    const galleryItems = document.querySelectorAll("div.rtIMgb, div.x1i10hfl"); // Google & Facebook images
    galleryItems.forEach((item) => {
      if (!item.dataset.hoverListenerAdded) {
        item.addEventListener("mouseenter", () => showModal(item));
        item.addEventListener("mouseleave", hideModal);
        item.dataset.hoverListenerAdded = "true";
      }
    });
  }

  addGalleryListeners();

  const observer = new MutationObserver(addGalleryListeners);
  observer.observe(document.body, { childList: true, subtree: true });
})();
