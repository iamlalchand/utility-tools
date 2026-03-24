(function bootstrapUtilitySuiteScripts() {
  if (window.__utilitySuiteBootstrapLoaded) return;
  window.__utilitySuiteBootstrapLoaded = true;

  const scriptOrder = [
    "scripts/00-core-dom-and-links.js",
    "scripts/00-core-footer-docs.js",
    "scripts/00-core-app-shell.js",
    "scripts/01-calculator.js",
    "scripts/02-unit-converter.js",
    "scripts/03-age-calculator.js",
    "scripts/04-password-generator.js",
    "scripts/05-quick-notes.js",
    "scripts/06-global-clock-basic.js",
    "scripts/07-qr-generator.js",
    "scripts/08-file-share.js",
    "scripts/09-wallpaper-gallery.js",
    "scripts/10-pdf-utility-hub.js",
    "scripts/11-pass-pin-generator.js",
    "scripts/12-case-converter.js",
    "scripts/13-encoder-decoder.js",
    "scripts/14-diff-checker.js",
    "scripts/15-regex-tester.js",
    "scripts/16-cron-generator.js",
    "scripts/17-world-clock.js",
    "scripts/18-currency-converter.js",
    "scripts/19-budget-box.js",
    "scripts/20-split-expense.js",
    "scripts/21-emi-calculator.js",
    "scripts/22-json-formatter.js",
    "scripts/23-sql-formatter.js",
    "scripts/24-speed-test.js",
    "scripts/25-weather-anywhere.js",
    "scripts/26-news-feed.js",
    "scripts/27-crypto-tracker.js",
    "scripts/28-developer-apis.js",
    "scripts/29-fun-api-hub.js",
    "scripts/30-tic-tac-toe.js",
    "scripts/31-ludo.js",
    "scripts/32-snake-ladder.js",
  ];

  function markScriptLoaded(script) {
    script.dataset.utilityLoaded = "true";
  }

  function isAlreadyLoaded(path) {
    const selector = `script[src=\"${path}\"]`;
    const existing = document.querySelector(selector);
    return Boolean(existing && existing.dataset.utilityLoaded === "true");
  }

  function loadOne(path) {
    return new Promise((resolve, reject) => {
      if (isAlreadyLoaded(path)) {
        resolve();
        return;
      }

      const existing = document.querySelector(`script[src=\"${path}\"]`);
      if (existing) {
        if (existing.dataset.utilityLoaded === "true") {
          resolve();
          return;
        }
        existing.addEventListener(
          "load",
          () => {
            markScriptLoaded(existing);
            resolve();
          },
          { once: true },
        );
        existing.addEventListener(
          "error",
          () => reject(new Error(`Failed to load script: ${path}`)),
          { once: true },
        );
        return;
      }

      const script = document.createElement("script");
      script.src = path;
      script.async = false;
      script.defer = false;
      script.addEventListener(
        "load",
        () => {
          markScriptLoaded(script);
          resolve();
        },
        { once: true },
      );
      script.addEventListener(
        "error",
        () => reject(new Error(`Failed to load script: ${path}`)),
        { once: true },
      );

      (document.body || document.head || document.documentElement).appendChild(script);
    });
  }

  async function loadAllInOrder() {
    for (const path of scriptOrder) {
      // Keep deterministic order because each file may register listeners/state.
      // eslint-disable-next-line no-await-in-loop
      await loadOne(path);
    }
  }

  loadAllInOrder().catch((error) => {
    console.error("Utility Tools bootstrap failed", error);
  });
})();
