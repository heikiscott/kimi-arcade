const canvas = document.querySelector("#ozCanvas");
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
  { title: "从高小姐家跑回家", text: "多罗西留着长头发，抱着托托一路跑回农场，请大家帮帮小狗。", duration: 7500, draw: drawRunFromGulch, music: musicKansas },
  { title: "农场里的投诉", text: "高小姐来到家里，说托托咬了她的腿，要把小狗带走。", duration: 8000, draw: drawFarmComplaint, music: musicKansas },
  { title: "托托跑回来了", text: "托托从篮子里逃出来，多罗西又高兴又害怕，决定先离家躲一躲。", duration: 7000, draw: drawTotoEscape, music: musicRoad },
  { title: "路上的魔法师", text: "旅行魔法师看出多罗西想离家出走，温柔地劝她赶快回家。", duration: 8000, draw: drawProfessorScene, music: musicCity },
  { title: "龙卷风来了", text: "多罗西赶回农场，大声喊艾伯母和亨利叔叔，可风暴已经逼近。", duration: 8000, draw: drawStorm, music: musicStorm },
  { title: "卧室里的梦境窗口", text: "窗外鸡窝、老奶奶、划船兄弟和骑车的高小姐一个个飘过，高小姐变成了坏女巫。", duration: 9000, draw: drawBedroomVisions, music: musicFlying },
  { title: "飞上云端", text: "小屋在云海里翻滚，月亮、星星、奶牛和飞天扫帚都从窗外掠过。", duration: 7000, draw: drawFlying, music: musicFlying },
  { title: "小人国和两位女巫", text: "好女巫从泡泡里出现，西方坏女巫也赶来；闪亮红鞋到了多罗西脚上。", duration: 9000, draw: drawMunchkinWitches, music: musicArrival },
  { title: "黄砖路上的伙伴", text: "稻草人想要脑子，铁皮人想要心，狮子想要勇气，大家一起去翡翠城。", duration: 9000, draw: drawRoad, music: musicRoad },
  { title: "打败西方坏女巫", text: "朋友们完成考验，西方坏女巫消失了，大家带着希望回到翡翠城。", duration: 7500, draw: drawWitchDefeat, music: musicStorm },
  { title: "翡翠城的秘密", text: "巫师帮伙伴们实现愿望，可他其实只是帘子后面一位普通老人。", duration: 8000, draw: drawCity, music: musicCity },
  { title: "热气球飞走了", text: "托托追着小猫跑开，多罗西刚抱回托托，热气球已经飞远。", duration: 8000, draw: drawBalloonMissed, music: musicPoppy },
  { title: "仙女从泡泡里回来", text: "好女巫告诉多罗西：回家的力量一直在她自己脚上。", duration: 8000, draw: drawGlindaReturn, music: musicArrival },
  { title: "红宝石鞋 · 回家", text: "多罗西敲三下鞋跟，说出心里的话：家里最温暖。", duration: 8500, draw: drawReturn, music: musicReturn },
  { title: "醒来以后", text: "多罗西在家里醒来，大家都在身边，她把梦里的朋友说给他们听。", duration: 7500, draw: drawHomeAwake, music: musicKansas },
];

let sceneIndex = 0;
let sceneStartedAt = performance.now();
let playing = false;
let pausedAt = sceneStartedAt;
let audioContext = null;
let lastSpokenScene = -1;

function getAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
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

