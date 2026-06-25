const canvas = document.querySelector("#raceCanvas");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");
const trackChoices = document.querySelector("#trackChoices");
const starChoices = document.querySelector("#starChoices");
const carChoices = document.querySelector("#carChoices");
const driverChoices = document.querySelector("#driverChoices");
const tireChoices = document.querySelector("#tireChoices");
const wingChoices = document.querySelector("#wingChoices");
const iconChoices = document.querySelector("#iconChoices");
const startBtn = document.querySelector("#startBtn");
const resetBtn = document.querySelector("#resetBtn");
const againBtn = document.querySelector("#againBtn");
const finishCard = document.querySelector("#finishCard");
const finishTitle = document.querySelector("#finishTitle");
const finishText = document.querySelector("#finishText");

const tracks = [
  { id: "sky", name: "天上", road: "#b8d8ff", bg: ["#77c8f0", "#eaf8ff"], obstacle: "云墙" },
  { id: "underground", name: "地下", road: "#5b5f67", bg: ["#202833", "#4f3d30"], obstacle: "石头" },
  { id: "airport", name: "机场", road: "#d8dce2", bg: ["#9ed8f0", "#90b56b"], obstacle: "路障" },
  { id: "station", name: "火车站", road: "#787f87", bg: ["#d9e5ea", "#9a724f"], obstacle: "行李" },
  { id: "ghost", name: "鬼屋", road: "#453854", bg: ["#2d2740", "#171827"], obstacle: "幽灵门" },
  { id: "volcano", name: "火山", road: "#3b3030", bg: ["#c4552f", "#2a1d16"], obstacle: "岩浆石" }
];

const cars = [
  { id: "red", name: "法拉利风格", color: "#d93a32", speed: 1.04 },
  { id: "sport", name: "跑车", color: "#245b8f", speed: 1.02 },
  { id: "tesla", name: "电动车", color: "#f4f7fa", speed: 1.0 },
  { id: "simple", name: "简单车", color: "#ffd15f", speed: 0.96 },
  { id: "offroad", name: "牧场越野", color: "#39a657", speed: 0.94 }
];

const drivers = [
  { id: "mario", name: "马里奥", color: "#d93a32", hat: "M" },
  { id: "luigi", name: "路易吉", color: "#39a657", hat: "L" },
  { id: "princess", name: "公主", color: "#d94a78", hat: "P" },
  { id: "bowser", name: "坏乌龟", color: "#f08a2d", hat: "B" },
  { id: "ghost", name: "幽灵", color: "#f4f7fa", hat: "G" },
  { id: "mushroom", name: "蘑菇", color: "#ffffff", hat: "T" },
  { id: "star", name: "星星", color: "#ffd15f", hat: "★" }
];

const tires = [
  { id: "normal", name: "普通胎", grip: 1 },
  { id: "big", name: "大轮胎", grip: 0.86 },
  { id: "fast", name: "快轮胎", grip: 1.12 }
];

const wings = [
  { id: "none", name: "无翅膀" },
  { id: "small", name: "小翅膀" },
  { id: "plane", name: "飞机翼" }
];

const icons = ["M", "闪", "星", "1"];
const keys = new Set();
let selectedTrack = tracks[0];
let selectedStars = 1;
let selectedCar = cars[0];
let selectedDriver = drivers[0];
let selectedTire = tires[0];
let selectedWing = wings[0];
let selectedIcon = icons[0];
let running = false;
let won = false;
let gameOver = false;
let roadOffset = 0;
let distance = 0;
let airborne = 0;
let jumpFrames = 0;
let jumpCooldown = 0;
let flyBoost = 0;
let lastGapHit = -9999;
let audioContext = null;

const player = {
  x: 450,
  y: 500,
  speed: 4,
  targetSpeed: 4,
  tilt: 0
};

let coins = [];
let rivalCars = [];
let cliffGaps = [];

