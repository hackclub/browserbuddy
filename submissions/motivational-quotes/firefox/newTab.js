
document.addEventListener("DOMContentLoaded", () => {
    const quoteText = document.getElementById('quote-text');
    const newQuoteBtn = document.getElementById('new-quote-btn')
    const shareBtn = document.getElementById('share-btn')

    function getQuote() {
        browser.runtime.sendMessage({ type: "getQuote" }, (response) => {
            if (response && response.quote) {
                quoteText.innerText = response.quote;
            } else {
                quoteText.innerText = "Failed to load a quote!"
            }
        });
    }

    function shareQuote() {
        const quote = quoteText.innerText;
        if (navigator.share) {
            navigator.share({
                title: 'Mood-Boosting Quote',
                text: quote,
                url: window.location.href
            }).catch((error) => console.log('Error sharing:', error));
        } else {
            alert('Share functionality is not supported on this device.');
        }
    }

    getQuote()

    newQuoteBtn.addEventListener("click", getQuote)
    shareBtn.addEventListener("click", shareQuote)
})