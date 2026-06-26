const canvas = document.querySelector("#parkCanvas");
const ctx = canvas.getContext("2d");
const rideGrid = document.querySelector("#rideGrid");
const rideText = document.querySelector("#rideText");
const statusText = document.querySelector("#statusText");

const rides = [
  { name: "魔法银行过山车", zone: "哈利波特魔法园区", color: "#7b4dc5", x: 202, y: 184 },
  { name: "小黄人过山车", zone: "小黄人园区", color: "#ffd15f", x: 500, y: 168 },
  { name: "小猪佩奇过山车", zone: "小猪佩奇园区", color: "#f49ac2", x: 770, y: 186 },
  { name: "马里奥园区赛车", zone: "马里奥园区", color: "#d93a32", x: 216, y: 426 },
  { name: "侏罗纪飞车", zone: "侏罗纪园区", color: "#39a657", x: 508, y: 432 },
  { name: "旋转木马", zone: "童话广场", color: "#ff8a2d", x: 760, y: 432 },
  { name: "海盗船", zone: "海盗湾", color: "#245b8f", x: 528, y: 302 },
  { name: "鬼屋", zone: "鬼屋街", color: "#172632", x: 822, y: 314 }
];

const monsters = ["丧尸", "逆尸", "骷髅头", "怪物", "僵尸", "幽灵", "南瓜", "伏地魔", "伏地魔手下"];
let selected = 0;
let mode = "idle";
let rideTime = 0;
let hauntOffset = 0;
let trainTimer = 0;
let trainDestination = "";

function setStatus(text) {
  statusText.textContent = text;
}

function selectRide(index) {
  selected = index;
  const ride = rides[selected];
  rideText.textContent = ride.name;
  setStatus(`选中了${ride.zone}：${ride.name}。`);
  renderButtons();
}

function renderButtons() {
  rideGrid.innerHTML = "";
  rides.forEach((ride, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === selected ? "active" : "";
    button.textContent = ride.name;
    button.addEventListener("click", () => selectRide(index));
    rideGrid.appendChild(button);
  });
}

function startRide() {
  mode = rides[selected].name === "鬼屋" ? "haunt" : "ride";
  rideTime = 0;
  rideText.textContent = rides[selected].name;
  setStatus(`开始玩${rides[selected].name}，车车动起来了。`);
}

function enterHaunt() {
  selected = rides.findIndex((ride) => ride.name === "鬼屋");
  mode = "haunt";
  rideTime = 0;
  rideText.textContent = "鬼屋";
  setStatus("进入鬼屋：丧尸、逆尸、骷髅头、怪物、僵尸、幽灵、南瓜、伏地魔和手下出现了。");
  renderButtons();
}

function goFood() {
  mode = "food";
  rideTime = 0;
  rideText.textContent = "餐厅区";
  setStatus("到了餐厅区，吃汉堡、薯条、冰淇淋，然后继续玩。");
}

function goStation() {
  mode = "station";
  rideTime = 0;
  rideText.textContent = "游乐园地铁站";
  setStatus("到了超级游乐园出口地铁站，可以坐地铁到商场，也可以坐地铁回家。");
}

function rideTrain(destination) {
  mode = "station";
  trainDestination = destination;
  trainTimer = 110;
  rideText.textContent = "地铁出发";
  setStatus(destination === "mall" ? "地铁从超级游乐园开往六层大商场。" : "地铁从超级游乐园开回家门口。");
  setTimeout(() => {
    window.location.href = destination === "mall" ? "mall.html" : "home-play.html";
  }, 1400);
}

function drawPark() {
  ctx.fillStyle = "#eef9f1";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPaths();
  drawZones();
  drawRides();
  if (mode === "haunt") drawHauntedHouse();
  if (mode === "food") drawFood();
  if (mode === "station") drawStation();
  drawVisitor();
}

