const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const restartBtn = document.querySelector("#restartBtn");
const introOverlay = document.querySelector("#introOverlay");
const startIntroBtn = document.querySelector("#startIntroBtn");
const introStatus = document.querySelector("#introStatus");

const keys = new Set();
let audioContext = null;
let musicTimer = null;
let musicStarted = false;
let introTimer = null;
let introPlaying = false;
let gameStarted = false;
let won = false;

const player = {
  x: 50,
  y: 360,
  w: 34,
  h: 50,
  vx: 0,
  vy: 0,
  grounded: false
};

const platforms = [
  { x: 0, y: 492, w: 960, h: 48 },
  { x: 150, y: 396, w: 130, h: 22 },
  { x: 340, y: 324, w: 140, h: 22 },
  { x: 560, y: 258, w: 140, h: 22 },
  { x: 740, y: 366, w: 110, h: 22 }
];

const coins = [
  { x: 178, y: 350, got: false },
  { x: 384, y: 278, got: false },
  { x: 605, y: 214, got: false },
  { x: 786, y: 322, got: false },
  { x: 460, y: 450, got: false },
  { x: 710, y: 450, got: false }
];

const flag = { x: 900, y: 380, w: 18, h: 112 };

function reset() {
  window.clearTimeout(introTimer);
  stopMusic();
  keys.clear();
  player.x = 50;
  player.y = 360;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  coins.forEach((coin) => {
    coin.got = false;
  });
  introPlaying = false;
  gameStarted = false;
  won = false;
  introOverlay.classList.remove("hidden");
  startIntroBtn.disabled = false;
  startIntroBtn.textContent = "播放片头";
  introStatus.textContent = "先听片头音乐，然后开始游戏";
  updateScore();
}

