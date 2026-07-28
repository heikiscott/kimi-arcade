import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const canvas = document.querySelector("#threeCanvas");
const placeName = document.querySelector("#placeName");
const flightState = document.querySelector("#flightState");
const placeSelect = document.querySelector("#placeSelect");
const styleSelect = document.querySelector("#styleSelect");
const airportSelect = document.querySelector("#airportSelect");
const moveStick = document.querySelector("#moveStick");
const moveKnob = document.querySelector("#moveKnob");
const studentScores = document.querySelector("#studentScores");
const buttons = {
  start: document.querySelector("#startBtn"),
  park: document.querySelector("#parkBtn"),
  lobby: document.querySelector("#lobbyBtn"),
  tour: document.querySelector("#tourBtn"),
  shenzhen: document.querySelector("#shenzhenBtn"),
  doublePlane: document.querySelector("#doublePlaneBtn"),
  parkPlane: document.querySelector("#parkPlaneBtn"),
  worldWindow: document.querySelector("#worldWindowBtn"),
  elevatorUp: document.querySelector("#elevatorUpBtn"),
  elevatorDown: document.querySelector("#elevatorDownBtn"),
  towerTop: document.querySelector("#towerTopBtn"),
  ferris: document.querySelector("#ferrisBtn"),
  accidentRide: document.querySelector("#accidentRideBtn"),
  selectPlane: document.querySelector("#selectPlaneBtn"),
  board: document.querySelector("#boardBtn"),
  cockpit: document.querySelector("#cockpitBtn"),
  cabinWalk: document.querySelector("#cabinWalkBtn"),
  deck: document.querySelector("#deckBtn"),
  taxi: document.querySelector("#taxiBtn"),
  takeoff: document.querySelector("#takeoffBtn"),
  metroRide: document.querySelector("#metroRideBtn"),
  land: document.querySelector("#landBtn"),
  exit: document.querySelector("#exitBtn"),
  reset: document.querySelector("#resetBtn"),
  walk: document.querySelector("#walkBtn"),
  jump: document.querySelector("#jumpBtn"),
  ball: document.querySelector("#ballBtn"),
  expression: document.querySelector("#expressionBtn"),
  screenWalk: document.querySelector("#screenWalkBtn"),
  screenJump: document.querySelector("#screenJumpBtn"),
  screenBall: document.querySelector("#screenBallBtn"),
  screenExpression: document.querySelector("#screenExpressionBtn"),
  classScore: document.querySelector("#classScoreBtn"),
  meScore: document.querySelector("#meScoreBtn")
};

const styleData = {
  china: { name: "中国风格机场", ground: 0x76bd72, accent: 0xd8343f, second: 0xffd15f },
  usa: { name: "美国风格机场", ground: 0x77bd77, accent: 0x5f6f7a, second: 0xd8343f },
  uk: { name: "英国风格机场", ground: 0x70b86d, accent: 0xc8323c, second: 0xffffff },
  egypt: { name: "埃及风格机场", ground: 0xd8b46f, accent: 0xd49b43, second: 0xffe2a3 },
  southAfrica: { name: "南非风格机场", ground: 0xa9bf62, accent: 0xf2b44b, second: 0x356b4a },
  japan: { name: "日本风格机场", ground: 0x79c17c, accent: 0xf06aa3, second: 0xffffff },
  germany: { name: "德国风格机场", ground: 0x73bd73, accent: 0x172632, second: 0xffd15f },
  thailand: { name: "泰国风格机场", ground: 0x86c86e, accent: 0x7b4ab8, second: 0xffd15f },
  france: { name: "法国风格机场", ground: 0x78c07b, accent: 0x2f79c8, second: 0xffffff },
  uae: { name: "阿联酋风格机场", ground: 0xd8bd78, accent: 0x2f79c8, second: 0xffd15f },
  australia: { name: "澳大利亚风格机场", ground: 0x82c36b, accent: 0xf2b44b, second: 0x2f79c8 },
  korea: { name: "韩国风格机场", ground: 0x83c77e, accent: 0xd8343f, second: 0x2f79c8 },
  india: { name: "印度风格机场", ground: 0x8bc66e, accent: 0xf28b2f, second: 0x38a86a },
  brazil: { name: "巴西风格机场", ground: 0x73c96b, accent: 0xffd15f, second: 0x2f79c8 },
  canada: { name: "加拿大风格机场", ground: 0x7cc171, accent: 0xd8343f, second: 0xffffff }
};

const airportLocations = [
  ["新加坡", "樟宜机场", "SIN", "china"], ["中国", "北京首都机场", "PEK", "china"], ["中国", "上海浦东机场", "PVG", "china"], ["中国", "香港国际机场", "HKG", "china"], ["中国", "深圳宝安国际机场", "SZX", "china"], ["中国", "昆明长水机场", "KMG", "china"],
  ["日本", "东京羽田机场", "HND", "japan"], ["日本", "成田机场", "NRT", "japan"], ["日本", "关西机场", "KIX", "japan"], ["韩国", "仁川机场", "ICN", "korea"], ["泰国", "曼谷素万那普机场", "BKK", "thailand"],
  ["德国", "法兰克福机场", "FRA", "germany"], ["德国", "慕尼黑机场", "MUC", "germany"], ["英国", "伦敦希思罗机场", "LHR", "uk"], ["法国", "巴黎戴高乐机场", "CDG", "france"], ["荷兰", "阿姆斯特丹史基浦机场", "AMS", "germany"],
  ["美国", "洛杉矶机场", "LAX", "usa"], ["美国", "纽约肯尼迪机场", "JFK", "usa"], ["美国", "西雅图机场", "SEA", "usa"], ["美国", "旧金山机场", "SFO", "usa"], ["美国", "芝加哥机场", "ORD", "usa"],
  ["加拿大", "温哥华机场", "YVR", "canada"], ["加拿大", "多伦多机场", "YYZ", "canada"], ["阿联酋", "迪拜机场", "DXB", "uae"], ["卡塔尔", "多哈机场", "DOH", "uae"], ["印度", "德里机场", "DEL", "india"],
  ["印度", "孟买机场", "BOM", "india"], ["澳大利亚", "悉尼机场", "SYD", "australia"], ["澳大利亚", "墨尔本机场", "MEL", "australia"], ["新西兰", "奥克兰机场", "AKL", "australia"], ["埃及", "开罗机场", "CAI", "egypt"],
  ["南非", "约翰内斯堡机场", "JNB", "southAfrica"], ["巴西", "圣保罗机场", "GRU", "brazil"], ["巴西", "里约机场", "GIG", "brazil"], ["墨西哥", "墨西哥城机场", "MEX", "usa"], ["土耳其", "伊斯坦布尔机场", "IST", "germany"],
  ["西班牙", "马德里机场", "MAD", "france"], ["意大利", "罗马机场", "FCO", "france"], ["瑞士", "苏黎世机场", "ZRH", "germany"], ["奥地利", "维也纳机场", "VIE", "germany"], ["芬兰", "赫尔辛基机场", "HEL", "germany"],
  ["马来西亚", "吉隆坡机场", "KUL", "thailand"], ["印尼", "雅加达机场", "CGK", "thailand"], ["越南", "胡志明机场", "SGN", "thailand"], ["菲律宾", "马尼拉机场", "MNL", "thailand"], ["沙特", "吉达机场", "JED", "uae"],
  ["摩洛哥", "卡萨布兰卡机场", "CMN", "egypt"], ["肯尼亚", "内罗毕机场", "NBO", "southAfrica"], ["阿根廷", "布宜诺斯艾利斯机场", "EZE", "brazil"], ["智利", "圣地亚哥机场", "SCL", "brazil"], ["葡萄牙", "里斯本机场", "LIS", "france"]
].map(([country, airport, code, style], index) => ({ country, airport, code, style, index }));

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaee7ff);
scene.fog = new THREE.Fog(0xaee7ff, 160, 470);

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 900);
camera.position.set(-16, 15, 26);

const hemi = new THREE.HemisphereLight(0xffffff, 0x5b7055, 1.25);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, 2.4);
sun.position.set(-42, 72, 34);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -130;
sun.shadow.camera.right = 130;
sun.shadow.camera.top = 130;
sun.shadow.camera.bottom = -130;
scene.add(sun);

const state = {
  keys: new Set(),
  stick: new THREE.Vector2(0, 0),
  mode: "walk",
  currentPlace: "airport",
  airportStyle: "china",
  yaw: -0.45,
  pitch: -0.24,
  cameraYaw: -0.7,
  cameraPitch: 0.22,
  cameraDistance: 29,
  cameraDragging: false,
  speed: 0,
  planeT: 0,
  walkClock: 0,
  jumpVelocity: 0,
  ballMode: false,
  expressionIndex: 0,
  ridingWheel: false,
  wheelT: 0,
  jetpackTimer: 0,
  tourIndex: 0,
  tourTimer: 0,
  flightMeters: 0,
  boardingT: 0,
  boardingFrom: new THREE.Vector3(),
  destinationIndex: 12,
  selectedAirportIndex: 0,
  selectedPlaneIndex: 0,
  inCockpit: false,
  cabinView: false,
  cabinDeck: 1,
  cabinLocal: new THREE.Vector3(0.25, 0.46, 0),
  cabinMotionMode: "boarded",
  autoPilot: false,
  amusementAccident: false,
  amusementAccidentT: 0,
  metroT: 0,
  metroPhase: "waiting",
  metroDoorsOpen: true,
  challengeToolCooldown: 0
  ,
  worldWindowLevel: 1,
  worldWindowTargetLevel: 1,
  shenzhenTicket: false,
  shenzhenHotel: false,
  shenzhenPlaneType: "double",
  landmarkIndex: 0,
  insideLandmark: false,
  waterRide: false,
  waterRideT: 0
};

const students = [
  { name: "我", score: 0 },
  { name: "同学1", score: 0 },
  { name: "同学2", score: 0 },
  { name: "同学3", score: 0 },
  { name: "同学4", score: 0 }
];
let classScoreUsed = false;

const teddyExpressions = ["开心", "惊讶", "酷酷", "眨眼"];

const tourCountries = [
  { key: "japan", name: "日本", title: "日本环游", intro: "现在到日本：能看到樱花树、鸟居和东京塔样子的高塔。" },
  { key: "egypt", name: "埃及", title: "埃及环游", intro: "现在到埃及：金字塔、狮身人面像和沙漠机场就在下面。" },
  { key: "usa", name: "美国", title: "美国环游", intro: "现在到美国：高楼、星条旗航站楼和很宽的城市道路。" },
  { key: "uk", name: "英国", title: "英国环游", intro: "现在到英国：钟楼、红色巴士和英伦风格建筑。" },
  { key: "china", name: "中国", title: "中国环游", intro: "现在到中国：红色屋顶、灯笼、高楼和宽阔广场。" },
  { key: "southAfrica", name: "南非", title: "南非环游", intro: "现在到南非：桌山、草原树和金色大地。" },
  { key: "germany", name: "德国", title: "德国环游", intro: "现在到德国：黑红金色标志和欧洲航站楼。" },
  { key: "thailand", name: "泰国", title: "泰国环游", intro: "现在到泰国：金色屋顶和紫金色机场。" },
  { key: "france", name: "法国", title: "法国环游", intro: "现在到法国：铁塔、蓝白红和巴黎机场。" },
  { key: "uae", name: "阿联酋", title: "阿联酋环游", intro: "现在到阿联酋：沙漠机场、高塔和金色阳光。" },
  { key: "australia", name: "澳大利亚", title: "澳大利亚环游", intro: "现在到澳大利亚：白色帆形建筑和海港机场。" },
  { key: "korea", name: "韩国", title: "韩国环游", intro: "现在到韩国：红蓝圆形标志和现代机场。" },
  { key: "india", name: "印度", title: "印度环游", intro: "现在到印度：橙绿配色、拱门和热闹航站楼。" },
  { key: "brazil", name: "巴西", title: "巴西环游", intro: "现在到巴西：绿色山丘、金色标志和大城市机场。" },
  { key: "canada", name: "加拿大", title: "加拿大环游", intro: "现在到加拿大：红色枫叶、雪白航站楼和高塔。" }
];

const destinationAirports3d = airportLocations.map((airport) => ({
  key: airport.style,
  name: airport.airport,
  intro: `到达${airport.country}${airport.airport}（${airport.code}）：机场风格切换成${styleData[airport.style].name}。`
}));

const planeOptions = [
  { model: "B737-800", airlineCn: "中国南方航空", airlineEn: "CHINA SOUTHERN", nativeText: "中国南方航空", short: "南航", tailMark: "CZ", reg: "B-5762", color: 0x1f57b8, tailColor: 0x174aa8, accent: 0xd8343f, deck: "单层", position: [-46, 0.55, 20], scale: 1.04 },
  { model: "A320", airlineCn: "中国东方航空", airlineEn: "CHINA EASTERN", nativeText: "中国东方航空", short: "东航", tailMark: "MU", reg: "B-6220", color: 0xd8343f, tailColor: 0xd8343f, accent: 0x2f79c8, deck: "单层", position: [-34, 0.55, 20], scale: 1.0 },
  { model: "B787", airlineCn: "中国国际航空", airlineEn: "AIR CHINA", nativeText: "中国国际航空", short: "国航", tailMark: "CA", reg: "B-2487", color: 0xd8343f, tailColor: 0xb91f2d, accent: 0xffd15f, deck: "单层", position: [-22, 0.55, 20], scale: 1.02 },
  { model: "B777", airlineCn: "美国航空", airlineEn: "AMERICAN AIRLINES", nativeText: "AMERICAN", short: "美国", tailMark: "AA", reg: "N777AA", color: 0x2f79c8, tailColor: 0x245b8f, accent: 0xd8343f, deck: "单层", position: [-10, 0.55, 20], scale: 1.04 },
  { model: "B787", airlineCn: "日本航空", airlineEn: "JAPAN AIRLINES", nativeText: "日本航空", short: "日航", tailMark: "JAL", reg: "JA787J", color: 0xd8343f, tailColor: 0xffffff, accent: 0x172632, deck: "单层", position: [2, 0.55, 20], scale: 1.02 },
  { model: "A350", airlineCn: "新加坡航空", airlineEn: "SINGAPORE AIRLINES", short: "新航", tailMark: "SQ", reg: "9V-SMA", color: 0x1b3f8b, tailColor: 0x1b3f8b, accent: 0xffd15f, deck: "单层", position: [14, 0.55, 20], scale: 1.02 },
  { model: "A380", airlineCn: "阿联酋航空", airlineEn: "EMIRATES", short: "阿联酋", tailMark: "EK", reg: "A6-EKA", color: 0xd8343f, tailColor: 0x1f8c4d, accent: 0xffd15f, deck: "双层", position: [27, 0.66, 20], scale: 1.15, doubleDeck: true },
  { model: "B777", airlineCn: "全日空", airlineEn: "ALL NIPPON AIRWAYS", nativeText: "全日本空輸", short: "ANA", tailMark: "NH", reg: "JA777A", color: 0x2352a1, tailColor: 0x2352a1, accent: 0x8fdcff, deck: "单层", position: [40, 0.55, 20], scale: 1.03 },
  { model: "A350", airlineCn: "国泰航空", airlineEn: "CATHAY PACIFIC", short: "国泰", tailMark: "CX", reg: "B-LRA", color: 0x0f766e, tailColor: 0x0f766e, accent: 0xf5f1df, deck: "单层", position: [52, 0.55, 20], scale: 1.02 },
  { model: "A330", airlineCn: "泰国航空", airlineEn: "THAI AIRWAYS", nativeText: "การบินไทย", short: "泰航", tailMark: "TG", reg: "HS-TGA", color: 0x6a3fad, tailColor: 0x6a3fad, accent: 0xffd15f, deck: "单层", position: [64, 0.55, 20], scale: 1.0 },
  { model: "A319", airlineCn: "西藏航空", airlineEn: "TIBET AIRLINES", nativeText: "西藏航空  བོད་ལྗོངས་མཁའ་ལམ", short: "西藏", tailMark: "TV", reg: "B-6420", color: 0x9b2f2f, tailColor: 0x9b2f2f, accent: 0xffd15f, deck: "单层", position: [76, 0.55, 20], scale: 1.0 },
  { model: "A350", airlineCn: "法国航空", airlineEn: "AIR FRANCE", nativeText: "AIR FRANCE  France", short: "法航", tailMark: "AF", reg: "F-HSZX", color: 0x2457a6, tailColor: 0x2457a6, accent: 0xd8343f, deck: "单层", position: [88, 0.55, 20], scale: 1.02 },
  { model: "A380-SZX", airlineCn: "深圳世界之窗号", airlineEn: "WINDOW OF THE WORLD", nativeText: "深圳世界之窗号", short: "世界之窗", tailMark: "WOW", reg: "SZX-336", color: 0x2f79c8, tailColor: 0xd8343f, accent: 0xffd15f, deck: "双层", position: [101, 0.68, 20], scale: 1.18, doubleDeck: true },
  { model: "A380-FUN", airlineCn: "游乐园飞机", airlineEn: "AMUSEMENT AIR", nativeText: "游乐园飞机", short: "乐园飞机", tailMark: "FUN", reg: "FUN-777", color: 0xf06aa3, tailColor: 0x8f5fd9, accent: 0xffd15f, deck: "双层+游乐园", position: [115, 0.7, 20], scale: 1.22, doubleDeck: true }
];

const PLANE_GROUND_Y = 1.15;
const PLANE_AIR_MIN_Y = 8.5;
const EGGY_STAND_OFFSET = 1.1;

const world = new THREE.Group();
scene.add(world);

const eggy = createEggy();
eggy.position.set(-18, 1.05, 32);
scene.add(eggy);
applyTeddyExpression();

let plane = createAirliner(planeOptions[0].color, planeOptions[0].model, planeOptions[0]);
plane.position.set(...planeOptions[0].position);
plane.scale.setScalar(planeOptions[0].scale);
plane.rotation.y = Math.PI / 2;
scene.add(plane);

const clouds = new THREE.Group();
scene.add(clouds);
createClouds();

let styleObjects = new THREE.Group();
world.add(styleObjects);
let airportObjects = new THREE.Group();
world.add(airportObjects);
let challengePlatforms = [];
let challengeDangerZones = [];
let metroTrainGroup = null;
let metroDoorGroup = null;
let platformDoorGroup = null;
let exitGate = null;
let ferrisWheelGroup = null;
let amusementAccidentPlane = null;
let shenzhenElevatorCar = null;
let shenzhenCenterElevatorCar = null;
let shenzhenLiftLabel = null;
let waterRaft = null;
let waterRidePath = [];
let landmarkDoorMarkers = [];
buildCurrentPlace();

function currentAirport() {
  return airportLocations[state.selectedAirportIndex] || airportLocations[0];
}

function destinationAirport() {
  return airportLocations[state.destinationIndex] || airportLocations[1] || airportLocations[0];
}

function airportTitle() {
  const airport = currentAirport();
  return `${airport.country} · ${airport.airport} (${airport.code})`;
}

function destinationTitle() {
  const airport = destinationAirport();
  return `${airport.country} · ${airport.airport} (${airport.code})`;
}

function populateAirportSelect() {
  if (!airportSelect) return;
  airportSelect.innerHTML = airportLocations
    .map((airport, index) => `<option value="${index}">降落 ${String(index + 1).padStart(2, "0")} ${airport.country} · ${airport.airport} (${airport.code})</option>`)
    .join("");
  airportSelect.value = String(state.destinationIndex);
}

function applyAirportLocation(index) {
  const nextIndex = Number(index) || 0;
  state.destinationIndex = nextIndex === state.selectedAirportIndex ? (nextIndex + 1) % airportLocations.length : nextIndex;
  const airport = destinationAirport();
  if (airportSelect) airportSelect.value = String(state.destinationIndex);
  if (state.currentPlace !== "airport") {
    setPlace("airport");
    return;
  }
  buildAirport();
  applyAirportStyle(state.airportStyle);
  setStatus(`出发地不变：${airportTitle()}。降落目的地改成：${destinationTitle()}。飞够 300000 米就会到那里。`);
}

function mat(color, roughness = 0.78) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

function transparentMat(color, opacity = 0.46, roughness = 0.45) {
  return new THREE.MeshStandardMaterial({ color, roughness, transparent: true, opacity, side: THREE.DoubleSide });
}

