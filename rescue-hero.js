const canvas = document.querySelector("#rescueCanvas");
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
    title: "海边英雄倒下",
    duration: 9000,
    draw: drawBeach,
    music: musicQuiet,
    lines: [
      { speaker: "小男孩", text: "英雄叔叔！你听得见吗？大家快来救人！" },
      { speaker: "旁边的人", text: "不要围太近，给他留出空间，我们马上叫救援。" },
      { speaker: "小男孩", text: "我会一直喊，他一定会醒过来的。" }
    ]
  },
  {
    title: "大声呼救",
    duration: 8500,
    draw: drawCallHelp,
    music: musicAlarm,
    lines: [
      { speaker: "小男孩", text: "救人！救人！这里有人需要帮助！" },
      { speaker: "救生员", text: "我来了，大家让开一点，保持安静。" },
      { speaker: "小男孩", text: "他是英雄，他刚刚还救了别人。" }
    ]
  },
  {
    title: "救援队赶到",
    duration: 9500,
    draw: drawRescueTeam,
    music: musicHope,
    lines: [
      { speaker: "救援队员", text: "我们接手了。小朋友，你做得很好，呼救很及时。" },
      { speaker: "小男孩", text: "请你们一定要把他救回来。" },
      { speaker: "救援队员", text: "我们会尽力。现实里遇到危险，要立刻找大人和打急救电话。" }
    ]
  },
  {
    title: "生命信号回来",
    duration: 9500,
    draw: drawHeartSignal,
    music: musicPulse,
    lines: [
      { speaker: "救生员", text: "他有反应了，继续观察。" },
      { speaker: "小男孩", text: "英雄叔叔，醒醒！我们都在这里。" },
      { speaker: "英雄", text: "我……听见了。是谁一直在叫我？" }
    ]
  },
  {
    title: "英雄醒来",
    duration: 8500,
    draw: drawWakeUp,
    music: musicBright,
    lines: [
      { speaker: "英雄", text: "谢谢你，小朋友。是你的呼救把大家叫来了。" },
      { speaker: "小男孩", text: "你醒了！太好了！" },
      { speaker: "救援队员", text: "救援成功。接下来还要去医院检查，安全最重要。" }
    ]
  },
  {
    title: "一起回家",
    duration: 8500,
    draw: drawSunset,
    music: musicFinale,
    lines: [
      { speaker: "英雄", text: "真正的英雄，是发现危险就马上求助的人。" },
      { speaker: "小男孩", text: "我记住了：先呼救，找大人，叫救援。" },
      { speaker: "大家", text: "救人成功！" }
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

function musicQuiet() {
  [392, 440, 494, 440, 392].forEach((n, i) => playTone(n, i * 0.55, 0.58, 0.014, "triangle"));
}

function musicAlarm() {
  [784, 784, 698, 784, 784, 698].forEach((n, i) => playTone(n, i * 0.25, 0.18, 0.028, "square"));
}

function musicHope() {
  [330, 392, 494, 587, 494, 392].forEach((n, i) => playTone(n, i * 0.45, 0.45, 0.018));
}

function musicPulse() {
  [196, 392, 196, 392, 196, 392].forEach((n, i) => playTone(n, i * 0.42, 0.16, 0.03, "sine"));
}

function musicBright() {
  [523, 659, 784, 1046, 784, 659, 523].forEach((n, i) => playTone(n, i * 0.32, 0.34, 0.023));
}

function musicFinale() {
  [392, 494, 587, 659, 784, 659, 587, 494, 392].forEach((n, i) => playTone(n, i * 0.3, 0.32, 0.022));
}

function speakLine(line) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(`${line.speaker}说：${line.text}`);
  utterance.lang = "zh-CN";
  utterance.rate = line.speaker === "小男孩" ? 1.08 : 0.98;
  utterance.pitch = line.speaker === "小男孩" ? 1.28 : line.speaker === "英雄" ? 0.85 : 1.02;
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
  statusText.textContent = "视频正在播放。";
}

function pauseMovie() {
  if (!playing) return;
  playing = false;
  pausedAt = performance.now();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  statusText.textContent = "视频暂停了。";
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
      statusText.textContent = "视频播放完了。";
    } else {
      setScene(sceneIndex + 1);
      scenes[sceneIndex].music();
    }
  }
  requestAnimationFrame(loop);
}

function currentLine() {
  return scenes[sceneIndex].lines[currentLineIndex] || scenes[sceneIndex].lines[0];
}

