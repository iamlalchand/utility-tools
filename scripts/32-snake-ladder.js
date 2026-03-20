const snakeBoard = document.getElementById("snakeBoard");
const snakeModeHumanBtn = document.getElementById("snakeModeHumanBtn");
const snakeModeCpuBtn = document.getElementById("snakeModeCpuBtn");
const snakeRollBtn = document.getElementById("snakeRollBtn");
const snakeResetBtn = document.getElementById("snakeResetBtn");
const snakeTurn = document.getElementById("snakeTurn");
const snakeDice = document.getElementById("snakeDice");
const snakeStatus = document.getElementById("snakeStatus");

if (
  snakeBoard &&
  snakeModeHumanBtn &&
  snakeModeCpuBtn &&
  snakeRollBtn &&
  snakeResetBtn &&
  snakeTurn &&
  snakeDice &&
  snakeStatus
) {
  const snakeColors = ["#ef4444", "#2563eb"];
  const ladders = new Map([
    [3, 16],
    [8, 30],
    [28, 84],
    [58, 77],
    [75, 86],
    [80, 99],
  ]);
  const snakes = new Map([
    [17, 7],
    [52, 29],
    [57, 40],
    [62, 22],
    [88, 48],
    [95, 56],
    [97, 78],
  ]);
  const snakeCellTokenMap = new Map();
  let snakeMode = "human";
  let snakePlayers = [];
  let snakeTurnIndex = 0;
  let snakeFinished = false;
  let snakeCpuTimer = null;

  function clearSnakeCpuTimer() {
    if (!snakeCpuTimer) return;
    clearTimeout(snakeCpuTimer);
    snakeCpuTimer = null;
  }

  function createSnakeToken(color, label) {
    const token = document.createElement("span");
    token.className = "snake-token";
    token.style.background = color;
    token.title = label;
    return token;
  }

  function appendSnakeCell(number) {
    const cell = document.createElement("div");
    cell.className = "snake-cell";
    const tones = ["tone-a", "tone-b", "tone-c", "tone-d", "tone-e"];
    cell.classList.add(tones[number % tones.length]);
    if (ladders.has(number)) cell.classList.add("ladder-start");
    if (snakes.has(number)) cell.classList.add("snake-start");
    if (ladders.has(number)) cell.dataset.jump = `L-${ladders.get(number)}`;
    if (snakes.has(number)) cell.dataset.jump = `S-${snakes.get(number)}`;

    const tokenWrap = document.createElement("div");
    tokenWrap.className = "snake-token-wrap";
    snakeCellTokenMap.set(number, tokenWrap);

    const numberEl = document.createElement("span");
    numberEl.className = "snake-number";
    numberEl.textContent = String(number);

    cell.appendChild(tokenWrap);
    cell.appendChild(numberEl);
    snakeBoard.appendChild(cell);
  }

  function createSnakeBoard() {
    snakeBoard.innerHTML = "";
    snakeCellTokenMap.clear();

    for (let row = 9; row >= 0; row -= 1) {
      const rowStart = row * 10 + 1;
      const rowEnd = rowStart + 9;
      if (row % 2 === 0) {
        for (let number = rowStart; number <= rowEnd; number += 1) {
          appendSnakeCell(number);
        }
      } else {
        for (let number = rowEnd; number >= rowStart; number -= 1) {
          appendSnakeCell(number);
        }
      }
    }
  }

  function createSnakePlayers() {
    snakePlayers = [
      { name: "Player 1", color: snakeColors[0], position: 0, isCpu: false },
      { name: snakeMode === "cpu" ? "Computer" : "Player 2", color: snakeColors[1], position: 0, isCpu: snakeMode === "cpu" },
    ];
    snakeTurnIndex = 0;
  }

  function getSnakeCurrentPlayer() {
    return snakePlayers[snakeTurnIndex];
  }

  function renderSnakeBoard() {
    snakeCellTokenMap.forEach((tokenWrap) => {
      tokenWrap.innerHTML = "";
    });

    snakePlayers.forEach((player) => {
      if (player.position <= 0) return;
      const slot = snakeCellTokenMap.get(player.position);
      if (!slot) return;
      slot.appendChild(createSnakeToken(player.color, player.name));
    });
  }

  function renderSnakeTurn() {
    const player = getSnakeCurrentPlayer();
    if (!player) {
      snakeTurn.textContent = "Turn: -";
      return;
    }
    snakeTurn.textContent = `Turn: ${player.name}`;
  }

  function renderSnakeState() {
    renderSnakeBoard();
    renderSnakeTurn();
  }

  function rollSnakeForCurrentPlayer() {
    if (snakeFinished) return;
    const player = getSnakeCurrentPlayer();
    if (!player) return;

    const dice = Math.floor(Math.random() * 6) + 1;
    snakeDice.textContent = `Dice: ${dice}`;
    let message = `${player.name} rolled ${dice}. `;
    const target = player.position + dice;

    if (target > 100) {
      message += "Need exact roll to reach 100.";
    } else {
      player.position = target;
      if (ladders.has(player.position)) {
        const destination = ladders.get(player.position);
        message += `Ladder: ${player.position} to ${destination}. `;
        player.position = destination;
      } else if (snakes.has(player.position)) {
        const destination = snakes.get(player.position);
        message += `Snake: ${player.position} to ${destination}. `;
        player.position = destination;
      } else {
        message += `Moved to ${player.position}. `;
      }
    }

    if (player.position === 100) {
      snakeFinished = true;
      message += `${player.name} wins!`;
    }

    snakeStatus.textContent = message.trim();
    if (!snakeFinished) {
      snakeTurnIndex = (snakeTurnIndex + 1) % snakePlayers.length;
    }
    renderSnakeState();
    scheduleSnakeCpuTurn();
  }

  function scheduleSnakeCpuTurn() {
    clearSnakeCpuTimer();
    if (snakeFinished) return;
    const player = getSnakeCurrentPlayer();
    if (!player?.isCpu) return;
    snakeTurn.textContent = `Turn: ${player.name}`;
    snakeStatus.textContent = "Computer is rolling...";
    snakeCpuTimer = setTimeout(() => {
      rollSnakeForCurrentPlayer();
    }, 750);
  }

  function resetSnakeMatch() {
    clearSnakeCpuTimer();
    snakeFinished = false;
    createSnakePlayers();
    renderSnakeState();
    if (snakeMode === "cpu") {
      snakeStatus.textContent = "Single player mode active (You vs Computer).";
    } else {
      snakeStatus.textContent = "Reach 100 first to win.";
    }
    snakeDice.textContent = "Dice: -";
    scheduleSnakeCpuTurn();
  }

  function setSnakeMode(mode) {
    snakeMode = mode === "cpu" ? "cpu" : "human";
    snakeModeHumanBtn.classList.toggle("active", snakeMode === "human");
    snakeModeCpuBtn.classList.toggle("active", snakeMode === "cpu");
    resetSnakeMatch();
  }

  snakeRollBtn.addEventListener("click", () => {
    if (snakeFinished) {
      snakeStatus.textContent = "Match finished. Start New Match.";
      return;
    }
    const player = getSnakeCurrentPlayer();
    if (!player) return;
    if (player.isCpu) {
      snakeStatus.textContent = "Computer turn in progress...";
      return;
    }
    rollSnakeForCurrentPlayer();
  });

  snakeResetBtn.addEventListener("click", resetSnakeMatch);
  snakeModeHumanBtn.addEventListener("click", () => setSnakeMode("human"));
  snakeModeCpuBtn.addEventListener("click", () => setSnakeMode("cpu"));

  createSnakeBoard();
  setSnakeMode("human");
}
