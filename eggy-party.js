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

const vehicle = {
  x: 520,
  y: 420,
  vx: 0,
  vy: 0,
  angle: 0,
  mode: "free",
  progress: 0
};

const avatar = {
  x: 520,
  y: 470,
  vx: 0,
  mode: "walk",
  ferrisCabin: 0,
  treeLevel: 0
};

let screen = "lobby";
let activeCategory = "challenge";
let selectedLocation = { name: "派对大厅", category: "lobby", detail: "摩天轮、樱花树、喷泉广场" };
let laneIndex = 0;
let playing = false;
let won = false;
let startTime = 0;
let elapsed = 0;
let starCount = 0;
let laneStars = [];
let audioContext = null;

const lobbyEggies = [
  { x: 420, y: 486, color: "#f06aa3", speed: 0.65, phase: 0 },
  { x: 620, y: 488, color: "#32a7e2", speed: -0.55, phase: 1.8 },
  { x: 760, y: 492, color: "#8f5fd9", speed: 0.45, phase: 3.1 },
  { x: 900, y: 484, color: "#60c878", speed: -0.5, phase: 4.4 }
];

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

function resetVehicle() {
  vehicle.x = 520;
  vehicle.y = selectedLocation.category === "flight" ? 335 : 420;
  vehicle.vx = 0;
  vehicle.vy = 0;
  vehicle.angle = 0;
  vehicle.mode = "free";
  vehicle.progress = 0;
}

function resetAvatar() {
  avatar.x = 520;
  avatar.y = 470;
  avatar.vx = 0;
  avatar.mode = "walk";
  avatar.ferrisCabin = 0;
  avatar.treeLevel = 0;
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
  resetAvatar();
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
  screen = "activity";
  playing = false;
  locationPicker.hidden = true;
  elapsed = 0;
  resetVehicle();
  statusText.textContent = getActivityHelp(place.category);
}

