import * as THREE from "./assets/three.module.js";

const canvas = document.querySelector("#cityCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbbe9ff);
scene.fog = new THREE.Fog(0xbbe9ff, 90, 260);

const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 600);
const clock = new THREE.Clock();

const hemi = new THREE.HemisphereLight(0xffffff, 0x5f7a65, 1.55);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff6da, 2.8);
sun.position.set(-42, 86, 34);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -110;
sun.shadow.camera.right = 110;
sun.shadow.camera.top = 110;
sun.shadow.camera.bottom = -110;
scene.add(sun);

const mat = {
  grass: new THREE.MeshStandardMaterial({ color: 0x66aa70, roughness: 0.86 }),
  asphalt: new THREE.MeshStandardMaterial({ color: 0x2a3440, roughness: 0.72 }),
  sidewalk: new THREE.MeshStandardMaterial({ color: 0xc9d1d5, roughness: 0.82 }),
  water: new THREE.MeshStandardMaterial({ color: 0x45b8df, roughness: 0.3, metalness: 0.05 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x7fd3e6, roughness: 0.26, metalness: 0.22 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf7f5ed, roughness: 0.56 }),
  teal: new THREE.MeshStandardMaterial({ color: 0x087f8c, roughness: 0.5 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xffc857, roughness: 0.5 }),
  red: new THREE.MeshStandardMaterial({ color: 0xe45757, roughness: 0.62 }),
  rail: new THREE.MeshStandardMaterial({ color: 0x6d6a65, roughness: 0.42 }),
  route: new THREE.LineBasicMaterial({ color: 0x28ff8a, linewidth: 4 })
};

const ui = {
  status: document.querySelector("#statusText"),
  compass: document.querySelector("#compass"),
  destGrid: document.querySelector("#destinationGrid"),
  modeGrid: document.querySelector("#modeGrid"),
  modeText: document.querySelector("#modeText"),
  destText: document.querySelector("#destText"),
  distanceText: document.querySelector("#distanceText"),
  cameraText: document.querySelector("#cameraText"),
  assistantCard: document.querySelector("#assistantCard"),
  go: document.querySelector("#goButton"),
  reset: document.querySelector("#resetButton")
};

const state = {
  pos: new THREE.Vector3(0, 0, 0),
  heading: -Math.PI / 2,
  cameraDistance: 14,
  pitch: 0.18,
  mode: "walk",
  destination: null,
  route: null,
  routeTime: 0,
  routeDuration: 1,
  keys: new Set(),
  drag: null,
  walkPulse: 0
};

const modeNames = {
  walk: "走路",
  taxi: "打车",
  metro: "地铁",
  rail: "高铁",
  plane: "飞机"
};

