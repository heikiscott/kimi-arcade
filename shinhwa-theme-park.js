import * as THREE from "./assets/three.module.js";

const canvas = document.querySelector("#parkCanvas");
const statusText = document.querySelector("#statusText");
const nearName = document.querySelector("#nearName");
const nearInfo = document.querySelector("#nearInfo");
const rideList = document.querySelector("#rideList");
const moveStick = document.querySelector("#moveStick");
const moveKnob = document.querySelector("#moveKnob");
const screenButtons = Array.from(document.querySelectorAll("[data-screen]"));
const rideControlButtons = Array.from(document.querySelectorAll("[data-ride-control]"));
const buttons = {
  ride: document.querySelector("#rideBtn"),
  manualStart: document.querySelector("#manualStartBtn"),
  manualCheck: document.querySelector("#manualCheckBtn"),
  seat: document.querySelector("#seatBtn"),
  ticket: document.querySelector("#ticketBtn"),
  leave: document.querySelector("#leaveRideBtn"),
  next: document.querySelector("#nextBtn"),
  reset: document.querySelector("#resetBtn")
};

const rideData = [
  {
    id: "dancing",
    name: "Dancing Oscar",
    zone: "Oscar's New World",
    model: "coaster",
    position: [-18, 0, -24],
    color: 0xd93a32,
    info: "旋转过山车，慢慢爬升后俯冲，座舱会一边沿轨道跑一边自己转。"
  },
  {
    id: "spin",
    name: "Oscar Spin Bomb",
    zone: "Oscar's New World",
    model: "spinBump",
    position: [8, 0, -26],
    color: 0xffd15f,
    info: "参考你拍的视频：橙色和青绿色座舱围着中轴旋转，前面有安全压杆。"
  },
  {
    id: "dragon",
    name: "Oscar's Dragon",
    zone: "Oscar's New World",
    model: "dragon",
    position: [27, 0, -17],
    color: 0x2f79c8,
    info: "蓝色神话龙背上的旋转项目，龙身会绕着柱子飞。"
  },
  {
    id: "whirl",
    name: "Flying Whirl",
    zone: "Rotary Park",
    model: "whirl",
    position: [-28, 0, 1],
    color: 0x7c4dff,
    info: "飞行旋转项目，椅子围着中心塔转起来。"
  },
  {
    id: "finding",
    name: "Finding Larva",
    zone: "Rotary Park",
    model: "darkRide",
    position: [-6, 0, 2],
    color: 0x172632,
    info: "坐在室内小汽车里，车会沿轨道前进，前面有小枪，可以按 F 或 J 打发光目标。"
  },
  {
    id: "flying",
    name: "Flying Larva",
    zone: "Larva Adventure Village",
    model: "flying",
    position: [18, 0, 4],
    color: 0xf06aa3,
    info: "小飞机围绕中轴上升下降，适合从空中看乐园。"
  },
  {
    id: "carousel",
    name: "Larva's Sweet Carousel",
    zone: "Larva Adventure Village",
    model: "carousel",
    position: [-21, 0, 27],
    color: 0xff8c3a,
    info: "甜点风格旋转木马，彩色座位一圈一圈转。"
  },
  {
    id: "buck",
    name: "Spinning Oscar",
    zone: "Oscar's New World",
    model: "dance",
    position: [4, 0, 25],
    color: 0x39a657,
    info: "参考你拍的视频：一整排座椅在雕像背景前旋转，游客坐在安全杆后面。"
  },
  {
    id: "express",
    name: "Larva's World Express",
    zone: "Larva Adventure Village",
    model: "train",
    position: [29, 0, 24],
    color: 0xd93a32,
    info: "小火车绕村庄轨道慢慢开，可以看完整个区域。"
  },
  {
    id: "ghost",
    name: "Haunted Ghost Train",
    zone: "Mystery Zone",
    model: "ghostTrain",
    position: [-29, 0, -42],
    color: 0x5b3ea6,
    info: "鬼屋小火车，很多游客一起坐车穿过灵鬼屋，遇到鬼影时轨道会突然转弯。"
  },
  {
    id: "penguin",
    name: "Penguin Splash",
    zone: "Water Fun Zone",
    model: "penguinSplash",
    position: [28, 0, -43],
    color: 0x38bdf8,
    info: "企鹅水花过山车，先爬上高处，再嗖一下冲进水池，水花会扑上来。"
  },
  {
    id: "playground",
    name: "Adventure Play Ground",
    zone: "Family Zone",
    model: "playground",
    position: [0, 0, 47],
    color: 0x245b8f,
    info: "攀爬网、滑梯和软垫区，像儿童冒险场。"
  }
];

const keys = new Set();
const pointer = { active: false, x: 0, y: 0 };
const lookDrag = { active: false, x: 0, y: 0 };
const velocity = new THREE.Vector3();
const upAxis = new THREE.Vector3(0, 1, 0);
const viewState = {
  yaw: 0,
  targetYaw: 0,
  pitch: 0,
  targetPitch: 0,
  distance: 12,
  targetDistance: 12,
  screen: "follow"
};
const rideControl = {
  speed: 1,
  paused: false
};
const clock = new THREE.Clock();
const interactive = [];
let nearest = null;
let riding = null;
let rideSeat = null;
let selectedIndex = 0;
let selectedSeatIndex = 0;
let selectedSeatRideId = null;
let audioContext = null;
let coasterSound = null;
let rideSound = null;
const entrance = {
  ticketChecked: false,
  friend: null,
  inspector: null,
  gateArms: []
};
const crowdVisitors = [];

const coasterPhases = [
  { name: "系好安全带，车厢准备出发", end: 0.08, sound: "station" },
  { name: "链条正在把车厢慢慢拉上坡", end: 0.28, sound: "lift" },
  { name: "到最高点了，马上快速俯冲", end: 0.39, sound: "drop" },
  { name: "冲上第二个上坡，再滑下来", end: 0.52, sound: "fast" },
  { name: "进入第一个大圈，车厢一边跑一边旋转", end: 0.64, sound: "loop" },
  { name: "反方向再转一个大圈，座舱继续旋转", end: 0.76, sound: "loop" },
  { name: "开始刹车减速", end: 0.9, sound: "brake" },
  { name: "慢慢进站停稳，游客可以下车", end: 1, sound: "station" }
];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x8fd8ff);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xbfeeff, 55, 145);

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 260);
camera.position.set(0, 12, 18);

const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(26, 42, 18);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xdff8ff, 0x4f7a49, 1.25));

const materials = {
  grass: new THREE.MeshStandardMaterial({ color: 0x70bd72, roughness: 0.85 }),
  path: new THREE.MeshStandardMaterial({ color: 0xd8c486, roughness: 0.72 }),
  water: new THREE.MeshStandardMaterial({ color: 0x58c9ef, roughness: 0.45, metalness: 0.05 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xb8c2c8, roughness: 0.32, metalness: 0.48 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x172632, roughness: 0.55 }),
  white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x8c562e, roughness: 0.7 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x9fe7ff, roughness: 0.08, metalness: 0.18, transparent: true, opacity: 0.55 })
};

function makeMat(color, roughness = 0.5, metalness = 0.05) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function ensureAudio() {
  if (audioContext) return audioContext;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  audioContext = new AudioCtx();
  audioContext.resume?.();
  return audioContext;
}

function startCoasterSound() {
  const context = ensureAudio();
  if (!context || coasterSound) return;
  const rumble = context.createOscillator();
  const wheelClick = context.createOscillator();
  const gain = context.createGain();
  rumble.type = "sawtooth";
  wheelClick.type = "square";
  rumble.frequency.value = 82;
  wheelClick.frequency.value = 18;
  gain.gain.value = 0.045;
  rumble.connect(gain);
  wheelClick.connect(gain);
  gain.connect(context.destination);
  rumble.start();
  wheelClick.start();
  coasterSound = { rumble, wheelClick, gain };
}

function stopCoasterSound() {
  if (!coasterSound) return;
  const endAt = audioContext.currentTime + 0.08;
  coasterSound.gain.gain.linearRampToValueAtTime(0.001, endAt);
  coasterSound.rumble.stop(endAt);
  coasterSound.wheelClick.stop(endAt);
  coasterSound = null;
}

function startRideSound(kind = "gentle") {
  const context = ensureAudio();
  if (!context || rideSound) return;
  const scream = context.createOscillator();
  const crowd = context.createOscillator();
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  const gain = context.createGain();
  scream.type = "triangle";
  crowd.type = "sawtooth";
  lfo.type = "sine";
  scream.frequency.value = kind === "wild" ? 760 : 520;
  crowd.frequency.value = kind === "wild" ? 230 : 170;
  lfo.frequency.value = kind === "wild" ? 5.4 : 3.2;
  lfoGain.gain.value = kind === "wild" ? 185 : 95;
  gain.gain.value = kind === "wild" ? 0.032 : 0.018;
  lfo.connect(lfoGain);
  lfoGain.connect(scream.frequency);
  scream.connect(gain);
  crowd.connect(gain);
  gain.connect(context.destination);
  scream.start();
  crowd.start();
  lfo.start();
  rideSound = { scream, crowd, lfo, gain };
}

function stopRideSound() {
  if (!rideSound || !audioContext) return;
  const endAt = audioContext.currentTime + 0.1;
  rideSound.gain.gain.linearRampToValueAtTime(0.001, endAt);
  rideSound.scream.stop(endAt);
  rideSound.crowd.stop(endAt);
  rideSound.lfo.stop(endAt);
  rideSound = null;
}

function updateRideSound(intensity = 0.4) {
  if (!rideSound || !audioContext) return;
  const now = audioContext.currentTime;
  const clamped = THREE.MathUtils.clamp(intensity, 0.15, 1);
  rideSound.scream.frequency.setTargetAtTime(480 + clamped * 420, now, 0.06);
  rideSound.crowd.frequency.setTargetAtTime(150 + clamped * 150, now, 0.08);
  rideSound.gain.gain.setTargetAtTime(0.012 + clamped * 0.032, now, 0.07);
}

function updateCoasterSound(phaseKey, speed) {
  if (!coasterSound || !audioContext) return;
  const now = audioContext.currentTime;
  const settings = {
    station: [45, 7, 0.018],
    lift: [70, 13, 0.045],
    drop: [145, 28, 0.075],
    fast: [125, 24, 0.065],
    loop: [115, 21, 0.07],
    brake: [56, 9, 0.038]
  }[phaseKey] || [80, 14, 0.04];
  coasterSound.rumble.frequency.setTargetAtTime(settings[0] + speed * 16, now, 0.08);
  coasterSound.wheelClick.frequency.setTargetAtTime(settings[1] + speed * 4, now, 0.08);
  coasterSound.gain.gain.setTargetAtTime(settings[2], now, 0.08);
}

function box(name, size, position, material, parent = scene) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
  mesh.name = name;
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cyl(name, radius, height, position, material, parent = scene, radialSegments = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, radialSegments), material);
  mesh.name = name;
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function sphere(name, radius, position, material, parent = scene, widthSegments = 32) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, widthSegments, 16), material);
  mesh.name = name;
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function label(text, position, size = 84, scaleX = 9.5, scaleY = 2.7) {
  const canvasLabel = document.createElement("canvas");
  canvasLabel.width = 640;
  canvasLabel.height = 180;
  const context = canvasLabel.getContext("2d");
  context.clearRect(0, 0, canvasLabel.width, canvasLabel.height);
  context.fillStyle = "rgba(255,255,255,0.88)";
  roundedRect(context, 20, 20, 600, 128, 18);
  context.fill();
  context.fillStyle = "#172632";
  context.font = `900 ${size}px system-ui`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 320, 84);
  const texture = new THREE.CanvasTexture(canvasLabel);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.position.set(position[0], position[1], position[2]);
  sprite.scale.set(scaleX, scaleY, 1);
  scene.add(sprite);
  return sprite;
}

function roundedRect(context, x, y, width, height, radius) {
  const right = x + width;
  const bottom = y + height;
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(right - radius, y);
  context.quadraticCurveTo(right, y, right, y + radius);
  context.lineTo(right, bottom - radius);
  context.quadraticCurveTo(right, bottom, right - radius, bottom);
  context.lineTo(x + radius, bottom);
  context.quadraticCurveTo(x, bottom, x, bottom - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function buildWorld() {
  const ground = box("park-ground", [104, 0.7, 104], [0, -0.36, 6], materials.grass);
  ground.receiveShadow = true;
  box("main-path", [10, 0.08, 92], [0, 0.03, 10], materials.path);
  box("cross-path", [78, 0.09, 9], [0, 0.05, 8], materials.path);
  box("entrance-plaza", [34, 0.1, 14], [0, 0.06, 54], materials.path);
  box("water-lake", [21, 0.06, 14], [34, 0.08, -36], materials.water);
  addGuideMapLayout();

  const gate = new THREE.Group();
  gate.position.set(0, 0, 55);
  box("gate-left", [2, 7, 2], [-9, 3.5, 0], materials.dark, gate);
  box("gate-right", [2, 7, 2], [9, 3.5, 0], materials.dark, gate);
  box("gate-top", [22, 2, 2], [0, 8, 0], makeMat(0xd93a32), gate);
  box("gate-roof", [25, 1.2, 4], [0, 9.6, 0], makeMat(0xffd15f), gate);
  scene.add(gate);
  label("SHINHWA THEME PARK", [0, 13, 55], 58);
  addTicketArea();

  addZoneSign("Oscar's New World", [-18, 5, -38], 0xd93a32);
  addZoneSign("Rotary Park", [-18, 5, 9], 0x245b8f);
  addZoneSign("Larva Adventure Village", [20, 5, 36], 0xff8c3a);
  addThemeGateway("OSCAR'S NEW WORLD", "Dancing Oscar / Spin'n Bump", [-17, 0, -39], 0xd93a32);
  addThemeGateway("ROTARY PARK", "Indoor 3D Theater / Flying Whirl", [-21, 0, 10], 0x245b8f);
  addThemeGateway("LARVA ADVENTURE VILLAGE", "Flying Larva / World Express", [21, 0, 39], 0xff8c3a);

  for (let i = 0; i < 34; i += 1) {
    const z = -38 + i * 2.7;
    const side = i % 2 === 0 ? -1 : 1;
    addTree(side * (26 + (i % 5) * 3), z, 1 + (i % 3) * 0.16);
  }

  addHotelBackdrop();
  addParkFurniture();
  addParkWorkers();
  addThemeMascots();
  addMomoZoo();
  addDenseMapForest();
  rideData.forEach((ride, index) => addAttraction(ride, index));
  addCrowdVisitors(320);
}

function addGuideMapLayout() {
  const streetMat = makeMat(0xd9a7ad, 0.74, 0.04);
  const sideMat = makeMat(0xd8c486, 0.74, 0.04);
  const plazaMat = makeMat(0xe8d69c, 0.72, 0.04);
  box("map-main-street-pink", [12.5, 0.12, 34], [0, 0.12, 39], streetMat);
  label("MAIN STREET", [0, 0.75, 38.5], 34, 4.2, 1.1);
  const leftFork = box("map-left-fork-road", [6.8, 0.1, 31], [-14, 0.1, 21], sideMat);
  leftFork.rotation.y = -0.72;
  const rightFork = box("map-right-fork-road", [6.8, 0.1, 30], [15, 0.1, 23], sideMat);
  rightFork.rotation.y = 0.7;
  const oscarLane = box("map-oscar-lane", [7.5, 0.1, 31], [-18, 0.1, -25], sideMat);
  oscarLane.rotation.y = 0.36;
  const larvaLane = box("map-larva-lane", [7.5, 0.1, 29], [25, 0.1, 21], sideMat);
  larvaLane.rotation.y = -0.45;
  cyl("map-rotary-round", 12.5, 0.12, [-18, 0.12, 8], plazaMat, scene, 56);
  cyl("map-larva-round", 13.5, 0.12, [25, 0.12, 26], plazaMat, scene, 56);
  addRoadLoop(-6, -29, 13, 1.15, "map-coaster-loop-road");
  addRoadLoop(24, 36, 9, 0.78, "map-larva-loop-road");
}

function addRoadLoop(x, z, radius, scaleZ, name) {
  const road = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.55, 10, 84), materials.path);
  road.name = name;
  road.position.set(x, 0.16, z);
  road.rotation.x = Math.PI / 2;
  road.scale.y = scaleZ;
  road.receiveShadow = true;
  scene.add(road);
}

