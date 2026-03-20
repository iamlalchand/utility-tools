const qrTextInput = document.getElementById("qrTextInput");
const qrSizeSelect = document.getElementById("qrSizeSelect");
const qrGenerateBtn = document.getElementById("qrGenerateBtn");
const qrImage = document.getElementById("qrImage");
const qrDownloadLink = document.getElementById("qrDownloadLink");
const qrStatus = document.getElementById("qrStatus");

function escapeSvgText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildFallbackQrSvgUrl(text, size) {
  const safeText = escapeSvgText(text);
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

async function buildQrDataUrl(text, size) {
  const safeText = String(text || "").trim();
  const safeSize = Math.max(120, Number(size) || 220);
  if (!safeText) throw new Error("empty-qr-text");

  if (window.QRCode && typeof window.QRCode.toDataURL === "function") {
    const url = await window.QRCode.toDataURL(safeText, {
      width: safeSize,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#111111", light: "#FFFFFF" },
    });
    return { url, source: "local" };
  }

  return { url: buildFallbackQrSvgUrl(safeText, safeSize), source: "fallback" };
}

function setQrImageWithFallback(imageEl, text, size, onDone) {
  if (!imageEl) {
    if (onDone) onDone(false, null, null);
    return;
  }

  imageEl.style.display = "none";
  imageEl.removeAttribute("srcset");
  imageEl.onload = null;
  imageEl.onerror = null;

  buildQrDataUrl(text, size)
    .then(({ url, source }) => {
      imageEl.onload = () => {
        imageEl.style.display = "block";
        imageEl.onload = null;
        imageEl.onerror = null;
        if (onDone) onDone(true, url, source);
      };
      imageEl.onerror = () => {
        imageEl.removeAttribute("src");
        if (onDone) onDone(false, null, source);
      };
      imageEl.src = url;
    })
    .catch(() => {
      imageEl.removeAttribute("src");
      if (onDone) onDone(false, null, null);
    });
}

if (qrImage) qrImage.style.display = "none";

if (qrGenerateBtn) {
  qrGenerateBtn.addEventListener("click", () => {
    const text = qrTextInput.value.trim();
    const size = Number(qrSizeSelect.value) || 240;

    if (!text) {
      qrStatus.textContent = "QR: Enter text or URL first";
      return;
    }

    qrStatus.textContent = "QR: Generating...";
    setQrImageWithFallback(qrImage, text, size, (ok, url, source) => {
      if (!ok || !url) {
        qrStatus.textContent = "QR: Could not generate QR in this network/browser";
        qrDownloadLink.classList.add("hidden");
        return;
      }
      qrDownloadLink.href = url;
      qrDownloadLink.classList.remove("hidden");
      qrStatus.textContent =
        source === "fallback"
          ? "QR: Fallback shown (scan may fail). Load QR library/network."
          : "QR: Generated locally (scan ready)";
    });
  });
}

