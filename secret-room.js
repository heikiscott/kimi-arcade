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
  movingForward: false,
  scarfSwing: 0
};

const rooms = [
  {
    name: "第一间：入学大厅",
    story: "你收到一封会发光的匿名信，信上说：想进入魔法学院，先把大厅乱飞的信件摆整齐。",
    hint: "真正的线索是一封边角有闪电纹的入学信。",
    clue: "闪电纹入学信",
    clueType: "letter",
    clueX: 318,
    clueY: 285,
    color: "#ffd15f",
    sorted: false,
    found: false
  },
  {
    name: "第二间：旧图书馆",
    story: "书架自己打开了，书全掉到地上。画像悄悄说：只有会自己翻页的书才知道下一道门。",
    hint: "线索藏在黑色魔法书里，它整理后会放在第二排。",
    clue: "会翻页的黑色魔法书",
    clueType: "book",
    clueX: 650,
    clueY: 235,
    color: "#8f5fd9",
    sorted: false,
    found: false
  },
  {
    name: "第三间：魔药教室",
    story: "锅子还在冒泡，药瓶乱成一片。墙上的字写着：月光颜色的药瓶不会说谎。",
    hint: "整理药瓶以后，找紫蓝色、瓶口发亮的那一瓶。",
    clue: "月光魔药瓶",
    clueType: "potion",
    clueX: 352,
    clueY: 205,
    color: "#32c7d9",
    sorted: false,
    found: false
  },
  {
    name: "第四间：猫头鹰塔",
    story: "猫头鹰塔里全是羽毛和包裹。一只白猫头鹰盯着地板，好像在提醒你别只看大东西。",
    hint: "真正的线索是一根银色羽毛，整理以后会落在塔窗下面。",
    clue: "银色猫头鹰羽毛",
    clueType: "feather",
    clueX: 615,
    clueY: 370,
    color: "#f4f7fa",
    sorted: false,
    found: false
  },
  {
    name: "第五间：校长密室",
    story: "最后的密室很安静，桌上有魔杖、星盘和一面小镜子。出口咒语藏在一个会反光的东西里。",
    hint: "整理桌面以后，调查银边小镜子。找到它，最后的门会直接打开。",
    clue: "银边小镜子",
    clueType: "mirror",
    clueX: 474,
    clueY: 258,
    color: "#b9e7ff",
    sorted: false,
    found: false
  }
];

let roomIndex = 0;
let exited = false;
let pulse = 0;
let audioContext = null;
let ambienceOn = false;
let ambienceTimer = null;

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

function getAudio() {
  if (!window.AudioContext && !window.webkitAudioContext) return null;
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(freq, start, duration, gainValue = 0.025, type = "sine") {
  const audio = getAudio();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.05);
}

function castleChime() {
  playTone(196, 0, 0.7, 0.028, "triangle");
  playTone(247, 0.28, 0.7, 0.022, "triangle");
  playTone(147, 0.62, 1.1, 0.018, "sine");
}

function magicClick() {
  [659, 784, 988].forEach((note, index) => playTone(note, index * 0.08, 0.12, 0.022, "triangle"));
}

function doorGroan() {
  [130, 116, 98, 82].forEach((note, index) => playTone(note, index * 0.18, 0.32, 0.03, "sawtooth"));
}

function toggleCastleSound() {
  getAudio();
  ambienceOn = !ambienceOn;
  if (ambienceOn) {
    castleChime();
    ambienceTimer = window.setInterval(castleChime, 3600);
    say("古堡声音打开了：远处钟声、低低的风声和魔法回音。");
  } else {
    window.clearInterval(ambienceTimer);
    ambienceTimer = null;
    say("古堡声音关掉了。");
  }
}

function move(dx, dy) {
  getAudio();
  if (exited || hero.movingForward) return;
  hero.x = clamp(hero.x + dx, ROOM.x + 42, ROOM.x + ROOM.w - 42);
  hero.y = clamp(hero.y + dy, ROOM.y + 42, ROOM.y + ROOM.h - 42);
  hero.targetX = hero.x;
  hero.targetY = hero.y;
  const current = room();
  const near = distance(hero.x, hero.y, current.clueX, current.clueY) < 72;
  if (!current.sorted) say(`${current.name}。房间太乱了，先点“整理物品”。`);
  else if (near && !current.found) say("你靠近了一个可疑的魔法物品，点“调查附近”。");
  else say(`${current.name}。${current.found ? "门已经开了。" : "慢慢找，不要只看最亮的东西。"}`);
}

