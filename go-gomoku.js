const canvas = document.querySelector("#boardCanvas");
const ctx = canvas.getContext("2d");
const gameTitle = document.querySelector("#gameTitle");
const statusText = document.querySelector("#statusText");
const scoreText = document.querySelector("#scoreText");
const passBtn = document.querySelector("#passBtn");
const undoBtn = document.querySelector("#undoBtn");
const resetBtn = document.querySelector("#resetBtn");
const modeButtons = [...document.querySelectorAll(".mode-tabs button")];

let mode = "go";
let size = 9;
let board = createBoard(size);
let turn = 1;
let goCaptures = { black: 0, white: 0 };
let history = [];
let gameOver = false;

function createBoard(n) {
  return Array.from({ length: n }, () => Array(n).fill(0));
}

function cloneBoard(src) {
  return src.map((row) => [...row]);
}

function saveHistory() {
  history.push({
    board: cloneBoard(board),
    turn,
    goCaptures: { ...goCaptures },
    gameOver
  });
  if (history.length > 80) history.shift();
}

function setMode(next) {
  mode = next;
  size = mode === "go" ? 9 : 15;
  gameTitle.textContent = mode === "go" ? "围棋练习" : "五子棋练习";
  passBtn.disabled = mode !== "go";
  modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));
  resetGame();
}

function resetGame() {
  board = createBoard(size);
  turn = 1;
  goCaptures = { black: 0, white: 0 };
  history = [];
  gameOver = false;
  statusText.textContent = mode === "go"
    ? "黑棋先下。围住对方一整块棋没有气，就能吃掉。"
    : "五子棋开始：你下黑棋，电脑下白棋。先连五个就赢。";
  draw();
  updateScore();
}

function undoMove() {
  const previous = history.pop();
  if (!previous) {
    statusText.textContent = "还没有可以撤销的棋。";
    return;
  }
  board = previous.board;
  turn = previous.turn;
  goCaptures = previous.goCaptures;
  gameOver = previous.gameOver;
  statusText.textContent = "撤销了一步。";
  draw();
  updateScore();
}

function passGo() {
  if (mode !== "go" || gameOver) return;
  saveHistory();
  turn *= -1;
  statusText.textContent = `${turn === 1 ? "黑棋" : "白棋"}继续。刚才选择停一手。`;
  updateScore();
}

function boardPointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  const margin = 54;
  const gap = (canvas.width - margin * 2) / (size - 1);
  const col = Math.round((x - margin) / gap);
  const row = Math.round((y - margin) / gap);
  const px = margin + col * gap;
  const py = margin + row * gap;
  if (row < 0 || col < 0 || row >= size || col >= size) return null;
  if (Math.hypot(x - px, y - py) > gap * 0.42) return null;
  return { row, col };
}

function playAt(row, col) {
  if (gameOver) {
    statusText.textContent = "这一局已经结束，点重新开始再玩。";
    return;
  }
  if (board[row][col] !== 0) {
    statusText.textContent = "这里已经有棋子了。";
    return;
  }
  if (mode === "go") playGo(row, col);
  else playGomoku(row, col);
}

function playGo(row, col) {
  saveHistory();
  const color = turn;
  const opponent = -color;
  board[row][col] = color;
  let captured = 0;
  neighbors(row, col).forEach(([r, c]) => {
    if (board[r][c] === opponent) {
      const group = collectGroup(r, c);
      if (group.liberties.size === 0) {
        captured += group.stones.length;
        group.stones.forEach(([sr, sc]) => {
          board[sr][sc] = 0;
        });
      }
    }
  });
  const ownGroup = collectGroup(row, col);
  if (ownGroup.liberties.size === 0 && captured === 0) {
    const previous = history.pop();
    board = previous.board;
    turn = previous.turn;
    goCaptures = previous.goCaptures;
    statusText.textContent = "这步没有气，不能这样下。";
    draw();
    updateScore();
    return;
  }
  if (captured > 0) {
    if (color === 1) goCaptures.black += captured;
    else goCaptures.white += captured;
  }
  turn *= -1;
  statusText.textContent = captured > 0
    ? `${colorName(color)}吃掉 ${captured} 颗棋。现在轮到${colorName(turn)}。`
    : `${colorName(color)}落子。现在轮到${colorName(turn)}。`;
  draw();
  updateScore();
}

function neighbors(row, col) {
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1]
  ].filter(([r, c]) => r >= 0 && c >= 0 && r < size && c < size);
}

function collectGroup(row, col) {
  const color = board[row][col];
  const stack = [[row, col]];
  const seen = new Set();
  const liberties = new Set();
  const stones = [];
  while (stack.length) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;
    if (seen.has(key)) continue;
    seen.add(key);
    stones.push([r, c]);
    neighbors(r, c).forEach(([nr, nc]) => {
      if (board[nr][nc] === 0) liberties.add(`${nr},${nc}`);
      else if (board[nr][nc] === color) stack.push([nr, nc]);
    });
  }
  return { stones, liberties };
}