function drawPaths() {
  ctx.strokeStyle = "#d7c7a0";
  ctx.lineWidth = 34;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(84, 310);
  ctx.lineTo(902, 310);
  ctx.moveTo(500, 82);
  ctx.lineTo(500, 562);
  ctx.stroke();
  ctx.fillStyle = "#fffaf0";
  ctx.beginPath();
  ctx.arc(500, 310, 76, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 22px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("游乐园中心", 500, 318);
  ctx.textAlign = "left";
}

function drawZones() {
  const zones = [
    { name: "哈利波特魔法园区", x: 58, y: 72, w: 292, h: 180, color: "#e7dbff" },
    { name: "小黄人园区", x: 366, y: 72, w: 246, h: 162, color: "#fff0a6" },
    { name: "小猪佩奇园区", x: 640, y: 72, w: 286, h: 180, color: "#ffe0ef" },
    { name: "马里奥园区", x: 58, y: 378, w: 294, h: 166, color: "#ffe1df" },
    { name: "侏罗纪园区", x: 366, y: 392, w: 260, h: 160, color: "#d9f2d6" },
    { name: "鬼屋街", x: 692, y: 260, w: 240, h: 132, color: "#d9dde2" },
    { name: "餐厅", x: 674, y: 430, w: 252, h: 128, color: "#ffeed3" }
  ];
  zones.forEach((zone) => {
    ctx.fillStyle = zone.color;
    roundRect(zone.x, zone.y, zone.w, zone.h, 16);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.font = "bold 18px system-ui";
    ctx.fillText(zone.name, zone.x + 16, zone.y + 28);
  });
}

function drawRides() {
  rides.forEach((ride, index) => {
    const active = index === selected;
    ctx.save();
    ctx.translate(ride.x, ride.y);
    if (active) {
      ctx.fillStyle = "rgba(255,209,95,0.5)";
      ctx.beginPath();
      ctx.arc(0, 0, 58, 0, Math.PI * 2);
      ctx.fill();
    }
    if (ride.name.includes("过山车") || ride.name.includes("飞车") || ride.name.includes("赛车")) {
      drawCoaster(ride.color, active);
    } else if (ride.name === "海盗船") {
      drawPirateShip(active);
    } else if (ride.name === "旋转木马") {
      drawCarousel(active);
    } else {
      drawGhostHouseIcon(active);
    }
    ctx.fillStyle = "#172632";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(ride.name, 0, 64);
    ctx.restore();
  });
  ctx.textAlign = "left";
}

function drawCoaster(color, active) {
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-54, 20);
  ctx.quadraticCurveTo(-24, -46, 8, 8);
  ctx.quadraticCurveTo(36, 50, 58, -16);
  ctx.stroke();
  const t = active && mode === "ride" ? rideTime : 0;
  const carX = -38 + ((t * 4) % 86);
  const carY = Math.sin(t / 10) * 18;
  ctx.fillStyle = color;
  roundRect(carX - 18, carY - 12, 36, 24, 7);
  ctx.fill();
}

