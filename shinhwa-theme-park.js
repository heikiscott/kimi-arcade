import * as THREE from "./assets/three.module.js";

const canvas = document.querySelector("#parkCanvas");
const statusText = document.querySelector("#statusText");
const nearName = document.querySelector("#nearName");
const nearInfo = document.querySelector("#nearInfo");
const rideList = document.querySelector("#rideList");
const moveStick = document.querySelector("#moveStick");
const moveKnob = document.querySelector("#moveKnob");
const buttons = {
  ride: document.querySelector("#rideBtn"),
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
    info: "旋转过山车，慢慢爬升后俯冲，能看到济州海风和森林。"
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
    info: "戴 3D 眼镜的室内射击馆，坐小车找隐藏目标。"
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
const velocity = new THREE.Vector3();
const viewState = {
  pitch: 0,
  targetPitch: 0,
  distance: 12,
  targetDistance: 12
};
const clock = new THREE.Clock();
const interactive = [];
let nearest = null;
let riding = null;
let selectedIndex = 0;
const entrance = {
  ticketChecked: false,
  friend: null,
  inspector: null,
  gateArms: []
};
const crowdVisitors = [];

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
  const ground = box("park-ground", [92, 0.7, 96], [0, -0.36, 8], materials.grass);
  ground.receiveShadow = true;
  box("main-path", [10, 0.08, 92], [0, 0.03, 10], materials.path);
  box("cross-path", [78, 0.09, 9], [0, 0.05, 8], materials.path);
  box("entrance-plaza", [34, 0.1, 14], [0, 0.06, 54], materials.path);
  box("water-lake", [21, 0.06, 14], [34, 0.08, -36], materials.water);

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
  rideData.forEach((ride, index) => addAttraction(ride, index));
  addCrowdVisitors(320);
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

function addParkWorkers() {
  const workerSpots = [
    { name: "Dancing Oscar 工作员", position: [-23, 0, -16], rotation: 1.25, shirt: 0xffd15f, cap: 0xd93a32 },
    { name: "Oscar Spin Bomb 工作员", position: [4.5, 0, -18], rotation: -0.8, shirt: 0x75c9bf, cap: 0xeaa46d },
    { name: "Spinning Oscar 工作员", position: [-1.8, 0, 20.5], rotation: 0.5, shirt: 0xb46d58, cap: 0xffd15f },
    { name: "室内馆工作员", position: [-12, 0, 8.7], rotation: 1.4, shirt: 0x274b76, cap: 0x274b76 },
    { name: "商店工作员", position: [37.8, 0, 22], rotation: -Math.PI / 2, shirt: 0xd93a32, cap: 0xffffff },
    { name: "巡园工作员", position: [-9, 0, 36], rotation: 0.2, shirt: 0x39a657, cap: 0xffd15f }
  ];
  workerSpots.forEach((spot) => {
    const worker = createPerson({
      name: spot.name,
      position: spot.position,
      rotation: spot.rotation,
      shirt: spot.shirt,
      pants: 0x172632,
      cap: spot.cap,
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

  const points = [
    new THREE.Vector3(-8, 1.2, 4),
    new THREE.Vector3(-4, 8, 0),
    new THREE.Vector3(3, 5, -5),
    new THREE.Vector3(8, 1.7, -1),
    new THREE.Vector3(2, 4, 6),
    new THREE.Vector3(-8, 1.2, 4)
  ];
  const curve = new THREE.CatmullRomCurve3(points, true);
  const track = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.18, 10, true), materials.steel);
  track.castShadow = true;
  group.add(track);
  const rail2 = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.07, 8, true), makeMat(ride.color));
  rail2.position.y = 0.5;
  group.add(rail2);
  for (let i = 0; i < 7; i += 1) {
    cyl("coaster-support", 0.12, 5.5, [-7 + i * 2.4, 2.8, -2 + Math.sin(i) * 5], materials.steel, group, 8);
  }
  const car = new THREE.Group();
  box("spinning-coaster-car-body", [2.4, 0.85, 1.75], [0, 0.45, 0], makeMat(0xffd15f), car);
  box("spinning-coaster-seat-back", [2.1, 0.75, 0.18], [0, 0.9, 0.62], materials.dark, car);
  box("spinning-coaster-front", [2.1, 0.45, 0.18], [0, 0.68, -0.72], makeMat(0xa8ddd0), car);
  addSeatedRider(car, [-0.48, 0.75, 0.04], 1.05, 0x245b8f);
  addSeatedRider(car, [0.48, 0.75, 0.04], 1.05, 0xf06aa3);
  car.position.set(0, 2, 0);
  car.userData.curve = curve;
  group.add(car);
  group.userData.seats.push(car);
}

function buildSpinBump(group, ride) {
  const marquee = new THREE.Group();
  marquee.position.set(0, 0, 6.8);
  box("spin-marquee", [10, 2.2, 0.42], [0, 3.4, 0], makeMat(0xffb2a1), marquee);
  for (let i = 0; i < 18; i += 1) {
    sphere("spin-marquee-bulb", 0.13, [-4.4 + i * 0.52, 4.1, -0.28], makeMat(i % 2 ? 0xffd15f : 0xffffff), marquee, 8);
  }
  group.add(marquee);

  const arm = new THREE.Group();
  group.userData.rotor = arm;
  cyl("spin-center", 0.9, 5, [0, 2.5, 0], makeMat(0x75c9bf), arm);
  const disc = cyl("spin-disc", 5.5, 0.55, [0, 3.4, 0], makeMat(0xeaa46d), arm, 64);
  disc.rotation.x = Math.PI / 2;
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2;
    const seatGroup = new THREE.Group();
    seatGroup.position.set(Math.cos(angle) * 4.2, 3.9, Math.sin(angle) * 4.2);
    seatGroup.lookAt(0, 3.9, 0);
    box("spin-pod-orange-front", [1.35, 0.85, 0.72], [0, 0.25, -0.3], makeMat(0xf0a16b), seatGroup);
    box("spin-pod-turquoise-back", [1.35, 1.05, 0.76], [0, 0.38, 0.35], makeMat(0x75c9bf), seatGroup);
    box("spin-black-seat", [1, 0.88, 0.2], [0, 0.58, 0.76], materials.dark, seatGroup);
    box("spin-safety-bar", [1.25, 0.12, 0.12], [0, 0.88, -0.48], materials.dark, seatGroup);
    addSeatedRider(seatGroup, [-0.32, 0.76, 0.08], 0.82, 0xffffff);
    addSeatedRider(seatGroup, [0.32, 0.76, 0.08], 0.82, 0x245b8f);
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
  }
  group.add(rotor);
}