function playGomoku(row, col) {
  if (turn !== 1) return;
  saveHistory();
  board[row][col] = 1;
  if (isFive(row, col, 1)) {
    gameOver = true;
    statusText.textContent = "黑棋连成五个，你赢了！";
    draw();
    updateScore();
    return;
  }
  turn = -1;
  statusText.textContent = "电脑正在想。";
  draw();
  updateScore();
  window.setTimeout(botMove, 360);
}

function botMove() {
  if (gameOver || mode !== "gomoku") return;
  const move = chooseBotMove();
  if (!move) {
    gameOver = true;
    statusText.textContent = "棋盘下满了，平局。";
    draw();
    return;
  }
  saveHistory();
  board[move.row][move.col] = -1;
  if (isFive(move.row, move.col, -1)) {
    gameOver = true;
    statusText.textContent = "白棋连成五个，电脑赢了。点重新开始再来。";
  } else {
    turn = 1;
    statusText.textContent = "电脑下了一手。轮到你下黑棋。";
  }
  draw();
  updateScore();
}

function chooseBotMove() {
  const empty = [];
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (board[r][c] === 0) empty.push({ row: r, col: c });
    }
  }
  const winning = empty.find((move) => wouldWin(move.row, move.col, -1));
  if (winning) return winning;
  const blocking = empty.find((move) => wouldWin(move.row, move.col, 1));
  if (blocking) return blocking;
  empty.sort((a, b) => scoreGomokuMove(b, -1) - scoreGomokuMove(a, -1));
  return empty[0];
}

function wouldWin(row, col, color) {
  board[row][col] = color;
  const win = isFive(row, col, color);
  board[row][col] = 0;
  return win;
}

function scoreGomokuMove(row, col, color) {
  const center = Math.abs(row - 7) + Math.abs(col - 7);
  let score = 30 - center;
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  dirs.forEach(([dr, dc]) => {
    score += countDirection(row, col, dr, dc, color) * 4;
    score += countDirection(row, col, dr, dc, -color) * 3;
  });
  return score + Math.random();
}

function countDirection(row, col, dr, dc, color) {
  return countOne(row, col, dr, dc, color) + countOne(row, col, -dr, -dc, color);
}

function countOne(row, col, dr, dc, color) {
  let r = row + dr;
  let c = col + dc;
  let count = 0;
  while (r >= 0 && c >= 0 && r < size && c < size && board[r][c] === color) {
    count += 1;
    r += dr;
    c += dc;
  }
  return count;
}

function isFive(row, col, color) {
  return [[1, 0], [0, 1], [1, 1], [1, -1]].some(([dr, dc]) => (
    1 + countOne(row, col, dr, dc, color) + countOne(row, col, -dr, -dc, color) >= 5
  ));
}

function colorName(color) {
  return color === 1 ? "黑棋" : "白棋";
}

function updateScore() {
  if (mode === "go") {
    scoreText.textContent = `黑提 ${goCaptures.black} · 白提 ${goCaptures.white}`;
  } else {
    scoreText.textContent = gameOver ? "本局结束" : `轮到${turn === 1 ? "黑棋" : "白棋"}`;
  }
}

function draw() {
  drawBoard();
  drawStones();
}

function drawBoard() {
  const margin = 54;
  const gap = (canvas.width - margin * 2) / (size - 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const wood = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  wood.addColorStop(0, "#f0c06f");
  wood.addColorStop(1, "#c98f45");
  ctx.fillStyle = wood;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#342514";
  ctx.lineWidth = 2.4;
  for (let i = 0; i < size; i += 1) {
    const p = margin + i * gap;
    ctx.beginPath();
    ctx.moveTo(margin, p);
    ctx.lineTo(canvas.width - margin, p);
    ctx.moveTo(p, margin);
    ctx.lineTo(p, canvas.height - margin);
    ctx.stroke();
  }
  const stars = size === 9
    ? [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]]
    : [[3, 3], [3, 7], [3, 11], [7, 3], [7, 7], [7, 11], [11, 3], [11, 7], [11, 11]];
  ctx.fillStyle = "#342514";
  stars.forEach(([r, c]) => {
    ctx.beginPath();
    ctx.arc(margin + c * gap, margin + r * gap, 5.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawStones() {
  const margin = 54;
  const gap = (canvas.width - margin * 2) / (size - 1);
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (board[r][c] === 0) continue;
      const x = margin + c * gap;
      const y = margin + r * gap;
      drawStone(x, y, gap * 0.4, board[r][c]);
    }
  }
}

function drawStone(x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.45, radius * 0.15, x, y, radius);
  if (color === 1) {
    gradient.addColorStop(0, "#4d5255");
    gradient.addColorStop(1, "#050607");
  } else {
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#d7d7d7");
  }
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color === 1 ? "#000" : "#9ea5aa";
  ctx.lineWidth = 2;
  ctx.stroke();
}

canvas.addEventListener("click", (event) => {
  const point = boardPointFromEvent(event);
  if (!point) return;
  playAt(point.row, point.col);
});

modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
passBtn.addEventListener("click", passGo);
undoBtn.addEventListener("click", undoMove);
resetBtn.addEventListener("click", resetGame);

setMode("go");
