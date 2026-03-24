function t(key, vars = {}) {
  const dict = translations[currentLanguage] || translations.en;
  const template = dict[key] || translations.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => `${vars[name] ?? ""}`);
}

function applyLanguage() {
  if (languageSelect) languageSelect.value = currentLanguage;
  if (heroTitle) heroTitle.textContent = t("heroTitle");
  if (heroSubtitle) heroSubtitle.textContent = t("heroSubtitle");
  if (themeLabel) themeLabel.textContent = t("themeLabel");
  if (languageLabel) languageLabel.textContent = t("languageLabel");
  if (worldClockSubTitle) worldClockSubTitle.textContent = t("worldClockSubTitle");
  if (globalClockTitle) globalClockTitle.textContent = t("globalClockTitle");
  if (globalClockHelp) globalClockHelp.textContent = t("globalClockHelp");
  if (timeCountryLabel) timeCountryLabel.textContent = t("timeCountryLabel");
  if (worldClockManageLabel) worldClockManageLabel.textContent = t("worldClockManageLabel");
  if (currencyTitle) currencyTitle.textContent = t("currencyTitle");
  if (dashboardSearchInput) dashboardSearchInput.placeholder = t("dashboardSearchPlaceholder");
  const countryStatusEl = document.getElementById("countrySupportStatus");
  if (countryStatusEl) countryStatusEl.textContent = t("countrySupportReady");
  const fxResultEl = document.getElementById("fxResult");
  if (fxResultEl && (!fxResultEl.textContent || fxResultEl.textContent.startsWith("FX:"))) {
    fxResultEl.textContent = t("fxReady");
  }
}

const toolMeta = {
  calculator: {
    title: "Calculator",
    description: "Perform quick arithmetic operations with clean inputs.",
  },
  converter: {
    title: "Unit Converter",
    description: "Convert distance values from kilometers to miles.",
  },
  age: {
    title: "Age Calculator",
    description: "Calculate precise age from date of birth.",
  },
  password: {
    title: "Password Generator",
    description: "Create secure random passwords with one click.",
  },
  notes: {
    title: "Quick Notes",
    description: "Save personal notes directly in your browser.",
  },
  contact: {
    title: "Contact Us",
    description: "Reach Utility Tools support via phone, email and social links.",
  },
  time: {
    title: "Global Clock",
    description: "Current time plus world clocks with country support.",
  },
  currency: {
    title: "Currency Converter",
    description: "Convert currencies with live rate and trend updates.",
  },
  qr: {
    title: "QR Code Generator",
    description: "Generate QR codes instantly for text and URLs.",
  },
  pdf: {
    title: "PDF Utility Hub",
    description: "Convert between text, images, Word and PDF formats.",
  },
  passpin: {
    title: "Pass / PIN Generator",
    description: "Generate strong passwords and quick secure PINs.",
  },
  case: {
    title: "Case Converter",
    description: "Convert text casing for writing and coding workflows.",
  },
  encode: {
    title: "Encoder / Decoder",
    description: "Encode and decode Base64 or URL values quickly.",
  },
  diff: {
    title: "Diff Checker",
    description: "Compare two text blocks and find changed lines.",
  },
  regex: {
    title: "Regex Tester",
    description: "Validate regex patterns and inspect matching results.",
  },
  cron: {
    title: "Cron Generator",
    description: "Create cron expressions for scheduled tasks.",
  },
  budget: {
    title: "Budget Box",
    description: "Manage income, expenses and remaining balance.",
  },
  split: {
    title: "Split Expense (Friends)",
    description: "Split shared expenses and calculate who pays whom.",
  },
  emi: {
    title: "EMI Calculator",
    description: "Calculate monthly EMI for loans and credit card plans.",
  },
  jsonfmt: {
    title: "JSON Formatter & Validator",
    description: "Validate, format and minify JSON data quickly.",
  },
  sqlfmt: {
    title: "SQL Formatter",
    description: "Beautify SQL queries with cleaner formatting.",
  },
  wallpaper: {
    title: "Wallpaper Gallery",
    description: "Browse category-based wallpapers and open/download quickly.",
  },
  speed: {
    title: "Speed Test",
    description: "Measure estimated download speed in real time.",
  },
  weather: {
    title: "Weather Anywhere Tool",
    description: "Check city weather, rain alerts and 7-day forecast.",
  },
  news: {
    title: "Latest News Feed",
    description: "Read latest country-wise headlines using free news APIs.",
  },
  crypto: {
    title: "Crypto Price Tracker",
    description: "Track crypto prices and convert with live market data.",
  },
  devhub: {
    title: "Developer Utility APIs",
    description: "Run IP lookup, DNS resolve and URL metadata checks.",
  },
  funapi: {
    title: "Fun API Hub",
    description: "Load random jokes, quotes and facts instantly.",
  },
  fileshare: {
    title: "File Share",
    description: "Generate file share code and receive files using that code.",
  },
  love: {
    title: "Love Compatibility",
    description: "Check fun compatibility score between two names.",
  },
  games: {
    title: "Games Zone",
    description: "Play full-board Tic Tac Toe, Ludo and Snake & Ladder games.",
  },
};

