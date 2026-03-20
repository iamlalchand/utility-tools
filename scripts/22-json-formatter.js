const jsonInput = document.getElementById("jsonInput");
const jsonValidateBtn = document.getElementById("jsonValidateBtn");
const jsonFormatBtn = document.getElementById("jsonFormatBtn");
const jsonIndentSelect = document.getElementById("jsonIndentSelect");
const jsonMinifyBtn = document.getElementById("jsonMinifyBtn");
const jsonCopyBtn = document.getElementById("jsonCopyBtn");
const jsonUploadBtn = document.getElementById("jsonUploadBtn");
const jsonUploadInput = document.getElementById("jsonUploadInput");
const jsonDownloadBtn = document.getElementById("jsonDownloadBtn");
const jsonClearBtn = document.getElementById("jsonClearBtn");
const jsonStatus = document.getElementById("jsonStatus");
const jsonOutput = document.getElementById("jsonOutput");

function getJsonIndent() {
  const option = jsonIndentSelect?.value;
  if (option === "tab") return "\t";
  const parsed = Number.parseInt(option || "2", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2;
}

function setJsonOutput(value) {
  if (jsonOutput) jsonOutput.value = value;
}

function getJsonOutput() {
  return jsonOutput?.value || "";
}

function parseJsonFromInput() {
  const text = jsonInput?.value || "";
  if (!text.trim()) throw new Error("Enter JSON first");
  return JSON.parse(text);
}

if (jsonValidateBtn) {
  jsonValidateBtn.addEventListener("click", () => {
    try {
      parseJsonFromInput();
      if (jsonStatus) jsonStatus.textContent = "JSON Formatter: Valid JSON";
    } catch (error) {
      if (jsonStatus) jsonStatus.textContent = `JSON Formatter: ${error.message}`;
    }
  });
}

if (jsonFormatBtn) {
  jsonFormatBtn.addEventListener("click", () => {
    try {
      const parsed = parseJsonFromInput();
      const formatted = JSON.stringify(parsed, null, getJsonIndent());
      setJsonOutput(formatted);
      if (jsonStatus) jsonStatus.textContent = "JSON Formatter: Formatted successfully";
    } catch (error) {
      if (jsonStatus) jsonStatus.textContent = `JSON Formatter: ${error.message}`;
    }
  });
}

if (jsonMinifyBtn) {
  jsonMinifyBtn.addEventListener("click", () => {
    try {
      const parsed = parseJsonFromInput();
      const minified = JSON.stringify(parsed);
      setJsonOutput(minified);
      if (jsonStatus) jsonStatus.textContent = "JSON Formatter: Minified successfully";
    } catch (error) {
      if (jsonStatus) jsonStatus.textContent = `JSON Formatter: ${error.message}`;
    }
  });
}

if (jsonCopyBtn) {
  jsonCopyBtn.addEventListener("click", async () => {
    const value = getJsonOutput().trim();
    if (!value) {
      if (jsonStatus) jsonStatus.textContent = "JSON Formatter: No output to copy";
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      if (jsonStatus) jsonStatus.textContent = "JSON Formatter: Output copied";
    } catch {
      if (jsonStatus) jsonStatus.textContent = "JSON Formatter: Copy not allowed";
    }
  });
}

if (jsonUploadBtn && jsonUploadInput) {
  jsonUploadBtn.addEventListener("click", () => {
    jsonUploadInput.click();
  });

  jsonUploadInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      if (jsonInput) jsonInput.value = text;
      if (jsonStatus) jsonStatus.textContent = `JSON Formatter: Loaded ${file.name}`;
    } catch {
      if (jsonStatus) jsonStatus.textContent = "JSON Formatter: Could not read selected file";
    } finally {
      jsonUploadInput.value = "";
    }
  });
}

if (jsonDownloadBtn) {
  jsonDownloadBtn.addEventListener("click", () => {
    const output = getJsonOutput().trim();
    if (!output) {
      if (jsonStatus) jsonStatus.textContent = "JSON Formatter: No output to download";
      return;
    }
    const blob = new Blob([output], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "formatted.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    if (jsonStatus) jsonStatus.textContent = "JSON Formatter: Output downloaded";
  });
}

if (jsonClearBtn) {
  jsonClearBtn.addEventListener("click", () => {
    if (jsonInput) jsonInput.value = "";
    setJsonOutput("");
    if (jsonUploadInput) jsonUploadInput.value = "";
    if (jsonStatus) jsonStatus.textContent = "JSON Formatter: Ready";
  });
}

