const canvas = document.querySelector("#roomCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.querySelector("#statusText");

const W = canvas.width;
const H = canvas.height;
const ROOM = { x: 92, y: 72, w: 776, h: 456 };
const DOOR = { x: 430, y: 54, w: 100, h: 54 };
const hero = {
  x: 480,
  y: 465,
  targetX: 480,
  targetY: 465,
  movingForward: false
};

const rooms = [
  { name: "第一房间：蓝色石板", clue: "蓝色钥匙碎片", x: 230, y: 310, color: "#32c7d9", found: false },
  { name: "第二房间：书架密语", clue: "书里的密码纸", x: 680, y: 245, color: "#ffd15f", found: false },
  { name: "第三房间：镜子暗号", clue: "镜子后面的星星", x: 330, y: 190, color: "#8f5fd9", found: false },
  { name: "第四房间：地毯机关", clue: "地毯下面的按钮", x: 605, y: 365, color: "#39a657", found: false },
  { name: "第五房间：出口大厅", clue: "最后的出口钥匙", x: 475, y: 255, color: "#f28b2f", found: false }
];

let roomIndex = 0;
let exited = false;
let pulse = 0;

function room() {
  return rooms[roomIndex];
}

function say(text) {
  statusText.textContent = text;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b, x, y) {
  return Math.hypot(a - x, b - y);
}

function move(dx, dy) {
  if (exited || hero.movingForward) return;
  hero.x = clamp(hero.x + dx, ROOM.x + 42, ROOM.x + ROOM.w - 42);
  hero.y = clamp(hero.y + dy, ROOM.y + 42, ROOM.y + ROOM.h - 42);
  hero.targetX = hero.x;
  hero.targetY = hero.y;
  const near = distance(hero.x, hero.y, room().x, room().y) < 64;
  say(near ? `你靠近了线索：${room().clue}。点“搜索线索”。` : `${room().name}。继续找线索。`);
}

function searchClue() {
  if (exited || hero.movingForward) return;
  const current = room();
  if (current.found) {
    say("这个房间的线索已经找到了，门已经打开，可以往前走。");
    return;
  }
  if (distance(hero.x, hero.y, current.x, current.y) > 72) {
    say("还没走到线索旁边。看看发光的东西，走近一点再搜索。");
    return;
  }
  current.found = true;
  say(`找到了！${current.clue}。前面的门打开了。`);
}

function advanceRoom() {
  if (exited || hero.movingForward) return;
  if (!room().found) {
    say("门还没开。先找到这个房间的线索。");
    return;
  }
  hero.movingForward = true;
  hero.targetX = DOOR.x + DOOR.w / 2;
  hero.targetY = ROOM.y + 12;
  say(roomIndex === rooms.length - 1 ? "最后的门打开了，你正在走出密室。" : "门打开了，小人正在往前面的房间走。");
}

function showMap() {
  if (exited) {
    say("地图显示：你已经从五个房间里出来了。");
    return;
  }
  say(`地图：现在是第 ${roomIndex + 1}/5 个房间。${room().found ? "本房间门已开。" : "还要找线索。"}`);
}

function resetGame() {
  rooms.forEach((item) => {
    item.found = false;
  });
  roomIndex = 0;
  exited = false;
  hero.x = 480;
  hero.y = 465;
  hero.targetX = 480;
  hero.targetY = 465;
  hero.movingForward = false;
  say("重新开始：第一房间，找到线索后门才会开。");
}

function action(name) {
  if (name === "search") searchClue();
  if (name === "advance") advanceRoom();
  if (name === "map") showMap();
  if (name === "reset") resetGame();
}

function roundedRect(x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0d1721");
  g.addColorStop(0.55, "#172632");
  g.addColorStop(1, "#2f3a40");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawRoom() {
  const current = room();
  ctx.fillStyle = "#233744";
  ctx.beginPath();
  roundedRect(ROOM.x, ROOM.y, ROOM.w, ROOM.h, 16);
  ctx.fill();
  ctx.strokeStyle = "#d9c184";
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let x = ROOM.x + 48; x < ROOM.x + ROOM.w; x += 74) ctx.fillRect(x, ROOM.y + 20, 3, ROOM.h - 40);
  for (let y = ROOM.y + 48; y < ROOM.y + ROOM.h; y += 64) ctx.fillRect(ROOM.x + 20, y, ROOM.w - 40, 3);

  ctx.fillStyle = current.found ? "#2ecf8f" : "#3a4148";
  ctx.beginPath();
  roundedRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h, 10);
  ctx.fill();
  ctx.strokeStyle = current.found ? "#ffffff" : "#8b9298";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "900 20px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(current.found ? "门开了" : "锁住", DOOR.x + DOOR.w / 2, DOOR.y + 34);

  ctx.fillStyle = "#f4e7c0";
  ctx.font = "900 28px system-ui";
  ctx.fillText(current.name, W / 2, 42);
  ctx.textAlign = "left";
}

