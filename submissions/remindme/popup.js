document.getElementById('saveBtn').addEventListener('click', saveScholarship);

function saveScholarship() {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const url = document.getElementById('url').value;
  const deadline = document.getElementById('deadline').value;

  if (title && description && url && deadline) {
    const scholarship = { title, description, url, deadline: new Date(deadline).getTime() };
    chrome.storage.local.get({ scholarships: [] }, (result) => {
      const scholarships = [...result.scholarships, scholarship];
      scholarships.sort((a, b) => a.deadline - b.deadline); 
      chrome.storage.local.set({ scholarships }, () => {
        displayScholarships();
        alert('Scholarship saved!');
      });
    });
  } else {
    alert('Please fill all fields.');
  }
}

function displayScholarships() {
  chrome.storage.local.get({ scholarships: [] }, (result) => {
    const scholarshipList = document.getElementById('scholarshipList');
    scholarshipList.innerHTML = '';
    result.scholarships.forEach((scholarship) => {
      const div = document.createElement('div');
      div.className = 'scholarship';
      div.innerHTML = `
        <h3>${scholarship.title}</h3>
        <p>${scholarship.description}</p>
        <a href="${scholarship.url}" target="_blank">Go to website</a>
        <p>Applications Open: ${new Date(scholarship.deadline).toLocaleDateString()}</p>
      `;
      scholarshipList.appendChild(div);
    });
  });
}

document.addEventListener('DOMContentLoaded', displayScholarships);

document.getElementById('testNotification').addEventListener('click', () => {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png', 
      title: 'Test Notification',
      message: 'This is a test notification and one similar to it will appear two days before the scholarship applications open and repeat itself one day prior!',
      buttons: [{ title: 'Open Example Page' }],
      priority: 2
    });
  });
  
function checkNotificationPermission() {
  if (Notification.permission === "denied") {
    alert(
      "Notifications are blocked for this browser. Please enable them."
    );
  } else if (Notification.permission === "default") {

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        alert("notifications are enabled so you'll receive reminders.");
      } else {
        alert(
          "notifications are not enabled, please allow them in ur browser settings."
        );
      }
    });
  }
}

document.getElementById("checkNotification").addEventListener("click", checkNotificationPermission);

