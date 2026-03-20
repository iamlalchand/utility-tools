const fxAmountInput = document.getElementById("fxAmountInput");
const fxBaseCurrency = document.getElementById("fxBaseCurrency");
const fxTargetCurrency = document.getElementById("fxTargetCurrency");
const convertFxBtn = document.getElementById("convertFxBtn");
const swapFxBtn = document.getElementById("swapFxBtn");
const refreshFxBtn = document.getElementById("refreshFxBtn");
const fxResult = document.getElementById("fxResult");
const fxRateInfo = document.getElementById("fxRateInfo");
const fxTrendInfo = document.getElementById("fxTrendInfo");
const fxUpdatedAt = document.getElementById("fxUpdatedAt");

const createCurrencyConverterModule = window.UtilitySuiteModules?.createCurrencyConverterModule;

if (typeof createCurrencyConverterModule === "function") {
  const fxModule = createCurrencyConverterModule({
    amountInput: fxAmountInput,
    baseCurrency: fxBaseCurrency,
    targetCurrency: fxTargetCurrency,
    result: fxResult,
    rateInfo: fxRateInfo,
    trendInfo: fxTrendInfo,
    updatedAt: fxUpdatedAt,
  });

  if (convertFxBtn) convertFxBtn.addEventListener("click", () => fxModule.runFxConversion());
  if (refreshFxBtn) refreshFxBtn.addEventListener("click", () => fxModule.runFxConversion());
  if (fxBaseCurrency) fxBaseCurrency.addEventListener("change", () => fxModule.runFxConversion());
  if (fxTargetCurrency) fxTargetCurrency.addEventListener("change", () => fxModule.runFxConversion());
  if (fxAmountInput) fxAmountInput.addEventListener("input", () => fxModule.runFxConversion());

  if (swapFxBtn) {
    swapFxBtn.addEventListener("click", () => {
      if (!fxBaseCurrency || !fxTargetCurrency) return;
      const currentBase = fxBaseCurrency.value;
      fxBaseCurrency.value = fxTargetCurrency.value;
      fxTargetCurrency.value = currentBase;
      fxModule.runFxConversion();
    });
  }

  fxModule.init();
  setInterval(() => fxModule.runFxConversion(), 30000);
}
