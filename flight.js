import * as THREE from "./assets/three.module.js";

const canvas = document.querySelector("#flightCanvas");
const statusText = document.querySelector("#statusText");
const routeLabel = document.querySelector("#routeLabel");
const missionTitle = document.querySelector("#missionTitle");
const speedText = document.querySelector("#speedText");
const altitudeText = document.querySelector("#altitudeText");
const gearText = document.querySelector("#gearText");
const airlineText = document.querySelector("#airlineText");
const flightLog = document.querySelector("#flightLog");
const airlineButtons = document.querySelector("#airlineButtons");
const throttleLever = document.querySelector("#throttleLever");
const gearLever = document.querySelector("#gearLever");
const yoke = document.querySelector("#yoke");
const yokeKnob = document.querySelector("#yokeKnob");
const mobileYoke = document.querySelector("#mobileYoke");
const mobileKnob = document.querySelector("#mobileKnob");
const soundBtn = document.querySelector("#soundBtn");
const skyStartBtn = document.querySelector("#skyStartBtn");

const airlines = [
  { id: "cz", short: "南航", name: "China Southern", local: "中国南方航空", color: 0x1f5fb8, accent: 0xd83232, model: "Boeing 737" },
  { id: "mu", short: "东航", name: "China Eastern", local: "中国东方航空", color: 0xcf2f36, accent: 0x244f9c, model: "Airbus A330" },
  { id: "ca", short: "国航", name: "Air China", local: "中国国际航空", color: 0xd72d2d, accent: 0xf4c542, model: "Boeing 777" },
  { id: "aa", short: "美航", name: "American Airlines", local: "American Airlines", color: 0x315a9f, accent: 0xc7353d, model: "Boeing 787" },
  { id: "jal", short: "日航", name: "Japan Airlines", local: "日本航空", color: 0xd52f36, accent: 0xffffff, model: "Boeing 787" },
  { id: "sq", short: "新航", name: "Singapore Airlines", local: "新加坡航空", color: 0x1b2c74, accent: 0xdcae38, model: "Airbus A350" },
  { id: "ke", short: "大韩", name: "Korean Air", local: "대한항공", color: 0x7fc7e8, accent: 0xd23a45, model: "Boeing 747" },
  { id: "tg", short: "泰航", name: "Thai Airways", local: "การบินไทย", color: 0x5f328c, accent: 0xf3b43f, model: "Airbus A350" },
  { id: "af", short: "法航", name: "Air France", local: "Air France", color: 0x234f9f, accent: 0xe33b3f, model: "Airbus A320" },
  { id: "lh", short: "汉莎", name: "Lufthansa", local: "Lufthansa", color: 0x1e2c4f, accent: 0xf4c542, model: "Airbus A380" },
  { id: "ek", short: "阿联酋", name: "Emirates", local: "طيران الإمارات", color: 0xc81e2b, accent: 0x247447, model: "Airbus A380" },
  { id: "qf", short: "澳航", name: "Qantas", local: "Qantas", color: 0xd62c2f, accent: 0xffffff, model: "Boeing 787" },
  { id: "ai", short: "印度", name: "Air India", local: "एअर इंडिया", color: 0xc33a2b, accent: 0xf1b64f, model: "Boeing 777" },
  { id: "nx", short: "澳门", name: "Air Macau", local: "澳門航空", color: 0x3b7aaf, accent: 0xf1c653, model: "Airbus A321" },
  { id: "tv", short: "西藏", name: "Tibet Airlines", local: "西藏航空 · བོད", color: 0xe18f2d, accent: 0x246399, model: "Airbus A319" },
  { id: "ak", short: "亚洲", name: "AirAsia", local: "AirAsia", color: 0xd82727, accent: 0xffffff, model: "Airbus A320" }
];

const runwayStart = new THREE.Vector3(0, 0.62, -220);
const playerPlaneScale = 1;

const runwayPath = [
  new THREE.Vector3(0, 0.08, -220),
  new THREE.Vector3(0, 0.08, -120),
  new THREE.Vector3(0, 0.08, 0),
  new THREE.Vector3(0, 0.08, 120),
  new THREE.Vector3(0, 0.08, 220)
];

const landingPath = [
  new THREE.Vector3(18, 56, 250),
  new THREE.Vector3(46, 48, 360),
  new THREE.Vector3(78, 28, 500),
  new THREE.Vector3(100, 8, 650),
  new THREE.Vector3(100, 0.85, 860)
];

const state = {
  airlineIndex: 0,
  phase: "takeoff",
  speed: 0,
  altitude: 0,
  throttle: 0,
  gear: 0,
  yokeX: 0,
  yokeY: 0,
  heading: 0,
  cameraMode: 0,
  cameraYaw: 0,
  cameraPitch: 0.12,
  route: "takeoff",
  crashed: false,
  landed: false,
  lastTime: 0,
  offRouteTime: 0
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd8ff);
scene.fog = new THREE.Fog(0x9fd8ff, 260, 1200);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1800);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const clock = new THREE.Clock();
const world = new THREE.Group();
const airport = new THREE.Group();
const parked = new THREE.Group();
const routeLights = new THREE.Group();
scene.add(world, airport, parked, routeLights);

const mats = {
  concrete: makeMat(0xb8bcc0, 0.72, 0.42),
  dark: makeMat(0x1c2730, 0.58, 0.55),
  runway: makeMat(0x333b42, 0.82, 0.38),
  grass: makeMat(0x5da35f, 0.9, 0.5),
  white: makeMat(0xf7fbff, 0.35, 0.45),
  steel: makeMat(0x7d8890, 0.55, 0.42),
  yellow: makeMat(0xf2c84b, 0.68, 0.35),
  runwayYellowLight: new THREE.MeshStandardMaterial({ color: 0xffd65a, emissive: 0xffb300, emissiveIntensity: 1.8, roughness: 0.34, metalness: 0.12 }),
  greenLight: new THREE.MeshStandardMaterial({ color: 0x62ff8b, emissive: 0x1fe568, emissiveIntensity: 1.7 }),
  redLight: new THREE.MeshStandardMaterial({ color: 0xff4a3a, emissive: 0xd91f12, emissiveIntensity: 1.5 })
};