function box(w, h, d, color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cyl(r1, r2, h, color, radial = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, radial), mat(color));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function strutBetween(start, end, radius, color) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const mid = from.clone().lerp(to, 0.5);
  const length = from.distanceTo(to);
  const mesh = cyl(radius, radius, length, color, 14);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
  return mesh;
}

function sphere(r, color, sx = 1, sy = 1, sz = 1) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 18), mat(color));
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createEggy() {
  const group = new THREE.Group();
  const fur = 0x9b6434;
  const inner = 0xf0c18a;
  const body = sphere(1.05, fur, 0.92, 1.12, 0.78);
  body.name = "body";
  body.position.y = -0.05;
  group.add(body);

  const belly = sphere(0.62, inner, 0.86, 0.72, 0.14);
  belly.position.set(0, -0.12, 0.73);
  group.add(belly);

  const head = sphere(0.86, fur, 1.02, 0.96, 0.9);
  head.position.set(0, 1.05, 0.02);
  group.add(head);

  const leftEar = sphere(0.28, fur, 0.95, 1, 0.72);
  leftEar.position.set(-0.56, 1.72, 0);
  const rightEar = sphere(0.28, fur, 0.95, 1, 0.72);
  rightEar.position.set(0.56, 1.72, 0);
  const leftInnerEar = sphere(0.16, 0xf6a5c9, 0.9, 1, 0.12);
  leftInnerEar.position.set(-0.56, 1.72, 0.22);
  const rightInnerEar = sphere(0.16, 0xf6a5c9, 0.9, 1, 0.12);
  rightInnerEar.position.set(0.56, 1.72, 0.22);
  group.add(leftEar, rightEar, leftInnerEar, rightInnerEar);

  const muzzle = sphere(0.38, inner, 1.12, 0.72, 0.22);
  muzzle.position.set(0, 0.92, 0.74);
  group.add(muzzle);

  const leftEye = sphere(0.08, 0x172632);
  leftEye.position.set(-0.29, 1.16, 0.82);
  const rightEye = sphere(0.08, 0x172632);
  rightEye.position.set(0.29, 1.16, 0.82);
  const leftSpark = sphere(0.025, 0xffffff);
  leftSpark.position.set(-0.255, 1.19, 0.88);
  const rightSpark = sphere(0.025, 0xffffff);
  rightSpark.position.set(0.325, 1.19, 0.88);
  group.add(leftEye, rightEye, leftSpark, rightSpark);

  const leftBrow = box(0.28, 0.045, 0.04, 0x172632);
  leftBrow.position.set(-0.29, 1.34, 0.83);
  const rightBrow = box(0.28, 0.045, 0.04, 0x172632);
  rightBrow.position.set(0.29, 1.34, 0.83);
  group.add(leftBrow, rightBrow);

  const nose = sphere(0.105, 0x172632, 1.15, 0.8, 0.78);
  nose.position.set(0, 0.99, 0.97);
  const mouth = box(0.34, 0.048, 0.045, 0x172632);
  mouth.position.set(0, 0.78, 0.98);
  const openMouth = sphere(0.13, 0x172632, 0.86, 1.15, 0.32);
  openMouth.position.set(0, 0.78, 0.99);
  openMouth.visible = false;
  group.add(nose, mouth, openMouth);

  const leftCheek = sphere(0.09, 0xf06aa3, 1, 0.6, 0.12);
  leftCheek.position.set(-0.45, 0.88, 0.87);
  const rightCheek = sphere(0.09, 0xf06aa3, 1, 0.6, 0.12);
  rightCheek.position.set(0.45, 0.88, 0.87);
  group.add(leftCheek, rightCheek);

  group.userData.leftArm = cyl(0.16, 0.18, 0.84, fur);
  group.userData.rightArm = cyl(0.16, 0.18, 0.84, fur);
  group.userData.leftLeg = cyl(0.19, 0.22, 0.7, fur);
  group.userData.rightLeg = cyl(0.19, 0.22, 0.7, fur);

  group.userData.leftArm.position.set(-0.86, 0.06, 0.04);
  group.userData.rightArm.position.set(0.86, 0.06, 0.04);
  group.userData.leftLeg.position.set(-0.36, -0.94, 0.06);
  group.userData.rightLeg.position.set(0.36, -0.94, 0.06);
  group.userData.leftArm.rotation.z = -0.4;
  group.userData.rightArm.rotation.z = 0.4;
  group.add(group.userData.leftArm, group.userData.rightArm, group.userData.leftLeg, group.userData.rightLeg);

  const jetpack = new THREE.Group();
  const pack = box(0.5, 0.72, 0.22, 0x64717b);
  pack.position.set(0, 0.2, -0.72);
  const jetL = cyl(0.1, 0.12, 0.55, 0xd9e2ea, 18);
  const jetR = cyl(0.1, 0.12, 0.55, 0xd9e2ea, 18);
  jetL.position.set(-0.22, -0.14, -0.86);
  jetR.position.set(0.22, -0.14, -0.86);
  const fireL = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 18), mat(0xffd15f));
  const fireR = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 18), mat(0xffd15f));
  fireL.position.set(-0.22, -0.58, -0.86);
  fireR.position.set(0.22, -0.58, -0.86);
  fireL.rotation.x = Math.PI;
  fireR.rotation.x = Math.PI;
  jetpack.add(pack, jetL, jetR, fireL, fireR);
  jetpack.visible = false;
  group.add(jetpack);

  group.userData.leftEye = leftEye;
  group.userData.rightEye = rightEye;
  group.userData.leftSpark = leftSpark;
  group.userData.rightSpark = rightSpark;
  group.userData.leftBrow = leftBrow;
  group.userData.rightBrow = rightBrow;
  group.userData.mouth = mouth;
  group.userData.openMouth = openMouth;
  group.userData.leftCheek = leftCheek;
  group.userData.rightCheek = rightCheek;
  group.userData.jetpack = jetpack;
  return group;
}

function createAirliner(color, model, options = {}) {
  const group = new THREE.Group();
  const liveryColor = options.color ?? color;
  const tailColor = options.tailColor ?? liveryColor;
  const accent = options.accent ?? liveryColor;
  const airlineText = [options.airlineEn || model, options.nativeText || options.airlineCn || ""].filter(Boolean).join("\n");
  const bodyMat = mat(0xffffff);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.78, 5.8, 12, 28), bodyMat);
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const stripe = box(4.9, 0.08, 0.1, liveryColor);
  stripe.position.set(0.05, 0.12, 0.72);
  const stripeR = stripe.clone();
  stripeR.position.z = -0.72;
  const accentStripe = box(4.5, 0.045, 0.08, accent);
  accentStripe.position.set(0, -0.02, 0.74);
  const accentStripeR = accentStripe.clone();
  accentStripeR.position.z = -0.74;
  group.add(stripe, stripeR, accentStripe, accentStripeR);

  if (options.doubleDeck) {
    const upperStripe = box(3.6, 0.06, 0.08, liveryColor);
    upperStripe.position.set(-0.24, 0.48, 0.62);
    const upperStripeR = upperStripe.clone();
    upperStripeR.position.z = -0.62;
    group.add(upperStripe, upperStripeR);
  }

  const nose = sphere(0.52, 0xd9e2ea, 1, 0.42, 0.08);
  nose.position.set(3.15, 0.16, 0.62);
  group.add(nose);

  const wingLeft = taperedWing(0xf5f7fa, -1);
  const wingRight = taperedWing(0xf5f7fa, 1);
  const wingTipL = box(0.2, 0.45, 0.3, tailColor);
  wingTipL.position.set(1.23, 0.18, -3.72);
  wingTipL.rotation.z = -0.25;
  const wingTipR = wingTipL.clone();
  wingTipR.position.z = 3.72;
  wingTipR.rotation.z = 0.25;
  group.add(wingLeft, wingRight);
  group.add(wingTipL, wingTipR);

  const tail = taperedTail(tailColor);
  tail.position.x = -3.05;
  group.add(tail);

  const fin = box(0.14, 1.05, 1.0, tailColor);
  fin.position.set(-3.2, 0.88, 0);
  fin.rotation.z = -0.22;
  group.add(fin);

  const engineL = createEngine(liveryColor, accent);
  const engineR = createEngine(liveryColor, accent);
  engineL.position.set(0.1, -0.42, -1.4);
  engineR.position.set(0.1, -0.42, 1.4);
  engineL.rotation.z = Math.PI / 2;
  engineR.rotation.z = Math.PI / 2;
  group.add(engineL, engineR);
  group.add(createLandingGear());

  for (let i = -2.1; i <= 1.8; i += 0.44) {
    const winL = sphere(0.055, 0x64717b, 1, 0.4, 0.08);
    winL.position.set(i, 0.26, 0.7);
    const winR = sphere(0.055, 0x64717b, 1, 0.4, 0.08);
    winR.position.set(i, 0.26, -0.7);
    group.add(winL, winR);
    if (options.doubleDeck && i < 1.25) {
      const upperL = sphere(0.047, 0x64717b, 1, 0.4, 0.08);
      upperL.position.set(i + 0.1, 0.52, 0.64);
      const upperR = sphere(0.047, 0x64717b, 1, 0.4, 0.08);
      upperR.position.set(i + 0.1, 0.52, -0.64);
      group.add(upperL, upperR);
    }
  }

  const leftName = makePlaneText(airlineText, 4.6, 0.44, 26, "#172632");
  leftName.position.set(-0.34, 0.5, 0.83);
  const rightName = makePlaneText(airlineText, 4.6, 0.44, 26, "#172632");
  rightName.position.set(-0.34, 0.5, -0.83);
  rightName.rotation.y = Math.PI;
  const topName = makePlaneText(`${options.short || model} ${model}`, 2.1, 0.44, 28, "#172632");
  topName.position.set(-0.28, 0.86, 0);
  topName.rotation.x = -Math.PI / 2;
  const bellyName = makePlaneText(options.reg || options.short || model, 1.6, 0.32, 24, "#172632");
  bellyName.position.set(-0.45, -0.58, 0);
  bellyName.rotation.x = Math.PI / 2;
  const tailTextColor = tailColor === 0xffffff ? "#d8343f" : "#ffffff";
  const tailLeft = makePlaneText(options.tailMark || options.short || model, 0.7, 0.5, 30, tailTextColor);
  tailLeft.position.set(-3.32, 0.98, 0.57);
  const tailRight = makePlaneText(options.tailMark || options.short || model, 0.7, 0.5, 30, tailTextColor);
  tailRight.position.set(-3.32, 0.98, -0.57);
  tailRight.rotation.y = Math.PI;
  group.add(leftName, rightName, topName, bellyName, tailLeft, tailRight);

  const cabinInterior = createCabinInterior(color, options);
  cabinInterior.visible = false;
  group.userData.cabinInterior = cabinInterior;
  group.add(cabinInterior);

  return group;
}

function createCabinInterior(color, options = {}) {
  const cabin = new THREE.Group();
  const floor = box(4.7, 0.08, 1.25, 0x4f5e68);
  floor.position.set(-0.25, -0.18, 0);
  cabin.add(floor);

  const wallMaterial = transparentMat(0xf5f1df, 0.38);
  const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.9, 0.06), wallMaterial);
  const wallRight = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.9, 0.06), wallMaterial);
  wallLeft.position.set(-0.25, 0.36, -0.72);
  wallRight.position.set(-0.25, 0.36, 0.72);
  cabin.add(wallLeft, wallRight);

  for (let i = 0; i < 8; i += 1) {
    const x = 1.15 - i * 0.48;
    const leftWindow = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.025), transparentMat(0x8fd8ff, 0.72));
    const rightWindow = leftWindow.clone();
    leftWindow.position.set(x, 0.48, -0.755);
    rightWindow.position.set(x, 0.48, 0.755);
    cabin.add(leftWindow, rightWindow);
  }

  const cockpitWall = box(0.12, 1.1, 1.25, 0xd9e2ea);
  cockpitWall.position.set(1.72, 0.44, 0);
  const cockpitDoor = box(0.08, 0.7, 0.36, color);
  cockpitDoor.position.set(1.78, 0.26, 0);
  cabin.add(cockpitWall, cockpitDoor);

  const dashboard = box(0.7, 0.34, 0.95, 0x172632);
  dashboard.position.set(2.45, 0.12, 0);
  cabin.add(dashboard);
  for (let i = 0; i < 5; i += 1) {
    const light = sphere(0.055, i % 2 ? 0x38a86a : 0xffd15f);
    light.position.set(2.84, 0.26, -0.34 + i * 0.17);
    cabin.add(light);
  }

  const pilotSeat = box(0.35, 0.42, 0.36, 0x64717b);
  pilotSeat.position.set(2.02, -0.02, -0.28);
  const copilotSeat = box(0.35, 0.42, 0.36, 0x64717b);
  copilotSeat.position.set(2.02, -0.02, 0.28);
  cabin.add(pilotSeat, copilotSeat);

  const pilotHead = sphere(0.13, 0xffd6b0);
  pilotHead.position.set(2.03, 0.35, -0.28);
  const pilotBody = cyl(0.1, 0.13, 0.35, color, 16);
  pilotBody.position.set(2.03, 0.12, -0.28);
  cabin.add(pilotHead, pilotBody);

  const rows = options.doubleDeck ? 5 : 4;
  for (let row = 0; row < rows; row += 1) {
    const x = 1.0 - row * 0.62;
    [-0.36, 0.36].forEach((z, side) => {
      const seat = box(0.28, 0.36, 0.28, side ? 0xf06aa3 : 0x2f79c8);
      seat.position.set(x, -0.02, z);
      cabin.add(seat);
      const head = sphere(0.095, 0xffd6b0);
      head.position.set(x, 0.28, z);
      cabin.add(head);
    });
  }

  if (options.doubleDeck) {
    const upperFloor = box(3.6, 0.07, 1.12, 0x6f7c86);
    upperFloor.position.set(-0.55, 0.8, 0);
    cabin.add(upperFloor);
    const stair = box(0.6, 0.16, 0.42, 0xffd15f);
    stair.position.set(1.26, 0.32, 0);
    stair.rotation.z = -0.5;
    cabin.add(stair);
    for (let row = 0; row < 4; row += 1) {
      const x = 0.65 - row * 0.58;
      [-0.34, 0.34].forEach((z, side) => {
        const seat = box(0.25, 0.32, 0.25, side ? 0x8f5fd9 : 0x38a86a);
        seat.position.set(x, 0.96, z);
        cabin.add(seat);
      });
      const topLeftWindow = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.025), transparentMat(0x8fd8ff, 0.74));
      const topRightWindow = topLeftWindow.clone();
      topLeftWindow.position.set(x, 1.36, -0.755);
      topRightWindow.position.set(x, 1.36, 0.755);
      cabin.add(topLeftWindow, topRightWindow);
    }
    const deckLabel = makeLabel("二楼客舱");
    deckLabel.scale.setScalar(0.25);
    deckLabel.position.set(-0.62, 1.52, 0);
    deckLabel.rotation.x = -Math.PI / 2;
    cabin.add(deckLabel);
  }

  const cabinLabel = makeLabel(options.doubleDeck ? "双层客舱" : "客舱");
  cabinLabel.scale.setScalar(0.34);
  cabinLabel.position.set(-0.4, 0.82, 0);
  cabinLabel.rotation.x = -Math.PI / 2;
  cabin.add(cabinLabel);
  cabin.userData.bounds = { minX: options.doubleDeck ? -1.95 : -1.75, maxX: 1.22, minZ: -0.46, maxZ: 0.46 };
  return cabin;
}

function createFerrisCabin(color) {
  const cabin = new THREE.Group();
  const floor = box(1.9, 0.16, 1.5, color);
  floor.position.y = -0.55;
  const roof = box(1.9, 0.14, 1.5, color);
  roof.position.y = 0.55;
  cabin.add(floor, roof);
  [-0.82, 0.82].forEach((x) => {
    [-0.58, 0.58].forEach((z) => {
      const post = cyl(0.045, 0.045, 1.1, 0x172632, 12);
      post.position.set(x, 0, z);
      cabin.add(post);
    });
  });
  [-0.55, 0.05, 0.55].forEach((y) => {
    const front = box(1.75, 0.06, 0.06, 0x172632);
    front.position.set(0, y, 0.62);
    const back = box(1.75, 0.06, 0.06, 0x172632);
    back.position.set(0, y, -0.62);
    const left = box(0.06, 0.06, 1.25, 0x172632);
    left.position.set(-0.86, y, 0);
    const right = box(0.06, 0.06, 1.25, 0x172632);
    right.position.set(0.86, y, 0);
    cabin.add(front, back, left, right);
  });
  const seat = box(1.2, 0.22, 0.55, 0xf5f1df);
  seat.position.set(0, -0.18, 0);
  cabin.add(seat);
  cabin.userData.isFerrisCabin = true;
  return cabin;
}

function taperedWing(color, side) {
  const shape = new THREE.Shape();
  shape.moveTo(-0.85, 0);
  shape.lineTo(0.45, side * 4.0);
  shape.lineTo(1.28, side * 3.55);
  shape.lineTo(0.55, 0);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
  const mesh = new THREE.Mesh(geometry, mat(color));
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = -0.05;
  mesh.castShadow = true;
  return mesh;
}

function taperedTail(color) {
  const group = new THREE.Group();
  const left = box(1.15, 0.08, 0.34, color);
  const right = box(1.15, 0.08, 0.34, color);
  left.position.z = -0.82;
  right.position.z = 0.82;
  left.rotation.y = -0.3;
  right.rotation.y = 0.3;
  group.add(left, right);
  return group;
}

function createEngine(color = 0x2f79c8, accent = 0xffd15f) {
  const group = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.58, 32), mat(0xdce5eb));
  shell.castShadow = true;
  shell.receiveShadow = true;
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 24), mat(0x172632));
  fan.position.y = 0.31;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32), mat(color));
  band.position.y = -0.22;
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.035, 32), mat(accent));
  lip.position.y = 0.31;
  group.add(shell, band, lip, fan);
  return group;
}

function createLandingGear() {
  const group = new THREE.Group();
  const wheelMat = mat(0x172632);
  const hubMat = mat(0xd9e2ea);
  const strutMat = mat(0x6f7c86);
  [
    [2.25, -0.8, -0.28, 0.16],
    [2.25, -0.8, 0.28, 0.16],
    [-0.55, -0.78, -0.82, 0.2],
    [-0.55, -0.78, 0.82, 0.2],
    [-1.55, -0.78, -0.68, 0.18],
    [-1.55, -0.78, 0.68, 0.18]
  ].forEach(([x, y, z, r]) => {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 10), strutMat);
    strut.position.set(x, y + 0.2, z);
    strut.castShadow = true;
    group.add(strut);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.12, 24), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    group.add(wheel);
    const hubA = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.45, r * 0.45, 0.125, 16), hubMat);
    hubA.rotation.x = Math.PI / 2;
    hubA.position.set(x, y, z);
    group.add(hubA);
  });
  return group;
}

function makeLabel(text) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 72;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(255,255,255,0)";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#172632";
  g.font = "900 34px system-ui";
  g.textAlign = "center";
  g.fillText(text, c.width / 2, 47);
  const texture = new THREE.CanvasTexture(c);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  return new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.02), material);
}

function makePlaneText(text, width = 2, height = 0.45, fontSize = 28, color = "#172632") {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d");
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = color;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const lines = String(text).trim().split("\n").filter(Boolean).slice(0, 3);
  const lineHeight = lines.length > 1 ? fontSize * 1.08 : fontSize;
  const startY = c.height / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    const size = index === 0 ? fontSize : Math.max(18, fontSize - 5);
    g.font = `900 ${size}px system-ui`;
    g.fillText(line, c.width / 2, startY + index * lineHeight);
  });
  const texture = new THREE.CanvasTexture(c);
  texture.anisotropy = 8;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
}

