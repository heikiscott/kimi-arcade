import * as THREE from "./assets/three.module.js";

const canvas = document.querySelector("#flightCanvas");
const simPanel = document.querySelector(".sim");
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
const engineFireBtn = document.querySelector("#engineFireBtn");
const engineOffBtn = document.querySelector("#engineOffBtn");
const countryButtons = document.querySelector("#countryButtons");
const internationalBtn = document.querySelector("#internationalBtn");
const autopilotBtn = document.querySelector("#autopilotBtn");
const doorBtn = document.querySelector("#doorBtn");
const flightLobbyBtn = document.querySelector("#flightLobbyBtn");
const flightLobby = document.querySelector("#flightLobby");
const flightLevelGrid = document.querySelector("#flightLevelGrid");
const closeFlightLobbyBtn = document.querySelector("#closeFlightLobbyBtn");
const emergencyChoice = document.querySelector("#emergencyChoice");
const waterAutopilotBtn = document.querySelector("#waterAutopilotBtn");
const groundAutopilotBtn = document.querySelector("#groundAutopilotBtn");
const closeEmergencyChoiceBtn = document.querySelector("#closeEmergencyChoiceBtn");
const passengerModeBtn = document.querySelector("#passengerModeBtn");
const passengerNormalBtn = document.querySelector("#passengerNormalBtn");
const passengerAccidentWaterBtn = document.querySelector("#passengerAccidentWaterBtn");
const passengerAccidentGroundBtn = document.querySelector("#passengerAccidentGroundBtn");
const oxygenMaskBtn = document.querySelector("#oxygenMaskBtn");
const lifeJacketBtn = document.querySelector("#lifeJacketBtn");
const emergencyExitBtn = document.querySelector("#emergencyExitBtn");

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
  { id: "ak", short: "亚洲", name: "AirAsia", local: "AirAsia", color: 0xd82727, accent: 0xffffff, model: "Airbus A320" },
  { id: "ci", short: "华航", name: "China Airlines", local: "中华航空", color: 0x3466b6, accent: 0xf09ab7, model: "Airbus A350" },
  { id: "br", short: "长荣", name: "EVA Air", local: "长荣航空", color: 0x1f8658, accent: 0xf2c84b, model: "Boeing 787" },
  { id: "ha", short: "夏威夷", name: "Hawaiian Airlines", local: "Hawaiian Airlines", color: 0x5e3a92, accent: 0xff87ba, model: "Airbus A330" },
  { id: "ba", short: "英航", name: "British Airways", local: "British Airways", color: 0x254f9f, accent: 0xd52b2f, model: "Boeing 777" }
];

const countries = [
  {
    id: "cn",
    name: "中国",
    local: "China",
    domestic: "中国国内航班",
    cities: ["北京", "深圳"],
    airports: ["北京云港机场", "深圳宝安训练机场"],
    origin: "北京云港机场",
    destination: "深圳宝安训练机场",
    color: 0xd83a34
  },
  {
    id: "us",
    name: "美国",
    local: "United States",
    domestic: "美国国内航班",
    cities: ["纽约", "洛杉矶"],
    airports: ["纽约自由机场", "洛杉矶星光机场"],
    origin: "纽约自由机场",
    destination: "洛杉矶星光机场",
    color: 0x335f9f
  },
  {
    id: "jp",
    name: "日本",
    local: "Japan",
    domestic: "日本国内航班",
    cities: ["东京", "大阪"],
    airports: ["东京羽田训练机场", "大阪关西训练机场"],
    origin: "东京羽田训练机场",
    destination: "大阪关西训练机场",
    color: 0xe0e6ef
  },
  {
    id: "sg",
    name: "新加坡",
    local: "Singapore",
    domestic: "新加坡本地航班",
    cities: ["樟宜", "滨海湾"],
    airports: ["樟宜训练机场", "滨海湾水岸机场"],
    origin: "樟宜训练机场",
    destination: "滨海湾水岸机场",
    color: 0x55b987
  },
  {
    id: "tw",
    name: "台湾",
    local: "Taiwan",
    domestic: "台湾岛内航班",
    cities: ["台北", "高雄"],
    airports: ["台北桃园训练机场", "高雄小港训练机场"],
    origin: "台北桃园训练机场",
    destination: "高雄小港训练机场",
    color: 0x4fb3d8
  },
  {
    id: "hi",
    name: "夏威夷",
    local: "Hawaii",
    domestic: "夏威夷群岛航班",
    cities: ["火奴鲁鲁", "茂宜岛"],
    airports: ["火奴鲁鲁海岛机场", "茂宜岛海湾机场"],
    origin: "火奴鲁鲁海岛机场",
    destination: "茂宜岛海湾机场",
    color: 0x69c7c0
  },
  {
    id: "th",
    name: "泰国",
    local: "Thailand",
    domestic: "泰国国内航班",
    cities: ["曼谷", "普吉岛"],
    airports: ["曼谷素万训练机场", "普吉岛海岸机场"],
    origin: "曼谷素万训练机场",
    destination: "普吉岛海岸机场",
    color: 0x8f5bb8
  },
  {
    id: "kr",
    name: "韩国",
    local: "Korea",
    domestic: "韩国国内航班",
    cities: ["首尔", "济州岛"],
    airports: ["首尔仁川训练机场", "济州岛海风机场"],
    origin: "首尔仁川训练机场",
    destination: "济州岛海风机场",
    color: 0x78aee8
  },
  {
    id: "fr",
    name: "法国",
    local: "France",
    domestic: "法国国内航班",
    cities: ["巴黎", "尼斯"],
    airports: ["巴黎戴高乐训练机场", "尼斯蔚蓝海岸机场"],
    origin: "巴黎戴高乐训练机场",
    destination: "尼斯蔚蓝海岸机场",
    color: 0xd6b48f
  },
  {
    id: "ae",
    name: "阿联酋",
    local: "United Arab Emirates",
    domestic: "阿联酋国内航班",
    cities: ["迪拜", "阿布扎比"],
    airports: ["迪拜云塔机场", "阿布扎比海湾机场"],
    origin: "迪拜云塔机场",
    destination: "阿布扎比海湾机场",
    color: 0xd9b15e
  }
];

const runwayStart = new THREE.Vector3(0, 0.62, -220);
const playerPlaneScale = 1;
const spaceAltitude = 500;
const riverRescueLanding = { x: 338, z: 548, heading: 0.76 };

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

const arrivalTaxiPath = [
  new THREE.Vector3(100, 0.12, 860),
  new THREE.Vector3(108, 0.12, 820),
  new THREE.Vector3(128, 0.12, 778),
  new THREE.Vector3(145, 0.12, 728),
  new THREE.Vector3(142, 0.12, 680),
  new THREE.Vector3(132, 0.12, 646),
  new THREE.Vector3(122, 0.12, 620)
];

const arrivalGateStand = {
  x: 122,
  terminalZ: 599.3,
  planeZ: 620,
  bridgeStartZ: 601.5,
  bridgeY: 1.58,
  doorOffsetX: 0.9,
  doorOffsetZ: 4.12
};

const flightLevels = [
  { title: "第1关 白天训练起飞", country: 3, destination: 3, airline: 5, international: false, timeMode: "day", start: "takeoff", difficulty: 1, description: "最简单：白天、直跑道，先练滑行和抬头起飞。" },
  { title: "第2关 白天城市降落", country: 0, destination: 0, airline: 0, international: false, timeMode: "day", start: "air", difficulty: 2, description: "从天空开局，沿绿色航线降落到国内机场。" },
  { title: "第3关 日本夜航", country: 2, destination: 2, airline: 4, international: false, timeMode: "night", start: "air", difficulty: 3, description: "夜间跑道灯更多，看灯线慢慢降落。" },
  { title: "第4关 新加坡海边机场", country: 3, destination: 3, airline: 5, international: false, timeMode: "day", start: "air", difficulty: 4, description: "飞过海湾和低矮城市，远处才有大高楼。" },
  { title: "第5关 中国到日本国际航班", country: 0, destination: 2, airline: 2, international: true, timeMode: "day", start: "takeoff", difficulty: 5, description: "先滑行起飞，再接上国际绿色航线。" },
  { title: "第6关 日本到新加坡夜航", country: 2, destination: 3, airline: 4, international: true, timeMode: "night", start: "air", difficulty: 6, description: "夜航跨国飞行，速度和高度都要稳。" },
  { title: "第7关 美国远城降落", country: 1, destination: 1, airline: 3, international: false, timeMode: "dusk", start: "air", difficulty: 7, description: "傍晚进近，远处能看到大城市天际线。" },
  { title: "第8关 引擎着火迫降", country: 0, destination: 1, airline: 0, international: true, timeMode: "dusk", start: "emergency", difficulty: 8, description: "最难：空中引擎着火，关引擎后滑翔到水面或地面。" },
  { title: "第9关 台湾海峡航线", country: 0, destination: 4, airline: 16, international: true, timeMode: "day", start: "air", difficulty: 5, description: "飞过海峡和岛屿，大海在绿色航线下面。" },
  { title: "第10关 夏威夷跨海远航", country: 1, destination: 5, airline: 18, international: true, timeMode: "dusk", start: "air", difficulty: 7, description: "远航到海岛机场，下面是很宽的大海和小岛。" }
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
  passengerCabinViewMode: 0,
  passengerCabinX: -0.32,
  passengerCabinZ: 1.65,
  passengerCabinWalkYaw: 0,
  passengerWalking: false,
  cabinMoveX: 0,
  cabinMoveY: 0,
  route: "takeoff",
  crashed: false,
  landed: false,
  offRouteTime: 0,
  autopilot: false,
  autoTakeoffOnly: false,
  autopilotWaypoint: 1,
  autopilotRoute: "takeoff",
  autopilotStage: "",
  explosionAge: 0,
  twinTowerDemo: false,
  towerDemoTime: 0,
  towerCollapseTime: 0,
  towerImpacts: {},
  engineFire: false,
  engineOff: false,
  glideTimeLeft: 0,
  emergencyAutopilotMode: "",
  emergencySurface: "",
  waterLandingTime: 0,
  waterLandingDuration: 0,
  waterLandingHeading: 0,
  gateDocking: false,
  gateDocked: false,
  gateExtend: 0,
  planeDoorOpen: false,
  passengerFlow: false,
  passengerTime: 0,
  passengerMode: false,
  passengerBoarding: false,
  passengerBoarded: false,
  passengerBoardTime: 0,
  passengerAccidentTarget: "",
  oxygenMasksDropped: false,
  oxygenMaskOn: false,
  lifeJacketOn: false,
  lifeRaftDeployed: false,
  emergencyExitOpened: false,
  evacuationSlideDeployed: false,
  evacuationPassengersReleased: false,
  evacuationActive: false,
  evacuationSurface: "",
  evacuationTime: 0,
  playerEvacuationStarted: false,
  playerEvacuated: false,
  planeSinking: false,
  planeSinkTime: 0,
  planeSinkDelay: 96,
  planeSinkDuration: 24,
  planeSinkStartY: 0,
  arrivalTaxi: false,
  arrivalTaxiTime: 0,
  arrivalTaxiDuration: 60
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd8ff);
scene.fog = new THREE.Fog(0x9fd8ff, 1100, 3200);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1800);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const clock = new THREE.Clock();
const world = new THREE.Group();
const earthScenery = new THREE.Group();
const airport = new THREE.Group();
const parked = new THREE.Group();
const routeLights = new THREE.Group();
const countryScenery = new THREE.Group();
const spaceScenery = new THREE.Group();
const explosionGroup = new THREE.Group();
const engineFireGroup = new THREE.Group();
const twinTowerTest = new THREE.Group();
const waterSplashGroup = new THREE.Group();
const disembarkPassengers = new THREE.Group();
const boardingPassengerGroup = new THREE.Group();
const lifeRaftGroup = new THREE.Group();
const evacuationGroup = new THREE.Group();
scene.add(world, earthScenery, airport, parked, routeLights, countryScenery, spaceScenery, twinTowerTest, explosionGroup, engineFireGroup, waterSplashGroup, disembarkPassengers, boardingPassengerGroup, lifeRaftGroup, evacuationGroup);

const mats = {
  concrete: makeMat(0xb8bcc0, 0.72, 0.42),
  dark: makeMat(0x1c2730, 0.58, 0.55),
  runway: makeMat(0x333b42, 0.82, 0.38),
  grass: makeMat(0x5da35f, 0.9, 0.5),
  white: makeMat(0xf7fbff, 0.35, 0.45),
  steel: makeMat(0x7d8890, 0.55, 0.42),
  yellow: makeMat(0xf2c84b, 0.68, 0.35),
  earth: makeMat(0x4f9b58, 0.94, 0.2),
  water: new THREE.MeshStandardMaterial({ color: 0x2178bd, emissive: 0x043f6a, emissiveIntensity: 0.22, roughness: 0.52, metalness: 0.02 }),
  mountain: makeMat(0x7a6a55, 0.86, 0.14),
  mountainSnow: makeMat(0xf1f7ff, 0.58, 0.04),
  cityGlass: new THREE.MeshStandardMaterial({ color: 0x4b6475, emissive: 0x11283a, emissiveIntensity: 0.35, roughness: 0.42, metalness: 0.18 }),
  cityLight: new THREE.MeshStandardMaterial({ color: 0xffd66b, emissive: 0xffb23a, emissiveIntensity: 1.65, roughness: 0.48, metalness: 0.08 }),
  roadDark: makeMat(0x202931, 0.78, 0.18),
  runwayYellowLight: new THREE.MeshStandardMaterial({ color: 0xffd65a, emissive: 0xffb300, emissiveIntensity: 1.8, roughness: 0.34, metalness: 0.12 }),
  greenLight: new THREE.MeshStandardMaterial({ color: 0x62ff8b, emissive: 0x1fe568, emissiveIntensity: 1.7 }),
  redLight: new THREE.MeshStandardMaterial({ color: 0xff4a3a, emissive: 0xd91f12, emissiveIntensity: 1.5 })
};

let playerPlane;
let playerAircraftParts = {};
let jetBridgeParts = {};
let oxygenMaskRig = null;
let passengerCabinRig = null;
let hazardBuildings = [];
let scenicHazardBuildings = [];
let waterLandingSegments = [];
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

function currentAirportRouteName() {
  return `${currentOriginCountry().origin} → ${currentDestinationAirportName()}`;
}

function currentDestinationAirportName() {
  const origin = currentOriginCountry();
  const destination = currentDestinationCountry();
  return state.international ? destination.destination : origin.destination;
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

function getEmergencyWaterPath() {
  const rescuePoint = getRiverRescueLandingPoint();
  return [
    new THREE.Vector3(-260, 110, 420),
    new THREE.Vector3(-120, 88, 430),
    new THREE.Vector3(40, 62, 475),
    new THREE.Vector3(210, 28, 520),
    new THREE.Vector3(300, 10, 540),
    rescuePoint
  ];
}

function getRiverRescueLandingPoint() {
  return new THREE.Vector3(riverRescueLanding.x, 0.85, riverRescueLanding.z);
}

function getEmergencyGroundPath() {
  return [
    new THREE.Vector3(-260, 110, 420),
    new THREE.Vector3(-330, 74, 455),
    new THREE.Vector3(-425, 42, 500),
    new THREE.Vector3(-520, 0.85, 545)
  ];
}

function getActiveRoutePath() {
  if (state.route === "emergency-water") return getEmergencyWaterPath();
  if (state.route === "emergency-ground") return getEmergencyGroundPath();
  if (state.route === "arrival-taxi") return arrivalTaxiPath;
  if (state.route === "landing") return state.international ? getInternationalPath() : landingPath;
  return runwayPath;
}

function addCityCluster(country, cityNames, baseX, baseZ, signText) {
  const mat = makeMat(country.color, 0.62, 0.24);
  const roofMat = makeMat(0x27313b, 0.56, 0.18);
  cityNames.forEach((city, index) => {
    const x = baseX + (index % 2) * 24;
    const z = baseZ + Math.floor(index / 2) * 26;
    const h = 3.6 + index * 0.9;
    box("country-low-airport-building", [16, h, 9], [x, h / 2, z], mat, countryScenery);
    box("country-low-airport-roof", [17, 0.5, 10], [x, h + 0.3, z], roofMat, countryScenery);
    box("country-airport-apron-strip", [20, 0.08, 4], [x, 0.06, z + 8], mats.concrete, countryScenery);
    addSpriteLabel(city, country.name, [x, h + 4.2, z], 4.7, 1.45, countryScenery);
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
    currentAirportRouteName(),
    "左机场起飞，飞过中间城市，再到右边机场降落",
    [55, 76, 420],
    11.2,
    2.4,
    countryScenery
  );
  if (state.international) {
    addInternationalSeaRoute(origin, destination);
  } else {
    addDomesticRiverRoute(origin);
  }
}

function addDomesticRiverRoute(origin) {
  const riverPoints = [
    [-112, 292],
    [-72, 326],
    [-38, 360],
    [14, 388],
    [58, 418],
    [92, 470],
    [132, 510]
  ];
  addWaterRibbonToCountryScenery(riverPoints, 10, "domestic-river-route");
  addSpriteLabel(
    "国内航班：经过河道",
    `${origin.cities[0]}到${origin.cities[1]}，下面是城市河流`,
    [-48, 13, 344],
    9.2,
    2,
    countryScenery
  );
  for (let i = 0; i < 4; i++) {
    box("domestic-river-bridge", [26, 0.22, 2.2], [-50 + i * 48, 0.42, 330 + i * 42], mats.steel, countryScenery).rotation.y = -0.55;
  }
}

function addInternationalSeaRoute(origin, destination) {
  box("international-ocean-zone", [560, 0.09, 460], [48, 0.2, 438], mats.water, countryScenery);
  box("international-deep-ocean-band", [520, 0.08, 170], [56, 0.26, 448], makeMat(0x125da0, 0.55, 0.02), countryScenery);
  box("international-long-sea-landing-strip", [34, 0.1, 390], [112, 0.34, 438], makeMat(0x5fd8ff, 0.48, 0.02), countryScenery);
  addSpriteLabel(
    "国际航班：经过很长大海",
    `${origin.name}飞往${destination.name}，海面迫降区比跑道还长`,
    [46, 17, 438],
    11.2,
    2.2,
    countryScenery
  );

  const islands = [
    [-92, 372, 12],
    [-22, 512, 16],
    [82, 350, 10],
    [132, 510, 18]
  ];
  islands.forEach(([x, z, radius], index) => {
    cyl("international-island-sand", radius, 0.22, [x, 0.42, z], makeMat(0xe9d48d, 0.88, 0.05), countryScenery, 28);
    cyl("international-island-green", radius * 0.68, 0.24, [x, 0.58, z], mats.grass, countryScenery, 28);
    if (index % 2 === 0) addSpriteLabel("海岛", index === 0 ? "像台湾/夏威夷这种航线会跨海" : "远处目的地", [x, 5.6, z], 5.4, 1.5, countryScenery);
  });

  const shipMat = makeMat(0xffffff, 0.42, 0.16);
  for (let i = 0; i < 3; i++) {
    const ship = box("international-ocean-ship", [8, 1.2, 3], [-110 + i * 105, 1.05, 462 + i * 28], shipMat, countryScenery);
    ship.rotation.y = 0.28;
    box("international-ship-cabin", [3.4, 1.4, 2.4], [-110 + i * 105, 2.28, 462 + i * 28], makeMat(0xd9e7f0, 0.45, 0.12), countryScenery).rotation.y = 0.28;
  }
}

function addWaterRibbonToCountryScenery(points, width, name) {
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i];
    const [bx, bz] = points[i + 1];
    const midX = (ax + bx) / 2;
    const midZ = (az + bz) / 2;
    const len = Math.hypot(bx - ax, bz - az);
    const segment = box(name, [width, 0.08, len], [midX, 0.31, midZ], mats.water, countryScenery);
    segment.rotation.y = Math.atan2(bx - ax, bz - az);
  }
}

