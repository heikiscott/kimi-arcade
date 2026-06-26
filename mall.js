const canvas = document.querySelector("#mallCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.querySelector("#statusText");
const moneyText = document.querySelector("#moneyText");
const floorText = document.querySelector("#floorText");
const floorGrid = document.querySelector("#floorGrid");
const bagList = document.querySelector("#bagList");

const player = { x: 480, y: 510, pose: 0, dir: "down" };
let money = 800;
let sparkle = 0;
let currentFloor = 1;
let elevatorFlash = 0;
let trainTimer = 0;
let trainDestination = "";
const bag = [];

const floors = [
  {
    id: 1,
    label: "1F 美食餐厅",
    short: "1F",
    intro: "一楼都是吃饭的：麦克冰块、一点点、喜茶、美食广场和餐厅。",
    shops: [
      { name: "麦克冰块", x: 76, y: 92, w: 210, h: 150, color: "#ff8a2d" },
      { name: "一点点", x: 374, y: 92, w: 210, h: 150, color: "#ffd15f" },
      { name: "喜茶", x: 672, y: 92, w: 210, h: 150, color: "#39a657" },
      { name: "美食广场", x: 76, y: 326, w: 210, h: 150, color: "#d94a78" },
      { name: "餐厅", x: 672, y: 326, w: 210, h: 150, color: "#245b8f" }
    ],
    goods: [
      good("汉堡", 38, "麦克冰块", 148, 202, "#9b6a3c"),
      good("冰块饮料", 18, "麦克冰块", 220, 202, "#d6ecff"),
      good("珍珠奶茶", 26, "一点点", 448, 202, "#9b6a3c"),
      good("芝士茶", 32, "喜茶", 746, 202, "#39a657"),
      good("鸡腿饭", 45, "美食广场", 148, 436, "#ff8a2d"),
      good("冰淇淋", 28, "餐厅", 746, 436, "#f5dfe8")
    ]
  },
  {
    id: 2,
    label: "2F 地铁站",
    short: "2F",
    intro: "二楼有地铁站，可以坐地铁去超级游乐园，也可以回到自己家。",
    shops: [
      { name: "地铁站", x: 76, y: 92, w: 508, h: 150, color: "#245b8f" },
      { name: "回家站口", x: 672, y: 92, w: 210, h: 150, color: "#39a657" },
      { name: "售票机", x: 76, y: 326, w: 210, h: 150, color: "#ffd15f" },
      { name: "游乐园方向", x: 672, y: 326, w: 210, h: 150, color: "#d94a78" }
    ],
    goods: [
      good("地铁票", 6, "售票机", 148, 436, "#245b8f"),
      good("交通卡", 30, "售票机", 220, 436, "#ffd15f"),
      good("小地图", 10, "地铁站", 448, 202, "#ffffff")
    ]
  },
  {
    id: 3,
    label: "3F 商店街",
    short: "3F",
    intro: "三楼是超市、玩具店、服装店和游戏店。",
    shops: [
      { name: "超市", x: 76, y: 92, w: 210, h: 150, color: "#39a657" },
      { name: "玩具店", x: 374, y: 92, w: 210, h: 150, color: "#ffd15f" },
      { name: "服装店", x: 672, y: 92, w: 210, h: 150, color: "#d94a78" },
      { name: "游戏店", x: 672, y: 326, w: 210, h: 150, color: "#245b8f" }
    ],
    goods: [
      good("苹果汁", 18, "超市", 148, 202, "#d93a32"),
      good("薯片", 22, "超市", 218, 202, "#ffd15f"),
      good("小汽车", 65, "玩具店", 448, 202, "#245b8f"),
      good("娃娃", 78, "玩具店", 520, 202, "#d94a78"),
      good("帽子", 42, "服装店", 746, 202, "#39a657"),
      good("游戏卡", 88, "游戏店", 746, 436, "#172632")
    ]
  },
  {
    id: 4,
    label: "4F 无人机层",
    short: "4F",
    intro: "四楼卖很多无人机，有迷你无人机、拍照无人机和高速无人机。",
    shops: [
      { name: "无人机旗舰店", x: 76, y: 92, w: 300, h: 150, color: "#245b8f" },
      { name: "航拍店", x: 428, y: 92, w: 210, h: 150, color: "#39a657" },
      { name: "配件店", x: 692, y: 92, w: 190, h: 150, color: "#ffd15f" },
      { name: "试飞区", x: 210, y: 326, w: 540, h: 150, color: "#d6ecff" }
    ],
    goods: [
      good("迷你无人机", 120, "无人机旗舰店", 158, 202, "#245b8f"),
      good("航拍无人机", 260, "航拍店", 502, 202, "#39a657"),
      good("备用螺旋桨", 35, "配件店", 760, 202, "#172632"),
      good("试飞票", 0, "试飞区", 478, 436, "#ffd15f")
    ]
  },
  {
    id: 5,
    label: "5F 室内游乐园",
    short: "5F",
    intro: "五楼有奈尔堡游乐园、小过山车、小游戏机和饮料店。",
    shops: [
      { name: "奈尔堡游乐园", x: 76, y: 92, w: 300, h: 150, color: "#7b4dc5" },
      { name: "小过山车", x: 428, y: 92, w: 210, h: 150, color: "#d93a32" },
      { name: "小游戏机", x: 692, y: 92, w: 190, h: 150, color: "#245b8f" },
      { name: "饮料休息区", x: 210, y: 326, w: 540, h: 150, color: "#ffd15f" }
    ],
    goods: [
      good("游乐园票", 68, "奈尔堡游乐园", 158, 202, "#7b4dc5"),
      good("过山车票", 45, "小过山车", 502, 202, "#d93a32"),
      good("游戏币", 20, "小游戏机", 760, 202, "#245b8f"),
      good("果茶", 25, "饮料休息区", 478, 436, "#39a657")
    ]
  },
  {
    id: 6,
    label: "6F 免费冰场",
    short: "6F",
    intro: "六楼是免费的冰场和冰雪世界，有冰床、冰滑梯、冰雕和下雪口。",
    shops: [
      { name: "免费滑冰场", x: 76, y: 92, w: 420, h: 180, color: "#d6ecff" },
      { name: "冰雪世界", x: 546, y: 92, w: 336, h: 180, color: "#e7f1ff" },
      { name: "冰床", x: 76, y: 354, w: 190, h: 122, color: "#bfe8ff" },
      { name: "冰滑梯", x: 300, y: 354, w: 190, h: 122, color: "#d6ecff" },
      { name: "冰雕", x: 524, y: 354, w: 150, h: 122, color: "#ffffff" },
      { name: "下雪口", x: 708, y: 354, w: 174, h: 122, color: "#f2fbff" }
    ],
    goods: [
      good("滑冰鞋", 0, "免费滑冰场", 170, 222, "#245b8f"),
      good("冰雪手环", 0, "冰雪世界", 648, 222, "#d94a78"),
      good("雪花", 0, "下雪口", 776, 436, "#ffffff")
    ]
  }
];

function good(name, price, shop, x, y, color) {
  return { name, price, shop, x, y, color, bought: false };
}

function floor() {
  return floors[currentFloor - 1];
}

function goods() {
  return floor().goods;
}

function shops() {
  return floor().shops;
}

function setStatus(text) {
  statusText.textContent = text;
}

function changeFloor(id) {
  if (id === currentFloor) {
    setStatus(`你已经在${floor().label}了。`);
    return;
  }
  currentFloor = id;
  player.x = 478;
  player.y = 360;
  player.pose += 1;
  elevatorFlash = 80;
  trainTimer = 0;
  floorText.textContent = `电梯按钮 · ${floor().label}`;
  setStatus(`电梯门关上，叮，到了${floor().label}。${floor().intro}`);
  renderFloorButtons();
}

function renderFloorButtons() {
  floorGrid.innerHTML = "";
  floors.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = item.id === currentFloor ? "active" : "";
    button.textContent = `按 ${item.short}`;
    button.addEventListener("click", () => changeFloor(item.id));
    floorGrid.appendChild(button);
  });
}

