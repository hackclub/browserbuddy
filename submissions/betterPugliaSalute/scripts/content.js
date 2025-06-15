if (typeof browser === 'undefined') {
    window.browser = chrome;
}
const STORAGE_KEY = 'rdFormData';

// This function is from https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists but I modified it
const awaitElement = (selector) =>
    new Promise((resolve) => {
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            }
        }, 100);
        setTimeout(() => {
            clearInterval(interval);
            resolve(null);
        }, 10000);
    });

// I hate Angular
function fillAndTrigger(element, value) {
    if (element && value) {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

async function autofillForm() {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const data = result[STORAGE_KEY];

    if (!data || !data.cf || !data.cfid) {
        return;
    }

    const accessButton = await awaitElement('a.buttonaccesso_disattivo');
    if (accessButton) {
        accessButton.click();
    }

    const cfInput = await awaitElement('[name="codiceFiscale"]');
    const cfidInput = await awaitElement('[name="numeroTessera"]');

    if (cfInput && cfidInput) {
        fillAndTrigger(cfInput, data.cf);
        fillAndTrigger(cfidInput, data.cfid);

        const firstSubmitButton = cfInput.closest('form').querySelector('button.button');
        if (firstSubmitButton) {
            firstSubmitButton.click();
        }
    }

    const phoneInput = await awaitElement('[name="recapitoTelefonico"]');
    const emailInput = await awaitElement('[name="email"]');

    fillAndTrigger(phoneInput, data.phone);
    fillAndTrigger(emailInput, data.email);
}

// TODO: add more features
// and then move this to a separate file
if (window.location.hash.startsWith('#/RicercaPrenotazioneDematerializzata')) {
    autofillForm();
}