initializeFooterLinkBehavior();

function parseCssColor(value) {
  const raw = (value || "").trim().toLowerCase();
  if (!raw) return null;

  if (raw.startsWith("#")) {
    const hex = raw.slice(1);
    if (hex.length === 3) {
      const r = Number.parseInt(hex[0] + hex[0], 16);
      const g = Number.parseInt(hex[1] + hex[1], 16);
      const b = Number.parseInt(hex[2] + hex[2], 16);
      return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : { r, g, b };
    }

    if (hex.length === 6) {
      const r = Number.parseInt(hex.slice(0, 2), 16);
      const g = Number.parseInt(hex.slice(2, 4), 16);
      const b = Number.parseInt(hex.slice(4, 6), 16);
      return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : { r, g, b };
    }

    return null;
  }

  const rgbMatch = raw.match(/^rgba?\(([^)]+)\)$/);
  if (!rgbMatch) return null;
  const channels = rgbMatch[1].split(",").map((part) => Number.parseFloat(part.trim()));
  if (channels.length < 3 || channels.slice(0, 3).some((channel) => Number.isNaN(channel))) return null;
  return {
    r: Math.max(0, Math.min(255, channels[0])),
    g: Math.max(0, Math.min(255, channels[1])),
    b: Math.max(0, Math.min(255, channels[2])),
  };
}

