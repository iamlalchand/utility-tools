const wallpaperCategory = document.getElementById("wallpaperCategory");
const wallpaperCount = document.getElementById("wallpaperCount");
const loadWallpapersBtn = document.getElementById("loadWallpapersBtn");
const wallpaperStatus = document.getElementById("wallpaperStatus");
const wallpaperGrid = document.getElementById("wallpaperGrid");

if (wallpaperCategory && wallpaperCount && loadWallpapersBtn && wallpaperStatus && wallpaperGrid) {
  const wallpaperKeywordMap = {
    nature: ["nature", "forest", "mountain", "lake", "waterfall"],
    city: ["city", "cityscape", "street", "architecture", "night-city"],
    cars: ["cars", "supercar", "sports-car", "racing", "automobile"],
    technology: ["technology", "coding", "computer", "circuit", "ai"],
    minimal: ["minimal", "abstract", "clean", "geometry", "pastel"],
  };

  function getWallpaperUrls(category, index, seedBase) {
    const keywords = wallpaperKeywordMap[category] || wallpaperKeywordMap.nature;
    const keyword = keywords[index % keywords.length];
    const seed = `${category}-${seedBase}-${index}`;
    return [
      `https://loremflickr.com/1600/900/${encodeURIComponent(keyword)}?lock=${encodeURIComponent(seed)}`,
      `https://source.unsplash.com/random/1600x900/?${encodeURIComponent(keyword)}&sig=${seedBase + index}`,
      `https://picsum.photos/seed/${encodeURIComponent(seed)}/1600/900`,
    ];
  }

  function loadImageWithFallback(imgEl, sources, onDone) {
    let index = 0;
    const tryNext = () => {
      if (index >= sources.length) {
        onDone(false, null);
        return;
      }
      const src = sources[index];
      index += 1;
      imgEl.onload = () => {
        imgEl.onload = null;
        imgEl.onerror = null;
        onDone(true, src);
      };
      imgEl.onerror = tryNext;
      imgEl.src = src;
    };
    tryNext();
  }

  function createWallpaperCard(label) {
    const card = document.createElement("article");
    card.className = "wallpaper-card";

    const image = document.createElement("img");
    image.alt = label;
    image.loading = "lazy";
    image.decoding = "async";

    const meta = document.createElement("div");
    meta.className = "wallpaper-meta";

    const title = document.createElement("p");
    title.className = "wallpaper-title";
    title.textContent = label;

    const actions = document.createElement("div");
    actions.className = "wallpaper-actions";

    const openLink = document.createElement("a");
    openLink.className = "ghost";
    openLink.target = "_blank";
    openLink.rel = "noopener noreferrer";
    openLink.textContent = "Open";
    openLink.href = "#";

    const downloadLink = document.createElement("a");
    downloadLink.className = "ghost";
    downloadLink.target = "_blank";
    downloadLink.rel = "noopener noreferrer";
    downloadLink.textContent = "Download";
    downloadLink.href = "#";

    actions.appendChild(openLink);
    actions.appendChild(downloadLink);
    meta.appendChild(title);
    meta.appendChild(actions);
    card.appendChild(image);
    card.appendChild(meta);
    wallpaperGrid.appendChild(card);

    return { image, openLink, downloadLink };
  }

  function loadWallpapers() {
    const category = wallpaperCategory.value || "nature";
    const count = Math.max(1, Number(wallpaperCount.value) || 6);
    const seedBase = Date.now();
    let loaded = 0;
    let failed = 0;

    wallpaperGrid.innerHTML = "";
    wallpaperStatus.textContent = "Wallpaper: Loading dynamic images...";

    for (let i = 0; i < count; i += 1) {
      const label = `${category.toUpperCase()} #${i + 1}`;
      const card = createWallpaperCard(label);
      const sources = getWallpaperUrls(category, i, seedBase);

      loadImageWithFallback(card.image, sources, (ok, resolvedUrl) => {
        if (ok && resolvedUrl) {
          loaded += 1;
          card.openLink.href = resolvedUrl;
          card.downloadLink.href = resolvedUrl;
          card.downloadLink.download = `${category}-${i + 1}.jpg`;
        } else {
          failed += 1;
          card.image.alt = `${label} unavailable`;
          card.image.src =
            "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23838aa3' font-family='Arial' font-size='24'%3EImage unavailable%3C/text%3E%3C/svg%3E";
          card.openLink.classList.add("disabled");
          card.downloadLink.classList.add("disabled");
        }

        if (loaded + failed === count) {
          wallpaperStatus.textContent =
            failed > 0
              ? `Wallpaper: Loaded ${loaded}/${count}. ${failed} failed (network/provider issue).`
              : `Wallpaper: Loaded ${loaded} dynamic image(s).`;
        }
      });
    }
  }

  loadWallpapersBtn.addEventListener("click", loadWallpapers);
  wallpaperCategory.addEventListener("change", loadWallpapers);
  loadWallpapers();
}

