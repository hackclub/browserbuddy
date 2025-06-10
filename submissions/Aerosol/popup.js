document.addEventListener('DOMContentLoaded', function() {
  const cityInput = document.getElementById('cityInput');
  const searchButton = document.getElementById('searchButton');
  const loader = document.getElementById('loader');
  const error = document.getElementById('error');
  const results = document.getElementById('results');
  const statusMessage = document.getElementById('statusMessage');
  const cityName = document.getElementById('cityName');
  const aqiValue = document.getElementById('aqiValue');
  const aqiDescription = document.getElementById('aqiDescription');
  const cigarettesValue = document.getElementById('cigarettesValue');

  searchButton.addEventListener('click', searchCity);
  
  cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      searchCity();
    }
  });

  function searchCity() {
    const city = cityInput.value.trim();
    
    if (!city) {
      showError('Please enter a city name');
      return;
    }
    
    loader.style.display = 'block';
    results.style.display = 'none';
    error.style.display = 'none';
    statusMessage.style.display = 'none';
    
    const workerUrl = 'https://aerosol-api-proxy.relock-crier-squid.workers.dev';
    
    const geoUrl = `${workerUrl}?endpoint=geo&query=${encodeURIComponent(city)}`;
    
    fetch(geoUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`City search failed (${response.status})`);
        }
        return response.json();
      })
      .then(geoData => {
        if (!geoData || geoData.length === 0) {
          throw new Error('City not found. Please check the spelling or try a different city.');
        }
        
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        const displayCity = geoData[0].name + 
                          (geoData[0].state ? `, ${geoData[0].state}` : '') + 
                          (geoData[0].country ? `, ${geoData[0].country}` : '');
        
        const aqiUrl = `${workerUrl}?endpoint=aqi&query=${lat},${lon}`;
        
        return fetch(aqiUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`AQI data fetch failed (${response.status})`);
            }
            return response.json();
          })
          .then(aqiData => {
            return {
              aqiData: aqiData,
              cityDisplay: displayCity
            };
          });
      })
      .then(data => {
        if (!data.aqiData.list || data.aqiData.list.length === 0) {
          throw new Error('No air quality data available for this location');
        }
        
        const components = data.aqiData.list[0].components;
        const rawPM25 = components.pm2_5;
        
        const correctionFactor = 1.8;
        const adjustedPM25 = rawPM25 * correctionFactor;
        let usAqi = calculateAQIFromPM25(adjustedPM25);
        usAqi = Math.min(500, usAqi + 20);
        
        const cigarettes = improvedCigaretteCalculation(rawPM25, usAqi);
        
        cityName.textContent = data.cityDisplay;
        aqiValue.textContent = Math.round(usAqi);
        cigarettesValue.textContent = cigarettes.toFixed(1);
        
        updateAqiStyle(usAqi);
        
        results.style.display = 'block';
      })
      .catch(err => {
        console.error("Error:", err);
        showError(err.message);
      })
      .finally(() => {
        loader.style.display = 'none';
      });
  }

  function updateAqiStyle(aqi) {
    aqiValue.classList.remove('aqi-good', 'aqi-moderate', 'aqi-sensitive', 'aqi-unhealthy', 'aqi-very-unhealthy', 'aqi-hazardous');
    
    if (aqi <= 50) {
      aqiValue.classList.add('aqi-good');
      aqiDescription.textContent = "Good";
    } else if (aqi <= 100) {
      aqiValue.classList.add('aqi-moderate');
      aqiDescription.textContent = "Moderate";
    } else if (aqi <= 150) {
      aqiValue.classList.add('aqi-sensitive');
      aqiDescription.textContent = "Unhealthy for Sensitive Groups";
    } else if (aqi <= 200) {
      aqiValue.classList.add('aqi-unhealthy');
      aqiDescription.textContent = "Unhealthy";
    } else if (aqi <= 300) {
      aqiValue.classList.add('aqi-very-unhealthy');
      aqiDescription.textContent = "Very Unhealthy";
    } else {
      aqiValue.classList.add('aqi-hazardous');
      aqiDescription.textContent = "Hazardous";
    }
  }
  
  function calculateAQIFromPM25(pm25) {
    if (pm25 <= 12.0) {
      return linearScale(pm25, 0, 12.0, 0, 50);
    } else if (pm25 <= 35.4) {
      return linearScale(pm25, 12.1, 35.4, 51, 100);
    } else if (pm25 <= 55.4) {
      return linearScale(pm25, 35.5, 55.4, 101, 150);
    } else if (pm25 <= 150.4) {
      return linearScale(pm25, 55.5, 150.4, 151, 200);
    } else if (pm25 <= 250.4) {
      return linearScale(pm25, 150.5, 250.4, 201, 300);
    } else if (pm25 <= 350.4) {
      return linearScale(pm25, 250.5, 350.4, 301, 400);
    } else if (pm25 <= 500.4) {
      return linearScale(pm25, 350.5, 500.4, 401, 500);
    } else {
      return 500;
    }
  }
  
  function linearScale(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
  }

  function improvedCigaretteCalculation(pm25, aqi) {
    let cigaretteEquivalent;
    
    if (aqi <= 50) {
      cigaretteEquivalent = pm25 / 22;
    } else if (aqi <= 100) {
      cigaretteEquivalent = pm25 / 12;
    } else if (aqi <= 150) {
      cigaretteEquivalent = pm25 / 10;
    } else if (aqi <= 200) {
      cigaretteEquivalent = pm25 / 8;
    } else if (aqi <= 300) {
      cigaretteEquivalent = pm25 / 7;
    } else {
      cigaretteEquivalent = pm25 / 6;
    }
    
    if (pm25 > 50) {
      cigaretteEquivalent *= (1 + (pm25 - 50) / 200);
    }
    
    return Math.max(0.1, cigaretteEquivalent);
  }

  function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
    results.style.display = 'none';
    statusMessage.style.display = 'none';
  }
});