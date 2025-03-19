document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const amountInput = document.getElementById('amount');
  const resultInput = document.getElementById('result');
  const fromCurrencySelect = document.getElementById('fromCurrency');
  const toCurrencySelect = document.getElementById('toCurrency');
  const convertBtn = document.getElementById('convert');
  const swapBtn = document.getElementById('swap');
  const exchangeRateSpan = document.getElementById('exchangeRate');
  const updateTimeSpan = document.getElementById('updateTime');
  
  // Common currencies to show at the top of the list
  const topCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
  
  // API URL
  const API_BASE_URL = 'https://api.exchangerate.host';
  
  // Cache for exchange rates
  let ratesCache = {};
  let lastFetchTime = null;
  
  // Initialize the extension
  initialize();
  
  async function initialize() {
    // Load currencies
    await loadCurrencies();
    
    // Set default values
    fromCurrencySelect.value = 'USD';
    toCurrencySelect.value = 'EUR';
    
    // Load saved preferences if any
    chrome.storage.local.get(['fromCurrency', 'toCurrency', 'amount'], function(result) {
      if (result.fromCurrency) fromCurrencySelect.value = result.fromCurrency;
      if (result.toCurrency) toCurrencySelect.value = result.toCurrency;
      if (result.amount) amountInput.value = result.amount;
      
      // Initial conversion
      convertCurrency();
    });
    
    // Add event listeners
    convertBtn.addEventListener('click', convertCurrency);
    swapBtn.addEventListener('click', swapCurrencies);
    fromCurrencySelect.addEventListener('change', savePreferences);
    toCurrencySelect.addEventListener('change', savePreferences);
    amountInput.addEventListener('input', savePreferences);
  }
  
  async function loadCurrencies() {
    try {
      const response = await fetch(`${API_BASE_URL}/symbols`);
      const data = await response.json();
      
      if (data.success) {
        const currencies = Object.keys(data.symbols);
        
        // Sort currencies with top currencies first
        currencies.sort((a, b) => {
          const aIsTop = topCurrencies.includes(a);
          const bIsTop = topCurrencies.includes(b);
          
          if (aIsTop && !bIsTop) return -1;
          if (!aIsTop && bIsTop) return 1;
          
          // If both are top currencies, sort by the specified order
          if (aIsTop && bIsTop) {
            return topCurrencies.indexOf(a) - topCurrencies.indexOf(b);
          }
          
          // Otherwise sort alphabetically
          return a.localeCompare(b);
        });
        
        // Populate dropdowns
        currencies.forEach(currency => {
          const option1 = document.createElement('option');
          option1.value = currency;
          option1.textContent = `${currency} - ${data.symbols[currency].description}`;
          fromCurrencySelect.appendChild(option1);
          
          const option2 = document.createElement('option');
          option2.value = currency;
          option2.textContent = `${currency} - ${data.symbols[currency].description}`;
          toCurrencySelect.appendChild(option2);
        });
      }
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  }
  
  async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    if (isNaN(amount) || amount <= 0) {
      resultInput.value = '';
      exchangeRateSpan.textContent = '-';
      return;
    }
    
    try {
      const rate = await getExchangeRate(fromCurrency, toCurrency);
      const result = amount * rate;
      
      resultInput.value = result.toFixed(4);
      exchangeRateSpan.textContent = `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`;
      updateTimeSpan.textContent = new Date().toLocaleTimeString();
    } catch (error) {
      console.error('Error converting currency:', error);
      exchangeRateSpan.textContent = 'Error fetching rate';
    }
  }
  
  async function getExchangeRate(fromCurrency, toCurrency) {
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const currentTime = new Date().getTime();
    
    // Check if we have a cached rate and it's less than 1 hour old
    if (ratesCache[cacheKey] && lastFetchTime && (currentTime - lastFetchTime) < 3600000) {
      return ratesCache[cacheKey];
    }
    
    // Fetch new rate
    try {
      const response = await fetch(`${API_BASE_URL}/convert?from=${fromCurrency}&to=${toCurrency}`);
      const data = await response.json();
      
      if (data.success) {
        const rate = data.result;
        
        // Update cache
        ratesCache[cacheKey] = rate;
        lastFetchTime = currentTime;
        
        return rate;
      } else {
        throw new Error('API returned an error');
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      throw error;
    }
  }
  
  function swapCurrencies() {
    const tempCurrency = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = tempCurrency;
    
    savePreferences();
    convertCurrency();
  }
  
  function savePreferences() {
    const preferences = {
      fromCurrency: fromCurrencySelect.value,
      toCurrency: toCurrencySelect.value,
      amount: amountInput.value
    };
    
    chrome.storage.local.set(preferences);
  }
});
