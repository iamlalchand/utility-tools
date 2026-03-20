const diffLeft = document.getElementById("diffLeft");
const diffRight = document.getElementById("diffRight");
const runDiffBtn = document.getElementById("runDiffBtn");
const diffSummary = document.getElementById("diffSummary");
const diffOutput = document.getElementById("diffOutput");

if (runDiffBtn) {
  runDiffBtn.addEventListener("click", () => {
    const leftLines = (diffLeft.value || "").split("\n");
    const rightLines = (diffRight.value || "").split("\n");
    const max = Math.max(leftLines.length, rightLines.length);
    const changes = [];

    for (let i = 0; i < max; i += 1) {
      const left = leftLines[i] ?? "";
      const right = rightLines[i] ?? "";
      if (left !== right) {
        changes.push(`Line ${i + 1}\n- ${left}\n+ ${right}`);
      }
    }

    if (!changes.length) {
      diffSummary.textContent = "Diff Checker: No differences found";
      diffOutput.textContent = "Texts are identical.";
      return;
    }

    diffSummary.textContent = `Diff Checker: ${changes.length} line(s) changed`;
    diffOutput.textContent = changes.slice(0, 50).join("\n\n");
  });
}

