const canvas = document.querySelector("#metroCrashCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.querySelector("#statusText");
const speedText = document.querySelector("#speedText");
const doorText = document.querySelector("#doorText");
const endingCard = document.querySelector("#endingCard");
const endingTitle = document.querySelector("#endingTitle");
const endingText = document.querySelector("#endingText");
const startBtn = document.querySelector("#startBtn");
const fasterBtn = document.querySelector("#fasterBtn");
const brakeBtn = document.querySelector("#brakeBtn");
const doorBtn = document.querySelector("#doorBtn");
const boostBtn = document.querySelector("#boostBtn");
const resetBtn = document.querySelector("#resetBtn");
const againBtn = document.querySelector("#againBtn");

const keys = new Set();
let running = false;
let crashed = false;
let doorsOpen = false;
let speed = 0;
let trainX = -360;
let sparks = [];
let toys = [];
let shake = 0;
let audioContext = null;

function getAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(freq, start, duration, gainValue = 0.04, type = "square") {
  const audio = getAudio();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.03);
}

function playStartSound() {
  [330, 392, 494].forEach((note, index) => playTone(note, index * 0.1, 0.08, 0.035, "sine"));
}

function playCrashSound() {
  playTone(190, 0, 0.24, 0.07, "sawtooth");
  playTone(90, 0.16, 0.44, 0.07, "triangle");
  playTone(680, 0.08, 0.08, 0.04, "square");
  playTone(760, 0.22, 0.08, 0.04, "square");
  playTone(840, 0.34, 0.08, 0.04, "square");
}

function makeToys() {
  toys = [
    { x: trainX + 90, y: 360, vx: -8, vy: -10, r: 0, vr: -0.2, kind: "bear", color: "#d7a249" },
    { x: trainX + 170, y: 360, vx: 7, vy: -13, r: 0, vr: 0.17, kind: "case", color: "#245b8f" },
    { x: trainX + 260, y: 360, vx: -5, vy: -16, r: 0, vr: 0.22, kind: "block", color: "#d93a32" },
    { x: trainX + 350, y: 360, vx: 9, vy: -12, r: 0, vr: -0.18, kind: "doll", color: "#39a657" },
    { x: trainX + 450, y: 360, vx: -3, vy: -15, r: 0, vr: 0.25, kind: "case", color: "#8f5fd9" }
  ];
}

function start() {
  running = true;
  crashed = false;
  doorsOpen = false;
  speed = 6;
  trainX = -360;
  sparks = [];
  toys = [];
  shake = 0;
  endingCard.classList.remove("show");
  statusText.textContent = "玩具地铁出发了。你可以加速、刹车、开门关门。";
  playStartSound();
}

function reset() {
  running = false;
  crashed = false;
  doorsOpen = false;
  speed = 0;
  trainX = -360;
  sparks = [];
  toys = [];
  shake = 0;
  endingCard.classList.remove("show");
  statusText.textContent = "按开始后，你可以控制玩具地铁。全速冲刺会快得像闪电，撞到缓冲墙后玩具和行李箱会乱飞。";
}

function boost() {
  if (!running || crashed) start();
  speed = Math.max(speed, 34);
  doorsOpen = false;
  statusText.textContent = "全速冲刺！快得像闪电侠一样，噼里啪啦往前冲。";
}

function toggleDoor() {
  if (crashed) return;
  doorsOpen = !doorsOpen;
  doorText.textContent = doorsOpen ? "打开" : "关闭";
  statusText.textContent = doorsOpen ? "车门慢慢打开。玩具地铁开门时不要全速跑。" : "车门关上，可以继续开。";
  playTone(doorsOpen ? 520 : 390, 0, 0.12, 0.035, "sine");
}

