(function registerCurrencyConverterModule(global) {
  const modules = (global.UtilitySuiteModules = global.UtilitySuiteModules || {});

  modules.createCurrencyConverterModule = function createCurrencyConverterModule(elements) {
    const {
      amountInput,
      baseCurrency,
      targetCurrency,
      result,
      rateInfo,
      trendInfo,
      updatedAt,
    } = elements;

    const fxStorageKey = "ssFxSettings";
    const fxCurrencyListEndpoints = [
      "https://api.exchangerate-api.com/v4/latest/USD",
      "https://open.er-api.com/v6/latest/USD",
    ];
    const fxRateProviders = [
      {
        name: "ExchangeRate-API",
        buildUrl: (base) => `https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(base)}`,
        parse: (data, target) => {
          const rate = Number(data?.rates?.[target]);
          const updatedUnix = Number(data?.time_last_updated);
          return {
            rate,
            updatedAtMs: Number.isFinite(updatedUnix) ? updatedUnix * 1000 : null,
          };
        },
      },
      {
        name: "Frankfurter",
        buildUrl: (base, target) =>
          `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}&to=${encodeURIComponent(target)}`,
        parse: (data, target) => {
          const rate = Number(data?.rates?.[target]);
          const dateStr = typeof data?.date === "string" ? data.date : "";
          const updatedAtMs = dateStr ? Number(new Date(`${dateStr}T16:00:00Z`)) : null;
          return {
            rate,
            updatedAtMs: Number.isFinite(updatedAtMs) ? updatedAtMs : null,
          };
        },
      },
      {
        name: "ER-API",
        buildUrl: (base) => `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`,
        parse: (data, target) => {
          const rate = Number(data?.rates?.[target]);
          const updatedUnix = Number(data?.time_last_update_unix);
          return {
            rate,
            updatedAtMs: Number.isFinite(updatedUnix) ? updatedUnix * 1000 : null,
          };
        },
      },
    ];

    let fxCurrencies = [
      { code: "USD", name: "US Dollar" },
      { code: "INR", name: "Indian Rupee" },
      { code: "EUR", name: "Euro" },
      { code: "GBP", name: "British Pound" },
      { code: "AED", name: "UAE Dirham" },
      { code: "KWD", name: "Kuwaiti Dinar" },
      { code: "JPY", name: "Japanese Yen" },
      { code: "AUD", name: "Australian Dollar" },
      { code: "CAD", name: "Canadian Dollar" },
      { code: "SGD", name: "Singapore Dollar" },
      { code: "CNY", name: "Chinese Yuan" },
    ];

    const fxPreviousRateByPair = new Map();

    function translate(key, params) {
      if (typeof t === "function") return t(key, params);
      return key;
    }

    function getCurrencyDisplayName(code) {
      if (!code) return "";
      const codeUpper = code.toUpperCase();
      try {
        if (typeof Intl !== "undefined" && Intl.DisplayNames) {
          const localeCode = typeof currentLanguage !== "undefined" && currentLanguage === "hi" ? "hi" : "en";
          const display = new Intl.DisplayNames([localeCode], { type: "currency" }).of(codeUpper);
          if (display && display !== codeUpper) return display;
        }
      } catch {
        // Use code-only fallback.
      }
      return codeUpper;
    }

    function formatFxNumber(value, digits) {
      const inputDigits = Number.isFinite(digits) ? digits : 6;
      const safeDigits = Math.min(Math.max(inputDigits, 2), 8);
      return Number(value).toLocaleString("en-US", { maximumFractionDigits: safeDigits });
    }

    async function fetchJsonNoCache(url) {
      const noCacheUrl = `${url}${url.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
      const response = await fetch(noCacheUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("fx-http-error");
      return response.json();
    }

    function populateFxCurrencyOptions() {
      if (!baseCurrency || !targetCurrency) return;
      const selectedBase = baseCurrency.value || "USD";
      const selectedTarget = targetCurrency.value || "INR";

      const optionMarkup = fxCurrencies
        .map((item) => `<option value="${item.code}">${item.code} - ${item.name || getCurrencyDisplayName(item.code)}</option>`)
        .join("");

      baseCurrency.innerHTML = optionMarkup;
      targetCurrency.innerHTML = optionMarkup;

      const hasCode = (selectEl, code) => Array.from(selectEl.options).some((option) => option.value === code);
      baseCurrency.value = hasCode(baseCurrency, selectedBase) ? selectedBase : "USD";
      targetCurrency.value = hasCode(targetCurrency, selectedTarget) ? selectedTarget : "INR";
    }

    function loadFxSettings() {
      if (!baseCurrency || !targetCurrency || !amountInput) return;
      const raw = localStorage.getItem(fxStorageKey);
      const hasCurrencyOption = (selectEl, code) => Array.from(selectEl.options).some((option) => option.value === code);

      if (!raw) {
        baseCurrency.value = "USD";
        targetCurrency.value = "INR";
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        if (parsed.base && hasCurrencyOption(baseCurrency, parsed.base)) baseCurrency.value = parsed.base;
        if (parsed.target && hasCurrencyOption(targetCurrency, parsed.target)) targetCurrency.value = parsed.target;
        if (parsed.amount !== undefined) amountInput.value = parsed.amount;
      } catch {
        baseCurrency.value = "USD";
        targetCurrency.value = "INR";
      }
    }

    function saveFxSettings() {
      if (!baseCurrency || !targetCurrency || !amountInput) return;
      localStorage.setItem(
        fxStorageKey,
        JSON.stringify({
          base: baseCurrency.value,
          target: targetCurrency.value,
          amount: amountInput.value,
        }),
      );
    }

    async function fetchLiveFxRate(base, target) {
      for (const provider of fxRateProviders) {
        try {
          const payload = await fetchJsonNoCache(provider.buildUrl(base, target));
          const parsed = provider.parse(payload, target);
          if (!Number.isFinite(parsed.rate) || parsed.rate <= 0) continue;

          const resultData = {
            rate: parsed.rate,
            updatedAtMs: Number.isFinite(parsed.updatedAtMs) ? parsed.updatedAtMs : null,
            provider: provider.name,
          };

          const displayTime = Number.isFinite(resultData.updatedAtMs)
            ? new Date(resultData.updatedAtMs).toLocaleString()
            : new Date().toLocaleString();

          return {
            rate: resultData.rate,
            updatedAt: displayTime,
            provider: resultData.provider,
          };
        } catch {
          // Try next provider.
        }
      }

      throw new Error(translate("fxApiUnavailable"));
    }

    function updateFxTrend(pairKey, newRate) {
      if (!trendInfo) return;
      const previousRate = fxPreviousRateByPair.get(pairKey);
      fxPreviousRateByPair.set(pairKey, newRate);

      if (previousRate === undefined) {
        trendInfo.textContent = translate("fxFirstSample");
        return;
      }

      if (newRate > previousRate) {
        const pct = ((newRate - previousRate) / previousRate) * 100;
        trendInfo.textContent = translate("fxIncreased", { pct: pct.toFixed(4) });
        return;
      }

      if (newRate < previousRate) {
        const pct = ((previousRate - newRate) / previousRate) * 100;
        trendInfo.textContent = translate("fxDecreased", { pct: pct.toFixed(4) });
        return;
      }

      trendInfo.textContent = translate("fxNoChange");
    }

    async function loadFxCurrencyList() {
      for (const endpoint of fxCurrencyListEndpoints) {
        try {
          const data = await fetchJsonNoCache(endpoint);
          const rateCodes = Object.keys(data?.rates || {});
          const mergedCodes = new Set([
            ...fxCurrencies.map((item) => item.code),
            ...(data?.base_code ? [data.base_code] : []),
            ...(data?.base ? [data.base] : []),
            ...rateCodes,
            "KWD",
          ]);

          fxCurrencies = Array.from(mergedCodes)
            .sort((a, b) => a.localeCompare(b))
            .map((code) => ({ code, name: getCurrencyDisplayName(code) }));
          return;
        } catch {
          // Try next endpoint.
        }
      }
      // Keep fallback list when all APIs fail.
    }

    async function runFxConversion() {
      if (!(amountInput && baseCurrency && targetCurrency && result && rateInfo && trendInfo && updatedAt)) return;

      try {
        const amount = Number(amountInput.value);
        const base = baseCurrency.value;
        const target = targetCurrency.value;

        if (Number.isNaN(amount) || amount < 0) {
          result.textContent = translate("fxEnterAmount");
          return;
        }

        if (base === target) {
          result.textContent = translate("fxResult", {
            amount: formatFxNumber(amount),
            base,
            converted: formatFxNumber(amount),
            target,
          });
          rateInfo.textContent = translate("fxLiveRate", { base, rate: "1", target });
          trendInfo.textContent = translate("fxSamePair");
          updatedAt.textContent = translate("fxUpdated", { value: new Date().toLocaleString() });
          saveFxSettings();
          return;
        }

        const pairKey = `${base}-${target}`;
        const live = await fetchLiveFxRate(base, target);
        const converted = amount * live.rate;

        result.textContent = translate("fxResult", {
          amount: formatFxNumber(amount),
          base,
          converted: formatFxNumber(converted, 4),
          target,
        });
        rateInfo.textContent = translate("fxLiveRate", { base, rate: formatFxNumber(live.rate, 6), target });
        updatedAt.textContent = translate("fxUpdated", { value: `${live.updatedAt} (${live.provider})` });
        updateFxTrend(pairKey, live.rate);
        saveFxSettings();
      } catch (error) {
        result.textContent = (error && error.message) || translate("fxApiUnavailable");
      }
    }

    async function init() {
      if (!(baseCurrency && targetCurrency)) return;
      await loadFxCurrencyList();
      populateFxCurrencyOptions();
      loadFxSettings();

      if (result && (!result.textContent || result.textContent === "FX: Ready")) {
        result.textContent = translate("fxReady");
      }

      await runFxConversion();
    }

    return {
      init,
      runFxConversion,
    };
  };
})(window);
