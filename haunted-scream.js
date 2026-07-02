const canvas = document.querySelector("#hauntedCanvas");
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
  { title: "排队进鬼屋", text: "几个玩偶游客站在鬼屋门口，灯牌一闪一闪，大家准备进去。", duration: 6500, draw: drawQueue, sound: musicDoor },
  { title: "门慢慢打开", text: "鬼屋大门嘎吱嘎吱打开，里面的紫色灯光照了出来。", duration: 7000, draw: drawDoor, sound: soundCreak },
  { title: "怪物一起出现", text: "幽灵、僵尸、骷髅和南瓜从舞台后面冒出来。", duration: 7200, draw: drawMonsters, sound: soundBoo },
  { title: "游客尖叫", text: "灯光快速闪烁，游客大喊“啊啊啊”，然后抱在一起。", duration: 7600, draw: drawScream, sound: soundScream },
  { title: "跑出鬼屋", text: "大家一边尖叫一边跑出来，发现只是好玩的机关。", duration: 7000, draw: drawRunOut, sound: soundRun },
  { title: "开心合影", text: "游客在门口合影，鬼屋灯牌亮起：挑战成功。", duration: 7000, draw: drawPhoto, sound: soundWin }
];

let sceneIndex = 0;
let sceneStartedAt = performance.now();
let playing = false;
let pausedAt = sceneStartedAt;
let audioContext = null;

function rr(x, y, w, h, r) {
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

function getAudio() {
  if (!window.AudioContext && !window.webkitAudioContext) return null;
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function tone(freq, start, duration, gainValue = 0.025, type = "sine") {
  const audio = getAudio();
  if (!audio) return;
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
  osc.stop(audio.currentTime + start + duration + 0.04);
}

function noiseBurst(start, duration, gainValue = 0.05) {
  const audio = getAudio();
  if (!audio) return;
  const length = Math.max(1, Math.floor(audio.sampleRate * duration));
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = audio.createBufferSource();
  const gain = audio.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(gainValue, audio.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  source.connect(gain);
  gain.connect(audio.destination);
  source.start(audio.currentTime + start);
  source.stop(audio.currentTime + start + duration);
}

function musicDoor() {
  [196, 247, 294, 247].forEach((n, i) => tone(n, i * 0.32, 0.24, 0.018, "triangle"));
}

function soundCreak() {
  [160, 145, 132, 120, 112].forEach((n, i) => tone(n, i * 0.2, 0.32, 0.035, "sawtooth"));
}

function soundBoo() {
  tone(95, 0, 1.0, 0.055, "sawtooth");
  tone(155, 0.16, 0.7, 0.04, "triangle");
}

function soundScream() {
  [760, 920, 820, 980, 860].forEach((n, i) => tone(n, i * 0.16, 0.18, 0.045, "square"));
  noiseBurst(0.1, 0.55, 0.055);
}

function soundRun() {
  for (let i = 0; i < 10; i += 1) tone(230 + (i % 2) * 70, i * 0.08, 0.05, 0.022, "square");
}

function soundWin() {
  [392, 494, 587, 784, 659].forEach((n, i) => tone(n, i * 0.22, 0.2, 0.025, "triangle"));
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

function renderSceneList() {
  sceneList.innerHTML = "";
  scenes.forEach((scene, index) => {
    const item = document.createElement("li");
    item.className = index === sceneIndex ? "active" : "";
    item.textContent = `${index + 1}. ${scene.title}`;
    item.addEventListener("click", () => {
      setScene(index);
      if (playing) scene.sound();
    });
    sceneList.appendChild(item);
  });
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
    scenes[sceneIndex].sound();
  }
  statusText.textContent = "鬼屋尖叫短片正在播放。";
}

function pauseMovie() {
  if (!playing) return;
  playing = false;
  pausedAt = performance.now();
  statusText.textContent = "视频暂停了。";
}

function nextScene() {
  setScene(sceneIndex + 1);
  if (playing) scenes[sceneIndex].sound();
}

function restartMovie() {
  setScene(0);
  playing = true;
  scenes[0].sound();
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
      statusText.textContent = "鬼屋短片播放完了。";
    } else {
      setScene(sceneIndex + 1);
      scenes[sceneIndex].sound();
    }
  }
  requestAnimationFrame(loop);
}

function bg(flash = 0) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, flash ? "#ffd15f" : "#10131f");
  g.addColorStop(0.48, flash ? "#e54c82" : "#29203e");
  g.addColorStop(1, "#07090f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let x = 0; x < W; x += 80) ctx.fillRect(x, 0, 2, H);
  ctx.fillStyle = "#171923";
  ctx.fillRect(0, 470, W, 150);
  ctx.fillStyle = "#241a30";
  ctx.fillRect(0, 520, W, 100);
}

