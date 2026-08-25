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
const countryButtons = document.querySelector("#countryButtons");
const internationalBtn = document.querySelector("#internationalBtn");
const autopilotBtn = document.querySelector("#autopilotBtn");
const flightLobbyBtn = document.querySelector("#flightLobbyBtn");
const flightLobby = document.querySelector("#flightLobby");
const flightLevelGrid = document.querySelector("#flightLevelGrid");
const closeFlightLobbyBtn = document.querySelector("#closeFlightLobbyBtn");

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

const countries = [
  {
    id: "us",
    name: "美国",
    local: "United States",
    domestic: "美国国内航班",
    cities: ["纽约", "洛杉矶", "西雅图", "芝加哥"],
    origin: "纽约自由机场",
    destination: "洛杉矶星光机场",
    color: 0x335f9f
  },
  {
    id: "cn",
    name: "中国",
    local: "China",
    domestic: "中国国内航班",
    cities: ["北京", "上海", "深圳", "成都"],
    origin: "北京云港机场",
    destination: "上海海湾机场",
    color: 0xd83a34
  },
  {
    id: "jp",
    name: "日本",
    local: "Japan",
    domestic: "日本国内航班",
    cities: ["东京", "大阪", "札幌", "福冈"],
    origin: "东京羽田训练机场",
    destination: "大阪关西训练机场",
    color: 0xe0e6ef
  },
  {
    id: "kr",
    name: "韩国",
    local: "Korea",
    domestic: "韩国国内航班",
    cities: ["首尔", "釜山", "济州", "仁川"],
    origin: "首尔天空机场",
    destination: "济州海风机场",
    color: 0x78b5d8
  },
  {
    id: "kp",
    name: "朝鲜",
    local: "DPRK",
    domestic: "朝鲜国内航班",
    cities: ["平壤", "开城", "南浦", "元山"],
    origin: "平壤蓝天机场",
    destination: "元山海岸机场",
    color: 0x6080a8
  },
  {
    id: "th",
    name: "泰国",
    local: "Thailand",
    domestic: "泰国国内航班",
    cities: ["曼谷", "清迈", "普吉", "甲米"],
    origin: "曼谷阳光机场",
    destination: "普吉海岛机场",
    color: 0xb37ad8
  },
  {
    id: "sg",
    name: "新加坡",
    local: "Singapore",
    domestic: "新加坡本地航班",
    cities: ["樟宜", "滨海湾", "港湾", "牛车水"],
    origin: "樟宜训练机场",
    destination: "滨海湾水岸机场",
    color: 0x55b987
  }
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

const flightLevels = [
  { title: "第1关 白天训练起飞", country: 6, destination: 6, airline: 5, international: false, timeMode: "day", start: "takeoff", difficulty: 1, description: "最简单：白天、直跑道，先练滑行和抬头起飞。" },
  { title: "第2关 白天城市降落", country: 1, destination: 1, airline: 0, international: false, timeMode: "day", start: "air", difficulty: 2, description: "从天空开局，沿绿色航线降落到国内机场。" },
  { title: "第3关 日本夜航", country: 2, destination: 2, airline: 4, international: false, timeMode: "night", start: "air", difficulty: 3, description: "夜间跑道灯更多，看灯线慢慢降落。" },
  { title: "第4关 韩国海边机场", country: 3, destination: 3, airline: 6, international: false, timeMode: "day", start: "air", difficulty: 4, description: "飞过城市上空，注意不要贴着楼房飞。" },
  { title: "第5关 中国到日本国际航班", country: 1, destination: 2, airline: 2, international: true, timeMode: "day", start: "takeoff", difficulty: 5, description: "先滑行起飞，再接上国际绿色航线。" },
  { title: "第6关 泰国夜航国际线", country: 5, destination: 6, airline: 7, international: true, timeMode: "night", start: "air", difficulty: 6, description: "夜航跨国飞行，速度和高度都要稳。" },
  { title: "第7关 大城市避障", country: 0, destination: 0, airline: 3, international: false, timeMode: "dusk", start: "air", difficulty: 7, description: "傍晚进近，大楼更近，撞到楼就失败。" },
  { title: "第8关 超远国际夜航", country: 6, destination: 0, airline: 8, international: true, timeMode: "night", start: "air", difficulty: 8, description: "最难：夜航、跨国、最后还要稳稳落到跑道。" }
];

const state = {
  airlineIndex: 0,
  countryIndex: 0,
  destinationCountryIndex: 0,
  international: false,
  levelIndex: 0,
  timeMode: "day",
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
  offRouteTime: 0,
  autopilot: false,
  autopilotWaypoint: 1,
  autopilotRoute: "takeoff",
  autopilotStage: "",
  explosionAge: 0
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
const countryScenery = new THREE.Group();
const explosionGroup = new THREE.Group();
scene.add(world, airport, parked, routeLights, countryScenery, explosionGroup);

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
let hazardBuildings = [];
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

function addSpriteLabel(text, subtext, pos, width = 8, height = 2.6, parent = scene) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeTextTexture([text, subtext], { width: 640, height: 220 }),
    transparent: true
  }));
  sprite.position.set(pos[0], pos[1], pos[2]);
  sprite.scale.set(width, height, 1);
  parent.add(sprite);
  return sprite;
}