let playerPlane;
let playerAircraftParts = {};
const keys = new Set();
let audioCtx;
let engineOsc;
let engineGain;
let noiseSource;
let noiseGain;
let noiseFilter;
let soundEnabled = true;
let soundReady = false;

function makeMat(color, roughness = 0.55, metalness = 0.18) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function box(name, size, pos, mat, parent = scene) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat);
  mesh.name = name;
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cyl(name, radius, depth, pos, mat, parent = scene, segments = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, segments), mat);
  mesh.name = name;
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cone(name, radius, height, pos, mat, parent = scene, segments = 32) {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, height, segments), mat);
  mesh.name = name;
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeTextTexture(lines, options = {}) {
  const canvasEl = document.createElement("canvas");
  const width = options.width || 512;
  const height = options.height || 192;
  canvasEl.width = width;
  canvasEl.height = height;
  const ctx = canvasEl.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = options.bg || "rgba(255,255,255,0.92)";
  roundRect(ctx, 18, 18, width - 36, height - 36, 22);
  ctx.fill();
  ctx.fillStyle = options.color || "#172632";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${options.big || 42}px system-ui, sans-serif`;
  ctx.fillText(lines[0], width / 2, height * 0.42);
  if (lines[1]) {
    ctx.font = `800 ${options.small || 24}px system-ui, sans-serif`;
    ctx.fillText(lines[1], width / 2, height * 0.68);
  }
  const texture = new THREE.CanvasTexture(canvasEl);
  texture.anisotropy = 4;
  return texture;
}

function makeDecalTexture(lines, options = {}) {
  const canvasEl = document.createElement("canvas");
  const width = options.width || 720;
  const height = options.height || 220;
  canvasEl.width = width;
  canvasEl.height = height;
  const ctx = canvasEl.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  if (options.bg) {
    ctx.fillStyle = options.bg;
    roundRect(ctx, 8, 8, width - 16, height - 16, 18);
    ctx.fill();
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = options.color || "#172632";
  ctx.font = `900 ${options.big || 52}px system-ui, sans-serif`;
  ctx.fillText(lines[0], width / 2, height * 0.42);
  if (lines[1]) {
    ctx.font = `800 ${options.small || 31}px system-ui, sans-serif`;
    ctx.fillText(lines[1], width / 2, height * 0.67);
  }
  const texture = new THREE.CanvasTexture(canvasEl);
  texture.anisotropy = 4;
  return texture;
}

function makeTailMarkTexture(livery) {
  const canvasEl = document.createElement("canvas");
  canvasEl.width = 320;
  canvasEl.height = 260;
  const ctx = canvasEl.getContext("2d");
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  if (livery.id === "cz") {
    ctx.save();
    ctx.translate(160, 132);
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 13;
    ctx.fillStyle = "#d83232";
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / 5 - Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.bezierCurveTo(34, -76, 78, -88, 92, -40);
      ctx.bezierCurveTo(62, -34, 44, -20, 30, 4);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle = `#${livery.color.toString(16).padStart(6, "0")}`;
    roundRect(ctx, 28, 30, 264, 200, 28);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 76px system-ui, sans-serif";
    ctx.fillText(livery.short, 160, 130);
  }

  const texture = new THREE.CanvasTexture(canvasEl);
  texture.anisotropy = 4;
  return texture;
}

function addSideDecal(name, texture, side, pos, size, parent) {
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), mat);
  mesh.name = name;
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
  parent.add(mesh);
  return mesh;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function addSpriteLabel(text, subtext, pos, width = 8, height = 2.6) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeTextTexture([text, subtext], { width: 640, height: 220 }),
    transparent: true
  }));
  sprite.position.set(pos[0], pos[1], pos[2]);
  sprite.scale.set(width, height, 1);
  scene.add(sprite);
  return sprite;
}

function addGround() {
  const ground = box("two-airport-apron", [360, 0.16, 1230], [45, -0.08, 340], mats.concrete, airport);
  ground.receiveShadow = true;
  box("departure-grass", [360, 0.08, 42], [45, -0.03, -292], mats.grass, airport);
  box("middle-grass", [54, 0.08, 560], [146, -0.03, 250], mats.grass, airport);
  box("arrival-grass", [360, 0.08, 42], [45, -0.03, 975], mats.grass, airport);
  addRunway("起飞机场 · 3000 km 起飞跑道 18", [0, 0.02, 0], [16, 0.05, 460]);
  addRunway("目的机场 · 3000 km 降落跑道 27", [100, 0.03, 650], [16, 0.05, 520]);
  addTaxiway([-44, -46], [-44, -22]);
  addTaxiway([-44, -22], [-34, -10]);
  addTaxiway([-34, -10], [-18, -2]);
  addTaxiway([-18, -2], [-8, 15]);
  addTaxiway([-8, 15], [0, 34]);
  addTaxiway([62, 420], [82, 500]);
  addTaxiway([82, 500], [100, 610]);

  for (let i = -120; i <= 210; i += 18) {
    box("concrete-joint-x", [0.045, 0.012, 1230], [i, 0.02, 340], makeMat(0x9ea4a9), airport).receiveShadow = true;
  }
  for (let i = -260; i <= 940; i += 18) {
    box("concrete-joint-z", [360, 0.012, 0.045], [45, 0.021, i], makeMat(0x9ea4a9), airport).receiveShadow = true;
  }

  addTerminal();
  addDestinationTerminal();
  addControlTower();
}

function addRunway(label, pos, size) {
  box("runway", size, pos, mats.runway, airport);
  box("runway-left-outline", [0.42, 0.09, size[2] + 4], [pos[0] - size[0] / 2 - 0.45, 0.105, pos[2]], mats.white, airport);
  box("runway-right-outline", [0.42, 0.09, size[2] + 4], [pos[0] + size[0] / 2 + 0.45, 0.105, pos[2]], mats.white, airport);
  for (let i = -size[2] / 2 + 18; i <= size[2] / 2 - 18; i += 22) {
    box("runway-centerline", [0.42, 0.07, 6], [pos[0], 0.08, pos[2] + i], mats.white, airport);
  }
  for (const side of [-4.2, 4.2]) {
    box("runway-edge", [0.18, 0.08, size[2] - 4], [pos[0] + side, 0.09, pos[2]], mats.white, airport);
  }
  addRunwayDirectionArrows(pos, size);
  addRunwayStartLights(pos, size);
  addSpriteLabel(label, "RUNWAY", [pos[0], 4, pos[2] - size[2] / 2 + 8], 8, 2.2);
}

