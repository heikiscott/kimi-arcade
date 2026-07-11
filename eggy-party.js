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
const boardFlightBtn = document.querySelector("#boardFlightBtn");
const takeoffBtn = document.querySelector("#takeoffBtn");
const landingBtn = document.querySelector("#landingBtn");
const smoothFlightBtn = document.querySelector("#smoothFlightBtn");
const exitFlightBtn = document.querySelector("#exitFlightBtn");
const jumpFlightBtn = document.querySelector("#jumpFlightBtn");
const ballModeBtn = document.querySelector("#ballModeBtn");
const flightStick = document.querySelector("#flightStick");
const flightKnob = document.querySelector("#flightKnob");
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
  heading: 0,
  mode: "free",
  progress: 0,
  pilotX: 360,
  pilotY: 750,
  pilotVx: 0,
  pilotVy: 0,
  pilotBall: false,
  fallStart: 0,
  fallDuration: 38000,
  floatDuration: 9000,
  fallExploded: false,
  selectedPlaneIndex: 0
};

const avatar = {
  x: 520,
  y: 470,
  vx: 0,
  mode: "walk",
  ferrisCabin: 0,
  treeLevel: 0
};

const DAY_LENGTH = 60000;
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
let joystickX = 0;
let joystickY = 0;
let joystickPointerId = null;

const lobbyEggies = [
  { x: 420, y: 486, color: "#f06aa3", speed: 0.65, phase: 0 },
  { x: 620, y: 488, color: "#32a7e2", speed: -0.55, phase: 1.8 },
  { x: 760, y: 492, color: "#8f5fd9", speed: 0.45, phase: 3.1 },
  { x: 900, y: 484, color: "#60c878", speed: -0.5, phase: 4.4 }
];

const zombies = [
  { x: 70, y: 490, speed: 0.55, phase: 0 },
  { x: 970, y: 492, speed: 0.48, phase: 1.8 },
  { x: 780, y: 432, speed: 0.44, phase: 3.2 }
];
let lastZombieCatch = 0;

const flightWorld = {
  w: 3365,
  h: 3365,
  finishX: 3050,
  finishY: 1660
};

const airportPlanes = [
  { x: 390, y: 1040, label: "日本航空", color: "#d8343f", scale: 0.86 },
  { x: 560, y: 1040, label: "中国航空", color: "#2f79c8", scale: 0.86 },
  { x: 730, y: 1040, label: "美国航空", color: "#42536b", scale: 0.86 },
  { x: 900, y: 1040, label: "东方航空", color: "#d83258", scale: 0.88 },
  { x: 1070, y: 1040, label: "南方航空", color: "#1f8c65", scale: 0.86 },
  { x: 1240, y: 1040, label: "亚洲航空", color: "#d51f2a", scale: 0.86 },
  { x: 1410, y: 1040, label: "泰国航空", color: "#7b4ab8", scale: 0.86 },
  { x: 1580, y: 1040, label: "大韩航空", color: "#4aa3df", scale: 0.86 },
  { x: 1750, y: 1040, label: "印度航空", color: "#c22d2d", scale: 0.86 },
  { x: 1920, y: 1040, label: "山东航空", color: "#f28b2f", scale: 0.84 },
  { x: 2090, y: 1040, label: "澳门航空", color: "#2270b8", scale: 0.84 },
  { x: 2260, y: 1040, label: "三亚航空", color: "#32a852", scale: 0.84 },
  { x: 2430, y: 1040, label: "私人飞机", color: "#8f5fd9", scale: 0.78 },
  { x: 2600, y: 1040, label: "军事飞机", color: "#4f6b48", scale: 0.9 },
  { x: 2770, y: 1040, label: "普通飞机", color: "#64717b", scale: 0.84 }
];

const flightClouds = [
  { x: 120, y: 90, s: 0.9, speed: 0.45 },
  { x: 520, y: 54, s: 0.65, speed: 0.33 },
  { x: 900, y: 126, s: 0.8, speed: 0.38 }
];

const breakableBuildings = [
  { id: "terminal-a", type: "terminal", label: "一号航站楼", x: 360, y: 520, w: 230, h: 130, broken: false },
  { id: "terminal-b", type: "terminal", label: "二号航站楼", x: 820, y: 500, w: 230, h: 130, broken: false },
  { id: "terminal-c", type: "terminal", label: "三号航站楼", x: 2060, y: 480, w: 230, h: 130, broken: false },
  { id: "terminal-d", type: "terminal", label: "四号航站楼", x: 2620, y: 470, w: 230, h: 130, broken: false },
  { id: "office", type: "office", label: "航司办公楼", x: 300, y: 1740, w: 220, h: 310, broken: false },
  { id: "hotel", type: "office", label: "酒店大楼", x: 2860, y: 1760, w: 220, h: 310, broken: false },
  { id: "repair", type: "office", label: "维修大楼", x: 1430, y: 2920, w: 220, h: 310, broken: false },
  { id: "military-hangar", type: "hangar", label: "军事机库", x: 470, y: 2480, w: 420, h: 250, broken: false },
  { id: "private-hangar", type: "hangar", label: "私人飞机库", x: 1980, y: 2480, w: 420, h: 250, broken: false }
];