function setTimeMode(mode) {
  state.timeMode = mode;
  document.body.classList.toggle("night-flight", mode === "night");
  document.body.classList.toggle("dusk-flight", mode === "dusk");
  updateWorldAtmosphere();
}

function addGround() {
  const ground = box("two-airport-apron", [360, 0.16, 1230], [45, -0.08, 340], mats.concrete, airport);
  ground.receiveShadow = true;
  box("departure-grass", [360, 0.08, 42], [45, -0.03, -292], mats.grass, airport);
  box("middle-grass", [54, 0.08, 560], [146, -0.03, 250], mats.grass, airport);
  box("arrival-grass", [360, 0.08, 42], [45, -0.03, 975], mats.grass, airport);
  addAirportCityAirportLayout();
  addRunway("起飞机场 · 3000 km 起飞跑道 18", [0, 0.02, 0], [16, 0.05, 460]);
  addRunway("起飞机场 · 起飞跑道 19L", [-56, 0.021, 0], [13, 0.05, 420]);
  addRunway("起飞机场 · 起飞跑道 19R", [56, 0.021, 0], [13, 0.05, 420]);
  addRunway("目的机场 · 3000 km 降落跑道 27", [100, 0.03, 650], [16, 0.05, 520]);
  addRunway("目的机场 · 降落跑道 28L", [48, 0.031, 650], [13, 0.05, 470]);
  addRunway("目的机场 · 降落跑道 28R", [152, 0.031, 650], [13, 0.05, 470]);
  addTaxiway([-44, -46], [-44, -22]);
  addTaxiway([-44, -22], [-34, -10]);
  addTaxiway([-34, -10], [-18, -2]);
  addTaxiway([-18, -2], [-8, 15]);
  addTaxiway([-8, 15], [0, 34]);
  addTaxiway([62, 420], [82, 500]);
  addTaxiway([82, 500], [100, 610]);
  addTaxiway([100, 860], [108, 820]);
  addTaxiway([108, 820], [128, 778]);
  addTaxiway([128, 778], [145, 728]);
  addTaxiway([145, 728], [142, 680]);
  addTaxiway([142, 680], [132, 646]);
  addTaxiway([132, 646], [122, 620]);
  addDestinationCityTaxiScene();

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

function addAirportCityAirportLayout() {
  const departureMat = makeMat(0xa7b2ba, 0.78, 0.34);
  const cityMat = makeMat(0x2e4251, 0.82, 0.16);
  const destinationMat = makeMat(0xc4ccd1, 0.74, 0.34);
  const dividerMat = makeMat(0x0f151b, 0.6, 0.22);

  box("layout-left-departure-airport-zone", [300, 0.06, 490], [0, 0.015, 0], departureMat, airport);
  box("layout-middle-city-zone", [330, 0.07, 280], [55, 0.025, 390], cityMat, airport);
  box("layout-right-arrival-airport-zone", [300, 0.06, 500], [105, 0.015, 735], destinationMat, airport);

  addLayoutDivider("机场 | 城市", 245, dividerMat);
  addLayoutDivider("城市 | 机场", 545, dividerMat);

  box("left-airport-label-pad", [58, 0.12, 12], [-84, 0.12, -196], mats.dark, airport);
  box("middle-city-label-pad", [74, 0.12, 12], [30, 0.12, 318], mats.dark, airport);
  box("right-airport-label-pad", [62, 0.12, 12], [145, 0.12, 905], mats.dark, airport);
  addSpriteLabel("左边：出发机场", "从这里滑行、加速、起飞", [-84, 9, -196], 8.8, 2);
  addSpriteLabel("中间：城市", "飞过高楼、商场、店铺和游乐园", [30, 32, 318], 9.8, 2.1);
  addSpriteLabel("右边：目的机场", "降落后滑行到登机桥", [145, 9, 905], 8.8, 2);

  addMiddleCityCorridor();
}

function addLayoutDivider(label, z, dividerMat) {
  box("airport-city-black-divider", [340, 0.16, 3.2], [45, 0.16, z], dividerMat, airport);
  box("airport-city-yellow-divider", [340, 0.08, 0.48], [45, 0.28, z - 2.3], mats.runwayYellowLight, airport);
  box("airport-city-yellow-divider", [340, 0.08, 0.48], [45, 0.28, z + 2.3], mats.runwayYellowLight, airport);
  addSpriteLabel(label, "穿过分界线继续飞，不在这里突然切换国家", [45, 7, z], 8.8, 1.8);
}

function addMiddleCityCorridor() {
  const plazaMat = makeMat(0x4b5661, 0.78, 0.18);
  const roadMat = mats.roadDark;
  box("middle-city-plaza", [245, 0.08, 210], [50, 0.08, 390], plazaMat, airport);
  box("middle-city-main-road", [14, 0.09, 245], [48, 0.16, 390], roadMat, airport);
  box("middle-city-cross-road", [218, 0.09, 12], [50, 0.17, 390], roadMat, airport);
  box("middle-city-green-route-line", [0.42, 0.11, 236], [48, 0.25, 390], mats.greenLight, airport);

  const towers = [
    [-70, 300, 17], [-43, 338, 23], [-76, 386, 28], [-42, 438, 21],
    [-10, 292, 30], [18, 338, 24], [14, 428, 35], [82, 306, 26],
    [108, 352, 32], [92, 440, 24], [136, 484, 29], [160, 374, 21]
  ];
  towers.forEach(([x, z, h], index) => {
    const tower = box("middle-city-high-rise", [11, h, 11], [x, h / 2, z], mats.cityGlass, airport);
    tower.userData.scenicOnly = true;
    box("middle-city-rooftop-light", [8.5, 0.28, 8.5], [x, h + 0.22, z], mats.cityLight, airport);
    for (let floor = 4; floor < h - 2; floor += 4) {
      box("middle-city-window-front", [9.8, 0.26, 0.16], [x, floor, z - 5.58], mats.cityLight, airport);
      box("middle-city-window-side", [0.16, 0.26, 9.8], [x + 5.58, floor, z], mats.cityLight, airport);
    }
    if (index === 5) addSpriteLabel("大城市高楼", "机场之间会经过这里", [x, h + 5, z], 6.2, 1.6);
  });

  box("middle-city-mall", [32, 6, 18], [132, 3, 320], makeMat(0xe1edf2, 0.48, 0.14), airport);
  box("middle-city-mall-glass", [30, 2.4, 0.18], [132, 4.1, 310.9], makeMat(0x8bd4ee, 0.3, 0.06), airport);
  addSpriteLabel("商场", "Mall", [132, 10, 311], 5, 1.5);

  box("middle-city-amusement-pad", [38, 0.1, 34], [-94, 0.16, 472], makeMat(0x62b873, 0.88, 0.2), airport);
  const wheel = new THREE.Group();
  wheel.name = "middle-city-amusement-wheel";
  const rim = new THREE.Mesh(new THREE.TorusGeometry(6.6, 0.18, 12, 42), mats.runwayYellowLight);
  rim.rotation.y = Math.PI / 2;
  rim.position.set(0, 7.5, 0);
  wheel.add(rim);
  box("middle-wheel-leg-left", [0.3, 7.8, 0.3], [-3.1, 3.8, 0], mats.steel, wheel).rotation.z = -0.34;
  box("middle-wheel-leg-right", [0.3, 7.8, 0.3], [3.1, 3.8, 0], mats.steel, wheel).rotation.z = 0.34;
  wheel.position.set(-94, 0.16, 472);
  airport.add(wheel);
  addSpriteLabel("游乐园", "在城市里，不和机场混在一起", [-94, 16, 456], 7, 1.8);
}

function addDestinationCityTaxiScene() {
  const cityBaseMat = makeMat(0x394959, 0.78, 0.2);
  const mallMat = makeMat(0xd6e1e8, 0.48, 0.16);
  const shopMat = makeMat(0xf2c572, 0.58, 0.12);
  const parkMat = makeMat(0x5bbd70, 0.9, 0.32);
  box("arrival-city-ground", [146, 0.08, 290], [166, -0.025, 735], cityBaseMat, airport);
  box("arrival-airport-city-boulevard", [12, 0.06, 260], [158, 0.045, 735], mats.roadDark, airport);
  box("arrival-city-boulevard-light-line", [0.32, 0.08, 252], [158, 0.11, 735], mats.greenLight, airport);

  const towers = [
    [184, 820, 18], [202, 790, 24], [184, 760, 30], [204, 730, 22],
    [176, 700, 35], [200, 668, 28], [168, 640, 20], [194, 610, 26],
    [118, 792, 19], [103, 752, 27], [108, 706, 21], [112, 664, 31]
  ];
  towers.forEach(([x, z, h], index) => {
    box("arrival-city-high-rise", [10, h, 10], [x, h / 2, z], mats.cityGlass, airport);
    box("arrival-city-rooftop", [8, 0.28, 8], [x, h + 0.22, z], mats.cityLight, airport);
    for (let floor = 3; floor < h - 2; floor += 4) {
      box("arrival-city-window", [10.2, 0.26, 0.16], [x, floor, z - 5.08], mats.cityLight, airport);
    }
    if (index % 3 === 0) {
      addSpriteLabel("目的城市高楼", currentDestinationCountry().cities[index % currentDestinationCountry().cities.length], [x, h + 4, z], 5.2, 1.5);
    }
  });

  box("arrival-shopping-mall", [28, 6, 15], [178, 3, 865], mallMat, airport);
  box("arrival-shopping-mall-glass", [26, 2.4, 0.18], [178, 4.1, 857.4], makeMat(0x82c9e7, 0.3, 0.08), airport);
  addSpriteLabel("城市商场", "Mall", [178, 9.2, 856], 5.5, 1.7);

  for (let i = 0; i < 5; i++) {
    const x = 196 + i * 8;
    box("arrival-street-shop", [6.4, 3.2, 7], [x, 1.6, 844], shopMat, airport);
    box("arrival-shop-sign", [5.6, 0.5, 0.18], [x, 3.4, 840.4], mats.cityLight, airport);
  }
  addSpriteLabel("店铺街", "Shops", [210, 6, 838], 5, 1.5);

  box("arrival-amusement-park-pad", [38, 0.08, 34], [84, 0.03, 710], parkMat, airport);
  const wheel = new THREE.Group();
  wheel.name = "arrival-amusement-wheel";
  const rim = new THREE.Mesh(new THREE.TorusGeometry(7, 0.18, 12, 42), makeMat(0xffd95c, 0.42, 0.12));
  rim.rotation.y = Math.PI / 2;
  rim.position.set(0, 8, 0);
  wheel.add(rim);
  box("wheel-leg-left", [0.3, 8, 0.3], [-3.4, 4, 0], mats.steel, wheel).rotation.z = -0.34;
  box("wheel-leg-right", [0.3, 8, 0.3], [3.4, 4, 0], mats.steel, wheel).rotation.z = 0.34;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    box("wheel-cabin", [1.1, 0.7, 0.7], [0, 8 + Math.sin(angle) * 6.6, Math.cos(angle) * 6.6], makeMat(0xff8f5c, 0.56, 0.08), wheel);
  }
  wheel.position.set(84, 0.05, 710);
  airport.add(wheel);
  addSpriteLabel("城市游乐园", "没有交叉路口，只在机场外城市里", [84, 18, 692], 8.8, 2);
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
  addArrivalJetBridge();
  addSpriteLabel("远处机场", "降落到这里", [134, 7.2, 601], 5.8, 1.8);
}

function addArrivalJetBridge() {
  const group = new THREE.Group();
  group.name = "moving-arrival-jetbridge";
  group.position.set(arrivalGateStand.x + arrivalGateStand.doorOffsetX, 0, arrivalGateStand.bridgeStartZ);

  const bridgeMat = makeMat(0x1f2830, 0.58, 0.18);
  const glassMat = makeMat(0x7db8d5, 0.25, 0.08);
  const sealMat = makeMat(0x222a30, 0.64, 0.12);

  box("jetbridge-fixed-corridor", [1.45, 1.35, 5.2], [0, arrivalGateStand.bridgeY, 1.8], bridgeMat, group);
  box("jetbridge-fixed-window", [1.48, 0.42, 2.8], [0, arrivalGateStand.bridgeY + 0.13, 1.8], glassMat, group);
  const telescope = box("jetbridge-moving-corridor", [1.28, 1.18, 7.4], [0, arrivalGateStand.bridgeY, 6.4], bridgeMat, group);
  const head = box("jetbridge-plane-head", [1.55, 1.42, 1.8], [0, arrivalGateStand.bridgeY, 10.9], bridgeMat, group);
  const seal = box("jetbridge-black-door-seal", [1.08, 1.16, 0.46], [0, arrivalGateStand.bridgeY, 12.2], sealMat, group);
  const roofLight = box("jetbridge-roof-light", [1.0, 0.1, 8.8], [0, arrivalGateStand.bridgeY + 0.66, 6.8], mats.runwayYellowLight, group);
  const doorTarget = box("jetbridge-door-target-frame", [1.14, 1.18, 0.08], [0, arrivalGateStand.bridgeY, arrivalGateStand.planeZ + arrivalGateStand.doorOffsetZ - arrivalGateStand.bridgeStartZ], mats.greenLight, group);
  doorTarget.visible = false;
  addSpriteLabel("G1", "移动登机桥对准机门", [arrivalGateStand.x + arrivalGateStand.doorOffsetX, 5.7, arrivalGateStand.bridgeStartZ + 8], 6.2, 1.6);

  airport.add(group);
  jetBridgeParts = { group, telescope, head, seal, roofLight, doorTarget };
  updateJetBridgeVisual();
}

function updateJetBridgeVisual() {
  if (!jetBridgeParts.group) return;
  const extend = THREE.MathUtils.clamp(state.gateExtend, 0, 1);
  const doorLocalZ = arrivalGateStand.planeZ + arrivalGateStand.doorOffsetZ - arrivalGateStand.bridgeStartZ;
  const sealZ = THREE.MathUtils.lerp(12.2, doorLocalZ, extend);
  const headZ = sealZ - 1.16;
  const corridorStartZ = 4.1;
  const corridorLength = Math.max(3.8, headZ - corridorStartZ);
  jetBridgeParts.telescope.scale.z = corridorLength / 7.4;
  jetBridgeParts.telescope.position.z = corridorStartZ + corridorLength / 2;
  jetBridgeParts.head.position.z = headZ;
  jetBridgeParts.seal.position.z = sealZ;
  if (jetBridgeParts.roofLight) {
    jetBridgeParts.roofLight.scale.z = corridorLength / 8.8;
    jetBridgeParts.roofLight.position.z = corridorStartZ + corridorLength / 2;
  }
  if (jetBridgeParts.doorTarget) {
    jetBridgeParts.doorTarget.visible = extend > 0.97;
    jetBridgeParts.doorTarget.position.z = doorLocalZ;
  }
  jetBridgeParts.group.visible = true;
}

function clearPassengers() {
  while (disembarkPassengers.children.length) {
    const child = disembarkPassengers.children.pop();
    child.traverse((node) => {
      if (node.geometry) node.geometry.dispose();
      if (node.material) node.material.dispose();
    });
  }
}

function createTinyPassenger(index) {
  const person = new THREE.Group();
  person.name = "disembarking-passenger";
  const shirtColors = [0x2f78c4, 0xe05a73, 0xf0b84c, 0x46a96b, 0x8f64c7, 0xf4f7fa];
  const skin = makeMat(index % 2 ? 0xf0c39b : 0xd6a174, 0.62, 0.03);
  const shirt = makeMat(shirtColors[index % shirtColors.length], 0.72, 0.08);
  const pants = makeMat(0x243141, 0.68, 0.06);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), skin);
  head.position.set(0, 1.03, 0);
  person.add(head);
  box("passenger-body", [0.28, 0.42, 0.18], [0, 0.62, 0], shirt, person);
  box("passenger-left-leg", [0.1, 0.36, 0.1], [-0.07, 0.22, 0], pants, person);
  box("passenger-right-leg", [0.1, 0.36, 0.1], [0.07, 0.22, 0], pants, person);
  box("passenger-bag", [0.17, 0.24, 0.12], [0.25, 0.48, -0.04], makeMat(0x33383f, 0.7, 0.08), person);
  person.userData.index = index;
  person.visible = false;
  disembarkPassengers.add(person);
}

function createDisembarkPassengers() {
  clearPassengers();
  for (let i = 0; i < 10; i++) createTinyPassenger(i);
}

function updatePassengers() {
  if (!state.passengerFlow) return;
  const startX = arrivalGateStand.x + arrivalGateStand.doorOffsetX;
  const startZ = arrivalGateStand.planeZ + arrivalGateStand.doorOffsetZ;
  const terminalZ = arrivalGateStand.bridgeStartZ + 2.2;
  disembarkPassengers.children.forEach((person) => {
    const offset = person.userData.index * 0.48;
    const progress = THREE.MathUtils.clamp((state.passengerTime - offset) / 5.2, 0, 1);
    person.visible = progress > 0 && progress < 1;
    const wiggle = Math.sin(state.passengerTime * 6 + person.userData.index) * 0.08;
    person.position.set(
      startX + wiggle,
      0.15,
      THREE.MathUtils.lerp(startZ, terminalZ, progress)
    );
    person.rotation.y = Math.PI;
  });
  if (state.passengerTime > 9.8) {
    state.passengerFlow = false;
    clearPassengers();
    statusText.textContent = "乘客已经全部从飞机出来，走过登机桥，进入机场准备过海关。";
    addLog("乘客下机完成，已经进入机场海关方向。");
  }
}

function clearOxygenMasks() {
  if (!oxygenMaskRig) return;
  const parent = oxygenMaskRig.parent;
  parent?.remove(oxygenMaskRig);
  clearGroup(oxygenMaskRig);
  oxygenMaskRig = null;
}

function clearPassengerCabin() {
  if (!passengerCabinRig) return;
  const parent = passengerCabinRig.parent;
  parent?.remove(passengerCabinRig);
  clearGroup(passengerCabinRig);
  passengerCabinRig = null;
}

function clearPassengerModeVisuals() {
  clearGroup(boardingPassengerGroup);
  clearGroup(lifeRaftGroup);
  clearGroup(evacuationGroup);
  clearOxygenMasks();
  clearPassengerCabin();
  state.passengerBoarding = false;
  state.passengerBoarded = false;
  state.passengerBoardTime = 0;
  state.passengerCabinX = -0.32;
  state.passengerCabinZ = 1.65;
  state.passengerCabinWalkYaw = 0;
  state.passengerWalking = false;
  state.cabinMoveX = 0;
  state.cabinMoveY = 0;
  state.passengerAccidentTarget = "";
  state.oxygenMasksDropped = false;
  state.oxygenMaskOn = false;
  oxygenMaskBtn.textContent = "戴氧气面罩";
  state.lifeJacketOn = false;
  state.lifeRaftDeployed = false;
  state.emergencyExitOpened = false;
  state.evacuationSlideDeployed = false;
  state.evacuationPassengersReleased = false;
  oxygenMaskBtn.classList.remove("active");
  lifeJacketBtn.classList.remove("active");
  emergencyExitBtn.classList.remove("active");
  state.evacuationActive = false;
  state.evacuationSurface = "";
  state.evacuationTime = 0;
  state.playerEvacuationStarted = false;
  state.playerEvacuated = false;
  state.planeSinking = false;
  state.planeSinkTime = 0;
  updateEmergencyActionButton();
}

