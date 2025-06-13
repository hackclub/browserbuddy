function getRandomTip() {
  return tips[Math.floor(Math.random() * tips.length)];
}

function loadFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "[]");
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function renderFoodList(filter = "") {
  const list = document.getElementById("food-list");
  list.innerHTML = "";
  const favs = loadFavorites();

  foods
    .filter(f => f.toLowerCase().includes(filter.toLowerCase()))
    .forEach(food => {
      const li = document.createElement("li");
      li.textContent = food;
      if (favs.includes(food)) li.classList.add("fav");

      const btn = document.createElement("button");
      btn.textContent = favs.includes(food) ? "★" : "☆";
      btn.onclick = (e) => {
        e.stopPropagation();
        const newFavs = favs.includes(food)
          ? favs.filter(f => f !== food)
          : [...favs, food];
        saveFavorites(newFavs);
        renderFoodList(document.getElementById("search").value);
      };

      li.appendChild(btn);
      li.onclick = () => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(food)}+nutrition`, '_blank');
      };

      list.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("daily-tip").textContent = getRandomTip();
  document.getElementById("search").addEventListener("input", (e) => {
    renderFoodList(e.target.value);
  });
  renderFoodList();
});
