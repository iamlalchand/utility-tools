const shareFileInput = document.getElementById("shareFileInput");
const shareTextInput = document.getElementById("shareTextInput");
const createShareCodeBtn = document.getElementById("createShareCodeBtn");
const createScanShareBtn = document.getElementById("createScanShareBtn");
const shareCodeOutput = document.getElementById("shareCodeOutput");
const sharePublicLinkOutput = document.getElementById("sharePublicLinkOutput");
const copyShareCodeBtn = document.getElementById("copyShareCodeBtn");
const copySharePublicLinkBtn = document.getElementById("copySharePublicLinkBtn");
const clearShareCodeBtn = document.getElementById("clearShareCodeBtn");
const shareQrImage = document.getElementById("shareQrImage");
const fileShareStatus = document.getElementById("fileShareStatus");
const receiveShareCodeInput = document.getElementById("receiveShareCodeInput");
const receiveFileBtn = document.getElementById("receiveFileBtn");
const receivedFileDownloadLink = document.getElementById("receivedFileDownloadLink");
const fileReceiveStatus = document.getElementById("fileReceiveStatus");
const shareCodeChars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const shareStore = Object.create(null);
try {
  localStorage.removeItem("ssFileShareEntriesV1");
} catch {}

function clearShareStore() {
  Object.keys(shareStore).forEach((code) => {
    delete shareStore[code];
  });
}

function sanitizeShareCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

