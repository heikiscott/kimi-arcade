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
const runwayFlightBtn = document.querySelector("#runwayFlightBtn");
const taxiFlightBtn = document.querySelector("#taxiFlightBtn");
const accelFlightBtn = document.querySelector("#accelFlightBtn");
const decelFlightBtn = document.querySelector("#decelFlightBtn");
const takeoffBtn = document.querySelector("#takeoffBtn");
const landingBtn = document.querySelector("#landingBtn");
const smoothFlightBtn = document.querySelector("#smoothFlightBtn");
const exitFlightBtn = document.querySelector("#exitFlightBtn");
const jumpFlightBtn = document.querySelector("#jumpFlightBtn");
const ballModeBtn = document.querySelector("#ballModeBtn");
const crashSongBtn = document.querySelector("#crashSongBtn");
const flightControls = document.querySelector("#flightControls");
const challengeControls = document.querySelector("#challengeControls");
const flightStick = document.querySelector("#flightStick");
const flightKnob = document.querySelector("#flightKnob");
const locationPicker = document.querySelector("#locationPicker");
const categoryRow = document.querySelector("#categoryRow");
const locationList = document.querySelector("#locationList");
const closePickerBtn = document.querySelector("#closePickerBtn");

const W = canvas.width;
const H = canvas.height;
const PLANE_TURBO_MULTIPLIER = 100;
const PLANE_TURBO_MAX_SPEED = 1800;
const keys = new Set();
const controls = new Set();
const controlPointers = new Map();

const categories = [
  { key: "flight", title: "开飞机地点", count: 50, prefix: "云端机场", detail: "停机坪、飞机队列、大跑道" },
  { key: "water", title: "水上乐园地点", count: 20, prefix: "水花乐园", detail: "大喇叭、漩涡、蛇形滑道" },
  { key: "metro", title: "开地铁地点", count: 10, prefix: "环线地铁", detail: "站台门、驾驶台、下一站" },
  { key: "fish", title: "摸鱼地点", count: 30, prefix: "河边摸鱼", detail: "河岸、树、椅子、捞随机东西" },
  { key: "history", title: "历史纪念馆", count: 1, prefix: "历史纪念馆", detail: "9/11事件回顾、双塔纪念光柱" },
  { key: "challenge", title: "闯关游戏地点", count: 40, prefix: "五条路线", detail: "每条路线机关都不一样" }
];

const namedPlaces = {
  flight: ["云端机场", "樟宜机场", "昆明长水机场", "浦东机场", "虹桥机场", "关西机场", "羽田机场", "成田机场", "长野机场", "夏森机场", "马奇机场", "首都机场", "大兴机场", "洛杉矶机场", "西雅图机场"],
  water: ["大喇叭水城", "漩涡水城", "蛇形滑道湾", "彩虹水寨", "冲浪河谷"],
  metro: ["港湾控制站", "欧南园驾驶站", "牛车水换乘站", "克拉码头终点站", "滨海湾地下站"],
  fish: ["河边摸鱼树下", "公园长椅河岸", "荷叶浅滩", "小桥摸鱼点", "柳树水湾"],
  history: ["9/11历史纪念馆"],
  challenge: ["传送门五路", "弹簧塔五路", "机场风道五路", "地铁轨道五路", "夜晚躲避五路"]
};

function buildLocations(category) {
  const names = namedPlaces[category.key] || [];
  return Array.from({ length: category.count }, (_, index) => ({
    name: names[index] || `${category.prefix} ${String(index + 1).padStart(2, "0")}`,
    category: category.key,
    detail: category.detail,
    variant: index % 5
  }));
}

const locations = Object.fromEntries(categories.map((category) => [category.key, buildLocations(category)]));

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
  bank: 0,
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
  planeCrashExploded: false,
  landedPlaneVisible: false,
  landingTurboUntil: 0,
  landingTargetX: 0,
  landingTargetY: 0,
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
let historyStartTime = 0;
let elapsed = 0;
let starCount = 0;
let laneStars = [];
let audioContext = null;
let joystickX = 0;
let joystickY = 0;
let joystickPointerId = null;
let joystickTouching = false;
let flightLookOffsetX = 0;
let flightLookOffsetY = 0;
let flightLookDragging = false;
let flightLookPointerId = null;
let flightLookLastX = 0;
let flightLookLastY = 0;

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
const fishLoots = ["鱼", "锅", "僵尸蛋", "宝箱", "奇怪玩具", "水草", "金色贝壳", "破旧钥匙"];

const flightWorld = {
  w: 22000,
  h: 3900,
  finishX: 21450,
  finishY: 1820
};

const landingRunway = {
  x: 8420,
  y: 1540,
  w: 12500,
  h: 190,
  targetX: 8660,
  rolloutEndX: 20400,
  centerY: 1635
};

const airportPlanes = [
  { x: 760, y: 580, label: "日本航空", model: "波音737", tailMark: "JL", color: "#d8343f", scale: 1.12 },
  { x: 760, y: 790, label: "中国航空", model: "空客A320", tailMark: "CA", color: "#2f79c8", scale: 1.12 },
  { x: 760, y: 1000, label: "美国航空", model: "波音737", tailMark: "AA", color: "#42536b", scale: 1.12 },
  { x: 760, y: 1210, label: "东方航空", model: "空客A330", tailMark: "MU", color: "#d83258", scale: 1.14 },
  { x: 760, y: 1420, label: "南方航空", model: "波音737", tailMark: "CZ", color: "#1f8c65", scale: 1.12 },
  { x: 760, y: 1630, label: "亚洲航空", model: "空客A320", tailMark: "AK", color: "#d51f2a", scale: 1.12 },
  { x: 760, y: 1840, label: "泰国航空", model: "空客A330", tailMark: "TG", color: "#7b4ab8", scale: 1.12 },
  { x: 760, y: 2050, label: "大韩航空", model: "波音737", tailMark: "KE", color: "#4aa3df", scale: 1.12 },
  { x: 760, y: 2260, label: "印度航空", model: "空客A320", tailMark: "AI", color: "#c22d2d", scale: 1.12 },
  { x: 760, y: 2470, label: "山东航空", model: "波音737", tailMark: "SC", color: "#f28b2f", scale: 1.1 },
  { x: 760, y: 2680, label: "澳门航空", model: "空客A320", tailMark: "NX", color: "#2270b8", scale: 1.1 },
  { x: 760, y: 2890, label: "三亚航空", model: "波音737", tailMark: "SY", color: "#32a852", scale: 1.1 },
  { x: 760, y: 3100, label: "海南航空", model: "空客A330", tailMark: "HU", color: "#8f5fd9", scale: 1.08 },
  { x: 760, y: 3310, label: "春秋航空", model: "空客A320", tailMark: "9C", color: "#4f6b48", scale: 1.08 },
  { x: 760, y: 3520, label: "吉祥航空", model: "波音737", tailMark: "HO", color: "#f06aa3", scale: 1.1 }
];

function gateY(plane) {
  return plane.y + 170;
}

function landingGroundY(x) {
  let nearest = airportPlanes[0];
  let distance = Infinity;
  airportPlanes.forEach((plane) => {
    const d = Math.abs(x - plane.x);
    if (d < distance) {
      nearest = plane;
      distance = d;
    }
  });
  return nearest.y;
}

function getLandingTarget() {
  const plane = airportPlanes[vehicle.selectedPlaneIndex] || airportPlanes[0];
  return {
    x: vehicle.landingTargetX || landingRunway.targetX,
    y: vehicle.landingTargetY || landingRunway.centerY,
    plane
  };
}

function getGateTarget() {
  const plane = airportPlanes[vehicle.selectedPlaneIndex] || airportPlanes[0];
  return {
    x: plane.x,
    y: plane.y,
    plane
  };
}

function getTakeoffTarget() {
  return {
    x: 1280,
    y: 1635
  };
}

