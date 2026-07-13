import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const canvas = document.querySelector("#threeCanvas");
const placeName = document.querySelector("#placeName");
const flightState = document.querySelector("#flightState");
const styleSelect = document.querySelector("#styleSelect");
const moveStick = document.querySelector("#moveStick");
const moveKnob = document.querySelector("#moveKnob");
const studentScores = document.querySelector("#studentScores");
const buttons = {
  board: document.querySelector("#boardBtn"),
  taxi: document.querySelector("#taxiBtn"),
  takeoff: document.querySelector("#takeoffBtn"),
  land: document.querySelector("#landBtn"),
  exit: document.querySelector("#exitBtn"),
  reset: document.querySelector("#resetBtn"),
  classScore: document.querySelector("#classScoreBtn"),
  meScore: document.querySelector("#meScoreBtn")
};

const styleData = {
  china: { name: "中国风格机场", ground: 0x76bd72, accent: 0xd8343f, second: 0xffd15f },
  usa: { name: "美国风格机场", ground: 0x77bd77, accent: 0x2f79c8, second: 0xd8343f },
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
  airportStyle: "china",
  yaw: -0.45,
  pitch: -0.24,
  speed: 0,
  planeT: 0,
  walkClock: 0
};

const students = [
  { name: "我", score: 0 },
  { name: "同学1", score: 0 },
  { name: "同学2", score: 0 },
  { name: "同学3", score: 0 },
  { name: "同学4", score: 0 }
];
let classScoreUsed = false;

const world = new THREE.Group();
scene.add(world);

const eggy = createEggy();
eggy.position.set(-18, 1.05, -8);
scene.add(eggy);

const plane = createAirliner(0x2f79c8, "A320");
plane.position.set(-2, 1.15, -3);
plane.rotation.y = Math.PI / 2;
scene.add(plane);

const clouds = new THREE.Group();
scene.add(clouds);
createClouds();

let styleObjects = new THREE.Group();
world.add(styleObjects);
let airportObjects = new THREE.Group();
world.add(airportObjects);
buildAirport();
applyAirportStyle("china");

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
  const bobble = sphere(0.22, 0x32a7e2);
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

