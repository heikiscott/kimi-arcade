const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const statusText = document.querySelector("#statusText");
const restartBtn = document.querySelector("#restartBtn");
const introOverlay = document.querySelector("#introOverlay");
const startIntroBtn = document.querySelector("#startIntroBtn");
const introStatus = document.querySelector("#introStatus");

const keys = new Set();
const touchControls = new Set();
let audioContext = null;
let musicTimer = null;
let introTimer = null;
let gameStarted = false;
let won = false;
let sceneKey = "sky";
let scene = null;
let cameraX = 0;
let lastTime = performance.now();
let doorHintTimer = 0;
let elevatorHintTimer = 0;

const W = canvas.width;
const H = canvas.height;

const player = {
  x: 72,
  y: 420,
  w: 36,
  h: 54,
  vx: 0,
  vy: 0,
  grounded: false,
  facing: 1,
  coins: 0,
  keys: 0,
  lives: 3,
  invincibleUntil: 0,
  rideElevator: null
};

const sceneTemplates = {
  sky: {
    title: "天空草地",
    width: 2300,
    theme: "sky",
    spawn: { x: 72, y: 420 },
    platforms: [
      { x: 0, y: 540, w: 760, h: 80, type: "grass" },
      { x: 820, y: 540, w: 450, h: 80, type: "grass" },
      { x: 1360, y: 540, w: 940, h: 80, type: "grass" },
      { x: 220, y: 438, w: 160, h: 28, type: "brick" },
      { x: 480, y: 356, w: 160, h: 28, type: "brick" },
      { x: 760, y: 428, w: 150, h: 28, type: "cloud" },
      { x: 1038, y: 360, w: 166, h: 28, type: "cloud" },
      { x: 1320, y: 446, w: 190, h: 28, type: "brick" },
      { x: 1680, y: 402, w: 170, h: 28, type: "brick" },
      { x: 1920, y: 326, w: 150, h: 28, type: "cloud" }
    ],
    elevators: [
      { x: 1540, y: 510, w: 104, h: 22, minY: 326, maxY: 510, speed: 1.15, dir: -1, active: true }
    ],
    coins: [
      { x: 258, y: 390 }, { x: 520, y: 310 }, { x: 808, y: 382 }, { x: 1110, y: 312 },
      { x: 1420, y: 400 }, { x: 1740, y: 354 }, { x: 1988, y: 282 }
    ],
    enemies: [
      { x: 630, y: 500, vx: 0.9, minX: 560, maxX: 740, type: "mush" },
      { x: 1260, y: 500, vx: 1.0, minX: 1120, maxX: 1340, type: "mush" }
    ],
    doors: [
      { x: 940, y: 456, w: 58, h: 84, label: "进鬼屋", target: "ghost", spawn: "entry" },
      { x: 2140, y: 456, w: 58, h: 84, label: "进城堡", target: "castle", spawn: "entry" }
    ],
    keyItems: [
      { x: 1870, y: 282, got: false }
    ],
    goal: null
  },
  ghost: {
    title: "鬼屋里面",
    width: 1880,
    theme: "ghost",
    spawn: { x: 84, y: 438 },
    platforms: [
      { x: 0, y: 540, w: 1880, h: 80, type: "stone" },
      { x: 220, y: 426, w: 170, h: 26, type: "wood" },
      { x: 500, y: 344, w: 170, h: 26, type: "wood" },
      { x: 770, y: 438, w: 170, h: 26, type: "wood" },
      { x: 1060, y: 340, w: 180, h: 26, type: "wood" },
      { x: 1380, y: 430, w: 176, h: 26, type: "wood" }
    ],
    elevators: [
      { x: 820, y: 504, w: 104, h: 22, minY: 278, maxY: 504, speed: 1.25, dir: -1, active: true }
    ],
    coins: [
      { x: 274, y: 382 }, { x: 552, y: 296 }, { x: 834, y: 392 }, { x: 1128, y: 292 }, { x: 1460, y: 384 }
    ],
    enemies: [
      { x: 430, y: 482, vx: 0.7, minX: 320, maxX: 560, type: "ghost" },
      { x: 1010, y: 482, vx: 0.8, minX: 900, maxX: 1240, type: "ghost" },
      { x: 1620, y: 482, vx: 0.9, minX: 1480, maxX: 1760, type: "ghost" }
    ],
    doors: [
      { x: 62, y: 456, w: 58, h: 84, label: "出鬼屋", target: "sky", spawn: "afterGhost" },
      { x: 1710, y: 456, w: 58, h: 84, label: "去城堡", target: "castle", spawn: "entry" }
    ],
    keyItems: [
      { x: 1200, y: 294, got: false }
    ],
    goal: null
  },
  castle: {
    title: "城堡电梯",
    width: 2100,
    theme: "castle",
    spawn: { x: 82, y: 438 },
    platforms: [
      { x: 0, y: 540, w: 2100, h: 80, type: "castle" },
      { x: 240, y: 428, w: 180, h: 26, type: "castle" },
      { x: 560, y: 336, w: 176, h: 26, type: "castle" },
      { x: 890, y: 430, w: 178, h: 26, type: "castle" },
      { x: 1220, y: 336, w: 176, h: 26, type: "castle" },
      { x: 1540, y: 428, w: 184, h: 26, type: "castle" }
    ],
    elevators: [
      { x: 760, y: 506, w: 116, h: 22, minY: 296, maxY: 506, speed: 1.35, dir: -1, active: true },
      { x: 1320, y: 506, w: 116, h: 22, minY: 250, maxY: 506, speed: 1.05, dir: -1, active: true }
    ],
    coins: [
      { x: 300, y: 382 }, { x: 620, y: 288 }, { x: 940, y: 382 }, { x: 1280, y: 288 }, { x: 1600, y: 382 }
    ],
    enemies: [
      { x: 480, y: 500, vx: 0.9, minX: 360, maxX: 650, type: "shell" },
      { x: 1120, y: 500, vx: 1.1, minX: 1000, maxX: 1300, type: "shell" },
      { x: 1760, y: 500, vx: 1.0, minX: 1580, maxX: 1940, type: "shell" }
    ],
    doors: [
      { x: 64, y: 456, w: 58, h: 84, label: "出城堡", target: "sky", spawn: "afterCastle" }
    ],
    keyItems: [],
    goal: { x: 1950, y: 404, w: 44, h: 136 }
  }
};