function move(dx, dy, dir) {
  player.x = Math.max(44, Math.min(canvas.width - 44, player.x + dx));
  player.y = Math.max(62, Math.min(canvas.height - 42, player.y + dy));
  player.pose += 1;
  player.dir = dir;
  setStatus(`小朋友在${floor().label}往${{ up: "上", down: "下", left: "左", right: "右" }[dir]}走。`);
}

function nearestGood() {
  let best = null;
  let bestDistance = Infinity;
  goods().forEach((item) => {
    if (item.bought) return;
    const distance = Math.hypot(item.x - player.x, item.y - player.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = item;
    }
  });
  return bestDistance < 140 ? best : null;
}

function buy() {
  const item = nearestGood();
  if (!item) {
    setStatus("要走近一点，站在商品旁边才可以买。");
    return;
  }
  if (money < item.price) {
    setStatus(`钱不够了，${item.name}要 ${item.price} 元。`);
    return;
  }
  item.bought = true;
  money -= item.price;
  bag.push({ ...item, floor: floor().label });
  sparkle = 50;
  renderInfo();
  setStatus(item.price === 0 ? `${item.name}是免费的，拿到了!` : `买到了${item.name}，花了 ${item.price} 元。`);
}

function goToShop(shopName) {
  const currentShop = shops().find((item) => item.name.includes(shopName) || shopName.includes(item.name));
  if (!currentShop) {
    setStatus(`${floor().label}没有${shopName}，可以先换楼层。`);
    return;
  }
  player.x = currentShop.x + currentShop.w / 2;
  player.y = Math.min(canvas.height - 64, currentShop.y + currentShop.h + 34);
  player.pose += 1;
  setStatus(`到了${currentShop.name}门口。`);
}

