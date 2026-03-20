const worldClockList = document.getElementById("worldClockList");
const refreshWorldClockBtn = document.getElementById("refreshWorldClockBtn");
const countryClockSelect = document.getElementById("countryClockSelect");
const addCountryClockBtn = document.getElementById("addCountryClockBtn");
const resetCountryClockBtn = document.getElementById("resetCountryClockBtn");
const countrySupportStatus = document.getElementById("countrySupportStatus");
const countryInfoCard = document.getElementById("countryInfoCard");
const countryClockStorageKey = "ssCountryClockSelection";
const fallbackCountryCatalog = [
  { key: "in", name: "India", capital: "New Delhi", zone: "Asia/Kolkata", currency: "INR", dial: "+91" },
  { key: "us", name: "United States", capital: "Washington, D.C.", zone: "America/New_York", currency: "USD", dial: "+1" },
  { key: "gb", name: "United Kingdom", capital: "London", zone: "Europe/London", currency: "GBP", dial: "+44" },
  { key: "ae", name: "UAE", capital: "Abu Dhabi", zone: "Asia/Dubai", currency: "AED", dial: "+971" },
  { key: "kw", name: "Kuwait", capital: "Kuwait City", zone: "Asia/Kuwait", currency: "KWD", dial: "+965" },
  { key: "jp", name: "Japan", capital: "Tokyo", zone: "Asia/Tokyo", currency: "JPY", dial: "+81" },
  { key: "au", name: "Australia", capital: "Canberra", zone: "Australia/Sydney", currency: "AUD", dial: "+61" },
  { key: "ca", name: "Canada", capital: "Ottawa", zone: "America/Toronto", currency: "CAD", dial: "+1" },
  { key: "sg", name: "Singapore", capital: "Singapore", zone: "Asia/Singapore", currency: "SGD", dial: "+65" },
  { key: "de", name: "Germany", capital: "Berlin", zone: "Europe/Berlin", currency: "EUR", dial: "+49" },
  { key: "fr", name: "France", capital: "Paris", zone: "Europe/Paris", currency: "EUR", dial: "+33" },
  { key: "br", name: "Brazil", capital: "Brasilia", zone: "America/Sao_Paulo", currency: "BRL", dial: "+55" },
  { key: "za", name: "South Africa", capital: "Pretoria", zone: "Africa/Johannesburg", currency: "ZAR", dial: "+27" },
];
let countryCatalog = [...fallbackCountryCatalog];
const defaultCountryClockKeys = ["in", "gb", "us", "jp", "au"];

function getCountryByKey(key) {
  return countryCatalog.find((item) => item.key === key);
}

function loadCountryClockSelection() {
  const raw = localStorage.getItem(countryClockStorageKey);
  if (!raw) return [...defaultCountryClockKeys];
  try {
    const parsed = JSON.parse(raw);
    const valid = Array.isArray(parsed) ? parsed.filter((key) => getCountryByKey(key)) : [];
    return valid.length ? valid : [...defaultCountryClockKeys];
  } catch {
    return [...defaultCountryClockKeys];
  }
}

function saveCountryClockSelection(selection) {
  localStorage.setItem(countryClockStorageKey, JSON.stringify(selection));
}

let selectedCountryClockKeys = loadCountryClockSelection();

function fillCountrySelect(selectEl) {
  if (!selectEl) return;
  const previousValue = selectEl.value;
  selectEl.innerHTML = `<option value="">${t("countrySelectOption")}</option>`;
  countryCatalog.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.key;
    option.textContent = country.name;
    option.dataset.zone = country.zone;
    selectEl.appendChild(option);
  });
  const hasPrevious = Array.from(selectEl.options).some((option) => option.value === previousValue);
  selectEl.value = hasPrevious ? previousValue : "";
}

function renderCountryInfo(key) {
  if (!countryInfoCard) return;
  const country = getCountryByKey(key);
  if (!country) {
    countryInfoCard.textContent = t("countryInfoEmpty");
    return;
  }
  countryInfoCard.textContent = "";

  const title = document.createElement("strong");
  title.textContent = country.name;
  countryInfoCard.appendChild(title);

  const details = [
    `${t("countryCapitalLabel")}: ${country.capital}`,
    `${t("countryCurrencyLabel")}: ${country.currency}`,
    `${t("countryDialLabel")}: ${country.dial}`,
    `${t("countryTimezoneLabel")}: ${country.zone}`,
  ];
  details.forEach((line) => {
    const entry = document.createElement("span");
    entry.textContent = line;
    countryInfoCard.appendChild(entry);
  });
}