function buildAirport() {
  airportObjects.clear();
  const airport = currentAirport();
  const style = styleData[state.airportStyle] || styleData[airport.style] || styleData.china;
  const ground = new THREE.Mesh(new THREE.BoxGeometry(220, 1, 145), mat(0x76bd72));
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  ground.name = "ground";
  airportObjects.add(ground);

  const redZone = box(94, 0.06, 38, 0xb9363a);
  redZone.position.set(-24, 0.02, 22);
  redZone.name = "redZone";
  airportObjects.add(redZone);
  const blueShape = new THREE.Shape();
  blueShape.moveTo(0, 0);
  blueShape.absarc(0, 0, 26, -Math.PI / 2, Math.PI / 2, false);
  blueShape.lineTo(0, 0);
  const blueZone = new THREE.Mesh(new THREE.ShapeGeometry(blueShape, 48), mat(0x2f79c8));
  blueZone.rotation.x = -Math.PI / 2;
  blueZone.position.set(42, 0.06, 22);
  blueZone.receiveShadow = true;
  airportObjects.add(blueZone);
  const redLabel = makeLabel("红色飞机片区");
  redLabel.scale.setScalar(0.7);
  redLabel.position.set(-50, 0.18, 41);
  redLabel.rotation.x = -Math.PI / 2;
  const blueLabel = makeLabel("蓝色半圆片区");
  blueLabel.scale.setScalar(0.7);
  blueLabel.position.set(37, 0.18, 41);
  blueLabel.rotation.x = -Math.PI / 2;
  airportObjects.add(redLabel, blueLabel);

  addRunway(-8, -4, 7, 92, "竖向起飞跑道");
  addRunway(18, -4, 7, 86, "竖向降落跑道");
  addTaxiway(-28, 24, 44, 4);

  const terminal = box(22, 7, 10, 0xffffff);
  terminal.position.set(-30, 3.5, 38);
  terminal.name = "terminal";
  airportObjects.add(terminal);
  const airportNameSign = makeLabel(`${airport.country} ${airport.code}`);
  airportNameSign.scale.setScalar(0.78);
  airportNameSign.position.set(-30, 8.9, 32.7);
  airportObjects.add(airportNameSign);
  const destinationSign = makeLabel(`飞往 ${destinationAirport().country} ${destinationAirport().code}`);
  destinationSign.scale.setScalar(0.62);
  destinationSign.position.set(-30, 8.05, 32.65);
  airportObjects.add(destinationSign);
  const styleBadge = makeLabel(style.name.replace("机场", ""));
  styleBadge.scale.setScalar(0.52);
  styleBadge.position.set(-30, 6.9, 32.55);
  airportObjects.add(styleBadge);

  for (let i = 0; i < 7; i += 1) {
    const windowBox = box(1.4, 1.2, 0.12, 0x64717b);
    windowBox.position.set(-38 + i * 3, 4.2, 32.92);
    airportObjects.add(windowBox);
  }
  addBoardingGate();

  const towerBase = cyl(1.1, 1.3, 8, 0xffffff);
  towerBase.position.set(-13, 4, 29);
  const towerTop = cyl(2.2, 1.9, 2.2, 0x64717b, 8);
  towerTop.position.set(-13, 9.2, 29);
  airportObjects.add(towerBase, towerTop);

  addBuilding(58, 7, 42, 8, 14, 8, 0xa8b5c0);
  addBuilding(70, 10, 48, 9, 20, 9, 0xd9e2ea);
  addBuilding(81, 5, 38, 8, 10, 8, 0x9db0bc);

  planeOptions.forEach((option, i) => {
    const tag = makeLabel(`${i + 1} ${option.short} ${option.model}`);
    tag.scale.setScalar(0.58);
    tag.position.set(option.position[0], 0.28, option.position[2] + 9);
    tag.rotation.x = -Math.PI / 2;
    if (i === state.selectedPlaneIndex) {
      const marker = cyl(2.8, 2.8, 0.12, 0xffd15f, 40);
      marker.position.set(option.position[0], 0.14, option.position[2]);
      airportObjects.add(marker);
    } else {
      const p = createAirliner(option.color, option.model, option);
      p.scale.setScalar(option.scale * 0.92);
      p.position.set(...option.position);
      p.rotation.y = Math.PI / 2;
      airportObjects.add(p);
    }
    airportObjects.add(tag);
  });

  const fountain = new THREE.Group();
  const basin = cyl(3.2, 3.2, 0.3, 0x7fc7ea);
  basin.position.y = 0.16;
  fountain.add(basin);
  for (let i = 0; i < 7; i += 1) {
    const drop = sphere(0.14, 0x9ee8ff);
    drop.position.set(Math.cos(i) * 1.5, 1.3 + Math.sin(i * 1.7) * 0.45, Math.sin(i) * 1.5);
    fountain.add(drop);
  }
  fountain.position.set(-46, 0, 9);
  airportObjects.add(fountain);

  const routeBoard = makeLabel(`${currentAirport().code} -> ${destinationAirport().code}`);
  routeBoard.scale.setScalar(0.72);
  routeBoard.position.set(44, 0.22, -48);
  routeBoard.rotation.x = -Math.PI / 2;
  airportObjects.add(routeBoard);
}

function addBoardingGate() {
  const floor = box(18, 0.18, 9, 0xd9e2ea);
  floor.position.set(-30, 0.1, 24.2);
  const carpet = box(14, 0.08, 2.2, 0x2f79c8);
  carpet.position.set(-30, 0.22, 23.5);
  const counter = box(5.6, 1.5, 1.1, 0xffffff);
  counter.position.set(-34.5, 0.9, 22.4);
  const scanner = box(1.2, 1.0, 0.55, 0x172632);
  scanner.position.set(-31.3, 1.05, 22.4);
  const gateFrame = box(0.45, 4.2, 0.45, 0xd8343f);
  const gateFrameR = gateFrame.clone();
  gateFrame.position.set(-25.5, 2.15, 22.1);
  gateFrameR.position.set(-25.5, 2.15, 25.1);
  const gateTop = box(0.55, 0.45, 3.5, 0xd8343f);
  gateTop.position.set(-25.5, 4.15, 23.6);
  const gateLabel = makeLabel("登机口 A1");
  gateLabel.scale.setScalar(0.58);
  gateLabel.position.set(-25.55, 4.95, 23.6);
  gateLabel.rotation.y = Math.PI / 2;
  const bigSign = makeLabel("室内登机口 / 检票");
  bigSign.scale.setScalar(0.75);
  bigSign.position.set(-34.5, 4.4, 21.7);
  const floorArrow = box(9, 0.09, 1.1, 0xffd15f);
  floorArrow.position.set(-33, 0.28, 24.9);
  const floorText = makeLabel("从这里上飞机");
  floorText.scale.setScalar(0.5);
  floorText.position.set(-33, 0.42, 24.9);
  floorText.rotation.x = -Math.PI / 2;
  const bridge = box(13, 2.3, 3.2, 0xd9e2ea);
  bridge.position.set(-18, 2.55, 23.6);
  const glassL = box(12.2, 1.15, 0.08, 0x8fdcff);
  const glassR = glassL.clone();
  glassL.position.set(-18, 2.76, 22.0);
  glassR.position.set(-18, 2.76, 25.2);
  const agent = createGateAgent();
  agent.position.set(-35.8, 1.25, 22.8);
  const agentLabel = makeLabel("检票员");
  agentLabel.scale.setScalar(0.45);
  agentLabel.position.set(-35.8, 3.15, 22.8);
  airportObjects.add(floor, carpet, counter, scanner, gateFrame, gateFrameR, gateTop, gateLabel, bigSign, floorArrow, floorText, bridge, glassL, glassR, agent, agentLabel);
}

function createGateAgent() {
  const agent = new THREE.Group();
  const body = cyl(0.34, 0.42, 1.15, 0x2f79c8, 24);
  body.position.y = 0.08;
  const head = sphere(0.32, 0xffd6b0);
  head.position.y = 0.82;
  const hat = box(0.7, 0.16, 0.5, 0xd8343f);
  hat.position.y = 1.12;
  const ticket = box(0.54, 0.06, 0.34, 0xffd15f);
  ticket.position.set(0.48, 0.42, 0.05);
  agent.add(body, head, hat, ticket);
  return agent;
}

function createEiffelTower() {
  const tower = new THREE.Group();
  const iron = 0x4b5158;
  const levels = [
    { y: 0, half: 5.8 },
    { y: 8, half: 4.2 },
    { y: 19, half: 2.3 },
    { y: 31, half: 0.9 },
    { y: 38, half: 0.22 }
  ];
  for (let i = 0; i < levels.length - 1; i += 1) {
    const a = levels[i];
    const b = levels[i + 1];
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      tower.add(strutBetween([sx * a.half, a.y, sz * a.half], [sx * b.half, b.y, sz * b.half], 0.18, iron));
      tower.add(strutBetween([sx * a.half, a.y, sz * a.half], [-sx * b.half * 0.72, b.y, sz * b.half], 0.08, iron));
      tower.add(strutBetween([sx * a.half, a.y, sz * a.half], [sx * b.half, b.y, -sz * b.half * 0.72], 0.08, iron));
    });
  }
  [8, 19, 31].forEach((y, i) => {
    const size = [9.4, 5.4, 2.6][i];
    const platform = box(size, 0.45, size, iron);
    platform.position.y = y;
    tower.add(platform);
    const front = box(size + 0.5, 0.28, 0.22, 0xffd15f);
    front.position.set(0, y + 0.75, -size / 2);
    const back = front.clone();
    back.position.z *= -1;
    const left = box(0.22, 0.28, size + 0.5, 0xffd15f);
    left.position.set(-size / 2, y + 0.75, 0);
    const right = left.clone();
    right.position.x *= -1;
    tower.add(front, back, left, right);
  });
  const archFront = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.16, 10, 48, Math.PI), mat(iron));
  archFront.position.set(0, 4.2, -5.85);
  archFront.rotation.z = Math.PI;
  const archBack = archFront.clone();
  archBack.position.z = 5.85;
  const archLeft = archFront.clone();
  archLeft.position.set(-5.85, 4.2, 0);
  archLeft.rotation.y = Math.PI / 2;
  archLeft.rotation.z = Math.PI;
  const archRight = archLeft.clone();
  archRight.position.x = 5.85;
  tower.add(archFront, archBack, archLeft, archRight);
  const spire = cyl(0.16, 0.38, 7.5, iron, 18);
  spire.position.y = 40;
  const beacon = sphere(0.55, 0xffd15f, 1, 1, 1);
  beacon.position.y = 44;
  tower.add(spire, beacon);
  const name = makeLabel("Eiffel Tower 埃菲尔铁塔");
  name.scale.setScalar(0.78);
  name.position.set(0, 6.4, -8.2);
  tower.add(name);
  return tower;
}

function addSlantedElevatorRail(x, z) {
  const railA = box(0.22, 0.22, 27, 0xd9e2ea);
  const railB = railA.clone();
  railA.position.set(x - 3.3, 14.3, z - 3.3);
  railB.position.set(x + 3.3, 14.3, z - 3.3);
  railA.rotation.x = -0.36;
  railB.rotation.x = -0.36;
  airportObjects.add(railA, railB);
  shenzhenElevatorCar = box(2.1, 1.8, 1.8, 0x8fdcff);
  shenzhenElevatorCar.material.transparent = true;
  shenzhenElevatorCar.material.opacity = 0.78;
  airportObjects.add(shenzhenElevatorCar);
  shenzhenLiftLabel = makeLabel("斜电梯");
  shenzhenLiftLabel.scale.setScalar(0.42);
  airportObjects.add(shenzhenLiftLabel);
}

function addCenterElevator(x, z) {
  const shaft = box(1.4, 17, 1.4, 0xd9e2ea);
  shaft.position.set(x, 27.5, z);
  airportObjects.add(shaft);
  shenzhenCenterElevatorCar = box(1.7, 2.1, 1.7, 0xffd15f);
  airportObjects.add(shenzhenCenterElevatorCar);
  const upSign = makeLabel("中间直电梯");
  upSign.scale.setScalar(0.42);
  upSign.position.set(x, 21.2, z - 3.3);
  airportObjects.add(upSign);
}

function buildShenzhenWorldWindow() {
  shenzhenElevatorCar = null;
  shenzhenCenterElevatorCar = null;
  shenzhenLiftLabel = null;
  const ground = new THREE.Mesh(new THREE.BoxGeometry(175, 1, 128), mat(0x86c86e));
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  airportObjects.add(ground);

  const plaza = box(110, 0.12, 56, 0xf5f1df);
  plaza.position.set(0, 0.06, 0);
  airportObjects.add(plaza);
  const gate = box(32, 8, 5, 0xd8343f);
  gate.position.set(-54, 4, 6);
  const gateTop = box(36, 1.2, 6.2, 0xffd15f);
  gateTop.position.set(-54, 8.6, 6);
  airportObjects.add(gate, gateTop);
  const mainSign = makeLabel("深圳世界之窗  Window of the World");
  mainSign.scale.setScalar(1.08);
  mainSign.position.set(-54, 10.4, 2.4);
  airportObjects.add(mainSign);

  const hotel = box(18, 18, 14, 0xffffff);
  hotel.position.set(-62, 9, -28);
  airportObjects.add(hotel);
  const hotelLabel = makeLabel("酒店：放好行李");
  hotelLabel.scale.setScalar(0.58);
  hotelLabel.position.set(-62, 19.5, -35.5);
  airportObjects.add(hotelLabel);
  for (let y = 4; y < 17; y += 3) {
    for (let x = -68; x <= -56; x += 4) {
      const win = box(1.2, 1.1, 0.08, 0x8fdcff);
      win.position.set(x, y, -35.05);
      airportObjects.add(win);
    }
  }

  const ticket = box(17, 5, 8, 0x2f79c8);
  ticket.position.set(-34, 2.5, 23);
  airportObjects.add(ticket);
  const ticketLabel = makeLabel("买票口 / 入园");
  ticketLabel.scale.setScalar(0.62);
  ticketLabel.position.set(-34, 5.8, 18.4);
  airportObjects.add(ticketLabel);

  const route = box(62, 0.16, 4, 0xffd15f);
  route.position.set(-13, 0.16, 12);
  airportObjects.add(route);
  const routeLabel = makeLabel("先酒店 -> 买票 -> 埃菲尔铁塔");
  routeLabel.scale.setScalar(0.58);
  routeLabel.position.set(-13, 0.45, 12);
  routeLabel.rotation.x = -Math.PI / 2;
  airportObjects.add(routeLabel);

  const tower = createEiffelTower();
  tower.position.set(30, 0, 0);
  airportObjects.add(tower);
  addSlantedElevatorRail(30, 0);
  addCenterElevator(30, 0);

  const floor1 = makeLabel("1楼：入口按钮 ▲");
  floor1.scale.setScalar(0.42);
  floor1.position.set(18, 2.2, -8);
  const floor2 = makeLabel("2楼：餐厅平台 ▲ ▼");
  floor2.scale.setScalar(0.42);
  floor2.position.set(20, 10.2, -8);
  const floor3 = makeLabel("3楼：观景台 ▼ + 中间直电梯 ▲");
  floor3.scale.setScalar(0.42);
  floor3.position.set(20, 20.2, -8);
  const top = makeLabel("塔顶：楼梯上去的富豪公寓门口");
  top.scale.setScalar(0.44);
  top.position.set(30, 39.8, 0);
  airportObjects.add(floor1, floor2, floor3, top);

  const restaurant = box(10, 2.2, 7, 0xf06aa3);
  restaurant.position.set(43, 9.4, 0);
  const restaurantLabel = makeLabel("2楼餐厅");
  restaurantLabel.scale.setScalar(0.42);
  restaurantLabel.position.set(43, 11.0, -4.2);
  airportObjects.add(restaurant, restaurantLabel);
  const lookout = box(11, 1.1, 11, 0x8fdcff);
  lookout.material.transparent = true;
  lookout.material.opacity = 0.48;
  lookout.position.set(30, 19.1, 0);
  airportObjects.add(lookout);

  const miniLandmarks = [
    ["金字塔", -10, -28, 0xd49b43],
    ["凯旋门", 0, -31, 0xd9e2ea],
    ["风车", 12, -30, 0xffffff],
    ["自由女神像", 58, -25, 0x38a86a]
  ];
  miniLandmarks.forEach(([name, x, z, color]) => {
    if (name === "金字塔") {
      const pyramid = new THREE.Mesh(new THREE.ConeGeometry(4.5, 5, 4), mat(color));
      pyramid.position.set(x, 2.4, z);
      pyramid.rotation.y = Math.PI / 4;
      airportObjects.add(pyramid);
    } else {
      const statue = cyl(0.55, 0.8, 5, color, 16);
      statue.position.set(x, 2.5, z);
      airportObjects.add(statue);
    }
    const label = makeLabel(name);
    label.scale.setScalar(0.38);
    label.position.set(x, 5.7, z);
    airportObjects.add(label);
  });

  eggy.position.set(-65, 1.05, 9);
  plane.visible = false;
  eggy.visible = true;
  placeName.textContent = "深圳世界之窗";
  setStatus("到达深圳：先去酒店放好东西，再买票入园。第一站是 Eiffel Tower 埃菲尔铁塔。点“电梯上”坐斜电梯。");
}

function buildCurrentPlace() {
  airportObjects.clear();
  styleObjects.clear();
  if (state.currentPlace === "airport") {
    buildAirport();
    applyAirportStyle(state.airportStyle);
    plane.visible = true;
    placeName.textContent = airportTitle();
    setStatus(`出发地：${airportTitle()}。降落目的地：${destinationTitle()}。你就在室内登机口，先上飞机，再滑行、起飞。`);
  } else if (state.currentPlace === "amusement") {
    buildAmusementPark();
    plane.visible = false;
    placeName.textContent = "3D 游乐园";
    setStatus("这里只是游乐园：摩天轮、喷泉、樱花树和过山车，不混机场。");
  } else if (state.currentPlace === "challenge") {
    buildChallengeCourse();
    plane.visible = false;
    placeName.textContent = "3D 闯关游戏";
    setStatus("闯关游戏回来了：走到喷气背包会获得保护，踩平台到白色终点线就赢。");
  } else if (state.currentPlace === "water") {
    buildWaterPark();
    plane.visible = false;
    placeName.textContent = "3D 水上乐园";
    setStatus("这里只是水上乐园：陆地、买票口、电梯、大喇叭滑道和水池。");
  } else if (state.currentPlace === "metro") {
    buildMetroStation();
    plane.visible = false;
    placeName.textContent = "3D 地铁站";
    setStatus("这里只是地铁站：站台、站台门、轨道和地铁列车。");
  } else if (state.currentPlace === "shenzhen") {
    buildShenzhenWorldWindow();
  } else if (state.currentPlace === "landmarks") {
    buildLandmarksPark();
  }
  resetGame(false);
}

function buildAmusementPark() {
  ferrisWheelGroup = null;
  const ground = new THREE.Mesh(new THREE.BoxGeometry(150, 1, 105), mat(0x8bcf75));
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  airportObjects.add(ground);

  const plaza = cyl(18, 18, 0.18, 0xd8c19b, 64);
  plaza.position.set(-8, 0.08, 4);
  airportObjects.add(plaza);

  const wheel = new THREE.Group();
  const wheelBase = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(9, 0.28, 16, 80), mat(0x172632));
  rim.rotation.y = Math.PI / 2;
  wheel.add(rim);
  for (let i = 0; i < 8; i += 1) {
    const spoke = box(0.18, 0.18, 18, 0x172632);
    spoke.rotation.x = (Math.PI / 8) * i;
    wheel.add(spoke);
    const cabin = createFerrisCabin(i % 2 ? 0xf06aa3 : 0xffd15f);
    cabin.position.set(0, Math.sin(i * Math.PI / 4) * 9, Math.cos(i * Math.PI / 4) * 9);
    wheel.add(cabin);
  }
  const stand1 = box(0.7, 12, 0.7, 0x172632);
  const stand2 = box(0.7, 12, 0.7, 0x172632);
  stand1.position.set(0, -4.8, -3.6);
  stand2.position.set(0, -4.8, 3.6);
  stand1.rotation.x = -0.35;
  stand2.rotation.x = 0.35;
  wheelBase.add(stand1, stand2);
  wheel.position.set(-45, 13, -8);
  wheelBase.position.set(-45, 13, -8);
  ferrisWheelGroup = wheel;
  airportObjects.add(wheelBase, wheel);

  const fountain = cyl(4.8, 4.8, 0.35, 0x7fc7ea, 64);
  fountain.position.set(-10, 0.2, 2);
  airportObjects.add(fountain);
  for (let i = 0; i < 12; i += 1) {
    const water = sphere(0.18, 0x9ee8ff);
    water.position.set(-10 + Math.cos(i) * 3, 1.5 + Math.sin(i * 1.4) * 0.6, 2 + Math.sin(i) * 3);
    airportObjects.add(water);
  }

  addSakuraTree(25, 0, -5, 8.5);
  addCoasterTrack(18, -22);
  addAmusementAccidentRide();
}