function tidyRoom() {
  getAudio();
  if (exited || hero.movingForward) return;
  const current = room();
  if (current.sorted) {
    say("这个房间已经整理好了。现在根据故事提示去调查真正的线索。");
    return;
  }
  current.sorted = true;
  magicClick();
  say(`你把${current.name}整理整齐了。提示：${current.hint}`);
}

function investigate() {
  getAudio();
  if (exited || hero.movingForward) return;
  const current = room();
  if (!current.sorted) {
    say("太乱了，看不清线索。先点“整理物品”，把东西摆整齐。");
    return;
  }
  if (current.found) {
    say(`你已经找到${current.clue}了。现在可以念开门咒。`);
    return;
  }
  if (distance(hero.x, hero.y, current.clueX, current.clueY) > 72) {
    say(`这里不是关键位置。故事提示：${current.hint}`);
    return;
  }
  current.found = true;
  magicClick();
  say(`找到了：${current.clue}。前面的门锁自己弹开了。`);
}

function advanceRoom() {
  getAudio();
  if (exited || hero.movingForward) return;
  if (!room().found) {
    say("门还没开。先整理房间，再找到真正的线索。");
    return;
  }
  hero.movingForward = true;
  hero.targetX = DOOR.x + DOOR.w / 2;
  hero.targetY = ROOM.y + 12;
  doorGroan();
  say(roomIndex === rooms.length - 1 ? "最后的门打开了，你正走出魔法学院密室。" : "门开了，小人往前面的房间走。");
}

function storyHint() {
  if (exited) {
    say("故事结束：你通过五间魔法密室，从学院侧门出来了。");
    return;
  }
  const current = room();
  say(`${current.story} ${current.sorted ? current.hint : "先整理，线索才会露出来。"}`);
}

function resetGame() {
  rooms.forEach((item) => {
    item.sorted = false;
    item.found = false;
  });
  roomIndex = 0;
  exited = false;
  hero.x = 480;
  hero.y = 465;
  hero.targetX = 480;
  hero.targetY = 465;
  hero.movingForward = false;
  say("故事重新开始：你站在魔法学院入口，第一间房很乱。");
}

function action(name) {
  if (name === "tidy") tidyRoom();
  if (name === "search") investigate();
  if (name === "advance") advanceRoom();
  if (name === "story") storyHint();
  if (name === "sound") toggleCastleSound();
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
  g.addColorStop(0, "#07111d");
  g.addColorStop(0.5, "#172632");
  g.addColorStop(1, "#2e2a24");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawRoomShell() {
  const current = room();
  ctx.fillStyle = "#263849";
  ctx.beginPath();
  roundedRect(ROOM.x, ROOM.y, ROOM.w, ROOM.h, 16);
  ctx.fill();
  ctx.strokeStyle = "#d9c184";
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.055)";
  for (let x = ROOM.x + 46; x < ROOM.x + ROOM.w; x += 74) ctx.fillRect(x, ROOM.y + 20, 3, ROOM.h - 40);
  for (let y = ROOM.y + 48; y < ROOM.y + ROOM.h; y += 64) ctx.fillRect(ROOM.x + 20, y, ROOM.w - 40, 3);

  drawCastleDetails();

  ctx.fillStyle = current.found ? "#2ecf8f" : "#2c3339";
  ctx.beginPath();
  roundedRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h, 10);
  ctx.fill();
  ctx.strokeStyle = current.found ? "#ffffff" : "#8b9298";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "900 18px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(current.found ? "门开" : "封印", DOOR.x + DOOR.w / 2, DOOR.y + 34);

  ctx.fillStyle = "#f4e7c0";
  ctx.font = "900 28px system-ui";
  ctx.fillText(current.name, W / 2, 42);
  ctx.textAlign = "left";
}

