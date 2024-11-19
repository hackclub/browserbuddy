const API = "https://api.coindesk.com/v1/bpi/currentprice.json";

document.addEventListener("DOMContentLoaded", async () => {
  const main = document.getElementById("main");
  const bitcoinPriceElement = document.getElementById("bitcoinPrice");
  const bitcoinAmountInput = document.getElementById("bitcoinAmount");
  const calculateBtn = document.getElementById("calculateBtn");
  const usdAmountElement = document.getElementById("usdAmount");

  let bitcoinPrice = localStorage.getItem("lastBitcoinPrice");

  try {
    const response = await fetch(API);
    const data = await response.json();
    bitcoinPrice = data.bpi.USD.rate_float.toFixed(2);
    localStorage.setItem("lastBitcoinPrice", bitcoinPrice);
    bitcoinPriceElement.textContent = bitcoinPrice;
  } catch (error) {
    if (bitcoinPrice) {
      bitcoinPriceElement.textContent = bitcoinPrice;
    } else {
      main.innerHTML = "<p>Could not fetch Bitcoin price :(</p>";
      return;
    }
  }

  let bitcoinAmount = localStorage.getItem("bitcoinAmount");

  const calculateUSDAmount = () => {
    bitcoinAmount = bitcoinAmountInput.value || 0;
    const usdAmount = bitcoinAmount * bitcoinPrice;
    usdAmountElement.innerHTML = `<b>$${usdAmount.toFixed(
      2
    )} USD</b> worth of Bitcoin.`;
  };

  if (bitcoinAmount) {
    bitcoinAmountInput.value = bitcoinAmount;
    calculateUSDAmount();
  }

  calculateBtn.addEventListener("click", () => {
    calculateUSDAmount();
    localStorage.setItem("bitcoinAmount", bitcoinAmountInput.value);
  });
});

//