const spawns = {
  sky: {
    entry: { x: 72, y: 420 },
    afterGhost: { x: 1038, y: 420 },
    afterCastle: { x: 218, y: 420 }
  },
  ghost: {
    entry: { x: 84, y: 438 }
  },
  castle: {
    entry: { x: 82, y: 438 }
  }
};

function cloneScene(key) {
  const template = sceneTemplates[key];
  return {
    ...template,
    platforms: template.platforms.map((item) => ({ ...item })),
    elevators: template.elevators.map((item) => ({ ...item })),
    coins: template.coins.map((item) => ({ ...item, got: false })),
    enemies: template.enemies.map((item) => ({ ...item })),
    doors: template.doors.map((item) => ({ ...item })),
    keyItems: template.keyItems.map((item) => ({ ...item })),
    goal: template.goal ? { ...template.goal } : null
  };
}

const progress = {
  sky: cloneScene("sky"),
  ghost: cloneScene("ghost"),
  castle: cloneScene("castle")
};

function loadScene(key, spawnName = "entry") {
  sceneKey = key;
  scene = progress[key];
  const spawn = spawns[key]?.[spawnName] || scene.spawn;
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.rideElevator = null;
  cameraX = Math.max(0, Math.min(scene.width - W, player.x - 220));
  statusText.textContent = `${scene.title}：${getSceneHelp()}`;
  playDoorSound();
  updateScore();
}

function getSceneHelp() {
  if (sceneKey === "sky") return "往右走，门可以进鬼屋，也可以继续去城堡。";
  if (sceneKey === "ghost") return "里面比较暗，躲开幽灵，坐电梯拿钥匙，再从门出去。";
  return "城堡里有两个升降电梯，拿够钥匙后到最右边旗台通关。";
}

function reset() {
  window.clearTimeout(introTimer);
  stopMusic();
  keys.clear();
  touchControls.clear();
  Object.keys(progress).forEach((key) => {
    progress[key] = cloneScene(key);
  });
  sceneKey = "sky";
  scene = progress.sky;
  player.x = 72;
  player.y = 420;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.facing = 1;
  player.coins = 0;
  player.keys = 0;
  player.lives = 3;
  player.invincibleUntil = 0;
  player.rideElevator = null;
  cameraX = 0;
  gameStarted = false;
  won = false;
  introOverlay.classList.remove("hidden");
  startIntroBtn.disabled = false;
  startIntroBtn.textContent = "开始冒险";
  introStatus.textContent = "新版：天空、鬼屋、城堡、电梯、进门出门";
  statusText.textContent = "先点开始冒险。键盘：A/D 移动，空格跳，E 或 ↓ 进门，R 重来。";
  updateScore();
}