const destinations = [
  {
    key: "tower",
    name: "天空观景塔",
    type: "景点",
    pos: [4, 0, -24],
    ticket: "现场机和手机都可以买票。高峰时先选时间段，再进电梯排队上观景层。",
    hotel: "想看夜景就订观景塔东边的高层酒店；想省钱就住地铁三站外。",
    play: "先到一楼展厅，再上观景层。傍晚去最漂亮，城市灯会一层一层亮起来。",
    history: "这座塔在游戏里是星湾城的第一座观景塔，设计灵感是海风、玻璃幕墙和城市天际线。"
  },
  {
    key: "museum",
    name: "海湾博物馆",
    type: "景点",
    pos: [-32, 0, 8],
    ticket: "普通票可以当天买，亲子讲解票要提前预约。进门会安检，水和零食放包里。",
    hotel: "附近适合住河岸酒店，早上可以走路到博物馆和码头。",
    play: "先看城市模型厅，再看古船和航海厅，最后去纪念品商店。",
    history: "博物馆讲的是星湾城从渔港变成大城市的故事，所以旁边保留了一条蓝色河道。"
  },
  {
    key: "mall",
    name: "中央商场",
    type: "商场",
    pos: [24, 0, -7],
    ticket: "商场不用门票。坐地铁到中央广场站，从 B 口出来最近。",
    hotel: "商场楼上有城市酒店，适合第一天刚到的时候住，吃饭和买东西都方便。",
    play: "先去游客中心拿地图，再上楼吃饭。想买伴手礼就去二楼城市礼物店。",
    history: "中央商场是星湾城最早的商业中心之一，后来加了玻璃中庭和屋顶花园。"
  },
  {
    key: "hotel",
    name: "云顶酒店",
    type: "酒店",
    pos: [12, 0, 22],
    ticket: "订酒店时先看取消规则，再看早餐、机场接送和离地铁站距离。",
    hotel: "选双床房适合和朋友住；想看城市夜景就选高楼层。",
    play: "入住后先放行李，再去旁边美食街。晚上可以回酒店看城市灯光。",
    history: "云顶酒店是游戏里的旅行基地，楼下有出租车点，旁边有地铁和便利店。"
  },
  {
    key: "westAirport",
    name: "西城国际机场",
    type: "机场",
    pos: [-58, 0, 45],
    ticket: "国内航班提前到，国际航班更早到。先看航站楼，再值机、托运行李、过安检。",
    hotel: "早班机可以住机场酒店，步行或接驳车到航站楼。",
    play: "可以看跑道、廊桥和飞机滑行。坐飞机模式会沿绿色航线飞到另一座机场。",
    history: "西城国际机场有两条跑道，是星湾城远距离航班的主要机场。"
  },
  {
    key: "eastAirport",
    name: "东海第二机场",
    type: "机场",
    pos: [60, 0, -39],
    ticket: "第二机场多是短途和海岛航班。先确认机场名字，别跑错机场。",
    hotel: "赶早班可以住机场旁边；想玩市区就住地铁换乘站附近。",
    play: "从这里可以看到海、跑道灯和城市边缘。飞机会从一座机场飞到另一座机场。",
    history: "东海第二机场建在海边，游戏里用来表现城市另一头的机场。"
  },
  {
    key: "rail",
    name: "高铁中央站",
    type: "高铁",
    pos: [-8, 0, 38],
    ticket: "高铁票要选车次、座位和出发站。进站先刷证件，再看候车口。",
    hotel: "赶高铁住车站附近最省时间，但晚上会比较热闹。",
    play: "站台可以看高铁进站。坐高铁会沿银色轨道穿过城市。",
    history: "高铁中央站把机场、市中心和新区连起来，是星湾城最快的陆上交通。"
  },
  {
    key: "oldGate",
    name: "中央古城门",
    type: "名胜",
    pos: [-20, 0, 17],
    ticket: "外面广场免费，登城门需要买小门票。学生票要带证件。",
    hotel: "附近老街酒店比较有味道，但房间会小一点。",
    play: "白天看城门细节，晚上看灯光。旁边有老街小吃和纪念章。",
    history: "古城门是星湾城还没变成现代都市前留下的建筑，后来周围长出了高楼。"
  }
];

const destinationMap = new Map(destinations.map((item) => [item.key, item]));
const world = new THREE.Group();
scene.add(world);

function box(name, size, pos, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
  mesh.name = name;
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  world.add(mesh);
  return mesh;
}

function cyl(name, radius, height, pos, material, segments = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
  mesh.name = name;
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  world.add(mesh);
  return mesh;
}

function label(text, pos, color = "#102b36") {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "rgba(16,43,54,0.35)";
  ctx.lineWidth = 8;
  ctx.roundRect(14, 18, 484, 92, 18);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = "900 42px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(c);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.position.set(pos[0], pos[1], pos[2]);
  sprite.scale.set(9, 2.25, 1);
  world.add(sprite);
  return sprite;
}

