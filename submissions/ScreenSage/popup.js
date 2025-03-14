let currentChart = null;

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    loadData();
    initTabs();
    updateTrendIndicators();
    loadInsightsFromStorage(); 
    setupInfoIcon();
});

let isDailyView = true;
let updateInterval = null;

document.getElementById('toggleSwitch').addEventListener('change', function() {
    isDailyView = this.checked;
    document.getElementById('toggleLabel').textContent = this.checked ? 'Daily' : 'Weekly';
    loadData();
});

function setupInfoIcon() {
    const infoIcon = document.getElementById('infoIcon');
    
    if (!infoIcon) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'info-tooltip';
    tooltip.innerHTML = `
        <div class="info-tooltip-content">
            <div class="info-tooltip-icon">ℹ️</div>
            <div class="info-tooltip-text">
                Screen Time Tracker app made by <a href="#" id="githubLink" class="name">Kevin Chang</a>
            </div>
        </div>
    `;
    document.body.appendChild(tooltip);
    
    // Add dedicated event handler for the GitHub link
    const githubLink = tooltip.querySelector('#githubLink');
    githubLink.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Keep the tooltip visible for this click
        tooltip.style.pointerEvents = 'none';
        
        // Open GitHub in a new tab with a slight delay to let the event complete
        setTimeout(() => {
            try {
                chrome.tabs.create({ url: 'https://github.com/changkevin51', active: true });
            } catch (err) {
                console.error('Failed to open link:', err);
                // Backup method in case chrome.tabs.create fails
                window.open('https://github.com/changkevin51', '_blank');
            }
        }, 10);
        
        // Prevent tooltip from closing
        return false;
    });
    
    // Stop clicks within the tooltip from closing it
    tooltip.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    infoIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.classList.add('visible');
        tooltip.style.pointerEvents = 'auto'; // Restore pointer events
        
        setTimeout(() => {
            tooltip.classList.remove('visible');
        }, 3000);
    });
    
    document.addEventListener('click', () => {
        tooltip.classList.remove('visible');
    });
}

function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            document.querySelector(`.tab-content[data-tab-content="${targetTab}"]`).classList.add('active');
            
            
            if (targetTab === 'chart' && !currentChart) {
                initDailyTrendChart();
            }
        });
    });
}


function initDailyTrendChart() {
    const canvas = document.getElementById('dailyTrendChart');
    
    chrome.storage.local.get(null, (data) => {
        const dailyData = extractDailyTotals(data);
        
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: dailyData.labels,
                datasets: [{
                    label: 'Daily Screen Time (hours)',
                    data: dailyData.values.map(v => v / 3600000), 
                    backgroundColor: 'rgba(75, 123, 236, 0.7)',
                    borderColor: 'rgba(75, 123, 236, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Daily Screen Time Trends',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + 'h';
                            }
                        }
                    }
                }
            }
        });
    });
}


function extractDailyTotals(data) {
    const labels = [];
    const values = [];
    
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        labels.push(dayName);
        
        
        let dayTotal = 0;
        if (data[dateString]) {
            dayTotal = Object.values(data[dateString]).reduce((sum, time) => sum + time, 0);
        }
        
        values.push(dayTotal);
    }
    
    return { labels, values };
}


function updateTrendIndicators() {
    chrome.storage.local.get(null, (data) => {
        
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        const todayData = data[today] || {};
        const yesterdayData = data[yesterday] || {};
        
        const todayTotal = Object.values(todayData).reduce((sum, time) => sum + time, 0);
        const yesterdayTotal = Object.values(yesterdayData).reduce((sum, time) => sum + time, 0);
        
        let percentChange = 0;
        let direction = 'up';
        
        if (yesterdayTotal > 0) {
            percentChange = Math.round((todayTotal - yesterdayTotal) / yesterdayTotal * 100);
            direction = percentChange >= 0 ? 'up' : 'down';
        }
        
        
        const trendArrow = document.querySelector('.trend-arrow');
        const trendPercent = document.querySelector('.trend-percent');
        
        if (trendArrow && trendPercent) {
            trendArrow.textContent = direction === 'up' ? 'Up' : 'Down';
            trendArrow.className = `trend-arrow ${direction}`;
            trendPercent.textContent = `${Math.abs(percentChange)}%`;
        }
    });
}