function house(open = 0, light = 0, signText = "GHOST HOUSE") {
  ctx.fillStyle = "#0c0f17";
  ctx.beginPath();
  ctx.moveTo(260, 470);
  ctx.lineTo(260, 210);
  ctx.lineTo(540, 95);
  ctx.lineTo(820, 210);
  ctx.lineTo(820, 470);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#665a80";
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.fillStyle = light ? "#ffd15f" : "#4f375f";
  ctx.beginPath();
  rr(395, 154, 290, 62, 14);
  ctx.fill();
  ctx.fillStyle = "#151923";
  ctx.font = "900 30px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(signText, 540, 196);
  ctx.textAlign = "left";

  drawWindow(325, 260, light);
  drawWindow(675, 260, light);

  const gap = 110 * open;
  ctx.fillStyle = light ? "#432858" : "#18131f";
  ctx.fillRect(458 - gap, 320, 82, 150);
  ctx.fillRect(540 + gap, 320, 82, 150);
  ctx.strokeStyle = "#8c789b";
  ctx.lineWidth = 5;
  ctx.strokeRect(458 - gap, 320, 82, 150);
  ctx.strokeRect(540 + gap, 320, 82, 150);
  if (open > 0.2) {
    ctx.fillStyle = "rgba(203,99,255,0.35)";
    ctx.beginPath();
    ctx.moveTo(480, 470);
    ctx.lineTo(600, 320);
    ctx.lineTo(760, 470);
    ctx.closePath();
    ctx.fill();
  }
}

function drawWindow(x, y, light) {
  ctx.fillStyle = light ? "#ffd15f" : "#1b2134";
  ctx.beginPath();
  rr(x, y, 80, 70, 12);
  ctx.fill();
  ctx.strokeStyle = "#756b8c";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeRect(x + 38, y, 4, 70);
  ctx.strokeRect(x, y + 33, 80, 4);
}