function drawObjects(time) {
  const current = room();
  const s = 1 + Math.sin(time * 5) * 0.08;
  ctx.save();
  ctx.translate(current.x, current.y);
  ctx.scale(s, s);
  ctx.fillStyle = current.found ? "rgba(255,255,255,0.45)" : current.color;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 22px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(current.found ? "✓" : "?", 0, 8);
  ctx.restore();
  ctx.textAlign = "left";

  drawFurniture();
}

function drawFurniture() {
  ctx.fillStyle = "#6a4d31";
  ctx.beginPath();
  roundedRect(145, 120, 150, 50, 10);
  ctx.fill();
  ctx.fillStyle = "#305466";
  ctx.beginPath();
  roundedRect(665, 130, 120, 88, 12);
  ctx.fill();
  ctx.fillStyle = "#553a63";
  ctx.beginPath();
  roundedRect(155, 390, 170, 70, 12);
  ctx.fill();
  ctx.fillStyle = "#405c35";
  ctx.beginPath();
  roundedRect(720, 400, 92, 72, 12);
  ctx.fill();
}

function drawProgress() {
  for (let i = 0; i < rooms.length; i += 1) {
    ctx.fillStyle = i < roomIndex || rooms[i].found ? "#2ecf8f" : i === roomIndex ? "#ffd15f" : "#66727a";
    ctx.beginPath();
    ctx.arc(330 + i * 74, 580, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.font = "900 16px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(String(i + 1), 330 + i * 74, 586);
  }
  ctx.textAlign = "left";
}

function drawHero(time) {
  const bob = Math.sin(time * 7) * (hero.movingForward ? 6 : 2);
  ctx.save();
  ctx.translate(hero.x, hero.y + bob);
  ctx.fillStyle = "#f2c49c";
  ctx.beginPath();
  ctx.arc(0, -8, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#29a99d";
  ctx.beginPath();
  roundedRect(-23, 8, 46, 48, 13);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(-7, -13, 3, 0, Math.PI * 2);
  ctx.arc(7, -13, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -4, 8, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

function drawExit() {
  ctx.fillStyle = "#9edcff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#39a657";
  ctx.fillRect(0, 420, W, 200);
  ctx.fillStyle = "#172632";
  ctx.font = "900 54px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("你出来了！", W / 2, 210);
  ctx.font = "900 28px system-ui";
  ctx.fillText("五个房间的线索全部找到了。", W / 2, 260);
  ctx.fillStyle = "#29a99d";
  ctx.beginPath();
  ctx.arc(W / 2, 355, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "left";
}

function updateAutoWalk() {
  if (!hero.movingForward) return;
  const dx = hero.targetX - hero.x;
  const dy = hero.targetY - hero.y;
  const d = Math.hypot(dx, dy);
  if (d < 8) {
    if (roomIndex === rooms.length - 1) {
      exited = true;
      hero.movingForward = false;
      say("成功出来了！最后一个房间就是出口。");
      return;
    }
    roomIndex += 1;
    hero.x = 480;
    hero.y = 465;
    hero.targetX = hero.x;
    hero.targetY = hero.y;
    hero.movingForward = false;
    say(`进入第 ${roomIndex + 1}/5 个房间：先找到线索，门才会开。`);
    return;
  }
  hero.x += (dx / d) * 7;
  hero.y += (dy / d) * 7;
}

function draw(time = 0) {
  pulse = time / 1000;
  updateAutoWalk();
  if (exited) {
    drawExit();
  } else {
    drawBackground();
    drawRoom();
    drawObjects(pulse);
    drawHero(pulse);
    drawProgress();
  }
  requestAnimationFrame(draw);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowup" || key === "w") move(0, -24);
  if (key === "arrowdown" || key === "s") move(0, 24);
  if (key === "arrowleft" || key === "a") move(-24, 0);
  if (key === "arrowright" || key === "d") move(24, 0);
  if (key === " " || key === "enter") searchClue();
});

document.addEventListener("click", (event) => {
  const moveButton = event.target.closest("[data-move]");
  if (moveButton) {
    const dir = moveButton.dataset.move;
    if (dir === "up") move(0, -28);
    if (dir === "down") move(0, 28);
    if (dir === "left") move(-28, 0);
    if (dir === "right") move(28, 0);
  }
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) action(actionButton.dataset.action);
});

say("第一房间：从上往下看，走到发光问号旁边，点“搜索线索”。");
requestAnimationFrame(draw);
