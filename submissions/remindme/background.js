chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith('scholarship_')) {
      const scholarshipId = alarm.name.split('_')[1];
      chrome.storage.local.get({ scholarships: [] }, (result) => {
        const scholarship = result.scholarships.find((sch) => sch.id === scholarshipId);
        if (scholarship) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon128.png',
            title: 'Scholarship Reminder',
            message: `Don't forget to check out ${scholarship.title}. Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}`,
          });
        }
      });
    }
  });
  

  chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
    if (btnIdx === 0) {
      chrome.tabs.create({ url: 'https://example.com' }); 
    }
  });

  