function addTicketArea() {
  box("ticket-booth", [4.6, 3.3, 3], [6.4, 1.65, 59.6], makeMat(0xfff2c7));
  box("ticket-window", [2.5, 1.35, 0.1], [6.4, 2.15, 58.05], materials.glass);
  box("ticket-counter", [6.8, 0.45, 1.2], [0, 0.7, 56.7], makeMat(0x172632));
  box("ticket-lane-left", [0.35, 1.5, 8], [-2.6, 0.75, 58.8], materials.steel);
  box("ticket-lane-right", [0.35, 1.5, 8], [2.6, 0.75, 58.8], materials.steel);
  entrance.gateArms = [
    box("ticket-gate-arm-left", [3.1, 0.24, 0.24], [-1.4, 1.45, 55.9], makeMat(0xd93a32)),
    box("ticket-gate-arm-right", [3.1, 0.24, 0.24], [1.4, 1.45, 55.9], makeMat(0xd93a32))
  ];
  entrance.gateArms[0].rotation.y = 0.28;
  entrance.gateArms[1].rotation.y = -0.28;
  entrance.inspector = createPerson({
    name: "检票员",
    position: [5.1, 0, 56.8],
    rotation: -Math.PI * 0.72,
    shirt: 0x274b76,
    pants: 0x172632,
    cap: 0x274b76,
    badge: true
  });
  entrance.friend = createPerson({
    name: "一起玩的朋友",
    position: [-3.6, 0, 61.3],
    rotation: Math.PI,
    shirt: 0xf06aa3,
    pants: 0x245b8f,
    cap: 0xffd15f,
    hair: 0x2b2118
  });
  label("检票员", [5.1, 4.2, 56.8], 38, 3.2, 1.0);
  label("朋友", [-3.6, 4.2, 61.3], 38, 2.8, 1.0);
}

function addZoneSign(text, position, color) {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);
  box("zone-sign", [12, 4, 0.8], [0, 0, 0], makeMat(color), group);
  box("zone-post", [0.5, 5, 0.5], [-4.8, -3.8, 0], materials.dark, group);
  box("zone-post", [0.5, 5, 0.5], [4.8, -3.8, 0], materials.dark, group);
  scene.add(group);
  label(text, [position[0], position[1] + 0.1, position[2] + 0.3], 46);
}

function addThemeGateway(title, subtitle, position, color) {
  const group = new THREE.Group();
  group.position.set(position[0], 0, position[2]);
  box("theme-gateway-left", [0.55, 5.8, 0.55], [-6.2, 2.9, 0], materials.steel, group);
  box("theme-gateway-right", [0.55, 5.8, 0.55], [6.2, 2.9, 0], materials.steel, group);
  box("theme-gateway-top", [13.6, 1.1, 0.7], [0, 5.8, 0], makeMat(color), group);
  box("theme-gateway-back", [13.2, 3.1, 0.24], [0, 3.9, -0.18], makeMat(0xffffff), group);
  scene.add(group);
  label(title, [position[0], 6.25, position[2] + 0.4], 44, 7.2, 1.0);
  label(subtitle, [position[0], 4.2, position[2] + 0.4], 30, 7.2, 0.8);
}

function addHotelBackdrop() {
  for (let i = 0; i < 5; i += 1) {
    const building = box("resort-hotel", [7, 11 + i * 2, 4], [-34 + i * 6, 5.5 + i, -52], makeMat(0xe9dfc9));
    for (let floor = 0; floor < 5 + i; floor += 1) {
      for (let win = 0; win < 2; win += 1) {
        box("hotel-window", [0.8, 0.8, 0.08], [-2 + win * 4, -4 + floor * 1.8, 2.05], materials.glass, building);
      }
    }
  }
}

function addTree(x, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  cyl("tree-trunk", 0.28 * scale, 2.4 * scale, [0, 1.2 * scale, 0], makeMat(0x7b4f2a), group, 12);
  sphere("tree-top", 1.25 * scale, [0, 3 * scale, 0], makeMat(0x267447), group);
  scene.add(group);
}

function addParkFurniture() {
  const lampMat = makeMat(0x172632, 0.35, 0.28);
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xfff1a5, emissive: 0xffc94a, emissiveIntensity: 0.7, roughness: 0.35 });
  for (let i = 0; i < 18; i += 1) {
    const x = i % 2 === 0 ? -6.6 : 6.6;
    const z = -35 + i * 5.2;
    cyl("park-lamp-post", 0.07, 3.4, [x, 1.7, z], lampMat, scene, 8);
    sphere("park-lamp-light", 0.36, [x, 3.55, z], lightMat, scene, 12);
  }
  for (let i = 0; i < 12; i += 1) {
    const x = i % 2 === 0 ? -10.2 : 10.2;
    const z = -31 + i * 7.2;
    const bench = new THREE.Group();
    bench.position.set(x, 0, z);
    bench.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
    box("bench-seat", [2.4, 0.18, 0.7], [0, 0.82, 0], materials.wood, bench);
    box("bench-back", [2.4, 0.2, 0.72], [0, 1.25, 0.38], materials.wood, bench);
    box("bench-leg-left", [0.16, 0.68, 0.16], [-0.9, 0.42, -0.18], materials.dark, bench);
    box("bench-leg-right", [0.16, 0.68, 0.16], [0.9, 0.42, -0.18], materials.dark, bench);
    scene.add(bench);
  }
  for (let i = 0; i < 7; i += 1) {
    const kiosk = new THREE.Group();
    kiosk.position.set(i % 2 ? 38 : -38, 0, -30 + i * 13);
    box("snack-kiosk", [4.2, 2.6, 3], [0, 1.3, 0], makeMat(i % 2 ? 0xffd15f : 0xd93a32), kiosk);
    box("snack-kiosk-awning", [4.8, 0.45, 3.6], [0, 2.85, 0], makeMat(0xffffff), kiosk);
    box("snack-window", [2.6, 1.1, 0.1], [0, 1.55, -1.55], materials.glass, kiosk);
    scene.add(kiosk);
  }
}

function addMomoZoo() {
  const zoo = new THREE.Group();
  zoo.position.set(-34, 0, 12);
  box("momo-zoo-building", [15, 3.2, 8], [0, 1.6, 0], makeMat(0xf1dfba), zoo);
  box("momo-zoo-roof", [16, 0.55, 9], [0, 3.45, 0], makeMat(0xd93a32), zoo);
  box("momo-zoo-front", [12, 1.4, 0.18], [0, 2.1, -4.15], makeMat(0xffffff), zoo);
  label("MOMO ZOO", [-34, 5.1, 7.5], 40, 5.6, 1.1);
  for (let i = 0; i < 4; i += 1) {
    const pen = new THREE.Group();
    pen.position.set(-6 + i * 4, 0, 7.5);
    box("zoo-pen-floor", [3.1, 0.08, 3.1], [0, 0.08, 0], makeMat(0xd8c486), pen);
    for (let side = 0; side < 4; side += 1) {
      const rail = box("zoo-pen-rail", [3.3, 0.16, 0.12], [0, 0.7, side === 0 ? -1.65 : 1.65], materials.wood, pen);
      if (side >= 2) rail.rotation.y = Math.PI / 2;
      if (side >= 2) rail.position.set(side === 2 ? -1.65 : 1.65, 0.7, 0);
    }
    sphere("zoo-small-figure", 0.34, [0, 0.62, 0], makeMat(i % 2 ? 0x8c562e : 0xeeeeee), pen, 12);
    zoo.add(pen);
  }
  scene.add(zoo);
}

function addDenseMapForest() {
  const clusters = [
    { x: -36, z: -30, w: 22, d: 20, count: 42 },
    { x: 35, z: -8, w: 23, d: 30, count: 50 },
    { x: 38, z: 36, w: 18, d: 20, count: 34 },
    { x: -38, z: 34, w: 18, d: 18, count: 28 }
  ];
  clusters.forEach((cluster, clusterIndex) => {
    for (let i = 0; i < cluster.count; i += 1) {
      const x = cluster.x + (Math.random() - 0.5) * cluster.w;
      const z = cluster.z + (Math.random() - 0.5) * cluster.d;
      addTree(x, z, 0.62 + ((i + clusterIndex) % 4) * 0.08);
    }
  });
  for (let i = 0; i < 10; i += 1) {
    const car = new THREE.Group();
    car.position.set(-30 + (i % 5) * 2.2, 0, 45 + Math.floor(i / 5) * 2.2);
    box("parking-car-body", [1.55, 0.48, 2.15], [0, 0.42, 0], makeMat(i % 3 === 0 ? 0xd93a32 : i % 3 === 1 ? 0x245b8f : 0xffd15f), car);
    box("parking-car-window", [1.2, 0.28, 1], [0, 0.78, -0.05], materials.glass, car);
    scene.add(car);
  }
}

function addParkWorkers() {
  const workerSpots = [
    { name: "Dancing Oscar 工作员", position: [-23, 0, -16], rotation: 1.25, shirt: 0xffd15f, cap: 0xd93a32 },
    { name: "Oscar Spin Bomb 工作员", position: [4.5, 0, -18], rotation: -0.8, shirt: 0x75c9bf, cap: 0xeaa46d, expression: "calm" },
    { name: "Spinning Oscar 工作员", position: [-1.8, 0, 20.5], rotation: 0.5, shirt: 0xb46d58, cap: 0xffd15f, expression: "happy" },
    { name: "室内馆工作员", position: [-12, 0, 8.7], rotation: 1.4, shirt: 0x274b76, cap: 0x274b76, expression: "calm" },
    { name: "商店工作员", position: [37.8, 0, 22], rotation: -Math.PI / 2, shirt: 0xd93a32, cap: 0xffffff, expression: "happy" },
    { name: "巡园工作员", position: [-9, 0, 36], rotation: 0.2, shirt: 0x39a657, cap: 0xffd15f, expression: "curious" }
  ];
  workerSpots.forEach((spot) => {
    const worker = createPerson({
      name: spot.name,
      position: spot.position,
      rotation: spot.rotation,
      shirt: spot.shirt,
      pants: 0x172632,
      cap: spot.cap,
      expression: spot.expression || "happy",
      badge: true
    });
    worker.scale.setScalar(0.82);
    worker.userData.isWorker = true;
  });
}

function addThemeMascots() {
  const oscar = new THREE.Group();
  oscar.position.set(-31, 0, -34);
  sphere("oscar-round-sculpture", 1.5, [0, 1.7, 0], makeMat(0xffd15f), oscar, 24);
  box("oscar-hat", [2.4, 0.45, 1.5], [0, 3.1, 0], makeMat(0xd93a32), oscar);
  sphere("oscar-nose", 0.28, [0, 1.82, -1.42], makeMat(0xf1bd8c), oscar, 12);
  scene.add(oscar);

  const larva = new THREE.Group();
  larva.position.set(31, 0, 37);
  for (let i = 0; i < 5; i += 1) {
    const segment = sphere("larva-color-sculpture", 0.78, [0, 1.1 + i * 0.24, -1.4 + i * 0.65], makeMat(i % 2 ? 0xd93a32 : 0xffd15f), larva, 18);
    segment.scale.set(1, 0.8, 1.25);
  }
  scene.add(larva);
}

function addQueueRails(group, ride) {
  const queue = new THREE.Group();
  queue.position.set(-6.4, 0, 6.9);
  const railMat = makeMat(0x172632, 0.34, 0.42);
  for (let i = 0; i < 4; i += 1) {
    box("queue-rail", [4.2, 0.12, 0.12], [i % 2 ? 2.1 : -2.1, 1.05, -i * 1.25], railMat, queue);
    cyl("queue-post", 0.08, 1.45, [-4.2, 0.73, -i * 1.25], railMat, queue, 8);
    cyl("queue-post", 0.08, 1.45, [4.2, 0.73, -i * 1.25], railMat, queue, 8);
  }
  box("queue-sign-board", [3.4, 1.2, 0.18], [0, 2.1, -5.2], makeMat(ride.color), queue);
  group.add(queue);
}

function addSeatedRider(parent, position, scale = 1, shirt = 0x245b8f) {
  const rider = new THREE.Group();
  rider.position.set(position[0], position[1], position[2]);
  const skin = makeMat(0xf1bd8c);
  cyl("ride-passenger-body", 0.16 * scale, 0.42 * scale, [0, 0.28 * scale, 0], makeMat(shirt), rider, 10);
  sphere("ride-passenger-head", 0.14 * scale, [0, 0.58 * scale, 0], skin, rider, 10);
  box("ride-passenger-hair", [0.24 * scale, 0.06 * scale, 0.2 * scale], [0, 0.71 * scale, 0.02 * scale], makeMat(0x2b2118), rider);
  box("ride-passenger-arm-left", [0.07 * scale, 0.34 * scale, 0.06 * scale], [-0.2 * scale, 0.32 * scale, -0.05 * scale], makeMat(shirt), rider).rotation.x = 0.5;
  box("ride-passenger-arm-right", [0.07 * scale, 0.34 * scale, 0.06 * scale], [0.2 * scale, 0.32 * scale, -0.05 * scale], makeMat(shirt), rider).rotation.x = 0.5;
  parent.add(rider);
  return rider;
}

