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
