const canvas = document.querySelector("#coasterCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;
const sceneCount = document.querySelector("#sceneCount");
const sceneTitle = document.querySelector("#sceneTitle");
const sceneText = document.querySelector("#sceneText");
const statusText = document.querySelector("#statusText");
const playBtn = document.querySelector("#playBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const nextBtn = document.querySelector("#nextBtn");
const restartBtn = document.querySelector("#restartBtn");
const sceneList = document.querySelector("#sceneList");

const scenes = [
  { title: "正常出发", text: "过山车慢慢离站，玩偶乘客坐好，安全压杆已经放下。", duration: 7500, draw: drawDepart, music: musicNormal },
  { title: "爬上最高点", text: "链条咔哒咔哒往上拉，车厢到达最高点。", duration: 8000, draw: drawClimb, music: musicClimb },
  { title: "高速过弯", text: "车厢冲下坡，进入像过山车大圈一样的弯道。", duration: 8000, draw: drawLoop, music: musicFast },
  { title: "故障报警", text: "传感器发现轮组异常，红灯闪烁，系统立刻报警。", duration: 8000, draw: drawAlarm, music: musicAlarm },
  { title: "安全网接住", text: "紧急刹车和安全网一起打开，车厢停在保护区里。", duration: 8500, draw: drawCatch, music: musicBrake },
  { title: "救援完成", text: "救援人员赶到，玩偶乘客被安全带出，事故结束。", duration: 8000, draw: drawRescue, music: musicFinale }
];

let sceneIndex = 0;
let sceneStartedAt = performance.now();
let playing = false;
let pausedAt = sceneStartedAt;
let audioContext = null;

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

function musicNormal() {
  [392, 440, 494, 523].forEach((n, i) => playTone(n, i * 0.34, 0.28, 0.018));
}

function musicClimb() {
  for (let i = 0; i < 16; i += 1) playTone(220 + i * 18, i * 0.15, 0.08, 0.018, "square");
}

function musicFast() {
  [392, 523, 659, 784, 659, 523, 392].forEach((n, i) => playTone(n, i * 0.18, 0.16, 0.026, "triangle"));
}

function musicAlarm() {
  [880, 660, 880, 660, 880, 660].forEach((n, i) => playTone(n, i * 0.22, 0.14, 0.035, "square"));
}

function musicBrake() {
  [420, 360, 300, 240, 180].forEach((n, i) => playTone(n, i * 0.25, 0.3, 0.03, "sawtooth"));
}

function musicFinale() {
  [392, 494, 587, 659, 784, 659, 523].forEach((n, i) => playTone(n, i * 0.32, 0.3, 0.022));
}

function renderSceneList() {
  sceneList.innerHTML = "";
  scenes.forEach((scene, index) => {
    const item = document.createElement("li");
    item.className = index === sceneIndex ? "active" : "";
    item.textContent = `${index + 1}. ${scene.title}`;
    item.addEventListener("click", () => {
      setScene(index);
      if (playing) scene.music();
    });
    sceneList.appendChild(item);
  });
}

function setScene(index) {
  sceneIndex = (index + scenes.length) % scenes.length;
  sceneStartedAt = performance.now();
  pausedAt = playing ? 0 : sceneStartedAt;
  updateText();
  renderSceneList();
}

function updateText() {
  const scene = scenes[sceneIndex];
  sceneCount.textContent = `第 ${sceneIndex + 1} 幕`;
  sceneTitle.textContent = scene.title;
  sceneText.textContent = scene.text;
}

function playMovie() {
  if (!playing) {
    playing = true;
    if (pausedAt) {
      sceneStartedAt += performance.now() - pausedAt;
      pausedAt = 0;
    } else {
      sceneStartedAt = performance.now();
    }
    scenes[sceneIndex].music();
  }
  statusText.textContent = "过山车事故视频正在播放。";
}

function pauseMovie() {
  if (!playing) return;
  playing = false;
  pausedAt = performance.now();
  statusText.textContent = "视频暂停了。";
}

function nextScene() {
  setScene(sceneIndex + 1);
  if (playing) scenes[sceneIndex].music();
}

function restartMovie() {
  setScene(0);
  playing = true;
  scenes[0].music();
  statusText.textContent = "从第一幕重新播放。";
}

function loop(now) {
  const scene = scenes[sceneIndex];
  const elapsed = playing ? now - sceneStartedAt : (pausedAt || now) - sceneStartedAt;
  const t = Math.max(0, Math.min(1, elapsed / scene.duration));
  scene.draw(t, now / 1000);
  if (playing && elapsed >= scene.duration) {
    if (sceneIndex === scenes.length - 1) {
      playing = false;
      pausedAt = now;
      statusText.textContent = "视频播放完了。";
    } else {
      setScene(sceneIndex + 1);
      scenes[sceneIndex].music();
    }
  }
  requestAnimationFrame(loop);
}

function sky(top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function park() {
  ctx.fillStyle = "#6fbf73";
  ctx.fillRect(0, 450, W, 170);
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(0, 520, W, 100);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillRect(0, 520, W, 8);
  drawCloud(120, 90, 1);
  drawCloud(790, 120, 0.9);
}

function drawCloud(x, y, s) {
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.beginPath();
  ctx.arc(x, y, 24 * s, 0, Math.PI * 2);
  ctx.arc(x + 32 * s, y - 8 * s, 31 * s, 0, Math.PI * 2);
  ctx.arc(x + 66 * s, y, 24 * s, 0, Math.PI * 2);
  ctx.arc(x + 34 * s, y + 12 * s, 27 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawTrack() {
  ctx.strokeStyle = "#394653";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(60, 390);
  ctx.bezierCurveTo(220, 310, 250, 130, 405, 160);
  ctx.bezierCurveTo(560, 190, 500, 410, 650, 390);
  ctx.bezierCurveTo(850, 360, 840, 150, 980, 180);
  ctx.stroke();
  ctx.strokeStyle = "#f4f7fa";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.strokeStyle = "#394653";
  ctx.lineWidth = 8;
  for (let x = 90; x < 990; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 450);
    ctx.lineTo(x + 25, 330);
    ctx.stroke();
  }
}

function trackPoint(t) {
  const x = 80 + t * 900;
  const y = 390 - Math.sin(t * Math.PI * 2.5) * 135 - Math.sin(t * Math.PI * 5) * 34;
  return { x, y };
}

function drawTrain(x, y, angle = 0, tilt = 0, alert = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + tilt);
  for (let i = 0; i < 3; i += 1) {
    const ox = -74 + i * 56;
    ctx.fillStyle = alert && i === 1 ? "#d94a44" : "#ffd15f";
    ctx.beginPath();
    ctx.roundRect(ox, -24, 52, 38, 8);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#172632";
    ctx.beginPath();
    ctx.arc(ox + 12, 18, 7, 0, Math.PI * 2);
    ctx.arc(ox + 39, 18, 7, 0, Math.PI * 2);
    ctx.fill();
    drawDummy(ox + 26, -26);
  }
  ctx.restore();
}

function drawDummy(x, y) {
  ctx.fillStyle = "#f2c49c";
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(x - 6, y + 8, 12, 14);
}

function drawWarning(x, y, text) {
  ctx.fillStyle = "rgba(217,74,68,0.92)";
  ctx.beginPath();
  ctx.roundRect(x, y, 280, 58, 10);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "900 26px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, x + 140, y + 37);
  ctx.textAlign = "left";
}

function drawDepart(t) {
  sky("#9edcff", "#fff1c8");
  park();
  drawTrack();
  const p = trackPoint(0.04 + t * 0.16);
  drawTrain(p.x, p.y, -0.15, 0, false);
  ctx.fillStyle = "#172632";
  ctx.font = "900 28px system-ui";
  ctx.fillText("站台出发 · 安全压杆已放下", 70, 500);
}

function drawClimb(t) {
  sky("#9edcff", "#fff1c8");
  park();
  drawTrack();
  const p = trackPoint(0.18 + t * 0.18);
  drawTrain(p.x, p.y, -0.6 + t * 0.3, 0, false);
  ctx.fillStyle = "#172632";
  ctx.font = "900 32px system-ui";
  ctx.fillText("咔哒 咔哒 咔哒", 650, 92);
}

function drawLoop(t, clock) {
  sky("#82d0ff", "#fff1c8");
  park();
  drawTrack();
  ctx.strokeStyle = "rgba(255,255,255,0.86)";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(555, 280, 100, 0, Math.PI * 2);
  ctx.stroke();
  const p = trackPoint(0.38 + t * 0.2);
  drawTrain(p.x, p.y, t * Math.PI * 2, Math.sin(clock * 20) * 0.03, false);
  ctx.fillStyle = "#245b8f";
  ctx.font = "900 28px system-ui";
  ctx.fillText("高速过弯", 94, 120);
}

function drawAlarm(t, clock) {
  sky("#83bfdc", "#ffe0c8");
  park();
  drawTrack();
  const p = trackPoint(0.58 + t * 0.12);
  drawTrain(p.x, p.y, -0.25, Math.sin(clock * 20) * 0.16, true);
  drawWarning(70, 70, "轮组异常 · 自动报警");
  ctx.fillStyle = `rgba(217,74,68,${0.18 + Math.sin(clock * 10) * 0.12})`;
  ctx.fillRect(0, 0, W, H);
}

function drawCatch(t, clock) {
  sky("#9edcff", "#fff1c8");
  park();
  drawTrack();
  ctx.fillStyle = "rgba(57,166,87,0.35)";
  ctx.beginPath();
  ctx.ellipse(640, 430, 210, 52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#39a657";
  ctx.lineWidth = 8;
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.moveTo(455 + i * 52, 398);
    ctx.lineTo(500 + i * 44, 462);
    ctx.stroke();
  }
  const x = 600 + t * 55;
  const y = 390 + Math.sin(t * Math.PI) * 32;
  drawTrain(x, y, 0.06, 0.06 - t * 0.06, true);
  drawWarning(70, 70, "紧急刹车 · 安全网打开");
}

function drawRescue(t) {
  sky("#b8e8ff", "#fff1c8");
  park();
  drawTrack();
  drawTrain(620, 390, 0, 0, false);
  for (let i = 0; i < 3; i += 1) drawRescuer(460 + i * 90, 500, i);
  ctx.fillStyle = "#172632";
  ctx.font = "900 28px system-ui";
  ctx.fillText("救援完成 · 乘客安全离开", 110, 120);
}

function drawRescuer(x, y, i) {
  ctx.fillStyle = "#d94a44";
  ctx.fillRect(x - 16, y - 42, 32, 54);
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.arc(x, y - 60, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 22);
  ctx.lineTo(x - 34, y - 2 - i * 3);
  ctx.moveTo(x + 14, y - 22);
  ctx.lineTo(x + 34, y - 2 + i * 3);
  ctx.moveTo(x - 8, y + 12);
  ctx.lineTo(x - 16, y + 52);
  ctx.moveTo(x + 8, y + 12);
  ctx.lineTo(x + 16, y + 52);
  ctx.stroke();
}

playBtn.addEventListener("click", playMovie);
pauseBtn.addEventListener("click", pauseMovie);
nextBtn.addEventListener("click", nextScene);
restartBtn.addEventListener("click", restartMovie);

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + w - radius, y);
    this.quadraticCurveTo(x + w, y, x + w, y + radius);
    this.lineTo(x + w, y + h - radius);
    this.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    this.lineTo(x + radius, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
    return this;
  };
}

renderSceneList();
updateText();
requestAnimationFrame(loop);