function drawCastleDetails() {
  const t = pulse;
  ctx.fillStyle = "#111923";
  ctx.beginPath();
  roundedRect(ROOM.x + 22, ROOM.y + 20, ROOM.w - 44, 48, 10);
  ctx.fill();
  ctx.strokeStyle = "rgba(217,193,132,0.55)";
  ctx.lineWidth = 3;
  ctx.stroke();

  drawBanner(150, 90, "#7a1722", "#d9a83f");
  drawBanner(760, 90, "#7a1722", "#d9a83f");
  drawPortrait(205, 188, "校");
  drawPortrait(742, 188, "巫");
  drawTorch(125, 286, t);
  drawTorch(835, 286, t + 1.2);

  const carpet = ctx.createLinearGradient(390, 120, 570, 525);
  carpet.addColorStop(0, "#7a1722");
  carpet.addColorStop(1, "#3b1020");
  ctx.fillStyle = carpet;
  ctx.beginPath();
  roundedRect(405, 145, 150, 332, 18);
  ctx.fill();
  ctx.strokeStyle = "#d9a83f";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "rgba(217,168,63,0.4)";
  for (let y = 180; y < 450; y += 54) ctx.fillRect(420, y, 120, 4);
}

function drawBanner(x, y, main, trim) {
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.moveTo(x - 28, y);
  ctx.lineTo(x + 28, y);
  ctx.lineTo(x + 28, y + 86);
  ctx.lineTo(x, y + 68);
  ctx.lineTo(x - 28, y + 86);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = trim;
  ctx.fillRect(x - 4, y + 8, 8, 60);
  ctx.fillRect(x - 22, y + 16, 44, 7);
}

function drawPortrait(x, y, mark) {
  ctx.fillStyle = "#6a4d31";
  ctx.beginPath();
  roundedRect(x - 35, y - 44, 70, 88, 8);
  ctx.fill();
  ctx.fillStyle = "#d9c184";
  ctx.fillRect(x - 25, y - 34, 50, 68);
  ctx.fillStyle = "#263849";
  ctx.beginPath();
  ctx.arc(x, y - 8, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 18px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(mark, x, y + 24);
  ctx.textAlign = "left";
}

function drawTorch(x, y, t) {
  ctx.fillStyle = "#6a4d31";
  ctx.fillRect(x - 7, y, 14, 54);
  ctx.fillStyle = "#d9a83f";
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = Math.sin(t * 8) > 0 ? "#ffef8a" : "#f28b2f";
  ctx.beginPath();
  ctx.moveTo(x, y - 28);
  ctx.quadraticCurveTo(x + 18, y - 5, x, y + 20);
  ctx.quadraticCurveTo(x - 18, y - 5, x, y - 28);
  ctx.fill();
}

function objectPositions() {
  const current = room();
  const messy = !current.sorted;
  const offset = messy ? 48 : 0;
  return [
    { type: "letter", x: 240 + offset, y: 290 - offset, color: "#f4e7c0" },
    { type: "book", x: 650 - offset, y: 235 + offset, color: "#151923" },
    { type: "potion", x: 355 + offset, y: 205 + offset, color: "#6dd7ff" },
    { type: "feather", x: 615 - offset, y: 370 - offset, color: "#f4f7fa" },
    { type: "mirror", x: 475 + offset, y: 258 - offset, color: "#b9e7ff" },
    { type: current.clueType, x: current.clueX, y: current.clueY, color: current.color, clue: true }
  ];
}

function drawObjects(time) {
  drawFurniture();
  for (const item of objectPositions()) {
    drawMagicObject(item, time);
  }
}

function drawMagicObject(item, time) {
  const current = room();
  const clueVisible = current.sorted || !item.clue;
  if (!clueVisible) return;
  ctx.save();
  ctx.translate(item.x, item.y);
  const twinkle = item.clue && !current.found ? 1 + Math.sin(time * 4) * 0.04 : 1;
  ctx.scale(twinkle, twinkle);
  ctx.globalAlpha = item.clue && current.found ? 0.45 : 1;
  if (item.type === "letter") drawLetter(item);
  if (item.type === "book") drawBook(item);
  if (item.type === "potion") drawPotion(item);
  if (item.type === "feather") drawFeather(item);
  if (item.type === "mirror") drawMirror(item);
  ctx.restore();
}

function drawLetter(item) {
  ctx.fillStyle = item.color;
  ctx.beginPath();
  roundedRect(-28, -18, 56, 36, 5);
  ctx.fill();
  ctx.strokeStyle = "#6a4d31";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-25, -15);
  ctx.lineTo(0, 4);
  ctx.lineTo(25, -15);
  ctx.stroke();
}

function drawBook(item) {
  ctx.fillStyle = item.color;
  ctx.beginPath();
  roundedRect(-30, -22, 60, 44, 7);
  ctx.fill();
  ctx.strokeStyle = "#d9c184";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#d9c184";
  ctx.fillRect(-3, -18, 6, 36);
}

