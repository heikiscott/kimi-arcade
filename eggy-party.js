const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.querySelector("#statusText");
const starText = document.querySelector("#starText");
const timeText = document.querySelector("#timeText");
const startBtn = document.querySelector("#startBtn");
const restartBtn = document.querySelector("#restartBtn");

const W = canvas.width;
const H = canvas.height;
const keys = new Set();
const controls = new Set();
const platforms = [
  { x: 0, y: 540, w: 280, h: 42, color: "#60c878" },
  { x: 318, y: 488, w: 176, h: 36, color: "#ffd15f" },
  { x: 540, y: 430, w: 160, h: 36, color: "#f06aa3" },
  { x: 738, y: 365, w: 150, h: 36, color: "#32a7e2" },
  { x: 930, y: 512, w: 220, h: 42, color: "#60c878" },
  { x: 1180, y: 456, w: 210, h: 36, color: "#ffd15f" },
  { x: 1440, y: 392, w: 210, h: 36, color: "#f06aa3" },
  { x: 1700, y: 540, w: 360, h: 42, color: "#60c878" }
];
const stars = [
  { x: 390, y: 436, got: false },
  { x: 610, y: 376, got: false },
  { x: 815, y: 312, got: false },
  { x: 1260, y: 405, got: false },
  { x: 1532, y: 340, got: false }
];
const hammers = [
  { x: 1015, y: 458, r: 76, speed: 0.045 },
  { x: 1350, y: 395, r: 68, speed: -0.055 }
];
const pads = [
  { x: 240, y: 515, w: 68, h: 16 },
  { x: 900, y: 488, w: 74, h: 16 },
  { x: 1660, y: 515, w: 78, h: 16 }
];

const egg = {
  x: 80,
  y: 460,
  vx: 0,
  vy: 0,
  r: 25,
  grounded: false,
  face: 1
};

let playing = false;
let won = false;
let cameraX = 0;
let startTime = 0;
let elapsed = 0;
let starCount = 0;
let audioContext = null;