function buildDarkRide(group, ride) {
  const wallMat = makeMat(0x222b35);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x172632, roughness: 0.36, metalness: 0.1, transparent: true, opacity: 0.78 });
  const lightMat = new THREE.MeshStandardMaterial({ color: 0x80f5ff, emissive: 0x38d5ff, emissiveIntensity: 0.65, roughness: 0.18 });
  box("dark-ride-back-wall", [12, 6, 0.45], [0, 3, -4.5], wallMat, group);
  box("dark-ride-left-wall", [0.45, 6, 9], [-6, 3, 0], wallMat, group);
  box("dark-ride-right-glass-wall", [0.24, 5.4, 9], [6, 3, 0], materials.glass, group);
  box("dark-ride-cutaway-roof", [12.8, 0.45, 9.6], [0, 6.25, 0], roofMat, group);
  box("dark-ride-floor", [11.4, 0.2, 8.4], [0, 0.3, 0], makeMat(0x303b45), group);
  box("dark-ride-door", [4, 3.4, 0.25], [0, 1.7, 4.65], makeMat(0xffd15f), group);
  box("dome-screen", [7, 3.3, 0.2], [0, 4.2, -4.65], materials.glass, group);
  label("室内项目 · 3D THEATER", [ride.position[0], 7.6, ride.position[2] + 2.2], 36, 6.8, 1.0);
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const cart = box("dark-ride-car", [1.15, 0.75, 1.2], [-2.6 + col * 2.6, 0.9, 1.9 - row * 1.55], makeMat(col % 2 ? 0xd93a32 : 0x245b8f), group);
      box("dark-ride-seat-back", [1, 0.85, 0.15], [0, 0.6, 0.45], materials.dark, cart);
    }
  }
  for (let i = 0; i < 6; i += 1) {
    sphere("dark-ride-ceiling-light", 0.2, [-4.5 + i * 1.8, 5.72, -1.8 + (i % 2) * 2.4], lightMat, group, 10);
  }
  for (let i = 0; i < 5; i += 1) {
    const target = sphere("shooting-target", 0.35, [-4 + i * 2, 3.2 + (i % 2), 4.9], makeMat(i % 2 ? 0xf06aa3 : 0x39a657), group);
    target.userData.float = i;
  }
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
    box("train-car", [1.3, 1.1, 1.7], [-i * 1.45, 1, 0], makeMat(i === 0 ? ride.color : 0xffd15f), train);
  }
  group.add(train);
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
box("player-bag", [1.15, 1, 0.22], [0, 1.35, 0.62], makeMat(0x172632), player);
player.scale.setScalar(0.78);
scene.add(player);
label("我", [0, 3.35, 61], 42, 1.25, 0.78);

