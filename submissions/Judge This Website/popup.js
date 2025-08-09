document.addEventListener('DOMContentLoaded', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let url = new URL(tab.url);
    let domain = url.hostname;

    document.getElementById('site').textContent = domain;

    chrome.storage.local.get([domain], (result) => {
        if (result[domain]) {
            document.getElementById('previous').innerHTML = `
                <strong>Judgment:</strong> ${result[domain].rating}<br>
                <strong>Comment:</strong> ${result[domain].comment}
            `;
        } else {
            document.getElementById('previous').textContent = "No judgment yet.";
        }
    });

    document.getElementById('submit').addEventListener('click', () => {
        let rating = document.getElementById('rating').value;
        let comment = document.getElementById('comment').value;

        let data = { rating, comment };

        chrome.storage.local.set({ [domain]: data }, () => {
            alert('Your judgment has been saved!');
            location.reload();
        });
    });
});
