import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

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
const touchControls = [...document.querySelectorAll("[data-drive]")];

const tracks = [
  { id: "sky", name: "天上", road: 0xb8d8ff, ground: 0x92d6ff, sky: 0xaee7ff, obstacle: "云墙" },
  { id: "underground", name: "地下", road: 0x4f5a66, ground: 0x2b2420, sky: 0x151a22, obstacle: "石头" },
  { id: "airport", name: "机场", road: 0x424b57, ground: 0x8fc36e, sky: 0x9ed8f0, obstacle: "路障" },
  { id: "station", name: "火车站", road: 0x787f87, ground: 0xc8b08d, sky: 0xd9e5ea, obstacle: "行李" },
  { id: "ghost", name: "鬼屋", road: 0x453854, ground: 0x251d32, sky: 0x171827, obstacle: "幽灵门" },
  { id: "volcano", name: "火山", road: 0x3b3030, ground: 0x6c2d21, sky: 0xc4552f, obstacle: "岩浆石" }
];

const cars = [
  { id: "red", name: "法拉利风格", color: 0xd93a32, speed: 1.04 },
  { id: "sport", name: "跑车", color: 0x245b8f, speed: 1.02 },
  { id: "tesla", name: "电动车", color: 0xf4f7fa, speed: 1.0 },
  { id: "simple", name: "简单车", color: 0xffd15f, speed: 0.96 },
  { id: "offroad", name: "牧场越野", color: 0x39a657, speed: 0.94 }
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
  { id: "normal", name: "普通胎", grip: 1 },
  { id: "big", name: "大轮胎", grip: 0.86 },
  { id: "fast", name: "快轮胎", grip: 1.12 }
];

const wings = [
  { id: "none", name: "无翅膀" },
  { id: "small", name: "小翅膀" },
  { id: "plane", name: "飞机翼" }
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

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 16 / 9, 0.1, 900);
camera.position.set(0, 8.5, 13.5);

const hemi = new THREE.HemisphereLight(0xffffff, 0x62735c, 1.2);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(-16, 28, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
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
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cyl(r1, r2, h, color, radial = 28) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, radial), mat(color));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function sphere(r, color, sx = 1, sy = 1, sz = 1) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 26, 16), mat(color));
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
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

function createCar(color, label, isPlayer = false) {
  const group = new THREE.Group();
  const body = box(2.15, 0.55, 3.2, color);
  body.position.y = 0.55;
  const cabin = box(1.25, 0.62, 1.35, isPlayer ? 0xffffff : 0xdce5eb);
  cabin.position.set(0, 1.04, -0.28);
  group.add(body, cabin);
  const nose = box(1.75, 0.32, 0.95, color);
  nose.position.set(0, 0.7, -1.85);
  group.add(nose);
  [-0.95, 0.95].forEach((x) => {
    [-1.1, 1.0].forEach((z) => {
      const tire = cyl(0.34, 0.34, 0.34, 0x172632, 24);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(x, 0.32, z);
      group.add(tire);
    });
  });
  const badge = makeLabel(label);
  badge.scale.setScalar(0.36);
  badge.position.set(0, 1.42, -0.18);
  badge.rotation.x = -0.25;
  group.add(badge);
  if (isPlayer) {
    const driver = createDriver();
    driver.position.set(0, 1.55, -0.25);
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
  mesh.castShadow = true;
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
  makeButtons(trackChoices, tracks, (track) => track.name, (track) => track === selectedTrack, (track) => {
    selectedTrack = track;
    rebuildWorld();
  });
  makeButtons(starChoices, [1, 2, 3, 4], (star) => `${"★".repeat(star)}${"☆".repeat(4 - star)}`, (star) => star === selectedStars, (star) => {
    selectedStars = star;
    rebuildWorld();
  });
  makeButtons(carChoices, cars, (car) => car.name, (car) => car === selectedCar, (car) => {
    selectedCar = car;
    refreshPlayerCar();
  });
  makeDriverButtons();
  makeButtons(tireChoices, tires, (tire) => tire.name, (tire) => tire === selectedTire, (tire) => {
    selectedTire = tire;
  });
  makeButtons(wingChoices, wings, (wing) => wing.name, (wing) => wing === selectedWing, (wing) => {
    selectedWing = wing;
    updateWings();
  });
  makeButtons(iconChoices, icons, (icon) => icon, (icon) => icon === selectedIcon, (icon) => {
    selectedIcon = icon;
    refreshPlayerCar();
  });
  render();
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
  const span = selectedWing.id === "plane" ? 4.6 : 3.2;
  const left = box(span, 0.08, 0.55, 0xf4f7fa);
  const right = box(span, 0.08, 0.55, 0xf4f7fa);
  left.position.set(-1.55, 0.92, 0.2);
  right.position.set(1.55, 0.92, 0.2);
  left.rotation.z = 0.1;
  right.rotation.z = -0.1;
  wingsGroup.add(left, right);
  playerCar.add(wingsGroup);
}

function getAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

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

  const ground = box(58, 0.7, 180, selectedTrack.ground);
  ground.position.set(0, -0.65, -58);
  sceneGroup.add(ground);

  for (let i = 0; i < 18; i += 1) {
    const segment = createRoadSegment(i);
    roadSegments.push(segment);
    roadGroup.add(segment);
  }

  buildTrackScenery();
  buildItems();
}

