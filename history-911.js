const scenes = [
  {
    time: "8:00 AM",
    id: "intro",
    badge: "背景",
    title: "2001 年 9 月 11 日",
    text: "那天早上，美国东部有四架民航客机被恐怖分子劫持。这里用安全示意动画讲过程，不展示真实伤亡画面。",
    route: null,
    visual: "intro",
    sound: null
  },
  {
    time: "1945",
    id: "empire",
    badge: "纽约意外事故",
    title: "帝国大厦意外撞机",
    text: "1945 年 7 月 28 日，一架 B-25 军机在浓雾中意外撞上纽约帝国大厦。这不是 9/11，而是单独的航空事故。",
    route: null,
    visual: "empire",
    sound: "softImpact"
  },
  {
    time: "8:46 AM",
    id: "north",
    badge: "纽约",
    title: "第一处重大袭击",
    text: "第一架被劫持的飞机袭击了纽约世界贸易中心北塔。动画里塔楼是透明剖面，空电梯和钢缆会跟着受影响。",
    route: "route-ny",
    visual: "north",
    sound: "impact"
  },
  {
    time: "9:03 AM",
    id: "south",
    badge: "纽约",
    title: "第二座塔也被袭击",
    text: "第二架被劫持的飞机袭击了南塔。这里用空电梯坠落和烟尘表示建筑内部受损，不展示人员画面。",
    route: "route-ny",
    visual: "south",
    sound: "impact"
  },
  {
    time: "9:37 AM",
    id: "pentagon",
    badge: "华盛顿附近",
    title: "五角大楼遇袭",
    text: "9:37:46，第三架被劫持的飞机袭击华盛顿附近的五角大楼。这里用建筑示意和烟尘表达。",
    route: "route-dc",
    visual: "pentagon",
    sound: "softImpact"
  },
  {
    time: "10:03 AM",
    id: "field",
    badge: "宾夕法尼亚",
    title: "第四架飞机没有到达目标",
    text: "第四架飞机最终坠毁在宾夕法尼亚州一片田野。这里用田野和坠机点示意，不展示人员画面。",
    route: "route-pa",
    visual: "field",
    sound: "softImpact"
  },
  {
    time: "之后",
    id: "after",
    badge: "纪念",
    title: "塔楼倒塌与救援",
    text: "后来南塔先倒，北塔再倒。动画做成从顶部开始、楼层一层一层往下连锁压下去的样子。",
    route: null,
    visual: "after",
    sound: "collapse"
  }
];

const videoFrame = document.querySelector(".video-frame");
const clock = document.querySelector("#clock");
const sceneBadge = document.querySelector("#sceneBadge");
const sceneTitle = document.querySelector("#sceneTitle");
const sceneText = document.querySelector("#sceneText");
const playBtn = document.querySelector("#playBtn");
const soundBtn = document.querySelector("#soundBtn");
const restartBtn = document.querySelector("#restartBtn");
const scrubber = document.querySelector("#scrubber");
const timelineList = document.querySelector("#timelineList");
const routes = document.querySelectorAll(".route");

let currentScene = 0;
let playing = false;
let timer = null;
let audioContext = null;
let soundOn = false;
let soundTimers = [];

function buildTimeline() {
  timelineList.innerHTML = scenes
    .map(
      (scene, index) => `
        <li data-scene="${index}">
          <time>${scene.time}</time>
          <span><strong>${scene.title}</strong>${scene.text}</span>
        </li>
      `
    )
    .join("");

  timelineList.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", () => {
      pause();
      showScene(Number(item.dataset.scene));
    });
  });
}

function showScene(index) {
  currentScene = Math.max(0, Math.min(scenes.length - 1, index));
  const scene = scenes[currentScene];
  clock.textContent = scene.time;
  sceneBadge.textContent = scene.badge;
  sceneTitle.textContent = scene.title;
  sceneText.textContent = scene.text;
  scrubber.value = String(currentScene);
  videoFrame.dataset.scene = scene.visual;

  timelineList.querySelectorAll("li").forEach((item) => {
    item.classList.toggle("active", Number(item.dataset.scene) === currentScene);
  });

  routes.forEach((route) => route.classList.remove("active"));
  if (scene.route) {
    document.querySelectorAll(`.${scene.route}`).forEach((route) => route.classList.add("active"));
  }

  playSceneSound(scene);
}

function play() {
  playing = true;
  playBtn.textContent = "暂停";
  clearTimeout(timer);
  timer = setTimeout(nextScene, 3900);
}

function pause() {
  playing = false;
  playBtn.textContent = "播放";
  clearTimeout(timer);
}

function initAudio() {
  if (audioContext) return audioContext;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  audioContext = new AudioContext();
  return audioContext;
}

