const stage = document.querySelector("#towerStage");
const selectedElevatorLabel = document.querySelector("#selectedElevator");
const runToggle = document.querySelector("#runToggle");
const reverseElevator = document.querySelector("#reverseElevator");
const sendLow = document.querySelector("#sendLow");
const sendHigh = document.querySelector("#sendHigh");
const platformButtons = {
  platform1: document.querySelector("#goPlatform1"),
  platform2: document.querySelector("#goPlatform2"),
  platform3: document.querySelector("#goPlatform3"),
  platform4: document.querySelector("#goPlatform4"),
  topApartment: document.querySelector("#goTopApartment"),
};
const speedButtons = {
  slow: document.querySelector("#slowSpeed"),
  normal: document.querySelector("#normalSpeed"),
  fast: document.querySelector("#fastSpeed"),
};
const viewButtons = {
  interior: document.querySelector("#viewInterior"),
  exterior: document.querySelector("#viewExterior"),
  platform: document.querySelector("#viewPlatform"),
  structure: document.querySelector("#viewStructure"),
};
const sceneButtons = {
  day: document.querySelector("#sceneDay"),
  river: document.querySelector("#sceneRiver"),
  garden: document.querySelector("#sceneGarden"),
  sunset: document.querySelector("#sceneSunset"),
  night: document.querySelector("#sceneNight"),
};
const resetScene = document.querySelector("#resetScene");
const statusText = document.querySelector("#statusText");
const touristAvatar = document.querySelector("#touristAvatar");
const touristButtons = {
  left: document.querySelector("#touristLeft"),
  right: document.querySelector("#touristRight"),
  up: document.querySelector("#touristUp"),
  down: document.querySelector("#touristDown"),
};

const elevators = [
  {
    id: "v1",
    name: "顶层双轿厢电梯 1",
    type: "vertical",
    el: document.querySelector("#verticalCar1"),
    min: 0.12,
    max: 0.62,
    initialT: 0.05,
    speed: 0.00023,
    direction: 1,
    stops: { platform2: 1, platform4: 0.36, topApartment: 0 },
    lowStop: "platform2",
    highStop: "topApartment",
  },
  {
    id: "v2",
    name: "顶层双轿厢电梯 2",
    type: "vertical",
    el: document.querySelector("#verticalCar2"),
    min: 0.1,
    max: 0.62,
    initialT: 0.62,
    speed: 0.00019,
    direction: -1,
    stops: { platform2: 1, platform4: 0.36, topApartment: 0 },
    lowStop: "platform2",
    highStop: "topApartment",
  },
  {
    id: "p1",
    name: "北柱游客斜梯",
    type: "inclined",
    el: document.querySelector("#passengerCarA"),
    start: { x: 0.15, y: 0.78 },
    end: { x: 0.49, y: 0.54 },
    initialT: 0.08,
    speed: 0.00016,
    direction: 1,
    angle: -37,
    stops: { platform1: 0.42, platform2: 1 },
    lowStop: "platform1",
    highStop: "platform2",
  },
  {
    id: "p2",
    name: "东柱游客斜梯",
    type: "inclined",
    el: document.querySelector("#passengerCarB"),
    start: { x: 0.51, y: 0.46 },
    end: { x: 0.87, y: 0.64 },
    initialT: 0.78,
    speed: 0.00014,
    direction: -1,
    angle: 37,
    stops: { platform1: 0.42, platform2: 1 },
    lowStop: "platform1",
    highStop: "platform2",
  },
  {
    id: "p3",
    name: "西柱游客斜梯",
    type: "inclined",
    el: document.querySelector("#passengerCarC"),
    start: { x: 0.36, y: 0.82 },
    end: { x: 0.5, y: 0.47 },
    initialT: 0.5,
    speed: 0.00015,
    direction: 1,
    angle: -17,
    stops: { platform1: 0.46, platform2: 1 },
    lowStop: "platform1",
    highStop: "platform2",
  },
  {
    id: "r1",
    name: "二层餐厅专用电梯",
    type: "inclined",
    el: document.querySelector("#restaurantCar"),
    start: { x: 0.66, y: 0.82 },
    end: { x: 0.52, y: 0.49 },
    initialT: 0.22,
    speed: 0.00012,
    direction: 1,
    angle: 19,
    stops: { platform2: 1 },
    lowStop: "platform2",
    highStop: "platform2",
  },
  {
    id: "c1",
    name: "南柱单层货梯",
    type: "inclined",
    el: document.querySelector("#cargoCar"),
    start: { x: 0.21, y: 0.86 },
    end: { x: 0.48, y: 0.58 },
    initialT: 0.3,
    speed: 0.00009,
    direction: 1,
    angle: -36,
    stops: { platform2: 1 },
    lowStop: "platform2",
    highStop: "platform2",
  },
];