function addAmusementAccidentRide() {
  const pad = box(18, 0.45, 12, 0x7fc7ea);
  pad.position.set(43, 0.12, 25);
  airportObjects.add(pad);
  const padLabel = makeLabel("安全气垫");
  padLabel.scale.setScalar(0.52);
  padLabel.position.set(43, 0.48, 25);
  padLabel.rotation.x = -Math.PI / 2;
  airportObjects.add(padLabel);
  const sign = makeLabel("飞机事故体验");
  sign.scale.setScalar(0.72);
  sign.position.set(28, 5, 34);
  airportObjects.add(sign);
  const rail = new THREE.Mesh(new THREE.TorusGeometry(11, 0.22, 12, 72), mat(0xffd15f));
  rail.position.set(36, 6.2, 24);
  rail.rotation.x = Math.PI / 2;
  airportObjects.add(rail);
  amusementAccidentPlane = createAirliner(0xf06aa3, "乐园小飞机", { doubleDeck: false });
  amusementAccidentPlane.scale.setScalar(0.58);
  amusementAccidentPlane.position.set(26, 7.2, 24);
  amusementAccidentPlane.rotation.y = Math.PI / 2;
  airportObjects.add(amusementAccidentPlane);
  for (let i = 0; i < 4; i += 1) {
    const toy = sphere(0.35, i % 2 ? 0xffd15f : 0x2f79c8);
    toy.position.set(32 + i * 2.4, 1.1, 31);
    airportObjects.add(toy);
  }
}

function buildChallengeCourse() {
  challengePlatforms = [];
  challengeDangerZones = [];
  const voidFloor = new THREE.Mesh(new THREE.BoxGeometry(170, 0.5, 125), mat(0x172632));
  voidFloor.position.y = -0.75;
  voidFloor.receiveShadow = true;
  airportObjects.add(voidFloor);
  const title = makeLabel("空中闯关平台");
  title.scale.setScalar(0.8);
  title.position.set(-42, 5.6, -38);
  airportObjects.add(title);

  const route = [
    { x: -54, z: -28, y: 0.55, w: 19, d: 10, color: 0xf06aa3, name: "起点平台" },
    { x: -29, z: -28, y: 1.05, w: 18, d: 10, color: 0xffd15f, name: "三角弹射平台" },
    { x: -5, z: -10, y: 1.55, w: 18, d: 10, color: 0x5bc0de, name: "传送门平台" },
    { x: 22, z: -10, y: 2.05, w: 18, d: 10, color: 0x8f5fd9, name: "钩子平台" },
    { x: 50, z: -27, y: 2.55, w: 20, d: 10, color: 0x38a86a, name: "高跳终点平台" }
  ];

  route.forEach((item, i) => {
    const platform = box(item.w, 0.7, item.d, item.color);
    platform.position.set(item.x, item.y, item.z);
    platform.userData.solidPlatform = true;
    challengePlatforms.push({
      x: platform.position.x,
      z: platform.position.z,
      halfW: item.w / 2 + 0.2,
      halfD: item.d / 2 + 0.2,
      standY: platform.position.y + 0.35 + EGGY_STAND_OFFSET,
      name: item.name
    });
    airportObjects.add(platform);
    const sign = makeLabel(`${i + 1} ${item.name}`);
    sign.scale.setScalar(0.45);
    sign.position.set(platform.position.x, platform.position.y + 0.55, platform.position.z);
    sign.rotation.x = -Math.PI / 2;
    airportObjects.add(sign);
  });

  for (let i = 0; i < route.length - 1; i += 1) {
    const a = route[i];
    const b = route[i + 1];
    const bridge = box(Math.abs(b.x - a.x) + 1.5, 0.22, 2.0, 0xffffff);
    bridge.position.set((a.x + b.x) / 2, Math.max(a.y, b.y) + 0.55, (a.z + b.z) / 2);
    bridge.rotation.y = Math.atan2(b.z - a.z, b.x - a.x);
    challengePlatforms.push({
      x: bridge.position.x,
      z: bridge.position.z,
      halfW: Math.abs(b.x - a.x) / 2 + 2.4,
      halfD: Math.abs(b.z - a.z) / 2 + 2.4,
      standY: bridge.position.y + 0.11 + EGGY_STAND_OFFSET,
      name: "连接桥"
    });
    airportObjects.add(bridge);
  }

  const jetBase = cyl(1.5, 1.5, 0.28, 0x2f79c8, 32);
  jetBase.position.set(-56, 1.35, -23);
  const jetSign = makeLabel("喷气背包 11秒");
  jetSign.scale.setScalar(0.5);
  jetSign.position.set(-56, 1.72, -19);
  jetSign.rotation.x = -Math.PI / 2;
  airportObjects.add(jetBase, jetSign);
  const jetPackModel = createEngine(0x2f79c8, 0xffd15f);
  jetPackModel.scale.setScalar(1.45);
  jetPackModel.position.set(-56, 2.0, -23);
  jetPackModel.rotation.z = Math.PI / 2;
  airportObjects.add(jetPackModel);

  const bouncer = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.2, 3), mat(0xffd15f));
  bouncer.position.set(-29, 2.65, -23);
  bouncer.rotation.y = Math.PI / 2;
  airportObjects.add(bouncer);
  const bouncerSign = makeLabel("三角弹射");
  bouncerSign.scale.setScalar(0.5);
  bouncerSign.position.set(-29, 2.15, -18.5);
  bouncerSign.rotation.x = -Math.PI / 2;
  airportObjects.add(bouncerSign);

  const portalA = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.22, 16, 50), mat(0x8fdcff));
  portalA.position.set(-8, 3.45, -5);
  portalA.rotation.y = Math.PI / 2;
  const portalB = portalA.clone();
  portalB.position.set(14, 4.0, -8);
  airportObjects.add(portalA, portalB);
  const portalSign = makeLabel("传送门");
  portalSign.scale.setScalar(0.5);
  portalSign.position.set(-5, 2.62, -15);
  portalSign.rotation.x = -Math.PI / 2;
  airportObjects.add(portalSign);

  const hookPole = cyl(0.18, 0.18, 6, 0xffffff, 14);
  hookPole.position.set(22, 5.2, -5);
  const hookLine = box(14, 0.14, 0.14, 0xffffff);
  hookLine.position.set(29, 7.9, -5);
  const hookSign = makeLabel("钩子");
  hookSign.scale.setScalar(0.48);
  hookSign.position.set(22, 3.1, -15);
  hookSign.rotation.x = -Math.PI / 2;
  airportObjects.add(hookPole, hookLine, hookSign);

  const jumpBlock = box(5, 0.8, 5, 0xffffff);
  jumpBlock.position.set(44, 3.4, -23);
  const jumpLabel = makeLabel("高跳方块");
  jumpLabel.scale.setScalar(0.48);
  jumpLabel.position.set(44, 4.0, -18.5);
  jumpLabel.rotation.x = -Math.PI / 2;
  airportObjects.add(jumpBlock, jumpLabel);
  const finish = box(30, 0.12, 2.5, 0xffffff);
  finish.position.set(57, 3.25, -33);
  const finishLabel = makeLabel("终点 WIN");
  finishLabel.scale.setScalar(0.7);
  finishLabel.position.set(57, 3.45, -36);
  finishLabel.rotation.x = -Math.PI / 2;
  airportObjects.add(finish, finishLabel);

  [
    { x: -17, z: -22, y: 2.9, name: "红色摆锤" },
    { x: 8, z: -10, y: 3.4, name: "旋转杆" },
    { x: 35, z: -18, y: 3.9, name: "尖刺坑" }
  ].forEach((danger, i) => {
    const pole = cyl(0.14, 0.14, 5, 0xd8343f, 14);
    pole.position.set(danger.x, danger.y + 1.8, danger.z);
    const arm = box(8 + i * 1.2, 0.35, 0.35, 0xd8343f);
    arm.position.set(danger.x, danger.y + 3.9, danger.z);
    arm.rotation.y = i * 0.7;
    const sign = makeLabel(danger.name);
    sign.scale.setScalar(0.42);
    sign.position.set(danger.x, danger.y + 5.1, danger.z);
    airportObjects.add(pole, arm, sign);
    challengeDangerZones.push({ x: danger.x, z: danger.z, radius: 4.6, name: danger.name });
  });
}

function buildWaterPark() {
  waterRaft = null;
  waterRidePath = [];
  const ground = new THREE.Mesh(new THREE.BoxGeometry(150, 1, 105), mat(0xf2d69b));
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  airportObjects.add(ground);
  const pool = new THREE.Mesh(new THREE.BoxGeometry(42, 0.2, 24), mat(0x3fb6df));
  pool.position.set(18, 0.05, -8);
  pool.receiveShadow = true;
  airportObjects.add(pool);
  const ticket = box(10, 5, 6, 0xffffff);
  ticket.position.set(-42, 2.5, 20);
  airportObjects.add(ticket);
  const sign = makeLabel("买票口");
  sign.position.set(-42, 5.7, 16.8);
  airportObjects.add(sign);
  const elevator = box(7, 14, 7, 0xd9e2ea);
  elevator.position.set(-18, 7, 8);
  airportObjects.add(elevator);
  const slide = new THREE.Mesh(new THREE.TorusGeometry(8, 0.85, 12, 90, Math.PI * 1.45), mat(0xf06aa3));
  slide.position.set(10, 9, 11);
  slide.rotation.set(Math.PI / 2, 0.2, 0.6);
  airportObjects.add(slide);
  const horn = new THREE.Mesh(new THREE.ConeGeometry(6, 10, 32, 1, true), mat(0xffd15f));
  horn.position.set(34, 6, 8);
  horn.rotation.z = Math.PI / 2;
  airportObjects.add(horn);
  const walkway = box(56, 0.14, 4, 0xffffff);
  walkway.position.set(-12, 0.18, 2);
  airportObjects.add(walkway);
  const startPad = box(12, 0.35, 9, 0x38a86a);
  startPad.position.set(-18, 7.2, 8);
  airportObjects.add(startPad);
  const startLabel = makeLabel("坐电梯到滑道入口");
  startLabel.scale.setScalar(0.5);
  startLabel.position.set(-18, 8.2, 2.8);
  airportObjects.add(startLabel);
  waterRaft = new THREE.Group();
  const tube = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.28, 18, 50), mat(0xffd15f));
  tube.rotation.x = Math.PI / 2;
  const seat = sphere(0.48, 0x2f79c8, 1.2, 0.38, 1.2);
  seat.position.y = 0.08;
  waterRaft.add(tube, seat);
  waterRaft.position.set(-42, 0.75, 20);
  airportObjects.add(waterRaft);
  waterRidePath = [
    new THREE.Vector3(-42, 0.75, 20),
    new THREE.Vector3(-18, 8.0, 8),
    new THREE.Vector3(8, 9.0, 11),
    new THREE.Vector3(27, 6.4, 8),
    new THREE.Vector3(34, 2.2, -3),
    new THREE.Vector3(18, 0.8, -8)
  ];
  const rideSign = makeLabel("点“开始/互动”：坐皮划艇滑大喇叭");
  rideSign.scale.setScalar(0.58);
  rideSign.position.set(4, 3.2, 31);
  airportObjects.add(rideSign);
}

function buildLandmarksPark() {
  landmarkDoorMarkers = [];
  const ground = new THREE.Mesh(new THREE.BoxGeometry(185, 1, 132), mat(0x8bcf75));
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  airportObjects.add(ground);
  const title = makeLabel("全国名胜仿真乐园");
  title.scale.setScalar(1.15);
  title.position.set(-54, 9, -48);
  airportObjects.add(title);
  const plaza = cyl(22, 22, 0.18, 0xf5f1df, 64);
  plaza.position.set(-48, 0.1, -30);
  airportObjects.add(plaza);
  const landmarks = [
    { name: "北京长城", x: -54, z: -8, color: 0xb88852, type: "wall" },
    { name: "北京故宫", x: -22, z: -10, color: 0xd8343f, type: "palace" },
    { name: "杭州西湖", x: 10, z: -12, color: 0x7fc7ea, type: "lake" },
    { name: "西安兵马俑", x: 44, z: -12, color: 0xc88936, type: "soldiers" },
    { name: "张家界", x: -54, z: 28, color: 0x64717b, type: "peaks" },
    { name: "拉萨布达拉宫", x: -18, z: 30, color: 0xffffff, type: "potala" },
    { name: "敦煌莫高窟", x: 18, z: 30, color: 0xd49b43, type: "cave" },
    { name: "黄山迎客松", x: 52, z: 28, color: 0x356b4a, type: "mountain" },
    { name: "上海东方明珠", x: 74, z: -38, color: 0xf06aa3, type: "tower" }
  ];
  landmarks.forEach((item, index) => {
    addLandmarkModel(item);
    const pad = box(11, 0.18, 5, 0xffd15f);
    pad.position.set(item.x, 0.16, item.z + 8);
    airportObjects.add(pad);
    const door = makeLabel(`进入 ${index + 1}`);
    door.scale.setScalar(0.42);
    door.position.set(item.x, 0.55, item.z + 8);
    door.rotation.x = -Math.PI / 2;
    airportObjects.add(door);
    landmarkDoorMarkers.push({ ...item, index, x: item.x, z: item.z + 8 });
  });
  eggy.position.set(-58, 1.05, -37);
  plane.visible = false;
  eggy.visible = true;
  placeName.textContent = "全国名胜";
  setStatus("全国名胜区：走到黄色入口，点“开始/互动”可以进入不同名胜内部。按住屏幕拖动可以看不同角度。");
}

function addLandmarkModel(item) {
  if (item.type === "wall") {
    for (let i = 0; i < 7; i += 1) {
      const wall = box(7, 2.2, 2.4, item.color);
      wall.position.set(item.x - 18 + i * 6, 1.1 + Math.sin(i) * 0.3, item.z + Math.sin(i * 0.8) * 2);
      wall.rotation.y = Math.sin(i * 0.7) * 0.35;
      airportObjects.add(wall);
    }
    const tower = box(5, 5, 5, item.color);
    tower.position.set(item.x, 2.5, item.z);
    airportObjects.add(tower);
  } else if (item.type === "palace") {
    const hall = box(18, 7, 12, 0xd8343f);
    hall.position.set(item.x, 3.5, item.z);
    const roof = box(22, 1.4, 14, 0xffd15f);
    roof.position.set(item.x, 7.8, item.z);
    airportObjects.add(hall, roof);
  } else if (item.type === "lake") {
    const lake = cyl(10, 10, 0.2, 0x7fc7ea, 64);
    lake.position.set(item.x, 0.18, item.z);
    const bridge = box(18, 0.5, 1.8, 0xffffff);
    bridge.position.set(item.x, 0.65, item.z);
    airportObjects.add(lake, bridge);
  } else if (item.type === "soldiers") {
    for (let i = 0; i < 12; i += 1) {
      const soldier = cyl(0.28, 0.36, 2.2, item.color, 16);
      soldier.position.set(item.x - 6 + (i % 4) * 4, 1.1, item.z - 3 + Math.floor(i / 4) * 3);
      airportObjects.add(soldier);
    }
  } else if (item.type === "peaks") {
    for (let i = 0; i < 6; i += 1) {
      const peak = cyl(0.9, 2.1, 10 + i * 1.5, item.color, 10);
      peak.position.set(item.x - 8 + i * 3.5, 5 + i * 0.75, item.z + Math.sin(i) * 4);
      airportObjects.add(peak);
    }
  } else if (item.type === "potala") {
    for (let i = 0; i < 4; i += 1) {
      const tier = box(18 - i * 2.6, 3.2, 10 - i * 1.2, i % 2 ? 0xd8343f : 0xffffff);
      tier.position.set(item.x, 1.6 + i * 3.2, item.z);
      airportObjects.add(tier);
    }
  } else if (item.type === "cave") {
    const cliff = box(20, 10, 5, item.color);
    cliff.position.set(item.x, 5, item.z);
    airportObjects.add(cliff);
    for (let i = 0; i < 4; i += 1) {
      const cave = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.18, 10, 32, Math.PI), mat(0x172632));
      cave.position.set(item.x - 6 + i * 4, 4, item.z - 2.7);
      cave.rotation.z = Math.PI;
      airportObjects.add(cave);
    }
  } else if (item.type === "mountain") {
    addPyramid(item.x - 5, item.z, 6, 9);
    addPyramid(item.x + 4, item.z - 2, 5, 7);
    const trunk = cyl(0.35, 0.45, 4, 0x7a4c29);
    trunk.position.set(item.x + 9, 2, item.z + 3);
    const pine = sphere(2.2, item.color, 1.7, 0.55, 1.2);
    pine.position.set(item.x + 10.2, 4.8, item.z + 3);
    airportObjects.add(trunk, pine);
  } else if (item.type === "tower") {
    const pole = cyl(0.45, 0.8, 18, 0xd9e2ea, 24);
    pole.position.set(item.x, 9, item.z);
    const ball1 = sphere(2.4, item.color);
    ball1.position.set(item.x, 5.6, item.z);
    const ball2 = sphere(1.6, item.color);
    ball2.position.set(item.x, 13.5, item.z);
    airportObjects.add(pole, ball1, ball2);
  }
  const label = makeLabel(item.name);
  label.scale.setScalar(0.52);
  label.position.set(item.x, 10.8, item.z - 7);
  airportObjects.add(label);
}

function createMetroTrain() {
  const train = new THREE.Group();
  const trainBlue = 0x2f79c8;
  for (let i = 0; i < 3; i += 1) {
    const car = box(7.2, 4.6, 13.8, trainBlue);
    car.position.set(0, 2.7, i * -14);
    train.add(car);
    const roof = box(6.4, 0.6, 12.4, 0xffffff);
    roof.position.set(0, 5.25, i * -14);
    train.add(roof);
    for (let j = 0; j < 4; j += 1) {
      const winL = box(0.08, 1.1, 1.7, 0xffffff);
      winL.position.set(-3.65, 3.35, i * -14 - 4.6 + j * 3.0);
      const winR = box(0.08, 1.1, 1.7, 0xffffff);
      winR.position.set(3.65, 3.35, i * -14 - 4.6 + j * 3.0);
      train.add(winL, winR);
    }
    for (let p = 0; p < 5; p += 1) {
      const person = new THREE.Group();
      const head = sphere(0.22, 0xffd6b0);
      head.position.y = 1.05;
      const body = cyl(0.18, 0.22, 0.8, p % 2 ? 0xffd15f : 0xf06aa3, 16);
      body.position.y = 0.45;
      person.add(head, body);
      person.position.set(-1.9 + (p % 3) * 1.9, 1.15, i * -14 - 4 + Math.floor(p / 3) * 5.2);
      train.add(person);
    }
  }
  const nose = sphere(3.6, 0x2f79c8, 1, 0.65, 0.48);
  nose.position.set(0, 2.8, 7.2);
  train.add(nose);
  const label = makeLabel("免费地铁");
  label.scale.setScalar(0.7);
  label.position.set(0, 5.9, 3);
  label.rotation.x = -Math.PI / 2;
  train.add(label);
  return train;
}

function addStation(x, z, name, color) {
  const platform = box(38, 0.55, 12, 0xf5f1df);
  platform.position.set(x, 4.7, z);
  airportObjects.add(platform);
  const roof = box(42, 0.6, 15, color);
  roof.position.set(x, 9.4, z);
  airportObjects.add(roof);
  const lift = box(6, 10, 6, 0xd9e2ea);
  lift.position.set(x - 18, 4.8, z + 13);
  airportObjects.add(lift);
  const liftSign = makeLabel("电梯");
  liftSign.scale.setScalar(0.55);
  liftSign.position.set(x - 18, 10.1, z + 9.9);
  airportObjects.add(liftSign);
  const nameSign = makeLabel(name);
  nameSign.scale.setScalar(0.72);
  nameSign.position.set(x, 10.2, z - 7.7);
  airportObjects.add(nameSign);
}

