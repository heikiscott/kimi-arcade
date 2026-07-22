import * as THREE from "./assets/three.module.js";

const canvas = document.querySelector("#raceCanvas");
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
const playMusicBtn = document.querySelector("#playMusicBtn");
const chooseMusicBtn = document.querySelector("#chooseMusicBtn");
const musicFileInput = document.querySelector("#musicFileInput");
const musicStatus = document.querySelector("#musicStatus");
const touchControls = [...document.querySelectorAll("[data-drive]")];
const openGlobeBtn = document.querySelector("#openGlobeBtn");
const globeOverlay = document.querySelector("#globeOverlay");
const closeGlobeBtn = document.querySelector("#closeGlobeBtn");
const globeCanvas = document.querySelector("#globeCanvas");
const globeCtx = globeCanvas ? globeCanvas.getContext("2d") : null;
const globeLocationList = document.querySelector("#globeLocationList");
const globePickedText = document.querySelector("#globePickedText");
const useGlobePlaceBtn = document.querySelector("#useGlobePlaceBtn");
const lowPowerMode = window.matchMedia("(max-width: 820px)").matches || /MicroMessenger|iPhone|iPad|Android/i.test(navigator.userAgent);

const tracks = [
  { id: "sky", name: "天上", road: 0xb8d8ff, ground: 0x92d6ff, sky: 0xaee7ff, obstacle: "云墙" },
  { id: "cliff", name: "悬崖飞跃", road: 0xd98a3a, ground: 0x7fcde8, sky: 0x9ed8f0, obstacle: "断崖和飞跃平台" },
  { id: "underground", name: "地下", road: 0x4f5a66, ground: 0x2b2420, sky: 0x151a22, obstacle: "石头" },
  { id: "airport", name: "机场", road: 0x424b57, ground: 0x8fc36e, sky: 0x9ed8f0, obstacle: "路障" },
  { id: "station", name: "火车站", road: 0x787f87, ground: 0xc8b08d, sky: 0xd9e5ea, obstacle: "行李" },
  { id: "ghost", name: "鬼屋", road: 0x453854, ground: 0x251d32, sky: 0x171827, obstacle: "幽灵门" },
  { id: "volcano", name: "火山", road: 0x3b3030, ground: 0x6c2d21, sky: 0xc4552f, obstacle: "岩浆石" }
];

const globePlaces = [
  { name: "济州岛", region: "韩国 · 火山岛", trackId: "sky", lat: 33.5, lon: 126.5, kind: "island" },
  { name: "富国岛", region: "越南 · 海岛度假", trackId: "sky", lat: 10.2, lon: 103.9, kind: "island" },
  { name: "巴厘岛", region: "印度尼西亚 · 热带海岛", trackId: "sky", lat: -8.4, lon: 115.2, kind: "island" },
  { name: "甲米岛", region: "泰国 · 石灰岩海湾", trackId: "cliff", lat: 8.1, lon: 98.9, kind: "island" },
  { name: "普吉岛", region: "泰国 · 海边城市", trackId: "airport", lat: 7.9, lon: 98.4, kind: "island" },
  { name: "马尔代夫", region: "印度洋 · 环礁岛屿", trackId: "sky", lat: 3.2, lon: 73.2, kind: "island" },
  { name: "新加坡樟宜", region: "新加坡 · 机场城市", trackId: "airport", lat: 1.4, lon: 103.9, kind: "city" },
  { name: "香港海港城", region: "中国香港 · 超大商场", trackId: "station", lat: 22.3, lon: 114.2, kind: "mall" },
  { name: "深圳世界之窗", region: "中国深圳 · 城市景点", trackId: "airport", lat: 22.5, lon: 113.9, kind: "city" },
  { name: "东京涩谷", region: "日本 · 城市街区", trackId: "station", lat: 35.7, lon: 139.7, kind: "city" },
  { name: "大阪环球城", region: "日本 · 主题乐园", trackId: "cliff", lat: 34.7, lon: 135.4, kind: "city" },
  { name: "巴黎商场街", region: "法国 · 城市大道", trackId: "station", lat: 48.9, lon: 2.3, kind: "mall" },
  { name: "纽约时代广场", region: "美国 · 高楼城市", trackId: "airport", lat: 40.8, lon: -74.0, kind: "city" },
  { name: "洛杉矶机场区", region: "美国 · 跑道城市", trackId: "airport", lat: 34.0, lon: -118.4, kind: "city" },
  { name: "迪拜购物中心", region: "阿联酋 · 超大商场", trackId: "station", lat: 25.2, lon: 55.3, kind: "mall" },
  { name: "开罗金字塔区", region: "埃及 · 沙漠城市", trackId: "volcano", lat: 30.0, lon: 31.2, kind: "landmark" },
  { name: "伦敦城区", region: "英国 · 城市街景", trackId: "ghost", lat: 51.5, lon: -0.1, kind: "city" },
  { name: "悉尼港湾", region: "澳大利亚 · 海湾城市", trackId: "sky", lat: -33.9, lon: 151.2, kind: "city" },
  { name: "温哥华商场", region: "加拿大 · 海边城市", trackId: "station", lat: 49.3, lon: -123.1, kind: "mall" },
  { name: "马尼拉湾", region: "菲律宾 · 城市海湾", trackId: "sky", lat: 14.6, lon: 121.0, kind: "city" }
];

const cliffJumps = [
  { label: "往左边悬崖飞", short: "左飞", dx: -6.8, lift: 0.15, dz: 2.7 },
  { label: "往右边悬崖飞", short: "右飞", dx: 6.8, lift: 0.15, dz: 2.7 },
  { label: "往上方左边悬崖飞", short: "上左", dx: -5.2, lift: 1.35, dz: 2.5 },
  { label: "往上方右边悬崖飞", short: "上右", dx: 5.2, lift: 1.35, dz: 2.5 },
  { label: "往下方前面悬崖飞", short: "下前", dx: 0.8, lift: -1.0, dz: 3.2 },
  { label: "直走飞到前面悬崖", short: "直飞", dx: 0, lift: 0.35, dz: 3.5 },
  { label: "往下面左边悬崖飞", short: "下左", dx: -4.8, lift: -0.85, dz: 3.0 },
  { label: "往下面右边悬崖飞", short: "下右", dx: 4.8, lift: -0.85, dz: 3.0 }
];

const cars = [
  { id: "kart", name: "经典卡丁车", color: 0xd93a32, speed: 1.04, shape: "kart" },
  { id: "gliderKart", name: "滑翔卡丁车", color: 0xf08a2d, speed: 1.03, shape: "glider" },
  { id: "sport", name: "蓝色跑车", color: 0x245b8f, speed: 1.02, shape: "sport" },
  { id: "bike", name: "摩托赛车", color: 0xd93a32, speed: 1.06, shape: "bike" },
  { id: "tesla", name: "电动车", color: 0xf4f7fa, speed: 1.0, shape: "electric" },
  { id: "offroad", name: "越野车", color: 0x39a657, speed: 0.94, shape: "offroad" }
];

const drivers = [
  { id: "mario", name: "马里奥", color: 0xd93a32, hat: "M", avatar: "mario" },
  { id: "luigi", name: "路易吉", color: 0x39a657, hat: "L", avatar: "luigi" },
  { id: "princess", name: "桃子公主", color: 0xd94a78, hat: "P", avatar: "princess" },
  { id: "bowser", name: "坏乌龟", color: 0xf08a2d, hat: "B", avatar: "bowser" },
  { id: "ghost", name: "幽灵", color: 0xf4f7fa, hat: "G", avatar: "ghost" },
  { id: "mushroom", name: "蘑菇", color: 0xffffff, hat: "T", avatar: "mushroom" },
  { id: "star", name: "星星", color: 0xffd15f, hat: "★", avatar: "star" },
  { id: "yoshi", name: "耀西", color: 0x39a657, hat: "Y", avatar: "yoshi" }
];