function createRoadSegment(i) {
  const group = new THREE.Group();
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
  if (selectedTrack.id === "sky") {
    group.position.y = 6.5;
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

function buildTrackScenery() {
  if (selectedTrack.id === "airport") {
    addAirplane(-18, 1.5, -22, 1.1);
    addAirplane(18, 1.5, -62, 1.25);
    addTower(-22, -82);
  } else if (selectedTrack.id === "station") {
    addTrain(-20, -48);
    addTrain(21, -100);
  } else if (selectedTrack.id === "ghost") {
    for (let i = 0; i < 7; i += 1) addGhost(i % 2 ? -16 : 16, -18 - i * 22);
  } else if (selectedTrack.id === "volcano") {
    for (let i = 0; i < 8; i += 1) addLavaRock(i % 2 ? -16 : 15, -18 - i * 18);
  } else if (selectedTrack.id === "sky") {
    for (let i = 0; i < 12; i += 1) {
      const cloud = sphere(2.3, 0xffffff, 1.7, 0.55, 1.1);
      cloud.position.set((i % 2 ? -19 : 18) + Math.sin(i) * 5, 5 + Math.sin(i * 1.7) * 2.5, -10 - i * 14);
      sceneGroup.add(cloud);
    }
  } else {
    for (let i = 0; i < 10; i += 1) {
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
  for (let i = 0; i < 18 + selectedStars * 3; i += 1) {
    const coin = cyl(0.36, 0.36, 0.08, 0xffd15f, 26);
    coin.rotation.x = Math.PI / 2;
    coin.position.set(-4 + (i % 5) * 2, trackHeight() + 0.8, -24 - i * 10);
    coin.userData.baseZ = coin.position.z;
    coins.push(coin);
    pickupGroup.add(coin);
  }
  const rivalLabels = ["LR", "星", "M", "7", "GO", "闪"];
  for (let i = 0; i < 10 + selectedStars * 2; i += 1) {
    const rival = createCar([0xd93a32, 0x245b8f, 0x39a657, 0xffd15f, 0x8f5fd9][i % 5], rivalLabels[i % rivalLabels.length]);
    rival.position.set([-3.8, 0, 3.8][i % 3], trackHeight() + 0.45, -34 - i * 17);
    rival.userData.baseZ = rival.position.z;
    rivalCars.push(rival);
    pickupGroup.add(rival);
  }
  for (let i = 0; i < 8 + selectedStars; i += 1) {
    const obstacle = createObstacle(i);
    obstacle.position.set([-4.2, 0, 4.2][(i + 1) % 3], trackHeight() + 0.58, -48 - i * 25);
    obstacle.userData.baseZ = obstacle.position.z;
    obstacles.push(obstacle);
    pickupGroup.add(obstacle);
  }
  finishLine = box(12, 0.22, 1, 0xffffff);
  finishLine.position.set(0, trackHeight() + 0.22, -145);
  finishLine.userData.baseZ = -raceGoalDistance() / 42;
  pickupGroup.add(finishLine);
}

function createObstacle(index) {
  if (selectedTrack.id === "ghost") return sphere(0.9, 0xf4f7fa, 1, 1.2, 0.7);
  if (selectedTrack.id === "volcano") return sphere(0.85, 0xff6a2a, 1.1, 0.7, 1);
  if (selectedTrack.id === "airport") return box(1.8, 1.1, 1.2, 0xffd15f);
  if (selectedTrack.id === "station") return box(1.4, 1.0, 1.2, 0x9a6429);
  if (selectedTrack.id === "sky") return sphere(1.0, 0xffffff, 1.5, 0.65, 1);
  return sphere(0.9, 0x6d625a, 1, 0.8, 1);
}

function trackHeight() {
  return selectedTrack.id === "sky" ? 6.5 : 0;
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
  laneX = THREE.MathUtils.clamp(laneX, -4.8, 4.8);
  speed += (fast ? 24 : 0) * dt;
  speed -= (slow ? 30 : 0) * dt;
  speed = THREE.MathUtils.clamp(speed, 8, 34 * selectedCar.speed + selectedStars * 2);
  distance += speed * dt * 42;

  if (jump && Math.abs(vertical) < 0.02) verticalVelocity = 9.5;
  if (fly && selectedWing.id !== "none") flyTimer = 1.6;
  if (flyTimer > 0) {
    flyTimer -= dt;
    vertical = THREE.MathUtils.lerp(vertical, selectedWing.id === "plane" ? 5.2 : 3.1, dt * 4);
  } else {
    vertical += verticalVelocity * dt;
    verticalVelocity -= 20 * dt;
    if (vertical <= 0) {
      vertical = 0;
      verticalVelocity = 0;
    }
  }

  playerCar.position.set(laneX, trackHeight() + 0.48 + vertical, 5.4);
  playerCar.rotation.z = THREE.MathUtils.lerp(playerCar.rotation.z, -steer * 0.24, dt * 5);
  playerCar.rotation.x = THREE.MathUtils.lerp(playerCar.rotation.x, vertical > 0 ? -0.12 : 0, dt * 3);

  updateRoad();
  updatePickups();
  updateCamera(dt);
  statusEl.textContent = `${selectedTrack.name} 3D赛道 · 第 ${currentLap()}/${totalLaps} 圈 · 速度 ${Math.round(speed * 10)} · ${selectedTrack.obstacle}`;

  if (distance >= raceGoalDistance()) finishRace();
}

function updateRoad() {
  const offset = (distance / 42) % 10;
  roadSegments.forEach((segment, i) => {
    segment.position.z = 12 - i * 10 + offset;
  });
  sceneGroup.children.forEach((object, i) => {
    if (object.geometry && i % 3 === 0) object.rotation.y += 0.003;
  });
}

function updatePickups() {
  const scroll = distance / 42;
  coins.forEach((coin) => {
    coin.position.z = coin.userData.baseZ + scroll;
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
    rival.rotation.z = Math.sin(performance.now() * 0.004 + i) * 0.05;
    if (rival.position.z > 16) rival.userData.baseZ -= 210;
  });
  obstacles.forEach((obstacle) => {
    obstacle.position.z = obstacle.userData.baseZ + scroll;
    obstacle.rotation.y += 0.025;
    if (obstacle.position.z > 16) obstacle.userData.baseZ -= 230;
  });
  if (finishLine) finishLine.position.z = finishLine.userData.baseZ + scroll;
}

function updateCamera(dt) {
  const desired = new THREE.Vector3(laneX * 0.42, trackHeight() + 8.8 + vertical * 0.32, 15.8);
  camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
  camera.lookAt(laneX * 0.2, trackHeight() + 0.9 + vertical * 0.2, -12);
}

function finishRace() {
  running = false;
  won = true;
  finishTitle.textContent = "3D冲线成功!";
  finishText.textContent = `${selectedDriver.name}完成 ${totalLaps} 圈，天空地下赛车变成立体版了。`;
  finishCard.classList.add("show");
  playFinish();
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
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
}

function bindControls() {
  window.addEventListener("keydown", (event) => {
    keys.add(event.key.length === 1 ? event.key.toLowerCase() : event.key);
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
startBtn.addEventListener("click", startRace);
resetBtn.addEventListener("click", resetRace);
againBtn.addEventListener("click", startRace);
bindControls();
resize();
refreshPlayerCar();
rebuildWorld();
drawMenu();
animate();