function getActivityHelp(category) {
  if (category === "flight") return `${selectedLocation.name}：飞机来了！左/右控制前后，跳是上升，冲刺是加速。`;
  if (category === "water") return `${selectedLocation.name}：先到售票处，再走到滑梯楼梯，跳/互动可以上去滑下来。`;
  if (category === "metro") return `${selectedLocation.name}：地铁一直开着，靠近车门按互动就能进车厢。`;
  if (category === "fish") return `${selectedLocation.name}：摸鱼码头有小船、鱼池和鱼，左右一直划，不会突然卡住。`;
  return `${selectedLocation.name}：选择好了。`;
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

function nearAvatar(x, distance = 78) {
  return Math.abs(avatar.x - x) < distance;
}

function updateLobby() {
  const left = isDown("left") || keys.has("arrowleft") || keys.has("a");
  const right = isDown("right") || keys.has("arrowright") || keys.has("d");
  const up = isDown("jump") || keys.has("arrowup") || keys.has("w") || keys.has(" ");
  const boost = isDown("roll") || keys.has("arrowdown") || keys.has("s");

  if (avatar.mode === "ferris") {
    const angle = performance.now() * 0.00045 + avatar.ferrisCabin;
    avatar.x = 230 + Math.cos(angle) * 165;
    avatar.y = 300 + Math.sin(angle) * 165;
    if (boost || (up && avatar.y > 430)) {
      avatar.mode = "walk";
      avatar.x = 230;
      avatar.y = 470;
      statusText.textContent = "下摩天轮啦，可以继续去樱花树、喷泉或乐园。";
    }
    return;
  }

  if (avatar.mode === "tree") {
    if (up) avatar.treeLevel = Math.min(30, avatar.treeLevel + 0.18);
    if (boost) avatar.treeLevel = Math.max(0, avatar.treeLevel - 0.22);
    avatar.x = 850;
    avatar.y = 470 - avatar.treeLevel * 10.5;
    statusText.textContent = `正在爬三十多层楼高的樱花树：第 ${Math.round(avatar.treeLevel)} 层。按冲刺可以下来。`;
    if (avatar.treeLevel <= 0.1 && boost) {
      avatar.mode = "walk";
      avatar.y = 470;
      statusText.textContent = "从樱花树下来啦。";
    }
    return;
  }

  if (left) avatar.vx -= boost ? 0.72 : 0.45;
  if (right) avatar.vx += boost ? 0.72 : 0.45;
  avatar.vx *= 0.84;
  avatar.x += avatar.vx;
  if (avatar.x < 35) avatar.x = W - 35;
  if (avatar.x > W - 35) avatar.x = 35;
  avatar.y = 470 + Math.sin(performance.now() * 0.009) * 3;

  if (up && nearAvatar(230, 95)) {
    avatar.mode = "ferris";
    avatar.ferrisCabin = Math.PI / 2;
    statusText.textContent = "坐上大摩天轮了！按冲刺，或者转到底部按跳，可以下来。";
  } else if (up && nearAvatar(850, 82)) {
    avatar.mode = "tree";
    avatar.treeLevel = Math.max(1, avatar.treeLevel);
    statusText.textContent = "开始爬超高樱花树，按跳继续往上，按冲刺往下。";
  }
}

function lobbyInteract() {
  getAudio();
  if (screen !== "lobby") return false;
  if (avatar.mode !== "walk") {
    controls.add("roll");
    setTimeout(() => controls.delete("roll"), 120);
    return true;
  }
  if (nearAvatar(230, 110)) {
    avatar.mode = "ferris";
    avatar.ferrisCabin = Math.PI / 2;
    statusText.textContent = "坐上大摩天轮了！";
    return true;
  }
  if (nearAvatar(850, 95)) {
    avatar.mode = "tree";
    avatar.treeLevel = Math.max(1, avatar.treeLevel);
    statusText.textContent = "开始爬三十多层楼高的樱花树。";
    return true;
  }
  statusText.textContent = "走近摩天轮或樱花树，再点开始/互动。";
  return true;
}

function updateActivity() {
  const left = isDown("left") || keys.has("arrowleft") || keys.has("a");
  const right = isDown("right") || keys.has("arrowright") || keys.has("d");
  const up = isDown("jump") || keys.has("arrowup") || keys.has("w") || keys.has(" ");
  const boost = isDown("roll") || keys.has("arrowdown") || keys.has("s");
  const speed = boost ? 0.42 : 0.24;

  if (selectedLocation.category === "flight") {
    if (left) vehicle.vx -= speed;
    if (right) vehicle.vx += speed;
    if (up) vehicle.vy -= 0.26;
    vehicle.vy += 0.05;
    vehicle.angle = Math.max(-0.18, Math.min(0.18, vehicle.vx * 0.035 - vehicle.vy * 0.025));
    vehicle.y = Math.max(165, Math.min(430, vehicle.y + vehicle.vy));
  } else if (selectedLocation.category === "water") {
    if (vehicle.mode === "slide") {
      vehicle.progress += 0.015;
      vehicle.x = 235 + vehicle.progress * 440;
      vehicle.y = 142 + Math.sin(vehicle.progress * Math.PI) * 92 + vehicle.progress * 230;
      vehicle.angle = 0.1;
      if (vehicle.progress >= 1) {
        vehicle.mode = "free";
        vehicle.y = 420;
        statusText.textContent = "滑下来了，扑通进水！还可以再去售票处和滑梯。";
      }
    } else {
      if (left) vehicle.vx -= speed;
      if (right) vehicle.vx += speed;
      vehicle.angle = Math.sin(performance.now() * 0.004) * 0.05;
      vehicle.y += (420 - vehicle.y) * 0.08;
    }
  } else if (selectedLocation.category === "metro") {
    if (left) vehicle.vx -= 0.2;
    if (right) vehicle.vx += 0.28;
    vehicle.vx += vehicle.mode === "in-metro" ? 0.08 : 0.035;
    vehicle.angle = 0;
    vehicle.y += (452 - vehicle.y) * 0.06;
  } else {
    if (left) vehicle.vx -= speed;
    if (right) vehicle.vx += speed;
    vehicle.angle = Math.sin(performance.now() * 0.004) * 0.025;
    vehicle.y += (420 - vehicle.y) * 0.06;
  }
  vehicle.vx *= 0.92;
  vehicle.vy *= 0.9;
  vehicle.x += vehicle.vx;
  if (vehicle.x < -160) vehicle.x = W + 160;
  if (vehicle.x > W + 160) vehicle.x = -160;
}

function activityInteract() {
  getAudio();
  if (screen !== "activity") return false;
  if (selectedLocation.category === "water") {
    if (vehicle.mode === "slide") return true;
    if (vehicle.x < 260) {
      statusText.textContent = "买到水上乐园门票啦，去右边楼梯上滑梯。";
      tone(784, 0, 0.12, 0.025, "triangle");
      return true;
    }
    if (vehicle.x > 300 && vehicle.x < 500) {
      vehicle.mode = "slide";
      vehicle.progress = 0;
      statusText.textContent = "爬上滑梯了，准备滑水！";
      return true;
    }
    statusText.textContent = "游到左边售票处买票，或者到中间楼梯上滑梯。";
    return true;
  }
  if (selectedLocation.category === "metro") {
    vehicle.mode = "in-metro";
    statusText.textContent = "进地铁车厢了！列车会一直开，左右可以控制快慢。";
    portalSound();
    return true;
  }
  if (selectedLocation.category === "fish") {
    statusText.textContent = "摸到一条鱼！小船还能继续往前划。";
    tone(988, 0, 0.14, 0.024, "sine");
    return true;
  }
  return false;
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
  updateLobby();
  drawSky();
  ctx.fillStyle = "#6cc07a";
  ctx.fillRect(0, 410, W, 210);
  ctx.fillStyle = "#caa57a";
  ctx.beginPath();
  ctx.ellipse(520, 520, 430, 80, 0, 0, Math.PI * 2);
  ctx.fill();

  drawFerrisWheel(230, 300, 165);
  drawMall(740, 240);
  drawSakuraTree(850, 420);
  drawFountain(520, 398);
  drawOtherEggies();
  drawLobbyEgg(avatar.x, avatar.y);
  drawLocationPreview();

  ctx.fillStyle = "#172632";
  ctx.font = "900 34px system-ui";
  ctx.fillText("蛋仔派对大厅", 36, 64);
  ctx.font = "800 19px system-ui";
  ctx.fillText("左右走，跳/开始互动：坐摩天轮、爬樱花树、看喷泉。", 38, 96);
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
  ctx.fillRect(x - 85, y + r + 16, 170, 14);
  ctx.fillStyle = "#172632";
  ctx.font = "900 20px system-ui";
  ctx.fillText("大摩天轮", x - 46, y + r + 52);
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

function drawSakuraTree(x, baseY) {
  ctx.fillStyle = "#7c4a26";
  ctx.beginPath();
  roundedRect(x - 24, 118, 48, baseY - 96, 18);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  for (let floor = 0; floor <= 30; floor += 5) {
    const y = baseY - floor * 10.5;
    ctx.fillRect(x - 44, y, 88, 4);
  }
  ctx.strokeStyle = "#7c4a26";
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(x, 270);
  ctx.quadraticCurveTo(x - 110, 218, x - 145, 155);
  ctx.moveTo(x, 260);
  ctx.quadraticCurveTo(x + 115, 205, x + 150, 130);
  ctx.stroke();
  ctx.fillStyle = "#ffb7d2";
  for (let i = 0; i < 24; i += 1) {
    const angle = i * 1.73;
    const radius = 35 + (i % 6) * 18;
    const bx = x + Math.cos(angle) * radius;
    const by = 150 + Math.sin(angle * 0.8) * 48 + (i % 4) * 19;
    ctx.beginPath();
    ctx.arc(bx, by, 42 + (i % 3) * 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#172632";
  ctx.font = "900 20px system-ui";
  ctx.fillText("30 层樱花树", x - 62, 110);
}

function drawFountain(x, y) {
  const wave = Math.sin(performance.now() * 0.006) * 18;
  ctx.fillStyle = "#32a7e2";
  ctx.beginPath();
  ctx.ellipse(x, y + 58, 95, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#32a7e2";
  ctx.lineWidth = 7;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x, y + 44);
    ctx.quadraticCurveTo(x + i * 30 + wave * 0.4, y - 48 - Math.abs(wave), x + i * 48, y + 36);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.beginPath();
  ctx.ellipse(x, y + 53, 64, 17, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawOtherEggies() {
  lobbyEggies.forEach((buddy, index) => {
    buddy.x += buddy.speed;
    if (buddy.x < 350) buddy.speed = Math.abs(buddy.speed);
    if (buddy.x > 980) buddy.speed = -Math.abs(buddy.speed);
    drawEggyCharacter(buddy.x, buddy.y + Math.sin(performance.now() * 0.005 + buddy.phase) * 4, 0.62, buddy.speed * 0.04, buddy.color);
    ctx.fillStyle = "#172632";
    ctx.font = "800 12px system-ui";
    ctx.fillText(`蛋仔${index + 2}`, buddy.x - 18, buddy.y + 45);
  });
}

function drawEggyCharacter(x, y, s = 1, tilt = 0, bodyColor = "#f5c336") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5 * s;

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 35 * s, 36 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffd7b3";
  ctx.beginPath();
  ctx.ellipse(0, 2 * s, 22 * s, 20 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4 * s;
  ctx.beginPath();
  ctx.moveTo(-18 * s, 4 * s);
  ctx.lineTo(-38 * s, 15 * s);
  ctx.moveTo(18 * s, 4 * s);
  ctx.lineTo(38 * s, 15 * s);
  ctx.stroke();

  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(-8 * s, -4 * s, 3 * s, 0, Math.PI * 2);
  ctx.arc(8 * s, -4 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(-9 * s, 10 * s);
  ctx.lineTo(9 * s, 10 * s);
  ctx.stroke();

  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4 * s;
  ctx.beginPath();
  ctx.moveTo(0, -35 * s);
  ctx.lineTo(0, -52 * s);
  ctx.stroke();
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, -60 * s, 9 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.ellipse(-14 * s, 36 * s, 10 * s, 5 * s, -0.08, 0, Math.PI * 2);
  ctx.ellipse(14 * s, 36 * s, 10 * s, 5 * s, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLobbyEgg(x, y) {
  drawEggyCharacter(x, y + Math.sin(performance.now() * 0.004) * 5, 1, 0);
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

function drawActivity() {
  updateActivity();
  if (selectedLocation.category === "flight") drawFlightScene();
  if (selectedLocation.category === "water") drawWaterScene();
  if (selectedLocation.category === "metro") drawMetroScene();
  if (selectedLocation.category === "fish") drawFishScene();
  drawActivityTitle();
}

function drawActivityTitle() {
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.beginPath();
  roundedRect(26, 24, 430, 76, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 28px system-ui";
  ctx.fillText(selectedLocation.name, 46, 58);
  ctx.font = "800 16px system-ui";
  ctx.fillText(selectedLocation.detail, 48, 84);
}

function drawFlightScene() {
  drawSky();
  ctx.fillStyle = "#424b57";
  ctx.fillRect(0, 500, W, 70);
  ctx.fillStyle = "#fff";
  for (let x = 20; x < W; x += 95) ctx.fillRect(x, 532, 50, 8);
  ctx.fillStyle = "#89d06a";
  ctx.fillRect(0, 570, W, 50);
  drawAirportTerminal(720, 330);
  drawAirplane(vehicle.x, vehicle.y, vehicle.angle);
}

function drawAirportTerminal(x, y) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  roundedRect(x, y, 230, 130, 8);
  ctx.fill();
  ctx.fillStyle = "#32a7e2";
  ctx.fillRect(x + 18, y + 32, 50, 38);
  ctx.fillRect(x + 85, y + 32, 50, 38);
  ctx.fillRect(x + 152, y + 32, 50, 38);
  ctx.fillStyle = "#172632";
  ctx.font = "900 20px system-ui";
  ctx.fillText("机场", x + 88, y + 108);
}

function drawAirplane(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 116, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#32a7e2";
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-95, 76);
  ctx.lineTo(60, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-18, -4);
  ctx.lineTo(-85, -58);
  ctx.lineTo(52, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f06aa3";
  ctx.beginPath();
  ctx.moveTo(-96, -10);
  ctx.lineTo(-138, -50);
  ctx.lineTo(-120, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(92, -4, 9, 0, Math.PI * 2);
  ctx.fill();
  drawEggyCharacter(16, -42, 0.45, 0);
  ctx.restore();
}

function drawWaterScene() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#b9f1ff");
  g.addColorStop(1, "#e9fbff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#25a9df";
  ctx.fillRect(0, 335, W, 285);
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 5;
  for (let y = 365; y < 600; y += 40) {
    ctx.beginPath();
    for (let x = 0; x < W; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.03 + performance.now() * 0.006) * 7);
    ctx.stroke();
  }
  drawTicketBooth(70, 205);
  drawWaterSlide(145, 115);
  drawSlideStairs(315, 225);
  drawPoolFloat(vehicle.x, vehicle.y + 35);
  drawEggyCharacter(vehicle.x, vehicle.y - 5, 0.85, vehicle.angle);
}

function drawTicketBooth(x, y) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  roundedRect(x, y, 150, 100, 8);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#ffd15f";
  ctx.fillRect(x, y, 150, 26);
  ctx.fillStyle = "#172632";
  ctx.font = "900 17px system-ui";
  ctx.fillText("售票处", x + 45, y + 20);
  ctx.fillStyle = "#32a7e2";
  ctx.fillRect(x + 22, y + 44, 42, 34);
  ctx.fillRect(x + 86, y + 44, 42, 34);
}

function drawSlideStairs(x, y) {
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + i * 18, y + i * 19);
    ctx.lineTo(x + 78 + i * 18, y + i * 19);
    ctx.stroke();
  }
  ctx.strokeStyle = "#8f5fd9";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 138, y + 132);
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 18px system-ui";
  ctx.fillText("楼梯上滑梯", x - 10, y - 12);
}

function drawWaterSlide(x, y) {
  ctx.strokeStyle = "#f06aa3";
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + 190, y + 10, x + 165, y + 170, x + 360, y + 210);
  ctx.stroke();
  ctx.strokeStyle = "#ffd15f";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 24px system-ui";
  ctx.fillText("水上滑梯", x + 58, y - 20);
}

function drawPoolFloat(x, y) {
  ctx.strokeStyle = "#ffd15f";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.ellipse(x, y, 58, 22, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawMetroScene() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#dce5eb");
  g.addColorStop(1, "#9aa9b3");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#172632";
  ctx.fillRect(0, 442, W, 18);
  ctx.fillRect(0, 495, W, 18);
  ctx.fillStyle = "#f2f5f7";
  ctx.fillRect(0, 350, W, 92);
  for (let x = 80; x < W; x += 145) {
    ctx.fillStyle = "#32a7e2";
    ctx.fillRect(x, 372, 70, 50);
    ctx.fillStyle = "#172632";
    ctx.fillRect(x + 34, 372, 4, 50);
  }
  drawMetroTrain(vehicle.x, 452);
  if (vehicle.mode !== "in-metro") drawEggyCharacter(170, 315, 0.75, 0);
}

function drawMetroTrain(x, y) {
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  roundedRect(x - 210, y - 78, 420, 82, 18);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#32a7e2";
  for (let i = -160; i <= 110; i += 90) ctx.fillRect(x + i, y - 56, 60, 28);
  ctx.fillStyle = "#172632";
  ctx.fillRect(x - 20, y - 58, 46, 58);
  ctx.fillStyle = "#dce5eb";
  ctx.fillRect(x - 14, y - 52, 34, 46);
  if (vehicle.mode === "in-metro") drawEggyCharacter(x + 4, y - 35, 0.38, 0);
  ctx.fillStyle = "#172632";
  ctx.font = "900 18px system-ui";
  ctx.fillText("蛋仔地铁", x - 45, y - 15);
  ctx.font = "800 14px system-ui";
  ctx.fillText("车门", x - 10, y + 24);
}

function drawFishScene() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#b9f1ff");
  g.addColorStop(1, "#d8fff1");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#25a9df";
  ctx.fillRect(0, 330, W, 290);
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 5;
  for (let y = 370; y < 600; y += 42) {
    ctx.beginPath();
    for (let x = 0; x < W; x += 42) ctx.lineTo(x, y + Math.sin(x * 0.025 + performance.now() * 0.005) * 8);
    ctx.stroke();
  }
  ctx.fillStyle = "#36a852";
  ctx.fillRect(0, 285, W, 45);
  ctx.fillStyle = "#9a6429";
  ctx.fillRect(0, 450, W, 26);
  for (let x = 40; x < W; x += 110) ctx.fillRect(x, 430, 16, 75);
  drawBoat(vehicle.x, 405);
  for (let i = 0; i < 8; i += 1) drawFish(110 + i * 115, 535 + Math.sin(performance.now() * 0.004 + i) * 16, i);
}

function drawBoat(x, y) {
  ctx.fillStyle = "#9a6429";
  ctx.beginPath();
  ctx.moveTo(x - 92, y);
  ctx.lineTo(x + 92, y);
  ctx.lineTo(x + 55, y + 44);
  ctx.lineTo(x - 55, y + 44);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.stroke();
  drawEggyCharacter(x, y - 35, 0.78, 0);
}

function drawFish(x, y, index) {
  ctx.fillStyle = index % 2 ? "#ffd15f" : "#f06aa3";
  ctx.beginPath();
  ctx.ellipse(x, y, 24, 12, 0, 0, Math.PI * 2);
  ctx.moveTo(x - 22, y);
  ctx.lineTo(x - 42, y - 14);
  ctx.lineTo(x - 42, y + 14);
  ctx.closePath();
  ctx.fill();
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
  drawEggyCharacter(egg.x, egg.y, 0.8, egg.vx * 0.035);
}

function draw() {
  if (screen === "course") {
    updateCourse();
    drawCourse();
  } else if (screen === "activity") {
    drawActivity();
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

startBtn.addEventListener("click", () => {
  if (screen === "lobby" && lobbyInteract()) return;
  if (screen === "activity" && activityInteract()) return;
  if (selectedLocation.category && selectedLocation.category !== "lobby" && selectedLocation.category !== "challenge") {
    selectLocation(selectedLocation);
    return;
  }
  startCourse("五条路线 01");
});
restartBtn.addEventListener("click", () => {
  if (screen === "activity") {
    resetVehicle();
    statusText.textContent = getActivityHelp(selectedLocation.category);
    return;
  }
  startCourse(selectedLocation.category === "challenge" ? selectedLocation.name : "五条路线 01");
});
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