function updateScore() {
  const totalCoins = Object.values(progress).reduce((sum, item) => sum + item.coins.length, 0);
  const gotCoins = Object.values(progress).reduce((sum, item) => sum + item.coins.filter((coin) => coin.got).length, 0);
  scoreEl.textContent = `金币 ${gotCoins} / ${totalCoins} · 钥匙 ${player.keys} · 生命 ${player.lives}${won ? " · 通关!" : ""}`;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerRect() {
  return { x: player.x, y: player.y, w: player.w, h: player.h };
}

function isPressed(name) {
  if (touchControls.has(name)) return true;
  if (name === "left") return keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
  if (name === "right") return keys.has("ArrowRight") || keys.has("d") || keys.has("D");
  if (name === "jump") return keys.has(" ") || keys.has("ArrowUp") || keys.has("w") || keys.has("W");
  if (name === "door") return keys.has("ArrowDown") || keys.has("e") || keys.has("E");
  if (name === "elevator") return keys.has("s") || keys.has("S");
  return false;
}

function tick(now = performance.now()) {
  const dt = Math.min(32, now - lastTime) / 16.67;
  lastTime = now;
  if (gameStarted && !won) update(dt);
  draw();
  requestAnimationFrame(tick);
}

function update(dt) {
  updateElevators(dt);
  updatePlayer(dt);
  updateEnemies(dt);
  collectItems();
  checkDoors();
  checkGoal();
  cameraX += (Math.max(0, Math.min(scene.width - W, player.x - W * 0.42)) - cameraX) * 0.12;
}

function updateElevators(dt) {
  scene.elevators.forEach((elevator) => {
    if (!elevator.active) return;
    const oldY = elevator.y;
    elevator.y += elevator.speed * elevator.dir * dt;
    if (elevator.y < elevator.minY) {
      elevator.y = elevator.minY;
      elevator.dir = 1;
    }
    if (elevator.y > elevator.maxY) {
      elevator.y = elevator.maxY;
      elevator.dir = -1;
    }
    elevator.deltaY = elevator.y - oldY;
  });
}

function updatePlayer(dt) {
  const left = isPressed("left");
  const right = isPressed("right");
  const jump = isPressed("jump");
  const maxSpeed = player.grounded ? 5.1 : 4.6;
  if (left) {
    player.vx -= 0.72 * dt;
    player.facing = -1;
  }
  if (right) {
    player.vx += 0.72 * dt;
    player.facing = 1;
  }
  if (!left && !right) player.vx *= player.grounded ? 0.72 : 0.94;
  player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));

  if (jump && player.grounded) {
    player.vy = -13.5;
    player.grounded = false;
    player.rideElevator = null;
    playJump();
  }

  if (isPressed("elevator") && player.rideElevator) {
    player.rideElevator.dir *= -1;
    elevatorHintTimer = performance.now() + 900;
    statusText.textContent = "电梯换方向了：可以上去，也可以下来。";
    touchControls.delete("elevator");
    keys.delete("s");
    keys.delete("S");
  }

  player.vy += 0.72 * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.grounded = false;
  player.rideElevator = null;

  resolvePlatforms();
  player.x = Math.max(0, Math.min(scene.width - player.w, player.x));
  if (player.y > H + 120) hurtPlayer("掉下去了，回到这个场景入口。");
}

function resolvePlatforms() {
  const prevBottom = player.y + player.h - player.vy;
  [...scene.platforms, ...scene.elevators].forEach((platform) => {
    const r = { x: platform.x, y: platform.y, w: platform.w, h: platform.h };
    if (rectsOverlap(playerRect(), r) && player.vy >= 0 && prevBottom <= platform.y + 10) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.grounded = true;
      if (scene.elevators.includes(platform)) {
        player.rideElevator = platform;
        player.y += platform.deltaY || 0;
        if (performance.now() > elevatorHintTimer) {
          statusText.textContent = "你坐上电梯了，按 S 或点“电梯”可以让它换方向。";
          elevatorHintTimer = performance.now() + 2800;
        }
      }
    }
  });
}

