const canvas = document.querySelector("#worldCanvas");
const ctx = canvas.getContext("2d");
const placeText = document.querySelector("#placeText");
const statusText = document.querySelector("#statusText");
const blockGrid = document.querySelector("#blockGrid");

const cols = 18;
const rows = 11;
const tile = 46;
const originX = 76;
const originY = 92;
const blocks = [
  { key: "grass", name: "草地方块", color: "#39a657" },
  { key: "wood", name: "木头方块", color: "#9b6a3c" },
  { key: "glass", name: "玻璃方块", color: "#9ad7ee" },
  { key: "stone", name: "石头方块", color: "#8d98a2" },
  { key: "light", name: "灯光方块", color: "#ffd15f" },
  { key: "water", name: "水方块", color: "#245b8f" }
];

const scenes = {
  home: "家园空地",
  wild: "野地建楼区",
  village: "乡村",
  city: "高楼城市",
  subway: "免费地铁站",
  airport: "免费机场",
  rail: "免费高铁站"
};

let selected = 0;
let scene = "home";
let grid = makeGrid();
let vehicleTimer = 0;
let vehicleType = "";
let elevatorLevel = 1;
let goodPlanes = 30;
let disposablePlanes = 30;
let demoPlaneTimer = 0;
let demoPlaneTarget = null;
let pilotingPlane = false;
let pilotPlane = { col: 14, row: 2, pose: 0 };
let collapse = null;
let protectedCells = new Set();
const player = { col: 8, row: 8, pose: 0, dir: "down" };

function makeGrid() {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
}

function setStatus(text) {
  statusText.textContent = text;
}

function renderBlockButtons() {
  blockGrid.innerHTML = "";
  blocks.forEach((block, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === selected ? "active" : "";
    button.textContent = `${index + 1}. ${block.name}`;
    button.addEventListener("click", () => {
      selected = index;
      setStatus(`选中了${block.name}，点地图就能放。`);
      renderBlockButtons();
    });
    blockGrid.appendChild(button);
  });
}

function changeScene(next) {
  scene = next;
  placeText.textContent = scenes[scene];
  vehicleTimer = 0;
  pilotingPlane = false;
  player.col = scene === "city" ? 6 : scene === "airport" ? 4 : scene === "rail" ? 5 : scene === "subway" ? 9 : scene === "wild" ? 4 : 8;
  player.row = scene === "subway" ? 7 : 8;
  player.pose += 1;
  setStatus(`到了${scenes[scene]}。这里盖东西、坐车、坐飞机、坐高铁都免费。`);
}

function clearLand() {
  grid = makeGrid();
  protectedCells = new Set();
  collapse = null;
  setStatus("空地清空了，可以重新盖。");
}

function buildVilla() {
  grid = makeGrid();
  protectedCells = new Set();
  for (let y = 4; y <= 8; y += 1) {
    for (let x = 3; x <= 8; x += 1) setProtectedBlock(x, y, "stone");
    for (let x = 10; x <= 14; x += 1) setProtectedBlock(x, y, "glass");
  }
  for (let x = 2; x <= 15; x += 1) setProtectedBlock(x, 3, "light");
  grid[8][5] = null;
  grid[8][6] = null;
  grid[8][11] = null;
  grid[8][12] = null;
  player.col = 9;
  player.row = 9;
  scene = "home";
  placeText.textContent = scenes.home;
  setStatus("我的超高别墅建好了，有电梯，10000 平米，比世贸大厦还高，而且是保护建筑，不会被拆。");
}

function setProtectedBlock(x, y, key) {
  grid[y][x] = key;
  protectedCells.add(`${x},${y}`);
}

function buildHouse() {
  grid = makeGrid();
  protectedCells = new Set();
  for (let y = 5; y <= 8; y += 1) {
    for (let x = 5; x <= 11; x += 1) {
      grid[y][x] = "wood";
    }
  }
  for (let x = 4; x <= 12; x += 1) {
    grid[4][x] = "stone";
  }
  grid[6][7] = "glass";
  grid[6][10] = "glass";
  grid[8][8] = null;
  grid[8][9] = null;
  grid[3][7] = "light";
  grid[3][8] = "light";
  grid[3][9] = "light";
  setStatus("一键盖好了小房子，门窗和屋顶都有了。");
}

