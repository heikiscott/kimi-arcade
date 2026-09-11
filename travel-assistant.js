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
  legTime: 0,
  keys: new Set(),
  drag: null,
  walkPulse: 0,
  riding: false
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
    name: "东方明珠广播电视塔",
    type: "景点",
    pos: [4, 0, -24],
    ticket: "可以提前在官方或正规平台看门票和时段。到陆家嘴后先确认入口，再排队安检上观光层。",
    hotel: "想看黄浦江夜景可以住陆家嘴或外滩附近；想省预算就住地铁 2 号线沿线。",
    play: "先看塔下广场，再上观光层看外滩、黄浦江和陆家嘴高楼。晚上灯光更像真实上海。",
    history: "东方明珠在浦东陆家嘴，是上海很有代表性的城市地标之一。"
  },
  {
    key: "museum",
    name: "上海博物馆",
    type: "博物馆",
    pos: [-32, 0, 8],
    ticket: "博物馆通常要先看预约要求。到人民广场后按入口排队，安检后进馆。",
    hotel: "第一次来上海住人民广场、南京路附近很方便，走路或坐地铁都能到很多景点。",
    play: "可以先看青铜器和陶瓷展，再去人民广场和南京路。这里适合慢慢看，不要赶太快。",
    history: "上海博物馆位于人民广场一带，是上海重要的文化场馆。"
  },
  {
    key: "mall",
    name: "南京路步行街",
    type: "商圈",
    pos: [24, 0, -7],
    ticket: "步行街不用门票。坐地铁到人民广场或南京东路站，出来就是商店和人流。",
    hotel: "住南京路附近最方便，吃饭、购物、去外滩都近，但节假日会很热闹。",
    play: "白天逛老字号和商场，晚上可以一路走到外滩看灯光和黄浦江。",
    history: "南京路是上海著名商业街，也是很多游客第一次认识上海的地方。"
  },
  {
    key: "hotel",
    name: "陆家嘴酒店区",
    type: "酒店",
    pos: [12, 0, 22],
    ticket: "订酒店先看位置、取消规则、早餐和到地铁站的距离。陆家嘴适合看夜景。",
    hotel: "选江景房能看到黄浦江和高楼；如果主要逛老城，也可以住人民广场或豫园附近。",
    play: "入住后先放行李，再去滨江步道、东方明珠或商场吃饭。",
    history: "陆家嘴是上海浦东的金融贸易区，高楼密集，是上海天际线最明显的地方。"
  },
  {
    key: "westAirport",
    name: "上海虹桥国际机场",
    type: "机场",
    pos: [-58, 0, 45],
    ticket: "买机票后一定看清是虹桥还是浦东。到机场先找航站楼和值机柜台，再过安检。",
    hotel: "虹桥机场旁边适合赶早班机，也方便换乘虹桥火车站的高铁。",
    play: "可以看航站楼、跑道和廊桥。飞机模式会沿绿色航线飞向浦东机场。",
    history: "虹桥机场和虹桥火车站组成上海西侧重要交通枢纽。"
  },
  {
    key: "eastAirport",
    name: "上海浦东国际机场",
    type: "机场",
    pos: [60, 0, -39],
    ticket: "浦东机场离市区更远，出发前要留足路上时间。国际航班要更早到。",
    hotel: "赶早班或转机可以住浦东机场附近；想去市区玩就住地铁或机场线方便的位置。",
    play: "从这里可以看大航站楼、长跑道和飞机滑行。也能飞回虹桥机场。",
    history: "浦东国际机场是上海主要国际航空门户之一，官方机场集团同时运营浦东和虹桥两座机场。"
  },
  {
    key: "rail",
    name: "上海虹桥站",
    type: "高铁",
    pos: [-8, 0, 38],
    ticket: "买高铁票要看清上海虹桥站、上海站、上海南站这些不同车站。进站后看候车口。",
    hotel: "第二天坐高铁可以住虹桥商务区；想玩景点就住市中心再坐地铁过去。",
    play: "可以看高铁站台、候车大厅和银色轨道。高铁模式会沿轨道穿城。",
    history: "上海虹桥站与虹桥机场距离很近，是上海重要的铁路和航空换乘枢纽。"
  },
  {
    key: "oldGate",
    name: "豫园",
    type: "名胜",
    pos: [-20, 0, 17],
    ticket: "豫园景区周边可以逛街，进园要看当天开放和购票规则。",
    hotel: "喜欢老城味道可以住豫园、城隍庙附近；想安静一点就住地铁几站外。",
    play: "先逛园林和九曲桥，再去周边老街吃小吃，晚上看灯会感更强。",
    history: "豫园是上海老城厢的代表景点之一，和外滩、南京路经常一起安排。"
  }
];