function createAirliner(color, model) {
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

  const nose = sphere(0.52, 0x4aa3df, 1, 0.42, 0.08);
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
    const winL = sphere(0.055, 0x32a7e2, 1, 0.4, 0.08);
    winL.position.set(i, 0.26, 0.7);
    const winR = sphere(0.055, 0x32a7e2, 1, 0.4, 0.08);
    winR.position.set(i, 0.26, -0.7);
    group.add(winL, winR);
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
  const ground = new THREE.Mesh(new THREE.BoxGeometry(190, 1, 130), mat(0x76bd72));
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  ground.name = "ground";
  airportObjects.add(ground);

  addRunway(-26, 0, 86, 7, "起飞跑道");
  addRunway(30, -22, 76, 7, "降落跑道");
  addTaxiway(-3, 14, 54, 4);

  const terminal = box(22, 7, 10, 0xffffff);
  terminal.position.set(-30, 3.5, 31);
  terminal.name = "terminal";
  airportObjects.add(terminal);

  for (let i = 0; i < 7; i += 1) {
    const windowBox = box(1.4, 1.2, 0.12, 0x32a7e2);
    windowBox.position.set(-38 + i * 3, 4.2, 25.92);
    airportObjects.add(windowBox);
  }

  const towerBase = cyl(1.1, 1.3, 8, 0xffffff);
  towerBase.position.set(-13, 4, 29);
  const towerTop = cyl(2.2, 1.9, 2.2, 0x32a7e2, 8);
  towerTop.position.set(-13, 9.2, 29);
  airportObjects.add(towerBase, towerTop);

  addBuilding(58, 7, 42, 8, 14, 8, 0xa8b5c0);
  addBuilding(70, 10, 48, 9, 20, 9, 0xd9e2ea);
  addBuilding(81, 5, 38, 8, 10, 8, 0x9db0bc);

  for (let i = 0; i < 8; i += 1) {
    const p = createAirliner(i % 2 ? 0xd8343f : 0x2f79c8, i % 2 ? "737" : "A320");
    p.scale.setScalar(0.58);
    p.position.set(-18 + i * 5.6, 0.35, 20);
    p.rotation.y = Math.PI / 2;
    airportObjects.add(p);
  }

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

function addRunway(x, z, w, d, label) {
  const runway = box(w, 0.08, d, 0x424b57);
  runway.position.set(x, 0.03, z);
  airportObjects.add(runway);
  for (let i = -w / 2 + 4; i < w / 2 - 4; i += 8) {
    const stripe = box(3.4, 0.09, 0.22, 0xffffff);
    stripe.position.set(x + i, 0.11, z);
    airportObjects.add(stripe);
  }
  const sign = makeLabel(label);
  sign.scale.setScalar(0.8);
  sign.position.set(x - w / 2 + 8, 0.18, z - d / 2 - 2);
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

function resetGame() {
  state.mode = "walk";
  state.speed = 0;
  state.planeT = 0;
  classScoreUsed = false;
  eggy.position.set(-18, 1.05, -8);
  plane.position.set(-2, 1.15, -3);
  plane.rotation.set(0, Math.PI / 2, 0);
  plane.scale.setScalar(1);
  eggy.visible = true;
  setStatus("走到飞机旁边，点“上飞机”。");
  renderStudentScores();
}

function boardPlane() {
  state.mode = "boarded";
  eggy.visible = false;
  setStatus("已经上飞机。点“滑行”，飞机会在跑道上慢慢跑。");
}

function taxiPlane() {
  if (state.mode !== "boarded" && state.mode !== "landed") return;
  state.mode = "taxi";
  state.speed = 0.18;
  setStatus("正在滑行，还没有起飞。");
}

function takeoffPlane() {
  if (state.mode !== "taxi") return;
  state.mode = "takeoff";
  state.speed = 0.36;
  setStatus("起飞！飞机开始离开跑道。");
}

function landPlane() {
  if (state.mode !== "flying" && state.mode !== "takeoff") return;
  state.mode = "landing";
  state.speed = 0.46;
  setStatus("正在自动对准降落跑道，落地后会减速。");
}

function exitPlane() {
  if (state.mode === "walk") return;
  state.mode = "walk";
  state.speed = 0;
  eggy.visible = true;
  eggy.position.copy(plane.position).add(new THREE.Vector3(-2.5, -0.1, 3.2));
  setStatus("下飞机了，可以继续走路看机场。");
}

function updateWalking(dt) {
  if (state.mode !== "walk") return;
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
  }
  eggy.position.x = THREE.MathUtils.clamp(eggy.position.x, -78, 82);
  eggy.position.z = THREE.MathUtils.clamp(eggy.position.z, -52, 52);
}

function updatePlane(dt) {
  if (state.mode === "taxi") {
    plane.position.x += dt * 14;
    plane.rotation.z = Math.sin(performance.now() * 0.004) * 0.025;
    if (plane.position.x > 28) {
      state.speed = 0;
      setStatus("滑行到跑道中段了。点“起飞”才会离地。");
    }
  }
  if (state.mode === "takeoff") {
    state.planeT += dt;
    plane.position.x += dt * 23;
    plane.position.y += dt * (3.6 + state.planeT * 1.3);
    plane.position.z += Math.sin(state.planeT * 1.6) * dt * 3;
    plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, -0.22, dt * 1.4);
    if (state.planeT > 4) {
      state.mode = "flying";
      state.planeT = 0;
      setStatus("飞机在空中平稳飞行，可以点“降落”。");
    }
  }
  if (state.mode === "flying") {
    state.planeT += dt;
    plane.position.x += dt * 13;
    plane.position.y = 18 + Math.sin(state.planeT * 1.2) * 1.6;
    plane.position.z += Math.sin(state.planeT * 0.8) * dt * 5;
    plane.rotation.y = Math.PI / 2 + Math.sin(state.planeT * 0.55) * 0.16;
    plane.rotation.z = Math.sin(state.planeT) * 0.16;
  }
  if (state.mode === "landing") {
    state.planeT += dt;
    plane.position.x = THREE.MathUtils.lerp(plane.position.x, 20, dt * 0.7);
    plane.position.z = THREE.MathUtils.lerp(plane.position.z, -22, dt * 0.9);
    plane.position.y = THREE.MathUtils.lerp(plane.position.y, 1.18, dt * 0.55);
    plane.rotation.y = THREE.MathUtils.lerp(plane.rotation.y, Math.PI / 2, dt * 1.2);
    plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0, dt * 1.6);
    if (plane.position.y < 1.45 && state.planeT > 3) {
      state.mode = "landed";
      state.planeT = 0;
      setStatus("落地成功，飞机停在降落跑道上。");
    }
  }
}

function updateCamera(dt) {
  const target = state.mode === "walk" ? eggy.position : plane.position;
  const desired = new THREE.Vector3(target.x - 15, target.y + 9.5, target.z + 18);
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
buttons.board.addEventListener("click", boardPlane);
buttons.taxi.addEventListener("click", taxiPlane);
buttons.takeoff.addEventListener("click", takeoffPlane);
buttons.land.addEventListener("click", landPlane);
buttons.exit.addEventListener("click", exitPlane);
buttons.reset.addEventListener("click", resetGame);
buttons.classScore.addEventListener("click", addScoreToClass);
buttons.meScore.addEventListener("click", addScoreToMe);

bindStick();
renderStudentScores();
resize();
animate();