function addRunwayDirectionArrows(pos, size) {
  const arrowZs = [pos[2] + size[2] * 0.25, pos[2] + size[2] * 0.38];
  arrowZs.forEach((z, index) => {
    const spread = index === 0 ? 1.25 : 1.45;
    const left = box("runway-takeoff-chevron-left", [0.36, 0.1, 5.6], [pos[0] - spread, 0.13, z], mats.white, airport);
    const right = box("runway-takeoff-chevron-right", [0.36, 0.1, 5.6], [pos[0] + spread, 0.13, z], mats.white, airport);
    left.rotation.y = -0.58;
    right.rotation.y = 0.58;
  });
}

function addRunwayStartLights(pos, size) {
  const startZ = pos[2] - size[2] / 2 + 7;
  for (let row = 0; row < 3; row++) {
    for (const x of [-4.8, -3.1, -1.4, 1.4, 3.1, 4.8]) {
      const lamp = cyl("yellow-runway-start-light", 0.18, 0.08, [pos[0] + x, 0.18, startZ + row * 2.2], mats.runwayYellowLight, airport, 18);
      lamp.rotation.x = Math.PI / 2;
    }
  }
  for (let row = 0; row < 5; row++) {
    for (const x of [-5.1, 5.1]) {
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 18), mats.runwayYellowLight);
      beacon.name = "large-yellow-takeoff-beacon";
      beacon.position.set(pos[0] + x, 0.38, pos[2] - 7 + row * 3.2);
      beacon.castShadow = true;
      airport.add(beacon);
    }
  }
  addSpriteLabel("黄色起飞灯", "从这里开始滑行", [pos[0], 3.6, startZ + 3.4], 5.6, 1.7);
}

function addTaxiway(a, b) {
  const midX = (a[0] + b[0]) / 2;
  const midZ = (a[1] + b[1]) / 2;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const road = box("taxiway", [7.4, 0.04, len], [midX, 0.05, midZ], makeMat(0x596269), airport);
  road.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]);
  const line = box("taxiway-yellow-line", [0.32, 0.05, len], [midX, 0.09, midZ], mats.yellow, airport);
  line.rotation.y = road.rotation.y;
}

function addTerminal() {
  box("terminal-main", [40, 6, 8], [-48, 3, -62], makeMat(0xd7e0e4), airport);
  box("terminal-glass", [38, 3.2, 0.2], [-48, 3.5, -57.9], makeMat(0x8bc4dd, 0.28, 0.08), airport);
  for (let i = 0; i < 6; i++) {
    const gateX = -63 + i * 6;
    box("gate-bridge", [1.6, 1.8, 9], [gateX, 2.1, -51.2], makeMat(0xdde4e8), airport);
    addSpriteLabel(`G${i + 1}`, "登机口", [gateX, 5.3, -48], 3.2, 1.4);
  }
}

function addDestinationTerminal() {
  box("destination-terminal-main", [42, 5.5, 8], [134, 2.75, 590], makeMat(0xdfe7eb), airport);
  box("destination-terminal-glass", [40, 3.1, 0.2], [134, 3.3, 594.1], makeMat(0x8bc4dd, 0.3, 0.08), airport);
  for (let i = 0; i < 4; i++) {
    const gateX = 122 + i * 7;
    box("destination-gate-bridge", [1.4, 1.6, 7.5], [gateX, 2.05, 599.3], makeMat(0xdde4e8), airport);
  }
  addSpriteLabel("远处机场", "降落到这里", [134, 7.2, 601], 5.8, 1.8);
}

function addControlTower() {
  cyl("control-tower-stem", 1.6, 13, [58, 6.5, -45], makeMat(0xc7d0d5), airport, 12);
  box("control-tower-room", [7, 3.2, 7], [58, 14.5, -45], makeMat(0x8bc4dd, 0.34, 0.12), airport);
  cone("control-tower-roof", 4.8, 2.2, [58, 17.2, -45], makeMat(0x2d3b47), airport, 4).rotation.y = Math.PI / 4;
  addSpriteLabel("塔台", "ATC", [58, 20.2, -45], 4, 1.6);
}

function makeWingGeometry(span, chord, sweep = 2.2) {
  const half = span / 2;
  const verts = new Float32Array([
    -half, 0, -chord * 0.34,
    -half + sweep, 0, chord * 0.48,
    0, 0, chord * 0.34,
    half - sweep, 0, chord * 0.48,
    half, 0, -chord * 0.34,
    0, 0, -chord * 0.58
  ]);
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  geom.setIndex([0, 5, 1, 1, 5, 2, 2, 5, 3, 3, 5, 4]);
  geom.computeVertexNormals();
  return geom;
}

function makeVerticalFinGeometry(base, height) {
  const verts = new Float32Array([
    0, 0, base * 0.58,
    0, height, base * 0.12,
    0, 0, -base * 0.58
  ]);
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  geom.setIndex([0, 1, 2]);
  geom.computeVertexNormals();
  return geom;
}