function goMetro() {
  if (currentFloor !== 2) {
    changeFloor(2);
    setStatus("已经坐电梯到二楼地铁站。这里可以坐地铁去超级游乐园，也可以回家。");
    return;
  }
  goToShop("地铁站");
}

function rideMetro(destination) {
  if (currentFloor !== 2) {
    changeFloor(2);
    setStatus("先到二楼地铁站，再点一次坐地铁。");
    return;
  }
  trainDestination = destination;
  trainTimer = 120;
  const moved = window.TransitChannel?.moveOne("mall", destination === "park" ? "park" : "home");
  if (!moved) {
    trainTimer = 0;
    setStatus("商场频道现在没有人。可以先从家里坐地铁到商场。");
    return;
  }
  setStatus(destination === "park" ? "地铁开往超级游乐园，门关，请站稳。" : "地铁开回家，门关，请站稳。");
  setTimeout(() => {
    window.location.href = destination === "park" ? "amusement.html" : "home-play.html";
  }, 1500);
}

function checkout() {
  if (bag.length === 0) {
    setStatus("购物袋还是空的，先去买一点东西。");
    return;
  }
  sparkle = 90;
  setStatus(`结账完成，一共拿了 ${bag.length} 样东西，还剩 ${money} 元。`);
}

function renderInfo() {
  moneyText.textContent = `${money} 元`;
  bagList.innerHTML = bag.length
    ? bag.map((item) => `<span>${item.name} - ${item.price} 元</span>`).join("")
    : "还没有买东西。";
}

function drawMall() {
  ctx.fillStyle = currentFloor === 6 ? "#f2fbff" : "#fffaf0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawAtrium();
  drawFloorSign();
  shops().forEach(drawShop);
  if (currentFloor === 2) drawMetroStation();
  if (currentFloor === 6) drawSnow();
  drawPeopleCount();
}

