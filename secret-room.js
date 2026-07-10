const canvas = document.querySelector("#roomCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.querySelector("#statusText");

const W = canvas.width;
const H = canvas.height;
const hero = {
  x: 470,
  y: 380,
  mood: "站着",
  invisible: false,
  dance: 0,
  hasKey: false
};

const state = {
  lightsOn: true,
  doorOpen: false,
  chestOpen: false,
  computerOn: false,
  sleeping: false
};

function say(text) {
  statusText.textContent = text;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function move(dx, dy) {
  state.sleeping = false;
  hero.mood = "走路";
  hero.x = clamp(hero.x + dx, 105, W - 105);
  hero.y = clamp(hero.y + dy, 180, H - 98);
  say(`小人在密室里移动到 (${Math.round(hero.x)}, ${Math.round(hero.y)})。`);
}

function action(name) {
  state.sleeping = false;
  if (name === "light") {
    state.lightsOn = !state.lightsOn;
    say(state.lightsOn ? "灯打开了，密室变亮了。" : "灯关掉了，密室只剩下秘密蓝光。");
  }
  if (name === "door") {
    state.doorOpen = !state.doorOpen;
    hero.hasKey = true;
    say(state.doorOpen ? "前面的秘密门打开了，可以看到里面还有一条小通道。" : "秘密门关上了，房间又安静了。");
  }
  if (name === "chest") {
    state.chestOpen = true;
    hero.hasKey = true;
    hero.mood = "开心";
    say("宝箱打开了！里面有一把金钥匙和一张密室地图。");
  }
  if (name === "computer") {
    state.computerOn = !state.computerOn;
    say(state.computerOn ? "电脑开机了，屏幕上显示：密室控制权限已开启。" : "电脑关机了。");
  }
  if (name === "dance") {
    hero.mood = "跳舞";
    hero.dance = 80;
    say("小人开始在密室里跳舞，地板灯也跟着闪。");
  }
  if (name === "sit") {
    hero.mood = "坐下";
    say("小人坐在软垫上休息，等你下一个命令。");
  }
  if (name === "invisible") {
    hero.invisible = !hero.invisible;
    hero.mood = hero.invisible ? "隐身" : "出现";
    say(hero.invisible ? "小人进入隐身模式，只能看到淡淡影子。" : "小人又出现了。");
  }
  if (name === "sleep") {
    state.sleeping = true;
    hero.mood = "睡觉";
    say("小人在密室小床上睡觉，屏幕上冒出 Zzz。");
  }
  if (name === "reset") {
    hero.x = 470;
    hero.y = 380;
    hero.mood = "站着";
    hero.invisible = false;
    hero.dance = 0;
    hero.hasKey = false;
    state.lightsOn = true;
    state.doorOpen = false;
    state.chestOpen = false;
    state.computerOn = false;
    state.sleeping = false;
    say("密室重新开始。");
  }
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

function drawRoom(time) {
  const wall = ctx.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, state.lightsOn ? "#314454" : "#0c1620");
  wall.addColorStop(0.55, state.lightsOn ? "#596b72" : "#152839");
  wall.addColorStop(1, state.lightsOn ? "#2b2b2b" : "#081018");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = state.lightsOn ? "#776756" : "#1a2027";
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.lineTo(W, 470);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = state.lightsOn ? "rgba(255,255,255,0.18)" : "rgba(41,169,157,0.18)";
  ctx.lineWidth = 2;
  for (let x = -80; x < W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + 180, 470);
    ctx.stroke();
  }
  for (let y = 500; y < H; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  drawSecretDoor();
  drawChest();
  drawComputer();
  drawBed();
  drawFloorLights(time);
}

function drawSecretDoor() {
  ctx.fillStyle = state.doorOpen ? "#0f2432" : "#2b3a3e";
  ctx.beginPath();
  roundedRect(82, 170, 160, 250, 8);
  ctx.fill();
  ctx.strokeStyle = "#ffd15f";
  ctx.lineWidth = 6;
  ctx.stroke();
  if (state.doorOpen) {
    ctx.fillStyle = "rgba(41,169,157,0.45)";
    ctx.fillRect(112, 205, 105, 190);
    ctx.fillStyle = "#fff";
    ctx.font = "900 20px system-ui";
    ctx.fillText("通道", 142, 310);
  } else {
    ctx.fillStyle = "#ffd15f";
    ctx.beginPath();
    ctx.arc(210, 292, 9, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawChest() {
  ctx.fillStyle = "#8a5a2b";
  ctx.beginPath();
  roundedRect(700, 388, 150, 78, 10);
  ctx.fill();
  ctx.fillStyle = state.chestOpen ? "#ffd15f" : "#5b351d";
  ctx.fillRect(700, state.chestOpen ? 355 : 374, 150, 28);
  ctx.fillStyle = "#172632";
  ctx.fillRect(765, 406, 20, 20);
  if (state.chestOpen) {
    ctx.fillStyle = "#fff5a6";
    ctx.beginPath();
    ctx.arc(745, 370, 12, 0, Math.PI * 2);
    ctx.arc(807, 367, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawComputer() {
  ctx.fillStyle = "#22313a";
  ctx.fillRect(620, 220, 155, 88);
  ctx.fillStyle = state.computerOn ? "#42e6c7" : "#0d141c";
  ctx.fillRect(632, 232, 131, 61);
  ctx.fillStyle = "#172632";
  ctx.fillRect(684, 308, 28, 42);
  ctx.fillRect(650, 344, 95, 12);
  if (state.computerOn) {
    ctx.fillStyle = "#172632";
    ctx.font = "900 16px system-ui";
    ctx.fillText("SECRET OK", 650, 268);
  }
}

function drawBed() {
  ctx.fillStyle = "#37546f";
  ctx.beginPath();
  roundedRect(270, 410, 180, 75, 14);
  ctx.fill();
  ctx.fillStyle = "#f3ead7";
  ctx.fillRect(290, 392, 62, 38);
}

function drawFloorLights(time) {
  for (let i = 0; i < 6; i += 1) {
    const on = hero.mood === "跳舞" ? Math.sin(time * 8 + i) > 0 : i % 2 === 0;
    ctx.fillStyle = on ? "rgba(255,209,95,0.75)" : "rgba(41,169,157,0.28)";
    ctx.beginPath();
    ctx.arc(250 + i * 78, 548, 13, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHero(time) {
  const bob = hero.mood === "跳舞" ? Math.sin(time * 10) * 12 : hero.mood === "走路" ? Math.sin(time * 8) * 5 : 0;
  const alpha = hero.invisible ? 0.28 : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(hero.x, state.sleeping ? 425 : hero.y + bob);
  if (state.sleeping || hero.mood === "坐下") ctx.scale(1.05, 0.76);

  ctx.fillStyle = "#f2c49c";
  ctx.beginPath();
  ctx.arc(0, -64, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#29a99d";
  ctx.beginPath();
  roundedRect(-26, -40, 52, 72, 14);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.strokeStyle = "#f2c49c";
  ctx.lineWidth = 9;
  ctx.beginPath();
  const armLift = hero.mood === "跳舞" ? 35 : 0;
  ctx.moveTo(-24, -20);
  ctx.lineTo(-55, 4 - armLift);
  ctx.moveTo(24, -20);
  ctx.lineTo(55, 4 + armLift);
  ctx.stroke();

  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-8, -69, 2, 0, Math.PI * 2);
  ctx.arc(8, -69, 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -56, hero.mood === "开心" || hero.mood === "跳舞" ? 10 : 7, 0, Math.PI);
  ctx.stroke();

  if (hero.hasKey) {
    ctx.fillStyle = "#ffd15f";
    ctx.fillRect(34, -82, 26, 8);
    ctx.beginPath();
    ctx.arc(32, -78, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  if (state.sleeping) {
    ctx.fillStyle = "#fff";
    ctx.font = "900 24px system-ui";
    ctx.fillText("Zzz", 42, -95);
  }
  ctx.restore();
}

function draw(time = 0) {
  drawRoom(time / 1000);
  drawHero(time / 1000);
  if (!state.lightsOn) {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(0, 0, W, H);
  }
  if (hero.dance > 0) hero.dance -= 1;
  requestAnimationFrame(draw);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowup" || key === "w") move(0, -24);
  if (key === "arrowdown" || key === "s") move(0, 24);
  if (key === "arrowleft" || key === "a") move(-24, 0);
  if (key === "arrowright" || key === "d") move(24, 0);
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

requestAnimationFrame(draw);
