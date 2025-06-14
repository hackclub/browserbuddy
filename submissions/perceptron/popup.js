document.getElementById('deuteranopia').addEventListener('click', () => {
  applyFilter('deuteranopia');
});

document.getElementById('protanopia').addEventListener('click', () => {
  applyFilter('protanopia');
});

document.getElementById('tritanopia').addEventListener('click', () => {
  applyFilter('tritanopia');
});

document.getElementById('normal').addEventListener('click', () => {
  applyFilter('normal');
});

function applyFilter(filterType) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab && tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('about://')) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: simulateColorBlindness,
          args: [filterType],
        },
        () => console.log(`Applied filter: ${filterType}`)
      );
    } else {
      console.error("Cannot apply filter to this tab. Invalid URL or internal page.");
    }
  });
}

function simulateColorBlindness(filterType) {
  const filters = {
    deuteranopia: 'url(#deuteranopia-filter)',
    protanopia: 'url(#protanopia-filter)',
    tritanopia: 'url(#tritanopia-filter)',
    normal: 'none',
  };

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" style="position:absolute; width:0; height:0;">
      <filter id="deuteranopia-filter">
        <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" />
      </filter>
      <filter id="protanopia-filter">
        <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" />
      </filter>
      <filter id="tritanopia-filter">
        <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" />
      </filter>
    </svg>
  `;

  let existingSvg = document.querySelector('#colorblind-filters');
  if (!existingSvg) {
    const div = document.createElement('div');
    div.id = 'colorblind-filters';
    div.innerHTML = svg;
    document.body.appendChild(div);
  }

  if (filterType === 'normal') {
    const container = document.getElementById('colorblind-container');
    if (container) {
      while (container.firstChild) {
        document.body.appendChild(container.firstChild);
      }
      container.remove();
    }
    document.body.style.overflow = 'auto';
    document.body.style.position = '';
    document.body.style.zIndex = '';
  } else {
    let container = document.getElementById('colorblind-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'colorblind-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.overflow = 'auto';
      container.style.margin = '0';
      container.style.padding = '0';
      container.style.zIndex = '1';

      Array.from(document.body.children).forEach((child) => {
        const computedStyle = window.getComputedStyle(child);
        if (computedStyle.position !== 'fixed' && computedStyle.position !== 'sticky') {
          container.appendChild(child);
        }
      });
      document.body.appendChild(container);
    }

    container.style.filter = filters[filterType];
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'relative';
    document.body.style.zIndex = '0';

    const fixedElements = document.querySelectorAll('body > *:not(#colorblind-container):not(#colorblind-filters)');
    fixedElements.forEach((el) => {
      el.style.position = 'fixed';
      el.style.zIndex = '2';
    });
  }
}
