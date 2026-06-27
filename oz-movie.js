const canvas = document.querySelector("#ozCanvas");
const ctx = canvas.getContext("2d");
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
  {
    title: "堪萨斯的风",
    text: "多罗西和托托在农场旁边，看见远处的天空开始旋转。",
    duration: 6500,
    draw: drawKansas
  },
  {
    title: "房子飞起来",
    text: "龙卷风把小房子卷上天空，窗外的农场越来越远。",
    duration: 6500,
    draw: drawTornadoFlight
  },
  {
    title: "黄砖路",
    text: "房子轻轻落下，多罗西和托托看见一条金色小路通向远方。",
    duration: 6500,
    draw: drawYellowRoad
  },
  {
    title: "三个新朋友",
    text: "稻草人想要聪明，铁皮人想要温柔的心，狮子想要勇气。",
    duration: 7000,
    draw: drawFriends
  },
  {
    title: "翡翠城",
    text: "大家沿着黄砖路来到闪闪发光的翡翠城，学会相信自己。",
    duration: 7000,
    draw: drawEmeraldCity
  },
  {
    title: "回家",
    text: "多罗西抱着托托醒来，发现最想去的地方一直是温暖的家。",
    duration: 6500,
    draw: drawHome
  }
];

let sceneIndex = 0;
let sceneStartedAt = performance.now();
let playing = false;
let pausedAt = sceneStartedAt;
let audioContext = null;

function getAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(freq, start, duration, gainValue = 0.025, type = "sine") {
  const audio = getAudio();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.06);
}

function playOriginalMusic() {
  const melody = [392, 494, 523, 587, 659, 587, 523, 494, 440, 523, 659, 784, 698, 659, 587, 523];
  melody.forEach((note, index) => playTone(note, index * 0.26, 0.22, 0.025));
  [196, 247, 262, 294, 330, 294, 262, 247].forEach((note, index) => {
    playTone(note, index * 0.52, 0.42, 0.012, "triangle");
  });
}

function renderSceneList() {
  sceneList.innerHTML = "";
  scenes.forEach((scene, index) => {
    const item = document.createElement("li");
    item.className = index === sceneIndex ? "active" : "";
    item.textContent = `${index + 1}. ${scene.title}`;
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
    playOriginalMusic();
  }
  statusText.textContent = "电影正在播放。";
}

function pauseMovie() {
  if (!playing) return;
  playing = false;
  pausedAt = performance.now();
  statusText.textContent = "电影暂停了。";
}

function nextScene() {
  setScene(sceneIndex + 1);
  statusText.textContent = "切到下一幕。";
}

function restartMovie() {
  setScene(0);
  playing = true;
  playOriginalMusic();
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
      statusText.textContent = "电影播放完了。";
    } else {
      setScene(sceneIndex + 1);
    }
  }
  requestAnimationFrame(loop);
}