let selectedId = "p1";
let previousTime = performance.now();
const touristLevels = [
  { name: "地面入口", y: 0.82, minX: 0.1, maxX: 0.9 },
  { name: "一层平台", y: 0.66, minX: 0.24, maxX: 0.76 },
  { name: "二层平台", y: 0.5, minX: 0.3, maxX: 0.7 },
  { name: "三层平台", y: 0.34, minX: 0.39, maxX: 0.61 },
  { name: "四层平台/顶端换乘", y: 0.2, minX: 0.44, maxX: 0.56 },
];
const tourist = {
  x: 0.18,
  level: 0,
};

function selectedElevator() {
  return elevators.find((elevator) => elevator.id === selectedId);
}

function speedName(elevator) {
  if (elevator.speedMultiplier === 0.55) return "慢速";
  if (elevator.speedMultiplier === 1.75) return "快速";
  return "正常";
}

function setStatus() {
  const elevator = selectedElevator();
  selectedElevatorLabel.textContent = `当前：${elevator.name}`;
  runToggle.textContent = elevator.running ? "停下这部" : "启动这部";
  const stopNames = Object.keys(elevator.stops).map(readableStop).join("、");
  statusText.textContent = `已选中：${elevator.name}。可到：${stopNames}。它现在${elevator.running ? "正在运行" : "停住了"}，速度是${speedName(elevator)}。`;
  Object.values(speedButtons).forEach((button) => button.classList.remove("active"));
  const activeKey = elevator.speedMultiplier === 0.55 ? "slow" : elevator.speedMultiplier === 1.75 ? "fast" : "normal";
  speedButtons[activeKey].classList.add("active");
  Object.entries(platformButtons).forEach(([stop, button]) => {
    button.disabled = !(stop in elevator.stops);
  });
  elevators.forEach((item) => {
    item.el.classList.toggle("selected", item.id === selectedId);
    item.el.classList.toggle("paused", !item.running);
  });
}

function readableStop(stop) {
  return {
    platform1: "一层平台",
    platform2: "二层平台/餐厅",
    platform3: "三层平台",
    platform4: "四层平台",
    topApartment: "顶端公寓",
  }[stop] || stop;
}

function clampBounce(item) {
  if (item.t >= 1) {
    item.t = 1;
    item.direction = -1;
  }
  if (item.t <= 0) {
    item.t = 0;
    item.direction = 1;
  }
}

function updateVerticalElevator(item) {
  const y = item.min + (item.max - item.min) * item.t;
  item.el.style.top = `${y * 100}%`;
}

function updateInclinedElevator(item) {
  const x = item.start.x + (item.end.x - item.start.x) * item.t;
  const y = item.start.y + (item.end.y - item.start.y) * item.t;
  const flip = item.direction < 0 ? " scaleX(-1)" : "";
  item.el.style.left = `${x * stage.clientWidth}px`;
  item.el.style.top = `${y * stage.clientHeight}px`;
  item.el.style.transform = `translate(-50%, -50%) rotate(${item.angle}deg)${flip}`;
}

function updateElevator(item) {
  if (item.type === "vertical") {
    updateVerticalElevator(item);
  } else {
    updateInclinedElevator(item);
  }
}

function step(time) {
  const delta = Math.min(time - previousTime, 48);
  previousTime = time;

  elevators.forEach((item) => {
    if (item.running) {
      if (typeof item.targetT === "number") {
        const distance = item.targetT - item.t;
        const stepSize = item.speed * delta * item.speedMultiplier;
        if (Math.abs(distance) <= stepSize) {
          item.t = item.targetT;
          item.targetT = null;
          item.running = false;
          if (item.id === selectedId) {
            setStatus();
          }
        } else {
          item.direction = distance > 0 ? 1 : -1;
          item.t += stepSize * item.direction;
        }
      } else {
        item.t += item.speed * delta * item.speedMultiplier * item.direction;
        clampBounce(item);
      }
    }
    updateElevator(item);
  });

  requestAnimationFrame(step);
}

function selectElevator(id) {
  selectedId = id;
  const elevator = selectedElevator();
  setStatus();
}

function setSelectedSpeed(nextSpeed) {
  const elevator = selectedElevator();
  elevator.speedMultiplier = nextSpeed;
  elevator.running = true;
  setStatus();
}

function resetAllElevators() {
  elevators.forEach((item) => {
    item.t = item.initialT;
    item.running = true;
    item.speedMultiplier = 1;
    item.targetT = null;
    updateElevator(item);
  });
  selectedId = "p1";
  tourist.x = 0.18;
  tourist.level = 0;
  updateTourist();
  setStatus();
}