function buildWildTower() {
  scene = "wild";
  placeText.textContent = scenes.wild;
  grid = makeGrid();
  protectedCells = new Set();
  for (let y = 1; y <= 9; y += 1) {
    for (let x = 7; x <= 11; x += 1) {
      grid[y][x] = y % 2 === 0 ? "glass" : "stone";
    }
  }
  for (let x = 6; x <= 12; x += 1) grid[0][x] = "light";
  player.col = 5;
  player.row = 9;
  setStatus("野地高楼盖好了。这是你自己在野地盖的楼，可以用一次性飞机做安全拆除。");
}

function showHangar() {
  scene = "home";
  placeText.textContent = scenes.home;
  player.col = 14;
  player.row = 8;
  player.pose += 1;
  setStatus(`飞机库：好飞机 ${goodPlanes} 架，不能毁掉；一次性拆楼飞机 ${disposablePlanes} 架，只能拆自己的方块楼。`);
}

function ride(type) {
  vehicleType = type;
  vehicleTimer = 140;
  const names = { subway: "地铁", plane: "飞机", train: "高铁" };
  setStatus(`${names[type]}免费出发，没有进站口，也不用买票。`);
}

function boardDisposablePlane() {
  if (disposablePlanes <= 0) {
    setStatus("一次性拆楼飞机已经用完了。好飞机不能拿来拆楼。");
    return;
  }
  pilotingPlane = true;
  scene = "wild";
  placeText.textContent = scenes.wild;
  pilotPlane.col = Math.max(0, Math.min(cols - 1, player.col + 3));
  pilotPlane.row = Math.max(0, Math.min(rows - 1, player.row - 4));
  setStatus("你已经进入一次性拆楼飞机。用 W/A/S/D 驾驶，按“拆自己的楼”开始 10 秒安全拆除。");
}

function startSafeCollapse() {
  if (!pilotingPlane) {
    setStatus("要先点“驾驶一次性飞机”，你进去驾驶以后才能拆自己的楼。");
    return;
  }
  if (disposablePlanes <= 0) {
    setStatus("一次性拆楼飞机已经用完了。");
    return;
  }
  const targets = collectDemolitionTargets();
  if (targets.length === 0) {
    setStatus("飞机下面附近没有你自己盖的野地楼。别人的房楼和你的别墅都不会被拆。");
    return;
  }
  disposablePlanes -= 1;
  collapse = { started: performance.now(), duration: 10000, targets };
  pilotingPlane = false;
  demoPlaneTimer = 0;
  setStatus("安全拆楼开始：10 秒以内，从上往下压掉你自己在野地盖的楼。你的别墅和别人的楼不会被拆。");
}

function collectDemolitionTargets() {
  const targets = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const key = grid[row][col];
      if (!key) continue;
      if (protectedCells.has(`${col},${row}`)) continue;
      const distance = Math.hypot(col - pilotPlane.col, row - pilotPlane.row);
      if (distance <= 7) targets.push({ row, col, key });
    }
  }
  return targets.sort((a, b) => a.row - b.row);
}

function useElevator() {
  scene = "subway";
  elevatorLevel = elevatorLevel === 1 ? 2 : 1;
  player.col = 13;
  player.row = 6;
  player.pose += 1;
  placeText.textContent = scenes.subway;
  setStatus(`地铁站电梯叮，到了 ${elevatorLevel} 层。这里没有进站口，直接上车。`);
}

function movePlayer(dc, dr, dir) {
  if (pilotingPlane) {
    pilotPlane.col = Math.max(0, Math.min(cols - 1, pilotPlane.col + dc));
    pilotPlane.row = Math.max(0, Math.min(rows - 1, pilotPlane.row + dr));
    pilotPlane.pose += 1;
    setStatus(`你正在驾驶一次性飞机往${{ up: "上", down: "下", left: "左", right: "右" }[dir]}飞。`);
    return;
  }
  player.col = Math.max(0, Math.min(cols - 1, player.col + dc));
  player.row = Math.max(0, Math.min(rows - 1, player.row + dr));
  player.dir = dir;
  player.pose += 1;
  setStatus(`方块小人往${{ up: "上", down: "下", left: "左", right: "右" }[dir]}走。`);
}

