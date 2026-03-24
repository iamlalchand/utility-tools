const themeSelect = document.getElementById("themeSelect");
const themeStorageKey = "ssUtilityTheme";
const allowedThemes = new Set(["default", "midnight", "emerald", "sunset", "ocean", "graphite", "rose", "amber"]);
const catalogView = document.getElementById("catalogView");
const toolWorkspace = document.getElementById("toolWorkspace");
const workspaceTitle = document.getElementById("workspaceTitle");
const workspaceDescription = document.getElementById("workspaceDescription");
const backToCatalogBtn = document.getElementById("backToCatalogBtn");
const homeNavBtn = document.getElementById("homeNavBtn");
const historyBackBtn = document.getElementById("historyBackBtn");
const topBackBtn = document.getElementById("topBackBtn");
const topHomeBtn = document.getElementById("topHomeBtn");
const languageSelect = document.getElementById("languageSelect");
const sideToolButtons = document.querySelectorAll("[data-nav-tool]");
const navButtons = document.querySelectorAll(".nav-btn");
const toolPanels = document.querySelectorAll("[data-tool-panel]");
const dashboardSearchInput = document.getElementById("dashboardSearchInput");
const dashboardSearchMeta = document.getElementById("dashboardSearchMeta");
const dashboardToolCards = Array.from(document.querySelectorAll(".tool-card"));
dashboardToolCards.forEach((card, index) => {
  const delay = Math.min(index * 0.035, 0.7);
  card.style.setProperty("--card-enter-delay", `${delay.toFixed(3)}s`);
});
const heroTitle = document.getElementById("heroTitle");
const heroSubtitle = document.getElementById("heroSubtitle");
const themeLabel = document.getElementById("themeLabel");
const languageLabel = document.getElementById("languageLabel");
const worldClockSubTitle = document.getElementById("worldClockSubTitle");
const globalClockTitle = document.getElementById("globalClockTitle");
const currencyTitle = document.getElementById("currencyTitle");
const globalClockHelp = document.getElementById("globalClockHelp");
const timeCountryLabel = document.getElementById("timeCountryLabel");
const worldClockManageLabel = document.getElementById("worldClockManageLabel");
const HOME_HASH = "#home";
const languageStorageKey = "ssLanguage";
const footerYear = document.getElementById("footerYear");
const footerToolLinks = Array.from(document.querySelectorAll("[data-footer-tool]"));
const footerActionLinks = Array.from(document.querySelectorAll("[data-footer-action]"));
const translations = {
  en: {
    heroTitle: "Choose a Utility Tool",
    heroSubtitle: "Component-wise workspace: click a tool card and open only that tool with full functionality.",
    themeLabel: "Theme",
    languageLabel: "Language",
    worldClockSubTitle: "World Clocks",
    globalClockTitle: "Global Clock",
    globalClockHelp: "Step 1: Select a country to view its current time. Step 2: Add countries below to track multiple clocks.",
    timeCountryLabel: "Check Time In Country",
    worldClockManageLabel: "Manage Countries In World Clock List",
    currencyTitle: "Currency Converter (Live)",
    dashboardSearchPlaceholder: "Search tools ....",
    searchAll: "Showing all tools ({count})",
    searchFound: "Found {count} matching tool(s)",
    searchNone: "No tools match your search",
    selectedCountryPrefix: "Selected Country Time",
    selectedCountryPrompt: "Selected Country Time: Select country first",
    countrySelectOption: "Select country",
    countrySupportReady: "Country support: Ready",
    countrySelectFirst: "Country support: Select country first",
    countryAlreadyAdded: "Country support: Already added",
    countryAdded: "Country support: Country clock added",
    countryRemoved: "Country support: Country clock removed",
    countryReset: "Country support: Reset to default countries",
    countryInfoEmpty: "Select a country to view details.",
    countryCapitalLabel: "Capital",
    countryCurrencyLabel: "Currency",
    countryDialLabel: "Dial",
    countryTimezoneLabel: "Timezone",
    worldClockEmpty: "No countries in world clock list. Add one from dropdown.",
    removeBtn: "Remove",
    fxReady: "FX: Ready",
    fxEnterAmount: "FX: Enter a valid amount",
    fxSamePair: "Trend: Same currency pair",
    fxFirstSample: "Trend: First live sample captured",
    fxNoChange: "Trend: No change since last refresh",
    fxIncreased: "Trend: ↑ Increased by {pct}%",
    fxDecreased: "Trend: ↓ Decreased by {pct}%",
    fxUpdated: "Last Updated: {value}",
    fxLiveRate: "Live Rate: 1 {base} = {rate} {target}",
    fxResult: "FX: {amount} {base} = {converted} {target}",
    fxApiUnavailable: "Live FX API unavailable",
    fxRateMissing: "Requested currency rate not available",
  },
  hi: {
    heroTitle: "Utility Tool चुनें",
    heroSubtitle: "Component-wise workspace: card par click karo aur sirf wahi tool kholkar use karo.",
    themeLabel: "Theme",
    languageLabel: "भाषा",
    worldClockSubTitle: "World Clocks",
    globalClockTitle: "Global Clock",
    globalClockHelp: "Step 1: Country select karke uska current time dekhein. Step 2: Neeche country add karke multiple clocks track karein.",
    timeCountryLabel: "Country ka time check karein",
    worldClockManageLabel: "World Clock list mein countries manage karein",
    currencyTitle: "Currency Converter (Live)",
    dashboardSearchPlaceholder: "Search tools ....",
    searchAll: "Sabhi tools dikh rahe hain ({count})",
    searchFound: "{count} matching tool(s) mile",
    searchNone: "Search se koi tool match nahi hua",
    selectedCountryPrefix: "Selected Country Time",
    selectedCountryPrompt: "Selected Country Time: Pehle country select karein",
    countrySelectOption: "Country select karein",
    countrySupportReady: "Country support: Ready",
    countrySelectFirst: "Country support: Pehle country select karein",
    countryAlreadyAdded: "Country support: Ye country already added hai",
    countryAdded: "Country support: Country clock add ho gaya",
    countryRemoved: "Country support: Country clock remove ho gaya",
    countryReset: "Country support: Default countries reset ho gaye",
    countryInfoEmpty: "Details dekhne ke liye country select karein.",
    countryCapitalLabel: "Capital",
    countryCurrencyLabel: "Currency",
    countryDialLabel: "Dial",
    countryTimezoneLabel: "Timezone",
    worldClockEmpty: "World clock list khali hai. Dropdown se country add karein.",
    removeBtn: "Remove",
    fxReady: "FX: Ready",
    fxEnterAmount: "FX: Valid amount enter karein",
    fxSamePair: "Trend: Same currency pair",
    fxFirstSample: "Trend: First live sample captured",
    fxNoChange: "Trend: Last refresh se koi badlav nahi",
    fxIncreased: "Trend: ↑ {pct}% se badha",
    fxDecreased: "Trend: ↓ {pct}% se ghata",
    fxUpdated: "Last Updated: {value}",
    fxLiveRate: "Live Rate: 1 {base} = {rate} {target}",
    fxResult: "FX: {amount} {base} = {converted} {target}",
    fxApiUnavailable: "Live FX API unavailable",
    fxRateMissing: "Requested currency rate available nahi hai",
  },
};
let currentLanguage = "en";
localStorage.setItem(languageStorageKey, currentLanguage);

