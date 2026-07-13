import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const canvas = document.querySelector("#threeCanvas");
const placeName = document.querySelector("#placeName");
const flightState = document.querySelector("#flightState");
const placeSelect = document.querySelector("#placeSelect");
const styleSelect = document.querySelector("#styleSelect");
const moveStick = document.querySelector("#moveStick");
const moveKnob = document.querySelector("#moveKnob");
const studentScores = document.querySelector("#studentScores");
const buttons = {
  start: document.querySelector("#startBtn"),
  park: document.querySelector("#parkBtn"),
  lobby: document.querySelector("#lobbyBtn"),
  tour: document.querySelector("#tourBtn"),
  selectPlane: document.querySelector("#selectPlaneBtn"),
  board: document.querySelector("#boardBtn"),
  cockpit: document.querySelector("#cockpitBtn"),
  taxi: document.querySelector("#taxiBtn"),
  takeoff: document.querySelector("#takeoffBtn"),
  metroRide: document.querySelector("#metroRideBtn"),
  land: document.querySelector("#landBtn"),
  exit: document.querySelector("#exitBtn"),
  reset: document.querySelector("#resetBtn"),
  walk: document.querySelector("#walkBtn"),
  jump: document.querySelector("#jumpBtn"),
  ball: document.querySelector("#ballBtn"),
  screenWalk: document.querySelector("#screenWalkBtn"),
  screenJump: document.querySelector("#screenJumpBtn"),
  screenBall: document.querySelector("#screenBallBtn"),
  classScore: document.querySelector("#classScoreBtn"),
  meScore: document.querySelector("#meScoreBtn")
};

const styleData = {
  china: { name: "中国风格机场", ground: 0x76bd72, accent: 0xd8343f, second: 0xffd15f },
  usa: { name: "美国风格机场", ground: 0x77bd77, accent: 0x5f6f7a, second: 0xd8343f },
  uk: { name: "英国风格机场", ground: 0x70b86d, accent: 0xc8323c, second: 0xffffff },
  egypt: { name: "埃及风格机场", ground: 0xd8b46f, accent: 0xd49b43, second: 0xffe2a3 },
  southAfrica: { name: "南非风格机场", ground: 0xa9bf62, accent: 0xf2b44b, second: 0x356b4a },
  japan: { name: "日本风格机场", ground: 0x79c17c, accent: 0xf06aa3, second: 0xffffff }
};

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
  speed: 0,
  planeT: 0,
  walkClock: 0,
  jumpVelocity: 0,
  ballMode: false,
  tourIndex: 0,
  tourTimer: 0,
  flightMeters: 0,
  destinationIndex: 0,
  selectedPlaneIndex: 0,
  inCockpit: false,
  autoPilot: false,
  metroT: 0,
  metroPhase: "waiting",
  metroDoorsOpen: true
};

const students = [
  { name: "我", score: 0 },
  { name: "同学1", score: 0 },
  { name: "同学2", score: 0 },
  { name: "同学3", score: 0 },
  { name: "同学4", score: 0 }
];
let classScoreUsed = false;

const tourCountries = [
  { key: "japan", name: "日本", title: "日本环游", intro: "现在到日本：能看到樱花树、鸟居和东京塔样子的高塔。" },
  { key: "egypt", name: "埃及", title: "埃及环游", intro: "现在到埃及：金字塔、狮身人面像和沙漠机场就在下面。" },
  { key: "usa", name: "美国", title: "美国环游", intro: "现在到美国：高楼、星条旗航站楼和很宽的城市道路。" },
  { key: "uk", name: "英国", title: "英国环游", intro: "现在到英国：钟楼、红色巴士和英伦风格建筑。" },
  { key: "china", name: "中国", title: "中国环游", intro: "现在到中国：红色屋顶、灯笼、高楼和宽阔广场。" },
  { key: "southAfrica", name: "南非", title: "南非环游", intro: "现在到南非：桌山、草原树和金色大地。" }
];