function addPlayerSeat(parent, position, rotationY = 0, scale = 0.34) {
  const seat = new THREE.Group();
  seat.name = "player-seat-anchor";
  seat.position.set(position[0], position[1], position[2]);
  seat.rotation.y = rotationY;
  seat.userData.playerScale = scale;
  parent.add(seat);
  return seat;
}

function addSelectableSeat(group, parent, position, rotationY, scale, dummyRider) {
  const seat = addPlayerSeat(parent, position, rotationY, scale);
  seat.userData.seatNumber = group.userData.seats.length + 1;
  seat.userData.dummyRider = dummyRider;
  group.userData.seats.push(seat);
  return seat;
}

function normalizeSeatIndex(count) {
  if (!count) return 0;
  selectedSeatIndex = ((selectedSeatIndex % count) + count) % count;
  return selectedSeatIndex;
}

function getSeatGroup() {
  if (nearest?.userData.seats?.length) return nearest;
  const focused = interactive[selectedIndex];
  return focused?.userData.seats?.length ? focused : null;
}

function syncSeatSelection(group) {
  const count = group?.userData.seats?.length || 0;
  if (!count) {
    selectedSeatIndex = 0;
    selectedSeatRideId = null;
    return 0;
  }
  const rideId = group.userData.ride.id;
  if (selectedSeatRideId !== rideId) {
    selectedSeatIndex = 0;
    selectedSeatRideId = rideId;
  }
  normalizeSeatIndex(count);
  return count;
}

function updateSeatButton(group = nearest) {
  if (!buttons.seat) return;
  const target = group?.userData.seats?.length ? group : getSeatGroup();
  const count = syncSeatSelection(target);
  if (!count) {
    buttons.seat.textContent = "选座";
    buttons.seat.disabled = true;
    return;
  }
  if (riding) {
    buttons.seat.textContent = rideSeat?.userData.seatNumber ? `座位 ${rideSeat.userData.seatNumber}/${count}` : "已入座";
    buttons.seat.disabled = true;
    return;
  }
  buttons.seat.textContent = `选座 ${selectedSeatIndex + 1}/${count}`;
  buttons.seat.disabled = false;
}

function chooseSeat() {
  const group = getSeatGroup();
  const count = syncSeatSelection(group);
  if (!count) {
    statusText.textContent = "这个项目暂时没有可选座位。";
    updateSeatButton(group);
    return;
  }
  if (riding) {
    statusText.textContent = `你已经坐在第 ${rideSeat?.userData.seatNumber || selectedSeatIndex + 1} 号座位了，想换座位要先下车。`;
    updateSeatButton(group);
    return;
  }
  selectedSeatIndex = (selectedSeatIndex + 1) % count;
  updateSeatButton(group);
  statusText.textContent = `已经选择 ${group.userData.ride.name} 第 ${selectedSeatIndex + 1}/${count} 号座位。点“乘坐最近项目”就会坐到这个座位。`;
}

function restoreSeatDummy(seat = rideSeat) {
  if (seat?.userData.dummyRider) {
    seat.userData.dummyRider.visible = true;
  }
}

function getActiveRideGroup() {
  return riding || nearest || interactive[selectedIndex] || null;
}

function getFocusWorldPosition() {
  if (riding && rideSeat) {
    const seatWorld = new THREE.Vector3();
    rideSeat.getWorldPosition(seatWorld);
    return seatWorld;
  }
  return player.position.clone();
}

function updateScreenButtons() {
  screenButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === viewState.screen);
  });
}

function setScreenMode(mode) {
  viewState.screen = mode;
  updateScreenButtons();
  const names = {
    follow: "跟随屏幕",
    first: "第一视角屏幕",
    seat: "座位屏幕",
    wide: "全园大屏幕",
    ride: "轨道屏幕",
    gate: "门口屏幕"
  };
  statusText.textContent = `已经切换到${names[mode] || "新屏幕"}，你可以继续走路、选座或者乘坐项目。`;
}

function updateRideControlButtons() {
  rideControlButtons.forEach((button) => {
    button.disabled = !riding;
    if (button.dataset.rideControl === "pause") {
      button.textContent = rideControl.paused ? "继续" : "暂停";
    }
  });
}

function changeRideSpeed(direction) {
  if (!riding) {
    statusText.textContent = "先坐上项目，才能控制它加速或者减速。";
    updateRideControlButtons();
    return;
  }
  const next = rideControl.speed + direction * 0.35;
  rideControl.speed = THREE.MathUtils.clamp(next, 0.35, 2.8);
  const speedText = rideControl.speed.toFixed(1).replace(".0", "");
  statusText.textContent = `${riding.userData.ride.name} 速度调到 ${speedText} 倍。`;
}

function toggleRidePause() {
  if (!riding) {
    statusText.textContent = "先坐上项目，才能暂停或者继续。";
    updateRideControlButtons();
    return;
  }
  rideControl.paused = !rideControl.paused;
  updateRideControlButtons();
  statusText.textContent = rideControl.paused
    ? `${riding.userData.ride.name} 暂停了，画面可以继续滑动看四周。`
    : `${riding.userData.ride.name} 继续运行，速度是 ${rideControl.speed.toFixed(1).replace(".0", "")} 倍。`;
}

function getCoasterPhase(progress) {
  return coasterPhases.find((phase) => progress <= phase.end) || coasterPhases[coasterPhases.length - 1];
}

function coasterSpeedForProgress(progress) {
  if (progress < 0.08) return 0.08;
  if (progress < 0.28) return 0.18;
  if (progress < 0.39) return 1.28;
  if (progress < 0.52) return 0.95;
  if (progress < 0.76) return 0.72;
  if (progress < 0.9) return 0.33;
  return 0.07;
}

function makeCoasterCurve() {
  const points = [
    new THREE.Vector3(-9, 1.25, 5.2),
    new THREE.Vector3(-10.4, 2.2, 1.7),
    new THREE.Vector3(-9.8, 5.1, -3.3),
    new THREE.Vector3(-7.8, 8.9, -6.9),
    new THREE.Vector3(-4.3, 11.6, -7.4),
    new THREE.Vector3(-1.6, 3.2, -6.6),
    new THREE.Vector3(0.2, 1.4, -4.4)
  ];
  const frontCenter = new THREE.Vector3(3.3, 5.55, -2.2);
  const frontRadius = 4.15;
  for (let i = 0; i <= 24; i += 1) {
    const angle = -Math.PI * 0.72 + (Math.PI * 2.05 * i) / 24;
    points.push(new THREE.Vector3(
      frontCenter.x + Math.cos(angle) * frontRadius,
      frontCenter.y + Math.sin(angle) * frontRadius,
      frontCenter.z + Math.sin(angle * 0.5) * 0.55
    ));
  }
  points.push(
    new THREE.Vector3(6.8, 4.1, 1.2),
    new THREE.Vector3(7.4, 6.8, 3.4)
  );
  const reverseCenter = new THREE.Vector3(3.5, 5.45, 4.5);
  const reverseRadius = 3.15;
  for (let i = 0; i <= 20; i += 1) {
    const angle = Math.PI * 0.18 - (Math.PI * 1.82 * i) / 20;
    points.push(new THREE.Vector3(
      reverseCenter.x + Math.cos(angle) * reverseRadius,
      reverseCenter.y + Math.sin(angle) * reverseRadius,
      reverseCenter.z + Math.cos(angle * 0.5) * 0.45
    ));
  }
  points.push(
    new THREE.Vector3(0.4, 2.6, 5.1),
    new THREE.Vector3(-4.8, 2.0, 5.8),
    new THREE.Vector3(-8.4, 1.35, 5.4),
    new THREE.Vector3(-9, 1.25, 5.2)
  );
  return new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.22);
}

function addAttraction(ride, index) {
  const group = new THREE.Group();
  group.position.set(ride.position[0], 0, ride.position[2]);
  group.userData = { ride, seats: [], motion: 0 };

  const base = cyl("ride-base", 5.2, 0.42, [0, 0.22, 0], makeMat(ride.color), group, 48);
  base.scale.z = 0.72;
  label(ride.name, [ride.position[0], 5.8, ride.position[2] + 5.8], 42);
  addQueueRails(group, ride);

  if (ride.model === "coaster") buildCoaster(group, ride);
  if (ride.model === "spinBump") buildSpinBump(group, ride);
  if (ride.model === "dragon") buildDragon(group, ride);
  if (ride.model === "whirl") buildWhirl(group, ride);
  if (ride.model === "darkRide") buildDarkRide(group, ride);
  if (ride.model === "flying") buildFlying(group, ride);
  if (ride.model === "carousel") buildCarousel(group, ride);
  if (ride.model === "dance") buildDance(group, ride);
  if (ride.model === "train") buildTrain(group, ride);
  if (ride.model === "ghostTrain") buildGhostTrain(group, ride);
  if (ride.model === "penguinSplash") buildPenguinSplash(group, ride);
  if (ride.model === "playground") buildPlayground(group, ride);

  scene.add(group);
  interactive.push(group);
  const item = document.createElement("button");
  item.type = "button";
  item.innerHTML = `<strong>${index + 1}. ${ride.name}</strong><span>${ride.zone}</span>`;
  item.addEventListener("click", () => focusRide(index));
  rideList.append(item);
  ride.listButton = item;
}

function buildCoaster(group, ride) {
  const mint = makeMat(0xa8ddd0, 0.38, 0.18);
  const station = new THREE.Group();
  station.position.set(-8.9, 0, 6.1);
  box("coaster-station-wall", [11.5, 5.8, 0.45], [0, 2.9, 0], makeMat(0xcaa76f), station);
  box("coaster-station-platform", [12.5, 0.35, 5], [0, 0.5, -2.7], makeMat(0xd6c29a), station);
  box("coaster-station-roof", [12.8, 0.6, 5.5], [0, 5.95, -2.6], makeMat(0x80513b), station);
  box("coaster-way-out-sign", [3.8, 0.85, 0.12], [-2.8, 4.2, 0.3], makeMat(0xffffff), station);
  label("WAY OUT", [ride.position[0] - 11.8, 4.25, ride.position[2] + 6.55], 22, 2.5, 0.7);
  for (let i = 0; i < 7; i += 1) {
    box("coaster-mint-rail", [0.12, 1.2, 5.2], [-5.8 + i * 1.9, 1.15, -2.7], mint, station);
  }
  box("coaster-mint-walkway", [10.5, 0.14, 1.7], [0.3, 1.55, -5.7], mint, station);
  group.add(station);

  const curve = makeCoasterCurve();
  const track = new THREE.Mesh(new THREE.TubeGeometry(curve, 260, 0.18, 10, true), materials.steel);
  track.castShadow = true;
  group.add(track);
  const rail2 = new THREE.Mesh(new THREE.TubeGeometry(curve, 260, 0.07, 8, true), makeMat(ride.color));
  rail2.position.y = 0.5;
  group.add(rail2);
  const loopMat = makeMat(ride.color, 0.28, 0.22);
  const frontLoop = new THREE.Mesh(new THREE.TorusGeometry(4.15, 0.13, 10, 96), loopMat);
  frontLoop.name = "coaster-forward-loop";
  frontLoop.position.set(3.3, 5.55, -2.2);
  frontLoop.rotation.y = Math.PI / 2;
  frontLoop.castShadow = true;
  group.add(frontLoop);
  const reverseLoop = new THREE.Mesh(new THREE.TorusGeometry(3.15, 0.13, 10, 88), materials.steel);
  reverseLoop.name = "coaster-reverse-loop";
  reverseLoop.position.set(3.5, 5.45, 4.5);
  reverseLoop.rotation.y = Math.PI / 2;
  reverseLoop.rotation.z = Math.PI;
  reverseLoop.castShadow = true;
  group.add(reverseLoop);
  const chain = box("coaster-chain-lift", [0.35, 0.2, 11], [-8.5, 6.4, -3.5], materials.dark, group);
  chain.rotation.x = -0.42;
  for (let i = 0; i < 10; i += 1) {
    const tooth = box("coaster-chain-tooth", [0.55, 0.18, 0.08], [-8.5, 2.2 + i * 0.82, 1.2 - i * 0.78], makeMat(0xffd15f), group);
    tooth.rotation.x = -0.42;
  }
  for (let i = 0; i < 12; i += 1) {
    const sample = curve.getPoint(i / 12);
    cyl("coaster-support", 0.12, Math.max(1.4, sample.y - 0.15), [sample.x, sample.y * 0.5, sample.z], materials.steel, group, 8);
  }
  for (let i = 0; i < 6; i += 1) {
    box("coaster-brake-fin", [0.12, 0.55, 1.2], [-6.9 - i * 0.45, 1.95, 5.1], makeMat(0x172632), group);
  }
  const trainCars = [];
  const carColors = [0xffd15f, 0xd93a32, 0x75c9bf, 0xff8c3a, 0xf06aa3];
  for (let i = 0; i < 11; i += 1) {
    const car = new THREE.Group();
    const cabin = new THREE.Group();
    cabin.name = "spinning-coaster-rotating-cabin";
    box("coaster-spin-pivot", [1.12, 0.18, 1.12], [0, 0.2, 0], materials.dark, car);
    cyl("coaster-spin-bearing", 0.28, 0.18, [0, 0.34, 0], materials.steel, car, 18);
    box("spinning-coaster-car-body", [1.55, 0.72, 1.38], [0, 0.42, 0], makeMat(carColors[i % carColors.length]), cabin);
    box("spinning-coaster-seat-back", [1.32, 0.58, 0.14], [0, 0.82, 0.48], materials.dark, cabin);
    box("spinning-coaster-front", [1.3, 0.34, 0.14], [0, 0.62, -0.56], makeMat(0xa8ddd0), cabin);
    box("coaster-car-link", [0.18, 0.12, 0.7], [0, 0.46, 0.92], materials.dark, car);
    cyl("coaster-wheel-left", 0.16, 0.12, [-0.64, 0.15, -0.42], materials.dark, car, 10).rotation.z = Math.PI / 2;
    cyl("coaster-wheel-right", 0.16, 0.12, [0.64, 0.15, -0.42], materials.dark, car, 10).rotation.z = Math.PI / 2;
    const leftRider = addSeatedRider(cabin, [-0.31, 0.68, 0.02], 0.72, i % 2 ? 0xffffff : 0x245b8f);
    const rightRider = addSeatedRider(cabin, [0.31, 0.68, 0.02], 0.72, i % 2 ? 0x39a657 : 0xf06aa3);
    car.add(cabin);
    car.userData.carOffset = i * 0.018;
    car.userData.cabin = cabin;
    car.userData.spinAngle = i * 0.9;
    car.userData.spinPhase = i * 1.17;
    car.userData.spinRate = i % 2 ? -1 : 1;
    group.add(car);
    trainCars.push(car);
    addSelectableSeat(group, cabin, [-0.31, 0.58, -0.18], 0, 0.32, leftRider);
    addSelectableSeat(group, cabin, [0.31, 0.58, -0.18], 0, 0.32, rightRider);
  }
  group.userData.coasterTrain = { curve, cars: trainCars, elapsed: 0, phaseName: "" };
}

