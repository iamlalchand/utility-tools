const caseEditor = document.getElementById("caseEditor");
const casePanel = document.querySelector(".case-panel[data-tool-panel='case']");
const caseCopyBtn = document.getElementById("caseCopyBtn");
const caseDownloadBtn = document.getElementById("caseDownloadBtn");
const caseClearBtn = document.getElementById("caseClearBtn");
const caseCounts = document.getElementById("caseCounts");
const caseStatus = document.getElementById("caseStatus");
const caseThemeSelect = document.getElementById("caseThemeSelect");
const caseThemeStorageKey = "ssCaseEditorTheme";

function applyCaseTheme(theme) {
  const allowedThemes = new Set(["blush", "slate", "coffee"]);
  const selected = allowedThemes.has(theme) ? theme : "blush";
  if (casePanel) casePanel.dataset.caseTheme = selected;
  if (caseThemeSelect) caseThemeSelect.value = selected;
}

function toCapitalizedCase(text) {
  return text.toLowerCase().replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

function toTitleCase(text) {
  const skipWords = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "the", "to", "up"]);
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word, index, arr) => {
      if (!word) return word;
      if (index !== 0 && index !== arr.length - 1 && skipWords.has(word)) return word;
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function toSentenceCase(text) {
  return text
    .toLowerCase()
    .replace(/(^\s*[a-z]|[.!?]\s*[a-z])/g, (match) => match.toUpperCase());
}

function toInvertCase(text) {
  return text
    .split("")
    .map((ch) => {
      const upper = ch.toUpperCase();
      const lower = ch.toLowerCase();
      if (ch !== lower && ch === upper) return lower;
      if (ch !== upper && ch === lower) return upper;
      return ch;
    })
    .join("");
}

function toAlternatingCase(text) {
  let useUpper = false;
  return text
    .split("")
    .map((ch) => {
      if (!/[a-z]/i.test(ch)) return ch;
      const next = useUpper ? ch.toUpperCase() : ch.toLowerCase();
      useUpper = !useUpper;
      return next;
    })
    .join("");
}

function updateCaseCounts(text) {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split(/\r?\n/).length : 0;
  caseCounts.textContent = `Character Count: ${chars} | Word Count: ${words} | Line Count: ${lines}`;
}

function applyCaseMode(text, mode) {
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  if (mode === "title") return toTitleCase(text);
  if (mode === "sentence") return toSentenceCase(text);
  if (mode === "capitalized") return toCapitalizedCase(text);
  if (mode === "alternating") return toAlternatingCase(text);
  if (mode === "invert") return toInvertCase(text);
  return text;
}

function normalizeCaseModeLabel(mode) {
  const labels = {
    upper: "UPPER CASE",
    lower: "lower case",
    title: "Title Case",
    sentence: "Sentence case",
    capitalized: "Capitalized Case",
    alternating: "aLtErNaTiNg cAsE",
    invert: "InVeRsE cAsE",
  };
  return labels[mode] || mode;
}

if (caseEditor && caseStatus && caseCounts) {
  applyCaseTheme(localStorage.getItem(caseThemeStorageKey) || "blush");
  updateCaseCounts(caseEditor.value);

  caseEditor.addEventListener("input", () => {
    updateCaseCounts(caseEditor.value);
    caseStatus.textContent = "Case Converter: Text updated";
  });

  document.querySelectorAll(".case-actions [data-case]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = caseEditor.value;
      if (!input) {
        caseStatus.textContent = "Case Converter: Enter text first";
        return;
      }

      const mode = button.dataset.case;
      caseEditor.value = applyCaseMode(input, mode);
      updateCaseCounts(caseEditor.value);
      caseStatus.textContent = `Case Converter: ${normalizeCaseModeLabel(mode)} applied`;
    });
  });
}

if (caseThemeSelect && casePanel) {
  caseThemeSelect.addEventListener("change", () => {
    const nextTheme = caseThemeSelect.value;
    applyCaseTheme(nextTheme);
    localStorage.setItem(caseThemeStorageKey, nextTheme);
  });
}

if (caseCopyBtn && caseEditor && caseStatus) {
  caseCopyBtn.addEventListener("click", async () => {
    const value = caseEditor.value;
    if (!value) {
      caseStatus.textContent = "Case Converter: No text to copy";
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      caseStatus.textContent = "Case Converter: Copied";
    } catch {
      caseStatus.textContent = "Case Converter: Copy not allowed";
    }
  });
}

if (caseDownloadBtn && caseEditor && caseStatus) {
  caseDownloadBtn.addEventListener("click", () => {
    const value = caseEditor.value;
    if (!value) {
      caseStatus.textContent = "Case Converter: No text to download";
      return;
    }

    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "case-converted.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    caseStatus.textContent = "Case Converter: Download started";
  });
}

if (caseClearBtn && caseEditor && caseStatus && caseCounts) {
  caseClearBtn.addEventListener("click", () => {
    caseEditor.value = "";
    updateCaseCounts("");
    caseStatus.textContent = "Case Converter: Cleared";
  });
}