const tires = [
  { id: "standard", name: "标准黑胎", grip: 1, radius: 0.34, width: 0.34, rim: 0xffd15f },
  { id: "gold", name: "金圈轮胎", grip: 1.05, radius: 0.36, width: 0.36, rim: 0xffd15f },
  { id: "monster", name: "怪兽大轮胎", grip: 0.86, radius: 0.48, width: 0.44, rim: 0xd9e2ea },
  { id: "drift", name: "漂移轮胎", grip: 1.14, radius: 0.32, width: 0.42, rim: 0x2f79c8 },
  { id: "slick", name: "高速光头胎", grip: 1.2, radius: 0.31, width: 0.32, rim: 0xf4f7fa }
];

const wings = [
  { id: "none", name: "无翅膀" },
  { id: "small", name: "小翅膀" },
  { id: "glider", name: "红色滑翔翼" },
  { id: "plane", name: "飞机翼" },
  { id: "rocket", name: "火箭翼" },
  { id: "cloud", name: "云朵翼" }
];

const icons = ["M", "L", "Y", "闪", "星", "1"];
const keys = new Set();
const pressed = new Set();
const totalLaps = 3;

let selectedTrack = tracks[0];
let selectedStars = 1;
let selectedCar = cars[0];
let selectedDriver = drivers[0];
let selectedTire = tires[0];
let selectedWing = wings[0];
let selectedIcon = icons[0];
let selectedGlobePlace = globePlaces[0];
let globeMarkers = [];
let running = false;
let won = false;
let gameOver = false;
let distance = 0;
let speed = 0;
let laneX = 0;
let vertical = 0;
let verticalVelocity = 0;
let flyTimer = 0;
let lastTime = performance.now();
let audioContext = null;
const DEFAULT_RACE_MUSIC_URL = "assets/racing-user-music.m4a?v=music-lite-20260722";
const FALLBACK_RACE_MUSIC_URL = "assets/racing-user-music.mp4?v=20260722";
let raceMusic = new Audio(DEFAULT_RACE_MUSIC_URL);
let raceMusicName = "你发来的视频音乐";
let localMusicUrl = null;
let triedMusicFallback = false;

raceMusic.loop = true;
raceMusic.volume = 0.66;
raceMusic.preload = "auto";
raceMusic.load();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPowerMode, powerPreference: "high-performance" });
renderer.setPixelRatio(lowPowerMode ? 1 : Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = !lowPowerMode;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 16 / 9, 0.1, 900);
camera.position.set(0, 8.5, 13.5);

const hemi = new THREE.HemisphereLight(0xffffff, 0x62735c, 1.2);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(-16, 28, 20);
sun.castShadow = !lowPowerMode;
sun.shadow.mapSize.set(lowPowerMode ? 512 : 1024, lowPowerMode ? 512 : 1024);
scene.add(sun);

const world = new THREE.Group();
scene.add(world);
const roadGroup = new THREE.Group();
world.add(roadGroup);
const sceneGroup = new THREE.Group();
world.add(sceneGroup);
const pickupGroup = new THREE.Group();
world.add(pickupGroup);

const playerCar = createCar(0xd93a32, "M", true);
scene.add(playerCar);

const rivalCars = [];
const obstacles = [];
const coins = [];
const roadSegments = [];
let finishLine = null;

function mat(color, roughness = 0.75) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

function box(w, h, d, color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  mesh.castShadow = !lowPowerMode;
  mesh.receiveShadow = !lowPowerMode;
  return mesh;
}

function cyl(r1, r2, h, color, radial = 28) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, radial), mat(color));
  mesh.castShadow = !lowPowerMode;
  mesh.receiveShadow = !lowPowerMode;
  return mesh;
}

function sphere(r, color, sx = 1, sy = 1, sz = 1) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 26, 16), mat(color));
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = !lowPowerMode;
  mesh.receiveShadow = !lowPowerMode;
  return mesh;
}

function makeLabel(text) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 96;
  const g = c.getContext("2d");
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = "#172632";
  g.font = "900 42px system-ui";
  g.textAlign = "center";
  g.fillText(text, 128, 62);
  const texture = new THREE.CanvasTexture(c);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  return new THREE.Mesh(new THREE.PlaneGeometry(4.8, 1.8), material);
}

function createCar(color, label, isPlayer = false, carSpec = selectedCar) {
  const group = new THREE.Group();
  const tireSpec = isPlayer ? selectedTire : tires[0];
  const shape = carSpec.shape || "kart";
  if (shape === "bike") {
    const frame = cyl(0.16, 0.2, 2.7, color, 18);
    frame.rotation.x = Math.PI / 2;
    frame.position.set(0, 0.64, -0.15);
    const seat = box(0.82, 0.22, 0.68, 0x172632);
    seat.position.set(0, 0.96, 0.28);
    const front = sphere(0.34, color, 1, 0.65, 1.2);
    front.position.set(0, 0.76, -1.42);
    group.add(frame, seat, front);
  } else {
    const bodyLength = shape === "sport" || shape === "electric" ? 3.65 : 3.15;
    const bodyWidth = shape === "offroad" ? 2.35 : 2.15;
    const bodyHeight = shape === "offroad" ? 0.72 : 0.55;
    const body = box(bodyWidth, bodyHeight, bodyLength, color);
    body.position.y = 0.58;
    const cabin = box(shape === "kart" || shape === "glider" ? 1.05 : 1.28, 0.62, shape === "kart" || shape === "glider" ? 1.1 : 1.35, isPlayer ? 0xffffff : 0xdce5eb);
    cabin.position.set(0, 1.06, -0.2);
    const nose = box(bodyWidth * 0.8, 0.32, shape === "kart" || shape === "glider" ? 0.92 : 1.12, color);
    nose.position.set(0, 0.72, -bodyLength / 2 - 0.28);
    group.add(body, cabin, nose);
    if (shape === "glider") {
      const rearFin = box(1.8, 0.12, 0.42, 0xffd15f);
      rearFin.position.set(0, 1.08, 1.48);
      group.add(rearFin);
    }
    if (shape === "offroad") {
      const bumper = box(2.7, 0.25, 0.22, 0x172632);
      bumper.position.set(0, 0.58, -2.05);
      group.add(bumper);
    }
  }
  const steering = new THREE.Group();
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 8, 24), mat(0x172632));
  wheel.rotation.x = Math.PI / 2;
  const stick = cyl(0.035, 0.035, 0.45, 0x424b57, 12);
  stick.rotation.x = 0.65;
  stick.position.set(0, -0.16, 0.12);
  steering.position.set(0, 1.08, -0.95);
  steering.add(wheel, stick);
  group.add(steering);
  [-0.95, 0.95].forEach((x) => {
    [-1.1, 1.0].forEach((z) => {
      const spread = shape === "bike" ? 0.52 : 1;
      const tire = cyl(tireSpec.radius, tireSpec.radius, tireSpec.width, 0x172632, 30);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(x * spread, tireSpec.radius, shape === "bike" ? z * 1.28 : z);
      const rim = cyl(tireSpec.radius * 0.48, tireSpec.radius * 0.48, tireSpec.width + 0.02, tireSpec.rim, 24);
      rim.rotation.z = Math.PI / 2;
      rim.position.copy(tire.position);
      group.add(tire, rim);
    });
  });
  const badge = makeLabel(label);
  badge.scale.setScalar(0.36);
  badge.position.set(0, 1.42, -0.18);
  badge.rotation.x = -0.25;
  group.add(badge);
  if (isPlayer) {
    const driver = createDriver();
    driver.position.set(0, 1.58, -0.25);
    group.add(driver);
  }
  return group;
}