function createLastPassengerAvatar() {
  const person = new THREE.Group();
  person.name = "last-passenger-avatar";
  const skin = makeMat(0xf0c09a, 0.58, 0.03);
  const shirt = makeMat(0x2f78c4, 0.72, 0.08);
  const pants = makeMat(0x233142, 0.68, 0.06);
  const hair = makeMat(0x352014, 0.74, 0.05);
  const vest = makeMat(0xffa326, 0.55, 0.08);
  box("last-passenger-body", [0.46, 0.72, 0.26], [0, 0.72, 0], shirt, person);
  box("last-passenger-left-leg", [0.15, 0.55, 0.14], [-0.12, 0.24, 0], pants, person);
  box("last-passenger-right-leg", [0.15, 0.55, 0.14], [0.12, 0.24, 0], pants, person);
  box("last-passenger-left-arm", [0.11, 0.48, 0.12], [-0.34, 0.75, 0.03], skin, person);
  box("last-passenger-right-arm", [0.11, 0.48, 0.12], [0.34, 0.75, 0.03], skin, person);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 18, 18), skin);
  head.name = "last-passenger-head";
  head.position.set(0, 1.2, 0);
  person.add(head);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.29, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.48), hair);
  cap.name = "last-passenger-hair";
  cap.position.set(0, 1.28, 0);
  person.add(cap);
  const bag = box("last-passenger-small-bag", [0.22, 0.32, 0.2], [0.5, 0.5, -0.04], makeMat(0x303844, 0.68, 0.08), person);
  bag.rotation.z = -0.18;
  const jacket = box("last-passenger-life-jacket", [0.52, 0.58, 0.12], [0, 0.77, -0.16], vest, person);
  jacket.name = "last-passenger-life-jacket";
  jacket.visible = false;
  person.userData.lifeJacket = jacket;
  return person;
}

function getPlaneDoorWorldPosition() {
  const target = new THREE.Vector3();
  if (playerAircraftParts.doorWindow) {
    playerAircraftParts.doorWindow.getWorldPosition(target);
  } else if (playerAircraftParts.door) {
    playerAircraftParts.door.getWorldPosition(target);
  } else {
    target.copy(playerPlane.position).add(new THREE.Vector3(1.2, 1.1, 3.6));
  }
  return target;
}

function getPlaneLocalWorldPoint(x, y, z) {
  playerPlane.updateMatrixWorld(true);
  return new THREE.Vector3(x, y, z).applyMatrix4(playerPlane.matrixWorld);
}

function isCabinLookMode() {
  return Boolean(
    state.passengerMode &&
    state.passengerBoarded &&
    passengerCabinRig?.visible &&
    (!state.evacuationActive || !state.evacuationSlideDeployed)
  );
}

function getSeatedCabinPassenger() {
  if (!passengerCabinRig) return null;
  return passengerCabinRig.children.find((child) => child.name === "seated-last-passenger") || null;
}

function syncCabinPassengerAvatar() {
  const passenger = getSeatedCabinPassenger();
  if (!passenger) return;
  passenger.position.set(state.passengerCabinX, 1.5, state.passengerCabinZ);
  passenger.rotation.y = Math.PI + state.passengerCabinWalkYaw;
  passenger.rotation.z = state.passengerWalking ? Math.sin(clock.elapsedTime * 12) * 0.08 : 0;
  if (passenger.userData?.lifeJacket) passenger.userData.lifeJacket.visible = state.lifeJacketOn;
}

function createPassengerCabin() {
  clearPassengerCabin();
  passengerCabinRig = new THREE.Group();
  passengerCabinRig.name = "single-deck-passenger-cabin";
  const floorMat = makeMat(0x263746, 0.65, 0.08);
  const seatMat = makeMat(0x274f90, 0.52, 0.12);
  const vestMat = makeMat(0xff9f1c, 0.48, 0.08);
  const wallMat = makeMat(0xe9f3f9, 0.45, 0.08);
  const aisleMat = makeMat(0x9eb5c8, 0.62, 0.05);
  const binMat = makeMat(0xd8e7f0, 0.5, 0.06);
  wallMat.transparent = true;
  wallMat.opacity = 0.32;
  wallMat.side = THREE.DoubleSide;
  box("single-deck-cabin-floor", [1.55, 0.05, 5.05], [0.15, 1.1, 0.7], floorMat, passengerCabinRig);
  box("single-deck-cabin-aisle", [0.22, 0.035, 4.86], [0.13, 1.145, 0.7], aisleMat, passengerCabinRig);
  box("single-deck-cabin-left-wall", [0.05, 0.92, 4.9], [-0.72, 1.66, 0.7], wallMat, passengerCabinRig);
  box("single-deck-cabin-right-wall", [0.05, 0.92, 4.9], [1.02, 1.66, 0.7], wallMat, passengerCabinRig);
  box("single-deck-cabin-ceiling", [1.62, 0.06, 5.05], [0.15, 2.25, 0.7], wallMat, passengerCabinRig);
  box("left-overhead-bin", [0.48, 0.18, 4.65], [-0.46, 2.08, 0.65], binMat, passengerCabinRig);
  box("right-overhead-bin", [0.48, 0.18, 4.65], [0.76, 2.08, 0.65], binMat, passengerCabinRig);
  for (let row = 0; row < 4; row++) {
    const z = -0.8 + row * 0.82;
    box("cabin-left-seat", [0.42, 0.34, 0.38], [-0.32, 1.36, z], seatMat, passengerCabinRig);
    box("cabin-right-seat", [0.42, 0.34, 0.38], [0.58, 1.36, z], seatMat, passengerCabinRig);
    box("seat-back-screen", [0.28, 0.18, 0.035], [-0.32, 1.58, z - 0.18], makeMat(0x142535, 0.46, 0.1), passengerCabinRig);
    box("seat-back-screen", [0.28, 0.18, 0.035], [0.58, 1.58, z - 0.18], makeMat(0x142535, 0.46, 0.1), passengerCabinRig);
  }
  const passenger = createLastPassengerAvatar();
  passenger.name = "seated-last-passenger";
  passenger.scale.setScalar(0.62);
  passenger.position.set(state.passengerCabinX, 1.5, state.passengerCabinZ);
  passenger.rotation.y = Math.PI;
  passenger.userData.lifeJacket.visible = state.lifeJacketOn;
  passengerCabinRig.add(passenger);
  const seatVest = box("orange-life-jacket-under-seat", [0.42, 0.1, 0.28], [-0.32, 1.18, 1.65], vestMat, passengerCabinRig);
  seatVest.name = "orange-life-jacket-under-seat";
  addSpriteLabel("一层客舱", "你坐在一层，不是二楼", [0.14, 2.78, -1.36], 4.2, 1.2, passengerCabinRig);
  addSpriteLabel("座椅下救生衣", "点按钮穿上", [-0.32, 2.38, 1.65], 3.6, 1.15, passengerCabinRig);
  passengerCabinRig.visible = false;
  playerPlane.add(passengerCabinRig);
  syncCabinPassengerAvatar();
}

function dropOxygenMasks() {
  clearOxygenMasks();
  oxygenMaskRig = new THREE.Group();
  oxygenMaskRig.name = "dropped-oxygen-masks";
  const tubeMat = makeMat(0xe8f4ff, 0.45, 0.05);
  const maskMat = makeMat(0xffe680, 0.42, 0.06);
  const panelMat = makeMat(0xdceaf2, 0.5, 0.06);
  for (let row = 0; row < 5; row++) {
    const z = -1.2 + row * 0.75;
    box("oxygen-mask-ceiling-panel", [1.28, 0.055, 0.28], [0.05, 2.26, z], panelMat, oxygenMaskRig);
    for (const x of [-0.42, 0.52]) {
      box("oxygen-mask-strap", [0.035, 0.56, 0.035], [x, 2.0, z], tubeMat, oxygenMaskRig);
      box("oxygen-mask-top-anchor", [0.16, 0.04, 0.16], [x, 2.25, z], tubeMat, oxygenMaskRig);
      const mask = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), maskMat);
      mask.name = "oxygen-mask";
      mask.scale.set(1, 0.72, 0.55);
      mask.position.set(x, 1.68, z);
      oxygenMaskRig.add(mask);
    }
  }
  playerPlane.add(oxygenMaskRig);
  state.oxygenMasksDropped = true;
  state.oxygenMaskOn = false;
  oxygenMaskBtn.textContent = "戴氧气面罩";
  oxygenMaskBtn.classList.remove("active");
  playAlertBeep();
}

function putOnOxygenMask() {
  ensureAudio();
  if (state.oxygenMaskOn) {
    state.oxygenMaskOn = false;
    oxygenMaskBtn.classList.remove("active");
    oxygenMaskBtn.textContent = "戴氧气面罩";
    if (oxygenMaskRig) {
      oxygenMaskRig.traverse((node) => {
        if (node.name === "oxygen-mask") node.material = makeMat(0xffe680, 0.42, 0.06);
      });
    }
    statusText.textContent = "你已经把氧气面罩摘下来了。安全以后可以继续从滑梯到救生筏。";
    addLog("乘客操作：氧气面罩已经摘下。");
    return;
  }
  if (!state.passengerMode && !state.passengerBoarded) {
    statusText.textContent = "先点“我是乘客”，坐进飞机里以后才能戴氧气面罩。";
    return;
  }
  if (!state.oxygenMasksDropped) dropOxygenMasks();
  state.oxygenMaskOn = true;
  oxygenMaskBtn.classList.add("active");
  oxygenMaskBtn.textContent = "摘氧气面罩";
  if (oxygenMaskRig) {
    oxygenMaskRig.traverse((node) => {
      if (node.name === "oxygen-mask") node.material = makeMat(0x9ff2ff, 0.34, 0.05);
    });
  }
  statusText.textContent = "你已经把氧气面罩对到脸上了。接下来如果是水上迫降，再点“穿救生衣”。";
  addLog("乘客操作：氧气面罩已经戴好。");
}

function setPassengerLifeJacket(on) {
  state.lifeJacketOn = on;
  boardingPassengerGroup.traverse((node) => {
    if (node.name === "last-passenger-life-jacket") node.visible = on;
  });
  passengerCabinRig?.traverse((node) => {
    if (node.name === "last-passenger-life-jacket") node.visible = on;
    if (node.name === "orange-life-jacket-under-seat") node.visible = !on;
  });
  lifeJacketBtn.classList.toggle("active", on);
}

function putOnPassengerLifeJacket() {
  if (!state.passengerMode && !state.passengerBoarded) {
    statusText.textContent = "先点“我是乘客”，坐进飞机里以后才能拿座椅下面的救生衣。";
    return;
  }
  setPassengerLifeJacket(true);
  statusText.textContent = "你已经从座椅下面拿出橙色救生衣并穿好了。飞机停到海面后可以打开紧急出口和滑梯。";
  addLog("乘客操作：救生衣已经穿好。");
}

function deployLifeRaft() {
  if (state.lifeRaftDeployed) return;
  clearGroup(lifeRaftGroup);
  const exits = getEvacuationExitConfigs("水面");
  exits.forEach((exit, index) => deployLifeRaftAt(exit, index));
  addSpriteLabel("全机紧急撤离", "救生筏已经充气，乘客开始一个个从滑梯下来", [playerPlane.position.x, 6.4, playerPlane.position.z], 14.8, 2.35, lifeRaftGroup);
  state.lifeRaftDeployed = true;
  state.evacuationPassengersReleased = true;
  state.evacuationTime = 0;
  updateEmergencyActionButton();
}

function deployLifeRaftAt(exit, index) {
  const raftMat = makeMat(0xff8f1f, 0.58, 0.05);
  const floorMat = makeMat(0xffd27d, 0.64, 0.04);
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x42c8ff, transparent: true, opacity: 0.88 });
  const raftCenter = new THREE.Vector3(exit.door.x + exit.side.x * 18.6, 0.48, exit.door.z + exit.side.z * 18.6);
  const base = new THREE.Mesh(new THREE.TorusGeometry(5.8, 0.55, 4, 4), raftMat);
  base.name = `large-diamond-life-raft-${exit.name}`;
  base.rotation.set(Math.PI / 2, 0, Math.PI / 4);
  base.scale.set(1.85, 1.18, 1);
  base.position.copy(raftCenter);
  lifeRaftGroup.add(base);
  const floor = box("diamond-life-raft-floor", [14.6, 0.1, 8.2], [base.position.x, 0.36, base.position.z], floorMat, lifeRaftGroup);
  floor.rotation.y = Math.PI / 4;
  box("life-raft-water-shadow", [20.5, 0.04, 12.8], [base.position.x, 0.08, base.position.z], waterMat, lifeRaftGroup).rotation.y = Math.PI / 4;
  const sideTube = box("inflated-raft-side-tube", [13.8, 0.42, 0.42], [base.position.x, 0.72, base.position.z - 3.55], raftMat, lifeRaftGroup);
  sideTube.rotation.y = Math.PI / 4;
  const sideTube2 = box("inflated-raft-side-tube", [13.8, 0.42, 0.42], [base.position.x, 0.72, base.position.z + 3.55], raftMat, lifeRaftGroup);
  sideTube2.rotation.y = Math.PI / 4;
  const tetherStart = exit.door.clone().add(exit.side.clone().multiplyScalar(11.8));
  const tetherMid = new THREE.Vector3((tetherStart.x + base.position.x) / 2, 0.58, (tetherStart.z + base.position.z) / 2);
  const tether = box("life-raft-tether-rope", [0.12, 0.08, 8.2], [tetherMid.x, tetherMid.y, tetherMid.z], mats.dark, lifeRaftGroup);
  tether.rotation.y = state.heading + exit.sideSign * Math.PI / 2;
  createRescueBoat(base.position.x + exit.side.x * (12 + index * 1.4) + 3.2, base.position.z + exit.side.z * (12 + index * 1.4) + 4.2, lifeRaftGroup);
  addSpriteLabel("充气救生筏", "和滑梯末端连在一起，两边鼓起来接住乘客", [base.position.x, 4.1, base.position.z], 9.8, 1.75, lifeRaftGroup);
}

function createPackedLifeRafts() {
  clearGroup(lifeRaftGroup);
  getEvacuationExitConfigs("水面").forEach((exit, index) => createPackedLifeRaftAt(exit, index));
  addSpriteLabel("救生筏还没充气", "再点“充气救生筏”，滑梯末端会展开大救生筏", [playerPlane.position.x, 6.4, playerPlane.position.z], 13.5, 2.25, lifeRaftGroup);
}

function createPackedLifeRaftAt(exit, index) {
  const packMat = makeMat(0xff7a1f, 0.52, 0.06);
  const side = exit.side;
  const door = exit.door;
  const center = new THREE.Vector3(door.x + side.x * 15.6, 0.62, door.z + side.z * 15.6);
  const pack = box("packed-life-raft-canister", [2.8, 0.46, 1.18], [center.x, center.y, center.z], packMat, lifeRaftGroup);
  pack.rotation.y = state.heading + exit.sideSign * Math.PI / 2;
  const foldedLeft = box("folded-raft-left-bag", [1.6, 0.24, 0.42], [center.x - side.z * 0.52, center.y + 0.22, center.z + side.x * 0.52], packMat, lifeRaftGroup);
  foldedLeft.rotation.y = pack.rotation.y;
  const foldedRight = box("folded-raft-right-bag", [1.6, 0.24, 0.42], [center.x + side.z * 0.52, center.y + 0.22, center.z - side.x * 0.52], packMat, lifeRaftGroup);
  foldedRight.rotation.y = pack.rotation.y;
  addSpriteLabel("救生筏包", index === 0 ? "点按钮充气" : "滑梯末端待命", [center.x, 2.65, center.z], 5.6, 1.25, lifeRaftGroup);
}

function createRescueBoat(x, z, parent) {
  const boat = new THREE.Group();
  boat.name = "rescue-boat";
  const hullMat = makeMat(0xffffff, 0.52, 0.16);
  const orangeMat = makeMat(0xff7a1f, 0.5, 0.08);
  box("rescue-boat-hull", [5.4, 0.42, 2.1], [0, 0.38, 0], hullMat, boat);
  box("rescue-boat-nose", [1.2, 0.42, 1.55], [3, 0.38, 0], orangeMat, boat).rotation.y = Math.PI / 4;
  box("rescue-boat-cabin", [1.5, 0.9, 1.35], [-0.8, 0.98, 0], makeMat(0x8fd7ff, 0.35, 0.08), boat);
  box("rescue-boat-blue-light", [0.36, 0.22, 0.36], [-0.8, 1.58, 0], mats.greenLight, boat);
  box("rescue-boat-stern-inflatable-raft", [1.65, 0.18, 1.55], [-3.2, 0.62, 0], orangeMat, boat);
  box("rescue-boat-stern-rope", [0.16, 0.12, 2.8], [-2.55, 0.64, 0], mats.dark, boat).rotation.y = Math.PI / 2;
  for (const z of [-1.35, 1.35]) {
    const oar = box("rowing-rescue-oar", [0.12, 0.08, 3.4], [0.4, 0.68, z], mats.dark, boat);
    oar.rotation.x = z > 0 ? 0.32 : -0.32;
  }
  for (let i = 0; i < 5; i++) {
    const helper = createLastPassengerAvatar();
    helper.name = i < 2 ? "rescue-boat-crew" : "rescued-passenger-on-boat";
    helper.scale.setScalar(0.28);
    helper.position.set(-0.8 + i * 0.62, 0.82, i % 2 ? 0.46 : -0.46);
    helper.rotation.y = Math.PI / 2;
    helper.userData.lifeJacket.visible = true;
    boat.add(helper);
  }
  boat.position.set(x, 0.18, z);
  boat.rotation.y = -0.4;
  boat.userData.target = new THREE.Vector3(
    playerPlane.position.x + (x > playerPlane.position.x ? 9.5 : -9.5),
    0.18,
    playerPlane.position.z + (z > playerPlane.position.z ? 7.2 : -7.2)
  );
  parent.add(boat);
  addSpriteLabel("救援船", "船尾带着小充气筏，自动靠近接人", [x, 3.1, z], 7.2, 1.7, parent);
}

function getPlaneSideVector() {
  return new THREE.Vector3(Math.cos(state.heading), 0, -Math.sin(state.heading)).normalize();
}

function getPlaneForwardVector() {
  return new THREE.Vector3(Math.sin(state.heading), 0, Math.cos(state.heading)).normalize();
}

function getEvacuationExitConfigs(surface) {
  const rightSide = getPlaneSideVector();
  const forward = getPlaneForwardVector();
  const door = getPlaneDoorWorldPosition();
  const leftDoorShift = rightSide.clone().multiplyScalar(-2.75);
  const rearShift = forward.clone().multiplyScalar(-7.2);
  const exits = [
    { name: "front-right", label: "右前紧急出口", side: rightSide.clone(), sideSign: 1, door: door.clone() },
    { name: "rear-right", label: "右后紧急出口", side: rightSide.clone(), sideSign: 1, door: door.clone().add(rearShift) },
    { name: "front-left", label: "左前紧急出口", side: rightSide.clone().multiplyScalar(-1), sideSign: -1, door: door.clone().add(leftDoorShift) }
  ];
  if (surface === "水面") {
    exits.push({ name: "rear-left", label: "左后紧急出口", side: rightSide.clone().multiplyScalar(-1), sideSign: -1, door: door.clone().add(leftDoorShift).add(rearShift) });
  }
  return exits;
}

function createEvacuationSlide(surface) {
  const hasSlide = evacuationGroup.children.some((child) => child.name === "inflatable-escape-slide");
  if (hasSlide) return;
  getEvacuationExitConfigs(surface).forEach((exit, index) => createEvacuationSlideAt(surface, exit, index));
}