// Update these values when you share final social/contact links.
const ssSocialLinks = {
  x: "#",
  facebook: "#",
  instagram: "#",
  linkedin: "https://www.linkedin.com/in/lalchand-prajapat/",
  youtube: "#",
  github: "#",
};

const ssContactInfo = {
  email: "support@ssutilitysuite.com",
  phone_india: "+91 78918 67859",
  phone_global: "+91 7891867859",
  whatsapp: "+91 78918 67859",
  website: "https://ssutilitysuite.com",
  address_india: "Jaipur, Rajasthan, India",
  address_global: "Wilmington, DE, USA",
  business_hours: "Mon-Sat, 10:00 AM - 7:00 PM IST",
  response_time: "Within 24 working hours",
};

function withProtocol(urlText) {
  const value = `${urlText || ""}`.trim();
  if (!value || value === "#") return "#";
  if (/^https?:\/\//i.test(value) || /^(mailto|tel):/i.test(value)) return value;
  return `https://${value}`;
}

function toTelHref(phoneText) {
  const value = `${phoneText || ""}`.trim();
  const normalized = value.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : "#";
}

function applyContactAndSocialLinks() {
  document.querySelectorAll("[data-social-link]").forEach((anchor) => {
    const key = anchor.dataset.socialLink;
    const link = withProtocol(ssSocialLinks[key] || "#");
    anchor.href = link;
    if (link !== "#") {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    } else {
      anchor.removeAttribute("target");
      anchor.removeAttribute("rel");
    }
  });

  document.querySelectorAll("[data-contact-text]").forEach((node) => {
    const key = node.dataset.contactText;
    if (!key) return;
    node.textContent = ssContactInfo[key] || "-";
  });

  document.querySelectorAll("[data-contact-href]").forEach((anchor) => {
    const key = anchor.dataset.contactHref;
    const value = ssContactInfo[key] || "";
    let href = "#";

    if (key === "email") href = value ? `mailto:${value}` : "#";
    else if (key === "website") href = withProtocol(value);
    else if (key?.startsWith("phone") || key === "whatsapp") href = toTelHref(value);
    else href = withProtocol(value);

    anchor.href = href;
    if (key === "website" && href !== "#") {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    } else {
      anchor.removeAttribute("target");
      anchor.removeAttribute("rel");
    }
  });
}

if (footerYear) footerYear.textContent = String(new Date().getFullYear());
applyContactAndSocialLinks();

function buildToolHashUrl(toolKey) {
  const url = new URL(window.location.href);
  url.hash = `#tool/${encodeURIComponent(toolKey)}`;
  return url.toString();
}

function escapeHtml(rawValue) {
  return `${rawValue ?? ""}`
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getToolDirectoryData() {
  return dashboardToolCards
    .map((card) => {
      const key = card.dataset.openTool || "";
      const title = card.querySelector("h3")?.textContent?.trim() || toolMeta[key]?.title || key;
      const description = card.querySelector("p:not(.tool-icon)")?.textContent?.trim() || toolMeta[key]?.description || "";
      if (!key || !title) return null;
      return { key, title, description };
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));
}

function inferToolCategory(tool) {
  const text = `${tool.key} ${tool.title} ${tool.description}`.toLowerCase();
  if (/(calc|emi|budget|split|pin|pass|crypto)/.test(text)) return "Finance & Calculation";
  if (/(json|sql|regex|cron|encode|decode|case|dev|api|diff)/.test(text)) return "Developer Utilities";
  if (/(note|contact|time|clock|weather|news|qr|pdf|file|share)/.test(text)) return "Productivity";
  if (/(game|love|fun|wallpaper)/.test(text)) return "Fun & Lifestyle";
  return "General";
}

function summarizeToolCategories(tools) {
  const bucket = new Map();
  tools.forEach((tool) => {
    const category = inferToolCategory(tool);
    bucket.set(category, (bucket.get(category) || 0) + 1);
  });
  return Array.from(bucket.entries()).sort((a, b) => b[1] - a[1]);
}

function renderCategoryBadges(summary) {
  return summary
    .map(([name, count]) => `<span class="chip">${escapeHtml(name)} <strong>${count}</strong></span>`)
    .join("");
}

function renderToolDirectory(tools) {
  return tools
    .map((tool) => {
      const link = buildToolHashUrl(tool.key);
      return `
        <article class="tool-row">
          <div>
            <h3>${escapeHtml(tool.title)}</h3>
            <p>${escapeHtml(tool.description)}</p>
          </div>
          <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Open</a>
        </article>
      `;
    })
    .join("");
}

function renderFooterDocShell({ title, subtitle, body }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | Utility Tools</title>
  <style>
    :root {
      --bg: #f8f5f2;
      --card: #ffffff;
      --text: #2f2932;
      --muted: #6f6574;
      --border: #e6d8d2;
      --primary: #d04d30;
      --primary2: #f17855;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Plus Jakarta Sans", "Segoe UI", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 86% 4%, rgba(208, 77, 48, 0.08), transparent 35%),
        radial-gradient(circle at 8% 0%, rgba(241, 120, 85, 0.08), transparent 28%),
        var(--bg);
    }
    .wrap {
      width: min(1100px, 92vw);
      margin: 34px auto 42px;
    }
    .hero {
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 22px;
      background: linear-gradient(155deg, #fffdfc, #fff8f5);
      box-shadow: 0 18px 32px rgba(80, 40, 35, 0.08);
    }
    .kicker {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 6px 11px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--primary);
      background: #fff;
    }
    .kicker::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: linear-gradient(135deg, var(--primary), var(--primary2));
    }
    h1 {
      margin: 14px 0 8px;
      font-size: clamp(1.55rem, 3.2vw, 2.25rem);
      line-height: 1.2;
    }
    .subtitle {
      margin: 0;
      color: var(--muted);
      font-size: 1.02rem;
      line-height: 1.55;
    }
    .meta {
      margin-top: 10px;
      color: var(--muted);
      font-size: 0.9rem;
    }
    .section {
      margin-top: 18px;
      border: 1px solid var(--border);
      border-radius: 18px;
      background: var(--card);
      padding: 18px;
    }
    .section h2 {
      margin: 0 0 10px;
      font-size: 1.08rem;
    }
    .grid {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    }
    .stat {
      border: 1px solid var(--border);
      border-radius: 14px;
      background: #fff;
      padding: 12px;
    }
    .stat p { margin: 0; color: var(--muted); font-size: 0.88rem; }
    .stat strong { display: block; margin-top: 4px; font-size: 1.4rem; color: var(--primary); }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }
    .chip {
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 8px 12px;
      background: #fff9f6;
      font-size: 0.86rem;
      color: var(--text);
    }
    .chip strong { color: var(--primary); margin-left: 4px; }
    .tool-list {
      display: grid;
      gap: 10px;
    }
    .tool-row {
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
      background: #fff;
    }
    .tool-row h3 {
      margin: 0;
      font-size: 1rem;
    }
    .tool-row p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.5;
      max-width: 760px;
    }
    .tool-row a {
      text-decoration: none;
      color: #fff;
      background: linear-gradient(135deg, var(--primary), var(--primary2));
      padding: 8px 12px;
      border-radius: 10px;
      font-weight: 700;
      border: 1px solid color-mix(in srgb, var(--primary) 65%, #0000);
      white-space: nowrap;
    }
    ul {
      margin: 0;
      padding-left: 18px;
      color: var(--muted);
      line-height: 1.6;
    }
    a.inline {
      color: var(--primary);
      text-decoration: none;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <span class="kicker">Utility Tools</span>
      <h1>${escapeHtml(title)}</h1>
      <p class="subtitle">${escapeHtml(subtitle)}</p>
      <p class="meta">Auto-generated from current app data. Opened: ${escapeHtml(new Date().toLocaleString())}</p>
    </section>
    ${body}
  </main>
</body>
</html>`;
}

function openFooterGeneratedPage(payload) {
  const newTab = window.open("about:blank", "_blank", "noopener,noreferrer");
  if (!newTab) return;
  const html = renderFooterDocShell(payload);
  newTab.document.open();
  newTab.document.write(html);
  newTab.document.close();
}

function openFooterActionPage(action) {
  const tools = getToolDirectoryData();
  const categorySummary = summarizeToolCategories(tools);
  const toolsOpenLink = buildToolHashUrl("contact");
  const totalTools = tools.length;

  if (action === "about") {
    const body = `
      <section class="section">
        <h2>Application Overview</h2>
        <p class="subtitle">Utility Tools is a multi-tool web workspace for daily tasks. Each tool opens in a dedicated panel, with search, themes, and a single dashboard to keep workflows fast and simple.</p>
      </section>
      <section class="section">
        <h2>Current Snapshot</h2>
        <div class="grid">
          <article class="stat"><p>Total Utilities</p><strong>${totalTools}</strong></article>
          <article class="stat"><p>Available Themes</p><strong>${allowedThemes.size}</strong></article>
          <article class="stat"><p>Primary Entry Mode</p><strong>Dashboard + Tool Panels</strong></article>
        </div>
      </section>
      <section class="section">
        <h2>Utility Categories</h2>
        <div class="chips">${renderCategoryBadges(categorySummary)}</div>
      </section>
      <section class="section">
        <h2>Tool Directory (Live)</h2>
        <div class="tool-list">${renderToolDirectory(tools)}</div>
      </section>
    `;
    openFooterGeneratedPage({
      title: "About Application",
      subtitle: "Full overview of what this app does and what utilities are currently available.",
      body,
    });
    return;
  }

  if (action === "updates") {
    const body = `
      <section class="section">
        <h2>How This Stays Updated</h2>
        <ul>
          <li>This page reads utility data directly from the current dashboard cards and tool metadata.</li>
          <li>Whenever tools are added, removed, renamed, or descriptions change, this page reflects those changes automatically.</li>
          <li>No manual content editing is required for core utility listings.</li>
        </ul>
      </section>
      <section class="section">
        <h2>Current Distribution</h2>
        <div class="chips">${renderCategoryBadges(categorySummary)}</div>
      </section>
      <section class="section">
        <h2>Current Tools</h2>
        <div class="tool-list">${renderToolDirectory(tools)}</div>
      </section>
    `;
    openFooterGeneratedPage({
      title: "Feature Updates",
      subtitle: "Live status page generated from the current project configuration.",
      body,
    });
    return;
  }

  if (action === "faq") {
    const body = `
      <section class="section">
        <h2>Support & FAQ</h2>
        <div class="tool-list">
          <article class="tool-row"><div><h3>How do I open a utility?</h3><p>Use any dashboard card or sidebar action. Tools open in the workspace panel.</p></div></article>
          <article class="tool-row"><div><h3>Can I open tools in new tabs?</h3><p>Yes. Footer utility links open directly in a new tab using tool-specific hash routes.</p></div></article>
          <article class="tool-row"><div><h3>How many tools are currently available?</h3><p>There are <strong>${totalTools}</strong> active utility cards at the moment.</p></div></article>
          <article class="tool-row"><div><h3>How to contact support?</h3><p>Email: <a class="inline" href="mailto:${escapeHtml(ssContactInfo.email)}">${escapeHtml(ssContactInfo.email)}</a><br>Phone: <a class="inline" href="${escapeHtml(toTelHref(ssContactInfo.phone_india))}">${escapeHtml(ssContactInfo.phone_india)}</a><br>WhatsApp: <a class="inline" href="${escapeHtml(toTelHref(ssContactInfo.whatsapp))}">${escapeHtml(ssContactInfo.whatsapp)}</a></p></div><a href="${escapeHtml(toolsOpenLink)}" target="_blank" rel="noopener noreferrer">Open Contact Tool</a></article>
        </div>
      </section>
    `;
    openFooterGeneratedPage({
      title: "Support & FAQ",
      subtitle: "Common questions and support details.",
      body,
    });
  }
}

function initializeFooterLinkBehavior() {
  footerToolLinks.forEach((link) => {
    const toolKey = link.dataset.footerTool;
    if (!toolKey) return;
    link.href = buildToolHashUrl(toolKey);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  footerActionLinks.forEach((link) => {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openFooterActionPage(link.dataset.footerAction || "");
    });
  });
}

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