function setMetroDoors(open) {
  state.metroDoorsOpen = open;
  if (!metroDoorGroup || !platformDoorGroup) return;
  metroDoorGroup.children.forEach((door, i) => {
    door.position.x = (i % 2 === 0 ? -1 : 1) * (open ? 1.15 : 0.38);
  });
  platformDoorGroup.children.forEach((door, i) => {
    door.position.x = -18 + Math.floor(i / 2) * 12 + (i % 2 === 0 ? -1 : 1) * (open ? 1.4 : 0.45);
  });
}

function buildMetroStation() {
  const ground = new THREE.Mesh(new THREE.BoxGeometry(170, 1, 145), mat(0xb9c4cc));
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  airportObjects.add(ground);
  addStation(0, 42, "牛车水 Chinatown", 0xd8343f);
  addStation(0, -46, "港湾 HarbourFront / 怡丰城 VivoCity", 0xffd15f);
  const viaduct = box(16, 1, 104, 0x8f9aa5);
  viaduct.position.set(0, 3.5, -2);
  airportObjects.add(viaduct);
  const rail1 = box(0.45, 0.22, 104, 0x172632);
  const rail2 = box(0.45, 0.22, 104, 0x172632);
  rail1.position.set(-3.2, 4.18, -2);
  rail2.position.set(3.2, 4.18, -2);
  airportObjects.add(rail1, rail2);
  for (let z = 36; z > -44; z -= 12) {
    const tie = box(9.2, 0.2, 0.55, 0x4f5e68);
    tie.position.set(0, 4.3, z);
    airportObjects.add(tie);
  }

  metroTrainGroup = createMetroTrain();
  metroTrainGroup.position.set(0, 4.2, 38);
  airportObjects.add(metroTrainGroup);

  metroDoorGroup = new THREE.Group();
  for (let i = 0; i < 6; i += 1) {
    const door = box(0.08, 2.2, 1.5, 0xffffff);
    door.position.set(i % 2 === 0 ? -1.15 : 1.15, 3.2, 4 - Math.floor(i / 2) * 14);
    metroDoorGroup.add(door);
  }
  metroTrainGroup.add(metroDoorGroup);

  platformDoorGroup = new THREE.Group();
  for (let i = 0; i < 8; i += 1) {
    const door = box(2.1, 3.2, 0.18, 0x7f8c96);
    door.position.set(-18 + Math.floor(i / 2) * 12 + (i % 2 === 0 ? -1.4 : 1.4), 6.4, 35.6);
    platformDoorGroup.add(door);
  }
  airportObjects.add(platformDoorGroup);

  const mall = box(44, 16, 20, 0xffffff);
  mall.position.set(32, 8, -54);
  airportObjects.add(mall);
  const mallLabel = makeLabel("VivoCity 怡丰城商场");
  mallLabel.scale.setScalar(0.8);
  mallLabel.position.set(32, 17.2, -64.2);
  airportObjects.add(mallLabel);
  exitGate = box(30, 0.12, 2.4, 0xffd15f);
  exitGate.position.set(20, 0.1, -66);
  airportObjects.add(exitGate);
  const exitLabel = makeLabel("黄色出站线 WIN");
  exitLabel.scale.setScalar(0.72);
  exitLabel.position.set(20, 0.24, -69);
  exitLabel.rotation.x = -Math.PI / 2;
  airportObjects.add(exitLabel);
  setMetroDoors(true);
}

function buildWorldTourStop(index) {
  const country = tourCountries[index % tourCountries.length];
  airportObjects.clear();
  styleObjects.clear();
  const data = styleData[country.key] || styleData.china;
  const ground = new THREE.Mesh(new THREE.BoxGeometry(170, 1, 118), mat(data.ground));
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  airportObjects.add(ground);

  const route = new THREE.Mesh(new THREE.TorusGeometry(28, 0.25, 12, 96), mat(0xffffff));
  route.position.set(0, 0.08, 0);
  route.rotation.x = Math.PI / 2;
  airportObjects.add(route);

  plane.visible = true;
  eggy.visible = false;
  placeName.textContent = country.title;
  setStatus(country.intro);

  if (country.key === "japan") {
    addJapanStyle();
    addSakuraTree(22, 0, -14, 9);
    const tower = box(2.2, 24, 2.2, 0xd8343f);
    tower.position.set(38, 12, 8);
    styleObjects.add(tower);
  } else if (country.key === "egypt") {
    addEgyptStyle();
    addPyramid(18, 18, 8, 6);
  } else if (country.key === "usa") {
    addUsaStyle();
    addBuilding(22, 8, -10, 8, 16, 8, 0xa8b5c0);
    addBuilding(34, 12, 2, 9, 24, 9, 0xd9e2ea);
    addBuilding(48, 7, -14, 8, 14, 8, 0x9db0bc);
  } else if (country.key === "uk") {
    addUkStyle();
    const bridge = box(28, 1.2, 3, 0xb88852);
    bridge.position.set(20, 4, 10);
    styleObjects.add(bridge);
  } else if (country.key === "china") {
    addChinaStyle();
    addBuilding(28, 9, -12, 10, 18, 10, 0xd9e2ea);
    addBuilding(44, 13, 4, 10, 26, 10, 0xa8b5c0);
  } else if (country.key === "southAfrica") {
    addSouthAfricaStyle();
    const sunDisk = cyl(4, 4, 0.4, 0xf2b44b, 32);
    sunDisk.position.set(34, 8, -4);
    sunDisk.rotation.x = Math.PI / 2;
    styleObjects.add(sunDisk);
  } else if (country.key === "germany") {
    addGermanyStyle();
  } else if (country.key === "thailand") {
    addThailandStyle();
  } else if (country.key === "france") {
    addFranceStyle();
  } else if (country.key === "uae") {
    addUaeStyle();
  } else if (country.key === "australia") {
    addAustraliaStyle();
  } else if (country.key === "korea") {
    addKoreaStyle();
  } else if (country.key === "india") {
    addIndiaStyle();
  } else if (country.key === "brazil") {
    addBrazilStyle();
  } else if (country.key === "canada") {
    addCanadaStyle();
  }

  for (let i = 0; i < 7; i += 1) {
    const marker = cyl(0.7, 0.7, 1.2, data.second || 0xffffff, 20);
    marker.position.set(Math.cos(i * 0.9) * 34, 0.6, Math.sin(i * 0.9) * 22);
    airportObjects.add(marker);
  }
}

function addSakuraTree(x, y, z, h) {
  const trunk = cyl(0.45, 0.65, h, 0x7a4c29);
  trunk.position.set(x, y + h / 2, z);
  airportObjects.add(trunk);
  for (let i = 0; i < 7; i += 1) {
    const blossom = sphere(3.1, 0xf6a5c9, 1.25, 0.9, 1.15);
    blossom.position.set(x + Math.cos(i) * 2.8, y + h + Math.sin(i * 1.6) * 1.2, z + Math.sin(i) * 2.8);
    airportObjects.add(blossom);
  }
}

function addCoasterTrack(x, z) {
  for (let i = 0; i < 18; i += 1) {
    const rail = box(5.5, 0.25, 0.45, 0x8f5fd9);
    rail.position.set(x + i * 3.4, 3 + Math.sin(i * 0.8) * 2.2, z + Math.sin(i * 0.5) * 4);
    rail.rotation.y = Math.sin(i * 0.5) * 0.5;
    rail.rotation.z = Math.sin(i * 0.8) * 0.25;
    airportObjects.add(rail);
  }
  const cart = box(3.2, 1.4, 2.4, 0xd8343f);
  cart.position.set(x + 22, 5.5, z + 4);
  airportObjects.add(cart);
}

function addRunway(x, z, w, d, label) {
  const runway = box(w, 0.08, d, 0x424b57);
  runway.position.set(x, 0.03, z);
  airportObjects.add(runway);
  const horizontal = w >= d;
  const length = horizontal ? w : d;
  for (let i = -length / 2 + 4; i < length / 2 - 4; i += 8) {
    const stripe = box(3.4, 0.09, 0.22, 0xffffff);
    if (horizontal) {
      stripe.position.set(x + i, 0.11, z);
    } else {
      stripe.rotation.y = Math.PI / 2;
      stripe.position.set(x, 0.11, z + i);
    }
    airportObjects.add(stripe);
  }
  const sign = makeLabel(label);
  sign.scale.setScalar(0.8);
  sign.position.set(x - w / 2 - 7, 0.18, z + d / 2 - 8);
  sign.rotation.x = -Math.PI / 2;
  airportObjects.add(sign);
}

function addTaxiway(x, z, w, d) {
  const taxi = box(w, 0.07, d, 0x2d3742);
  taxi.position.set(x, 0.07, z);
  airportObjects.add(taxi);
  for (let i = -w / 2 + 3; i < w / 2; i += 6) {
    const stripe = box(1.9, 0.08, 0.12, 0xffd15f);
    stripe.position.set(x + i, 0.14, z);
    airportObjects.add(stripe);
  }
}

function addBuilding(x, y, z, w, h, d, color) {
  const b = box(w, h, d, color);
  b.position.set(x, h / 2, z);
  airportObjects.add(b);
  for (let floor = 1.8; floor < h - 1; floor += 2.4) {
    for (let col = -w / 2 + 1.2; col < w / 2 - 1; col += 2.2) {
      const win = box(0.7, 0.8, 0.08, 0x8fdcff);
      win.position.set(x + col, floor, z - d / 2 - 0.05);
      airportObjects.add(win);
    }
  }
}

function applyAirportStyle(key) {
  state.airportStyle = key;
  if (state.currentPlace !== "airport") return;
  const data = styleData[key] || styleData.china;
  placeName.textContent = airportTitle();
  const warmSky = key === "egypt" || key === "uae" ? 0xffe3ad : 0xaee7ff;
  scene.fog.color.set(warmSky);
  scene.background.set(warmSky);
  const ground = airportObjects.getObjectByName("ground");
  if (ground) ground.material.color.setHex(data.ground);
  const terminal = airportObjects.getObjectByName("terminal");
  if (terminal) terminal.material.color.setHex(key === "egypt" || key === "uae" ? 0xfff2d2 : 0xffffff);
  styleObjects.clear();
  if (key === "egypt") addEgyptStyle();
  if (key === "usa") addUsaStyle();
  if (key === "uk") addUkStyle();
  if (key === "china") addChinaStyle();
  if (key === "southAfrica") addSouthAfricaStyle();
  if (key === "japan") addJapanStyle();
  if (key === "germany") addGermanyStyle();
  if (key === "thailand") addThailandStyle();
  if (key === "france") addFranceStyle();
  if (key === "uae") addUaeStyle();
  if (key === "australia") addAustraliaStyle();
  if (key === "korea") addKoreaStyle();
  if (key === "india") addIndiaStyle();
  if (key === "brazil") addBrazilStyle();
  if (key === "canada") addCanadaStyle();
}

function addEgyptStyle() {
  addPyramid(-56, -17, 7, 5);
  addPyramid(-47, -18, 5, 3.6);
  const sphinx = sphere(1.8, 0xc88936, 1.8, 0.5, 0.7);
  sphinx.position.set(-36, 0.7, -18);
  styleObjects.add(sphinx);
}

function addPyramid(x, z, w, h) {
  const geometry = new THREE.ConeGeometry(w, h, 4);
  const mesh = new THREE.Mesh(geometry, mat(0xd49b43));
  mesh.position.set(x, h / 2 - 0.1, z);
  mesh.rotation.y = Math.PI / 4;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  styleObjects.add(mesh);
}

function addUsaStyle() {
  const sign = makeLabel("USA TERMINAL");
  sign.position.set(-32, 8.5, 24.8);
  styleObjects.add(sign);
  for (let i = 0; i < 5; i += 1) {
    const stripe = box(7, 0.45, 0.12, i % 2 ? 0xd8343f : 0xffffff);
    stripe.position.set(-44 + i * 3.5, 7.2, 24.72);
    styleObjects.add(stripe);
  }
}

function addUkStyle() {
  const tower = box(3.2, 16, 3.2, 0xb88852);
  tower.position.set(-52, 8, -19);
  styleObjects.add(tower);
  const clock = sphere(0.9, 0xffffff, 1, 1, 0.1);
  clock.position.set(-52, 12.4, -20.66);
  styleObjects.add(clock);
  const bus = box(6.5, 2.3, 2.2, 0xc8323c);
  bus.position.set(-44, 1.4, -23);
  styleObjects.add(bus);
}

function addChinaStyle() {
  const roof = box(18, 1.2, 4, 0xd8343f);
  roof.position.set(-30, 8.1, 25.2);
  const gold = box(14, 0.35, 4.1, 0xffd15f);
  gold.position.set(-30, 8.45, 25.15);
  styleObjects.add(roof, gold);
  for (let i = 0; i < 6; i += 1) {
    const lantern = sphere(0.45, 0xd8343f, 0.8, 1.1, 0.8);
    lantern.position.set(-40 + i * 4, 6.5, 24.45);
    styleObjects.add(lantern);
  }
}

function addSouthAfricaStyle() {
  const mountain = box(18, 4, 5, 0x687a55);
  mountain.position.set(-46, 2, -20);
  mountain.scale.y = 0.7;
  styleObjects.add(mountain);
  const trunk = cyl(0.22, 0.32, 4, 0x7a4c29);
  trunk.position.set(-31, 2, -20);
  const top = sphere(2.5, 0x356b4a, 1.5, 0.6, 1.5);
  top.position.set(-31, 4.5, -20);
  styleObjects.add(trunk, top);
}

function addJapanStyle() {
  const gateTop = box(10, 0.8, 1.2, 0xd8343f);
  gateTop.position.set(-48, 6.2, -20);
  const gateMid = box(7.4, 0.6, 0.9, 0xd8343f);
  gateMid.position.set(-48, 4.8, -20);
  const left = cyl(0.35, 0.35, 5, 0xd8343f);
  const right = cyl(0.35, 0.35, 5, 0xd8343f);
  left.position.set(-51, 2.5, -20);
  right.position.set(-45, 2.5, -20);
  const sakura = sphere(2.4, 0xf6a5c9, 1.2, 0.9, 1.2);
  sakura.position.set(-34, 4, -21);
  styleObjects.add(gateTop, gateMid, left, right, sakura);
}

function addGermanyStyle() {
  const black = box(18, 0.45, 0.12, 0x172632);
  const red = box(18, 0.45, 0.12, 0xd8343f);
  const gold = box(18, 0.45, 0.12, 0xffd15f);
  black.position.set(-30, 8.9, 24.6);
  red.position.set(-30, 8.35, 24.6);
  gold.position.set(-30, 7.8, 24.6);
  const hall = box(12, 5, 6, 0xd9e2ea);
  hall.position.set(-52, 2.5, -20);
  styleObjects.add(black, red, gold, hall);
}

function addThailandStyle() {
  const roof1 = box(16, 0.8, 5, 0xffd15f);
  const roof2 = box(12, 0.6, 4.2, 0x7b4ab8);
  roof1.position.set(-30, 8.7, 25.1);
  roof2.position.set(-30, 9.35, 25);
  const spire = cyl(0.4, 1.0, 6, 0xffd15f, 24);
  spire.position.set(-48, 3, -20);
  styleObjects.add(roof1, roof2, spire);
}

function addFranceStyle() {
  const tower = new THREE.Group();
  const leg1 = box(0.5, 16, 0.5, 0x424b57);
  const leg2 = box(0.5, 16, 0.5, 0x424b57);
  leg1.position.set(-2, 8, 0);
  leg2.position.set(2, 8, 0);
  leg1.rotation.z = 0.18;
  leg2.rotation.z = -0.18;
  const top = box(5, 0.6, 1.2, 0x424b57);
  top.position.set(0, 14, 0);
  tower.add(leg1, leg2, top);
  tower.position.set(-48, 0, -20);
  const flagBlue = box(2, 3, 0.12, 0x2f79c8);
  const flagWhite = box(2, 3, 0.12, 0xffffff);
  const flagRed = box(2, 3, 0.12, 0xd8343f);
  flagBlue.position.set(-37, 6, -20);
  flagWhite.position.set(-35, 6, -20);
  flagRed.position.set(-33, 6, -20);
  styleObjects.add(tower, flagBlue, flagWhite, flagRed);
}

function addUaeStyle() {
  const tower = cyl(1.5, 2.4, 25, 0xd9e2ea, 32);
  tower.position.set(-50, 12.5, -20);
  const cap = sphere(1.5, 0xffd15f, 0.9, 0.9, 0.9);
  cap.position.set(-50, 25.5, -20);
  const palm = cyl(0.28, 0.38, 5, 0x7a4c29);
  palm.position.set(-37, 2.5, -20);
  const leaves = sphere(2.3, 0x38a86a, 1.5, 0.35, 1.5);
  leaves.position.set(-37, 5.4, -20);
  styleObjects.add(tower, cap, palm, leaves);
}

function addAustraliaStyle() {
  const sail1 = new THREE.Mesh(new THREE.ConeGeometry(3.2, 8, 3), mat(0xffffff));
  sail1.position.set(-48, 4, -20);
  sail1.rotation.y = 0.5;
  const sail2 = new THREE.Mesh(new THREE.ConeGeometry(2.6, 7, 3), mat(0xffffff));
  sail2.position.set(-42, 3.5, -20);
  sail2.rotation.y = 0.2;
  const sun = sphere(1.6, 0xf2b44b);
  sun.position.set(-34, 7, -20);
  styleObjects.add(sail1, sail2, sun);
}

function addKoreaStyle() {
  const circleA = sphere(1.4, 0xd8343f, 1, 0.12, 1);
  const circleB = sphere(1.4, 0x2f79c8, 1, 0.12, 1);
  circleA.position.set(-47, 6, -20);
  circleB.position.set(-44, 6, -20);
  const palaceRoof = box(14, 0.9, 4.4, 0x2f79c8);
  palaceRoof.position.set(-30, 8.6, 25);
  styleObjects.add(circleA, circleB, palaceRoof);
}

function addIndiaStyle() {
  const arch = new THREE.Mesh(new THREE.TorusGeometry(4, 0.35, 12, 48, Math.PI), mat(0xf28b2f));
  arch.position.set(-48, 5, -20);
  arch.rotation.z = Math.PI;
  const dome = sphere(2.2, 0xffffff, 1, 0.65, 1);
  dome.position.set(-48, 6.2, -20);
  const green = box(12, 0.55, 0.12, 0x38a86a);
  green.position.set(-30, 7.8, 24.7);
  styleObjects.add(arch, dome, green);
}

function addBrazilStyle() {
  const hill = sphere(4.8, 0x38a86a, 1.4, 0.45, 1);
  hill.position.set(-48, 2.2, -20);
  const statue = box(0.8, 7, 0.8, 0xffffff);
  statue.position.set(-48, 7, -20);
  const arms = box(6.5, 0.45, 0.45, 0xffffff);
  arms.position.set(-48, 9, -20);
  styleObjects.add(hill, statue, arms);
}

function addCanadaStyle() {
  const leaf = sphere(2.2, 0xd8343f, 1.3, 0.7, 0.12);
  leaf.position.set(-48, 6, -20);
  const snow = box(16, 0.4, 0.12, 0xffffff);
  snow.position.set(-30, 8.1, 24.7);
  const tower = cyl(0.8, 1.1, 14, 0xd9e2ea, 24);
  tower.position.set(-37, 7, -20);
  styleObjects.add(leaf, snow, tower);
}

function createClouds() {
  for (let i = 0; i < 34; i += 1) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 4; j += 1) {
      const puff = sphere(1.2 + Math.random() * 0.8, 0xffffff, 1.4, 0.65, 0.85);
      puff.position.set(j * 1.4, Math.random() * 0.35, Math.sin(j) * 0.5);
      cloud.add(puff);
    }
    cloud.position.set(-80 + Math.random() * 180, 24 + Math.random() * 28, -72 + Math.random() * 150);
    cloud.scale.setScalar(0.8 + Math.random() * 1.8);
    clouds.add(cloud);
  }
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

function setStatus(text) {
  flightState.textContent = text;
}

