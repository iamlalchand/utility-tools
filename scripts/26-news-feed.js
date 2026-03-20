const newsProviderSelect = document.getElementById("newsProviderSelect");
const newsApiKeyInput = document.getElementById("newsApiKeyInput");
const newsQueryInput = document.getElementById("newsQueryInput");
const newsCountrySelect = document.getElementById("newsCountrySelect");
const loadNewsBtn = document.getElementById("loadNewsBtn");
const newsStatus = document.getElementById("newsStatus");
const newsList = document.getElementById("newsList");
const newsKeyStoragePrefix = "ssNewsApiKey_";

if (newsProviderSelect && newsApiKeyInput && newsQueryInput && newsCountrySelect && loadNewsBtn && newsStatus && newsList) {
  function loadNewsSavedKey() {
    const provider = newsProviderSelect.value;
    newsApiKeyInput.value = localStorage.getItem(`${newsKeyStoragePrefix}${provider}`) || "";
  }

  function saveNewsKey() {
    const provider = newsProviderSelect.value;
    const key = newsApiKeyInput.value.trim();
    if (key) localStorage.setItem(`${newsKeyStoragePrefix}${provider}`, key);
  }

  function renderNewsItems(items) {
    newsList.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "news-item";
      empty.textContent = "No news items found for this query.";
      newsList.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "news-item";

      const link = document.createElement("a");
      link.href = item.url || "#";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.title || "Untitled";

      const meta = document.createElement("p");
      const when = item.publishedAt ? new Date(item.publishedAt).toLocaleString() : "Unknown time";
      meta.textContent = `${item.source || "Unknown source"} | ${when}`;

      const summary = document.createElement("p");
      summary.textContent = item.description || "No summary available.";

      card.appendChild(link);
      card.appendChild(meta);
      card.appendChild(summary);
      newsList.appendChild(card);
    });
  }

  async function loadNewsFeed() {
    const provider = newsProviderSelect.value;
    const apiKey = newsApiKeyInput.value.trim();
    const query = newsQueryInput.value.trim() || "technology";
    const country = newsCountrySelect.value;

    if (!apiKey) {
      newsStatus.textContent = "News: Enter API key for selected provider (GNews or NewsAPI).";
      return;
    }

    saveNewsKey();
    newsStatus.textContent = "News: Loading headlines...";
    newsList.innerHTML = "";

    try {
      let url = "";
      if (provider === "gnews") {
        url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=${encodeURIComponent(country)}&max=10&token=${encodeURIComponent(apiKey)}`;
      } else {
        url = `https://newsapi.org/v2/top-headlines?country=${encodeURIComponent(country)}&q=${encodeURIComponent(query)}&pageSize=10&apiKey=${encodeURIComponent(apiKey)}`;
      }

      const response = await fetch(url);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = payload?.message || payload?.errors?.[0]?.message || "API request failed";
        throw new Error(message);
      }

      const rawItems = Array.isArray(payload.articles) ? payload.articles : [];
      const items = rawItems.map((item) => ({
        title: item.title,
        description: item.description,
        url: item.url,
        source: item?.source?.name || item?.source || "Source",
        publishedAt: item.publishedAt,
      }));

      newsStatus.textContent = `News: Loaded ${items.length} article(s) from ${provider.toUpperCase()}.`;
      renderNewsItems(items);
    } catch (error) {
      newsStatus.textContent = `News: ${error.message}`;
      const help = document.createElement("div");
      help.className = "news-item";
      help.textContent = "Tip: Some providers block browser-origin requests. Try another provider key.";
      newsList.innerHTML = "";
      newsList.appendChild(help);
    }
  }

  newsProviderSelect.addEventListener("change", loadNewsSavedKey);
  loadNewsBtn.addEventListener("click", loadNewsFeed);
  loadNewsSavedKey();
}

