const ludoTrack = document.getElementById("ludoTrack");
const ludoModeHumanBtn = document.getElementById("ludoModeHumanBtn");
const ludoModeCpuBtn = document.getElementById("ludoModeCpuBtn");
const ludoPlayerButtons = Array.from(document.querySelectorAll("[data-ludo-players]"));
const ludoRollBtn = document.getElementById("ludoRollBtn");
const ludoResetBtn = document.getElementById("ludoResetBtn");
const ludoTurn = document.getElementById("ludoTurn");
const ludoDice = document.getElementById("ludoDice");
const ludoDiceChip = document.getElementById("ludoDiceChip");
const ludoStatus = document.getElementById("ludoStatus");
const ludoScore = document.getElementById("ludoScore");

if (
  ludoTrack &&
  ludoModeHumanBtn &&
  ludoModeCpuBtn &&
  ludoPlayerButtons.length &&
  ludoRollBtn &&
  ludoResetBtn &&
  ludoTurn &&
  ludoDice &&
  ludoDiceChip &&
  ludoStatus &&
  ludoScore
) {
  const ludoPath = [
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
    [5, 6], [4, 6], [3, 6], [2, 6], [1, 6],
    [0, 6], [0, 7], [0, 8], [1, 8], [2, 8],
    [3, 8], [4, 8], [5, 8], [6, 9], [6, 10],
    [6, 11], [6, 12], [6, 13], [6, 14], [7, 14],
    [8, 14], [8, 13], [8, 12], [8, 11], [8, 10],
    [8, 9], [9, 8], [10, 8], [11, 8], [12, 8],
    [13, 8], [14, 8], [14, 7], [14, 6], [13, 6],
    [12, 6], [11, 6], [10, 6], [9, 6], [8, 5],
    [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
    [7, 0], [6, 0],
  ];
  const ludoGridSize = 15;
  const ludoPathCellIndexByKey = new Map(
    ludoPath.map(([row, col], index) => [`${row}-${col}`, index + 1]),
  );
  const ludoCellTokenMap = new Map();
  const LUDO_DEFAULT_RULES = {
    tokensPerPlayer: 4,
    entryRoll: 6,
    extraTurnOn: [6],
    maxConsecutiveSixes: 3,
    requireExactHome: true,
    allowStackingOwnTokens: true,
    safeCellsCaptureDisabled: true,
    autoSelectSingleMove: false,
    captureBonusTurn: false,
    finishBonusTurn: false,
    blockRuleEnabled: false,
  };
  let ludoMode = "human";
  let ludoPlayerCount = 2;
  let ludoEngine = null;
  let ludoCpuTimer = null;

  class BoardFactory {
    static create(boardType) {
      if (boardType === 2) return this.create2PlayerBoard();
      if (boardType === 4) return this.create4PlayerBoard();
      if (boardType === 6) return this.create6PlayerBoard();
      return this.create2PlayerBoard();
    }

    static create2PlayerBoard() {
      return this.createBoard({
        type: 2,
        seatIndexes: [0, 2],
        startIndexes: [0, 26],
      });
    }

    static create4PlayerBoard() {
      return this.createBoard({
        type: 4,
        seatIndexes: [0, 1, 2, 3],
        startIndexes: [0, 13, 26, 39],
      });
    }

    static create6PlayerBoard() {
      return this.createBoard({
        type: 6,
        seatIndexes: [0, 1, 2, 3, 4, 5],
        startIndexes: [0, 9, 17, 26, 34, 43],
      });
    }

    static createBoard({ type, seatIndexes, startIndexes }) {
      const trackLength = 52;
      const classicSafe = [0, 8, 13, 21, 26, 34, 39, 47];
      const safeSet = new Set([...classicSafe, ...startIndexes].map((index) => `T${index % trackLength}`));
      const players = seatIndexes.map((seatIndex, orderIndex) => {
        const color = ["Red", "Blue", "Green", "Yellow", "Purple", "Pink"][seatIndex] || `P${seatIndex + 1}`;
        const startIndex = startIndexes[orderIndex] % trackLength;
        const homeCells = Array.from({ length: 6 }, (_, idx) => (idx < 5 ? `S${seatIndex}_H${idx + 1}` : `S${seatIndex}_HOME`));
        return {
          seatIndex,
          color,
          entryGlobalIndex: startIndex,
          homeEntryGlobalIndex: (startIndex + trackLength - 1) % trackLength,
          routeToGlobal: buildPlayerRoute(startIndex, trackLength, homeCells),
          yardCells: Array.from({ length: 4 }, (_, idx) => `S${seatIndex}_Y${idx + 1}`),
          homeLaneCells: homeCells.slice(0, 5),
          finalCell: homeCells[5],
        };
      });

      return {
        type,
        playerCount: players.length,
        sharedTrackLength: trackLength,
        safeCellGlobalIds: Array.from(safeSet),
        players,
      };
    }
  }

  class LudoEngine {
    constructor(boardConfig, settings = {}) {
      this.board = boardConfig;
      this.settings = { ...LUDO_DEFAULT_RULES, ...settings };
      this.state = null;
    }

    createGame({ mode = "local", players = [] }) {
      const mappedPlayers = this.board.players.map((seat, index) => {
        const playerInput = players[index] || {};
        return {
          id: playerInput.id || `p${index + 1}`,
          name: playerInput.name || seat.color,
          color: seat.color.toLowerCase(),
          seatIndex: seat.seatIndex,
          isActive: true,
          isCpu: Boolean(playerInput.isCpu),
          hasFinished: false,
          rank: null,
          tokens: Array.from({ length: this.settings.tokensPerPlayer }, (_, tokenIndex) => ({
            id: `${playerInput.id || `p${index + 1}`}_t${tokenIndex + 1}`,
            playerId: playerInput.id || `p${index + 1}`,
            tokenIndex,
            routePos: -1,
            status: "yard",
          })),
        };
      });

      this.state = {
        id: `ludo-${Date.now()}`,
        mode,
        boardType: this.board.type,
        status: "running",
        currentPlayerIndex: 0,
        turnPhase: "roll",
        diceValue: null,
        consecutiveSixCount: 0,
        validTokenIds: [],
        players: mappedPlayers,
        board: this.board,
        history: [],
        winners: [],
        settings: this.settings,
        occupancy: {},
      };

      this.rebuildOccupancy();
      return this.state;
    }

    getState() {
      return this.state;
    }

    getCurrentPlayer() {
      return this.state.players[this.state.currentPlayerIndex];
    }

    addHistory(type, payload = {}) {
      this.state.history.push({
        type,
        timestamp: Date.now(),
        ...payload,
      });
    }

    rollDice() {
      if (!this.state || this.state.status !== "running") return { error: "Game is not running" };
      if (this.state.turnPhase !== "roll") return { error: "Roll phase is not active" };

      const player = this.getCurrentPlayer();
      const value = randomInt(1, 6);
      this.state.diceValue = value;
      this.addHistory("ROLL", { playerId: player.id, diceValue: value });

      if (value === this.settings.entryRoll) {
        this.state.consecutiveSixCount += 1;
      } else {
        this.state.consecutiveSixCount = 0;
      }

      if (this.state.consecutiveSixCount >= this.settings.maxConsecutiveSixes) {
        this.addHistory("TURN_FORFEIT", { playerId: player.id, reason: "consecutive_sixes" });
        this.state.turnPhase = "complete";
        this.state.diceValue = null;
        this.state.consecutiveSixCount = 0;
        this.state.validTokenIds = [];
        this.advanceToNextPlayer();
        return {
          forfeit: true,
          playerId: player.id,
          playerName: player.name,
          diceValue: value,
          reason: "Three consecutive 6 rolled. Turn forfeited.",
        };
      }

      const validTokens = this.getValidMoves(player.id, value);
      this.state.validTokenIds = validTokens.map((token) => token.id);

      if (!validTokens.length) {
        this.state.turnPhase = "complete";
        if (value === this.settings.entryRoll) {
          // no move but extra turn because six rolled
          this.state.turnPhase = "roll";
          this.state.diceValue = null;
          return {
            noMove: true,
            extraTurn: true,
            playerId: player.id,
            playerName: player.name,
            diceValue: value,
            reason: "No valid move. Extra turn on 6.",
          };
        }
        this.state.diceValue = null;
        this.advanceToNextPlayer();
        return {
          noMove: true,
          playerId: player.id,
          playerName: player.name,
          diceValue: value,
          nextPlayerName: this.getCurrentPlayer()?.name || "",
          reason: "No valid move available.",
        };
      }

      if (validTokens.length === 1 && this.settings.autoSelectSingleMove) {
        const moveResult = this.moveToken(validTokens[0].id);
        return { autoMoved: true, moveResult };
      }

      this.state.turnPhase = "selectToken";
      return {
        playerId: player.id,
        playerName: player.name,
        diceValue: value,
        validTokenIds: this.state.validTokenIds,
      };
    }

    getValidMoves(playerId, diceValue) {
      const player = this.state.players.find((item) => item.id === playerId);
      if (!player) return [];
      return player.tokens.filter((token) => this.isValidMove(player, token, diceValue));
    }

    isValidMove(player, token, diceValue) {
      const playerBoard = this.getPlayerBoard(player);
      const route = playerBoard.routeToGlobal;
      const lastIndex = route.length - 1;

      if (token.status === "home") return false;

      if (token.routePos === -1) {
        if (diceValue !== this.settings.entryRoll) return false;
        return this.canLandOn(player, token, 0);
      }

      const targetPos = token.routePos + diceValue;
      if (this.settings.requireExactHome && targetPos > lastIndex) return false;
      if (!this.settings.requireExactHome && targetPos > lastIndex) return false;

      return this.canLandOn(player, token, targetPos);
    }

    canLandOn(player, token, targetRoutePos) {
      const playerBoard = this.getPlayerBoard(player);
      const targetCell = playerBoard.routeToGlobal[targetRoutePos];
      if (!targetCell) return false;

      if (this.isHomeCell(targetCell, player)) return true;

      const occupants = this.getTokensAtGlobalCell(targetCell);
      if (!occupants.length) return true;

      const own = occupants.filter((item) => item.playerId === player.id);
      const enemy = occupants.filter((item) => item.playerId !== player.id);

      if (own.length) {
        return this.settings.allowStackingOwnTokens;
      }

      if (enemy.length) {
        if (this.isSafeCell(targetCell) && this.settings.safeCellsCaptureDisabled) return false;
        return true;
      }

      return true;
    }

    moveToken(tokenId) {
      if (!this.state || this.state.turnPhase !== "selectToken") return { error: "Token selection phase is not active" };
      const player = this.getCurrentPlayer();
      const token = player.tokens.find((item) => item.id === tokenId);
      const diceValue = this.state.diceValue;
      if (!token || !this.isValidMove(player, token, diceValue)) return { error: "Selected token cannot move" };

      const fromPos = token.routePos;
      if (token.routePos === -1) {
        token.routePos = 0;
        token.status = "active";
      } else {
        token.routePos += diceValue;
      }

      this.addHistory("MOVE", { playerId: player.id, tokenId, from: fromPos, to: token.routePos, diceValue });
      this.rebuildOccupancy();

      const capturedTokenIds = this.handleCaptureIfAny(player, token);
      this.rebuildOccupancy();
      const reachedHome = this.handleFinishIfAny(player, token);
      const playerFinished = player.hasFinished;
      const turnResult = this.resolveTurnAfterMove(player, diceValue, capturedTokenIds.length > 0, reachedHome);

      return {
        tokenId,
        fromPos,
        toPos: token.routePos,
        capturedTokenIds,
        reachedHome,
        playerFinished,
        turnResult,
      };
    }

    handleCaptureIfAny(player, movedToken) {
      const playerBoard = this.getPlayerBoard(player);
      const cell = playerBoard.routeToGlobal[movedToken.routePos];
      if (!this.isTrackCell(cell)) return [];
      if (this.isSafeCell(cell) && this.settings.safeCellsCaptureDisabled) return [];

      const occupants = this.getTokensAtGlobalCell(cell);
      const captured = [];
      occupants.forEach((token) => {
        if (token.id === movedToken.id) return;
        if (token.playerId === player.id) return;
        token.routePos = -1;
        token.status = "yard";
        captured.push(token.id);
      });

      if (captured.length) {
        this.addHistory("CAPTURE", { playerId: player.id, tokenId: movedToken.id, capturedTokenIds: captured });
      }

      return captured;
    }

    handleFinishIfAny(player, token) {
      const route = this.getPlayerBoard(player).routeToGlobal;
      const lastIndex = route.length - 1;

      if (token.routePos !== lastIndex) return false;

      token.status = "home";
      this.addHistory("TOKEN_HOME", { playerId: player.id, tokenId: token.id });

      const allHome = player.tokens.every((item) => item.status === "home");
      if (allHome && !player.hasFinished) {
        player.hasFinished = true;
        player.rank = this.state.winners.length + 1;
        this.state.winners.push(player.id);
        this.addHistory("PLAYER_FINISH", { playerId: player.id, rank: player.rank });
      }

      return true;
    }

    resolveTurnAfterMove(player, diceValue, captured, reachedHome) {
      this.state.validTokenIds = [];
      this.state.diceValue = null;

      if (this.countActiveUnfinishedPlayers() <= 1) {
        this.assignRemainingRankAndEnd();
        return { gameFinished: true };
      }

      if (player.hasFinished) {
        this.state.consecutiveSixCount = 0;
        this.advanceToNextPlayer();
        return { nextPlayer: this.getCurrentPlayer().id };
      }

      if ((captured && this.settings.captureBonusTurn) || (reachedHome && this.settings.finishBonusTurn)) {
        this.state.turnPhase = "roll";
        return { extraTurn: true };
      }

      if (this.settings.extraTurnOn.includes(diceValue)) {
        this.state.turnPhase = "roll";
        return { extraTurn: true };
      }

      this.state.consecutiveSixCount = 0;
      this.advanceToNextPlayer();
      return { nextPlayer: this.getCurrentPlayer().id };
    }

    advanceToNextPlayer() {
      const total = this.state.players.length;
      const start = this.state.currentPlayerIndex;
      do {
        this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % total;
        const next = this.state.players[this.state.currentPlayerIndex];
        if (next.isActive && !next.hasFinished) {
          this.state.turnPhase = "roll";
          this.state.diceValue = null;
          this.state.validTokenIds = [];
          return;
        }
      } while (this.state.currentPlayerIndex !== start);

      this.state.status = "finished";
      this.state.turnPhase = "complete";
    }

    countActiveUnfinishedPlayers() {
      return this.state.players.filter((item) => item.isActive && !item.hasFinished).length;
    }

    assignRemainingRankAndEnd() {
      this.state.players.forEach((player) => {
        if (!player.hasFinished && player.isActive) {
          player.hasFinished = true;
          player.rank = this.state.winners.length + 1;
          this.state.winners.push(player.id);
        }
      });
      this.state.status = "finished";
      this.state.turnPhase = "complete";
    }

    rebuildOccupancy() {
      const occupancy = {};
      this.state.players.forEach((player) => {
        const route = this.getPlayerBoard(player).routeToGlobal;
        player.tokens.forEach((token) => {
          if (token.routePos < 0 || token.status === "yard") return;
          const cell = route[token.routePos];
          if (!occupancy[cell]) occupancy[cell] = [];
          occupancy[cell].push(token.id);
        });
      });
      this.state.occupancy = occupancy;
    }

    getTokensAtGlobalCell(cell) {
      const ids = this.state.occupancy[cell] || [];
      return ids.map((id) => this.findTokenById(id)).filter(Boolean);
    }

    findTokenById(tokenId) {
      for (const player of this.state.players) {
        const token = player.tokens.find((item) => item.id === tokenId);
        if (token) return token;
      }
      return null;
    }

    getPlayerBoard(player) {
      return this.state.board.players.find((item) => item.seatIndex === player.seatIndex) || this.state.board.players[0];
    }

    isTrackCell(cell) {
      return typeof cell === "string" && cell.startsWith("T");
    }

    isHomeCell(cell, player) {
      if (!cell || typeof cell !== "string") return false;
      const prefix = `S${player.seatIndex}_`;
      return cell.startsWith(prefix) && !cell.includes("_Y");
    }

    isSafeCell(cell) {
      return this.state.board.safeCellGlobalIds.includes(cell);
    }
  }

  function buildPlayerRoute(startIndex, trackLength, homeCells) {
    const route = [];
    for (let i = 0; i < trackLength; i += 1) {
      route.push(`T${(startIndex + i) % trackLength}`);
    }
    return route.concat(homeCells);
  }

  function clearLudoCpuTimer() {
    if (!ludoCpuTimer) return;
    clearTimeout(ludoCpuTimer);
    ludoCpuTimer = null;
  }

  function resolveLudoCellClasses(row, col) {
    const classes = [];
    const isRedHome = row <= 5 && col <= 5;
    const isBlueHome = row <= 5 && col >= 9;
    const isGreenHome = row >= 9 && col <= 5;
    const isYellowHome = row >= 9 && col >= 9;
    if (isRedHome) classes.push("home-red");
    if (isBlueHome) classes.push("home-blue");
    if (isGreenHome) classes.push("home-green");
    if (isYellowHome) classes.push("home-yellow");

    if (row === 7 && col >= 1 && col <= 5) classes.push("lane-red");
    if (col === 7 && row >= 1 && row <= 5) classes.push("lane-blue");
    if (row === 7 && col >= 9 && col <= 13) classes.push("lane-yellow");
    if (col === 7 && row >= 9 && row <= 13) classes.push("lane-green");

    const inRedPocket = row >= 1 && row <= 4 && col >= 1 && col <= 4;
    const inBluePocket = row >= 1 && row <= 4 && col >= 10 && col <= 13;
    const inGreenPocket = row >= 10 && row <= 13 && col >= 1 && col <= 4;
    const inYellowPocket = row >= 10 && row <= 13 && col >= 10 && col <= 13;
    if (inRedPocket) classes.push("home-pocket", "pocket-red");
    if (inBluePocket) classes.push("home-pocket", "pocket-blue");
    if (inGreenPocket) classes.push("home-pocket", "pocket-green");
    if (inYellowPocket) classes.push("home-pocket", "pocket-yellow");

    if (row >= 6 && row <= 8 && col >= 6 && col <= 8) classes.push("center-cell");
    return classes;
  }

  function createLudoTrack() {
    ludoTrack.innerHTML = "";
    ludoCellTokenMap.clear();

    for (let row = 0; row < ludoGridSize; row += 1) {
      for (let col = 0; col < ludoGridSize; col += 1) {
        const cell = document.createElement("div");
        cell.className = "ludo-cell";
        resolveLudoCellClasses(row, col).forEach((className) => cell.classList.add(className));

        const key = `${row}-${col}`;
        const index = ludoPathCellIndexByKey.get(key);
        if (index) {
          cell.classList.add("track-cell");
          if (index === 1) cell.classList.add("start-red");
          if (index === 14) cell.classList.add("start-blue");
          if (index === 27) cell.classList.add("start-yellow");
          if (index === 40) cell.classList.add("start-green");
          if (index === ludoPath.length) cell.classList.add("finish");

          const tokenWrap = document.createElement("div");
          tokenWrap.className = "ludo-token-wrap";
          ludoCellTokenMap.set(`T${index - 1}`, tokenWrap);

          const number = document.createElement("span");
          number.className = "ludo-cell-number";
          number.textContent = String(index);

          cell.appendChild(tokenWrap);
          cell.appendChild(number);
        }

        ludoTrack.appendChild(cell);
      }
    }

    const centerStar = document.createElement("div");
    centerStar.className = "ludo-center-star";
    ludoTrack.appendChild(centerStar);
  }

  function createTokenDot(color, label) {
    const token = document.createElement("span");
    token.className = "ludo-token";
    token.style.background = color;
    token.title = label;
    return token;
  }

  function setLudoDiceValue(value) {
    const normalized = value === null || value === undefined || value === "" ? "-" : String(value);
    ludoDice.textContent = `Dice: ${normalized}`;
    ludoDiceChip.textContent = `🎲 ${normalized}`;
  }

  function animateLudoDiceChip() {
    ludoDiceChip.classList.remove("rolling");
    // Force reflow so animation retriggers even on quick consecutive rolls.
    void ludoDiceChip.offsetWidth;
    ludoDiceChip.classList.add("rolling");
    setTimeout(() => {
      ludoDiceChip.classList.remove("rolling");
    }, 500);
  }

  function syncLudoPlayerButtons() {
    ludoPlayerButtons.forEach((button) => {
      const value = Number(button.dataset.ludoPlayers);
      const active = value === ludoPlayerCount;
      button.classList.toggle("active", active);
      button.disabled = ludoMode === "cpu" && value !== 2;
    });
  }

  function getLudoTokenLabel(player, token, route) {
    if (token.status === "yard" || token.routePos < 0) return `T${token.tokenIndex + 1}: Yard`;
    const cell = route[token.routePos];
    if (cell.endsWith("_HOME")) return `T${token.tokenIndex + 1}: Home`;
    if (cell.includes("_H")) return `T${token.tokenIndex + 1}: Lane ${token.routePos - 51}`;
    return `T${token.tokenIndex + 1}: ${cell}`;
  }

  function renderLudoBoard(state) {
    ludoCellTokenMap.forEach((wrap) => {
      wrap.innerHTML = "";
    });
    state.players.forEach((player) => {
      const boardPlayer = state.board.players.find((item) => item.seatIndex === player.seatIndex);
      if (!boardPlayer) return;
      player.tokens.forEach((token) => {
        if (token.routePos < 0 || token.status === "yard") return;
        const cell = boardPlayer.routeToGlobal[token.routePos];
        if (!cell || !cell.startsWith("T")) return;
        const wrap = ludoCellTokenMap.get(cell);
        if (!wrap) return;
        wrap.appendChild(createTokenDot(player.color, `${player.name} T${token.tokenIndex + 1}`));
      });
    });
  }

  function moveLudoTokenById(tokenId) {
    if (!ludoEngine) return;
    const outcome = ludoEngine.moveToken(tokenId);
    if (outcome.error) {
      ludoStatus.textContent = outcome.error;
      return;
    }

    const currentState = ludoEngine.getState();
    const currentPlayer = currentState.players.find((player) => player.id === tokenId.split("_t")[0]);
    const movedName = currentPlayer?.name || "Player";
    let status = `${movedName} moved token.`;
    if (outcome.capturedTokenIds.length) status += ` Captured ${outcome.capturedTokenIds.length} token(s).`;
    if (outcome.reachedHome) status += " Token reached home.";
    if (outcome.playerFinished) status += ` ${movedName} finished with rank ${currentPlayer.rank}.`;
    if (outcome.turnResult?.extraTurn) status += " Extra turn granted.";
    if (outcome.turnResult?.gameFinished) status += " Game finished.";
    ludoStatus.textContent = status;
    setLudoDiceValue("-");

    renderLudoUI();
    scheduleLudoCpuTurn();
  }

  function renderLudoScore(state) {
    ludoScore.innerHTML = "";
    const current = state.players[state.currentPlayerIndex];
    const validSet = new Set(state.validTokenIds || []);

    state.players.forEach((player) => {
      const boardPlayer = state.board.players.find((item) => item.seatIndex === player.seatIndex);
      if (!boardPlayer) return;
      const homeCount = player.tokens.filter((token) => token.status === "home").length;

      const card = document.createElement("div");
      card.className = "ludo-score-item";

      const head = document.createElement("div");
      head.className = "ludo-score-head";

      const name = document.createElement("span");
      name.className = "ludo-score-name";
      name.appendChild(createTokenDot(player.color, player.name));
      name.append(document.createTextNode(player.name));

      const status = document.createElement("span");
      status.className = "ludo-score-meta";
      if (player.hasFinished) {
        status.textContent = `Rank ${player.rank}`;
      } else {
        status.textContent = `Home ${homeCount}/${state.settings.tokensPerPlayer}`;
      }

      head.appendChild(name);
      head.appendChild(status);

      const tokenRow = document.createElement("div");
      tokenRow.className = "ludo-token-row";
      player.tokens.forEach((token) => {
        const btn = document.createElement("button");
        btn.className = "ghost ludo-token-btn";
        btn.type = "button";
        btn.textContent = getLudoTokenLabel(player, token, boardPlayer.routeToGlobal);
        const isCurrent = current.id === player.id;
        const isSelectable = isCurrent && state.turnPhase === "selectToken" && validSet.has(token.id) && !player.isCpu;
        btn.disabled = !isSelectable;
        if (isSelectable) btn.classList.add("active");
        btn.addEventListener("click", () => moveLudoTokenById(token.id));
        tokenRow.appendChild(btn);
      });

      card.appendChild(head);
      card.appendChild(tokenRow);
      ludoScore.appendChild(card);
    });
  }

  function renderLudoUI() {
    if (!ludoEngine) return;
    const state = ludoEngine.getState();
    const current = state.players[state.currentPlayerIndex];
    ludoTurn.textContent = current ? `Turn: ${current.name}` : "Turn: -";
    renderLudoBoard(state);
    renderLudoScore(state);
  }

  function doLudoRoll() {
    if (!ludoEngine) return;
    const state = ludoEngine.getState();
    if (state.status === "finished") {
      ludoStatus.textContent = "Match finished. Start New Match.";
      return;
    }

    animateLudoDiceChip();
    const rollResult = ludoEngine.rollDice();
    if (rollResult.error) {
      ludoStatus.textContent = rollResult.error;
      return;
    }

    if (rollResult.forfeit) {
      setLudoDiceValue(rollResult.diceValue);
      ludoStatus.textContent = `${rollResult.playerName || "Player"} rolled ${rollResult.diceValue}. ${rollResult.reason}`;
      renderLudoUI();
      scheduleLudoCpuTurn();
      return;
    }

    if (rollResult.noMove) {
      setLudoDiceValue(rollResult.diceValue);
      if (rollResult.extraTurn) {
        ludoStatus.textContent = `${rollResult.playerName || "Player"} rolled ${rollResult.diceValue}. ${rollResult.reason}`;
      } else {
        const nextTurnText = rollResult.nextPlayerName ? ` Next turn: ${rollResult.nextPlayerName}.` : "";
        ludoStatus.textContent = `${rollResult.playerName || "Player"} rolled ${rollResult.diceValue}. ${rollResult.reason}${nextTurnText}`;
      }
      renderLudoUI();
      scheduleLudoCpuTurn();
      return;
    }

    const nextState = ludoEngine.getState();
    setLudoDiceValue(nextState.diceValue);
    if (nextState.turnPhase === "selectToken") {
      ludoStatus.textContent = `${rollResult.playerName || nextState.players[nextState.currentPlayerIndex].name} rolled ${rollResult.diceValue}. Select a token to move.`;
    } else {
      ludoStatus.textContent = "Turn updated.";
    }
    renderLudoUI();
    scheduleLudoCpuTurn();
  }

  function triggerLudoDiceAction() {
    if (!ludoEngine) return;
    const state = ludoEngine.getState();
    if (state.status === "finished") {
      ludoStatus.textContent = "Match finished. Start New Match.";
      return;
    }

    const current = state.players[state.currentPlayerIndex];
    if (current?.isCpu) {
      ludoStatus.textContent = "Computer turn in progress...";
      return;
    }

    if (state.turnPhase === "selectToken") {
      const choices = Array.isArray(state.validTokenIds) ? state.validTokenIds : [];
      if (!choices.length) {
        ludoStatus.textContent = "No selectable token found. Roll again.";
        return;
      }
      animateLudoDiceChip();
      moveLudoTokenById(choices[0]);
      return;
    }

    doLudoRoll();
  }

  function scheduleLudoCpuTurn() {
    clearLudoCpuTimer();
    if (!ludoEngine) return;
    const state = ludoEngine.getState();
    if (state.status === "finished") return;
    const current = state.players[state.currentPlayerIndex];
    if (!current?.isCpu) return;

    if (state.turnPhase === "roll") {
      ludoStatus.textContent = "Computer is rolling...";
      ludoDiceChip.textContent = "🎲 ...";
      ludoCpuTimer = setTimeout(() => {
        doLudoRoll();
      }, 700);
      return;
    }

    if (state.turnPhase === "selectToken") {
      const choices = Array.isArray(state.validTokenIds) ? state.validTokenIds : [];
      if (!choices.length) {
        doLudoRoll();
        return;
      }
      ludoStatus.textContent = "Computer is choosing token...";
      ludoCpuTimer = setTimeout(() => {
        moveLudoTokenById(randomFromList(choices));
      }, 650);
    }
  }

  function createLudoPlayersForMode() {
    const board = BoardFactory.create(ludoPlayerCount);
    return board.players.map((seat, index) => ({
      id: `p${index + 1}`,
      name: ludoMode === "cpu" && index === 1 ? "Computer" : `Player ${index + 1}`,
      isCpu: ludoMode === "cpu" && index === 1,
    }));
  }

  function resetLudoMatch() {
    clearLudoCpuTimer();
    const boardConfig = BoardFactory.create(ludoPlayerCount);
    ludoEngine = new LudoEngine(boardConfig, LUDO_DEFAULT_RULES);
    ludoEngine.createGame({
      mode: "local",
      players: createLudoPlayersForMode(),
    });

    setLudoDiceValue("-");
    if (ludoMode === "cpu") {
      ludoStatus.textContent = "Single player mode active (You vs Computer). Roll dice to start.";
    } else {
      ludoStatus.textContent = "Multiplayer mode active. Roll dice and move selectable token.";
    }
    renderLudoUI();
    scheduleLudoCpuTurn();
  }

  function setLudoMode(mode) {
    ludoMode = mode === "cpu" ? "cpu" : "human";
    if (ludoMode === "cpu") ludoPlayerCount = 2;
    ludoModeHumanBtn.classList.toggle("active", ludoMode === "human");
    ludoModeCpuBtn.classList.toggle("active", ludoMode === "cpu");
    syncLudoPlayerButtons();
    resetLudoMatch();
  }

  function setLudoPlayerCount(count) {
    if (![2, 4, 6].includes(count)) return;
    if (ludoMode === "cpu" && count !== 2) {
      ludoStatus.textContent = "Computer mode supports 2 players only.";
      return;
    }
    ludoPlayerCount = count;
    syncLudoPlayerButtons();
    resetLudoMatch();
  }

  ludoDiceChip.setAttribute("role", "button");
  ludoDiceChip.setAttribute("tabindex", "0");

  ludoRollBtn.addEventListener("click", () => {
    triggerLudoDiceAction();
  });

  ludoDiceChip.addEventListener("click", () => {
    triggerLudoDiceAction();
  });

  ludoDiceChip.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    triggerLudoDiceAction();
  });

  ludoResetBtn.addEventListener("click", resetLudoMatch);
  ludoModeHumanBtn.addEventListener("click", () => setLudoMode("human"));
  ludoModeCpuBtn.addEventListener("click", () => setLudoMode("cpu"));
  ludoPlayerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const count = Number(button.dataset.ludoPlayers);
      setLudoPlayerCount(count);
    });
  });

  createLudoTrack();
  setLudoMode("human");
}