function updateTourist() {
  const currentLevel = touristLevels[tourist.level];
  tourist.x = Math.max(currentLevel.minX, Math.min(currentLevel.maxX, tourist.x));
  touristAvatar.style.left = `${tourist.x * stage.clientWidth}px`;
  touristAvatar.style.top = `${currentLevel.y * stage.clientHeight}px`;
}

function moveTourist(direction) {
  const currentLevel = touristLevels[tourist.level];
  tourist.x = Math.max(currentLevel.minX, Math.min(currentLevel.maxX, tourist.x + direction * 0.08));
  touristAvatar.classList.add("walking");
  window.setTimeout(() => touristAvatar.classList.remove("walking"), 190);
  updateTourist();
  statusText.textContent = `小游客在${currentLevel.name}移动。也可以先点电梯，再用下面控制台让电梯到对应平台。`;
}

function changeTouristLevel(direction) {
  tourist.level = Math.max(0, Math.min(touristLevels.length - 1, tourist.level + direction));
  const currentLevel = touristLevels[tourist.level];
  tourist.x = (currentLevel.minX + currentLevel.maxX) / 2;
  touristAvatar.classList.add("walking");
  window.setTimeout(() => touristAvatar.classList.remove("walking"), 190);
  updateTourist();
  statusText.textContent = `小游客到了${currentLevel.name}。真实玩法里可以想成他坐电梯/走楼梯换到这一层。`;
}

elevators.forEach((item) => {
  item.el.addEventListener("click", () => selectElevator(item.id));
});

runToggle.addEventListener("click", () => {
  const elevator = selectedElevator();
  elevator.running = !elevator.running;
  setStatus();
});

reverseElevator.addEventListener("click", () => {
  const elevator = selectedElevator();
  elevator.direction *= -1;
  elevator.running = true;
  elevator.targetT = null;
  setStatus();
});

function sendSelectedTo(stop) {
  const elevator = selectedElevator();
  if (!(stop in elevator.stops)) {
    statusText.textContent = `${elevator.name}不能到${readableStop(stop)}，请选择它能到的平台。`;
    return;
  }
  elevator.targetT = elevator.stops[stop];
  elevator.running = true;
  setStatus();
}

sendLow.addEventListener("click", () => {
  const elevator = selectedElevator();
  sendSelectedTo(elevator.lowStop);
});

sendHigh.addEventListener("click", () => {
  const elevator = selectedElevator();
  sendSelectedTo(elevator.highStop);
});

platformButtons.platform1.addEventListener("click", () => sendSelectedTo("platform1"));
platformButtons.platform2.addEventListener("click", () => sendSelectedTo("platform2"));
platformButtons.platform3.addEventListener("click", () => sendSelectedTo("platform3"));
platformButtons.platform4.addEventListener("click", () => sendSelectedTo("platform4"));
platformButtons.topApartment.addEventListener("click", () => sendSelectedTo("topApartment"));

Object.entries(viewButtons).forEach(([view, button]) => {
  button.addEventListener("click", () => {
    stage.classList.remove("view-interior", "view-exterior", "view-platform", "view-structure");
    stage.classList.add(`view-${view}`);
    Object.values(viewButtons).forEach((viewButton) => viewButton.classList.remove("active"));
    button.classList.add("active");
  });
});

Object.entries(sceneButtons).forEach(([scene, button]) => {
  button.addEventListener("click", () => {
    stage.classList.remove("scene-day", "scene-river", "scene-garden", "scene-sunset", "scene-night");
    stage.classList.add(`scene-${scene}`);
    Object.values(sceneButtons).forEach((sceneButton) => sceneButton.classList.remove("active"));
    button.classList.add("active");
    statusText.textContent = `已切换到${button.textContent}景色。电梯结构和控制方式保持一模一样。`;
  });
});

speedButtons.slow.addEventListener("click", () => setSelectedSpeed(0.55));
speedButtons.normal.addEventListener("click", () => setSelectedSpeed(1));
speedButtons.fast.addEventListener("click", () => setSelectedSpeed(1.75));
touristButtons.left.addEventListener("click", () => moveTourist(-1));
touristButtons.right.addEventListener("click", () => moveTourist(1));
touristButtons.up.addEventListener("click", () => changeTouristLevel(1));
touristButtons.down.addEventListener("click", () => changeTouristLevel(-1));
resetScene.addEventListener("click", resetAllElevators);
window.addEventListener("resize", () => {
  elevators.forEach(updateElevator);
  updateTourist();
});

resetAllElevators();
requestAnimationFrame(step);