function applyTeddyExpression() {
  const expression = teddyExpressions[state.expressionIndex % teddyExpressions.length];
  const u = eggy.userData;
  u.leftEye.scale.set(1, 1, 1);
  u.rightEye.scale.set(1, 1, 1);
  u.leftSpark.visible = true;
  u.rightSpark.visible = true;
  u.mouth.visible = true;
  u.openMouth.visible = false;
  u.mouth.scale.set(1, 1, 1);
  u.mouth.rotation.z = 0;
  u.leftBrow.rotation.z = 0;
  u.rightBrow.rotation.z = 0;
  u.leftCheek.visible = true;
  u.rightCheek.visible = true;
  if (expression === "开心") {
    u.mouth.scale.set(1.25, 1, 1);
    u.mouth.position.y = 0.76;
    u.leftBrow.rotation.z = 0.14;
    u.rightBrow.rotation.z = -0.14;
  } else if (expression === "惊讶") {
    u.mouth.visible = false;
    u.openMouth.visible = true;
    u.leftBrow.rotation.z = -0.22;
    u.rightBrow.rotation.z = 0.22;
  } else if (expression === "酷酷") {
    u.mouth.scale.set(0.72, 1, 1);
    u.mouth.position.y = 0.8;
    u.leftBrow.rotation.z = -0.28;
    u.rightBrow.rotation.z = 0.28;
    u.leftCheek.visible = false;
    u.rightCheek.visible = false;
  } else if (expression === "眨眼") {
    u.rightEye.scale.set(1.2, 0.18, 1);
    u.rightSpark.visible = false;
    u.mouth.rotation.z = -0.08;
    u.leftBrow.rotation.z = 0.18;
    u.rightBrow.rotation.z = 0.18;
  }
  return expression;
}

function nextExpression() {
  state.expressionIndex = (state.expressionIndex + 1) % teddyExpressions.length;
  const expression = applyTeddyExpression();
  setStatus(`泰迪熊表情：${expression}。现在不是光头蛋仔了，是有表情的泰迪熊。`);
}

function setPlaneInteriorVisible(visible) {
  if (plane.userData.cabinInterior) {
    plane.userData.cabinInterior.visible = visible;
  }
}

function isPlaneTravelMode() {
  return ["boarded", "taxi", "takeoff", "flying", "landing", "landed", "cabin-walk"].includes(state.mode);
}

function cabinFloorY() {
  return state.cabinDeck === 2 ? 1.14 : 0.2;
}

function syncEggyToCabin() {
  const local = state.cabinLocal.clone();
  local.y = cabinFloorY();
  const worldPosition = plane.localToWorld(local);
  eggy.position.copy(worldPosition);
}

function currentPlaneMotionMode() {
  return state.mode === "cabin-walk" ? state.cabinMotionMode : state.mode;
}

function setPlaneMotionMode(mode) {
  if (state.mode === "cabin-walk") state.cabinMotionMode = mode;
  else state.mode = mode;
}

function enterCabinWalk() {
  if (!isPlaneTravelMode()) {
    setStatus("先上飞机，再进客舱走动。");
    return;
  }
  state.cabinMotionMode = currentPlaneMotionMode();
  state.mode = "cabin-walk";
  state.inCockpit = false;
  state.cabinView = true;
  state.autoPilot = true;
  state.cabinDeck = 1;
  state.cabinLocal.set(0.72, cabinFloorY(), 0);
  state.ballMode = false;
  eggy.visible = true;
  eggy.scale.setScalar(0.28);
  setPlaneInteriorVisible(true);
  syncEggyToCabin();
  const option = planeOptions[state.selectedPlaneIndex];
  setStatus(option.doubleDeck ? "进入客舱走动：不会掉下去。用摇杆/WASD在过道里走，点“上二楼”去二楼看窗外。" : "进入客舱走动：不会掉下去。用摇杆/WASD在过道里走，可以从窗户看到外面。");
}

function toggleCabinDeck() {
  if (state.mode !== "cabin-walk") {
    enterCabinWalk();
    return;
  }
  const option = planeOptions[state.selectedPlaneIndex];
  if (!option.doubleDeck) {
    setStatus(`${selectedPlaneLabel()} 是单层客机，没有二楼。换 A380 或 747 就能去二楼。`);
    return;
  }
  state.cabinDeck = state.cabinDeck === 1 ? 2 : 1;
  state.cabinLocal.x = THREE.MathUtils.clamp(state.cabinLocal.x, -1.45, 0.9);
  state.cabinLocal.y = cabinFloorY();
  syncEggyToCabin();
  setStatus(state.cabinDeck === 2 ? "到了二楼客舱！这里也能走，还能从上层窗户看到外面。" : "回到一楼客舱。");
}

function replaceMainPlane(option, keepTransform = false) {
  const oldPosition = plane.position.clone();
  const oldRotation = plane.rotation.clone();
  const oldVisible = plane.visible;
  scene.remove(plane);
  plane = createAirliner(option.color, option.model, option);
  scene.add(plane);
  if (keepTransform) {
    plane.position.copy(oldPosition);
    plane.rotation.copy(oldRotation);
    plane.visible = oldVisible;
  } else {
    plane.position.set(...option.position);
    plane.rotation.set(0, Math.PI / 2, 0);
    plane.visible = state.currentPlace === "airport";
  }
  plane.scale.setScalar(option.scale);
  setPlaneInteriorVisible(state.inCockpit || state.cabinView);
}

function selectedPlaneLabel() {
  const option = planeOptions[state.selectedPlaneIndex];
  return `${option.airlineCn || option.short || ""} ${option.model} ${option.deck}`.trim();
}

function selectNextPlane() {
  if (state.currentPlace !== "airport") {
    setPlace("airport");
  }
  if (!["walk", "landed"].includes(state.mode)) {
    setStatus("飞行或滑行中不能换飞机，先降落或重来。");
    return;
  }
  state.selectedPlaneIndex = (state.selectedPlaneIndex + 1) % planeOptions.length;
  const option = planeOptions[state.selectedPlaneIndex];
  replaceMainPlane(option);
  airportObjects.clear();
  styleObjects.clear();
  buildAirport();
  applyAirportStyle(state.airportStyle);
  setStatus(`已选择第 ${state.selectedPlaneIndex + 1} 架：${selectedPlaneLabel()}。现在你开这一架飞机。`);
}

function findPlaneIndexByTail(tailMark) {
  return planeOptions.findIndex((option) => option.tailMark === tailMark);
}

function selectSpecialPlane(tailMark, message) {
  const nextIndex = findPlaneIndexByTail(tailMark);
  if (nextIndex < 0) return;
  if (!["walk", "landed"].includes(state.mode)) {
    setStatus("先让飞机停好，才能换成这架飞机。");
    return;
  }
  state.selectedPlaneIndex = nextIndex;
  replaceMainPlane(planeOptions[state.selectedPlaneIndex]);
  if (state.currentPlace === "airport") {
    airportObjects.clear();
    styleObjects.clear();
    buildAirport();
    applyAirportStyle(state.airportStyle);
  }
  setStatus(message);
}

function chooseDoublePlane() {
  state.shenzhenPlaneType = "double";
  if (state.currentPlace !== "airport") setPlace("airport");
  selectSpecialPlane("WOW", "已选择普通双层飞机：深圳世界之窗号。它是双层客舱，先从室内登机口检票，再走廊桥上飞机。");
}

function chooseParkPlane() {
  state.shenzhenPlaneType = "park";
  if (state.currentPlace !== "airport") setPlace("airport");
  selectSpecialPlane("FUN", "已选择游乐园飞机：里面想象成有小游戏、彩色座椅和游乐园区域的双层飞机。");
}

function goShenzhen() {
  const szxIndex = airportLocations.findIndex((airport) => airport.code === "SZX");
  if (szxIndex >= 0) state.destinationIndex = szxIndex;
  state.selectedAirportIndex = airportLocations.findIndex((airport) => airport.code === "SIN");
  if (state.selectedAirportIndex < 0) state.selectedAirportIndex = 0;
  state.airportStyle = "china";
  styleSelect.value = "china";
  if (airportSelect) airportSelect.value = String(state.destinationIndex);
  if (state.shenzhenPlaneType === "park") {
    state.selectedPlaneIndex = findPlaneIndexByTail("FUN");
  } else {
    state.selectedPlaneIndex = findPlaneIndexByTail("WOW");
  }
  if (state.selectedPlaneIndex < 0) state.selectedPlaneIndex = 0;
  setPlace("airport");
  setStatus("深圳旅行开始：你在室内登机口，工作人员会检票。点“上飞机”走廊桥，再点“竖向滑行”“跑道起飞”，目的地是深圳宝安国际机场。");
}

function openWorldWindow() {
  state.shenzhenHotel = true;
  state.shenzhenTicket = true;
  setPlace("shenzhen");
  state.worldWindowLevel = 1;
  state.worldWindowTargetLevel = 1;
  eggy.position.set(18, 1.05, -8);
  state.cameraYaw = -0.78;
  state.cameraPitch = 0.08;
  setStatus("已到深圳：酒店放好东西、票也买好了。现在站在 Eiffel Tower 埃菲尔铁塔一楼电梯口。按住屏幕拖动可以换角度。");
}

function worldWindowLevelName(level) {
  if (level <= 1) return "1楼入口";
  if (level === 2) return "2楼餐厅平台";
  if (level === 3) return "3楼观景台";
  return "塔顶楼梯和富豪公寓门口";
}

function moveWorldWindowElevator(delta) {
  if (state.currentPlace !== "shenzhen") {
    setPlace("shenzhen");
  }
  const next = THREE.MathUtils.clamp(state.worldWindowTargetLevel + delta, 1, 4);
  state.worldWindowTargetLevel = next;
  state.mode = "shenzhen-elevator";
  eggy.visible = true;
  setStatus(next <= 3
    ? `按下 ${delta > 0 ? "▲ 上" : "▼ 下"} 按钮，斜电梯正在去${worldWindowLevelName(next)}。`
    : "从三楼进入中间直电梯，再到最上面，最后一小段只能走楼梯。");
}

function goTowerTop() {
  if (state.currentPlace !== "shenzhen") {
    setPlace("shenzhen");
  }
  state.worldWindowTargetLevel = 4;
  state.mode = "shenzhen-elevator";
  eggy.visible = true;
  setStatus("中间直电梯往上，到最顶端后走楼梯。上面是有点吓人的富豪公寓门口。");
}

function toggleCockpit() {
  if (!isPlaneTravelMode()) {
    setStatus("先上飞机，才能进驾驶室。");
    return;
  }
  if (state.mode === "cabin-walk") {
    state.mode = "boarded";
    state.inCockpit = true;
    state.cabinView = false;
    state.autoPilot = false;
    eggy.visible = false;
    eggy.scale.setScalar(1);
    setPlaneInteriorVisible(true);
    setStatus(`回到驾驶舱：你又在飞机里面控制 ${selectedPlaneLabel()}。`);
    return;
  }
  if (state.inCockpit) {
    enterCabinWalk();
  } else {
    state.inCockpit = true;
    state.cabinView = false;
    state.autoPilot = false;
    setPlaneInteriorVisible(true);
    setStatus(`回到驾驶舱：驾驶员就在飞机里面，你正在控制 ${selectedPlaneLabel()}。`);
  }
}

function smoothAngle(current, target, amount) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * amount;
}

function flightForwardVector() {
  return new THREE.Vector3(Math.cos(plane.rotation.y), 0, -Math.sin(plane.rotation.y));
}

function arriveAtNextCountryAirport() {
  const destinationIndex = state.destinationIndex % destinationAirports3d.length;
  const destination = destinationAirports3d[destinationIndex];
  state.selectedAirportIndex = destinationIndex;
  state.airportStyle = destination.key;
  state.currentPlace = "airport";
  placeSelect.value = "airport";
  styleSelect.value = destination.key;
  if (airportSelect) airportSelect.value = String(state.destinationIndex);
  airportObjects.clear();
  styleObjects.clear();
  buildAirport();
  applyAirportStyle(destination.key);
  state.mode = "landed";
  state.flightMeters = 0;
  state.planeT = 0;
  plane.visible = true;
  plane.scale.setScalar(1);
  plane.position.set(18, PLANE_GROUND_Y, 30);
  plane.rotation.set(0, -Math.PI / 2, 0);
  eggy.visible = false;
  setStatus(`${destination.intro} 你已经从新加坡/当前机场飞到这里了。要去别的国家，就在“降落目的地”再选一个。`);
}

function renderStudentScores() {
  studentScores.innerHTML = students
    .map((student) => `<div class="student-score"><span>${student.name}</span><em>${student.score} 分</em></div>`)
    .join("");
}

function addScoreToClass() {
  if (classScoreUsed) {
    setStatus("全班这一次已经加过分了，点“重来”以后可以再来一次。");
    return;
  }
  students.forEach((student) => {
    student.score += 1;
  });
  classScoreUsed = true;
  renderStudentScores();
  setStatus("全班同学每人加 1 分，这一次已经完成。");
}

function addScoreToMe() {
  students[0].score += 5;
  renderStudentScores();
  setStatus("给你加 5 分！现在可以继续开飞机。");
}

function resetGame(resetMessage = true) {
  state.mode = "walk";
  state.speed = 0;
  state.planeT = 0;
  state.tourTimer = 0;
  state.flightMeters = 0;
  state.boardingT = 0;
  state.inCockpit = false;
  state.cabinView = false;
  state.cabinDeck = 1;
  state.cabinLocal.set(0.25, cabinFloorY(), 0);
  state.cabinMotionMode = "boarded";
  state.autoPilot = false;
  state.metroT = 0;
  state.metroPhase = "waiting";
  state.metroDoorsOpen = true;
  state.challengeToolCooldown = 0;
  state.worldWindowLevel = 1;
  state.worldWindowTargetLevel = 1;
  state.insideLandmark = false;
  state.waterRide = false;
  state.waterRideT = 0;
  state.amusementAccident = false;
  state.amusementAccidentT = 0;
  state.ridingWheel = false;
  state.wheelT = 0;
  state.jetpackTimer = 0;
  if (buttons.ferris) buttons.ferris.textContent = "上摩天轮";
  classScoreUsed = false;
  if (state.currentPlace === "airport") {
    eggy.position.set(-36.5, 1.05, 23.2);
    const option = planeOptions[state.selectedPlaneIndex];
    replaceMainPlane(option);
    plane.position.set(...option.position);
  } else if (state.currentPlace === "challenge" && challengePlatforms.length) {
    const firstPlatform = challengePlatforms[0];
    eggy.position.set(firstPlatform.x, firstPlatform.standY, firstPlatform.z);
    plane.position.set(-8, PLANE_GROUND_Y, 30);
  } else if (state.currentPlace === "shenzhen") {
    eggy.position.set(-65, 1.05, 9);
    plane.position.set(-8, PLANE_GROUND_Y, 30);
  } else if (state.currentPlace === "landmarks") {
    eggy.position.set(-58, 1.05, -37);
    plane.position.set(-8, PLANE_GROUND_Y, 30);
  } else if (state.currentPlace === "water") {
    eggy.position.set(-42, 1.05, 20);
    plane.position.set(-8, PLANE_GROUND_Y, 30);
  } else {
    eggy.position.set(-28, 1.05, 10);
    plane.position.set(-8, PLANE_GROUND_Y, 30);
  }
  plane.rotation.set(0, Math.PI / 2, 0);
  plane.scale.setScalar(planeOptions[state.selectedPlaneIndex].scale);
  eggy.scale.setScalar(1);
  state.ballMode = false;
  state.jumpVelocity = 0;
  if (eggy.userData.jetpack) eggy.userData.jetpack.visible = false;
  setPlaneInteriorVisible(false);
  eggy.visible = true;
  plane.visible = state.currentPlace === "airport";
  if (resetMessage) {
    setStatus(state.currentPlace === "airport" ? `你在室内登机口，前面有检票员。当前飞机：${selectedPlaneLabel()}。降落目的地：${destinationTitle()}。` : "这个地方没有飞机，只有当前地点自己的东西。");
  }
  renderStudentScores();
}

function resetCurrentScene() {
  buildCurrentPlace();
  resetGame(true);
}

function setPlace(value) {
  state.currentPlace = value;
  placeSelect.value = value;
  buildCurrentPlace();
}

function startInteract() {
  if (state.mode === "tour") {
    state.tourIndex = (state.tourIndex + 1) % tourCountries.length;
    state.tourTimer = 0;
    buildWorldTourStop(state.tourIndex);
    return;
  }
  if (state.currentPlace === "airport") {
    const planeMode = currentPlaneMotionMode();
    if (state.mode === "walk") boardPlane();
    else if (planeMode === "boarded") taxiPlane();
    else if (planeMode === "taxi") takeoffPlane();
    else if (planeMode === "flying") landPlane();
    else setStatus("机场互动：可以上飞机、滑行、起飞、降落。");
  } else if (state.currentPlace === "amusement") {
    toggleFerrisRide();
  } else if (state.currentPlace === "challenge") {
    setStatus("闯关游戏：走到蓝色喷气背包会自动戴上，跳得更安全；走过白色终点线就赢。");
  } else if (state.currentPlace === "water") {
    startWaterRide();
  } else if (state.currentPlace === "metro") {
    startMetroRide();
  } else if (state.currentPlace === "landmarks") {
    enterNearestLandmark();
  }
}

function openPark() {
  const order = ["amusement", "challenge", "water", "landmarks", "metro", "airport"];
  const current = order.indexOf(state.currentPlace);
  setPlace(order[(current + 1 + order.length) % order.length]);
}

function goLobby() {
  window.location.href = "arcade.html";
}

function toggleFerrisRide() {
  if (state.currentPlace !== "amusement") {
    setPlace("amusement");
  }
  if (state.ridingWheel) {
    state.ridingWheel = false;
    state.mode = "walk";
    eggy.position.set(-35, 1.05, -14);
    eggy.rotation.set(0, 0.5, 0);
    if (buttons.ferris) buttons.ferris.textContent = "上摩天轮";
    setStatus("泰迪熊从摩天轮下来了，可以继续在游乐园走。");
    return;
  }
  state.mode = "wheel";
  state.ridingWheel = true;
  state.wheelT = -Math.PI * 0.35;
  state.amusementAccident = false;
  eggy.visible = true;
  if (buttons.ferris) buttons.ferris.textContent = "下摩天轮";
  setStatus("泰迪熊坐上摩天轮了！会跟着座舱转一圈，脸上还有表情。再点“下摩天轮”就下来。");
}

function startAmusementAccidentRide() {
  if (state.currentPlace !== "amusement") {
    setPlace("amusement");
  }
  state.ridingWheel = false;
  state.mode = "walk";
  state.amusementAccident = true;
  state.amusementAccidentT = 0;
  eggy.visible = true;
  eggy.position.set(16, 1.05, 30);
  setStatus("开始游乐园飞机事故体验：小飞机会先绕圈，再故障冒烟，最后落到安全气垫。");
}

function startMetroRide() {
  if (state.currentPlace !== "metro") {
    setPlace("metro");
  }
  if (state.metroPhase === "waiting") {
    state.mode = "metro";
    state.metroPhase = "closing";
    state.metroT = 0;
    eggy.visible = false;
    setMetroDoors(true);
    setStatus("你从牛车水坐电梯上到站台，地铁门和站台门都开着，玩具乘客正在上车。");
    return;
  }
  if (state.metroPhase === "arrived") {
    state.metroPhase = "win";
    state.mode = "walk";
    eggy.visible = true;
    eggy.position.set(20, 1.05, -66);
    setMetroDoors(true);
    setStatus("你从港湾站出来，走过黄色出站线，到达怡丰城商场，胜利！");
    return;
  }
  if (state.metroPhase === "win") {
    setStatus("已经到达港湾站怡丰城出口，黄色线已经走过，赢了。");
    return;
  }
  setStatus("地铁正在高架路上连续行驶，不会开一半就断掉。");
}

function startWaterRide() {
  if (state.currentPlace !== "water") {
    setPlace("water");
  }
  if (!waterRaft || !waterRidePath.length) {
    setStatus("水上乐园还在准备滑道。");
    return;
  }
  state.waterRide = true;
  state.waterRideT = 0;
  state.mode = "water-ride";
  eggy.visible = true;
  setStatus("开始坐皮划艇：先坐电梯到入口，再滑进大喇叭，最后冲进水池。");
}