function sky(top, bottom) {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function ground(color = "#6fb36d") {
  ctx.fillStyle = color;
  ctx.fillRect(0, 470, canvas.width, 150);
  ctx.fillStyle = "rgba(23,38,50,0.14)";
  ctx.fillRect(0, 470, canvas.width, 6);
}

function drawCloud(x, y, scale = 1) {
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(x, y, 24 * scale, 0, Math.PI * 2);
  ctx.arc(x + 28 * scale, y - 8 * scale, 30 * scale, 0, Math.PI * 2);
  ctx.arc(x + 62 * scale, y, 22 * scale, 0, Math.PI * 2);
  ctx.arc(x + 30 * scale, y + 12 * scale, 28 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawKansas(t, clock) {
  sky("#b9d8ef", "#f2dfbe");
  drawCloud(80 + t * 120, 100, 1);
  drawCloud(760 - t * 70, 82, 0.8);
  ground("#b9a46b");
  drawFence();
  drawFarmHouse(705, 338, 1);
  drawTornado(260 + t * 70, 330, 0.55 + t * 0.2, clock);
  drawDorothy(190, 438, 1, clock);
  drawToto(255, 454, 1, clock);
  drawWindLeaves(t, clock);
}

function drawTornadoFlight(t, clock) {
  sky("#8da5bd", "#e8d8bb");
  ground("#8f9c70");
  drawTornado(505, 340, 1.25, clock);
  const angle = Math.sin(clock * 2.4) * 0.16;
  const x = 460 + Math.sin(t * Math.PI * 2) * 110;
  const y = 310 - Math.sin(t * Math.PI) * 175;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  drawFarmHouse(-60, -62, 0.72);
  ctx.restore();
  drawCloud(90, 86, 0.7);
  drawCloud(808, 112, 0.9);
  drawWindLeaves(t, clock);
}

function drawYellowRoad(t, clock) {
  sky("#a9dcff", "#fff4cf");
  ground("#64ba6b");
  drawFarHills();
  drawYellowBrickRoad(t);
  drawDorothy(340 + t * 150, 430, 1, clock);
  drawToto(405 + t * 150, 454, 1, clock);
  drawMunchkinFlowers();
  drawFarmHouse(92, 348, 0.65);
}

function drawFriends(t, clock) {
  sky("#bde7ff", "#fff0c8");
  ground("#65b96b");
  drawYellowBrickRoad(1);
  drawDorothy(208, 430, 1, clock);
  drawToto(270, 454, 1, clock);
  drawScarecrow(420, 420, clock);
  drawTinPerson(602, 416, clock);
  drawLion(780, 436, clock);
  drawSpeech("聪明", 388, 282);
  drawSpeech("温柔的心", 548, 276);
  drawSpeech("勇气", 748, 292);
}

function drawEmeraldCity(t, clock) {
  sky("#9edcff", "#dcffe6");
  ground("#55a85d");
  drawYellowBrickRoad(1);
  drawEmeraldTowers(520, 310, t, clock);
  drawDorothy(230 + t * 150, 430, 1, clock);
  drawToto(292 + t * 150, 454, 1, clock);
  drawScarecrow(458 + t * 72, 420, clock);
  drawTinPerson(560 + t * 62, 416, clock);
  drawLion(684 + t * 50, 436, clock);
}

function drawHome(t, clock) {
  sky("#ffcfae", "#fff1d1");
  ground("#b9a46b");
  drawCloud(150, 92, 0.85);
  drawFarmHouse(650, 336, 1);
  drawDorothy(430, 436, 1.05, clock);
  drawToto(503, 456, 1.05, clock);
  drawSpeech("家最温暖", 392, 292);
}

function drawFence() {
  ctx.strokeStyle = "#7b5a3a";
  ctx.lineWidth = 5;
  for (let x = 0; x < canvas.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 430);
    ctx.lineTo(x + 38, 472);
    ctx.stroke();
  }
  ctx.fillStyle = "#7b5a3a";
  ctx.fillRect(0, 444, canvas.width, 8);
}

function drawFarmHouse(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#f4e0bb";
  ctx.fillRect(0, 48, 120, 92);
  ctx.fillStyle = "#9b4c36";
  ctx.beginPath();
  ctx.moveTo(-10, 48);
  ctx.lineTo(60, -10);
  ctx.lineTo(132, 48);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(22, 74, 24, 24);
  ctx.fillRect(76, 74, 24, 24);
  ctx.fillStyle = "#7b5a3a";
  ctx.fillRect(50, 104, 26, 36);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 48, 120, 92);
  ctx.restore();
}

function drawDorothy(x, y, scale, clock) {
  const walk = Math.sin(clock * 8) * 4;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 35, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f0bb87";
  ctx.beginPath();
  ctx.arc(0, -36, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6b4a2a";
  ctx.fillRect(-18, -48, 36, 10);
  ctx.fillStyle = "#73a8d9";
  ctx.fillRect(-17, -18, 34, 42);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-22, -18, 44, 12);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-8, 22);
  ctx.lineTo(-18, 48 + walk);
  ctx.moveTo(8, 22);
  ctx.lineTo(18, 48 - walk);
  ctx.moveTo(-17, -2);
  ctx.lineTo(-34, 10 - walk);
  ctx.moveTo(17, -2);
  ctx.lineTo(34, 10 + walk);
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.fillRect(-7, -39, 5, 5);
  ctx.fillRect(5, -39, 5, 5);
  ctx.restore();
}

function drawToto(x, y, scale, clock) {
  ctx.save();
  ctx.translate(x, y + Math.sin(clock * 8) * 2);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#2f2d2b";
  ctx.beginPath();
  ctx.ellipse(0, 8, 25, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(24, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-18, 16, 7, 18);
  ctx.fillRect(10, 16, 7, 18);
  ctx.strokeStyle = "#2f2d2b";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-24, 6);
  ctx.quadraticCurveTo(-42, -12, -48, 8);
  ctx.stroke();
  ctx.restore();
}