function placeBlock(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) * (canvas.width / rect.width);
  const y = (clientY - rect.top) * (canvas.height / rect.height);
  const col = Math.floor((x - originX) / tile);
  const row = Math.floor((y - originY) / tile);
  if (col < 0 || col >= cols || row < 0 || row >= rows) return;
  grid[row][col] = blocks[selected].key;
  protectedCells.delete(`${col},${row}`);
  setStatus(`放了一个${blocks[selected].name}，继续盖房子吧。`);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawGrid();
  drawScene();
  updateCollapse();
  drawVehicle();
  drawDemoPlane();
  drawPilotPlane();
  drawPlayer();
  drawPlaneInventory();
  requestAnimationFrame(draw);
}

function drawBackground() {
  ctx.fillStyle = scene === "airport" ? "#dceeff" : scene === "subway" ? "#dfe8f1" : "#dff0df";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 24px system-ui";
  ctx.fillText(scenes[scene], 76, 56);
  ctx.font = "bold 15px system-ui";
  ctx.fillText("点格子放方块 · 交通免费 · 盖什么都免费", 228, 56);
}

function drawGrid() {
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = originX + col * tile;
      const y = originY + row * tile;
      ctx.fillStyle = (row + col) % 2 === 0 ? "#78bf63" : "#6db45b";
      if (scene === "subway") ctx.fillStyle = (row + col) % 2 === 0 ? "#cfd8df" : "#bfcbd4";
      if (scene === "airport" || scene === "rail") ctx.fillStyle = (row + col) % 2 === 0 ? "#d7dde2" : "#c8d0d6";
      ctx.fillRect(x, y, tile, tile);
      ctx.strokeStyle = "rgba(23,38,50,0.16)";
      ctx.strokeRect(x, y, tile, tile);
      const block = grid[row][col];
      if (block) drawBlock(x, y, block);
      if (protectedCells.has(`${col},${row}`)) {
        ctx.strokeStyle = "#ffd15f";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 7, y - 12, tile - 14, tile + 4);
      }
    }
  }
}

function drawBlock(x, y, key) {
  const block = blocks.find((item) => item.key === key);
  ctx.fillStyle = block.color;
  ctx.fillRect(x + 5, y - 14, tile - 10, tile + 8);
  ctx.fillStyle = shade(block.color);
  ctx.fillRect(x + 5, y + 18, tile - 10, 16);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 5, y - 14, tile - 10, tile + 8);
}

function shade(color) {
  return {
    "#39a657": "#2f8548",
    "#9b6a3c": "#74502d",
    "#9ad7ee": "#69b7d4",
    "#8d98a2": "#697681",
    "#ffd15f": "#d7a249",
    "#245b8f": "#17426c"
  }[color] || color;
}

function drawScene() {
  if (scene === "home") drawVillaAirport();
  if (scene === "wild") drawWildLand();
  if (scene === "village") drawVillage();
  if (scene === "city") drawCity();
  if (scene === "subway") drawSubwayStation();
  if (scene === "airport") drawAirport();
  if (scene === "rail") drawRailStation();
}

function drawVillaAirport() {
  ctx.fillStyle = "#245b8f";
  roundRect(628, 384, 236, 92, 12);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px system-ui";
  ctx.fillText("我的别墅飞机库", 672, 420);
  ctx.font = "bold 13px system-ui";
  ctx.fillText("好飞机不会毁掉", 690, 448);
  for (let i = 0; i < 10; i += 1) {
    drawTinyPlane(650 + i * 20, 474, "#ffffff");
  }
  ctx.fillStyle = "#172632";
  ctx.font = "bold 14px system-ui";
  ctx.fillText(`好飞机 x${goodPlanes}`, 676, 504);
  ctx.fillText(`一次性拆楼飞机 x${disposablePlanes}`, 676, 526);
  drawProtectedVillaTower();
}

