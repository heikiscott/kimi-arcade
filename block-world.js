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
  setStatus(`到了${scenes[scene]}。这里盖东西、坐车、坐飞机、坐高铁都免费。`);
}

function clearLand() {
  grid = makeGrid();
  setStatus("空地清空了，可以重新盖。");
}

function buildHouse() {
  grid = makeGrid();
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

function ride(type) {
  vehicleType = type;
  vehicleTimer = 140;
  const names = { subway: "地铁", plane: "飞机", train: "高铁" };
  setStatus(`${names[type]}免费出发，没有进站口，也不用买票。`);
}

function useElevator() {
  scene = "subway";
  elevatorLevel = elevatorLevel === 1 ? 2 : 1;
  placeText.textContent = scenes.subway;
  setStatus(`地铁站电梯叮，到了 ${elevatorLevel} 层。这里没有进站口，直接上车。`);
}

function placeBlock(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) * (canvas.width / rect.width);
  const y = (clientY - rect.top) * (canvas.height / rect.height);
  const col = Math.floor((x - originX) / tile);
  const row = Math.floor((y - originY) / tile);
  if (col < 0 || col >= cols || row < 0 || row >= rows) return;
  grid[row][col] = blocks[selected].key;
  setStatus(`放了一个${blocks[selected].name}，继续盖房子吧。`);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawGrid();
  drawScene();
  drawVehicle();
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
  if (scene === "village") drawVillage();
  if (scene === "city") drawCity();
  if (scene === "subway") drawSubwayStation();
  if (scene === "airport") drawAirport();
  if (scene === "rail") drawRailStation();
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
document.querySelector("#houseBtn").addEventListener("click", buildHouse);
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
  if (key === "h") buildHouse();
  if (key === "v") changeScene("village");
  if (key === "c") changeScene("city");
  if (key === "m") changeScene("subway");
  if (key === "a") changeScene("airport");
  if (key === "r") changeScene("rail");
});

renderBlockButtons();
draw();