function getAudio() {
  if (!window.AudioContext && !window.webkitAudioContext) return null;
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function tone(freq, start, duration, gainValue = 0.025, type = "sine") {
  const audio = getAudio();
  if (!audio) return;
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
  osc.stop(audio.currentTime + start + duration + 0.04);
}

function jumpSound() {
  [440, 660, 880].forEach((note, i) => tone(note, i * 0.05, 0.09, 0.02, "triangle"));
}

function winSound() {
  [523, 659, 784, 1046, 1319].forEach((note, i) => tone(note, i * 0.13, 0.16, 0.026, "triangle"));
}

function resetGame() {
  getAudio();
  egg.x = 80;
  egg.y = 460;
  egg.vx = 0;
  egg.vy = 0;
  egg.grounded = false;
  egg.face = 1;
  cameraX = 0;
  won = false;
  playing = true;
  startTime = performance.now();
  elapsed = 0;
  starCount = 0;
  stars.forEach((star) => {
    star.got = false;
  });
  statusText.textContent = "蛋仔开跑！跳平台，躲旋转锤，冲到皇冠。";
}

function roundedRect(x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function isDown(name) {
  return keys.has(name) || controls.has(name);
}

function update() {
  if (!playing || won) return;
  elapsed = (performance.now() - startTime) / 1000;
  const left = isDown("left") || keys.has("arrowleft") || keys.has("a");
  const right = isDown("right") || keys.has("arrowright") || keys.has("d");
  const jump = isDown("jump") || keys.has("arrowup") || keys.has("w") || keys.has(" ");
  const roll = isDown("roll") || keys.has("arrowdown") || keys.has("s");
  const accel = roll ? 0.82 : 0.52;
  const maxSpeed = roll ? 8.5 : 5.3;

  if (left) {
    egg.vx -= accel;
    egg.face = -1;
  }
  if (right) {
    egg.vx += accel;
    egg.face = 1;
  }
  if (jump && egg.grounded) {
    egg.vy = -13.5;
    egg.grounded = false;
    jumpSound();
  }

  egg.vx *= egg.grounded ? 0.82 : 0.94;
  egg.vx = Math.max(-maxSpeed, Math.min(maxSpeed, egg.vx));
  egg.vy += 0.62;
  egg.vy = Math.min(17, egg.vy);
  egg.x += egg.vx;
  egg.y += egg.vy;
  egg.grounded = false;

  platforms.forEach((p) => {
    const prevBottom = egg.y - egg.vy + egg.r;
    const bottom = egg.y + egg.r;
    const withinX = egg.x + egg.r > p.x && egg.x - egg.r < p.x + p.w;
    if (withinX && prevBottom <= p.y && bottom >= p.y && egg.vy >= 0) {
      egg.y = p.y - egg.r;
      egg.vy = 0;
      egg.grounded = true;
    }
  });

  pads.forEach((pad) => {
    const hit = egg.x + egg.r > pad.x && egg.x - egg.r < pad.x + pad.w && egg.y + egg.r > pad.y - 5 && egg.y + egg.r < pad.y + 20 && egg.vy >= 0;
    if (hit) {
      egg.vy = -18;
      egg.grounded = false;
      statusText.textContent = "弹跳垫把蛋仔弹飞啦！";
      jumpSound();
    }
  });

  hammers.forEach((hammer) => {
    const angle = performance.now() * hammer.speed * 0.03;
    const hx = hammer.x + Math.cos(angle) * hammer.r;
    const hy = hammer.y + Math.sin(angle) * hammer.r;
    if (Math.hypot(egg.x - hx, egg.y - hy) < egg.r + 26) {
      egg.vx = (egg.x < hx ? -1 : 1) * 13;
      egg.vy = -10;
      statusText.textContent = "被旋转锤撞飞了，快稳住！";
    }
  });

  stars.forEach((star) => {
    if (!star.got && Math.hypot(egg.x - star.x, egg.y - star.y) < 42) {
      star.got = true;
      starCount += 1;
      tone(988, 0, 0.12, 0.025, "sine");
      tone(1319, 0.1, 0.14, 0.02, "sine");
    }
  });

  if (egg.y > H + 120) {
    egg.x = Math.max(80, cameraX + 80);
    egg.y = 260;
    egg.vx = 0;
    egg.vy = 0;
    statusText.textContent = "掉下去了，蛋仔从最近平台重新开始。";
  }

  if (egg.x > 1940 && egg.y < 540) {
    won = true;
    playing = false;
    statusText.textContent = `冲线成功！你拿到 ${starCount}/5 颗星，用时 ${elapsed.toFixed(1)} 秒。`;
    winSound();
  }

  cameraX = Math.max(0, Math.min(1080, egg.x - 280));
  starText.textContent = starCount;
  timeText.textContent = elapsed.toFixed(1);
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#9edcff");
  g.addColorStop(0.62, "#fff2b8");
  g.addColorStop(1, "#d9f5ff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  drawCloud(150 - cameraX * 0.22, 98, 1.1);
  drawCloud(520 - cameraX * 0.18, 142, 0.8);
  drawCloud(880 - cameraX * 0.24, 84, 0.95);
}

function drawCloud(x, y, s) {
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.beginPath();
  ctx.arc(x, y, 22 * s, 0, Math.PI * 2);
  ctx.arc(x + 28 * s, y - 8 * s, 30 * s, 0, Math.PI * 2);
  ctx.arc(x + 62 * s, y, 22 * s, 0, Math.PI * 2);
  ctx.arc(x + 30 * s, y + 12 * s, 22 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawWorld() {
  ctx.save();
  ctx.translate(-cameraX, 0);
  platforms.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    roundedRect(p.x, p.y, p.w, p.h, 18);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(p.x + 12, p.y + 8, p.w - 24, 6);
  });

  pads.forEach((pad) => {
    ctx.fillStyle = "#8f5fd9";
    ctx.beginPath();
    roundedRect(pad.x, pad.y, pad.w, pad.h, 8);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "900 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("弹", pad.x + pad.w / 2, pad.y + 13);
  });

  hammers.forEach((hammer, index) => drawHammer(hammer, index));
  stars.forEach((star) => {
    if (!star.got) drawStar(star.x, star.y, 18);
  });
  drawFinish();
  drawEggy();
  ctx.restore();
  ctx.textAlign = "left";
}

function drawHammer(hammer, index) {
  const angle = performance.now() * hammer.speed * 0.03;
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(hammer.x, hammer.y);
  ctx.lineTo(hammer.x + Math.cos(angle) * hammer.r, hammer.y + Math.sin(angle) * hammer.r);
  ctx.stroke();
  ctx.fillStyle = index % 2 ? "#f06aa3" : "#ffd15f";
  ctx.beginPath();
  ctx.arc(hammer.x + Math.cos(angle) * hammer.r, hammer.y + Math.sin(angle) * hammer.r, 26, 0, Math.PI * 2);
  ctx.fill();
}

function drawStar(x, y, r) {
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
}

function drawFinish() {
  ctx.fillStyle = "#172632";
  ctx.fillRect(1970, 326, 12, 214);
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.moveTo(1982, 340);
  ctx.lineTo(2060, 365);
  ctx.lineTo(1982, 390);
  ctx.closePath();
  ctx.fill();
  drawStar(2028, 364, 18);
  ctx.fillStyle = "#172632";
  ctx.font = "900 22px system-ui";
  ctx.fillText("终点皇冠", 1900, 312);
}

function drawEggy() {
  ctx.save();
  ctx.translate(egg.x, egg.y);
  ctx.rotate(egg.vx * 0.035);
  ctx.fillStyle = "#fff8df";
  ctx.beginPath();
  ctx.ellipse(0, 0, egg.r * 0.92, egg.r * 1.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#f06aa3";
  ctx.beginPath();
  ctx.arc(-9, -3, 5, 0, Math.PI * 2);
  ctx.arc(11, -3, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 8, 9, 0, Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#32a7e2";
  ctx.beginPath();
  roundedRect(-20, 18, 40, 16, 8);
  ctx.fill();
  ctx.restore();
}

function draw() {
  update();
  drawSky();
  drawWorld();
  requestAnimationFrame(draw);
}

document.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  if (event.code === "Space") {
    event.preventDefault();
    keys.add(" ");
  }
});

document.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
  if (event.code === "Space") keys.delete(" ");
});

document.addEventListener("pointerdown", (event) => {
  const button = event.target.closest("[data-control]");
  if (!button) return;
  getAudio();
  controls.add(button.dataset.control);
});

document.addEventListener("pointerup", (event) => {
  const button = event.target.closest("[data-control]");
  if (!button) return;
  controls.delete(button.dataset.control);
});

document.addEventListener("pointercancel", () => controls.clear());
startBtn.addEventListener("click", resetGame);
restartBtn.addEventListener("click", resetGame);

draw();