const destinationAirports3d = [
  { key: "japan", name: "日本机场", intro: "到达日本机场：可以看到樱花树、鸟居和日本风格建筑。" },
  { key: "egypt", name: "埃及机场", intro: "到达埃及机场：金字塔和狮身人面像就在机场旁边。" },
  { key: "usa", name: "美国机场", intro: "到达美国机场：高楼、宽路和美国风格航站楼出现了。" },
  { key: "uk", name: "英国机场", intro: "到达英国机场：钟楼、红色巴士和英伦建筑出现了。" },
  { key: "china", name: "中国机场", intro: "到达中国机场：红色屋顶、灯笼和高楼出现了。" },
  { key: "southAfrica", name: "南非机场", intro: "到达南非机场：桌山和草原树出现了。" }
];

const planeOptions = [
  { model: "A320", color: 0xd8343f, deck: "单层", position: [-32, 0.55, 20], scale: 0.94 },
  { model: "737", color: 0x2f79c8, deck: "单层", position: [-20, 0.55, 20], scale: 0.94 },
  { model: "A380", color: 0xd8343f, deck: "双层", position: [-8, 0.65, 20], scale: 1.12, doubleDeck: true },
  { model: "747", color: 0x2f79c8, deck: "双层", position: [5, 0.65, 20], scale: 1.1, doubleDeck: true },
  { model: "B787", color: 0xd8343f, deck: "单层", position: [18, 0.55, 20], scale: 0.98 },
  { model: "A350", color: 0x2f79c8, deck: "单层", position: [31, 0.55, 20], scale: 0.98 }
];

const world = new THREE.Group();
scene.add(world);

const eggy = createEggy();
eggy.position.set(-18, 1.05, 32);
scene.add(eggy);

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
let metroTrainGroup = null;
let metroDoorGroup = null;
let platformDoorGroup = null;
let exitGate = null;
buildCurrentPlace();

function mat(color, roughness = 0.78) {
  return new THREE.MeshStandardMaterial({ color, roughness });
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

function sphere(r, color, sx = 1, sy = 1, sz = 1) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 18), mat(color));
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createEggy() {
  const group = new THREE.Group();
  const body = sphere(1.25, 0xf6c841, 1, 1.12, 0.92);
  body.name = "body";
  group.add(body);

  const face = sphere(0.78, 0xffd6b0, 1, 0.72, 0.18);
  face.position.set(0, 0.08, 0.84);
  group.add(face);

  const leftEye = sphere(0.08, 0x172632);
  leftEye.position.set(-0.28, 0.18, 1.02);
  const rightEye = sphere(0.08, 0x172632);
  rightEye.position.set(0.28, 0.18, 1.02);
  group.add(leftEye, rightEye);

  const mouth = box(0.42, 0.045, 0.045, 0x172632);
  mouth.position.set(0, -0.24, 1.04);
  group.add(mouth);

  const stem = cyl(0.07, 0.07, 0.48, 0x172632);
  stem.position.set(0, 1.45, 0);
  stem.rotation.z = 0.25;
  const bobble = sphere(0.22, 0xf06aa3);
  bobble.position.set(0.12, 1.72, 0);
  group.add(stem, bobble);

  group.userData.leftArm = cyl(0.12, 0.12, 0.96, 0xf6c841);
  group.userData.rightArm = cyl(0.12, 0.12, 0.96, 0xf6c841);
  group.userData.leftLeg = cyl(0.14, 0.16, 0.72, 0x172632);
  group.userData.rightLeg = cyl(0.14, 0.16, 0.72, 0x172632);

  group.userData.leftArm.position.set(-1.05, -0.08, 0.04);
  group.userData.rightArm.position.set(1.05, -0.08, 0.04);
  group.userData.leftLeg.position.set(-0.42, -1.17, 0.05);
  group.userData.rightLeg.position.set(0.42, -1.17, 0.05);
  group.userData.leftArm.rotation.z = -0.4;
  group.userData.rightArm.rotation.z = 0.4;
  group.add(group.userData.leftArm, group.userData.rightArm, group.userData.leftLeg, group.userData.rightLeg);
  return group;
}

