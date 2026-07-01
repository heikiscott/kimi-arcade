const canvas = document.querySelector("#detectiveCanvas");
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
    title: "夜里的游乐场",
    duration: 9000,
    draw: drawAmusementNight,
    music: musicSuspense,
    lines: [
      { speaker: "少年侦探", text: "夜里的游乐场不对劲，钟楼下面有人在偷偷交换东西。" },
      { speaker: "同伴", text: "别过去！那里太暗了，我们先报警吧。" },
      { speaker: "少年侦探", text: "我只看一眼。真正的线索，往往藏在最安静的地方。" }
    ]
  },
  {
    title: "追踪黑影",
    duration: 9500,
    draw: drawShadowChase,
    music: musicChase,
    lines: [
      { speaker: "黑影甲", text: "有人跟来了，动作快点。" },
      { speaker: "少年侦探", text: "果然有问题！箱子里不是普通东西。" },
      { speaker: "黑影乙", text: "小侦探，知道太多可不是好事。" }
    ]
  },
  {
    title: "神秘糖豆",
    duration: 10000,
    draw: drawMysteryCandy,
    music: musicDanger,
    lines: [
      { speaker: "黑影乙", text: "这颗糖豆会让你睡一觉，醒来就没人认得出你。" },
      { speaker: "少年侦探", text: "你们逃不掉的，我已经记住了你们的声音。" },
      { speaker: "黑影甲", text: "那就让这座游乐场替我们保守秘密。" }
    ]
  },
  {
    title: "身体开始变小",
    duration: 10500,
    draw: drawShrinkEffect,
    music: musicShrink,
    lines: [
      { speaker: "少年侦探", text: "怎么回事？我的袖子变长了，鞋子也像船一样大！" },
      { speaker: "心里的声音", text: "冷静，先呼吸。记忆还在，推理能力也还在。" },
      { speaker: "少年侦探", text: "身体变小了，但案件没有变小。" }
    ]
  },
  {
    title: "醒来后的大衣服",
    duration: 9000,
    draw: drawWakeUpTiny,
    music: musicTiny,
    lines: [
      { speaker: "小侦探", text: "我真的变成小孩子了。领结比我的脑袋还大。" },
      { speaker: "同伴", text: "你是谁？为什么穿着他的衣服？" },
      { speaker: "小侦探", text: "先别问名字。把这副眼镜借给我，我要继续查。" }
    ]
  },
  {
    title: "小侦探继续破案",
    duration: 10000,
    draw: drawTinyDetective,
    music: musicFinale,
    lines: [
      { speaker: "小侦探", text: "黑影留下的脚印很浅，说明箱子被他们带走了。" },
      { speaker: "同伴", text: "可是你现在这么小，真的还能破案吗？" },
      { speaker: "小侦探", text: "当然。身体可以变小，真相永远只有一个方向。" }
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
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.035);
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

function musicSuspense() {
  [196, 233, 262, 311, 262, 233].forEach((n, i) => playTone(n, i * 0.42, 0.5, 0.018, "triangle"));
  [98, 110, 123].forEach((n, i) => playTone(n, i * 1.1, 1.0, 0.012, "sawtooth"));
}

function musicChase() {
  [196, 196, 247, 262, 294, 262, 247, 196].forEach((n, i) => playTone(n, i * 0.18, 0.15, 0.03, "square"));
  playNoise(0.4, 1.4, 0.016);
}

function musicDanger() {
  [110, 98, 92, 82].forEach((n, i) => playTone(n, i * 0.55, 0.72, 0.035, "sawtooth"));
  [523, 494, 466].forEach((n, i) => playTone(n, 2 + i * 0.24, 0.18, 0.02, "square"));
}

function musicShrink() {
  for (let i = 0; i < 18; i++) playTone(880 - i * 31, i * 0.11, 0.12, 0.02, "triangle");
  playNoise(0.7, 2.1, 0.02);
}

function musicTiny() {
  [1046, 988, 880, 784, 659, 784].forEach((n, i) => playTone(n, i * 0.26, 0.25, 0.018));
}

function musicFinale() {
  [392, 494, 587, 784, 698, 587, 494, 392].forEach((n, i) => playTone(n, i * 0.28, 0.3, 0.023));
  [196, 247, 294, 392].forEach((n, i) => playTone(n, i * 0.7, 0.8, 0.014, "triangle"));
}

function speakLine(line) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(`${line.speaker}说：${line.text}`);
  utterance.lang = "zh-CN";
  utterance.rate = line.speaker.includes("黑影") ? 0.88 : 1.02;
  utterance.pitch = line.speaker === "小侦探" ? 1.35 : line.speaker.includes("黑影") ? 0.72 : 1.05;
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
      if (playing) scene.music();
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
  statusText.textContent = "短片正在播放，人物会自己说话。";
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

function ground(color = "#263238") {
  ctx.fillStyle = color;
  ctx.fillRect(0, 472, W, 148);
}

function currentLine() {
  return scenes[sceneIndex].lines[currentLineIndex] || scenes[sceneIndex].lines[0];
}

function isSpeaking(name) {
  return currentLine().speaker === name;
}

function drawStar(x, y, s = 1) {
  ctx.fillStyle = "#f7d66b";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 ? 4 * s : 10 * s;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

function speechBubble(x, y, w, h, text) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "#121b24";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#121b24";
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

function drawDetective(x, y, s = 1, step = 0, speaking = false, tiny = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "#121b24";
  ctx.lineWidth = 5;
  ctx.fillStyle = "#1d4d8f";
  ctx.fillRect(-28, -38, 56, 76);
  ctx.strokeRect(-28, -38, 56, 76);
  ctx.fillStyle = "#f1c59f";
  ctx.beginPath();
  ctx.arc(0, -70, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1a1715";
  ctx.fillRect(-26, -90, 52, 20);
  ctx.fillStyle = tiny ? "#d9414d" : "#ffffff";
  ctx.fillRect(-20, -40, 40, 18);
  ctx.strokeRect(-20, -40, 40, 18);
  ctx.fillStyle = "#121b24";
  ctx.beginPath();
  ctx.arc(-10, -72, 3, 0, Math.PI * 2);
  ctx.arc(10, -72, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8b2432";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -61, speaking ? 8 : 5, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "#121b24";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-28, -18);
  ctx.lineTo(-55, 10 + Math.sin(step) * 9);
  ctx.moveTo(28, -18);
  ctx.lineTo(55, 10 - Math.sin(step) * 9);
  ctx.moveTo(-14, 38);
  ctx.lineTo(-24, 80 + Math.sin(step) * 10);
  ctx.moveTo(14, 38);
  ctx.lineTo(24, 80 - Math.sin(step) * 10);
  ctx.stroke();
  if (tiny) {
    ctx.strokeStyle = "#f1c94b";
    ctx.lineWidth = 4;
    ctx.strokeRect(-34, -83, 68, 26);
  }
  ctx.restore();
}

function drawShadowPerson(x, y, s = 1, speaking = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "#05070a";
  ctx.beginPath();
  ctx.arc(0, -75, 27, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-30, -50, 60, 95);
  ctx.strokeStyle = "#05070a";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-30, -25);
  ctx.lineTo(-65, 8);
  ctx.moveTo(30, -25);
  ctx.lineTo(65, 8);
  ctx.moveTo(-13, 45);
  ctx.lineTo(-22, 88);
  ctx.moveTo(13, 45);
  ctx.lineTo(22, 88);
  ctx.stroke();
  ctx.fillStyle = "#f1c94b";
  ctx.beginPath();
  ctx.arc(-9, -78, 4, 0, Math.PI * 2);
  ctx.arc(9, -78, 4, 0, Math.PI * 2);
  ctx.fill();
  if (speaking) {
    ctx.strokeStyle = "#f1c94b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -62);
    ctx.lineTo(10, -62);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFerrisWheel(cx, cy, r, spin) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 10; i++) {
    const a = spin + i * Math.PI * 2 / 10;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = "#d9414d";
    ctx.fillRect(x - 12, y - 6, 24, 15);
  }
  ctx.restore();
}

function drawClockTower(x, y) {
  ctx.fillStyle = "#2d3c48";
  ctx.fillRect(x, y, 140, 310);
  ctx.fillStyle = "#1d2730";
  ctx.fillRect(x - 18, y + 60, 176, 24);
  ctx.fillStyle = "#f1c94b";
  ctx.beginPath();
  ctx.arc(x + 70, y + 58, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#121b24";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 70, y + 58);
  ctx.lineTo(x + 70, y + 32);
  ctx.moveTo(x + 70, y + 58);
  ctx.lineTo(x + 93, y + 68);
  ctx.stroke();
}

function drawAmusementNight(t, time) {
  sky("#0d1723", "#213047");
  ground("#202830");
  for (let i = 0; i < 24; i++) drawStar(30 + i * 44, 45 + (i % 6) * 26, 0.55);
  drawFerrisWheel(205, 255, 120, time * 0.4);
  drawClockTower(760, 150);
  ctx.fillStyle = "#f1c94b";
  ctx.fillRect(720, 470, 220, 8);
  drawDetective(425, 450, 1, time * 4, isSpeaking("少年侦探"));
  drawShadowPerson(835, 455, 0.95, isSpeaking("黑影甲"));
  drawShadowPerson(925, 455, 0.95, isSpeaking("黑影乙"));
  speechBubble(55, 62, 520, 96, currentLine().text);
}

function drawShadowChase(t, time) {
  sky("#111823", "#2a3140");
  ground("#24272d");
  ctx.fillStyle = "#394450";
  for (let i = 0; i < 8; i++) ctx.fillRect(i * 150 - (t * 240) % 150, 250 - (i % 3) * 35, 90, 222 + (i % 3) * 35);
  ctx.fillStyle = "#f1c94b";
  ctx.fillRect(0, 500, W, 8);
  drawDetective(265 + t * 220, 445, 1, time * 12, isSpeaking("少年侦探"));
  drawShadowPerson(710 + t * 90, 445, 1, isSpeaking("黑影甲"));
  drawShadowPerson(825 + t * 90, 445, 1, isSpeaking("黑影乙"));
  ctx.fillStyle = "#6f4a24";
  ctx.fillRect(745 + t * 90, 410, 60, 42);
  ctx.strokeStyle = "#121b24";
  ctx.lineWidth = 4;
  ctx.strokeRect(745 + t * 90, 410, 60, 42);
  speechBubble(70, 68, 520, 96, currentLine().text);
}

function drawMysteryCandy(t, time) {
  sky("#10151e", "#241a24");
  ground("#1d2028");
  drawShadowPerson(290, 435, 1.12, isSpeaking("黑影乙"));
  drawShadowPerson(790, 435, 1.05, isSpeaking("黑影甲"));
  drawDetective(540, 440, 1, time * 2, isSpeaking("少年侦探"));
  const glow = ctx.createRadialGradient(540, 315, 10, 540, 315, 190);
  glow.addColorStop(0, "rgba(241,201,75,0.9)");
  glow.addColorStop(1, "rgba(241,201,75,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(330, 120, 420, 330);
  ctx.fillStyle = "#f1c94b";
  ctx.beginPath();
  ctx.ellipse(540, 315, 42 + Math.sin(time * 7) * 5, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#121b24";
  ctx.lineWidth = 5;
  ctx.stroke();
  speechBubble(75, 58, 560, 96, currentLine().text);
}

function drawShrinkEffect(t, time) {
  sky("#171123", "#2d1f3d");
  ground("#202830");
  const scale = 1 - t * 0.48;
  const y = 445 + t * 60;
  for (let i = 0; i < 12; i++) {
    const r = 50 + i * 30 + Math.sin(time * 4 + i) * 12;
    ctx.strokeStyle = `rgba(241,201,75,${0.6 - i * 0.04})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(540, 300, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(435, 320, 210, 150 + t * 80);
  drawDetective(540, y, scale, time * 6, isSpeaking("少年侦探"), t > 0.58);
  ctx.strokeStyle = "#f1c94b";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(360, 190);
  ctx.lineTo(720, 430);
  ctx.moveTo(720, 190);
  ctx.lineTo(360, 430);
  ctx.stroke();
  speechBubble(70, 60, 560, 100, currentLine().text);
}

function drawWakeUpTiny(t, time) {
  sky("#2a3340", "#7d8b9a");
  ground("#33383f");
  ctx.fillStyle = "#1d4d8f";
  ctx.fillRect(315, 430, 270, 110);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(340, 405, 175, 45);
  ctx.strokeStyle = "#121b24";
  ctx.lineWidth = 6;
  ctx.strokeRect(315, 430, 270, 110);
  drawDetective(520, 465, 0.55, time * 4, isSpeaking("小侦探"), true);
  drawDetective(735, 440, 0.86, time * 2, isSpeaking("同伴"));
  ctx.fillStyle = "#f1c94b";
  ctx.fillRect(480, 350, 90, 48);
  ctx.strokeRect(480, 350, 90, 48);
  speechBubble(70, 60, 540, 96, currentLine().text);
}

function drawTinyDetective(t, time) {
  sky("#18324d", "#4d7894");
  ground("#2b3138");
  drawClockTower(725, 155);
  ctx.fillStyle = "#f1c94b";
  for (let i = 0; i < 8; i++) ctx.fillRect(70 + i * 80, 500 + Math.sin(i) * 12, 48, 8);
  drawDetective(290, 455, 0.62, time * 8, isSpeaking("小侦探"), true);
  drawDetective(430, 440, 0.86, time * 2, isSpeaking("同伴"));
  ctx.strokeStyle = "#f1c94b";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(150, 502, 24 + Math.sin(time * 4) * 3, 0, Math.PI * 2);
  ctx.moveTo(168, 518);
  ctx.lineTo(198, 548);
  ctx.stroke();
  ctx.fillStyle = "#05070a";
  ctx.beginPath();
  ctx.ellipse(745, 500, 48, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  speechBubble(70, 60, 575, 96, currentLine().text);
}

playBtn.addEventListener("click", playMovie);
pauseBtn.addEventListener("click", pauseMovie);
nextBtn.addEventListener("click", nextScene);
restartBtn.addEventListener("click", restartMovie);

renderSceneList();
updateDialogue(0);
requestAnimationFrame(loop);