function updateScore() {
  const got = coins.filter((coin) => coin.got).length;
  scoreEl.textContent = `金币 ${got} / ${coins.length}${won ? " · 胜利!" : ""}`;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function tick() {
  if (!gameStarted) {
    draw();
    requestAnimationFrame(tick);
    return;
  }

  const left = keys.has("ArrowLeft") || keys.has("a");
  const right = keys.has("ArrowRight") || keys.has("d");
  const jump = keys.has(" ") || keys.has("ArrowUp") || keys.has("w");

  player.vx = (right ? 4.4 : 0) - (left ? 4.4 : 0);
  if (jump && player.grounded) {
    player.vy = -12.2;
    player.grounded = false;
  }

  player.vy += 0.58;
  player.x += player.vx;
  player.y += player.vy;
  player.grounded = false;

  platforms.forEach((platform) => {
    if (rectsOverlap(player, platform) && player.vy >= 0 && player.y + player.h - player.vy <= platform.y + 4) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  });

  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  if (player.y > canvas.height) {
    player.x = 50;
    player.y = 360;
    player.vy = 0;
  }

  coins.forEach((coin) => {
    if (!coin.got && rectsOverlap(player, { x: coin.x - 12, y: coin.y - 12, w: 24, h: 24 })) {
      coin.got = true;
      playCoin();
      updateScore();
    }
  });

  if (!won && rectsOverlap(player, flag)) {
    won = true;
    stopMusic();
    updateScore();
    playVictory();
  }

  draw();
  requestAnimationFrame(tick);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#8ed0f1";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff88";
  ctx.beginPath();
  ctx.ellipse(160, 90, 68, 24, 0, 0, Math.PI * 2);
  ctx.ellipse(680, 120, 84, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  platforms.forEach((platform) => {
    ctx.fillStyle = "#7b4f2e";
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = "#52a44a";
    ctx.fillRect(platform.x, platform.y, platform.w, 8);
  });

  coins.forEach((coin) => {
    if (coin.got) return;
    ctx.fillStyle = "#ffd15f";
    ctx.beginPath();
    ctx.ellipse(coin.x, coin.y, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b77b1d";
    ctx.stroke();
  });

  ctx.fillStyle = "#18313d";
  ctx.fillRect(flag.x + 8, flag.y, 6, flag.h);
  ctx.fillStyle = "#d93a32";
  ctx.beginPath();
  ctx.moveTo(flag.x + 14, flag.y + 12);
  ctx.lineTo(flag.x + 74, flag.y + 32);
  ctx.lineTo(flag.x + 14, flag.y + 52);
  ctx.fill();

  drawPlayer();

  if (won) {
    ctx.fillStyle = "rgba(255, 250, 240, 0.9)";
    ctx.fillRect(270, 160, 420, 118);
    ctx.fillStyle = "#18313d";
    ctx.font = "48px system-ui";
    ctx.fillText("你赢了!", 394, 232);
  }
}

function drawPlayer() {
  const x = player.x;
  const y = player.y;
  ctx.fillStyle = "#245bb8";
  ctx.fillRect(x + 8, y + 24, 20, 24);
  ctx.fillStyle = "#f0bf8a";
  ctx.fillRect(x + 8, y + 9, 22, 18);
  ctx.fillStyle = "#d93a32";
  ctx.fillRect(x + 4, y + 2, 28, 10);
  ctx.fillRect(x + 10, y - 4, 16, 10);
  ctx.fillStyle = "#2a1d16";
  ctx.fillRect(x + 12, y + 18, 16, 4);
  ctx.fillStyle = "#1b1b1b";
  ctx.fillRect(x + 12, y + 14, 3, 3);
  ctx.fillRect(x + 23, y + 14, 3, 3);
  ctx.fillStyle = "#49301f";
  ctx.fillRect(x + 5, y + 44, 9, 7);
  ctx.fillRect(x + 22, y + 44, 9, 7);
}

function getAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(freq, start, duration, gainValue = 0.08) {
  const audio = getAudio();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.03);
}

function playCoin() {
  playTone(880, 0, 0.08, 0.05);
  playTone(1320, 0.08, 0.1, 0.05);
}

function playVictory() {
  const notes = [523, 659, 784, 1046, 784, 659, 698, 880, 1174, 880, 784, 1046, 1318, 1568, 1318, 1046];
  notes.forEach((note, index) => playTone(note, index * 0.15, 0.13, 0.07));
}

function playOpeningMusic() {
  const melody = [392, 523, 659, 784, 659, 523, 440, 587, 698, 880, 698, 587, 523, 659, 784, 1046, 988, 784, 659, 523];
  const bass = [196, 196, 262, 262, 220, 220, 247, 247, 262, 196];
  melody.forEach((note, index) => {
    playTone(note, index * 0.19, 0.15, 0.045);
  });
  bass.forEach((note, index) => {
    playTone(note, index * 0.38, 0.28, 0.025);
  });
  playTone(1046, 4.05, 0.25, 0.05);
  playTone(1318, 4.31, 0.25, 0.05);
  playTone(1568, 4.58, 0.48, 0.055);
}

function playMusicBar() {
  if (won) return;
  const melody = [330, 392, 523, 392, 440, 587, 523, 392, 294, 349, 440, 349, 392, 523, 659, 523];
  const bass = [165, 196, 220, 196];
  melody.forEach((note, index) => {
    playTone(note, index * 0.14, 0.105, 0.022);
  });
  bass.forEach((note, index) => {
    playTone(note, index * 0.56, 0.16, 0.018);
  });
}

function startMusic() {
  if (musicStarted || won) return;
  musicStarted = true;
  playMusicBar();
  musicTimer = window.setInterval(playMusicBar, 2240);
}

function stopMusic() {
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
  musicStarted = false;
}

function beginGame() {
  introPlaying = false;
  gameStarted = true;
  introOverlay.classList.add("hidden");
  startMusic();
}

function startIntro() {
  if (introPlaying || gameStarted) return;
  introPlaying = true;
  startIntroBtn.disabled = true;
  startIntroBtn.textContent = "片头播放中";
  introStatus.textContent = "片头音乐正在播放，马上开始";
  playOpeningMusic();
  introTimer = window.setTimeout(beginGame, 5300);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key);
  if (!gameStarted) {
    if (event.key === "Enter" || event.key === " ") {
      startIntro();
      event.preventDefault();
    }
    return;
  }
  startMusic();
  if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.key));
canvas.addEventListener("pointerdown", () => {
  if (gameStarted) startMusic();
});
startIntroBtn.addEventListener("click", startIntro);
restartBtn.addEventListener("click", () => {
  reset();
});

reset();
tick();