function crash() {
  crashed = true;
  running = false;
  speed = 0;
  shake = 28;
  makeToys();
  sparks = Array.from({ length: 52 }, () => ({
    x: 816 + Math.random() * 54,
    y: 330 + Math.random() * 90,
    vx: -8 - Math.random() * 9,
    vy: -7 + Math.random() * 14,
    life: 30 + Math.random() * 24
  }));
  statusText.textContent = "哐哐嚓！地铁撞到缓冲墙停下，玩具和行李箱乱飞。";
  endingTitle.textContent = "哐哐嚓，停下来了";
  endingText.textContent = "车厢里是玩具假人和行李箱，安全示意短片结束。";
  endingCard.classList.add("show");
  playCrashSound();
}

function update() {
  if (running && !crashed) {
    if (keys.has("w") || keys.has("ArrowUp")) speed += 0.42;
    if (keys.has("s") || keys.has("ArrowDown")) speed -= 0.62;
    speed = Math.max(0, Math.min(42, speed));
    trainX += speed;
    if (speed > 26) {
      sparks.push({
        x: trainX + 44 + Math.random() * 540,
        y: 416 + Math.random() * 16,
        vx: -6 - Math.random() * 7,
        vy: -2 - Math.random() * 4,
        life: 18
      });
    }
    if (trainX + 610 >= 840) crash();
  }

  toys.forEach((toy) => {
    toy.x += toy.vx;
    toy.y += toy.vy;
    toy.vy += 0.65;
    toy.r += toy.vr;
    if (toy.y > 535) {
      toy.y = 535;
      toy.vy *= -0.32;
      toy.vx *= 0.82;
    }
  });

  sparks.forEach((spark) => {
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vy += 0.25;
    spark.life -= 1;
  });
  sparks = sparks.filter((spark) => spark.life > 0);
  shake = Math.max(0, shake - 1);
  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.save();
  if (shake > 0) {
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake * 0.4);
  }
  drawTunnel();
  drawTrain();
  drawWall();
  sparks.forEach(drawSpark);
  toys.forEach(drawToy);
  drawHud();
  ctx.restore();
  speedText.textContent = `${Math.round(speed * 8)} km/h`;
  doorText.textContent = doorsOpen ? "打开" : "关闭";
}

function drawTunnel() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#10202d");
  gradient.addColorStop(0.56, "#253747");
  gradient.addColorStop(1, "#10161d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.09)";
  ctx.lineWidth = 4;
  for (let x = -80; x < canvas.width + 120; x += 90) {
    const offset = (trainX * 0.35) % 90;
    ctx.beginPath();
    ctx.moveTo(x - offset, 90);
    ctx.lineTo(x - offset + 160, 500);
    ctx.stroke();
  }

  ctx.fillStyle = "#384755";
  ctx.fillRect(0, 442, canvas.width, 48);
  ctx.fillStyle = "#1b2730";
  ctx.fillRect(0, 490, canvas.width, 130);
  ctx.strokeStyle = "#c5b58d";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.lineTo(canvas.width, 470);
  ctx.moveTo(0, 526);
  ctx.lineTo(canvas.width, 526);
  ctx.stroke();
  ctx.strokeStyle = "#64717b";
  ctx.lineWidth = 5;
  for (let x = -40; x < canvas.width; x += 70) {
    const offset = (trainX * 0.6) % 70;
    ctx.beginPath();
    ctx.moveTo(x - offset, 454);
    ctx.lineTo(x - offset + 42, 548);
    ctx.stroke();
  }

  if (speed > 25 && running) {
    ctx.strokeStyle = "rgba(255, 209, 95, 0.55)";
    ctx.lineWidth = 3;
    for (let line = 0; line < 18; line += 1) {
      const y = 80 + line * 24;
      ctx.beginPath();
      ctx.moveTo(20 + Math.random() * 80, y);
      ctx.lineTo(280 + Math.random() * 420, y + Math.random() * 20);
      ctx.stroke();
    }
  }
}