const destinationMap = new Map(destinations.map((item) => [item.key, item]));
const world = new THREE.Group();
scene.add(world);
let routeLine = null;
let vehicle = null;

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
  label("东方明珠", [4, 45, -34]);
  box("museum", [18, 7, 14], [-32, 3.6, -4], mat.white);
  cyl("museum dome", 8, 5, [-32, 9.4, -4], mat.glass, 48);
  label("上海博物馆", [-32, 15, -4]);
  box("mall", [24, 10, 18], [24, 5.1, 7], mat.gold);
  box("mall atrium", [8, 13, 8], [24, 6.7, 7], mat.glass);
  label("南京路步行街", [24, 16, 7]);
  box("hotel", [14, 34, 12], [12, 17, 32], mat.glass);
  box("hotel cap", [16, 2, 14], [12, 35, 32], mat.teal);
  label("陆家嘴酒店区", [12, 41, 32]);
  box("rail station", [24, 7, 10], [-8, 3.6, 48], mat.white);
  box("rail roof", [28, 1, 12], [-8, 7.6, 48], mat.teal);
  label("上海虹桥站", [-8, 13, 48]);
  box("old gate left", [4, 14, 5], [-25, 7, 25], mat.red);
  box("old gate right", [4, 14, 5], [-15, 7, 25], mat.red);
  box("old gate top", [16, 4, 5], [-20, 14.6, 25], mat.gold);
  label("豫园", [-20, 21, 25]);
  createAirport("westAirport", -78, 45, -0.35, "虹桥机场");
  createAirport("eastAirport", 82, -42, 0.28, "浦东机场");
}

function createStationsAndCrowds() {
  const stations = [
    [-20, -31], [0, -29], [26, -31], [-30, 0], [0, 0], [31, 0],
    [-24, 31], [0, 31], [28, 31], [-50, 22], [48, -24], [54, 18]
  ];
  const stationNames = ["人民广场", "南京东路", "陆家嘴", "静安寺", "世纪大道", "豫园", "徐家汇", "上海火车站", "龙阳路", "虹桥火车站", "虹桥2号航站楼", "迪士尼"];
  stations.forEach(([x, z], index) => {
    cyl("metro station", 1.3, 0.35, [x, 0.35, z], mat.teal, 24);
    label(stationNames[index], [x, 2.9, z], "#0b3142").scale.set(4.9, 1.2, 1);
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

function clearVehicle() {
  if (!vehicle) return;
  scene.remove(vehicle);
  vehicle.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
  });
  vehicle = null;
}

function createVehicle(mode) {
  clearVehicle();
  const group = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x102b36, roughness: 0.62 });
  if (mode === "taxi") {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 1.35), mat.gold);
    body.position.y = 0.7;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.55, 1.05), mat.white);
    roof.position.y = 1.25;
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.18, 0.34), mat.teal);
    sign.position.y = 1.63;
    group.add(body, roof, sign);
    [-0.8, 0.8].forEach((x) => {
      [-0.58, 0.58].forEach((z) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 16), dark);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.28, z);
        group.add(wheel);
      });
    });
  } else if (mode === "metro" || mode === "rail") {
    const color = mode === "metro" ? mat.teal : mat.white;
    for (let i = 0; i < 3; i += 1) {
      const car = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.25, 1.35), color);
      car.position.set((i - 1) * 3.55, 0.9, 0);
      group.add(car);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.18, 0.05), mode === "metro" ? mat.gold : mat.teal);
      stripe.position.set((i - 1) * 3.55, 1.25, -0.7);
      group.add(stripe);
    }
  } else if (mode === "plane") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 5.6, 24), mat.white);
    body.rotation.z = Math.PI / 2;
    body.position.y = 1.2;
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.52, 1.15, 24), mat.white);
    nose.rotation.z = -Math.PI / 2;
    nose.position.set(-3.35, 1.2, 0);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 5.3), mat.teal);
    wing.position.y = 1.2;
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.1, 1.35), mat.teal);
    tail.position.set(2.55, 1.75, 0);
    group.add(body, nose, wing, tail);
  }
  group.visible = false;
  scene.add(group);
  vehicle = group;
  return group;
}

function curveFrom(points) {
  return new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(point.x, point.y ?? 0.7, point.z)));
}