const laneThemes = [
  { name: "彩虹平台", sky: "#9edcff", accent: "#ffd15f" },
  { name: "水花跳台", sky: "#b9f1ff", accent: "#32a7e2" },
  { name: "机场传送", sky: "#d9f5ff", accent: "#424b57" },
  { name: "地铁弯道", sky: "#dce5eb", accent: "#f06aa3" },
  { name: "夜晚躲避", sky: "#22364f", accent: "#8f5fd9" }
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
  if (laneIndex === 1) {
    return [
      { x: 0, y: 520, w: 180, h: 36, color: "#32a7e2" },
      { x: 240, y: 458, w: 118, h: 30, color: "#ffd15f" },
      { x: 420, y: 500, w: 128, h: 30, color: "#32a7e2" },
      { x: 610, y: 430, w: 134, h: 30, color: "#ffd15f" },
      { x: 850, y: 540, w: 190, h: 42, color: "#32a7e2" }
    ];
  }
  if (laneIndex === 2) {
    return [
      { x: 0, y: 540, w: 190, h: 42, color: "#424b57" },
      { x: 255, y: 505, w: 210, h: 26, color: "#424b57" },
      { x: 545, y: 468, w: 110, h: 24, color: "#f06aa3" },
      { x: 720, y: 505, w: 120, h: 24, color: "#424b57" },
      { x: 890, y: 540, w: 150, h: 42, color: "#424b57" }
    ];
  }
  if (laneIndex === 3) {
    return [
      { x: 0, y: 540, w: 230, h: 42, color: "#ffd15f" },
      { x: 285, y: 470, w: 90, h: 90, color: "#f06aa3" },
      { x: 460, y: 392, w: 90, h: 32, color: "#ffd15f" },
      { x: 630, y: 470, w: 90, h: 90, color: "#f06aa3" },
      { x: 840, y: 540, w: 200, h: 42, color: "#ffd15f" }
    ];
  }
  if (laneIndex === 4) {
    return [
      { x: 0, y: 540, w: 160, h: 42, color: "#8f5fd9" },
      { x: 210, y: 480, w: 140, h: 32, color: "#172632" },
      { x: 405, y: 410, w: 135, h: 32, color: "#8f5fd9" },
      { x: 600, y: 482, w: 135, h: 32, color: "#172632" },
      { x: 850, y: 540, w: 190, h: 42, color: "#8f5fd9" }
    ];
  }
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
  vehicle.selectedPlaneIndex = 0;
  vehicle.x = selectedLocation.category === "flight" ? airportPlanes[0].x : 520;
  vehicle.y = selectedLocation.category === "flight" ? airportPlanes[0].y : 420;
  vehicle.vx = 0;
  vehicle.vy = 0;
  vehicle.angle = 0;
  vehicle.heading = 0;
  vehicle.mode = selectedLocation.category === "flight" ? "walking" : "free";
  vehicle.progress = 0;
  vehicle.pilotX = selectedLocation.category === "flight" ? airportPlanes[0].x - 76 : 360;
  vehicle.pilotY = selectedLocation.category === "flight" ? airportPlanes[0].y + 88 : 750;
  vehicle.pilotVx = 0;
  vehicle.pilotVy = 0;
  vehicle.pilotBall = false;
  vehicle.fallStart = 0;
  vehicle.fallExploded = false;
  joystickX = 0;
  joystickY = 0;
  breakableBuildings.forEach((building) => {
    building.broken = false;
  });
  updateJoystickVisual();
}

function resetAvatar() {
  avatar.x = 520;
  avatar.y = 470;
  avatar.vx = 0;
  avatar.mode = "walk";
  avatar.ferrisCabin = 0;
  avatar.treeLevel = 0;
}

function getNearestPlane() {
  let nearest = airportPlanes[0];
  let nearestIndex = 0;
  let nearestDistance = Infinity;
  airportPlanes.forEach((plane, index) => {
    const distance = Math.hypot(vehicle.pilotX - plane.x, vehicle.pilotY - (plane.y + 76));
    if (distance < nearestDistance) {
      nearest = plane;
      nearestIndex = index;
      nearestDistance = distance;
    }
  });
  return { plane: nearest, index: nearestIndex, distance: nearestDistance };
}

function boardNearestPlane() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode !== "walking") {
    statusText.textContent = "你已经在飞机里了，点“平稳飞行”开始飞。";
    return true;
  }
  const nearest = getNearestPlane();
  if (nearest.distance > 120) {
    statusText.textContent = "先走到任意一架飞机门口，再点“上飞机”。";
    return true;
  }
  vehicle.selectedPlaneIndex = nearest.index;
  vehicle.x = nearest.plane.x;
  vehicle.y = nearest.plane.y;
  vehicle.heading = -Math.PI / 2;
  vehicle.angle = vehicle.heading;
  vehicle.vx = 0;
  vehicle.vy = 0;
  vehicle.mode = "boarded";
  statusText.textContent = `上了${nearest.plane.label}！点“平稳飞行”，再拉圆形操纵杆。`;
  portalSound();
  return true;
}

