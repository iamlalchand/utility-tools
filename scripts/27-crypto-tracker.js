const cryptoCoinSelect = document.getElementById("cryptoCoinSelect");
const cryptoCurrencySelect = document.getElementById("cryptoCurrencySelect");
const cryptoAmountInput = document.getElementById("cryptoAmountInput");
const cryptoRefreshBtn = document.getElementById("cryptoRefreshBtn");
const cryptoPrimaryResult = document.getElementById("cryptoPrimaryResult");
const cryptoMetaResult = document.getElementById("cryptoMetaResult");
const cryptoTopList = document.getElementById("cryptoTopList");

if (
  cryptoCoinSelect &&
  cryptoCurrencySelect &&
  cryptoAmountInput &&
  cryptoRefreshBtn &&
  cryptoPrimaryResult &&
  cryptoMetaResult &&
  cryptoTopList
) {
  function formatCryptoNumber(value, maxDigits = 2) {
    return Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: maxDigits });
  }

  async function refreshCryptoData() {
    const coin = cryptoCoinSelect.value;
    const currency = cryptoCurrencySelect.value.toLowerCase();
    const amount = Number(cryptoAmountInput.value || "1");

    if (!coin) {
      cryptoPrimaryResult.textContent = "Crypto: Select a coin first.";
      return;
    }

    cryptoPrimaryResult.textContent = "Crypto: Loading market data...";
    cryptoMetaResult.textContent = "Fetching live prices from CoinGecko...";
    cryptoTopList.innerHTML = "";

    try {
      const simpleUrl =
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coin)}` +
        `&vs_currencies=${encodeURIComponent(currency)}` +
        "&include_24hr_change=true&include_market_cap=true";
      const simpleResponse = await fetch(simpleUrl);
      if (!simpleResponse.ok) throw new Error("Price API unavailable");
      const simplePayload = await simpleResponse.json();
      const price = simplePayload?.[coin]?.[currency];
      const change = simplePayload?.[coin]?.[`${currency}_24h_change`];
      const marketCap = simplePayload?.[coin]?.[`${currency}_market_cap`];
      if (price === undefined) throw new Error("Selected pair is unavailable");

      const converted = amount * Number(price);
      cryptoPrimaryResult.textContent =
        `${coin.toUpperCase()}: 1 = ${formatCryptoNumber(price, 6)} ${currency.toUpperCase()} | ` +
        `${formatCryptoNumber(amount, 6)} = ${formatCryptoNumber(converted, 4)} ${currency.toUpperCase()}`;

      const trend = Number(change) >= 0 ? "↑" : "↓";
      cryptoMetaResult.textContent =
        `24h Change: ${trend} ${Math.abs(Number(change || 0)).toFixed(2)}% | ` +
        `Market Cap: ${formatCryptoNumber(marketCap, 0)} ${currency.toUpperCase()}`;

      const marketResponse = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=8&page=1&sparkline=false&price_change_percentage=24h",
      );
      if (!marketResponse.ok) throw new Error("Top market API unavailable");
      const marketPayload = await marketResponse.json();

      marketPayload.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "output-item";
        const sign = Number(item.price_change_percentage_24h) >= 0 ? "+" : "-";
        row.textContent =
          `${index + 1}. ${item.name} (${item.symbol.toUpperCase()}) | ` +
          `$${formatCryptoNumber(item.current_price, 4)} | ` +
          `${sign}${Math.abs(Number(item.price_change_percentage_24h || 0)).toFixed(2)}% 24h`;
        cryptoTopList.appendChild(row);
      });
    } catch (error) {
      cryptoPrimaryResult.textContent = `Crypto: ${error.message}`;
      cryptoMetaResult.textContent = "Try again after a few seconds.";
    }
  }

  cryptoRefreshBtn.addEventListener("click", refreshCryptoData);
  refreshCryptoData();
}