function createPlaneModel(livery, options = {}) {
  const scale = options.scale || 1;
  const group = new THREE.Group();
  const bodyMat = makeMat(0xf8fbff, 0.38, 0.22);
  const colorMat = makeMat(livery.color, 0.42, 0.28);
  const accentMat = makeMat(livery.accent, 0.42, 0.24);
  const glassMat = makeMat(0x172632, 0.28, 0.05);
  const stripeBlueMat = livery.id === "cz" ? makeMat(0x1d5fa8, 0.42, 0.24) : colorMat;
  const stripeGreenMat = livery.id === "cz" ? makeMat(0x19a99a, 0.36, 0.22) : accentMat;
  const engineCount = livery.model.includes("380") || livery.model.includes("747") ? 4 : 2;
  const wideBody = livery.model.includes("380") || livery.model.includes("747") || livery.model.includes("777") || livery.model.includes("A350");
  const length = (wideBody ? 14.5 : 12.2) * scale;
  const radius = (wideBody ? 0.78 : 0.62) * scale;
  const span = (wideBody ? 16 : 13.2) * scale;

  const body = cyl("aircraft-fuselage", radius, length, [0, radius * 1.3, 0], bodyMat, group, 32);
  body.rotation.x = Math.PI / 2;
  const nose = cone("aircraft-nose", radius, radius * 1.85, [0, radius * 1.3, length / 2 + radius * 0.9], bodyMat, group, 32);
  nose.rotation.x = Math.PI / 2;
  const tailCone = cone("aircraft-tail-cone", radius * 0.9, radius * 1.75, [0, radius * 1.3, -length / 2 - radius * 0.82], bodyMat, group, 32);
  tailCone.rotation.x = -Math.PI / 2;

  const stripe = box("aircraft-color-stripe", [radius * 2.04, 0.06 * scale, length * 0.76], [0, radius * 1.72, 0.6 * scale], colorMat, group);
  stripe.rotation.x = 0;
  for (const side of [-1, 1]) {
    const sideX = side * radius * 1.04;
    box("aircraft-side-blue-stripe", [0.035 * scale, 0.11 * scale, length * 0.86], [sideX, radius * 1.36, 0.24 * scale], stripeBlueMat, group);
    box("aircraft-side-green-stripe", [0.036 * scale, 0.045 * scale, length * 0.8], [sideX, radius * 1.2, 0.4 * scale], stripeGreenMat, group);
    box("aircraft-side-dark-cheatline", [0.038 * scale, 0.032 * scale, length * 0.83], [sideX, radius * 1.29, 0.32 * scale], glassMat, group);
  }
  const cockpit = box("aircraft-cockpit-window", [radius * 1.05, 0.12 * scale, 0.55 * scale], [0, radius * 1.75, length / 2 + 0.16 * scale], glassMat, group);
  cockpit.rotation.x = -0.34;
  box("aircraft-nose-blue-band", [radius * 1.7, 0.12 * scale, 0.08 * scale], [0, radius * 1.22, length / 2 + 0.72 * scale], colorMat, group);

  for (const side of [-1, 1]) {
    const sideX = side * radius * 1.085;
    for (let i = 0; i < 22; i++) {
      const z = -length * 0.34 + i * (length * 0.68 / 21);
      box("aircraft-window-row", [0.032 * scale, 0.075 * scale, 0.105 * scale], [sideX, radius * 1.62, z], glassMat, group);
    }
    for (const z of [length * 0.33, -length * 0.29]) {
      box("aircraft-passenger-door", [0.035 * scale, 0.46 * scale, 0.22 * scale], [sideX, radius * 1.48, z], makeMat(0xeef5f9, 0.36, 0.18), group);
      box("aircraft-door-outline", [0.038 * scale, 0.5 * scale, 0.028 * scale], [sideX, radius * 1.48, z - 0.13 * scale], glassMat, group);
    }
    addSideDecal(
      "airline-side-name",
      makeDecalTexture(
        livery.id === "cz" ? ["中国南方航空", "CHINA SOUTHERN"] : [livery.local, livery.name],
        { width: 940, height: 210, color: "#172632", big: livery.id === "cz" ? 39 : 43, small: 30 }
      ),
      side,
      [sideX + side * 0.01 * scale, radius * 1.78, length * 0.05],
      [4.12 * scale, 0.86 * scale],
      group
    );
    addSideDecal(
      "aircraft-registration",
      makeDecalTexture([livery.id === "cz" ? "B-5762" : livery.model], { width: 300, height: 120, color: "#203142", big: 42 }),
      side,
      [sideX + side * 0.012 * scale, radius * 1.66, -length * 0.39],
      [0.72 * scale, 0.28 * scale],
      group
    );
  }

  const wing = new THREE.Mesh(makeWingGeometry(span, 3.6 * scale, 2.5 * scale), bodyMat);
  wing.name = "aircraft-symmetric-wing";
  wing.position.set(0, radius * 1.2, -0.4 * scale);
  wing.castShadow = true;
  wing.receiveShadow = true;
  group.add(wing);
  box("continuous-wing-root", [radius * 2.55, 0.14 * scale, 1.55 * scale], [0, radius * 1.22, -0.15 * scale], bodyMat, group);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const x = side * span * (0.16 + i * 0.055);
      const line = box("wing-panel-line", [0.035 * scale, 0.028 * scale, 1.85 * scale], [x, radius * 1.245, -0.38 * scale], makeMat(0xc7d1da, 0.32, 0.18), group);
      line.rotation.y = side * 0.13;
    }
    box("wing-small-lettering", [0.28 * scale, 0.032 * scale, 1.2 * scale], [side * span * 0.29, radius * 1.252, -0.64 * scale], glassMat, group);
  }

  const leftTip = box("left-wing-tip", [0.18 * scale, 0.72 * scale, 1.35 * scale], [-span / 2 + 0.28 * scale, radius * 1.62, -0.42 * scale], accentMat, group);
  leftTip.rotation.z = -0.24;
  const rightTip = box("right-wing-tip", [0.18 * scale, 0.72 * scale, 1.35 * scale], [span / 2 - 0.28 * scale, radius * 1.62, -0.42 * scale], accentMat, group);
  rightTip.rotation.z = 0.24;
  box("horizontal-tail", [span * 0.36, 0.08 * scale, 1.4 * scale], [0, radius * 1.72, -length / 2 - 0.16 * scale], bodyMat, group);
  const finMat = colorMat.clone();
  finMat.side = THREE.DoubleSide;
  const fin = new THREE.Mesh(makeVerticalFinGeometry(1.75 * scale, 2.55 * scale), finMat);
  fin.name = "sloped-blue-vertical-tail";
  fin.position.set(0, radius * 1.74, -length / 2 - 0.46 * scale);
  fin.castShadow = true;
  fin.receiveShadow = true;
  group.add(fin);
  box("vertical-tail-thickness", [0.12 * scale, 1.85 * scale, 1.08 * scale], [0, radius * 2.34, -length / 2 - 0.45 * scale], colorMat, group);
  for (const side of [-1, 1]) {
    addSideDecal(
      "tail-airline-mark",
      makeTailMarkTexture(livery),
      side,
      [side * 0.075 * scale, radius * 2.55, -length / 2 - 0.32 * scale],
      [1.02 * scale, 0.84 * scale],
      group
    );
  }

  const engineSlots = engineCount === 4 ? [-span * 0.31, -span * 0.18, span * 0.18, span * 0.31] : [-span * 0.27, span * 0.27];
  engineSlots.forEach((x) => {
    const engine = cyl("aircraft-engine", radius * 0.38, 1.05 * scale, [x, radius * 0.78, -0.2 * scale], colorMat, group, 24);
    engine.rotation.x = Math.PI / 2;
    const fan = cyl("engine-fan", radius * 0.31, 0.08 * scale, [x, radius * 0.78, 0.34 * scale], glassMat, group, 24);
    fan.rotation.x = Math.PI / 2;
    for (let blade = 0; blade < 6; blade++) {
      const fanBlade = box("engine-fan-blade", [0.035 * scale, 0.22 * scale, 0.03 * scale], [x, radius * 0.78, 0.39 * scale], mats.steel, group);
      fanBlade.rotation.x = Math.PI / 2;
      fanBlade.rotation.z = (Math.PI / 3) * blade;
    }
  });

  const wheelMat = makeMat(0x0d1115, 0.72, 0.08);
  const gearParts = new THREE.Group();
  gearParts.name = "landing-gear";
  [[-1.6, -1.8], [1.6, -1.8], [0, length / 2 - 1.8]].forEach(([x, z], index) => {
    const strut = box("landing-gear-strut", [0.08 * scale, 0.75 * scale, 0.08 * scale], [x * scale, radius * 0.42, z * scale], mats.steel, gearParts);
    strut.rotation.x = index === 2 ? 0.08 : 0;
    const wheel = cyl("landing-wheel", 0.24 * scale, 0.16 * scale, [x * scale, 0.08 * scale, z * scale], wheelMat, gearParts, 18);
    wheel.rotation.z = Math.PI / 2;
    if (index < 2) {
      const twinWheel = cyl("landing-wheel-twin", 0.21 * scale, 0.14 * scale, [(x + Math.sign(x) * 0.22) * scale, 0.08 * scale, z * scale], wheelMat, gearParts, 18);
      twinWheel.rotation.z = Math.PI / 2;
    }
  });
  group.add(gearParts);

  if (options.player) playerAircraftParts = { gearParts };

  group.scale.setScalar(scale);
  return group;
}

