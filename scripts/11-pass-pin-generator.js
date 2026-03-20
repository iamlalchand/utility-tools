const passPinLength = document.getElementById("passPinLength");
const generateStrongPassBtn = document.getElementById("generateStrongPassBtn");
const generatePinBtn = document.getElementById("generatePinBtn");
const passPinOutput = document.getElementById("passPinOutput");
const copyPassPinBtn = document.getElementById("copyPassPinBtn");
const passPinStatus = document.getElementById("passPinStatus");
let lastPassPinValue = "";

function randomString(chars, length) {
  let output = "";
  for (let i = 0; i < length; i += 1) {
    output += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return output;
}

if (generateStrongPassBtn) {
  generateStrongPassBtn.addEventListener("click", () => {
    const length = Number(passPinLength.value) || 12;
    if (length < 4 || length > 32) {
      passPinStatus.textContent = "Pass/PIN: Length should be between 4 and 32";
      return;
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    lastPassPinValue = randomString(chars, length);
    passPinOutput.value = lastPassPinValue;
    passPinStatus.textContent = "Pass/PIN: Strong password generated";
  });
}

if (generatePinBtn) {
  generatePinBtn.addEventListener("click", () => {
    const pinLength = 6;
    lastPassPinValue = randomString("0123456789", pinLength);
    passPinOutput.value = lastPassPinValue;
    passPinStatus.textContent = "Pass/PIN: Numeric PIN generated";
  });
}

if (copyPassPinBtn) {
  copyPassPinBtn.addEventListener("click", async () => {
    const value = passPinOutput.value || lastPassPinValue;
    if (!value) {
      passPinStatus.textContent = "Pass/PIN: Generate value first";
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      passPinStatus.textContent = "Pass/PIN: Copied";
    } catch {
      passPinStatus.textContent = "Pass/PIN: Copy not allowed";
    }
  });
}

