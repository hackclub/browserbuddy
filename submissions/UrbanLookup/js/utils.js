// ruined my day, I shouldnt have made this in the first place
"use strict";

export function sanitizeHtml(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

export function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

export function processEntry(entry) {
  if (!entry) return null;

  return {
    ...entry,
    cleanDefinition: entry.definition.replace(/\[|\]/g, ""),
    cleanExample: entry.example.replace(/\[|\]/g, ""),
  };
}

export function showNotification(message, color, duration = 2000) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${color};
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 9999;
  `;
  // lmao
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, duration);
}
