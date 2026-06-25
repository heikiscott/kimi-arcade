const train = document.querySelector("#train");
const speedText = document.querySelector("#speedText");
const distanceText = document.querySelector("#distanceText");
const nextText = document.querySelector("#nextText");
const statusText = document.querySelector("#statusText");
const logEl = document.querySelector("#log");

const stops = [
  { name: "广州南", x: 10 },
  { name: "长沙南", x: 45 },
  { name: "上海虹桥", x: 78 }
];

let state = {
  x: 10,
  speed: 0,
  target: 1,
  gameOver: false,
  last: 0
};

function addLog(text) {
  const li = document.createElement("li");
  li.textContent = text;
  logEl.prepend(li);
}

function render() {
  train.style.left = `${state.x}%`;
  speedText.textContent = Math.round(state.speed);
  distanceText.textContent = Math.round(Math.abs(stops[state.target].x - state.x));
  nextText.textContent = stops[state.target].name;
}

function accel() {
  if (state.gameOver) return;
  state.speed = Math.min(330, state.speed + 35);
  addLog(`加速到 ${Math.round(state.speed)} km/h。`);
  render();
}

function brake() {
  if (state.gameOver) return;
  state.speed = Math.max(0, state.speed - 55);
  addLog(state.speed === 0 ? "列车停稳。" : `减速到 ${Math.round(state.speed)} km/h。`);
  render();
}

function openDoor() {
  if (state.gameOver) return;
  const distance = Math.abs(stops[state.target].x - state.x);
  if (distance < 4 && state.speed === 0) {
    addLog(`${stops[state.target].name} 开门成功。`);
    statusText.textContent = `停靠 ${stops[state.target].name}`;
    state.target = Math.min(stops.length - 1, state.target + 1);
    if (state.x >= stops[stops.length - 1].x - 2) {
      statusText.textContent = "准点到达，获胜";
      state.gameOver = true;
    }
  } else {
    fail("没停稳就开门，犯规判负。");
  }
  render();
}

function fail(text) {
  state.gameOver = true;
  statusText.textContent = text;
  addLog(text);
}

function tick(time) {
  if (!state.last) state.last = time;
  const delta = Math.min(0.05, (time - state.last) / 1000);
  state.last = time;
  if (!state.gameOver) {
    state.x += state.speed * delta * 0.025;
    state.speed = Math.max(0, state.speed - delta * 4);
    const target = stops[state.target];
    if (Math.abs(target.x - state.x) < 5 && state.speed > 90) {
      fail("进站速度太快，犯规判负。");
    }
    if (state.x > 92) {
      fail("冲出线路，犯规判负。");
    }
    render();
  }
  requestAnimationFrame(tick);
}

function reset() {
  state = { x: 10, speed: 0, target: 1, gameOver: false, last: 0 };
  statusText.textContent = "准备发车";
  logEl.innerHTML = "";
  addLog("从广州南出发。");
  render();
}

document.querySelector("#accelBtn").addEventListener("click", accel);
document.querySelector("#brakeBtn").addEventListener("click", brake);
document.querySelector("#doorBtn").addEventListener("click", openDoor);
document.querySelector("#resetBtn").addEventListener("click", reset);
window.addEventListener("keydown", (event) => {
  const key = event.key.toUpperCase();
  if (["A", "S", "D", "R"].includes(key)) event.preventDefault();
  if (key === "A") accel();
  if (key === "S") brake();
  if (key === "D") openDoor();
  if (key === "R") reset();
});

reset();
requestAnimationFrame(tick);