function createAirliner(color, model, options = {}) {
  const group = new THREE.Group();
  const bodyMat = mat(0xffffff);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.78, 5.8, 12, 28), bodyMat);
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const stripe = box(4.9, 0.08, 0.1, color);
  stripe.position.set(0.05, 0.12, 0.72);
  group.add(stripe);

  if (options.doubleDeck) {
    const upperStripe = box(3.6, 0.06, 0.08, color);
    upperStripe.position.set(-0.24, 0.48, 0.62);
    group.add(upperStripe);
  }

  const nose = sphere(0.52, 0xd9e2ea, 1, 0.42, 0.08);
  nose.position.set(3.15, 0.16, 0.62);
  group.add(nose);

  const wingLeft = taperedWing(color, -1);
  const wingRight = taperedWing(color, 1);
  group.add(wingLeft, wingRight);

  const tail = taperedTail(color);
  tail.position.x = -3.05;
  group.add(tail);

  const fin = box(0.14, 1.05, 1.0, color);
  fin.position.set(-3.2, 0.88, 0);
  fin.rotation.z = -0.22;
  group.add(fin);

  const engineL = createEngine();
  const engineR = createEngine();
  engineL.position.set(0.1, -0.42, -1.4);
  engineR.position.set(0.1, -0.42, 1.4);
  engineL.rotation.z = Math.PI / 2;
  engineR.rotation.z = Math.PI / 2;
  group.add(engineL, engineR);

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

  const label = makeLabel(model);
  label.position.set(-0.6, 0.82, 0);
  label.rotation.x = -Math.PI / 2;
  group.add(label);

  return group;
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

function createEngine() {
  const group = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.58, 32), mat(0xdce5eb));
  shell.castShadow = true;
  shell.receiveShadow = true;
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 24), mat(0x172632));
  fan.position.y = 0.31;
  group.add(shell, fan);
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