function shortestAngle(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

const flightClouds = [
  { x: 120, y: 90, s: 0.9, speed: 0.45 },
  { x: 520, y: 54, s: 0.65, speed: 0.33 },
  { x: 900, y: 126, s: 0.8, speed: 0.38 }
];

const breakableBuildings = [
  { id: "terminal-a", type: "terminal", label: "一号航站楼", x: 360, y: 430, w: 310, h: 220, broken: false, brokenAt: 0 },
  { id: "terminal-b", type: "terminal", label: "二号航站楼", x: 1010, y: 410, w: 310, h: 240, broken: false, brokenAt: 0 },
  { id: "terminal-c", type: "terminal", label: "三号航站楼", x: 2430, y: 390, w: 330, h: 260, broken: false, brokenAt: 0 },
  { id: "terminal-d", type: "terminal", label: "四号航站楼", x: 3260, y: 380, w: 330, h: 270, broken: false, brokenAt: 0 },
  { id: "office", type: "office", label: "航司高楼", x: 320, y: 1720, w: 260, h: 620, broken: false, brokenAt: 0 },
  { id: "hotel", type: "office", label: "酒店高楼", x: 3800, y: 1690, w: 260, h: 650, broken: false, brokenAt: 0 },
  { id: "repair", type: "office", label: "维修高楼", x: 1880, y: 2860, w: 260, h: 620, broken: false, brokenAt: 0 },
  { id: "military-hangar", type: "hangar", label: "军事机库", x: 560, y: 2580, w: 560, h: 310, broken: false, brokenAt: 0 },
  { id: "private-hangar", type: "hangar", label: "私人飞机库", x: 2640, y: 2580, w: 560, h: 310, broken: false, brokenAt: 0 }
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

function crashSong() {
  getAudio();
  const notes = [392, 370, 330, 294, 262, 220, 196, 175, 147, 131];
  notes.forEach((note, i) => {
    tone(note, i * 0.18, 0.2, 0.026, i % 2 ? "triangle" : "sine");
  });
  [110, 82, 55].forEach((note, i) => tone(note, 1.8 + i * 0.18, 0.28, 0.032, "sawtooth"));
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
  vehicle.bank = 0;
  vehicle.heading = 0;
  vehicle.mode = selectedLocation.category === "flight" ? "walking" : "free";
  vehicle.progress = 0;
  vehicle.pilotX = selectedLocation.category === "flight" ? airportPlanes[0].x - 76 : 360;
  vehicle.pilotY = selectedLocation.category === "flight" ? gateY(airportPlanes[0]) : 750;
  vehicle.pilotVx = 0;
  vehicle.pilotVy = 0;
  vehicle.pilotBall = false;
  vehicle.fallStart = 0;
  vehicle.planeCrashExploded = false;
  vehicle.landedPlaneVisible = false;
  vehicle.landingTurboUntil = 0;
  vehicle.landingTargetX = 0;
  vehicle.landingTargetY = 0;
  joystickX = 0;
  joystickY = 0;
  flightLookOffsetX = 0;
  flightLookOffsetY = 0;
  flightLookDragging = false;
  flightLookPointerId = null;
  breakableBuildings.forEach((building) => {
    building.broken = false;
    building.brokenAt = 0;
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
    const distance = Math.hypot(vehicle.pilotX - plane.x, vehicle.pilotY - gateY(plane));
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
    statusText.textContent = "你已经在飞机里了，点“去跑道”先到长跑道。";
    return true;
  }
  const nearest = getNearestPlane();
  if (nearest.distance > 195) {
    statusText.textContent = "先走到任意一架飞机门口，再点“上飞机”。";
    return true;
  }
  vehicle.selectedPlaneIndex = nearest.index;
  vehicle.x = nearest.plane.x;
  vehicle.y = nearest.plane.y;
  vehicle.heading = 0;
  vehicle.angle = vehicle.heading;
  vehicle.bank = 0;
  vehicle.vx = 0;
  vehicle.vy = 0;
  vehicle.landedPlaneVisible = false;
  vehicle.mode = "boarded";
  statusText.textContent = `从停机位上了${nearest.plane.label}！先点“去跑道”，再点“滑行”。`;
  portalSound();
  return true;
}

function startSmoothFlight() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode === "walking") return boardNearestPlane();
  if (vehicle.mode === "taxi-ready") {
    statusText.textContent = "飞机已经在跑道上准备好了，先点“滑行”开始跑，再点“起飞”。";
    return true;
  }
  statusText.textContent = "先点“去跑道”，到跑道以后再点“滑行”。";
  return true;
}

function goRunwayPlane() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode === "walking") return boardNearestPlane();
  if (vehicle.mode === "taxi-takeoff") {
    statusText.textContent = "正在去长跑道，还没有开始滑行加速。";
    return true;
  }
  if (vehicle.mode === "taxi-ready") {
    statusText.textContent = "飞机已经到长跑道了，现在点“滑行”。";
    return true;
  }
  if (vehicle.mode !== "boarded" && vehicle.mode !== "parked") {
    statusText.textContent = "要先在飞机旁边上飞机，才能去跑道。";
    return true;
  }
  vehicle.mode = "taxi-takeoff";
  vehicle.landedPlaneVisible = false;
  vehicle.heading = 0;
  vehicle.angle = 0;
  vehicle.vx = 0;
  vehicle.vy = 0;
  statusText.textContent = "开始去跑道：飞机只是在地上移动到长跑道。";
  portalSound();
  return true;
}

function taxiPlane() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode === "walking") return boardNearestPlane();
  if (vehicle.mode === "boarded" || vehicle.mode === "parked") {
    statusText.textContent = "先点“去跑道”，到长跑道以后再点“滑行”。";
    return true;
  }
  if (vehicle.mode === "taxi-takeoff") {
    statusText.textContent = "还在去跑道，到了跑道再滑行。";
    return true;
  }
  if (vehicle.mode === "takeoff-roll") {
    statusText.textContent = "正在跑道上滑行，可以点加速/减速，点起飞才会离地。";
    return true;
  }
  if (vehicle.mode !== "taxi-ready") {
    statusText.textContent = "现在不能滑行，要先去跑道。";
    return true;
  }
  vehicle.mode = "takeoff-roll";
  vehicle.vx = Math.max(2.2, vehicle.vx);
  vehicle.vy = 0;
  vehicle.heading = 0;
  vehicle.angle = 0;
  statusText.textContent = "开始跑道滑行。你可以点加速/减速，最后点起飞。";
  return true;
}

function takeoffPlane() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode === "walking") return boardNearestPlane();
  if (vehicle.mode === "boarded" || vehicle.mode === "parked") {
    statusText.textContent = "先点“去跑道”，再点“滑行”，最后再点“起飞”。";
    return true;
  }
  if (vehicle.mode === "taxi-takeoff") {
    statusText.textContent = "还在去跑道，等到跑道上停好以后再点“滑行”。";
    return true;
  }
  if (vehicle.mode === "taxi-ready") {
    statusText.textContent = "先点“滑行”在跑道上跑起来，再点“起飞”。";
    return true;
  }
  if (vehicle.mode !== "takeoff-roll") {
    statusText.textContent = "现在不能起飞，要先去跑道并开始滑行。";
    return true;
  }
  vehicle.mode = "flying";
  vehicle.vx = Math.max(10.8, vehicle.vx);
  vehicle.vy = -4.2;
  vehicle.heading = -0.08;
  vehicle.angle = -0.08;
  vehicle.bank = 0;
  statusText.textContent = "你点了起飞，飞机现在才离开跑道！";
  tone(440, 0, 0.12, 0.02, "triangle");
  tone(660, 0.11, 0.14, 0.02, "triangle");
  return true;
}

function adjustPlaneSpeed(delta) {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode === "takeoff-roll") {
    if (delta > 0) {
      vehicle.vx = Math.min(PLANE_TURBO_MAX_SPEED, Math.max(vehicle.vx * PLANE_TURBO_MULTIPLIER, 220));
      statusText.textContent = `超级加速 100 倍！跑道滑行速度 ${Math.round(vehicle.vx * 26)}。`;
    } else {
      vehicle.vx = Math.max(0.8, vehicle.vx / 4);
      statusText.textContent = `减速！跑道滑行速度 ${Math.round(vehicle.vx * 26)}。`;
    }
    return true;
  }
  if (vehicle.mode === "flying") {
    if (delta > 0) {
      const currentSpeed = Math.max(5, Math.hypot(vehicle.vx, vehicle.vy));
      const turboSpeed = Math.min(PLANE_TURBO_MAX_SPEED, currentSpeed * PLANE_TURBO_MULTIPLIER);
      vehicle.vx = Math.cos(vehicle.heading) * turboSpeed;
      vehicle.vy = Math.sin(vehicle.heading) * turboSpeed;
      statusText.textContent = `空中超级加速 100 倍！速度 ${Math.round(turboSpeed * 26)}。`;
    } else {
      vehicle.vx *= 0.25;
      vehicle.vy *= 0.25;
      statusText.textContent = "飞机减速了。";
    }
    return true;
  }
  if (vehicle.mode === "auto-landing") {
    if (delta > 0) {
      vehicle.landingTurboUntil = performance.now() + 5000;
      const currentSpeed = Math.max(4, Math.hypot(vehicle.vx, vehicle.vy));
      const turboSpeed = Math.min(PLANE_TURBO_MAX_SPEED, currentSpeed * PLANE_TURBO_MULTIPLIER);
      vehicle.vx *= 2;
      vehicle.vy *= 2;
      statusText.textContent = `回跑道超级加速 100 倍！接下来 5 秒会真的冲向跑道，速度 ${Math.round(turboSpeed * 26)}。`;
    } else {
      vehicle.landingTurboUntil = 0;
      vehicle.vx *= 0.25;
      vehicle.vy *= 0.25;
      statusText.textContent = "回跑道途中减速了。";
    }
    return true;
  }
  if (vehicle.mode === "landing-rollout" || vehicle.mode === "taxi-to-gate") {
    if (delta > 0) {
      vehicle.vx = Math.min(PLANE_TURBO_MAX_SPEED, Math.max(vehicle.vx * PLANE_TURBO_MULTIPLIER, 120));
      statusText.textContent = "地面滑行超级加速 100 倍。";
    } else {
      vehicle.vx = Math.max(0.4, vehicle.vx / 4);
      statusText.textContent = "地面滑行减速。";
    }
    return true;
  }
  statusText.textContent = "加速/减速要在跑道滑行或飞行时使用。";
  return true;
}

