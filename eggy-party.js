const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.querySelector("#statusText");
const starText = document.querySelector("#starText");
const timeText = document.querySelector("#timeText");
const levelText = document.querySelector("#levelText");
const startBtn = document.querySelector("#startBtn");
const restartBtn = document.querySelector("#restartBtn");
const parkBtn = document.querySelector("#parkBtn");
const lobbyBtn = document.querySelector("#lobbyBtn");
const locationPicker = document.querySelector("#locationPicker");
const categoryRow = document.querySelector("#categoryRow");
const locationList = document.querySelector("#locationList");
const closePickerBtn = document.querySelector("#closePickerBtn");

const W = canvas.width;
const H = canvas.height;
const keys = new Set();
const controls = new Set();

const categories = [
  { key: "flight", title: "开飞机地点", count: 50, prefix: "云端机场", detail: "大飞机、云朵跑道、空中门" },
  { key: "water", title: "水上乐园地点", count: 20, prefix: "水花乐园", detail: "滑水道、浪花桥、喷泉门" },
  { key: "metro", title: "开地铁地点", count: 10, prefix: "环线地铁", detail: "站台门、列车弯道、下一站" },
  { key: "fish", title: "摸鱼地点", count: 30, prefix: "摸鱼码头", detail: "鱼池、木桥、小船和桶" },
  { key: "challenge", title: "闯关游戏地点", count: 40, prefix: "五条路线", detail: "每关五条路，传送门往下一条" }
];

const locations = Object.fromEntries(categories.map((category) => [
  category.key,
  Array.from({ length: category.count }, (_, index) => ({
    name: `${category.prefix} ${String(index + 1).padStart(2, "0")}`,
    category: category.key,
    detail: category.detail
  }))
]));

const egg = {
  x: 100,
  y: 462,
  vx: 0,
  vy: 0,
  r: 25,
  grounded: false,
  face: 1
};

let screen = "lobby";
let activeCategory = "challenge";
let selectedLocation = { name: "派对大厅", category: "lobby", detail: "摩天轮、大树、喷泉广场" };
let laneIndex = 0;
let playing = false;
let won = false;
let startTime = 0;
let elapsed = 0;
let starCount = 0;
let laneStars = [];
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

function portalSound() {
  [660, 880, 1175].forEach((note, i) => tone(note, i * 0.08, 0.12, 0.025, "sine"));
}

