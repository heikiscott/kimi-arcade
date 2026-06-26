const canvas = document.querySelector("#mallCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.querySelector("#statusText");
const moneyText = document.querySelector("#moneyText");
const bagList = document.querySelector("#bagList");

const player = { x: 480, y: 510, pose: 0, dir: "down" };
let money = 500;
let sparkle = 0;
const bag = [];

const shops = [
  { name: "超市", x: 76, y: 92, w: 210, h: 150, color: "#39a657" },
  { name: "玩具店", x: 374, y: 92, w: 210, h: 150, color: "#ffd15f" },
  { name: "服装店", x: 672, y: 92, w: 210, h: 150, color: "#d94a78" },
  { name: "餐厅", x: 76, y: 326, w: 210, h: 150, color: "#ff8a2d" },
  { name: "游戏店", x: 672, y: 326, w: 210, h: 150, color: "#245b8f" }
];

const goods = [
  { name: "苹果汁", price: 18, shop: "超市", x: 148, y: 202, color: "#d93a32", bought: false },
  { name: "薯片", price: 22, shop: "超市", x: 218, y: 202, color: "#ffd15f", bought: false },
  { name: "小汽车", price: 65, shop: "玩具店", x: 448, y: 202, color: "#245b8f", bought: false },
  { name: "娃娃", price: 78, shop: "玩具店", x: 520, y: 202, color: "#d94a78", bought: false },
  { name: "帽子", price: 42, shop: "服装店", x: 746, y: 202, color: "#39a657", bought: false },
  { name: "新衣服", price: 120, shop: "服装店", x: 820, y: 202, color: "#7b4dc5", bought: false },
  { name: "汉堡", price: 38, shop: "餐厅", x: 148, y: 436, color: "#9b6a3c", bought: false },
  { name: "冰淇淋", price: 28, shop: "餐厅", x: 220, y: 436, color: "#f5dfe8", bought: false },
  { name: "游戏卡", price: 88, shop: "游戏店", x: 746, y: 436, color: "#172632", bought: false },
  { name: "手柄", price: 110, shop: "游戏店", x: 820, y: 436, color: "#d93a32", bought: false }
];

function setStatus(text) {
  statusText.textContent = text;
}

function move(dx, dy, dir) {
  player.x = Math.max(44, Math.min(canvas.width - 44, player.x + dx));
  player.y = Math.max(62, Math.min(canvas.height - 42, player.y + dy));
  player.pose += 1;
  player.dir = dir;
  setStatus(`小朋友往${{ up: "上", down: "下", left: "左", right: "右" }[dir]}走。`);
}

function nearestGood() {
  let best = null;
  let bestDistance = Infinity;
  goods.forEach((good) => {
    if (good.bought) return;
    const distance = Math.hypot(good.x - player.x, good.y - player.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = good;
    }
  });
  return bestDistance < 130 ? best : null;
}

function buy() {
  const good = nearestGood();
  if (!good) {
    setStatus("要走近一点，站在商品旁边才可以买。");
    return;
  }
  if (money < good.price) {
    setStatus(`钱不够了，${good.name}要 ${good.price} 元。`);
    return;
  }
  good.bought = true;
  money -= good.price;
  bag.push(good);
  sparkle = 50;
  renderInfo();
  setStatus(`买到了${good.name}，花了 ${good.price} 元。`);
}

function goToShop(shopName) {
  const shop = shops.find((item) => item.name === shopName);
  player.x = shop.x + shop.w / 2;
  player.y = shop.y + shop.h + 34;
  player.pose += 1;
  setStatus(`到了${shopName}门口。`);
}

function checkout() {
  if (bag.length === 0) {
    setStatus("购物袋还是空的，先去买一点东西。");
    return;
  }
  sparkle = 90;
  setStatus(`结账完成，一共买了 ${bag.length} 样东西，还剩 ${money} 元。`);
}

function renderInfo() {
  moneyText.textContent = `${money} 元`;
  bagList.innerHTML = bag.length
    ? bag.map((item) => `<span>${item.name} - ${item.price} 元</span>`).join("")
    : "还没有买东西。";
}

function drawMall() {
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#e7edf1";
  ctx.fillRect(54, 276, 852, 44);
  ctx.fillRect(306, 62, 44, 496);
  ctx.fillRect(610, 62, 44, 496);

  shops.forEach((shop) => {
    ctx.fillStyle = shop.color;
    roundRect(shop.x, shop.y, shop.w, shop.h, 12);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    roundRect(shop.x + 18, shop.y + 42, shop.w - 36, 70, 8);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.font = "bold 26px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(shop.name, shop.x + shop.w / 2, shop.y + 34);
    ctx.font = "bold 14px system-ui";
    ctx.fillText("入口", shop.x + shop.w / 2, shop.y + shop.h - 14);
  });
  ctx.textAlign = "left";
}

function drawGoods() {
  goods.forEach((good) => {
    if (good.bought) return;
    ctx.fillStyle = good.color;
    if (good.name.includes("冰淇淋")) {
      ctx.beginPath();
      ctx.arc(good.x, good.y - 8, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c98a4b";
      ctx.beginPath();
      ctx.moveTo(good.x - 14, good.y + 8);
      ctx.lineTo(good.x + 14, good.y + 8);
      ctx.lineTo(good.x, good.y + 34);
      ctx.closePath();
      ctx.fill();
    } else {
      roundRect(good.x - 24, good.y - 20, 48, 40, 8);
      ctx.fill();
    }
    ctx.fillStyle = "#172632";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(good.name, good.x, good.y + 42);
    ctx.fillText(`${good.price}元`, good.x, good.y + 59);
  });
  ctx.textAlign = "left";
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
    ctx.fillText("买到了!", 0, -86);
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
document.querySelector("#eatBtn").addEventListener("click", () => goToShop("餐厅"));
document.querySelector("#toyBtn").addEventListener("click", () => goToShop("玩具店"));
document.querySelector("#payBtn").addEventListener("click", checkout);

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "w" || event.key === "ArrowUp") move(0, -34, "up");
  if (key === "s" || event.key === "ArrowDown") move(0, 34, "down");
  if (key === "a" || event.key === "ArrowLeft") move(-34, 0, "left");
  if (key === "d" || event.key === "ArrowRight") move(34, 0, "right");
  if (event.code === "Space") buy();
  if (key === "e") goToShop("餐厅");
  if (key === "t") goToShop("玩具店");
});

renderInfo();
draw();