function drawTrain() {
  ctx.save();
  ctx.translate(trainX, 338);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(300, 132, 310, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d9e6ec";
  ctx.beginPath();
  ctx.roundRect(0, 0, 610, 116, 28);
  ctx.fill();
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(20, 62, 560, 18);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 24px system-ui";
  ctx.fillText("闪电号 MRT", 32, 44);

  for (let x = 170; x < 550; x += 94) {
    ctx.fillStyle = "#7ec5df";
    ctx.beginPath();
    ctx.roundRect(x, 22, 58, 32, 8);
    ctx.fill();
  }

  drawDoor(92, doorsOpen);
  drawDoor(282, doorsOpen);
  drawDoor(472, doorsOpen);
  drawInsideToys();

  ctx.fillStyle = "#111821";
  ctx.beginPath();
  ctx.arc(116, 118, 18, 0, Math.PI * 2);
  ctx.arc(494, 118, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDoor(x, open) {
  ctx.fillStyle = "#b8cbd4";
  if (open) {
    ctx.fillRect(x - 34, 20, 18, 70);
    ctx.fillRect(x + 16, 20, 18, 70);
  } else {
    ctx.fillRect(x - 26, 20, 52, 70);
  }
  ctx.strokeStyle = "rgba(23,38,50,0.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 26, 20, 52, 70);
}

function drawInsideToys() {
  const passengers = [
    { x: 178, color: "#d93a32", label: "玩具" },
    { x: 250, color: "#ffd15f", label: "熊" },
    { x: 360, color: "#39a657", label: "娃娃" },
    { x: 430, color: "#8f5fd9", label: "箱" }
  ];
  passengers.forEach((toy) => {
    ctx.fillStyle = toy.color;
    ctx.beginPath();
    ctx.arc(toy.x, 86, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.font = "bold 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(toy.label, toy.x, 107);
    ctx.textAlign = "left";
  });
}

function drawWall() {
  ctx.fillStyle = "#6b4b3b";
  ctx.fillRect(846, 266, 72, 235);
  ctx.fillStyle = "#ffd15f";
  ctx.font = "bold 18px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("缓冲墙", 882, 252);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  for (let y = 282; y < 492; y += 36) {
    ctx.fillRect(852, y, 60, 12);
  }
}

function drawSpark(spark) {
  ctx.fillStyle = spark.life % 2 > 1 ? "#ffd15f" : "#f08a2d";
  ctx.beginPath();
  ctx.arc(spark.x, spark.y, 3 + spark.life * 0.03, 0, Math.PI * 2);
  ctx.fill();
}

function drawToy(toy) {
  ctx.save();
  ctx.translate(toy.x, toy.y);
  ctx.rotate(toy.r);
  ctx.fillStyle = toy.color;
  if (toy.kind === "case") {
    ctx.fillRect(-24, -18, 48, 36);
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 4;
    ctx.strokeRect(-24, -18, 48, 36);
  } else if (toy.kind === "bear") {
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.arc(-15, -16, 9, 0, Math.PI * 2);
    ctx.arc(15, -16, 9, 0, Math.PI * 2);
    ctx.fill();
  } else if (toy.kind === "doll") {
    ctx.beginPath();
    ctx.arc(0, -14, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-14, 0, 28, 34);
  } else {
    ctx.fillRect(-20, -20, 40, 40);
  }
  ctx.restore();
}

function drawHud() {
  ctx.fillStyle = "rgba(255,250,240,0.9)";
  ctx.fillRect(22, 20, 242, 86);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 19px system-ui";
  ctx.fillText("玩具地铁安全示意", 40, 52);
  ctx.fillText(`${Math.round(speed * 8)} km/h`, 40, 84);
}

startBtn.addEventListener("click", start);
fasterBtn.addEventListener("click", () => {
  if (!running) start();
  speed = Math.min(42, speed + 6);
  statusText.textContent = "正在加速。";
});
brakeBtn.addEventListener("click", () => {
  speed = Math.max(0, speed - 9);
  statusText.textContent = "正在刹车。";
});
doorBtn.addEventListener("click", toggleDoor);
boostBtn.addEventListener("click", boost);
resetBtn.addEventListener("click", reset);
againBtn.addEventListener("click", reset);

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.add(key);
  if (key === "d") toggleDoor();
  if (key === " ") boost();
  if (["w", "s", "d", " ", "ArrowUp", "ArrowDown"].includes(key)) event.preventDefault();
});

window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.delete(key);
});

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, w, h, r) {
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };
}

reset();
update();