function clearGroup(group) {
  while (group.children.length) {
    const child = group.children.pop();
    child.traverse?.((obj) => {
      obj.geometry?.dispose?.();
      if (obj.material?.map) obj.material.map.dispose?.();
      obj.material?.dispose?.();
    });
  }
}

function currentOriginCountry() {
  return countries[state.countryIndex];
}

function currentDestinationCountry() {
  return countries[state.destinationCountryIndex];
}

function currentRouteName() {
  const origin = currentOriginCountry();
  const destination = currentDestinationCountry();
  return state.international ? `${origin.name} → ${destination.name}` : origin.domestic;
}

function currentDestinationAirportName() {
  const origin = currentOriginCountry();
  const destination = currentDestinationCountry();
  return state.international ? destination.origin : origin.destination;
}

function normalizeAngle(angle) {
  let result = angle;
  while (result > Math.PI) result -= Math.PI * 2;
  while (result < -Math.PI) result += Math.PI * 2;
  return result;
}

function getInternationalPath() {
  const curveOffset = (state.destinationCountryIndex - state.countryIndex) * 8;
  return [
    new THREE.Vector3(18, 62, 250),
    new THREE.Vector3(20 + curveOffset, 86, 385),
    new THREE.Vector3(55 + curveOffset, 92, 520),
    new THREE.Vector3(82, 44, 690),
    new THREE.Vector3(100, 0.85, 860)
  ];
}

function getActiveRoutePath() {
  if (state.route === "landing") return state.international ? getInternationalPath() : landingPath;
  return runwayPath;
}

function addCityCluster(country, cityNames, baseX, baseZ, signText) {
  const mat = makeMat(country.color, 0.62, 0.24);
  const roofMat = makeMat(0x27313b, 0.56, 0.18);
  cityNames.forEach((city, index) => {
    const x = baseX + (index % 2) * 20;
    const z = baseZ + Math.floor(index / 2) * 28;
    const h = 5 + index * 2.4;
    box("country-city-building", [9, h, 7], [x, h / 2, z], mat, countryScenery);
    box("country-city-roof", [10, 0.55, 8], [x, h + 0.35, z], roofMat, countryScenery);
    addSpriteLabel(city, country.name, [x, h + 4.2, z], 4.7, 1.45, countryScenery);
    hazardBuildings.push({ x, z, width: 11, depth: 9, height: h + 0.55, label: `${country.name}${city}` });
  });
  addSpriteLabel(country.name, signText, [baseX + 10, 15, baseZ - 18], 7.2, 2, countryScenery);
}