function drawPeopleCount() {
  const count = window.TransitChannel?.count("mall") ?? 0;
  ctx.fillStyle = "#172632";
  roundRect(680, 34, 206, 44, 10);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px system-ui";
  ctx.fillText(`商场频道：${count} 人`, 700, 63);
  for (let index = 0; index < count; index += 1) {
    const x = 690 + index * 34;
    const y = 520;
    ctx.fillStyle = ["#d94a78", "#7b4dc5", "#39a657", "#245b8f"][index % 4];
    ctx.beginPath();
    ctx.arc(x, y - 30, 10, 0, Math.PI * 2);
    ctx.fill();
    roundRect(x - 10, y - 18, 20, 28, 8);
    ctx.fill();
  }
}

function drawAtrium() {
  ctx.fillStyle = currentFloor === 2 ? "#dfe8f1" : "#e7edf1";
  ctx.fillRect(54, 276, 852, 44);
  ctx.fillRect(306, 62, 44, 496);
  ctx.fillRect(610, 62, 44, 496);
  ctx.fillStyle = elevatorFlash > 0 ? "#ffd15f" : "#d9e6ec";
  roundRect(410, 244, 144, 132, 12);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.fillRect(478, 254, 8, 110);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("电梯", 482, 238);
  ctx.fillText(floor().short, 482, 306);
  ctx.textAlign = "left";
  ctx.fillStyle = "#172632";
  ctx.font = "bold 18px system-ui";
  ctx.fillText("到这里搭电梯，再按 1-6 楼", 352, 404);
  elevatorFlash = Math.max(0, elevatorFlash - 1);
}

function drawFloorSign() {
  ctx.fillStyle = "#172632";
  roundRect(72, 34, 390, 44, 10);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 24px system-ui";
  ctx.fillText(floor().label, 92, 64);
  ctx.fillStyle = "#4d5f6a";
  ctx.font = "bold 15px system-ui";
  ctx.fillText(floor().intro, 72, 596);
}