function isSpeaking(name) {
  return currentLine().speaker === name;
}

function sky(top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function beach() {
  ctx.fillStyle = "#2b91c4";
  ctx.fillRect(0, 300, W, 130);
  ctx.fillStyle = "#f2d28d";
  ctx.fillRect(0, 430, W, 190);
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 325 + i * 22);
    ctx.bezierCurveTo(220, 310 + i * 22, 330, 345 + i * 22, 560, 326 + i * 22);
    ctx.bezierCurveTo(790, 306 + i * 22, 900, 346 + i * 22, W, 326 + i * 22);
    ctx.stroke();
  }
}

function drawSun(x, y, r) {
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawHero(x, y, s = 1, pose = "down", speaking = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.fillStyle = "#f0b98d";
  if (pose === "down") {
    ctx.save();
    ctx.rotate(-0.05);
    ctx.fillRect(-80, -18, 120, 42);
    ctx.strokeRect(-80, -18, 120, 42);
    ctx.fillStyle = "#245b8f";
    ctx.fillRect(-8, -18, 54, 42);
    ctx.strokeRect(-8, -18, 54, 42);
    ctx.fillStyle = "#f0b98d";
    ctx.beginPath();
    ctx.arc(-104, 3, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#172632";
    ctx.beginPath();
    ctx.moveTo(-58, 20);
    ctx.lineTo(-96, 50);
    ctx.moveTo(-30, 22);
    ctx.lineTo(-4, 58);
    ctx.moveTo(38, 3);
    ctx.lineTo(92, -18);
    ctx.moveTo(40, 18);
    ctx.lineTo(94, 36);
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.fillRect(-32, -56, 64, 92);
    ctx.strokeRect(-32, -56, 64, 92);
    ctx.fillStyle = "#245b8f";
    ctx.fillRect(-32, 2, 64, 44);
    ctx.strokeRect(-32, 2, 64, 44);
    ctx.fillStyle = "#f0b98d";
    ctx.beginPath();
    ctx.arc(0, -90, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#172632";
    ctx.beginPath();
    ctx.arc(-9, -94, 3, 0, Math.PI * 2);
    ctx.arc(9, -94, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8b2432";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -82, speaking ? 8 : 5, 0, Math.PI);
    ctx.stroke();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-32, -28);
    ctx.lineTo(-70, -2);
    ctx.moveTo(32, -28);
    ctx.lineTo(70, -2);
    ctx.moveTo(-16, 46);
    ctx.lineTo(-22, 98);
    ctx.moveTo(16, 46);
    ctx.lineTo(22, 98);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBoy(x, y, s = 1, speaking = false, arm = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.fillStyle = "#f2c49c";
  ctx.beginPath();
  ctx.arc(0, -72, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#39a657";
  ctx.fillRect(-28, -48, 56, 72);
  ctx.strokeRect(-28, -48, 56, 72);
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(-8, -76, 3, 0, Math.PI * 2);
  ctx.arc(8, -76, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8b2432";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -64, speaking ? 9 : 5, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-28, -28);
  ctx.lineTo(-62, -52 + Math.sin(arm) * 12);
  ctx.moveTo(28, -28);
  ctx.lineTo(62, -52 - Math.sin(arm) * 12);
  ctx.moveTo(-14, 24);
  ctx.lineTo(-22, 76);
  ctx.moveTo(14, 24);
  ctx.lineTo(22, 76);
  ctx.stroke();
  ctx.restore();
}

function drawRescuer(x, y, s = 1, speaking = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.arc(0, -76, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#d94a44";
  ctx.fillRect(-30, -52, 60, 86);
  ctx.strokeRect(-30, -52, 60, 86);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-8, -44, 16, 34);
  ctx.fillRect(-18, -34, 36, 14);
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(-8, -80, 3, 0, Math.PI * 2);
  ctx.arc(8, -80, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8b2432";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -68, speaking ? 8 : 5, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-30, -28);
  ctx.lineTo(-62, -4);
  ctx.moveTo(30, -28);
  ctx.lineTo(62, -4);
  ctx.moveTo(-16, 34);
  ctx.lineTo(-22, 86);
  ctx.moveTo(16, 34);
  ctx.lineTo(22, 86);
  ctx.stroke();
  ctx.restore();
}

function speechBubble(x, y, w, h, text) {
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 24px system-ui, sans-serif";
  wrapText(text, x + 16, y + 34, w - 32, 30);
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

function drawBeach(t, time) {
  sky("#9bdfff", "#fff2c8");
  beach();
  drawSun(890, 90, 45);
  drawHero(570, 504, 1.05, "down", false);
  drawBoy(360 - t * 40, 490, 0.95, isSpeaking("小男孩"), time * 8);
  speechBubble(64, 64, 560, 96, currentLine().text);
}

function drawCallHelp(t, time) {
  sky("#9bdfff", "#fff2c8");
  beach();
  drawHero(590, 504, 1.05, "down", false);
  drawBoy(360, 490, 1.05, isSpeaking("小男孩"), time * 12);
  drawRescuer(925 - t * 255, 492, 0.95, isSpeaking("救生员"));
  ctx.fillStyle = "#d94a44";
  ctx.font = "900 44px system-ui, sans-serif";
  ctx.fillText("救人！", 175 + Math.sin(time * 6) * 8, 190);
  speechBubble(70, 64, 570, 96, currentLine().text);
}

function drawRescueTeam(t, time) {
  sky("#a9e8ff", "#fff2c8");
  beach();
  drawHero(570, 504, 1.05, "down", false);
  drawBoy(300, 492, 0.9, isSpeaking("小男孩"), time * 4);
  drawRescuer(690, 492, 0.95, isSpeaking("救援队员"));
  drawRescuer(815, 492, 0.9, isSpeaking("救援队员"));
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.fillRect(470, 410, 220, 46);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.strokeRect(470, 410, 220, 46);
  ctx.fillStyle = "#d94a44";
  ctx.fillRect(565, 417, 28, 32);
  ctx.fillRect(548, 427, 62, 12);
  speechBubble(64, 58, 620, 104, currentLine().text);
}

function drawHeartSignal(t, time) {
  sky("#bcecff", "#fff2c8");
  beach();
  drawHero(570, 504, 1.05, "down", isSpeaking("英雄"));
  drawBoy(340, 492, 0.9, isSpeaking("小男孩"), time * 8);
  drawRescuer(760, 492, 0.95, isSpeaking("救生员"));
  ctx.strokeStyle = "#39a657";
  ctx.lineWidth = 8;
  ctx.beginPath();
  const baseX = 170;
  const baseY = 215;
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + 70, baseY);
  ctx.lineTo(baseX + 90, baseY - 34 - Math.sin(time * 6) * 8);
  ctx.lineTo(baseX + 120, baseY + 34);
  ctx.lineTo(baseX + 150, baseY);
  ctx.lineTo(baseX + 240, baseY);
  ctx.stroke();
  ctx.fillStyle = "rgba(57,166,87,0.16)";
  ctx.beginPath();
  ctx.arc(570, 456, 70 + Math.sin(time * 5) * 9, 0, Math.PI * 2);
  ctx.fill();
  speechBubble(64, 58, 560, 96, currentLine().text);
}

function drawWakeUp(t, time) {
  sky("#bcecff", "#fff2c8");
  beach();
  drawHero(600, 470, 0.98, "sit", isSpeaking("英雄"));
  drawBoy(400, 492, 1, isSpeaking("小男孩"), time * 8);
  drawRescuer(790, 492, 0.95, isSpeaking("救援队员"));
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? "#ffd15f" : "#39a657";
    ctx.beginPath();
    ctx.arc(120 + i * 80, 165 + Math.sin(time + i) * 18, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  speechBubble(64, 58, 600, 96, currentLine().text);
}

function drawSunset(t, time) {
  sky("#ffc477", "#f7e7b8");
  beach();
  drawSun(890, 140, 58);
  drawHero(580, 486, 0.96, "stand", isSpeaking("英雄"));
  drawBoy(430, 492, 0.95, isSpeaking("小男孩"), time * 5);
  drawRescuer(735, 492, 0.86, false);
  ctx.fillStyle = "rgba(255,209,95,0.5)";
  ctx.beginPath();
  ctx.arc(560, 365, 170 + Math.sin(time * 2) * 8, 0, Math.PI * 2);
  ctx.fill();
  speechBubble(64, 58, 610, 96, currentLine().text);
}

playBtn.addEventListener("click", playMovie);
pauseBtn.addEventListener("click", pauseMovie);
nextBtn.addEventListener("click", nextScene);
restartBtn.addEventListener("click", restartMovie);

renderSceneList();
updateDialogue(0);
requestAnimationFrame(loop);