function generateShareCode(existingStore) {
  for (let i = 0; i < 40; i += 1) {
    let code = "FS";
    for (let j = 0; j < 6; j += 1) {
      const charIndex = randomInt(0, shareCodeChars.length - 1);
      code += shareCodeChars[charIndex];
    }
    if (!existingStore[code]) return code;
  }
  return `FS${Date.now().toString(36).toUpperCase()}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read selected file"));
    reader.readAsDataURL(file);
  });
}

function clearShareQr() {
  if (!shareQrImage) return;
  shareQrImage.style.display = "none";
  shareQrImage.removeAttribute("src");
}

async function createLocalShareEntryFromSelectedFile() {
  const selectedFile = shareFileInput?.files?.[0];
  if (!selectedFile) {
    if (fileShareStatus) fileShareStatus.textContent = "File Share: Select a file first";
    return null;
  }

  const maxSizeBytes = 4 * 1024 * 1024;
  if (selectedFile.size > maxSizeBytes) {
    if (fileShareStatus) fileShareStatus.textContent = "File Share: Max supported size is 4 MB";
    return null;
  }

  if (fileShareStatus) fileShareStatus.textContent = "File Share: Creating share code...";
  if (receivedFileDownloadLink) receivedFileDownloadLink.classList.add("hidden");

  try {
    const dataUrl = await readFileAsDataUrl(selectedFile);
    const code = generateShareCode(shareStore);
    shareStore[code] = {
      fileName: selectedFile.name,
      mimeType: selectedFile.type || "application/octet-stream",
      size: selectedFile.size,
      dataUrl,
      createdAt: Date.now(),
    };
    if (shareCodeOutput) shareCodeOutput.value = code;
    if (receiveShareCodeInput) receiveShareCodeInput.value = code;
    if (fileShareStatus) fileShareStatus.textContent = `File Share: Code ${code} ready`;
    return code;
  } catch (error) {
    const msg =
      error && typeof error.message === "string" && error.message.toLowerCase().includes("quota")
        ? "File Share: Storage full. Use smaller file."
        : `File Share: ${error.message || "Could not create share code"}`;
    if (fileShareStatus) fileShareStatus.textContent = msg;
    clearShareQr();
    return null;
  }
}

if (shareQrImage) shareQrImage.style.display = "none";

if (
  shareFileInput &&
  createShareCodeBtn &&
  shareCodeOutput &&
  copyShareCodeBtn &&
  clearShareCodeBtn &&
  shareQrImage &&
  fileShareStatus &&
  receiveShareCodeInput &&
  receiveFileBtn &&
  receivedFileDownloadLink &&
  fileReceiveStatus
) {
  createShareCodeBtn.addEventListener("click", async () => {
    const code = await createLocalShareEntryFromSelectedFile();
    if (!code) return;

    setQrImageWithFallback(shareQrImage, code, 220, (ok, _url, source) => {
      if (!ok) {
        fileShareStatus.textContent = `File Share: Code ${code} created, but QR failed to load`;
        return;
      }
      fileShareStatus.textContent =
        source === "fallback"
          ? `File Share: Code ${code} ready (fallback image; scanner may fail)`
          : `File Share: Code ${code} ready`;
    });
  });

  copyShareCodeBtn.addEventListener("click", async () => {
    const code = shareCodeOutput.value.trim();
    if (!code) {
      fileShareStatus.textContent = "File Share: No share code to copy";
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      fileShareStatus.textContent = "File Share: Share code copied";
    } catch {
      fileShareStatus.textContent = "File Share: Copy not allowed in this browser";
    }
  });

  clearShareCodeBtn.addEventListener("click", () => {
    shareFileInput.value = "";
    if (shareTextInput) shareTextInput.value = "";
    shareCodeOutput.value = "";
    if (sharePublicLinkOutput) sharePublicLinkOutput.value = "";
    clearShareStore();
    receiveShareCodeInput.value = "";
    receivedFileDownloadLink.classList.add("hidden");
    clearShareQr();
    fileShareStatus.textContent = "File Share: Ready";
    fileReceiveStatus.textContent = "Receive: Waiting for code";
  });

  receiveFileBtn.addEventListener("click", () => {
    const code = sanitizeShareCode(receiveShareCodeInput.value);
    if (!code) {
      fileReceiveStatus.textContent = "Receive: Enter share code first";
      return;
    }

    const entry = shareStore[code];
    if (!entry || !entry.dataUrl) {
      receivedFileDownloadLink.classList.add("hidden");
      fileReceiveStatus.textContent = "Receive: Invalid or expired share code";
      return;
    }

    receivedFileDownloadLink.href = entry.dataUrl;
    receivedFileDownloadLink.download = entry.fileName || "shared-file";
    receivedFileDownloadLink.classList.remove("hidden");
    const sizeKb = Number(entry.size) > 0 ? `${(Number(entry.size) / 1024).toFixed(1)} KB` : "unknown size";
    fileReceiveStatus.textContent = `Receive: File ready (${entry.fileName || "file"}, ${sizeKb})`;
  });
}

if (
  shareFileInput &&
  shareTextInput &&
  createScanShareBtn &&
  sharePublicLinkOutput &&
  copySharePublicLinkBtn &&
  shareQrImage &&
  fileShareStatus
) {
  createScanShareBtn.addEventListener("click", async () => {
    const selectedFile = shareFileInput.files?.[0] || null;
    const textPayload = (shareTextInput.value || "").trim();
    sharePublicLinkOutput.value = "";
    clearShareQr();

    let code = sanitizeShareCode(shareCodeOutput.value);
    if (!code && selectedFile) {
      const generatedCode = await createLocalShareEntryFromSelectedFile();
      if (!generatedCode) return;
      code = sanitizeShareCode(generatedCode);
    }

    if (code) {
      sharePublicLinkOutput.value = `LOCAL_CODE:${code}`;
      setQrImageWithFallback(shareQrImage, code, 220, (ok, _url, source) => {
        if (!ok) {
          fileShareStatus.textContent = "File Share: Local QR could not be generated";
          return;
        }
        fileShareStatus.textContent =
          source === "fallback"
            ? "File Share: Local QR shown as fallback (scanner may fail)"
            : "File Share: Local QR ready (scannable)";
      });
      return;
    }

    if (!selectedFile && !textPayload) {
      fileShareStatus.textContent = "File Share: Pehle code banao ya text enter karo";
      return;
    }

    sharePublicLinkOutput.value = "LOCAL_TEXT_QR";
    setQrImageWithFallback(shareQrImage, textPayload, 220, (ok, _url, source) => {
      if (!ok) {
        fileShareStatus.textContent = "File Share: Text QR generate nahi ho paya";
        return;
      }
      fileShareStatus.textContent =
        source === "fallback"
          ? "File Share: Local text fallback shown (scanner may fail)"
          : "File Share: Local text QR ready (scannable)";
    });
  });

  copySharePublicLinkBtn.addEventListener("click", async () => {
    const link = (sharePublicLinkOutput.value || "").trim();
    if (!link) {
      fileShareStatus.textContent = "File Share: Local token not available";
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      fileShareStatus.textContent = "File Share: Local token copied";
    } catch {
      fileShareStatus.textContent = "File Share: Copy not allowed in this browser";
    }
  });
}

