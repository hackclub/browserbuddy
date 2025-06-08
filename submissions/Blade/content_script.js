const removeBlockups = () => {
	const elements = document.querySelectorAll("div, section, aside, span");
	elements.forEach(el => {
	  const style = window.getComputedStyle(el);
	  if ((style.position === "fixed" || style.position === "sticky") &&
		  parseInt(style.zIndex) > 100 &&
		  el.clientHeight < window.innerHeight * 0.9) {
		el.parentNode.removeChild(el);
	  }
	});
  };
  
  const enableScrolling = () => {
	document.body.style.overflow = "auto";
	document.documentElement.style.overflow = "auto";
  };
  
  window.requestAnimationFrame(() => {
	setTimeout(() => {
	  removeBlockups();
	  enableScrolling();
	}, 0);
  });