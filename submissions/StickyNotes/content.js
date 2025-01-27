chrome.runtime.onMessage.addListener(async (message) => {
    if (!message.coupons) return; // Ensure key matches the popup.js message

    const couponField = findCouponField();
    if (!couponField) {
        console.warn('No coupon field found on this page.');
        chrome.runtime.sendMessage({ status: 'No coupon field found.\nCoupons:\n'+message.coupons });
        return;
    }

    const applyButton = findApplyButton();
    if (!applyButton) {
        console.warn('No apply button found on this page.');
        chrome.runtime.sendMessage({ status: 'No apply button found.\nCoupons:\n'+message.coupons });
        return;
    }

    const results = [];
    for (const code of message.coupons) {
        couponField.value = code;
        couponField.dispatchEvent(new Event('input', { bubbles: true }));
        couponField.dispatchEvent(new Event('change', { bubbles: true }));

        applyButton.click();
        applyButton.dispatchEvent(new Event('click', { bubbles: true }));

        await wait(3000); // Wait for processing to complete

        if (isCodeValid()) {
            results.push({ code, status: 'Valid' });
            chrome.runtime.sendMessage({ validCoupon: code });
            break; // Stop if a valid coupon is found
        } else {
            results.push({ code, status: 'Invalid' });
            chrome.runtime.sendMessage({ status: `Coupon ${code} is invalid.` });
        }
    }

    chrome.runtime.sendMessage({ results });
});

// Utility Functions
function findCouponField() {
    return document.querySelector(
        'input[id*="coupon"], input[class*="promo"], input[placeholder*="code"], input[name*="coupon"]'
    );
}

function findApplyButton() {
    return document.querySelector(
        'button[aria-label*="Apply"], button[title*="Apply"]'
    ) || Array.from(document.querySelectorAll('button')).find(button =>
        button.innerText.trim().toLowerCase().includes('apply')
    );
}

function isCodeValid() {
    // Check specific elements for common success messages
    const successSelectors = [
        '.coupon-success', 
        '.discount-applied', 
        '#couponMessage', 
        '.success-message'
    ];
    
    for (const selector of successSelectors) {
        const element = document.querySelector(selector);
        if (element && /success|applied|discount/i.test(element.innerText)) {
            return true;
        }
    }

    // Fallback to check the entire body text
    const bodyText = document.body.innerText;
    return /\b(coupon applied|discount applied|successfully applied)\b/i.test(bodyText);
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