function visitor(x, y, color, scared = 0, wave = 0) {
  ctx.save();
  ctx.translate(x, y + Math.sin(wave) * 6);
  ctx.fillStyle = "#f2c49c";
  ctx.beginPath();
  ctx.arc(0, -55, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  rr(-22, -34, 44, 58, 12);
  ctx.fill();
  ctx.strokeStyle = "#151923";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.strokeStyle = "#f2c49c";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-20, -18);
  ctx.lineTo(-42 - scared * 12, -40 - scared * 20);
  ctx.moveTo(20, -18);
  ctx.lineTo(42 + scared * 12, -40 - scared * 20);
  ctx.stroke();
  ctx.strokeStyle = "#151923";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-7, -59, 2, 0, Math.PI * 2);
  ctx.arc(7, -59, 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  if (scared) ctx.arc(0, -48, 7, 0, Math.PI * 2);
  else ctx.arc(0, -50, 8, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

function ghost(x, y, s = 1, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y + Math.sin(performance.now() / 400) * 8);
  ctx.scale(s, s);
  ctx.fillStyle = "#e9efff";
  ctx.beginPath();
  ctx.arc(0, -38, 36, Math.PI, 0);
  ctx.lineTo(36, 42);
  ctx.lineTo(18, 28);
  ctx.lineTo(0, 42);
  ctx.lineTo(-18, 28);
  ctx.lineTo(-36, 42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#151923";
  ctx.beginPath();
  ctx.arc(-12, -42, 5, 0, Math.PI * 2);
  ctx.arc(12, -42, 5, 0, Math.PI * 2);
  ctx.arc(0, -22, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function zombie(x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "#9bd18c";
  ctx.fillRect(-22, -80, 44, 42);
  ctx.fillStyle = "#48664a";
  ctx.beginPath();
  rr(-28, -38, 56, 74, 8);
  ctx.fill();
  ctx.strokeStyle = "#151923";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#151923";
  ctx.fillRect(-10, -66, 6, 6);
  ctx.fillRect(8, -66, 6, 6);
  ctx.restore();
}

function skeleton(x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "#f7f2df";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, -60, 22, 0, Math.PI * 2);
  ctx.moveTo(0, -38);
  ctx.lineTo(0, 20);
  ctx.moveTo(-28, -15);
  ctx.lineTo(28, -15);
  ctx.moveTo(-18, 20);
  ctx.lineTo(-28, 54);
  ctx.moveTo(18, 20);
  ctx.lineTo(28, 54);
  ctx.stroke();
  ctx.fillStyle = "#151923";
  ctx.fillRect(-9, -66, 6, 6);
  ctx.fillRect(5, -66, 6, 6);
  ctx.restore();
}

function pumpkin(x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "#f28b2f";
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#151923";
  ctx.beginPath();
  ctx.moveTo(-20, -8);
  ctx.lineTo(-8, -18);
  ctx.lineTo(0, -6);
  ctx.closePath();
  ctx.moveTo(20, -8);
  ctx.lineTo(8, -18);
  ctx.lineTo(0, -6);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-18, 10, 36, 8);
  ctx.restore();
}

function drawQueue(t, clock) {
  bg(0);
  house(0, Math.floor(clock * 3) % 2, "鬼屋入口");
  [-90, 0, 90, 180].forEach((dx, i) => visitor(360 + dx + t * 70, 510, ["#e54c82", "#2f79c8", "#39a657", "#ffd15f"][i], 0, clock * 3 + i));
}

function drawDoor(t, clock) {
  bg(0);
  house(t, 1, "门正在打开");
  [-80, 0, 80].forEach((dx, i) => visitor(460 + dx, 510, ["#e54c82", "#2f79c8", "#39a657"][i], t * 0.5, clock * 3 + i));
  ghost(690, 390, 0.6, t);
}

function drawMonsters(t, clock) {
  bg(0);
  house(1, 1, "机关启动");
  ghost(420, 385, 0.9, Math.min(1, t * 2));
  zombie(560, 470 - Math.sin(t * Math.PI) * 65, 0.95);
  skeleton(690, 470 - Math.sin(t * Math.PI) * 42, 0.9);
  pumpkin(795, 455, 0.95);
  [-110, -30, 55, 135].forEach((dx, i) => visitor(430 + dx, 525, ["#e54c82", "#2f79c8", "#39a657", "#ffd15f"][i], t, clock * 5 + i));
}

function drawScream(t, clock) {
  bg(Math.floor(clock * 9) % 2);
  house(1, Math.floor(clock * 9) % 2, "啊啊啊");
  ghost(380, 360, 1.1, 1);
  zombie(565, 465, 1);
  skeleton(720, 470, 0.95);
  pumpkin(830, 455, 1);
  [-115, -35, 45, 125].forEach((dx, i) => visitor(420 + dx + Math.sin(clock * 15 + i) * 12, 528, ["#e54c82", "#2f79c8", "#39a657", "#ffd15f"][i], 1, clock * 12 + i));
  ctx.fillStyle = "#fff";
  ctx.font = "900 64px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("啊啊啊!", 535, 110 + Math.sin(clock * 12) * 8);
  ctx.textAlign = "left";
}

function drawRunOut(t, clock) {
  bg(0);
  house(1, 1, "出口");
  ghost(700 - t * 120, 360, 0.9, 0.8);
  const run = t * 430;
  [-100, -25, 55, 130].forEach((dx, i) => visitor(360 + dx + run, 525, ["#e54c82", "#2f79c8", "#39a657", "#ffd15f"][i], 0.7, clock * 15 + i));
  ctx.fillStyle = "#ffd15f";
  ctx.font = "900 34px system-ui";
  ctx.fillText("只是机关，快跑出来啦！", 330, 105);
}

function drawPhoto(t, clock) {
  bg(0);
  house(0.15, Math.floor(clock * 2) % 2, "挑战成功");
  [-120, -40, 40, 120].forEach((dx, i) => visitor(540 + dx, 520, ["#e54c82", "#2f79c8", "#39a657", "#ffd15f"][i], 0, clock * 2 + i));
  ghost(840, 390, 0.75, 0.75);
  pumpkin(265, 468, 0.9);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  rr(330, 116, 420, 76, 14);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "900 42px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("鬼屋挑战成功", 540, 166);
  ctx.textAlign = "left";
}

playBtn.addEventListener("click", playMovie);
pauseBtn.addEventListener("click", pauseMovie);
nextBtn.addEventListener("click", nextScene);
restartBtn.addEventListener("click", restartMovie);

updateText();
renderSceneList();
requestAnimationFrame(loop);