function createPerson(config) {
  const person = new THREE.Group();
  person.position.set(config.position[0], config.position[1], config.position[2]);
  person.rotation.y = config.rotation || 0;
  const body = cyl(`${config.name}-body`, 0.62, 1.35, [0, 1.35, 0], makeMat(config.shirt || 0x39a657), person, 18);
  body.scale.x = 0.84;
  sphere(`${config.name}-head`, 0.5, [0, 2.23, 0], makeMat(0xf1bd8c), person);
  box(`${config.name}-hair`, [0.78, 0.2, 0.66], [0, 2.62, 0.03], makeMat(config.hair || 0x2b2118), person);
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
  box("visitor-eye-left", [0.035, 0.025, 0.012], [-0.075, 1.44, -0.205], materials.dark, visitor);
  box("visitor-eye-right", [0.035, 0.025, 0.012], [0.075, 1.44, -0.205], materials.dark, visitor);
  box("visitor-neutral-mouth", [0.11, 0.012, 0.012], [0, 1.36, -0.212], materials.dark, visitor);
  box("visitor-leg-left", [0.12, 0.48, 0.12], [-0.09, 0.34, 0], pants, visitor);
  box("visitor-leg-right", [0.12, 0.48, 0.12], [0.09, 0.34, 0], pants, visitor);
  visitor.scale.setScalar(config.scale || 1);
  return visitor;
}

function addCrowdVisitors(count) {
  const shirts = [0xd93a32, 0x245b8f, 0xffd15f, 0x39a657, 0xf06aa3, 0x7c4dff, 0xffffff];
  const pants = [0x172632, 0x245b8f, 0x5b4636, 0x303b45];
  const hairs = [0x2b2118, 0x523923, 0x111111, 0x7b4f2a];
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
  selectedIndex = index;
  const ride = rideData[index];
  player.position.set(ride.position[0], 0, ride.position[2] + 9);
  player.rotation.y = Math.PI;
  statusText.textContent = `已经走到 ${ride.name} 前面。点“乘坐最近项目”就可以体验。`;
  updateRideList();
}

function rideNearest() {
  if (!entrance.ticketChecked && player.position.z > 51) {
    statusText.textContent = "检票员说：先点“检票入园”，检完票才能去坐项目。";
    return;
  }
  if (!nearest) return;
  riding = nearest;
  statusText.textContent = `正在乘坐 ${riding.userData.ride.name}。镜头会跟着项目动，点“下车”回到地面。`;
}

function checkTicket() {
  const distance = player.position.distanceTo(new THREE.Vector3(0, 0, 57));
  if (distance > 9) {
    statusText.textContent = "先走到大门检票口旁边，检票员才能帮你刷票。";
    return;
  }
  entrance.ticketChecked = true;
  entrance.gateArms.forEach((arm, index) => {
    arm.rotation.y = index === 0 ? Math.PI / 2 : -Math.PI / 2;
    arm.material = makeMat(0x39a657);
  });
  buttons.ticket.textContent = "已检票";
  statusText.textContent = "检票员已经刷票，闸机打开了。你和朋友可以一起进园。";
}

function leaveRide() {
  if (!riding) return;
  const ride = riding.userData.ride;
  player.position.set(ride.position[0] + 7, 0, ride.position[2] + 7);
  riding = null;
  statusText.textContent = "已经下车了，可以继续在乐园里面走。";
}

function moveNextRide() {
  selectedIndex = (selectedIndex + 1) % rideData.length;
  focusRide(selectedIndex);
}

function resetPlayer() {
  riding = null;
  player.position.set(0, 0, 61);
  player.rotation.y = Math.PI;
  entrance.ticketChecked = false;
  entrance.gateArms.forEach((arm, index) => {
    arm.rotation.y = index === 0 ? 0.28 : -0.28;
    arm.material = makeMat(0xd93a32);
  });
  buttons.ticket.textContent = "检票入园";
  statusText.textContent = "回到入口。你和朋友站在检票口前，先找检票员检票。";
}