function updateEnemies(dt) {
  scene.enemies.forEach((enemy) => {
    enemy.x += enemy.vx * dt;
    if (enemy.x < enemy.minX || enemy.x > enemy.maxX) enemy.vx *= -1;
    const enemyBox = { x: enemy.x - 18, y: enemy.y - 34, w: 36, h: 34 };
    if (!rectsOverlap(playerRect(), enemyBox)) return;
    if (player.vy > 1.8 && player.y + player.h - player.vy <= enemyBox.y + 10) {
      enemy.x = -9999;
      player.vy = -8;
      player.coins += 1;
      playCoin();
      updateScore();
    } else {
      hurtPlayer("碰到怪物了，重新站好继续玩。");
    }
  });
}

function collectItems() {
  scene.coins.forEach((coin) => {
    if (coin.got) return;
    if (rectsOverlap(playerRect(), { x: coin.x - 14, y: coin.y - 18, w: 28, h: 36 })) {
      coin.got = true;
      player.coins += 1;
      playCoin();
      updateScore();
    }
  });
  scene.keyItems.forEach((key) => {
    if (key.got) return;
    if (rectsOverlap(playerRect(), { x: key.x - 16, y: key.y - 18, w: 32, h: 36 })) {
      key.got = true;
      player.keys += 1;
      statusText.textContent = "拿到一把钥匙！城堡终点会更容易打开。";
      playKeySound();
      updateScore();
    }
  });
}

function nearestDoor() {
  return scene.doors.find((door) => {
    const nearBox = { x: door.x - 24, y: door.y - 24, w: door.w + 48, h: door.h + 48 };
    return rectsOverlap(playerRect(), nearBox);
  });
}

function checkDoors() {
  const door = nearestDoor();
  if (door && performance.now() > doorHintTimer) {
    statusText.textContent = `站在门口：按 E / ↓ / 点“进/出”可以${door.label}。`;
    doorHintTimer = performance.now() + 1600;
  }
  if (!door || !isPressed("door")) return;
  touchControls.delete("door");
  keys.delete("e");
  keys.delete("E");
  keys.delete("ArrowDown");
  loadScene(door.target, door.spawn || "entry");
}

function checkGoal() {
  if (!scene.goal || !rectsOverlap(playerRect(), scene.goal)) return;
  if (player.keys < 1) {
    statusText.textContent = "城堡终点门需要至少 1 把钥匙，先去鬼屋或天空拿钥匙。";
    return;
  }
  won = true;
  stopMusic();
  updateScore();
  statusText.textContent = "通关成功！你从天空进鬼屋，又进城堡坐电梯，最后赢了。";
  playVictory();
}

function hurtPlayer(message) {
  if (performance.now() < player.invincibleUntil) return;
  player.lives -= 1;
  player.invincibleUntil = performance.now() + 1100;
  if (player.lives <= 0) {
    player.lives = 3;
    player.coins = Math.max(0, player.coins - 3);
    loadScene(sceneKey, "entry");
    statusText.textContent = "生命用完了，回到这个场景入口重新来。";
  } else {
    const spawn = scene.spawn;
    player.x = Math.max(40, player.x - 80);
    player.y = spawn.y;
    player.vx = 0;
    player.vy = 0;
    statusText.textContent = message;
  }
  updateScore();
  playHurt();
}

function draw() {
  drawBackground();
  ctx.save();
  ctx.translate(-cameraX, 0);
  drawSceneObjects();
  drawPlayer();
  ctx.restore();
  drawOverlay();
}

function drawBackground() {
  if (scene.theme === "sky") drawSkyBackground();
  if (scene.theme === "ghost") drawGhostBackground();
  if (scene.theme === "castle") drawCastleBackground();
}

function drawSkyBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#7ecbf2");
  g.addColorStop(0.55, "#e4f8ff");
  g.addColorStop(1, "#88c96a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  drawCloud(140, 88, 1);
  drawCloud(520, 130, 0.86);
  drawCloud(870, 78, 1.08);
  ctx.fillStyle = "rgba(255,210,95,0.82)";
  ctx.beginPath();
  ctx.arc(910, 116, 42, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 6; i += 1) drawHill(i * 220 - (cameraX * 0.25) % 220, 520, 120 + (i % 2) * 34);
}

function drawGhostBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#17182a");
  g.addColorStop(0.62, "#32314d");
  g.addColorStop(1, "#13141f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.beginPath();
  ctx.arc(846, 92, 54, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.18 + (i % 3) * 0.08})`;
    ctx.beginPath();
    ctx.arc(80 + i * 116, 58 + (i * 41) % 170, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  drawGhostWindow(160 - cameraX * 0.1, 120);
  drawGhostWindow(620 - cameraX * 0.1, 160);
}

function drawCastleBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#5d728e");
  g.addColorStop(0.6, "#c5d0d9");
  g.addColorStop(1, "#8b6b52");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(86,72,68,0.34)";
  for (let i = 0; i < 7; i += 1) {
    const x = i * 180 - (cameraX * 0.18) % 180;
    ctx.fillRect(x, 226, 120, 256);
    ctx.fillStyle = "rgba(42,45,54,0.42)";
    ctx.fillRect(x + 22, 270, 24, 54);
    ctx.fillRect(x + 72, 270, 24, 54);
    ctx.fillStyle = "rgba(86,72,68,0.34)";
  }
}

function drawSceneObjects() {
  scene.platforms.forEach(drawPlatform);
  scene.elevators.forEach(drawElevator);
  scene.doors.forEach(drawDoor);
  scene.coins.forEach(drawCoin);
  scene.keyItems.forEach(drawKey);
  scene.enemies.forEach(drawEnemy);
  if (scene.goal) drawGoal(scene.goal);
}

function drawPlatform(platform) {
  const colors = {
    grass: ["#6eb85d", "#7b4f2e"],
    brick: ["#d08a42", "#8d5228"],
    cloud: ["#f8fdff", "#c8eaf8"],
    stone: ["#5c6172", "#2c3041"],
    wood: ["#9a6429", "#59351c"],
    castle: ["#888f9c", "#49515e"]
  };
  const [top, side] = colors[platform.type] || colors.grass;
  ctx.fillStyle = side;
  ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
  ctx.fillStyle = top;
  ctx.fillRect(platform.x, platform.y, platform.w, Math.min(10, platform.h));
  ctx.strokeStyle = "rgba(23,38,50,0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(platform.x, platform.y, platform.w, platform.h);
  if (platform.type === "brick" || platform.type === "castle") {
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    for (let x = platform.x + 18; x < platform.x + platform.w; x += 38) {
      ctx.beginPath();
      ctx.moveTo(x, platform.y + 8);
      ctx.lineTo(x, platform.y + platform.h - 2);
      ctx.stroke();
    }
  }
}

function drawElevator(elevator) {
  ctx.fillStyle = "#172632";
  ctx.fillRect(elevator.x - 8, elevator.minY - 8, 6, elevator.maxY - elevator.minY + 54);
  ctx.fillRect(elevator.x + elevator.w + 2, elevator.minY - 8, 6, elevator.maxY - elevator.minY + 54);
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  roundedRect(elevator.x, elevator.y, elevator.w, elevator.h, 6);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("电梯", elevator.x + elevator.w / 2, elevator.y - 8);
  ctx.textAlign = "left";
}

function drawDoor(door) {
  const open = nearestDoor() === door;
  ctx.fillStyle = open ? "#ffd15f" : "#6e3c2a";
  ctx.beginPath();
  roundedRect(door.x, door.y, door.w, door.h, 10);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(door.x + door.w - 13, door.y + door.h / 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "900 15px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(door.label, door.x + door.w / 2, door.y - 10);
  ctx.textAlign = "left";
}

function drawCoin(coin) {
  if (coin.got) return;
  ctx.save();
  ctx.translate(coin.x, coin.y);
  ctx.scale(0.85 + Math.sin(performance.now() * 0.006 + coin.x) * 0.12, 1);
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#a66a18";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(-3, -10, 5, 20);
  ctx.restore();
}

function drawKey(key) {
  if (key.got) return;
  ctx.save();
  ctx.translate(key.x, key.y + Math.sin(performance.now() * 0.006) * 4);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillRect(10, -4, 34, 8);
  ctx.fillRect(32, 4, 8, 12);
  ctx.restore();
}

function drawEnemy(enemy) {
  if (enemy.x < -9000) return;
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  if (enemy.type === "ghost") {
    ctx.fillStyle = "#f3f4ff";
    ctx.beginPath();
    ctx.arc(0, -18, 22, Math.PI, 0);
    ctx.lineTo(22, 12);
    ctx.quadraticCurveTo(12, 4, 4, 12);
    ctx.quadraticCurveTo(-4, 4, -12, 12);
    ctx.quadraticCurveTo(-20, 4, -22, 12);
    ctx.lineTo(-22, -18);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#172632";
    ctx.fillRect(-9, -16, 5, 7);
    ctx.fillRect(6, -16, 5, 7);
  } else if (enemy.type === "shell") {
    ctx.fillStyle = "#48a868";
    ctx.beginPath();
    ctx.ellipse(0, -14, 25, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#ffd15f";
    ctx.fillRect(-18, -16, 36, 5);
    ctx.fillStyle = "#172632";
    ctx.fillRect(-16, 2, 8, 6);
    ctx.fillRect(8, 2, 8, 6);
  } else {
    ctx.fillStyle = "#b86a3b";
    ctx.beginPath();
    ctx.ellipse(0, -12, 24, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#172632";
    ctx.fillRect(-14, 2, 9, 6);
    ctx.fillRect(5, 2, 9, 6);
  }
  ctx.restore();
}

function drawGoal(goal) {
  ctx.fillStyle = "#172632";
  ctx.fillRect(goal.x + 18, goal.y, 8, goal.h);
  ctx.fillStyle = "#d83d35";
  ctx.beginPath();
  ctx.moveTo(goal.x + 26, goal.y + 16);
  ctx.lineTo(goal.x + 104, goal.y + 42);
  ctx.lineTo(goal.x + 26, goal.y + 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffd15f";
  ctx.font = "900 18px system-ui";
  ctx.fillText("终点", goal.x - 2, goal.y - 8);
}

function drawPlayer() {
  const t = performance.now();
  const blink = t < player.invincibleUntil && Math.floor(t / 80) % 2 === 0;
  if (blink) return;
  const x = player.x;
  const y = player.y;
  const run = Math.sin(t * 0.018) * (Math.abs(player.vx) > 0.3 && player.grounded ? 1 : 0);
  ctx.save();
  ctx.translate(x + player.w / 2, y + player.h);
  ctx.scale(player.facing, 1);
  ctx.fillStyle = "#49301f";
  ctx.fillRect(-15, -8 + run * 2, 12, 8);
  ctx.fillRect(5, -8 - run * 2, 12, 8);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#172632";
  ctx.beginPath();
  ctx.moveTo(-8, -24);
  ctx.lineTo(-22, -12 + run * 2);
  ctx.moveTo(8, -24);
  ctx.lineTo(22, -12 - run * 2);
  ctx.stroke();
  ctx.fillStyle = "#245bb8";
  ctx.beginPath();
  roundedRect(-14, -32, 28, 28, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f0bf8a";
  ctx.beginPath();
  roundedRect(-15, -54, 30, 24, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#d83d35";
  ctx.beginPath();
  roundedRect(-20, -62, 40, 12, 6);
  ctx.fill();
  ctx.fillRect(-10, -69, 20, 12);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 10px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("M", 0, -57);
  ctx.fillStyle = "#172632";
  ctx.fillRect(-8, -45, 4, 4);
  ctx.fillRect(6, -45, 4, 4);
  ctx.fillRect(-2, -37, 14, 4);
  ctx.restore();
}

function drawOverlay() {
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  roundedRect(22, 20, 310, 72, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(23,38,50,0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 25px system-ui";
  ctx.fillText(scene.title, 42, 53);
  ctx.font = "800 14px system-ui";
  ctx.fillText(getSceneHelp(), 42, 78);

  if (won) {
    ctx.fillStyle = "rgba(255, 250, 240, 0.94)";
    ctx.beginPath();
    roundedRect(320, 176, 420, 146, 12);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#172632";
    ctx.font = "900 46px system-ui";
    ctx.fillText("通关成功!", 404, 240);
    ctx.font = "800 18px system-ui";
    ctx.fillText("天空 -> 鬼屋 -> 城堡 -> 电梯，全都完成了。", 356, 280);
  }
}

function drawCloud(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.beginPath();
  ctx.ellipse(-28, 8, 34, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(4, -2, 40, 26, 0, 0, Math.PI * 2);
  ctx.ellipse(42, 10, 34, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHill(x, y, w) {
  ctx.fillStyle = "rgba(56,143,70,0.32)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y, w / 2, 72, 0, Math.PI, 0);
  ctx.fill();
}

function drawGhostWindow(x, y) {
  ctx.fillStyle = "rgba(255,209,95,0.22)";
  ctx.beginPath();
  roundedRect(x, y, 110, 76, 10);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 55, y + 6);
  ctx.lineTo(x + 55, y + 70);
  ctx.moveTo(x + 8, y + 38);
  ctx.lineTo(x + 102, y + 38);
  ctx.stroke();
}

function roundedRect(x, y, w, h, r) {
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

function getAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(freq, start, duration, gainValue = 0.055, type = "square") {
  const audio = getAudio();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.03);
}

function playCoin() {
  playTone(880, 0, 0.08, 0.045);
  playTone(1320, 0.08, 0.1, 0.045);
}

function playJump() {
  playTone(420, 0, 0.08, 0.035, "triangle");
  playTone(720, 0.08, 0.1, 0.035, "triangle");
}

function playDoorSound() {
  playTone(260, 0, 0.12, 0.04, "sawtooth");
  playTone(520, 0.12, 0.12, 0.04, "triangle");
}

function playKeySound() {
  [740, 980, 1240].forEach((note, i) => playTone(note, i * 0.08, 0.1, 0.042, "triangle"));
}

function playHurt() {
  playTone(180, 0, 0.16, 0.045, "sawtooth");
  playTone(120, 0.16, 0.2, 0.04, "sawtooth");
}

function playVictory() {
  const notes = [523, 659, 784, 1046, 784, 1046, 1318, 1568, 1318, 1046, 1568];
  notes.forEach((note, i) => playTone(note, i * 0.13, 0.12, 0.055, "triangle"));
}

function playOpeningMusic() {
  const notes = [392, 523, 659, 784, 659, 523, 440, 587, 698, 880, 698, 587, 523, 659, 784, 1046];
  notes.forEach((note, index) => playTone(note, index * 0.14, 0.11, 0.04, "triangle"));
}

function playMusicBar() {
  if (won || !gameStarted) return;
  const sceneMelodies = {
    sky: [330, 392, 523, 392, 440, 587, 523, 392],
    ghost: [220, 277, 330, 311, 277, 247, 220, 185],
    castle: [262, 330, 392, 523, 392, 330, 294, 349]
  };
  const melody = sceneMelodies[sceneKey] || sceneMelodies.sky;
  melody.forEach((note, i) => playTone(note, i * 0.15, 0.1, 0.018, sceneKey === "ghost" ? "sine" : "square"));
}

function startMusic() {
  if (musicTimer || won) return;
  playMusicBar();
  musicTimer = window.setInterval(playMusicBar, 1320);
}

function stopMusic() {
  if (musicTimer) window.clearInterval(musicTimer);
  musicTimer = null;
}

function beginGame() {
  gameStarted = true;
  introOverlay.classList.add("hidden");
  statusText.textContent = "开始！往右走，看到门就按 E 或点“进/出”。";
  startMusic();
}

function startIntro() {
  if (gameStarted) return;
  getAudio();
  startIntroBtn.disabled = true;
  startIntroBtn.textContent = "准备中";
  introStatus.textContent = "片头音乐响一下，马上开始";
  playOpeningMusic();
  introTimer = window.setTimeout(beginGame, 1800);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key);
  if (event.key === "r" || event.key === "R") reset();
  if (!gameStarted && (event.key === "Enter" || event.key === " ")) {
    startIntro();
    event.preventDefault();
    return;
  }
  if (gameStarted) startMusic();
  if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();
});

window.addEventListener("keyup", (event) => keys.delete(event.key));

document.querySelectorAll("[data-control]").forEach((button) => {
  const control = button.dataset.control;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (!gameStarted) startIntro();
    touchControls.add(control);
    startMusic();
  });
  const release = () => touchControls.delete(control);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
});

canvas.addEventListener("pointerdown", () => {
  if (!gameStarted) startIntro();
  startMusic();
});

startIntroBtn.addEventListener("click", startIntro);
restartBtn.addEventListener("click", reset);

reset();
tick();