function buildAirport() {
  airportObjects.clear();
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
  terminal.position.set(-30, 3.5, 31);
  terminal.name = "terminal";
  airportObjects.add(terminal);

  for (let i = 0; i < 7; i += 1) {
    const windowBox = box(1.4, 1.2, 0.12, 0x64717b);
    windowBox.position.set(-38 + i * 3, 4.2, 25.92);
    airportObjects.add(windowBox);
  }

  const towerBase = cyl(1.1, 1.3, 8, 0xffffff);
  towerBase.position.set(-13, 4, 29);
  const towerTop = cyl(2.2, 1.9, 2.2, 0x64717b, 8);
  towerTop.position.set(-13, 9.2, 29);
  airportObjects.add(towerBase, towerTop);

  addBuilding(58, 7, 42, 8, 14, 8, 0xa8b5c0);
  addBuilding(70, 10, 48, 9, 20, 9, 0xd9e2ea);
  addBuilding(81, 5, 38, 8, 10, 8, 0x9db0bc);

  planeOptions.forEach((option, i) => {
    const tag = makeLabel(`${i + 1} ${option.model} ${option.deck}`);
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
}

function buildCurrentPlace() {
  airportObjects.clear();
  styleObjects.clear();
  if (state.currentPlace === "airport") {
    buildAirport();
    applyAirportStyle(state.airportStyle);
    plane.visible = true;
    placeName.textContent = styleData[state.airportStyle].name;
    setStatus("机场里只有机场。先滑行，再点起飞，飞机会贴着跑道冲出去。");
  } else if (state.currentPlace === "amusement") {
    buildAmusementPark();
    plane.visible = false;
    placeName.textContent = "3D 游乐园";
    setStatus("这里只是游乐园：摩天轮、喷泉、樱花树和过山车，不混机场。");
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
  }
  resetGame(false);
}

function buildAmusementPark() {
  const ground = new THREE.Mesh(new THREE.BoxGeometry(150, 1, 105), mat(0x8bcf75));
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  airportObjects.add(ground);

  const plaza = cyl(18, 18, 0.18, 0xd8c19b, 64);
  plaza.position.set(-8, 0.08, 4);
  airportObjects.add(plaza);

  const wheel = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(9, 0.28, 16, 80), mat(0x172632));
  rim.rotation.y = Math.PI / 2;
  wheel.add(rim);
  for (let i = 0; i < 8; i += 1) {
    const spoke = box(0.18, 0.18, 18, 0x172632);
    spoke.rotation.x = (Math.PI / 8) * i;
    wheel.add(spoke);
    const cabin = box(1.8, 1.1, 1.4, i % 2 ? 0xf06aa3 : 0xffd15f);
    cabin.position.set(0, Math.sin(i * Math.PI / 4) * 9, Math.cos(i * Math.PI / 4) * 9);
    wheel.add(cabin);
  }
  const stand1 = box(0.7, 12, 0.7, 0x172632);
  const stand2 = box(0.7, 12, 0.7, 0x172632);
  stand1.position.set(0, -4.8, -3.6);
  stand2.position.set(0, -4.8, 3.6);
  stand1.rotation.x = -0.35;
  stand2.rotation.x = 0.35;
  wheel.add(stand1, stand2);
  wheel.position.set(-45, 13, -8);
  airportObjects.add(wheel);

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
}

function buildWaterPark() {
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
  const data = styleData[key];
  placeName.textContent = data.name;
  scene.fog.color.set(key === "egypt" ? 0xffe3ad : 0xaee7ff);
  scene.background.set(key === "egypt" ? 0xffe3ad : 0xaee7ff);
  const ground = airportObjects.getObjectByName("ground");
  if (ground) ground.material.color.setHex(data.ground);
  const terminal = airportObjects.getObjectByName("terminal");
  if (terminal) terminal.material.color.setHex(key === "egypt" ? 0xfff2d2 : 0xffffff);
  styleObjects.clear();
  if (key === "egypt") addEgyptStyle();
  if (key === "usa") addUsaStyle();
  if (key === "uk") addUkStyle();
  if (key === "china") addChinaStyle();
  if (key === "southAfrica") addSouthAfricaStyle();
  if (key === "japan") addJapanStyle();
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
}

function selectedPlaneLabel() {
  const option = planeOptions[state.selectedPlaneIndex];
  return `${option.model} ${option.deck}`;
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

function toggleCockpit() {
  if (!["boarded", "taxi", "takeoff", "flying", "landing", "landed"].includes(state.mode)) {
    setStatus("先上飞机，才能进驾驶室。");
    return;
  }
  state.inCockpit = !state.inCockpit;
  state.autoPilot = !state.inCockpit;
  setStatus(state.inCockpit ? `进入驾驶室视角：你正在控制 ${selectedPlaneLabel()}。` : "你从控制室出来了，飞机切到无人驾驶，会自己保持平稳。");
}

function smoothAngle(current, target, amount) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * amount;
}

function flightForwardVector() {
  return new THREE.Vector3(Math.cos(plane.rotation.y), 0, -Math.sin(plane.rotation.y));
}

function arriveAtNextCountryAirport() {
  const destination = destinationAirports3d[state.destinationIndex % destinationAirports3d.length];
  state.destinationIndex += 1;
  state.airportStyle = destination.key;
  state.currentPlace = "airport";
  placeSelect.value = "airport";
  styleSelect.value = destination.key;
  airportObjects.clear();
  styleObjects.clear();
  buildAirport();
  applyAirportStyle(destination.key);
  state.mode = "landed";
  state.flightMeters = 0;
  state.planeT = 0;
  plane.visible = true;
  plane.scale.setScalar(1);
  plane.position.set(18, 1.15, 30);
  plane.rotation.set(0, -Math.PI / 2, 0);
  eggy.visible = false;
  setStatus(`${destination.intro} 你已经飞到另一个国家机场了。`);
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
  state.inCockpit = false;
  state.autoPilot = false;
  state.metroT = 0;
  state.metroPhase = "waiting";
  state.metroDoorsOpen = true;
  classScoreUsed = false;
  if (state.currentPlace === "airport") {
    eggy.position.set(-18, 1.05, 32);
    const option = planeOptions[state.selectedPlaneIndex];
    replaceMainPlane(option);
    plane.position.set(...option.position);
  } else {
    eggy.position.set(-28, 1.05, 10);
    plane.position.set(-8, 1.15, 30);
  }
  plane.rotation.set(0, Math.PI / 2, 0);
  plane.scale.setScalar(planeOptions[state.selectedPlaneIndex].scale);
  eggy.scale.setScalar(1);
  state.ballMode = false;
  state.jumpVelocity = 0;
  eggy.visible = true;
  plane.visible = state.currentPlace === "airport";
  if (resetMessage) {
    setStatus(state.currentPlace === "airport" ? `走到飞机旁边，点“上飞机”。当前飞机：${selectedPlaneLabel()}。` : "这个地方没有飞机，只有当前地点自己的东西。");
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
    if (state.mode === "walk") boardPlane();
    else if (state.mode === "boarded") taxiPlane();
    else if (state.mode === "taxi") takeoffPlane();
    else if (state.mode === "flying") landPlane();
    else setStatus("机场互动：可以上飞机、滑行、起飞、降落。");
  } else if (state.currentPlace === "amusement") {
    setStatus("游乐园互动：摩天轮转起来，喷泉亮起来，樱花树下面可以继续走。");
  } else if (state.currentPlace === "water") {
    setStatus("水上乐园互动：买票，坐电梯，上大喇叭滑道，冲进水池。");
  } else if (state.currentPlace === "metro") {
    startMetroRide();
  }
}

function openPark() {
  const order = ["amusement", "water", "metro", "airport"];
  const current = order.indexOf(state.currentPlace);
  setPlace(order[(current + 1 + order.length) % order.length]);
}

function goLobby() {
  window.location.href = "arcade.html";
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

function walkForward() {
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
  if (state.mode !== "walk") {
    setStatus("在飞机里不能跳，先下飞机。");
    return;
  }
  if (Math.abs(eggy.position.y - 1.05) < 0.05) {
    state.jumpVelocity = 9.5;
    setStatus("跳起来了。");
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
  state.mode = "boarded";
  state.inCockpit = true;
  state.autoPilot = false;
  eggy.visible = false;
  setStatus(`已经上 ${selectedPlaneLabel()}，现在在驾驶室里。点“滑行”，飞机会在跑道上慢慢跑。`);
}

function taxiPlane() {
  if (state.currentPlace !== "airport") return;
  if (state.mode !== "boarded" && state.mode !== "landed") return;
  state.mode = "taxi";
  state.speed = 0.18;
  setStatus("正在竖向跑道上滑行，还没有起飞。");
}

function takeoffPlane() {
  if (state.currentPlace !== "airport") return;
  if (state.mode !== "taxi") return;
  state.mode = "takeoff";
  state.speed = 0.36;
  setStatus("起飞！飞机开始离开跑道。");
}

function landPlane() {
  if (state.currentPlace !== "airport") return;
  if (state.mode !== "flying" && state.mode !== "takeoff") return;
  state.mode = "landing";
  state.planeT = 0;
  state.speed = 0.46;
  setStatus("先转弯对准降落跑道，不会倒着飞。");
}

function exitPlane() {
  if (state.mode === "walk") return;
  state.mode = "walk";
  state.speed = 0;
  state.inCockpit = false;
  state.autoPilot = true;
  eggy.visible = true;
  eggy.position.copy(plane.position).add(new THREE.Vector3(-2.5, -0.1, 3.2));
  setStatus("你从飞机里出来了，飞机保持无人驾驶平稳状态。");
}

function updateWalking(dt) {
  if (state.mode !== "walk") return;
  if (state.jumpVelocity !== 0 || eggy.position.y > 1.05) {
    eggy.position.y += state.jumpVelocity * dt;
    state.jumpVelocity -= 22 * dt;
    if (eggy.position.y <= 1.05) {
      eggy.position.y = 1.05;
      state.jumpVelocity = 0;
    }
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
  plane.rotation.y = -t * 0.52 + Math.PI / 2;
  plane.rotation.z = Math.sin(t * 1.3) * 0.22;
  if (state.tourTimer > 5.5) {
    state.tourTimer = 0;
    setStatus(`${tourCountries[state.tourIndex].intro} 点“开始/互动”去下一个国家，不会自己乱跑。`);
  }
}

function updatePlane(dt) {
  if (state.currentPlace !== "airport") return;
  if (state.mode === "taxi") {
    plane.position.z -= dt * 14;
    plane.rotation.z = Math.sin(performance.now() * 0.004) * 0.025;
    if (plane.position.z < 5) {
      state.speed = 0;
      plane.position.z = 5;
      setStatus("已经竖着滑到起飞跑道中段了。点“起飞”才会离地。");
    }
  }
  if (state.mode === "takeoff") {
    state.planeT += dt;
    if (state.planeT < 1.8) {
      plane.position.z -= dt * 31;
      plane.position.y = 1.15;
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, -0.04, dt * 2);
      setStatus("竖向起飞滑跑中：飞机还贴着跑道往前冲。");
    } else {
      const climbT = state.planeT - 1.8;
      plane.position.z -= dt * 34;
      plane.position.y = 1.15 + climbT * climbT * 1.25;
      plane.position.x += Math.sin(climbT * 0.8) * dt * 1.4;
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, -0.16, dt * 1.2);
      setStatus("机头慢慢抬起来，飞机往前爬升，不是热气球那样直上。");
    }
    if (state.planeT > 5.2) {
      state.mode = "flying";
      state.planeT = 0;
      state.flightMeters = 0;
      setStatus("飞机在空中：左下角圆杆可以控制飞机，往下拉上升，往上推下降，左右拉就左右飞。");
    }
  }
  if (state.mode === "flying") {
    state.planeT += dt;
    const turnInput = state.autoPilot ? Math.sin(state.planeT * 0.45) * 0.12 : state.stick.x;
    const pitchInput = state.autoPilot ? Math.sin(state.planeT * 0.65) * 0.18 : state.stick.y;
    plane.rotation.y -= turnInput * dt * 0.95;
    plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, -turnInput * 0.32, dt * 3);
    const forward = flightForwardVector();
    plane.position.addScaledVector(forward, dt * 22);
    plane.position.y = THREE.MathUtils.clamp(plane.position.y + pitchInput * dt * 10, 4, 34);
    state.flightMeters += dt * 42000;
    const percent = Math.min(100, Math.round((state.flightMeters / 300000) * 100));
    setStatus(state.autoPilot ? `无人驾驶平稳飞行中：飞机自己保持航向。去下一个国家机场 ${percent}%` : `手动飞行中：下拉上升，上推下降，左拉左飞，右拉右飞。去下一个国家机场 ${percent}%`);
    if (state.flightMeters >= 300000) {
      arriveAtNextCountryAirport();
    }
  }
  if (state.mode === "landing") {
    state.planeT += dt;
    if (state.planeT < 2.6) {
      plane.position.x = THREE.MathUtils.lerp(plane.position.x, 18, dt * 0.55);
      plane.position.z -= dt * 6;
      plane.position.y = THREE.MathUtils.lerp(plane.position.y, 12, dt * 0.75);
      plane.rotation.y = smoothAngle(plane.rotation.y, -Math.PI / 2, dt * 0.8);
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0.32, dt * 1.2);
      setStatus("正在空中转弯：机头慢慢转向降落跑道。");
    } else if (state.planeT < 5.4) {
      plane.position.x = THREE.MathUtils.lerp(plane.position.x, 18, dt * 1.0);
      plane.position.z = THREE.MathUtils.lerp(plane.position.z, 12, dt * 0.7);
      plane.position.y = THREE.MathUtils.lerp(plane.position.y, 1.25, dt * 0.55);
      plane.rotation.y = smoothAngle(plane.rotation.y, -Math.PI / 2, dt * 1.4);
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0, dt * 1.8);
      setStatus("已经对准跑道，正在下降，不会倒着落。");
    } else {
      plane.position.x = 18;
      plane.position.z += dt * 10;
      plane.position.y = THREE.MathUtils.lerp(plane.position.y, 1.15, dt * 2.2);
      plane.rotation.y = smoothAngle(plane.rotation.y, -Math.PI / 2, dt * 2.0);
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0, dt * 2.4);
      setStatus("已经落地，沿降落跑道向前滑跑减速。");
    }
    if (plane.position.z > 30 && state.planeT > 5.4) {
      state.mode = "landed";
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

function updateCamera(dt) {
  const target = state.currentPlace === "metro" && state.mode === "metro" && metroTrainGroup ? metroTrainGroup.position : state.mode === "walk" ? eggy.position : plane.position;
  const desired = new THREE.Vector3(target.x - 15, target.y + 9.5, target.z + 18);
  if (state.inCockpit && ["boarded", "taxi", "takeoff", "flying", "landing", "landed"].includes(state.mode)) {
    const forward = flightForwardVector();
    desired.set(target.x - forward.x * 0.8, target.y + 1.2, target.z - forward.z * 0.8);
    camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
    camera.lookAt(target.x + forward.x * 18, target.y + 1.7, target.z + forward.z * 18);
    return;
  }
  if (state.mode !== "walk") desired.set(target.x - 18, target.y + 9, target.z + 20);
  camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
  camera.lookAt(target.x, target.y + 2.4, target.z);
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min(0.033, (now - (animate.last || now)) / 1000);
  animate.last = now;
  updateWalking(dt);
  updatePlane(dt);
  updateMetro(dt);
  updateWorldTour(dt);
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

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => state.keys.add(event.code));
window.addEventListener("keyup", (event) => state.keys.delete(event.code));
styleSelect.addEventListener("change", () => applyAirportStyle(styleSelect.value));
placeSelect.addEventListener("change", () => setPlace(placeSelect.value));
buttons.start.addEventListener("click", startInteract);
buttons.park.addEventListener("click", openPark);
buttons.lobby.addEventListener("click", goLobby);
buttons.tour.addEventListener("click", startWorldTour);
buttons.selectPlane.addEventListener("click", selectNextPlane);
buttons.board.addEventListener("click", boardPlane);
buttons.cockpit.addEventListener("click", toggleCockpit);
buttons.taxi.addEventListener("click", taxiPlane);
buttons.takeoff.addEventListener("click", takeoffPlane);
buttons.metroRide.addEventListener("click", startMetroRide);
buttons.land.addEventListener("click", landPlane);
buttons.exit.addEventListener("click", exitPlane);
buttons.reset.addEventListener("click", resetCurrentScene);
buttons.walk.addEventListener("click", walkForward);
buttons.jump.addEventListener("click", jumpEggy);
buttons.ball.addEventListener("click", toggleBallMode);
buttons.screenWalk.addEventListener("click", walkForward);
buttons.screenJump.addEventListener("click", jumpEggy);
buttons.screenBall.addEventListener("click", toggleBallMode);
buttons.classScore.addEventListener("click", addScoreToClass);
buttons.meScore.addEventListener("click", addScoreToMe);

bindStick();
renderStudentScores();
resize();
animate();