function buildSpinBump(group, ride) {
  const marquee = new THREE.Group();
  marquee.position.set(0, 0, 6.8);
  box("spin-marquee", [10, 2.2, 0.42], [0, 3.4, 0], makeMat(0xffb2a1), marquee);
  for (let i = 0; i < 18; i += 1) {
    sphere("spin-marquee-bulb", 0.13, [-4.4 + i * 0.52, 4.1, -0.28], makeMat(i % 2 ? 0xffd15f : 0xffffff), marquee, 8);
  }
  group.add(marquee);

  const swingRailPoints = [
    new THREE.Vector3(-6.6, 3.15, -0.75),
    new THREE.Vector3(-4.2, 2.15, -0.75),
    new THREE.Vector3(0, 1.55, -0.75),
    new THREE.Vector3(4.2, 2.15, -0.75),
    new THREE.Vector3(6.6, 3.15, -0.75)
  ];
  const swingRail = new THREE.CatmullRomCurve3(swingRailPoints, false, "catmullrom", 0.24);
  const railA = new THREE.Mesh(new THREE.TubeGeometry(swingRail, 90, 0.11, 8, false), materials.steel);
  railA.name = "spin-bomb-swing-rail-front";
  railA.castShadow = true;
  group.add(railA);
  const railB = railA.clone();
  railB.name = "spin-bomb-swing-rail-back";
  railB.position.z = 1.5;
  group.add(railB);
  box("spin-bomb-left-support", [0.34, 5.2, 0.34], [-6.7, 2.6, 0], materials.steel, group).rotation.z = -0.28;
  box("spin-bomb-right-support", [0.34, 5.2, 0.34], [6.7, 2.6, 0], materials.steel, group).rotation.z = 0.28;
  box("spin-bomb-top-beam", [13.8, 0.26, 0.26], [0, 5.05, 0], materials.steel, group);

  const arm = new THREE.Group();
  group.userData.spinBumpArm = arm;
  cyl("spin-center", 0.9, 5, [0, 2.5, 0], makeMat(0x75c9bf), arm);
  const disc = cyl("spin-disc", 5.5, 0.55, [0, 3.4, 0], makeMat(0xeaa46d), arm, 64);
  disc.rotation.x = Math.PI / 2;
  box("spin-bomb-ship-floor", [7.6, 0.34, 2.15], [0, 2.08, 0], makeMat(0xffd15f), arm);
  box("spin-bomb-ship-front", [0.6, 1.2, 2.05], [-4.1, 2.55, 0], makeMat(0xf0a16b), arm).rotation.z = 0.34;
  box("spin-bomb-ship-back", [0.6, 1.2, 2.05], [4.1, 2.55, 0], makeMat(0xf0a16b), arm).rotation.z = -0.34;
  for (let i = 0; i < 11; i += 1) {
    const angle = (i / 11) * Math.PI * 2;
    const seatGroup = new THREE.Group();
    seatGroup.position.set(Math.cos(angle) * 4.2, 3.9, Math.sin(angle) * 4.2);
    seatGroup.lookAt(0, 3.9, 0);
    box("spin-pod-orange-front", [1.35, 0.85, 0.72], [0, 0.25, -0.3], makeMat(0xf0a16b), seatGroup);
    box("spin-pod-turquoise-back", [1.35, 1.05, 0.76], [0, 0.38, 0.35], makeMat(0x75c9bf), seatGroup);
    box("spin-black-seat", [1, 0.88, 0.2], [0, 0.58, 0.76], materials.dark, seatGroup);
    box("spin-safety-bar", [1.25, 0.12, 0.12], [0, 0.88, -0.48], materials.dark, seatGroup);
    const leftRider = addSeatedRider(seatGroup, [-0.32, 0.76, 0.08], 0.82, 0xffffff);
    const rightRider = addSeatedRider(seatGroup, [0.32, 0.76, 0.08], 0.82, 0x245b8f);
    addSelectableSeat(group, seatGroup, [-0.32, 0.76, -0.08], 0, 0.34, leftRider);
    addSelectableSeat(group, seatGroup, [0.32, 0.76, -0.08], 0, 0.34, rightRider);
    arm.add(seatGroup);
  }
  group.add(arm);
}

function buildDragon(group, ride) {
  const rotor = new THREE.Group();
  group.userData.rotor = rotor;
  cyl("dragon-tower", 0.8, 6, [0, 3, 0], makeMat(0x1c4b88), rotor);
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2;
    const body = sphere("blue-dragon-seat", 0.95, [Math.cos(angle) * 4.8, 3.6, Math.sin(angle) * 4.8], makeMat(0x2f79c8), rotor);
    body.scale.set(1.7, 0.7, 0.8);
    const head = sphere("dragon-head", 0.45, [Math.cos(angle) * 5.8, 3.85, Math.sin(angle) * 5.8], makeMat(0x58c9ef), rotor);
    body.lookAt(0, 3.6, 0);
    head.lookAt(0, 3.85, 0);
    if (i === 0) group.userData.seats.push(addPlayerSeat(rotor, [Math.cos(angle) * 4.8, 3.95, Math.sin(angle) * 4.8], -angle + Math.PI, 0.32));
  }
  group.add(rotor);
}

function buildWhirl(group, ride) {
  const rotor = new THREE.Group();
  group.userData.rotor = rotor;
  cyl("whirl-tower", 0.7, 8.5, [0, 4.25, 0], materials.steel, rotor);
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    const arm = box("whirl-arm", [0.22, 0.22, 6], [Math.cos(angle) * 1.8, 7.6, Math.sin(angle) * 1.8], materials.steel, rotor);
    arm.rotation.y = -angle;
    const seat = box("flying-chair", [1, 0.75, 0.8], [Math.cos(angle) * 5.2, 4.7, Math.sin(angle) * 5.2], makeMat(ride.color), rotor);
    seat.lookAt(0, 4.7, 0);
    if (i === 0) group.userData.seats.push(addPlayerSeat(rotor, [Math.cos(angle) * 5.2, 4.95, Math.sin(angle) * 5.2], -angle + Math.PI, 0.3));
  }
  group.add(rotor);
}

function makeDarkRideCurve() {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.5, 0.55, 3.3),
    new THREE.Vector3(-5.1, 0.58, 0.6),
    new THREE.Vector3(-3.5, 0.62, -2.5),
    new THREE.Vector3(-0.7, 0.58, -3.35),
    new THREE.Vector3(2.8, 0.62, -2.4),
    new THREE.Vector3(4.7, 0.58, 0.7),
    new THREE.Vector3(3.1, 0.55, 3.4),
    new THREE.Vector3(-0.8, 0.55, 4.05),
    new THREE.Vector3(-4.5, 0.55, 3.3)
  ], true, "catmullrom", 0.24);
}

function buildDarkRide(group, ride) {
  const wallMat = makeMat(0x222b35);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x172632, roughness: 0.36, metalness: 0.1, transparent: true, opacity: 0.78 });
  const lightMat = new THREE.MeshStandardMaterial({ color: 0x80f5ff, emissive: 0x38d5ff, emissiveIntensity: 0.65, roughness: 0.18 });
  const targetMat = new THREE.MeshStandardMaterial({ color: 0xffd15f, emissive: 0xff5a3d, emissiveIntensity: 0.55, roughness: 0.24 });
  const beamMat = new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff3b30, emissiveIntensity: 1, roughness: 0.2, transparent: true, opacity: 0.86 });
  box("dark-ride-back-wall", [12, 6, 0.45], [0, 3, -4.5], wallMat, group);
  box("dark-ride-left-wall", [0.45, 6, 9], [-6, 3, 0], wallMat, group);
  box("dark-ride-right-glass-wall", [0.24, 5.4, 9], [6, 3, 0], materials.glass, group);
  box("dark-ride-cutaway-roof", [12.8, 0.45, 9.6], [0, 6.25, 0], roofMat, group);
  box("dark-ride-floor", [11.4, 0.2, 8.4], [0, 0.3, 0], makeMat(0x303b45), group);
  box("dark-ride-door", [4, 3.4, 0.25], [0, 1.7, 4.65], makeMat(0xffd15f), group);
  box("dark-ride-screen", [7, 3.3, 0.2], [0, 4.2, -4.65], materials.glass, group);
  label("坐小汽车打枪", [ride.position[0], 7.6, ride.position[2] + 2.2], 36, 5.8, 1.0);

  const controlPanel = new THREE.Group();
  controlPanel.position.set(4.6, 0, 4.05);
  controlPanel.rotation.y = -0.35;
  box("manual-control-post", [0.32, 1.65, 0.32], [0, 0.82, 0], materials.steel, controlPanel);
  box("manual-control-box", [2.35, 0.7, 1.45], [0, 1.7, 0], makeMat(0x303b45), controlPanel);
  const cover = box("manual-control-open-cover", [2.45, 0.08, 1.55], [0, 2.32, -0.62], materials.glass, controlPanel);
  cover.rotation.x = -0.72;
  const greenButton = cyl("manual-green-start-button", 0.28, 0.16, [-0.54, 2.1, -0.35], makeMat(0x22c55e), controlPanel, 24);
  greenButton.rotation.x = Math.PI / 2;
  const checkButton = box("manual-check-in-button", [0.8, 0.18, 0.42], [0.52, 2.1, -0.35], makeMat(0xffd15f), controlPanel);
  checkButton.rotation.x = -0.18;
  box("manual-control-red-light", [0.28, 0.12, 0.2], [-0.54, 2.08, 0.36], makeMat(0xd93a32), controlPanel);
  box("manual-control-screen", [1.58, 0.34, 0.08], [0.05, 1.84, -0.72], materials.glass, controlPanel);
  group.add(controlPanel);
  label("手动控制台", [ride.position[0] + 4.6, 3.35, ride.position[2] + 4.05], 28, 3.8, 0.8);
  label("绿键启动 · 检查进入", [ride.position[0] + 4.6, 2.72, ride.position[2] + 4.05], 24, 4.8, 0.72);

  const curve = makeDarkRideCurve();
  const track = new THREE.Mesh(new THREE.TubeGeometry(curve, 150, 0.08, 8, true), materials.steel);
  track.name = "dark-ride-car-track";
  group.add(track);

  const car = new THREE.Group();
  group.userData.darkRide = { curve, car, phaseName: "", score: 0, shots: [], targets: [], lastShotAt: -1 };
  box("shooting-car-body", [2.35, 0.75, 1.7], [0, 0.85, 0], makeMat(0xd93a32), car);
  box("shooting-car-nose", [1.55, 0.38, 0.5], [0, 0.88, -1], makeMat(0xffd15f), car);
  box("shooting-car-seat-left", [0.68, 0.58, 0.35], [-0.44, 1.22, 0.18], materials.dark, car);
  box("shooting-car-seat-right", [0.68, 0.58, 0.35], [0.44, 1.22, 0.18], materials.dark, car);
  const leftRider = addSeatedRider(car, [-0.44, 1.32, 0.05], 0.66, 0xffffff);
  const rightRider = addSeatedRider(car, [0.44, 1.32, 0.05], 0.66, 0x245b8f);
  addSelectableSeat(group, car, [-0.44, 1.22, -0.18], 0, 0.32, leftRider);
  addSelectableSeat(group, car, [0.44, 1.22, -0.18], 0, 0.32, rightRider);
  const gunLeft = cyl("shooting-gun-left", 0.07, 0.95, [-0.43, 1.45, -0.78], materials.dark, car, 10);
  const gunRight = cyl("shooting-gun-right", 0.07, 0.95, [0.43, 1.45, -0.78], materials.dark, car, 10);
  gunLeft.rotation.x = Math.PI / 2;
  gunRight.rotation.x = Math.PI / 2;
  box("shooting-gun-glow-left", [0.2, 0.2, 0.12], [-0.43, 1.45, -1.25], lightMat, car);
  box("shooting-gun-glow-right", [0.2, 0.2, 0.12], [0.43, 1.45, -1.25], lightMat, car);
  group.add(car);

  for (let i = 0; i < 6; i += 1) {
    sphere("dark-ride-ceiling-light", 0.2, [-4.5 + i * 1.8, 5.72, -1.8 + (i % 2) * 2.4], lightMat, group, 10);
  }
  const targetPositions = [
    [-4.6, 2.3, -4.2],
    [-2.2, 3.45, -4.35],
    [0.4, 2.75, -4.25],
    [3.2, 3.65, -4.3],
    [5.35, 2.4, -1.2],
    [5.25, 3.35, 1.8],
    [-5.25, 2.85, 1.6],
    [-4.8, 3.7, -1.5]
  ];
  targetPositions.forEach((position, i) => {
    const target = new THREE.Group();
    target.position.set(position[0], position[1], position[2]);
    sphere("shooting-target-ring", 0.36, [0, 0, 0], targetMat, target, 18);
    sphere("shooting-target-center", 0.18, [0, 0, -0.08], makeMat(i % 2 ? 0xf06aa3 : 0x39a657), target, 16);
    box("shooting-target-stand", [0.1, 1.2, 0.1], [0, -0.82, 0.08], materials.steel, target);
    target.userData.float = i;
    target.userData.hit = false;
    group.userData.darkRide.targets.push(target);
    group.add(target);
  });
  for (let i = 0; i < 3; i += 1) {
    box("dark-ride-prop-wall", [1.2, 1.8, 0.2], [-3 + i * 3, 1.2, -2.2 + (i % 2) * 1.8], makeMat(i % 2 ? 0x5b3ea6 : 0x39a657), group);
  }
  group.userData.darkRide.beamMat = beamMat;
}

function buildFlying(group, ride) {
  const rotor = new THREE.Group();
  group.userData.rotor = rotor;
  cyl("flying-tower", 0.55, 7, [0, 3.5, 0], materials.steel, rotor);
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    box("tiny-plane", [1.7, 0.55, 1.1], [Math.cos(angle) * 4.6, 3.2, Math.sin(angle) * 4.6], makeMat(ride.color), rotor);
    box("tiny-plane-wing", [2.6, 0.12, 0.45], [Math.cos(angle) * 4.6, 3.28, Math.sin(angle) * 4.6], materials.white, rotor);
  }
  group.add(rotor);
}