function drawShop(shop) {
  ctx.fillStyle = shop.color;
  roundRect(shop.x, shop.y, shop.w, shop.h, 12);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  roundRect(shop.x + 18, shop.y + 42, shop.w - 36, Math.max(48, shop.h - 80), 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = shop.name.length > 6 ? "bold 20px system-ui" : "bold 25px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(shop.name, shop.x + shop.w / 2, shop.y + 34);
  ctx.font = "bold 14px system-ui";
  ctx.fillText("入口", shop.x + shop.w / 2, shop.y + shop.h - 14);
  ctx.textAlign = "left";
}

function drawMetroStation() {
  const trainX = trainTimer > 0 ? 140 + (120 - trainTimer) * 5.8 : 150;
  ctx.fillStyle = "#172632";
  ctx.fillRect(116, 164, 430, 42);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px system-ui";
  ctx.fillText("MRT 地铁站台", 146, 192);
  ctx.fillStyle = "#d9e6ec";
  roundRect(trainX, 214, 318, 72, 20);
  ctx.fill();
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(trainX + 28, 236, 56, 26);
  ctx.fillRect(trainX + 114, 236, 56, 26);
  ctx.fillRect(trainX + 200, 236, 56, 26);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 15px system-ui";
  ctx.fillText(trainDestination === "park" ? "开往超级游乐园" : "开往家门口", trainX + 84, 258);
  trainTimer = Math.max(0, trainTimer - 1);
}

function drawSnow() {
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (let i = 0; i < 34; i += 1) {
    const x = (i * 83 + performance.now() / 20) % canvas.width;
    const y = (i * 47 + performance.now() / 12) % canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGoods() {
  goods().forEach((item) => {
    if (item.bought) return;
    ctx.fillStyle = item.color;
    if (item.name.includes("冰淇淋") || item.name.includes("雪花")) {
      ctx.beginPath();
      ctx.arc(item.x, item.y - 8, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c98a4b";
      ctx.beginPath();
      ctx.moveTo(item.x - 14, item.y + 8);
      ctx.lineTo(item.x + 14, item.y + 8);
      ctx.lineTo(item.x, item.y + 34);
      ctx.closePath();
      ctx.fill();
    } else if (item.name.includes("无人机")) {
      drawDrone(item.x, item.y, item.color);
    } else {
      roundRect(item.x - 25, item.y - 20, 50, 40, 8);
      ctx.fill();
    }
    ctx.fillStyle = "#172632";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(item.name, item.x, item.y + 42);
    ctx.fillText(item.price === 0 ? "免费" : `${item.price}元`, item.x, item.y + 59);
    ctx.textAlign = "left";
  });
}

function drawDrone(x, y, color) {
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 32, y - 20);
  ctx.lineTo(x + 32, y + 20);
  ctx.moveTo(x + 32, y - 20);
  ctx.lineTo(x - 32, y + 20);
  ctx.stroke();
  ctx.fillStyle = color;
  roundRect(x - 18, y - 12, 36, 24, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  [[-40, -26], [40, -26], [-40, 26], [40, 26]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.ellipse(x + dx, y + dy, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPlayer() {
  const bob = Math.sin((player.pose + performance.now() / 120) * 0.9) * 2;
  ctx.save();
  ctx.translate(player.x, player.y + bob);
  ctx.fillStyle = "#f0bb87";
  ctx.beginPath();
  ctx.arc(0, -52, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#245b8f";
  ctx.beginPath();
  ctx.arc(0, -64, 20, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#d94a78";
  roundRect(-20, -36, 40, 44, 10);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-26 + (player.pose % 2) * 8, 28);
  ctx.moveTo(14, 0);
  ctx.lineTo(26 - (player.pose % 2) * 8, 28);
  ctx.moveTo(-18, -24);
  ctx.lineTo(-36, -6);
  ctx.moveTo(18, -24);
  ctx.lineTo(36, -6);
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 14px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("我", 0, -48);
  if (sparkle > 0) {
    ctx.fillStyle = "#ffd15f";
    ctx.font = "bold 24px system-ui";
    ctx.fillText("拿到了!", 0, -86);
  }
  ctx.restore();
  sparkle = Math.max(0, sparkle - 1);
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMall();
  drawGoods();
  drawPlayer();
  requestAnimationFrame(draw);
}

document.querySelector("#upBtn").addEventListener("click", () => move(0, -34, "up"));
document.querySelector("#downBtn").addEventListener("click", () => move(0, 34, "down"));
document.querySelector("#leftBtn").addEventListener("click", () => move(-34, 0, "left"));
document.querySelector("#rightBtn").addEventListener("click", () => move(34, 0, "right"));
document.querySelector("#buyBtn").addEventListener("click", buy);
document.querySelector("#eatBtn").addEventListener("click", () => currentFloor === 1 ? goToShop("餐厅") : changeFloor(1));
document.querySelector("#toyBtn").addEventListener("click", () => currentFloor === 3 ? goToShop("玩具店") : changeFloor(3));
document.querySelector("#payBtn").addEventListener("click", checkout);
document.querySelector("#metroBtn").addEventListener("click", goMetro);
document.querySelector("#toParkBtn").addEventListener("click", () => rideMetro("park"));
document.querySelector("#toHomeBtn").addEventListener("click", () => rideMetro("home"));

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (/^[1-6]$/.test(key)) changeFloor(Number(key));
  if (key === "w" || event.key === "ArrowUp") move(0, -34, "up");
  if (key === "s" || event.key === "ArrowDown") move(0, 34, "down");
  if (key === "a" || event.key === "ArrowLeft") move(-34, 0, "left");
  if (key === "d" || event.key === "ArrowRight") move(34, 0, "right");
  if (event.code === "Space") buy();
  if (key === "e") currentFloor === 1 ? goToShop("餐厅") : changeFloor(1);
  if (key === "t") currentFloor === 3 ? goToShop("玩具店") : changeFloor(3);
  if (key === "m") goMetro();
});

renderFloorButtons();
renderInfo();
floorText.textContent = `电梯按钮 · ${floor().label}`;
setStatus(floor().intro);
draw();
