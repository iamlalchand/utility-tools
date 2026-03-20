const weatherCityInput = document.getElementById("weatherCityInput");
const weatherSearchBtn = document.getElementById("weatherSearchBtn");
const weatherCurrentResult = document.getElementById("weatherCurrentResult");
const weatherMetaResult = document.getElementById("weatherMetaResult");
const weatherForecastList = document.getElementById("weatherForecastList");

if (weatherCityInput && weatherSearchBtn && weatherCurrentResult && weatherMetaResult && weatherForecastList) {
  const weatherCodeLabel = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Freezing dense drizzle",
    61: "Slight rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers",
    81: "Rain showers",
    82: "Violent rain showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm hail",
    99: "Heavy thunderstorm hail",
  };

  function toRoundedInt(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "-";
    return String(Math.round(numeric));
  }

  function findNearestHourIndex(times, targetIso) {
    if (!Array.isArray(times) || !times.length) return -1;
    if (targetIso) {
      const exactIndex = times.indexOf(targetIso);
      if (exactIndex >= 0) return exactIndex;
    }

    const targetMs = targetIso ? Date.parse(targetIso) : Date.now();
    if (!Number.isFinite(targetMs)) return 0;

    let bestIndex = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < times.length; i += 1) {
      const timeMs = Date.parse(times[i]);
      if (!Number.isFinite(timeMs)) continue;
      const diff = Math.abs(timeMs - targetMs);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  async function fetchWeatherByCity() {
    const city = weatherCityInput.value.trim();
    if (!city) {
      weatherCurrentResult.textContent = "Weather: Enter a city first.";
      return;
    }

    weatherCurrentResult.textContent = "Weather: Loading...";
    weatherMetaResult.textContent = "Fetching location and forecast data...";
    weatherForecastList.innerHTML = "";

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
      );
      if (!geoResponse.ok) throw new Error("Location lookup failed");
      const geoPayload = await geoResponse.json();
      const place = geoPayload?.results?.[0];
      if (!place) {
        weatherCurrentResult.textContent = "Weather: City not found.";
        weatherMetaResult.textContent = "Try a different city name.";
        return;
      }

      const forecastResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,is_day&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=8`,
      );
      if (!forecastResponse.ok) throw new Error("Forecast API unavailable");
      const forecastPayload = await forecastResponse.json();

      const current = forecastPayload?.current || {};
      const hourly = forecastPayload?.hourly || {};
      const hourlyTimes = hourly?.time || [];
      const hourIndex = findNearestHourIndex(hourlyTimes, current.time);

      const hourlyTemp = hourly?.temperature_2m?.[hourIndex];
      const hourlyHumidity = hourly?.relative_humidity_2m?.[hourIndex];
      const hourlyWind = hourly?.wind_speed_10m?.[hourIndex];
      const hourlyCode = hourly?.weather_code?.[hourIndex];
      const hourlyPrecipProb = hourly?.precipitation_probability?.[hourIndex];

      const currentTemp = Number.isFinite(Number(hourlyTemp)) ? hourlyTemp : current.temperature_2m;
      const currentHumidity = Number.isFinite(Number(hourlyHumidity))
        ? hourlyHumidity
        : current.relative_humidity_2m;
      const currentWind = Number.isFinite(Number(hourlyWind)) ? hourlyWind : current.wind_speed_10m;
      const currentCode = Number(
        Number.isFinite(Number(hourlyCode)) ? hourlyCode : current.weather_code,
      );
      const currentLabel = weatherCodeLabel[currentCode] || `Code ${currentCode}`;
      weatherCurrentResult.textContent = `${place.name}, ${place.country}: ${toRoundedInt(currentTemp)}°C, ${currentLabel}`;
      weatherMetaResult.textContent = `Precipitation: ${toRoundedInt(hourlyPrecipProb)}% | Humidity: ${toRoundedInt(currentHumidity)}% | Wind: ${toRoundedInt(currentWind)} km/h`;

      const days = forecastPayload?.daily?.time || [];
      const codeList = forecastPayload?.daily?.weather_code || [];
      const maxList = forecastPayload?.daily?.temperature_2m_max || [];
      const minList = forecastPayload?.daily?.temperature_2m_min || [];
      const rainProbList = forecastPayload?.daily?.precipitation_probability_max || [];

      const rainAlertIndex = rainProbList.findIndex((value) => Number(value) >= 60);
      if (rainAlertIndex >= 0) {
        const alertDate = new Date(days[rainAlertIndex]).toLocaleDateString();
        weatherMetaResult.textContent += ` | Rain alert: ${rainProbList[rainAlertIndex]}% on ${alertDate}`;
      }

      weatherForecastList.innerHTML = "";
      for (let i = 0; i < Math.min(days.length, 7); i += 1) {
        const card = document.createElement("div");
        card.className = "output-item";
        const dayText = new Date(days[i]).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
        const label = weatherCodeLabel[Number(codeList[i])] || `Code ${codeList[i]}`;
        const rainChance = Number(rainProbList[i]) || 0;
        card.textContent = `${dayText}: ${label} | ${toRoundedInt(minList[i])}°C to ${toRoundedInt(maxList[i])}°C | Rain chance ${toRoundedInt(rainChance)}%`;
        weatherForecastList.appendChild(card);
      }

      const sourceCard = document.createElement("div");
      sourceCard.className = "output-item";
      sourceCard.textContent = "Source: Open-Meteo (values may differ slightly from Google Weather).";
      weatherForecastList.appendChild(sourceCard);
    } catch (error) {
      weatherCurrentResult.textContent = "Weather: Could not load data.";
      weatherMetaResult.textContent = error.message || "Please try again.";
    }
  }

  weatherSearchBtn.addEventListener("click", fetchWeatherByCity);
  weatherCityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") fetchWeatherByCity();
  });
}