function renderWorldClocks() {
  if (!worldClockList) return;
  worldClockList.innerHTML = "";
  const now = new Date();
  if (!selectedCountryClockKeys.length) {
    const empty = document.createElement("div");
    empty.className = "output-item";
    empty.textContent = t("worldClockEmpty");
    worldClockList.appendChild(empty);
    return;
  }

  selectedCountryClockKeys.forEach((key) => {
    const country = getCountryByKey(key);
    if (!country) return;
    const time = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: country.zone,
    }).format(now);

    const row = document.createElement("div");
    row.className = "output-item world-clock-row";

    const meta = document.createElement("div");
    meta.className = "world-clock-meta";

    const countryLine = document.createElement("p");
    countryLine.className = "world-clock-country";
    countryLine.textContent = `${country.name} (${country.capital})`;

    const zoneLine = document.createElement("p");
    zoneLine.className = "world-clock-zone";
    zoneLine.textContent = `${t("countryTimezoneLabel")}: ${country.zone}`;

    meta.appendChild(countryLine);
    meta.appendChild(zoneLine);

    const side = document.createElement("div");
    side.className = "world-clock-side";

    const timeLine = document.createElement("p");
    timeLine.className = "world-clock-time";
    timeLine.textContent = time;

    const removeBtn = document.createElement("button");
    removeBtn.className = "ghost world-remove-btn";
    removeBtn.type = "button";
    removeBtn.dataset.removeCountryClock = key;
    removeBtn.textContent = t("removeBtn");

    side.appendChild(timeLine);
    side.appendChild(removeBtn);

    row.appendChild(meta);
    row.appendChild(side);
    worldClockList.appendChild(row);
  });
}

if (worldClockList) {
  worldClockList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const key = target.dataset.removeCountryClock;
    if (!key) return;

    selectedCountryClockKeys = selectedCountryClockKeys.filter((countryKey) => countryKey !== key);
    saveCountryClockSelection(selectedCountryClockKeys);
    renderWorldClocks();
    countrySupportStatus.textContent = t("countryRemoved");
  });
}

if (countryClockSelect) {
  countryClockSelect.addEventListener("change", () => {
    renderCountryInfo(countryClockSelect.value);
  });
}

if (addCountryClockBtn) {
  addCountryClockBtn.addEventListener("click", () => {
    const selectedKey = countryClockSelect.value;
    if (!selectedKey) {
      countrySupportStatus.textContent = t("countrySelectFirst");
      return;
    }
    if (selectedCountryClockKeys.includes(selectedKey)) {
      countrySupportStatus.textContent = t("countryAlreadyAdded");
      return;
    }
    selectedCountryClockKeys.push(selectedKey);
    saveCountryClockSelection(selectedCountryClockKeys);
    renderWorldClocks();
    renderCountryInfo(selectedKey);
    countrySupportStatus.textContent = t("countryAdded");
  });
}

if (resetCountryClockBtn) {
  resetCountryClockBtn.addEventListener("click", () => {
    selectedCountryClockKeys = [...defaultCountryClockKeys];
    saveCountryClockSelection(selectedCountryClockKeys);
    renderWorldClocks();
    renderCountryInfo("");
    countrySupportStatus.textContent = t("countryReset");
  });
}

if (refreshWorldClockBtn) {
  refreshWorldClockBtn.addEventListener("click", renderWorldClocks);
}

function normalizeCountrySelections() {
  const availableKeys = new Set(countryCatalog.map((item) => item.key));
  selectedCountryClockKeys = selectedCountryClockKeys.filter((key) => availableKeys.has(key));
  if (!selectedCountryClockKeys.length) selectedCountryClockKeys = [...defaultCountryClockKeys];

  if (!availableKeys.has(selectedTimeCountryKey)) {
    selectedTimeCountryKey = selectedCountryClockKeys[0];
    localStorage.setItem(timeCountryStorageKey, selectedTimeCountryKey);
  }
}

async function loadAllCountriesCatalog() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=cca2,name,capital,timezones,currencies,idd");
    if (!response.ok) throw new Error("Country API unavailable");
    const data = await response.json();

    const mapped = data
      .map((item) => {
        const key = item?.cca2?.toLowerCase();
        const name = item?.name?.common;
        const zone = Array.isArray(item?.timezones) && item.timezones.length ? item.timezones[0] : "";
        if (!key || !name || !zone) return null;

        const capital = Array.isArray(item?.capital) && item.capital.length ? item.capital[0] : "-";
        const currency = item?.currencies ? Object.keys(item.currencies)[0] || "-" : "-";
        const dialRoot = item?.idd?.root || "";
        const dialSuffix = Array.isArray(item?.idd?.suffixes) && item.idd.suffixes.length ? item.idd.suffixes[0] : "";
        const dial = dialRoot && dialSuffix ? `${dialRoot}${dialSuffix}` : dialRoot || "-";

        return { key, name, capital, zone, currency, dial };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (mapped.length > 50) {
      countryCatalog = mapped;
    }
  } catch {
    countryCatalog = [...fallbackCountryCatalog];
  } finally {
    normalizeCountrySelections();
    fillCountrySelect(countryClockSelect);
    fillCountrySelect(timeCountrySelect);
    if (timeCountrySelect) timeCountrySelect.value = selectedTimeCountryKey;
    if (countrySupportStatus) countrySupportStatus.textContent = t("countrySupportReady");
    if (countryClockSelect && !countryClockSelect.value) countryClockSelect.value = selectedTimeCountryKey;
    renderCountryInfo(countryClockSelect?.value || selectedTimeCountryKey);
    renderWorldClocks();
    updateClock();
  }
}

loadAllCountriesCatalog();
setInterval(renderWorldClocks, 1000);