function updateNearest() {
  if (player.position.z > 51 && !entrance.ticketChecked) {
    nearest = null;
    nearName.textContent = "入口检票口";
    nearInfo.textContent = "检票员在右边，点“检票入园”后闸机会打开。";
    updateRideList();
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
    nearName.textContent = ride.name;
    nearInfo.textContent = `${ride.zone} · ${ride.info}`;
    selectedIndex = rideData.findIndex((item) => item.id === ride.id);
  } else {
    const atGate = player.position.z > 51;
    nearName.textContent = atGate ? "入口检票口" : "附近没有项目";
    nearInfo.textContent = atGate ? "检票员在右边，点“检票入园”后闸机会打开。" : "沿着黄色道路走，靠近设施后就能乘坐。";
  }
  updateRideList();
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
    group.userData.motion += delta;
    if (group.userData.rotor) {
      group.userData.rotor.rotation.y += delta * (0.45 + (group.userData.ride.id.length % 4) * 0.18);
      group.userData.rotor.position.y = Math.sin(elapsed * 1.4 + group.position.x) * 0.18;
    }
    if (group.userData.train) {
      const t = (elapsed * 0.08) % 1;
      const angle = t * Math.PI * 2;
      group.userData.train.position.set(Math.cos(angle) * 7.4, 0.75, Math.sin(angle) * 4.7);
      group.userData.train.rotation.y = -angle + Math.PI / 2;
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
  viewState.pitch = THREE.MathUtils.lerp(viewState.pitch, viewState.targetPitch, 0.08);
  viewState.distance = THREE.MathUtils.lerp(viewState.distance, viewState.targetDistance, 0.08);
  const lookHeight = THREE.MathUtils.clamp(2 + viewState.pitch * 18, 0.8, 18);
  const target = new THREE.Vector3();
  if (riding) {
    const ride = riding.userData.ride;
    const circle = elapsed * 1.2;
    target.set(ride.position[0], 3 + viewState.pitch * 9, ride.position[2]);
    camera.position.lerp(new THREE.Vector3(ride.position[0] + Math.cos(circle) * 11, 8 + viewState.pitch * 5 + Math.sin(circle * 1.7) * 2, ride.position[2] + Math.sin(circle) * 11), 0.08);
    camera.lookAt(target);
    return;
  }

  if (!entrance.ticketChecked && player.position.z > 51) {
    const desired = new THREE.Vector3(0, 58 + viewState.pitch * 12, 62 + viewState.distance * 0.18);
    camera.position.lerp(desired, 0.12);
    camera.lookAt(new THREE.Vector3(0, lookHeight, 26));
    return;
  }

  const forward = new THREE.Vector3(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));
  const desired = player.position.clone().sub(forward.multiplyScalar(viewState.distance));
  desired.y = 9.4 + viewState.pitch * 3.2;
  desired.x += Math.cos(elapsed * 0.7) * 0.08;
  camera.position.lerp(desired, 0.12);
  target.copy(player.position);
  target.y = lookHeight;
  camera.lookAt(target);
}

function nudgeView(action) {
  if (action === "lookUp") viewState.targetPitch = THREE.MathUtils.clamp(viewState.targetPitch + 0.16, -0.42, 0.85);
  if (action === "lookDown") viewState.targetPitch = THREE.MathUtils.clamp(viewState.targetPitch - 0.16, -0.42, 0.85);
  if (action === "zoomIn") viewState.targetDistance = THREE.MathUtils.clamp(viewState.targetDistance - 1.7, 7.5, 22);
  if (action === "zoomOut") viewState.targetDistance = THREE.MathUtils.clamp(viewState.targetDistance + 1.7, 7.5, 22);
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
  updateCamera(elapsed);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function setupInput() {
  window.addEventListener("keydown", (event) => {
    keys.add(event.key.toLowerCase());
    if (event.key === "Enter") rideNearest();
    if (event.key === "Escape") leaveRide();
  });
  window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      nudgeView(viewButton.dataset.view);
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
  buttons.ticket.addEventListener("click", checkTicket);
  buttons.leave.addEventListener("click", leaveRide);
  buttons.next.addEventListener("click", moveNextRide);
  buttons.reset.addEventListener("click", resetPlayer);
}

buildWorld();
setupInput();
updateRideList();
animate();