function roadLeg(labelText, from, to, speed, rideMode = "") {
  const roadZ = Math.abs(to.z) > 38 ? (to.z > 0 ? 31 : -30) : 0;
  const points = [
    { x: from.x, y: 0.7, z: from.z },
    { x: from.x, y: 0.7, z: roadZ },
    { x: to.x, y: 0.7, z: roadZ },
    { x: to.x, y: 0.7, z: to.z }
  ];
  const distance = from.distanceTo(to);
  return {
    label: labelText,
    curve: curveFrom(points),
    duration: Math.max(0.75, distance / speed),
    rideMode,
    riding: Boolean(rideMode)
  };
}

function airLeg(labelText, from, to) {
  const points = [
    { x: from.x, y: 1.2, z: from.z },
    { x: from.x, y: 10, z: from.z - 10 },
    { x: (from.x + to.x) / 2, y: 24, z: (from.z + to.z) / 2 },
    { x: to.x, y: 10, z: to.z + 10 },
    { x: to.x, y: 1.2, z: to.z }
  ];
  return {
    label: labelText,
    curve: curveFrom(points),
    duration: Math.max(2.6, from.distanceTo(to) / 42),
    rideMode: "plane",
    riding: true
  };
}

function nearestStation(position) {
  const stations = [
    new THREE.Vector3(-20, 0, -31), new THREE.Vector3(0, 0, -29), new THREE.Vector3(26, 0, -31),
    new THREE.Vector3(-30, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(31, 0, 0),
    new THREE.Vector3(-24, 0, 31), new THREE.Vector3(0, 0, 31), new THREE.Vector3(28, 0, 31),
    new THREE.Vector3(-50, 0, 22), new THREE.Vector3(48, 0, -24), new THREE.Vector3(54, 0, 18)
  ];
  return stations.reduce((best, station) => station.distanceTo(position) < best.distanceTo(position) ? station : best, stations[0]).clone();
}

function makeTripLegs(target) {
  const start = state.pos.clone();
  const end = new THREE.Vector3(target.pos[0], 0, target.pos[2]);
  if (state.mode === "walk") return [roadLeg(`步行去 ${target.name}，一路沿着上海街道走。`, start, end, 7)];
  if (state.mode === "taxi") {
    const pickup = new THREE.Vector3(start.x, 0, Math.abs(start.z) > 22 ? 31 * Math.sign(start.z) : 0);
    const dropoff = new THREE.Vector3(end.x, 0, Math.abs(end.z) > 22 ? 31 * Math.sign(end.z) : 0);
    return [
      roadLeg("先走到路边出租车上车点。", start, pickup, 7),
      roadLeg(`坐出租车去 ${target.name} 附近，车会沿主路开。`, pickup, dropoff, 23, "taxi"),
      roadLeg(`下车后走进 ${target.name}。`, dropoff, end, 7)
    ];
  }
  if (state.mode === "metro") {
    const origin = nearestStation(start);
    const exit = nearestStation(end);
    return [
      roadLeg("先走进最近的上海地铁站。", start, origin, 7),
      roadLeg(`坐上海地铁到 ${target.name} 附近的站。`, origin, exit, 34, "metro"),
      roadLeg(`出站后走到 ${target.name}。`, exit, end, 7)
    ];
  }
  if (state.mode === "rail") {
    const station = new THREE.Vector3(-8, 0, 38);
    return [
      roadLeg("先到上海虹桥站，进站检票。", start, station, 16, start.distanceTo(station) > 18 ? "taxi" : ""),
      roadLeg("坐高铁从站台出发，沿银色轨道运行一段。", station, new THREE.Vector3(48, 0, 54), 48, "rail"),
      roadLeg(`高铁到站后下车，再去 ${target.name}。`, new THREE.Vector3(48, 0, 54), end, 12)
    ];
  }
  const hongqiao = new THREE.Vector3(-58, 0, 45);
  const pudong = new THREE.Vector3(60, 0, -39);
  const startAirport = target.key === "westAirport" ? pudong : hongqiao;
  const endAirport = target.key === "westAirport" ? hongqiao : pudong;
  const legs = [
    roadLeg(`先去 ${startAirport === hongqiao ? "上海虹桥国际机场" : "上海浦东国际机场"}，进航站楼。`, start, startAirport, 22, "taxi"),
    airLeg(`登机后起飞，飞到 ${endAirport === pudong ? "上海浦东国际机场" : "上海虹桥国际机场"}。`, startAirport, endAirport)
  ];
  if (target.type !== "机场") legs.push(roadLeg(`下飞机出站，再坐车去 ${target.name}。`, endAirport, end, 20, "taxi"));
  return legs;
}

function drawRouteLine(legs) {
  if (routeLine) {
    world.remove(routeLine);
    routeLine.geometry.dispose();
  }
  const samples = legs.flatMap((leg) => leg.curve.getPoints(32));
  const geometry = new THREE.BufferGeometry().setFromPoints(samples);
  routeLine = new THREE.Line(geometry, mat.route);
  world.add(routeLine);
}

function previewRoute(target) {
  drawRouteLine(makeTripLegs(target));
  state.route = null;
  state.riding = false;
  clearVehicle();
}

function createRoute(target) {
  clearVehicle();
  const legs = makeTripLegs(target);
  drawRouteLine(legs);
  state.route = { legs, legIndex: 0, target };
  state.legTime = 0;
  state.riding = false;
  ui.status.textContent = legs[0].label;
  showAssistant("play");
}

function setDestination(key) {
  state.destination = destinationMap.get(key);
  [...ui.destGrid.querySelectorAll("button")].forEach((button) => {
    button.classList.toggle("active", button.dataset.dest === key);
  });
  ui.destText.textContent = state.destination.name;
  ui.status.textContent = `目的地改成 ${state.destination.name}。选择交通方式后点“按路线出发”。`;
  previewRoute(state.destination);
}

function setMode(mode) {
  state.mode = mode;
  ui.modeText.textContent = modeNames[mode];
  [...ui.modeGrid.querySelectorAll("button")].forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  if (state.destination) previewRoute(state.destination);
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
  });
  ui.reset.addEventListener("click", () => {
    state.pos.set(0, 0, 0);
    state.heading = -Math.PI / 2;
    state.route = null;
    state.riding = false;
    clearVehicle();
    if (routeLine) routeLine.visible = false;
    ui.status.textContent = "已经回到上海人民广场附近。可以重新选择目的地。";
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
  if (moved) {
    state.route = null;
    state.riding = false;
    clearVehicle();
  }
  state.walkPulse += moved ? dt * 9 : dt * 2;
}

function updateRoute(dt) {
  if (!state.route) return;
  const leg = state.route.legs[state.route.legIndex];
  state.legTime += dt;
  const t = Math.min(1, state.legTime / leg.duration);
  const point = leg.curve.getPoint(t);
  const tangent = leg.curve.getTangent(Math.min(0.98, t + 0.01));
  state.riding = leg.riding;
  if (leg.riding) {
    if (!vehicle || vehicle.userData.mode !== leg.rideMode) {
      createVehicle(leg.rideMode);
      vehicle.userData.mode = leg.rideMode;
    }
    vehicle.visible = true;
    vehicle.position.copy(point);
    vehicle.rotation.y = Math.atan2(tangent.x, tangent.z) + Math.PI / 2;
    state.pos.set(point.x, 0, point.z);
  } else {
    if (vehicle) vehicle.visible = false;
    state.pos.set(point.x, 0, point.z);
  }
  if (t >= 1) {
    state.route.legIndex += 1;
    state.legTime = 0;
    if (state.route.legIndex >= state.route.legs.length) {
      ui.status.textContent = `已经下车/出站，到达 ${state.route.target.name}。现在可以问怎么买票、订酒店、怎么玩或讲历史。`;
      state.route = null;
      state.riding = false;
      clearVehicle();
    } else {
      ui.status.textContent = state.route.legs[state.route.legIndex].label;
    }
  }
}

function updateCamera() {
  avatar.position.copy(state.pos);
  avatar.rotation.y = state.heading;
  avatar.children[3].rotation.x = Math.sin(state.walkPulse) * 0.22;
  avatar.children[4].rotation.x = -Math.sin(state.walkPulse) * 0.22;
  avatar.visible = state.cameraDistance > 2.4 && !state.riding;

  const behind = new THREE.Vector3(-Math.sin(state.heading), 0, -Math.cos(state.heading));
  const focus = vehicle?.visible ? vehicle.position.clone() : state.pos.clone();
  const camPos = focus.clone()
    .addScaledVector(behind, state.cameraDistance)
    .add(new THREE.Vector3(0, 2.6 + state.cameraDistance * 0.2 + (vehicle?.visible ? 2 : 0), 0));
  camera.position.copy(camPos);
  camera.lookAt(focus.x, 1.5 + state.pitch * 5, focus.z);
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
