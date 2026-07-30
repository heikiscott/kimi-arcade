const stage = document.querySelector("#towerStage");
const selectedElevatorLabel = document.querySelector("#selectedElevator");
const runToggle = document.querySelector("#runToggle");
const reverseElevator = document.querySelector("#reverseElevator");
const sendLow = document.querySelector("#sendLow");
const sendHigh = document.querySelector("#sendHigh");
const speedButtons = {
  slow: document.querySelector("#slowSpeed"),
  normal: document.querySelector("#normalSpeed"),
  fast: document.querySelector("#fastSpeed"),
};
const resetScene = document.querySelector("#resetScene");
const statusText = document.querySelector("#statusText");

const elevators = [
  {
    id: "v1",
    name: "竖直观光电梯 1",
    type: "vertical",
    el: document.querySelector("#verticalCar1"),
    min: 0.12,
    max: 0.88,
    initialT: 0.05,
    speed: 0.00023,
    direction: 1,
  },
  {
    id: "v2",
    name: "竖直观光电梯 2",
    type: "vertical",
    el: document.querySelector("#verticalCar2"),
    min: 0.08,
    max: 0.86,
    initialT: 0.62,
    speed: 0.00019,
    direction: -1,
  },
  {
    id: "v3",
    name: "竖直观光电梯 3",
    type: "vertical",
    el: document.querySelector("#verticalCar3"),
    min: 0.1,
    max: 0.84,
    initialT: 0.36,
    speed: 0.00021,
    direction: 1,
  },
  {
    id: "v4",
    name: "竖直观光电梯 4",
    type: "vertical",
    el: document.querySelector("#verticalCar4"),
    min: 0.1,
    max: 0.86,
    initialT: 0.8,
    speed: 0.00017,
    direction: -1,
  },
  {
    id: "p1",
    name: "双层斜行客梯 A",
    type: "inclined",
    el: document.querySelector("#passengerCarA"),
    start: { x: 0.17, y: 0.74 },
    end: { x: 0.49, y: 0.5 },
    initialT: 0.08,
    speed: 0.00016,
    direction: 1,
    angle: -34,
  },
  {
    id: "p2",
    name: "双层斜行客梯 B",
    type: "inclined",
    el: document.querySelector("#passengerCarB"),
    start: { x: 0.51, y: 0.48 },
    end: { x: 0.85, y: 0.66 },
    initialT: 0.78,
    speed: 0.00014,
    direction: -1,
    angle: 31,
  },
  {
    id: "c1",
    name: "单层斜行货梯",
    type: "inclined",
    el: document.querySelector("#cargoCar"),
    start: { x: 0.25, y: 0.86 },
    end: { x: 0.78, y: 0.69 },
    initialT: 0.3,
    speed: 0.00009,
    direction: 1,
    angle: -20,
  },
];

let selectedId = "p1";
let previousTime = performance.now();

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
  statusText.textContent = `已选中：${elevator.name}。它现在${elevator.running ? "正在运行" : "停住了"}，速度是${speedName(elevator)}。`;
  Object.values(speedButtons).forEach((button) => button.classList.remove("active"));
  const activeKey = elevator.speedMultiplier === 0.55 ? "slow" : elevator.speedMultiplier === 1.75 ? "fast" : "normal";
  speedButtons[activeKey].classList.add("active");
  elevators.forEach((item) => {
    item.el.classList.toggle("selected", item.id === selectedId);
    item.el.classList.toggle("paused", !item.running);
  });
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
      item.t += item.speed * delta * item.speedMultiplier * item.direction;
      clampBounce(item);
    }
    updateElevator(item);
  });

  requestAnimationFrame(step);
}

function selectElevator(id) {
  selectedId = id;
  const elevator = selectedElevator();
  elevator.running = true;
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
    updateElevator(item);
  });
  selectedId = "p1";
  setStatus();
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
  setStatus();
});

sendLow.addEventListener("click", () => {
  const elevator = selectedElevator();
  elevator.t = 0;
  elevator.direction = 1;
  elevator.running = false;
  updateElevator(elevator);
  setStatus();
});

sendHigh.addEventListener("click", () => {
  const elevator = selectedElevator();
  elevator.t = 1;
  elevator.direction = -1;
  elevator.running = false;
  updateElevator(elevator);
  setStatus();
});

speedButtons.slow.addEventListener("click", () => setSelectedSpeed(0.55));
speedButtons.normal.addEventListener("click", () => setSelectedSpeed(1));
speedButtons.fast.addEventListener("click", () => setSelectedSpeed(1.75));
resetScene.addEventListener("click", resetAllElevators);
window.addEventListener("resize", () => elevators.forEach(updateElevator));

resetAllElevators();
requestAnimationFrame(step);
