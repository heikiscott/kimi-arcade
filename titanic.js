const scenes = [
  {
    time: "4月14日 夜",
    badge: "航行中",
    title: "泰坦尼克号沉船",
    text: "这是一段安全历史示意动画：船、冰山、水密舱、断裂和海底残骸都会用图示表达。",
    visual: "intro"
  },
  {
    time: "11:40 PM",
    badge: "右舷碰撞",
    title: "右舷擦过冰山",
    text: "泰坦尼克号的右舷，也就是船的 starboard side，擦撞冰山，船头附近多处受损。",
    visual: "impact"
  },
  {
    time: "碰撞后",
    badge: "水密舱",
    title: "水密舱开始进水",
    text: "前部多个水密舱进水。船可以承受少数舱室进水，但进水舱太多，水会继续漫过去。",
    visual: "flood"
  },
  {
    time: "约 2:00 AM",
    badge: "船头下沉",
    title: "船头先沉，船尾抬高",
    text: "水的重量把船头拉下去，船尾被带得越来越高，就像船尾被抬上天一样。",
    visual: "tilt"
  },
  {
    time: "2:17 AM 左右",
    badge: "断裂",
    title: "船体断成两截",
    text: "船体中部承受巨大弯曲力，最后断成船头和船尾两大段。船头先沉，船尾随后沉下去。",
    visual: "break"
  },
  {
    time: "海底",
    badge: "残骸",
    title: "船头和船尾分开",
    text: "今天海底上能看到船头和船尾分开的残骸。两大部分相距大约六百米。",
    visual: "seafloor"
  },
  {
    time: "记住",
    badge: "Thank you",
    title: "Thank you",
    text: "愿人们记住这次海难，也记住安全设计、救援和历史教训。",
    visual: "seafloor"
  }
];

const frame = document.querySelector("#oceanFrame");
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
  timer = setTimeout(nextScene, 3600);
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
showScene(0);
