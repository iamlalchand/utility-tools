const calcA = document.getElementById("calcA");
const calcB = document.getElementById("calcB");
const calcResult = document.getElementById("calcResult");

document.querySelectorAll("[data-op]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const a = Number(calcA.value);
    const b = Number(calcB.value);

    if (Number.isNaN(a) || Number.isNaN(b) || calcA.value === "" || calcB.value === "") {
      calcResult.textContent = "Result: Please enter both numbers";
      return;
    }

    const op = btn.dataset.op;
    let result;

    if (op === "+") result = a + b;
    if (op === "-") result = a - b;
    if (op === "*") result = a * b;
    if (op === "/") {
      if (b === 0) {
        calcResult.textContent = "Result: Cannot divide by zero";
        return;
      }
      result = a / b;
    }

    calcResult.textContent = `Result: ${result}`;
  });
});

