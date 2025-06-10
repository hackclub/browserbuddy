let tooltip = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "showDefinition") {
    showTooltip(message.definition);
  }
});

function showTooltip(definition) {
  if (tooltip) {
    document.body.removeChild(tooltip);
  }

  tooltip = document.createElement("div");
  tooltip.className = "urban-dict-tooltip";
  tooltip.innerHTML = `
    <div class="tooltip-header">
      <h3>${definition.word}</h3>
      <button class="close-btn">×</button>
    </div>
    <div class="tooltip-content">
      <p><strong>Definition:</strong> ${definition.meaning}</p>
      ${definition.example ? `<p><strong>Example:</strong> ${definition.example}</p>` : ''}
    </div>
  `;

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    .urban-dict-tooltip {
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 300px;
      background: #1a1a1a;
      color: #ffffff;
      border: 1px solid #333;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      z-index: 10000;
      padding: 15px;
      font-family: Arial, sans-serif;
    }
    .tooltip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      border-bottom: 1px solid #333;
      padding-bottom: 10px;
    }
    .tooltip-header h3 {
      margin: 0;
      font-size: 16px;
      color: #ffffff;
    }
    .close-btn {
      border: none;
      background: none;
      color: #ffffff;
      font-size: 20px;
      cursor: pointer;
      padding: 0 5px;
    }
    .close-btn:hover {
      color: #ff4444;
    }
    .tooltip-content {
      font-size: 14px;
      line-height: 1.4;
    }
    .tooltip-content strong {
      color: #7cb9ff;
    }
    .tooltip-content p {
      margin: 8px 0;
      color: #ffffff;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(tooltip);

  const closeBtn = tooltip.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(tooltip);
    tooltip = null;
  });
}