function createDriver() {
  const group = new THREE.Group();
  if (selectedDriver.id === "ghost") {
    const ghost = sphere(0.35, 0xf4f7fa, 0.9, 1.15, 0.72);
    ghost.position.y = 0.22;
    const eyeL = sphere(0.035, 0x172632);
    const eyeR = sphere(0.035, 0x172632);
    eyeL.position.set(-0.11, 0.36, -0.26);
    eyeR.position.set(0.11, 0.36, -0.26);
    group.add(ghost, eyeL, eyeR);
    return group;
  }
  if (selectedDriver.id === "star") {
    const star = makeStarMesh(0xffd15f);
    star.scale.setScalar(0.42);
    star.position.y = 0.24;
    const eyeL = sphere(0.03, 0x172632);
    const eyeR = sphere(0.03, 0x172632);
    eyeL.position.set(-0.1, 0.3, -0.08);
    eyeR.position.set(0.1, 0.3, -0.08);
    group.add(star, eyeL, eyeR);
    return group;
  }
  if (selectedDriver.id === "mushroom") {
    const face = sphere(0.22, 0xffead2, 1, 0.9, 0.8);
    face.position.y = 0.18;
    const cap = sphere(0.34, 0xd93a32, 1.28, 0.52, 1);
    cap.position.y = 0.42;
    const spot = sphere(0.08, 0xffffff, 1, 0.35, 1);
    spot.position.set(0, 0.5, -0.19);
    group.add(face, cap, spot);
    return group;
  }
  if (selectedDriver.id === "yoshi") {
    const head = sphere(0.27, 0x39a657, 0.92, 1.05, 1);
    head.position.y = 0.32;
    const snout = sphere(0.16, 0xffead2, 1.15, 0.72, 0.9);
    snout.position.set(0, 0.28, -0.24);
    const crest = sphere(0.07, 0xd93a32);
    crest.position.set(0, 0.58, 0.03);
    const body = cyl(0.2, 0.26, 0.5, 0x39a657, 20);
    body.position.y = -0.05;
    group.add(head, snout, crest, body);
    return group;
  }
  const head = sphere(0.25, selectedDriver.id === "bowser" ? 0xf3b15e : 0xffd6b0);
  head.position.y = 0.32;
  const bodyColor = selectedDriver.id === "mario" || selectedDriver.id === "luigi" ? 0x245b8f : selectedDriver.color;
  const body = cyl(0.22, 0.28, 0.52, bodyColor, 20);
  body.position.y = -0.05;
  group.add(head, body);
  if (selectedDriver.id === "princess") {
    const hair = sphere(0.28, 0xffd15f, 1.12, 0.62, 0.9);
    hair.position.y = 0.38;
    const crown = cyl(0.18, 0.28, 0.2, 0xffd15f, 5);
    crown.position.y = 0.64;
    group.add(hair, crown);
  } else if (selectedDriver.id === "bowser") {
    const shell = sphere(0.3, 0x39a657, 1.05, 0.72, 0.8);
    shell.position.set(0, 0.03, 0.2);
    const hornL = cyl(0.04, 0.09, 0.22, 0xffffff, 12);
    const hornR = hornL.clone();
    hornL.position.set(-0.18, 0.58, -0.02);
    hornR.position.set(0.18, 0.58, -0.02);
    group.add(shell, hornL, hornR);
  } else {
    const hat = cyl(0.28, 0.24, 0.18, selectedDriver.color, 24);
    hat.position.y = 0.55;
    const label = makeLabel(selectedDriver.hat);
    label.scale.setScalar(0.18);
    label.position.set(0, 0.62, -0.22);
    group.add(hat, label);
    if (selectedDriver.id === "mario" || selectedDriver.id === "luigi") {
      const nose = sphere(0.08, 0xffc08d, 1, 0.9, 0.9);
      nose.position.set(0, 0.31, -0.25);
      const mustache = box(0.24, 0.035, 0.04, 0x172632);
      mustache.position.set(0, 0.22, -0.27);
      const shirt = box(0.38, 0.18, 0.18, selectedDriver.color);
      shirt.position.set(0, 0.02, -0.05);
      group.add(nose, mustache, shirt);
    }
  }
  return group;
}

function makeStarMesh(color) {
  const shape = new THREE.Shape();
  const points = 10;
  for (let i = 0; i < points; i += 1) {
    const r = i % 2 === 0 ? 1 : 0.46;
    const a = -Math.PI / 2 + (i / points) * Math.PI * 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: false }), mat(color));
  mesh.rotation.x = Math.PI;
  mesh.rotation.z = Math.PI;
  mesh.castShadow = !lowPowerMode;
  return mesh;
}

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

function makeVisualButtons(container, items, kind, isActive, onPick) {
  container.innerHTML = "";
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `option-card ${kind}-option ${kind}-${item.id}`;
    button.classList.toggle("active", isActive(item));
    const preview = document.createElement("span");
    preview.className = `option-preview ${kind}-preview`;
    preview.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.className = "option-name";
    name.textContent = item.name;
    button.append(preview, name);
    button.addEventListener("click", () => {
      onPick(item);
      drawMenu();
    });
    container.append(button);
  });
}

function makeDriverButtons() {
  driverChoices.innerHTML = "";
  drivers.forEach((driver) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "driver-button";
    button.classList.toggle("active", driver === selectedDriver);
    const avatar = document.createElement("span");
    avatar.className = `driver-avatar ${driver.avatar}`;
    avatar.setAttribute("aria-hidden", "true");
    avatar.innerHTML = driverAvatarMarkup(driver);
    const name = document.createElement("span");
    name.textContent = driver.name;
    button.append(avatar, name);
    button.addEventListener("click", () => {
      selectedDriver = driver;
      refreshPlayerCar();
      drawMenu();
    });
    driverChoices.append(button);
  });
}

function driverAvatarMarkup(driver) {
  if (driver.avatar === "princess") return "<b></b><i></i><em></em><small></small>";
  if (driver.avatar === "bowser") return "<b></b><i></i><em></em><small></small>";
  if (driver.avatar === "ghost") return "<b></b><i></i><em></em>";
  if (driver.avatar === "mushroom") return "<b></b><i></i><em></em>";
  if (driver.avatar === "star") return "<b>★</b>";
  if (driver.avatar === "yoshi") return "<b></b><i></i><em></em><small></small>";
  return `<b>${driver.hat}</b><i></i><em></em>`;
}

function drawMenu() {
  makeVisualButtons(trackChoices, tracks, "track", (track) => track === selectedTrack, (track) => {
    selectedTrack = track;
    rebuildWorld();
  });
  makeButtons(starChoices, [1, 2, 3, 4], (star) => `${"★".repeat(star)}${"☆".repeat(4 - star)}`, (star) => star === selectedStars, (star) => {
    selectedStars = star;
    rebuildWorld();
  });
  makeVisualButtons(carChoices, cars, "car", (car) => car === selectedCar, (car) => {
    selectedCar = car;
    refreshPlayerCar();
  });
  makeDriverButtons();
  makeVisualButtons(tireChoices, tires, "tire", (tire) => tire === selectedTire, (tire) => {
    selectedTire = tire;
    refreshPlayerCar();
  });
  makeVisualButtons(wingChoices, wings, "wing", (wing) => wing === selectedWing, (wing) => {
    selectedWing = wing;
    updateWings();
  });
  makeButtons(iconChoices, icons, (icon) => icon, (icon) => icon === selectedIcon, (icon) => {
    selectedIcon = icon;
    refreshPlayerCar();
  });
  render();
}

function trackById(id) {
  return tracks.find((track) => track.id === id) || tracks[0];
}

function openGlobeMap() {
  if (!globeOverlay) return;
  globeOverlay.hidden = false;
  resizeGlobeCanvas();
  renderGlobeLocations();
  drawGlobeMap(performance.now());
}

function closeGlobeMap() {
  if (globeOverlay) globeOverlay.hidden = true;
}