function seedRandom(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function createGround() {
  box("grass ground", [220, 0.4, 170], [0, -0.22, 0], mat.grass, false);
  box("river", [16, 0.18, 170], [-43, -0.07, 0], mat.water, false);
  box("main road north south", [8, 0.12, 140], [0, 0.01, 0], mat.asphalt, false);
  box("main road east west", [170, 0.12, 8], [0, 0.02, 0], mat.asphalt, false);
  box("airport highway", [180, 0.1, 5], [6, 0.03, -30], mat.asphalt, false);
  box("hotel avenue", [118, 0.1, 5], [0, 0.04, 31], mat.asphalt, false);
  for (let x = -80; x <= 80; x += 20) box("side road", [3.5, 0.08, 120], [x, 0.05, 3], mat.sidewalk, false);
  for (let z = -55; z <= 55; z += 22) box("side road", [150, 0.08, 3.5], [4, 0.06, z], mat.sidewalk, false);
  box("rail track base", [150, 0.16, 2.2], [-5, 0.18, 54], mat.rail, false);
  box("rail silver left", [150, 0.24, 0.35], [-5, 0.45, 52.8], mat.white, false);
  box("rail silver right", [150, 0.24, 0.35], [-5, 0.45, 55.2], mat.white, false);
}

function createBuildings() {
  const rnd = seedRandom(42);
  const colors = [0x7fd3e6, 0xd9e1e6, 0x9aa7b1, 0x2f6f82, 0xf0d19a, 0xbfd7ea];
  for (let i = 0; i < 86; i += 1) {
    const x = -70 + rnd() * 140;
    const z = -56 + rnd() * 112;
    if (Math.abs(x) < 8 || Math.abs(z) < 8 || Math.abs(x + 43) < 10 || (x < -62 && z > 31) || (x > 64 && z < -28)) continue;
    const h = 7 + rnd() * 34;
    const w = 4 + rnd() * 7;
    const d = 4 + rnd() * 7;
    const material = new THREE.MeshStandardMaterial({ color: colors[Math.floor(rnd() * colors.length)], roughness: 0.46, metalness: rnd() * 0.18 });
    const b = box("city tower", [w, h, d], [x, h / 2, z], material);
    if (i % 3 === 0) {
      box("roof sign", [w * 0.68, 0.45, 0.28], [x, h + 0.42, z - d / 2 - 0.08], mat.gold);
    }
  }
}

function createAirport(key, x, z, rot, labelText) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rot;
  world.add(group);
  const runway = new THREE.Mesh(new THREE.BoxGeometry(54, 0.14, 7), mat.asphalt);
  runway.position.y = 0.12;
  runway.receiveShadow = true;
  group.add(runway);
  for (let i = -24; i <= 24; i += 8) {
    const mark = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, 0.32), mat.white);
    mark.position.set(i, 0.26, 0);
    group.add(mark);
  }
  const terminal = new THREE.Mesh(new THREE.BoxGeometry(19, 5.5, 11), mat.glass);
  terminal.position.set(0, 2.85, 12);
  terminal.castShadow = true;
  group.add(terminal);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(1.25, 3, 24), mat.white);
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(-9, 1.1, -5);
  group.add(nose);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 9, 24), mat.white);
  body.rotation.z = Math.PI / 2;
  body.position.set(-4.5, 1.1, -5);
  group.add(body);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(4, 0.18, 9), mat.teal);
  wing.position.set(-4.5, 1.1, -5);
  group.add(wing);
  label(labelText, [x, 10.5, z + (z > 0 ? 16 : -16)], "#087f8c");
  return destinationMap.get(key);
}

function createLandmarks() {
  cyl("tower stem", 2.2, 42, [4, 21, -34], mat.glass, 40);
  cyl("tower deck", 7.5, 2.4, [4, 36, -34], mat.gold, 40);
  label("天空观景塔", [4, 45, -34]);
  box("museum", [18, 7, 14], [-32, 3.6, -4], mat.white);
  cyl("museum dome", 8, 5, [-32, 9.4, -4], mat.glass, 48);
  label("海湾博物馆", [-32, 15, -4]);
  box("mall", [24, 10, 18], [24, 5.1, 7], mat.gold);
  box("mall atrium", [8, 13, 8], [24, 6.7, 7], mat.glass);
  label("中央商场", [24, 16, 7]);
  box("hotel", [14, 34, 12], [12, 17, 32], mat.glass);
  box("hotel cap", [16, 2, 14], [12, 35, 32], mat.teal);
  label("云顶酒店", [12, 41, 32]);
  box("rail station", [24, 7, 10], [-8, 3.6, 48], mat.white);
  box("rail roof", [28, 1, 12], [-8, 7.6, 48], mat.teal);
  label("高铁中央站", [-8, 13, 48]);
  box("old gate left", [4, 14, 5], [-25, 7, 25], mat.red);
  box("old gate right", [4, 14, 5], [-15, 7, 25], mat.red);
  box("old gate top", [16, 4, 5], [-20, 14.6, 25], mat.gold);
  label("中央古城门", [-20, 21, 25]);
  createAirport("westAirport", -78, 45, -0.35, "西城国际机场");
  createAirport("eastAirport", 82, -42, 0.28, "东海第二机场");
}

function createStationsAndCrowds() {
  const stations = [
    [-20, -31], [0, -29], [26, -31], [-30, 0], [0, 0], [31, 0],
    [-24, 31], [0, 31], [28, 31], [-50, 22], [48, -24], [54, 18]
  ];
  stations.forEach(([x, z], index) => {
    cyl("metro station", 1.3, 0.35, [x, 0.35, z], mat.teal, 24);
    label(`M${index + 1}`, [x, 2.9, z], "#0b3142").scale.set(3.2, 0.82, 1);
  });
  const rnd = seedRandom(10);
  for (let i = 0; i < 72; i += 1) {
    const x = -55 + rnd() * 110;
    const z = -42 + rnd() * 88;
    if (Math.abs(x) < 5 || Math.abs(z) < 5) continue;
    const person = new THREE.Group();
    person.position.set(x, 0, z);
    person.rotation.y = rnd() * Math.PI * 2;
    const shirt = new THREE.MeshStandardMaterial({ color: [0xe95d5d, 0x387bd8, 0xffc857, 0x32a875, 0xf7f5ed][i % 5], roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 1.25, 12), shirt);
    body.position.y = 1.05;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), new THREE.MeshStandardMaterial({ color: 0xe2b48c, roughness: 0.8 }));
    head.position.y = 1.88;
    person.add(body, head);
    world.add(person);
  }
}

