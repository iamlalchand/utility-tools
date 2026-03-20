const qrTextInput = document.getElementById("qrTextInput");
const qrSizeSelect = document.getElementById("qrSizeSelect");
const qrGenerateBtn = document.getElementById("qrGenerateBtn");
const qrImage = document.getElementById("qrImage");
const qrDownloadLink = document.getElementById("qrDownloadLink");
const qrStatus = document.getElementById("qrStatus");
const qrLibraryCdnUrls = [
  "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js",
  "https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.3/qrcode.min.js",
];
const qrScriptLoadCache = new Map();
let qrLibraryEnsurePromise = null;

function escapeSvgText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildFallbackQrSvgUrl(text, size) {
  const safeText = escapeSvgText(String(text || "").slice(0, 28));
  const safeSize = Math.max(120, Number(size) || 220);
  const fontSize = Math.max(10, Math.round(safeSize * 0.08));
  const titleY = Math.round(safeSize * 0.47);
  const codeY = Math.round(safeSize * 0.62);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${safeSize}" height="${safeSize}" viewBox="0 0 ${safeSize} ${safeSize}">
  <rect width="${safeSize}" height="${safeSize}" fill="#ffffff"/>
  <rect x="10" y="10" width="${safeSize - 20}" height="${safeSize - 20}" fill="#ffffff" stroke="#3f318f" stroke-width="2" rx="12"/>
  <text x="${safeSize / 2}" y="${titleY}" text-anchor="middle" fill="#3f318f" font-size="${fontSize}" font-family="Arial, sans-serif">QR fallback</text>
  <text x="${safeSize / 2}" y="${codeY}" text-anchor="middle" fill="#1f2340" font-size="${fontSize}" font-family="monospace">${safeText}</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getQrApi() {
  if (window.QRCode && typeof window.QRCode.toDataURL === "function") return window.QRCode;
  return null;
}

function loadQrScript(url) {
  if (getQrApi()) return Promise.resolve(true);
  if (qrScriptLoadCache.has(url)) return qrScriptLoadCache.get(url);

  const loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error(`qr-script-load-failed:${url}`));
    document.head.appendChild(script);
  });

  qrScriptLoadCache.set(url, loaderPromise);
  return loaderPromise;
}

async function ensureQrLibrary() {
  if (getQrApi()) return true;

  if (!qrLibraryEnsurePromise) {
    qrLibraryEnsurePromise = (async () => {
      for (const url of qrLibraryCdnUrls) {
        try {
          await loadQrScript(url);
          if (getQrApi()) return true;
        } catch {
          // Try the next CDN URL.
        }
      }
      return false;
    })();
  }

  return qrLibraryEnsurePromise;
}

function buildRemoteQrUrl(text, size) {
  const safeText = String(text || "").trim();
  const safeSize = Math.max(120, Number(size) || 220);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${safeSize}x${safeSize}&margin=0&ecc=M&format=png&data=${encodeURIComponent(safeText)}`;
}

async function buildQrSources(text, size) {
  const safeText = String(text || "").trim();
  const safeSize = Math.max(120, Number(size) || 220);
  if (!safeText) throw new Error("empty-qr-text");
  const sources = [];

  let qrApi = getQrApi();
  if (!qrApi) {
    await ensureQrLibrary();
    qrApi = getQrApi();
  }

  if (qrApi) {
    try {
      const localUrl = await qrApi.toDataURL(safeText, {
        width: safeSize,
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#111111", light: "#FFFFFF" },
      });
      sources.push({ url: localUrl, source: "local" });
    } catch {
      // Continue to next source.
    }
  }

  sources.push({ url: buildRemoteQrUrl(safeText, safeSize), source: "remote" });
  sources.push({ url: buildFallbackQrSvgUrl(safeText, safeSize), source: "fallback" });

  const seen = new Set();
  return sources.filter(({ url }) => {
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function setQrImageWithFallback(imageEl, text, size, onDone) {
  if (!imageEl) {
    if (onDone) onDone(false, null, null);
    return;
  }

  imageEl.style.display = "none";
  imageEl.removeAttribute("srcset");
  imageEl.removeAttribute("src");
  imageEl.onload = null;
  imageEl.onerror = null;

  buildQrSources(text, size)
    .then((sources) => {
      let sourceIndex = 0;
      const tryNextSource = () => {
        if (sourceIndex >= sources.length) {
          if (onDone) onDone(false, null, null);
          return;
        }
        const { url, source } = sources[sourceIndex];
        sourceIndex += 1;

        imageEl.onload = () => {
          imageEl.style.display = "block";
          imageEl.onload = null;
          imageEl.onerror = null;
          if (onDone) onDone(true, url, source);
        };
        imageEl.onerror = () => {
          imageEl.removeAttribute("src");
          tryNextSource();
        };
        imageEl.src = url;
      };

      tryNextSource();
    })
    .catch(() => {
      imageEl.removeAttribute("src");
      if (onDone) onDone(false, null, null);
    });
}

if (qrImage) qrImage.style.display = "none";

if (qrGenerateBtn) {
  qrGenerateBtn.addEventListener("click", () => {
    const text = qrTextInput ? qrTextInput.value.trim() : "";
    const size = qrSizeSelect ? Number(qrSizeSelect.value) || 240 : 240;

    if (!text) {
      if (qrStatus) qrStatus.textContent = "QR: Enter text or URL first";
      return;
    }

    if (qrStatus) qrStatus.textContent = "QR: Generating...";
    setQrImageWithFallback(qrImage, text, size, (ok, url, source) => {
      if (!ok || !url) {
        if (qrStatus) qrStatus.textContent = "QR: Could not generate QR in this browser";
        if (qrDownloadLink) qrDownloadLink.classList.add("hidden");
        return;
      }
      if (qrDownloadLink) {
        qrDownloadLink.href = url;
        qrDownloadLink.classList.remove("hidden");
      }
      if (!qrStatus) return;
      if (source === "local") {
        qrStatus.textContent = "QR: Generated locally (scan ready)";
        return;
      }
      if (source === "remote") {
        qrStatus.textContent = "QR: Generated using online backup (scan ready)";
        return;
      }
      qrStatus.textContent = "QR: Fallback shown (scan may fail)";
    });
  });
}