function speakScene() {
  if (!("speechSynthesis" in window)) {
    lastSpokenScene = sceneIndex;
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(`${scenes[sceneIndex].title}。${scenes[sceneIndex].text}`);
  utterance.lang = "zh-CN";
  utterance.rate = 1.02;
  utterance.pitch = 1.08;
  utterance.volume = 0.85;
  window.speechSynthesis.speak(utterance);
  lastSpokenScene = sceneIndex;
}

function playNoise(start, duration, gainValue = 0.03) {
  const audio = getAudio();
  const bufferSize = Math.max(1, Math.floor(audio.sampleRate * duration));
  const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const noise = audio.createBufferSource();
  noise.buffer = buffer;
  const gain = audio.createGain();
  gain.gain.value = gainValue;
  noise.connect(gain);
  gain.connect(audio.destination);
  noise.start(audio.currentTime + start);
}

function musicKansas() {
  const m = [392, 440, 494, 523, 494, 440, 392, 349, 392, 440, 523, 587, 523, 440, 392];
  m.forEach((n, i) => playTone(n, i * 0.32, 0.28, 0.022));
  [196, 220, 247, 220].forEach((n, i) => playTone(n, i * 1.3, 1.1, 0.012, "triangle"));
}

function musicStorm() {
  playNoise(0, 4, 0.035);
  [110, 130, 116, 98].forEach((n, i) => playTone(n, i * 0.6, 0.9, 0.04, "sawtooth"));
  [220, 233, 196, 247].forEach((n, i) => playTone(n, i * 0.7 + 1.6, 0.4, 0.022, "square"));
}

function musicFlying() {
  [880, 988, 1046, 988, 880, 784, 880, 1046, 1175].forEach((n, i) => playTone(n, i * 0.32, 0.42, 0.018));
  [330, 392, 440, 523].forEach((n, i) => playTone(n, i * 0.8, 0.7, 0.014, "triangle"));
}

function musicArrival() {
  const m = [523, 659, 784, 1046, 784, 659, 523, 659, 784, 1046, 1175, 1046, 784, 659];
  m.forEach((n, i) => playTone(n, i * 0.28, 0.3, 0.022));
  [262, 330, 392, 523].forEach((n, i) => playTone(n, i * 0.6, 1.0, 0.014, "triangle"));
}

function musicRoad() {
  const m = [392, 523, 587, 523, 392, 523, 659, 523];
  for (let r = 0; r < 2; r++) m.forEach((n, i) => playTone(n, r * 2.6 + i * 0.32, 0.24, 0.02));
  [196, 196, 247, 247].forEach((n, i) => playTone(n, i * 0.65, 0.5, 0.013, "triangle"));
}

function musicPoppy() {
  const m = [523, 587, 494, 523, 440, 392, 440, 523];
  m.forEach((n, i) => playTone(n, i * 0.55, 0.7, 0.018));
  [1568, 1865, 1568, 2093, 1865].forEach((n, i) => playTone(n, 3.5 + i * 0.18, 0.14, 0.012));
}

function musicCity() {
  const m = [659, 784, 988, 1175, 988, 784, 659, 784, 988, 1175, 1318, 1175];
  m.forEach((n, i) => playTone(n, i * 0.26, 0.32, 0.02));
  for (let i = 0; i < 16; i++) playTone(1865 + Math.random() * 400, Math.random() * 3.2, 0.1, 0.008);
}

function musicReturn() {
  [1568, 1568, 1568].forEach((n, i) => playTone(n, i * 0.45, 0.32, 0.04));
  const m = [392, 440, 494, 523, 587, 523, 494, 440, 392];
  m.forEach((n, i) => playTone(n, 1.8 + i * 0.35, 0.32, 0.022));
  [262, 330, 392, 523].forEach((n, i) => playTone(n, 1.8 + i * 0.7, 0.7, 0.014, "triangle"));
}

function renderSceneList() {
  sceneList.innerHTML = "";
  scenes.forEach((scene, index) => {
    const item = document.createElement("li");
    item.className = index === sceneIndex ? "active" : "";
    item.textContent = `${index + 1}. ${scene.title}`;
    item.addEventListener("click", () => {
      setScene(index);
      if (playing && scenes[sceneIndex].music) scenes[sceneIndex].music();
      statusText.textContent = `切到第 ${sceneIndex + 1} 幕。`;
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
    if (scenes[sceneIndex].music) scenes[sceneIndex].music();
    speakScene();
  }
  statusText.textContent = "电影正在播放。";
}

function pauseMovie() {
  if (!playing) return;
  playing = false;
  pausedAt = performance.now();
  if ("speechSynthesis" in window) window.speechSynthesis.pause();
  statusText.textContent = "电影暂停了。";
}

function nextScene() {
  setScene(sceneIndex + 1);
  if (playing && scenes[sceneIndex].music) scenes[sceneIndex].music();
  if (playing) speakScene();
  statusText.textContent = "切到下一幕。";
}

function restartMovie() {
  setScene(0);
  playing = true;
  if (scenes[0].music) scenes[0].music();
  speakScene();
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
      if (scenes[sceneIndex].music) scenes[sceneIndex].music();
      speakScene();
    }
  }
  if (playing && lastSpokenScene !== sceneIndex) speakScene();
  requestAnimationFrame(loop);
}

// === Generic helpers ===
function sky(top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function ground(color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 470, W, 150);
  ctx.fillStyle = "rgba(23,38,50,0.14)";
  ctx.fillRect(0, 470, W, 6);
}

function lerpColor(c1, c2, t) {
  const a = parseInt(c1.slice(1), 16);
  const b = parseInt(c2.slice(1), 16);
  const r1 = (a >> 16) & 0xff, g1 = (a >> 8) & 0xff, b1 = a & 0xff;
  const r2 = (b >> 16) & 0xff, g2 = (b >> 8) & 0xff, b2 = b & 0xff;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

function drawCloud(x, y, scale = 1, color = "rgba(255,255,255,0.9)") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 24 * scale, 0, Math.PI * 2);
  ctx.arc(x + 28 * scale, y - 8 * scale, 30 * scale, 0, Math.PI * 2);
  ctx.arc(x + 62 * scale, y, 22 * scale, 0, Math.PI * 2);
  ctx.arc(x + 30 * scale, y + 12 * scale, 28 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawStars(clock, density) {
  for (let i = 0; i < density; i++) {
    const x = (i * 73) % W;
    const y = (i * 47) % 360;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(clock * 2 + i));
    ctx.fillStyle = `rgba(255,255,255,${tw})`;
    ctx.fillRect(x, y, 2, 2);
    if (i % 7 === 0) {
      ctx.fillRect(x - 2, y + 1, 6, 1);
      ctx.fillRect(x + 1, y - 1, 1, 4);
    }
  }
}

function drawMoon(x, y, r) {
  ctx.fillStyle = "#f7e7a8";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(60,40,20,0.18)";
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y - r * 0.2, r * 0.18, 0, Math.PI * 2);
  ctx.arc(x - r * 0.2, y + r * 0.3, r * 0.13, 0, Math.PI * 2);
  ctx.arc(x + r * 0.05, y + r * 0.15, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
}

function drawSparkles(clock, count, intensity) {
  for (let i = 0; i < count; i++) {
    const x = (i * 79 + Math.sin(clock + i) * 30) % W;
    const y = (i * 53 + clock * 40) % 450;
    const size = 1.5 + Math.sin(clock * 4 + i) * 1.5;
    if (size > 0.7) {
      ctx.fillStyle = `rgba(255,255,200,${intensity * 0.8})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${intensity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - size * 2, y); ctx.lineTo(x + size * 2, y);
      ctx.moveTo(x, y - size * 2); ctx.lineTo(x, y + size * 2);
      ctx.stroke();
    }
  }
}

function drawFarHills(color = "#79bd73") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.quadraticCurveTo(160, 360, 320, 470);
  ctx.quadraticCurveTo(520, 340, 720, 470);
  ctx.quadraticCurveTo(920, 360, 1080, 470);
  ctx.closePath();
  ctx.fill();
}

function drawFence(color = "#7b5a3a") {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  for (let x = 0; x < W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 430);
    ctx.lineTo(x + 38, 472);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.fillRect(0, 444, W, 8);
}

function drawFarmHouse(x, y, scale, wallColor = "#f4e0bb", roofColor = "#9b4c36") {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = wallColor;
  ctx.fillRect(0, 48, 120, 92);
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(-10, 48);
  ctx.lineTo(60, -10);
  ctx.lineTo(132, 48);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(22, 74, 24, 24);
  ctx.fillRect(76, 74, 24, 24);
  ctx.fillStyle = "rgba(255,240,180,0.5)";
  ctx.fillRect(24, 76, 9, 9);
  ctx.fillRect(78, 76, 9, 9);
  ctx.fillStyle = "#7b5a3a";
  ctx.fillRect(50, 104, 26, 36);
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(70, 122, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 48, 120, 92);
  ctx.restore();
}

function drawWindmill(x, y, scale, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#5b4528";
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(8, 0);
  ctx.lineTo(5, 110);
  ctx.lineTo(-5, 110);
  ctx.closePath();
  ctx.fill();
  ctx.rotate(clock * 0.6);
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate(i * Math.PI / 2);
    ctx.fillStyle = "#e8d4a0";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, -6);
    ctx.lineTo(52, -12);
    ctx.lineTo(54, 6);
    ctx.lineTo(10, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#7b5a3a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = "#7b5a3a";
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();
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
  ctx.fillRect(-18, -50, 36, 6);
  ctx.fillRect(-15, -56, 30, 8);
  // long brown hair and side braids
  ctx.fillRect(-20, -43, 8, 34);
  ctx.fillRect(12, -43, 8, 34);
  ctx.strokeStyle = "#6b4a2a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-16, -30);
  ctx.quadraticCurveTo(-28, -18, -24, 4);
  ctx.moveTo(16, -30);
  ctx.quadraticCurveTo(28, -18, 24, 4);
  ctx.stroke();
  ctx.fillStyle = "#73a8d9";
  ctx.fillRect(-17, -18, 34, 42);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-22, -18, 44, 12);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  for (let i = -20; i < 22; i += 6) ctx.fillRect(i, -10, 3, 30);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-8, 22); ctx.lineTo(-18, 48 + walk);
  ctx.moveTo(8, 22); ctx.lineTo(18, 48 - walk);
  ctx.moveTo(-17, -2); ctx.lineTo(-34, 10 - walk);
  ctx.moveTo(17, -2); ctx.lineTo(34, 10 + walk);
  ctx.stroke();
  ctx.fillStyle = "#d92e3a";
  ctx.beginPath();
  ctx.ellipse(-18, 48 + walk, 8, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(18, 48 - walk, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#172632";
  const blink = Math.sin(clock * 1.4) > 0.97 ? 1 : 5;
  ctx.fillRect(-7, -39, 5, blink);
  ctx.fillRect(5, -39, 5, blink);
  ctx.strokeStyle = "#a85a44";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -28, 3, 0.1, Math.PI - 0.1);
  ctx.stroke();
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
  // ear
  ctx.beginPath();
  ctx.moveTo(20, -10);
  ctx.lineTo(28, -18);
  ctx.lineTo(30, -8);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-18, 16, 7, 18);
  ctx.fillRect(10, 16, 7, 18);
  ctx.strokeStyle = "#2f2d2b";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-24, 6);
  ctx.quadraticCurveTo(-42 + Math.sin(clock * 12) * 4, -12, -48, 8);
  ctx.stroke();
  // eye and nose
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(26, -4, 3, 3);
  ctx.fillStyle = "#000";
  ctx.fillRect(33, 2, 3, 2);
  ctx.restore();
}

function drawTornado(x, y, scale, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "rgba(50,55,60,0.65)";
  ctx.lineWidth = 16;
  for (let i = 0; i < 9; i += 1) {
    const yy = -210 + i * 46;
    const width = 160 - i * 16;
    const shift = Math.sin(clock * 3 + i) * 14;
    ctx.beginPath();
    ctx.ellipse(shift, yy, width, 22, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // dust at base
  ctx.fillStyle = "rgba(80,80,80,0.4)";
  ctx.beginPath();
  ctx.ellipse(0, 230, 200, 24, 0, 0, Math.PI * 2);
  ctx.fill();
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
  // body pole
  ctx.strokeStyle = "#7b5a3a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -50); ctx.lineTo(0, 42);
  ctx.moveTo(-42, -12); ctx.lineTo(42, -12);
  ctx.stroke();
  // straw arms
  ctx.strokeStyle = "#d7a249";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-42, -12); ctx.lineTo(-50 + Math.sin(clock + i) * 2, -4 + i * 2);
    ctx.moveTo(42, -12); ctx.lineTo(50 - Math.sin(clock + i) * 2, -4 + i * 2);
    ctx.stroke();
  }
  // burlap head
  ctx.fillStyle = "#d7a249";
  ctx.beginPath();
  ctx.arc(0, -62, 20, 0, Math.PI * 2);
  ctx.fill();
  // face stitches
  ctx.strokeStyle = "#5a3825";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-8, -64); ctx.lineTo(-3, -64);
  ctx.moveTo(3, -64); ctx.lineTo(8, -64);
  ctx.moveTo(-6, -54); ctx.quadraticCurveTo(0, -49, 6, -54);
  ctx.stroke();
  // shirt
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(-18, -42, 36, 48);
  // patch
  ctx.fillStyle = "#d94a78";
  ctx.fillRect(-12, -30, 8, 8);
  // hat
  ctx.fillStyle = "#9b6a3c";
  ctx.fillRect(-28, -86, 56, 14);
  ctx.beginPath();
  ctx.moveTo(-20, -86);
  ctx.lineTo(0, -114);
  ctx.lineTo(20, -86);
  ctx.closePath();
  ctx.fill();
  // straw poking out of hat
  ctx.strokeStyle = "#d7a249";
  ctx.lineWidth = 2;
  for (let i = -15; i <= 15; i += 5) {
    ctx.beginPath();
    ctx.moveTo(i, -82); ctx.lineTo(i + 1, -76);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTinPerson(x, y, clock) {
  ctx.save();
  ctx.translate(x, y);
  // body
  ctx.fillStyle = "#b7c2c9";
  ctx.fillRect(-22, -68, 44, 76);
  // rivets
  ctx.fillStyle = "#5a6a72";
  for (const [bx, by] of [[-16, -60], [12, -60], [-16, -20], [12, -20], [-16, 0], [12, 0]]) {
    ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2); ctx.fill();
  }
  // head
  ctx.fillStyle = "#b7c2c9";
  ctx.beginPath();
  ctx.arc(0, -92, 20, 0, Math.PI * 2);
  ctx.fill();
  // funnel hat
  ctx.fillStyle = "#87939b";
  ctx.fillRect(-14, -118, 28, 8);
  ctx.beginPath();
  ctx.moveTo(-10, -118);
  ctx.lineTo(0, -134);
  ctx.lineTo(10, -118);
  ctx.closePath();
  ctx.fill();
  // face
  ctx.fillStyle = "#172632";
  ctx.fillRect(-7, -97, 3, 4);
  ctx.fillRect(4, -97, 3, 4);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -86, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // heart shape on chest
  ctx.fillStyle = "#d92e3a";
  const hx = 0, hy = -40;
  ctx.beginPath();
  ctx.arc(hx - 4, hy, 4, 0, Math.PI * 2);
  ctx.arc(hx + 4, hy, 4, 0, Math.PI * 2);
  ctx.moveTo(hx - 7, hy + 1);
  ctx.lineTo(hx, hy + 10);
  ctx.lineTo(hx + 7, hy + 1);
  ctx.fill();
  // arms / legs
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
  // mane
  ctx.fillStyle = "#b56f36";
  ctx.beginPath();
  ctx.arc(0, -54, 34, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 12; i++) {
    const ang = i * Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * 34, -54 + Math.sin(ang) * 34);
    ctx.lineTo(Math.cos(ang) * 42, -54 + Math.sin(ang) * 42);
    ctx.lineTo(Math.cos(ang + 0.2) * 34, -54 + Math.sin(ang + 0.2) * 34);
    ctx.closePath();
    ctx.fill();
  }
  // face
  ctx.fillStyle = "#d7a249";
  ctx.beginPath();
  ctx.arc(0, -54, 22, 0, Math.PI * 2);
  ctx.fill();
  // big sad eyes
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-7, -56, 5, 0, Math.PI * 2); ctx.arc(7, -56, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.beginPath(); ctx.arc(-7, -55, 2.5, 0, Math.PI * 2); ctx.arc(7, -55, 2.5, 0, Math.PI * 2); ctx.fill();
  // nose
  ctx.fillStyle = "#5a3825";
  ctx.beginPath();
  ctx.moveTo(0, -47); ctx.lineTo(-3, -42); ctx.lineTo(3, -42); ctx.closePath(); ctx.fill();
  // body
  ctx.fillStyle = "#b56f36";
  ctx.beginPath();
  ctx.ellipse(0, 0, 42, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-28, 16, 10, 34);
  ctx.fillRect(18, 16, 10, 34);
  // tail
  ctx.strokeStyle = "#b56f36";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-38, -2);
  ctx.quadraticCurveTo(-72 + Math.sin(clock * 4) * 6, -24, -68, 8);
  ctx.stroke();
  ctx.fillStyle = "#d7a249";
  ctx.beginPath();
  ctx.arc(-68 + Math.sin(clock * 4) * 2, 8, 5, 0, Math.PI * 2);
  ctx.fill();
  // tear (cowardly)
  if (Math.sin(clock * 0.7) > 0) {
    ctx.fillStyle = "rgba(120,200,255,0.85)";
    ctx.beginPath();
    ctx.moveTo(-9, -50);
    ctx.lineTo(-12, -42);
    ctx.lineTo(-6, -42);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawSpeech(text, x, y) {
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  ctx.roundRect(x, y, 130, 44, 12);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 44);
  ctx.lineTo(x + 26, y + 56);
  ctx.lineTo(x + 36, y + 44);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "bold 17px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, x + 65, y + 28);
  ctx.textAlign = "left";
}

// === Scene 1: Kansas (sepia farm) ===
function drawKansas(t, clock) {
  sky("#d4b88e", "#f0deb4");
  drawCloud(120 + t * 30, 105, 0.85, "rgba(255,250,235,0.7)");
  // ominous cloud creeping in from the right
  const doom = 0.35 + t * 0.35;
  drawCloud(950 - t * 40, 110, 1.3, `rgba(120,110,90,${doom})`);
  drawCloud(880 - t * 50, 80, 1.0, `rgba(150,135,110,${doom})`);
  // sepia hills
  ctx.fillStyle = "#a89265";
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.quadraticCurveTo(300, 410, 600, 460);
  ctx.quadraticCurveTo(900, 410, 1080, 470);
  ctx.lineTo(1080, 470);
  ctx.closePath();
  ctx.fill();
  ground("#b69a64");
  drawFence();
  drawWindmill(180, 360, 1, clock);
  drawFarmHouse(820, 338, 1, "#d8b88a", "#7b3a26");
  // wheat tufts
  ctx.fillStyle = "#9a824a";
  for (let i = 0; i < 50; i++) {
    const x = (i * 24 + Math.sin(clock + i) * 4);
    ctx.fillRect(x, 510 + (i % 3) * 12, 2, 12);
  }
  // dust
  ctx.fillStyle = "rgba(180,160,120,0.4)";
  for (let i = 0; i < 24; i++) {
    const x = ((i * 97 + clock * 60) % (W + 80)) - 40;
    const y = 450 + Math.sin(clock * 1.2 + i) * 20 + (i % 5) * 8;
    ctx.beginPath();
    ctx.ellipse(x, y, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  drawDorothy(380 + t * 100, 436, 1, clock);
  drawToto(450 + t * 100, 454, 1, clock);
  drawWindLeaves(t * 0.5, clock);
}

// === Scene 2: Storm ===
function drawStorm(t, clock) {
  const topR = 74 - t * 30, topG = 85 - t * 35, topB = 96 - t * 35;
  sky(`rgb(${topR},${topG},${topB})`, `rgb(${125 - t * 30},${133 - t * 30},${144 - t * 30})`);
  // lightning flashes
  const flash = Math.sin(clock * 13 + Math.cos(clock * 2)) > 0.95 ? Math.random() * 0.7 : 0;
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,240,${flash})`;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 3;
    let lx = 200 + Math.random() * 680;
    let ly = 0;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    while (ly < 380) {
      lx += (Math.random() - 0.5) * 50;
      ly += 30 + Math.random() * 30;
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();
  }
  drawCloud(150, 100, 1.4, "rgba(50,55,65,0.85)");
  drawCloud(380, 80, 1.6, "rgba(40,45,55,0.9)");
  drawCloud(680, 95, 1.5, "rgba(45,50,60,0.85)");
  drawCloud(960, 110, 1.3, "rgba(50,55,65,0.8)");
  ground("#6f7a55");
  drawTornado(560 + Math.sin(clock * 1.5) * 15, 340, 1.2 + t * 0.4, clock);
  const shake = Math.sin(clock * 30) * t * 4;
  drawFarmHouse(120 + shake, 338, 1, "#d8b88a", "#7b3a26");
  drawDorothy(280, 436, 1, clock);
  drawToto(345, 454, 1, clock);
  // debris
  for (let i = 0; i < 60; i += 1) {
    const x = ((i * 47 + clock * 280) % (W + 80)) - 40;
    const y = 80 + Math.sin(clock * 3 + i) * 200 + (i % 8) * 40;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(clock * 5 + i);
    if (i % 4 === 0) { ctx.fillStyle = "#7b5a3a"; ctx.fillRect(-14, -3, 28, 6); }
    else if (i % 4 === 1) { ctx.fillStyle = "#5a7a3a"; ctx.fillRect(-7, -2, 14, 4); }
    else if (i % 4 === 2) { ctx.fillStyle = "#c9a87a"; ctx.fillRect(-5, -5, 10, 10); }
    else {
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
      ctx.stroke();
    }
    ctx.restore();
  }
  // rain streaks
  ctx.strokeStyle = "rgba(180,200,220,0.55)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 80; i++) {
    const x = (i * 19 + clock * 80) % W;
    const y = (i * 37 + clock * 400) % H;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 6, y + 16);
    ctx.stroke();
  }
}

// === Scene 3: Flying through clouds ===
function drawFlying(t, clock) {
  sky("#0d1b3d", "#1a2f56");
  drawStars(clock, 90);
  drawMoon(220, 130, 50);
  // swirling clouds
  for (let i = 0; i < 7; i++) {
    const angle = clock * 0.4 + i;
    const cx = W / 2 + Math.cos(angle) * (200 + i * 30);
    const cy = 350 + Math.sin(angle) * 120;
    drawCloud(cx, cy, 0.9 + i * 0.05, `rgba(180,190,210,${0.35 - i * 0.03})`);
  }
  // house spinning in center
  ctx.save();
  ctx.translate(W / 2, 320 + Math.sin(clock * 1.5) * 30);
  ctx.rotate(clock * 1.2 + t * Math.PI * 2);
  drawFarmHouse(-60, -62, 1, "#d8b88a", "#7b3a26");
  ctx.restore();
  // witch silhouette flying past
  const witchT = (clock * 0.18) % 1;
  const wx = 1100 - witchT * 1300;
  const wy = 180 + Math.sin(witchT * 6) * 30;
  drawWitchSilhouette(wx, wy, clock);
  // flying cow
  const cowT = ((clock * 0.13) + 0.3) % 1;
  drawFlyingCow(80 + cowT * 900, 460 - cowT * 320, clock);
  // orbiting debris
  for (let i = 0; i < 22; i++) {
    const a = clock * 1.2 + i * 0.3;
    const r = 240 + (i % 5) * 30 + Math.sin(clock + i) * 20;
    const x = W / 2 + Math.cos(a) * r;
    const y = 320 + Math.sin(a) * r * 0.7;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a * 2);
    ctx.fillStyle = i % 2 ? "#7b5a3a" : "#5a7a3a";
    ctx.fillRect(-10, -2, 20, 4);
    ctx.restore();
  }
}

function drawWitchSilhouette(x, y, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.15);
  // broomstick
  ctx.strokeStyle = "rgba(40,25,10,0.95)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-36, 12); ctx.lineTo(36, -4);
  ctx.stroke();
  ctx.fillStyle = "rgba(120,90,40,0.95)";
  for (let i = 0; i < 8; i++) ctx.fillRect(30 - i, -6 + i * 1.4, 10, 1);
  // body in cape
  ctx.fillStyle = "rgba(0,0,0,0.9)";
  ctx.beginPath();
  ctx.ellipse(-4, -2, 14, 24, Math.PI * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-18, -2);
  ctx.lineTo(-6, -18);
  ctx.lineTo(8, -16);
  ctx.lineTo(0, 8);
  ctx.closePath();
  ctx.fill();
  // pointy hat
  ctx.beginPath();
  ctx.moveTo(-10, -22);
  ctx.lineTo(15, -54);
  ctx.lineTo(8, -18);
  ctx.closePath();
  ctx.fill();
  // brim
  ctx.fillRect(-14, -22, 28, 3);
  ctx.restore();
}

