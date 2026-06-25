const canvas = document.querySelector("#mazeCanvas");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");
const restartBtn = document.querySelector("#restartBtn");
const movieRestartBtn = document.querySelector("#movieRestartBtn");
const winMovie = document.querySelector("#winMovie");

const maze = [
  "#############",
  "#S#.........#",
  "#.#.#######.#",
  "#.#.....#...#",
  "#.#####.#.###",
  "#.....#.#...#",
  "#####.#.###.#",
  "#...#.#.....#",
  "#.#.#.#####.#",
  "#.#...#.....#",
  "#.#####.###.#",
  "#.........#E#",
  "#############"
];

const cell = 48;
const offsetX = 128;
const offsetY = 18;
const player = { row: 1, col: 1, step: 0 };
let won = false;
let audioContext = null;

function getAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(freq, start, duration, gainValue = 0.06, type = "square") {
  const audio = getAudio();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.03);
}

function playStep() {
  playTone(392, 0, 0.05, 0.025);
}

function playWinMusic() {
  const melody = [523, 659, 784, 1046, 988, 784, 659, 784, 880, 1174, 1046, 880, 784, 1046, 1318, 1568];
  const bass = [196, 262, 220, 247, 262, 196, 220, 262];
  melody.forEach((note, index) => playTone(note, index * 0.16, 0.13, 0.055));
  bass.forEach((note, index) => playTone(note, index * 0.32, 0.2, 0.026, "triangle"));
  playTone(1760, 2.7, 0.5, 0.06);
}

function reset() {
  player.row = 1;
  player.col = 1;
  player.step = 0;
  won = false;
  winMovie.classList.remove("show");
  statusEl.textContent = "从左上角出发，走到右下角的星星门就赢。";
  draw();
}

function move(dr, dc) {
  if (won) return;
  const nextRow = player.row + dr;
  const nextCol = player.col + dc;
  if (maze[nextRow][nextCol] === "#") {
    statusEl.textContent = "撞墙了，换一条路。";
    playTone(180, 0, 0.08, 0.03, "triangle");
    return;
  }

  player.row = nextRow;
  player.col = nextCol;
  player.step += 1;
  statusEl.textContent = `已经走了 ${player.step} 步，继续找终点。`;
  playStep();
  draw();

  if (maze[player.row][player.col] === "E") {
    won = true;
    statusEl.textContent = "赢了! 结尾片段开始。";
    winMovie.classList.add("show");
    playWinMusic();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#8ed0f1";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#77b75a";
  ctx.fillRect(0, 520, canvas.width, 140);

  for (let row = 0; row < maze.length; row += 1) {
    for (let col = 0; col < maze[row].length; col += 1) {
      const x = offsetX + col * cell;
      const y = offsetY + row * cell;
      const tile = maze[row][col];
      if (tile === "#") {
        ctx.fillStyle = "#245b8f";
        ctx.fillRect(x, y, cell, cell);
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        ctx.fillRect(x + 4, y + 4, cell - 8, 8);
      } else {
        ctx.fillStyle = "#fff6d9";
        ctx.fillRect(x, y, cell, cell);
        ctx.strokeStyle = "rgba(23,38,50,0.08)";
        ctx.strokeRect(x, y, cell, cell);
      }

      if (tile === "S") drawStart(x, y);
      if (tile === "E") drawGoal(x, y);
    }
  }

  drawPlayer(offsetX + player.col * cell, offsetY + player.row * cell);
}

function drawStart(x, y) {
  ctx.fillStyle = "#39a657";
  ctx.fillRect(x + 10, y + 12, 28, 30);
  ctx.fillStyle = "#fff";
  ctx.font = "18px system-ui";
  ctx.fillText("起", x + 14, y + 34);
}

function drawGoal(x, y) {
  ctx.fillStyle = "#d93a32";
  ctx.fillRect(x + 12, y + 18, 26, 24);
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + i * (Math.PI / 5);
    const radius = i % 2 === 0 ? 17 : 7;
    ctx.lineTo(x + 24 + Math.cos(angle) * radius, y + 18 + Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
}

function drawPlayer(x, y) {
  const bob = Math.sin(player.step * 0.9) * 2;
  ctx.fillStyle = "#245bb8";
  ctx.fillRect(x + 16, y + 24 + bob, 17, 18);
  ctx.fillStyle = "#f0bf8a";
  ctx.beginPath();
  ctx.arc(x + 24, y + 17 + bob, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d93a32";
  ctx.fillRect(x + 12, y + 7 + bob, 25, 8);
  ctx.fillRect(x + 18, y + 1 + bob, 13, 8);
  ctx.fillStyle = "#1b1b1b";
  ctx.fillRect(x + 19, y + 16 + bob, 3, 3);
  ctx.fillRect(x + 28, y + 16 + bob, 3, 3);
  ctx.fillStyle = "#49301f";
  ctx.fillRect(x + 13, y + 41 + bob, 10, 5);
  ctx.fillRect(x + 26, y + 41 + bob, 10, 5);
}

window.addEventListener("keydown", (event) => {
  const keyMoves = {
    ArrowUp: [-1, 0],
    w: [-1, 0],
    ArrowDown: [1, 0],
    s: [1, 0],
    ArrowLeft: [0, -1],
    a: [0, -1],
    ArrowRight: [0, 1],
    d: [0, 1]
  };
  const moveBy = keyMoves[event.key];
  if (!moveBy) return;
  event.preventDefault();
  move(moveBy[0], moveBy[1]);
});

document.querySelectorAll("[data-move]").forEach((button) => {
  button.addEventListener("click", () => {
    const moves = {
      up: [-1, 0],
      down: [1, 0],
      left: [0, -1],
      right: [0, 1]
    };
    const moveBy = moves[button.dataset.move];
    move(moveBy[0], moveBy[1]);
  });
});

restartBtn.addEventListener("click", reset);
movieRestartBtn.addEventListener("click", reset);

reset();
