const clockText = document.getElementById("clockText");
const refreshTimeBtn = document.getElementById("refreshTimeBtn");
const timeCountrySelect = document.getElementById("timeCountrySelect");
const timeCountryClock = document.getElementById("timeCountryClock");
const timeCountryStorageKey = "ssCurrentTimeCountry";
let selectedTimeCountryKey = localStorage.getItem(timeCountryStorageKey) || "in";

function updateClock() {
  const now = new Date();
  clockText.textContent = now.toLocaleTimeString();

  if (timeCountrySelect && timeCountryClock) {
    const selectedOption = timeCountrySelect.options[timeCountrySelect.selectedIndex];
    const selectedKey = selectedOption?.value || "";
    const zone = selectedOption?.dataset?.zone || "";
    if (!selectedKey || !zone) {
      timeCountryClock.textContent = t("selectedCountryPrompt");
      return;
    }
    const countryTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: zone,
    });
    timeCountryClock.textContent = `${t("selectedCountryPrefix")}: ${countryTime}`;
  }
}

refreshTimeBtn.addEventListener("click", updateClock);
if (timeCountrySelect) {
  timeCountrySelect.addEventListener("change", () => {
    selectedTimeCountryKey = timeCountrySelect.value || selectedTimeCountryKey;
    localStorage.setItem(timeCountryStorageKey, selectedTimeCountryKey);
    updateClock();
  });
}
updateClock();
setInterval(updateClock, 1000);

