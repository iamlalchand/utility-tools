const loadJokeBtn = document.getElementById("loadJokeBtn");
const loadQuoteBtn = document.getElementById("loadQuoteBtn");
const loadFactBtn = document.getElementById("loadFactBtn");
const funApiStatus = document.getElementById("funApiStatus");
const funApiOutput = document.getElementById("funApiOutput");

if (loadJokeBtn && loadQuoteBtn && loadFactBtn && funApiStatus && funApiOutput) {
  async function loadFunContent(type) {
    funApiStatus.textContent = `Fun API: Loading ${type}...`;
    funApiOutput.textContent = "Loading...";

    try {
      if (type === "joke") {
        const response = await fetch("https://official-joke-api.appspot.com/random_joke");
        if (!response.ok) throw new Error("Joke API unavailable");
        const payload = await response.json();
        funApiOutput.textContent = `${payload.setup}\n\n${payload.punchline}`;
        funApiStatus.textContent = "Fun API: Random joke loaded.";
        return;
      }

      if (type === "quote") {
        const response = await fetch("https://api.quotable.io/random");
        if (!response.ok) throw new Error("Quote API unavailable");
        const payload = await response.json();
        funApiOutput.textContent = `"${payload.content}"\n\n- ${payload.author}`;
        funApiStatus.textContent = "Fun API: Random quote loaded.";
        return;
      }

      const response = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en");
      if (!response.ok) throw new Error("Facts API unavailable");
      const payload = await response.json();
      funApiOutput.textContent = payload.text || "No fact available.";
      funApiStatus.textContent = "Fun API: Random fact loaded.";
    } catch (error) {
      funApiStatus.textContent = `Fun API: ${error.message}`;
      funApiOutput.textContent = "Could not load content. Try again.";
    }
  }

  loadJokeBtn.addEventListener("click", () => loadFunContent("joke"));
  loadQuoteBtn.addEventListener("click", () => loadFunContent("quote"));
  loadFactBtn.addEventListener("click", () => loadFunContent("fact"));
}

renderBudget();

const gameTabs = Array.from(document.querySelectorAll("[data-game-tab]"));
const gameScreens = Array.from(document.querySelectorAll("[data-game-screen]"));

function setActiveGameTab(gameKey) {
  if (!gameTabs.length || !gameScreens.length) return;
  gameTabs.forEach((tab) => {
    const active = tab.dataset.gameTab === gameKey;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });
  gameScreens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.gameScreen === gameKey);
  });
}

if (gameTabs.length && gameScreens.length) {
  gameTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveGameTab(tab.dataset.gameTab);
    });
  });
  const defaultGameTab = gameTabs.find((tab) => tab.classList.contains("active"))?.dataset.gameTab || "tic";
  setActiveGameTab(defaultGameTab);
}

function randomFromList(values) {
  if (!Array.isArray(values) || !values.length) return null;
  const index = randomInt(0, values.length - 1);
  return values[index];
}

function randomInt(min, max) {
  const start = Math.ceil(min);
  const end = Math.floor(max);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return start;

  const span = end - start + 1;
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.getRandomValues) {
    const uintMax = 0x100000000;
    const threshold = Math.floor(uintMax / span) * span;
    const buffer = new Uint32Array(1);
    let value = 0;
    do {
      cryptoApi.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= threshold);
    return start + (value % span);
  }

  return start + Math.floor(Math.random() * span);
}

const tttCells = Array.from(document.querySelectorAll(".ttt-cell"));