function enterNearestLandmark() {
  if (state.currentPlace !== "landmarks") {
    setPlace("landmarks");
  }
  if (!landmarkDoorMarkers.length) return;
  if (state.insideLandmark) {
    state.insideLandmark = false;
    state.landmarkIndex = (state.landmarkIndex + 1) % landmarkDoorMarkers.length;
    const next = landmarkDoorMarkers[state.landmarkIndex];
    eggy.position.set(next.x, 1.05, next.z + 1.5);
    setStatus(`已来到下一个入口：${next.name}。再点“开始/互动”进入里面。`);
    return;
  }
  let nearest = landmarkDoorMarkers[0];
  let best = Infinity;
  landmarkDoorMarkers.forEach((door) => {
    const d = Math.hypot(eggy.position.x - door.x, eggy.position.z - door.z);
    if (d < best) {
      best = d;
      nearest = door;
    }
  });
  state.landmarkIndex = nearest.index;
  state.insideLandmark = true;
  eggy.position.set(nearest.x, 1.05, nearest.z - 5.5);
  const detail = [
    "长城内部：能沿城墙走，旁边有烽火台。",
    "故宫内部：红墙黄瓦，中间是大殿广场。",
    "西湖内部：可以走白色桥，看湖水和亭子。",
    "兵马俑内部：一排排陶俑站在坑里。",
    "张家界内部：很多直直的山峰像柱子。",
    "布达拉宫内部：层层台阶和白红宫墙。",
    "莫高窟内部：能看到洞窟入口和岩壁。",
    "黄山内部：山峰、松树和观景点。",
    "东方明珠内部：能进塔下面的观景厅。"
  ][nearest.index] || "进入名胜内部。";
  setStatus(`进入 ${nearest.name}。${detail} 再点“开始/互动”会切到下一个名胜入口。`);
}

function walkForward() {
  if (state.mode === "cabin-walk") {
    state.cabinLocal.x = THREE.MathUtils.clamp(state.cabinLocal.x - 0.35, -1.9, 1.12);
    syncEggyToCabin();
    state.walkClock += 1;
    setStatus(`在${state.cabinDeck === 2 ? "二楼" : "一楼"}客舱往前走了一步，没有掉下去。`);
    return;
  }
  if (state.mode !== "walk") {
    setStatus("现在在飞机模式里，先下飞机才能走。");
    return;
  }
  const direction = new THREE.Vector3(Math.sin(eggy.rotation.y), 0, Math.cos(eggy.rotation.y));
  eggy.position.addScaledVector(direction, 4.5);
  state.walkClock += 1;
  setStatus("往前走了一步。");
}

function jumpEggy() {
  if (state.ridingWheel) {
    state.ridingWheel = false;
    state.mode = "walk";
    state.jetpackTimer = 12;
    eggy.userData.jetpack.visible = true;
    state.jumpVelocity = 7.5;
    setStatus("泰迪熊从摩天轮跳出来了，自动获得喷气背包保护，可以安全一点。");
    return;
  }
  if (state.mode !== "walk") {
    setStatus("在飞机里不能跳，先下飞机。");
    return;
  }
  const standY = challengeGroundYAt(eggy.position.x, eggy.position.z);
  if (Math.abs(eggy.position.y - standY) < 0.08) {
    state.jumpVelocity = state.jetpackTimer > 0 ? 13.5 : 9.5;
    setStatus(state.jetpackTimer > 0 ? "喷气背包帮你跳得更高。" : "跳起来了。");
  }
}

function toggleBallMode() {
  if (state.mode !== "walk") {
    setStatus("在飞机里不能变滚球，先下飞机。");
    return;
  }
  state.ballMode = !state.ballMode;
  eggy.scale.setScalar(state.ballMode ? 0.9 : 1);
  setStatus(state.ballMode ? "变成滚球了，可以滚着走。" : "变回小蛋仔了。");
}

function startWorldTour() {
  state.mode = "tour";
  state.tourIndex = 0;
  state.tourTimer = 0;
  state.inCockpit = false;
  state.cabinView = false;
  state.autoPilot = false;
  setPlaneInteriorVisible(false);
  plane.scale.setScalar(1.18);
  plane.position.set(-18, 11, 24);
  plane.rotation.set(0, Math.PI / 2, 0);
  buildWorldTourStop(state.tourIndex);
  setStatus(`${tourCountries[state.tourIndex].intro} 点“开始/互动”去下一个国家，不会自己乱跑。`);
}

function boardPlane() {
  if (state.currentPlace !== "airport") {
    setStatus("这里不是机场，没有飞机。请先把地点选成“机场”。");
    return;
  }
  state.mode = "boarding";
  state.boardingT = 0;
  state.boardingFrom.copy(eggy.position);
  state.inCockpit = false;
  state.cabinView = false;
  state.autoPilot = false;
  state.cabinMotionMode = "boarded";
  state.cabinDeck = 1;
  state.cabinLocal.set(0.72, cabinFloorY(), 0);
  setPlaneInteriorVisible(false);
  eggy.visible = true;
  eggy.scale.setScalar(1);
  setStatus("正在机场室内登机：泰迪熊走向登机口，检票员会检票，然后走廊桥进飞机。");
}

function finishBoarding() {
  state.mode = "boarded";
  state.cabinMotionMode = "boarded";
  state.cabinDeck = 1;
  state.cabinLocal.set(0.72, cabinFloorY(), 0);
  state.inCockpit = true;
  state.cabinView = false;
  state.autoPilot = false;
  setPlaneInteriorVisible(true);
  eggy.visible = false;
  setStatus(`检票完成，已经通过廊桥上 ${selectedPlaneLabel()}，驾驶员就在飞机里面的驾驶舱。点“客舱走动”可以去客舱看无人驾驶。`);
}

function taxiPlane() {
  if (state.currentPlace !== "airport") return;
  const planeMode = currentPlaneMotionMode();
  if (planeMode !== "boarded" && planeMode !== "landed") return;
  setPlaneMotionMode("taxi");
  state.planeT = 0;
  state.speed = 0.18;
  plane.position.y = PLANE_GROUND_Y;
  plane.rotation.z = 0;
  setStatus("正在竖向跑道上滑行，还没有起飞。");
}

function takeoffPlane() {
  if (state.currentPlace !== "airport") return;
  if (currentPlaneMotionMode() !== "taxi") return;
  setPlaneMotionMode("takeoff");
  state.planeT = 0;
  state.speed = 0.36;
  plane.position.y = PLANE_GROUND_Y;
  plane.rotation.z = 0;
  setStatus("起飞！飞机开始离开跑道。");
}

function landPlane() {
  if (state.currentPlace !== "airport") return;
  const planeMode = currentPlaneMotionMode();
  if (planeMode !== "flying" && planeMode !== "takeoff") return;
  setPlaneMotionMode("landing");
  state.planeT = 0;
  state.speed = 0.46;
  setStatus("先转弯对准降落跑道，不会倒着飞。");
}

function exitPlane() {
  if (state.mode === "walk") return;
  state.mode = "walk";
  state.speed = 0;
  state.inCockpit = false;
  state.cabinView = false;
  state.autoPilot = true;
  setPlaneInteriorVisible(false);
  eggy.visible = true;
  eggy.scale.setScalar(1);
  eggy.position.copy(plane.position).add(new THREE.Vector3(-2.5, -0.1, 3.2));
  setStatus("你从飞机里出来了，飞机保持无人驾驶平稳状态。");
}

function boardingPoint(t) {
  const p0 = state.boardingFrom;
  const p1 = new THREE.Vector3(-35.6, 1.05, 22.8);
  const p2 = new THREE.Vector3(-28.4, 1.05, 23.6);
  const p3 = new THREE.Vector3(plane.position.x - 4.8, 1.05, plane.position.z + 3.2);
  if (t < 0.38) return p0.clone().lerp(p1, t / 0.38);
  if (t < 0.68) return p1.clone().lerp(p2, (t - 0.38) / 0.3);
  return p2.clone().lerp(p3, (t - 0.68) / 0.32);
}

function updateBoarding(dt) {
  if (state.mode !== "boarding") return;
  state.boardingT += dt;
  const t = Math.min(1, state.boardingT / 4.8);
  const previous = eggy.position.clone();
  eggy.position.copy(boardingPoint(t));
  const move = eggy.position.clone().sub(previous);
  if (move.lengthSq() > 0.0001) eggy.rotation.y = Math.atan2(move.x, move.z);
  state.walkClock += dt * 14;
  eggy.userData.leftLeg.rotation.x = Math.sin(state.walkClock) * 0.58;
  eggy.userData.rightLeg.rotation.x = -Math.sin(state.walkClock) * 0.58;
  eggy.userData.leftArm.rotation.x = -Math.sin(state.walkClock) * 0.4;
  eggy.userData.rightArm.rotation.x = Math.sin(state.walkClock) * 0.4;
  if (t < 0.38) setStatus("机场室内：泰迪熊正在走向登机口。");
  else if (t < 0.68) setStatus("检票员正在检票，登机牌自动交给他。");
  else setStatus("检票完成，正在走廊桥进飞机。");
  if (t >= 1) finishBoarding();
}

function challengeGroundYAt(x, z) {
  if (state.currentPlace !== "challenge") return 1.05;
  let standY = 1.05;
  challengePlatforms.forEach((platform) => {
    const inside = Math.abs(x - platform.x) <= platform.halfW && Math.abs(z - platform.z) <= platform.halfD;
    if (inside) standY = Math.max(standY, platform.standY);
  });
  return standY;
}

function shenzhenGroundY() {
  if (state.currentPlace !== "shenzhen") return 1.05;
  if (state.worldWindowTargetLevel >= 4) return 39.3;
  if (state.worldWindowTargetLevel === 3) return 20.5;
  if (state.worldWindowTargetLevel === 2) return 10.6;
  return 1.05;
}

function currentChallengePlatform() {
  if (state.currentPlace !== "challenge") return null;
  return challengePlatforms.find((platform) => (
    Math.abs(eggy.position.x - platform.x) <= platform.halfW
    && Math.abs(eggy.position.z - platform.z) <= platform.halfD
    && Math.abs(eggy.position.y - platform.standY) < 0.2
  )) || null;
}

function updateWalking(dt) {
  if (state.mode !== "walk") return;
  state.challengeToolCooldown = Math.max(0, state.challengeToolCooldown - dt);
  if (state.jetpackTimer > 0) {
    state.jetpackTimer = Math.max(0, state.jetpackTimer - dt);
    eggy.userData.jetpack.visible = true;
  } else if (eggy.userData.jetpack) {
    eggy.userData.jetpack.visible = false;
  }
  const groundY = state.currentPlace === "shenzhen" ? shenzhenGroundY() : challengeGroundYAt(eggy.position.x, eggy.position.z);
  if (state.jumpVelocity !== 0 || eggy.position.y > groundY) {
    eggy.position.y += state.jumpVelocity * dt;
    state.jumpVelocity -= (state.jetpackTimer > 0 ? 12 : 22) * dt;
    const landingY = state.currentPlace === "shenzhen" ? shenzhenGroundY() : challengeGroundYAt(eggy.position.x, eggy.position.z);
    if (eggy.position.y <= landingY) {
      eggy.position.y = landingY;
      state.jumpVelocity = 0;
    }
  } else if (eggy.position.y < groundY) {
    eggy.position.y = groundY;
  }
  const move = new THREE.Vector3();
  if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) move.z -= 1;
  if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) move.z += 1;
  if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) move.x -= 1;
  if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) move.x += 1;
  move.x += state.stick.x;
  move.z += state.stick.y;
  if (move.lengthSq() > 0.001) {
    move.normalize();
    eggy.position.addScaledVector(move, dt * 10.5);
    eggy.rotation.y = Math.atan2(move.x, move.z);
    state.walkClock += dt * 12;
    eggy.userData.leftLeg.rotation.x = Math.sin(state.walkClock) * 0.55;
    eggy.userData.rightLeg.rotation.x = -Math.sin(state.walkClock) * 0.55;
    eggy.userData.leftArm.rotation.x = -Math.sin(state.walkClock) * 0.38;
    eggy.userData.rightArm.rotation.x = Math.sin(state.walkClock) * 0.38;
    if (state.ballMode) eggy.rotation.z -= dt * 6;
  }
  eggy.position.x = THREE.MathUtils.clamp(eggy.position.x, -78, 82);
  eggy.position.z = THREE.MathUtils.clamp(eggy.position.z, -52, 52);
  if (state.currentPlace === "challenge") {
    const platformY = challengeGroundYAt(eggy.position.x, eggy.position.z);
    if (eggy.position.y < platformY) eggy.position.y = platformY;
    if (Math.hypot(eggy.position.x + 56, eggy.position.z + 23) < 3.4 && state.challengeToolCooldown <= 0) {
      state.jetpackTimer = 11;
      state.challengeToolCooldown = 0.8;
      eggy.userData.jetpack.visible = true;
      setStatus("拿到喷气背包了！11 秒内跳得更高、更稳。");
    } else if (Math.hypot(eggy.position.x + 29, eggy.position.z + 23) < 3.8 && state.challengeToolCooldown <= 0) {
      state.jumpVelocity = 17;
      eggy.position.x += 6;
      state.challengeToolCooldown = 0.9;
      setStatus("三角弹射！把你往前弹出去。");
    } else if (Math.hypot(eggy.position.x + 8, eggy.position.z + 5) < 3.4 && state.challengeToolCooldown <= 0) {
      eggy.position.set(14, challengeGroundYAt(14, -8), -8);
      state.challengeToolCooldown = 1.1;
      setStatus("进入传送门，直接到了下一段平台。");
    } else if (Math.hypot(eggy.position.x - 22, eggy.position.z + 5) < 4.2 && state.challengeToolCooldown <= 0) {
      eggy.position.x += 12;
      state.jumpVelocity = 9;
      state.challengeToolCooldown = 1.0;
      setStatus("钩子机关把你拉到前面去了。");
    } else if (Math.hypot(eggy.position.x - 44, eggy.position.z + 23) < 4 && state.challengeToolCooldown <= 0) {
      state.jumpVelocity = 18;
      state.challengeToolCooldown = 1.0;
      setStatus("踩到高跳方块，跳得很高。");
    } else if (eggy.position.x > 42 && eggy.position.x < 72 && eggy.position.z < -29 && eggy.position.z > -37) {
      setStatus("闯关成功！泰迪熊走过白色终点线。");
    } else {
      const danger = challengeDangerZones.find((zone) => Math.hypot(eggy.position.x - zone.x, eggy.position.z - zone.z) < zone.radius);
      if (danger && state.challengeToolCooldown <= 0) {
        const fallback = currentChallengePlatform() || challengePlatforms[0];
        eggy.position.set(fallback.x, fallback.standY, fallback.z);
        state.challengeToolCooldown = 1.2;
        setStatus(`碰到${danger.name}了，回到最近平台重新跳。`);
        return;
      }
      const platform = currentChallengePlatform();
      if (platform && move.lengthSq() > 0.001) setStatus(`踩在${platform.name}上，不会穿过去。`);
    }
  }
}

function updateCabinWalking(dt) {
  if (state.mode !== "cabin-walk") return;
  const bounds = plane.userData.cabinInterior?.userData.bounds || { minX: -1.9, maxX: 1.12, minZ: -0.46, maxZ: 0.46 };
  const move = new THREE.Vector2();
  if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) move.x += 1;
  if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) move.x -= 1;
  if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) move.y -= 1;
  if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) move.y += 1;
  move.x += -state.stick.y;
  move.y += state.stick.x;
  if (move.lengthSq() > 0.001) {
    move.normalize();
    state.cabinLocal.x = THREE.MathUtils.clamp(state.cabinLocal.x + move.x * dt * 1.35, bounds.minX, bounds.maxX);
    state.cabinLocal.z = THREE.MathUtils.clamp(state.cabinLocal.z + move.y * dt * 0.82, bounds.minZ, bounds.maxZ);
    state.walkClock += dt * 13;
    eggy.userData.leftLeg.rotation.x = Math.sin(state.walkClock) * 0.5;
    eggy.userData.rightLeg.rotation.x = -Math.sin(state.walkClock) * 0.5;
    eggy.userData.leftArm.rotation.x = -Math.sin(state.walkClock) * 0.35;
    eggy.userData.rightArm.rotation.x = Math.sin(state.walkClock) * 0.35;
    eggy.rotation.y = plane.rotation.y + Math.atan2(move.y, move.x) - Math.PI / 2;
  }
  state.cabinLocal.y = cabinFloorY();
  syncEggyToCabin();
}

function updateWorldTour(dt) {
  if (state.mode !== "tour") return;
  state.tourTimer += dt;
  const t = state.tourTimer;
  const radiusX = 34;
  const radiusZ = 24;
  plane.position.x = Math.cos(t * 0.52) * radiusX;
  plane.position.z = Math.sin(t * 0.52) * radiusZ;
  plane.position.y = 10 + Math.sin(t * 1.1) * 2;
  plane.rotation.y = Math.PI * 1.5 - t * 0.52;
  plane.rotation.z = 0;
  if (state.tourTimer > 5.5) {
    state.tourTimer = 0;
    setStatus(`${tourCountries[state.tourIndex].intro} 点“开始/互动”去下一个国家，不会自己乱跑。`);
  }
}

function updateAmusement(dt) {
  if (state.currentPlace !== "amusement" || !ferrisWheelGroup) return;
  state.wheelT += dt * 0.62;
  ferrisWheelGroup.rotation.x = state.wheelT;
  updateAmusementAccident(dt);
  if (!state.ridingWheel) return;
  const angle = state.wheelT + Math.PI * 0.18;
  const center = ferrisWheelGroup.position;
  eggy.position.set(center.x, center.y + Math.sin(angle) * 9, center.z + Math.cos(angle) * 9);
  eggy.rotation.set(0, Math.PI, Math.sin(angle) * 0.08);
  eggy.userData.leftArm.rotation.x = Math.sin(state.wheelT * 3) * 0.28;
  eggy.userData.rightArm.rotation.x = -Math.sin(state.wheelT * 3) * 0.28;
}

function updateAmusementAccident(dt) {
  if (!amusementAccidentPlane) return;
  if (!state.amusementAccident) {
    amusementAccidentPlane.position.set(26, 7.2, 24);
    amusementAccidentPlane.rotation.set(0, Math.PI / 2, 0);
    return;
  }
  state.amusementAccidentT += dt;
  const t = state.amusementAccidentT;
  if (t < 3.2) {
    const a = t * 2.1;
    amusementAccidentPlane.position.set(36 + Math.cos(a) * 11, 7.4 + Math.sin(a * 1.3) * 1.1, 24 + Math.sin(a) * 8);
    amusementAccidentPlane.rotation.y = Math.PI / 2 - a;
    amusementAccidentPlane.rotation.z = Math.sin(t * 4) * 0.18;
    setStatus("游乐园飞机体验：小飞机先正常绕圈飞。");
  } else if (t < 6.2) {
    const u = (t - 3.2) / 3;
    amusementAccidentPlane.position.set(47 - u * 5, 7.2 - u * 5.2, 22 + Math.sin(t * 5) * 1.2);
    amusementAccidentPlane.rotation.y = Math.PI / 2 - u * 0.8;
    amusementAccidentPlane.rotation.z = -0.55 * u;
    addTemporarySmoke(amusementAccidentPlane.position.x - 1.2, amusementAccidentPlane.position.y + 0.4, amusementAccidentPlane.position.z);
    setStatus("突然故障冒烟！这是游乐园里的安全模拟项目，飞机正在慢慢落到安全垫。");
  } else {
    amusementAccidentPlane.position.set(43, 1.15, 25);
    amusementAccidentPlane.rotation.set(0, Math.PI / 2, -0.18);
    setStatus("飞机落到安全气垫上，体验结束。玩具乘客都安全。再点“飞机事故体验”可以重来。");
    if (t > 9.5) state.amusementAccident = false;
  }
}

function addTemporarySmoke(x, y, z) {
  const smoke = sphere(0.45 + Math.random() * 0.35, 0x64717b, 1.2, 0.7, 1.2);
  smoke.material.transparent = true;
  smoke.material.opacity = 0.42;
  smoke.position.set(x + Math.random() * 1.4, y + Math.random() * 0.6, z + Math.random() * 1.4);
  smoke.userData.life = 1.1;
  smoke.userData.smoke = true;
  airportObjects.add(smoke);
}

function updateTemporaryEffects(dt) {
  const remove = [];
  airportObjects.children.forEach((object) => {
    if (!object.userData.smoke) return;
    object.userData.life -= dt;
    object.position.y += dt * 1.2;
    object.scale.multiplyScalar(1 + dt * 0.7);
    if (object.material) object.material.opacity = Math.max(0, object.userData.life * 0.38);
    if (object.userData.life <= 0) remove.push(object);
  });
  remove.forEach((object) => airportObjects.remove(object));
}