function createEvacuationSlideAt(surface, exit, index) {
  const side = exit.side;
  const door = exit.door;
  const forward = getPlaneForwardVector();
  const slideLength = surface === "水面" ? 15.4 : 7.2;
  const slideStart = new THREE.Vector3(door.x, Math.max(1.25, door.y - 0.2), door.z);
  const slideEnd = new THREE.Vector3(
    door.x + side.x * slideLength,
    surface === "水面" ? 0.34 : 0.22,
    door.z + side.z * slideLength
  );
  const midpoint = slideStart.clone().add(slideEnd).multiplyScalar(0.5);
  const slideMat = makeMat(0xfff2d0, 0.5, 0.04);
  const edgeMat = makeMat(0xff7a1f, 0.55, 0.06);
  const doorPanel = box(
    "open-emergency-door-panel",
    [0.12, 0.92, 0.52],
    [door.x + side.x * 0.56 + forward.x * 0.2, Math.max(1.35, door.y + 0.12), door.z + side.z * 0.56 + forward.z * 0.2],
    makeMat(0xf8fbff, 0.38, 0.2),
    evacuationGroup
  );
  doorPanel.rotation.y = state.heading + exit.sideSign * 1.15;
  const slide = box("inflatable-escape-slide", [surface === "水面" ? 2.75 : 2.05, 0.24, surface === "水面" ? 16.3 : 8.0], [midpoint.x, midpoint.y, midpoint.z], slideMat, evacuationGroup);
  slide.userData.exitName = exit.name;
  slide.rotation.y = state.heading + exit.sideSign * Math.PI / 2;
  slide.rotation.x = surface === "水面" ? -0.18 : -0.22;
  const leftEdge = box("escape-slide-left-edge", [0.32, 0.38, surface === "水面" ? 16.5 : 8.2], [midpoint.x, midpoint.y + 0.14, midpoint.z], edgeMat, evacuationGroup);
  leftEdge.rotation.copy(slide.rotation);
  leftEdge.position.add(new THREE.Vector3(-side.z, 0, side.x).multiplyScalar(0.78));
  const rightEdge = box("escape-slide-right-edge", [0.32, 0.38, surface === "水面" ? 16.5 : 8.2], [midpoint.x, midpoint.y + 0.14, midpoint.z], edgeMat, evacuationGroup);
  rightEdge.rotation.copy(slide.rotation);
  rightEdge.position.add(new THREE.Vector3(side.z, 0, -side.x).multiplyScalar(0.78));
  const slidePassengerCount = surface === "水面" ? 22 : 7;
  for (let i = 0; i < slidePassengerCount; i++) {
    const passenger = createLastPassengerAvatar();
    passenger.name = surface === "水面" ? "water-slide-passenger" : "ground-slide-passenger";
    passenger.scale.setScalar(surface === "水面" ? 0.42 : 0.34);
    const row = Math.floor(i / 2);
    const lateral = new THREE.Vector3(-side.z, 0, side.x).multiplyScalar((i % 2 ? 0.28 : -0.28) * (surface === "水面" ? 1 : 0.5));
    const queue = slideStart
      .clone()
      .add(forward.clone().multiplyScalar(-0.58 * row))
      .add(lateral)
      .add(new THREE.Vector3(0, 0.22, 0));
    const raftLanding = slideEnd
      .clone()
      .add(side.clone().multiplyScalar(surface === "水面" ? 2.9 : 0.6))
      .add(lateral.clone().multiplyScalar(1.35))
      .add(new THREE.Vector3(0, surface === "水面" ? 0.22 : 0.05, 0));
    passenger.position.copy(queue);
    passenger.rotation.y = slide.rotation.y;
    passenger.userData.lifeJacket.visible = surface === "水面";
    passenger.visible = surface !== "水面" || state.evacuationPassengersReleased;
    passenger.userData.evacuationPath = {
      delay: index * 0.55 + i * 0.18,
      duration: surface === "水面" ? 2.35 : 1.55,
      queue,
      slideStart: slideStart.clone().add(lateral.clone().multiplyScalar(0.4)),
      slideEnd: raftLanding,
      slideYaw: slide.rotation.y,
      surface
    };
    evacuationGroup.add(passenger);
  }
  addSpriteLabel(exit.label, surface === "水面" ? "滑梯已伸出，救生筏充气后再滑" : "门开后排队，一个个滑到安全地面", [midpoint.x, midpoint.y + 2.5 + index * 0.18, midpoint.z], 8.3, 1.85, evacuationGroup);
}

function releasePlayerEvacuation(surface) {
  if (state.playerEvacuationStarted || !state.passengerMode || !state.passengerBoarded) return;
  const exit = getEvacuationExitConfigs(surface)[0];
  if (!exit) return;

  state.playerEvacuationStarted = true;
  state.playerEvacuated = false;
  const seated = getSeatedCabinPassenger();
  if (seated) seated.visible = false;

  const side = exit.side;
  const forward = getPlaneForwardVector();
  const door = exit.door;
  const slideLength = surface === "水面" ? 15.4 : 7.2;
  const slideStart = new THREE.Vector3(door.x + forward.x * 0.36, Math.max(1.28, door.y - 0.08), door.z + forward.z * 0.36);
  const slideEnd = new THREE.Vector3(
    door.x + side.x * slideLength,
    surface === "水面" ? 0.34 : 0.22,
    door.z + side.z * slideLength
  );
  const finalPoint = slideEnd
    .clone()
    .add(side.clone().multiplyScalar(surface === "水面" ? 4.6 : 1.25))
    .add(forward.clone().multiplyScalar(0.48))
    .add(new THREE.Vector3(0, surface === "水面" ? 0.2 : 0.04, 0));

  const player = createLastPassengerAvatar();
  player.name = "you-evacuating-passenger";
  player.scale.setScalar(surface === "水面" ? 0.52 : 0.42);
  player.position.copy(slideStart);
  player.rotation.y = state.heading + exit.sideSign * Math.PI / 2;
  if (player.userData.lifeJacket) player.userData.lifeJacket.visible = surface === "水面" || state.lifeJacketOn;
  player.userData.evacuationPath = {
    delay: 0.28,
    duration: surface === "水面" ? 2.6 : 1.8,
    queue: slideStart.clone().add(forward.clone().multiplyScalar(-0.8)),
    slideStart,
    slideEnd: finalPoint,
    slideYaw: player.rotation.y,
    surface,
    isPlayer: true
  };
  evacuationGroup.add(player);
  addSpriteLabel("我也撤离", surface === "水面" ? "你会顺着滑梯滑到救生筏上" : "你会顺着滑梯滑到安全地面", [slideStart.x, slideStart.y + 2.6, slideStart.z], 7.6, 1.55, evacuationGroup);
  addLog(surface === "水面" ? "你也加入撤离：从门口滑到救生筏。" : "你也加入撤离：从门口滑到安全地面。");
}

function openEmergencyExitAndSlide(force = false) {
  if (!force && !state.evacuationActive && !state.passengerMode && !state.passengerBoarded) {
    statusText.textContent = "先进入乘客模式，或者等飞机迫降停稳后，再打开紧急出口和滑梯。";
    return;
  }
  if (!force && state.passengerAccidentTarget && !state.evacuationActive) {
    statusText.textContent = "飞机还没有停稳，先戴好氧气面罩和救生衣，等迫降停住后再打开紧急出口。";
    return;
  }
  if (!force && state.passengerAccidentTarget === "water" && !state.lifeJacketOn) {
    statusText.textContent = "水上迫降前先点“穿救生衣”，然后再打开紧急出口和滑梯。";
    return;
  }
  const surface = state.evacuationSurface || state.emergencySurface || (state.passengerAccidentTarget === "water" ? "水面" : "地面");
  state.evacuationActive = true;
  state.evacuationSurface = surface;
  state.emergencySurface = surface;
  if (!state.planeDoorOpen) {
    state.planeDoorOpen = true;
    updatePlaneDoorVisual();
    missionTitle.textContent = surface === "水面" ? "水上开门" : "紧急开门";
    routeLabel.textContent = "门已打开：下一步点“伸出滑梯”";
    statusText.textContent = "飞机门已经打开。现在再点一次“伸出滑梯”，滑梯才会从门口伸出来。";
    addLog("紧急流程：第一步开门完成。");
    return;
  }
  if (!state.evacuationSlideDeployed) {
    state.emergencyExitOpened = true;
    state.evacuationSlideDeployed = true;
    state.evacuationPassengersReleased = surface !== "水面";
    state.evacuationTime = 0;
    emergencyExitBtn.classList.add("active");
    createEvacuationSlide(surface);
    if (surface === "水面") {
      setPassengerLifeJacket(true);
      createPackedLifeRafts();
      routeLabel.textContent = "滑梯已伸出：下一步点“充气救生筏”";
      statusText.textContent = "滑梯从飞机门伸出来了。滑梯末端夹着未充气救生筏包，再点“充气救生筏”，救生筏会和滑梯接在一起。";
      addLog("紧急流程：滑梯已经伸出，救生筏包在末端等待充气。");
    } else {
      releasePlayerEvacuation(surface);
      routeLabel.textContent = "滑梯已伸出：乘客开始排队下滑";
      statusText.textContent = "紧急滑梯伸出来了。乘客正在排队，你也会跟着一起顺着滑梯滑到安全地面。";
      addLog("紧急流程：地面滑梯已经伸出，乘客和你一起开始撤离。");
    }
    updateEmergencyActionButton();
    return;
  }
  if (surface === "水面" && !state.lifeRaftDeployed) {
    deployLifeRaft();
    releasePlayerEvacuation(surface);
    routeLabel.textContent = "救生筏已充气：乘客一个个滑下去";
    statusText.textContent = "救生筏充气完成，两边鼓起来并和滑梯末端接在一起。乘客开始排队滑到救生筏上，你也会一起滑下去。";
    addLog("紧急流程：救生筏充气完成，乘客和你一起从滑梯进入救生筏。");
    return;
  }
  statusText.textContent = surface === "水面"
    ? "撤离正在进行：乘客一个个从门口排队，顺着滑梯滑到救生筏上。"
    : "撤离正在进行：乘客一个个从门口排队，顺着滑梯滑到安全地面。";
  updateEmergencyActionButton();
}

function createFireTruck(x, z, sideOffset) {
  const truck = new THREE.Group();
  truck.name = "fire-truck";
  const redMat = makeMat(0xd9352f, 0.52, 0.16);
  const whiteMat = makeMat(0xffffff, 0.4, 0.12);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0xdff9ff, emissive: 0x83ddff, emissiveIntensity: 0.9, transparent: true, opacity: 0.78, roughness: 0.32 });
  box("fire-truck-body", [3.8, 1.15, 1.7], [0, 0.72, 0], redMat, truck);
  box("fire-truck-cab", [1.25, 1.32, 1.65], [1.2, 1.05, 0], whiteMat, truck);
  box("fire-truck-ladder", [3.6, 0.12, 0.18], [-0.2, 1.48, 0], mats.steel, truck);
  for (const wx of [-1.25, 1.15]) {
    for (const wz of [-0.9, 0.9]) {
      const wheel = cyl("fire-truck-wheel", 0.28, 0.18, [wx, 0.24, wz], mats.dark, truck, 16);
      wheel.rotation.x = Math.PI / 2;
    }
  }
  truck.position.set(x, 0.08, z);
  truck.rotation.y = state.heading + sideOffset;
  evacuationGroup.add(truck);
  const target = playerPlane.position.clone();
  const start = new THREE.Vector3(x, 1.45, z);
  const streamMid = start.clone().add(new THREE.Vector3(target.x, 1.25, target.z)).multiplyScalar(0.5);
  const streamLen = Math.max(4, start.distanceTo(target));
  const stream = box("fire-truck-water-stream", [0.32, 0.24, streamLen], [streamMid.x, streamMid.y, streamMid.z], waterMat, evacuationGroup);
  stream.rotation.y = Math.atan2(target.x - x, target.z - z);
}

function createGroundRescueScene() {
  const side = getPlaneSideVector();
  const left = playerPlane.position.clone().add(side.clone().multiplyScalar(7));
  const right = playerPlane.position.clone().add(side.clone().multiplyScalar(-8));
  createFireTruck(left.x, left.z + 5, -0.28);
  createFireTruck(right.x, right.z - 6, 0.28);
  const smokeMat = new THREE.MeshStandardMaterial({ color: 0x596069, transparent: true, opacity: 0.46, roughness: 0.8 });
  for (let i = 0; i < 8; i++) {
    const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.42 + i * 0.05, 12, 12), smokeMat.clone());
    smoke.name = "engine-smoke-after-landing";
    smoke.position.set(playerPlane.position.x + side.x * (1.8 + i * 0.14), 1.1 + i * 0.22, playerPlane.position.z + side.z * (1.8 + i * 0.14));
    smoke.material.opacity = 0.34 - i * 0.025;
    evacuationGroup.add(smoke);
  }
  addSpriteLabel("跑道救援", "停稳后先开门，再伸出滑梯，乘客一个个离开", [playerPlane.position.x, 5.2, playerPlane.position.z - 8], 11.5, 2.2, evacuationGroup);
}

function createWaterRescueScene() {
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x5fd8ff, transparent: true, opacity: 0.96 });
  const waterShineMat = new THREE.MeshBasicMaterial({ color: 0xb9f3ff, transparent: true, opacity: 0.6 });
  const bankMat = makeMat(0x79c36a, 0.88, 0.08);
  box("emergency-long-sea-landing-water", [260, 0.06, 132], [playerPlane.position.x + 8, 0.025, playerPlane.position.z], waterMat, evacuationGroup);
  for (let i = 0; i < 12; i++) {
    box("bright-sea-wave-line", [26, 0.025, 0.28], [playerPlane.position.x - 95 + i * 18, 0.09, playerPlane.position.z - 46 + (i % 5) * 22], waterShineMat, evacuationGroup).rotation.y = 0.12;
  }
  box("sea-bank-left-with-people", [230, 0.08, 5.2], [playerPlane.position.x + 8, 0.08, playerPlane.position.z - 70], bankMat, evacuationGroup);
  box("sea-bank-right-with-people", [230, 0.08, 5.2], [playerPlane.position.x + 8, 0.08, playerPlane.position.z + 70], bankMat, evacuationGroup);
  createWaterRescueCrowd();
  state.planeSinking = true;
  state.planeSinkTime = 0;
  state.planeSinkDelay = 96;
  state.planeSinkDuration = 24;
  state.planeSinkStartY = playerPlane.position.y;
  addSpriteLabel("浅蓝色大海迫降", "停稳后先开门，再伸滑梯，最后充气救生筏", [playerPlane.position.x - 2, 5.8, playerPlane.position.z - 11], 13.5, 2.4, evacuationGroup);
}

function createWaterRescueCrowd() {
  const shirtMats = [
    makeMat(0xffd447, 0.62, 0.06),
    makeMat(0x3d8dff, 0.62, 0.06),
    makeMat(0xff6b8a, 0.62, 0.06),
    makeMat(0xffffff, 0.62, 0.06),
    makeMat(0x35c77a, 0.62, 0.06)
  ];
  for (let i = 0; i < 28; i++) {
    const person = createLastPassengerAvatar();
    person.name = "sea-bank-rescue-crowd";
    person.scale.setScalar(0.44);
    const side = i % 2 === 0 ? -1 : 1;
    const row = Math.floor(i / 2);
    person.position.set(playerPlane.position.x - 39 + (row % 14) * 6, 0.18, playerPlane.position.z + side * (37 + (row % 2) * 2.2));
    person.rotation.y = side < 0 ? 0 : Math.PI;
    const shirt = person.getObjectByName("last-passenger-body");
    if (shirt) shirt.material = shirtMats[i % shirtMats.length];
    evacuationGroup.add(person);
  }
  addSpriteLabel("海岸有人和救援人员", "大家在浅蓝色大海旁边等救援", [playerPlane.position.x - 16, 4.8, playerPlane.position.z + 38], 9.6, 2.1, evacuationGroup);
}

function updateEvacuation(dt) {
  if (!state.evacuationActive) return;
  state.evacuationTime += dt;
  evacuationGroup.children.forEach((child, index) => {
    if (child.userData.evacuationPath) {
      const path = child.userData.evacuationPath;
      if (path.surface === "水面" && !state.evacuationPassengersReleased) {
        child.visible = true;
        child.position.copy(path.queue);
        child.rotation.x = 0;
        child.rotation.y = path.slideYaw;
        return;
      }
      child.visible = true;
      const moveT = THREE.MathUtils.clamp((state.evacuationTime - path.delay) / path.duration, 0, 1);
      if (moveT <= 0) {
        child.position.copy(path.queue);
        child.rotation.x = 0;
      } else {
        const smoothT = moveT * moveT * (3 - 2 * moveT);
        child.position.lerpVectors(path.slideStart, path.slideEnd, smoothT);
        child.position.y += Math.sin(smoothT * Math.PI) * 0.12;
        child.rotation.x = path.surface === "水面" ? -0.32 * smoothT : -0.22 * smoothT;
        if (path.isPlayer && moveT >= 0.98 && !state.playerEvacuated) {
          state.playerEvacuated = true;
          statusText.textContent = path.surface === "水面"
            ? "你也已经顺着滑梯滑到救生筏上了，救援船正在靠过来接大家。"
            : "你也已经顺着滑梯滑到安全地面了，消防车和工作人员正在救援。";
          addLog(path.surface === "水面" ? "你撤离完成：已经到救生筏上。" : "你撤离完成：已经到安全地面。");
        }
      }
      child.rotation.y = path.slideYaw;
    } else if (child.name.includes("passenger")) {
      child.position.y += Math.sin(clock.elapsedTime * 4 + index) * 0.002;
    }
    if (child.name === "rescue-boat") {
      child.position.y = 0.18 + Math.sin(clock.elapsedTime * 2.4) * 0.08;
      if (child.userData.target) {
        child.position.x = THREE.MathUtils.lerp(child.position.x, child.userData.target.x, 1 - Math.exp(-dt * 0.22));
        child.position.z = THREE.MathUtils.lerp(child.position.z, child.userData.target.z, 1 - Math.exp(-dt * 0.22));
      }
      child.children.forEach((part, partIndex) => {
        if (part.name === "rowing-rescue-oar") {
          part.rotation.y = Math.sin(clock.elapsedTime * 4.8 + partIndex) * 0.42;
        }
      });
    }
  });
  if (state.planeSinking) {
    state.planeSinkTime += dt;
    const t = THREE.MathUtils.clamp((state.planeSinkTime - state.planeSinkDelay) / state.planeSinkDuration, 0, 1);
    playerPlane.position.y = THREE.MathUtils.lerp(state.planeSinkStartY, -2.4, t);
    playerPlane.rotation.x = THREE.MathUtils.lerp(0.01, 0.2, t);
    playerPlane.rotation.z = THREE.MathUtils.lerp(0, -0.18, t);
    if (t >= 1) state.planeSinking = false;
  }
}

function startPassengerMode() {
  resetGame();
  clearPassengerModeVisuals();
  ensureAudio();
  setAutopilot(false);
  state.passengerMode = true;
  state.passengerBoarding = true;
  state.passengerBoarded = false;
  state.passengerBoardTime = 0;
  state.phase = "passenger-boarding";
  state.route = "takeoff";
  state.speed = 0;
  state.altitude = 0;
  state.throttle = 0;
  state.gear = 0;
  state.heading = 0;
  throttleLever.value = "0";
  gearLever.value = "0";
  playerPlane.position.set(-50, 0.62, -38);
  playerPlane.rotation.set(0, 0, 0);
  state.planeDoorOpen = true;
  updatePlaneDoorVisual();
  createPassengerCabin();
  const passenger = createLastPassengerAvatar();
  const door = getPlaneDoorWorldPosition();
  passenger.position.set(door.x + 8.4, 0.15, door.z - 8.4);
  passenger.rotation.y = Math.PI * 0.72;
  boardingPassengerGroup.add(passenger);
  missionTitle.textContent = "乘客最后登机";
  routeLabel.textContent = "登机口：你是最后一个乘客，先走进飞机里面。";
  statusText.textContent = "你是最后一个乘客。沿着登机口走到飞机门，进去坐好以后，再选择正常飞行，或者事故模式水上/陆地迫降。";
  addLog("乘客模式开始：最后一个乘客正在登机。");
  updateYokeKnob();
  window.setTimeout(() => {
    if (state.passengerBoarding && state.phase === "passenger-boarding") finishPassengerBoarding();
  }, 5600);
}

