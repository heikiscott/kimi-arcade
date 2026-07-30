const stage = document.querySelector("#towerStage");
const pauseToggle = document.querySelector("#pauseToggle");
const speedButtons = {
  slow: document.querySelector("#slowSpeed"),
  normal: document.querySelector("#normalSpeed"),
  fast: document.querySelector("#fastSpeed"),
};
const resetScene = document.querySelector("#resetScene");
const statusText = document.querySelector("#statusText");

const verticalElevators = [
  { el: document.querySelector("#verticalCar1"), min: 0.12, max: 0.88, t: 0.05, speed: 0.00023, direction: 1 },
  { el: document.querySelector("#verticalCar2"), min: 0.08, max: 0.86, t: 0.62, speed: 0.00019, direction: -1 },
  { el: document.querySelector("#verticalCar3"), min: 0.1, max: 0.84, t: 0.36, speed: 0.00021, direction: 1 },
  { el: document.querySelector("#verticalCar4"), min: 0.1, max: 0.86, t: 0.8, speed: 0.00017, direction: -1 },
];

const inclinedPassengerElevators = [
  {
    el: document.querySelector("#passengerCarA"),
    start: { x: 0.14, y: 0.58 },
    end: { x: 0.48, y: 0.43 },
    t: 0.08,
    speed: 0.00016,
    direction: 1,
    angle: -22,
  },
  {
    el: document.querySelector("#passengerCarB"),
    start: { x: 0.51, y: 0.41 },
    end: { x: 0.87, y: 0.55 },
    t: 0.78,
    speed: 0.00014,
    direction: -1,
    angle: 20,
  },
];

const cargoElevator = {
  el: document.querySelector("#cargoCar"),
  start: { x: 0.27, y: 0.78 },
  end: { x: 0.78, y: 0.68 },
  t: 0.3,
  speed: 0.00009,
  direction: 1,
  angle: -12,
};

let speedMultiplier = 1;
let paused = false;
let previousTime = performance.now();

function setStatus() {
  const speedName = speedMultiplier === 0.55 ? "慢速" : speedMultiplier === 1.75 ? "快速" : "正常";
  statusText.textContent = paused
    ? `已暂停：七塔电梯停在当前楼层，速度档位是${speedName}。`
    : `自动运行中：四部垂直电梯回动，两部双层斜行客梯和一部单层货梯正在${speedName}往返。`;
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

function step(time) {
  const delta = Math.min(time - previousTime, 48);
  previousTime = time;

  if (!paused) {
    verticalElevators.forEach((item) => {
      item.t += item.speed * delta * speedMultiplier * item.direction;
      clampBounce(item);
      updateVerticalElevator(item);
    });

    inclinedPassengerElevators.forEach((item) => {
      item.t += item.speed * delta * speedMultiplier * item.direction;
      clampBounce(item);
      updateInclinedElevator(item);
    });

    cargoElevator.t += cargoElevator.speed * delta * speedMultiplier * cargoElevator.direction;
    clampBounce(cargoElevator);
    updateInclinedElevator(cargoElevator);
  }

  requestAnimationFrame(step);
}

function setSpeed(nextSpeed, buttonKey) {
  speedMultiplier = nextSpeed;
  Object.values(speedButtons).forEach((button) => button.classList.remove("active"));
  speedButtons[buttonKey].classList.add("active");
  setStatus();
}

function resetAllElevators() {
  verticalElevators[0].t = 0.05;
  verticalElevators[1].t = 0.62;
  verticalElevators[2].t = 0.36;
  verticalElevators[3].t = 0.8;
  inclinedPassengerElevators[0].t = 0.08;
  inclinedPassengerElevators[1].t = 0.78;
  cargoElevator.t = 0.3;
  verticalElevators.forEach(updateVerticalElevator);
  inclinedPassengerElevators.forEach(updateInclinedElevator);
  updateInclinedElevator(cargoElevator);
  setStatus();
}

pauseToggle.addEventListener("click", () => {
  paused = !paused;
  pauseToggle.textContent = paused ? "继续" : "暂停";
  setStatus();
});

speedButtons.slow.addEventListener("click", () => setSpeed(0.55, "slow"));
speedButtons.normal.addEventListener("click", () => setSpeed(1, "normal"));
speedButtons.fast.addEventListener("click", () => setSpeed(1.75, "fast"));
resetScene.addEventListener("click", resetAllElevators);
window.addEventListener("resize", resetAllElevators);

resetAllElevators();
requestAnimationFrame(step);
