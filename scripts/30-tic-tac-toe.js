const tttStatus = document.getElementById("tttStatus");
const tttResetBtn = document.getElementById("tttResetBtn");
const tttModeHumanBtn = document.getElementById("tttModeHumanBtn");
const tttModeCpuBtn = document.getElementById("tttModeCpuBtn");

if (tttCells.length && tttStatus && tttResetBtn && tttModeHumanBtn && tttModeCpuBtn) {
  const tttWinningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  let tttMode = "human";
  let tttCurrentTurn = "X";
  let tttBoard = Array(9).fill("");
  let tttLocked = false;
  let tttFinished = false;
  let tttCpuTimer = null;

  function clearTttCpuTimer() {
    if (!tttCpuTimer) return;
    clearTimeout(tttCpuTimer);
    tttCpuTimer = null;
  }

  function getTttModeLabel() {
    return tttMode === "cpu" ? "Computer vs Human" : "Human vs Human";
  }

  function getTttWinner(board) {
    for (const [a, b, c] of tttWinningLines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return "";
  }

  function findLineMove(board, symbol) {
    for (const [a, b, c] of tttWinningLines) {
      const line = [board[a], board[b], board[c]];
      const countSymbol = line.filter((item) => item === symbol).length;
      const countEmpty = line.filter((item) => item === "").length;
      if (countSymbol === 2 && countEmpty === 1) {
        if (board[a] === "") return a;
        if (board[b] === "") return b;
        if (board[c] === "") return c;
      }
    }
    return -1;
  }

  function getCpuTttMove(board) {
    const winMove = findLineMove(board, "O");
    if (winMove >= 0) return winMove;

    const blockMove = findLineMove(board, "X");
    if (blockMove >= 0) return blockMove;

    if (board[4] === "") return 4;

    const cornerMove = randomFromList(
      [0, 2, 6, 8].filter((index) => board[index] === ""),
    );
    if (cornerMove !== null) return cornerMove;

    const sideMove = randomFromList(
      [1, 3, 5, 7].filter((index) => board[index] === ""),
    );
    if (sideMove !== null) return sideMove;

    return board.findIndex((cell) => cell === "");
  }

  function getTttPlayerLabel(symbol) {
    if (tttMode === "cpu" && symbol === "O") return "Computer";
    return `Player ${symbol}`;
  }

  function renderTtt() {
    tttCells.forEach((cell, index) => {
      const mark = tttBoard[index];
      cell.textContent = mark;
      cell.disabled = Boolean(mark) || tttLocked || tttFinished;
      cell.setAttribute("aria-label", mark ? `Cell ${index + 1}: ${mark}` : `Cell ${index + 1}`);
    });
  }

  function setTttStatus(message = "") {
    if (message) {
      tttStatus.textContent = message;
      return;
    }
    tttStatus.textContent = `Mode: ${getTttModeLabel()} | Turn: ${getTttPlayerLabel(tttCurrentTurn)}`;
  }

  function finishTttTurn() {
    const winner = getTttWinner(tttBoard);
    if (winner) {
      tttFinished = true;
      setTttStatus(`Mode: ${getTttModeLabel()} | ${getTttPlayerLabel(winner)} wins!`);
      renderTtt();
      return;
    }

    if (tttBoard.every((cell) => cell)) {
      tttFinished = true;
      setTttStatus(`Mode: ${getTttModeLabel()} | Match Draw`);
      renderTtt();
      return;
    }

    tttCurrentTurn = tttCurrentTurn === "X" ? "O" : "X";
    renderTtt();
    setTttStatus();

    if (tttMode === "cpu" && tttCurrentTurn === "O" && !tttFinished) {
      tttLocked = true;
      renderTtt();
      setTttStatus("Mode: Computer vs Human | Computer is thinking...");
      clearTttCpuTimer();
      tttCpuTimer = setTimeout(() => {
        tttLocked = false;
        const move = getCpuTttMove(tttBoard);
        if (move >= 0) {
          tttBoard[move] = "O";
          finishTttTurn();
          return;
        }
        tttFinished = true;
        setTttStatus("Mode: Computer vs Human | Match Draw");
        renderTtt();
      }, 380);
    }
  }

  function resetTtt() {
    clearTttCpuTimer();
    tttBoard = Array(9).fill("");
    tttCurrentTurn = "X";
    tttFinished = false;
    tttLocked = false;
    renderTtt();
    setTttStatus();
  }

  function setTttMode(mode) {
    tttMode = mode === "cpu" ? "cpu" : "human";
    tttModeHumanBtn.classList.toggle("active", tttMode === "human");
    tttModeCpuBtn.classList.toggle("active", tttMode === "cpu");
    resetTtt();
  }

  tttCells.forEach((cell) => {
    cell.addEventListener("click", () => {
      if (tttLocked || tttFinished) return;
      const index = Number(cell.dataset.tttIndex);
      if (!Number.isInteger(index) || tttBoard[index]) return;
      tttBoard[index] = tttCurrentTurn;
      finishTttTurn();
    });
  });

  tttResetBtn.addEventListener("click", resetTtt);
  tttModeHumanBtn.addEventListener("click", () => setTttMode("human"));
  tttModeCpuBtn.addEventListener("click", () => setTttMode("cpu"));
  setTttMode("human");
}