function addRouteLights(points, colorMat) {
  const curve = new THREE.CatmullRomCurve3(points);
  const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.08, 8, false), colorMat);
  line.name = "green-navigation-line";
  routeLights.add(line);
  for (let i = 0; i <= 34; i++) {
    const point = curve.getPoint(i / 34);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.35, 18, 18), colorMat);
    lamp.name = "turning-green-light";
    lamp.position.set(point.x, point.y + 0.24, point.z);
    routeLights.add(lamp);
  }
}

function rebuildRouteLights() {
  routeLights.clear();
  addRouteLights(state.route === "landing" ? landingPath : runwayPath, mats.greenLight);
}

function buildWorld() {
  const hemi = new THREE.HemisphereLight(0xdff7ff, 0x67715d, 1.5);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(-55, 80, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -100;
  sun.shadow.camera.right = 100;
  sun.shadow.camera.top = 100;
  sun.shadow.camera.bottom = -100;
  scene.add(sun);

  addGround();
  rebuildRouteLights();

  playerPlane = createPlaneModel(airlines[state.airlineIndex], { scale: playerPlaneScale, player: true });
  playerPlane.position.copy(runwayStart);
  playerPlane.rotation.y = 0;
  scene.add(playerPlane);

  const parkPositions = [
    [-66, -42], [-58, -42], [-50, -42], [-42, -42], [-34, -42], [-26, -42], [42, -38], [52, -38],
    [62, -38], [70, -28], [-70, 42], [-58, 48], [-46, 52], [50, 48], [62, 44], [72, 36]
  ];
  airlines.forEach((airline, index) => {
    const pos = parkPositions[index];
    const plane = createPlaneModel(airline, { scale: 0.52 });
    plane.position.set(pos[0], 0.5, pos[1]);
    plane.rotation.y = index < 8 ? Math.PI : 0;
    parked.add(plane);
    addSpriteLabel(airline.short, airline.name, [pos[0], 4.6, pos[1] + (index < 8 ? -4 : 4)], 4.2, 1.55);
  });

  addSpriteLabel("从超长跑道一头出发", "滑完整条跑道才够速度", [-10, 3, -218], 8.4, 1.9);
  addSpriteLabel("远处机场跑道", "从天空飞过去降落", [100, 4, 650], 7.2, 1.9);
}

function addLog(text) {
  const item = document.createElement("li");
  item.textContent = text;
  flightLog.prepend(item);
  while (flightLog.children.length > 8) flightLog.lastChild.remove();
}

function buildNoiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function ensureAudio() {
  if (!soundEnabled) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    engineOsc = audioCtx.createOscillator();
    engineGain = audioCtx.createGain();
    noiseSource = audioCtx.createBufferSource();
    noiseGain = audioCtx.createGain();
    noiseFilter = audioCtx.createBiquadFilter();

    engineOsc.type = "sawtooth";
    engineOsc.frequency.value = 54;
    engineGain.gain.value = 0;

    noiseSource.buffer = buildNoiseBuffer(audioCtx);
    noiseSource.loop = true;
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 380;
    noiseFilter.Q.value = 0.8;
    noiseGain.gain.value = 0;

    engineOsc.connect(engineGain).connect(audioCtx.destination);
    noiseSource.connect(noiseFilter).connect(noiseGain).connect(audioCtx.destination);
    engineOsc.start();
    noiseSource.start();
    soundReady = true;
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playTakeoffWhoosh() {
  if (!soundEnabled || !soundReady || !audioCtx) return;
  const now = audioCtx.currentTime;
  const whoosh = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  whoosh.type = "triangle";
  whoosh.frequency.setValueAtTime(180, now);
  whoosh.frequency.exponentialRampToValueAtTime(520, now + 0.45);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  whoosh.connect(gain).connect(audioCtx.destination);
  whoosh.start(now);
  whoosh.stop(now + 0.6);
}

function updateFlightSound() {
  if (!soundReady || !audioCtx || !engineGain || !noiseGain) return;
  const now = audioCtx.currentTime;
  if (!soundEnabled || state.crashed || state.landed) {
    engineGain.gain.setTargetAtTime(0, now, 0.08);
    noiseGain.gain.setTargetAtTime(0, now, 0.08);
    return;
  }
  const throttlePower = Math.max(0, state.throttle);
  const speedPower = THREE.MathUtils.clamp(state.speed / 140, 0, 1);
  const airborneBoost = state.altitude > 2 ? 0.08 : 0;
  engineOsc.frequency.setTargetAtTime(52 + throttlePower * 86 + speedPower * 34, now, 0.05);
  noiseFilter.frequency.setTargetAtTime(260 + speedPower * 850 + throttlePower * 420, now, 0.08);
  engineGain.gain.setTargetAtTime((0.03 + throttlePower * 0.12 + airborneBoost) * (soundEnabled ? 1 : 0), now, 0.08);
  noiseGain.gain.setTargetAtTime((throttlePower * 0.18 + speedPower * 0.1) * (soundEnabled ? 1 : 0), now, 0.08);
}

function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  soundBtn.textContent = enabled ? "声音开" : "静音";
  soundBtn.classList.toggle("muted", !enabled);
  if (enabled) ensureAudio();
  updateFlightSound();
}

function setAirline(index) {
  state.airlineIndex = index;
  const oldPos = playerPlane.position.clone();
  const oldRot = playerPlane.rotation.y;
  scene.remove(playerPlane);
  playerPlane = createPlaneModel(airlines[index], { scale: playerPlaneScale, player: true });
  playerPlane.position.copy(oldPos);
  playerPlane.rotation.y = oldRot;
  scene.add(playerPlane);
  airlineText.textContent = airlines[index].short;
  updateAirlineButtons();
  addLog(`已换成 ${airlines[index].local} ${airlines[index].model}。`);
}

function updateAirlineButtons() {
  Array.from(airlineButtons.children).forEach((button, index) => {
    button.classList.toggle("active", index === state.airlineIndex);
  });
}

function buildAirlineButtons() {
  airlines.forEach((airline, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `${airline.short}<span>${airline.local}<br>${airline.model}</span>`;
    button.addEventListener("click", () => setAirline(index));
    airlineButtons.append(button);
  });
  updateAirlineButtons();
}

function resetGame() {
  state.phase = "takeoff";
  state.speed = 0;
  state.altitude = 0;
  state.throttle = 0;
  state.gear = 0;
  state.yokeX = 0;
  state.yokeY = 0;
  state.heading = 0;
  state.route = "takeoff";
  state.crashed = false;
  state.landed = false;
  state.offRouteTime = 0;
  throttleLever.value = "0";
  gearLever.value = "0";
  document.body.classList.remove("crashed");
  playerPlane.position.copy(runwayStart);
  playerPlane.rotation.set(0, 0, 0);
  flightLog.innerHTML = "";
  rebuildRouteLights();
  missionTitle.textContent = "跑道起飞准备";
  statusText.textContent = "飞机在 3000 km 训练跑道最尾端。油门往前推，从这一头滑到另一头，速度够了才会抬头起飞。";
  routeLabel.textContent = "绿色灯线：起飞跑道";
  addLog("飞机在超长跑道一头，准备滑完整条跑道起飞。");
  updateYokeKnob();
  updateFlightSound();
}

function followGreenLights() {
  if (state.crashed || state.landed) return;
  state.phase = "takeoff";
  state.route = "takeoff";
  rebuildRouteLights();
  routeLabel.textContent = "绿色灯线：起飞跑道";
  statusText.textContent = "绿色灯线现在显示起飞跑道，飞机不用再从停机坪开过去。";
  addLog("已显示跑道中心绿色灯线。");
}

function takeoff() {
  if (state.crashed || state.landed) return;
  ensureAudio();
  state.phase = "takeoff";
  state.route = "takeoff";
  routeLabel.textContent = "起飞：对准跑道中心线，加速到 95 kt 以上。";
  statusText.textContent = "起飞模式：先沿着整条跑道滑行，发动机会轰鸣，过了跑道中段后速度够了才会抬头。离地后把起落架拉到 Up。";
  addLog("塔台允许起飞，发动机开始轰鸣。");
}

function startLanding() {
  if (state.crashed || state.landed) return;
  state.phase = "landing";
  state.route = "landing";
  rebuildRouteLights();
  routeLabel.textContent = "绿色灯线：飞往远处机场";
  statusText.textContent = "降落导航开启：绿色灯线会带你飞到远处的 3000 km 降落跑道，起落架 Down，速度低于 72 kt。";
  addLog("进入降落导航，目标是远处的超长降落跑道。");
}

function startAirLanding() {
  if (state.crashed || state.landed) resetGame();
  ensureAudio();
  state.phase = "landing";
  state.route = "landing";
  state.speed = 105;
  state.altitude = 56;
  state.throttle = 0.58;
  state.gear = 0;
  state.yokeX = 0;
  state.yokeY = 0;
  state.crashed = false;
  state.landed = false;
  state.offRouteTime = 0;
  throttleLever.value = "58";
  gearLever.value = "0";
  playerPlane.position.set(18, 0.62 + state.altitude * 0.22, 250);
  state.heading = Math.atan2(landingPath[1].x - landingPath[0].x, landingPath[1].z - landingPath[0].z);
  playerPlane.rotation.set(0, state.heading, 0);
  rebuildRouteLights();
  missionTitle.textContent = "空中降落开局";
  routeLabel.textContent = "空中开局：沿绿色灯线降落";
  statusText.textContent = "你已经在天空上飞了。沿绿色灯线飞向机场，快到跑道时减速，起落架保持 Down。";
  addLog("空中开局：飞机已经在天上，准备降落到远处机场。");
  updateYokeKnob();
  updateFlightSound();
}

function brake() {
  state.throttle = -0.3;
  throttleLever.value = "-30";
  state.speed = Math.max(0, state.speed - 24);
  statusText.textContent = "刹车，油门杆拉到最后面，飞机会慢慢停下来。";
}

function crash(reason) {
  if (state.crashed || state.landed) return;
  state.crashed = true;
  state.speed = 0;
  state.throttle = 0;
  throttleLever.value = "0";
  document.body.classList.add("crashed");
  missionTitle.textContent = "飞行失败";
  statusText.textContent = reason;
  addLog(reason);
}

function landSuccess() {
  state.landed = true;
  state.phase = "landed";
  state.speed = 0;
  state.throttle = 0;
  throttleLever.value = "0";
  missionTitle.textContent = "安全降落";
  statusText.textContent = "飞机飞到远处的目的机场，沿降落跑道减速停下，任务成功。";
  addLog("安全降落在另一个机场，飞机停在白线前。");
}

function nearestDistanceToPath(points) {
  let best = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    const apx = playerPlane.position.x - a.x;
    const apz = playerPlane.position.z - a.z;
    const denom = abx * abx + abz * abz || 1;
    const t = THREE.MathUtils.clamp((apx * abx + apz * abz) / denom, 0, 1);
    const x = a.x + abx * t;
    const z = a.z + abz * t;
    best = Math.min(best, Math.hypot(playerPlane.position.x - x, playerPlane.position.z - z));
  }
  return best;
}

