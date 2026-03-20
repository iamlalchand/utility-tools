const regexPattern = document.getElementById("regexPattern");
const regexFlags = document.getElementById("regexFlags");
const regexText = document.getElementById("regexText");
const runRegexBtn = document.getElementById("runRegexBtn");
const regexSummary = document.getElementById("regexSummary");
const regexOutput = document.getElementById("regexOutput");

if (runRegexBtn) {
  runRegexBtn.addEventListener("click", () => {
    try {
      const pattern = regexPattern.value;
      const flags = regexFlags.value;
      const text = regexText.value;
      if (!pattern) {
        regexSummary.textContent = "Regex Tester: Enter pattern first";
        return;
      }

      const regex = new RegExp(pattern, flags);
      const matches = [];

      if (regex.global) {
        let match;
        while ((match = regex.exec(text)) !== null) {
          matches.push(`Match "${match[0]}" at index ${match.index}`);
          if (match[0] === "") regex.lastIndex += 1;
        }
      } else {
        const single = regex.exec(text);
        if (single) {
          matches.push(`Match "${single[0]}" at index ${single.index}`);
        }
      }

      if (!matches.length) {
        regexSummary.textContent = "Regex Tester: No matches";
        regexOutput.textContent = "No match found for this pattern.";
        return;
      }

      regexSummary.textContent = `Regex Tester: ${matches.length} match(es)`;
      regexOutput.textContent = matches.join("\n");
    } catch (error) {
      regexSummary.textContent = "Regex Tester: Invalid regex pattern/flags";
      regexOutput.textContent = error.message;
    }
  });
}