function applyGlobePlace(place = selectedGlobePlace) {
  selectedGlobePlace = place;
  selectedTrack = trackById(place.trackId);
  statusEl.textContent = `电子地球仪选中了：${place.name}。现在切到 ${selectedTrack.name} 风格赛道。`;
  rebuildWorld();
  drawMenu();
  renderGlobeLocations();
  drawGlobeMap(performance.now());
}

function renderGlobeLocations() {
  if (!globeLocationList) return;
  globeLocationList.innerHTML = "";
  globePlaces.forEach((place) => {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.toggle("active", place === selectedGlobePlace);
    button.innerHTML = `${place.name}<span>${place.region}</span>`;
    button.addEventListener("click", () => {
      selectedGlobePlace = place;
      applyGlobePlace(place);
    });
    globeLocationList.append(button);
  });
  if (globePickedText && selectedGlobePlace) {
    globePickedText.textContent = `${selectedGlobePlace.name} · ${selectedGlobePlace.region} · 对应 ${trackById(selectedGlobePlace.trackId).name} 赛道。`;
  }
}

function resizeGlobeCanvas() {
  if (!globeCanvas) return;
  const rect = globeCanvas.getBoundingClientRect();
  const ratio = lowPowerMode ? 1 : Math.min(window.devicePixelRatio, 1.5);
  const width = Math.max(360, Math.floor(rect.width * ratio));
  const height = Math.max(300, Math.floor(rect.height * ratio));
  if (globeCanvas.width !== width || globeCanvas.height !== height) {
    globeCanvas.width = width;
    globeCanvas.height = height;
  }
}

function projectGlobePoint(place, cx, cy, radius, rotation) {
  const lat = THREE.MathUtils.degToRad(place.lat);
  const lon = THREE.MathUtils.degToRad(place.lon) + rotation;
  const front = Math.cos(lat) * Math.cos(lon);
  return {
    x: cx + radius * Math.cos(lat) * Math.sin(lon),
    y: cy - radius * Math.sin(lat),
    front
  };
}

function drawGlobeMap(now) {
  if (!globeCtx || !globeOverlay || globeOverlay.hidden) return;
  resizeGlobeCanvas();
  const g = globeCtx;
  const w = globeCanvas.width;
  const h = globeCanvas.height;
  const cx = w * 0.36;
  const cy = h * 0.5;
  const radius = Math.min(w * 0.28, h * 0.42);
  const rotation = now * 0.00008;
  globeMarkers = [];

  g.clearRect(0, 0, w, h);
  const bg = g.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#061421");
  bg.addColorStop(0.55, "#0d2d44");
  bg.addColorStop(1, "#13263a");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);

  for (let i = 0; i < 70; i += 1) {
    const x = (i * 97 + Math.sin(now * 0.0003 + i) * 14) % w;
    const y = (i * 53) % h;
    g.fillStyle = i % 5 ? "rgba(255,255,255,0.45)" : "rgba(255,209,95,0.55)";
    g.beginPath();
    g.arc(x, y, i % 5 === 0 ? 2.2 : 1.2, 0, Math.PI * 2);
    g.fill();
  }

  const glow = g.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.25);
  glow.addColorStop(0, "rgba(95, 209, 255, 0.24)");
  glow.addColorStop(1, "rgba(95, 209, 255, 0)");
  g.fillStyle = glow;
  g.beginPath();
  g.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
  g.fill();

  const globe = g.createRadialGradient(cx - radius * 0.28, cy - radius * 0.34, radius * 0.1, cx, cy, radius);
  globe.addColorStop(0, "#b7efff");
  globe.addColorStop(0.42, "#32a7e2");
  globe.addColorStop(1, "#104e82");
  g.fillStyle = globe;
  g.beginPath();
  g.arc(cx, cy, radius, 0, Math.PI * 2);
  g.fill();

  g.save();
  g.beginPath();
  g.arc(cx, cy, radius, 0, Math.PI * 2);
  g.clip();
  g.globalAlpha = 0.42;
  g.strokeStyle = "#d7f8ff";
  g.lineWidth = Math.max(1, radius * 0.006);
  for (let i = -60; i <= 60; i += 30) {
    const y = cy - Math.sin(THREE.MathUtils.degToRad(i)) * radius;
    const scale = Math.cos(THREE.MathUtils.degToRad(i));
    g.beginPath();
    g.ellipse(cx, y, radius * scale, radius * 0.12 * scale, 0, 0, Math.PI * 2);
    g.stroke();
  }
  for (let i = 0; i < 12; i += 1) {
    g.beginPath();
    g.ellipse(cx, cy, radius * Math.abs(Math.cos(i * Math.PI / 12)), radius, 0, 0, Math.PI * 2);
    g.stroke();
  }
  g.globalAlpha = 0.72;
  drawContinentBlob(g, cx, cy, radius, rotation, [
    [-125, 50], [-96, 45], [-78, 25], [-63, -8], [-48, -24], [-71, -45], [-90, -18], [-111, 10]
  ]);
  drawContinentBlob(g, cx, cy, radius, rotation, [
    [-10, 58], [30, 54], [74, 36], [108, 16], [123, -8], [96, -32], [48, -24], [28, 2], [-8, 4], [-24, 34]
  ]);
  drawContinentBlob(g, cx, cy, radius, rotation, [
    [112, -10], [153, -17], [150, -39], [118, -43], [105, -27]
  ]);
  g.restore();

  g.strokeStyle = "rgba(255,255,255,0.78)";
  g.lineWidth = Math.max(2, radius * 0.01);
  g.beginPath();
  g.arc(cx, cy, radius, 0, Math.PI * 2);
  g.stroke();

  globePlaces.forEach((place) => {
    const point = projectGlobePoint(place, cx, cy, radius, rotation);
    const visible = point.front > -0.18;
    if (!visible) return;
    const active = place === selectedGlobePlace;
    const size = active ? radius * 0.04 : radius * 0.026;
    g.globalAlpha = THREE.MathUtils.clamp((point.front + 0.18) / 1.18, 0.3, 1);
    g.fillStyle = active ? "#ffd15f" : place.kind === "mall" ? "#f06aa3" : "#ffffff";
    g.strokeStyle = "#172632";
    g.lineWidth = Math.max(2, radius * 0.007);
    g.beginPath();
    g.arc(point.x, point.y, size, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    if (active || point.front > 0.65) {
      g.font = `900 ${Math.max(15, radius * 0.055)}px system-ui`;
      g.fillStyle = "#ffffff";
      g.strokeStyle = "rgba(6,18,28,0.78)";
      g.lineWidth = 4;
      g.strokeText(place.name, point.x + size + 6, point.y - size);
      g.fillText(place.name, point.x + size + 6, point.y - size);
    }
    globeMarkers.push({ place, x: point.x, y: point.y, r: Math.max(18, size * 1.6) });
  });
  g.globalAlpha = 1;

  drawSelectedPlaceScene(g, w, h);
}

function drawContinentBlob(g, cx, cy, radius, rotation, coords) {
  g.fillStyle = "#39a657";
  g.beginPath();
  coords.forEach(([lon, lat], index) => {
    const p = projectGlobePoint({ lon, lat }, cx, cy, radius, rotation);
    if (index === 0) g.moveTo(p.x, p.y);
    else g.lineTo(p.x, p.y);
  });
  g.closePath();
  g.fill();
}