function startSmoothFlight() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode === "walking") return boardNearestPlane();
  vehicle.mode = "flying";
  statusText.textContent = "飞机进入平稳飞行。操纵杆往下拉上升，往上推下降，左右拉转方向。";
  tone(440, 0, 0.12, 0.02, "triangle");
  tone(660, 0.11, 0.14, 0.02, "triangle");
  return true;
}

function takeoffPlane() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode === "walking") return boardNearestPlane();
  vehicle.mode = "flying";
  vehicle.vx += Math.cos(vehicle.heading) * 3.2;
  vehicle.vy -= 4.5;
  statusText.textContent = "起飞！飞机离开跑道，开始往天空上升。";
  portalSound();
  return true;
}

function landPlane() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode !== "flying" && vehicle.mode !== "boarded") {
    statusText.textContent = "现在不在飞机里，不能降落。";
    return true;
  }
  vehicle.mode = "boarded";
  vehicle.vx *= 0.25;
  vehicle.vy = Math.abs(vehicle.vy) * 0.15;
  const nearest = airportPlanes[vehicle.selectedPlaneIndex] || airportPlanes[0];
  vehicle.x += (nearest.x - vehicle.x) * 0.25;
  vehicle.y += (nearest.y - vehicle.y) * 0.25;
  statusText.textContent = "正在降落，飞机慢慢回到跑道附近。";
  return true;
}

function exitPlane() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode === "walking") {
    statusText.textContent = "你现在已经在飞机外面了。";
    return true;
  }
  vehicle.mode = "walking";
  vehicle.pilotX = vehicle.x - 70;
  vehicle.pilotY = vehicle.y + 92;
  vehicle.pilotVx = 0;
  vehicle.vx = 0;
  vehicle.vy = 0;
  joystickX = 0;
  joystickY = 0;
  updateJoystickVisual();
  statusText.textContent = "下飞机了！你又站在飞机旁边，可以走路，也可以再上飞机。";
  return true;
}

function toggleBallMode() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode !== "walking") {
    statusText.textContent = "要先下飞机，站在地上才能变成球滚。";
    return true;
  }
  vehicle.pilotBall = !vehicle.pilotBall;
  statusText.textContent = vehicle.pilotBall ? "变成球滚啦！滚起来会更快。" : "变回小人走路了。";
  return true;
}

function jumpFromPlane() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode !== "flying" && vehicle.mode !== "boarded") {
    statusText.textContent = "要先在飞机里，才能跳下飞机。";
    return true;
  }
  vehicle.mode = "falling";
  vehicle.fallStart = performance.now();
  vehicle.fallExploded = false;
  vehicle.pilotX = vehicle.x;
  vehicle.pilotY = vehicle.y;
  vehicle.pilotVy = 0;
  statusText.textContent = "跳下飞机了！先在空中飘一会儿，然后一分钟内会落下来。";
  return true;
}

function isOnAirportLand(x, y) {
  return Math.hypot(x - 1682, y - 1682) <= 1610;
}

function finishFalling() {
  if (isOnAirportLand(vehicle.pilotX, vehicle.pilotY)) {
    vehicle.mode = "walking";
    vehicle.pilotBall = true;
    vehicle.pilotVy = 0;
    statusText.textContent = "落在机场地盘里了，没有爆炸，变成球滚继续玩。";
    return;
  }
  vehicle.fallExploded = true;
  statusText.textContent = "落到机场外面了，爆炸，凉了。3 秒后回到第一架飞机旁边。";
  tone(90, 0, 0.25, 0.04, "sawtooth");
  tone(55, 0.22, 0.35, 0.035, "sawtooth");
  setTimeout(() => {
    if (selectedLocation.category === "flight" && vehicle.mode === "falling" && vehicle.fallExploded) resetVehicle();
  }, 3000);
}

function checkBuildingCrash() {
  if (selectedLocation.category !== "flight" || vehicle.mode !== "flying") return;
  breakableBuildings.forEach((building) => {
    if (building.broken) return;
    const hit = vehicle.x > building.x - 120 && vehicle.x < building.x + building.w + 120 && vehicle.y > building.y - 90 && vehicle.y < building.y + building.h + 90;
    if (!hit) return;
    building.broken = true;
    statusText.textContent = `撞到${building.label}了！楼房断掉了，飞机没有坏，还能继续飞。`;
    tone(110, 0, 0.22, 0.035, "sawtooth");
    tone(74, 0.18, 0.28, 0.03, "sawtooth");
  });
}