function createAvatar() {
  const group = new THREE.Group();
  const clothes = new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.72 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xe4b38b, roughness: 0.72 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.0, 8, 16), clothes);
  body.position.y = 1.15;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), skin);
  head.position.y = 2.05;
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 0.52), mat.teal);
  backpack.position.set(0, 1.22, 0.42);
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 0.2), mat.deep || mat.teal);
  const rightLeg = leftLeg.clone();
  leftLeg.position.set(-0.18, 0.43, 0);
  rightLeg.position.set(0.18, 0.43, 0);
  group.add(body, head, backpack, leftLeg, rightLeg);
  scene.add(group);
  return group;
}

mat.deep = new THREE.MeshStandardMaterial({ color: 0x113847, roughness: 0.72 });
const avatar = createAvatar();

let routeLine = null;

function createRoute(target) {
  if (routeLine) {
    world.remove(routeLine);
    routeLine.geometry.dispose();
  }
  const start = state.pos.clone();
  const end = new THREE.Vector3(target.pos[0], 0, target.pos[2]);
  const routeY = state.mode === "plane" ? 18 : state.mode === "metro" ? 2.1 : 0.8;
  const roadZ = state.mode === "rail" ? 54 : target.type === "机场" ? (end.z > 0 ? 31 : -30) : 0;
  const points = [
    start.clone().setY(0.7),
    new THREE.Vector3(start.x, routeY, roadZ),
    new THREE.Vector3(end.x, routeY, roadZ),
    end.clone().setY(0.7)
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const samples = curve.getPoints(70);
  const geometry = new THREE.BufferGeometry().setFromPoints(samples);
  routeLine = new THREE.Line(geometry, mat.route);
  world.add(routeLine);
  state.route = { start, end, curve, target };
  state.routeTime = 0;
  const distance = start.distanceTo(end);
  const speed = { walk: 7, taxi: 22, metro: 34, rail: 46, plane: 55 }[state.mode];
  state.routeDuration = Math.max(1.5, distance / speed);
  showAssistant("play");
}

function setDestination(key) {
  state.destination = destinationMap.get(key);
  [...ui.destGrid.querySelectorAll("button")].forEach((button) => {
    button.classList.toggle("active", button.dataset.dest === key);
  });
  ui.destText.textContent = state.destination.name;
  ui.status.textContent = `目的地改成 ${state.destination.name}。选择交通方式后点“按路线出发”。`;
  createRoute(state.destination);
}

function setMode(mode) {
  state.mode = mode;
  ui.modeText.textContent = modeNames[mode];
  [...ui.modeGrid.querySelectorAll("button")].forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  if (state.destination) createRoute(state.destination);
}

function showAssistant(topic) {
  const dest = state.destination || destinations[0];
  const titles = {
    ticket: `${dest.name}：怎么买票`,
    hotel: `${dest.name}：怎么订酒店`,
    play: `${dest.name}：怎么玩`,
    history: `${dest.name}：讲点历史`
  };
  ui.assistantCard.innerHTML = `<h3>${titles[topic]}</h3><p>${dest[topic]}</p>`;
}

function buildUi() {
  destinations.forEach((dest) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.dest = dest.key;
    button.innerHTML = `${dest.name}<br><small>${dest.type}</small>`;
    button.addEventListener("click", () => setDestination(dest.key));
    ui.destGrid.appendChild(button);
  });
  ui.modeGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (button) setMode(button.dataset.mode);
  });
  document.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => showAssistant(button.dataset.topic));
  });
  ui.go.addEventListener("click", () => {
    if (!state.destination) setDestination("tower");
    createRoute(state.destination);
    ui.status.textContent = `${modeNames[state.mode]}出发，绿色线会带你去 ${state.destination.name}。`;
  });
  ui.reset.addEventListener("click", () => {
    state.pos.set(0, 0, 0);
    state.heading = -Math.PI / 2;
    state.route = null;
    if (routeLine) routeLine.visible = false;
    ui.status.textContent = "已经回到市中心。可以重新选择目的地。";
  });
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / Math.max(1, rect.height);
  camera.updateProjectionMatrix();
}