function updatePassengerBoarding(dt) {
  if (!state.passengerBoarding) return;
  state.passengerBoardTime += dt;
  const passenger = boardingPassengerGroup.children[0];
  const door = getPlaneDoorWorldPosition();
  if (passenger) {
    const start = new THREE.Vector3(door.x + 8.4, 0.15, door.z - 8.4);
    const end = new THREE.Vector3(door.x + 0.42, 0.2, door.z + 0.08);
    const progress = THREE.MathUtils.clamp(state.passengerBoardTime / 5.4, 0, 1);
    passenger.position.lerpVectors(start, end, progress);
    passenger.rotation.y = Math.PI * 0.72 + Math.sin(state.passengerBoardTime * 8) * 0.06;
  }
  if (state.passengerBoardTime >= 5.4) finishPassengerBoarding();
}

function finishPassengerBoarding() {
  if (!state.passengerBoarding) return;
  state.passengerBoarding = false;
  state.passengerBoarded = true;
  state.phase = "passenger-ready";
  state.passengerCabinViewMode = 0;
  state.passengerCabinX = -0.32;
  state.passengerCabinZ = 1.65;
  state.passengerCabinWalkYaw = 0;
  state.passengerWalking = false;
  state.cabinMoveX = 0;
  state.cabinMoveY = 0;
  state.cameraYaw = 0;
  state.cameraPitch = 0.12;
  clearGroup(boardingPassengerGroup);
  if (passengerCabinRig) passengerCabinRig.visible = true;
  syncCabinPassengerAvatar();
  missionTitle.textContent = "已经坐进飞机";
  routeLabel.textContent = "请选择：正常飞行 / 乘客水上迫降 / 乘客陆地迫降";
  statusText.textContent = "你已经进到一层客舱。左下角摇杆或 W/A/S/D 可以在客舱走动；拖动屏幕或方向键可以转头看四周。可以点“正常飞行”，也可以点事故模式。";
  addLog("最后一个乘客已经坐好，等待选择飞行模式。");
}

function startPassengerNormalFlight() {
  if (!state.passengerBoarded) {
    startPassengerMode();
    return;
  }
  clearOxygenMasks();
  clearGroup(lifeRaftGroup);
  clearGroup(evacuationGroup);
  state.passengerAccidentTarget = "";
  state.lifeRaftDeployed = false;
  state.evacuationSlideDeployed = false;
  state.evacuationPassengersReleased = false;
  state.evacuationActive = false;
  state.playerEvacuationStarted = false;
  state.playerEvacuated = false;
  state.planeSinking = false;
  state.planeDoorOpen = false;
  updatePlaneDoorVisual();
  playerPlane.position.copy(runwayStart);
  playerPlane.rotation.set(0, 0, 0);
  state.phase = "takeoff";
  state.route = "takeoff";
  state.speed = 0;
  state.altitude = 0;
  state.throttle = 0.96;
  state.gear = 0;
  state.yokeX = 0;
  state.yokeY = 0;
  state.heading = 0;
  state.autoTakeoffOnly = false;
  state.autopilotStage = "";
  throttleLever.value = "96";
  gearLever.value = "0";
  rebuildRouteLights();
  setAutopilot(true);
  missionTitle.textContent = "乘客正常飞行";
  routeLabel.textContent = `机长驾驶：${currentAirportRouteName()}`;
  statusText.textContent = "舱门已关，这次飞机是机长在驾驶，不是你驾驶。你可以在客舱里走动、转头看外面，飞机会平稳沿绿色灯线滑行、起飞和降落。";
  addLog("乘客正常飞行：机长驾驶，客舱保持平稳。");
  updateYokeKnob();
  updateFlightSound();
}

function startPassengerAccident(mode) {
  if (!state.passengerBoarded) {
    startPassengerMode();
    return;
  }
  state.passengerAccidentTarget = mode;
  state.planeDoorOpen = false;
  state.evacuationSlideDeployed = false;
  state.evacuationPassengersReleased = false;
  state.lifeRaftDeployed = false;
  state.playerEvacuationStarted = false;
  state.playerEvacuated = false;
  state.emergencyExitOpened = false;
  updatePlaneDoorVisual();
  if (!passengerCabinRig) createPassengerCabin();
  passengerCabinRig.visible = true;
  dropOxygenMasks();
  setPassengerLifeJacket(false);
  startEngineFireEmergency();
  state.passengerMode = true;
  state.passengerBoarded = true;
  state.passengerAccidentTarget = mode;
  if (!passengerCabinRig) createPassengerCabin();
  passengerCabinRig.visible = true;
  if (!state.oxygenMasksDropped) dropOxygenMasks();
  setPassengerLifeJacket(false);
  startEmergencyAutopilot(mode);
  missionTitle.textContent = mode === "water" ? "乘客水上迫降" : "乘客陆地迫降";
  routeLabel.textContent = mode === "water" ? "乘客事故：氧气面罩掉下，拿救生衣，飞向浅蓝色大海" : "乘客事故：氧气面罩掉下，飞向安全平地";
  statusText.textContent = mode === "water"
    ? "事故模式开始：氧气面罩掉下来了。先点“戴氧气面罩”，再点“穿救生衣”；无人驾驶会沿绿色灯线飞向浅蓝色大海，停住后打开紧急出口滑到救生筏。"
    : "事故模式开始：氧气面罩掉下来了。无人驾驶会沿绿色灯线找安全平地迫降。";
  addLog(mode === "water" ? "乘客事故模式：水上迫降，氧气面罩已掉下，救生衣在座椅下面。" : "乘客事故模式：陆地迫降，氧气面罩已经掉下。");
}

function updatePlaneDoorVisual() {
  if (!playerAircraftParts.door) return;
  const door = playerAircraftParts.door;
  door.position.x = state.planeDoorOpen ? playerAircraftParts.doorOpenX : playerAircraftParts.doorClosedX;
  door.rotation.z = state.planeDoorOpen ? -0.62 : 0;
  door.visible = true;
  if (playerAircraftParts.doorWindow) {
    playerAircraftParts.doorWindow.position.x = door.position.x + 0.006;
    playerAircraftParts.doorWindow.rotation.z = door.rotation.z;
    playerAircraftParts.doorWindow.visible = true;
  }
  doorBtn.textContent = state.planeDoorOpen ? "关门" : "开门";
  doorBtn.classList.toggle("active", state.planeDoorOpen);
  updateEmergencyActionButton();
}

function updateEmergencyActionButton() {
  if (!emergencyExitBtn) return;
  const waterFlow = (state.evacuationSurface || state.emergencySurface || (state.passengerAccidentTarget === "water" ? "水面" : "")) === "水面";
  const emergencyFlow = state.evacuationActive || state.emergencySurface || state.phase === "emergency-landed";
  if (!emergencyFlow) {
    emergencyExitBtn.textContent = "紧急出口/滑梯";
    return;
  }
  if (!state.planeDoorOpen) {
    emergencyExitBtn.textContent = "先开门";
  } else if (!state.evacuationSlideDeployed) {
    emergencyExitBtn.textContent = "伸出滑梯";
  } else if (waterFlow && !state.lifeRaftDeployed) {
    emergencyExitBtn.textContent = "充气救生筏";
  } else {
    emergencyExitBtn.textContent = "乘客撤离中";
  }
}

function resetGateDocking() {
  state.gateDocking = false;
  state.gateDocked = false;
  state.gateExtend = 0;
  state.planeDoorOpen = false;
  state.passengerFlow = false;
  state.passengerTime = 0;
  state.arrivalTaxi = false;
  state.arrivalTaxiTime = 0;
  clearPassengers();
  updateJetBridgeVisual();
  updatePlaneDoorVisual();
}

function movePlaneToArrivalGate() {
  state.heading = 0;
  state.altitude = 0;
  state.speed = 0;
  state.throttle = 0;
  state.gear = 0;
  playerPlane.position.set(arrivalGateStand.x, 0.62, arrivalGateStand.planeZ);
  playerPlane.rotation.set(0, 0, 0);
  if (playerAircraftParts.gearParts) playerAircraftParts.gearParts.visible = true;
  throttleLever.value = "0";
  gearLever.value = "0";
}

function startArrivalTaxi() {
  state.phase = "arrival-taxi";
  state.route = "arrival-taxi";
  state.arrivalTaxi = true;
  state.arrivalTaxiTime = 0;
  state.arrivalTaxiDuration = 60;
  state.speed = 42;
  state.altitude = 0;
  state.throttle = 0;
  state.gear = 0;
  state.heading = 0;
  state.gateDocking = false;
  state.gateDocked = false;
  state.gateExtend = 0;
  state.planeDoorOpen = false;
  rebuildRouteLights();
  updateJetBridgeVisual();
  updatePlaneDoorVisual();
  missionTitle.textContent = "到达机场滑行";
  routeLabel.textContent = `到达滑行：${currentDestinationAirportName()}降落跑道 → 登机口`;
  statusText.textContent = "飞机已经降落到目的机场跑道。现在会沿着地面灯线快速滑行，大约 60 秒经过目的城市高楼、商场、店铺和游乐园，再到登机口对接。";
  addLog("飞机落在目的机场降落跑道，开始到达滑行，不会立刻开门。");
}

function updateArrivalTaxi(dt) {
  if (!state.arrivalTaxi) return;
  state.arrivalTaxiTime += dt;
  const progress = THREE.MathUtils.clamp(state.arrivalTaxiTime / state.arrivalTaxiDuration, 0, 1);
  const curve = new THREE.CatmullRomCurve3(arrivalTaxiPath);
  const point = curve.getPoint(progress);
  const nextPoint = curve.getPoint(Math.min(1, progress + 0.01));
  playerPlane.position.set(point.x, 0.62, point.z);
  state.altitude = 0;
  state.speed = progress < 0.92 ? 46 + Math.sin(state.arrivalTaxiTime * 1.8) * 5 : THREE.MathUtils.lerp(46, 0, (progress - 0.92) / 0.08);
  state.heading = Math.atan2(nextPoint.x - point.x, nextPoint.z - point.z);
  playerPlane.rotation.set(0, state.heading, Math.sin(state.arrivalTaxiTime * 2.6) * 0.018);
  if (playerAircraftParts.gearParts) playerAircraftParts.gearParts.visible = true;
  throttleLever.value = "0";
  gearLever.value = "0";

  const remaining = Math.max(0, Math.ceil(state.arrivalTaxiDuration - state.arrivalTaxiTime));
  routeLabel.textContent = `到达滑行：经过目的城市，${remaining} 秒后到登机口`;
  if (remaining === 45) {
    statusText.textContent = "飞机正在穿过目的城市机场区：两边是高楼、店铺街和商场。";
  } else if (remaining === 25) {
    statusText.textContent = "前面经过城市游乐园，继续沿绿色灯线滑向到达登机口。";
  } else if (remaining === 8) {
    statusText.textContent = "快到登机口了，飞机会慢慢停下，机场工作人员准备移动登机桥。";
  }

  if (progress >= 1) {
    state.arrivalTaxi = false;
    startGateDocking();
  }
}

function startGateDocking() {
  movePlaneToArrivalGate();
  state.phase = "gate-docking";
  state.gateDocking = true;
  state.gateDocked = false;
  state.gateExtend = 0;
  state.planeDoorOpen = false;
  state.passengerFlow = false;
  state.passengerTime = 0;
  updateJetBridgeVisual();
  updatePlaneDoorVisual();
  missionTitle.textContent = "登机桥对接中";
  routeLabel.textContent = "目的机场：等待移动登机桥对接飞机门";
  statusText.textContent = "飞机已经停到登机位。机场工作人员正在移动登机桥，对准飞机门；对接成功后再点“开门”。";
  addLog("飞机停到目的机场登机位，移动登机桥开始伸出。");
}

function updateGateDocking(dt) {
  if (state.gateDocking && !state.gateDocked) {
    state.gateExtend = Math.min(1, state.gateExtend + dt * 0.42);
    updateJetBridgeVisual();
    if (state.gateExtend >= 1) {
      state.gateDocked = true;
      state.gateDocking = false;
      missionTitle.textContent = "登机桥已对接";
      routeLabel.textContent = "对接成功：现在可以打开飞机门";
      statusText.textContent = "登机桥已经对到飞机门了。现在点“开门”，乘客会从飞机出来，走到机场过海关。";
      addLog("登机桥对接完成，可以开门下客。");
    }
  }
  if (state.passengerFlow) {
    state.passengerTime += dt;
    updatePassengers();
  }
}

function togglePlaneDoor() {
  const emergencyDoorAllowed =
    ["emergency", "water-skimming", "emergency-landed"].includes(state.phase) ||
    state.engineFire ||
    state.engineOff ||
    state.passengerAccidentTarget;

  if (emergencyDoorAllowed) {
    const waterEmergency =
      state.evacuationSurface === "水面" ||
      state.emergencySurface === "水面" ||
      state.passengerAccidentTarget === "water" ||
      state.phase === "water-skimming";
    state.planeDoorOpen = true;
    state.evacuationActive = true;
    state.evacuationSurface = waterEmergency ? "水面" : "地面";
    state.emergencySurface = waterEmergency ? "水面" : "地面";
    updatePlaneDoorVisual();
    missionTitle.textContent = "紧急开门";
    routeLabel.textContent = waterEmergency
      ? "水上紧急门：门已打开，下一步伸出滑梯"
      : "地面紧急门：门已打开，下一步伸出滑梯";
    statusText.textContent = waterEmergency
      ? "这是紧急门，水上迫降时可以打开。现在门已经开了，再点“伸出滑梯”，然后点“充气救生筏”。"
      : "这是紧急门，紧急状态下不用等速度低于 10 kt。现在门已经开了，再点“伸出滑梯”。";
    addLog(
      waterEmergency
        ? "紧急开门：水上状态先打开机门，等待伸出滑梯。"
        : "紧急开门：先打开机门，等待伸出滑梯。"
    );
    return;
  }

  if (state.speed >= 10) {
    statusText.textContent = `速度还有 ${Math.round(state.speed)} kt，低于 10 kt 才能开门。`;
    addLog("开门失败：速度还没有低于 10 kt。");
    return;
  }
  if (state.phase === "emergency-landed" && state.evacuationSurface === "水面") {
    state.planeDoorOpen = true;
    updatePlaneDoorVisual();
    missionTitle.textContent = "水上开门撤离";
    routeLabel.textContent = "水上迫降：机门打开，下一步伸出滑梯";
    statusText.textContent = "水上迫降后可以开门。机门已经打开，下一步点“伸出滑梯”，再点“充气救生筏”。";
    addLog("水上迫降：机门打开，等待滑梯和救生筏。");
    return;
  }
  if (state.phase === "emergency-landed" && state.evacuationSurface === "地面") {
    state.planeDoorOpen = true;
    updatePlaneDoorVisual();
    missionTitle.textContent = "地面开门撤离";
    routeLabel.textContent = "地面迫降：机门打开，下一步伸出滑梯";
    statusText.textContent = "飞机已经停住，可以开门。机门已经打开，下一步点“伸出滑梯”，乘客再排队撤离。";
    addLog("地面迫降：机门打开，等待伸出滑梯。");
    return;
  }
  if (!state.gateDocked) {
    state.planeDoorOpen = !state.planeDoorOpen;
    updatePlaneDoorVisual();
    statusText.textContent = state.planeDoorOpen
      ? "速度已经低于 10 kt，飞机门可以打开。"
      : "飞机门已经关上。";
    addLog(state.planeDoorOpen ? "速度低于 10 kt，飞机门打开。" : "飞机门关闭。");
    return;
  }
  state.planeDoorOpen = !state.planeDoorOpen;
  updatePlaneDoorVisual();
  if (state.planeDoorOpen) {
    createDisembarkPassengers();
    state.passengerFlow = true;
    state.passengerTime = 0;
    missionTitle.textContent = "乘客下机";
    routeLabel.textContent = "飞机门已开：乘客走向登机桥和海关";
    statusText.textContent = "飞机门打开了。乘客正在离开飞机，走进登机桥，最后到机场里面过海关。";
    addLog("飞机门打开，乘客开始下机。");
  } else {
    state.passengerFlow = false;
    clearPassengers();
    statusText.textContent = "飞机门已经关上。";
    addLog("飞机门关闭。");
  }
}

function addControlTower() {
  cyl("control-tower-stem", 1.6, 13, [58, 6.5, -45], makeMat(0xc7d0d5), airport, 12);
  box("control-tower-room", [7, 3.2, 7], [58, 14.5, -45], makeMat(0x8bc4dd, 0.34, 0.12), airport);
  cone("control-tower-roof", 4.8, 2.2, [58, 17.2, -45], makeMat(0x2d3b47), airport, 4).rotation.y = Math.PI / 4;
  addSpriteLabel("塔台", "ATC", [58, 20.2, -45], 4, 1.6);
}

function addEarthScenery() {
  clearGroup(earthScenery);
  scenicHazardBuildings = [];
  waterLandingSegments = [];
  box("earth-wide-ground", [4200, 0.12, 5200], [120, -0.22, 420], mats.earth, earthScenery);
  box("earth-city-zone-west", [880, 0.09, 980], [-820, -0.14, 250], makeMat(0x334354, 0.82, 0.16), earthScenery);
  box("earth-city-zone-east", [920, 0.09, 1060], [990, -0.14, 280], makeMat(0x304052, 0.82, 0.16), earthScenery);
  box("earth-city-zone-south", [1260, 0.09, 760], [130, -0.14, 1320], makeMat(0x354a5a, 0.82, 0.16), earthScenery);
  box("earth-city-zone-north", [1150, 0.09, 720], [120, -0.14, -780], makeMat(0x2f404f, 0.82, 0.16), earthScenery);
  addRiverRibbon([
    [-1560, -580],
    [-1020, -370],
    [-690, -230],
    [-460, -90],
    [-250, 125],
    [80, 310],
    [330, 575],
    [690, 825],
    [1080, 1110],
    [1580, 1350]
  ], 26);
  addRiverRibbon([
    [-1470, 1080],
    [-1040, 930],
    [-620, 820],
    [-350, 760],
    [-90, 690],
    [190, 710],
    [520, 640],
    [950, 620],
    [1350, 520]
  ], 20);
  addRiverRescueLandingBay();
  addRiverbankRescueScene();
  addMountainRange(-1420, 340, 11, 34);
  addMountainRange(900, -520, 9, 28);
  addMountainRange(1320, 980, 7, 30);
  addNightCity("机场西侧大城市", -820, 240, 6, 6);
  addNightCity("机场东侧大城市", 990, 270, 6, 6);
  addNightCity("机场北侧大城市", 120, -770, 7, 4);
  addNightCity("机场南侧大城市", 130, 1320, 7, 5);
  addNightCity("河边高楼城区", -720, 1450, 4, 5);
  addCityRoadNetwork();
  addSpriteLabel("地球场景", "机场外是大片城市，天空只在上方", [-250, 28, 300], 9, 2.4, earthScenery);
  addSpriteLabel("浅蓝色大海迫降区", "引擎着火时可以迫降到很长的海面，地面也可以", [460, 36, 700], 9, 2.3, earthScenery);
}

function addRiverRibbon(points, width) {
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i];
    const [bx, bz] = points[i + 1];
    const midX = (ax + bx) / 2;
    const midZ = (az + bz) / 2;
    const len = Math.hypot(bx - ax, bz - az);
    const segment = box("earth-blue-river", [width, 0.05, len], [midX, 0.005, midZ], mats.water, earthScenery);
    segment.rotation.y = Math.atan2(bx - ax, bz - az);
    waterLandingSegments.push({ ax, az, bx, bz, width });
  }
}

