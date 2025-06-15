const STORAGE_KEY = 'rdFormData';

document.querySelectorAll('.tabs button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        button.classList.add('active');
        document.querySelector(`#${button.dataset.tab}`).classList.add('active');
    });
});

document.querySelector('#open-rd').addEventListener('click', () => {
    window.browser.tabs.create({
        url: 'https://www.sanita.puglia.it/servizialcittadino/#/RicercaPrenotazioneDematerializzata?azienda=regionale'
    });
});

document.querySelectorAll('[data-i18n]').forEach(el => {
    const msg = window.browser.i18n.getMessage(el.dataset.i18n);
    if (msg) el.textContent = msg;
});

async function loadFormData() {
    try {
        const result = await browser.storage.local.get(STORAGE_KEY);
        const data = result[STORAGE_KEY] || {};
        const form = document.getElementById('rd-form');
        if (!form) return;

        for (const field of form.elements) {
            if (field.name && data[field.name] !== undefined) {
                field.value = data[field.name];
            }
        }
    } catch (e) {
        console.error('Error loading form data:', e);
    }
}

function formDataToObject(formData) {
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

async function saveFormData(formData) {
    try {
        const data = formDataToObject(formData);
        await browser.storage.local.set({ [STORAGE_KEY]: data });
    } catch (e) {
        console.error('Error saving form data:', e);
    }
}

document.getElementById('rd-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    await saveFormData(formData);
});

loadFormData();