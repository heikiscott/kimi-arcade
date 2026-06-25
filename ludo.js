const boardEl = document.querySelector("#ludoBoard");
const turnText = document.querySelector("#turnText");
const diceText = document.querySelector("#diceText");
const logEl = document.querySelector("#log");
const rollBtn = document.querySelector("#rollBtn");
const moveBtn = document.querySelector("#moveBtn");

const BOARD_SIZE = 15;
const FINISH_INDEX = 7;
const path = [
  [6, 14], [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  [14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14]
];

const homeRuns = {
  red: [[7, 14], [7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8], [7, 7]],
  blue: [[7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7]]
};

const baseCells = {
  red: [[1, 11], [3, 11], [1, 13], [3, 13]],
  blue: [[11, 1], [13, 1], [11, 3], [13, 3]]
};

const players = [
  { name: "红方", color: "red", start: 0, pieces: [] },
  { name: "蓝方", color: "blue", start: 24, pieces: [] }
];

let current = 0;
let dice = 0;
let rolled = false;
let gameOver = false;
let selectedPieceId = null;

function createPieces() {
  players.forEach((player) => {
    player.pieces = Array.from({ length: 4 }, (_, index) => ({
      id: `${player.color}-${index}`,
      label: index + 1,
      color: player.color,
      state: "base",
      pathIndex: player.start,
      steps: 0,
      homeIndex: -1
    }));
  });
}

function addLog(text) {
  const li = document.createElement("li");
  li.textContent = text;
  logEl.prepend(li);
  while (logEl.children.length > 10) {
    logEl.lastChild.remove();
  }
}

function keyOf(x, y) {
  return `${x}-${y}`;
}

function pathIndexAt(x, y) {
  return path.findIndex(([px, py]) => px === x && py === y);
}

function homeInfoAt(x, y) {
  for (const color of Object.keys(homeRuns)) {
    const index = homeRuns[color].findIndex(([hx, hy]) => hx === x && hy === y);
    if (index >= 0) return { color, index };
  }
  return null;
}

function baseInfoAt(x, y) {
  for (const color of Object.keys(baseCells)) {
    const index = baseCells[color].findIndex(([bx, by]) => bx === x && by === y);
    if (index >= 0) return { color, index };
  }
  return null;
}

function cellColorForPath(index) {
  if (index < 0) return "";
  if (index % 4 === 0) return "red";
  if (index % 4 === 2) return "blue";
  return "";
}

function isShortcut(index) {
  return index === 8 || index === 32;
}

function piecePosition(piece) {
  if (piece.state === "base") {
    return baseCells[piece.color][Number(piece.label) - 1];
  }
  if (piece.state === "home" || piece.state === "finished") {
    return homeRuns[piece.color][piece.homeIndex];
  }
  return path[piece.pathIndex];
}

function piecesAt(x, y) {
  return players.flatMap((player) => player.pieces).filter((piece) => {
    const [px, py] = piecePosition(piece);
    return px === x && py === y;
  });
}

function render() {
  boardEl.innerHTML = "";
  const cells = new Map();

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const cell = document.createElement("div");
      const pIndex = pathIndexAt(x, y);
      const hInfo = homeInfoAt(x, y);
      const bInfo = baseInfoAt(x, y);
      const isCenter = x === 7 && y === 7;
      const classes = ["ludo-cell"];

      if (pIndex >= 0) {
        classes.push("path");
        const color = cellColorForPath(pIndex);
        if (color) classes.push(`${color}-cell`);
        if (isShortcut(pIndex)) classes.push("fly-cell");
        cell.textContent = isShortcut(pIndex) ? "✈" : "";
      } else if (hInfo) {
        classes.push("home-run", `${hInfo.color}-run`);
        cell.textContent = hInfo.index === FINISH_INDEX ? "终" : "";
      } else if (bInfo) {
        classes.push("base", `${bInfo.color}-base`);
      } else if (isCenter) {
        classes.push("center");
        cell.textContent = "终点";
      } else {
        classes.push("inactive");
      }

      cell.className = classes.join(" ");
      cell.dataset.key = keyOf(x, y);
      cells.set(keyOf(x, y), cell);
      boardEl.append(cell);
    }
  }

  players.flatMap((player) => player.pieces).forEach((piece) => {
    const [x, y] = piecePosition(piece);
    const cell = cells.get(keyOf(x, y));
    const button = document.createElement("button");
    button.type = "button";
    button.className = `piece ${piece.color} ${piece.id === selectedPieceId ? "selected" : ""}`;
    button.textContent = `${piece.color === "red" ? "红" : "蓝"}${piece.label}`;
    button.disabled = gameOver || !rolled || piece.color !== players[current].color;
    button.addEventListener("click", () => selectAndMove(piece.id));
    cell.append(button);
  });

  const finished = players[current].pieces.filter((piece) => piece.state === "finished").length;
  turnText.textContent = gameOver ? "游戏结束" : `${players[current].name}（已完成 ${finished}/4）`;
  diceText.textContent = dice || "-";
  rollBtn.disabled = rolled || gameOver;
  moveBtn.disabled = !rolled || gameOver;
}

function roll() {
  if (rolled || gameOver) return;
  dice = Math.floor(Math.random() * 6) + 1;
  rolled = true;
  selectedPieceId = null;
  addLog(`${players[current].name} 掷出 ${dice}。请点一架飞机移动。`);
  render();
}

function selectAndMove(pieceId) {
  if (!rolled || gameOver) return;
  selectedPieceId = pieceId;
  moveSelectedPiece();
}

