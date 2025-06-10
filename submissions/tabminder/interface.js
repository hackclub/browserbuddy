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
}

document.addEventListener('DOMContentLoaded', () => {
  const { page, title } = getQueryParams();
  if (page) {
    document.getElementById('pageTitle').textContent = title || page;
  }

  const themeToggleBtn = document.getElementById('themeToggleBtn');

  chrome.storage.sync.get({ theme: 'dark' }, (data) => {
    applyTheme(data.theme);
  });

  themeToggleBtn.addEventListener('click', () => {
    const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    chrome.storage.sync.set({ theme: newTheme });
    applyTheme(newTheme);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.theme) {
      applyTheme(changes.theme.newValue);
    }
  });

  loadReminders();

  document.getElementById('closeBtn').addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'closeIframe' });
  });
});

const addReminderForm = document.getElementById('addReminderForm');
addReminderForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const reminderText = document.getElementById('reminderText').value;
  const { page, title } = getQueryParams();
  if (reminderText && page) {
    addReminder({ text: reminderText, pageUrl: page, pageTitle: title, id: Date.now() });
    document.getElementById('reminderText').value = '';
  }
});

function addReminder(reminder) {
  chrome.storage.sync.get({ reminders: [] }, function (data) {
    let reminders = Array.isArray(data.reminders) ? data.reminders : [];
    reminders.push(reminder);
    chrome.storage.sync.set({ reminders: reminders }, function () {
      loadReminders();
    });
  });
}

function loadReminders() {
  chrome.storage.sync.get({ reminders: [] }, function (data) {
    let reminders = Array.isArray(data.reminders) ? data.reminders : [];
    const remindersList = document.getElementById('remindersList');
    remindersList.innerHTML = '';
    reminders.forEach(reminder => {
      const reminderDiv = document.createElement('div');
      reminderDiv.className = 'reminder';

      const textSpan = document.createElement('span');
      textSpan.textContent = reminder.text;
      reminderDiv.appendChild(textSpan);

      const small = document.createElement('small');
      small.textContent = `For: ${reminder.pageTitle || reminder.pageUrl}`;
      reminderDiv.appendChild(small);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'actions';

      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => {
        editReminder(reminder.id);
      });
      actionsDiv.appendChild(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        deleteReminder(reminder.id);
      });
      actionsDiv.appendChild(deleteButton);

      reminderDiv.appendChild(actionsDiv);
      remindersList.appendChild(reminderDiv);
    });
  });
}

function deleteReminder(id) {
  chrome.storage.sync.get({ reminders: [] }, function (data) {
    let reminders = Array.isArray(data.reminders) ? data.reminders : [];
    reminders = reminders.filter(r => r.id !== id);
    chrome.storage.sync.set({ reminders: reminders }, function () {
      loadReminders();
    });
  });
}

function editReminder(id) {
  chrome.storage.sync.get({ reminders: [] }, function (data) {
    let reminders = Array.isArray(data.reminders) ? data.reminders : [];
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      const newText = prompt("Edit reminder text:", reminder.text);
      if (newText !== null) {
        reminder.text = newText;
        chrome.storage.sync.set({ reminders: reminders }, function () {
          loadReminders();
        });
      }
    }
  });
}