function clearSoundTimers() {
  soundTimers.forEach((soundTimer) => clearTimeout(soundTimer));
  soundTimers = [];
}

function scheduleSound(callback, delay) {
  const soundTimer = setTimeout(callback, delay);
  soundTimers.push(soundTimer);
}

function playSceneSound(scene) {
  clearSoundTimers();
  if (!soundOn || !initAudio()) return;
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  if (scene.sound === "impact") {
    playPlanePass();
    scheduleSound(playImpactBoom, 1950);
    scheduleSound(playGlassShatter, 2080);
    scheduleSound(playGlassShatter, 2320);
  }

  if (scene.sound === "softImpact") {
    playPlanePass();
    scheduleSound(playImpactBoom, 1700);
  }

  if (scene.sound === "collapse") {
    playCollapseRumble();
    scheduleSound(playCollapseRumble, 780);
  }
}

function playPlanePass() {
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(145, now);
  osc.frequency.exponentialRampToValueAtTime(92, now + 1.45);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(520, now);
  filter.frequency.exponentialRampToValueAtTime(260, now + 1.45);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 1.6);
}

function playImpactBoom() {
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const noise = createNoiseSource(ctx, 0.45);
  const noiseGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(95, now);
  osc.frequency.exponentialRampToValueAtTime(34, now + 0.7);
  gain.gain.setValueAtTime(0.16, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.82);

  filter.type = "lowpass";
  filter.frequency.value = 760;
  noiseGain.gain.setValueAtTime(0.09, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  osc.connect(gain);
  gain.connect(ctx.destination);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  osc.start(now);
  noise.start(now);
  osc.stop(now + 0.85);
}

function playGlassShatter() {
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;

  for (let index = 0; index < 18; index += 1) {
    const delay = index * 0.018 + Math.random() * 0.055;
    const noise = createNoiseSource(ctx, 0.16);
    const clickGain = ctx.createGain();
    const bandpass = ctx.createBiquadFilter();
    const highpass = ctx.createBiquadFilter();
    const start = now + delay;

    bandpass.type = "bandpass";
    bandpass.frequency.value = 2600 + Math.random() * 4200;
    bandpass.Q.value = 9 + Math.random() * 10;
    highpass.type = "highpass";
    highpass.frequency.value = 1500;
    clickGain.gain.setValueAtTime(0.0001, start);
    clickGain.gain.linearRampToValueAtTime(0.035 + Math.random() * 0.025, start + 0.004);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.055 + Math.random() * 0.055);

    noise.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(clickGain);
    clickGain.connect(ctx.destination);
    noise.start(start);
  }

  const shimmer = createNoiseSource(ctx, 0.55);
  const shimmerGain = ctx.createGain();
  const shimmerFilter = ctx.createBiquadFilter();
  shimmerFilter.type = "highpass";
  shimmerFilter.frequency.value = 3200;
  shimmerGain.gain.setValueAtTime(0.045, now);
  shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
  shimmer.connect(shimmerFilter);
  shimmerFilter.connect(shimmerGain);
  shimmerGain.connect(ctx.destination);
  shimmer.start(now);
}

function playCollapseRumble() {
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const noise = createNoiseSource(ctx, 1.5);
  const noiseGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(62, now);
  osc.frequency.exponentialRampToValueAtTime(28, now + 1.5);
  gain.gain.setValueAtTime(0.11, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

  filter.type = "lowpass";
  filter.frequency.value = 420;
  noiseGain.gain.setValueAtTime(0.08, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);

  osc.connect(gain);
  gain.connect(ctx.destination);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  osc.start(now);
  noise.start(now);
  osc.stop(now + 1.65);
}

function createNoiseSource(ctx, seconds) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

function nextScene() {
  if (!playing) return;
  if (currentScene >= scenes.length - 1) {
    pause();
    return;
  }
  showScene(currentScene + 1);
  play();
}

playBtn.addEventListener("click", () => {
  if (playing) {
    pause();
  } else {
    if (soundOn) initAudio()?.resume();
    play();
  }
});

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "声音：开" : "声音：关";
  if (soundOn) {
    initAudio()?.resume();
    playSceneSound(scenes[currentScene]);
  } else {
    clearSoundTimers();
  }
});

restartBtn.addEventListener("click", () => {
  pause();
  showScene(0);
});

scrubber.addEventListener("input", () => {
  pause();
  showScene(Number(scrubber.value));
});

buildTimeline();
scrubber.max = String(scenes.length - 1);

function sceneIndexFromHash() {
  const id = window.location.hash.replace("#", "");
  const index = scenes.findIndex((scene) => scene.id === id || scene.visual === id);
  return index >= 0 ? index : 0;
}

window.addEventListener("hashchange", () => {
  pause();
  showScene(sceneIndexFromHash());
});

showScene(sceneIndexFromHash());