function drawSelectedPlaceScene(g, w, h) {
  const place = selectedGlobePlace || globePlaces[0];
  const x = w * 0.68;
  const y = h * 0.18;
  const sw = w * 0.27;
  const sh = h * 0.62;
  g.fillStyle = "rgba(255,255,255,0.1)";
  g.strokeStyle = "rgba(255,255,255,0.42)";
  g.lineWidth = 2;
  roundRect(g, x, y, sw, sh, 18);
  g.fill();
  g.stroke();

  const horizon = y + sh * 0.66;
  g.fillStyle = place.kind === "island" ? "#1fa7c9" : place.kind === "mall" ? "#7c6bd8" : "#245b8f";
  roundRect(g, x + sw * 0.08, horizon, sw * 0.84, sh * 0.18, 12);
  g.fill();

  if (place.kind === "island") {
    g.fillStyle = "#ffd15f";
    g.beginPath();
    g.ellipse(x + sw * 0.48, horizon + sh * 0.05, sw * 0.28, sh * 0.06, -0.08, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#172632";
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(x + sw * 0.48, horizon + sh * 0.02);
    g.quadraticCurveTo(x + sw * 0.55, y + sh * 0.42, x + sw * 0.65, y + sh * 0.34);
    g.stroke();
    g.fillStyle = "#39a657";
    for (let i = 0; i < 5; i += 1) {
      g.beginPath();
      g.ellipse(x + sw * 0.65, y + sh * 0.34, sw * 0.12, sh * 0.025, i * 0.7, 0, Math.PI * 2);
      g.fill();
    }
  } else if (place.kind === "mall") {
    for (let i = 0; i < 4; i += 1) {
      g.fillStyle = ["#f7fbff", "#ffd15f", "#f06aa3", "#32a7e2"][i];
      roundRect(g, x + sw * (0.16 + i * 0.17), y + sh * (0.28 + (i % 2) * 0.08), sw * 0.13, sh * 0.35, 8);
      g.fill();
    }
  } else {
    for (let i = 0; i < 7; i += 1) {
      const bh = sh * (0.22 + (i % 4) * 0.08);
      g.fillStyle = ["#f7fbff", "#32a7e2", "#ffd15f", "#d93a32"][i % 4];
      roundRect(g, x + sw * (0.1 + i * 0.11), horizon - bh, sw * 0.08, bh, 6);
      g.fill();
    }
  }

  g.fillStyle = "#ffffff";
  g.font = `950 ${Math.max(22, w * 0.024)}px system-ui`;
  g.fillText(place.name, x + sw * 0.08, y + sh * 0.13);
  g.font = `850 ${Math.max(14, w * 0.014)}px system-ui`;
  g.fillStyle = "rgba(255,255,255,0.82)";
  g.fillText(place.region, x + sw * 0.08, y + sh * 0.21);
  g.fillText(`赛车风格：${trackById(place.trackId).name}`, x + sw * 0.08, y + sh * 0.91);
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function refreshPlayerCar() {
  while (playerCar.children.length) playerCar.remove(playerCar.children[0]);
  const fresh = createCar(selectedCar.color, selectedIcon, true);
  fresh.children.forEach((child) => playerCar.add(child.clone()));
  updateWings();
}

function updateWings() {
  const old = playerCar.getObjectByName("wing-set");
  if (old) playerCar.remove(old);
  if (selectedWing.id === "none") return;
  const wingsGroup = new THREE.Group();
  wingsGroup.name = "wing-set";
  if (selectedWing.id === "glider") {
    const canopy = box(4.7, 0.1, 1.35, 0xd93a32);
    canopy.position.set(0, 2.12, 0.75);
    canopy.rotation.x = -0.18;
    const leftStripe = box(1.1, 0.12, 1.42, 0xffd15f);
    const rightStripe = leftStripe.clone();
    leftStripe.position.set(-1.55, 2.15, 0.74);
    rightStripe.position.set(1.55, 2.15, 0.74);
    leftStripe.rotation.x = canopy.rotation.x;
    rightStripe.rotation.x = canopy.rotation.x;
    const mast = cyl(0.045, 0.045, 1.2, 0x172632, 12);
    mast.position.set(0, 1.55, 0.4);
    const back = box(1.4, 0.12, 0.26, 0x172632);
    back.position.set(0, 1.32, 1.45);
    wingsGroup.add(canopy, leftStripe, rightStripe, mast, back);
  } else if (selectedWing.id === "rocket") {
    [-1.35, 1.35].forEach((x) => {
      const body = cyl(0.16, 0.16, 1.25, 0xd9e2ea, 18);
      body.rotation.x = Math.PI / 2;
      body.position.set(x, 0.88, 1.4);
      const nose = cyl(0.02, 0.16, 0.28, 0xd93a32, 18);
      nose.rotation.x = Math.PI / 2;
      nose.position.set(x, 0.88, 0.62);
      const flame = cyl(0.05, 0.22, 0.45, 0xff8a2a, 18);
      flame.rotation.x = Math.PI / 2;
      flame.position.set(x, 0.88, 2.18);
      wingsGroup.add(body, nose, flame);
    });
  } else if (selectedWing.id === "cloud") {
    [-1.45, -0.95, 0.95, 1.45].forEach((x, index) => {
      const puff = sphere(index % 2 ? 0.28 : 0.34, 0xf4f7fa, 1.2, 0.75, 0.9);
      puff.position.set(x, 1.08 + (index % 2) * 0.12, 1.22);
      wingsGroup.add(puff);
    });
  } else {
    const span = selectedWing.id === "plane" ? 4.8 : 2.8;
    const color = selectedWing.id === "plane" ? 0xf4f7fa : 0xffd15f;
    const left = box(span / 2, 0.09, selectedWing.id === "plane" ? 0.72 : 0.48, color);
    const right = box(span / 2, 0.09, selectedWing.id === "plane" ? 0.72 : 0.48, color);
    left.position.set(-span / 4 - 0.35, 1.05, 0.42);
    right.position.set(span / 4 + 0.35, 1.05, 0.42);
    left.rotation.z = 0.08;
    right.rotation.z = -0.08;
    const tail = box(0.6, 0.08, 0.5, 0xd93a32);
    tail.position.set(0, 1.2, 1.48);
    tail.rotation.x = 0.25;
    wingsGroup.add(left, right, tail);
  }
  playerCar.add(wingsGroup);
}

function getAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playRaceMusic() {
  if (!raceMusic) return;
  raceMusic.loop = true;
  raceMusic.volume = 0.66;
  const playPromise = raceMusic.play();
  if (playPromise && typeof playPromise.then === "function") {
    playPromise.then(() => {
      if (musicStatus) musicStatus.textContent = `正在播放：${raceMusicName}`;
    }).catch(() => {
      if (musicStatus) musicStatus.textContent = "手机拦截了自动播放，请点“播放视频音乐”。";
    });
  }
}

function stopRaceMusic() {
  if (!raceMusic) return;
  raceMusic.pause();
}

function setRaceMusicSource(url, name) {
  stopRaceMusic();
  triedMusicFallback = url === FALLBACK_RACE_MUSIC_URL;
  raceMusic.src = url;
  raceMusicName = name;
  raceMusic.preload = "auto";
  raceMusic.load();
  if (musicStatus) musicStatus.textContent = `已选择：${name}`;
}

raceMusic.addEventListener("error", () => {
  if (!triedMusicFallback && raceMusic.src.includes("racing-user-music.m4a")) {
    triedMusicFallback = true;
    setRaceMusicSource(FALLBACK_RACE_MUSIC_URL, "你发来的视频音乐");
    if (musicStatus) musicStatus.textContent = "轻量音乐没加载成功，已切回原视频音乐。";
    return;
  }
  if (musicStatus) musicStatus.textContent = "没有找到音乐文件，可以点“选择本地音乐”。";
});

function playTone(freq, start, duration, gainValue = 0.035, type = "square") {
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

function playFinish() {
  [523, 659, 784, 1046, 1318].forEach((note, index) => playTone(note, index * 0.15, 0.12, 0.05));
}

function raceGoalDistance() {
  return lapDistance() * totalLaps;
}

function lapDistance() {
  return 5200 + selectedStars * 1200;
}

function currentLap() {
  return Math.min(totalLaps, Math.floor(distance / lapDistance()) + 1);
}

function rebuildWorld() {
  roadGroup.clear();
  sceneGroup.clear();
  pickupGroup.clear();
  rivalCars.length = 0;
  obstacles.length = 0;
  coins.length = 0;
  roadSegments.length = 0;
  scene.background = new THREE.Color(selectedTrack.sky);
  scene.fog = new THREE.Fog(selectedTrack.sky, 38, 175);

  const ground = box(72, 0.7, selectedTrack.id === "cliff" ? 220 : 180, selectedTrack.ground);
  ground.position.set(0, selectedTrack.id === "cliff" ? -7.4 : -0.65, -58);
  sceneGroup.add(ground);

  const segmentCount = lowPowerMode ? 12 : 18;
  for (let i = 0; i < segmentCount; i += 1) {
    const segment = createRoadSegment(i);
    roadSegments.push(segment);
    roadGroup.add(segment);
  }

  buildTrackScenery();
  buildItems();
}

function createRoadSegment(i) {
  const group = new THREE.Group();
  const cliffGap = selectedTrack.id === "cliff" && i % 3 === 1;
  if (cliffGap) {
    buildCliffJumpSegment(group, i);
  } else {
    const road = box(12, 0.16, 9.8, selectedTrack.road);
    road.position.y = 0;
    group.add(road);
    const leftRail = box(0.22, 0.34, 9.8, 0xffffff);
    const rightRail = box(0.22, 0.34, 9.8, 0xffffff);
    leftRail.position.set(-6.15, 0.22, 0);
    rightRail.position.set(6.15, 0.22, 0);
    group.add(leftRail, rightRail);
    for (let z = -3.2; z <= 3.2; z += 3.2) {
      const stripe = box(0.22, 0.18, 1.2, 0xffd15f);
      stripe.position.set(0, 0.2, z);
      group.add(stripe);
    }
  }
  if (selectedTrack.id === "sky" || selectedTrack.id === "cliff") {
    group.position.y = trackHeight();
    const cloud = sphere(1.9, 0xffffff, 1.8, 0.55, 1.1);
    cloud.position.set(i % 2 ? -8.6 : 8.6, -1.8, 0);
    group.add(cloud);
  }
  if (selectedTrack.id === "underground") {
    const leftWall = box(0.7, 5.6, 9.8, 0x3d3430);
    const rightWall = box(0.7, 5.6, 9.8, 0x3d3430);
    leftWall.position.set(-7.0, 2.4, 0);
    rightWall.position.set(7.0, 2.4, 0);
    group.add(leftWall, rightWall);
    if (i % 2 === 0) {
      const lamp = sphere(0.22, 0xffd15f);
      lamp.position.set(0, 4.8, -2);
      group.add(lamp);
    }
  }
  group.position.z = -i * 10;
  return group;
}

function cliffPatternFor(index) {
  return cliffJumps[index % cliffJumps.length];
}

function buildCliffJumpSegment(group, index) {
  const jump = cliffPatternFor(index);
  group.userData.jumpLabel = jump.short;
  const startPlate = box(5.5, 0.26, 3.0, selectedTrack.road);
  startPlate.position.set(0, 0, -3.35);
  const targetPlate = box(5.8, 0.26, 3.25, selectedTrack.road);
  targetPlate.position.set(jump.dx, jump.lift, jump.dz);
  const startCliff = box(5.8, 3.2, 3.15, 0x8b5a35);
  startCliff.position.set(0, -1.75, -3.35);
  const targetCliff = box(6.1, 3.2 + Math.max(0, jump.lift), 3.4, 0x8b5a35);
  targetCliff.position.set(jump.dx, jump.lift - 1.75, jump.dz);
  const takeoff = box(5.2, 0.2, 0.75, 0xffd15f);
  takeoff.position.set(jump.dx * 0.18, 0.18, -1.35);
  takeoff.rotation.x = -0.25;
  const guide = box(Math.max(1.5, Math.abs(jump.dx) * 0.62), 0.08, 0.42, 0xffffff);
  guide.position.set(jump.dx * 0.48, Math.max(-0.2, jump.lift * 0.45) + 0.48, 0.0);
  guide.rotation.z = -jump.dx * 0.025;
  guide.rotation.x = -jump.lift * 0.08;
  const middlePad = box(2.0, 0.18, 1.35, 0x39a657);
  middlePad.position.set(jump.dx * 0.45, jump.lift * 0.45, 0.55);
  const sign = makeLabel(jump.short);
  sign.scale.setScalar(0.42);
  sign.position.set(jump.dx * 0.35, Math.max(0.42, jump.lift * 0.5 + 0.62), -0.65);
  sign.rotation.x = -Math.PI / 2;
  const leftEdge = box(5.8, 0.5, 0.22, 0x172632);
  const rightEdge = leftEdge.clone();
  leftEdge.position.set(0, -0.05, -4.9);
  rightEdge.position.set(jump.dx, jump.lift - 0.05, 4.55);
  const cloudA = sphere(1.0, 0xffffff, 1.8, 0.55, 1.1);
  const cloudB = sphere(0.9, 0xffffff, 1.6, 0.5, 1);
  cloudA.position.set(jump.dx * 0.55, -1.25, -0.2);
  cloudB.position.set(jump.dx * 0.25 + 2, -1.75, 2.1);
  group.add(startCliff, targetCliff, startPlate, targetPlate, takeoff, guide, middlePad, sign, leftEdge, rightEdge, cloudA, cloudB);
}

function buildTrackScenery() {
  if (selectedTrack.id === "airport") {
    addAirplane(-18, 1.5, -22, 1.1);
    addAirplane(18, 1.5, -62, 1.25);
    addTower(-22, -82);
  } else if (selectedTrack.id === "station") {
    addTrain(-20, -48);
    addTrain(21, -100);
  } else if (selectedTrack.id === "ghost") {
    const ghostCount = lowPowerMode ? 4 : 7;
    for (let i = 0; i < ghostCount; i += 1) addGhost(i % 2 ? -16 : 16, -18 - i * 22);
  } else if (selectedTrack.id === "volcano") {
    const rockCount = lowPowerMode ? 5 : 8;
    for (let i = 0; i < rockCount; i += 1) addLavaRock(i % 2 ? -16 : 15, -18 - i * 18);
  } else if (selectedTrack.id === "sky" || selectedTrack.id === "cliff") {
    const cloudCount = lowPowerMode ? 7 : 12;
    for (let i = 0; i < cloudCount; i += 1) {
      const cloud = sphere(2.3, 0xffffff, 1.7, 0.55, 1.1);
      cloud.position.set((i % 2 ? -19 : 18) + Math.sin(i) * 5, 5 + Math.sin(i * 1.7) * 2.5, -10 - i * 14);
      sceneGroup.add(cloud);
    }
    if (selectedTrack.id === "cliff") {
      const cliffCount = lowPowerMode ? 5 : 8;
      for (let i = 0; i < cliffCount; i += 1) {
        const cliff = box(7 + (i % 3) * 2, 4.4 + (i % 2) * 1.3, 8, 0x8b5a35);
        cliff.position.set(i % 2 ? -22 : 22, trackHeight() - 3.1, -24 - i * 18);
        const grass = box(cliff.geometry.parameters.width, 0.28, 8.2, 0x39a657);
        grass.position.set(cliff.position.x, trackHeight() - 0.8, cliff.position.z);
        sceneGroup.add(cliff, grass);
      }
    }
  } else {
    const sceneryCount = lowPowerMode ? 6 : 10;
    for (let i = 0; i < sceneryCount; i += 1) {
      const rock = box(4, 3 + (i % 3), 5, 0x574b43);
      rock.position.set(i % 2 ? -18 : 18, 1.3, -15 - i * 15);
      sceneGroup.add(rock);
    }
  }
}

function addAirplane(x, y, z, s) {
  const group = new THREE.Group();
  const body = cyl(0.65, 0.65, 6.8, 0xffffff, 32);
  body.rotation.x = Math.PI / 2;
  const wing = box(7.5, 0.12, 1.1, 0xdce5eb);
  const tail = box(2.2, 1.4, 0.18, 0xd93a32);
  tail.position.z = 3.1;
  tail.position.y = 0.8;
  group.add(body, wing, tail);
  group.position.set(x, y, z);
  group.scale.setScalar(s);
  sceneGroup.add(group);
}

function addTower(x, z) {
  const base = cyl(0.8, 1.2, 8, 0xffffff);
  base.position.set(x, 4, z);
  const top = cyl(2.0, 1.8, 2, 0x64717b, 8);
  top.position.set(x, 9.2, z);
  sceneGroup.add(base, top);
}

function addTrain(x, z) {
  const train = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const car = box(3.4, 2.3, 5.6, i % 2 ? 0xd93a32 : 0x245b8f);
    car.position.z = -i * 5.8;
    train.add(car);
  }
  train.position.set(x, 1.2, z);
  sceneGroup.add(train);
}

function addGhost(x, z) {
  const ghost = sphere(1.1, 0xf4f7fa, 1, 1.25, 0.75);
  ghost.position.set(x, 1.8, z);
  const eye1 = sphere(0.12, 0x171827);
  const eye2 = sphere(0.12, 0x171827);
  eye1.position.set(x - 0.32, 2.05, z - 0.75);
  eye2.position.set(x + 0.32, 2.05, z - 0.75);
  sceneGroup.add(ghost, eye1, eye2);
}

function addLavaRock(x, z) {
  const rock = sphere(1.5, 0x3b3030, 1.1, 0.75, 1);
  rock.position.set(x, 0.8, z);
  const glow = sphere(0.8, 0xff6a2a, 1.2, 0.3, 1);
  glow.position.set(x, 1.2, z);
  sceneGroup.add(rock, glow);
}

function buildItems() {
  const coinCount = lowPowerMode ? 10 + selectedStars * 2 : 18 + selectedStars * 3;
  for (let i = 0; i < coinCount; i += 1) {
    const coin = cyl(0.36, 0.36, 0.08, 0xffd15f, 26);
    coin.rotation.x = Math.PI / 2;
    coin.userData.laneX = -4 + (i % 5) * 2;
    coin.position.set(coin.userData.laneX, trackHeight() + 0.8, -24 - i * 10);
    coin.userData.baseZ = coin.position.z;
    coins.push(coin);
    pickupGroup.add(coin);
  }
  const rivalLabels = ["LR", "星", "M", "7", "GO", "闪"];
  const rivalCount = lowPowerMode ? 5 + selectedStars : 10 + selectedStars * 2;
  for (let i = 0; i < rivalCount; i += 1) {
    const rival = createCar([0xd93a32, 0x245b8f, 0x39a657, 0xffd15f, 0x8f5fd9][i % 5], rivalLabels[i % rivalLabels.length]);
    rival.userData.laneX = [-3.8, 0, 3.8][i % 3];
    rival.position.set(rival.userData.laneX, trackHeight() + 0.45, -34 - i * 17);
    rival.userData.baseZ = rival.position.z;
    rivalCars.push(rival);
    pickupGroup.add(rival);
  }
  const obstacleCount = lowPowerMode ? 4 + selectedStars : 8 + selectedStars;
  for (let i = 0; i < obstacleCount; i += 1) {
    const obstacle = createObstacle(i);
    obstacle.userData.laneX = [-4.2, 0, 4.2][(i + 1) % 3];
    obstacle.position.set(obstacle.userData.laneX, trackHeight() + 0.58, -48 - i * 25);
    obstacle.userData.baseZ = obstacle.position.z;
    obstacles.push(obstacle);
    pickupGroup.add(obstacle);
  }
  finishLine = box(12, 0.22, 1, 0xffffff);
  finishLine.position.set(0, trackHeight() + 0.22, -145);
  finishLine.userData.laneX = 0;
  finishLine.userData.baseZ = -raceGoalDistance() / 42;
  pickupGroup.add(finishLine);
}

function createObstacle(index) {
  if (selectedTrack.id === "cliff") return box(1.7, 0.42, 1.1, index % 2 ? 0xffd15f : 0x39a657);
  if (selectedTrack.id === "ghost") return sphere(0.9, 0xf4f7fa, 1, 1.2, 0.7);
  if (selectedTrack.id === "volcano") return sphere(0.85, 0xff6a2a, 1.1, 0.7, 1);
  if (selectedTrack.id === "airport") return box(1.8, 1.1, 1.2, 0xffd15f);
  if (selectedTrack.id === "station") return box(1.4, 1.0, 1.2, 0x9a6429);
  if (selectedTrack.id === "sky") return sphere(1.0, 0xffffff, 1.5, 0.65, 1);
  return sphere(0.9, 0x6d625a, 1, 0.8, 1);
}

function trackHeight() {
  if (selectedTrack.id === "cliff") return 7.4;
  return selectedTrack.id === "sky" ? 6.5 : 0;
}

function roadCenterAt(pathDistance) {
  if (selectedTrack.id === "cliff") {
    return Math.sin(pathDistance * 0.075) * 4.4 + Math.sin(pathDistance * 0.022) * 2.0;
  }
  if (selectedTrack.id === "airport" || selectedTrack.id === "station") return Math.sin(pathDistance * 0.035) * 1.8;
  if (selectedTrack.id === "sky") return Math.sin(pathDistance * 0.052) * 2.3;
  return Math.sin(pathDistance * 0.03) * 1.1;
}

function roadYawAt(pathDistance) {
  return THREE.MathUtils.clamp((roadCenterAt(pathDistance + 6) - roadCenterAt(pathDistance - 6)) * 0.035, -0.42, 0.42);
}

function cliffPhase() {
  return (distance / 42) % 30;
}

function currentCliffJump() {
  return cliffPatternFor(Math.floor((distance / 42) / 30));
}

function inCliffFlightZone() {
  const phase = cliffPhase();
  return selectedTrack.id === "cliff" && phase > 8 && phase < 24;
}

function startRace() {
  running = true;
  won = false;
  gameOver = false;
  distance = 0;
  speed = 12 + selectedStars * 1.3;
  laneX = 0;
  vertical = 0;
  verticalVelocity = 0;
  flyTimer = 0;
  finishCard.classList.remove("show");
  finishTitle.textContent = "冲线成功!";
  statusEl.textContent = `${selectedDriver.name}开着${selectedCar.name}出发！现在是 3D ${selectedTrack.name}赛道，一共 ${totalLaps} 圈。`;
  rebuildWorld();
  playStart();
  playRaceMusic();
}

function resetRace() {
  running = false;
  won = false;
  gameOver = false;
  distance = 0;
  speed = 0;
  laneX = 0;
  vertical = 0;
  verticalVelocity = 0;
  flyTimer = 0;
  finishCard.classList.remove("show");
  statusEl.textContent = "选好地图和车，点开始赛车。";
  rebuildWorld();
  stopRaceMusic();
}

function controlDown(name) {
  return keys.has(name) || pressed.has(name);
}

function update(dt) {
  if (!running || won || gameOver) {
    render();
    return;
  }
  const left = controlDown("ArrowLeft") || controlDown("a") || controlDown("left");
  const right = controlDown("ArrowRight") || controlDown("d") || controlDown("right");
  const fast = controlDown("w") || controlDown("fast");
  const slow = controlDown("s") || controlDown("slow");
  const jump = controlDown(" ") || controlDown("jump");
  const fly = controlDown("f") || controlDown("fly");

  const steer = (right ? 1 : 0) - (left ? 1 : 0);
  laneX += steer * dt * 8.5 * selectedTire.grip;
  const maxLane = selectedTrack.id === "cliff" && vertical > 0.5 ? 9.4 : 4.8;
  laneX = THREE.MathUtils.clamp(laneX, -maxLane, maxLane);
  speed += (fast ? 24 : 0) * dt;
  speed -= (slow ? 30 : 0) * dt;
  speed = THREE.MathUtils.clamp(speed, 8, 34 * selectedCar.speed + selectedStars * 2);
  distance += speed * dt * 42;

  if (jump && Math.abs(vertical) < 0.02) verticalVelocity = 9.5;
  const cliffJump = currentCliffJump();
  if (inCliffFlightZone() && selectedWing.id !== "none") flyTimer = Math.max(flyTimer, 2.25);
  if (fly && selectedWing.id !== "none") flyTimer = 1.6;
  if (flyTimer > 0) {
    flyTimer -= dt;
    const targetFlight = selectedTrack.id === "cliff" ? 6.2 + Math.max(0, cliffJump.lift) : selectedWing.id === "plane" ? 5.2 : 3.1;
    vertical = THREE.MathUtils.lerp(vertical, targetFlight, dt * 4);
  } else {
    vertical += verticalVelocity * dt;
    verticalVelocity -= 20 * dt;
    if (vertical <= 0) {
      vertical = 0;
      verticalVelocity = 0;
    }
  }

  const roadCenter = roadCenterAt(distance / 42);
  playerCar.position.set(roadCenter + laneX, trackHeight() + 0.48 + vertical, 5.4);
  playerCar.rotation.z = THREE.MathUtils.lerp(playerCar.rotation.z, -steer * 0.24, dt * 5);
  playerCar.rotation.y = THREE.MathUtils.lerp(playerCar.rotation.y, roadYawAt(distance / 42), dt * 4);
  playerCar.rotation.x = THREE.MathUtils.lerp(playerCar.rotation.x, vertical > 0 ? -0.12 : 0, dt * 3);

  updateRoad();
  updatePickups();
  updateCamera(dt);
  const cliffText = selectedTrack.id === "cliff" ? ` · 下一跳:${cliffJump.short} · 每30米一个悬崖` : "";
  const flightText = inCliffFlightZone() && selectedWing.id !== "none" ? ` · 翅膀自动打开，${cliffJump.label}` : "";
  statusEl.textContent = `${selectedTrack.name} 3D赛道 · 第 ${currentLap()}/${totalLaps} 圈 · 速度 ${Math.round(speed * 10)} · ${selectedTrack.obstacle}${cliffText}${flightText}`;

  if (distance >= raceGoalDistance()) finishRace();
}

function updateRoad() {
  const offset = (distance / 42) % 10;
  const scroll = distance / 42;
  roadSegments.forEach((segment, i) => {
    segment.position.z = 12 - i * 10 + offset;
    const path = scroll + i * 10;
    segment.position.x = roadCenterAt(path);
    segment.rotation.y = roadYawAt(path);
  });
  sceneGroup.children.forEach((object, i) => {
    if (object.geometry && i % 3 === 0) object.rotation.y += 0.003;
  });
}

function updatePickups() {
  const scroll = distance / 42;
  coins.forEach((coin) => {
    coin.position.z = coin.userData.baseZ + scroll;
    coin.position.x = roadCenterAt(-coin.userData.baseZ) + coin.userData.laneX;
    coin.rotation.z += 0.08;
    if (coin.position.z > 14) coin.userData.baseZ -= 190;
    if (Math.abs(coin.position.z - playerCar.position.z) < 1.5 && Math.abs(coin.position.x - laneX) < 1.5 && coin.visible) {
      coin.visible = false;
      playTone(880, 0, 0.07, 0.025);
    }
    if (coin.position.z < -20) coin.visible = true;
  });
  rivalCars.forEach((rival, i) => {
    rival.position.z = rival.userData.baseZ + scroll * (0.92 + (i % 3) * 0.02);
    rival.position.x = roadCenterAt(-rival.userData.baseZ) + rival.userData.laneX;
    rival.rotation.y = roadYawAt(-rival.userData.baseZ);
    rival.rotation.z = Math.sin(performance.now() * 0.004 + i) * 0.05;
    if (rival.position.z > 16) rival.userData.baseZ -= 210;
  });
  obstacles.forEach((obstacle) => {
    obstacle.position.z = obstacle.userData.baseZ + scroll;
    obstacle.position.x = roadCenterAt(-obstacle.userData.baseZ) + obstacle.userData.laneX;
    obstacle.rotation.y += 0.025;
    if (obstacle.position.z > 16) obstacle.userData.baseZ -= 230;
  });
  if (finishLine) {
    finishLine.position.z = finishLine.userData.baseZ + scroll;
    finishLine.position.x = roadCenterAt(-finishLine.userData.baseZ) + finishLine.userData.laneX;
  }
}

function updateCamera(dt) {
  const roadCenter = roadCenterAt(distance / 42);
  const desired = new THREE.Vector3(roadCenter + laneX * 0.42, trackHeight() + 8.8 + vertical * 0.32, 15.8);
  camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
  camera.lookAt(roadCenter + laneX * 0.2, trackHeight() + 0.9 + vertical * 0.2, -12);
}

function finishRace() {
  running = false;
  won = true;
  finishTitle.textContent = "3D冲线成功!";
  finishText.textContent = `${selectedDriver.name}完成 ${totalLaps} 圈，天空地下赛车变成立体版了。`;
  finishCard.classList.add("show");
  playFinish();
  stopRaceMusic();
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  resizeGlobeCanvas();
}

function render() {
  renderer.render(scene, camera);
}

function animate(now = performance.now()) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  render();
  drawGlobeMap(now);
}

function bindControls() {
  window.addEventListener("keydown", (event) => {
    keys.add(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    playRaceMusic();
  });
  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  });
  touchControls.forEach((button) => {
    const name = button.dataset.drive;
    const down = (event) => {
      event.preventDefault();
      pressed.add(name);
      button.classList.add("is-pressed");
      playRaceMusic();
    };
    const up = () => {
      pressed.delete(name);
      button.classList.remove("is-pressed");
    };
    button.addEventListener("pointerdown", down);
    button.addEventListener("pointerup", up);
    button.addEventListener("pointercancel", up);
    button.addEventListener("pointerleave", up);
  });
}

