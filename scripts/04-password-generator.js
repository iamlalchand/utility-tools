const passLen = document.getElementById("passLen");
const passLenValue = document.getElementById("passLenValue");
const genPassBtn = document.getElementById("genPassBtn");
const passResult = document.getElementById("passResult");
const passOutput = document.getElementById("passOutput");
const regenPassBtn = document.getElementById("regenPassBtn");
const copyPassBtn = document.getElementById("copyPassBtn");
const passStrengthFill = document.getElementById("passStrengthFill");
const passStrengthLabel = document.getElementById("passStrengthLabel");
const passOptUpper = document.getElementById("passOptUpper");
const passOptLower = document.getElementById("passOptLower");
const passOptNumber = document.getElementById("passOptNumber");
const passOptSymbol = document.getElementById("passOptSymbol");
let latestPassword = "";

const PASS_CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  number: "0123456789",
  symbol: "!@#$%^&*()-_=+[]{};:,.?/\\|~`",
};

function getRandomIndex(limit) {
  if (!Number.isFinite(limit) || limit <= 0) return 0;

  if (window.crypto && typeof window.crypto.getRandomValues === "function") {
    const maxUint = 0xffffffff;
    const threshold = maxUint - ((maxUint + 1) % limit);
    const values = new Uint32Array(1);
    let randomValue = 0;
    do {
      window.crypto.getRandomValues(values);
      randomValue = values[0];
    } while (randomValue > threshold);
    return randomValue % limit;
  }

  return Math.floor(Math.random() * limit);
}

function getSelectedPasswordSets() {
  const selected = [];
  if (passOptUpper.checked) selected.push(PASS_CHARSETS.upper);
  if (passOptLower.checked) selected.push(PASS_CHARSETS.lower);
  if (passOptNumber.checked) selected.push(PASS_CHARSETS.number);
  if (passOptSymbol.checked) selected.push(PASS_CHARSETS.symbol);
  return selected;
}

function scorePassword(password, poolSize, selectedSetCount) {
  if (!password) {
    return { score: 0, label: "-", bits: 0, key: "weak" };
  }

  const bits = Math.round(password.length * Math.log2(Math.max(poolSize, 1)));
  let key = "weak";
  let label = "Weak";

  if (bits >= 96 && selectedSetCount >= 3 && password.length >= 14) {
    key = "strong";
    label = "Strong";
  } else if (bits >= 72 && selectedSetCount >= 2 && password.length >= 10) {
    key = "good";
    label = "Good";
  } else if (bits >= 48) {
    key = "fair";
    label = "Fair";
  }

  let score = Math.round((bits / 120) * 100);
  score = Math.max(8, Math.min(100, score));

  if (key === "strong") score = Math.max(score, 88);
  else if (key === "good") score = Math.max(score, 66);
  else if (key === "fair") score = Math.max(score, 42);
  else score = Math.min(score, 34);

  return { score, label, bits, key };
}

function updatePasswordStrengthUi(strength) {
  passStrengthFill.style.width = `${strength.score}%`;
  passStrengthFill.dataset.strength = strength.key;
  passStrengthLabel.textContent = `Strength: ${strength.label}${strength.bits ? ` (${strength.bits} bits)` : ""}`;
}

function generatePassword(length, selectedSets) {
  const allChars = selectedSets.join("");
  const passwordChars = [];

  selectedSets.forEach((set) => {
    passwordChars.push(set[getRandomIndex(set.length)]);
  });

  while (passwordChars.length < length) {
    passwordChars.push(allChars[getRandomIndex(allChars.length)]);
  }

  for (let i = passwordChars.length - 1; i > 0; i -= 1) {
    const j = getRandomIndex(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}

function updatePasswordLengthLabel() {
  passLenValue.textContent = passLen.value;
}

function refreshPassword({ announce = true } = {}) {
  const length = Number(passLen.value);
  updatePasswordLengthLabel();

  if (!Number.isInteger(length) || length < 6 || length > 64) {
    latestPassword = "";
    passOutput.value = "";
    passResult.textContent = "Password: Length should be 6 to 64";
    updatePasswordStrengthUi({ score: 0, label: "-", bits: 0, key: "weak" });
    return;
  }

  const selectedSets = getSelectedPasswordSets();
  if (!selectedSets.length) {
    latestPassword = "";
    passOutput.value = "";
    passResult.textContent = "Password: Select at least one character type";
    updatePasswordStrengthUi({ score: 0, label: "-", bits: 0, key: "weak" });
    return;
  }

  if (length < selectedSets.length) {
    latestPassword = "";
    passOutput.value = "";
    passResult.textContent = `Password: Minimum length should be ${selectedSets.length}`;
    updatePasswordStrengthUi({ score: 0, label: "-", bits: 0, key: "weak" });
    return;
  }

  latestPassword = generatePassword(length, selectedSets);
  passOutput.value = latestPassword;

  const poolSize = selectedSets.reduce((total, set) => total + set.length, 0);
  updatePasswordStrengthUi(scorePassword(latestPassword, poolSize, selectedSets.length));
  passResult.textContent = announce ? "Password Generator: New password generated" : "Password Generator: Ready";
}

genPassBtn.addEventListener("click", () => {
  refreshPassword({ announce: true });
});

regenPassBtn.addEventListener("click", () => {
  refreshPassword({ announce: true });
});

passLen.addEventListener("input", () => {
  refreshPassword({ announce: false });
});

[passOptUpper, passOptLower, passOptNumber, passOptSymbol].forEach((input) => {
  input.addEventListener("change", () => {
    refreshPassword({ announce: false });
  });
});

copyPassBtn.addEventListener("click", async () => {
  if (!latestPassword) {
    passResult.textContent = "Password: Generate first";
    return;
  }

  try {
    await navigator.clipboard.writeText(latestPassword);
    passResult.textContent = "Password copied";
  } catch {
    passResult.textContent = "Copy not allowed in this browser";
  }
});

refreshPassword({ announce: false });

