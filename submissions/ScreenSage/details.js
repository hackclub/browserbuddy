document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const site = decodeURIComponent(urlParams.get('url'));

  document.getElementById('siteTitle').textContent = site;

  async function loadChart() {
    const data = await chrome.storage.local.get(null);
    const usageData = Object.entries(data)
      .filter(([key]) => !key.startsWith('week') && key !== 'lastReport')
      .reduce((acc, [date, sites]) => {
        if (sites[site]) acc[date] = sites[site];
        return acc;
      }, {});

    new Chart(document.getElementById('usageChart'), {
      type: 'line',
      data: {
        labels: Object.keys(usageData),
        datasets: [{
          label: 'Usage Time (minutes)',
          data: Object.values(usageData).map(t => Math.round(t / 60000)),
          borderColor: '#3498db',
          tension: 0.1
        }]
      }
    });
  }

  document.getElementById('backButton').addEventListener('click', () => {
    window.close();
  });

  loadChart();
});