function updatePlane(dt) {
  if (state.currentPlace !== "airport") return;
  const planeMode = currentPlaneMotionMode();
  if (planeMode === "taxi") {
    const turnInput = state.stick.x;
    plane.rotation.y -= turnInput * dt * 0.85;
    plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0, dt * 4);
    plane.position.y = THREE.MathUtils.lerp(plane.position.y, PLANE_GROUND_Y, dt * 8);
    plane.position.addScaledVector(flightForwardVector(), dt * 14);
    plane.position.x = THREE.MathUtils.clamp(plane.position.x, -60, 60);
    plane.position.z = THREE.MathUtils.clamp(plane.position.z, -35, 36);
    if (plane.position.z < 5) {
      state.speed = 0;
      plane.position.z = 5;
      setStatus("已经滑到起飞跑道中段了。地面上也能用左下角摇杆转弯，点“起飞”才会离地。");
    }
  }
  if (planeMode === "takeoff") {
    state.planeT += dt;
    const forward = flightForwardVector();
    if (state.planeT < 2.05) {
      plane.position.addScaledVector(forward, dt * 31);
      plane.position.y = PLANE_GROUND_Y;
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0, dt * 4);
      setStatus("竖向起飞滑跑中：飞机还贴着跑道往前冲。");
    } else {
      const climbT = state.planeT - 2.05;
      const smoothClimb = Math.min(1, climbT / 3.2);
      const lift = smoothClimb * smoothClimb * (3 - 2 * smoothClimb);
      plane.position.addScaledVector(forward, dt * 34);
      plane.position.y = PLANE_GROUND_Y + lift * 8.6 + Math.max(0, climbT - 3.2) * 2.2;
      plane.position.x += Math.sin(climbT * 0.8) * dt * 1.4;
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0, dt * 1.2);
      setStatus("机头慢慢抬起来，飞机平滑爬升，不会突然掉下去。");
    }
    if (state.planeT > 5.8) {
      setPlaneMotionMode("flying");
      state.planeT = 0;
      state.flightMeters = 0;
      plane.position.y = Math.max(plane.position.y, PLANE_AIR_MIN_Y);
      setStatus("飞机在空中：左下角圆杆可以控制飞机，往下拉上升，往上推下降，左右拉就左右飞。");
    }
  }
  if (planeMode === "flying") {
    state.planeT += dt;
    const turnInput = state.autoPilot ? Math.sin(state.planeT * 0.45) * 0.12 : state.stick.x;
    const pitchInput = state.autoPilot ? Math.sin(state.planeT * 0.65) * 0.18 : state.stick.y;
    plane.rotation.y -= turnInput * dt * 0.95;
    plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0, dt * 3);
    const forward = flightForwardVector();
    plane.position.addScaledVector(forward, dt * 22);
    plane.position.y = THREE.MathUtils.clamp(plane.position.y + pitchInput * dt * 10, PLANE_AIR_MIN_Y, 34);
    state.flightMeters += dt * 42000;
    const percent = Math.min(100, Math.round((state.flightMeters / 300000) * 100));
    setStatus(state.autoPilot ? `无人驾驶平稳飞行中：飞机自己保持航向。去下一个国家机场 ${percent}%` : `手动飞行中：下拉上升，上推下降，左拉左飞，右拉右飞。去下一个国家机场 ${percent}%`);
    if (state.flightMeters >= 300000) {
      arriveAtNextCountryAirport();
    }
  }
  if (planeMode === "landing") {
    state.planeT += dt;
    if (state.planeT < 2.6) {
      plane.position.x = THREE.MathUtils.lerp(plane.position.x, 18, dt * 0.55);
      plane.position.z -= dt * 6;
      plane.position.y = THREE.MathUtils.lerp(plane.position.y, 12, dt * 0.75);
      plane.rotation.y = smoothAngle(plane.rotation.y, -Math.PI / 2, dt * 0.8);
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0, dt * 1.2);
      setStatus("正在空中转弯：机头慢慢转向降落跑道。");
    } else if (state.planeT < 5.4) {
      plane.position.x = THREE.MathUtils.lerp(plane.position.x, 18, dt * 1.0);
      plane.position.z = THREE.MathUtils.lerp(plane.position.z, 12, dt * 0.7);
      plane.position.y = THREE.MathUtils.lerp(plane.position.y, PLANE_GROUND_Y + 0.1, dt * 0.55);
      plane.rotation.y = smoothAngle(plane.rotation.y, -Math.PI / 2, dt * 1.4);
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0, dt * 1.8);
      setStatus("已经对准跑道，正在下降，不会倒着落。");
    } else {
      plane.position.x = 18;
      plane.position.z += dt * 10;
      plane.position.y = THREE.MathUtils.lerp(plane.position.y, PLANE_GROUND_Y, dt * 2.2);
      plane.rotation.y = smoothAngle(plane.rotation.y, -Math.PI / 2, dt * 2.0);
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0, dt * 2.4);
      setStatus("已经落地，沿降落跑道向前滑跑减速。");
    }
    if (plane.position.z > 30 && state.planeT > 5.4) {
      setPlaneMotionMode("landed");
      state.planeT = 0;
      setStatus("落地成功，飞机停在降落跑道上。");
    }
  }
}

function updateMetro(dt) {
  if (state.currentPlace !== "metro" || !metroTrainGroup) return;
  if (state.metroPhase === "waiting") {
    metroTrainGroup.position.z = 38;
    if (platformDoorGroup) platformDoorGroup.position.z = 0;
    setMetroDoors(true);
    return;
  }
  if (state.metroPhase === "closing") {
    state.metroT += dt;
    if (state.metroT < 1.2) {
      setMetroDoors(true);
      setStatus("牛车水站：地铁门和站台门正在开，玩具乘客上车。");
    } else if (state.metroT < 2.4) {
      setMetroDoors(false);
      setStatus("牛车水站：地铁门和站台门一起关上，准备出发。");
    } else {
      state.metroPhase = "moving";
      state.metroT = 0;
      setMetroDoors(false);
      setStatus("出发！高架轨道是连在一起的，地铁一直往港湾站开。");
    }
    return;
  }
  if (state.metroPhase === "moving") {
    state.metroT += dt;
    const t = Math.min(1, state.metroT / 9.5);
    metroTrainGroup.position.z = THREE.MathUtils.lerp(38, -38, t);
    metroTrainGroup.position.y = 4.2 + Math.sin(state.metroT * 2.6) * 0.08;
    metroTrainGroup.rotation.z = Math.sin(state.metroT * 3.2) * 0.015;
    setStatus(`地铁像船身一样沿高架路飞快行驶，车里有玩具乘客。去港湾站 ${Math.round(t * 100)}%`);
    if (t >= 1) {
      state.metroPhase = "arrived";
      state.metroT = 0;
      metroTrainGroup.position.z = -38;
      if (platformDoorGroup) platformDoorGroup.position.z = -88;
      setMetroDoors(true);
      setStatus("到达港湾 HarbourFront / 怡丰城 VivoCity。地铁门和站台门打开了，再点“开地铁”走出黄色线。");
    }
  }
}

function shenzhenSlantPoint(level) {
  const t = THREE.MathUtils.clamp((level - 1) / 2, 0, 1);
  const p1 = new THREE.Vector3(18.5, 2.3, -3.5);
  const p3 = new THREE.Vector3(27.0, 19.7, -3.5);
  return p1.lerp(p3, t);
}

function shenzhenCenterPoint(level) {
  const t = THREE.MathUtils.clamp(level - 3, 0, 1);
  return new THREE.Vector3(30, THREE.MathUtils.lerp(20.7, 34.4, t), 0);
}

function updateShenzhenWorldWindow(dt) {
  if (state.currentPlace !== "shenzhen") return;
  const levelTarget = state.worldWindowTargetLevel;
  state.worldWindowLevel = THREE.MathUtils.lerp(state.worldWindowLevel, levelTarget, 1 - Math.pow(0.02, dt));
  const slantLevel = Math.min(state.worldWindowLevel, 3);
  const slantPoint = shenzhenSlantPoint(slantLevel);
  if (shenzhenElevatorCar) {
    shenzhenElevatorCar.position.copy(slantPoint);
    shenzhenElevatorCar.rotation.x = -0.36;
  }
  if (shenzhenLiftLabel) {
    shenzhenLiftLabel.position.copy(slantPoint).add(new THREE.Vector3(0, 2.0, -1.6));
  }
  if (shenzhenCenterElevatorCar) {
    const centerPoint = shenzhenCenterPoint(state.worldWindowLevel);
    shenzhenCenterElevatorCar.position.copy(centerPoint);
  }
  if (state.mode === "shenzhen-elevator") {
    const ridePoint = levelTarget <= 3 ? slantPoint.clone() : shenzhenCenterPoint(state.worldWindowLevel);
    eggy.position.copy(ridePoint).add(new THREE.Vector3(0, 1.25, 0.25));
    eggy.rotation.y += dt * 0.45;
    const closeEnough = Math.abs(state.worldWindowLevel - levelTarget) < 0.035;
    if (closeEnough) {
      state.worldWindowLevel = levelTarget;
      if (levelTarget === 1) {
        state.mode = "walk";
        eggy.position.set(18, 1.05, -8);
        setStatus("电梯回到1楼入口。按“电梯上”可以去二楼餐厅平台。");
      } else if (levelTarget === 2) {
        state.mode = "walk";
        eggy.position.set(41, 10.6, -3);
        setStatus("到了2楼餐厅平台：这里有餐厅，可以继续按“电梯上”去三楼。");
      } else if (levelTarget === 3) {
        state.mode = "walk";
        eggy.position.set(30, 20.5, -6);
        setStatus("到了3楼观景台：斜电梯到这里。中间直电梯可以继续往上。");
      } else {
        state.mode = "walk";
        eggy.position.set(30, 39.3, 1.8);
        setStatus("到达塔顶楼梯口：再往上就是富豪公寓门口，游戏里可以看，但现实里不要乱闯。");
      }
    }
  }
}

function pointOnWaterRide(t) {
  if (!waterRidePath.length) return new THREE.Vector3(-42, 0.75, 20);
  const scaled = THREE.MathUtils.clamp(t, 0, 0.999) * (waterRidePath.length - 1);
  const index = Math.floor(scaled);
  const localT = scaled - index;
  const a = waterRidePath[index];
  const b = waterRidePath[Math.min(index + 1, waterRidePath.length - 1)];
  const eased = localT * localT * (3 - 2 * localT);
  return a.clone().lerp(b, eased);
}

function updateWaterRide(dt) {
  if (state.currentPlace !== "water" || !waterRaft) return;
  if (!state.waterRide) {
    if (waterRidePath.length) waterRaft.position.lerp(waterRidePath[0], 1 - Math.pow(0.01, dt));
    return;
  }
  state.waterRideT += dt / 8.2;
  const t = Math.min(1, state.waterRideT);
  const p = pointOnWaterRide(t);
  const next = pointOnWaterRide(Math.min(1, t + 0.02));
  waterRaft.position.copy(p);
  waterRaft.rotation.y = Math.atan2(next.x - p.x, next.z - p.z);
  waterRaft.rotation.z = Math.sin(t * Math.PI * 8) * 0.16;
  eggy.position.copy(p).add(new THREE.Vector3(0, 1.05, 0));
  eggy.rotation.y = waterRaft.rotation.y;
  if (t < 0.23) {
    setStatus("水上乐园：工作人员把你放到皮划艇上，电梯把你送到滑道入口。");
  } else if (t < 0.62) {
    setStatus("正在滑大喇叭！不是满地都是水，是滑道里的水在带着皮划艇走。");
  } else if (t < 0.96) {
    setStatus("皮划艇冲出大喇叭，朝水池滑下去。");
  } else {
    state.waterRide = false;
    state.mode = "walk";
    eggy.position.set(18, 1.05, -8);
    setStatus("水上乐园滑道完成！皮划艇冲进水池，游戏成功。再点“开始/互动”可以重玩。");
  }
}

function updateCamera(dt) {
  const target = state.currentPlace === "metro" && state.mode === "metro" && metroTrainGroup ? metroTrainGroup.position : (state.currentPlace === "water" && state.mode === "water-ride" && waterRaft) ? waterRaft.position : (state.currentPlace === "shenzhen" || state.currentPlace === "landmarks" || state.mode === "walk" || state.mode === "boarding") ? eggy.position : plane.position;
  if (state.ridingWheel) {
    const desiredWheel = new THREE.Vector3(eggy.position.x - 10, eggy.position.y + 3.2, eggy.position.z + 14);
    camera.position.lerp(desiredWheel, 1 - Math.pow(0.001, dt));
    camera.lookAt(eggy.position.x, eggy.position.y + 1.2, eggy.position.z);
    return;
  }
  const baseDistance = state.currentPlace === "shenzhen" ? 38 : state.cameraDistance;
  const baseHeight = state.currentPlace === "shenzhen" ? 14 : 9.5;
  const desired = new THREE.Vector3(
    target.x + Math.sin(state.cameraYaw) * baseDistance,
    target.y + baseHeight + state.cameraPitch * 12,
    target.z + Math.cos(state.cameraYaw) * baseDistance
  );
  if (state.inCockpit && ["boarded", "taxi", "takeoff", "flying", "landing", "landed"].includes(state.mode)) {
    const cam = plane.localToWorld(new THREE.Vector3(2.05, 0.58, -0.08));
    const look = plane.localToWorld(new THREE.Vector3(4.8, 0.5, 0));
    camera.position.lerp(cam, 1 - Math.pow(0.001, dt));
    camera.lookAt(look);
    return;
  }
  if (state.cabinView && ["boarded", "taxi", "takeoff", "flying", "landing", "landed"].includes(state.mode)) {
    const cam = plane.localToWorld(new THREE.Vector3(1.25, 0.62, 0));
    const look = plane.localToWorld(new THREE.Vector3(-2.25, 0.34, 0));
    camera.position.lerp(cam, 1 - Math.pow(0.001, dt));
    camera.lookAt(look);
    return;
  }
  if (state.mode === "cabin-walk") {
    const camLocal = state.cabinLocal.clone().add(new THREE.Vector3(0.72, 0.44, state.cabinLocal.z > 0 ? -0.86 : 0.86));
    const lookLocal = state.cabinLocal.clone().add(new THREE.Vector3(-0.58, 0.28, state.cabinLocal.z > 0 ? 0.46 : -0.46));
    const cam = plane.localToWorld(camLocal);
    const look = plane.localToWorld(lookLocal);
    camera.position.lerp(cam, 1 - Math.pow(0.001, dt));
    camera.lookAt(look);
    return;
  }
  if (state.mode !== "walk" && state.currentPlace !== "shenzhen") {
    desired.set(
      target.x + Math.sin(state.cameraYaw) * 31,
      target.y + 9 + state.cameraPitch * 9,
      target.z + Math.cos(state.cameraYaw) * 31
    );
  }
  camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
  camera.lookAt(target.x, target.y + 2.4, target.z);
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min(0.033, (now - (animate.last || now)) / 1000);
  animate.last = now;
  updateBoarding(dt);
  updateWalking(dt);
  updatePlane(dt);
  updateCabinWalking(dt);
  updateMetro(dt);
  updateShenzhenWorldWindow(dt);
  updateWaterRide(dt);
  updateAmusement(dt);
  updateWorldTour(dt);
  updateTemporaryEffects(dt);
  clouds.children.forEach((cloud, i) => {
    cloud.position.x += dt * (1.2 + (i % 4) * 0.25);
    if (cloud.position.x > 110) cloud.position.x = -110;
  });
  updateCamera(dt);
  renderer.render(scene, camera);
}

function bindStick() {
  let pointerId = null;
  const setStick = (event) => {
    const rect = moveStick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const max = rect.width * 0.33;
    const len = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(max, len);
    const nx = (dx / len) * clamped;
    const ny = (dy / len) * clamped;
    state.stick.set(nx / max, ny / max);
    moveKnob.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
  };
  moveStick.addEventListener("pointerdown", (event) => {
    pointerId = event.pointerId;
    moveStick.setPointerCapture(pointerId);
    setStick(event);
  });
  moveStick.addEventListener("pointermove", (event) => {
    if (event.pointerId === pointerId) setStick(event);
  });
  const clear = () => {
    pointerId = null;
    state.stick.set(0, 0);
    moveKnob.style.transform = "translate(-50%, -50%)";
  };
  moveStick.addEventListener("pointerup", clear);
  moveStick.addEventListener("pointercancel", clear);
}

function bindCanvasViewDrag() {
  let pointerId = null;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener("pointerdown", (event) => {
    pointerId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    state.cameraDragging = true;
    canvas.setPointerCapture(pointerId);
    setStatus("正在拖动视角：左右拖可以绕着看，上下拖可以看高一点或低一点。");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId || !state.cameraDragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    state.cameraYaw -= dx * 0.006;
    state.cameraPitch = THREE.MathUtils.clamp(state.cameraPitch + dy * 0.004, -0.55, 1.05);
  });
  const clear = (event) => {
    if (event && event.pointerId !== pointerId) return;
    pointerId = null;
    state.cameraDragging = false;
  };
  canvas.addEventListener("pointerup", clear);
  canvas.addEventListener("pointercancel", clear);
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    state.cameraDistance = THREE.MathUtils.clamp(state.cameraDistance + Math.sign(event.deltaY) * 2.2, 16, 54);
  }, { passive: false });
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => state.keys.add(event.code));
window.addEventListener("keyup", (event) => state.keys.delete(event.code));
styleSelect.addEventListener("change", () => {
  applyAirportStyle(styleSelect.value);
  if (state.currentPlace === "airport") {
    setStatus(`机场外观换成：${styleData[styleSelect.value]?.name || "新风格"}。出发地还是 ${airportTitle()}，降落目的地还是 ${destinationTitle()}。`);
  }
});
if (airportSelect) airportSelect.addEventListener("change", () => applyAirportLocation(airportSelect.value));
placeSelect.addEventListener("change", () => setPlace(placeSelect.value));
buttons.start.addEventListener("click", startInteract);
buttons.park.addEventListener("click", openPark);
buttons.lobby.addEventListener("click", goLobby);
buttons.tour.addEventListener("click", startWorldTour);
buttons.shenzhen.addEventListener("click", goShenzhen);
buttons.doublePlane.addEventListener("click", chooseDoublePlane);
buttons.parkPlane.addEventListener("click", chooseParkPlane);
buttons.worldWindow.addEventListener("click", openWorldWindow);
buttons.elevatorUp.addEventListener("click", () => moveWorldWindowElevator(1));
buttons.elevatorDown.addEventListener("click", () => moveWorldWindowElevator(-1));
buttons.towerTop.addEventListener("click", goTowerTop);
buttons.ferris.addEventListener("click", toggleFerrisRide);
buttons.accidentRide.addEventListener("click", startAmusementAccidentRide);
buttons.selectPlane.addEventListener("click", selectNextPlane);
buttons.board.addEventListener("click", boardPlane);
buttons.cockpit.addEventListener("click", toggleCockpit);
buttons.cabinWalk.addEventListener("click", enterCabinWalk);
buttons.deck.addEventListener("click", toggleCabinDeck);
buttons.taxi.addEventListener("click", taxiPlane);
buttons.takeoff.addEventListener("click", takeoffPlane);
buttons.metroRide.addEventListener("click", startMetroRide);
buttons.land.addEventListener("click", landPlane);
buttons.exit.addEventListener("click", exitPlane);
buttons.reset.addEventListener("click", resetCurrentScene);
buttons.walk.addEventListener("click", walkForward);
buttons.jump.addEventListener("click", jumpEggy);
buttons.ball.addEventListener("click", toggleBallMode);
buttons.expression.addEventListener("click", nextExpression);
buttons.screenWalk.addEventListener("click", walkForward);
buttons.screenJump.addEventListener("click", jumpEggy);
buttons.screenBall.addEventListener("click", toggleBallMode);
buttons.screenExpression.addEventListener("click", nextExpression);
buttons.classScore.addEventListener("click", addScoreToClass);
buttons.meScore.addEventListener("click", addScoreToMe);

populateAirportSelect();
bindStick();
bindCanvasViewDrag();
renderStudentScores();
resize();
animate();