function addRiverRescueLandingBay() {
  const shallowWaterMat = new THREE.MeshBasicMaterial({ color: 0x62d8ff, transparent: true, opacity: 0.94 });
  const waterEdgeMat = makeMat(0x8fdc87, 0.86, 0.08);
  const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xe8fbff, transparent: true, opacity: 0.74 });
  box("shallow-blue-rescue-sea-landing-zone", [330, 0.08, 156], [riverRescueLanding.x, 0.035, riverRescueLanding.z], shallowWaterMat, earthScenery);
  box("rescue-sea-grassy-bank-left", [330, 0.12, 10], [riverRescueLanding.x, 0.08, riverRescueLanding.z - 84], waterEdgeMat, earthScenery);
  box("rescue-sea-grassy-bank-right", [330, 0.12, 10], [riverRescueLanding.x, 0.08, riverRescueLanding.z + 84], waterEdgeMat, earthScenery);
  for (let i = 0; i < 13; i++) {
    const line = box("shallow-blue-sea-wave", [28, 0.025, 0.38], [riverRescueLanding.x - 142 + i * 24, 0.11, riverRescueLanding.z - 48 + (i % 6) * 18], sparkleMat, earthScenery);
    line.rotation.y = 0.16;
  }
  waterLandingSegments.push({
    ax: riverRescueLanding.x - 165,
    az: riverRescueLanding.z,
    bx: riverRescueLanding.x + 165,
    bz: riverRescueLanding.z,
    width: 156
  });
}

function addRiverbankRescueScene() {
  const shirtMats = [
    makeMat(0xffd75a, 0.64, 0.08),
    makeMat(0x2f82ff, 0.64, 0.08),
    makeMat(0xff6b6b, 0.64, 0.08),
    makeMat(0xffffff, 0.64, 0.08)
  ];
  const skinMat = makeMat(0xe0aa7a, 0.58, 0.02);
  const darkMat = makeMat(0x26323a, 0.66, 0.08);
  const rescueMat = makeMat(0xfff4a8, 0.58, 0.08);
  const people = [
    [258, 488], [278, 486], [304, 492], [330, 486], [356, 492], [382, 486], [410, 488],
    [262, 608], [292, 612], [322, 606], [352, 612], [382, 606], [414, 610],
    [665, 810], [690, 828], [714, 818], [742, 836]
  ];
  people.forEach(([x, z], index) => {
    const group = new THREE.Group();
    group.name = "sea-bank-rescue-person";
    cyl("person-body", 0.42, 1.35, [0, 0.78, 0], shirtMats[index % shirtMats.length], group, 12);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 14), skinMat);
    head.name = "person-head";
    head.position.set(0, 1.64, 0);
    head.castShadow = true;
    group.add(head);
    box("person-arm-left", [0.18, 0.7, 0.16], [-0.48, 1.05, 0], skinMat, group).rotation.z = 0.28;
    box("person-arm-right", [0.18, 0.7, 0.16], [0.48, 1.05, 0], skinMat, group).rotation.z = -0.28;
    box("person-leg-left", [0.18, 0.62, 0.18], [-0.16, 0.18, 0], darkMat, group);
    box("person-leg-right", [0.18, 0.62, 0.18], [0.16, 0.18, 0], darkMat, group);
    group.position.set(x, 0.05, z);
    group.rotation.y = index % 2 ? -0.35 : 0.35;
    earthScenery.add(group);
  });
  for (const [x, z] of [[286, 498], [338, 548], [388, 604], [704, 795]]) {
    const buoy = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.16, 12, 32), rescueMat);
    buoy.name = "sea-rescue-ring";
    buoy.position.set(x, 0.18, z);
    buoy.rotation.x = Math.PI / 2;
    buoy.castShadow = true;
    earthScenery.add(buoy);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 14), mats.runwayYellowLight);
    lamp.name = "sea-rescue-light";
    lamp.position.set(x + 2.4, 1.1, z - 1.6);
    earthScenery.add(lamp);
  }
  addSpriteLabel("海上救援区", "浅蓝色大海，岸边有人和救援人员", [338, 8.5, 472], 9.4, 2.1, earthScenery);
}

function addMountainRange(baseX, baseZ, count, heightBase) {
  for (let i = 0; i < count; i++) {
    const x = baseX + i * 58 + Math.sin(i * 1.7) * 16;
    const z = baseZ + Math.cos(i * 1.3) * 36;
    const h = heightBase + (i % 3) * 9;
    const radius = 28 + (i % 2) * 8;
    const mountain = cone("earth-mountain", radius, h, [x, h / 2 - 0.08, z], mats.mountain, earthScenery, 5);
    mountain.rotation.y = i * 0.34;
    const cap = cone("earth-mountain-snow", radius * 0.34, h * 0.26, [x, h - h * 0.13, z], mats.mountainSnow, earthScenery, 5);
    cap.rotation.y = mountain.rotation.y;
  }
}

function addNightCity(label, baseX, baseZ, cols, rows) {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = baseX + (col - cols / 2) * 24;
      const z = baseZ + (row - rows / 2) * 25;
      const h = 11 + ((row * 3 + col * 5) % 8) * 4;
      box("earth-city-tower", [12, h, 11], [x, h / 2, z], mats.cityGlass, earthScenery);
      box("earth-city-rooftop-light", [8, 0.25, 7], [x, h + 0.25, z], mats.cityLight, earthScenery);
      for (let floor = 2; floor < h - 2; floor += 4) {
        box("earth-city-window-strip", [12.2, 0.32, 0.16], [x, floor, z - 5.62], mats.cityLight, earthScenery);
      }
      scenicHazardBuildings.push({ x, z, width: 14, depth: 13, height: h + 1.2, label });
    }
  }
  addSpriteLabel(label, "CITY LIGHTS", [baseX, 38, baseZ - rows * 12 - 16], 7.2, 2, earthScenery);
}

function addCityRoadNetwork() {
  const cityCenters = [
    [-820, 240],
    [990, 270],
    [120, -770],
    [130, 1320],
    [-720, 1450]
  ];
  cityCenters.forEach(([cx, cz]) => {
    for (let i = -2; i <= 2; i++) {
      box("earth-city-road-x", [150, 0.06, 2.4], [cx, 0.02, cz + i * 25], mats.roadDark, earthScenery);
      box("earth-city-road-z", [2.4, 0.06, 155], [cx + i * 24, 0.025, cz], mats.roadDark, earthScenery);
    }
    for (let i = -3; i <= 3; i++) {
      const lightA = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), mats.cityLight);
      lightA.position.set(cx + i * 22, 0.7, cz - 72);
      earthScenery.add(lightA);
      const lightB = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), mats.cityLight);
      lightB.position.set(cx - 68, 0.7, cz + i * 20);
      earthScenery.add(lightB);
    }
  });
}