function toRelativeLuminanceChannel(channel) {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(rgb) {
  const r = toRelativeLuminanceChannel(rgb.r);
  const g = toRelativeLuminanceChannel(rgb.g);
  const b = toRelativeLuminanceChannel(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(foreground, background) {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function averageColor(a, b) {
  return {
    r: Math.round((a.r + b.r) / 2),
    g: Math.round((a.g + b.g) / 2),
    b: Math.round((a.b + b.b) / 2),
  };
}

function pickReadableTextColor(startColor, endColor) {
  const bright = { value: "#ffffff", rgb: { r: 255, g: 255, b: 255 } };
  const dark = { value: "#11131a", rgb: { r: 17, g: 19, b: 26 } };
  const midpoint = averageColor(startColor, endColor);

  const scoreCandidate = (candidate) => {
    const startContrast = getContrastRatio(candidate.rgb, startColor);
    const endContrast = getContrastRatio(candidate.rgb, endColor);
    const midContrast = getContrastRatio(candidate.rgb, midpoint);
    return Math.min(startContrast, endContrast, midContrast);
  };

  return scoreCandidate(bright) >= scoreCandidate(dark) ? bright.value : dark.value;
}

function updateThemeContrastVars() {
  const styles = getComputedStyle(document.body);
  const primary = parseCssColor(styles.getPropertyValue("--primary"));
  if (!primary) return;
  const gradientEnd = parseCssColor(styles.getPropertyValue("--primary-gradient-end")) || primary;
  const readable = pickReadableTextColor(primary, gradientEnd);
  document.body.style.setProperty("--on-primary", readable);
}

function applyTheme(theme) {
  const selectedTheme = allowedThemes.has(theme) ? theme : "default";
  document.body.dataset.theme = selectedTheme;
  themeSelect.value = selectedTheme;
  updateThemeContrastVars();
}

const savedTheme = localStorage.getItem(themeStorageKey);
applyTheme(savedTheme || "default");
applyLanguage();

themeSelect.addEventListener("change", () => {
  const nextTheme = themeSelect.value;
  applyTheme(nextTheme);
  localStorage.setItem(themeStorageKey, nextTheme);
});

if (languageSelect) {
  languageSelect.addEventListener("change", () => {
    currentLanguage = "en";
    languageSelect.value = "en";
    localStorage.setItem(languageStorageKey, currentLanguage);
    applyLanguage();
    if (timeCountrySelect) {
      const selectedValue = timeCountrySelect.value || selectedTimeCountryKey;
      fillCountrySelect(timeCountrySelect);
      timeCountrySelect.value = selectedValue;
    }
    if (countryClockSelect) {
      const selectedValue = countryClockSelect.value || "";
      fillCountrySelect(countryClockSelect);
      countryClockSelect.value = selectedValue;
    }
    if (fxBaseCurrency && fxTargetCurrency && fxCurrencies.length) {
      fxCurrencies = fxCurrencies.map((item) => ({ code: item.code, name: getCurrencyDisplayName(item.code) }));
      populateFxCurrencyOptions();
    }
    applyDashboardSearch(dashboardSearchInput?.value || "");
    updateClock();
    renderCountryInfo(countryClockSelect?.value || "");
    renderWorldClocks();
    runFxConversion();
  });
}

function setActiveNav(toolKey) {
  navButtons.forEach((btn) => btn.classList.remove("active"));
  if (!toolKey) {
    homeNavBtn.classList.add("active");
    return;
  }

  const matchingBtn = Array.from(sideToolButtons).find((btn) => btn.dataset.navTool === toolKey);
  if (matchingBtn) matchingBtn.classList.add("active");
}

function openTool(toolKey, { updateHash = true } = {}) {
  if (toolKey === "worldclock") toolKey = "time";
  const meta = toolMeta[toolKey];
  if (!meta) return;

  catalogView.classList.add("hidden");
  toolWorkspace.classList.remove("hidden");
  document.body.classList.add("tool-open");
  workspaceTitle.textContent = meta.title;
  workspaceDescription.textContent = meta.description;

  toolPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.toolPanel === toolKey);
  });

  setActiveNav(toolKey);
  if (updateHash) window.location.hash = `#tool/${toolKey}`;
}

function showCatalog({ updateHash = true } = {}) {
  toolWorkspace.classList.add("hidden");
  catalogView.classList.remove("hidden");
  document.body.classList.remove("tool-open");
  toolPanels.forEach((panel) => panel.classList.remove("active"));
  setActiveNav(null);
  if (updateHash) window.location.hash = HOME_HASH;
}

document.querySelectorAll("[data-open-tool]").forEach((card) => {
  card.addEventListener("click", () => {
    openTool(card.dataset.openTool);
  });
});

function goBackInApp() {
  if (window.location.hash.startsWith("#tool/")) {
    showCatalog();
    return;
  }
  showCatalog({ updateHash: false });
}

backToCatalogBtn.addEventListener("click", () => showCatalog());
homeNavBtn.addEventListener("click", () => showCatalog());
topHomeBtn.addEventListener("click", () => showCatalog());
historyBackBtn.addEventListener("click", goBackInApp);
topBackBtn.addEventListener("click", goBackInApp);

sideToolButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    openTool(btn.dataset.navTool);
  });
});

function applyDashboardSearch(rawQuery = "") {
  const query = rawQuery.trim().toLowerCase();
  let visibleCount = 0;

  dashboardToolCards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent || "";
    const description = card.querySelector("p:not(.tool-icon)")?.textContent || "";
    const searchable = `${title} ${description}`.toLowerCase();
    const matches = !query || searchable.includes(query);
    card.classList.toggle("is-hidden", !matches);
    if (matches) visibleCount += 1;
  });

  if (!dashboardSearchMeta) return;
  if (!query) {
    dashboardSearchMeta.textContent = t("searchAll", { count: dashboardToolCards.length });
    return;
  }

  dashboardSearchMeta.textContent = visibleCount
    ? t("searchFound", { count: visibleCount })
    : t("searchNone");
}

if (dashboardSearchInput) {
  dashboardSearchInput.addEventListener("input", (event) => {
    applyDashboardSearch(event.target.value);
  });
}
applyDashboardSearch();

function syncFromHash() {
  const hash = window.location.hash || HOME_HASH;
  if (hash === HOME_HASH || hash === "#" || hash === "") {
    showCatalog({ updateHash: false });
    return;
  }

  if (hash.startsWith("#tool/")) {
    const toolKey = hash.replace("#tool/", "");
    if (toolMeta[toolKey]) {
      openTool(toolKey, { updateHash: false });
      return;
    }
  }

  showCatalog({ updateHash: false });
}

window.addEventListener("hashchange", syncFromHash);
if (!window.location.hash) {
  window.location.hash = HOME_HASH;
}
syncFromHash();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !toolWorkspace.classList.contains("hidden")) {
    showCatalog();
  }
});