function winSound() {
  [523, 659, 784, 1046, 1319].forEach((note, i) => tone(note, i * 0.13, 0.16, 0.026, "triangle"));
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

function makeLaneStars() {
  laneStars = [
    { x: 235, y: 392, got: false },
    { x: 465, y: 318, got: false },
    { x: 690, y: 404, got: false }
  ];
}

function getLanePlatforms() {
  const colors = ["#60c878", "#ffd15f", "#f06aa3", "#32a7e2", "#8f5fd9"];
  const lift = laneIndex * 9;
  return [
    { x: 0, y: 540, w: 210, h: 42, color: colors[laneIndex % colors.length] },
    { x: 245, y: 478 - lift, w: 160, h: 34, color: colors[(laneIndex + 1) % colors.length] },
    { x: 455, y: 405 + (laneIndex % 2) * 26, w: 176, h: 34, color: colors[(laneIndex + 2) % colors.length] },
    { x: 690, y: 486 - (laneIndex % 3) * 22, w: 148, h: 34, color: colors[(laneIndex + 3) % colors.length] },
    { x: 870, y: 540, w: 170, h: 42, color: colors[(laneIndex + 4) % colors.length] }
  ];
}

function getLanePads() {
  return [
    { x: 185 + laneIndex * 15, y: 515, w: 64, h: 16 },
    { x: 620, y: 458 - (laneIndex % 2) * 42, w: 72, h: 16 }
  ];
}

function getLaneHammers() {
  return [
    { x: 420, y: 380, r: 54 + laneIndex * 4, speed: 0.05 },
    { x: 790, y: 430, r: 58, speed: -0.052 }
  ];
}

function resetEgg() {
  egg.x = 100;
  egg.y = 462;
  egg.vx = 0;
  egg.vy = 0;
  egg.grounded = false;
  egg.face = 1;
}

function startCourse(locationName = selectedLocation.name) {
  getAudio();
  selectedLocation = { ...selectedLocation, name: locationName, category: "challenge" };
  screen = "course";
  laneIndex = 0;
  playing = true;
  won = false;
  elapsed = 0;
  starCount = 0;
  startTime = performance.now();
  resetEgg();
  makeLaneStars();
  levelText.textContent = locationName;
  starText.textContent = "0";
  timeText.textContent = "0.0";
  statusText.textContent = `开始 ${locationName}！第 1/5 条路线，跑到右边传送门。`;
  locationPicker.hidden = true;
}

function goLobby(message = "回到蛋仔派对大厅。点“乐园”选择新地点。") {
  screen = "lobby";
  playing = false;
  won = false;
  elapsed = 0;
  resetEgg();
  levelText.textContent = selectedLocation.name || "派对大厅";
  timeText.textContent = "0.0";
  statusText.textContent = message;
}

function nextLane() {
  portalSound();
  if (laneIndex >= 4) {
    won = true;
    playing = false;
    statusText.textContent = `通关！五条路线全部完成，拿到 ${starCount}/15 颗星，用时 ${elapsed.toFixed(1)} 秒。`;
    winSound();
    return;
  }
  laneIndex += 1;
  resetEgg();
  makeLaneStars();
  statusText.textContent = `传送成功！现在是第 ${laneIndex + 1}/5 条路线，继续往右跑。`;
}

function selectLocation(place) {
  selectedLocation = place;
  levelText.textContent = place.name;
  if (place.category === "challenge") {
    startCourse(place.name);
    return;
  }
  screen = "lobby";
  playing = false;
  locationPicker.hidden = true;
  statusText.textContent = `已选择 ${place.name}：${place.detail}。这里先在大厅预览，想闯关就选“闯关游戏地点”。`;
}

function renderCategories() {
  categoryRow.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = category.key === activeCategory ? "active" : "";
    button.textContent = `${category.title} ${category.count} 个`;
    button.addEventListener("click", () => {
      activeCategory = category.key;
      renderCategories();
      renderLocations();
    });
    categoryRow.append(button);
  });
}

function renderLocations() {
  locationList.innerHTML = "";
  locations[activeCategory].forEach((place) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = place.category === "challenge" ? "challenge-place" : "";
    button.textContent = `${place.name} · ${place.detail}`;
    button.addEventListener("click", () => selectLocation(place));
    locationList.append(button);
  });
}

