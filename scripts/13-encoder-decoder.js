const encodeType = document.getElementById("encodeType");
const encodeInput = document.getElementById("encodeInput");
const encodeOutput = document.getElementById("encodeOutput");
const encodeBtn = document.getElementById("encodeBtn");
const decodeBtn = document.getElementById("decodeBtn");
const encodeStatus = document.getElementById("encodeStatus");

function encodeBase64Unicode(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

function decodeBase64Unicode(text) {
  return decodeURIComponent(escape(atob(text)));
}

if (encodeBtn) {
  encodeBtn.addEventListener("click", () => {
    try {
      const input = encodeInput.value;
      if (!input) {
        encodeStatus.textContent = "Encoder/Decoder: Enter text first";
        return;
      }

      const type = encodeType.value;
      const output = type === "url" ? encodeURIComponent(input) : encodeBase64Unicode(input);
      encodeOutput.value = output;
      encodeStatus.textContent = `Encoder/Decoder: ${type.toUpperCase()} encoded`;
    } catch (error) {
      encodeStatus.textContent = `Encoder/Decoder: ${error.message}`;
    }
  });
}

if (decodeBtn) {
  decodeBtn.addEventListener("click", () => {
    try {
      const input = encodeInput.value;
      if (!input) {
        encodeStatus.textContent = "Encoder/Decoder: Enter text first";
        return;
      }

      const type = encodeType.value;
      const output = type === "url" ? decodeURIComponent(input) : decodeBase64Unicode(input);
      encodeOutput.value = output;
      encodeStatus.textContent = `Encoder/Decoder: ${type.toUpperCase()} decoded`;
    } catch {
      encodeStatus.textContent = "Encoder/Decoder: Invalid input for selected decode type";
    }
  });
}