window.addEventListener("resize", resize);
openGlobeBtn.addEventListener("click", openGlobeMap);
closeGlobeBtn.addEventListener("click", closeGlobeMap);
globeOverlay.addEventListener("click", (event) => {
  if (event.target === globeOverlay) closeGlobeMap();
});
useGlobePlaceBtn.addEventListener("click", () => {
  applyGlobePlace(selectedGlobePlace);
  closeGlobeMap();
});
globeCanvas.addEventListener("pointerdown", (event) => {
  const rect = globeCanvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (globeCanvas.width / rect.width);
  const y = (event.clientY - rect.top) * (globeCanvas.height / rect.height);
  const marker = globeMarkers.find((item) => Math.hypot(item.x - x, item.y - y) <= item.r);
  if (!marker) return;
  selectedGlobePlace = marker.place;
  applyGlobePlace(marker.place);
});
startBtn.addEventListener("click", startRace);
resetBtn.addEventListener("click", resetRace);
againBtn.addEventListener("click", startRace);
playMusicBtn.addEventListener("click", playRaceMusic);
chooseMusicBtn.addEventListener("click", () => musicFileInput.click());
musicFileInput.addEventListener("change", () => {
  const file = musicFileInput.files && musicFileInput.files[0];
  if (!file) return;
  if (localMusicUrl) URL.revokeObjectURL(localMusicUrl);
  localMusicUrl = URL.createObjectURL(file);
  setRaceMusicSource(localMusicUrl, file.name);
  playRaceMusic();
});
bindControls();
resize();
refreshPlayerCar();
rebuildWorld();
drawMenu();
renderGlobeLocations();
animate();