async function generateReportHandler(event) {
    const button = event.currentTarget;
    button.classList.add('loading');

    try {
        const lastReport = await chrome.storage.local.get('lastReport');
        if (lastReport.lastReport && Date.now() - lastReport.lastReport < 60000) {
            showError('Please wait 1 minute before generating another report');
            button.classList.remove('loading');
            return;
        }

        chrome.storage.local.get(null, async (data) => {
            try {
                // Use Hack Club AI API instead of Gemini
                const response = await fetch('https://ai.hackclub.com/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: "user", 
                                content: `Analyze this browsing data: ${JSON.stringify(data)}. ${getPrompt()}`
                            }
                        ]
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText);
                    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
                }

                const result = await response.json();
                
                // Extract content from the Hack Club API response format
                if (!result.choices?.[0]?.message?.content) {
                    console.error('Invalid response format:', result);
                    throw new Error('Invalid API response format');
                }

                const fullText = result.choices[0].message.content;
                
                const parts = fullText.split('---STRUCTURED_INSIGHTS---');
                const reportText = parts[0].trim();
                let insights = [];
                
                
                if (parts.length > 1) {
                    try {
                        
                        const jsonMatch = parts[1].match(/\[[\s\S]*\]/);
                        if (jsonMatch) {
                            insights = JSON.parse(jsonMatch[0]);
                            console.log('Successfully parsed structured insights:', insights);
                        }
                    } catch (e) {
                        console.error('Failed to parse structured insights, falling back to extraction:', e);
                        
                        insights = extractInsightsFromReport(reportText);
                    }
                } else {
                    
                    insights = extractInsightsFromReport(reportText);
                }
                
                
                const productivityScoreMatch = reportText.match(/[Pp]roductivity\s+[Ss]core\s*[:\-]?\s*(\d+)/);
                let productivityScore = productivityScoreMatch ? parseInt(productivityScoreMatch[1]) : null;
                
                
                if (!productivityScore) {
                    const percentMatch = reportText.match(/(\d+)%/);
                    productivityScore = percentMatch ? parseInt(percentMatch[1]) : 50;
                }
                
                
                productivityScore = Math.max(0, Math.min(100, productivityScore));
                
                
                chrome.storage.local.set({ 
                    lastReport: Date.now(),
                    productivityScore: productivityScore,
                    reportInsights: insights
                });
                
                
                calculateProductivityScore({});
                loadInsightsFromStorage();
                
                
                showReport(reportText);
            } catch (error) {
                console.error('API Error:', error);
                showError(`Failed to generate report: ${error.message}`);
            } finally {
                button.classList.remove('loading');
            }
        });
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred while generating the report');
        button.classList.remove('loading');
    }
}

document.getElementById('generateReport')?.addEventListener('click', generateReportHandler);
document.getElementById('dashboardGenerateReport')?.addEventListener('click', generateReportHandler);