function buildCarousel(group, ride) {
  const rotor = new THREE.Group();
  group.userData.rotor = rotor;
  cyl("carousel-pole", 0.42, 5.2, [0, 2.6, 0], materials.steel, rotor);
  const canopy = cyl("carousel-canopy", 4.8, 0.7, [0, 5.4, 0], makeMat(ride.color), rotor, 48);
  canopy.scale.y = 0.5;
  cyl("carousel-floor", 5, 0.35, [0, 1.2, 0], makeMat(0xfff0b8), rotor, 48);
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2;
    const x = Math.cos(angle) * 3.7;
    const z = Math.sin(angle) * 3.7;
    cyl("carousel-pole-small", 0.07, 4, [x, 3.15, z], materials.steel, rotor, 8);
    const seat = sphere("sweet-seat", 0.55, [x, 2.15 + (i % 2) * 0.35, z], makeMat(i % 2 ? 0xf06aa3 : 0xffd15f), rotor);
    seat.scale.set(1.45, 0.75, 0.7);
    if (i === 0) group.userData.seats.push(addPlayerSeat(rotor, [x, 2.42, z], -angle + Math.PI, 0.32));
  }
  group.add(rotor);
}

function buildDance(group, ride) {
  const statueMat = makeMat(0xb46d58, 0.58, 0.05);
  const statue = new THREE.Group();
  statue.position.set(0, 0, -5.3);
  box("dance-stone-pedestal", [4.2, 2, 2.6], [0, 1, 0], makeMat(0x9d6a50), statue);
  sphere("dance-statue-head", 1.05, [0, 2.6, 0], statueMat, statue, 18);
  box("dance-statue-headdress", [2.2, 1.1, 0.6], [0, 3.55, -0.08], statueMat, statue);
  box("dance-statue-eye-left", [0.18, 0.08, 0.06], [-0.32, 2.72, -0.92], materials.dark, statue);
  box("dance-statue-eye-right", [0.18, 0.08, 0.06], [0.32, 2.72, -0.92], materials.dark, statue);
  group.add(statue);

  const platform = new THREE.Group();
  group.userData.rotor = platform;
  box("dance-ride-track", [12, 0.38, 1.2], [0, 1.05, 0], makeMat(0x92523e), platform);
  box("dance-blue-ramp", [4.8, 0.35, 1.3], [-6.2, 0.82, -1.2], makeMat(0x2f79c8), group).rotation.z = -0.2;
  for (let i = 0; i < 8; i += 1) {
    const x = -4.9 + i * 1.4;
    const seat = new THREE.Group();
    seat.position.set(x, 1.52 + Math.sin(i) * 0.06, 0);
    box("dance-saddle-seat", [1.1, 0.5, 1.35], [0, 0.32, 0], makeMat(0xb46d58), seat);
    box("dance-safety-grip", [0.95, 0.1, 0.1], [0, 0.9, -0.62], materials.dark, seat);
    addSeatedRider(seat, [0, 0.73, 0], 0.86, i % 2 ? 0xffffff : 0x245b8f);
    if (i === 3) group.userData.seats.push(addPlayerSeat(seat, [0, 0.73, -0.08], 0, 0.34));
    platform.add(seat);
  }
  group.add(platform);
}

function buildTrain(group, ride) {
  const curve = new THREE.EllipseCurve(0, 0, 7.4, 4.7, 0, Math.PI * 2);
  const points = curve.getPoints(80).map((point) => new THREE.Vector3(point.x, 0.35, point.y));
  const track = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 80, 0.08, 8, true), materials.steel);
  group.add(track);
  const train = new THREE.Group();
  group.userData.train = train;
  for (let i = 0; i < 4; i += 1) {
    const car = box("train-car", [1.3, 1.1, 1.7], [-i * 1.45, 1, 0], makeMat(i === 0 ? ride.color : 0xffd15f), train);
    if (i === 0) group.userData.seats.push(addPlayerSeat(train, [car.position.x, 1.34, 0], 0, 0.32));
  }
  group.add(train);
}

function makeGhostTrainCurve() {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.8, 0.5, 5.2),
    new THREE.Vector3(-7.5, 0.6, 1.2),
    new THREE.Vector3(-4.6, 0.72, -3.7),
    new THREE.Vector3(-0.8, 0.58, -5.4),
    new THREE.Vector3(3.4, 0.72, -3.5),
    new THREE.Vector3(6.8, 0.6, -0.3),
    new THREE.Vector3(4.2, 0.55, 3.8),
    new THREE.Vector3(0.5, 0.62, 5.7),
    new THREE.Vector3(-3.5, 0.55, 4.5),
    new THREE.Vector3(-5.8, 0.5, 5.2)
  ], true, "catmullrom", 0.25);
}

function buildGhostTrain(group, ride) {
  const wall = makeMat(0x251c32);
  const purple = makeMat(ride.color);
  const glow = new THREE.MeshStandardMaterial({ color: 0xb794ff, emissive: 0x7c4dff, emissiveIntensity: 0.7, roughness: 0.35 });
  box("ghost-house-back", [15, 6.2, 0.35], [0, 3.2, -5.8], wall, group);
  box("ghost-house-left", [0.35, 6.2, 11.5], [-7.4, 3.2, 0], wall, group);
  box("ghost-house-right", [0.35, 6.2, 11.5], [7.4, 3.2, 0], wall, group);
  box("ghost-house-roof", [15.8, 0.55, 12.4], [0, 6.55, 0], purple, group);
  box("ghost-train-door", [4.2, 3.4, 0.3], [-5.2, 1.9, 5.9], makeMat(0x0f172a), group);
  box("ghost-exit-door", [3.4, 3.2, 0.3], [5.6, 1.8, 5.9], makeMat(0x0f172a), group);
  label("GHOST TRAIN", [ride.position[0], 7.7, ride.position[2] + 5.9], 34, 6.5, 0.9);

  const curve = makeGhostTrainCurve();
  const track = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.1, 8, true), materials.steel);
  group.add(track);
  const train = new THREE.Group();
  group.userData.ghostTrain = { curve, train, elapsed: 0, phaseName: "" };
  for (let i = 0; i < 4; i += 1) {
    const car = box("ghost-car", [1.35, 0.9, 1.55], [-i * 1.35, 0.95, 0], makeMat(i === 0 ? 0x111827 : 0x5b3ea6), train);
    box("ghost-car-front", [1.1, 0.35, 0.12], [-i * 1.35, 1.35, -0.82], glow, train);
    addSeatedRider(train, [-i * 1.35 - 0.28, 1.43, -0.12], 0.6, i % 2 ? 0xffffff : 0xf06aa3);
    addSeatedRider(train, [-i * 1.35 + 0.28, 1.43, -0.12], 0.6, i % 2 ? 0x245b8f : 0x39a657);
    if (i === 0) {
      addSelectableSeat(group, train, [-i * 1.35 - 0.28, 1.31, -0.36], 0, 0.3, null);
      addSelectableSeat(group, train, [-i * 1.35 + 0.28, 1.31, -0.36], 0, 0.3, null);
    }
    car.castShadow = true;
  }
  group.add(train);

  for (let i = 0; i < 8; i += 1) {
    const x = -5.8 + (i % 4) * 3.7;
    const z = -3.5 + Math.floor(i / 4) * 4.6;
    const ghost = new THREE.Group();
    ghost.position.set(x, 2.15 + (i % 2) * 0.5, z);
    sphere("floating-ghost-head", 0.48, [0, 0.52, 0], glow, ghost, 16);
    const body = cyl("floating-ghost-body", 0.5, 0.9, [0, 0, 0], glow, ghost, 16);
    body.scale.y = 0.82;
    box("ghost-eye-left", [0.1, 0.08, 0.04], [-0.16, 0.68, -0.45], materials.dark, ghost);
    box("ghost-eye-right", [0.1, 0.08, 0.04], [0.16, 0.68, -0.45], materials.dark, ghost);
    ghost.userData.float = i * 0.8;
    group.add(ghost);
  }
}

function makePenguinSplashCurve() {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7.4, 0.65, 5.8),
    new THREE.Vector3(-6.2, 1.6, 2.3),
    new THREE.Vector3(-4.6, 3.4, -1.2),
    new THREE.Vector3(-2.2, 6.2, -4.8),
    new THREE.Vector3(0.8, 7.4, -5.2),
    new THREE.Vector3(4.2, 5.5, -2.5),
    new THREE.Vector3(6.8, 2.2, 1.8),
    new THREE.Vector3(5.4, 0.55, 5.4),
    new THREE.Vector3(1.5, 0.38, 6.8),
    new THREE.Vector3(-3.8, 0.42, 6.4),
    new THREE.Vector3(-7.4, 0.65, 5.8)
  ], true, "catmullrom", 0.22);
}

function buildPenguinSplash(group, ride) {
  const curve = makePenguinSplashCurve();
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25, metalness: 0.05, transparent: true, opacity: 0.72 });
  const splashMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x9ee9ff, emissiveIntensity: 0.25, roughness: 0.2, transparent: true, opacity: 0.88 });
  box("penguin-water-pool", [14.5, 0.28, 8.3], [0, 0.28, 4.7], waterMat, group);
  const track = new THREE.Mesh(new THREE.TubeGeometry(curve, 180, 0.12, 8, true), materials.steel);
  group.add(track);
  const secondRail = new THREE.Mesh(new THREE.TubeGeometry(curve, 180, 0.05, 8, true), makeMat(0xffffff));
  secondRail.position.y = 0.32;
  group.add(secondRail);
  for (let i = 0; i < 9; i += 1) {
    cyl("penguin-track-support", 0.08, 5 + (i % 3) * 1.2, [-6 + i * 1.5, 2.6 + (i % 3) * 0.6, -2.9 + (i % 2) * 3.2], materials.steel, group, 8);
  }

  const boat = new THREE.Group();
  group.userData.penguinSplash = { curve, boat, elapsed: 0, phaseName: "" };
  box("penguin-boat-body", [2.4, 0.9, 1.35], [0, 0.75, 0], makeMat(0x0f172a), boat);
  box("penguin-boat-belly", [1.8, 0.5, 1.42], [0, 0.95, -0.05], materials.white, boat);
  sphere("penguin-boat-head", 0.42, [0, 1.52, -0.58], makeMat(0x0f172a), boat, 16);
  box("penguin-beak", [0.32, 0.12, 0.18], [0, 1.5, -0.98], makeMat(0xffd15f), boat);
  addSeatedRider(boat, [-0.44, 1.22, 0.1], 0.72, 0xffffff);
  addSeatedRider(boat, [0.44, 1.22, 0.1], 0.72, 0x245b8f);
  addSelectableSeat(group, boat, [-0.44, 1.1, -0.18], 0, 0.32, null);
  addSelectableSeat(group, boat, [0.44, 1.1, -0.18], 0, 0.32, null);
  group.add(boat);

  const splashes = new THREE.Group();
  for (let i = 0; i < 18; i += 1) {
    const drop = sphere("penguin-splash-drop", 0.13 + (i % 3) * 0.04, [-2.7 + (i % 6) * 1.05, 0.95 + Math.random() * 1.4, 4.1 + Math.floor(i / 6) * 0.65], splashMat, splashes, 10);
    drop.userData.float = i * 0.3;
  }
  group.userData.splashDrops = splashes;
  group.add(splashes);
  label("PENGUIN SPLASH", [ride.position[0], 8.4, ride.position[2] + 4.8], 32, 7.2, 0.9);
}

function buildPlayground(group, ride) {
  box("net-frame-a", [0.35, 5, 0.35], [-4, 2.5, -2], materials.steel, group);
  box("net-frame-b", [0.35, 5, 0.35], [4, 2.5, -2], materials.steel, group);
  box("climb-net", [8.4, 0.12, 5.5], [0, 4.2, -2], materials.glass, group).rotation.x = Math.PI / 4;
  const slide = box("big-slide", [2.3, 0.35, 8], [3.7, 2.1, 3], makeMat(ride.color), group);
  slide.rotation.x = -0.45;
  cyl("ball-pit", 3.2, 0.6, [-3, 0.45, 3.4], makeMat(0xffd15f), group, 32);
  for (let i = 0; i < 18; i += 1) {
    sphere("play-ball", 0.22, [-5 + Math.random() * 4, 0.9, 1.8 + Math.random() * 3.2], makeMat(i % 3 === 0 ? 0xd93a32 : i % 3 === 1 ? 0x245b8f : 0x39a657), group, 12);
  }
}

const player = new THREE.Group();
player.position.set(0, 0, 61);
player.rotation.y = Math.PI;
const playerBody = cyl("player-body", 0.72, 1.4, [0, 1.35, 0], makeMat(0x245b8f), player, 18);
playerBody.scale.x = 0.85;
sphere("player-head", 0.56, [0, 2.28, 0], makeMat(0xf1bd8c), player);
box("player-hair", [0.9, 0.22, 0.78], [0, 2.72, 0.05], makeMat(0x2b2118), player);
addSimpleFace(player, "player", 1.55, 2.28, -0.52, "happy");
box("player-bag", [1.15, 1, 0.22], [0, 1.35, 0.62], makeMat(0x172632), player);
const playerGroundScale = 0.78;
player.scale.setScalar(playerGroundScale);
scene.add(player);
const playerLabel = label("我", [0, 3.35, 61], 42, 1.25, 0.78);

function addSimpleFace(parent, prefix, scale, baseY, frontZ, mood = "calm") {
  const eyeW = 0.04 * scale;
  const eyeH = 0.03 * scale;
  const mouthW = 0.1 * scale;
  const mouthH = 0.014 * scale;
  box(`${prefix}-eye-left`, [eyeW, eyeH, 0.012], [-0.09 * scale, baseY + 0.06 * scale, frontZ], materials.dark, parent);
  box(`${prefix}-eye-right`, [eyeW, eyeH, 0.012], [0.09 * scale, baseY + 0.06 * scale, frontZ], materials.dark, parent);
  if (mood === "happy") {
    box(`${prefix}-smile-center`, [mouthW, mouthH, 0.012], [0, baseY - 0.07 * scale, frontZ - 0.002], materials.dark, parent);
    box(`${prefix}-smile-left`, [mouthW * 0.45, mouthH, 0.012], [-0.055 * scale, baseY - 0.052 * scale, frontZ - 0.002], materials.dark, parent).rotation.z = -0.35;
    box(`${prefix}-smile-right`, [mouthW * 0.45, mouthH, 0.012], [0.055 * scale, baseY - 0.052 * scale, frontZ - 0.002], materials.dark, parent).rotation.z = 0.35;
    return;
  }
  if (mood === "curious") {
    box(`${prefix}-mouth-open`, [mouthW * 0.44, mouthH * 2.4, 0.012], [0, baseY - 0.072 * scale, frontZ - 0.002], materials.dark, parent);
    box(`${prefix}-brow-left`, [mouthW * 0.46, mouthH, 0.012], [-0.09 * scale, baseY + 0.13 * scale, frontZ - 0.002], materials.dark, parent).rotation.z = 0.25;
    box(`${prefix}-brow-right`, [mouthW * 0.46, mouthH, 0.012], [0.09 * scale, baseY + 0.13 * scale, frontZ - 0.002], materials.dark, parent).rotation.z = -0.25;
    return;
  }
  box(`${prefix}-mouth-calm`, [mouthW, mouthH, 0.012], [0, baseY - 0.07 * scale, frontZ - 0.002], materials.dark, parent);
}