function updateJoystickVisual() {
  if (!flightKnob) return;
  flightKnob.style.transform = `translate(calc(-50% + ${joystickX * 38}px), calc(-50% + ${joystickY * 38}px))`;
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
  if (category === "flight") return `${selectedLocation.name}：你先站在飞机旁边走路，走到飞机门边点“上飞机”，再用圆形操纵杆平稳飞。`;
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

function getDayPhase() {
  return (performance.now() % DAY_LENGTH) / DAY_LENGTH;
}

function isNightTime() {
  const phase = getDayPhase();
  return phase >= 0.55 || phase <= 0.08;
}

function updateZombies() {
  if (!isNightTime()) return;
  zombies.forEach((zombie) => {
    const targetX = avatar.mode === "walk" ? avatar.x : zombie.x + Math.sin(performance.now() * 0.001 + zombie.phase) * 40;
    const targetY = avatar.mode === "walk" ? avatar.y : zombie.y;
    const dx = targetX - zombie.x;
    const dy = targetY - zombie.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    zombie.x += (dx / distance) * zombie.speed;
    zombie.y += (dy / distance) * zombie.speed;
    zombie.x = Math.max(28, Math.min(W - 28, zombie.x));
    zombie.y = Math.max(420, Math.min(535, zombie.y));
    if (avatar.mode === "walk" && distance < 42 && performance.now() - lastZombieCatch > 1600) {
      lastZombieCatch = performance.now();
      resetAvatar();
      statusText.textContent = "被僵尸抓到了！蛋仔被送回大厅中间，快躲到摩天轮或樱花树旁边。";
      tone(160, 0, 0.18, 0.035, "sawtooth");
      tone(120, 0.16, 0.22, 0.03, "sawtooth");
    }
  });
}

function updateLobby() {
  const left = isDown("left") || keys.has("arrowleft") || keys.has("a");
  const right = isDown("right") || keys.has("arrowright") || keys.has("d");
  const up = isDown("jump") || keys.has("arrowup") || keys.has("w") || keys.has(" ");
  const boost = isDown("roll") || keys.has("arrowdown") || keys.has("s");

  updateZombies();

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
  return false;
}

function updateActivity() {
  const left = isDown("left") || keys.has("arrowleft") || keys.has("a");
  const right = isDown("right") || keys.has("arrowright") || keys.has("d");
  const up = isDown("jump") || keys.has("arrowup") || keys.has("w") || keys.has(" ");
  const boost = isDown("roll") || keys.has("arrowdown") || keys.has("s");
  const speed = boost ? 0.42 : 0.24;

  if (selectedLocation.category === "flight") {
    if (vehicle.mode === "walking") {
      const walkPower = vehicle.pilotBall ? 1.45 : 0.68;
      if (left) vehicle.pilotVx -= boost ? walkPower * 1.6 : walkPower;
      if (right) vehicle.pilotVx += boost ? walkPower * 1.6 : walkPower;
      vehicle.pilotVx *= vehicle.pilotBall ? 0.9 : 0.82;
      vehicle.pilotX = Math.max(210, Math.min(flightWorld.w - 210, vehicle.pilotX + vehicle.pilotVx));
      const nearest = getNearestPlane();
      vehicle.pilotY = nearest.plane.y + 88 + Math.sin(performance.now() * 0.012) * 4;
      if (nearest.distance < 120) statusText.textContent = `你走到${nearest.plane.label}旁边了，点“上飞机”。`;
    } else if (vehicle.mode === "falling") {
      const fallElapsed = performance.now() - vehicle.fallStart;
      if (fallElapsed < vehicle.floatDuration) {
        vehicle.pilotVy += 0.015;
        vehicle.pilotX += Math.sin(fallElapsed * 0.002) * 0.7;
      } else {
        vehicle.pilotVy += 0.12;
      }
      vehicle.pilotY += vehicle.pilotVy;
      const remaining = Math.max(0, Math.ceil((vehicle.fallDuration - fallElapsed) / 1000));
      if (!vehicle.fallExploded) statusText.textContent = fallElapsed < vehicle.floatDuration ? `刚跳出来，还在空中飘，还剩 ${remaining} 秒落地。` : `开始往下掉了，还剩 ${remaining} 秒落地。`;
      if (fallElapsed >= vehicle.fallDuration && !vehicle.fallExploded) finishFalling();
    } else {
      if (left) joystickX = Math.max(-1, joystickX - 0.04);
      if (right) joystickX = Math.min(1, joystickX + 0.04);
      if (up) joystickY = Math.max(-1, joystickY - 0.04);
      if (boost) joystickY = Math.min(1, joystickY + 0.04);
      joystickX *= 0.985;
      joystickY *= 0.985;
      updateJoystickVisual();
      vehicle.heading += joystickX * 0.024;
      const thrust = vehicle.mode === "flying" ? 0.62 : 0.16;
      vehicle.vx += Math.cos(vehicle.heading) * thrust;
      vehicle.vy += Math.sin(vehicle.heading) * thrust - joystickY * 0.74;
      vehicle.angle += (vehicle.heading + joystickX * 0.14 - vehicle.angle) * 0.12;
      vehicle.y = Math.max(-520, Math.min(flightWorld.h + 520, vehicle.y + vehicle.vy));
    }
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
  vehicle.vx *= selectedLocation.category === "flight" ? 0.965 : 0.92;
  vehicle.vy *= selectedLocation.category === "flight" ? 0.965 : 0.9;
  if (selectedLocation.category !== "flight" || vehicle.mode !== "walking") vehicle.x += vehicle.vx;
  if (selectedLocation.category === "flight") {
    vehicle.x = Math.max(-520, Math.min(flightWorld.w + 520, vehicle.x));
    checkBuildingCrash();
    if (Math.abs(vehicle.x - flightWorld.finishX) < 120 && Math.abs(vehicle.y - flightWorld.finishY) < 180) {
      statusText.textContent = "到白色通关线旁边了，点“开始/互动”就能闯关成功。";
    }
  } else {
    if (vehicle.x < -160) vehicle.x = W + 160;
    if (vehicle.x > W + 160) vehicle.x = -160;
  }
}

function activityInteract() {
  getAudio();
  if (screen !== "activity") return false;
  if (selectedLocation.category === "flight") {
    if (vehicle.mode === "walking") return boardNearestPlane();
    if (vehicle.mode === "boarded") return startSmoothFlight();
    if (Math.abs(vehicle.x - flightWorld.finishX) < 150 && Math.abs(vehicle.y - flightWorld.finishY) < 210) {
      statusText.textContent = "机场闯关成功！穿过白色线，进入下一个机场地点。";
      winSound();
      return true;
    }
    statusText.textContent = "继续往右边远处飞，找到白色通关线。";
    return true;
  }
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
  const theme = screen === "course" ? laneThemes[laneIndex] : null;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, theme ? theme.sky : "#9edcff");
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
  if (isNightTime()) drawNightSky();
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
  if (isNightTime()) drawZombies();
  drawLobbyEgg(avatar.x, avatar.y);
  drawLocationPreview();
  if (isNightTime()) drawNightOverlay();

  ctx.fillStyle = "#172632";
  ctx.font = "900 34px system-ui";
  ctx.fillText("蛋仔派对大厅", 36, 64);
  ctx.font = "800 19px system-ui";
  ctx.fillText(isNightTime() ? "夜晚来了：僵尸会追你，快躲开！" : "左右走，跳/开始互动：坐摩天轮、爬樱花树、看喷泉。", 38, 96);
  drawDayClock();
}

function drawNightSky() {
  ctx.fillStyle = "rgba(9, 22, 38, 0.58)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff2b8";
  ctx.beginPath();
  ctx.arc(930, 78, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  for (let i = 0; i < 22; i += 1) {
    const x = (i * 83 + 37) % W;
    const y = 32 + ((i * 47) % 190);
    ctx.fillRect(x, y, 3, 3);
  }
}

function drawNightOverlay() {
  ctx.fillStyle = "rgba(6, 14, 28, 0.24)";
  ctx.fillRect(0, 0, W, H);
}

function drawDayClock() {
  const phase = getDayPhase();
  const hour = Math.floor(phase * 24);
  const minute = Math.floor((phase * 24 - hour) * 60);
  const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  roundedRect(W - 190, 28, 154, 58, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 18px system-ui";
  ctx.fillText(isNightTime() ? "夜晚" : "白天", W - 170, 53);
  ctx.font = "800 16px system-ui";
  ctx.fillText(`时间 ${label}`, W - 170, 75);
}

function drawZombies() {
  zombies.forEach((zombie) => {
    ctx.save();
    ctx.translate(zombie.x, zombie.y);
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 4;
    ctx.fillStyle = "#6bb36b";
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 31, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#172632";
    ctx.beginPath();
    ctx.arc(-8, -8, 3, 0, Math.PI * 2);
    ctx.arc(8, -8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.lineTo(10, 8);
    ctx.stroke();
    ctx.strokeStyle = "#6bb36b";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-20, 5);
    ctx.lineTo(-42, 18);
    ctx.moveTo(20, 5);
    ctx.lineTo(42, 18);
    ctx.stroke();
    ctx.fillStyle = "#172632";
    ctx.font = "800 13px system-ui";
    ctx.fillText("僵尸", -16, 48);
    ctx.restore();
  });
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
  const zoom = 0.245;
  const offsetX = (W / zoom - flightWorld.w) / 2;
  const offsetY = 245;
  drawSky();
  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(offsetX, offsetY);
  drawHugeAirport();
  airportPlanes.forEach((plane, index) => {
    if ((vehicle.mode === "boarded" || vehicle.mode === "flying") && index === vehicle.selectedPlaneIndex) return;
    drawParkedPlane(plane);
  });
  if (vehicle.mode === "walking" || vehicle.mode === "falling") drawWalkingPilot(vehicle.pilotX, vehicle.pilotY);
  if (vehicle.mode === "boarded" || vehicle.mode === "flying") drawAirplane(vehicle.x, vehicle.y, vehicle.angle);
  if (vehicle.mode === "falling") drawFallingOverlay();
  ctx.restore();
  drawFlightClouds();

  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.beginPath();
  roundedRect(W - 310, 24, 280, 94, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 18px system-ui";
  ctx.fillText("全机场视野 3365 公顷", W - 288, 56);
  ctx.font = "800 14px system-ui";
  ctx.fillText(vehicle.mode === "walking" ? "人在地上走，先上飞机" : `飞行坐标 ${Math.round(vehicle.x)} / ${Math.round(vehicle.y)}`, W - 288, 82);
  ctx.fillText("操纵杆：下拉上升，上推下降", W - 288, 104);
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

function drawHugeAirport() {
  ctx.fillStyle = "#89d06a";
  ctx.fillRect(0, 0, flightWorld.w, flightWorld.h);
  ctx.fillStyle = "#7abf63";
  ctx.beginPath();
  ctx.arc(1682, 1682, 1610, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#424b57";
  airportPlanes.forEach((plane) => drawPlaneRunway(plane));
  drawRunway(250, 1450, 2750, 150, "跑道 18L");
  drawRunway(420, 1970, 2600, 135, "跑道 27R");
  drawRunway(1260, 360, 135, 2450, "跑道 09");
  ctx.strokeStyle = "#2d3742";
  ctx.lineWidth = 44;
  ctx.beginPath();
  ctx.moveTo(420, 1180);
  ctx.lineTo(2950, 1180);
  ctx.lineTo(2950, 2500);
  ctx.lineTo(760, 2500);
  ctx.stroke();

  breakableBuildings.forEach((building) => drawBreakableBuilding(building));
  drawControlTower(1640, 650);
  drawWeatherTower(1830, 410);
  drawFinishLine();

  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 3;
  for (let x = 0; x <= flightWorld.w; x += 240) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, flightWorld.h);
    ctx.stroke();
  }
  for (let y = 0; y <= flightWorld.h; y += 240) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(flightWorld.w, y);
    ctx.stroke();
  }
}

function drawPlaneRunway(plane) {
  ctx.fillStyle = "#4d5966";
  ctx.fillRect(plane.x - 135, plane.y + 138, 270, 72);
  ctx.fillStyle = "#fff";
  for (let x = plane.x - 108; x < plane.x + 108; x += 54) ctx.fillRect(x, plane.y + 170, 30, 7);
}

function drawRunway(x, y, w, h, label) {
  ctx.fillStyle = "#424b57";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#fff";
  const horizontal = w > h;
  if (horizontal) {
    for (let sx = x + 60; sx < x + w - 60; sx += 170) ctx.fillRect(sx, y + h / 2 - 6, 90, 12);
    ctx.fillText(label, x + 24, y + 38);
  } else {
    for (let sy = y + 60; sy < y + h - 60; sy += 170) ctx.fillRect(x + w / 2 - 6, sy, 12, 90);
    ctx.fillText(label, x + 18, y + 38);
  }
}

function drawControlTower(x, y) {
  ctx.fillStyle = "#dce5eb";
  ctx.beginPath();
  roundedRect(x, y, 120, 260, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.fillRect(x - 28, y - 64, 176, 80);
  ctx.fillStyle = "#32a7e2";
  for (let i = 0; i < 4; i += 1) ctx.fillRect(x - 12 + i * 39, y - 44, 26, 28);
  ctx.fillStyle = "#172632";
  ctx.font = "900 22px system-ui";
  ctx.fillText("控制塔台", x - 2, y + 298);
}

function drawWeatherTower(x, y) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  roundedRect(x, y, 250, 145, 8);
  ctx.fill();
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.arc(x + 54, y + 52, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 20px system-ui";
  ctx.fillText("天气 / 跑道信息楼", x + 88, y + 46);
  ctx.font = "800 16px system-ui";
  ctx.fillText("晴  风小  跑道开放", x + 88, y + 78);
  ctx.fillText("不是救援站，是机场信息楼", x + 28, y + 114);
}

function drawHangar(x, y, label) {
  ctx.fillStyle = "#dce5eb";
  ctx.beginPath();
  roundedRect(x, y, 420, 250, 8);
  ctx.fill();
  ctx.fillStyle = "#64717b";
  ctx.fillRect(x + 45, y + 88, 330, 160);
  ctx.fillStyle = "#172632";
  ctx.font = "900 24px system-ui";
  ctx.fillText(label, x + 130, y + 54);
}

function drawOfficeTower(x, y, label) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  roundedRect(x, y, 220, 310, 8);
  ctx.fill();
  ctx.fillStyle = "#32a7e2";
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      ctx.fillRect(x + 30 + col * 58, y + 42 + row * 42, 34, 24);
    }
  }
  ctx.fillStyle = "#172632";
  ctx.font = "900 24px system-ui";
  ctx.fillText(label, x + 34, y + 286);
}

function drawBreakableBuilding(building) {
  if (building.type === "terminal") drawAirportTerminal(building.x, building.y);
  if (building.type === "office") drawOfficeTower(building.x, building.y, building.label);
  if (building.type === "hangar") drawHangar(building.x, building.y, building.label);
  if (!building.broken) return;
  ctx.save();
  ctx.translate(building.x, building.y);
  ctx.fillStyle = "rgba(23,38,50,0.55)";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(building.w * 0.42, building.h * 0.34);
  ctx.lineTo(building.w * 0.14, building.h);
  ctx.lineTo(0, building.h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(240,106,163,0.72)";
  ctx.beginPath();
  ctx.moveTo(building.w, 0);
  ctx.lineTo(building.w * 0.55, building.h * 0.42);
  ctx.lineTo(building.w * 0.92, building.h);
  ctx.lineTo(building.w, building.h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(building.w * 0.2, 12);
  ctx.lineTo(building.w * 0.48, building.h * 0.38);
  ctx.lineTo(building.w * 0.38, building.h * 0.7);
  ctx.lineTo(building.w * 0.68, building.h - 10);
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 30px system-ui";
  ctx.fillText("断了", building.w * 0.32, building.h * 0.56);
  ctx.restore();
}

function drawFinishLine() {
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(flightWorld.finishX, flightWorld.finishY - 150);
  ctx.lineTo(flightWorld.finishX, flightWorld.finishY + 150);
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 28px system-ui";
  ctx.fillText("白色通关线", flightWorld.finishX - 78, flightWorld.finishY - 182);
}

function drawParkedPlane(plane) {
  ctx.save();
  ctx.translate(plane.x, plane.y);
  ctx.scale(plane.scale, plane.scale);
  drawPlaneShape(0, 0, 0, plane.color, false);
  ctx.restore();
  ctx.fillStyle = "#172632";
  ctx.font = "900 34px system-ui";
  ctx.fillText(plane.label, plane.x - 70, plane.y + 96 * plane.scale + 58);
}

function drawWalkingPilot(x, y) {
  const step = Math.sin(performance.now() * 0.016) * 22;
  ctx.save();
  ctx.translate(x, y);
  if (vehicle.pilotBall && vehicle.mode === "walking") {
    ctx.rotate(performance.now() * 0.012);
    ctx.fillStyle = "#f5c336";
    ctx.beginPath();
    ctx.arc(0, -5, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.fillStyle = "#ffd7b3";
    ctx.beginPath();
    ctx.ellipse(0, -8, 34, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.beginPath();
    ctx.arc(-13, -15, 5, 0, Math.PI * 2);
    ctx.arc(13, -15, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (vehicle.mode === "falling") {
    const fallElapsed = performance.now() - vehicle.fallStart;
    const scale = Math.max(0.5, 1.15 - fallElapsed / vehicle.fallDuration * 0.55);
    if (vehicle.fallExploded) {
      drawExplosion(0, 0, 1.2);
      ctx.restore();
      return;
    }
    drawEggyCharacter(0, -18, scale, Math.sin(fallElapsed * 0.006) * 0.5);
    ctx.fillStyle = "#172632";
    ctx.font = "900 36px system-ui";
    ctx.fillText(`${Math.max(0, Math.ceil((vehicle.fallDuration - fallElapsed) / 1000))}`, -10, -96);
    ctx.restore();
    return;
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(-10, 26);
  ctx.lineTo(-18 - step * 0.25, 58);
  ctx.moveTo(10, 26);
  ctx.lineTo(18 + step * 0.25, 58);
  ctx.stroke();
  drawEggyCharacter(0, -18, 1.05, vehicle.pilotVx * 0.02);
  ctx.fillStyle = "#172632";
  ctx.font = "900 34px system-ui";
  ctx.fillText("我", -18, 100);
  ctx.restore();
}

function drawFallingOverlay() {
  if (!vehicle.fallExploded) return;
  drawExplosion(vehicle.pilotX, vehicle.pilotY, 2.4);
}

function drawExplosion(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#ff8b2f";
  ctx.beginPath();
  for (let i = 0; i < 18; i += 1) {
    const angle = (Math.PI * 2 * i) / 18;
    const radius = (i % 2 ? 46 : 88) * s;
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.arc(0, 0, 34 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = `${Math.round(28 * s)}px system-ui`;
  ctx.fillText("凉", -15 * s, 10 * s);
  ctx.restore();
}

function drawFlightClouds() {
  while (flightClouds.length < 12) {
    flightClouds.push({ x: -120 - Math.random() * 400, y: 30 + Math.random() * 170, s: 0.45 + Math.random() * 0.7, speed: 0.22 + Math.random() * 0.45 });
  }
  flightClouds.forEach((cloud) => {
    cloud.x += cloud.speed;
    if (cloud.x > W + 160) {
      cloud.x = -180;
      cloud.y = 28 + Math.random() * 190;
      cloud.s = 0.45 + Math.random() * 0.75;
    }
    drawCloud(cloud.x, cloud.y, cloud.s);
  });
}

function drawAirplane(x, y, angle) {
  drawPlaneShape(x, y, angle, "#32a7e2", true);
}

function drawPlaneShape(x, y, angle, color, showPilot) {
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
  ctx.fillStyle = color;
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
  if (showPilot) drawEggyCharacter(16, -42, 0.45, 0);
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
  ctx.fillText(`${selectedLocation.name} · 第 ${laneIndex + 1}/5 条路线 · ${laneThemes[laneIndex].name}`, 32, 58);
  ctx.font = "800 17px system-ui";
  ctx.fillText("跑到右边传送门，就会去下面一条新路线。", 34, 86);
}

function drawCourseBackdrop() {
  const y = 150 + laneIndex * 34;
  const theme = laneThemes[laneIndex];
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.fillRect(0, y, W, 26);
  ctx.fillRect(0, y + 86, W, 26);
  ctx.fillStyle = theme.accent;
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 5; i += 1) {
    ctx.fillRect(70 + i * 190, y + i * 2, 110, 10);
  }
  ctx.globalAlpha = 1;
  if (laneIndex === 1) {
    ctx.fillStyle = "#25a9df";
    ctx.fillRect(0, 520, W, 100);
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    for (let wave = 0; wave < 3; wave += 1) {
      ctx.beginPath();
      for (let x = 0; x < W; x += 35) ctx.lineTo(x, 545 + wave * 26 + Math.sin(x * 0.04 + performance.now() * 0.005) * 6);
      ctx.stroke();
    }
  }
  if (laneIndex === 2) {
    ctx.fillStyle = "#424b57";
    ctx.fillRect(80, 512, 820, 36);
    ctx.fillStyle = "#fff";
    for (let x = 110; x < 860; x += 85) ctx.fillRect(x, 526, 44, 6);
    drawPlaneShape(770, 470, -0.05, "#32a7e2", false);
  }
  if (laneIndex === 3) {
    ctx.fillStyle = "#172632";
    ctx.fillRect(0, 510, W, 20);
    ctx.fillRect(0, 570, W, 18);
    ctx.fillStyle = "#ffd15f";
    ctx.beginPath();
    roundedRect(650, 448, 260, 70, 15);
    ctx.fill();
  }
  if (laneIndex === 4) {
    ctx.fillStyle = "rgba(9, 22, 38, 0.45)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff2b8";
    ctx.beginPath();
    ctx.arc(910, 84, 30, 0, Math.PI * 2);
    ctx.fill();
  }
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

function setJoystickFromEvent(event) {
  const rect = flightStick.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const radius = rect.width / 2 - 18;
  const dx = event.clientX - cx;
  const dy = event.clientY - cy;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const limited = Math.min(radius, distance);
  joystickX = (dx / distance) * (limited / radius);
  joystickY = (dy / distance) * (limited / radius);
  updateJoystickVisual();
}

flightStick.addEventListener("pointerdown", (event) => {
  getAudio();
  joystickPointerId = event.pointerId;
  flightStick.setPointerCapture(event.pointerId);
  setJoystickFromEvent(event);
});

flightStick.addEventListener("pointermove", (event) => {
  if (event.pointerId !== joystickPointerId) return;
  setJoystickFromEvent(event);
});

function releaseJoystick(event) {
  if (event.pointerId !== joystickPointerId) return;
  joystickPointerId = null;
  joystickX = 0;
  joystickY = 0;
  updateJoystickVisual();
}

flightStick.addEventListener("pointerup", releaseJoystick);
flightStick.addEventListener("pointercancel", releaseJoystick);

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
boardFlightBtn.addEventListener("click", () => {
  if (selectedLocation.category !== "flight" || screen !== "activity") {
    statusText.textContent = "先点乐园，选择开飞机地点。";
    return;
  }
  boardNearestPlane();
});
takeoffBtn.addEventListener("click", () => {
  if (selectedLocation.category !== "flight" || screen !== "activity") {
    statusText.textContent = "先进入开飞机地点，再点起飞。";
    return;
  }
  takeoffPlane();
});
landingBtn.addEventListener("click", () => {
  if (selectedLocation.category !== "flight" || screen !== "activity") {
    statusText.textContent = "先进入开飞机地点，再点降落。";
    return;
  }
  landPlane();
});
smoothFlightBtn.addEventListener("click", () => {
  if (selectedLocation.category !== "flight" || screen !== "activity") {
    statusText.textContent = "先进入开飞机地点，再点平稳飞行。";
    return;
  }
  startSmoothFlight();
});
exitFlightBtn.addEventListener("click", () => {
  if (selectedLocation.category !== "flight" || screen !== "activity") {
    statusText.textContent = "先进入开飞机地点，再点下飞机。";
    return;
  }
  exitPlane();
});
jumpFlightBtn.addEventListener("click", () => {
  if (selectedLocation.category !== "flight" || screen !== "activity") {
    statusText.textContent = "先进入开飞机地点，再点跳下飞机。";
    return;
  }
  jumpFromPlane();
});
ballModeBtn.addEventListener("click", () => {
  if (selectedLocation.category !== "flight" || screen !== "activity") {
    statusText.textContent = "先进入开飞机地点，再点变球滚。";
    return;
  }
  toggleBallMode();
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