function landPlane() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode === "auto-landing") {
    statusText.textContent = "飞机已经在自动飞往右边的专用降落跑道，正在减速降落。";
    return true;
  }
  if (vehicle.mode === "landing-rollout") {
    statusText.textContent = "飞机已经落地，正在跑道上滑行减速。";
    return true;
  }
  if (vehicle.mode === "taxi-to-gate") {
    statusText.textContent = "飞机已经降落，正在自动滑回停机位。";
    return true;
  }
  if (vehicle.mode === "parked") {
    statusText.textContent = "飞机已经锁住停在停机位了，没有再往前跑。";
    return true;
  }
  if (vehicle.mode !== "flying" && vehicle.mode !== "boarded") {
    statusText.textContent = "现在不在飞机里，不能降落。";
    return true;
  }
  const targetX = Math.max(
    landingRunway.targetX,
    Math.min(landingRunway.rolloutEndX - 1400, vehicle.x + 1200)
  );
  vehicle.landingTargetX = targetX;
  vehicle.landingTargetY = landingRunway.centerY;
  const target = getLandingTarget();
  vehicle.mode = "auto-landing";
  vehicle.heading = 0;
  vehicle.angle += (0 - vehicle.angle) * 0.35;
  statusText.textContent = "自动降落开始：飞机会横着往右飞到前方跑道，不会突然掉头反过来。";
  return true;
}

function exitPlane() {
  if (selectedLocation.category !== "flight") return false;
  if (vehicle.mode === "walking") {
    statusText.textContent = "你现在已经在停机坪上了。";
    return true;
  }
  vehicle.mode = "walking";
  vehicle.pilotX = vehicle.x - 70;
  vehicle.pilotY = gateY(airportPlanes[vehicle.selectedPlaneIndex] || airportPlanes[0]);
  vehicle.pilotVx = 0;
  vehicle.vx = 0;
  vehicle.vy = 0;
  joystickX = 0;
  joystickY = 0;
  updateJoystickVisual();
  statusText.textContent = "下飞机了！你回到停机坪，可以走到别的飞机旁边。";
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
  vehicle.mode = "plane-falling";
  vehicle.fallStart = performance.now();
  vehicle.planeCrashExploded = false;
  vehicle.pilotX = Math.max(210, Math.min(flightWorld.w - 210, vehicle.x - 110));
  vehicle.pilotY = landingGroundY(vehicle.x) + 118;
  vehicle.pilotVy = 0;
  vehicle.pilotBall = false;
  flightLookOffsetX = 0;
  flightLookOffsetY = -360;
  crashSong();
  statusText.textContent = "小蛋仔已经在地面下面了！飞机还在上方，拖屏幕可以往上看、往下看、往左看、往右看。";
  return true;
}

function isOnAirportLand(x, y) {
  return Math.hypot(x - 4250, y - 1950) <= 3920;
}

function finishPlaneFalling() {
  vehicle.vx = 0;
  vehicle.vy = 0;
  vehicle.angle = 0;
  vehicle.planeCrashExploded = false;
  vehicle.landedPlaneVisible = true;
  vehicle.mode = "landed";
  vehicle.y = landingGroundY(vehicle.x);
  vehicle.pilotX = vehicle.x - 110;
  vehicle.pilotY = vehicle.y + 118;
  flightLookOffsetX = 0;
  flightLookOffsetY = -180;
  statusText.textContent = "飞机落到地上停住了，不爆炸，不重来；小蛋仔安全在地面，可以拖屏幕四处看。";
}

