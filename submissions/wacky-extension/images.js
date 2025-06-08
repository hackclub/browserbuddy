function createWackyFilters() {
    if (!document.getElementById('wacky-filters-svg')) {
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('id', 'wacky-filters-svg');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      
      const pixelFilter = document.createElementNS(svgNS, 'filter');
      pixelFilter.setAttribute('id', 'pixel-filter');
      
      const feGaussianBlur = document.createElementNS(svgNS, 'feGaussianBlur');
      feGaussianBlur.setAttribute('stdDeviation', '2');
      pixelFilter.appendChild(feGaussianBlur);
      
      const feColorMatrix = document.createElementNS(svgNS, 'feColorMatrix');
      feColorMatrix.setAttribute('type', 'matrix');
      feColorMatrix.setAttribute('values', '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7');
      pixelFilter.appendChild(feColorMatrix);
      
      svg.appendChild(pixelFilter);
      
      const psychedelicFilter = document.createElementNS(svgNS, 'filter');
      psychedelicFilter.setAttribute('id', 'psychedelic-filter');
      
      const feTurbulence = document.createElementNS(svgNS, 'feTurbulence');
      feTurbulence.setAttribute('type', 'fractalNoise');
      feTurbulence.setAttribute('baseFrequency', '0.01 0.04');
      feTurbulence.setAttribute('numOctaves', '1');
      feTurbulence.setAttribute('seed', '1');
      psychedelicFilter.appendChild(feTurbulence);
      
      const feDisplacementMap = document.createElementNS(svgNS, 'feDisplacementMap');
      feDisplacementMap.setAttribute('in', 'SourceGraphic');
      feDisplacementMap.setAttribute('scale', '20');
      psychedelicFilter.appendChild(feDisplacementMap);
      
      const feHueRotate = document.createElementNS(svgNS, 'feColorMatrix');
      feHueRotate.setAttribute('type', 'hueRotate');
      feHueRotate.setAttribute('values', '0');
      feHueRotate.setAttribute('class', 'animate-hue');
      psychedelicFilter.appendChild(feHueRotate);
      
      svg.appendChild(psychedelicFilter);
      
      const glitchFilter = document.createElementNS(svgNS, 'filter');
      glitchFilter.setAttribute('id', 'glitch-filter');
      
      const feOffset = document.createElementNS(svgNS, 'feOffset');
      feOffset.setAttribute('in', 'SourceGraphic');
      feOffset.setAttribute('dx', '3');
      feOffset.setAttribute('dy', '0');
      feOffset.setAttribute('result', 'red');
      glitchFilter.appendChild(feOffset);
      
      const feColorMatrix1 = document.createElementNS(svgNS, 'feColorMatrix');
      feColorMatrix1.setAttribute('in', 'red');
      feColorMatrix1.setAttribute('type', 'matrix');
      feColorMatrix1.setAttribute('values', '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0');
      feColorMatrix1.setAttribute('result', 'red_channel');
      glitchFilter.appendChild(feColorMatrix1);
      
      const feOffset2 = document.createElementNS(svgNS, 'feOffset');
      feOffset2.setAttribute('in', 'SourceGraphic');
      feOffset2.setAttribute('dx', '-3');
      feOffset2.setAttribute('dy', '0');
      feOffset2.setAttribute('result', 'blue');
      glitchFilter.appendChild(feOffset2);
      
      const feColorMatrix2 = document.createElementNS(svgNS, 'feColorMatrix');
      feColorMatrix2.setAttribute('in', 'blue');
      feColorMatrix2.setAttribute('type', 'matrix');
      feColorMatrix2.setAttribute('values', '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0');
      feColorMatrix2.setAttribute('result', 'blue_channel');
      glitchFilter.appendChild(feColorMatrix2);
      
      const feBlend = document.createElementNS(svgNS, 'feBlend');
      feBlend.setAttribute('in', 'red_channel');
      feBlend.setAttribute('in2', 'blue_channel');
      feBlend.setAttribute('mode', 'screen');
      feBlend.setAttribute('result', 'rb_blend');
      glitchFilter.appendChild(feBlend);
      
      const feBlend2 = document.createElementNS(svgNS, 'feBlend');
      feBlend2.setAttribute('in', 'rb_blend');
      feBlend2.setAttribute('in2', 'SourceGraphic');
      feBlend2.setAttribute('mode', 'screen');
      glitchFilter.appendChild(feBlend2);
      
      svg.appendChild(glitchFilter);
      
      document.body.appendChild(svg);
      
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes spinning {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes jiggle {
          0%, 100% { transform: translateX(0) rotate(0); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          50% { transform: translateX(0) rotate(0); }
          75% { transform: translateX(5px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes glitchShift {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(3px); }
          40% { transform: translateX(-3px); }
          60% { transform: translateX(2px); }
          80% { transform: translateX(-2px); }
        }
        
        @keyframes colorCycle {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        
        .image-effects-wrapper {
          display: inline-block;
          overflow: hidden;
          position: relative;
        }
        
        .wacky-spin {
          animation: spinning 5s linear infinite;
        }
        
        .wacky-jiggle {
          animation: jiggle 0.3s ease-in-out infinite;
        }
        
        .wacky-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .wacky-glitch {
          animation: glitchShift 0.2s ease-in-out infinite;
        }
        
        .wacky-color-cycle {
          animation: colorCycle 3s linear infinite;
        }
        
        .wacky-flipped {
          transform: scaleX(-1);
        }
        
        .wacky-upside-down {
          transform: scaleY(-1);
        }
        
        .wacky-3d {
          transform: perspective(500px) rotateY(15deg);
          transition: transform 0.3s ease;
        }
        
        .wacky-3d:hover {
          transform: perspective(500px) rotateY(-15deg);
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  function applyWackyEffectsToImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach((img) => {
      if (img.classList.contains('image-effects-applied')) {
        return;
      }
      
      img.classList.add('image-effects-applied');
      
      const wrapper = document.createElement('div');
      wrapper.className = 'image-effects-wrapper';
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      
      const effects = [];
      const possibleFilters = [
        'grayscale(100%) url("#pixel-filter")',
        'url("#psychedelic-filter")',
        'sepia(80%) saturate(200%) brightness(120%)',
        'url("#glitch-filter")',
        'contrast(150%) brightness(120%) saturate(150%)',
        'invert(80%)',
        'blur(1px) contrast(120%)'
      ];
      
      const possibleClasses = [
        'wacky-spin',
        'wacky-jiggle',
        'wacky-pulse',
        'wacky-glitch',
        'wacky-color-cycle',
        'wacky-flipped',
        'wacky-upside-down',
        'wacky-3d'
      ];
      
      const randomFilter = possibleFilters[Math.floor(Math.random() * possibleFilters.length)];
      img.style.filter = randomFilter;
      
      const numEffects = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numEffects; i++) {
        const randomClassIndex = Math.floor(Math.random() * possibleClasses.length);
        const randomClass = possibleClasses[randomClassIndex];
        wrapper.classList.add(randomClass);
        
        possibleClasses.splice(randomClassIndex, 1);
        
        if (possibleClasses.length === 0) break;
      }
      
      if (Math.random() > 0.5) {
        const borderColors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF8800', '#88FF00'];
        const randomColor = borderColors[Math.floor(Math.random() * borderColors.length)];
        const borderStyles = ['solid', 'dashed', 'dotted', 'double', 'ridge'];
        const randomStyle = borderStyles[Math.floor(Math.random() * borderStyles.length)];
        img.style.border = `4px ${randomStyle} ${randomColor}`;
      }
      
      if (Math.random() > 0.5) {
        const shadowColors = ['red', 'blue', 'green', 'purple', 'orange'];
        const randomColor = shadowColors[Math.floor(Math.random() * shadowColors.length)];
        const randomOffsetX = Math.floor(Math.random() * 10) - 5;
        const randomOffsetY = Math.floor(Math.random() * 10) - 5;
        const randomBlur = Math.floor(Math.random() * 10) + 5;
        img.style.boxShadow = `${randomOffsetX}px ${randomOffsetY}px ${randomBlur}px ${randomColor}`;
      }
      
      if (Math.random() > 0.7) {
        const skewX = (Math.random() * 10) - 5;
        const skewY = (Math.random() * 10) - 5;
        img.style.transform = `skew(${skewX}deg, ${skewY}deg)`;
      }
      
      img.addEventListener('mouseenter', () => {
        if (Math.random() > 0.5) {
          img.style.transition = 'all 0.3s ease';
          img.style.transform = img.style.transform + ' scale(1.1)';
        } else {
          const hueRotate = Math.floor(Math.random() * 360);
          img.style.transition = 'all 0.3s ease';
          img.style.filter = img.style.filter + ` hue-rotate(${hueRotate}deg)`;
        }
      });
      
      img.addEventListener('mouseleave', () => {
        img.style.transition = 'all 0.3s ease';
        img.style.transform = img.style.transform.replace(' scale(1.1)', '');
        img.style.filter = randomFilter;
      });
    });
  }
  
  function animateFilters() {
    let hueValue = 0;
    
    setInterval(() => {
      hueValue = (hueValue + 5) % 360;
      const hueElements = document.querySelectorAll('.animate-hue');
      hueElements.forEach(el => {
        el.setAttribute('values', hueValue);
      });
    }, 100);
  }
  
  createWackyFilters();
  applyWackyEffectsToImages();
  animateFilters();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        applyWackyEffectsToImages();
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
