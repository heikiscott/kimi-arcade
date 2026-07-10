const canvas = document.querySelector("#board");
const ctx = canvas.getContext("2d");
const nextCanvas = document.querySelector("#nextBoard");
const nextCtx = nextCanvas.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const linesText = document.querySelector("#linesText");
const levelText = document.querySelector("#levelText");
const statusBanner = document.querySelector("#statusBanner");
const musicText = document.querySelector("#musicText");
const startBtn = document.querySelector("#startBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const restartBtn = document.querySelector("#restartBtn");

const COLS = 10;
const ROWS = 20;
const SIZE = 30;
const COLORS = {
  I: "#32c7d9",
  O: "#ffd15f",
  T: "#8f5fd9",
  S: "#39a657",
  Z: "#d94a44",
  J: "#2f79c8",
  L: "#f28b2f"
};
const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
};

let board = makeBoard();
let piece = randomPiece();
let nextPiece = randomPiece();
let score = 0;
let lines = 0;
let level = 1;
let playing = false;
let paused = false;
let gameOver = false;
let lastTime = 0;
let dropCounter = 0;
let audioContext = null;

const FUNNY_JINGLES = [
  {
    name: "你爱我我爱你风格",
    type: "triangle",
    notes: [392, 440, 494, 392, 523, 494, 440, 392],
    step: 0.14
  },
  {
    name: "小火车叮叮",
    type: "square",
    notes: [330, 330, 392, 330, 392, 494, 392],
    step: 0.11
  },
  {
    name: "胜利蹦蹦",
    type: "sine",
    notes: [523, 659, 784, 1046, 784, 1046],
    step: 0.13
  },
  {
    name: "外星人咕噜",
    type: "sawtooth",
    notes: [220, 330, 247, 370, 277, 415, 311],
    step: 0.1
  },
  {
    name: "电梯叮咚",
    type: "triangle",
    notes: [659, 523, 784, 659],
    step: 0.18
  },
  {
    name: "方块大笑",
    type: "square",
    notes: [440, 660, 440, 660, 880, 660, 440],
    step: 0.09
  },
  {
    name: "金币哗啦",
    type: "sine",
    notes: [988, 1175, 1319, 1568, 1319],
    step: 0.08
  },
  {
    name: "超级四行王",
    type: "triangle",
    notes: [523, 659, 784, 1046, 1175, 1319, 1568, 1760],
    step: 0.09
  }
];

function makeBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(""));
}

function getAudio() {
  if (!window.AudioContext && !window.webkitAudioContext) return null;
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(freq, start, duration, gainValue = 0.04, type = "sine") {
  const audio = getAudio();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.04);
}

function playPop(start, count) {
  for (let i = 0; i < count; i += 1) {
    playTone(130 + i * 45, start + i * 0.045, 0.06, 0.025, "square");
  }
}

function playClearJingle(cleared) {
  const jingle = cleared >= 4 ? FUNNY_JINGLES[FUNNY_JINGLES.length - 1] : FUNNY_JINGLES[Math.floor(Math.random() * (FUNNY_JINGLES.length - 1))];
  musicText.textContent = `刚刚响了：${jingle.name}`;
  playPop(0, cleared * 3);
  jingle.notes.forEach((note, index) => {
    const extra = cleared >= 3 && index % 2 === 0 ? 12 : 0;
    playTone(note + extra, 0.16 + index * jingle.step, jingle.step * 0.86, 0.035 + cleared * 0.006, jingle.type);
  });
}

function randomPiece() {
  const names = Object.keys(SHAPES);
  const type = names[Math.floor(Math.random() * names.length)];
  return {
    type,
    shape: SHAPES[type].map((row) => row.slice()),
    x: Math.floor(COLS / 2) - 2,
    y: 0
  };
}

function rotate(shape) {
  return shape[0].map((_, x) => shape.map((row) => row[x]).reverse());
}

function collides(testPiece) {
  return testPiece.shape.some((row, y) =>
    row.some((value, x) => {
      if (!value) return false;
      const bx = testPiece.x + x;
      const by = testPiece.y + y;
      return bx < 0 || bx >= COLS || by >= ROWS || (by >= 0 && board[by][bx]);
    })
  );
}

function mergePiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value && piece.y + y >= 0) board[piece.y + y][piece.x + x] = piece.type;
    });
  });
}

