document.addEventListener('DOMContentLoaded', () => {
  const placeInput = document.getElementById('placeInput');
  const addButton = document.getElementById('addButton');
  const wishlist = document.getElementById('wishlist');

  function renderList(places) {
    wishlist.innerHTML = '';
    places.forEach((place, index) => {
      const li = document.createElement('li');
      li.textContent = place;

      const deleteBtn = document.createElement('span');
      deleteBtn.textContent = '❌';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', () => {
        places.splice(index, 1);
        chrome.storage.sync.set({ places });
        renderList(places);
      });

      li.appendChild(deleteBtn);
      wishlist.appendChild(li);
    });
  }

  chrome.storage.sync.get(['places'], (result) => {
    const places = result.places || [];
    renderList(places);
  });

  addButton.addEventListener('click', () => {
    const newPlace = placeInput.value.trim();
    if (newPlace) {
      chrome.storage.sync.get(['places'], (result) => {
        const places = result.places || [];
        places.push(newPlace);
        chrome.storage.sync.set({ places }, () => {
          renderList(places);
          placeInput.value = '';
        });
      });
    }
  });
});