function updateCourse() {
  if (!playing || won) return;
  elapsed = (performance.now() - startTime) / 1000;
  const left = isDown("left") || keys.has("arrowleft") || keys.has("a");
  const right = isDown("right") || keys.has("arrowright") || keys.has("d");
  const jump = isDown("jump") || keys.has("arrowup") || keys.has("w") || keys.has(" ");
  const roll = isDown("roll") || keys.has("arrowdown") || keys.has("s");
  const accel = roll ? 0.82 : 0.52;
  const maxSpeed = roll ? 8.5 : 5.4;

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

  getLanePlatforms().forEach((p) => {
    const prevBottom = egg.y - egg.vy + egg.r;
    const bottom = egg.y + egg.r;
    const withinX = egg.x + egg.r > p.x && egg.x - egg.r < p.x + p.w;
    if (withinX && prevBottom <= p.y && bottom >= p.y && egg.vy >= 0) {
      egg.y = p.y - egg.r;
      egg.vy = 0;
      egg.grounded = true;
    }
  });

  getLanePads().forEach((pad) => {
    const hit = egg.x + egg.r > pad.x && egg.x - egg.r < pad.x + pad.w && egg.y + egg.r > pad.y - 5 && egg.y + egg.r < pad.y + 20 && egg.vy >= 0;
    if (hit) {
      egg.vy = -18;
      egg.grounded = false;
      statusText.textContent = "弹跳垫把蛋仔弹到高处啦！";
      jumpSound();
    }
  });

  getLaneHammers().forEach((hammer) => {
    const angle = performance.now() * hammer.speed * 0.03;
    const hx = hammer.x + Math.cos(angle) * hammer.r;
    const hy = hammer.y + Math.sin(angle) * hammer.r;
    if (Math.hypot(egg.x - hx, egg.y - hy) < egg.r + 24) {
      egg.vx = (egg.x < hx ? -1 : 1) * 12;
      egg.vy = -9;
      statusText.textContent = "被旋转锤撞开了，稳住再跑！";
    }
  });

  laneStars.forEach((star) => {
    if (!star.got && Math.hypot(egg.x - star.x, egg.y - star.y) < 42) {
      star.got = true;
      starCount += 1;
      tone(988, 0, 0.12, 0.025, "sine");
      tone(1319, 0.1, 0.14, 0.02, "sine");
    }
  });

  if (egg.x < 25) egg.x = 25;
  if (egg.x > W - 25) egg.x = W - 25;

  if (egg.y > H + 90) {
    resetEgg();
    statusText.textContent = `掉下去了，回到第 ${laneIndex + 1}/5 条路线开头。`;
  }

  if (egg.x > 910 && egg.y > 455) nextLane();

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
  drawCloud(150, 98, 1.1);
  drawCloud(520, 142, 0.8);
  drawCloud(880, 84, 0.95);
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

function drawLobby() {
  drawSky();
  ctx.fillStyle = "#6cc07a";
  ctx.fillRect(0, 410, W, 210);
  ctx.fillStyle = "#caa57a";
  ctx.beginPath();
  ctx.ellipse(520, 520, 430, 80, 0, 0, Math.PI * 2);
  ctx.fill();

  drawFerrisWheel(170, 310, 105);
  drawMall(740, 240);
  drawTree(360, 348, 1.05);
  drawTree(930, 360, 1.2);
  drawFountain(520, 398);
  drawLobbyEgg(520, 470);
  drawLocationPreview();

  ctx.fillStyle = "#172632";
  ctx.font = "900 34px system-ui";
  ctx.fillText("蛋仔派对大厅", 36, 64);
  ctx.font = "800 19px system-ui";
  ctx.fillText("点右边“乐园”选择地点：飞机、水上乐园、地铁、摸鱼、闯关。", 38, 96);
}

function drawFerrisWheel(x, y, r) {
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i += 1) {
    const angle = performance.now() * 0.00025 + (Math.PI * 2 * i) / 8;
    const cx = x + Math.cos(angle) * r;
    const cy = y + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.fillStyle = i % 2 ? "#f06aa3" : "#ffd15f";
    ctx.beginPath();
    roundedRect(cx - 18, cy - 12, 36, 24, 7);
    ctx.fill();
  }
  ctx.fillStyle = "#172632";
  ctx.fillRect(x - 8, y, 16, 125);
  ctx.fillRect(x - 70, y + 123, 140, 14);
}

function drawMall(x, y) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  roundedRect(x, y, 205, 185, 8);
  ctx.fill();
  ctx.fillStyle = "#2f79c8";
  ctx.fillRect(x + 18, y + 42, 50, 48);
  ctx.fillRect(x + 78, y + 42, 50, 48);
  ctx.fillRect(x + 138, y + 42, 50, 48);
  ctx.fillStyle = "#f06aa3";
  ctx.fillRect(x + 76, y + 118, 54, 67);
  ctx.fillStyle = "#172632";
  ctx.font = "900 22px system-ui";
  ctx.fillText("商场", x + 74, y + 30);
}