function drawPotion(item) {
  ctx.fillStyle = item.color;
  ctx.beginPath();
  ctx.arc(0, 8, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d9c184";
  ctx.fillRect(-9, -24, 18, 24);
  ctx.fillStyle = "#172632";
  ctx.fillRect(-12, -28, 24, 7);
}

function drawFeather(item) {
  ctx.strokeStyle = item.color;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-28, 22);
  ctx.quadraticCurveTo(0, -30, 32, -18);
  ctx.stroke();
  ctx.strokeStyle = "#b6c7cf";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-20, 14);
  ctx.lineTo(22, -15);
  ctx.stroke();
}

function drawMirror(item) {
  ctx.fillStyle = item.color;
  ctx.beginPath();
  ctx.ellipse(0, -2, 24, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d9c184";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#6a4d31";
  ctx.fillRect(-5, 26, 10, 24);
}

function drawFurniture() {
  ctx.fillStyle = "#6a4d31";
  ctx.beginPath();
  roundedRect(135, 118, 175, 54, 10);
  ctx.fill();
  ctx.fillStyle = "#314d61";
  ctx.beginPath();
  roundedRect(660, 122, 135, 95, 12);
  ctx.fill();
  ctx.fillStyle = "#553a63";
  ctx.beginPath();
  roundedRect(148, 390, 180, 75, 12);
  ctx.fill();
  ctx.fillStyle = "#405c35";
  ctx.beginPath();
  roundedRect(710, 392, 108, 82, 12);
  ctx.fill();
  ctx.fillStyle = "#101923";
  ctx.beginPath();
  roundedRect(390, 350, 190, 82, 12);
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
  hero.scarfSwing = Math.sin(time * 6) * 5;
  ctx.save();
  ctx.translate(hero.x, hero.y + bob);

  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.arc(0, -13, 25, Math.PI, 0);
  ctx.arc(-13, -21, 13, 0, Math.PI * 2);
  ctx.arc(6, -24, 15, 0, Math.PI * 2);
  ctx.arc(18, -17, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f2c49c";
  ctx.beginPath();
  ctx.arc(0, -8, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111111";
  ctx.beginPath();
  roundedRect(-27, 8, 54, 55, 14);
  ctx.fill();
  ctx.strokeStyle = "#7a1722";
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = "#7a1722";
  ctx.beginPath();
  roundedRect(-24, 3, 48, 12, 4);
  ctx.fill();
  ctx.fillStyle = "#d9a83f";
  ctx.fillRect(-20, 4, 8, 10);
  ctx.fillRect(-2, 4, 8, 10);
  ctx.fillRect(16, 4, 8, 10);
  ctx.fillStyle = "#7a1722";
  ctx.beginPath();
  roundedRect(16, 13, 15, 38 + hero.scarfSwing, 5);
  ctx.fill();
  ctx.fillStyle = "#d9a83f";
  ctx.fillRect(17, 22, 13, 5);
  ctx.fillRect(17, 38, 13, 5);

  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-8, -11, 7, 0, Math.PI * 2);
  ctx.arc(8, -11, 7, 0, Math.PI * 2);
  ctx.moveTo(-1, -11);
  ctx.lineTo(1, -11);
  ctx.stroke();

  ctx.strokeStyle = "#7a1722";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.lineTo(-5, -17);
  ctx.lineTo(2, -18);
  ctx.lineTo(-3, -10);
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
  ctx.strokeStyle = "#6a4d31";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(24, 22);
  ctx.lineTo(54, 0);
  ctx.stroke();
  ctx.restore();
}

function drawExit() {
  ctx.fillStyle = "#9edcff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#2f6c4f";
  ctx.fillRect(0, 420, W, 200);
  ctx.fillStyle = "#172632";
  ctx.font = "900 52px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("你从魔法学院密室出来了！", W / 2, 210);
  ctx.font = "900 26px system-ui";
  ctx.fillText("五个房间的故事线索全部解开。", W / 2, 260);
  ctx.fillStyle = "#1d684f";
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
      say("成功出来了！最后一间房就是学院侧门。");
      return;
    }
    roomIndex += 1;
    hero.x = 480;
    hero.y = 465;
    hero.targetX = hero.x;
    hero.targetY = hero.y;
    hero.movingForward = false;
    say(`进入第 ${roomIndex + 1}/5 间：${room().story}`);
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
    drawRoomShell();
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
  if (key === " " || key === "enter") investigate();
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

say(rooms[0].story);
requestAnimationFrame(draw);