function addSpaceScenery() {
  clearGroup(spaceScenery);
  const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 140; i++) {
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.36 + (i % 5) * 0.08, 8, 8), starMat);
    const x = Math.sin(i * 12.9898) * 760;
    const z = Math.cos(i * 78.233) * 920;
    const y = 150 + (i % 37) * 8;
    star.position.set(x, y, z);
    spaceScenery.add(star);
  }
  const earthArcMat = new THREE.MeshBasicMaterial({ color: 0x245bb8, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
  const arc = new THREE.Mesh(new THREE.RingGeometry(460, 470, 96), earthArcMat);
  arc.name = "space-earth-arc";
  arc.position.set(70, 130, 520);
  arc.rotation.x = Math.PI / 2;
  spaceScenery.add(arc);
  spaceScenery.visible = false;
}

function updateWorldAtmosphere() {
  const inSpace = state.phase === "airborne" && state.altitude > spaceAltitude;
  spaceScenery.visible = inSpace;
  if (inSpace) {
    scene.background.set(0x030812);
    scene.fog.color.set(0x030812);
    scene.fog.near = 1600;
    scene.fog.far = 4200;
  } else {
    const isNight = state.timeMode === "night";
    const isDusk = state.timeMode === "dusk";
    scene.background.set(isNight ? 0x071326 : isDusk ? 0xffb36b : 0x9fd8ff);
    scene.fog.color.set(isNight ? 0x071326 : isDusk ? 0xffc082 : 0x9fd8ff);
    scene.fog.near = 1100;
    scene.fog.far = 3200;
  }
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
    for (let i = 0; i < 8; i++) {
      const z = -length * 0.26 + i * (length * 0.52 / 7);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.105 * scale, 12, 12), makeMat(i % 2 ? 0xf3c59f : 0xd9a47c, 0.58, 0.02));
      head.name = "passenger-head-at-window";
      head.position.set(sideX + side * 0.035 * scale, radius * 1.51, z);
      group.add(head);
      const bodyDot = box("passenger-seat-silhouette", [0.045 * scale, 0.12 * scale, 0.16 * scale], [sideX + side * 0.038 * scale, radius * 1.35, z], makeMat(0x24415f, 0.66, 0.05), group);
      bodyDot.castShadow = false;
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

  let playerDoor = null;
  let playerDoorWindow = null;
  if (options.player) {
    const doorClosedX = radius * 1.16;
    playerDoor = box(
      "player-aircraft-openable-door",
      [0.065 * scale, 0.5 * scale, 0.26 * scale],
      [doorClosedX, radius * 1.5, length * 0.33],
      makeMat(0xf8fbff, 0.34, 0.2),
      group
    );
    playerDoorWindow = box("player-aircraft-door-window", [0.068 * scale, 0.12 * scale, 0.1 * scale], [doorClosedX + 0.006 * scale, radius * 1.62, length * 0.33 + 0.02 * scale], glassMat, group);
    playerAircraftParts = {
      gearParts,
      door: playerDoor,
      doorWindow: playerDoorWindow,
      doorClosedX,
      doorOpenX: doorClosedX + 0.48 * scale
    };
  }

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
  addEarthScenery();
  addSpaceScenery();
  rebuildRouteLights();

  playerPlane = createPlaneModel(airlines[state.airlineIndex], { scale: playerPlaneScale, player: true });
  playerPlane.position.copy(runwayStart);
  playerPlane.rotation.y = 0;
  scene.add(playerPlane);
  updatePlaneDoorVisual();

  const parkPositions = [
    [-66, -42], [-58, -42], [-50, -42], [-42, -42], [-34, -42], [-26, -42], [42, -38], [52, -38],
    [62, -38], [70, -28], [-70, 42], [-58, 48], [-46, 52], [50, 48], [62, 44], [72, 36],
    [-78, 18], [-66, 22], [-54, 26], [82, 16], [90, 28], [96, 40]
  ];
  airlines.forEach((airline, index) => {
    const pos = parkPositions[index % parkPositions.length];
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

function playWaterLandingSplashSound() {
  if (!soundEnabled || !soundReady || !audioCtx) return;
  const now = audioCtx.currentTime;
  const splashNoise = audioCtx.createBufferSource();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  splashNoise.buffer = buildNoiseBuffer(audioCtx);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1600, now);
  filter.frequency.exponentialRampToValueAtTime(420, now + 1.35);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.38, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.035, now + 1.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.65);
  splashNoise.connect(filter).connect(gain).connect(audioCtx.destination);
  splashNoise.start(now);
  splashNoise.stop(now + 1.8);
}

function playAlertBeep() {
  if (!soundEnabled || !soundReady || !audioCtx) return;
  const now = audioCtx.currentTime;
  for (let i = 0; i < 3; i++) {
    const beep = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    beep.type = "square";
    beep.frequency.setValueAtTime(760, now + i * 0.24);
    gain.gain.setValueAtTime(0.001, now + i * 0.24);
    gain.gain.exponentialRampToValueAtTime(0.13, now + i * 0.24 + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.24 + 0.16);
    beep.connect(gain).connect(audioCtx.destination);
    beep.start(now + i * 0.24);
    beep.stop(now + i * 0.24 + 0.18);
  }
}

function updateFlightSound() {
  if (!soundReady || !audioCtx || !engineGain || !noiseGain) return;
  const now = audioCtx.currentTime;
  if (!soundEnabled || state.crashed || state.landed) {
    engineGain.gain.setTargetAtTime(0, now, 0.08);
    noiseGain.gain.setTargetAtTime(0, now, 0.08);
    return;
  }
  if (state.phase === "water-skimming") {
    const speedPower = THREE.MathUtils.clamp(state.speed / 90, 0, 1);
    engineGain.gain.setTargetAtTime(0.01, now, 0.08);
    noiseFilter.frequency.setTargetAtTime(420 + speedPower * 900, now, 0.06);
    noiseGain.gain.setTargetAtTime(0.16 + speedPower * 0.18, now, 0.08);
    return;
  }
  const throttlePower = state.engineOff ? 0 : Math.max(0, state.throttle);
  const speedPower = THREE.MathUtils.clamp(state.speed / 140, 0, 1);
  const airborneBoost = state.engineOff ? 0.02 : state.altitude > 2 ? 0.08 : 0;
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
  updatePlaneDoorVisual();
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
    ? `国际航班：${currentOriginCountry().origin} → ${currentDestinationAirportName()}`
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
  addLog(`国家切换到${currentOriginCountry().name}，只飞本国机场，航线下面会经过河道和城市。`);
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
  routeLabel.textContent = `国际航班：${currentAirportRouteName()}`;
  statusText.textContent = `国际航班已选好。起飞后沿空中的绿色航线，从${currentOriginCountry().origin}飞到${currentDestinationAirportName()}的降落跑道，中间会经过大海、岛屿和远处国家。`;
  addLog(`国际航班开启：从${currentOriginCountry().origin}飞往${currentDestinationAirportName()}，会跨海飞行。`);
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
  routeLabel.textContent = `${level.timeMode === "night" ? "夜航" : level.timeMode === "dusk" ? "傍晚航班" : "白天航班"} · ${currentAirportRouteName()} · 难度 ${level.difficulty}/8`;
  statusText.textContent = level.description;
  if (level.start === "air") {
    startAirLanding();
    missionTitle.textContent = level.title;
    routeLabel.textContent = `${level.timeMode === "night" ? "夜航" : level.timeMode === "dusk" ? "傍晚航班" : "白天航班"} · 飞往目的机场降落跑道 · 难度 ${level.difficulty}/8`;
    statusText.textContent = `${level.description} 这一关从天空开始，飞机会沿绿色灯线飞过中间城市，再到右边目的机场降落跑道。`;
  } else if (level.start === "emergency") {
    startEngineFireEmergency();
    missionTitle.textContent = level.title;
    routeLabel.textContent = `引擎着火迫降 · 难度 ${level.difficulty}/8`;
    statusText.textContent = `${level.description} 先关闭引擎，然后滑翔到河流、水面或平地。`;
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

function isEmergencyFlightActive() {
  return ["emergency", "water-skimming"].includes(state.phase) || state.engineFire || (state.engineOff && state.glideTimeLeft > 0);
}

function openEmergencyChoice() {
  if (!emergencyChoice) return;
  emergencyChoice.classList.add("open");
  statusText.textContent = "无人驾驶要先选择：去水面迫降，还是去地面迫降。";
}

function closeEmergencyChoice() {
  if (!emergencyChoice) return;
  emergencyChoice.classList.remove("open");
}

function startEmergencyAutopilot(mode) {
  if (state.crashed || state.landed) resetGame();
  ensureAudio();
  closeEmergencyChoice();
  state.phase = "emergency";
  state.route = mode === "water" ? "emergency-water" : "emergency-ground";
  state.emergencyAutopilotMode = mode;
  state.engineOff = true;
  state.engineFire = false;
  state.throttle = 0;
  state.gear = 0;
  state.glideTimeLeft = Math.max(state.glideTimeLeft, 600);
  throttleLever.value = "0";
  gearLever.value = "0";
  clearEngineFire();
  rebuildRouteLights();
  setAutopilot(true);
  const targetText = mode === "water" ? "水面国家：沿绿色灯线飞到浅蓝色大海" : "地面国家：沿绿色灯线飞到安全平地";
  routeLabel.textContent = `无人驾驶迫降 · ${targetText}`;
  statusText.textContent = mode === "water"
    ? "无人驾驶接管：飞机会沿绿色灯线找浅蓝色大海，放平机头，最后在水面滑行停下。"
    : "无人驾驶接管：飞机会沿绿色灯线避开河流和大楼，最后落到平地停下。";
  addLog(`无人驾驶迫降选择：${targetText}。`);
  updateFlightSound();
}

function autopilotActorName() {
  return state.passengerMode && state.passengerBoarded && !state.passengerAccidentTarget ? "机长" : "无人驾驶";
}

function withPilotActor(text) {
  return text.replace(/无人驾驶/g, autopilotActorName());
}

function announceAutopilotStage(stage, text) {
  if (state.autopilotStage === stage) return;
  state.autopilotStage = stage;
  const baseText = withPilotActor(text);
  const passengerText = state.passengerAccidentTarget
    ? state.passengerAccidentTarget === "water"
      ? `氧气面罩已经掉下，救生衣在座椅下面。${baseText}`
      : `氧气面罩已经掉下。${baseText}`
    : baseText;
  statusText.textContent = passengerText;
  addLog(passengerText);
}

function toggleAutopilot() {
  if (state.crashed || state.landed) resetGame();
  ensureAudio();
  if (state.autopilot) {
    setAutopilot(false);
    closeEmergencyChoice();
    statusText.textContent = "已切回手动驾驶，你可以自己推油门、拉操纵杆和收放起落架。";
    addLog("无人驾驶关闭，玩家接管飞机。");
    return;
  }
  if (isEmergencyFlightActive()) {
    openEmergencyChoice();
    routeLabel.textContent = "请选择无人驾驶迫降目标：水面或地面";
    return;
  }
  setAutopilot(true);
  if (state.phase === "airborne") {
    state.phase = "landing";
    state.route = "landing";
    rebuildRouteLights();
  }
  statusText.textContent = "无人驾驶开启：飞机会自动沿绿色灯线飞，从左边机场出发，经过中间城市上空，再飞到右边目的机场降落跑道。";
  routeLabel.textContent = `无人驾驶：${currentAirportRouteName()}`;
  addLog("无人驾驶开启，自动跟随绿色航线。");
}

function updateAutopilot() {
  if (!state.autopilot || state.crashed || state.landed) return;
  if (state.phase === "airborne") {
    state.phase = "landing";
    state.route = "landing";
    rebuildRouteLights();
    routeLabel.textContent = `${autopilotActorName()}：沿绿色灯线飞往${currentDestinationAirportName()}`;
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
    state.yokeY = playerPlane.position.z > -100 && state.speed > 90 ? 0.78 : 0;
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
  } else if (state.phase === "emergency") {
    state.engineOff = true;
    state.engineFire = false;
    state.throttle = 0;
    state.gear = 0;
    const finalTarget = path[path.length - 1];
    const finalDistance = Math.hypot(finalTarget.x - playerPlane.position.x, finalTarget.z - playerPlane.position.z);
    const desiredAltitude = finalDistance > 300
      ? 74
      : finalDistance > 170
        ? THREE.MathUtils.mapLinear(finalDistance, 300, 170, 74, 34)
        : finalDistance > 55
          ? THREE.MathUtils.mapLinear(finalDistance, 170, 55, 34, 7)
          : 0;
    const altitudeError = desiredAltitude - state.altitude;
    state.yokeY = THREE.MathUtils.clamp(altitudeError * 0.045, -0.62, 0.74);
    routeLabel.textContent = state.emergencyAutopilotMode === "water"
      ? `${autopilotActorName()}迫降：绿色灯线正在对准浅蓝色大海`
      : `${autopilotActorName()}迫降：绿色灯线正在对准平地`;
    if (state.emergencyAutopilotMode === "water") {
      announceAutopilotStage("emergency-water", "无人驾驶正在找浅蓝色大海：机头保持平稳，快到水面时会拉平滑行。");
    } else {
      announceAutopilotStage("emergency-ground", "无人驾驶正在找地面平地：避开河流和大楼，最后落地停下。");
    }
  }

  throttleLever.value = String(Math.round(state.throttle * 100));
  gearLever.value = String(Math.round(state.gear * 100));
  if (!isCabinLookMode()) updateYokeKnob();
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
  state.passengerCabinViewMode = 0;
  state.route = "takeoff";
  state.crashed = false;
  state.landed = false;
  state.offRouteTime = 0;
  state.autoTakeoffOnly = false;
  state.engineFire = false;
  state.engineOff = false;
  state.glideTimeLeft = 0;
  state.emergencyAutopilotMode = "";
  state.emergencySurface = "";
  state.waterLandingTime = 0;
  state.waterLandingDuration = 0;
  state.waterLandingHeading = 0;
  state.passengerMode = false;
  clearPassengerModeVisuals();
  setAutopilot(false);
  closeEmergencyChoice();
  resetGateDocking();
  throttleLever.value = "0";
  gearLever.value = "0";
  document.body.classList.remove("crashed");
  clearTwinTowerScene();
  clearExplosion();
  clearEngineFire();
  clearWaterSplash();
  playerPlane.visible = true;
  playerPlane.position.copy(runwayStart);
  playerPlane.rotation.set(0, 0, 0);
  flightLog.innerHTML = "";
  rebuildRouteLights();
  missionTitle.textContent = `${currentOriginCountry().name}起飞准备`;
  statusText.textContent = `飞机在左边${currentOriginCountry().origin}的 3000 km 训练跑道最尾端。油门往前推，从这一头滑到另一头，速度够了会抬头起飞；飞过中间城市后，到右边${currentDestinationAirportName()}降落。`;
  routeLabel.textContent = `绿色灯线：${currentOriginCountry().origin}起飞跑道 → ${currentDestinationAirportName()}降落跑道`;
  addLog(`飞机在${currentOriginCountry().origin}，准备滑完整条跑道起飞。`);
  updateYokeKnob();
  updateFlightSound();
}

function followGreenLights() {
  if (state.crashed || state.landed) return;
  ensureAudio();
  state.phase = "takeoff";
  state.route = "takeoff";
  rebuildRouteLights();
  state.autoTakeoffOnly = true;
  setAutopilot(true);
  routeLabel.textContent = `绿色灯线：${currentOriginCountry().origin}起飞跑道 → ${currentDestinationAirportName()}降落跑道`;
  statusText.textContent = `绿色灯线现在显示左边${currentOriginCountry().origin}起飞跑道，无人驾驶会沿灯线滑行到足够长的位置再起飞，然后穿过中间城市去右边机场。`;
  addLog("已显示跑道中心绿色灯线，并开启自动滑行。");
}

function takeoff() {
  if (state.crashed || state.landed) return;
  ensureAudio();
  state.phase = "takeoff";
  state.route = "takeoff";
  rebuildRouteLights();
  state.autoTakeoffOnly = true;
  setAutopilot(true);
  routeLabel.textContent = "自动起飞：沿绿色跑道灯线滑行，加速到 95 kt 以上。";
  statusText.textContent = "自动起飞开始：飞机会自己沿跑道滑行，发动机轰鸣，过了跑道中段后速度够了就会抬头飞起来。";
  addLog("塔台允许起飞，自动滑行和发动机轰鸣开始。");
}

function startLanding() {
  if (state.crashed || state.landed) return;
  state.phase = "landing";
  state.route = "landing";
  rebuildRouteLights();
  routeLabel.textContent = `绿色灯线：飞往${currentDestinationAirportName()}降落跑道`;
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
  routeLabel.textContent = `空中开局：沿绿色灯线飞往${currentDestinationAirportName()}降落跑道`;
  statusText.textContent = `你已经在天空上飞了。沿绿色灯线飞向${currentDestinationAirportName()}，快到跑道时减速，起落架保持 Down。`;
  addLog(`空中开局：飞机已经在天上，准备降落到${currentDestinationAirportName()}。`);
  updateYokeKnob();
  updateFlightSound();
}

function startEngineFireEmergency() {
  if (state.crashed || state.landed) resetGame();
  ensureAudio();
  setAutopilot(false);
  closeEmergencyChoice();
  state.phase = "emergency";
  state.route = "landing";
  state.speed = 130;
  state.altitude = 600;
  state.throttle = 0.28;
  state.gear = 0;
  state.yokeX = 0;
  state.yokeY = 0;
  state.crashed = false;
  state.landed = false;
  state.offRouteTime = 0;
  state.engineFire = true;
  state.engineOff = false;
  state.glideTimeLeft = 600;
  state.emergencyAutopilotMode = "";
  state.emergencySurface = "";
  state.waterLandingTime = 0;
  state.waterLandingDuration = 0;
  throttleLever.value = "28";
  gearLever.value = "0";
  const start = new THREE.Vector3(-260, 0.62 + state.altitude * 0.22, 420);
  playerPlane.position.copy(start);
  state.heading = Math.PI / 2.5;
  playerPlane.rotation.set(-0.04, state.heading, 0);
  createEngineFire();
  rebuildRouteLights();
  missionTitle.textContent = "引擎着火迫降";
  routeLabel.textContent = "空中故障：关闭引擎后还可以滑翔 10 分钟";
  statusText.textContent = "引擎着火了：点“关闭引擎”，最好驾驶到有海岸救援人员的浅蓝色大海做水上迫降；如果降到地面上也可以成功，不会爆炸。";
  addLog("空中故障开局：引擎着火，目标是驾驶到浅蓝色大海做水上迫降。");
  updateYokeKnob();
  updateFlightSound();
}

function shutEngine() {
  ensureAudio();
  state.engineOff = true;
  state.throttle = 0;
  throttleLever.value = "0";
  if (state.engineFire && state.phase !== "emergency") state.phase = "emergency";
  routeLabel.textContent = "引擎已关闭：保持机头平稳，继续滑翔";
  statusText.textContent = "引擎已经关闭，火焰变小。飞机还可以滑翔约 10 分钟；点“无人驾驶”可以选择水面国家或地面国家。";
  addLog("引擎关闭，进入滑翔迫降。");
  updateFlightSound();
}

function brake() {
  state.throttle = -0.3;
  throttleLever.value = "-30";
  state.speed = Math.max(0, state.speed - 42);
  statusText.textContent = "刹车，油门杆拉到最后面，速度可以一直降到 0 kt。";
}

function demoCrash() {
  if (state.crashed || state.landed) resetGame();
  ensureAudio();
  playerPlane.position.y = Math.max(playerPlane.position.y, 4);
  crash("事故演示：飞机失控，出现爆炸失败效果。正常游戏里要避开大楼、对准跑道安全降落。");
}

function addTestTower(name, x, z) {
  const tower = new THREE.Group();
  tower.name = name;
  const glassMat = makeMat(0x8fb6c6, 0.46, 0.22);
  const steelMat = makeMat(0x25323b, 0.5, 0.4);
  const capMat = makeMat(0x182631, 0.5, 0.28);
  const markPart = (part, floor, targetY) => {
    part.userData.floor = floor;
    part.userData.tower = name;
    part.userData.originalY = part.position.y;
    part.userData.targetY = targetY;
    return part;
  };
  for (let floor = 0; floor < 20; floor++) {
    const y = 5 + floor * 9.2;
    const floorBlock = box("solid-test-tower-floor", [16, 8.7, 16], [0, y, 0], glassMat, tower);
    markPart(floorBlock, floor, Math.max(1.4, y * 0.13));
    const band = box("test-tower-steel-band", [17, 0.42, 17], [0, y + 4.55, 0], steelMat, tower);
    markPart(band, floor, Math.max(1.8, y * 0.13 + 0.2));
    for (const side of [-1, 1]) {
      markPart(
        box("test-tower-vertical-column", [0.45, 8.9, 0.45], [side * 8.2, y, side * 8.2], steelMat, tower),
        floor,
        Math.max(1.2, y * 0.13)
      );
      markPart(
        box("test-tower-vertical-column", [0.45, 8.9, 0.45], [side * 8.2, y, -side * 8.2], steelMat, tower),
        floor,
        Math.max(1.2, y * 0.13)
      );
    }
  }
  markPart(box("test-tower-roof", [18, 1.4, 18], [0, 190, 0], capMat, tower), 20, 3.8);
  addSpriteLabel("无人测试塔", "FAKE SAFETY TEST", [0, 199, 0], 8, 2, tower);
  tower.position.set(x, 0, z);
  twinTowerTest.add(tower);
  return tower;
}

function clearTwinTowerScene() {
  clearGroup(twinTowerTest);
  state.twinTowerDemo = false;
  state.towerDemoTime = 0;
  state.towerCollapseTime = 0;
  state.towerImpacts = {};
}

function createTwinTowerScene() {
  clearTwinTowerScene();
  box("test-city-ground", [120, 0.18, 85], [160, 0.04, 530], makeMat(0x6f7880, 0.82, 0.25), twinTowerTest);
  box("test-city-road", [10, 0.22, 88], [160, 0.16, 530], makeMat(0x1f2933, 0.76, 0.25), twinTowerTest);
  addTestTower("test-tower-a", 146, 530);
  addTestTower("test-tower-b", 176, 530);
  const secondPlane = createPlaneModel(airlines[2], { scale: 0.82 });
  secondPlane.name = "second-unmanned-test-plane";
  secondPlane.position.set(-52, 17.2, 544);
  secondPlane.rotation.set(0, Math.PI / 2, 0);
  secondPlane.visible = false;
  twinTowerTest.add(secondPlane);
  addSpriteLabel("无人双塔安全测试", "没有真人 · 只是测试场景", [160, 24, 474], 11, 2.4, twinTowerTest);
}

function startTwinTowerTest() {
  resetGame();
  ensureAudio();
  setTimeMode("day");
  createTwinTowerScene();
  state.twinTowerDemo = true;
  state.phase = "tower-test";
  state.speed = 112;
  state.throttle = 0.72;
  state.altitude = 76;
  state.heading = Math.PI / 2;
  state.towerImpacts = {};
  playerPlane.visible = true;
  playerPlane.position.set(-82, 0.62 + state.altitude * 0.22, 530);
  playerPlane.rotation.set(0, state.heading, 0);
  missionTitle.textContent = "无人双塔安全测试";
  routeLabel.textContent = "测试演示：无人飞机 · 假塔 · 非攻击玩法";
  statusText.textContent = "这是一个假的 test 场景：两个超级高的无人测试塔，飞机按预设路线演示碰撞、火光和结构倒塌。";
  addLog("进入无人双塔安全测试：没有真人，只是测试动画。");
}

function updateTwinTowerTest(dt) {
  if (!state.twinTowerDemo) return;
  state.towerDemoTime += dt;
  if (!state.crashed) {
    playerPlane.position.x += dt * 39;
    playerPlane.position.y = 0.62 + state.altitude * 0.22 + Math.sin(state.towerDemoTime * 4) * 0.25;
    playerPlane.rotation.y = Math.PI / 2;
    playerPlane.rotation.x = -0.04;
    if (playerPlane.position.x >= 145) {
      crash("无人双塔安全测试：假飞机撞到无人测试塔，出现火光和烟雾，结构开始从上往下倒塌。");
      state.towerCollapseTime = 0.001;
      state.towerImpacts["test-tower-a"] = state.towerCollapseTime;
    }
  } else if (state.towerCollapseTime) {
    state.towerCollapseTime += dt;
    const secondPlane = twinTowerTest.getObjectByName("second-unmanned-test-plane");
    if (secondPlane && !state.towerImpacts["test-tower-b"]) {
      if (state.towerCollapseTime > 1.45) secondPlane.visible = true;
      if (secondPlane.visible) {
        secondPlane.position.x += dt * 82;
        secondPlane.position.y = 17.2 + Math.sin(state.towerCollapseTime * 5) * 0.18;
        secondPlane.rotation.y = Math.PI / 2;
        if (secondPlane.position.x >= 176) {
          createExplosion(new THREE.Vector3(176, 19, 544));
          secondPlane.rotation.x = 0.34;
          secondPlane.rotation.z = 0.58;
          state.towerImpacts["test-tower-b"] = state.towerCollapseTime;
          statusText.textContent = "第二架无人测试飞机完成预设碰撞测试，第二座假塔也开始从上往下倒塌。";
          addLog("第二座无人测试塔开始结构倒塌。");
        }
      }
    }
    twinTowerTest.traverse((obj) => {
      if (obj.userData.floor === undefined) return;
      const impactTime = state.towerImpacts[obj.userData.tower];
      if (!impactTime) return;
      const localTime = state.towerCollapseTime - impactTime;
      const delay = Math.max(0, 20 - obj.userData.floor) * 0.045;
      if (localTime < delay) return;
      obj.position.y = THREE.MathUtils.lerp(obj.position.y, obj.userData.targetY || 1.2, 1 - Math.exp(-dt * 2.7));
      obj.rotation.z += dt * 0.08 * (obj.userData.floor % 2 ? 1 : -1);
    });
  }
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

function clearEngineFire() {
  while (engineFireGroup.children.length) {
    const child = engineFireGroup.children.pop();
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  }
  engineFireGroup.visible = false;
}

function createEngineFire() {
  clearEngineFire();
  const colors = [0xffcf4a, 0xff6a2a, 0xff2f1d, 0x2a2a2a];
  for (let i = 0; i < 16; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: colors[i % colors.length],
      emissive: colors[i % colors.length],
      emissiveIntensity: i % 4 === 3 ? 0.15 : 1.35,
      roughness: 0.55,
      transparent: true,
      opacity: 0.82
    });
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.24 + (i % 3) * 0.08, 12, 12), material);
    const side = i % 2 === 0 ? -1 : 1;
    flame.position.set(side * (1.25 + Math.random() * 0.35), -0.18 + Math.random() * 0.35, -0.1 + Math.random() * 0.5);
    flame.userData.base = flame.position.clone();
    flame.userData.seed = Math.random() * 20;
    engineFireGroup.add(flame);
  }
  engineFireGroup.visible = true;
}

function updateEngineFire(dt) {
  if (!state.engineFire || state.engineOff || state.landed || state.crashed || !playerPlane.visible) {
    engineFireGroup.visible = false;
    return;
  }
  engineFireGroup.visible = true;
  engineFireGroup.position.copy(playerPlane.position);
  engineFireGroup.rotation.copy(playerPlane.rotation);
  engineFireGroup.children.forEach((flame) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 14 + flame.userData.seed) * 0.24;
    flame.position.copy(flame.userData.base);
    flame.position.y += Math.sin(clock.elapsedTime * 9 + flame.userData.seed) * 0.12;
    flame.scale.setScalar(pulse);
    flame.material.opacity = 0.62 + Math.sin(clock.elapsedTime * 12 + flame.userData.seed) * 0.18;
  });
}

function clearWaterSplash() {
  while (waterSplashGroup.children.length) {
    const child = waterSplashGroup.children.pop();
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  }
  waterSplashGroup.visible = false;
}

function createWaterSplash() {
  clearWaterSplash();
  const foamMat = new THREE.MeshStandardMaterial({
    color: 0xe9fbff,
    emissive: 0x8ddfff,
    emissiveIntensity: 0.55,
    roughness: 0.38,
    transparent: true,
    opacity: 0.82
  });
  const wakeMat = new THREE.MeshStandardMaterial({
    color: 0xb9efff,
    emissive: 0x3ba2d8,
    emissiveIntensity: 0.5,
    roughness: 0.45,
    transparent: true,
    opacity: 0.62
  });
  for (let i = 0; i < 30; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.24, 10, 10), i % 3 === 0 ? wakeMat.clone() : foamMat.clone());
    drop.position.set(side * (1.1 + Math.random() * 2.8), -0.16 + Math.random() * 0.55, -1.2 - Math.random() * 7.5);
    drop.userData.base = drop.position.clone();
    drop.userData.seed = Math.random() * 20;
    drop.userData.side = side;
    waterSplashGroup.add(drop);
  }
  for (let i = 0; i < 12; i++) {
    const wake = new THREE.Mesh(new THREE.BoxGeometry(0.22 + Math.random() * 0.4, 0.04, 1.8 + Math.random() * 2.6), wakeMat.clone());
    wake.position.set((Math.random() - 0.5) * 5.8, -0.2, -2.2 - i * 0.85);
    wake.rotation.y = (Math.random() - 0.5) * 0.28;
    wake.userData.seed = Math.random() * 20;
    waterSplashGroup.add(wake);
  }
  waterSplashGroup.visible = true;
}

function updateWaterSplash(dt) {
  if (state.phase !== "water-skimming" || state.crashed || state.landed || !playerPlane.visible) {
    waterSplashGroup.visible = false;
    return;
  }
  waterSplashGroup.visible = true;
  waterSplashGroup.position.copy(playerPlane.position);
  waterSplashGroup.rotation.y = state.waterLandingHeading;
  waterSplashGroup.children.forEach((splash, index) => {
    const pulse = Math.sin(clock.elapsedTime * 18 + splash.userData.seed);
    const stretch = THREE.MathUtils.clamp(state.speed / 70, 0.25, 1.25);
    const wakeTravel = (clock.elapsedTime * Math.max(6, state.speed) * 0.18 + index * 0.8) % 12;
    splash.position.copy(splash.userData.base);
    splash.position.x += (splash.userData.side || 0) * Math.sin(clock.elapsedTime * 10 + index) * 0.18;
    splash.position.y += Math.max(0, pulse) * 0.42 * stretch;
    splash.position.z = -0.9 - wakeTravel;
    splash.scale.set(1.2 + stretch * 0.75, 0.55 + Math.max(0, pulse) * 0.7, 1.1 + stretch);
    splash.material.opacity = 0.28 + Math.max(0, pulse) * 0.48;
  });
}

function distanceToSegment2D(px, pz, segment) {
  const abx = segment.bx - segment.ax;
  const abz = segment.bz - segment.az;
  const apx = px - segment.ax;
  const apz = pz - segment.az;
  const denom = abx * abx + abz * abz || 1;
  const t = THREE.MathUtils.clamp((apx * abx + apz * abz) / denom, 0, 1);
  const x = segment.ax + abx * t;
  const z = segment.az + abz * t;
  return Math.hypot(px - x, pz - z);
}

function isOverWater() {
  return waterLandingSegments.some((segment) => distanceToSegment2D(playerPlane.position.x, playerPlane.position.z, segment) <= segment.width * 0.85);
}

