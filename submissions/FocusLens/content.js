const addBlurEffect = () => {
  const thumbnails = document.querySelectorAll('img');
  
  thumbnails.forEach(thumbnail => {
    if (!thumbnail.dataset.blurApplied) {
      thumbnail.style.filter = "blur(5px)";
      thumbnail.style.transition = "filter 0.3s ease";
      
      thumbnail.addEventListener('mouseenter', () => {
        thumbnail.style.filter = "blur(0)";
      });
      
      thumbnail.addEventListener('mouseleave', () => {
        thumbnail.style.filter = "blur(5px)";
      });
      
      thumbnail.dataset.blurApplied = "true";
    }
  });
};

const startBlurProcess = () => {
  setTimeout(() => {
    addBlurEffect();
    
    const observer = new MutationObserver((mutations) => {
      setTimeout(addBlurEffect, 100);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }, 5000);  
};

startBlurProcess();

window.addEventListener('yt-navigate-finish', () => {
  startBlurProcess();
});