function moveSelectedPiece() {
  if (!rolled || gameOver) return;
  const player = players[current];
  let piece = player.pieces.find((item) => item.id === selectedPieceId);
  if (!piece) {
    piece = player.pieces.find(canMovePiece);
    selectedPieceId = piece ? piece.id : null;
  }
  if (!piece) {
    addLog(`${player.name} 没有可移动的飞机。`);
    nextTurn();
    return;
  }

  if (piece.state === "base") {
    if (dice !== 6) {
      addLog(`${player.name} 没有掷到 6，不能起飞。`);
      nextTurn();
      return;
    }
    piece.state = "track";
    piece.pathIndex = player.start;
    piece.steps = 0;
    addLog(`${player.name}${piece.label} 号起飞。`);
  } else if (piece.state === "track") {
    moveOnTrack(piece, dice);
  } else if (piece.state === "home") {
    moveInHome(piece, dice);
  }

  if (piece.state === "track") {
    applyLandingBonus(piece);
    bumpOpponents(piece);
  }

  checkWin();
  if (!gameOver) nextTurn();
  render();
}

function canMovePiece(piece) {
  if (piece.state === "finished") return false;
  if (piece.state === "base") return dice === 6;
  return true;
}

function moveOnTrack(piece, steps) {
  const total = piece.steps + steps;
  if (total >= path.length) {
    piece.state = "home";
    piece.homeIndex = total - path.length;
    piece.steps = path.length;
    moveInHome(piece, 0);
    addLog(`${piece.color === "red" ? "红方" : "蓝方"}${piece.label} 号绕完一圈，进入终点跑道。`);
    return;
  }
  piece.steps = total;
  piece.pathIndex = (piece.pathIndex + steps) % path.length;
  addLog(`${piece.color === "red" ? "红方" : "蓝方"}${piece.label} 号前进 ${steps} 格。`);
}

function moveInHome(piece, steps) {
  let nextIndex = piece.homeIndex + steps;
  if (nextIndex > FINISH_INDEX) {
    nextIndex = FINISH_INDEX - (nextIndex - FINISH_INDEX);
    addLog(`${piece.color === "red" ? "红方" : "蓝方"}${piece.label} 号超过终点，往回弹。`);
  }
  piece.homeIndex = Math.max(0, nextIndex);
  if (piece.homeIndex === FINISH_INDEX) {
    piece.state = "finished";
    addLog(`${piece.color === "red" ? "红方" : "蓝方"}${piece.label} 号到达终点。`);
  } else {
    addLog(`${piece.color === "red" ? "红方" : "蓝方"}${piece.label} 号在终点跑道前进。`);
  }
}

function applyLandingBonus(piece) {
  const color = cellColorForPath(piece.pathIndex);
  if (color === piece.color) {
    const nextSame = nextSameColorIndex(piece.pathIndex, piece.color);
    if (nextSame !== piece.pathIndex) {
      piece.steps += distanceForward(piece.pathIndex, nextSame);
      piece.pathIndex = nextSame;
      addLog(`落到同色格，${piece.color === "red" ? "红方" : "蓝方"}${piece.label} 号跳到下一个同色格。`);
    }
  }

  if (isShortcut(piece.pathIndex)) {
    const target = (piece.pathIndex + 12) % path.length;
    piece.steps += 12;
    piece.pathIndex = target;
    addLog(`飞到飞机捷径，${piece.color === "red" ? "红方" : "蓝方"}${piece.label} 号直接飞到对面。`);
  }
}

function nextSameColorIndex(from, color) {
  for (let offset = 1; offset <= path.length; offset += 1) {
    const index = (from + offset) % path.length;
    if (cellColorForPath(index) === color) return index;
  }
  return from;
}

function distanceForward(from, to) {
  return to >= from ? to - from : path.length - from + to;
}

function bumpOpponents(piece) {
  players.forEach((player) => {
    if (player.color === piece.color) return;
    player.pieces.forEach((other) => {
      if (other.state === "track" && other.pathIndex === piece.pathIndex) {
        other.state = "base";
        other.steps = 0;
        other.homeIndex = -1;
        addLog(`${piece.color === "red" ? "红方" : "蓝方"}${piece.label} 号撞回 ${player.name}${other.label} 号。`);
      }
    });
  });
}

function checkWin() {
  const player = players[current];
  const done = player.pieces.every((piece) => piece.state === "finished");
  if (done) {
    gameOver = true;
    const loser = players[(current + 1) % players.length];
    addLog(`${player.name} 获胜！${loser.name} 输了这一局。`);
  }
}

function nextTurn() {
  rolled = false;
  dice = 0;
  selectedPieceId = null;
  current = (current + 1) % players.length;
  render();
}

function reset() {
  createPieces();
  current = 0;
  dice = 0;
  rolled = false;
  gameOver = false;
  selectedPieceId = null;
  logEl.innerHTML = "";
  addLog("新一局开始。红蓝各 4 架飞机，掷到 6 才能起飞。");
  render();
}

function handleKeydown(event) {
  if (event.code === "Space") {
    event.preventDefault();
    roll();
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    moveSelectedPiece();
    return;
  }
  if (["1", "2", "3", "4"].includes(event.key)) {
    event.preventDefault();
    const piece = players[current].pieces[Number(event.key) - 1];
    if (piece) selectAndMove(piece.id);
  }
}

window.roll = roll;
window.moveSelectedPiece = moveSelectedPiece;
window.reset = reset;
rollBtn.addEventListener("click", roll);
moveBtn.addEventListener("click", moveSelectedPiece);
document.querySelector("#resetBtn").addEventListener("click", reset);
window.addEventListener("keydown", handleKeydown);
reset();
