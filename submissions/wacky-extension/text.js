function createWackyTextFilters() {
    if (!document.getElementById('wacky-text-filters-svg')) {
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('id', 'wacky-text-filters-svg');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      
      const textDistortFilter = document.createElementNS(svgNS, 'filter');
      textDistortFilter.setAttribute('id', 'text-distort-filter');
      
      const feTurbulence = document.createElementNS(svgNS, 'feTurbulence');
      feTurbulence.setAttribute('type', 'turbulence');
      feTurbulence.setAttribute('baseFrequency', '0.02 0.05');
      feTurbulence.setAttribute('numOctaves', '2');
      feTurbulence.setAttribute('seed', '2');
      textDistortFilter.appendChild(feTurbulence);
      
      const feDisplacementMap = document.createElementNS(svgNS, 'feDisplacementMap');
      feDisplacementMap.setAttribute('in', 'SourceGraphic');
      feDisplacementMap.setAttribute('scale', '8');
      textDistortFilter.appendChild(feDisplacementMap);
      
      svg.appendChild(textDistortFilter);
      
      const textShadowFilter = document.createElementNS(svgNS, 'filter');
      textShadowFilter.setAttribute('id', 'text-shadow-filter');
      
      const feOffset = document.createElementNS(svgNS, 'feOffset');
      feOffset.setAttribute('dx', '2');
      feOffset.setAttribute('dy', '2');
      feOffset.setAttribute('result', 'offset');
      textShadowFilter.appendChild(feOffset);
      
      const feGaussianBlur = document.createElementNS(svgNS, 'feGaussianBlur');
      feGaussianBlur.setAttribute('in', 'offset');
      feGaussianBlur.setAttribute('stdDeviation', '2');
      feGaussianBlur.setAttribute('result', 'blur');
      textShadowFilter.appendChild(feGaussianBlur);
      
      const feBlend = document.createElementNS(svgNS, 'feBlend');
      feBlend.setAttribute('in', 'SourceGraphic');
      feBlend.setAttribute('in2', 'blur');
      feBlend.setAttribute('mode', 'normal');
      textShadowFilter.appendChild(feBlend);
      
      svg.appendChild(textShadowFilter);
  
      const rainbowFilter = document.createElementNS(svgNS, 'filter');
      rainbowFilter.setAttribute('id', 'rainbow-filter');
      
      const feComponentTransfer = document.createElementNS(svgNS, 'feComponentTransfer');
      feComponentTransfer.setAttribute('color-interpolation-filters', 'sRGB');
      
      const feFuncR = document.createElementNS(svgNS, 'feFuncR');
      feFuncR.setAttribute('type', 'table');
      feFuncR.setAttribute('values', '1 0 0 1');
      feComponentTransfer.appendChild(feFuncR);
      
      const feFuncG = document.createElementNS(svgNS, 'feFuncG');
      feFuncG.setAttribute('type', 'table');
      feFuncG.setAttribute('values', '0 1 0 1');
      feComponentTransfer.appendChild(feFuncG);
      
      const feFuncB = document.createElementNS(svgNS, 'feFuncB');
      feFuncB.setAttribute('type', 'table');
      feFuncB.setAttribute('values', '0 0 1 0');
      feComponentTransfer.appendChild(feFuncB);
      
      rainbowFilter.appendChild(feComponentTransfer);
      
      svg.appendChild(rainbowFilter);
      
      document.body.appendChild(svg);
      
      const textStyles = document.createElement('style');
      textStyles.innerHTML = `
        @keyframes textFloat {
          0%, 100% { transform: translateY(0) rotate(0); }
          25% { transform: translateY(-5px) rotate(1deg); }
          75% { transform: translateY(5px) rotate(-1deg); }
        }
        
        @keyframes letterJumble {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-3px); }
          50% { transform: translateY(3px); }
          75% { transform: translateY(-2px); }
        }
        
        @keyframes textRainbow {
          0% { color: #ff0000; }
          16.6% { color: #ff8800; }
          33.3% { color: #ffff00; }
          50% { color: #00ff00; }
          66.6% { color: #0088ff; }
          83.3% { color: #8800ff; }
          100% { color: #ff0000; }
        }
        
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff; }
          50% { text-shadow: 0 0 20px #00ffff, 0 0 30px #00ffff; }
        }
        
        @keyframes textWobble {
          0%, 100% { transform: skewX(0deg); }
          25% { transform: skewX(3deg); }
          75% { transform: skewX(-3deg); }
        }
        
        .text-effects-wrapper {
          display: inline-block;
          position: relative;
        }
        
        .wacky-text-float {
          animation: textFloat 3s ease-in-out infinite;
          display: inline-block;
        }
        
        .wacky-text-jumble span {
          display: inline-block;
          animation: letterJumble 0.4s ease-in-out infinite;
          animation-delay: calc(var(--letter-index) * 0.05s);
        }
        
        .wacky-text-rainbow {
          animation: textRainbow 3s linear infinite;
        }
        
        .wacky-text-glow {
          animation: textGlow 2s ease-in-out infinite;
        }
        
        .wacky-text-wobbly {
          animation: textWobble 2s ease-in-out infinite;
        }
        
        .wacky-text-uneven {
          font-family: 'Comic Sans MS', cursive, sans-serif !important;
        }
        
        .wacky-text-upside-down {
          transform: rotate(180deg);
        }
        
        .wacky-text-backwards {
          direction: rtl;
          unicode-bidi: bidi-override;
        }
        
        .wacky-text-filter-distort {
          filter: url('#text-distort-filter');
        }
        
        .wacky-text-filter-shadow {
          filter: url('#text-shadow-filter');
        }
        
        .wacky-text-filter-rainbow {
          filter: url('#rainbow-filter');
        }
        
        .wacky-text-3d {
          text-shadow: 1px 1px 0px #ff00ff, 
                       2px 2px 0px #00ffff, 
                       3px 3px 0px #ffff00;
        }
      `;
      document.head.appendChild(textStyles);
    }
  }
  
  function splitTextIntoSpans(element) {
    const text = element.textContent;
    const characters = text.split('');
    
    element.textContent = '';
    
    characters.forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.setProperty('--letter-index', index);
      element.appendChild(span);
    });
  }
  
  function applyWackyEffectsToText() {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, td, th, label, button');
    
    textElements.forEach((element) => {
      if (element.classList.contains('text-effects-applied') || 
          element.closest('.image-effects-wrapper') || 
          element.closest('script') || 
          element.closest('style')) {
        return;
      }
      
      element.classList.add('text-effects-applied');
      
      if (!element.textContent.trim()) {
        return;
      }
      
      const wrapper = document.createElement('div');
      wrapper.className = 'text-effects-wrapper';
      
      const clone = element.cloneNode(true);
  
      element.parentNode.insertBefore(wrapper, element);
      wrapper.appendChild(clone);
      element.remove();
      
      const possibleEffects = [
        'wacky-text-float',
        'wacky-text-jumble',
        'wacky-text-rainbow',
        'wacky-text-glow',
        'wacky-text-wobbly',
        'wacky-text-uneven',
        'wacky-text-filter-distort',
        'wacky-text-filter-shadow',
        'wacky-text-3d'
      ];
  
      if (Math.random() > 0.9) {
        possibleEffects.push('wacky-text-upside-down');
        possibleEffects.push('wacky-text-backwards');
      }
  
      const numEffects = Math.floor(Math.random() * 2) + 1;
      const appliedEffects = [];
      
      for (let i = 0; i < numEffects; i++) {
        const randomEffectIndex = Math.floor(Math.random() * possibleEffects.length);
        const randomEffect = possibleEffects[randomEffectIndex];
  
        if ((randomEffect === 'wacky-text-jumble' && appliedEffects.includes('wacky-text-backwards')) ||
            (randomEffect === 'wacky-text-backwards' && appliedEffects.includes('wacky-text-jumble'))) {
          continue;
        }
        
        wrapper.classList.add(randomEffect);
        appliedEffects.push(randomEffect);
        possibleEffects.splice(randomEffectIndex, 1);
        
        if (possibleEffects.length === 0) break;
      }
      
      if (wrapper.classList.contains('wacky-text-jumble')) {
        const textNodes = [];
        const collectTextNodes = (node) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            textNodes.push(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(collectTextNodes);
          }
        };
        
        collectTextNodes(clone);
        
        textNodes.forEach((textNode) => {
          const span = document.createElement('span');
          span.textContent = textNode.textContent;
          textNode.parentNode.replaceChild(span, textNode);
          splitTextIntoSpans(span);
        });
      }
      
      if (Math.random() > 0.7) {
        const sizeFactor = 0.8 + (Math.random() * 0.8); // 0.8 to 1.6
        clone.style.fontSize = `${sizeFactor}em`;
      }
  
      if (Math.random() > 0.6 && !wrapper.classList.contains('wacky-text-rainbow')) {
        const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF8800', '#88FF00', '#FF0000', '#0088FF'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        clone.style.color = randomColor;
      }
  
      wrapper.addEventListener('mouseenter', () => {
        const hoverEffects = [
          () => { clone.style.transform = 'scale(1.1)'; },
          () => { clone.style.fontStyle = 'italic'; },
          () => { clone.style.letterSpacing = '2px'; },
          () => { clone.style.textDecoration = 'underline wavy'; }
        ];
        
        const randomHoverEffect = hoverEffects[Math.floor(Math.random() * hoverEffects.length)];
        clone.style.transition = 'all 0.3s ease';
        randomHoverEffect();
      });
      
      wrapper.addEventListener('mouseleave', () => {
        clone.style.transition = 'all 0.3s ease';
        clone.style.transform = '';
        clone.style.fontStyle = '';
        clone.style.letterSpacing = '';
        clone.style.textDecoration = '';
      });
    });
  }
  
  createWackyTextFilters();
  applyWackyEffectsToText();
  
  const textObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        setTimeout(applyWackyEffectsToText, 100); 
      }
    });
  });
  
  textObserver.observe(document.body, {
    childList: true,
    subtree: true
  });