function showReport(text) {
  const modal = document.createElement('div');
  modal.className = 'report-modal';
  
  
  const htmlContent = parseMarkdown(text);
  
  
  const sectionTitles = [];
  const sectionRegex = /<h2 class="report-section">(?:<span class="section-marker"><\/span>)?(.*?)<\/h2>/g;
  let match;
  
  while ((match = sectionRegex.exec(htmlContent)) !== null) {
    sectionTitles.push(match[1]);
  }
  
  
  let tocHtml = '';
  if (sectionTitles.length > 0) {
    tocHtml = '<div class="report-toc"><h3>Contents</h3><ul>';
    sectionTitles.forEach((title, index) => {
      tocHtml += `<li class="toc-item" data-section="${index}">${title}</li>`;
    });
    tocHtml += '</ul></div>';
  }
  
  modal.innerHTML = `
    <div class="report-content">
      <div class="report-header">
        <h2>Your Browsing Report</h2>
        <div class="report-timestamp">${new Date().toLocaleString()}</div>
      </div>
      ${tocHtml}
      <div class="report-text">${htmlContent}</div>
      <button class="close-report-btn">Close Report</button>
    </div>
  `;

  
  const closeBtn = modal.querySelector('.close-report-btn');
  closeBtn.addEventListener('click', () => {
    modal.classList.add('fade-out');
    setTimeout(() => modal.remove(), 300);
  });
  
  
  const tocItems = modal.querySelectorAll('.toc-item');
  tocItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionIndex = item.dataset.section;
      const sections = modal.querySelectorAll('.report-section');
      if (sections[sectionIndex]) {
        sections[sectionIndex].scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  document.body.appendChild(modal);
  
  
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

function parseMarkdown(text) {
    
    text = text.replace(/(:[\w-]+:)/g, '<span class="emoji">$1</span>');
    
    return text
      
      .replace(/## (.*?)(?:\n|$)/g, '<h2 class="report-section"><span class="section-marker"></span>$1</h2>')
      .replace(/### (.*?)(?:\n|$)/g, '<h3 class="report-subsection">$1</h3>')
      
      
      .replace(/\*\*\*(.*?)\*\*\*/g, '<span class="highlight-text">$1</span>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="bold-text">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic-text">$1</em>')
      
      
      .replace(/^\* (.*?)$/gm, '<li class="animated-bullet">$1</li>')
      .replace(/<\/li>\n<li class="animated-bullet">/g, '</li><li class="animated-bullet">')
      .replace(/<li class="animated-bullet">(.*?)(\n\n|\n$|$)/g, '<ul class="insight-list"><li class="animated-bullet">$1</li></ul>$2')
      
      
      .replace(/^> (.*?)$/gm, '<blockquote class="insight-quote">$1</blockquote>')
      
      
      .replace(/^---$/gm, '<hr class="animated-divider">')
      
      
      .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
      
      
      .replace(/(\d+%)/g, '<span class="percentage">$1</span>')
      .replace(/(\d+h \d+m|\d+m \d+s)/g, '<span class="time-value">$1</span>')
      
      
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="report-link">$1</a>')
      
      
      .replace(/\n\n/g, '<div class="paragraph-break"></div>')
      .replace(/\n/g, '<br>');
  }
  


function showError(message) {
  
  const isDashboardVisible = document.getElementById('dashboardView').style.display !== 'none';
  
  
  const errorId = isDashboardVisible ? 'dashboardError' : 'error';
  const errorDiv = document.getElementById(errorId);
  
  
  if (!errorDiv) {
    const newErrorDiv = document.createElement('div');
    newErrorDiv.id = errorId;
    newErrorDiv.className = 'error-message';
    
    if (isDashboardVisible) {
      
      const actionsContainer = document.querySelector('#dashboardView .actions') || 
                              document.getElementById('dashboardGenerateReport').parentElement;
      actionsContainer.appendChild(newErrorDiv);
    } else {
      
      document.querySelector('#detailView .actions').appendChild(newErrorDiv);
    }
  }
  
  
  const activeErrorDiv = document.getElementById(errorId);
  activeErrorDiv.textContent = message;
  activeErrorDiv.classList.add('show');
  
  
  activeErrorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  setTimeout(() => {
    activeErrorDiv.classList.remove('show');
  }, 3000);
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

async function loadData() {
    const container = document.getElementById('listContainer');
    container.innerHTML = '<div class="loader"></div>';

    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updateLiveTime, 1000); 

    const date = new Date();
    const currentDate = isDailyView ? 
        new Date().toISOString().split('T')[0] : 
        `week-${getWeekNumber(new Date())}`;

    chrome.storage.local.get(currentDate, (allData) => {
        console.log('All stored data:', allData);
        console.log('Looking for key:', currentDate);
        
        const usageData = allData[currentDate] || {};
        console.log('Usage data found:', usageData);

        const items = Object.entries(usageData)
            .sort((a, b) => b[1] - a[1])
            .map(([url, time]) => createListItem(url, time / 1000))

        container.innerHTML = '';
        items.forEach(item => container.appendChild(item));
        updateTotalTime(usageData);
    });
}


function updateLiveTime() {
    chrome.runtime.sendMessage({ action: 'getActiveTab' }, (response) => {
        if (chrome.runtime.lastError) return; 

        const { url, timeSpent } = response || {};
        if (url) {
            let existingItem = document.querySelector(`[data-url="${url}"]`);
            if (existingItem) {
                const storedTime = parseInt(existingItem.dataset.storedTime || 0, 10);
                const totalTime = storedTime + (timeSpent || 0);
                const timeDisplay = existingItem.querySelector('.time-info');
                if (timeDisplay) {
                    timeDisplay.textContent = formatTime(totalTime);
                }
            }
        }
    });
}

function createListItem(url, time) {
    const item = document.createElement('div');
    item.className = 'usage-item';
    item.dataset.url = url;
    item.dataset.storedTime = time;

    
    const displayUrl = url.replace(/^www\./, '');

    item.innerHTML = `
        <div class="site-info">
            <img src="https://www.google.com/s2/favicons?domain=${url}&size=32" alt="">
            <span>${displayUrl}</span>
        </div>
        <span class="time-info">${formatTime(time)}</span>
    `;
    
    item.addEventListener('click', () => {
        showChart(url);
    });
    
    return item;
}


async function showChart(url) {
    const chartModal = document.getElementById('chartModal');
    const canvas = document.getElementById('usageChartModal');

    
    if (currentChart instanceof Chart) {
        currentChart.destroy();
    }

    const weekData = await getWeeklyDataForUrl(url);
    
    
    chartModal.style.display = 'flex';
    
    
    setTimeout(() => {
        chartModal.classList.add('show');
        currentChart = renderChart(canvas, url, weekData);
    }, 10);
    
    
    document.querySelector('.chart-container').addEventListener('click', event => {
        event.stopPropagation();
    });
}


document.getElementById('chartModal').addEventListener('click', () => {
    closeChart();
});


document.getElementById('closeModal').addEventListener('click', (event) => {
    event.stopPropagation(); 
    closeChart();
});


function closeChart() {
    if (currentChart instanceof Chart) {
        currentChart.destroy();
        currentChart = null;
    }
    const chartModal = document.getElementById('chartModal');
    chartModal.classList.remove('show');
    setTimeout(() => chartModal.style.display = 'none', 300);
}

async function getWeeklyDataForUrl(url) {
  const dates = [];
  const usage = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const data = await chrome.storage.local.get(dateString);
    dates.push(dateString);
    usage.push((data[dateString]?.[url] || 0) / 60000); 
  }
  
  return { dates, usage };
}

function renderChart(canvas, url, data) {
    
    if (currentChart) {
        currentChart.destroy();
    }
    
    return new Chart(canvas, {
        type: 'line',
        data: {
            labels: data.dates.map(d => d.split('-').slice(1).join('/')), 
            datasets: [{
                label: 'Minutes Spent',
                data: data.usage,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                title: {
                    display: true,
                    text: `Usage: ${url.replace(/^www\./, '')}`,
                    font: {
                        size: 14,
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 0,
                    bottom: 10
                }
            }
        }
    });
}

function updateTotalTime(usageData) {
  const total = Object.values(usageData).reduce((sum, time) => sum + time, 0);
  document.getElementById('totalTime').textContent = formatTime(total / 1000);
  
  const topSite = Object.entries(usageData)
    .sort((a, b) => b[1] - a[1])[0];
  if (topSite) {
    document.getElementById('topSite').textContent = topSite[0];
  }
}


function formatTime(seconds) {
    
    seconds = Number(seconds) || 0;
    
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60); 
    
    return hours > 0
        ? `${hours}h ${mins}m`
        : mins > 0
        ? `${mins}m ${secs}s`
        : `${secs}s`;
}


function getPrompt() {
    return `Analyze the user's browsing habits and create a response with TWO CLEARLY SEPARATED SECTIONS:

SECTION 1: BROWSING REPORT
Create a structured report that includes:
1. Top 3 website categories (e.g., Social Media, Productivity)
2. Usage patterns (peak hours, frequent checks)
3. Productivity score (0-100) - THIS IS IMPORTANT, include a specific number
4. Recommendations for improvement

FORMAT THE REPORT USING MARKDOWN with:
- Use ## for section headings
- Use **bold** for important insights
- Use bullet points with * for lists
- Include emoji at the start of each section
- Keep paragraphs short
- Use horizontal rules (---) to separate sections
- In the productivity score section, clearly state "Productivity Score: X" where X is a number from 0-100

SECTION 2: STRUCTURED INSIGHTS
After the main report, include a clearly marked section titled "---STRUCTURED_INSIGHTS---" followed by exactly 4 insights in the following JSON format:
[
  {"category": "Usage Summary", "title": "Top Apps Analysis", "content": "Analysis of the specific sites/apps taking most of your screen time and their impact"},
  {"category": "Pattern Detection", "title": "Usage Patterns", "content": "Specific patterns observed in your browsing habits, including peak usage times"},
  {"category": "Productivity Impact", "title": "Productivity Score Explained", "content": "Why your productivity score is X% with specific factors affecting it"},
  {"category": "Recommendations", "title": "Actionable Tips", "content": "Specific, personalized suggestions to improve digital wellbeing based on your data"}
]

Each insight MUST:
- Be data-driven and specific to the user's actual browsing data
- Contain concrete numbers from the data where possible (hours spent, percentages, etc.)
- For productivity score insight, explain the specific reasoning behind the score
- For recommendations, provide actionable, personalized advice based on observed patterns
- Be between 70-100 characters in length for the content
- Have a clear, concise title (3-5 words)

Present the report in a friendly, conversational tone. Highlight any concerning patterns and suggest alternatives.`;
}


function loadDashboard() {
    debugStorageData(); 
    
    chrome.storage.local.get(null, (data) => {
        updateDashboardTotalTime(data);
        updateTopApps(data);
        calculateDailyAverage(data);
        calculateProductivityScore(data);
    });
}
function calculateTotalTime(data, onlyToday = true) {
    let total = 0;
    
    
    const excludeKeys = ['lastReport', 'activeTab', 'productivityScore', 'reportInsights'];
    
    
    const today = new Date().toISOString().split('T')[0];
    
    for (const key in data) {
        
        if (excludeKeys.includes(key)) continue;
        
        
        if (onlyToday && key !== today) continue;
        
        
        const dayData = data[key] || {};
        
        
        if (typeof dayData === 'object' && dayData !== null) {
            
            for (const site in dayData) {
                const time = Number(dayData[site]) || 0;
                total += time;
            }
        }
    }
    
    return total / 1000; 
}


function updateDashboardTotalTime(data) {
    const totalSeconds = calculateTotalTime(data);
    const formattedTime = formatTime(totalSeconds);
    
    const element = document.getElementById('dashboardTotalTime');
    if (element) {
        element.textContent = formattedTime;
    }
}

function calculateDailyAverage(data) {
    let totalTime = 0;
    let days = 0;
    
    
    const excludeKeys = ['lastReport', 'activeTab', 'productivityScore', 'reportInsights'];
    const today = new Date().toISOString().split('T')[0];
    
    console.log("Calculating daily average, today is:", today);
    console.log("Available data keys:", Object.keys(data));
    
    
    for (const key in data) {
        
        if (!excludeKeys.includes(key) && /^\d{4}-\d{2}-\d{2}$/.test(key) && key !== today) {
            const dayData = data[key] || {};
            
            if (typeof dayData === 'object' && dayData !== null) {
                let dayTotal = 0;
                
                
                for (const site in dayData) {
                    const time = Number(dayData[site]) || 0;
                    dayTotal += time;
                }
                
                
                if (dayTotal > 0) {
                    console.log(`Found day ${key} with ${Object.keys(dayData).length} sites, total time: ${formatTime(dayTotal/1000)}`);
                    totalTime += dayTotal;
                    days++;
                }
            }
        }
    }
    
    
    if (days === 0 && data[today] && typeof data[today] === 'object') {
        console.log("No historical data found, using today as fallback");
        let todayTotal = 0;
        
        for (const site in data[today]) {
            const time = Number(data[today][site]) || 0;
            todayTotal += time;
        }
        
        if (todayTotal > 0) {
            totalTime = todayTotal;
            days = 1;
            console.log(`Using today's data: ${formatTime(todayTotal/1000)}`);
        }
    }
    
    
    const avgTime = days > 0 ? totalTime / days : 0;
    const formattedTime = formatTime(avgTime / 1000);
    
    
    console.log(`Daily Average Calculation: Total time ${formatTime(totalTime/1000)} across ${days} days = ${formattedTime}`);
    
    
    const statValue = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (statValue) {
        console.log("Updating daily average display to:", formattedTime);
        statValue.textContent = formattedTime;
    } else {
        console.error("Daily average display element not found");
    }
}


function updateTopApps(data) {
    const allApps = {};
    
    
    for (const key in data) {
        
        if (key !== 'lastReport' && key !== 'activeTab' && 
            key !== 'productivityScore' && key !== 'reportInsights' &&
            !key.startsWith('week-')) {
            const dayData = data[key] || {};
            for (const app in dayData) {
                const timeValue = Number(dayData[app]) || 0;
                allApps[app] = (allApps[app] || 0) + timeValue;
            }
        }
    }

    
    const topApps = Object.entries(allApps)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const container = document.getElementById('topAppsContainer');
    container.innerHTML = '';

    if (topApps.length === 0) {
        container.innerHTML = '<div class="no-data">No app usage data available</div>';
        return;
    }

    topApps.forEach(([app, time]) => {
        const item = document.createElement('div');
        item.className = 'top-app-item';
        item.dataset.url = app;
        item.innerHTML = `
            <img class="top-app-icon" src="https://www.google.com/s2/favicons?domain=${app}&size=32" alt="">
            <div class="top-app-info">
                <div class="top-app-name">${app.replace(/^www\./, '')}</div>
                <div class="top-app-time">${formatTime(time/1000)}</div>
            </div>
        `;
        
        
        item.addEventListener('click', () => {
            showChart(app);
        });
        
        container.appendChild(item);
    });
}


document.getElementById('totalTimeCard').addEventListener('click', () => {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('detailView').style.display = 'block';
    loadData(); 
});

document.getElementById('resetData').addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all tracking data? This cannot be undone.')) {
        await chrome.storage.local.clear();
        loadDashboard();
    }
});


function calculateProductivityScore(data) {
    
    chrome.storage.local.get(['productivityScore', 'lastReport'], (result) => {
        const statCard = document.querySelector('.stat-card:nth-child(2)');
        if (!statCard) return;
        
        console.log("Productivity data:", result);
        
        if (result.productivityScore !== undefined && result.productivityScore !== null) {
            
            const scoreValue = parseInt(result.productivityScore);
            
            
            statCard.innerHTML = `
                <div class="stat-label">Productive</div>
                <div class="stat-value">${scoreValue}%</div>
                <div class="progress-circle">
                    <div class="progress-circle-overlay"></div>
                </div>
            `;
            
            
            const progressCircle = statCard.querySelector('.progress-circle');
            progressCircle.style.background = `conic-gradient(var(--secondary-color) ${scoreValue}%, #e0e0e0 0)`;
        } else {
            
            statCard.innerHTML = `
                <div class="stat-label">Productivity Score</div>
                <div class="no-report-prompt">
                    <span>Generate a report to see your productivity score</span>
                    <div class="report-icon">📊</div>
                </div>
            `;
        }
    });
}


document.getElementById('backToDashboard').addEventListener('click', () => {
    document.getElementById('detailView').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'block';
    loadDashboard(); 
});


document.getElementById('totalTimeCard').addEventListener('click', () => {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('detailView').style.display = 'block';
    loadData();
});


function extractInsightsFromReport(reportText) {
    const insights = [];
    
    
    
    const bulletPoints = reportText.match(/\*\s+(.*?)(?:\n|$)/g);
    if (bulletPoints && bulletPoints.length > 0) {
        bulletPoints.forEach(bp => {
            const text = bp.replace(/\*\s+/, '').trim();
            if (text.length > 10 && text.length < 150) { 
                insights.push({
                    title: generateInsightTitle(text),
                    content: text
                    
                });
            }
        });
    }
    
    
    const sections = reportText.match(/#{2,3}\s+(.*?)(?:\n)([\s\S]*?)(?=#{2,3}|$)/g);
    if (sections && sections.length > 0) {
        sections.forEach(section => {
            const titleMatch = section.match(/#{2,3}\s+(.*?)(?:\n)/);
            if (titleMatch) {
                const title = titleMatch[1].trim();
                const content = section.replace(titleMatch[0], '').trim();
                const shortContent = content.split('\n')[0].trim();
                
                if (shortContent.length > 10 && !title.toLowerCase().includes('productivity score')) {
                    insights.push({
                        title: title,
                        content: shortContent
                        
                    });
                }
            }
        });
    }
    
    
    if (insights.length < 3) {
        const sentencePattern = /[A-Z][^.!?]*[.!?]/g;
        const sentences = reportText.match(sentencePattern) || [];
        
        
        sentences.forEach(sentence => {
            
            if (insights.length < 3 && sentence.length > 30 && sentence.length < 150 &&
                (sentence.includes('you') || 
                 sentence.includes('usage') || 
                 sentence.includes('time') ||
                 sentence.includes('suggest'))) {
                
                insights.push({
                    title: generateInsightTitle(sentence),
                    content: sentence.trim()
                    
                });
            }
        });
    }
    
    
    if (insights.length < 3) {
        insights.push({
            title: "Screen Time Management",
            content: "Consider setting specific time limits for certain websites to improve focus."
            
        });
    }
    
    
    return insights.slice(0, 4);
}


function generateInsightTitle(text) {
    
    if (text.length < 30) return text;
    
    if (text.toLowerCase().includes('productivity')) return 'Productivity Insight';
    if (text.toLowerCase().includes('distract')) return 'Distraction Alert';
    if (text.toLowerCase().includes('focus')) return 'Focus Improvement';
    if (text.toLowerCase().includes('time')) return 'Time Management';
    if (text.toLowerCase().includes('suggest') || text.toLowerCase().includes('recommend')) return 'Recommendation';
    
    
    const words = text.split(' ');
    return words.slice(0, 3).join(' ') + '...';
}

function selectInsightIcon(text) {
    const lowercaseText = text.toLowerCase();
    
    if (lowercaseText.includes('productivity') || lowercaseText.includes('efficient')) return '💡';
    if (lowercaseText.includes('time') || lowercaseText.includes('hours')) return '⏰';
    if (lowercaseText.includes('distract') || lowercaseText.includes('focus')) return '🧠';
    if (lowercaseText.includes('balance') || lowercaseText.includes('health')) return '📊';
    if (lowercaseText.includes('improve') || lowercaseText.includes('increase')) return '📈';
    if (lowercaseText.includes('decrease') || lowercaseText.includes('reduce')) return '📉';
    if (lowercaseText.includes('suggest') || lowercaseText.includes('recommend')) return '💭';
    if (lowercaseText.includes('pattern') || lowercaseText.includes('habit')) return '🔄';
    if (lowercaseText.includes('social')) return '👥';
    if (lowercaseText.includes('work')) return '💼';
    if (lowercaseText.includes('entertainment')) return '🎬';
    if (lowercaseText.includes('learn') || lowercaseText.includes('education')) return '📚';
    
    
    const defaultIcons = ['💡', '📊', '🔍', '🎯'];
    return defaultIcons[Math.floor(Math.random() * defaultIcons.length)];
}


function formatMarkdownForInsight(text) {
    return text
        
        .replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>')
        
        .replace(/`(.*?)`/g, '<span class="code">$1</span>')
        
        .replace(/^\* (.*?)$/gm, '<li>$1</li>')
        .replace(/<\/li>\n<li>/g, '</li><li>')
        .replace(/<li>(.*?)(\n\n|\n$|$)/g, '<ul><li>$1</li></ul>$2');
}

function loadInsightsFromStorage() {
    chrome.storage.local.get(['reportInsights'], (result) => {
        const insightsContainer = document.getElementById('insightsContainer');
        
        if (!insightsContainer) {
            console.error('Insights container not found');
            return;
        }
        
        if (result.reportInsights && result.reportInsights.length > 0) {
            console.log('Rendering insights:', result.reportInsights);
            
            insightsContainer.innerHTML = '';
            
            
            const categoryIcons = {
                'Usage Summary': '📊',
                'Pattern Detection': '🔄',
                'Productivity Impact': '⚡',
                'Recommendations': '💡',
                
                'Time Management': '⏰',
                'Focus': '🎯',
                'Balance': '⚖️',
                'Default': '📈'
            };
            
            result.reportInsights.forEach(insight => {
                
                const insightCard = document.createElement('div');
                insightCard.className = 'insight-card';
                
                
                const category = insight.category || '';
                const icon = categoryIcons[category] || categoryIcons['Default'];
                
                
                const categoryLabel = insight.category ? 
                    `<div class="insight-category">${insight.category}</div>` : '';
                
                insightCard.innerHTML = `
                    <div class="insight-icon">${icon}</div>
                    <div class="insight-content">
                        ${categoryLabel}
                        <h4>${insight.title || 'Insight'}</h4>
                        <p>${formatMarkdownForInsight(insight.content || '')}</p>
                    </div>
                `;
                
                insightsContainer.appendChild(insightCard);
            });
            
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'insights-report-btn-container';
            buttonContainer.innerHTML = `
                <button id="insightsGenerateReport" class="insights-report-btn">
                    <span class="btn-text">Generate New Report</span>
                    <div class="btn-loader"></div>
                </button>
            `;
            insightsContainer.appendChild(buttonContainer);
            
            
            setTimeout(() => {
                document.getElementById('insightsGenerateReport')?.addEventListener('click', generateReportHandler);
            }, 0);
            
        } else {
            
            insightsContainer.innerHTML = `
                <div class="no-insights-container">
                    <div class="no-insights-icon">📊</div>
                    <h3>No insights available</h3>
                    <p>Generate a report to see personalized insights about your browsing habits.</p>
                    <button id="insightsGenerateReport" class="insights-report-btn">
                        <span class="btn-text">Generate Report</span>
                        <div class="btn-loader"></div>
                    </button>
                </div>
            `;
            
            
            setTimeout(() => {
                document.getElementById('insightsGenerateReport')?.addEventListener('click', generateReportHandler);
            }, 0);
        }
    });
}



function debugStorageData() {
    chrome.storage.local.get(null, (data) => {
        console.log("=== STORAGE DEBUG ===");
        console.log("All data keys:", Object.keys(data));
        
        let dateKeys = 0;
        let metadataKeys = 0;
        let unknownKeys = 0;
        
        
        const metadataKeysList = ['lastReport', 'activeTab', 'productivityScore', 'reportInsights'];
        
        for (const key in data) {
            if (metadataKeysList.includes(key)) {
                metadataKeys++;
                console.log(`Metadata: ${key} =`, data[key]);
            } else if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
                dateKeys++;
                const totalForDay = Object.values(data[key]).reduce((sum, val) => sum + (Number(val) || 0), 0);
                console.log(`Date ${key}: ${Object.keys(data[key]).length} sites, total time: ${formatTime(totalForDay/1000)}`);
            } else {
                unknownKeys++;
                console.log(`Unknown key format: ${key}`);
            }
        }
        
        console.log(`Summary: ${dateKeys} date keys, ${metadataKeys} metadata keys, ${unknownKeys} unknown keys`);
        console.log("=== END DEBUG ===");
    });
}