function createPerson(config) {
  const person = new THREE.Group();
  person.position.set(config.position[0], config.position[1], config.position[2]);
  person.rotation.y = config.rotation || 0;
  const body = cyl(`${config.name}-body`, 0.62, 1.35, [0, 1.35, 0], makeMat(config.shirt || 0x39a657), person, 18);
  body.scale.x = 0.84;
  sphere(`${config.name}-head`, 0.5, [0, 2.23, 0], makeMat(0xf1bd8c), person);
  box(`${config.name}-hair`, [0.78, 0.2, 0.66], [0, 2.62, 0.03], makeMat(config.hair || 0x2b2118), person);
  addSimpleFace(person, config.name, 1.25, 2.23, -0.46, config.expression || "happy");
  box(`${config.name}-leg-left`, [0.32, 0.85, 0.32], [-0.22, 0.42, 0], makeMat(config.pants || 0x172632), person);
  box(`${config.name}-leg-right`, [0.32, 0.85, 0.32], [0.22, 0.42, 0], makeMat(config.pants || 0x172632), person);
  box(`${config.name}-arm-left`, [0.22, 0.85, 0.22], [-0.75, 1.42, 0], makeMat(config.shirt || 0x39a657), person).rotation.z = -0.18;
  box(`${config.name}-arm-right`, [0.22, 0.85, 0.22], [0.75, 1.42, 0], makeMat(config.shirt || 0x39a657), person).rotation.z = 0.18;
  if (config.cap) {
    box(`${config.name}-cap`, [1, 0.24, 0.78], [0, 2.82, 0], makeMat(config.cap), person);
  }
  if (config.badge) {
    box(`${config.name}-ticket-scanner`, [0.48, 0.28, 0.16], [-0.76, 1.78, -0.16], makeMat(0xffd15f), person);
    box(`${config.name}-badge`, [0.24, 0.24, 0.08], [0.38, 1.8, -0.48], makeMat(0xffd15f), person);
  }
  scene.add(person);
  return person;
}

function createTinyVisitor(config) {
  const visitor = new THREE.Group();
  visitor.position.set(config.position[0], 0, config.position[1]);
  visitor.rotation.y = config.rotation || 0;
  const shirt = makeMat(config.shirt);
  const pants = makeMat(config.pants);
  const skin = makeMat(0xf1bd8c);
  const body = cyl("visitor-body", 0.25, 0.76, [0, 0.92, 0], shirt, visitor, 10);
  body.scale.x = 0.78;
  sphere("visitor-head", 0.22, [0, 1.42, 0], skin, visitor, 10);
  box("visitor-hair", [0.34, 0.09, 0.28], [0, 1.58, 0.02], makeMat(config.hair), visitor);
  addSimpleFace(visitor, "visitor", 0.55, 1.42, -0.205, config.expression || "calm");
  box("visitor-leg-left", [0.12, 0.48, 0.12], [-0.09, 0.34, 0], pants, visitor);
  box("visitor-leg-right", [0.12, 0.48, 0.12], [0.09, 0.34, 0], pants, visitor);
  visitor.scale.setScalar(config.scale || 1);
  return visitor;
}

function addCrowdVisitors(count) {
  const shirts = [0xd93a32, 0x245b8f, 0xffd15f, 0x39a657, 0xf06aa3, 0x7c4dff, 0xffffff];
  const pants = [0x172632, 0x245b8f, 0x5b4636, 0x303b45];
  const hairs = [0x2b2118, 0x523923, 0x111111, 0x7b4f2a];
  const expressions = ["happy", "calm", "curious", "happy", "calm"];
  const flowCount = Math.floor(count * 0.52);
  for (let i = 0; i < flowCount; i += 1) {
    const lane = i % 9;
    const visitor = createTinyVisitor({
      position: [
        -4.4 + lane * 1.1 + (Math.random() - 0.5) * 0.22,
        -44 + Math.random() * 106
      ],
      rotation: 0,
      shirt: shirts[(i + lane) % shirts.length],
      pants: pants[(i + 2 * lane) % pants.length],
      hair: hairs[(i + 3) % hairs.length],
      expression: expressions[(i + lane) % expressions.length],
      scale: 0.78 + Math.random() * 0.42
    });
    visitor.userData = {
      flow: true,
      laneX: visitor.position.x,
      phase: Math.random() * Math.PI * 2,
      speed: 1.2 + Math.random() * 1.4,
      sway: 0.08 + Math.random() * 0.16
    };
    scene.add(visitor);
    crowdVisitors.push(visitor);
  }
  const clusters = [
    { x: 0, z: 47, rx: 14, rz: 6 },
    { x: -18, z: -24, rx: 11, rz: 8 },
    { x: 8, z: -26, rx: 11, rz: 8 },
    { x: -6, z: 2, rx: 12, rz: 7 },
    { x: 18, z: 4, rx: 12, rz: 7 },
    { x: 4, z: 25, rx: 15, rz: 8 },
    { x: 29, z: 24, rx: 10, rz: 8 }
  ];
  for (let i = flowCount; i < count; i += 1) {
    const cluster = clusters[i % clusters.length];
    const lane = i % 5;
    const x = cluster.x + (Math.random() - 0.5) * cluster.rx * 2;
    const z = cluster.z + (Math.random() - 0.5) * cluster.rz * 2;
    const visitor = createTinyVisitor({
      position: [THREE.MathUtils.clamp(x, -42, 42), THREE.MathUtils.clamp(z, -44, 61)],
      rotation: Math.random() * Math.PI * 2,
      shirt: shirts[i % shirts.length],
      pants: pants[(i + lane) % pants.length],
      hair: hairs[(i + 2) % hairs.length],
      expression: expressions[(i + 2 * lane) % expressions.length],
      scale: 0.78 + Math.random() * 0.42
    });
    visitor.userData = {
      origin: visitor.position.clone(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.18 + Math.random() * 0.38,
      radiusX: 0.8 + Math.random() * 2.8,
      radiusZ: 0.8 + Math.random() * 2.8,
      pause: Math.random() > 0.72
    };
    scene.add(visitor);
    crowdVisitors.push(visitor);
  }
}

function updateRideList() {
  rideData.forEach((ride, index) => ride.listButton?.classList.toggle("active", index === selectedIndex));
}

function focusRide(index) {
  if (riding) leaveRide();
  selectedIndex = index;
  selectedSeatRideId = null;
  selectedSeatIndex = 0;
  const ride = rideData[index];
  player.position.set(ride.position[0], 0, ride.position[2] + 9);
  player.rotation.y = Math.PI;
  const focused = interactive[index];
  const count = syncSeatSelection(focused);
  statusText.textContent = count > 1
    ? `已经走到 ${ride.name} 前面。可以先点“选座”挑 1/${count} 号座位，再点“乘坐最近项目”。`
    : `已经走到 ${ride.name} 前面。点“乘坐最近项目”就可以体验。`;
  updateRideList();
  updateSeatButton(focused);
}

function rideNearest() {
  if (!entrance.ticketChecked && player.position.z > 51) {
    statusText.textContent = "检票员说：先点“检票入园”，检完票才能去坐项目。";
    return;
  }
  if (!nearest) return;
  const seats = nearest.userData.seats || [];
  const count = syncSeatSelection(nearest);
  const seat = count ? seats[selectedSeatIndex] : null;
  if (!seat) {
    statusText.textContent = `${nearest.userData.ride.name} 现在只能参观，还没有可坐的座椅。`;
    updateSeatButton(nearest);
    return;
  }
  riding = nearest;
  rideSeat = seat;
  rideControl.speed = 1;
  rideControl.paused = false;
  if (riding.userData.coasterTrain) {
    riding.userData.coasterTrain.elapsed = 0;
    riding.userData.coasterTrain.phaseName = "";
    startCoasterSound();
  }
  if (riding.userData.ghostTrain || riding.userData.penguinSplash) {
    riding.userData.motion = 0;
    if (riding.userData.ghostTrain) riding.userData.ghostTrain.phaseName = "";
    if (riding.userData.penguinSplash) riding.userData.penguinSplash.phaseName = "";
  }
  if (riding.userData.darkRide) {
    riding.userData.motion = 0;
    riding.userData.darkRide.phaseName = "";
    riding.userData.darkRide.score = 0;
    riding.userData.darkRide.lastShotAt = -1;
    riding.userData.darkRide.targets.forEach((target) => {
      target.userData.hit = false;
      target.scale.setScalar(1);
      target.visible = true;
    });
    riding.userData.darkRide.shots.forEach((shot) => shot.parent?.remove(shot));
    riding.userData.darkRide.shots = [];
  }
  startRideSound(riding.userData.coasterTrain || riding.userData.spinBumpArm || riding.userData.ghostTrain || riding.userData.penguinSplash ? "wild" : "gentle");
  if (rideSeat.userData.dummyRider) rideSeat.userData.dummyRider.visible = false;
  rideSeat.add(player);
  player.position.set(0, 0, 0);
  player.rotation.set(0, 0, 0);
  player.scale.setScalar(rideSeat.userData.playerScale || 0.34);
  playerLabel.visible = false;
  statusText.textContent = `你已经坐进 ${riding.userData.ride.name} 的第 ${rideSeat.userData.seatNumber || selectedSeatIndex + 1}/${count} 号座位了，安全杆在前面，镜头会跟着座位动。点“下车”回到出口。`;
  if (riding.userData.darkRide) {
    statusText.textContent = `你已经坐进 ${riding.userData.ride.name} 的射击小汽车第 ${rideSeat.userData.seatNumber || selectedSeatIndex + 1}/${count} 号座位。按 F 或 J 可以开枪打目标。`;
  }
  updateSeatButton(riding);
  updateRideControlButtons();
}

function openTicketGate(message) {
  entrance.ticketChecked = true;
  entrance.gateArms.forEach((arm, index) => {
    arm.rotation.y = index === 0 ? Math.PI / 2 : -Math.PI / 2;
    arm.material = makeMat(0x39a657);
  });
  buttons.ticket.textContent = "已检票";
  statusText.textContent = message;
}

function checkTicket() {
  const distance = player.position.distanceTo(new THREE.Vector3(0, 0, 57));
  if (distance > 9) {
    statusText.textContent = "先走到大门检票口旁边，检票员才能帮你刷票。";
    return;
  }
  openTicketGate("检票员已经刷票，闸机打开了。你和朋友可以一起进园。");
}

function manualCheckIn() {
  if (!entrance.ticketChecked) {
    openTicketGate("检查进入完成，闸机已经打开；Finding Larva 旁边的手动控制台可以用了。");
    return;
  }
  statusText.textContent = nearest?.userData.ride.model === "darkRide"
    ? "Finding Larva 手动控制台检查完成，可以按绿色启动键让射击小车出发。"
    : "检查进入完成，靠近 Finding Larva 入口就能使用旁边的手动控制台。";
}

function manualStartRide() {
  if (nearest?.userData.ride.model === "darkRide") {
    statusText.textContent = "绿色启动键已按下，Finding Larva 射击小车准备出发。";
  }
  rideNearest();
}

function leaveRide() {
  if (!riding) return;
  const ride = riding.userData.ride;
  if (riding.userData.coasterTrain) stopCoasterSound();
  stopRideSound();
  restoreSeatDummy();
  scene.add(player);
  player.position.set(ride.position[0] + 7, 0, ride.position[2] + 7);
  player.rotation.set(0, Math.PI, 0);
  player.scale.setScalar(playerGroundScale);
  playerLabel.visible = true;
  rideSeat = null;
  riding = null;
  rideControl.paused = false;
  statusText.textContent = "已经下车了，可以继续在乐园里面走。";
  updateSeatButton(nearest);
  updateRideControlButtons();
}

function moveNextRide() {
  if (riding) leaveRide();
  selectedIndex = (selectedIndex + 1) % rideData.length;
  focusRide(selectedIndex);
}

function resetPlayer() {
  stopCoasterSound();
  stopRideSound();
  restoreSeatDummy();
  scene.add(player);
  riding = null;
  rideSeat = null;
  rideControl.speed = 1;
  rideControl.paused = false;
  selectedSeatIndex = 0;
  selectedSeatRideId = null;
  player.scale.setScalar(playerGroundScale);
  playerLabel.visible = true;
  player.position.set(0, 0, 61);
  player.rotation.y = Math.PI;
  entrance.ticketChecked = false;
  entrance.gateArms.forEach((arm, index) => {
    arm.rotation.y = index === 0 ? 0.28 : -0.28;
    arm.material = makeMat(0xd93a32);
  });
  buttons.ticket.textContent = "检票入园";
  statusText.textContent = "回到入口。你和朋友站在检票口前，先找检票员检票。";
  updateSeatButton(null);
  updateRideControlButtons();
}

function updateNearest() {
  if (riding) {
    nearest = riding;
    const ride = riding.userData.ride;
    const count = riding.userData.seats?.length || 1;
    nearName.textContent = ride.name;
    nearInfo.textContent = `${ride.zone} · 你正坐在第 ${rideSeat?.userData.seatNumber || selectedSeatIndex + 1}/${count} 号座位里，安全杆在前面，项目和乘客一起动。`;
    selectedIndex = rideData.findIndex((item) => item.id === ride.id);
    updateRideList();
    updateSeatButton(riding);
    return;
  }

  if (player.position.z > 51 && !entrance.ticketChecked) {
    nearest = null;
    nearName.textContent = "入口检票口";
    nearInfo.textContent = "检票员在右边，点“检票入园”后闸机会打开。";
    updateRideList();
    updateSeatButton(null);
    return;
  }

  let best = null;
  let bestDistance = Infinity;
  interactive.forEach((group) => {
    const distance = player.position.distanceTo(group.position);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = group;
    }
  });
  nearest = bestDistance < 15 ? best : null;
  if (nearest) {
    const ride = nearest.userData.ride;
    const count = syncSeatSelection(nearest);
    nearName.textContent = ride.name;
    nearInfo.textContent = count > 1
      ? `${ride.zone} · ${ride.info} · 当前选座 ${selectedSeatIndex + 1}/${count}`
      : `${ride.zone} · ${ride.info}`;
    selectedIndex = rideData.findIndex((item) => item.id === ride.id);
  } else {
    const atGate = player.position.z > 51;
    nearName.textContent = atGate ? "入口检票口" : "附近没有项目";
    nearInfo.textContent = atGate ? "检票员在右边，点“检票入园”后闸机会打开。" : "沿着黄色道路走，靠近设施后就能乘坐。";
    selectedSeatRideId = null;
  }
  updateRideList();
  updateSeatButton(nearest);
}

