const calcExpressionInput = document.getElementById("calcExpressionInput");
const calcExpressionPreview = document.getElementById("calcExpressionPreview");
const calcMainResult = document.getElementById("calcMainResult");
const calcModeIndicator = document.getElementById("calcModeIndicator");
const calcInverseIndicator = document.getElementById("calcInverseIndicator");
const calcResult = document.getElementById("calcResult");
const calcKeyButtons = document.querySelectorAll(".calc-keypad [data-calc-key], .calc-keypad [data-calc-action]");
const calcAngleButtons = document.querySelectorAll(".calc-keypad [data-calc-action='set-angle']");

if (calcExpressionInput && calcExpressionPreview && calcMainResult && calcModeIndicator && calcInverseIndicator && calcResult) {
  let angleMode = "DEG";
  let inverseMode = false;
  let lastAnswer = 0;

  const allowedIdentifiers = new Set([
    "sinFn",
    "cosFn",
    "tanFn",
    "asinFn",
    "acosFn",
    "atanFn",
    "logFn",
    "lnFn",
    "sqrtFn",
    "factorialFn",
    "ans",
    "pi",
    "E_CONST",
  ]);

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "Math Error";
    if (Number.isInteger(value)) return `${value}`;
    return `${Number.parseFloat(value.toPrecision(12))}`;
  }

  function setStatus(message) {
    calcResult.textContent = `Calculator: ${message}`;
  }

  function setMainValue(value) {
    calcMainResult.textContent = formatNumber(value);
  }

  function updateExpressionPreview() {
    const expression = calcExpressionInput.value.trim();
    calcExpressionPreview.textContent = expression || "-";
  }

  function updateModeUI() {
    calcModeIndicator.textContent = angleMode === "DEG" ? "Deg" : "Rad";
    calcInverseIndicator.textContent = inverseMode ? "Inv On" : "Inv Off";
    calcAngleButtons.forEach((button) => {
      const isActive = button.dataset.mode === angleMode;
      button.classList.toggle("is-active", isActive);
    });
  }

  function toRadians(value) {
    return angleMode === "DEG" ? (value * Math.PI) / 180 : value;
  }

  function fromRadians(value) {
    return angleMode === "DEG" ? (value * 180) / Math.PI : value;
  }

  function factorial(number) {
    if (!Number.isInteger(number) || number < 0) {
      throw new Error("Invalid factorial input");
    }
    if (number > 170) {
      throw new Error("Factorial overflow");
    }
    let output = 1;
    for (let current = 2; current <= number; current += 1) output *= current;
    return output;
  }

  function convertPostfixFactorial(expression) {
    let output = expression;
    const pattern = /(\d+(?:\.\d+)?|ans|pi|E_CONST|\([^()]*\))!/g;

    while (pattern.test(output)) {
      output = output.replace(pattern, "factorialFn($1)");
      pattern.lastIndex = 0;
    }

    if (output.includes("!")) {
      throw new Error("Invalid factorial usage");
    }

    return output;
  }

  function normalizeExpression(rawExpression) {
    let expression = `${rawExpression || ""}`.trim();
    expression = expression.replace(/×/g, "*").replace(/÷/g, "/");
    expression = expression.replace(/π/g, "pi").replace(/√/g, "sqrt(");
    expression = expression.replace(/\^/g, "**");
    expression = expression.replace(/%/g, "/100");
    expression = expression.replace(/\bans\b/gi, "ans");
    expression = expression.replace(/\be\b/gi, "E_CONST");
    expression = expression.replace(/\basin\s*\(/gi, "asinFn(");
    expression = expression.replace(/\bacos\s*\(/gi, "acosFn(");
    expression = expression.replace(/\batan\s*\(/gi, "atanFn(");
    expression = expression.replace(/\bsin\s*\(/gi, "sinFn(");
    expression = expression.replace(/\bcos\s*\(/gi, "cosFn(");
    expression = expression.replace(/\btan\s*\(/gi, "tanFn(");
    expression = expression.replace(/\blog\s*\(/gi, "logFn(");
    expression = expression.replace(/\bln\s*\(/gi, "lnFn(");
    expression = expression.replace(/\bsqrt\s*\(/gi, "sqrtFn(");
    expression = convertPostfixFactorial(expression);
    return expression;
  }

  function hasOnlyAllowedIdentifiers(normalizedExpression) {
    const identifiers = normalizedExpression.match(/[A-Za-z_]\w*/g) || [];
    return identifiers.every((identifier) => allowedIdentifiers.has(identifier));
  }

  function evaluateExpression(rawExpression) {
    const raw = `${rawExpression || ""}`.trim();
    if (!raw) {
      setStatus("Enter expression");
      return null;
    }

    if (!/^[0-9+\-*/^().,%!\sA-Za-zπ÷×√]+$/.test(raw)) {
      setStatus("Invalid characters");
      return null;
    }

    let normalized;
    try {
      normalized = normalizeExpression(raw);
    } catch {
      setStatus("Invalid expression");
      return null;
    }

    if (!hasOnlyAllowedIdentifiers(normalized)) {
      setStatus("Invalid expression");
      return null;
    }

    const sinFn = inverseMode
      ? (value) => fromRadians(Math.asin(value))
      : (value) => Math.sin(toRadians(value));
    const cosFn = inverseMode
      ? (value) => fromRadians(Math.acos(value))
      : (value) => Math.cos(toRadians(value));
    const tanFn = inverseMode
      ? (value) => fromRadians(Math.atan(value))
      : (value) => Math.tan(toRadians(value));
    const asinFn = (value) => fromRadians(Math.asin(value));
    const acosFn = (value) => fromRadians(Math.acos(value));
    const atanFn = (value) => fromRadians(Math.atan(value));
    const logFn = (value) => Math.log10(value);
    const lnFn = (value) => Math.log(value);
    const sqrtFn = (value) => Math.sqrt(value);
    const factorialFn = (value) => factorial(value);

    try {
      const value = Function(
        "sinFn",
        "cosFn",
        "tanFn",
        "asinFn",
        "acosFn",
        "atanFn",
        "logFn",
        "lnFn",
        "sqrtFn",
        "factorialFn",
        "ans",
        "pi",
        "E_CONST",
        `"use strict"; return (${normalized});`,
      )(
        sinFn,
        cosFn,
        tanFn,
        asinFn,
        acosFn,
        atanFn,
        logFn,
        lnFn,
        sqrtFn,
        factorialFn,
        lastAnswer,
        Math.PI,
        Math.E,
      );

      if (!Number.isFinite(value)) {
        setStatus("Math error");
        return null;
      }

      lastAnswer = value;
      setMainValue(value);
      setStatus("Done");
      updateExpressionPreview();
      return value;
    } catch {
      setStatus("Invalid expression");
      return null;
    }
  }

  function appendToken(token) {
    const value = token === "√" ? "sqrt(" : token;
    calcExpressionInput.value = `${calcExpressionInput.value}${value}`;
    updateExpressionPreview();
    calcExpressionInput.focus();
  }

  function clearAll() {
    calcExpressionInput.value = "";
    updateExpressionPreview();
    setMainValue(0);
    setStatus("Ready");
  }

  function handleFactorialAction() {
    const source = calcExpressionInput.value.trim();
    const baseValue = source ? evaluateExpression(source) : lastAnswer;
    if (baseValue === null) return;
    if (!Number.isInteger(baseValue) || baseValue < 0 || baseValue > 170) {
      setStatus("Factorial supports integers 0-170");
      return;
    }

    const value = factorial(baseValue);
    lastAnswer = value;
    calcExpressionInput.value = `${formatNumber(baseValue)}!`;
    updateExpressionPreview();
    setMainValue(value);
    setStatus("Done");
  }

  calcKeyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.calcAction;
      if (action === "set-angle") {
        angleMode = button.dataset.mode === "RAD" ? "RAD" : "DEG";
        updateModeUI();
        setStatus(`Mode ${angleMode}`);
        return;
      }

      if (action === "toggle-inverse") {
        inverseMode = !inverseMode;
        updateModeUI();
        setStatus(inverseMode ? "Inverse On" : "Inverse Off");
        return;
      }

      if (action === "clear-all") {
        clearAll();
        return;
      }

      if (action === "evaluate") {
        evaluateExpression(calcExpressionInput.value);
        return;
      }

      if (action === "factorial") {
        handleFactorialAction();
        return;
      }

      const token = button.dataset.calcKey || "";
      appendToken(token);
    });
  });

  calcExpressionInput.addEventListener("input", updateExpressionPreview);
  calcExpressionInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      evaluateExpression(calcExpressionInput.value);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      clearAll();
    }
  });

  updateModeUI();
  updateExpressionPreview();
  setMainValue(0);
  setStatus("Ready");
}