function updateCountryScenery() {
  clearGroup(countryScenery);
  hazardBuildings = [];
  const origin = currentOriginCountry();
  const destination = currentDestinationCountry();
  addCityCluster(origin, origin.cities, -142, -92, origin.local);
  addCityCluster(destination, destination.cities, 172, 500, state.international ? destination.local : "国内目的地");
  addSpriteLabel(`${origin.name}出发机场`, origin.origin, [-48, 9, -82], 8.2, 2.1, countryScenery);
  addSpriteLabel(
    state.international ? `${destination.name}目的机场` : `${origin.name}国内机场`,
    currentDestinationAirportName(),
    [126, 10, 622],
    8.4,
    2.1,
    countryScenery
  );
  addSpriteLabel(
    state.international ? `国际航班：${origin.name} → ${destination.name}` : origin.domestic,
    "只能沿绿色航线飞",
    [55, 76, 420],
    10,
    2.4,
    countryScenery
  );
}

function setTimeMode(mode) {
  state.timeMode = mode;
  const isNight = mode === "night";
  const isDusk = mode === "dusk";
  scene.background = new THREE.Color(isNight ? 0x071326 : isDusk ? 0xffb36b : 0x9fd8ff);
  scene.fog.color.set(isNight ? 0x071326 : isDusk ? 0xffc082 : 0x9fd8ff);
  document.body.classList.toggle("night-flight", isNight);
  document.body.classList.toggle("dusk-flight", isDusk);
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
  addRouteLights(getActiveRoutePath(), mats.greenLight);
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
  updateCountryScenery();
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
  if (!playerPlane) {
    airlineText.textContent = airlines[index].short;
    updateAirlineButtons();
    return;
  }
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

function updateCountryButtons() {
  Array.from(countryButtons.children).forEach((button, index) => {
    button.classList.toggle("active", index === state.countryIndex);
  });
  internationalBtn.classList.toggle("active", state.international);
  internationalBtn.textContent = state.international
    ? `国际航班：${currentOriginCountry().name} → ${currentDestinationCountry().name}`
    : "国际航班";
}

function setDomesticCountry(index) {
  state.countryIndex = index;
  state.destinationCountryIndex = index;
  state.international = false;
  if (state.route === "landing") rebuildRouteLights();
  updateCountryScenery();
  updateCountryButtons();
  routeLabel.textContent = `${currentOriginCountry().domestic}：只能在${currentOriginCountry().name}飞。`;
  statusText.textContent = `已选择${currentOriginCountry().name}。这次是国内航班，目的机场是${currentDestinationAirportName()}。`;
  addLog(`国家切换到${currentOriginCountry().name}，只飞本国机场。`);
}

function startInternationalFlight() {
  const nextDestination = state.international
    ? (state.destinationCountryIndex + 1) % countries.length
    : (state.countryIndex + 1) % countries.length;
  state.destinationCountryIndex = nextDestination === state.countryIndex ? (nextDestination + 1) % countries.length : nextDestination;
  state.international = true;
  if (state.phase === "airborne" || state.phase === "landing") state.route = "landing";
  updateCountryScenery();
  rebuildRouteLights();
  updateCountryButtons();
  routeLabel.textContent = `国际航班：${currentOriginCountry().name} → ${currentDestinationCountry().name}`;
  statusText.textContent = `国际航班已选好。起飞后沿空中的绿色航线飞到${currentDestinationCountry().name}的${currentDestinationAirportName()}。`;
  addLog(`国际航班开启：${currentOriginCountry().name}飞往${currentDestinationCountry().name}。`);
}

function buildCountryButtons() {
  countries.forEach((country, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = country.name;
    button.addEventListener("click", () => setDomesticCountry(index));
    countryButtons.append(button);
  });
  internationalBtn.addEventListener("click", startInternationalFlight);
  updateCountryButtons();
}

function updateFlightLevelButtons() {
  Array.from(flightLevelGrid.children).forEach((button, index) => {
    button.classList.toggle("active", index === state.levelIndex);
  });
}

function buildFlightLevelButtons() {
  flightLevels.forEach((level, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<strong>${level.title}</strong><span>${level.timeMode === "night" ? "夜航" : level.timeMode === "dusk" ? "傍晚" : "白天"} · 难度 ${level.difficulty}/8<br>${level.description}</span>`;
    button.addEventListener("click", () => applyFlightLevel(index));
    flightLevelGrid.append(button);
  });
  updateFlightLevelButtons();
}

function openFlightLobby() {
  flightLobby.classList.add("open");
  updateFlightLevelButtons();
}

function closeFlightLobby() {
  flightLobby.classList.remove("open");
}

function applyFlightLevel(index) {
  const level = flightLevels[index];
  state.levelIndex = index;
  state.countryIndex = level.country;
  state.destinationCountryIndex = level.international ? level.destination : level.country;
  state.international = level.international;
  setTimeMode(level.timeMode);
  setAirline(level.airline);
  updateCountryButtons();
  updateCountryScenery();
  resetGame();
  missionTitle.textContent = level.title;
  routeLabel.textContent = `${level.timeMode === "night" ? "夜航" : level.timeMode === "dusk" ? "傍晚航班" : "白天航班"} · ${currentRouteName()} · 难度 ${level.difficulty}/8`;
  statusText.textContent = level.description;
  if (level.start === "air") {
    startAirLanding();
    missionTitle.textContent = level.title;
    routeLabel.textContent = `${level.timeMode === "night" ? "夜航" : level.timeMode === "dusk" ? "傍晚航班" : "白天航班"} · 沿绿色灯线降落 · 难度 ${level.difficulty}/8`;
    statusText.textContent = `${level.description} 这一关从天空开始，飞机会沿目的机场方向飞。`;
  }
  addLog(`进入${level.title}。`);
  updateFlightLevelButtons();
  closeFlightLobby();
}

function setAutopilot(enabled) {
  state.autopilot = enabled;
  state.autopilotWaypoint = 1;
  state.autopilotRoute = state.route;
  state.autopilotStage = "";
  autopilotBtn.textContent = enabled ? "手动驾驶" : "无人驾驶";
  autopilotBtn.classList.toggle("active", enabled);
}

function announceAutopilotStage(stage, text) {
  if (state.autopilotStage === stage) return;
  state.autopilotStage = stage;
  statusText.textContent = text;
  addLog(text);
}

function toggleAutopilot() {
  if (state.crashed || state.landed) resetGame();
  ensureAudio();
  setAutopilot(!state.autopilot);
  if (!state.autopilot) {
    statusText.textContent = "已切回手动驾驶，你可以自己推油门、拉操纵杆和收放起落架。";
    addLog("无人驾驶关闭，玩家接管飞机。");
    return;
  }
  if (state.phase === "airborne") {
    state.phase = "landing";
    state.route = "landing";
    rebuildRouteLights();
  }
  statusText.textContent = "无人驾驶开启：飞机会自动沿绿色灯线飞，经过城市上空，再飞到目的机场。";
  routeLabel.textContent = `无人驾驶：${currentRouteName()}`;
  addLog("无人驾驶开启，自动跟随绿色航线。");
}

function updateAutopilot() {
  if (!state.autopilot || state.crashed || state.landed) return;
  if (state.phase === "airborne") {
    state.phase = "landing";
    state.route = "landing";
    rebuildRouteLights();
    announceAutopilotStage("city-route", `无人驾驶转入航线：先飞过${currentDestinationCountry().cities[0]}上空，再去${currentDestinationAirportName()}。`);
  }
  if (state.autopilotRoute !== state.route) {
    state.autopilotRoute = state.route;
    state.autopilotWaypoint = 1;
  }

  const path = getActiveRoutePath();
  const targetIndex = Math.min(state.autopilotWaypoint, path.length - 1);
  const target = path[targetIndex];
  const dx = target.x - playerPlane.position.x;
  const dz = target.z - playerPlane.position.z;
  const distance = Math.hypot(dx, dz);
  if (distance < (state.route === "takeoff" ? 24 : 36) && state.autopilotWaypoint < path.length - 1) {
    state.autopilotWaypoint += 1;
  }

  const desiredHeading = Math.atan2(dx, dz);
  const headingError = normalizeAngle(desiredHeading - state.heading);
  state.yokeX = THREE.MathUtils.clamp(-headingError * 1.65, -0.85, 0.85);

  if (state.phase === "takeoff") {
    state.route = "takeoff";
    state.throttle = 0.96;
    state.gear = 0;
    state.yokeY = playerPlane.position.z > 95 && state.speed > 90 ? 0.78 : 0;
    announceAutopilotStage("takeoff-roll", `无人驾驶滑行：沿${currentOriginCountry().name}起飞跑道绿色灯线加速。`);
  } else if (state.phase === "landing") {
    state.route = "landing";
    const z = playerPlane.position.z;
    const desiredAltitude = z < 520 ? 58 : z < 735 ? THREE.MathUtils.mapLinear(z, 520, 735, 58, 12) : z < 850 ? THREE.MathUtils.mapLinear(z, 735, 850, 12, 0) : 0;
    const altitudeError = desiredAltitude - state.altitude;
    state.yokeY = THREE.MathUtils.clamp(altitudeError * 0.055, -0.55, 0.72);
    const targetSpeed = z < 650 ? 104 : z < 810 ? 74 : 58;
    state.throttle = THREE.MathUtils.clamp(targetSpeed / 142, 0.28, 0.78);
    state.gear = z > 700 ? 0 : 0.18;
    if (z < 590) {
      announceAutopilotStage("over-city", `无人驾驶正在飞过${currentDestinationCountry().cities[0]}城市上空，继续沿绿色灯线去机场。`);
    } else if (z < 815) {
      announceAutopilotStage("approach", `无人驾驶开始对准${currentDestinationAirportName()}降落跑道。`);
    } else {
      announceAutopilotStage("flare", "无人驾驶正在减速接地，飞机会停在跑道白线前。");
      state.gear = 0;
    }
  }

  throttleLever.value = String(Math.round(state.throttle * 100));
  gearLever.value = String(Math.round(state.gear * 100));
  updateYokeKnob();
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
  setAutopilot(false);
  throttleLever.value = "0";
  gearLever.value = "0";
  document.body.classList.remove("crashed");
  clearExplosion();
  playerPlane.visible = true;
  playerPlane.position.copy(runwayStart);
  playerPlane.rotation.set(0, 0, 0);
  flightLog.innerHTML = "";
  rebuildRouteLights();
  missionTitle.textContent = `${currentOriginCountry().name}起飞准备`;
  statusText.textContent = `飞机在${currentOriginCountry().origin}的 3000 km 训练跑道最尾端。油门往前推，从这一头滑到另一头，速度够了才会抬头起飞。`;
  routeLabel.textContent = `绿色灯线：起飞跑道 · ${currentRouteName()}`;
  addLog(`飞机在${currentOriginCountry().origin}，准备滑完整条跑道起飞。`);
  updateYokeKnob();
  updateFlightSound();
}

function followGreenLights() {
  if (state.crashed || state.landed) return;
  state.phase = "takeoff";
  state.route = "takeoff";
  rebuildRouteLights();
  routeLabel.textContent = `绿色灯线：起飞跑道 · ${currentRouteName()}`;
  statusText.textContent = `绿色灯线现在显示${currentOriginCountry().name}起飞跑道，飞机不用再从停机坪开过去。`;
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
  routeLabel.textContent = `绿色灯线：飞往${currentDestinationCountry().name}机场`;
  statusText.textContent = `降落导航开启：绿色灯线会带你飞到${currentDestinationAirportName()}的 3000 km 降落跑道，起落架 Down，速度低于 72 kt。`;
  addLog(`进入降落导航，目标是${currentDestinationAirportName()}。`);
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
  const path = getActiveRoutePath();
  playerPlane.position.copy(path[0]);
  playerPlane.position.y = 0.62 + state.altitude * 0.22;
  state.heading = Math.atan2(path[1].x - path[0].x, path[1].z - path[0].z);
  playerPlane.rotation.set(0, state.heading, 0);
  rebuildRouteLights();
  missionTitle.textContent = "空中降落开局";
  routeLabel.textContent = `空中开局：沿绿色灯线飞往${currentDestinationCountry().name}`;
  statusText.textContent = `你已经在天空上飞了。沿绿色灯线飞向${currentDestinationAirportName()}，快到跑道时减速，起落架保持 Down。`;
  addLog(`空中开局：飞机已经在天上，准备降落到${currentDestinationAirportName()}。`);
  updateYokeKnob();
  updateFlightSound();
}

function brake() {
  state.throttle = -0.3;
  throttleLever.value = "-30";
  state.speed = Math.max(0, state.speed - 24);
  statusText.textContent = "刹车，油门杆拉到最后面，飞机会慢慢停下来。";
}

function demoCrash() {
  if (state.crashed || state.landed) resetGame();
  ensureAudio();
  playerPlane.position.y = Math.max(playerPlane.position.y, 4);
  crash("事故演示：飞机失控，出现爆炸失败效果。正常游戏里要避开大楼、对准跑道安全降落。");
}

function clearExplosion() {
  while (explosionGroup.children.length) {
    const child = explosionGroup.children.pop();
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  }
  state.explosionAge = 0;
}

function createExplosion(position) {
  clearExplosion();
  const colors = [0xffd65a, 0xff4a3a, 0xff8a24, 0x242424];
  for (let i = 0; i < 26; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: colors[i % colors.length],
      emissive: i % 4 === 3 ? 0x101010 : colors[i % colors.length],
      emissiveIntensity: i % 4 === 3 ? 0.2 : 1.4,
      roughness: 0.65,
      transparent: true,
      opacity: 0.9
    });
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.7 + Math.random() * 0.75, 16, 16), material);
    puff.position.copy(position);
    puff.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 18,
      6 + Math.random() * 20,
      (Math.random() - 0.5) * 18
    );
    explosionGroup.add(puff);
  }
  state.explosionAge = 0.001;
}

function updateExplosion(dt) {
  if (!state.explosionAge) return;
  state.explosionAge += dt;
  explosionGroup.children.forEach((puff) => {
    puff.position.addScaledVector(puff.userData.velocity, dt);
    puff.userData.velocity.y -= 18 * dt;
    puff.scale.multiplyScalar(1 + dt * 1.8);
    puff.material.opacity = Math.max(0, 0.95 - state.explosionAge * 0.72);
  });
  if (state.explosionAge > 1.55) clearExplosion();
}

function checkHazardCollisions() {
  if (state.crashed || state.landed || state.altitude > 18) return;
  for (const building of hazardBuildings) {
    const dx = Math.abs(playerPlane.position.x - building.x);
    const dz = Math.abs(playerPlane.position.z - building.z);
    if (dx < building.width * 0.62 && dz < building.depth * 0.7 && playerPlane.position.y < building.height + 2.2) {
      crash(`撞到${building.label}大楼，飞机爆炸，任务失败。`);
      return;
    }
  }
}

function crash(reason) {
  if (state.crashed || state.landed) return;
  setAutopilot(false);
  state.crashed = true;
  state.speed = 0;
  state.throttle = 0;
  throttleLever.value = "0";
  createExplosion(playerPlane.position.clone());
  playerPlane.visible = true;
  playerPlane.rotation.x = 0.38;
  playerPlane.rotation.z = -0.62;
  playerPlane.position.y = Math.max(0.85, playerPlane.position.y);
  document.body.classList.add("crashed");
  missionTitle.textContent = "飞行失败";
  statusText.textContent = reason;
  addLog(reason);
}

function landSuccess() {
  setAutopilot(false);
  state.landed = true;
  state.phase = "landed";
  state.speed = 0;
  state.throttle = 0;
  throttleLever.value = "0";
  missionTitle.textContent = "安全降落";
  statusText.textContent = `飞机飞到${currentDestinationAirportName()}，沿降落跑道减速停下，任务成功。`;
  addLog(`安全降落在${currentDestinationAirportName()}，飞机停在白线前。`);
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
      if (state.international) {
        state.route = "landing";
        rebuildRouteLights();
        routeLabel.textContent = `国际航班：沿绿色灯线飞往${currentDestinationCountry().name}`;
      } else {
        routeLabel.textContent = "空中：可以拖动屏幕看四周，点降落导航飞往另一个机场。";
      }
      missionTitle.textContent = "已经起飞";
      playTakeoffWhoosh();
      addLog("机头抬起，飞机离地飞上去了。");
    }
  } else if (state.phase === "takeoff" && state.speed > 92 && !takeoffRollReady) {
    state.altitude = 0;
    statusText.textContent = state.autopilot
      ? "无人驾驶正在继续沿绿色灯线滑行，跑道距离够了才会自动抬头。"
      : "速度够了，但跑道还没滑够长。继续沿绿色灯线往前跑，过了中段才会抬头。";
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

  const activePath = getActiveRoutePath();
  const dist = nearestDistanceToPath(activePath);
  if (state.phase === "taxi" && state.speed > 48 && dist > 13) state.offRouteTime += dt;
  else state.offRouteTime = Math.max(0, state.offRouteTime - dt * 2);
  if (state.offRouteTime > 1.3) crash("滑行太快又偏离绿色导航灯，飞机冲出路线了。");

  const onTakeoffRunway = Math.abs(playerPlane.position.x) < 9 && playerPlane.position.z > -230 && playerPlane.position.z < 230;
  if (state.phase === "takeoff" && state.speed > 68 && !onTakeoffRunway && state.altitude < 2) crash("起飞时没有对准跑道，飞机冲出跑道。");

  const onLandingRunway = Math.abs(playerPlane.position.x - 100) < 9 && playerPlane.position.z < 910 && playerPlane.position.z > 390;
  if (state.phase === "landing" && state.altitude <= 0.2) {
    if (!onLandingRunway) crash("降落没有对准目的机场跑道，一头扎到跑道外地面，飞机爆炸。");
    else if (state.gear > 0.55) crash("起落架还在 Up，不能安全落地，飞机爆炸。");
    else if (state.speed > 78) crash("落地速度太快，飞机没有刹住，飞机爆炸。");
    else landSuccess();
  }

  checkHazardCollisions();

  if (playerPlane.position.x < -160 || playerPlane.position.x > 220 || playerPlane.position.z < -300 || playerPlane.position.z > 1010) {
    crash("飞出两个机场的超大范围，看不见跑道了，任务失败。");
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
  updateAutopilot();
  updatePhysics(dt);
  updateExplosion(dt);
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
  autopilotBtn.addEventListener("click", toggleAutopilot);
  document.querySelector("#brakeBtn").addEventListener("click", brake);
  document.querySelector("#demoCrashBtn").addEventListener("click", demoCrash);
  document.querySelector("#cameraBtn").addEventListener("click", () => {
    state.cameraMode = (state.cameraMode + 1) % 4;
    statusText.textContent = "视角已切换，也可以直接拖动屏幕往左、往右、往上、往下看。";
  });
  soundBtn.addEventListener("click", () => setSoundEnabled(!soundEnabled));
  flightLobbyBtn.addEventListener("click", openFlightLobby);
  closeFlightLobbyBtn.addEventListener("click", closeFlightLobby);
  flightLobby.addEventListener("click", (event) => {
    if (event.target === flightLobby) closeFlightLobby();
  });
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
buildCountryButtons();
buildFlightLevelButtons();
setupEvents();
resize();
resetGame();
setTimeMode("day");
tick();