function clearLines() {
  let cleared = 0;
  board = board.filter((row) => {
    if (row.every(Boolean)) {
      cleared += 1;
      return false;
    }
    return true;
  });
  while (board.length < ROWS) board.unshift(Array(COLS).fill(""));
  if (cleared) {
    lines += cleared;
    score += [0, 100, 300, 500, 800][cleared] * level;
    level = Math.floor(lines / 5) + 1;
    playClearJingle(cleared);
    statusBanner.textContent = `太棒了，消掉 ${cleared} 行！搞笑音乐响起来。`;
  }
}

function spawnPiece() {
  piece = nextPiece;
  piece.x = Math.floor(COLS / 2) - 2;
  piece.y = 0;
  nextPiece = randomPiece();
  if (collides(piece)) {
    gameOver = true;
    playing = false;
    statusBanner.textContent = "游戏结束，点重来再玩。";
  }
}

function move(dx) {
  if (!playing || paused || gameOver) return;
  const moved = { ...piece, x: piece.x + dx };
  if (!collides(moved)) piece = moved;
}

function softDrop() {
  if (!playing || paused || gameOver) return false;
  const moved = { ...piece, y: piece.y + 1 };
  if (!collides(moved)) {
    piece = moved;
    score += 1;
    return true;
  }
  mergePiece();
  clearLines();
  spawnPiece();
  return false;
}

function hardDrop() {
  if (!playing || paused || gameOver) return;
  while (softDrop()) score += 2;
}

function rotatePiece() {
  if (!playing || paused || gameOver) return;
  const rotated = { ...piece, shape: rotate(piece.shape) };
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    const candidate = { ...rotated, x: rotated.x + kick };
    if (!collides(candidate)) {
      piece = candidate;
      return;
    }
  }
}

function drawCell(targetCtx, x, y, size, color) {
  targetCtx.fillStyle = color;
  targetCtx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  targetCtx.fillStyle = "rgba(255,255,255,0.22)";
  targetCtx.fillRect(x * size + 4, y * size + 4, size - 8, 5);
}

function drawBoard() {
  ctx.fillStyle = "#101923";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLS; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * SIZE, 0);
    ctx.lineTo(x * SIZE, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * SIZE);
    ctx.lineTo(canvas.width, y * SIZE);
    ctx.stroke();
  }
  board.forEach((row, y) => {
    row.forEach((type, x) => {
      if (type) drawCell(ctx, x, y, SIZE, COLORS[type]);
    });
  });
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) drawCell(ctx, piece.x + x, piece.y + y, SIZE, COLORS[piece.type]);
    });
  });
}

function drawNext() {
  nextCtx.fillStyle = "#101923";
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  const size = 24;
  const offsetX = Math.floor((5 - nextPiece.shape[0].length) / 2);
  const offsetY = Math.floor((5 - nextPiece.shape.length) / 2);
  nextPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) drawCell(nextCtx, offsetX + x, offsetY + y, size, COLORS[nextPiece.type]);
    });
  });
}

function updateScore() {
  scoreText.textContent = score;
  linesText.textContent = lines;
  levelText.textContent = level;
}

function resetGame() {
  getAudio();
  board = makeBoard();
  piece = randomPiece();
  nextPiece = randomPiece();
  score = 0;
  lines = 0;
  level = 1;
  dropCounter = 0;
  gameOver = false;
  paused = false;
  playing = true;
  musicText.textContent = "等你消一行就随机响";
  statusBanner.textContent = "游戏开始，方块正在掉。";
}

function togglePause() {
  if (!playing || gameOver) return;
  paused = !paused;
  statusBanner.textContent = paused ? "暂停中。" : "继续掉方块。";
}

function frame(time = 0) {
  const delta = time - lastTime;
  lastTime = time;
  if (playing && !paused && !gameOver) {
    dropCounter += delta;
    const interval = Math.max(120, 760 - (level - 1) * 70);
    if (dropCounter > interval) {
      softDrop();
      dropCounter = 0;
    }
  }
  drawBoard();
  drawNext();
  updateScore();
  requestAnimationFrame(frame);
}

document.addEventListener("keydown", (event) => {
  getAudio();
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") move(-1);
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") move(1);
  if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") rotatePiece();
  if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") softDrop();
  if (event.code === "Space") {
    event.preventDefault();
    hardDrop();
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  getAudio();
  const action = button.dataset.action;
  if (action === "left") move(-1);
  if (action === "right") move(1);
  if (action === "rotate") rotatePiece();
  if (action === "down") softDrop();
  if (action === "drop") hardDrop();
});

startBtn.addEventListener("click", () => {
  if (!playing || gameOver) resetGame();
  else {
    paused = false;
    statusBanner.textContent = "继续掉方块。";
  }
});
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", resetGame);

drawBoard();
drawNext();
requestAnimationFrame(frame);