function checkBuildingCrash() {
  if (selectedLocation.category !== "flight" || vehicle.mode !== "flying") return;
  breakableBuildings.forEach((building) => {
    if (building.broken) return;
    const hit = vehicle.x > building.x - 120 && vehicle.x < building.x + building.w + 120 && vehicle.y > building.y - 90 && vehicle.y < building.y + building.h + 90;
    if (!hit) return;
    building.broken = true;
    building.brokenAt = performance.now();
    statusText.textContent = `撞到${building.label}了！它会像从上往下压一样塌掉，飞机没有坏，还能继续飞。`;
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
  updateContextControls();
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
  updateContextControls();
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
  updateContextControls();
  if (place.category === "challenge") {
    startCourse(place.name);
    return;
  }
  screen = "activity";
  updateContextControls();
  playing = false;
  locationPicker.hidden = true;
  elapsed = 0;
  if (place.category === "history") historyStartTime = performance.now();
  resetVehicle();
  statusText.textContent = getActivityHelp(place.category);
}

function updateContextControls() {
  if (flightControls) flightControls.hidden = selectedLocation.category !== "flight" || screen === "lobby";
  if (challengeControls) challengeControls.hidden = screen !== "course";
}

function getActivityHelp(category) {
  if (category === "flight") return `${selectedLocation.name}：你在机场停机坪上，走到飞机旁边上飞机，再点“去跑道”。`;
  if (category === "water") return `${selectedLocation.name}：这里有大喇叭、漩涡和蛇形滑道，点互动开始滑水。`;
  if (category === "metro") return `${selectedLocation.name}：站台门在前面，点互动进驾驶台，再控制地铁往下一站开。`;
  if (category === "fish") return `${selectedLocation.name}：站在河边捞东西，可能捞到鱼、锅、僵尸蛋、宝箱或者奇怪玩具。`;
  if (category === "history") return `${selectedLocation.name}：这是安静的历史纪念馆，可以看2001年9月11日事件时间线和纪念光柱。`;
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
      const stickWalkX = Math.abs(joystickX) > 0.08 ? joystickX : 0;
      const stickWalkY = Math.abs(joystickY) > 0.08 ? joystickY : 0;
      if (left) vehicle.pilotVx -= walkPower;
      if (right) vehicle.pilotVx += walkPower;
      if (up) vehicle.pilotVy -= walkPower;
      if (boost) vehicle.pilotVy += walkPower;
      vehicle.pilotVx += stickWalkX * walkPower * 1.4;
      vehicle.pilotVy += stickWalkY * walkPower * 1.4;
      vehicle.pilotVx *= vehicle.pilotBall ? 0.9 : 0.82;
      vehicle.pilotVy *= vehicle.pilotBall ? 0.9 : 0.82;
      vehicle.pilotX = Math.max(210, Math.min(flightWorld.w - 210, vehicle.pilotX + vehicle.pilotVx));
      vehicle.pilotY = Math.max(260, Math.min(flightWorld.h - 260, vehicle.pilotY + vehicle.pilotVy));
      const nearest = getNearestPlane();
      if (nearest.distance < 155) {
        statusText.textContent = `你走到${nearest.plane.label}旁边了，点“上飞机”。`;
      } else {
        statusText.textContent = "你可以在停机坪上下左右走，靠近任意一架飞机再上飞机。";
      }
    } else if (vehicle.mode === "plane-falling") {
      const fallElapsed = performance.now() - vehicle.fallStart;
      if (fallElapsed < vehicle.floatDuration) {
        vehicle.vx += Math.cos(vehicle.heading) * 0.12;
        vehicle.vy += Math.sin(vehicle.heading) * 0.12;
        vehicle.angle += Math.sin(fallElapsed * 0.004) * 0.004;
        vehicle.bank += (Math.sin(fallElapsed * 0.003) * 0.42 - vehicle.bank) * 0.035;
      } else {
        vehicle.vy += 0.16;
        vehicle.angle += 0.018;
        vehicle.bank += (0.72 - vehicle.bank) * 0.025;
      }
      vehicle.y += vehicle.vy;
      const remaining = Math.max(0, Math.ceil((vehicle.fallDuration - fallElapsed) / 1000));
      if (!vehicle.planeCrashExploded) {
        statusText.textContent = fallElapsed < vehicle.floatDuration
          ? `小蛋仔在下面地面，飞机还在空中飘，还剩 ${remaining} 秒掉下来。拖屏幕可以四处看。`
          : `小蛋仔在下面看着，飞机开始往下掉，还剩 ${remaining} 秒落地。拖屏幕可以四处看。`;
      }
      if (fallElapsed >= vehicle.fallDuration && !vehicle.planeCrashExploded) finishPlaneFalling();
    } else if (vehicle.mode === "landed") {
      vehicle.vx = 0;
      vehicle.vy = 0;
      vehicle.angle = 0;
      vehicle.y = landingGroundY(vehicle.x);
      vehicle.pilotX = vehicle.x - 110;
      vehicle.pilotY = vehicle.y + 118;
    } else if (vehicle.mode === "parked") {
      vehicle.vx = 0;
      vehicle.vy = 0;
      vehicle.angle = 0;
      const gate = getGateTarget();
      vehicle.x = gate.x;
      vehicle.y = gate.y;
      vehicle.heading = 0;
    } else if (vehicle.mode === "taxi-takeoff") {
      const target = getTakeoffTarget();
      const onRunway = Math.abs(vehicle.y - target.y) < 34 && vehicle.x > target.x - 80;
      if (!onRunway) {
        const dx = target.x - vehicle.x;
        const dy = target.y - vehicle.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const desiredHeading = Math.atan2(dy, dx);
        const taxiSpeed = Math.max(1.2, Math.min(6.4, distance / 62));
        vehicle.heading += shortestAngle(vehicle.heading, desiredHeading) * 0.1;
        vehicle.angle += shortestAngle(vehicle.angle, vehicle.heading) * 0.14;
        vehicle.bank += (0 - vehicle.bank) * 0.08;
        vehicle.vx += (Math.cos(desiredHeading) * taxiSpeed - vehicle.vx) * 0.1;
        vehicle.vy += (Math.sin(desiredHeading) * taxiSpeed - vehicle.vy) * 0.1;
        vehicle.y += vehicle.vy;
        statusText.textContent = `飞机还在地上滑行去长跑道，距离 ${Math.round(distance)} 米，还没有起飞。`;
      } else {
        vehicle.heading = 0;
        vehicle.angle += (0 - vehicle.angle) * 0.18;
        vehicle.bank += (0 - vehicle.bank) * 0.08;
        vehicle.vx *= 0.88;
        vehicle.vy *= 0.84;
        vehicle.y += (target.y - vehicle.y) * 0.08;
        statusText.textContent = "飞机已经到长跑道，正在停住等你点“滑行”。";
        if (Math.abs(vehicle.vx) < 0.5) {
          vehicle.x = target.x;
          vehicle.y = target.y;
          vehicle.vx = 0;
          vehicle.vy = 0;
          vehicle.mode = "taxi-ready";
          statusText.textContent = "飞机在长跑道上停好了。现在点“滑行”，再点“起飞”。";
        }
      }
    } else if (vehicle.mode === "taxi-ready") {
      const target = getTakeoffTarget();
      vehicle.x = target.x;
      vehicle.y = target.y;
      vehicle.vx = 0;
      vehicle.vy = 0;
      vehicle.heading = 0;
      vehicle.angle = 0;
      vehicle.bank = 0;
    } else if (vehicle.mode === "takeoff-roll") {
      const target = getTakeoffTarget();
      vehicle.heading = 0;
      vehicle.angle += (0 - vehicle.angle) * 0.16;
      vehicle.bank += (0 - vehicle.bank) * 0.08;
      vehicle.vy += (0 - vehicle.vy) * 0.15;
      vehicle.y += (target.y - vehicle.y) * 0.08;
      vehicle.vx = Math.max(0.8, Math.min(PLANE_TURBO_MAX_SPEED, vehicle.vx * 0.996));
      statusText.textContent = `跑道滑行中，速度 ${Math.round(vehicle.vx * 26)}。点加速/减速，点起飞才会飞。`;
    } else if (vehicle.mode === "landing-rollout") {
      const target = getLandingTarget();
      vehicle.heading = 0;
      vehicle.angle += (0 - vehicle.angle) * 0.18;
      vehicle.bank += (0 - vehicle.bank) * 0.08;
      vehicle.vy = 0;
      vehicle.y += (target.y - vehicle.y) * 0.16;
      vehicle.vx = Math.max(1.15, vehicle.vx * 0.985);
      statusText.textContent = `降落后在专用降落跑道滑行减速，速度 ${Math.round(vehicle.vx * 26)}。`;
      if (vehicle.x > landingRunway.rolloutEndX || vehicle.vx <= 1.25) {
        vehicle.vx = 0;
        vehicle.vy = 0;
        vehicle.mode = "taxi-to-gate";
        statusText.textContent = "专用降落跑道滑行减速完成，现在慢慢滑回停机位。";
      }
    } else if (vehicle.mode === "taxi-to-gate") {
      const gate = getGateTarget();
      const dx = gate.x - vehicle.x;
      const dy = gate.y - vehicle.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const desiredHeading = Math.atan2(dy, dx);
      const taxiSpeed = Math.max(0.55, Math.min(5.2, distance / 72));
      vehicle.heading += shortestAngle(vehicle.heading, desiredHeading) * 0.09;
      vehicle.angle += shortestAngle(vehicle.angle, vehicle.heading) * 0.12;
      vehicle.bank += (0 - vehicle.bank) * 0.08;
      vehicle.vx += (Math.cos(desiredHeading) * taxiSpeed - vehicle.vx) * 0.09;
      vehicle.vy += (Math.sin(desiredHeading) * taxiSpeed - vehicle.vy) * 0.09;
      vehicle.y += vehicle.vy;
      statusText.textContent = distance > 55
        ? `已经降落，正在滑回${gate.plane.label}停机位，距离 ${Math.round(distance)} 米。`
        : "滑回停机位，马上停稳锁住。";
      if (distance < 38) {
        vehicle.x = gate.x;
        vehicle.y = gate.y;
        vehicle.vx = 0;
        vehicle.vy = 0;
        vehicle.heading = 0;
        vehicle.angle = 0;
        vehicle.bank = 0;
        vehicle.mode = "parked";
        statusText.textContent = "飞机回到停机位并锁住停好了，真的不会继续跑了。";
      }
    } else if (vehicle.mode === "auto-landing") {
      if (vehicle.landingTargetX < vehicle.x + 260) {
        vehicle.landingTargetX = Math.min(landingRunway.rolloutEndX - 900, vehicle.x + 900);
      }
      const target = getLandingTarget();
      const dx = target.x - vehicle.x;
      const dy = target.y - vehicle.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const landingTurboActive = vehicle.landingTurboUntil > performance.now();
      const horizontalDistance = Math.max(1, target.x - vehicle.x);
      const desiredSpeed = landingTurboActive
        ? Math.min(PLANE_TURBO_MAX_SPEED, Math.max(80, Math.min(distance / 3, 340)))
        : horizontalDistance > 900 ? 9.2 : Math.max(0.55, horizontalDistance / 76);
      const desiredVx = desiredSpeed;
      const desiredVy = Math.max(-9, Math.min(9, dy * (landingTurboActive ? 0.035 : 0.018)));
      const speedResponse = landingTurboActive ? 0.55 : 0.07;
      vehicle.heading += shortestAngle(vehicle.heading, 0) * 0.12;
      vehicle.angle += shortestAngle(vehicle.angle, 0) * (landingTurboActive ? 0.18 : 0.1);
      vehicle.bank += (0 - vehicle.bank) * 0.07;
      vehicle.vx += (desiredVx - vehicle.vx) * speedResponse;
      vehicle.vy += (desiredVy - vehicle.vy) * speedResponse;
      vehicle.y += vehicle.vy;
      const speedNow = Math.hypot(vehicle.vx, vehicle.vy);
      statusText.textContent = landingTurboActive
        ? `回跑道 100 倍加速中：距离 ${Math.round(distance)} 米，速度 ${Math.round(speedNow * 26)}。`
        : distance > 150
        ? `自动降落中：正在飞往右边专用降落跑道，距离 ${Math.round(distance)} 米。`
        : "自动降落中：接近专用降落跑道，准备长距离减速。";
      if (distance < 44 || (landingTurboActive && distance < Math.max(90, speedNow * 1.4)) || (distance < 90 && speedNow < 1.6)) {
        vehicle.x = target.x;
        vehicle.y = target.y;
        vehicle.vx = Math.max(7.2, Math.abs(vehicle.vx));
        vehicle.vy = 0;
        vehicle.heading = 0;
        vehicle.angle = 0;
        vehicle.bank = 0;
        vehicle.landingTurboUntil = 0;
        vehicle.mode = "landing-rollout";
        statusText.textContent = "降落到右边专用跑道了。现在沿着很长的跑道滑行减速。";
      }
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
      const targetBank = vehicle.mode === "flying" ? Math.max(-0.62, Math.min(0.62, joystickX * 0.62)) : 0;
      vehicle.bank += (targetBank - vehicle.bank) * 0.055;
      vehicle.angle += shortestAngle(vehicle.angle, vehicle.heading) * 0.1;
      vehicle.y += vehicle.vy;
    }
  } else if (selectedLocation.category === "water") {
    if (vehicle.mode === "slide") {
      vehicle.progress += 0.015;
      vehicle.x = 190 + vehicle.progress * 690;
      vehicle.y = 155 + Math.sin(vehicle.progress * Math.PI * (selectedLocation.variant + 1)) * 72 + vehicle.progress * 300;
      vehicle.angle = Math.sin(vehicle.progress * Math.PI * 2) * 0.22;
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
    if (vehicle.mode === "parked") return startSmoothFlight();
    if (vehicle.mode === "taxi-takeoff") {
      statusText.textContent = "飞机还在地面滑行，到跑道后会等你点起飞。";
      return true;
    }
    if (vehicle.mode === "taxi-ready") {
      statusText.textContent = "飞机在长跑道上停好了。现在点“滑行”。";
      return true;
    }
    if (vehicle.mode === "takeoff-roll") {
      statusText.textContent = "飞机正在跑道滑行，点加速/减速控制，点起飞才会飞。";
      return true;
    }
    if (vehicle.mode === "landing-rollout") {
      statusText.textContent = "飞机已经落地，正在长跑道上滑行减速。";
      return true;
    }
    if (vehicle.mode === "taxi-to-gate") {
      statusText.textContent = "飞机正在自动滑回停机位，等它锁住停稳。";
      return true;
    }
    if (vehicle.mode === "auto-landing") {
      statusText.textContent = "正在自动降落，等飞机停到跑道上。";
      return true;
    }
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
    if (vehicle.x > 280 && vehicle.x < 720) {
      vehicle.mode = "slide";
      vehicle.progress = 0;
      statusText.textContent = "爬上滑道了！这次会经过大喇叭、漩涡或者蛇形滑道。";
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
    const item = fishLoots[Math.floor(Math.random() * fishLoots.length)];
    statusText.textContent = `一网捞上来：${item}！旁边还有树和椅子，可以继续在河边摸鱼。`;
    tone(988, 0, 0.14, 0.024, "sine");
    return true;
  }
  if (selectedLocation.category === "history") {
    statusText.textContent = "9/11历史纪念馆：记住历史，纪念遇难者，也学习珍惜和平。";
    tone(392, 0, 0.2, 0.018, "sine");
    tone(523, 0.22, 0.22, 0.016, "sine");
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
  if (selectedLocation.category === "history") drawHistoryMemorialScene();
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

function flightFocusPoint() {
  if (vehicle.mode === "walking") return { x: vehicle.pilotX, y: vehicle.pilotY };
  if (vehicle.mode === "plane-falling" || vehicle.mode === "landed") {
    return {
      x: vehicle.pilotX + flightLookOffsetX,
      y: vehicle.pilotY + flightLookOffsetY
    };
  }
  return { x: vehicle.x, y: vehicle.y };
}

function drawFlightScene() {
  const zoom = 0.46;
  const focus = flightFocusPoint();
  const focusX = focus.x;
  const focusY = focus.y;
  const viewW = W / zoom;
  const viewH = H / zoom;
  const offsetX = viewW / 2 - focusX;
  const offsetY = viewH / 2 - focusY;
  drawSky();
  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(offsetX, offsetY);
  drawWorldCloudField(focusX, focusY);
  drawHugeAirport();
  if (vehicle.mode === "walking") drawTerminalInteriorHall(focusX);
  airportPlanes.forEach((plane, index) => {
    if ((vehicle.mode === "boarded" || vehicle.mode === "taxi-takeoff" || vehicle.mode === "taxi-ready" || vehicle.mode === "takeoff-roll" || vehicle.mode === "flying" || vehicle.mode === "auto-landing" || vehicle.mode === "landing-rollout" || vehicle.mode === "taxi-to-gate" || vehicle.mode === "parked" || vehicle.mode === "plane-falling" || vehicle.mode === "landed") && index === vehicle.selectedPlaneIndex) return;
    drawParkedPlane(plane);
  });
  if (vehicle.mode === "walking" || vehicle.mode === "plane-falling" || vehicle.mode === "landed") drawWalkingPilot(vehicle.pilotX, vehicle.pilotY);
  if (vehicle.mode === "boarded" || vehicle.mode === "taxi-takeoff" || vehicle.mode === "taxi-ready" || vehicle.mode === "takeoff-roll" || vehicle.mode === "flying" || vehicle.mode === "auto-landing" || vehicle.mode === "landing-rollout" || vehicle.mode === "taxi-to-gate" || vehicle.mode === "parked" || vehicle.mode === "plane-falling" || vehicle.mode === "landed") drawAirplane(vehicle.x, vehicle.y, vehicle.angle);
  if (vehicle.mode === "plane-falling") drawPlaneFallingOverlay();
  ctx.restore();
  drawFlightClouds();

  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.beginPath();
  roundedRect(W - 310, 24, 280, 94, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 18px system-ui";
  ctx.fillText("近景机场视野 3365 公顷", W - 288, 56);
  ctx.font = "800 14px system-ui";
  const line1 = vehicle.mode === "walking"
    ? "停机坪上，走到飞机旁边"
    : vehicle.mode === "plane-falling" || vehicle.mode === "landed"
      ? "小蛋仔在地面，飞机在上方"
      : vehicle.mode === "taxi-takeoff"
        ? "地面滑行中，还没起飞"
      : vehicle.mode === "taxi-ready"
        ? "跑道上等你滑行"
      : vehicle.mode === "takeoff-roll"
        ? "跑道滑行中"
      : vehicle.mode === "auto-landing"
        ? "自动降落，正在找跑道"
      : vehicle.mode === "landing-rollout"
        ? "落地后跑道滑行减速"
      : vehicle.mode === "taxi-to-gate"
          ? "降落后滑回停机位"
        : vehicle.mode === "parked"
          ? "飞机已经锁住停好"
      : `飞行坐标 ${Math.round(vehicle.x)} / ${Math.round(vehicle.y)}`;
  const line2 = vehicle.mode === "plane-falling" || vehicle.mode === "landed"
    ? "拖屏幕：上看、下看、左看、右看"
    : vehicle.mode === "taxi-takeoff"
      ? "只滑行，不自动起飞"
    : vehicle.mode === "taxi-ready"
      ? "点“滑行”开始跑"
    : vehicle.mode === "takeoff-roll"
      ? "加速/减速，点起飞才离地"
    : vehicle.mode === "auto-landing"
      ? "自动飞向右边专用降落跑道"
      : vehicle.mode === "landing-rollout"
        ? "长距离滑跑减速，再回停机位"
      : vehicle.mode === "taxi-to-gate"
        ? "自动回到停机位"
      : vehicle.mode === "parked"
        ? "锁住了，点开始可再次飞行"
    : "操纵杆：下拉上升，上推下降";
  ctx.fillText(line1, W - 288, 82);
  ctx.fillText(line2, W - 288, 104);
}

function drawAirportTerminal(x, y, w = 310, h = 220, label = "机场") {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  roundedRect(x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = "#32a7e2";
  const cols = 4;
  const rows = Math.max(2, Math.floor(h / 74));
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      ctx.fillRect(x + 26 + col * ((w - 52) / cols), y + 34 + row * 54, 42, 34);
    }
  }
  ctx.fillStyle = "#172632";
  ctx.font = "900 26px system-ui";
  ctx.fillText(label, x + 34, y + h - 24);
}

function drawHugeAirport() {
  ctx.fillStyle = "#89d06a";
  ctx.fillRect(0, 0, flightWorld.w, flightWorld.h);
  ctx.fillStyle = "#7abf63";
  ctx.beginPath();
  ctx.arc(4250, 1950, 3920, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#83c967";
  ctx.beginPath();
  roundedRect(8060, 1180, 13280, 1420, 24);
  ctx.fill();
  ctx.fillStyle = "#424b57";
  drawRunway(260, 1540, 7920, 190, "起飞/降落长跑道");
  drawRunway(landingRunway.x, landingRunway.y, landingRunway.w, landingRunway.h, "专用降落跑道");
  drawRunway(520, 2180, 7450, 170, "跑道 27R");
  drawRunway(4020, 300, 175, 3000, "跑道 09");
  ctx.strokeStyle = "#2d3742";
  ctx.lineWidth = 58;
  ctx.beginPath();
  ctx.moveTo(360, 1360);
  ctx.lineTo(21380, 1360);
  ctx.lineTo(21380, 2680);
  ctx.lineTo(760, 2680);
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
  return plane;
}

function drawBoardingGate(plane) {
  ctx.fillStyle = "#f7fbff";
  ctx.beginPath();
  roundedRect(plane.x - 108, gateY(plane) - 62, 216, 110, 8);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#32a7e2";
  ctx.fillRect(plane.x - 86, gateY(plane) - 36, 58, 58);
  ctx.fillRect(plane.x + 28, gateY(plane) - 36, 58, 58);
  ctx.fillStyle = "#1678ff";
  for (let i = -88; i <= 88; i += 44) {
    ctx.beginPath();
    ctx.arc(plane.x + i, gateY(plane) + 64, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#172632";
  ctx.font = "900 22px system-ui";
  ctx.fillText("停机位", plane.x - 42, gateY(plane) - 80);
}

function drawTerminalInteriorHall(focusX) {
  const apronX = 420;
  const apronY = 390;
  const apronW = 760;
  const apronH = 3260;
  ctx.save();
  ctx.fillStyle = "rgba(72, 83, 94, 0.82)";
  ctx.beginPath();
  roundedRect(apronX, apronY, apronW, apronH, 8);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 10;
  ctx.stroke();

  ctx.strokeStyle = "#ffd15f";
  ctx.lineWidth = 8;
  ctx.setLineDash([42, 32]);
  ctx.beginPath();
  ctx.moveTo(apronX + apronW - 120, apronY + 70);
  ctx.lineTo(apronX + apronW - 120, apronY + apronH - 70);
  ctx.stroke();
  ctx.setLineDash([]);

  airportPlanes.forEach((plane, index) => {
    ctx.strokeStyle = "rgba(255,255,255,0.78)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    roundedRect(plane.x - 190, plane.y - 72, 380, 144, 8);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "900 24px system-ui";
    ctx.fillText(`停机位 ${index + 1}`, plane.x - 178, plane.y - 88);
  });

  const routePlane = vehicle.mode === "walking" ? getNearestPlane().plane : (airportPlanes[vehicle.selectedPlaneIndex] || airportPlanes[0]);
  const routeX = apronX + apronW - 120;
  const runway = getTakeoffTarget();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(routePlane.x + 195, routePlane.y);
  ctx.lineTo(routeX, routePlane.y);
  ctx.lineTo(routeX, runway.y);
  ctx.lineTo(runway.x, runway.y);
  ctx.stroke();

  ctx.strokeStyle = "#ffd15f";
  ctx.lineWidth = 5;
  ctx.setLineDash([34, 24]);
  ctx.beginPath();
  ctx.moveTo(routePlane.x + 195, routePlane.y);
  ctx.lineTo(routeX, routePlane.y);
  ctx.lineTo(routeX, runway.y);
  ctx.lineTo(runway.x, runway.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";

  ctx.fillStyle = "#172632";
  ctx.font = "900 34px system-ui";
  ctx.fillText("机场停机坪", apronX + 34, apronY - 38);
  ctx.font = "800 23px system-ui";
  ctx.fillText("黑色滑行道只显示当前路线，不会连出一堆线", apronX + 34, apronY - 8);
  ctx.restore();
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
  roundedRect(x, y, 560, 310, 8);
  ctx.fill();
  ctx.fillStyle = "#64717b";
  ctx.fillRect(x + 65, y + 108, 430, 200);
  ctx.fillStyle = "#172632";
  ctx.font = "900 30px system-ui";
  ctx.fillText(label, x + 170, y + 66);
}

function drawOfficeTower(x, y, label, w = 260, h = 620) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  roundedRect(x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = "#32a7e2";
  const rows = Math.floor((h - 110) / 48);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      ctx.fillRect(x + 24 + col * ((w - 48) / 4), y + 36 + row * 48, 34, 28);
    }
  }
  ctx.fillStyle = "#172632";
  ctx.font = "900 28px system-ui";
  ctx.fillText(label, x + 34, y + h - 30);
}

function drawBreakableBuilding(building) {
  if (building.broken) {
    drawCollapsingBuilding(building);
    return;
  }
  if (building.type === "terminal") drawAirportTerminal(building.x, building.y, building.w, building.h, building.label);
  if (building.type === "office") drawOfficeTower(building.x, building.y, building.label, building.w, building.h);
  if (building.type === "hangar") drawHangar(building.x, building.y, building.label);
}

function drawCollapsingBuilding(building) {
  const elapsed = performance.now() - building.brokenAt;
  const collapse = Math.min(1, elapsed / 9000);
  const wave = Math.sin(elapsed * 0.018) * 5;
  const crushY = Math.min(building.h, building.h * (0.08 + collapse * 0.92));
  const standingH = Math.max(0, building.h - crushY);
  ctx.save();
  ctx.translate(building.x, building.y);

  if (standingH > 8) {
    ctx.fillStyle = building.type === "office" ? "#f7fbff" : "#dce5eb";
    ctx.beginPath();
    roundedRect(0, crushY + wave, building.w, standingH, 8);
    ctx.fill();
    ctx.fillStyle = "#32a7e2";
    const rows = Math.floor(standingH / 46);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        ctx.fillRect(24 + col * ((building.w - 48) / 4), crushY + 24 + row * 44 + wave, 34, 24);
      }
    }
    ctx.fillStyle = "#172632";
    ctx.font = "900 28px system-ui";
    ctx.fillText(building.label, 28, building.h - 24);
  }

  ctx.fillStyle = "rgba(220,229,235,0.9)";
  for (let i = 0; i < 13; i += 1) {
    const px = (Math.sin(i * 2.17) * 0.5 + 0.5) * building.w;
    const py = Math.min(building.h - 10, crushY + Math.sin(i + elapsed * 0.003) * 46);
    ctx.beginPath();
    ctx.arc(px, py, 34 + (i % 5) * 12 + collapse * 34, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(23,38,50,0.78)";
  for (let floor = 0; floor < 16; floor += 1) {
    const y = Math.min(building.h - 22, crushY + floor * 12 - collapse * floor * 5);
    const x = 10 + (floor % 4) * 14;
    ctx.fillRect(x, y, building.w - 28 - (floor % 3) * 16, 9);
  }

  ctx.fillStyle = "rgba(255,209,95,0.78)";
  for (let spark = 0; spark < 10; spark += 1) {
    const x = 20 + ((spark * 37) % Math.max(60, building.w - 40));
    const y = Math.min(building.h - 22, crushY + ((spark * 19) % 82));
    ctx.fillRect(x, y, 18, 6);
  }

  ctx.fillStyle = "rgba(23,38,50,0.86)";
  ctx.beginPath();
  ctx.moveTo(0, building.h);
  ctx.lineTo(building.w * 0.18, building.h - 40 - collapse * 90);
  ctx.lineTo(building.w * 0.5, building.h - 18 - collapse * 70);
  ctx.lineTo(building.w * 0.78, building.h - 52 - collapse * 82);
  ctx.lineTo(building.w, building.h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(23,38,50,0.75)";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(building.w * 0.2, crushY - 8);
  ctx.lineTo(building.w * 0.46, Math.min(building.h - 20, crushY + 52));
  ctx.lineTo(building.w * 0.38, Math.min(building.h - 20, crushY + 118));
  ctx.lineTo(building.w * 0.7, building.h - 18);
  ctx.stroke();

  ctx.fillStyle = "#172632";
  ctx.font = "900 30px system-ui";
  ctx.fillText(collapse < 1 ? "一层层往下塌" : "塌成碎块", building.w * 0.1, Math.max(48, crushY - 18));
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
  drawPlaneShape(0, 0, 0, plane.color, false, plane.label, plane.model, plane.tailMark);
  ctx.restore();
}

function drawWalkingPilot(x, y) {
  const step = Math.sin(performance.now() * 0.016) * 22;
  ctx.save();
  ctx.translate(x, y);
  if (vehicle.pilotBall && vehicle.mode === "walking") {
    ctx.rotate(performance.now() * 0.012);
    ctx.fillStyle = "#f5c336";
    ctx.beginPath();
    ctx.arc(0, -5, 76, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.fillStyle = "#ffd7b3";
    ctx.beginPath();
    ctx.ellipse(0, -8, 44, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.beginPath();
    ctx.arc(-17, -18, 7, 0, Math.PI * 2);
    ctx.arc(17, -18, 7, 0, Math.PI * 2);
    ctx.fill();
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
  drawEggyCharacter(0, -30, 1.72, vehicle.pilotVx * 0.02);
  ctx.fillStyle = "#172632";
  ctx.font = "900 48px system-ui";
  ctx.fillText("我", -24, 154);
  ctx.restore();
}

function drawPlaneFallingOverlay() {
  const fallElapsed = performance.now() - vehicle.fallStart;
  const remaining = Math.max(0, Math.ceil((vehicle.fallDuration - fallElapsed) / 1000));
  ctx.save();
  ctx.translate(vehicle.x, vehicle.y - 150);
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  roundedRect(-92, -44, 184, 58, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 30px system-ui";
  ctx.fillText(`飞机 ${remaining}s`, -72, -8);
  ctx.restore();
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

function drawWorldCloudField(focusX, focusY) {
  ctx.save();
  ctx.globalAlpha = 0.62;
  const startX = Math.floor((focusX - 2600) / 820) * 820;
  const endX = focusX + 2600;
  const startY = Math.floor((focusY - 1800) / 520) * 520;
  const endY = focusY + 1800;
  for (let y = startY; y <= endY; y += 520) {
    for (let x = startX; x <= endX; x += 820) {
      const wiggle = Math.sin((x + y) * 0.003 + performance.now() * 0.0008) * 46;
      drawCloud(x + wiggle, y + Math.cos(x * 0.002) * 70, 1.1 + ((Math.abs(x + y) % 5) * 0.12));
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawAirplane(x, y, angle) {
  const plane = airportPlanes[vehicle.selectedPlaneIndex] || airportPlanes[0];
  drawPlaneShape(x, y, angle, plane.color, true, plane.label, plane.model, plane.tailMark, vehicle.bank);
}

function drawPlaneShape(x, y, angle, color, showPilot, label = "", model = "波音737", tailMark = "JET", bank = 0) {
  const bankAmount = Math.max(-0.66, Math.min(0.66, bank));
  const bankDepth = Math.abs(bankAmount);
  const bookScale = 1 - bankDepth * 0.2;
  const liftSide = bankAmount > 0 ? -1 : 1;
  const wingLift = bankAmount * 24;
  const bodyThickness = bankDepth * 12;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (bankDepth > 0.04) {
    ctx.fillStyle = `rgba(23, 38, 50, ${0.07 + bankDepth * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(0, 18 + bankDepth * 10, 178, 24 + bankDepth * 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.scale(1.36, 1.36 * bookScale);
  ctx.transform(1, bankAmount * 0.08, 0, 1, 0, 0);

  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-14, -20);
  ctx.lineTo(-78, -92 + wingLift);
  ctx.lineTo(54, -31 + wingLift * 0.36);
  ctx.lineTo(76, -16 + wingLift * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-14, 20);
  ctx.lineTo(-78, 92 + wingLift);
  ctx.lineTo(54, 31 + wingLift * 0.36);
  ctx.lineTo(76, 16 + wingLift * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-98, -13);
  ctx.lineTo(-148, -50);
  ctx.lineTo(-132, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-98, 13);
  ctx.lineTo(-148, 50);
  ctx.lineTo(-132, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(-124, -22);
  ctx.bezierCurveTo(-58, -34, 62, -31, 122, -7);
  ctx.quadraticCurveTo(146, 0, 122, 7);
  ctx.bezierCurveTo(62, 31, -58, 34, -124, 22);
  ctx.quadraticCurveTo(-148, 0, -124, -22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (bankDepth > 0.06) {
    ctx.fillStyle = `rgba(23, 38, 50, ${0.08 + bankDepth * 0.08})`;
    ctx.beginPath();
    ctx.moveTo(-122, 22);
    ctx.bezierCurveTo(-54, 33 + bodyThickness, 62, 30 + bodyThickness, 121, 8 + bodyThickness);
    ctx.quadraticCurveTo(135, 11 + bodyThickness, 122, 7);
    ctx.bezierCurveTo(62, 31, -58, 34, -124, 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + bankDepth * 0.18})`;
    ctx.beginPath();
    ctx.ellipse(8, liftSide * -11, 118, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(23, 38, 50, ${0.04 + bankDepth * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(0, liftSide * 17, 132, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = color;
  ctx.fillRect(-126, -18, 32, 36);
  ctx.strokeRect(-126, -18, 32, 36);

  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(104, -5, 6, 0, Math.PI * 2);
  ctx.arc(104, 5, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(50,167,226,0.55)";
  for (let wx = -72; wx <= 54; wx += 21) {
    ctx.beginPath();
    ctx.ellipse(wx, -17, 5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(wx, 17, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.textAlign = "center";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#172632";
  ctx.font = "900 18px system-ui";
  ctx.strokeText(model, -2, -4);
  ctx.fillText(model, -2, -4);
  ctx.font = "900 15px system-ui";
  ctx.strokeText(label, -2, 17);
  ctx.fillText(label, -2, 17);
  ctx.fillStyle = "#fff";
  ctx.font = "900 15px system-ui";
  ctx.fillText(tailMark, -110, 5);
  ctx.restore();

  if (showPilot) drawEggyCharacter(16, -52, 0.66, 0);
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
  drawWaterFeature(selectedLocation.variant || 0);
  drawSlideStairs(315, 225);
  drawPoolFloat(vehicle.x, vehicle.y + 35);
  drawEggyCharacter(vehicle.x, vehicle.y - 5, 0.85, vehicle.angle);
}

function drawWaterFeature(variant) {
  if (variant === 0) {
    drawWaterSlide(145, 115);
    drawMegaphoneSlide(560, 170);
    return;
  }
  if (variant === 1) {
    drawWhirlpool(590, 275, 1.2);
    drawWaterSlide(180, 95);
    return;
  }
  if (variant === 2) {
    drawSnakeSlide(150, 120);
    return;
  }
  if (variant === 3) {
    drawMegaphoneSlide(250, 120);
    drawWhirlpool(730, 310, 0.9);
    return;
  }
  drawSnakeSlide(110, 94);
  drawMegaphoneSlide(670, 190);
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

function drawMegaphoneSlide(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#8f5fd9";
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.moveTo(-170, -70);
  ctx.bezierCurveTo(-80, -30, -60, 80, 0, 122);
  ctx.stroke();
  ctx.fillStyle = "#f06aa3";
  ctx.beginPath();
  ctx.ellipse(80, 120, 108, 66, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(80, 120, 58, 34, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 24px system-ui";
  ctx.fillText("大喇叭", 22, 218);
  ctx.restore();
}

function drawWhirlpool(x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 9;
  for (let r = 82; r > 15; r -= 18) {
    ctx.beginPath();
    ctx.arc(0, 0, r, performance.now() * 0.002 + r * 0.03, Math.PI * 1.45 + performance.now() * 0.002 + r * 0.03);
    ctx.stroke();
  }
  ctx.fillStyle = "#172632";
  ctx.font = "900 24px system-ui";
  ctx.fillText("漩涡池", -42, 126);
  ctx.restore();
}

function drawSnakeSlide(x, y) {
  ctx.strokeStyle = "#36a852";
  ctx.lineWidth = 30;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + 150, y - 80, x + 250, y + 80, x + 390, y + 12);
  ctx.bezierCurveTo(x + 520, y - 50, x + 620, y + 135, x + 760, y + 230);
  ctx.stroke();
  ctx.strokeStyle = "#ffd15f";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.fillStyle = "#36a852";
  ctx.beginPath();
  ctx.arc(x + 780, y + 238, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x + 792, y + 228, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 24px system-ui";
  ctx.fillText("蛇形滑道", x + 330, y - 32);
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
  ctx.fillStyle = "#f7fbff";
  ctx.fillRect(0, 58, W, 104);
  ctx.fillStyle = "#172632";
  ctx.font = "900 28px system-ui";
  ctx.fillText(selectedLocation.name, 50, 100);
  ctx.font = "800 18px system-ui";
  ctx.fillText("站台门在前面，进车厢后就是驾驶台，可以控制地铁。", 50, 132);
  ctx.fillStyle = "#172632";
  ctx.fillRect(0, 442, W, 18);
  ctx.fillRect(0, 495, W, 18);
  ctx.fillStyle = "#f2f5f7";
  ctx.fillRect(0, 350, W, 92);
  for (let x = 80; x < W; x += 145) {
    ctx.fillStyle = "#32a7e2";
    ctx.fillRect(x, 360, 70, 68);
    ctx.fillStyle = "#172632";
    ctx.fillRect(x + 34, 360, 4, 68);
    ctx.fillStyle = "#fff";
    ctx.font = "900 12px system-ui";
    ctx.fillText("PSD", x + 22, 398);
  }
  drawMetroTrain(vehicle.x, 452);
  if (vehicle.mode === "in-metro") drawMetroCab();
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

function drawMetroCab() {
  ctx.fillStyle = "rgba(23,38,50,0.92)";
  ctx.beginPath();
  roundedRect(260, 70, 520, 150, 12);
  ctx.fill();
  ctx.fillStyle = "#dce5eb";
  ctx.beginPath();
  roundedRect(300, 92, 440, 62, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 20px system-ui";
  ctx.fillText("驾驶台视角：前方站台门 / 下一站 / 速度", 326, 130);
  ctx.fillStyle = "#ffd15f";
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.arc(340 + i * 78, 184, 17, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFishScene() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#b9f1ff");
  g.addColorStop(1, "#d8fff1");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#25a9df";
  ctx.beginPath();
  ctx.moveTo(0, 350);
  ctx.bezierCurveTo(220, 300, 420, 390, 640, 330);
  ctx.bezierCurveTo(820, 280, 940, 350, W, 320);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 5;
  for (let y = 370; y < 600; y += 42) {
    ctx.beginPath();
    for (let x = 0; x < W; x += 42) ctx.lineTo(x, y + Math.sin(x * 0.025 + performance.now() * 0.005) * 8);
    ctx.stroke();
  }
  ctx.fillStyle = "#36a852";
  ctx.fillRect(0, 270, W, 82);
  drawRiverTree(92, 234);
  drawBench(790, 300);
  drawFishingNet(vehicle.x, 350);
  drawEggyCharacter(vehicle.x - 24, 306, 0.9, 0);
  for (let i = 0; i < 9; i += 1) drawFish(110 + i * 105, 500 + Math.sin(performance.now() * 0.004 + i) * 28, i);
  ["锅", "僵尸蛋", "宝箱"].forEach((label, i) => drawLootBubble(450 + i * 110, 420 + Math.sin(performance.now() * 0.004 + i) * 18, label));
}

function drawFishingNet(x, y) {
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x + 20, y - 48);
  ctx.lineTo(x + 122, y + 58);
  ctx.stroke();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(x + 145, y + 78, 54, 30, 0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fill();
}

function drawRiverTree(x, y) {
  ctx.fillStyle = "#9a6429";
  ctx.fillRect(x - 14, y, 28, 92);
  ctx.fillStyle = "#36a852";
  ctx.beginPath();
  ctx.arc(x, y - 12, 58, 0, Math.PI * 2);
  ctx.arc(x - 36, y + 18, 45, 0, Math.PI * 2);
  ctx.arc(x + 42, y + 18, 45, 0, Math.PI * 2);
  ctx.fill();
}

function drawBench(x, y) {
  ctx.fillStyle = "#9a6429";
  ctx.fillRect(x, y, 150, 18);
  ctx.fillRect(x + 10, y + 34, 132, 16);
  ctx.fillRect(x + 18, y + 50, 10, 46);
  ctx.fillRect(x + 118, y + 50, 10, 46);
  ctx.fillStyle = "#172632";
  ctx.font = "900 20px system-ui";
  ctx.fillText("河边椅子", x + 28, y - 12);
}

function drawLootBubble(x, y, label) {
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.beginPath();
  ctx.arc(x, y, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 18px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y + 6);
  ctx.textAlign = "left";
}

function drawHistoryMemorialScene() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#6fa7c8");
  g.addColorStop(0.55, "#dce5eb");
  g.addColorStop(1, "#f7fbff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  roundedRect(34, 58, 972, 508, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(23,38,50,0.2)";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#172632";
  ctx.font = "900 34px system-ui";
  ctx.fillText("9/11历史纪念馆", 70, 108);
  ctx.font = "800 18px system-ui";
  ctx.fillText("2001年9月11日，美国发生恐怖袭击。这里是安静回顾和纪念，不是闯关游戏。", 72, 142);

  ctx.strokeStyle = "rgba(47,121,200,0.72)";
  ctx.lineWidth = 5;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(58, 250);
  ctx.lineTo(238, 294);
  ctx.moveTo(96, 332);
  ctx.lineTo(322, 318);
  ctx.stroke();
  ctx.setLineDash([]);

  drawMemorialTower(210, 205, 88, 230, "北塔", 0.45);
  drawMemorialTower(324, 230, 88, 205, "南塔", 0.2);
  drawMemorialBeam(252, 188, 0.75);
  drawMemorialBeam(366, 205, 0.68);
  drawAnimatedMemorialPlane();

  ctx.fillStyle = "#22364f";
  ctx.fillRect(142, 438, 350, 18);
  ctx.fillStyle = "#172632";
  ctx.font = "900 18px system-ui";
  ctx.fillText("纪念光柱", 270, 486);

  const cards = [
    ["上午 8:46", "北塔受到撞击"],
    ["上午 9:03", "南塔受到撞击"],
    ["上午 9:20", "应急处置持续进行"],
    ["上午 9:59", "南塔倒塌"],
    ["上午 10:28", "北塔倒塌"]
  ];
  cards.forEach((card, index) => drawTimelineCard(552, 174 + index * 68, card[0], card[1]));

  ctx.fillStyle = "#172632";
  ctx.font = "800 19px system-ui";
  ctx.fillText("按“开始/互动”可以听一声安静的纪念提示。", 552, 542);
  drawEggyCharacter(492 + Math.sin(performance.now() * 0.004) * 6, 500, 0.78, 0);
}

function drawAnimatedMemorialPlane() {
  const seconds = (performance.now() - historyStartTime) / 1000;
  const cycle = Math.min(10, seconds);
  const progress = Math.min(1, cycle / 10);
  const x = 30 + progress * 225;
  const y = 238 + progress * 52;
  drawMemorialPlane(x, y, 0.23, 2.55, "大飞机示意");
  ctx.fillStyle = "#172632";
  ctx.font = "900 24px system-ui";
  ctx.fillText(`大飞机 ${Math.min(10, Math.floor(cycle) + 1)} / 10秒`, 64, 184);
  if (progress >= 1) drawImpactMarker(250, 294);
}

function drawImpactMarker(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(255,209,95,0.9)";
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 14; i += 1) {
    const angle = (Math.PI * 2 * i) / 14;
    const r = i % 2 ? 18 : 40;
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 16px system-ui";
  ctx.fillText("撞击示意", -34, 66);
  ctx.restore();
}

function drawMemorialPlane(x, y, angle, scale = 1, label = "飞机示意") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#f7fbff";
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 54, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#2f79c8";
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(-44, 36);
  ctx.lineTo(24, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-8, -2);
  ctx.lineTo(-38, -32);
  ctx.lineTo(22, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(44, -2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#172632";
  ctx.font = "900 17px system-ui";
  ctx.fillText(label, x - 60, y + 76 * scale);
}

function drawMemorialTower(x, y, w, h, label, delay = 0) {
  const seconds = (performance.now() - historyStartTime) / 1000;
  const collapse = Math.max(0, Math.min(1, (seconds - 10 - delay) / 4));
  const crush = h * collapse;
  ctx.fillStyle = "#dce5eb";
  ctx.beginPath();
  roundedRect(x, y + crush, w, Math.max(18, h - crush), 4);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "rgba(50,167,226,0.45)";
  for (let row = 0; row < Math.floor((h - crush) / 26); row += 1) {
    for (let col = 0; col < 3; col += 1) {
      ctx.fillRect(x + 14 + col * 24, y + crush + 14 + row * 24, 12, 12);
    }
  }
  if (collapse > 0) {
    ctx.fillStyle = "rgba(220,229,235,0.86)";
    for (let i = 0; i < 8; i += 1) {
      const px = x - 20 + (i * 27) % (w + 40);
      const py = y + crush + 8 + Math.sin(i + seconds) * 18;
      ctx.beginPath();
      ctx.arc(px, py, 22 + i * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#172632";
    ctx.font = "900 16px system-ui";
    ctx.fillText("倒塌示意", x - 2, y + Math.min(h + 44, crush + 36));
  }
  ctx.fillStyle = "#172632";
  ctx.font = "900 17px system-ui";
  ctx.fillText(label, x + 22, y + h + 28);
}

function drawMemorialBeam(x, y, alpha) {
  const beam = ctx.createLinearGradient(x, y - 190, x, y + 250);
  beam.addColorStop(0, `rgba(255,255,255,${alpha})`);
  beam.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(x - 28, y + 250);
  ctx.lineTo(x - 8, y - 180);
  ctx.lineTo(x + 22, y - 180);
  ctx.lineTo(x + 42, y + 250);
  ctx.closePath();
  ctx.fill();
}

function drawTimelineCard(x, y, time, text) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  roundedRect(x, y, 402, 58, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(23,38,50,0.16)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#2f79c8";
  ctx.font = "900 23px system-ui";
  ctx.fillText(time, x + 18, y + 37);
  ctx.fillStyle = "#172632";
  ctx.font = "800 20px system-ui";
  ctx.fillText(text, x + 154, y + 37);
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
  const laneNames = ["彩虹跳台", "水上浪桥", "机场风道", "地铁轨道", "夜晚躲避"];
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.beginPath();
  roundedRect(760, 118, 230, 54, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 25px system-ui";
  ctx.fillText(laneNames[laneIndex], 790, 153);
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
  event.preventDefault();
  getAudio();
  const control = button.dataset.control;
  controls.add(control);
  if (event.pointerId !== undefined) controlPointers.set(event.pointerId, control);
  if (button.setPointerCapture && event.pointerId !== undefined) button.setPointerCapture(event.pointerId);
});

document.addEventListener("pointerup", (event) => {
  const control = controlPointers.get(event.pointerId);
  if (!control) return;
  controls.delete(control);
  controlPointers.delete(event.pointerId);
});

document.addEventListener("pointercancel", (event) => {
  if (event.pointerId === undefined) {
    controlPointers.clear();
    controls.clear();
    return;
  }
  const control = controlPointers.get(event.pointerId);
  if (!control) return;
  controls.delete(control);
  controlPointers.delete(event.pointerId);
});

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

function setJoystickFromPoint(clientX, clientY) {
  const rect = flightStick.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const radius = rect.width / 2 - 18;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const limited = Math.min(radius, distance);
  joystickX = (dx / distance) * (limited / radius);
  joystickY = (dy / distance) * (limited / radius);
  updateJoystickVisual();
}

function resetJoystick() {
  joystickPointerId = null;
  joystickTouching = false;
  joystickX = 0;
  joystickY = 0;
  updateJoystickVisual();
}

flightStick.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  getAudio();
  joystickPointerId = event.pointerId;
  if (flightStick.setPointerCapture) flightStick.setPointerCapture(event.pointerId);
  setJoystickFromEvent(event);
});

flightStick.addEventListener("pointermove", (event) => {
  if (event.pointerId !== joystickPointerId) return;
  event.preventDefault();
  setJoystickFromEvent(event);
});

function releaseJoystick(event) {
  if (event.pointerId !== joystickPointerId) return;
  event.preventDefault();
  resetJoystick();
}

flightStick.addEventListener("pointerup", releaseJoystick);
flightStick.addEventListener("pointercancel", releaseJoystick);

flightStick.addEventListener("touchstart", (event) => {
  event.preventDefault();
  getAudio();
  joystickTouching = true;
  const touch = event.changedTouches[0] || event.touches[0];
  if (touch) setJoystickFromPoint(touch.clientX, touch.clientY);
}, { passive: false });

document.addEventListener("touchmove", (event) => {
  if (!joystickTouching) return;
  event.preventDefault();
  const touch = event.changedTouches[0] || event.touches[0];
  if (touch) setJoystickFromPoint(touch.clientX, touch.clientY);
}, { passive: false });

document.addEventListener("touchend", (event) => {
  if (!joystickTouching) return;
  event.preventDefault();
  resetJoystick();
}, { passive: false });

document.addEventListener("touchcancel", (event) => {
  if (!joystickTouching) return;
  event.preventDefault();
  resetJoystick();
}, { passive: false });

function canDragFlightLook() {
  return screen === "activity"
    && selectedLocation.category === "flight"
    && (vehicle.mode === "plane-falling" || vehicle.mode === "landed");
}

function updateFlightLook(clientX, clientY) {
  const zoom = 0.46;
  flightLookOffsetX -= (clientX - flightLookLastX) / zoom;
  flightLookOffsetY -= (clientY - flightLookLastY) / zoom;
  flightLookLastX = clientX;
  flightLookLastY = clientY;
  flightLookOffsetX = Math.max(-2600, Math.min(2600, flightLookOffsetX));
  flightLookOffsetY = Math.max(-2400, Math.min(1800, flightLookOffsetY));
}

canvas.addEventListener("pointerdown", (event) => {
  if (!canDragFlightLook()) return;
  event.preventDefault();
  flightLookDragging = true;
  flightLookPointerId = event.pointerId;
  flightLookLastX = event.clientX;
  flightLookLastY = event.clientY;
  if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!flightLookDragging || event.pointerId !== flightLookPointerId) return;
  event.preventDefault();
  updateFlightLook(event.clientX, event.clientY);
});

function stopFlightLookDrag(event) {
  if (!flightLookDragging || event.pointerId !== flightLookPointerId) return;
  event.preventDefault();
  flightLookDragging = false;
  flightLookPointerId = null;
}

canvas.addEventListener("pointerup", stopFlightLookDrag);
canvas.addEventListener("pointercancel", stopFlightLookDrag);

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
runwayFlightBtn.addEventListener("click", () => {
  if (selectedLocation.category !== "flight" || screen !== "activity") {
    statusText.textContent = "先进入开飞机地点，再点去跑道。";
    return;
  }
  goRunwayPlane();
});
taxiFlightBtn.addEventListener("click", () => {
  if (selectedLocation.category !== "flight" || screen !== "activity") {
    statusText.textContent = "先进入开飞机地点，再点滑行。";
    return;
  }
  if (vehicle.mode === "walking") {
    boardNearestPlane();
    return;
  }
  taxiPlane();
});
accelFlightBtn.addEventListener("click", () => {
  if (selectedLocation.category !== "flight" || screen !== "activity") {
    statusText.textContent = "先进入开飞机地点，再点加速。";
    return;
  }
  adjustPlaneSpeed(2.2);
});
decelFlightBtn.addEventListener("click", () => {
  if (selectedLocation.category !== "flight" || screen !== "activity") {
    statusText.textContent = "先进入开飞机地点，再点减速。";
    return;
  }
  adjustPlaneSpeed(-2.2);
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
crashSongBtn.addEventListener("click", () => {
  getAudio();
  crashSong();
  statusText.textContent = "空难之歌：这是游戏里的原创警报旋律。";
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