function updateCompanion(elapsed) {
  if (!entrance.friend || riding) return;
  const desired = entrance.ticketChecked
    ? new THREE.Vector3(Math.sin(elapsed * 0.27) * 9, 0, 37 + Math.cos(elapsed * 0.22) * 7)
    : new THREE.Vector3(-3.6 + Math.sin(elapsed * 0.8) * 0.35, 0, 61.3);
  entrance.friend.position.lerp(desired, 0.018);
  entrance.friend.rotation.y = Math.atan2(
    desired.x - entrance.friend.position.x,
    desired.z - entrance.friend.position.z
  );
}

function updateCrowd(elapsed) {
  crowdVisitors.forEach((visitor, index) => {
    const data = visitor.userData;
    if (data.flow) {
      visitor.position.z += data.speed * 0.028;
      if (visitor.position.z > 62) {
        visitor.position.z = -45;
        visitor.position.x = data.laneX + (Math.random() - 0.5) * 0.25;
      }
      visitor.position.x = data.laneX + Math.sin(elapsed * 1.4 + data.phase) * data.sway;
      visitor.position.y = Math.sin(elapsed * 5.2 + index) * 0.018;
      visitor.rotation.y = 0;
      return;
    }
    if (data.pause && Math.sin(elapsed * 0.45 + data.phase) > 0.6) {
      visitor.rotation.y += Math.sin(elapsed + index) * 0.003;
      return;
    }
    const t = elapsed * data.speed + data.phase;
    const nextX = data.origin.x + Math.sin(t) * data.radiusX;
    const nextZ = data.origin.z + Math.cos(t * 0.82) * data.radiusZ;
    const dx = nextX - visitor.position.x;
    const dz = nextZ - visitor.position.z;
    visitor.position.x = THREE.MathUtils.lerp(visitor.position.x, nextX, 0.035);
    visitor.position.z = THREE.MathUtils.lerp(visitor.position.z, nextZ, 0.035);
    if (Math.abs(dx) + Math.abs(dz) > 0.001) {
      visitor.rotation.y = Math.atan2(dx, dz);
    }
    visitor.position.y = Math.sin(elapsed * 3.2 + index) * 0.025;
  });
}

function updatePlayer(delta) {
  if (riding) return;
  const turnSpeed = 2.35;
  const moveSpeed = keys.has("Shift") ? 12 : 7.5;
  if (keys.has("a") || keys.has("ArrowLeft")) player.rotation.y += turnSpeed * delta;
  if (keys.has("d") || keys.has("ArrowRight")) player.rotation.y -= turnSpeed * delta;
  if (keys.has("q")) viewState.targetPitch = THREE.MathUtils.clamp(viewState.targetPitch + delta * 1.25, -0.42, 0.85);
  if (keys.has("e")) viewState.targetPitch = THREE.MathUtils.clamp(viewState.targetPitch - delta * 1.25, -0.42, 0.85);
  if (keys.has("z")) viewState.targetDistance = THREE.MathUtils.clamp(viewState.targetDistance - delta * 8, 7.5, 22);
  if (keys.has("x")) viewState.targetDistance = THREE.MathUtils.clamp(viewState.targetDistance + delta * 8, 7.5, 22);

  const forward = new THREE.Vector3(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));
  const move = new THREE.Vector3();
  if (keys.has("w") || keys.has("ArrowUp")) move.add(forward);
  if (keys.has("s") || keys.has("ArrowDown")) move.sub(forward);
  if (pointer.active) {
    move.add(forward.multiplyScalar(-pointer.y));
    player.rotation.y -= pointer.x * turnSpeed * delta * 0.85;
  }

  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(moveSpeed * delta);
    velocity.lerp(move, 0.45);
  } else {
    velocity.multiplyScalar(0.82);
  }
  player.position.add(velocity);
  if (!entrance.ticketChecked && player.position.z < 53) {
    player.position.z = 53;
    velocity.z = Math.max(0, velocity.z);
    statusText.textContent = "检票闸还没开，先点“检票入园”。";
  }
  player.position.x = THREE.MathUtils.clamp(player.position.x, -43, 43);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -45, 63);
}

function updateRides(elapsed, delta) {
  interactive.forEach((group) => {
    const controlled = riding === group;
    const rideDelta = controlled && rideControl.paused ? 0 : delta * (controlled ? rideControl.speed : 1);
    group.userData.motion += rideDelta;
    if (group.userData.rotor) {
      const rotorTime = controlled ? group.userData.motion : elapsed;
      group.userData.rotor.rotation.y += rideDelta * (0.45 + (group.userData.ride.id.length % 4) * 0.18);
      group.userData.rotor.position.y = Math.sin(rotorTime * 1.4 + group.position.x) * 0.18;
      if (controlled) updateRideSound(0.32 + Math.abs(Math.sin(rotorTime * 1.4 + group.position.x)) * 0.28);
    }
    if (group.userData.spinBumpArm) {
      const spinTime = group.userData.motion;
      const swing = Math.sin(spinTime * 1.18);
      const endpointSlow = 0.45 + 0.55 * Math.abs(Math.cos(spinTime * 1.18));
      group.userData.spinBumpArm.rotation.z = swing * 0.72;
      group.userData.spinBumpArm.rotation.y += rideDelta * 0.28 * endpointSlow;
      group.userData.spinBumpArm.position.x = swing * 1.35;
      group.userData.spinBumpArm.position.y = 0.35 + (1 - Math.abs(swing)) * 0.65;
      if (controlled) {
        const side = swing > 0 ? "右边" : "左边";
        if (!rideControl.paused) statusText.textContent = `Oscar Spin Bomb：像海盗船一样摆到${side}，速度 ${rideControl.speed.toFixed(1).replace(".0", "")} 倍。`;
        updateRideSound(0.55 + Math.abs(swing) * 0.4);
      }
    }
    if (group.userData.train) {
      const t = (elapsed * 0.08) % 1;
      const angle = t * Math.PI * 2;
      group.userData.train.position.set(Math.cos(angle) * 7.4, 0.75, Math.sin(angle) * 4.7);
      group.userData.train.rotation.y = -angle + Math.PI / 2;
    }
    if (group.userData.darkRide) {
      const ride = group.userData.darkRide;
      const curve = ride.curve;
      const duration = 32;
      const baseT = controlled ? Math.min(group.userData.motion / duration, 0.995) : (elapsed * 0.04) % 1;
      const point = curve.getPoint(baseT);
      const next = curve.getPoint((baseT + 0.012) % 1);
      ride.car.position.copy(point);
      ride.car.rotation.y = Math.atan2(next.x - point.x, next.z - point.z);
      ride.car.rotation.z = Math.sin(baseT * Math.PI * 7) * 0.035;
      ride.targets.forEach((target, index) => {
        if (!target.userData.hit) {
          target.position.y += Math.sin(elapsed * 2.2 + index) * 0.0025;
          target.rotation.y += delta * (0.45 + index * 0.04);
        } else {
          target.scale.lerp(new THREE.Vector3(0.35, 0.35, 0.35), 0.12);
        }
      });
      ride.shots = ride.shots.filter((shot) => {
        shot.userData.life -= delta;
        shot.material.opacity = Math.max(0, shot.userData.life * 2.8);
        if (shot.userData.life <= 0) {
          shot.parent?.remove(shot);
          return false;
        }
        return true;
      });
      if (controlled) {
        const message = baseT < 0.22
          ? "射击小车正在进入室内轨道，前面有发光目标。"
          : baseT < 0.58
            ? "小汽车正在拐弯，按 F 或 J 可以开枪。"
            : baseT < 0.86
              ? `继续打目标，当前打中 ${ride.score} 个。`
              : `快到出口了，一共打中 ${ride.score} 个目标。`;
        if (!rideControl.paused && ride.phaseName !== message) {
          ride.phaseName = message;
          statusText.textContent = `${message} 速度 ${rideControl.speed.toFixed(1).replace(".0", "")} 倍。`;
        }
        updateRideSound(0.3 + Math.min(ride.score, 5) * 0.08);
      }
    }
    if (group.userData.ghostTrain) {
      const ride = group.userData.ghostTrain;
      const curve = ride.curve;
      const duration = 34;
      const baseT = controlled ? Math.min(group.userData.motion / duration, 0.995) : (elapsed * 0.055) % 1;
      const point = curve.getPoint(baseT);
      const next = curve.getPoint((baseT + 0.012) % 1);
      ride.train.position.copy(point);
      ride.train.rotation.y = Math.atan2(next.x - point.x, next.z - point.z);
      ride.train.rotation.z = Math.sin(baseT * Math.PI * 8) * 0.08;
      if (controlled) {
        const message = baseT < 0.2
          ? "鬼屋小火车：车厢慢慢开进灵鬼屋。"
          : baseT < 0.48
            ? "鬼影出来了，小火车突然转弯跑！"
            : baseT < 0.78
              ? "很多游客跟你一起坐着，车厢绕过黑暗弯道。"
              : "快到出口了，鬼影在后面飘。";
        if (!rideControl.paused && ride.phaseName !== message) {
          ride.phaseName = message;
          statusText.textContent = `${message} 速度 ${rideControl.speed.toFixed(1).replace(".0", "")} 倍。`;
        }
        updateRideSound(baseT > 0.2 && baseT < 0.68 ? 0.76 : 0.42);
      }
    }
    if (group.userData.penguinSplash) {
      const ride = group.userData.penguinSplash;
      const curve = ride.curve;
      const duration = 24;
      const baseT = controlled ? Math.min(group.userData.motion / duration, 0.995) : (elapsed * 0.07) % 1;
      const point = curve.getPoint(baseT);
      const next = curve.getPoint((baseT + 0.01) % 1);
      ride.boat.position.copy(point);
      ride.boat.rotation.y = Math.atan2(next.x - point.x, next.z - point.z);
      ride.boat.rotation.x = THREE.MathUtils.clamp((point.y - next.y) * 0.16, -0.42, 0.55);
      ride.boat.rotation.z = Math.sin(baseT * Math.PI * 6) * 0.1;
      const splashPower = baseT > 0.56 && baseT < 0.72 ? 1 : 0.18;
      group.userData.splashDrops.children.forEach((drop, index) => {
        drop.visible = splashPower > 0.3 || index % 4 === 0;
        drop.position.y = 0.85 + Math.abs(Math.sin(elapsed * 5 + index)) * (0.35 + splashPower * 1.8);
        drop.scale.setScalar(0.65 + splashPower * (0.8 + (index % 3) * 0.12));
      });
      if (controlled) {
        const message = baseT < 0.32
          ? "企鹅水花：企鹅车正在慢慢爬上高处。"
          : baseT < 0.56
            ? "到最高点了，马上往水池冲下去。"
            : baseT < 0.72
              ? "嗖！冲进水里，水花扑上来了！"
              : "企鹅车开始减速，水花慢慢落下来。";
        if (!rideControl.paused && ride.phaseName !== message) {
          ride.phaseName = message;
          statusText.textContent = `${message} 速度 ${rideControl.speed.toFixed(1).replace(".0", "")} 倍。`;
        }
        updateRideSound(splashPower > 0.3 ? 0.95 : 0.5);
      }
    }
    if (group.userData.coasterTrain) {
      const train = group.userData.coasterTrain;
      const { curve, cars } = train;
      const rideDuration = 28;
      if (controlled) {
        train.elapsed = Math.min(rideDuration, train.elapsed + rideDelta);
      } else {
        train.elapsed = (train.elapsed + delta * 0.42) % rideDuration;
      }
      const baseT = controlled && train.elapsed >= rideDuration ? 0.995 : (train.elapsed / rideDuration) % 1;
      const phase = getCoasterPhase(baseT);
      const phaseSpeed = coasterSpeedForProgress(baseT);
      if (controlled) {
        updateCoasterSound(phase.sound, phaseSpeed);
        if (!rideControl.paused && train.phaseName !== phase.name) {
          train.phaseName = phase.name;
          statusText.textContent = `Dancing Oscar：${phase.name}，速度 ${rideControl.speed.toFixed(1).replace(".0", "")} 倍。`;
        }
        if (train.elapsed >= rideDuration) {
          stopCoasterSound();
          statusText.textContent = "Dancing Oscar 已经进站停稳，游客可以点“下车”下来。";
        }
      }
      cars.forEach((car) => {
        const t = (baseT - car.userData.carOffset + 1) % 1;
        const nextT = (t + 0.006) % 1;
        const point = curve.getPoint(t);
        const next = curve.getPoint(nextT);
        car.position.copy(point);
        car.position.y += 0.65;
        car.rotation.y = Math.atan2(next.x - point.x, next.z - point.z);
        car.rotation.x = THREE.MathUtils.clamp((point.y - next.y) * 0.14, -0.45, 0.45);
        car.rotation.z = THREE.MathUtils.clamp((next.y - point.y) * 0.28 + Math.sin(t * Math.PI * 4) * 0.12, -0.48, 0.48);
        const cabin = car.userData.cabin;
        if (cabin) {
          const stationSlowdown = baseT < 0.1 || baseT > 0.88 ? 0.25 : 1;
          const spinBoost = phase.sound === "loop" ? 3.35 : phase.sound === "drop" ? 1.75 : 1.25;
          car.userData.spinAngle += rideDelta * (2.25 + phaseSpeed * 2.8) * stationSlowdown * spinBoost * car.userData.spinRate;
          cabin.rotation.y = car.userData.spinAngle + Math.sin(elapsed * 2.8 + car.userData.spinPhase) * 0.22;
          cabin.position.y = Math.sin(elapsed * 7 + car.userData.spinPhase) * 0.025;
        }
        car.traverse((child) => {
          if (child.name?.startsWith("coaster-wheel")) child.rotation.x += rideDelta * (4 + phaseSpeed * 11);
        });
      });
      if (controlled) updateRideSound(rideControl.paused ? 0.08 : phase.sound === "loop" ? 1 : phase.sound === "drop" ? 0.85 : 0.45);
    }
    group.traverse((child) => {
      if (child.userData.curve) {
        const point = child.userData.curve.getPoint((elapsed * 0.06) % 1);
        child.position.copy(point);
        child.rotation.y += delta * 2.2;
      }
      if (child.userData.float !== undefined) {
        child.position.y += Math.sin(elapsed * 2 + child.userData.float) * 0.003;
      }
    });
  });
}