function drawTree(x, y, s) {
  ctx.fillStyle = "#9a6429";
  ctx.fillRect(x - 14 * s, y, 28 * s, 84 * s);
  ctx.fillStyle = "#36a852";
  ctx.beginPath();
  ctx.arc(x, y - 34 * s, 48 * s, 0, Math.PI * 2);
  ctx.arc(x - 36 * s, y - 8 * s, 36 * s, 0, Math.PI * 2);
  ctx.arc(x + 36 * s, y - 4 * s, 36 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawFountain(x, y) {
  ctx.fillStyle = "#32a7e2";
  ctx.beginPath();
  ctx.ellipse(x, y + 58, 95, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#32a7e2";
  ctx.lineWidth = 7;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x, y + 44);
    ctx.quadraticCurveTo(x + i * 30, y - 40, x + i * 48, y + 36);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.beginPath();
  ctx.ellipse(x, y + 53, 64, 17, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawLobbyEgg(x, y) {
  ctx.save();
  ctx.translate(x, y + Math.sin(performance.now() * 0.004) * 5);
  ctx.fillStyle = "#fff8df";
  ctx.beginPath();
  ctx.ellipse(0, 0, 32, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#f06aa3";
  ctx.beginPath();
  ctx.arc(-12, -6, 5, 0, Math.PI * 2);
  ctx.arc(12, -6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 8, 11, 0, Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#32a7e2";
  ctx.beginPath();
  roundedRect(-25, 28, 50, 18, 9);
  ctx.fill();
  ctx.restore();
}

function drawLocationPreview() {
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.beginPath();
  roundedRect(36, 488, 330, 84, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 21px system-ui";
  ctx.fillText(selectedLocation.name, 56, 522);
  ctx.font = "800 16px system-ui";
  ctx.fillText(selectedLocation.detail || "点乐园选择地点", 56, 552);
}

function drawCourse() {
  drawSky();
  drawCourseBackdrop();
  getLanePlatforms().forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    roundedRect(p.x, p.y, p.w, p.h, 18);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(p.x + 12, p.y + 8, p.w - 24, 6);
  });
  getLanePads().forEach(drawPad);
  getLaneHammers().forEach((hammer, index) => drawHammer(hammer, index));
  laneStars.forEach((star) => {
    if (!star.got) drawStar(star.x, star.y, 18);
  });
  drawPortal();
  drawEggy();
  ctx.fillStyle = "#172632";
  ctx.font = "900 28px system-ui";
  ctx.fillText(`${selectedLocation.name} · 第 ${laneIndex + 1}/5 条路线`, 32, 58);
  ctx.font = "800 17px system-ui";
  ctx.fillText("跑到右边传送门，就会去下面一条新路线。", 34, 86);
}

function drawCourseBackdrop() {
  const y = 150 + laneIndex * 34;
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.fillRect(0, y, W, 26);
  ctx.fillRect(0, y + 86, W, 26);
  ctx.fillStyle = "#172632";
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 5; i += 1) {
    ctx.fillRect(70 + i * 190, y + i * 2, 110, 10);
  }
  ctx.globalAlpha = 1;
}

function drawPad(pad) {
  ctx.fillStyle = "#8f5fd9";
  ctx.beginPath();
  roundedRect(pad.x, pad.y, pad.w, pad.h, 8);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "900 14px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("弹", pad.x + pad.w / 2, pad.y + 13);
  ctx.textAlign = "left";
}

function drawHammer(hammer, index) {
  const angle = performance.now() * hammer.speed * 0.03;
  const hx = hammer.x + Math.cos(angle) * hammer.r;
  const hy = hammer.y + Math.sin(angle) * hammer.r;
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(hammer.x, hammer.y);
  ctx.lineTo(hx, hy);
  ctx.stroke();
  ctx.fillStyle = index % 2 ? "#f06aa3" : "#ffd15f";
  ctx.beginPath();
  ctx.arc(hx, hy, 24, 0, Math.PI * 2);
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

function drawPortal() {
  const pulse = Math.sin(performance.now() * 0.006) * 8;
  ctx.strokeStyle = "#8f5fd9";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.ellipse(930, 493, 42 + pulse, 62, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#32a7e2";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(930, 493, 25, 44 + pulse * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 18px system-ui";
  ctx.fillText("传送门", 895, 408);
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
  if (screen === "course") {
    updateCourse();
    drawCourse();
  } else {
    drawLobby();
  }
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

startBtn.addEventListener("click", () => startCourse("五条路线 01"));
restartBtn.addEventListener("click", () => startCourse(selectedLocation.category === "challenge" ? selectedLocation.name : "五条路线 01"));
parkBtn.addEventListener("click", () => {
  locationPicker.hidden = !locationPicker.hidden;
});
lobbyBtn.addEventListener("click", () => goLobby());
closePickerBtn.addEventListener("click", () => {
  locationPicker.hidden = true;
});

renderCategories();
renderLocations();
draw();
