document.getElementById('mark-as-listened').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const category = document.getElementById('category').value;
    const item = { title: tab.title, url: tab.url, timestamp: Date.now(), category: category };
    chrome.runtime.sendMessage({ action: 'addItem', item }, () => {
      renderList();
    });
  });
});

document.getElementById('search').addEventListener('input', (event) => {
  renderList();
});

document.getElementById('category').addEventListener('change', (event) => {
  renderList();
});

function renderList() {
  const query = document.getElementById('search').value.toLowerCase();
  const category = document.getElementById('category').value;
  chrome.runtime.sendMessage({ action: 'getListenedItems' }, (items) => {
    const listElement = document.getElementById('listened-items');
    listElement.innerHTML = '';
    items.filter(item => 
      (item.title.toLowerCase().includes(query) || item.url.toLowerCase().includes(query)) &&
      (category === '' || item.category === category)
    ).forEach((item, index) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${item.title} - ${item.url} (${item.category})`;
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'removeItem', index }, () => {
          renderList();
        });
      });
      listItem.appendChild(deleteButton);
      listElement.appendChild(listItem);
    });
  });
}

renderList();