function updateControlsFromInputs() {
  state.throttle = Number(throttleLever.value) / 100;
  state.gear = Number(gearLever.value) / 100;
  if (keys.has("KEYA") || keys.has("ARROWLEFT")) state.yokeX = Math.max(state.yokeX - 0.08, -1);
  if (keys.has("KEYD") || keys.has("ARROWRIGHT")) state.yokeX = Math.min(state.yokeX + 0.08, 1);
  if (keys.has("KEYW") || keys.has("ARROWUP")) state.yokeY = Math.max(state.yokeY - 0.08, -1);
  if (keys.has("KEYS") || keys.has("ARROWDOWN")) state.yokeY = Math.min(state.yokeY + 0.08, 1);
  if (![...keys].some((key) => ["KEYA", "KEYD", "ARROWLEFT", "ARROWRIGHT"].includes(key))) state.yokeX *= 0.88;
  if (![...keys].some((key) => ["KEYW", "KEYS", "ARROWUP", "ARROWDOWN"].includes(key))) state.yokeY *= 0.88;
  updateYokeKnob();
}

function updatePhysics(dt) {
  if (state.crashed || state.landed) return;
  const targetSpeed = state.throttle < -0.22 ? 0 : state.throttle * 142;
  state.speed = THREE.MathUtils.lerp(state.speed, Math.max(0, targetSpeed), 1 - Math.exp(-dt * 1.6));
  const ground = state.altitude < 1.1;
  const turnPower = ground ? 0.65 : 1.15;
  state.heading -= state.yokeX * dt * turnPower * Math.max(0.25, state.speed / 80);

  const forward = new THREE.Vector3(Math.sin(state.heading), 0, Math.cos(state.heading));
  const distance = state.speed * dt * 0.35;
  playerPlane.position.add(forward.multiplyScalar(distance));
  playerPlane.rotation.y = state.heading;
  playerPlane.rotation.z = -state.yokeX * 0.28;

  const takeoffRollReady = playerPlane.position.z > 90;
  if (state.phase === "takeoff" && state.speed > 92 && takeoffRollReady) {
    state.altitude += (state.speed - 88) * dt * 0.42 + Math.max(0, state.yokeY) * dt * 16;
    if (state.altitude > 8) {
      state.phase = "airborne";
      routeLabel.textContent = "空中：可以拖动屏幕看四周，点降落导航飞往另一个机场。";
      missionTitle.textContent = "已经起飞";
      playTakeoffWhoosh();
      addLog("机头抬起，飞机离地飞上去了。");
    }
  } else if (state.phase === "takeoff" && state.speed > 92 && !takeoffRollReady) {
    state.altitude = 0;
    statusText.textContent = "速度够了，但跑道还没滑够长。继续沿绿色灯线往前跑，过了中段才会抬头。";
  } else if (state.phase === "airborne") {
    state.altitude += state.yokeY * dt * 28;
    state.altitude = THREE.MathUtils.clamp(state.altitude, 8, 90);
  } else if (state.phase === "landing") {
    const descent = state.yokeY < 0 ? 26 : 10;
    state.altitude -= descent * dt;
    if (state.yokeY > 0.25) state.altitude += state.yokeY * 14 * dt;
    state.altitude = Math.max(0, state.altitude);
  } else if (ground) {
    state.altitude = 0;
  }

  playerPlane.position.y = 0.62 + state.altitude * 0.22;
  let nosePitch = 0;
  if (state.altitude > 1 || state.phase === "takeoff") {
    const commandedPitch = -state.yokeY * 0.18;
    const takeoffLiftPitch = state.phase === "takeoff" && state.speed > 82 && takeoffRollReady ? -0.16 : 0;
    const cruisePitch = state.phase === "airborne" ? -0.07 : 0;
    const landingPitch = state.phase === "landing" ? 0.04 : 0;
    nosePitch = THREE.MathUtils.clamp(commandedPitch + takeoffLiftPitch + cruisePitch + landingPitch, -0.32, 0.18);
  }
  playerPlane.rotation.x = nosePitch;
  if (playerAircraftParts.gearParts) {
    playerAircraftParts.gearParts.visible = state.gear < 0.62;
  }

  const activePath = state.route === "landing" ? landingPath : runwayPath;
  const dist = nearestDistanceToPath(activePath);
  if (state.phase === "taxi" && state.speed > 48 && dist > 13) state.offRouteTime += dt;
  else state.offRouteTime = Math.max(0, state.offRouteTime - dt * 2);
  if (state.offRouteTime > 1.3) crash("滑行太快又偏离绿色导航灯，飞机冲出路线了。");

  const onTakeoffRunway = Math.abs(playerPlane.position.x) < 9 && playerPlane.position.z > -230 && playerPlane.position.z < 230;
  if (state.phase === "takeoff" && state.speed > 68 && !onTakeoffRunway && state.altitude < 2) crash("起飞时没有对准跑道，飞机冲出跑道。");

  const onLandingRunway = Math.abs(playerPlane.position.x - 100) < 9 && playerPlane.position.z < 910 && playerPlane.position.z > 390;
  if (state.phase === "landing" && state.altitude <= 0.2) {
    if (!onLandingRunway) crash("降落没有对准目的机场跑道，落到跑道外面了。");
    else if (state.gear > 0.55) crash("起落架还在 Up，不能安全落地。");
    else if (state.speed > 78) crash("落地速度太快，飞机没有刹住。");
    else landSuccess();
  }

  if (playerPlane.position.x < -160 || playerPlane.position.x > 220 || playerPlane.position.z < -300 || playerPlane.position.z > 1010) {
    crash("飞出两个机场的超大范围，看不见跑道了。");
  }
}