function drawProtectedVillaTower() {
  ctx.fillStyle = "#607786";
  ctx.fillRect(138, 116, 96, 358);
  ctx.fillStyle = "#d6ecff";
  for (let y = 144; y < 438; y += 32) {
    ctx.fillRect(160, y, 16, 18);
    ctx.fillRect(196, y, 16, 18);
  }
  ctx.fillStyle = "#ffd15f";
  ctx.fillRect(178, 126, 16, 336);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 15px system-ui";
  ctx.fillText("我的超高别墅", 126, 504);
  ctx.fillText("10000㎡ · 有电梯 · 不会被拆", 98, 526);
}

function drawWildLand() {
  ctx.fillStyle = "#4d8c42";
  ctx.fillRect(84, 516, 790, 38);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 18px system-ui";
  ctx.fillText("野地建楼区：这里的自建楼可以安全拆除", 280, 550);
}

function drawVillage() {
  drawHouseShape(136, 404, "#9b6a3c", "村民家");
  drawHouseShape(730, 404, "#d7a249", "农场屋");
  ctx.fillStyle = "#ffd15f";
  ctx.fillRect(310, 470, 210, 28);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 16px system-ui";
  ctx.fillText("乡村麦田", 362, 462);
}

function drawCity() {
  const towers = [
    { x: 650, h: 360, name: "世贸大厦" },
    { x: 730, h: 300, name: "高楼" },
    { x: 810, h: 250, name: "写字楼" }
  ];
  towers.forEach((tower) => {
    ctx.fillStyle = "#607786";
    ctx.fillRect(tower.x, 520 - tower.h, 62, tower.h);
    ctx.fillStyle = "#d6ecff";
    for (let y = 520 - tower.h + 22; y < 500; y += 32) {
      ctx.fillRect(tower.x + 14, y, 12, 16);
      ctx.fillRect(tower.x + 36, y, 12, 16);
    }
    ctx.fillStyle = "#172632";
    ctx.font = "bold 12px system-ui";
    ctx.fillText(tower.name, tower.x - 2, 542);
  });
}

function drawSubwayStation() {
  ctx.fillStyle = "#172632";
  ctx.fillRect(120, 422, 690, 42);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px system-ui";
  ctx.fillText("免费地铁站 · 没有进站口", 164, 452);
  ctx.fillStyle = "#d9e6ec";
  roundRect(190, 310, 420, 76, 20);
  ctx.fill();
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(238, 334, 62, 26);
  ctx.fillRect(338, 334, 62, 26);
  ctx.fillRect(438, 334, 62, 26);
  ctx.fillStyle = "#ffd15f";
  roundRect(680, 260, 120, 156, 12);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 17px system-ui";
  ctx.fillText(`电梯 ${elevatorLevel} 层`, 704, 342);
}

function drawAirport() {
  ctx.fillStyle = "#2d596b";
  ctx.fillRect(98, 442, 760, 56);
  ctx.fillStyle = "#fff";
  for (let x = 130; x < 820; x += 80) ctx.fillRect(x, 466, 40, 6);
  ctx.fillStyle = "#d9e6ec";
  roundRect(602, 196, 238, 134, 16);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 18px system-ui";
  ctx.fillText("免费机场", 678, 270);
  drawPlane(242, 386);
}

function drawRailStation() {
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(96, 432);
  ctx.lineTo(860, 432);
  ctx.moveTo(96, 480);
  ctx.lineTo(860, 480);
  ctx.stroke();
  for (let x = 120; x < 850; x += 60) {
    ctx.strokeStyle = "#7b5a3a";
    ctx.beginPath();
    ctx.moveTo(x, 420);
    ctx.lineTo(x + 32, 492);
    ctx.stroke();
  }
  ctx.fillStyle = "#d9e6ec";
  roundRect(272, 318, 400, 76, 20);
  ctx.fill();
  ctx.fillStyle = "#d93a32";
  ctx.fillRect(314, 340, 58, 26);
  ctx.fillRect(414, 340, 58, 26);
  ctx.fillRect(514, 340, 58, 26);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 20px system-ui";
  ctx.fillText("免费高铁站", 402, 292);
}