function drawTornado(x, y, scale, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "rgba(78,88,96,0.58)";
  ctx.lineWidth = 16;
  for (let i = 0; i < 7; i += 1) {
    const yy = -190 + i * 48;
    const width = 150 - i * 17;
    const shift = Math.sin(clock * 3 + i) * 12;
    ctx.beginPath();
    ctx.ellipse(shift, yy, width, 24, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWindLeaves(t, clock) {
  ctx.fillStyle = "#7b5a3a";
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 83 + clock * 120) % 1140 - 40;
    const y = 150 + Math.sin(clock * 2 + i) * 80 + i * 8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(clock * 3 + i);
    ctx.fillRect(-8, -3, 16, 6);
    ctx.restore();
  }
}

function drawFarHills() {
  ctx.fillStyle = "#79bd73";
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.quadraticCurveTo(160, 360, 320, 470);
  ctx.quadraticCurveTo(520, 340, 720, 470);
  ctx.quadraticCurveTo(920, 360, 1080, 470);
  ctx.closePath();
  ctx.fill();
}

function drawYellowBrickRoad(progress) {
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.moveTo(470, 620);
  ctx.quadraticCurveTo(590, 488, 548, 408);
  ctx.quadraticCurveTo(512, 352, 644, 302);
  ctx.lineTo(690, 314);
  ctx.quadraticCurveTo(560, 370, 610, 430);
  ctx.quadraticCurveTo(690, 512, 660, 620);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(123,90,58,0.45)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 16 * progress; i += 1) {
    const y = 600 - i * 18;
    ctx.beginPath();
    ctx.moveTo(472 + i * 4, y);
    ctx.lineTo(660 - i * 2, y - 10);
    ctx.stroke();
  }
}

function drawMunchkinFlowers() {
  for (let i = 0; i < 24; i += 1) {
    const x = 80 + i * 38;
    const y = 520 + Math.sin(i) * 28;
    ctx.fillStyle = i % 2 ? "#d94a78" : "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#39a657";
    ctx.fillRect(x - 1, y + 6, 3, 18);
  }
}

function drawScarecrow(x, y, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#7b5a3a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -50);
  ctx.lineTo(0, 42);
  ctx.moveTo(-42, -12);
  ctx.lineTo(42, -12);
  ctx.stroke();
  ctx.fillStyle = "#d7a249";
  ctx.beginPath();
  ctx.arc(0, -62, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(-18, -42, 36, 48);
  ctx.fillStyle = "#9b6a3c";
  ctx.fillRect(-28, -86, 56, 14);
  ctx.beginPath();
  ctx.moveTo(-20, -86);
  ctx.lineTo(0, -114);
  ctx.lineTo(20, -86);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawTinPerson(x, y, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#b7c2c9";
  ctx.fillRect(-22, -68, 44, 76);
  ctx.beginPath();
  ctx.arc(0, -92, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#87939b";
  ctx.fillRect(-30, -54, 12, 52);
  ctx.fillRect(18, -54, 12, 52);
  ctx.fillRect(-18, 8, 12, 44);
  ctx.fillRect(6, 8, 12, 44);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 3;
  ctx.strokeRect(-22, -68, 44, 76);
  ctx.restore();
}

function drawLion(x, y, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#b56f36";
  ctx.beginPath();
  ctx.arc(0, -54, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d7a249";
  ctx.beginPath();
  ctx.arc(0, -54, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, 42, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-28, 16, 10, 34);
  ctx.fillRect(18, 16, 10, 34);
  ctx.strokeStyle = "#b56f36";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-38, -2);
  ctx.quadraticCurveTo(-72, -24, -68, 8);
  ctx.stroke();
  ctx.restore();
}

function drawSpeech(text, x, y) {
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  roundRect(x, y, 118, 44, 12);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 17px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, x + 59, y + 28);
  ctx.textAlign = "left";
}

function drawEmeraldTowers(x, y, t, clock) {
  const glow = 0.72 + Math.sin(clock * 4) * 0.12;
  ctx.fillStyle = `rgba(57,166,87,${glow})`;
  [0, 54, 108, 162].forEach((offset, index) => {
    const h = 170 + index * 34;
    ctx.fillRect(x + offset, y + 220 - h, 42, h);
    ctx.beginPath();
    ctx.moveTo(x + offset - 8, y + 220 - h);
    ctx.lineTo(x + offset + 21, y + 180 - h);
    ctx.lineTo(x + offset + 50, y + 220 - h);
    ctx.closePath();
    ctx.fill();
  });
  ctx.fillStyle = "#172632";
  ctx.font = "bold 20px system-ui";
  ctx.fillText("翡翠城", x + 54, y + 246);
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

playBtn.addEventListener("click", playMovie);
pauseBtn.addEventListener("click", pauseMovie);
nextBtn.addEventListener("click", nextScene);
restartBtn.addEventListener("click", restartMovie);

renderSceneList();
updateText();
requestAnimationFrame(loop);