function updateCamera() {
  const modes = [
    { height: 7.5, back: 18, side: 8 },
    { height: 4.8, back: 10, side: 0 },
    { height: 55, back: 4, side: 0 },
    { height: 18, back: 14, side: 18 }
  ];
  const mode = modes[state.cameraMode % modes.length];
  const yaw = state.heading + state.cameraYaw;
  const offset = new THREE.Vector3(
    Math.sin(yaw) * -mode.back + Math.cos(yaw) * mode.side,
    mode.height + state.cameraPitch * 16,
    Math.cos(yaw) * -mode.back - Math.sin(yaw) * mode.side
  );
  const target = playerPlane.position.clone().add(new THREE.Vector3(0, 2.2, 0));
  camera.position.lerp(target.clone().add(offset), 0.12);
  camera.lookAt(target);
}

function updateHud() {
  speedText.textContent = `${Math.round(state.speed)} kt`;
  altitudeText.textContent = `${Math.round(state.altitude * 10)} m`;
  gearText.textContent = state.gear < 0.62 ? "Down" : "Up";
  airlineText.textContent = airlines[state.airlineIndex].short;
  if (!state.crashed && !state.landed) {
    const phaseText = {
      taxi: "滑行中",
      takeoff: "起飞加速",
      airborne: "空中飞行",
      landing: "降落中"
    }[state.phase] || "飞行中";
    missionTitle.textContent = phaseText;
  }
}