function drawHouseShape(x, y, color, label) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 128, 86);
  ctx.fillStyle = "#d93a32";
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x + 64, y - 62);
  ctx.lineTo(x + 138, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 14px system-ui";
  ctx.fillText(label, x + 22, y + 112);
}

function drawVehicle() {
  if (vehicleTimer <= 0) return;
  const t = 140 - vehicleTimer;
  const x = 70 + t * 6.2;
  if (vehicleType === "subway") {
    ctx.fillStyle = "#d9e6ec";
    roundRect(x, 556, 260, 52, 18);
    ctx.fill();
    ctx.fillStyle = "#245b8f";
    ctx.fillRect(x + 40, 574, 44, 18);
    ctx.fillRect(x + 118, 574, 44, 18);
  }
  if (vehicleType === "plane") drawPlane(x, 556 - Math.min(t * 2, 170));
  if (vehicleType === "train") {
    ctx.fillStyle = "#d9e6ec";
    roundRect(x, 552, 292, 54, 16);
    ctx.fill();
    ctx.fillStyle = "#d93a32";
    ctx.fillRect(x + 50, 570, 46, 18);
    ctx.fillRect(x + 130, 570, 46, 18);
  }
  vehicleTimer -= 1;
}

function drawDemoPlane() {
  if (demoPlaneTimer <= 0 || !demoPlaneTarget) return;
  const targetX = originX + demoPlaneTarget.col * tile + tile / 2;
  const targetY = originY + demoPlaneTarget.row * tile + tile / 2;
  const startX = 880;
  const startY = 122;
  const t = 1 - demoPlaneTimer / 90;
  const x = startX + (targetX - startX) * t;
  const y = startY + (targetY - startY) * t;
  drawTinyPlane(x, y, "#d93a32", 2.2);
  if (demoPlaneTimer < 24) {
    ctx.fillStyle = "rgba(255, 209, 95, 0.72)";
    ctx.beginPath();
    ctx.arc(targetX, targetY, 36 - demoPlaneTimer, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("只拆自己的", targetX, targetY + 6);
    ctx.textAlign = "left";
  }
  demoPlaneTimer -= 1;
}

function drawPilotPlane() {
  if (!pilotingPlane) return;
  const x = originX + pilotPlane.col * tile + tile / 2;
  const y = originY + pilotPlane.row * tile + tile / 2;
  drawTinyPlane(x, y, "#d93a32", 2.8);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("我驾驶", x, y - 28);
  ctx.textAlign = "left";
}

function updateCollapse() {
  if (!collapse) return;
  const elapsed = performance.now() - collapse.started;
  const progress = Math.min(1, elapsed / collapse.duration);
  const maxRow = Math.floor(progress * rows);
  collapse.targets.forEach((target) => {
    if (target.row <= maxRow && grid[target.row]?.[target.col] === target.key) {
      grid[target.row][target.col] = null;
    }
  });
  drawCollapseDust(progress);
  if (progress >= 1) {
    collapse = null;
    setStatus("安全拆楼完成：只拆了你自己在野地盖的楼。你的别墅、世贸大厦、乡村房子都没动。");
  }
}

function drawCollapseDust(progress) {
  ctx.fillStyle = "rgba(210, 190, 150, 0.35)";
  collapse.targets.forEach((target) => {
    if (target.row <= Math.floor(progress * rows) + 1) {
      const x = originX + target.col * tile + tile / 2;
      const y = originY + target.row * tile + tile / 2;
      ctx.beginPath();
      ctx.arc(x, y, 16 + progress * 18, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawPlaneInventory() {
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  roundRect(702, 28, 210, 54, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 14px system-ui";
  ctx.fillText(`好飞机 ${goodPlanes} 架`, 718, 52);
  ctx.fillText(`一次性 ${disposablePlanes} 架`, 718, 72);
}

function drawTinyPlane(x, y, color, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(-11, 8);
  ctx.lineTo(5, 3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -1);
  ctx.lineTo(14, -8);
  ctx.lineTo(12, 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  const x = originX + player.col * tile + tile / 2;
  const y = originY + player.row * tile + tile / 2;
  const bob = Math.sin((player.pose + performance.now() / 130) * 0.9) * 3;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 24, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f0bb87";
  ctx.fillRect(-13, -42, 26, 24);
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(-15, -50, 30, 12);
  ctx.fillStyle = "#d94a78";
  ctx.fillRect(-16, -18, 32, 34);
  ctx.fillStyle = "#172632";
  ctx.fillRect(-8, 16, 7, 25);
  ctx.fillRect(2, 16, 7, 25);
  ctx.fillRect(-28, -12, 12, 8);
  ctx.fillRect(16, -12, 12, 8);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("我", 0, -25);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-7, -34, 5, 5);
  ctx.fillRect(4, -34, 5, 5);
  ctx.restore();
  ctx.textAlign = "left";
}

function drawPlane(x, y) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x, y, 78, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#245b8f";
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x - 60, y + 48);
  ctx.lineTo(x + 30, y + 12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 58, y - 5);
  ctx.lineTo(x + 92, y - 42);
  ctx.lineTo(x + 78, y + 2);
  ctx.closePath();
  ctx.fill();
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

canvas.addEventListener("pointerdown", (event) => placeBlock(event.clientX, event.clientY));
document.querySelector("#upBtn").addEventListener("click", () => movePlayer(0, -1, "up"));
document.querySelector("#downBtn").addEventListener("click", () => movePlayer(0, 1, "down"));
document.querySelector("#leftBtn").addEventListener("click", () => movePlayer(-1, 0, "left"));
document.querySelector("#rightBtn").addEventListener("click", () => movePlayer(1, 0, "right"));
document.querySelector("#houseBtn").addEventListener("click", buildHouse);
document.querySelector("#villaBtn").addEventListener("click", buildVilla);
document.querySelector("#wildBtn").addEventListener("click", () => changeScene("wild"));
document.querySelector("#towerBtn").addEventListener("click", buildWildTower);
document.querySelector("#hangarBtn").addEventListener("click", showHangar);
document.querySelector("#demoPlaneBtn").addEventListener("click", boardDisposablePlane);
document.querySelector("#collapseBtn").addEventListener("click", startSafeCollapse);
document.querySelector("#clearBtn").addEventListener("click", clearLand);
document.querySelector("#villageBtn").addEventListener("click", () => changeScene("village"));
document.querySelector("#cityBtn").addEventListener("click", () => changeScene("city"));
document.querySelector("#subwayBtn").addEventListener("click", () => changeScene("subway"));
document.querySelector("#airportBtn").addEventListener("click", () => changeScene("airport"));
document.querySelector("#railBtn").addEventListener("click", () => changeScene("rail"));
document.querySelector("#elevatorBtn").addEventListener("click", useElevator);
document.querySelector("#rideSubwayBtn").addEventListener("click", () => {
  changeScene("subway");
  ride("subway");
});
document.querySelector("#flyBtn").addEventListener("click", () => {
  changeScene("airport");
  ride("plane");
});
document.querySelector("#trainBtn").addEventListener("click", () => {
  changeScene("rail");
  ride("train");
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (/^[1-6]$/.test(key)) {
    selected = Number(key) - 1;
    renderBlockButtons();
  }
  if (key === "w" || event.key === "ArrowUp") movePlayer(0, -1, "up");
  if (key === "s" || event.key === "ArrowDown") movePlayer(0, 1, "down");
  if (key === "a" || event.key === "ArrowLeft") movePlayer(-1, 0, "left");
  if (key === "d" || event.key === "ArrowRight") movePlayer(1, 0, "right");
  if (key === "h") buildHouse();
  if (key === "b") buildVilla();
  if (key === "n") changeScene("wild");
  if (key === "t") buildWildTower();
  if (key === "v") changeScene("village");
  if (key === "c") changeScene("city");
  if (key === "m") changeScene("subway");
  if (key === "p") changeScene("airport");
  if (key === "r") changeScene("rail");
});

renderBlockButtons();
draw();