function drawPirateShip(active) {
  const swing = active && mode === "ride" ? Math.sin(rideTime / 12) * 0.55 : 0;
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.lineTo(-44, 34);
  ctx.moveTo(0, -42);
  ctx.lineTo(44, 34);
  ctx.stroke();
  ctx.save();
  ctx.rotate(swing);
  ctx.fillStyle = "#9b6a3c";
  ctx.beginPath();
  ctx.moveTo(-54, 10);
  ctx.quadraticCurveTo(0, 54, 54, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCarousel(active) {
  const spin = active && mode === "ride" ? rideTime / 20 : 0;
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 4; i += 1) {
    const angle = spin + i * Math.PI / 2;
    ctx.fillStyle = ["#d93a32", "#245b8f", "#39a657", "#7b4dc5"][i];
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 30, Math.sin(angle) * 30, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGhostHouseIcon(active) {
  ctx.fillStyle = active ? "#111820" : "#2d3640";
  roundRect(-42, -38, 84, 76, 8);
  ctx.fill();
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.arc(-16, -6, 7, 0, Math.PI * 2);
  ctx.arc(18, -6, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawHauntedHouse() {
  hauntOffset += 1;
  ctx.fillStyle = "rgba(17,24,32,0.84)";
  roundRect(74, 82, 832, 476, 18);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 28px system-ui";
  ctx.fillText("鬼屋里面", 112, 130);
  monsters.forEach((name, index) => {
    const x = 130 + (index % 3) * 254 + Math.sin((hauntOffset + index * 20) / 18) * 18;
    const y = 204 + Math.floor(index / 3) * 118;
    drawMonster(name, x, y, index);
  });
}

function drawMonster(name, x, y, index) {
  const colors = ["#6dbd8b", "#8c6d62", "#e9eef2", "#7b4dc5", "#39a657", "#dfe8ff", "#ff8a2d", "#111820", "#394250"];
  ctx.fillStyle = colors[index];
  if (name === "骷髅头") {
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.beginPath();
    ctx.arc(x - 9, y - 4, 5, 0, Math.PI * 2);
    ctx.arc(x + 9, y - 4, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (name === "幽灵") {
    ctx.beginPath();
    ctx.arc(x, y - 12, 28, Math.PI, 0);
    ctx.lineTo(x + 28, y + 28);
    ctx.lineTo(x + 10, y + 18);
    ctx.lineTo(x - 8, y + 28);
    ctx.lineTo(x - 28, y + 18);
    ctx.closePath();
    ctx.fill();
  } else if (name === "南瓜") {
    ctx.beginPath();
    ctx.ellipse(x, y, 36, 26, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    roundRect(x - 32, y - 34, 64, 68, 18);
    ctx.fill();
  }
  ctx.fillStyle = "#fff";
  ctx.font = "bold 16px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(name, x, y + 54);
  ctx.textAlign = "left";
}

function drawFood() {
  ctx.fillStyle = "rgba(255,250,240,0.9)";
  roundRect(250, 174, 480, 260, 16);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 30px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("餐厅休息中", 490, 230);
  ["汉堡", "薯条", "冰淇淋", "果汁"].forEach((food, index) => {
    ctx.fillStyle = ["#9b6a3c", "#ffd15f", "#f49ac2", "#39a657"][index];
    ctx.beginPath();
    ctx.arc(338 + index * 100, 320, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.font = "bold 16px system-ui";
    ctx.fillText(food, 338 + index * 100, 370);
  });
  ctx.textAlign = "left";
}

function drawStation() {
  ctx.fillStyle = "rgba(231,241,255,0.94)";
  roundRect(236, 164, 520, 286, 16);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 30px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("超级游乐园地铁站", 496, 222);
  ctx.fillStyle = "#245b8f";
  roundRect(294, 258, 404, 70, 20);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px system-ui";
  ctx.fillText("下一站：商场 / 家门口", 496, 300);
  if (trainTimer > 0) {
    const x = 272 + (110 - trainTimer) * 3.8;
    ctx.fillStyle = "#d9e6ec";
    roundRect(x, 350, 188, 48, 20);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.font = "bold 14px system-ui";
    ctx.fillText(trainDestination === "mall" ? "开往商场" : "开回家", x + 94, 380);
    trainTimer = Math.max(0, trainTimer - 1);
  }
  ctx.textAlign = "left";
}

function drawVisitor() {
  const ride = rides[selected];
  const angle = mode === "ride" ? rideTime / 14 : 0;
  const x = mode === "food" ? 490 : mode === "station" ? 496 : ride.x + Math.cos(angle) * 28;
  const y = mode === "food" ? 286 : mode === "station" ? 336 : ride.y + Math.sin(angle) * 20;
  ctx.fillStyle = "#f0bb87";
  ctx.beginPath();
  ctx.arc(x, y - 38, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d93a32";
  roundRect(x - 16, y - 24, 32, 38, 9);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("我", x, y - 34);
  ctx.textAlign = "left";
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function draw() {
  rideTime += 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPark();
  requestAnimationFrame(draw);
}

document.querySelector("#startBtn").addEventListener("click", startRide);
document.querySelector("#hauntBtn").addEventListener("click", enterHaunt);
document.querySelector("#foodBtn").addEventListener("click", goFood);
document.querySelector("#stationBtn").addEventListener("click", goStation);
document.querySelector("#toMallBtn").addEventListener("click", () => rideTrain("mall"));
document.querySelector("#toHomeBtn").addEventListener("click", () => rideTrain("home"));

renderButtons();
draw();
