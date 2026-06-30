const canvas = document.querySelector("#returnOzCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;
const sceneCount = document.querySelector("#sceneCount");
const speakerName = document.querySelector("#speakerName");
const lineText = document.querySelector("#lineText");
const statusText = document.querySelector("#statusText");
const playBtn = document.querySelector("#playBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const nextBtn = document.querySelector("#nextBtn");
const restartBtn = document.querySelector("#restartBtn");
const sceneList = document.querySelector("#sceneList");

const scenes = [
  {
    title: "翡翠钥匙发光",
    duration: 9500,
    draw: drawBedroom,
    music: musicMystery,
    lines: [
      { speaker: "多罗西", text: "托托，你听见了吗？翡翠城好像在叫我回去。" },
      { speaker: "托托", text: "汪！汪！门后面有绿色的光。" },
      { speaker: "多罗西", text: "那就走吧。这一次，我要自己看清楚发生了什么。" }
    ]
  },
  {
    title: "破碎黄砖路",
    duration: 10000,
    draw: drawBrokenRoad,
    music: musicWind,
    lines: [
      { speaker: "多罗西", text: "这里真的是奥兹国吗？黄砖路怎么断了？" },
      { speaker: "机械守卫", text: "报告：翡翠城沉睡中。请给我上发条，我才能带路。" },
      { speaker: "多罗西", text: "别怕，我帮你。咔哒，咔哒，醒来吧！" }
    ]
  },
  {
    title: "机械守卫醒来",
    duration: 9500,
    draw: drawClockwork,
    music: musicClock,
    lines: [
      { speaker: "机械守卫", text: "谢谢你，小旅行家。我的齿轮又会唱歌了。" },
      { speaker: "多罗西", text: "你知道谁把城市变成灰色了吗？" },
      { speaker: "机械守卫", text: "石头国王拿走了颜色。我们要去钟塔找线索。" }
    ]
  },
  {
    title: "南瓜朋友在塔顶",
    duration: 10500,
    draw: drawPumpkinTower,
    music: musicGentle,
    lines: [
      { speaker: "南瓜朋友", text: "喂！下面的人，我卡在塔顶了！" },
      { speaker: "多罗西", text: "抓住绳子，我们拉你下来。" },
      { speaker: "南瓜朋友", text: "太好了。我虽然头是南瓜，可我胆子很大。" }
    ]
  },
  {
    title: "轮子人冲过来",
    duration: 9000,
    draw: drawWheelers,
    music: musicChase,
    lines: [
      { speaker: "轮子队长", text: "站住！谁允许你们把绿色带回来？" },
      { speaker: "多罗西", text: "我们不是来打架的，我们要把城市修好。" },
      { speaker: "机械守卫", text: "建议：立刻向左跑。轮子人的刹车不好用。" }
    ]
  },
  {
    title: "会说话的宫殿",
    duration: 10500,
    draw: drawPalace,
    music: musicCity,
    lines: [
      { speaker: "宫殿大门", text: "只有勇敢说真话的人，才能进翡翠大厅。" },
      { speaker: "多罗西", text: "真话就是：我很害怕，可我还是要帮朋友。" },
      { speaker: "宫殿大门", text: "回答通过。请进入。" }
    ]
  },
  {
    title: "石头国王的考验",
    duration: 11000,
    draw: drawStoneKing,
    music: musicDanger,
    lines: [
      { speaker: "石头国王", text: "颜色太吵了，灰色才安静。你为什么要带它回来？" },
      { speaker: "多罗西", text: "因为朋友需要笑，城市需要光，回家的路也需要颜色。" },
      { speaker: "南瓜朋友", text: "而且灰色配不上我的南瓜头！" }
    ]
  },
  {
    title: "翡翠城醒来",
    duration: 10500,
    draw: drawCityAwake,
    music: musicFinale,
    lines: [
      { speaker: "机械守卫", text: "报告：颜色恢复。翡翠城重新启动。" },
      { speaker: "多罗西", text: "奥兹国，下次别一个人硬撑。要记得叫朋友。" },
      { speaker: "托托", text: "汪！现在可以回家吃晚饭了吗？" }
    ]
  }
];

let sceneIndex = 0;
let sceneStartedAt = performance.now();
let playing = false;
let pausedAt = sceneStartedAt;
let currentLineIndex = 0;
let spokenKey = "";
let audioContext = null;

function getAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(freq, start, duration, gainValue = 0.022, type = "sine") {
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
  osc.stop(audio.currentTime + start + duration + 0.05);
}

function playNoise(start, duration, gainValue = 0.025) {
  const audio = getAudio();
  const bufferSize = Math.max(1, Math.floor(audio.sampleRate * duration));
  const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const noise = audio.createBufferSource();
  const gain = audio.createGain();
  noise.buffer = buffer;
  gain.gain.value = gainValue;
  noise.connect(gain);
  gain.connect(audio.destination);
  noise.start(audio.currentTime + start);
}

function musicMystery() {
  [392, 466, 523, 622, 523, 466, 392].forEach((n, i) => playTone(n, i * 0.42, 0.5, 0.018, "triangle"));
  [196, 233, 262].forEach((n, i) => playTone(n, i * 1.15, 1.0, 0.012));
}

function musicWind() {
  playNoise(0, 3.2, 0.03);
  [147, 165, 175, 196, 175, 147].forEach((n, i) => playTone(n, i * 0.44, 0.55, 0.02, "sawtooth"));
}

function musicClock() {
  for (let i = 0; i < 14; i++) playTone(i % 2 ? 784 : 1046, i * 0.18, 0.08, 0.015, "square");
  [262, 330, 392, 523].forEach((n, i) => playTone(n, 1.6 + i * 0.42, 0.5, 0.017));
}

function musicGentle() {
  [523, 587, 659, 784, 659, 587, 523].forEach((n, i) => playTone(n, i * 0.5, 0.55, 0.018));
}

function musicChase() {
  [196, 196, 220, 247, 262, 247, 220, 196].forEach((n, i) => playTone(n, i * 0.22, 0.2, 0.03, "square"));
  playNoise(0.5, 1.6, 0.018);
}

function musicCity() {
  [659, 784, 988, 1175, 988, 784, 659, 784].forEach((n, i) => playTone(n, i * 0.3, 0.32, 0.02));
}

function musicDanger() {
  [98, 110, 123, 98, 82].forEach((n, i) => playTone(n, i * 0.55, 0.7, 0.035, "sawtooth"));
  [392, 370, 349].forEach((n, i) => playTone(n, 2 + i * 0.3, 0.25, 0.018, "square"));
}

function musicFinale() {
  [523, 659, 784, 1046, 1175, 1046, 784, 659, 523].forEach((n, i) => playTone(n, i * 0.3, 0.35, 0.023));
  [262, 330, 392, 523].forEach((n, i) => playTone(n, i * 0.7, 0.75, 0.015, "triangle"));
}

function speakLine(line) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(`${line.speaker}说：${line.text}`);
  utterance.lang = "zh-CN";
  utterance.rate = line.speaker === "机械守卫" ? 0.92 : 1.02;
  utterance.pitch = line.speaker === "石头国王" ? 0.72 : line.speaker === "托托" ? 1.45 : 1.05;
  utterance.volume = 0.9;
  window.speechSynthesis.speak(utterance);
}

function lineForScene(scene, elapsed) {
  const each = scene.duration / scene.lines.length;
  return Math.min(scene.lines.length - 1, Math.floor(elapsed / each));
}

function updateDialogue(elapsed = 0) {
  const scene = scenes[sceneIndex];
  currentLineIndex = lineForScene(scene, elapsed);
  const line = scene.lines[currentLineIndex];
  sceneCount.textContent = `第 ${sceneIndex + 1} 幕 · ${scene.title}`;
  speakerName.textContent = line.speaker;
  lineText.textContent = line.text;
  const key = `${sceneIndex}-${currentLineIndex}`;
  if (playing && spokenKey !== key) {
    spokenKey = key;
    speakLine(line);
  }
}

function renderSceneList() {
  sceneList.innerHTML = "";
  scenes.forEach((scene, index) => {
    const item = document.createElement("li");
    item.className = index === sceneIndex ? "active" : "";
    item.textContent = `${index + 1}. ${scene.title}`;
    item.addEventListener("click", () => {
      setScene(index);
      if (playing) {
        scene.music();
        speakLine(scene.lines[0]);
        spokenKey = `${sceneIndex}-0`;
      }
    });
    sceneList.appendChild(item);
  });
}

function setScene(index) {
  sceneIndex = (index + scenes.length) % scenes.length;
  sceneStartedAt = performance.now();
  pausedAt = playing ? 0 : sceneStartedAt;
  currentLineIndex = 0;
  spokenKey = "";
  updateDialogue(0);
  renderSceneList();
}

function playMovie() {
  if (!playing) {
    playing = true;
    if (pausedAt) {
      sceneStartedAt += performance.now() - pausedAt;
      pausedAt = 0;
    }
    scenes[sceneIndex].music();
    spokenKey = "";
    updateDialogue(performance.now() - sceneStartedAt);
  }
  statusText.textContent = "短片正在播放，角色会自己说话。";
}

function pauseMovie() {
  if (!playing) return;
  playing = false;
  pausedAt = performance.now();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  statusText.textContent = "短片暂停了。";
}

function nextScene() {
  setScene(sceneIndex + 1);
  if (playing) scenes[sceneIndex].music();
  statusText.textContent = "切到下一幕。";
}

function restartMovie() {
  setScene(0);
  playing = true;
  scenes[0].music();
  spokenKey = "";
  updateDialogue(0);
  statusText.textContent = "从第一幕重新播放。";
}

function loop(now) {
  const scene = scenes[sceneIndex];
  const elapsed = playing ? now - sceneStartedAt : (pausedAt || now) - sceneStartedAt;
  const t = Math.max(0, Math.min(1, elapsed / scene.duration));
  updateDialogue(Math.max(0, elapsed));
  scene.draw(t, now / 1000);
  if (playing && elapsed >= scene.duration) {
    if (sceneIndex === scenes.length - 1) {
      playing = false;
      pausedAt = now;
      statusText.textContent = "短片播放完了。";
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

function ground(color = "#33463d") {
  ctx.fillStyle = color;
  ctx.fillRect(0, 474, W, 146);
}

function drawMoon(x, y, r) {
  ctx.fillStyle = "#fff4bc";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(25,42,53,0.28)";
  ctx.beginPath();
  ctx.arc(x + r * 0.35, y - r * 0.2, r * 0.9, 0, Math.PI * 2);
  ctx.fill();
}

function drawStar(x, y, s = 1) {
  ctx.fillStyle = "#ffe88a";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 ? 5 * s : 12 * s;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

function drawDorothy(x, y, s = 1, step = 0, speaking = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "#162531";
  ctx.lineWidth = 4;
  ctx.fillStyle = "#8b552e";
  ctx.beginPath();
  ctx.arc(-18, -55, 10, 0, Math.PI * 2);
  ctx.arc(18, -55, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f2c49c";
  ctx.beginPath();
  ctx.arc(0, -62, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#8b552e";
  ctx.fillRect(-25, -77, 50, 14);
  ctx.fillStyle = "#73a7d8";
  ctx.beginPath();
  ctx.moveTo(-28, -32);
  ctx.lineTo(28, -32);
  ctx.lineTo(40, 36);
  ctx.lineTo(-40, 36);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#f7f7f7";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14, -30);
  ctx.lineTo(-4, 28);
  ctx.moveTo(14, -30);
  ctx.lineTo(4, 28);
  ctx.stroke();
  ctx.strokeStyle = "#162531";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-28, -20);
  ctx.lineTo(-52, 10 + Math.sin(step) * 10);
  ctx.moveTo(28, -20);
  ctx.lineTo(52, 10 - Math.sin(step) * 10);
  ctx.moveTo(-14, 36);
  ctx.lineTo(-22, 76 + Math.sin(step) * 9);
  ctx.moveTo(14, 36);
  ctx.lineTo(24, 76 - Math.sin(step) * 9);
  ctx.stroke();
  ctx.fillStyle = "#162531";
  ctx.beginPath();
  ctx.arc(-9, -64, 3, 0, Math.PI * 2);
  ctx.arc(9, -64, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#9f2638";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -54, speaking ? 8 : 5, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

function drawToto(x, y, s = 1, bark = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "#2a2520";
  ctx.fillRect(-24, -16, 46, 24);
  ctx.beginPath();
  ctx.arc(28, -18, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1512";
  ctx.beginPath();
  ctx.arc(18, -27, 8, 0, Math.PI * 2);
  ctx.arc(36, -28, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2a2520";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-22, -7);
  ctx.lineTo(-42, -28 + (bark ? -5 : 0));
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(33, -19, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawClockworkGuard(x, y, s = 1, arm = 0, speaking = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "#162531";
  ctx.lineWidth = 5;
  ctx.fillStyle = "#c9a348";
  ctx.fillRect(-34, -70, 68, 86);
  ctx.strokeRect(-34, -70, 68, 86);
  ctx.fillStyle = "#f5d66b";
  ctx.beginPath();
  ctx.arc(0, -95, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#162531";
  ctx.fillRect(-10, -110, 7, 7);
  ctx.fillRect(8, -110, 7, 7);
  if (speaking) ctx.fillRect(-10, -94, 20, 8);
  else ctx.fillRect(-8, -94, 16, 4);
  ctx.strokeStyle = "#755f27";
  for (let i = 0; i < 8; i++) {
    const a = arm + i * Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(Math.cos(a) * 17, -28 + Math.sin(a) * 17);
    ctx.stroke();
  }
  ctx.strokeStyle = "#162531";
  ctx.beginPath();
  ctx.moveTo(-34, -42);
  ctx.lineTo(-70, -18 + Math.sin(arm) * 12);
  ctx.moveTo(34, -42);
  ctx.lineTo(70, -18 - Math.sin(arm) * 12);
  ctx.moveTo(-16, 16);
  ctx.lineTo(-22, 70);
  ctx.moveTo(16, 16);
  ctx.lineTo(24, 70);
  ctx.stroke();
  ctx.restore();
}

function drawPumpkinFriend(x, y, s = 1, speaking = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "#162531";
  ctx.lineWidth = 5;
  ctx.strokeRect(-22, -40, 44, 78);
  ctx.fillStyle = "#f1922a";
  ctx.beginPath();
  ctx.ellipse(0, -70, 34, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#162531";
  ctx.beginPath();
  ctx.arc(-10, -74, 3, 0, Math.PI * 2);
  ctx.arc(10, -74, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -62, speaking ? 10 : 6, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "#315431";
  ctx.beginPath();
  ctx.moveTo(-21, -18);
  ctx.lineTo(-56, 10);
  ctx.moveTo(21, -18);
  ctx.lineTo(56, 10);
  ctx.stroke();
  ctx.restore();
}

function speechBubble(x, y, w, h, text) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "#162531";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#162531";
  ctx.font = "900 24px system-ui, sans-serif";
  wrapText(text, x + 16, y + 34, w - 32, 30);
  ctx.restore();
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  let line = "";
  for (const char of text) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}

function currentLine() {
  return scenes[sceneIndex].lines[currentLineIndex] || scenes[sceneIndex].lines[0];
}

function isSpeaking(name) {
  return currentLine().speaker === name;
}

function drawBedroom(t, time) {
  sky("#202c3a", "#31475a");
  drawMoon(870, 100, 52);
  for (let i = 0; i < 22; i++) drawStar(60 + i * 47, 55 + (i % 5) * 36, 0.45);
  ctx.fillStyle = "#8b6645";
  ctx.fillRect(0, 440, W, 180);
  ctx.fillStyle = "#f0d9b8";
  ctx.fillRect(130, 210, 290, 230);
  ctx.strokeStyle = "#162531";
  ctx.lineWidth = 5;
  ctx.strokeRect(130, 210, 290, 230);
  ctx.fillStyle = "#1e3d45";
  ctx.fillRect(690, 160, 210, 160);
  ctx.strokeRect(690, 160, 210, 160);
  ctx.fillStyle = `rgba(35, 206, 121, ${0.25 + 0.45 * Math.sin(time * 4) ** 2})`;
  ctx.fillRect(705, 175, 180, 130);
  drawDorothy(300, 415, 1, time * 5, isSpeaking("多罗西"));
  drawToto(520, 450, 1.15, isSpeaking("托托"));
  ctx.fillStyle = "#20c878";
  ctx.beginPath();
  ctx.arc(785, 240, 18 + Math.sin(time * 5) * 4, 0, Math.PI * 2);
  ctx.fill();
  speechBubble(70, 58, 430, 92, currentLine().text);
}

function drawBrokenRoad(t, time) {
  sky("#8ca2aa", "#d8caa2");
  ground("#4d5c45");
  ctx.fillStyle = "#f2c84f";
  for (let i = 0; i < 13; i++) {
    const x = 50 + i * 82;
    const y = 505 - Math.sin(i * 1.4) * 34;
    if (i % 4 !== 1) ctx.fillRect(x, y, 58, 28);
  }
  ctx.fillStyle = "#46695c";
  ctx.fillRect(760, 180, 160, 292);
  ctx.fillStyle = "#1f7756";
  ctx.fillRect(784, 215, 112, 108);
  ctx.strokeStyle = "#162531";
  ctx.lineWidth = 5;
  ctx.strokeRect(760, 180, 160, 292);
  drawDorothy(260, 440, 1, time * 5, isSpeaking("多罗西"));
  drawToto(365, 468, 0.95, isSpeaking("托托"));
  drawClockworkGuard(690, 440, 0.9, time * 4, isSpeaking("机械守卫"));
  speechBubble(72, 72, 500, 92, currentLine().text);
}

function drawClockwork(t, time) {
  sky("#2b4251", "#55706b");
  ground("#56624c");
  ctx.fillStyle = "#23353f";
  ctx.fillRect(0, 0, W, 620);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? "#2d7762" : "#234f4c";
    ctx.fillRect(60 + i * 126, 230 - i % 3 * 20, 90, 246 + i % 3 * 20);
  }
  ctx.fillStyle = "#f3c84f";
  ctx.beginPath();
  ctx.arc(540, 215, 82, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#162531";
  ctx.lineWidth = 8;
  ctx.stroke();
  drawClockworkGuard(540, 430, 1.25, time * 8, isSpeaking("机械守卫"));
  drawDorothy(270, 450, 0.95, time * 3, isSpeaking("多罗西"));
  speechBubble(615, 70, 395, 96, currentLine().text);
}

function drawPumpkinTower(t, time) {
  sky("#627f8e", "#f0cb84");
  ground("#6b764c");
  ctx.fillStyle = "#314d58";
  ctx.fillRect(650, 100, 170, 374);
  ctx.fillStyle = "#203943";
  ctx.fillRect(675, 130, 120, 34);
  ctx.fillRect(675, 210, 120, 34);
  ctx.fillRect(675, 290, 120, 34);
  ctx.strokeStyle = "#162531";
  ctx.lineWidth = 6;
  ctx.strokeRect(650, 100, 170, 374);
  drawPumpkinFriend(735, 125 + Math.sin(time * 2) * 8, 0.78, isSpeaking("南瓜朋友"));
  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(710, 178);
  ctx.lineTo(420, 430);
  ctx.stroke();
  drawDorothy(330, 448, 1, time * 3, isSpeaking("多罗西"));
  drawClockworkGuard(495, 452, 0.85, time * 5, isSpeaking("机械守卫"));
  speechBubble(80, 68, 490, 94, currentLine().text);
}

function drawWheelers(t, time) {
  sky("#455560", "#d7a46e");
  ground("#575144");
  for (let i = 0; i < 5; i++) {
    const x = 920 - t * 440 + i * 75;
    ctx.fillStyle = "#7d3f57";
    ctx.fillRect(x - 18, 378, 36, 68);
    ctx.fillStyle = "#e2c391";
    ctx.beginPath();
    ctx.arc(x, 358, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#162531";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x - 24, 455, 20, 0, Math.PI * 2);
    ctx.arc(x + 24, 455, 20, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawDorothy(245 - t * 55, 445, 1, time * 12, isSpeaking("多罗西"));
  drawToto(350 - t * 55, 470, 1, isSpeaking("托托"));
  drawClockworkGuard(460 - t * 55, 445, 0.92, time * 10, isSpeaking("机械守卫"));
  drawPumpkinFriend(570 - t * 55, 452, 0.88, isSpeaking("南瓜朋友"));
  speechBubble(70, 70, 530, 96, currentLine().text);
}

function drawPalace(t, time) {
  sky("#8ad9bd", "#d9f1cf");
  ground("#5d8c68");
  ctx.fillStyle = "#18a66f";
  ctx.fillRect(240, 185, 600, 289);
  ctx.fillStyle = "#0e765a";
  ctx.fillRect(330, 100, 120, 374);
  ctx.fillRect(630, 130, 120, 344);
  ctx.fillStyle = "#f3c84f";
  ctx.fillRect(470, 260, 140, 214);
  ctx.strokeStyle = "#162531";
  ctx.lineWidth = 7;
  ctx.strokeRect(240, 185, 600, 289);
  ctx.fillStyle = "#162531";
  ctx.beginPath();
  ctx.arc(510, 340, 9, 0, Math.PI * 2);
  ctx.arc(570, 340, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#162531";
  ctx.beginPath();
  ctx.arc(540, 375, isSpeaking("宫殿大门") ? 30 : 18, 0, Math.PI);
  ctx.stroke();
  drawDorothy(210, 458, 0.92, time * 3, isSpeaking("多罗西"));
  drawClockworkGuard(880, 454, 0.8, time * 5, isSpeaking("机械守卫"));
  speechBubble(385, 40, 440, 98, currentLine().text);
}

function drawStoneKing(t, time) {
  sky("#202936", "#4d4f53");
  ground("#4a4745");
  ctx.fillStyle = "#686a6c";
  ctx.fillRect(650, 150, 230, 320);
  ctx.fillStyle = "#53575a";
  ctx.beginPath();
  ctx.moveTo(650, 150);
  ctx.lineTo(765, 72);
  ctx.lineTo(880, 150);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#111920";
  ctx.beginPath();
  ctx.arc(730, 250, 14, 0, Math.PI * 2);
  ctx.arc(805, 250, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#111920";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(767, 315, isSpeaking("石头国王") ? 46 : 26, 0, Math.PI);
  ctx.stroke();
  const glow = ctx.createRadialGradient(330, 260, 20, 330, 260, 260);
  glow.addColorStop(0, "rgba(36,218,126,0.62)");
  glow.addColorStop(1, "rgba(36,218,126,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  drawDorothy(250, 450, 0.98, time * 3, isSpeaking("多罗西"));
  drawPumpkinFriend(385, 455, 0.88, isSpeaking("南瓜朋友"));
  drawClockworkGuard(500, 454, 0.8, time * 4, isSpeaking("机械守卫"));
  speechBubble(75, 58, 540, 100, currentLine().text);
}

function drawCityAwake(t, time) {
  sky("#89d9f0", "#e8f8d8");
  ground("#63a76a");
  for (let i = 0; i < 11; i++) {
    const h = 190 + (i % 4) * 34 + t * 60;
    ctx.fillStyle = i % 2 ? "#24a86e" : "#2ccf82";
    ctx.fillRect(80 + i * 90, 474 - h, 62, h);
    ctx.fillStyle = "#f3c84f";
    ctx.fillRect(95 + i * 90, 474 - h + 26, 16, 26);
    ctx.fillRect(120 + i * 90, 474 - h + 72, 16, 26);
  }
  for (let i = 0; i < 24; i++) drawStar(50 + i * 44, 70 + Math.sin(time + i) * 28, 0.55);
  drawDorothy(260, 452, 1, time * 3, isSpeaking("多罗西"));
  drawToto(355, 476, 0.96, isSpeaking("托托"));
  drawClockworkGuard(495, 452, 0.86, time * 6, isSpeaking("机械守卫"));
  drawPumpkinFriend(620, 454, 0.86, isSpeaking("南瓜朋友"));
  speechBubble(90, 62, 550, 96, currentLine().text);
}

playBtn.addEventListener("click", playMovie);
pauseBtn.addEventListener("click", pauseMovie);
nextBtn.addEventListener("click", nextScene);
restartBtn.addEventListener("click", restartMovie);

renderSceneList();
updateDialogue(0);
requestAnimationFrame(loop);