function inputSetup() {
  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (event) => state.keys.add(event.key.toLowerCase()));
  window.addEventListener("keyup", (event) => state.keys.delete(event.key.toLowerCase()));
  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    state.drag = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!state.drag) return;
    const dx = event.clientX - state.drag.x;
    const dy = event.clientY - state.drag.y;
    state.heading -= dx * 0.006;
    state.pitch = THREE.MathUtils.clamp(state.pitch + dy * 0.003, -0.2, 0.72);
    state.drag = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener("pointerup", () => {
    state.drag = null;
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    state.cameraDistance = THREE.MathUtils.clamp(state.cameraDistance + event.deltaY * 0.012, 1.2, 24);
  }, { passive: false });
  document.querySelectorAll("[data-move]").forEach((button) => {
    const keyMap = { forward: "w", back: "s", left: "a", right: "d" };
    const add = () => state.keys.add(keyMap[button.dataset.move]);
    const remove = () => state.keys.delete(keyMap[button.dataset.move]);
    button.addEventListener("pointerdown", add);
    button.addEventListener("pointerup", remove);
    button.addEventListener("pointercancel", remove);
    button.addEventListener("pointerleave", remove);
  });
}

function updateMovement(dt) {
  const forward = new THREE.Vector3(Math.sin(state.heading), 0, Math.cos(state.heading));
  const side = new THREE.Vector3(Math.cos(state.heading), 0, -Math.sin(state.heading));
  let moved = false;
  if (state.keys.has("arrowleft") || state.keys.has("q")) state.heading += dt * 1.8;
  if (state.keys.has("arrowright") || state.keys.has("e")) state.heading -= dt * 1.8;
  if (state.keys.has("a")) state.pos.addScaledVector(side, -dt * 8);
  if (state.keys.has("d")) state.pos.addScaledVector(side, dt * 8);
  if (state.keys.has("w") || state.keys.has("arrowup")) {
    state.pos.addScaledVector(forward, dt * 9);
    moved = true;
  }
  if (state.keys.has("s") || state.keys.has("arrowdown")) {
    state.pos.addScaledVector(forward, -dt * 7);
    moved = true;
  }
  state.pos.x = THREE.MathUtils.clamp(state.pos.x, -100, 100);
  state.pos.z = THREE.MathUtils.clamp(state.pos.z, -75, 75);
  if (moved) state.route = null;
  state.walkPulse += moved ? dt * 9 : dt * 2;
}

function updateRoute(dt) {
  if (!state.route) return;
  state.routeTime += dt;
  const t = Math.min(1, state.routeTime / state.routeDuration);
  const point = state.route.curve.getPoint(t);
  state.pos.set(point.x, 0, point.z);
  if (t >= 1) {
    ui.status.textContent = `到达 ${state.route.target.name}。现在可以问怎么买票、订酒店、怎么玩或讲历史。`;
    state.route = null;
  }
}

function updateCamera() {
  avatar.position.copy(state.pos);
  avatar.rotation.y = state.heading;
  avatar.children[3].rotation.x = Math.sin(state.walkPulse) * 0.22;
  avatar.children[4].rotation.x = -Math.sin(state.walkPulse) * 0.22;
  avatar.visible = state.cameraDistance > 2.4;

  const behind = new THREE.Vector3(-Math.sin(state.heading), 0, -Math.cos(state.heading));
  const camPos = state.pos.clone()
    .addScaledVector(behind, state.cameraDistance)
    .add(new THREE.Vector3(0, 2.6 + state.cameraDistance * 0.2, 0));
  camera.position.copy(camPos);
  camera.lookAt(state.pos.x, 1.5 + state.pitch * 5, state.pos.z);
}

function updateStats() {
  const headingDeg = ((state.heading * 180 / Math.PI) % 360 + 360) % 360;
  const dirs = ["北城", "西城", "南城", "东城"];
  ui.compass.textContent = `面向${dirs[Math.round(headingDeg / 90) % 4]}`;
  if (state.destination) {
    const dist = state.pos.distanceTo(new THREE.Vector3(state.destination.pos[0], 0, state.destination.pos[2]));
    ui.distanceText.textContent = `${Math.round(dist * 12)} m`;
  } else {
    ui.distanceText.textContent = "0 m";
  }
  ui.cameraText.textContent = state.cameraDistance > 14 ? "远景" : state.cameraDistance < 3 ? "近看" : "跟随";
}

function animate() {
  const dt = Math.min(0.04, clock.getDelta());
  updateMovement(dt);
  updateRoute(dt);
  updateCamera();
  updateStats();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

createGround();
createBuildings();
createLandmarks();
createStationsAndCrowds();
buildUi();
inputSetup();
resize();
setDestination("tower");
animate();