function tick() {
  const dt = Math.min(0.04, clock.getDelta());
  updateControlsFromInputs();
  updatePhysics(dt);
  updateFlightSound();
  updateHud();
  updateCamera();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}

function updateYokeKnob() {
  const x = state.yokeX * 44;
  const y = state.yokeY * 44;
  yokeKnob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  mobileKnob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

function setupYoke(element) {
  let active = false;
  const setFromEvent = (event) => {
    const rect = element.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const limit = rect.width * 0.34;
    const len = Math.hypot(dx, dy) || 1;
    const scale = Math.min(limit, len) / len;
    state.yokeX = THREE.MathUtils.clamp((dx * scale) / limit, -1, 1);
    state.yokeY = THREE.MathUtils.clamp((dy * scale) / limit, -1, 1);
    updateYokeKnob();
  };
  element.addEventListener("pointerdown", (event) => {
    active = true;
    element.setPointerCapture(event.pointerId);
    setFromEvent(event);
    event.preventDefault();
  });
  element.addEventListener("pointermove", (event) => {
    if (!active) return;
    setFromEvent(event);
    event.preventDefault();
  });
  const end = () => {
    active = false;
    state.yokeX = 0;
    state.yokeY = 0;
    updateYokeKnob();
  };
  element.addEventListener("pointerup", end);
  element.addEventListener("pointercancel", end);
}

function setupCameraDrag() {
  let active = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener("pointerdown", (event) => {
    active = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!active) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    state.cameraYaw -= dx * 0.006;
    state.cameraPitch = THREE.MathUtils.clamp(state.cameraPitch + dy * 0.004, -0.45, 0.55);
    lastX = event.clientX;
    lastY = event.clientY;
  });
  const end = () => { active = false; };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
}

function setupEvents() {
  throttleLever.addEventListener("input", () => {
    ensureAudio();
    state.throttle = Number(throttleLever.value) / 100;
  });
  gearLever.addEventListener("input", () => {
    state.gear = Number(gearLever.value) / 100;
  });
  document.querySelector("#taxiBtn").addEventListener("click", followGreenLights);
  document.querySelector("#takeoffBtn").addEventListener("click", takeoff);
  document.querySelector("#landingBtn").addEventListener("click", startLanding);
  skyStartBtn.addEventListener("click", startAirLanding);
  document.querySelector("#brakeBtn").addEventListener("click", brake);
  document.querySelector("#cameraBtn").addEventListener("click", () => {
    state.cameraMode = (state.cameraMode + 1) % 4;
    statusText.textContent = "视角已切换，也可以直接拖动屏幕往左、往右、往上、往下看。";
  });
  soundBtn.addEventListener("click", () => setSoundEnabled(!soundEnabled));
  document.querySelector("#resetBtn").addEventListener("click", resetGame);
  window.addEventListener("keydown", (event) => {
    const code = event.code.toUpperCase();
    if (["KEYW", "KEYA", "KEYS", "KEYD", "ARROWUP", "ARROWDOWN", "ARROWLEFT", "ARROWRIGHT"].includes(code)) {
      event.preventDefault();
      ensureAudio();
      keys.add(code);
    }
    if (code === "SPACE") {
      event.preventDefault();
      takeoff();
    }
    if (code === "KEYL") startLanding();
    if (code === "KEYB") brake();
    if (code === "KEYR") resetGame();
  });
  window.addEventListener("keyup", (event) => keys.delete(event.code.toUpperCase()));
  setupYoke(yoke);
  setupYoke(mobileYoke);
  setupCameraDrag();
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / Math.max(1, rect.height);
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);

buildWorld();
buildAirlineButtons();
setupEvents();
resize();
resetGame();
tick();
