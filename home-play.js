const canvas = document.querySelector("#homeCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.querySelector("#statusText");
const messageTitle = document.querySelector("#messageTitle");
const messageText = document.querySelector("#messageText");
const dollSelect = document.querySelector("#dollSelect");
const inventoryList = document.querySelector("#inventoryList");

const controls = {
  up: document.querySelector("#upBtn"),
  left: document.querySelector("#leftBtn"),
  right: document.querySelector("#rightBtn"),
  down: document.querySelector("#downBtn"),
  front: document.querySelector("#frontBtn"),
  leftPick: document.querySelector("#leftPickBtn"),
  rightPick: document.querySelector("#rightPickBtn"),
  back: document.querySelector("#backBtn"),
  tv: document.querySelector("#tvBtn"),
  game: document.querySelector("#gameBtn"),
  remote: document.querySelector("#remoteBtn"),
  ball: document.querySelector("#ballBtn"),
  station: document.querySelector("#stationBtn"),
  mallTrain: document.querySelector("#mallTrainBtn"),
  parkTrain: document.querySelector("#parkTrainBtn")
};

const dolls = [
  { id: 1, name: "一号小娃娃", gender: "女生", color: "#d94a78", x: 176, y: 410, dir: "down", item: "空手", pose: 0, action: "站在客厅" },
  { id: 2, name: "二号小娃娃", gender: "女生", color: "#7b4dc5", x: 236, y: 410, dir: "down", item: "空手", pose: 0, action: "站在客厅" },
  { id: 3, name: "三号小娃娃", gender: "女生", color: "#39a657", x: 296, y: 410, dir: "down", item: "空手", pose: 0, action: "站在客厅" },
  { id: 4, name: "四号小娃娃", gender: "男生", color: "#245b8f", x: 356, y: 410, dir: "down", item: "空手", pose: 0, action: "站在客厅" }
];

const items = [
  { name: "电视遥控器", x: 470, y: 410, color: "#172632", takenBy: null },
  { name: "游戏手柄", x: 718, y: 410, color: "#d93a32", takenBy: null },
  { name: "苹果", x: 214, y: 240, color: "#d93a32", takenBy: null },
  { name: "积木", x: 338, y: 246, color: "#ffd15f", takenBy: null },
  { name: "书包", x: 612, y: 236, color: "#245b8f", takenBy: null },
  { name: "小皮球", x: 794, y: 514, color: "#ff8a2d", takenBy: null }
];

let selected = 0;
let tvFlash = 0;
let gameFlash = 0;
let ballFlash = 0;
let trainTimer = 0;
let trainDestination = "";

function activeDoll() {
  return dolls[selected];
}

function setMessage(title, text) {
  messageTitle.textContent = title;
  messageText.textContent = text;
  statusText.textContent = text;
}

function selectDoll(index) {
  selected = index;
  const doll = activeDoll();
  setMessage(`现在是${doll.name}`, `${doll.name}（${doll.gender}）准备好了。手里：${doll.item}。`);
  renderDollButtons();
}

function renderDollButtons() {
  dollSelect.innerHTML = "";
  dolls.forEach((doll, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === selected ? "active" : "";
    button.textContent = `${doll.id}号 ${doll.gender}`;
    button.addEventListener("click", () => selectDoll(index));
    dollSelect.appendChild(button);
  });
  renderInventory();
}

function renderInventory() {
  inventoryList.innerHTML = "";
  dolls.forEach((doll) => {
    const location = getDollPlace(doll);
    const row = document.createElement("div");
    row.className = "inventory-row";
    row.innerHTML = `<span>${doll.name} · ${location}</span><span>${doll.item}</span>`;
    inventoryList.appendChild(row);
  });
}

function getDollPlace(doll) {
  const location = window.TransitChannel?.personLocation(doll.id) || "home";
  return { home: "在家", mall: "在商场", park: "在游乐园" }[location];
}

function dollIsHome(doll) {
  return (window.TransitChannel?.personLocation(doll.id) || "home") === "home";
}

function ensureDollHome(doll) {
  if (dollIsHome(doll)) return true;
  setMessage("这个娃娃不在家", `${doll.name}现在${getDollPlace(doll)}，请切换到那个频道看她或他。`);
  return false;
}

function moveDoll(dx, dy, dir) {
  const doll = activeDoll();
  if (!ensureDollHome(doll)) return;
  doll.dir = dir;
  doll.pose += 1;
  doll.x = Math.max(74, Math.min(canvas.width - 74, doll.x + dx));
  doll.y = Math.max(92, Math.min(canvas.height - 60, doll.y + dy));
  const outside = doll.x > 690 && doll.y > 454;
  doll.action = outside ? "在门外院子里" : "在家里走路";
  setMessage(`${doll.name}走起来`, `${doll.name}往${dirName(dir)}走。`);
}

function dirName(dir) {
  return { up: "上", down: "下", left: "左", right: "右" }[dir];
}

function pick(direction) {
  const doll = activeDoll();
  if (!ensureDollHome(doll)) return;
  const target = nearestItemInDirection(doll, direction);
  if (!target) {
    setMessage("没有拿到", `${doll.name}的${pickName(direction)}没有东西。`);
    return;
  }
  target.takenBy = doll.id;
  doll.item = target.name;
  doll.action = `拿着${target.name}`;
  setMessage(`${doll.name}拿到了`, `${doll.name}从${pickName(direction)}拿起了${target.name}。`);
  renderInventory();
}

function pickName(direction) {
  return { front: "前面", back: "后面", left: "左边", right: "右边" }[direction];
}

function nearestItemInDirection(doll, direction) {
  const available = items.filter((item) => item.takenBy === null || item.takenBy === doll.id);
  let best = null;
  let bestDistance = Infinity;
  available.forEach((item) => {
    const dx = item.x - doll.x;
    const dy = item.y - doll.y;
    const distance = Math.hypot(dx, dy);
    const inDirection =
      (direction === "front" && dy < 42 && Math.abs(dx) < 130) ||
      (direction === "back" && dy > -42 && Math.abs(dx) < 130) ||
      (direction === "left" && dx < 30 && Math.abs(dy) < 130) ||
      (direction === "right" && dx > -30 && Math.abs(dy) < 130);
    if (inDirection && distance < bestDistance) {
      best = item;
      bestDistance = distance;
    }
  });
  return bestDistance < 180 ? best : null;
}

function watchTv() {
  const doll = activeDoll();
  if (!ensureDollHome(doll)) return;
  if (Math.hypot(doll.x - 496, doll.y - 346) > 230 && doll.item !== "电视遥控器") {
    setMessage("离电视有点远", `${doll.name}要靠近沙发，或者先拿电视遥控器。`);
    return;
  }
  tvFlash = 80;
  doll.action = "正在看电视";
  setMessage("电视打开了", `${doll.name}坐在客厅看电视。`);
}

function playGame() {
  const doll = activeDoll();
  if (!ensureDollHome(doll)) return;
  if (Math.hypot(doll.x - 728, doll.y - 338) > 230 && doll.item !== "游戏手柄") {
    setMessage("游戏机太远", `${doll.name}要靠近游戏机，或者先拿游戏手柄。`);
    return;
  }
  gameFlash = 80;
  doll.action = "正在打游戏";
  setMessage("开始打游戏", `${doll.name}拿着手柄玩小游戏。`);
}

function takeRemote() {
  const doll = activeDoll();
  if (!ensureDollHome(doll)) return;
  const remote = items.find((item) => item.name === "电视遥控器");
  remote.takenBy = doll.id;
  doll.item = "电视遥控器";
  doll.action = "拿着电视遥控器";
  setMessage("遥控器到手", `${doll.name}拿到了电视遥控器，可以换台看电视。`);
  renderInventory();
}

function goBall() {
  const doll = activeDoll();
  if (!ensureDollHome(doll)) return;
  doll.x = 804;
  doll.y = 506;
  doll.dir = "right";
  doll.pose += 1;
  doll.item = "小皮球";
  const ball = items.find((item) => item.name === "小皮球");
  ball.takenBy = doll.id;
  ballFlash = 90;
  doll.action = "正在门外打球";
  setMessage("出门打球", `${doll.name}跑到门外院子里打球。`);
  renderInventory();
}

function goStation() {
  const doll = activeDoll();
  if (!ensureDollHome(doll)) return;
  doll.x = 812;
  doll.y = 372;
  doll.dir = "right";
  doll.pose += 1;
  doll.action = "在家门口地铁站";
  setMessage("家门口地铁站", `${doll.name}出门到了地铁站，可以坐去商场，也可以坐去超级游乐园。`);
}

function rideTrain(destination) {
  const doll = activeDoll();
  if (!ensureDollHome(doll)) return;
  goStation();
  trainDestination = destination;
  trainTimer = 95;
  window.TransitChannel?.movePerson(doll.id, destination === "mall" ? "mall" : "park", "home");
  renderInventory();
  doll.action = destination === "mall" ? "坐地铁去商场" : "坐地铁去游乐园";
  setMessage("地铁出发", destination === "mall" ? "地铁从家门口开往六层大商场。" : "地铁从家门口开往超级游乐园。");
  setTimeout(() => {
    window.location.href = destination === "mall" ? "mall.html" : "amusement.html";
  }, 1300);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawHouse();
  drawFurniture();
  drawItems();
  dolls.forEach(drawDoll);
  drawActionEffects();
  requestAnimationFrame(draw);
}

function drawHouse() {
  ctx.fillStyle = "#f9f3e8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#e7f2ee";
  ctx.fillRect(700, 448, 248, 142);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 8;
  ctx.strokeRect(44, 58, 660, 508);
  ctx.lineWidth = 5;
  ctx.strokeRect(704, 448, 208, 112);
  ctx.fillStyle = "#d6ecff";
  ctx.fillRect(90, 92, 160, 74);
  ctx.fillRect(304, 92, 160, 74);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 20px system-ui";
  ctx.fillText("客厅", 82, 48);
  ctx.fillText("门外院子", 716, 432);
  ctx.fillText("家门口地铁站", 724, 292);
  ctx.fillStyle = "#9b6a3c";
  ctx.fillRect(642, 392, 62, 136);
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.arc(690, 462, 5, 0, Math.PI * 2);
  ctx.fill();
  drawHomeStation();
}

function drawHomeStation() {
  ctx.fillStyle = "#245b8f";
  roundRect(724, 306, 198, 82, 12);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px system-ui";
  ctx.fillText("MRT", 746, 338);
  ctx.font = "bold 13px system-ui";
  ctx.fillText("商场 / 超级游乐园", 746, 366);
  if (trainTimer > 0) {
    const x = 720 + (95 - trainTimer) * 2.6;
    ctx.fillStyle = "#d9e6ec";
    roundRect(x, 388, 164, 42, 18);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.font = "bold 12px system-ui";
    ctx.fillText(trainDestination === "mall" ? "开往商场" : "开往游乐园", x + 42, 415);
    trainTimer = Math.max(0, trainTimer - 1);
  }
}

function drawFurniture() {
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(386, 118, 206, 116);
  ctx.fillStyle = tvFlash > 0 ? "#ffd15f" : "#172632";
  ctx.fillRect(410, 138, 158, 76);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px system-ui";
  ctx.fillText("TV", 474, 184);
  tvFlash = Math.max(0, tvFlash - 1);

  ctx.fillStyle = "#39a657";
  roundRect(346, 322, 220, 70, 12);
  ctx.fill();
  ctx.fillStyle = "#2f7650";
  roundRect(384, 386, 142, 58, 10);
  ctx.fill();

  ctx.fillStyle = "#7b4dc5";
  roundRect(646, 186, 214, 148, 14);
  ctx.fill();
  ctx.fillStyle = gameFlash > 0 ? "#ff8a2d" : "#ffffff";
  roundRect(676, 214, 154, 76, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 18px system-ui";
  ctx.fillText("GAME", 716, 262);
  gameFlash = Math.max(0, gameFlash - 1);

  ctx.fillStyle = "#d7a249";
  roundRect(120, 212, 294, 92, 16);
  ctx.fill();
  ctx.fillStyle = "#fff6d8";
  roundRect(142, 232, 250, 48, 10);
  ctx.fill();
}

function drawItems() {
  items.forEach((item) => {
    if (item.takenBy !== null) return;
    ctx.fillStyle = item.color;
    if (item.name === "小皮球") {
      ctx.beginPath();
      ctx.arc(item.x, item.y, 20 + Math.sin(ballFlash / 6) * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 13, 0.2, Math.PI + 0.2);
      ctx.stroke();
    } else {
      roundRect(item.x - 22, item.y - 16, 44, 32, 8);
      ctx.fill();
    }
    ctx.fillStyle = "#172632";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(item.name, item.x, item.y + 34);
    ctx.textAlign = "left";
  });
  ballFlash = Math.max(0, ballFlash - 1);
}

function drawDoll(doll, index) {
  if (!dollIsHome(doll)) return;
  const bob = Math.sin((doll.pose + performance.now() / 120) * 0.8) * 2;
  const active = dolls[selected] === doll;
  ctx.save();
  ctx.translate(doll.x, doll.y + bob);
  if (active) {
    ctx.strokeStyle = "#ffd15f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -38, 34, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#f0bb87";
  ctx.beginPath();
  ctx.arc(0, -58, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = doll.color;
  ctx.beginPath();
  ctx.arc(0, -69, 19, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = doll.color;
  roundRect(-19, -42, 38, 48, 10);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-13, 2);
  ctx.lineTo(-24 + (doll.pose % 2) * 8, 32);
  ctx.moveTo(13, 2);
  ctx.lineTo(24 - (doll.pose % 2) * 8, 32);
  ctx.moveTo(-18, -28);
  ctx.lineTo(-36, -6);
  ctx.moveTo(18, -28);
  ctx.lineTo(36, -6);
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 14px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(`${doll.id}`, 0, -55);
  if (doll.item !== "空手") {
    ctx.fillStyle = "#fff";
    roundRect(30, -34, 58, 24, 8);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.font = "bold 11px system-ui";
    ctx.fillText(doll.item.slice(0, 4), 59, -18);
  }
  ctx.fillStyle = "#172632";
  ctx.font = "bold 13px system-ui";
  ctx.fillText(doll.action, 0, 48);
  ctx.restore();
}

function drawActionEffects() {
  ctx.fillStyle = "rgba(255, 209, 95, 0.45)";
  if (tvFlash > 0) {
    ctx.beginPath();
    ctx.arc(492, 176, 72 + tvFlash * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (gameFlash > 0) {
    ctx.beginPath();
    ctx.arc(754, 252, 68 + gameFlash * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

controls.up.addEventListener("click", () => moveDoll(0, -32, "up"));
controls.down.addEventListener("click", () => moveDoll(0, 32, "down"));
controls.left.addEventListener("click", () => moveDoll(-32, 0, "left"));
controls.right.addEventListener("click", () => moveDoll(32, 0, "right"));
controls.front.addEventListener("click", () => pick("front"));
controls.back.addEventListener("click", () => pick("back"));
controls.leftPick.addEventListener("click", () => pick("left"));
controls.rightPick.addEventListener("click", () => pick("right"));
controls.tv.addEventListener("click", watchTv);
controls.game.addEventListener("click", playGame);
controls.remote.addEventListener("click", takeRemote);
controls.ball.addEventListener("click", goBall);
controls.station.addEventListener("click", goStation);
controls.mallTrain.addEventListener("click", () => rideTrain("mall"));
controls.parkTrain.addEventListener("click", () => rideTrain("park"));

window.addEventListener("transitchange", renderInventory);

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["1", "2", "3", "4"].includes(key)) selectDoll(Number(key) - 1);
  if (key === "w" || event.key === "ArrowUp") moveDoll(0, -32, "up");
  if (key === "s" || event.key === "ArrowDown") moveDoll(0, 32, "down");
  if (key === "a" || event.key === "ArrowLeft") moveDoll(-32, 0, "left");
  if (key === "d" || event.key === "ArrowRight") moveDoll(32, 0, "right");
  if (key === "e") pick("front");
  if (key === "q") pick("left");
  if (key === "r") pick("right");
  if (key === "x") pick("back");
  if (key === "m") goStation();
});

renderDollButtons();
draw();