function updateCamera(elapsed) {
  viewState.yaw = THREE.MathUtils.lerp(viewState.yaw, viewState.targetYaw, 0.12);
  viewState.pitch = THREE.MathUtils.lerp(viewState.pitch, viewState.targetPitch, 0.08);
  viewState.distance = THREE.MathUtils.lerp(viewState.distance, viewState.targetDistance, 0.08);
  const lookHeight = THREE.MathUtils.clamp(2 + viewState.pitch * 18, 0.8, 18);
  const target = new THREE.Vector3();
  const focus = getFocusWorldPosition();
  const activeRide = getActiveRideGroup();

  if (viewState.screen === "wide") {
    const wideOffset = new THREE.Vector3(Math.sin(viewState.yaw) * 72, 72 + viewState.pitch * 10, Math.cos(viewState.yaw) * 72 + viewState.distance * 0.24);
    const desired = wideOffset;
    camera.position.lerp(desired, 0.1);
    camera.lookAt(new THREE.Vector3(0, 3.2, -2));
    return;
  }

  if (viewState.screen === "gate") {
    const desired = new THREE.Vector3(-18, 18 + viewState.pitch * 5, 72).applyAxisAngle(upAxis, viewState.yaw);
    camera.position.lerp(desired, 0.1);
    camera.lookAt(new THREE.Vector3(0, 2.4, 48));
    return;
  }

  if (viewState.screen === "ride" && activeRide) {
    const center = activeRide.position.clone();
    const orbit = elapsed * 0.28 + viewState.yaw;
    const desired = center.clone().add(new THREE.Vector3(Math.cos(orbit) * 24, 15 + viewState.pitch * 6, Math.sin(orbit) * 24));
    camera.position.lerp(desired, 0.1);
    camera.lookAt(center.clone().add(new THREE.Vector3(0, 4.5, 0)));
    return;
  }

  if (viewState.screen === "first") {
    const base = focus.clone();
    let direction;
    if (riding && rideSeat) {
      direction = new THREE.Vector3(0, 0, -1).applyQuaternion(rideSeat.getWorldQuaternion(new THREE.Quaternion())).normalize();
      base.add(new THREE.Vector3(0, 1.1, 0));
    } else {
      direction = new THREE.Vector3(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y)).normalize();
      base.add(new THREE.Vector3(0, 2.45, 0));
    }
    direction.applyAxisAngle(upAxis, viewState.yaw).normalize();
    camera.position.lerp(base.add(direction.clone().multiplyScalar(0.45)), 0.18);
    camera.lookAt(base.clone().add(direction.multiplyScalar(13)).add(new THREE.Vector3(0, viewState.pitch * 4, 0)));
    return;
  }

  if (riding && rideSeat) {
    const seatWorld = new THREE.Vector3();
    rideSeat.getWorldPosition(seatWorld);
    const seatDir = new THREE.Vector3(0, 0, -1).applyQuaternion(rideSeat.getWorldQuaternion(new THREE.Quaternion())).normalize();
    const sideDir = new THREE.Vector3(1, 0, 0).applyQuaternion(rideSeat.getWorldQuaternion(new THREE.Quaternion())).normalize();
    target.copy(seatWorld).add(new THREE.Vector3(0, 0.75 + viewState.pitch * 2.2, 0));
    let rideCam;
    if (riding.userData.ride.model === "spinBump") {
      rideCam = riding.position
        .clone()
        .add(new THREE.Vector3(10.5, 7.2 + viewState.pitch * 3, 10.5));
    } else if (["dragon", "whirl", "carousel", "flying"].includes(riding.userData.ride.model)) {
      const center = riding.position.clone();
      const outward = seatWorld.clone().sub(center);
      outward.y = 0;
      outward.normalize();
      const tangent = new THREE.Vector3(-outward.z, 0, outward.x);
      rideCam = seatWorld
        .clone()
        .add(outward.multiplyScalar(6.6))
        .add(tangent.multiplyScalar(1.4))
        .add(new THREE.Vector3(0, 3.5 + viewState.pitch * 3, 0));
    } else {
      rideCam = seatWorld
        .clone()
        .add(seatDir.multiplyScalar(-5.8))
        .add(sideDir.multiplyScalar(1.8))
        .add(new THREE.Vector3(0, 3.1 + viewState.pitch * 3, 0));
    }
    if (Math.abs(viewState.yaw) > 0.001) {
      const offset = rideCam.clone().sub(target).applyAxisAngle(upAxis, viewState.yaw);
      rideCam.copy(target).add(offset);
    }
    camera.position.lerp(rideCam, 0.14);
    camera.lookAt(target);
    return;
  }

  if (!entrance.ticketChecked && player.position.z > 51) {
    const desired = new THREE.Vector3(0, 58 + viewState.pitch * 12, 62 + viewState.distance * 0.18).applyAxisAngle(upAxis, viewState.yaw);
    camera.position.lerp(desired, 0.12);
    camera.lookAt(new THREE.Vector3(0, lookHeight, 26));
    return;
  }

  const forward = new THREE.Vector3(Math.sin(player.rotation.y + viewState.yaw), 0, Math.cos(player.rotation.y + viewState.yaw));
  const desired = player.position.clone().sub(forward.multiplyScalar(viewState.distance));
  desired.y = 9.4 + viewState.pitch * 3.2;
  desired.x += Math.cos(elapsed * 0.7) * 0.08;
  camera.position.lerp(desired, 0.12);
  target.copy(player.position);
  target.y = lookHeight;
  camera.lookAt(target);
}

function updatePlayerLabel() {
  if (riding) return;
  playerLabel.position.set(player.position.x, player.position.y + 3.35, player.position.z);
}

function nudgeView(action) {
  if (action === "lookUp") viewState.targetPitch = THREE.MathUtils.clamp(viewState.targetPitch + 0.16, -0.42, 0.85);
  if (action === "lookDown") viewState.targetPitch = THREE.MathUtils.clamp(viewState.targetPitch - 0.16, -0.42, 0.85);
  if (action === "zoomIn") viewState.targetDistance = THREE.MathUtils.clamp(viewState.targetDistance - 1.7, 7.5, 22);
  if (action === "zoomOut") viewState.targetDistance = THREE.MathUtils.clamp(viewState.targetDistance + 1.7, 7.5, 22);
}

function makeBeamBetween(start, end, material) {
  const direction = end.clone().sub(start);
  const length = Math.max(direction.length(), 0.1);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, length, 8), material);
  beam.position.copy(start).add(end).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  beam.userData.life = 0.28;
  return beam;
}

function playShotSound() {
  const context = ensureAudio();
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = 820;
  gain.gain.value = 0.035;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);
  oscillator.stop(context.currentTime + 0.12);
}

function shootDarkRide() {
  if (!riding?.userData.darkRide) {
    statusText.textContent = "只有坐进射击小汽车时，F 或 J 才是开枪。";
    return;
  }
  const ride = riding.userData.darkRide;
  const now = clock.elapsedTime;
  if (now - ride.lastShotAt < 0.18) return;
  ride.lastShotAt = now;
  const car = ride.car;
  const forward = new THREE.Vector3(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y)).normalize();
  const muzzle = car.position.clone().add(forward.clone().multiplyScalar(1.25)).add(new THREE.Vector3(0, 1.45, 0));
  const target = ride.targets
    .filter((candidate) => !candidate.userData.hit)
    .map((candidate) => {
      const toTarget = candidate.position.clone().sub(muzzle);
      const aim = toTarget.clone();
      aim.y = 0;
      const front = aim.lengthSq() > 0.001 ? forward.dot(aim.normalize()) : 0;
      return { candidate, score: front * 12 - toTarget.length() };
    })
    .filter((item) => item.score > -6)
    .sort((a, b) => b.score - a.score)[0]?.candidate;
  const end = target ? target.position.clone() : muzzle.clone().add(forward.multiplyScalar(6));
  if (target) {
    target.userData.hit = true;
    ride.score += 1;
    statusText.textContent = `打中了！Finding Larva 射击小车：已经打中 ${ride.score} 个目标。`;
  } else {
    statusText.textContent = "开枪了，不过这一下没有打中目标，再瞄准前面的发光圆牌。";
  }
  const beam = makeBeamBetween(muzzle, end, ride.beamMat.clone());
  riding.add(beam);
  ride.shots.push(beam);
  playShotSound();
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.04);
  const elapsed = clock.elapsedTime;
  resize();
  updatePlayer(delta);
  updateCompanion(elapsed);
  updateCrowd(elapsed);
  updateRides(elapsed, delta);
  updateNearest();
  updatePlayerLabel();
  updateCamera(elapsed);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function setupInput() {
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    keys.add(key);
    if (event.repeat && !["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright", "shift", "q", "e", "z", "x"].includes(key)) return;
    const screenShortcuts = {
      "1": "follow",
      "2": "first",
      "3": "seat",
      "4": "wide",
      "5": "ride",
      "6": "gate"
    };
    if (screenShortcuts[key]) {
      setScreenMode(screenShortcuts[key]);
      event.preventDefault();
      return;
    }
    if (key === "enter" || key === "r") {
      rideNearest();
      event.preventDefault();
      return;
    }
    if (key === "escape") {
      leaveRide();
      event.preventDefault();
      return;
    }
    if (key === "t") {
      checkTicket();
      event.preventDefault();
      return;
    }
    if (key === "c") {
      chooseSeat();
      event.preventDefault();
      return;
    }
    if (key === "n") {
      moveNextRide();
      event.preventDefault();
      return;
    }
    if (key === "p") {
      toggleRidePause();
      event.preventDefault();
      return;
    }
    if (key === "f" || key === "j") {
      shootDarkRide();
      event.preventDefault();
      return;
    }
    if (key === "-" || key === "_") {
      changeRideSpeed(-1);
      event.preventDefault();
      return;
    }
    if (key === "=" || key === "+") {
      changeRideSpeed(1);
      event.preventDefault();
      return;
    }
    if (key === "0") {
      resetPlayer();
      event.preventDefault();
    }
  });
  window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      nudgeView(viewButton.dataset.view);
      return;
    }
    const screenButton = event.target.closest("[data-screen]");
    if (screenButton) {
      setScreenMode(screenButton.dataset.screen);
      return;
    }
    const rideControlButton = event.target.closest("[data-ride-control]");
    if (rideControlButton) {
      const action = rideControlButton.dataset.rideControl;
      if (action === "slow") changeRideSpeed(-1);
      if (action === "fast") changeRideSpeed(1);
      if (action === "pause") toggleRidePause();
      return;
    }
    const moveButton = event.target.closest("[data-move]");
    if (!moveButton || riding) return;
    const action = moveButton.dataset.move;
    if (action === "turnLeft") player.rotation.y += Math.PI / 8;
    if (action === "turnRight") player.rotation.y -= Math.PI / 8;
    const forward = new THREE.Vector3(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));
    if (action === "forward") player.position.add(forward.multiplyScalar(2.4));
    if (action === "backward") player.position.add(forward.multiplyScalar(-2.4));
  });

  canvas.addEventListener("wheel", (event) => {
    viewState.targetDistance = THREE.MathUtils.clamp(viewState.targetDistance + Math.sign(event.deltaY) * 1.4, 7.5, 22);
    event.preventDefault();
  }, { passive: false });

  const startLookDrag = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    lookDrag.active = true;
    lookDrag.x = event.clientX;
    lookDrag.y = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };
  const updateLookDrag = (event) => {
    if (!lookDrag.active) return;
    const dx = event.clientX - lookDrag.x;
    const dy = event.clientY - lookDrag.y;
    lookDrag.x = event.clientX;
    lookDrag.y = event.clientY;
    viewState.targetYaw -= dx * 0.006;
    viewState.targetPitch = THREE.MathUtils.clamp(viewState.targetPitch - dy * 0.0045, -0.42, 0.85);
    event.preventDefault();
  };
  const endLookDrag = (event) => {
    lookDrag.active = false;
    if (event?.pointerId !== undefined) canvas.releasePointerCapture?.(event.pointerId);
  };
  canvas.addEventListener("pointerdown", startLookDrag);
  window.addEventListener("pointermove", updateLookDrag, { passive: false });
  window.addEventListener("pointerup", endLookDrag);
  window.addEventListener("pointercancel", endLookDrag);

  const startStick = (event) => {
    pointer.active = true;
    updateStick(event);
  };
  const endStick = () => {
    pointer.active = false;
    pointer.x = 0;
    pointer.y = 0;
    moveKnob.style.transform = "translate(-50%, -50%)";
  };
  const updateStick = (event) => {
    if (!pointer.active) return;
    const touch = event.touches?.[0] || event;
    const rect = moveStick.getBoundingClientRect();
    const dx = touch.clientX - rect.left - rect.width / 2;
    const dy = touch.clientY - rect.top - rect.height / 2;
    const max = rect.width * 0.34;
    const length = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(length, max);
    pointer.x = (dx / length) * (clamped / max);
    pointer.y = (dy / length) * (clamped / max);
    moveKnob.style.transform = `translate(calc(-50% + ${pointer.x * max}px), calc(-50% + ${pointer.y * max}px))`;
    event.preventDefault();
  };
  moveStick.addEventListener("pointerdown", startStick);
  window.addEventListener("pointermove", updateStick);
  window.addEventListener("pointerup", endStick);
  moveStick.addEventListener("touchstart", startStick, { passive: false });
  window.addEventListener("touchmove", updateStick, { passive: false });
  window.addEventListener("touchend", endStick);

  buttons.ride.addEventListener("click", rideNearest);
  buttons.manualStart.addEventListener("click", manualStartRide);
  buttons.manualCheck.addEventListener("click", manualCheckIn);
  buttons.seat.addEventListener("click", chooseSeat);
  buttons.ticket.addEventListener("click", checkTicket);
  buttons.leave.addEventListener("click", leaveRide);
  buttons.next.addEventListener("click", moveNextRide);
  buttons.reset.addEventListener("click", resetPlayer);
}

buildWorld();
setupInput();
updateRideList();
updateSeatButton(null);
updateScreenButtons();
updateRideControlButtons();
animate();