function makeButtons(container, items, getLabel, isActive, onPick) {
  container.innerHTML = "";
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = getLabel(item);
    button.classList.toggle("active", isActive(item));
    button.addEventListener("click", () => {
      onPick(item);
      drawMenu();
    });
    container.append(button);
  });
}

function drawMenu() {
  makeButtons(trackChoices, tracks, (track) => track.name, (track) => track === selectedTrack, (track) => {
    selectedTrack = track;
  });
  makeButtons(starChoices, [1, 2, 3, 4], (star) => `${"★".repeat(star)}${"☆".repeat(4 - star)}`, (star) => star === selectedStars, (star) => {
    selectedStars = star;
  });
  makeButtons(carChoices, cars, (car) => car.name, (car) => car === selectedCar, (car) => {
    selectedCar = car;
  });
  makeButtons(driverChoices, drivers, (driver) => driver.name, (driver) => driver === selectedDriver, (driver) => {
    selectedDriver = driver;
  });
  makeButtons(tireChoices, tires, (tire) => tire.name, (tire) => tire === selectedTire, (tire) => {
    selectedTire = tire;
  });
  makeButtons(wingChoices, wings, (wing) => wing.name, (wing) => wing === selectedWing, (wing) => {
    selectedWing = wing;
  });
  makeButtons(iconChoices, icons, (icon) => icon, (icon) => icon === selectedIcon, (icon) => {
    selectedIcon = icon;
  });
  draw();
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

function playTone(freq, start, duration, gainValue = 0.04, type = "square") {
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

function playStart() {
  [392, 523, 659, 784].forEach((note, index) => playTone(note, index * 0.1, 0.08, 0.04));
}

function playCollect() {
  playTone(880, 0, 0.06, 0.035);
  playTone(1320, 0.07, 0.08, 0.035);
}

function playWing() {
  [523, 784, 1046].forEach((note, index) => playTone(note, index * 0.08, 0.11, 0.04, "sine"));
}

function playFinish() {
  const notes = [523, 659, 784, 1046, 988, 784, 880, 1174, 1046, 1318, 1568];
  notes.forEach((note, index) => playTone(note, index * 0.14, 0.12, 0.055));
}

function startRace() {
  running = true;
  won = false;
  gameOver = false;
  distance = 0;
  roadOffset = 0;
  airborne = 0;
  jumpFrames = 0;
  jumpCooldown = 0;
  flyBoost = 0;
  lastGapHit = -9999;
  player.x = 450;
  player.speed = 4 + selectedStars * 0.45;
  player.targetSpeed = player.speed;
  player.tilt = 0;
  finishCard.classList.remove("show");
  finishTitle.textContent = "冲线成功!";
  statusEl.textContent = `${selectedDriver.name}开着${selectedCar.name}出发! 注意别的车和悬崖。`;
  buildItems();
  playStart();
}

function resetRace() {
  running = false;
  won = false;
  gameOver = false;
  distance = 0;
  airborne = 0;
  jumpFrames = 0;
  jumpCooldown = 0;
  flyBoost = 0;
  finishCard.classList.remove("show");
  statusEl.textContent = "选好地图和车，点开始赛车。";
  buildItems();
  draw();
}

function buildItems() {
  coins = [];
  rivalCars = [];
  cliffGaps = [];
  for (let index = 0; index < 30; index += 1) {
    coins.push({
      x: 250 + Math.floor(Math.random() * 400),
      y: -120 - index * 240,
      got: false
    });
  }
  const rivalLabels = ["LR", "星", "M", "7", "GO", "闪"];
  for (let index = 0; index < 12 + selectedStars * 2; index += 1) {
    rivalCars.push({
      x: 250 + Math.floor(Math.random() * 400),
      y: -280 - index * 560,
      color: ["#d93a32", "#245b8f", "#39a657", "#ffd15f", "#8f5fd9"][index % 5],
      label: rivalLabels[index % rivalLabels.length]
    });
  }
  for (let index = 0; index < 5 + selectedStars; index += 1) {
    cliffGaps.push({
      y: -900 - index * 1350,
      h: 95
    });
  }
}

function raceGoalDistance() {
  return 12000 + selectedStars * 3500;
}

function update() {
  if (!running || won || gameOver) {
    draw();
    requestAnimationFrame(update);
    return;
  }

  const left = keys.has("ArrowLeft") || keys.has("a");
  const right = keys.has("ArrowRight") || keys.has("d");
  const fast = keys.has("ArrowUp") || keys.has("w");
  const slow = keys.has("ArrowDown") || keys.has("s");
  const fly = keys.has("f");
  const turn = 5.2 * selectedTire.grip;
  if (left) player.x -= turn;
  if (right) player.x += turn;
  const targetTilt = left ? -0.18 : right ? 0.18 : 0;
  player.tilt += (targetTilt - player.tilt) * 0.18;
  if (fly) {
    flyBoost = Math.min(90, flyBoost + (selectedWing.id === "none" ? 1.8 : 3.2));
    if (flyBoost < 5) playWing();
  } else {
    flyBoost = Math.max(0, flyBoost - 2.5);
  }
  jumpFrames = Math.max(0, jumpFrames - 1);
  jumpCooldown = Math.max(0, jumpCooldown - 1);
  const flyingNow = isPlayerAirborne();
  player.targetSpeed = (4 + selectedStars * 0.45) * selectedCar.speed + (fast ? 1.8 : 0) - (slow ? 1.5 : 0) + (flyingNow ? 0.9 : 0);
  player.speed += (player.targetSpeed - player.speed) * 0.08;
  player.x = Math.max(34, Math.min(canvas.width - 34, player.x));
  roadOffset = (roadOffset + player.speed) % 80;
  distance += player.speed;
  airborne = Math.max(0, airborne - 1);

  coins.forEach((coin) => {
    coin.y += player.speed;
    if (!coin.got && Math.hypot(player.x - coin.x, player.y - coin.y) < 42) {
      coin.got = true;
      playCollect();
    }
    if (coin.y > canvas.height + 80) {
      coin.y = -300 - Math.random() * 900;
      coin.x = roadCenterAtY(180) - 190 + Math.floor(Math.random() * 380);
      coin.got = false;
    }
  });

  rivalCars.forEach((rival) => {
    rival.y += player.speed * 0.82;
    if (rival.y > canvas.height + 90) {
      rival.y = -600 - Math.random() * 900;
      rival.x = roadCenterAtY(140) - 185 + Math.floor(Math.random() * 370);
    }
    if (!flyingNow && Math.abs(player.x - rival.x) < 52 && Math.abs(player.y - rival.y) < 78) {
      endRace(`撞到写着 ${rival.label} 的车，嘎了。`);
    }
  });

  cliffGaps.forEach((gap) => {
    gap.y += player.speed;
    if (gap.y > canvas.height + 120) {
      gap.y = -900 - Math.random() * 1100;
    }
    const inGap = player.y > gap.y && player.y < gap.y + gap.h;
    if (inGap && distance - lastGapHit > 140) {
      lastGapHit = distance;
      if (selectedWing.id === "none" && !isPlayerAirborne()) {
        endRace(selectedTrack.id === "sky" ? "没有翅膀，从天上掉下去了，嘎了。" : "没有翅膀，掉进悬崖，嘎了。");
      } else {
        airborne = Math.max(airborne, selectedWing.id === "none" ? 34 : 76);
        statusEl.textContent = selectedWing.id === "none" ? "你自己跳起来，飞过悬崖!" : "翅膀自动打开，飞过悬崖!";
        playWing();
      }
    }
  });

  if (distance >= raceGoalDistance()) {
    won = true;
    running = false;
    finishTitle.textContent = "冲线成功!";
    finishText.textContent = `${selectedCar.name}在${selectedTrack.name}赛道赢了!`;
    finishCard.classList.add("show");
    statusEl.textContent = "赢了! 赛车结尾片段开始。";
    playFinish();
  }

  draw();
  requestAnimationFrame(update);
}

function jumpPlayer() {
  if (!running || won || gameOver || jumpCooldown > 0) return;
  jumpFrames = 34;
  jumpCooldown = 44;
  statusEl.textContent = "你的车跳起来了，别的车不会跳!";
  playTone(560, 0, 0.08, 0.04, "sine");
  playTone(760, 0.08, 0.08, 0.04, "sine");
}

function isPlayerAirborne() {
  return airborne > 0 || jumpFrames > 0 || flyBoost > 0;
}

function endRace(message) {
  if (gameOver || won) return;
  gameOver = true;
  running = false;
  finishTitle.textContent = "嘎了!";
  finishText.textContent = message;
  finishCard.classList.add("show");
  statusEl.textContent = message;
  playTone(160, 0, 0.18, 0.05, "triangle");
  playTone(95, 0.16, 0.28, 0.045, "triangle");
}

function draw() {
  drawBackground();
  drawRoad();
  drawItems();
  drawCar();
  drawHud();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, selectedTrack.bg[0]);
  gradient.addColorStop(1, selectedTrack.bg[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (selectedTrack.id === "sky") {
    drawCloud(120, 90);
    drawCloud(730, 150);
  }
  if (selectedTrack.id === "airport") {
    drawHugeAirportPlane();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(34, 450, 180, 26);
    ctx.fillRect(690, 430, 160, 24);
  }
  if (selectedTrack.id === "station") {
    ctx.fillStyle = "#344653";
    ctx.fillRect(46, 420, 190, 74);
    ctx.fillStyle = "#d9e5ea";
    ctx.fillRect(66, 438, 34, 22);
    ctx.fillRect(116, 438, 34, 22);
  }
  if (selectedTrack.id === "volcano") {
    ctx.fillStyle = "#ff7a2f";
    ctx.beginPath();
    ctx.moveTo(30, 620);
    ctx.lineTo(160, 250);
    ctx.lineTo(300, 620);
    ctx.fill();
  }
  if (selectedTrack.id === "ghost") {
    drawHauntedHouse();
  }
}

function drawHauntedHouse() {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#15101f";
  ctx.beginPath();
  ctx.moveTo(42, 360);
  ctx.lineTo(120, 250);
  ctx.lineTo(200, 360);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(58, 360, 126, 130);
  ctx.fillStyle = "#ffd15f";
  ctx.fillRect(78, 382, 26, 28);
  ctx.fillRect(138, 382, 26, 28);
  ctx.fillStyle = "#15101f";
  ctx.beginPath();
  ctx.moveTo(690, 364);
  ctx.lineTo(782, 238);
  ctx.lineTo(870, 364);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(708, 364, 142, 150);
  ctx.fillStyle = "#ffd15f";
  ctx.fillRect(733, 392, 28, 30);
  ctx.fillRect(798, 392, 28, 30);

  drawGhostMonster(126, 116, "鬼");
  drawZombieMonster(760, 126, "僵尸");
  drawZombieMonster(84, 536, "丧尸", "#78a56b");
  drawMummyMonster(806, 536, "逆尸");
  drawSkeletonHead(246, 214);
  drawPumpkin(646, 222);
  drawPumpkin(210, 522);
  drawGhostMonster(720 + Math.sin(distance / 44) * 18, 312, "幽灵");
}

function drawGhostMonster(x, y, label) {
  ctx.save();
  ctx.translate(x, y + Math.sin(distance / 52 + x) * 8);
  ctx.fillStyle = "rgba(244,247,250,0.86)";
  ctx.beginPath();
  ctx.arc(0, 0, 34, Math.PI, 0);
  ctx.lineTo(34, 58);
  ctx.lineTo(18, 46);
  ctx.lineTo(4, 58);
  ctx.lineTo(-10, 46);
  ctx.lineTo(-34, 58);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(-12, 6, 5, 0, Math.PI * 2);
  ctx.arc(12, 6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "bold 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, 0, 32);
  ctx.restore();
}

function drawZombieMonster(x, y, label, skin = "#8dbb7a") {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.roundRect(-22, -28, 44, 50, 12);
  ctx.fill();
  ctx.fillStyle = "#573b58";
  ctx.fillRect(-28, 22, 56, 54);
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(-8, -8, 4, 0, Math.PI * 2);
  ctx.arc(10, -8, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, 9);
  ctx.lineTo(12, 13);
  ctx.stroke();
  ctx.fillStyle = "#fffaf0";
  ctx.font = "bold 14px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, 0, 54);
  ctx.restore();
}

function drawMummyMonster(x, y, label) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#d9cbb4";
  ctx.beginPath();
  ctx.roundRect(-24, -38, 48, 112, 18);
  ctx.fill();
  ctx.strokeStyle = "#fff4df";
  ctx.lineWidth = 5;
  for (let line = -28; line < 68; line += 18) {
    ctx.beginPath();
    ctx.moveTo(-22, line);
    ctx.lineTo(22, line + 10);
    ctx.stroke();
  }
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(-8, -14, 4, 0, Math.PI * 2);
  ctx.arc(9, -14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fffaf0";
  ctx.font = "bold 14px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, 0, 94);
  ctx.restore();
}

function drawSkeletonHead(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#f4f0df";
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.roundRect(-18, 16, 36, 32, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(-11, -4, 8, 0, Math.PI * 2);
  ctx.arc(12, -4, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-14, 28, 28, 5);
  ctx.fillStyle = "#f4f0df";
  ctx.fillRect(-8, 28, 3, 9);
  ctx.fillRect(3, 28, 3, 9);
  ctx.fillStyle = "#fffaf0";
  ctx.font = "bold 14px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("骷髅头", 0, 66);
  ctx.restore();
}

function drawPumpkin(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#2f6b35";
  ctx.fillRect(-5, -34, 10, 22);
  ctx.fillStyle = "#f08a2d";
  ctx.beginPath();
  ctx.ellipse(-18, 0, 22, 30, 0, 0, Math.PI * 2);
  ctx.ellipse(18, 0, 22, 30, 0, 0, Math.PI * 2);
  ctx.ellipse(0, 0, 28, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.moveTo(-16, -8);
  ctx.lineTo(-5, -8);
  ctx.lineTo(-11, 2);
  ctx.closePath();
  ctx.moveTo(16, -8);
  ctx.lineTo(5, -8);
  ctx.lineTo(11, 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-12, 14, 24, 7);
  ctx.fillStyle = "#fffaf0";
  ctx.font = "bold 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Pumpkin", 0, 52);
  ctx.restore();
}

function drawCloud(x, y) {
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  ctx.ellipse(x, y, 54, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 36, y + 8, 62, 22, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHugeAirportPlane() {
  ctx.save();
  ctx.translate(450, 150);
  ctx.fillStyle = "rgba(244,247,250,0.96)";
  ctx.beginPath();
  ctx.roundRect(-430, -48, 860, 96, 48);
  ctx.fill();
  ctx.fillStyle = "#cbd7df";
  ctx.beginPath();
  ctx.moveTo(-60, -34);
  ctx.lineTo(170, -150);
  ctx.lineTo(240, -120);
  ctx.lineTo(80, -24);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-60, 34);
  ctx.lineTo(170, 150);
  ctx.lineTo(240, 120);
  ctx.lineTo(80, 24);
  ctx.fill();
  ctx.fillStyle = "#d93a32";
  ctx.beginPath();
  ctx.roundRect(-436, -34, 72, 68, 26);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.roundRect(-150, -34, 74, 68, 8);
  ctx.roundRect(76, -34, 74, 68, 8);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("入口门", -113, 8);
  ctx.fillText("出口门", 113, 8);
  ctx.textAlign = "left";
  ctx.fillStyle = "#245b8f";
  for (let x = -320; x <= 320; x += 54) {
    ctx.fillRect(x, -10, 24, 20);
  }
  ctx.restore();
}

function roadCenterAtY(y) {
  const depth = (canvas.height - y) / canvas.height;
  return 450 + Math.sin(distance / 260 + depth * 2.5) * 82 * (0.2 + depth);
}

function roadHalfWidthAtY(y) {
  return 130 + (y / canvas.height) * 150;
}

function drawRoad() {
  ctx.fillStyle = selectedTrack.road;
  ctx.beginPath();
  for (let y = 0; y <= canvas.height; y += 32) {
    const x = roadCenterAtY(y) - roadHalfWidthAtY(y);
    if (y === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let y = canvas.height; y >= 0; y -= 32) {
    ctx.lineTo(roadCenterAtY(y) + roadHalfWidthAtY(y), y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 6;
  ctx.setLineDash([36, 44]);
  ctx.lineDashOffset = roadOffset;
  ctx.beginPath();
  for (let y = 0; y <= canvas.height; y += 24) {
    const x = roadCenterAtY(y);
    if (y === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  cliffGaps.forEach((gap) => {
    if (gap.y > canvas.height || gap.y + gap.h < 0) return;
    ctx.fillStyle = "rgba(23, 18, 20, 0.92)";
    ctx.beginPath();
    ctx.moveTo(roadCenterAtY(gap.y) - roadHalfWidthAtY(gap.y), gap.y);
    ctx.lineTo(roadCenterAtY(gap.y) + roadHalfWidthAtY(gap.y), gap.y);
    ctx.lineTo(roadCenterAtY(gap.y + gap.h) + roadHalfWidthAtY(gap.y + gap.h), gap.y + gap.h);
    ctx.lineTo(roadCenterAtY(gap.y + gap.h) - roadHalfWidthAtY(gap.y + gap.h), gap.y + gap.h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffd15f";
    ctx.font = "bold 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("悬崖", roadCenterAtY(gap.y + gap.h / 2), gap.y + gap.h / 2 + 6);
    ctx.textAlign = "left";
  });
}

function drawItems() {
  rivalCars.forEach((rival) => {
    drawRivalCar(rival);
  });

  coins.forEach((coin) => {
    if (coin.got) return;
    ctx.fillStyle = "#ffd15f";
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const angle = -Math.PI / 2 + i * (Math.PI / 5);
      const radius = i % 2 === 0 ? 18 : 8;
      ctx.lineTo(coin.x + Math.cos(angle) * radius, coin.y + Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
  });
}

function drawRivalCar(rival) {
  ctx.fillStyle = "#1f2933";
  ctx.fillRect(rival.x - 30, rival.y - 28, 9, 20);
  ctx.fillRect(rival.x + 21, rival.y - 28, 9, 20);
  ctx.fillRect(rival.x - 30, rival.y + 18, 9, 20);
  ctx.fillRect(rival.x + 21, rival.y + 18, 9, 20);
  ctx.fillStyle = rival.color;
  ctx.beginPath();
  ctx.roundRect(rival.x - 26, rival.y - 38, 52, 78, 14);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(rival.label, rival.x, rival.y + 8);
  ctx.textAlign = "left";
}

function drawCar() {
  const x = player.x;
  const flightProgress = airborne > 0 ? (76 - airborne) / 76 : 0;
  const gapLift = airborne > 0 ? 24 + Math.sin(flightProgress * Math.PI) * 58 : 0;
  const jumpProgress = jumpFrames > 0 ? (34 - jumpFrames) / 34 : 0;
  const jumpLift = jumpFrames > 0 ? Math.sin(jumpProgress * Math.PI) * 72 : 0;
  const flyLift = flyBoost > 0 ? 36 + flyBoost * 0.75 : 0;
  const lift = Math.max(gapLift, jumpLift, flyLift);
  const y = player.y - lift;
  const playerAirborne = isPlayerAirborne();
  const wingOpen = selectedWing.id !== "none" && playerAirborne;
  if (playerAirborne) {
    ctx.fillStyle = "rgba(255,255,255,0.48)";
    ctx.beginPath();
    ctx.ellipse(x, player.y + 44, 54, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(player.tilt);

  if (wingOpen) {
    ctx.fillStyle = selectedWing.id === "plane" ? "#e7f1f5" : "#9fb0b9";
    ctx.beginPath();
    ctx.moveTo(-72, 8);
    ctx.lineTo(-25, -18);
    ctx.lineTo(-16, 8);
    ctx.lineTo(-66, 28);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(72, 8);
    ctx.lineTo(25, -18);
    ctx.lineTo(16, 8);
    ctx.lineTo(66, 28);
    ctx.fill();
  } else if (selectedWing.id !== "none") {
    ctx.fillStyle = "#9fb0b9";
    ctx.fillRect(-44, 22, 22, 8);
    ctx.fillRect(22, 22, 22, 8);
  }

  ctx.fillStyle = "#1f2933";
  const tireW = selectedTire.id === "big" ? 14 : 10;
  ctx.fillRect(-36, -4, tireW, 24);
  ctx.fillRect(24, -4, tireW, 24);
  ctx.fillRect(-36, 44, tireW, 24);
  ctx.fillRect(24, 44, tireW, 24);
  ctx.fillStyle = selectedCar.color;
  ctx.beginPath();
  ctx.roundRect(-30, -20, 60, 94, 18);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillRect(-18, 2, 36, 20);
  ctx.fillStyle = "rgba(23,38,50,0.28)";
  ctx.fillRect(-24, -33, 48, 7);
  drawDriver(0, -50);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 18px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(selectedIcon, 0, 48);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawDriver(x, y) {
  ctx.fillStyle = selectedDriver.color;
  if (selectedDriver.id === "star") {
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const angle = -Math.PI / 2 + i * (Math.PI / 5);
      const radius = i % 2 === 0 ? 16 : 7;
      ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
  } else if (selectedDriver.id === "ghost") {
    ctx.beginPath();
    ctx.arc(x, y, 14, Math.PI, 0);
    ctx.lineTo(x + 14, y + 18);
    ctx.lineTo(x + 4, y + 12);
    ctx.lineTo(x - 4, y + 18);
    ctx.lineTo(x - 14, y + 12);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.font = "bold 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(selectedDriver.hat, x, y + 4);
    ctx.textAlign = "left";
  }
}

function drawHud() {
  ctx.fillStyle = "rgba(255,250,240,0.88)";
  ctx.fillRect(18, 18, 220, 82);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 18px system-ui";
  ctx.fillText(`${selectedTrack.name} · ${"★".repeat(selectedStars)}`, 34, 48);
  ctx.fillText(`距离 ${Math.min(100, Math.floor((distance / raceGoalDistance()) * 100))}%`, 34, 78);
  if (airborne > 0) {
    ctx.fillStyle = "#d93a32";
    ctx.fillText("飞行中", 150, 78);
  } else if (jumpFrames > 0) {
    ctx.fillStyle = "#d93a32";
    ctx.fillText("跳跃中", 150, 78);
  } else if (flyBoost > 0) {
    ctx.fillStyle = "#d93a32";
    ctx.fillText("自己飞", 150, 78);
  }
}

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.add(key);
  if (event.key === " ") {
    jumpPlayer();
  }
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "f", "F"].includes(event.key)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.delete(key);
});
startBtn.addEventListener("click", startRace);
resetBtn.addEventListener("click", resetRace);
againBtn.addEventListener("click", startRace);

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, w, h, r) {
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };
}

drawMenu();
buildItems();
update();