function checkHazardCollisions() {
  if (state.crashed || state.landed || state.altitude > 18) return;
  for (const building of [...hazardBuildings, ...scenicHazardBuildings]) {
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
  closeEmergencyChoice();
  clearEngineFire();
  clearWaterSplash();
  state.engineFire = false;
  state.engineOff = false;
  state.emergencyAutopilotMode = "";
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
  closeEmergencyChoice();
  clearEngineFire();
  clearWaterSplash();
  state.engineFire = false;
  state.engineOff = false;
  state.emergencyAutopilotMode = "";
  state.landed = true;
  state.phase = "landed";
  state.speed = 0;
  state.throttle = 0;
  throttleLever.value = "0";
  missionTitle.textContent = "安全降落";
  statusText.textContent = `飞机飞到${currentDestinationAirportName()}，沿降落跑道减速停下，接下来要穿过目的城市机场区去登机口。`;
  addLog(`安全降落在${currentDestinationAirportName()}，飞机停在目的机场降落跑道。`);
  startArrivalTaxi();
}

function startWaterLandingSequence() {
  if (state.crashed || state.landed || state.phase === "water-skimming") return;
  setAutopilot(false);
  closeEmergencyChoice();
  clearEngineFire();
  state.engineFire = false;
  state.engineOff = true;
  state.phase = "water-skimming";
  state.emergencySurface = "水面";
  state.waterLandingTime = 0;
  state.waterLandingDuration = 6.4;
  state.waterLandingHeading = state.heading;
  state.altitude = 0;
  state.speed = Math.max(48, Math.min(state.speed, 82));
  state.throttle = 0;
  throttleLever.value = "0";
  if (state.emergencyAutopilotMode === "water" || state.passengerAccidentTarget === "water") {
    const rescuePoint = getRiverRescueLandingPoint();
    playerPlane.position.x = rescuePoint.x;
    playerPlane.position.z = rescuePoint.z;
    state.heading = riverRescueLanding.heading;
    playerPlane.rotation.y = state.heading;
    state.waterLandingHeading = state.heading;
  }
  playerPlane.position.y = 0.74;
  playerPlane.rotation.x = 0.015;
  playerPlane.rotation.z = 0;
  createWaterSplash();
  playWaterLandingSplashSound();
  missionTitle.textContent = "水上迫降滑行";
  routeLabel.textContent = "浅蓝色大海：机身拉平，水花起来，正在减速";
  statusText.textContent = "飞机已经平稳碰到浅蓝色大海了。机身贴着水面滑行，左右两边有浪花，速度会慢慢降下来，海岸救援人员正在看着。";
  addLog("飞机贴水了：不是爆炸，是在浅蓝色大海上平稳滑行减速。");
}

function emergencyLandSuccess(surface) {
  setAutopilot(false);
  closeEmergencyChoice();
  clearEngineFire();
  clearWaterSplash();
  clearGroup(evacuationGroup);
  clearGroup(lifeRaftGroup);
  state.engineFire = false;
  state.engineOff = true;
  state.emergencyAutopilotMode = "";
  state.landed = true;
  state.phase = "emergency-landed";
  state.emergencySurface = surface;
  state.evacuationActive = true;
  state.evacuationSurface = surface;
  state.evacuationTime = 0;
  state.planeDoorOpen = false;
  state.emergencyExitOpened = false;
  state.evacuationSlideDeployed = false;
  state.evacuationPassengersReleased = false;
  state.lifeRaftDeployed = false;
  state.playerEvacuationStarted = false;
  state.playerEvacuated = false;
  state.speed = 0;
  state.throttle = 0;
  throttleLever.value = "0";
  updatePlaneDoorVisual();
  if (surface === "水面") {
    playerPlane.position.y = 0.68;
    createWaterRescueScene();
  } else {
    playerPlane.position.y = 0.72;
    createGroundRescueScene();
  }
  updateEmergencyActionButton();
  missionTitle.textContent = "迫降成功";
  statusText.textContent = surface === "水面"
    ? "飞机已经落到浅蓝色大海上并停住。现在先点开门，再点伸出滑梯，最后点充气救生筏，乘客才会一个个滑下来。"
    : "飞机已经在地面跑道上停住。消防车开过来喷水灭火。现在先点开门，再点伸出滑梯，乘客才会一个个滑到安全区域。";
  addLog(`引擎故障迫降成功：落到${surface}，飞机停下来了。`);
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
  const cabinLookMode = isCabinLookMode();
  if (cabinLookMode) {
    if (keys.has("ARROWLEFT")) state.cameraYaw += 0.045;
    if (keys.has("ARROWRIGHT")) state.cameraYaw -= 0.045;
    if (keys.has("ARROWUP")) state.cameraPitch = THREE.MathUtils.clamp(state.cameraPitch + 0.035, -0.95, 0.9);
    if (keys.has("ARROWDOWN")) state.cameraPitch = THREE.MathUtils.clamp(state.cameraPitch - 0.035, -0.95, 0.9);

    const keyForward = (keys.has("KEYW") ? 1 : 0) - (keys.has("KEYS") ? 1 : 0);
    const keySide = (keys.has("KEYD") ? 1 : 0) - (keys.has("KEYA") ? 1 : 0);
    const stickForward = Math.abs(state.cabinMoveY) > 0.08 ? -state.cabinMoveY : 0;
    const stickSide = Math.abs(state.cabinMoveX) > 0.08 ? state.cabinMoveX : 0;
    const forwardInput = THREE.MathUtils.clamp(keyForward + stickForward, -1, 1);
    const sideInput = THREE.MathUtils.clamp(keySide + stickSide, -1, 1);
    const moving = Math.abs(forwardInput) > 0.01 || Math.abs(sideInput) > 0.01;
    if (moving) {
      const step = 0.045;
      const yaw = state.cameraYaw;
      const deltaX = (Math.cos(yaw) * sideInput + Math.sin(yaw) * forwardInput) * step;
      const deltaZ = (Math.sin(yaw) * sideInput - Math.cos(yaw) * forwardInput) * step;
      state.passengerCabinX = THREE.MathUtils.clamp(state.passengerCabinX + deltaX, -0.48, 0.78);
      state.passengerCabinZ = THREE.MathUtils.clamp(state.passengerCabinZ + deltaZ, -1.36, 2.42);
      state.passengerCabinWalkYaw = Math.atan2(deltaX, -deltaZ);
    }
    state.passengerWalking = moving;
    syncCabinPassengerAvatar();
    return;
  }
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
  if (state.phase === "passenger-boarding") {
    updatePassengerBoarding(dt);
    state.speed = 0;
    state.altitude = 0;
    playerPlane.position.y = 0.62;
    return;
  }
  if (state.phase === "passenger-ready") {
    state.speed = 0;
    state.altitude = 0;
    playerPlane.position.y = 0.62;
    return;
  }
  let targetSpeed = state.throttle < -0.22 ? 0 : state.throttle * 142;
  if (state.phase === "emergency") {
    const manualStop = state.throttle < -0.22 || (state.altitude < 1.2 && state.throttle <= 0.02);
    targetSpeed = manualStop ? 0 : state.engineOff ? Math.max(24, state.speed * 0.992) : 86;
  } else if (state.phase === "water-skimming") {
    targetSpeed = 0;
  }
  state.speed = THREE.MathUtils.lerp(state.speed, Math.max(0, targetSpeed), 1 - Math.exp(-dt * 1.6));
  const ground = state.altitude < 1.1;
  const turnPower = ground ? 0.65 : 1.15;
  state.heading -= state.yokeX * dt * turnPower * Math.max(0.25, state.speed / 80);

  const forward = new THREE.Vector3(Math.sin(state.heading), 0, Math.cos(state.heading));
  const distance = state.speed * dt * 0.35;
  playerPlane.position.add(forward.multiplyScalar(distance));
  playerPlane.rotation.y = state.heading;
  const passengerCruise = state.passengerMode && state.passengerBoarded && ["takeoff", "airborne", "landing"].includes(state.phase);
  playerPlane.rotation.z = -state.yokeX * (passengerCruise ? 0.08 : 0.28);

  const takeoffRollReady = playerPlane.position.z > -100;
  if (state.phase === "takeoff" && state.speed > 92 && takeoffRollReady) {
    state.altitude += (state.speed - 88) * dt * 0.42 + Math.max(0, state.yokeY) * dt * 16;
    if (state.altitude > 8) {
      state.phase = "airborne";
      if (state.international) {
        state.route = "landing";
        rebuildRouteLights();
        routeLabel.textContent = `国际航班：沿绿色灯线飞往${currentDestinationAirportName()}降落跑道`;
      } else {
        routeLabel.textContent = "空中：可以拖动屏幕看四周，点降落导航飞往另一个机场。";
      }
      missionTitle.textContent = "已经起飞";
      playTakeoffWhoosh();
      addLog("机头抬起，飞机离地飞上去了。");
      if (state.autoTakeoffOnly) {
        state.autoTakeoffOnly = false;
        setAutopilot(false);
        routeLabel.textContent = `自由飞行：外面是城市和地球场景，降落导航会去${currentDestinationAirportName()}跑道。`;
        statusText.textContent = "已经自动起飞，现在交给你控制。可以飞出机场外面，看地球上的山脉、河流、高楼和夜景，也可以一直爬升到太空边缘。";
        addLog("自动起飞完成，玩家接管自由飞行。");
      }
    }
  } else if (state.phase === "takeoff" && state.speed > 92 && !takeoffRollReady) {
    state.altitude = 0;
    statusText.textContent = state.autopilot
      ? `${autopilotActorName()}正在继续沿绿色灯线滑行，跑道距离够了才会自动抬头。`
      : "速度够了，但跑道还没滑够长。继续沿绿色灯线往前跑，过了中段才会抬头。";
  } else if (state.phase === "airborne") {
    state.altitude += state.yokeY * dt * 28;
    state.altitude = THREE.MathUtils.clamp(state.altitude, 8, 900);
  } else if (state.phase === "landing") {
    const descent = state.yokeY < 0 ? 26 : 10;
    state.altitude -= descent * dt;
    if (state.yokeY > 0.25) state.altitude += state.yokeY * 14 * dt;
    state.altitude = Math.max(0, state.altitude);
  } else if (state.phase === "emergency") {
    const glideBonus = state.engineOff ? 1 : 0;
    const baseDescent = state.engineOff ? 1 : 4.4;
    if (state.engineOff) state.glideTimeLeft = Math.max(0, state.glideTimeLeft - dt);
    state.altitude -= baseDescent * dt;
    if (state.yokeY > 0.2) state.altitude += (state.yokeY * (4.2 + glideBonus * 2.4)) * dt;
    if (state.yokeY < -0.2) state.altitude += state.yokeY * 5.2 * dt;
    if (state.glideTimeLeft <= 0 && state.altitude > 4) state.altitude -= 5.5 * dt;
    state.altitude = Math.max(0, state.altitude);
  } else if (state.phase === "water-skimming") {
    state.waterLandingTime += dt;
    state.altitude = 0;
    state.yokeX *= 0.82;
    state.yokeY *= 0.82;
    state.speed = Math.max(0, state.speed - dt * 9.5);
    state.heading = THREE.MathUtils.lerp(state.heading, state.waterLandingHeading, 1 - Math.exp(-dt * 2.8));
    playerPlane.rotation.z = THREE.MathUtils.lerp(playerPlane.rotation.z, 0, 1 - Math.exp(-dt * 5));
    if (state.waterLandingTime > state.waterLandingDuration || state.speed < 7) {
      emergencyLandSuccess("水面");
      return;
    }
  } else if (ground) {
    state.altitude = 0;
  }

  playerPlane.position.y = state.phase === "water-skimming" ? 0.76 : 0.62 + state.altitude * 0.22;
  let nosePitch = 0;
  if (state.altitude > 1 || state.phase === "takeoff") {
    const commandedPitch = -state.yokeY * 0.18;
    const takeoffLiftPitch = state.phase === "takeoff" && state.speed > 82 && takeoffRollReady ? -0.16 : 0;
    const cruisePitch = state.phase === "airborne" ? -0.07 : 0;
    const landingPitch = state.phase === "landing" ? 0.04 : state.phase === "emergency" ? 0.07 : 0;
    nosePitch = THREE.MathUtils.clamp(commandedPitch + takeoffLiftPitch + cruisePitch + landingPitch, -0.32, 0.18);
    if (passengerCruise) {
      const steadyPitch = state.phase === "takeoff" && state.speed > 82 && takeoffRollReady ? -0.08 : state.phase === "landing" ? 0.02 : -0.025;
      nosePitch = THREE.MathUtils.lerp(nosePitch, steadyPitch, 0.62);
    }
  } else if (state.phase === "water-skimming") {
    nosePitch = 0.012 + Math.sin(state.waterLandingTime * 6) * 0.004;
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

  if (state.phase === "emergency" && state.altitude <= 0.2) {
    if (state.emergencyAutopilotMode === "water" || state.passengerAccidentTarget === "water" || isOverWater()) startWaterLandingSequence();
    else emergencyLandSuccess("地面");
  }

  if (!["emergency", "water-skimming"].includes(state.phase)) checkHazardCollisions();

  if (!["airborne", "landing", "emergency", "water-skimming"].includes(state.phase) && (playerPlane.position.x < -160 || playerPlane.position.x > 220 || playerPlane.position.z < -300 || playerPlane.position.z > 1010)) {
    crash("飞出两个机场的超大范围，看不见跑道了，任务失败。");
  }
}

function updateCamera() {
  if (state.twinTowerDemo) {
    const testTarget = new THREE.Vector3(160, 72, 530);
    const testCamera = new THREE.Vector3(34, 126, 242);
    camera.position.lerp(testCamera, 0.08);
    camera.lookAt(testTarget);
    return;
  }
  if (isCabinLookMode()) {
    if (state.passengerCabinViewMode > 0) {
      const cabinTarget = getPlaneLocalWorldPoint(state.passengerCabinX, 1.62 + state.cameraPitch * 0.6, state.passengerCabinZ);
      const baseAngles = [0, Math.PI / 2, -Math.PI / 2, Math.PI];
      const angle = baseAngles[state.passengerCabinViewMode] + state.cameraYaw * 0.45;
      const radius = state.passengerCabinViewMode === 3 ? 4.8 : 3.9;
      const height = 2.18 + state.cameraPitch * 1.2;
      const cabinCamera = getPlaneLocalWorldPoint(
        state.passengerCabinX + Math.sin(angle) * radius,
        height,
        state.passengerCabinZ + Math.cos(angle) * radius
      );
      camera.position.copy(cabinCamera);
      camera.lookAt(cabinTarget);
      return;
    }
    const cabinCamera = getPlaneLocalWorldPoint(state.passengerCabinX, 1.86, state.passengerCabinZ + 0.18);
    const pitch = THREE.MathUtils.clamp(state.cameraPitch, -0.95, 0.9);
    const level = Math.cos(pitch);
    const lookLocalX = state.passengerCabinX + Math.sin(state.cameraYaw) * level * 3.2;
    const lookLocalY = 1.86 + Math.sin(pitch) * 2.2;
    const lookLocalZ = state.passengerCabinZ + 0.18 - Math.cos(state.cameraYaw) * level * 3.2;
    const cabinTarget = getPlaneLocalWorldPoint(lookLocalX, lookLocalY, lookLocalZ);
    camera.position.copy(cabinCamera);
    camera.lookAt(cabinTarget);
    return;
  }
  if (state.evacuationActive && state.evacuationSurface === "水面") {
    const target = playerPlane.position.clone().add(new THREE.Vector3(6, 2.4, -3));
    const rescueCamera = playerPlane.position.clone().add(new THREE.Vector3(44, 28, -48));
    camera.position.lerp(rescueCamera, 0.08);
    camera.lookAt(target);
    return;
  }
  if (state.evacuationActive && state.evacuationSurface === "地面") {
    const target = playerPlane.position.clone().add(new THREE.Vector3(0, 2.2, 0));
    const rescueCamera = playerPlane.position.clone().add(new THREE.Vector3(24, 16, -26));
    camera.position.lerp(rescueCamera, 0.08);
    camera.lookAt(target);
    return;
  }
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
  altitudeText.textContent = state.altitude > spaceAltitude ? `${Math.round(state.altitude * 10)} m · 太空边缘` : `${Math.round(state.altitude * 10)} m`;
  gearText.textContent = state.gear < 0.62 ? "Down" : "Up";
  airlineText.textContent = airlines[state.airlineIndex].short;
  if (!state.crashed && !state.landed) {
    const phaseText = {
      taxi: "滑行中",
      takeoff: "起飞加速",
      airborne: "空中飞行",
      landing: "降落中",
      emergency: state.engineOff ? `滑翔迫降 · ${Math.ceil(state.glideTimeLeft / 60)} 分钟` : "引擎着火",
      "water-skimming": "水上滑行减速",
      "passenger-boarding": "乘客最后登机",
      "passenger-ready": "已经坐进飞机",
      "arrival-taxi": "到达滑行",
      "gate-docking": "登机桥对接",
      "tower-test": "双塔测试"
    }[state.phase] || "飞行中";
    missionTitle.textContent = phaseText;
  }
}

function tick() {
  const dt = Math.min(0.04, clock.getDelta());
  if (state.twinTowerDemo) {
    updateTwinTowerTest(dt);
  } else {
    updateControlsFromInputs();
    updateAutopilot();
    updatePhysics(dt);
  }
  updateArrivalTaxi(dt);
  updateGateDocking(dt);
  updateExplosion(dt);
  updateEngineFire(dt);
  updateWaterSplash(dt);
  updateEvacuation(dt);
  updateWorldAtmosphere();
  updateFlightSound();
  updateHud();
  updateCamera();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}

function setYokeKnobPosition(xValue, yValue) {
  const x = xValue * 44;
  const y = yValue * 44;
  yokeKnob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  mobileKnob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

function updateYokeKnob() {
  setYokeKnobPosition(state.yokeX, state.yokeY);
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
    const inputX = THREE.MathUtils.clamp((dx * scale) / limit, -1, 1);
    const inputY = THREE.MathUtils.clamp((dy * scale) / limit, -1, 1);
    if (isCabinLookMode()) {
      state.cabinMoveX = inputX;
      state.cabinMoveY = inputY;
      setYokeKnobPosition(inputX, inputY);
      return;
    }
    state.yokeX = inputX;
    state.yokeY = inputY;
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
    state.cabinMoveX = 0;
    state.cabinMoveY = 0;
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
  const dragSurface = simPanel || canvas;
  const shouldSkipCameraDrag = (event) => Boolean(event.target.closest("button, a, input, .mobile-yoke, .flight-lobby, .emergency-choice"));
  dragSurface.addEventListener("pointerdown", (event) => {
    if (shouldSkipCameraDrag(event)) return;
    active = true;
    lastX = event.clientX;
    lastY = event.clientY;
    dragSurface.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });
  dragSurface.addEventListener("pointermove", (event) => {
    if (!active) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    const cabinLookMode = isCabinLookMode();
    state.cameraYaw -= dx * (cabinLookMode ? 0.011 : 0.006);
    state.cameraPitch = THREE.MathUtils.clamp(
      state.cameraPitch + dy * (cabinLookMode ? 0.007 : 0.004),
      cabinLookMode ? -0.95 : -0.45,
      cabinLookMode ? 0.9 : 0.55
    );
    lastX = event.clientX;
    lastY = event.clientY;
    event.preventDefault();
  });
  const end = () => { active = false; };
  dragSurface.addEventListener("pointerup", end);
  dragSurface.addEventListener("pointercancel", end);
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
  engineFireBtn.addEventListener("click", startEngineFireEmergency);
  engineOffBtn.addEventListener("click", shutEngine);
  autopilotBtn.addEventListener("click", toggleAutopilot);
  passengerModeBtn.addEventListener("click", startPassengerMode);
  passengerNormalBtn.addEventListener("click", startPassengerNormalFlight);
  passengerAccidentWaterBtn.addEventListener("click", () => startPassengerAccident("water"));
  passengerAccidentGroundBtn.addEventListener("click", () => startPassengerAccident("ground"));
  oxygenMaskBtn.addEventListener("click", putOnOxygenMask);
  lifeJacketBtn.addEventListener("click", putOnPassengerLifeJacket);
  emergencyExitBtn.addEventListener("click", () => openEmergencyExitAndSlide(false));
  doorBtn.addEventListener("click", togglePlaneDoor);
  waterAutopilotBtn.addEventListener("click", () => startEmergencyAutopilot("water"));
  groundAutopilotBtn.addEventListener("click", () => startEmergencyAutopilot("ground"));
  closeEmergencyChoiceBtn.addEventListener("click", closeEmergencyChoice);
  emergencyChoice.addEventListener("click", (event) => {
    if (event.target === emergencyChoice) closeEmergencyChoice();
  });
  document.querySelector("#brakeBtn").addEventListener("click", brake);
  document.querySelector("#demoCrashBtn").addEventListener("click", demoCrash);
  document.querySelector("#twinTowerBtn").addEventListener("click", startTwinTowerTest);
  document.querySelector("#cameraBtn").addEventListener("click", () => {
    if (isCabinLookMode()) {
      state.passengerCabinViewMode = (state.passengerCabinViewMode + 1) % 4;
      state.cameraYaw = 0;
      state.cameraPitch = 0.12;
      const cabinNames = ["客舱里面看", "左侧外面看进去", "右侧外面看进去", "门口后面看进去"];
      statusText.textContent = `客舱视角：${cabinNames[state.passengerCabinViewMode]}。也可以继续拖动屏幕调整角度。`;
      return;
    }
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
