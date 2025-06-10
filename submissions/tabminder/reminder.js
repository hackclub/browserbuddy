function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    page: params.get('page'),
    title: params.get('title')
  };
}

function applyTheme(theme) {
  const body = document.body;
  if (theme === 'light') {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
  }

  document.documentElement.style.backgroundColor =
    theme === 'light' ? 'var(--bg-light)' : 'var(--bg-dark)';
}

function adjustIframeHeight() {
  if (window.frameElement) {
    const newHeight = document.documentElement.scrollHeight;
    window.frameElement.style.height = newHeight + 'px';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const { page, title } = getQueryParams();
  if (page) {
    document.getElementById('pageTitle').textContent = title || page;
  }

  const themeToggleBtn = document.getElementById('themeToggleBtn');

  chrome.storage.sync.get({ theme: 'dark' }, (data) => {
    applyTheme(data.theme);
    adjustIframeHeight();
  });

  themeToggleBtn.addEventListener('click', () => {
    const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    chrome.storage.sync.set({ theme: newTheme });
    applyTheme(newTheme);
    adjustIframeHeight();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.theme) {
      applyTheme(changes.theme.newValue);
      adjustIframeHeight();
    }
  });

  chrome.storage.sync.get({ reminders: [] }, (data) => {
    const reminders = Array.isArray(data.reminders) ? data.reminders : [];
    const matchingReminders = reminders.filter(r =>
      r.pageUrl && page.includes(r.pageUrl) &&
      (!r.snoozeUntil || Date.now() > r.snoozeUntil)
    );
    const reminderContentDiv = document.getElementById('reminderContent');
    if (matchingReminders.length > 0) {
      matchingReminders.forEach(reminder => {
        const reminderDiv = document.createElement('div');
        reminderDiv.className = 'reminder-item';
        reminderDiv.textContent = reminder.text;
        reminderContentDiv.appendChild(reminderDiv);
      });
    } else {
      reminderContentDiv.textContent = "No reminders for this page.";
    }
    adjustIframeHeight();
  });

  document.getElementById('closeBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'closeReminderIframe' });
  });
});

window.addEventListener('load', adjustIframeHeight);