function drawFlyingCow(x, y, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(clock * 2) * 0.3);
  ctx.fillStyle = "#f3f0e8";
  ctx.beginPath();
  ctx.ellipse(0, 0, 32, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2f2f2f";
  ctx.beginPath();
  ctx.ellipse(-12, -4, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(10, 3, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f3f0e8";
  ctx.beginPath();
  ctx.arc(-26, -8, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9b8050";
  ctx.fillRect(-32, -20, 3, 6);
  ctx.fillRect(-22, -20, 3, 6);
  ctx.fillStyle = "#172632";
  ctx.fillRect(-30, -10, 2, 2);
  ctx.strokeStyle = "#f3f0e8";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const lx = -16 + i * 10;
    ctx.beginPath();
    ctx.moveTo(lx, 12);
    ctx.lineTo(lx + Math.sin(clock * 6 + i) * 6, 28);
    ctx.stroke();
  }
  ctx.restore();
}

// === Scene 4: Arrival in Oz (sepia → color transition) ===
function drawArrival(t, clock) {
  const skyT = Math.min(1, t / 0.5);
  const top = lerpColor("#d4b88e", "#9edcff", skyT);
  const bot = lerpColor("#f0deb4", "#fff3c8", skyT);
  sky(top, bot);
  if (t > 0.3) drawRainbow(540, 700, 380 + (1 - (t - 0.3) / 0.7) * 60, Math.min(1, (t - 0.3) / 0.4));
  const hillColor = lerpColor("#a89265", "#5fb070", skyT);
  ctx.fillStyle = hillColor;
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.quadraticCurveTo(220, 360, 440, 460);
  ctx.quadraticCurveTo(660, 350, 880, 460);
  ctx.quadraticCurveTo(1000, 410, 1080, 470);
  ctx.lineTo(1080, 470);
  ctx.closePath();
  ctx.fill();
  ground(lerpColor("#b69a64", "#65c46a", skyT));
  if (t > 0.4) {
    const mt = Math.min(1, (t - 0.4) / 0.5);
    drawMunchkinHouse(140, 422, mt, "#c0392b");
    drawMunchkinHouse(940, 412, mt, "#3498db");
    if (t > 0.65) drawMunchkinHouse(840, 432, Math.min(1, (t - 0.65) / 0.25), "#f39c12");
  }
  drawFarmHouse(490, 360, 0.85, "#d8b88a", "#7b3a26");
  // door opens
  if (t > 0.5) {
    ctx.fillStyle = "#2a1a10";
    ctx.fillRect(490 + 49, 360 + 100, 22 * Math.min(1, (t - 0.5) * 4), 30);
  }
  if (t > 0.6) {
    drawDorothy(490 + 90, 432, 1, clock);
    drawToto(490 + 150, 452, 1, clock);
  }
  drawBloomingFlowers(t, clock);
  if (t > 0.3) drawSparkles(clock, 35, (t - 0.3));
}

function drawRainbow(cx, cy, r, alpha) {
  const colors = ["#ff6b6b", "#ff9f43", "#feca57", "#1dd1a1", "#54a0ff", "#5f27cd"];
  for (let i = 0; i < colors.length; i++) {
    ctx.strokeStyle = colors[i];
    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, r - i * 14, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawMunchkinHouse(x, y, t, capColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(t, t);
  ctx.fillStyle = "#f0d0a0";
  ctx.fillRect(-25, 0, 50, 50);
  ctx.fillStyle = capColor;
  ctx.beginPath();
  ctx.arc(0, 0, 40, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(-18, -16, 5, 0, Math.PI * 2);
  ctx.arc(12, -22, 4, 0, Math.PI * 2);
  ctx.arc(20, -8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a3825";
  ctx.fillRect(-10, 20, 20, 30);
  // window
  ctx.fillStyle = "#fffacc";
  ctx.fillRect(-22, 8, 9, 9);
  ctx.fillRect(13, 8, 9, 9);
  ctx.strokeStyle = "#5a3825";
  ctx.lineWidth = 1;
  ctx.strokeRect(-22, 8, 9, 9);
  ctx.strokeRect(13, 8, 9, 9);
  ctx.restore();
}

function drawBloomingFlowers(t, clock) {
  const colors = ["#ff6b9d", "#feca57", "#a55eea", "#ee5a6f", "#5f27cd", "#1dd1a1"];
  for (let i = 0; i < 64; i++) {
    const x = 30 + i * 17;
    const baseY = 535 + Math.sin(i * 1.3) * 15;
    const bloomT = Math.max(0, Math.min(1, t * 2.2 - i / 64));
    if (bloomT <= 0) continue;
    const size = 6 * bloomT;
    ctx.fillStyle = colors[i % colors.length];
    for (let p = 0; p < 5; p++) {
      const ang = p * (Math.PI * 2 / 5) + clock * 0.5;
      ctx.beginPath();
      ctx.arc(x + Math.cos(ang) * size * 0.7, baseY + Math.sin(ang) * size * 0.7, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.arc(x, baseY, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#39a657";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, baseY + size);
    ctx.lineTo(x, baseY + size + 16);
    ctx.stroke();
  }
}

// === Scene 5: Yellow brick road with friends joining ===
function drawRoad(t, clock) {
  sky("#bde7ff", "#fff0c8");
  drawFarHills();
  ground("#65b96b");
  drawYellowBrickRoad(1);
  drawMunchkinFlowers();
  // trees in background
  drawTree(60, 440, 0.9);
  drawTree(990, 430, 1.1);
  // characters walking
  const baseX = 220 + t * 80;
  drawDorothy(baseX, 430, 1, clock);
  drawToto(baseX + 60, 454, 1, clock);
  if (t > 0.18) {
    drawScarecrow(baseX + 160, 420, clock);
    if (t > 0.2 && t < 0.42) drawSpeech("我想要脑子!", baseX + 90, 280);
  }
  if (t > 0.42) {
    drawTinPerson(baseX + 290, 416, clock);
    if (t > 0.44 && t < 0.66) drawSpeech("我想要颗心!", baseX + 220, 280);
  }
  if (t > 0.68) {
    drawLion(baseX + 410, 436, clock);
    if (t > 0.7 && t < 0.92) drawSpeech("我想要勇气!", baseX + 340, 290);
  }
  drawFarmHouse(80, 348, 0.55, "#d8b88a", "#7b3a26");
}

function drawTree(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#5a3825";
  ctx.fillRect(-6, 0, 12, 50);
  ctx.fillStyle = "#39a657";
  ctx.beginPath();
  ctx.arc(0, -10, 30, 0, Math.PI * 2);
  ctx.arc(-20, 0, 22, 0, Math.PI * 2);
  ctx.arc(20, 0, 22, 0, Math.PI * 2);
  ctx.arc(0, -30, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d92e3a";
  ctx.beginPath(); ctx.arc(-12, -5, 4, 0, Math.PI * 2); ctx.arc(15, -18, 4, 0, Math.PI * 2); ctx.arc(-2, -30, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// === Scene 6: Poppy field ===
function drawPoppy(t, clock) {
  sky("#9ec5ff", "#ffe2d4");
  drawFarHills("#69b569");
  ground("#5fa05f");
  drawYellowBrickRoad(1);
  // sea of red poppies
  for (let i = 0; i < 140; i++) {
    const x = ((i * 31) % W) + (i % 7);
    const y = 500 + Math.sin(i * 0.7) * 20 + (i % 6) * 8;
    drawSinglePoppy(x, y);
  }
  // dreamy pink haze
  ctx.fillStyle = `rgba(255,180,180,${0.1 + Math.min(t, 0.55) * 0.25})`;
  ctx.fillRect(0, 0, W, H);
  // falling petals
  for (let i = 0; i < 36; i++) {
    const x = (i * 43 + clock * 50) % W;
    const y = ((i * 27 + clock * 70) % H);
    ctx.fillStyle = "#ee3344";
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(clock + i);
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // characters slumping then waking
  const slump = t < 0.6 ? t : Math.max(0, 0.6 - (t - 0.6) * 1.6);
  drawDorothy(280, 430 + slump * 28, 1, clock);
  drawToto(345, 454, 1, clock);
  drawScarecrow(460, 420, clock);
  drawTinPerson(620, 416, clock);
  drawLion(770, 436 + slump * 28, clock);
  if (slump > 0.15 && t < 0.6) {
    ctx.fillStyle = "#172632";
    ctx.font = "bold 24px serif";
    ctx.fillText("Z", 300 + Math.sin(clock * 2) * 4, 380 - slump * 28);
    ctx.fillText("z", 312, 365 - slump * 28);
    ctx.font = "bold 18px serif";
    ctx.fillText("z", 795, 395 - slump * 28);
  }
  if (t > 0.55) {
    const snowT = (t - 0.55) / 0.45;
    for (let i = 0; i < 80; i++) {
      const x = (i * 23 + clock * 30) % W;
      const y = ((i * 41 + clock * 80) % H);
      ctx.fillStyle = `rgba(255,255,255,${snowT * 0.9})`;
      ctx.beginPath();
      ctx.arc(x, y, 2 + Math.abs(Math.sin(clock + i)), 0, Math.PI * 2);
      ctx.fill();
    }
    drawSpeech("雪花叫醒了大家", 430, 300);
  }
}

function drawSinglePoppy(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#39a657";
  ctx.fillRect(-1, 4, 2, 12);
  ctx.fillStyle = "#d92e3a";
  for (let p = 0; p < 4; p++) {
    ctx.save();
    ctx.rotate(p * Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(0, -3, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#2c1810";
  ctx.beginPath();
  ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// === Scene 7: Emerald City + Wizard reveal ===
function drawCity(t, clock) {
  sky("#7fd8b3", "#c7ffe0");
  ctx.fillStyle = "#3fa86b";
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.quadraticCurveTo(540, 380, 1080, 470);
  ctx.lineTo(1080, 470);
  ctx.closePath();
  ctx.fill();
  ground("#3a9054");
  drawYellowBrickRoad(1);
  drawGrandEmeraldCity(540, 270, t, clock);
  drawScarecrow(180, 432, clock);
  drawDorothy(260, 440, 0.95, clock);
  drawToto(320, 458, 0.95, clock);
  drawTinPerson(380, 428, clock);
  drawLion(450, 446, clock);
  if (t > 0.4) drawWizardHead(W / 2 + 230, 200, (t - 0.4) / 0.6, clock);
  // curtain pull at end revealing the little man
  if (t > 0.78) {
    const ct = (t - 0.78) / 0.22;
    drawCurtainReveal(W / 2 + 230, 280, ct);
  }
  drawSparkles(clock, 55, 0.7 + Math.sin(clock * 2) * 0.2);
}

function drawGrandEmeraldCity(cx, baseY, t, clock) {
  const pulse = 0.85 + Math.sin(clock * 3) * 0.12;
  const grad = ctx.createRadialGradient(cx, baseY, 50, cx, baseY, 320);
  grad.addColorStop(0, `rgba(80,255,150,${0.45 * pulse})`);
  grad.addColorStop(1, "rgba(60,255,140,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(cx - 320, baseY - 200, 640, 520);
  const towers = [
    { x: -200, h: 160, w: 48 },
    { x: -120, h: 240, w: 60 },
    { x: -30, h: 330, w: 84 },
    { x: 70, h: 270, w: 70 },
    { x: 160, h: 200, w: 55 },
    { x: -240, h: 120, w: 40 },
    { x: 240, h: 140, w: 45 },
  ];
  for (const tw of towers) {
    const x = cx + tw.x;
    const y = baseY - tw.h;
    ctx.fillStyle = `rgba(46,184,90,${pulse})`;
    ctx.fillRect(x - tw.w / 2, y, tw.w, tw.h + 200);
    ctx.fillStyle = `rgba(80,210,110,${pulse})`;
    ctx.beginPath();
    ctx.moveTo(x - tw.w / 2 - 5, y);
    ctx.lineTo(x, y - 28);
    ctx.lineTo(x + tw.w / 2 + 5, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d4ff95";
    ctx.fillRect(x - 2, y - 32, 4, 6);
    ctx.fillStyle = `rgba(255,255,180,${0.55 + Math.sin(clock * 4 + x) * 0.3})`;
    for (let wy = y + 20; wy < y + tw.h; wy += 28) {
      ctx.fillRect(x - 7, wy, 14, 14);
    }
  }
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "bold 26px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("翡翠城 · EMERALD CITY", cx, baseY + 80);
  ctx.textAlign = "left";
}

function drawWizardHead(x, y, t, clock) {
  const float = Math.sin(clock * 2) * 8;
  ctx.save();
  ctx.translate(x, y + float);
  ctx.globalAlpha = t * 0.9;
  // smoke
  for (let i = 0; i < 8; i++) {
    const ang = clock * 0.6 + i;
    ctx.fillStyle = "rgba(120,200,140,0.3)";
    ctx.beginPath();
    ctx.arc(Math.cos(ang) * 80, Math.sin(ang) * 60 + 50, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#5fcf85";
  ctx.beginPath();
  ctx.ellipse(0, 0, 60, 78, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#48a268";
  ctx.beginPath();
  ctx.ellipse(0, 25, 50, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  // glowing eyes
  ctx.fillStyle = `rgba(255,255,180,${0.7 + Math.sin(clock * 6) * 0.3})`;
  ctx.beginPath();
  ctx.arc(-22, -12, 9, 0, Math.PI * 2);
  ctx.arc(22, -12, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2c4030";
  ctx.beginPath();
  ctx.arc(-22, -12, 3, 0, Math.PI * 2);
  ctx.arc(22, -12, 3, 0, Math.PI * 2);
  ctx.fill();
  // brows
  ctx.strokeStyle = "#2c4030";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, -25); ctx.lineTo(-14, -22);
  ctx.moveTo(14, -22); ctx.lineTo(30, -25);
  ctx.stroke();
  // mouth
  ctx.beginPath();
  ctx.moveTo(-22, 18);
  ctx.quadraticCurveTo(0, 34, 22, 18);
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawCurtainReveal(x, y, t) {
  // curtain opens to show a little old man
  ctx.save();
  ctx.translate(x, y);
  // booth frame
  ctx.fillStyle = "#5a3825";
  ctx.fillRect(-60, -20, 120, 6);
  ctx.fillRect(-60, -20, 6, 100);
  ctx.fillRect(54, -20, 6, 100);
  // curtain pulling apart
  const open = t * 50;
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(-54, -14, 50 - open, 90);
  ctx.fillRect(4 + open, -14, 50 - open, 90);
  // little man revealed
  if (t > 0.3) {
    ctx.globalAlpha = Math.min(1, (t - 0.3) * 3);
    // body
    ctx.fillStyle = "#3a6090";
    ctx.fillRect(-14, 20, 28, 40);
    // head
    ctx.fillStyle = "#f0bb87";
    ctx.beginPath();
    ctx.arc(0, 8, 14, 0, Math.PI * 2);
    ctx.fill();
    // mustache
    ctx.strokeStyle = "#7b5a3a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, 12); ctx.lineTo(8, 12);
    ctx.stroke();
    // glasses
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-5, 6, 3, 0, Math.PI * 2);
    ctx.arc(5, 6, 3, 0, Math.PI * 2);
    ctx.moveTo(-2, 6); ctx.lineTo(2, 6);
    ctx.stroke();
    // surprised eyebrows
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-9, 1); ctx.lineTo(-1, -1);
    ctx.moveTo(1, -1); ctx.lineTo(9, 1);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// === Scene 8: Ruby slippers / return home ===
function drawReturn(t, clock) {
  if (t < 0.5) {
    sky("#7fd8b3", "#c7ffe0");
    ground("#3a9054");
    // sparkle whirlwind
    const mt = t / 0.5;
    ctx.save();
    ctx.translate(W / 2, 350);
    for (let i = 0; i < 80; i++) {
      const angle = clock * 4 + i * 0.4;
      const r = 50 + (i % 10) * 28 * mt;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r * 0.7;
      const sz = 2 + mt * 4;
      const c = i % 3;
      const col = c === 0 ? `rgba(255,80,100,${0.5 + mt * 0.4})` :
                  c === 1 ? `rgba(255,200,80,${0.5 + mt * 0.4})` :
                            `rgba(255,255,255,${0.5 + mt * 0.4})`;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    drawDorothy(W / 2, 436, 1.15, clock);
    drawToto(W / 2 + 70, 454, 1, clock);
    drawRubySlippers(W / 2, 480, mt, clock);
    // 3 click bursts
    const clicks = [0.13, 0.27, 0.41];
    clicks.forEach((time) => {
      if (t > time && t < time + 0.06) {
        const k = (t - time) / 0.06;
        ctx.fillStyle = `rgba(255,80,100,${1 - k})`;
        ctx.beginPath();
        ctx.arc(W / 2, 488, 30 + k * 220, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,200,${1 - k})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(W / 2, 488, 30 + k * 260, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    if (t > 0.42) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, (t - 0.42) / 0.08)})`;
      ctx.fillRect(0, 0, W, H);
    }
  } else {
    const ht = (t - 0.5) / 0.5;
    sky("#ffcfae", "#fff1d1");
    ground("#b9a46b");
    drawCloud(150, 92, 0.85);
    drawCloud(880, 110, 0.7);
    drawFarmHouse(700, 336, 1, "#d8b88a", "#7b3a26");
    drawFence();
    drawWindmill(180, 360, 1, clock);
    drawDorothy(460, 436, 1, clock);
    drawToto(525, 456, 1, clock);
    if (ht > 0.15) drawAuntEm(380, 416, ht);
    if (ht < 0.18) {
      ctx.fillStyle = `rgba(255,255,255,${1 - ht / 0.18})`;
      ctx.fillRect(0, 0, W, H);
    }
    drawSparkles(clock, 18, 0.5);
    if (ht > 0.45) drawSpeech("家最温暖 ❤", 430, 290);
    // little hearts floating up
    for (let i = 0; i < 6; i++) {
      const hx = 440 + i * 18;
      const hy = 360 - ((clock * 30 + i * 25) % 200);
      const alpha = 1 - ((clock * 30 + i * 25) % 200) / 200;
      ctx.fillStyle = `rgba(217,46,58,${alpha * 0.6})`;
      drawHeart(hx, hy, 6);
    }
  }
}

function drawHeart(x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.6);
  ctx.bezierCurveTo(x + s, y - s * 0.3, x + s * 1.5, y + s * 0.5, x, y + s * 1.6);
  ctx.bezierCurveTo(x - s * 1.5, y + s * 0.5, x - s, y - s * 0.3, x, y + s * 0.6);
  ctx.fill();
}

function drawRubySlippers(cx, y, glow, clock) {
  for (const sx of [cx - 14, cx + 14]) {
    ctx.save();
    ctx.translate(sx, y);
    const click = Math.sin(clock * 8) > 0.7 ? -2 : 0;
    ctx.translate(0, click);
    ctx.fillStyle = "#d92e3a";
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a01020";
    ctx.fillRect(6, -2, 4, 6);
    ctx.fillStyle = `rgba(255,200,200,${0.6 + Math.sin(clock * 6) * 0.4})`;
    ctx.beginPath();
    ctx.arc(-2, -2, 3, 0, Math.PI * 2);
    ctx.fill();
    if (glow > 0.2) {
      ctx.strokeStyle = `rgba(255,80,100,${glow * 0.6})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawAuntEm(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = Math.min(1, (t - 0.15) * 4);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 60, 30, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9b6a3c";
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.lineTo(-30, 60);
  ctx.lineTo(30, 60);
  ctx.lineTo(22, 0);
  ctx.closePath();
  ctx.fill();
  // apron
  ctx.fillStyle = "#f4e0bb";
  ctx.beginPath();
  ctx.moveTo(-14, 4);
  ctx.lineTo(-20, 58);
  ctx.lineTo(20, 58);
  ctx.lineTo(14, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f0bb87";
  ctx.beginPath();
  ctx.arc(0, -15, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a87b4a";
  ctx.beginPath();
  ctx.arc(0, -28, 12, 0, Math.PI * 2);
  ctx.fill();
  // gray streaks
  ctx.strokeStyle = "#c0c0c0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -32); ctx.lineTo(-6, -22);
  ctx.moveTo(6, -32); ctx.lineTo(10, -22);
  ctx.stroke();
  // smile
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -10, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.fillRect(-7, -19, 3, 3);
  ctx.fillRect(4, -19, 3, 3);
  // open arms
  ctx.strokeStyle = "#f0bb87";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-20, 6); ctx.lineTo(-50, 20);
  ctx.moveTo(20, 6); ctx.lineTo(50, 20);
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;
}

// === Expanded story scenes ===
function drawRunFromGulch(t, clock) {
  sky("#d4b88e", "#f0deb4");
  ground("#b69a64");
  drawFence();
  drawWindmill(150, 360, 0.9, clock);
  drawFarmHouse(790, 338, 1, "#d8b88a", "#7b3a26");
  drawGulchHouse(60, 356, 0.82);
  const runX = 160 + t * 430;
  drawMissGulch(86 + t * 42, 428, 0.92, clock, true);
  drawDorothy(runX, 436, 1.05, clock * 1.6);
  drawToto(runX + 70, 456, 1.05, clock * 1.6);
  drawSpeech("请帮帮托托!", runX - 36, 308);
  if (t > 0.58) {
    drawAuntEm(660, 410, 1);
    drawUncleHenry(724, 414, 1);
  }
  drawWindLeaves(t, clock);
}

function drawFarmComplaint(t, clock) {
  sky("#d8c098", "#f0deb4");
  ground("#b69a64");
  drawFence();
  drawFarmHouse(90, 338, 1.08, "#d8b88a", "#7b3a26");
  drawAuntEm(360, 410, 1);
  drawUncleHenry(438, 414, 1);
  drawDorothy(548, 438, 1, clock);
  drawToto(610, 458, 1, clock);
  const gx = 780 - Math.min(1, t * 1.8) * 160;
  drawMissGulch(gx, 430, 1, clock, false);
  if (t < 0.48) {
    drawSpeech("这只狗咬了我!", gx - 72, 300);
  } else if (t < 0.78) {
    drawDogBasket(gx - 36, 464, 1, true);
    drawSpeech("我要把它带走。", gx - 88, 300);
  } else {
    drawDogBasket(620 + t * 170, 464, 1, true);
    drawSpeech("托托!", 500, 306);
  }
}

function drawTotoEscape(t, clock) {
  sky("#d4b88e", "#f0deb4");
  ground("#b69a64");
  drawFence();
  drawFarmHouse(760, 338, 0.95, "#d8b88a", "#7b3a26");
  const basketX = 130 + t * 190;
  drawDogBasket(basketX, 462, 1, t < 0.28);
  if (t >= 0.22) drawToto(240 + t * 210, 454, 1.08, clock * 1.6);
  drawDorothy(520, 436, 1, clock);
  if (t < 0.45) drawSpeech("你回来了!", 452, 305);
  else drawSpeech("我们先离开一会儿。", 430, 305);
  if (t > 0.55) {
    drawRoadSign(710, 418, "去远方");
    drawDorothy(650 + t * 120, 438, 0.95, clock * 1.4);
    drawToto(710 + t * 120, 456, 0.95, clock * 1.4);
  }
}

function drawProfessorScene(t, clock) {
  sky("#c7b28a", "#f0deb4");
  ground("#b69a64");
  drawFence("#8b6b3f");
  drawProfessorWagon(610, 380, 1, clock);
  drawProfessor(650, 418, 1);
  drawDorothy(310 + t * 90, 436, 1, clock);
  drawToto(370 + t * 90, 456, 1, clock);
  if (t < 0.45) {
    drawSpeech("我们要去很远的地方。", 286, 302);
  } else {
    drawSpeech("我猜你真正想回家。", 558, 286);
    drawSpeech("艾伯母会担心。", 602, 342);
  }
  if (t > 0.68) drawRoadSign(205, 420, "回家");
}

function drawBedroomVisions(t, clock) {
  sky("#7b8793", "#d3c3a8");
  // room wall
  ctx.fillStyle = "#d8c8a8";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#b99b72";
  ctx.fillRect(0, 470, W, 150);
  // window
  ctx.fillStyle = "#172632";
  ctx.fillRect(350, 70, 380, 250);
  ctx.fillStyle = "#8da5bd";
  ctx.fillRect(366, 86, 348, 218);
  ctx.strokeStyle = "#f4e0bb";
  ctx.lineWidth = 8;
  ctx.strokeRect(360, 80, 360, 230);
  ctx.beginPath();
  ctx.moveTo(540, 82); ctx.lineTo(540, 310);
  ctx.moveTo(362, 195); ctx.lineTo(718, 195);
  ctx.stroke();
  drawCloud(410 + Math.sin(clock) * 20, 120, 0.7, "rgba(70,75,85,0.7)");
  drawCloud(585, 156, 0.85, "rgba(50,55,65,0.65)");
  const phase = Math.floor(t * 5);
  const local = (t * 5) % 1;
  if (phase === 0) {
    drawChickenCoop(430 + local * 160, 235, 0.9);
    drawSpeech("咯咯!", 430 + local * 160, 124);
  } else if (phase === 1) {
    drawGrandmaKnitting(450 + local * 130, 246, 0.86);
  } else if (phase === 2) {
    drawBoatBrothers(405 + local * 170, 252, 0.85);
  } else if (phase === 3) {
    drawMissGulch(455 + local * 110, 242, 0.68, clock, true);
    drawBicycle(420 + local * 110, 276, 0.68);
  } else {
    drawWitchTransform(515, 232, local, clock);
  }
  // bed and sleeping Dorothy
  drawBed(310, 438, 1);
  drawDorothyInBed(386, 410, clock);
  drawToto(486, 430, 0.9, clock);
  if (t < 0.28) drawSpeech("艾伯母!", 280, 270);
  if (t > 0.65) drawSpeech("托托, 你看!", 430, 330);
  // bump line
  if (t < 0.12) {
    ctx.strokeStyle = "#d92e3a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(390, 344, 24 + Math.sin(clock * 8) * 4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawMunchkinWitches(t, clock) {
  sky("#9edcff", "#fff3c8");
  drawRainbow(540, 690, 380, 0.9);
  drawFarHills();
  ground("#65c46a");
  drawMunchkinHouse(120, 424, 1, "#c0392b");
  drawMunchkinHouse(940, 414, 1, "#3498db");
  drawMunchkinHouse(820, 436, 1, "#f39c12");
  drawBloomingFlowers(1, clock);
  drawDorothy(505, 434, 1.02, clock);
  drawToto(574, 456, 1, clock);
  drawMunchkins(clock);
  if (t < 0.34) {
    drawGlindaBubble(300 + t * 300, 235, t / 0.34, clock);
    drawSpeech("你是好女巫吗?", 408, 206);
  } else if (t < 0.62) {
    drawGlinda(500, 372, 1, clock);
    drawSpeech("我只是普通女孩。", 430, 235);
    drawRubySlippers(514, 478, 1, clock);
  } else {
    drawGlinda(420, 372, 1, clock);
    drawBadWitch(700, 372, 1, clock);
    drawRubySlippers(514, 478, 1, clock);
    drawSpeech("红鞋已经在你脚上。", 382, 230);
    drawSpeech("谁动了我的家人?", 632, 228);
  }
}

function drawWitchDefeat(t, clock) {
  sky("#6e7688", "#c9d5d8");
  ground("#4f7a55");
  drawDarkCastle(720, 330, 1);
  drawDorothy(260, 438, 1, clock);
  drawToto(324, 456, 1, clock);
  drawScarecrow(420, 420, clock);
  drawTinPerson(550, 416, clock);
  drawLion(680, 436, clock);
  const melt = Math.min(1, Math.max(0, (t - 0.32) / 0.5));
  if (t < 0.28) {
    drawBadWitch(800, 402, 1, clock);
    drawSpeech("我们一起保护朋友!", 300, 280);
  } else {
    drawBadWitch(800, 402 + melt * 86, 1 - melt * 0.6, clock);
    drawWaterSplash(760, 455, melt, clock);
    drawSpeech("坏女巫消失了!", 692, 280);
  }
}

function drawBalloonMissed(t, clock) {
  sky("#9edcff", "#dcffe6");
  ground("#3a9054");
  drawGrandEmeraldCity(520, 270, 0.8, clock);
  drawDorothy(280, 438, 1, clock);
  drawToto(360 + Math.sin(clock * 3) * 12, 456, 1, clock);
  drawCat(470 + Math.sin(clock * 5) * 18, 456, 0.9, clock);
  drawProfessor(650, 420, 0.9);
  const fly = Math.min(1, Math.max(0, (t - 0.28) / 0.72));
  drawHotAirBalloon(770 + fly * 180, 330 - fly * 230, 1, clock);
  if (t < 0.35) drawSpeech("托托别追猫!", 244, 300);
  else if (t < 0.65) drawSpeech("热气球等等!", 620, 255);
  else drawSpeech("已经飞走了...", 260, 300);
}

function drawGlindaReturn(t, clock) {
  sky("#9edcff", "#fff3c8");
  drawFarHills();
  ground("#65c46a");
  drawGrandEmeraldCity(540, 260, 1, clock);
  drawMunchkins(clock);
  drawDorothy(350, 438, 1, clock);
  drawToto(416, 456, 1, clock);
  drawScarecrow(530, 420, clock);
  drawTinPerson(650, 416, clock);
  drawLion(780, 436, clock);
  const appear = Math.min(1, t / 0.4);
  drawGlindaBubble(760, 236, appear, clock);
  if (t > 0.34) {
    drawGlinda(760, 374, 1, clock);
    drawSpeech("你自己就能回家。", 650, 222);
  }
  if (t > 0.62) {
    drawRubySlippers(352, 482, 1, clock);
    drawSpeech("敲三下，说心里的家。", 246, 262);
  }
}

function drawHomeAwake(t, clock) {
  sky("#ffcfae", "#fff1d1");
  ground("#b9a46b");
  drawFarmHouse(705, 336, 1.02, "#d8b88a", "#7b3a26");
  drawFence();
  drawAuntEm(360, 416, 1);
  drawUncleHenry(438, 420, 1);
  drawProfessor(520, 420, 0.85);
  drawDorothy(610, 438, 1.04, clock);
  drawToto(676, 456, 1.04, clock);
  drawSpeech("我回来了!", 562, 302);
  if (t > 0.42) drawSpeech("家里最温暖。", 500, 248);
  drawSparkles(clock, 20, 0.45);
}

function drawGulchHouse(x, y, scale) {
  drawFarmHouse(x, y, scale, "#b49a80", "#4c2a2a");
  ctx.fillStyle = "#172632";
  ctx.font = `bold ${14 * scale}px system-ui`;
  ctx.fillText("高小姐家", x + 16 * scale, y + 158 * scale);
}

function drawMissGulch(x, y, scale, clock, riding = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (riding) drawBicycle(-8, 25, 1);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 58, 24, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.moveTo(-18, -18);
  ctx.lineTo(-30, 50);
  ctx.lineTo(28, 50);
  ctx.lineTo(18, -18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f0bb87";
  ctx.beginPath();
  ctx.arc(0, -42, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(-18, -60, 36, 9);
  ctx.beginPath();
  ctx.moveTo(-10, -60);
  ctx.lineTo(0, -86);
  ctx.lineTo(10, -60);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -45); ctx.lineTo(-2, -45);
  ctx.moveTo(4, -45); ctx.lineTo(8, -45);
  ctx.moveTo(-5, -34); ctx.lineTo(8, -36);
  ctx.stroke();
  ctx.restore();
}

function drawBicycle(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-28, 20, 18, 0, Math.PI * 2);
  ctx.arc(28, 20, 18, 0, Math.PI * 2);
  ctx.moveTo(-28, 20); ctx.lineTo(0, 0); ctx.lineTo(28, 20); ctx.lineTo(-10, 20); ctx.lineTo(0, 0);
  ctx.moveTo(0, 0); ctx.lineTo(8, -18);
  ctx.moveTo(8, -18); ctx.lineTo(26, -20);
  ctx.stroke();
  ctx.restore();
}

function drawUncleHenry(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = Math.min(1, t);
  ctx.fillStyle = "#5a7a3a";
  ctx.fillRect(-16, -18, 32, 62);
  ctx.fillStyle = "#7b5a3a";
  ctx.fillRect(-24, -48, 48, 10);
  ctx.fillStyle = "#f0bb87";
  ctx.beginPath();
  ctx.arc(0, -34, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8b6b3f";
  ctx.fillRect(-10, -50, 20, 8);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -28, 6, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawDogBasket(x, y, scale, hasDog) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#9b6a3c";
  ctx.beginPath();
  ctx.roundRect(-28, -20, 56, 38, 8);
  ctx.fill();
  ctx.strokeStyle = "#5a3825";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -18, 26, Math.PI, 0);
  ctx.stroke();
  if (hasDog) drawToto(0, -20, 0.55, 0);
  ctx.restore();
}

function drawRoadSign(x, y, text) {
  ctx.fillStyle = "#7b5a3a";
  ctx.fillRect(x, y, 8, 62);
  ctx.fillStyle = "#f4e0bb";
  ctx.fillRect(x - 38, y - 26, 86, 32);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 38, y - 26, 86, 32);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 15px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, x + 5, y - 5);
  ctx.textAlign = "left";
}

function drawProfessorWagon(x, y, scale, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#7b5a3a";
  ctx.fillRect(-90, -52, 170, 76);
  ctx.fillStyle = "#f4e0bb";
  ctx.fillRect(-68, -32, 54, 34);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 15px system-ui";
  ctx.fillText("旅行魔法师", -58, -10);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-60, 32, 22, 0, Math.PI * 2);
  ctx.arc(54, 32, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#9b6a3c";
  ctx.beginPath();
  ctx.moveTo(80, -22);
  ctx.quadraticCurveTo(118, -10, 110, 28);
  ctx.lineTo(76, 28);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawProfessor(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#334655";
  ctx.fillRect(-18, -20, 36, 58);
  ctx.fillStyle = "#f0bb87";
  ctx.beginPath();
  ctx.arc(0, -38, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-6, -40, 4, 0, Math.PI * 2);
  ctx.arc(6, -40, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-6, -40, 5, 0, Math.PI * 2);
  ctx.arc(6, -40, 5, 0, Math.PI * 2);
  ctx.moveTo(-1, -40); ctx.lineTo(1, -40);
  ctx.moveTo(-9, -30); ctx.lineTo(9, -30);
  ctx.stroke();
  ctx.fillStyle = "#7b5a3a";
  ctx.fillRect(-16, -62, 32, 10);
  ctx.beginPath();
  ctx.moveTo(-10, -62);
  ctx.lineTo(0, -82);
  ctx.lineTo(10, -62);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBed(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#7b5a3a";
  ctx.fillRect(-86, -20, 184, 34);
  ctx.fillRect(-92, -72, 12, 96);
  ctx.fillRect(90, -72, 12, 96);
  ctx.fillStyle = "#f4e0bb";
  ctx.fillRect(-70, -56, 72, 30);
  ctx.fillStyle = "#73a8d9";
  ctx.fillRect(-18, -52, 100, 58);
  ctx.restore();
}

function drawDorothyInBed(x, y, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.08);
  ctx.fillStyle = "#f0bb87";
  ctx.beginPath();
  ctx.arc(0, 0, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6b4a2a";
  ctx.fillRect(-20, -8, 40, 8);
  ctx.fillStyle = "#172632";
  ctx.fillRect(-6, -4, 4, 2);
  ctx.fillRect(5, -4, 4, 2);
  ctx.strokeStyle = "#a85a44";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 8, 4, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.restore();
}

function drawChickenCoop(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#9b6a3c";
  ctx.fillRect(-42, -18, 84, 44);
  ctx.fillStyle = "#7b3a26";
  ctx.beginPath();
  ctx.moveTo(-50, -18);
  ctx.lineTo(0, -58);
  ctx.lineTo(50, -18);
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 3; i++) drawChicken(-24 + i * 24, 36, 0.7);
  ctx.restore();
}

function drawChicken(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
  ctx.arc(16, -6, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d92e3a";
  ctx.beginPath();
  ctx.arc(16, -16, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f39c12";
  ctx.beginPath();
  ctx.moveTo(23, -7);
  ctx.lineTo(34, -4);
  ctx.lineTo(23, -1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGrandmaKnitting(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#9b6a3c";
  ctx.fillRect(-36, 0, 72, 58);
  ctx.fillStyle = "#7b4dc5";
  ctx.fillRect(-24, -18, 48, 54);
  ctx.fillStyle = "#f0bb87";
  ctx.beginPath();
  ctx.arc(0, -36, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.arc(-8, -44, 8, 0, Math.PI * 2);
  ctx.arc(8, -44, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffd15f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-34, 0); ctx.lineTo(10, 18);
  ctx.moveTo(34, 0); ctx.lineTo(-10, 18);
  ctx.stroke();
  drawSpeech("我在织衣服", -78, -105);
  ctx.restore();
}

function drawBoatBrothers(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(-78, 26, 156, 42);
  ctx.fillStyle = "#9b6a3c";
  ctx.beginPath();
  ctx.moveTo(-62, 22);
  ctx.lineTo(62, 22);
  ctx.lineTo(42, 52);
  ctx.lineTo(-42, 52);
  ctx.closePath();
  ctx.fill();
  drawTinyPerson(-24, 8, "#39a657");
  drawTinyPerson(24, 8, "#d94a78");
  ctx.strokeStyle = "#7b5a3a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-40, 0); ctx.lineTo(-70, 44);
  ctx.moveTo(40, 0); ctx.lineTo(70, 44);
  ctx.stroke();
  drawSpeech("我们在划船!", -70, -86);
  ctx.restore();
}

function drawTinyPerson(x, y, color) {
  ctx.fillStyle = "#f0bb87";
  ctx.beginPath();
  ctx.arc(x, y - 18, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillRect(x - 9, y - 8, 18, 28);
}

function drawWitchTransform(x, y, t, clock) {
  if (t < 0.5) {
    ctx.globalAlpha = 1 - t * 1.4;
    drawMissGulch(x, y + 22, 0.72, clock, true);
    drawBicycle(x - 38, y + 74, 0.72);
    ctx.globalAlpha = 1;
  }
  ctx.globalAlpha = Math.min(1, Math.max(0, (t - 0.25) * 1.5));
  drawBadWitch(x + 10, y + 120, 0.74 + t * 0.28, clock);
  ctx.globalAlpha = 1;
  if (t > 0.45) drawSpeech("脸变绿了!", x - 64, y - 34);
}

function drawGlindaBubble(x, y, appear, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = appear;
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(255,220,255,${0.34 + i * 0.08})`;
    ctx.lineWidth = 4 - i * 0.5;
    ctx.beginPath();
    ctx.arc(Math.sin(clock + i) * 7, Math.cos(clock + i) * 5, 48 + i * 14, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawGlinda(x, y, scale, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#f6b7d8";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(-42, 70);
  ctx.lineTo(42, 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f0bb87";
  ctx.beginPath();
  ctx.arc(0, -42, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f5d36a";
  ctx.beginPath();
  ctx.arc(0, -63, 22, Math.PI, 0);
  ctx.lineTo(30, -63);
  ctx.lineTo(0, -98);
  ctx.lineTo(-30, -63);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#ffd15f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(26, -8); ctx.lineTo(72, -60);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.beginPath();
  ctx.arc(74, -62, 10 + Math.sin(clock * 3) * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBadWitch(x, y, scale, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.moveTo(-28, -20);
  ctx.lineTo(-44, 72);
  ctx.lineTo(44, 72);
  ctx.lineTo(28, -20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#42a85b";
  ctx.beginPath();
  ctx.arc(0, -42, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(-30, -62, 60, 9);
  ctx.beginPath();
  ctx.moveTo(-14, -62);
  ctx.lineTo(0, -106);
  ctx.lineTo(14, -62);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, -46); ctx.lineTo(-3, -46);
  ctx.moveTo(4, -46); ctx.lineTo(9, -46);
  ctx.moveTo(-7, -35); ctx.quadraticCurveTo(0, -30, 8, -35);
  ctx.stroke();
  ctx.strokeStyle = "#9b6a3c";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-54, 28);
  ctx.lineTo(54, 14);
  ctx.stroke();
  ctx.restore();
}

function drawMunchkins(clock) {
  const colors = ["#d94a78", "#39a657", "#ffd15f", "#245b8f", "#7b4dc5"];
  for (let i = 0; i < 10; i++) {
    const x = 70 + i * 94;
    const y = 470 + Math.sin(clock * 3 + i) * 4;
    drawTinyPerson(x, y, colors[i % colors.length]);
    ctx.fillStyle = "#172632";
    ctx.font = "bold 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("小人国", x, y + 36);
    ctx.textAlign = "left";
  }
}

function drawDarkCastle(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#33313b";
  ctx.fillRect(-100, 20, 200, 160);
  [-70, 0, 70].forEach((tx) => {
    ctx.fillRect(tx - 22, -40, 44, 220);
    ctx.beginPath();
    ctx.moveTo(tx - 28, -40);
    ctx.lineTo(tx, -82);
    ctx.lineTo(tx + 28, -40);
    ctx.closePath();
    ctx.fill();
  });
  ctx.fillStyle = "#ffd15f";
  ctx.fillRect(-18, 96, 36, 84);
  ctx.restore();
}

function drawWaterSplash(x, y, t, clock) {
  ctx.fillStyle = `rgba(80,180,255,${0.7 * t})`;
  ctx.beginPath();
  ctx.ellipse(x, y, 40 + t * 80, 18 + t * 20, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(x + Math.cos(i) * t * 90, y - Math.sin(i * 2) * t * 60, 3 + t * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHotAirBalloon(x, y, scale, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#d94a78";
  ctx.beginPath();
  ctx.ellipse(0, -80, 54, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -148); ctx.quadraticCurveTo(-20, -80, 0, -12);
  ctx.moveTo(0, -148); ctx.quadraticCurveTo(20, -80, 0, -12);
  ctx.stroke();
  ctx.strokeStyle = "#7b5a3a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-32, -24); ctx.lineTo(-22, 20);
  ctx.moveTo(32, -24); ctx.lineTo(22, 20);
  ctx.stroke();
  ctx.fillStyle = "#9b6a3c";
  ctx.fillRect(-32, 14, 64, 38);
  ctx.fillStyle = "#f4e0bb";
  ctx.font = "bold 12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("回家号", 0, 38);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawCat(x, y, scale, clock) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#f4e0bb";
  ctx.beginPath();
  ctx.ellipse(0, 10, 24, 12, 0, 0, Math.PI * 2);
  ctx.arc(24, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(18, -10); ctx.lineTo(22, -22); ctx.lineTo(27, -10);
  ctx.moveTo(28, -10); ctx.lineTo(34, -22); ctx.lineTo(35, -8);
  ctx.fill();
  ctx.strokeStyle = "#f4e0bb";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-24, 6);
  ctx.quadraticCurveTo(-48, -18 + Math.sin(clock * 5) * 5, -54, 10);
  ctx.stroke();
  ctx.restore();
}

playBtn.addEventListener("click", playMovie);
pauseBtn.addEventListener("click", pauseMovie);
nextBtn.addEventListener("click", nextScene);
restartBtn.addEventListener("click", restartMovie);

renderSceneList();
updateText();
requestAnimationFrame(loop);
