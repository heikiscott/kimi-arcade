const plane = document.querySelector("#plane");
const viewport = document.querySelector("#viewport");
const buildingsEl = document.querySelector("#buildings");
const speedText = document.querySelector("#speedText");
const altitudeText = document.querySelector("#altitudeText");
const fuelText = document.querySelector("#fuelText");
const targetText = document.querySelector("#targetText");
const missionTitle = document.querySelector("#missionTitle");
const flightLog = document.querySelector("#flightLog");
const airportButtons = document.querySelectorAll(".airport-buttons button");

const targets = {
  changi: { code: "SIN", name: "樟宜机场", x: 14, y: 89 },
  seattle: { code: "SEA", name: "西雅图机场", x: 50, y: 89 },
  la: { code: "LAX", name: "洛杉矶机场", x: 84, y: 89 },
  field: { code: "FIELD", name: "空地", x: 34, y: 78 }
};

const state = {
  x: 12,
  y: 30,
  speed: 26,
  altitude: 62,
  fuel: 100,
  target: "changi",
  heading: 0,
  gameOver: false,
  landed: false,
  lastTime: 0
};

const buildings = [
  { x: 20, h: 34 },
  { x: 28, h: 48 },
  { x: 62, h: 42 },
  { x: 70, h: 56 },
  { x: 77, h: 36 }
];

function addLog(text) {
  const item = document.createElement("li");
  item.textContent = text;
  flightLog.prepend(item);
  while (flightLog.children.length > 8) {
    flightLog.lastChild.remove();
  }
}

function drawBuildings() {
  buildingsEl.innerHTML = "";
  buildings.forEach((building) => {
    const el = document.createElement("div");
    el.className = "building";
    el.style.left = `${building.x}%`;
    el.style.height = `${building.h}%`;
    buildingsEl.append(el);
  });
}

function render() {
  plane.style.left = `${state.x}%`;
  plane.style.top = `${state.y}%`;
  plane.style.transform = `rotate(${state.heading}deg)`;
  speedText.textContent = Math.round(state.speed);
  altitudeText.textContent = Math.round(state.altitude);
  fuelText.textContent = Math.max(0, Math.round(state.fuel));
  targetText.textContent = targets[state.target].code;
}

function prepareAction() {
  if (!state.gameOver) return true;
  resetGame();
  addLog("已自动重开，可以继续操作。");
  return true;
}

function climb() {
  if (!prepareAction()) return;
  state.y = Math.max(8, state.y - 8);
  state.altitude = Math.min(100, state.altitude + 14);
  state.fuel -= 1.6;
  addLog("上升，避开障碍。");
  render();
}

function descend() {
  if (!prepareAction()) return;
  state.y = Math.min(89, state.y + 8);
  state.altitude = Math.max(0, state.altitude - 14);
  addLog("下降，准备进近。");
  render();
}

function turnLeft() {
  if (!prepareAction()) return;
  state.x = Math.max(2, state.x - 9);
  state.heading = -14;
  state.fuel -= 0.8;
  addLog("向左修正航向。");
  render();
}

function turnRight() {
  if (!prepareAction()) return;
  state.x = Math.min(92, state.x + 9);
  state.heading = 14;
  state.fuel -= 0.8;
  addLog("向右修正航向。");
  render();
}

function tryLand() {
  if (!prepareAction()) return;
  const target = targets[state.target];
  const close = Math.abs(state.x - target.x) < 9 && Math.abs(state.y - target.y) < 9;
  const safeSpeed = state.speed <= 58;
  const lowEnough = state.altitude <= 28;

  if (close && safeSpeed && lowEnough) {
    state.gameOver = true;
    state.landed = true;
    missionTitle.textContent = `成功降落 ${target.name}`;
    addLog(`安全降落到 ${target.name}。`);
  } else {
    addLog("还不能降落：需要靠近目标、降低高度并控制速度。");
  }
  render();
}

function resetGame() {
  Object.assign(state, {
    x: 12,
    y: 30,
    speed: 26,
    altitude: 62,
    fuel: 100,
    target: "changi",
    heading: 0,
    gameOver: false,
    landed: false,
    lastTime: 0
  });
  viewport.classList.remove("danger");
  missionTitle.textContent = "选择机场，安全降落";
  flightLog.innerHTML = "";
  setTarget("changi");
  addLog("航班起飞，保持安全高度。");
  render();
}

function setTarget(id) {
  state.target = id;
  airportButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.target === id);
  });
  addLog(`目的地设为 ${targets[id].name}。`);
  render();
}

function tick(time) {
  if (!state.lastTime) state.lastTime = time;
  const delta = Math.min(0.05, (time - state.lastTime) / 1000);
  state.lastTime = time;

  if (!state.gameOver) {
    state.x += state.speed * delta * 0.08;
    state.fuel -= delta * 0.42;
    state.heading *= 0.94;

    if (state.x > 96) state.x = 0;
    if (state.fuel <= 0) fail("燃油耗尽，任务失败。");
    checkCollision();
    render();
  }

  window.requestAnimationFrame(tick);
}

function checkCollision() {
  const danger = buildings.some((building) => {
    const closeX = Math.abs(state.x - building.x) < 5.6;
    const buildingTop = 100 - building.h;
    const closeY = state.y > buildingTop - 10;
    return closeX && closeY;
  });

  viewport.classList.toggle("danger", danger);
  if (danger) {
    fail("撞上高楼，任务失败。");
  }
}

function fail(text) {
  state.gameOver = true;
  missionTitle.textContent = "任务失败";
  addLog(text);
}

document.querySelector("#upBtn").addEventListener("click", climb);
document.querySelector("#downBtn").addEventListener("click", descend);
document.querySelector("#leftBtn").addEventListener("click", turnLeft);
document.querySelector("#rightBtn").addEventListener("click", turnRight);
document.querySelector("#landBtn").addEventListener("click", tryLand);
document.querySelector("#resetBtn").addEventListener("click", resetGame);
airportButtons.forEach((button) => {
  button.addEventListener("click", () => setTarget(button.dataset.target));
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toUpperCase();
  if (["W", "A", "S", "D", "L", "R"].includes(key)) event.preventDefault();
  if (key === "W") climb();
  if (key === "S") descend();
  if (key === "A") turnLeft();
  if (key === "D") turnRight();
  if (key === "L") tryLand();
  if (key === "R") resetGame();
});

drawBuildings();
resetGame();
window.requestAnimationFrame(tick);
