const scenes = [
  {
    time: "白天",
    badge: "晴朗山地",
    title: "山地高铁事故",
    text: "晴朗白天，山上轨道旁一列 10 节和谐号动车一开始就在高速行驶。这里是无人安全示意动画。",
    visual: "intro",
    duration: 2600
  },
  {
    time: "10 秒",
    badge: "正常行驶",
    title: "和谐号正常行驶",
    text: "列车在山上正常行驶 10 秒，十个车厢连在一起，从左边开到右边。",
    visual: "cruise",
    duration: 10000
  },
  {
    time: "断节",
    badge: "连接断开",
    title: "车厢开始断节",
    text: "行驶后，车厢连接处开始断开，整列车不再保持一条线。",
    visual: "break",
    duration: 3800
  },
  {
    time: "坠落",
    badge: "慢慢掉下去",
    title: "十节车厢坠落",
    text: "十节车厢一节一节慢慢掉下山谷。画面没有人，只展示车厢运动。",
    visual: "fall",
    duration: 5200
  },
  {
    time: "结束",
    badge: "安全示意",
    title: "事故短片结束",
    text: "这是一段电影式安全示意短片，不是精确事故复原。",
    visual: "after",
    duration: 4200
  }
];

const frame = document.querySelector("#railFrame");
const clock = document.querySelector("#clock");
const sceneBadge = document.querySelector("#sceneBadge");
const sceneTitle = document.querySelector("#sceneTitle");
const sceneText = document.querySelector("#sceneText");
const playBtn = document.querySelector("#playBtn");
const restartBtn = document.querySelector("#restartBtn");
const scrubber = document.querySelector("#scrubber");
const timelineList = document.querySelector("#timelineList");

let currentScene = 0;
let playing = false;
let timer = null;

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
  frame.dataset.scene = scene.visual;
  clock.textContent = scene.time;
  sceneBadge.textContent = scene.badge;
  sceneTitle.textContent = scene.title;
  sceneText.textContent = scene.text;
  scrubber.value = String(currentScene);

  timelineList.querySelectorAll("li").forEach((item) => {
    item.classList.toggle("active", Number(item.dataset.scene) === currentScene);
  });
}

function play() {
  playing = true;
  playBtn.textContent = "暂停";
  clearTimeout(timer);
  timer = setTimeout(nextScene, scenes[currentScene].duration);
}

function pause() {
  playing = false;
  playBtn.textContent = "播放";
  clearTimeout(timer);
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
    play();
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
showScene(0);
