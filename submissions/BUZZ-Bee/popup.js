document.addEventListener("DOMContentLoaded", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0 || tabs[0].url.startsWith("chrome://")) {
            console.error("Invalid tab or cannot access chrome:// pages.");
            document.getElementById("buzz-status").innerText = "Cannot scan this page.";
            return;
        }

        chrome.tabs.sendMessage(tabs[0].id, { action: "getBuzzWords" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                document.getElementById("buzz-status").innerText = "Error retrieving data.";
                return;
            }

            if (!response || !response.detectedWords) {
                document.getElementById("buzz-status").innerText = "No buzzwords found.";
                updateChart(0);
                return;
            }
            let mostUsedCategory = getMostUsedCategory(response.detectedWords);
            let totalWords = response.totalWords || 1; // Prevent division by zero
            let buzzPercentage = ((5*response.count / totalWords) * 100).toFixed(2);
            document.getElementById("buzz-status").innerText = getBuzzLevel(buzzPercentage);
            document.getElementById("buzz-type").innerText = `Mostly in Category: ${mostUsedCategory}`;

            updateDonutChart(buzzPercentage);
        });
    });
});

function updateDonutChart(percentage) {
    const chart = document.querySelector('.donut-chart');
    const innerText = document.querySelector('.donut-chart-inner');

    if (chart && innerText) {
        let color = getColorByPercentage(percentage);

        chart.style.background = `conic-gradient(
            ${color} 0% ${percentage}%, 
            #ddd ${percentage}% 100%
        )`;
        innerText.innerText = `${percentage}%`;
    }
}

// Function to determine the color based on buzzword percentage
function getColorByPercentage(percentage) {
    if (percentage >= 30) return "#F8312F"; // 🔴 Red for high buzz (30%+)
    if (percentage >= 15) return "#FF6723"; // 🟠 Yellow for medium buzz (15-30%)
    if (percentage >= 5) return "#FCD53F"; // 🟡 Yellow for medium buzz (15-30%)
    return "#00D26A"; // 🟢 Green for low buzz (0-15%)
}

function getMostUsedCategory(detectedWords) {
    let categoryCounts = {};

    Object.values(detectedWords).forEach(({ count, category }) => {
        categoryCounts[category] = (categoryCounts[category] || 0) + count;
    });

    // Find the category with the highest count
    let mostUsedCategory = Object.keys(categoryCounts).reduce((a, b) => 
        categoryCounts[a] > categoryCounts[b] ? a : b, "");

    return mostUsedCategory || "None";
}


function getBuzzLevel(percentage) {
    if (percentage >= 30) return "🚨 Overloaded with Buzz!";
    if (percentage >= 15) return "🟠 Shady Buzzed";
    if (percentage >= 5) return "🟡 Moderately Buzzed";
    return "🟢 Chill Buzz";
}
