const apiKey = "1fe8889c";

document.getElementById("searchBtn").addEventListener("click", searchMovie);
document.getElementById("movieInput").addEventListener("keypress", (e) => { 
    if (e.key === "Enter") {
        searchMovie();
    }
});

function searchMovie() {
    const movieTitle = document.getElementById("movieInput").value.trim();
    const resultDiv = document.getElementById("result");
    if (!movieTitle) {
        resultDiv.innerHTML = '<div class="error">⚠️ Please enter a movie name!</div>';
        return;
    }
    resultDiv.innerHTML = '<div class="loading">Getting You Movie ......</div>';

    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(movieTitle)}`)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "True") {
                resultDiv.innerHTML = `
                    <h3>${data.Title} (${data.Year})</h3>
                    <div style="overflow: hidden;">
                        ${data.Poster !== "N/A" ? `<img src="${data.Poster}" alt="Movie Poster" />` : ''}
                        <p><strong>Genre:</strong> ${data.Genre || 'N/A'}</p>
                        <p><strong>Director:</strong> ${data.Director || 'N/A'}</p>
                        <p><strong>Actors:</strong> ${data.Actors || 'N/A'}</p>
                        <p><strong>Plot:</strong> ${data.Plot || 'N/A'}</p>
                        <p><strong>IMDb:</strong> ${data.imdbRating || 'N/A'}/10</p>
                        <p><strong>Runtime:</strong> ${data.Runtime || 'N/A'}</p>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = '<div class="error">Movie not found</div>';
            }
        })
        .catch(err => {
            resultDiv.innerHTML = '<div class="error">🔥 Error fetching data. Check your connection!</div>';
            console.error(err);
        });
}