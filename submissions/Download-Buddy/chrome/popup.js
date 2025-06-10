document.getElementById('addRuleBtn').addEventListener('click', () => {
    let nextId = document.getElementsByClassName('rule').length + 1;
    let ruleDiv = document.createElement('div');
    ruleDiv.className = 'rule';
    ruleDiv.id = nextId;

    let sourceSelect = document.createElement('select');
    sourceSelect.name = '1';
    sourceSelect.innerHTML = `
        <option disabled selected>Select Source Format</option>
        <option value="png">PNG</option>
        <option value="jpeg">JPG</option>
        <option value="webp">WebP</option>
        <option value="bmp">BMP</option>
        <option value="ico">ICO</option>
        <option value="tiff">TIFF</option>
        <option value="avif">AVIF</option>`;

    let span = document.createElement('span');
    span.textContent = 'to';

    let targetSelect = document.createElement('select');
    targetSelect.name = '2';
    targetSelect.innerHTML = `
        <option disabled selected>Select Target Format</option>
        <option value="png">PNG</option>
        <option value="jpeg">JPG</option>
        <option value="webp">WebP</option>`;

    let removeButton = document.createElement('button');
    removeButton.className = 'secondary';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
        remove(nextId);
    });

    ruleDiv.appendChild(sourceSelect);
    ruleDiv.appendChild(span);
    ruleDiv.appendChild(targetSelect);
    ruleDiv.appendChild(removeButton);

    document.getElementById('rulesContainer').appendChild(ruleDiv);
})

const remove = (id) => {
    document.getElementById(id).remove();
}

const save = () => {
    let rules = [];
    let ruleElements = document.getElementsByClassName('rule');
    for (let i = 0; i < ruleElements.length; i++) {
        let rule = ruleElements[i];
        let source = rule.getElementsByTagName('select')[0].value;
        let target = rule.getElementsByTagName('select')[1].value;
        rules.push({ source, target });
    }

    chrome.storage.sync.set({ rules }, () => {
        console.log('Rules saved');
    });

    let status = document.getElementById('status');
    status.textContent = 'Options saved!';
    status.style.color = 'green';
    setTimeout(() => {
        status.textContent = '';
    }, 2000);
}

document.getElementById('saveBtn').addEventListener('click', save);

window.onload = () => {
    chrome.storage.sync.get('rules', (data) => {
        let rules = data.rules || [];
        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i];
            console.log(rule);
            let nextId = document.getElementsByClassName('rule').length + 1;

            let ruleDiv = document.createElement('div');
            ruleDiv.className = 'rule';
            ruleDiv.id = nextId;

            let sourceSelect = document.createElement('select');
            sourceSelect.name = '1';
            sourceSelect.innerHTML = `
                <option disabled>Select Source Format</option>
                <option value="png">PNG</option>
                <option value="jpeg">JPG</option>
                <option value="webp">WebP</option>
                <option value="bmp">BMP</option>
                <option value="ico">ICO</option>
                <option value="tiff">TIFF</option>
                <option value="avif">AVIF</option>`;
            sourceSelect.querySelector(`option[value="${rule.source}"]`).selected = true;

            let span = document.createElement('span');
            span.textContent = 'to';

            let targetSelect = document.createElement('select');
            targetSelect.name = '2';
            targetSelect.innerHTML = `
                <option disabled>Select Target Format</option>
                <option value="png">PNG</option>
                <option value="jpeg">JPG</option>
                <option value="webp">WebP</option>`;
            targetSelect.querySelector(`option[value="${rule.target}"]`).selected = true;

            let removeButton = document.createElement('button');
            removeButton.className = 'secondary';
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                remove(nextId);
            });

            ruleDiv.appendChild(sourceSelect);
            ruleDiv.appendChild(span);
            ruleDiv.appendChild(targetSelect);
            ruleDiv.appendChild(removeButton);

            document.getElementById('rulesContainer').appendChild(ruleDiv);
        }
    });
}