const stations = {
  jurong: { name: "裕廊东", line: "EW", x: 105, y: 470 },
  clementi: { name: "金文泰", line: "EW", x: 190, y: 430 },
  botanics: { name: "植物园", line: "CC", x: 280, y: 382 },
  orchard: { name: "乌节", line: "NS", x: 378, y: 326 },
  dhoby: { name: "多美歌", line: "NS", x: 470, y: 308, junction: true },
  cityhall: { name: "政府大厦", line: "EW", x: 560, y: 305, junction: true },
  raffles: { name: "莱佛士坊", line: "NS", x: 628, y: 350, junction: true },
  marina: { name: "滨海湾", line: "TE", x: 695, y: 430, junction: true },
  gardens: { name: "滨海湾花园", line: "TE", x: 780, y: 505 },
  chinatown: { name: "牛车水", line: "DT", x: 500, y: 405, junction: true },
  clarke: { name: "克拉码头", line: "NE", x: 430, y: 385 },
  harbour: { name: "港湾", line: "NE", x: 360, y: 510 },
  littleIndia: { name: "小印度", line: "NE", x: 465, y: 230, junction: true },
  gaonan: { name: "高南园", line: "NE", x: 518, y: 178 },
  bugis: { name: "武吉士", line: "DT", x: 575, y: 220, junction: true },
  paya: { name: "巴耶利峇", line: "EW", x: 705, y: 218, junction: true },
  serangoon: { name: "实龙岗", line: "NE", x: 535, y: 135 },
  tampines: { name: "淡滨尼", line: "EW", x: 835, y: 205 },
  changi: { name: "樟宜机场", line: "CG", x: 910, y: 272 },
  bishan: { name: "碧山", line: "NS", x: 390, y: 158, junction: true },
  woodlands: { name: "兀兰", line: "NS", x: 332, y: 72 }
};

const edges = [
  ["jurong", "clementi", "EW"],
  ["clementi", "botanics", "EW"],
  ["botanics", "orchard", "CC"],
  ["orchard", "dhoby", "NS"],
  ["dhoby", "cityhall", "NS"],
  ["cityhall", "raffles", "NS"],
  ["raffles", "marina", "NS"],
  ["marina", "gardens", "TE"],
  ["dhoby", "littleIndia", "NE"],
  ["littleIndia", "gaonan", "NE"],
  ["gaonan", "serangoon", "NE"],
  ["serangoon", "bishan", "CC"],
  ["bishan", "woodlands", "NS"],
  ["littleIndia", "bugis", "DT"],
  ["bugis", "paya", "EW"],
  ["paya", "tampines", "EW"],
  ["tampines", "changi", "CG"],
  ["changi", "gardens", "CG"],
  ["cityhall", "bugis", "EW"],
  ["raffles", "chinatown", "DT"],
  ["chinatown", "clarke", "NE"],
  ["clarke", "harbour", "NE"],
  ["harbour", "jurong", "NE"],
  ["chinatown", "dhoby", "DT"],
  ["chinatown", "marina", "TE"],
  ["botanics", "bishan", "CC"],
  ["woodlands", "jurong", "NS"]
];

const lineColors = {
  EW: "#2f9d55",
  NS: "#d94a44",
  NE: "#7c5bb7",
  CC: "#df8c2f",
  DT: "#2f86c9",
  TE: "#7a8a4c",
  CG: "#49a9b7"
};

const routeKeys = ["Q", "W", "E"];

const state = {
  current: "jurong",
  previous: null,
  next: "clementi",
  progress: 0,
  speed: 0,
  passengers: 0,
  score: 100,
  doorState: "closed",
  stoppedAtStation: true,
  waitingForRoute: false,
  lastTime: 0,
  chimeReady: false
};

const graph = buildGraph();
const trackLayer = document.querySelector("#trackLayer");
const stationLayer = document.querySelector("#stationLayer");
const trainLayer = document.querySelector("#trainLayer");
const stationTitle = document.querySelector("#stationTitle");
const nextStation = document.querySelector("#nextStation");
const speedText = document.querySelector("#speedText");
const passengerText = document.querySelector("#passengerText");
const scoreText = document.querySelector("#scoreText");
const platformLine = document.querySelector("#platformLine");
const platformStation = document.querySelector("#platformStation");
const platformTrain = document.querySelector(".platform-train");
const accelerateBtn = document.querySelector("#accelerateBtn");
const brakeBtn = document.querySelector("#brakeBtn");
const doorBtn = document.querySelector("#doorBtn");
const routeChoices = document.querySelector("#routeChoices");
const metroLog = document.querySelector("#metroLog");

let audioContext;

function buildGraph() {
  const map = {};
  Object.keys(stations).forEach((id) => {
    map[id] = [];
  });
  edges.forEach(([from, to, line]) => {
    map[from].push({ to, line });
    map[to].push({ to: from, line });
  });
  return map;
}

function addLog(text) {
  const item = document.createElement("li");
  item.textContent = text;
  metroLog.prepend(item);
  while (metroLog.children.length > 8) {
    metroLog.lastChild.remove();
  }
}

function drawMap() {
  trackLayer.innerHTML = "";
  stationLayer.innerHTML = "";

  edges.forEach(([from, to, line]) => {
    const a = stations[from];
    const b = stations[to];
    trackLayer.append(createLine(a, b, "track-base"));
    const colorLine = createLine(a, b, `track-color ${isActiveEdge(from, to) ? "track-active" : ""}`);
    colorLine.setAttribute("stroke", lineColors[line]);
    trackLayer.append(colorLine);
  });

  Object.entries(stations).forEach(([id, station]) => {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", station.x);
    dot.setAttribute("cy", station.y);
    dot.setAttribute("r", station.junction ? 13 : 10);
    dot.classList.add("station-dot");
    if (station.junction) dot.classList.add("junction");
    if (id === state.current) dot.classList.add("station-current");
    stationLayer.append(dot);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", station.x + 14);
    label.setAttribute("y", station.y - 14);
    label.classList.add("station-label");
    label.textContent = station.name;
    stationLayer.append(label);
  });

  drawTrain();
}

function createLine(a, b, className) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", a.x);
  line.setAttribute("y1", a.y);
  line.setAttribute("x2", b.x);
  line.setAttribute("y2", b.y);
  line.setAttribute("class", className);
  return line;
}

function isActiveEdge(from, to) {
  return (from === state.current && to === state.next) || (from === state.next && to === state.current);
}

function drawTrain() {
  trainLayer.innerHTML = "";
  const position = trainPosition();
  const angle = trainAngle();
  const train = document.createElementNS("http://www.w3.org/2000/svg", "g");
  train.setAttribute("transform", `translate(${position.x} ${position.y}) rotate(${angle})`);

  const body = svgRect(-30, -17, 60, 34, 8, "train-body");
  const face = svgRect(6, -14, 22, 28, 6, "train-face");
  const w1 = svgRect(-22, -9, 13, 18, 3, "train-window");
  const w2 = svgRect(-4, -9, 13, 18, 3, "train-window");
  train.append(body, face, w1, w2);
  trainLayer.append(train);
}

function svgRect(x, y, width, height, rx, className) {
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  rect.setAttribute("rx", rx);
  rect.setAttribute("class", className);
  return rect;
}

function trainPosition() {
  const from = stations[state.current];
  const to = stations[state.next] || from;
  return {
    x: from.x + (to.x - from.x) * state.progress,
    y: from.y + (to.y - from.y) * state.progress
  };
}

function trainAngle() {
  const from = stations[state.current];
  const to = stations[state.next] || from;
  return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
}

function render() {
  const station = stations[state.current];
  const destination = stations[state.next];
  stationTitle.textContent = station.name;
  nextStation.textContent = destination ? destination.name : "待选择";
  speedText.textContent = `${Math.round(state.speed)} km/h`;
  passengerText.textContent = state.passengers;
  scoreText.textContent = state.score;
  platformLine.textContent = station.line;
  platformLine.style.background = lineColors[station.line] || "#11856b";
  platformStation.textContent = station.name;
  doorBtn.disabled = !state.stoppedAtStation || state.doorState !== "closed";
  accelerateBtn.disabled = state.doorState !== "closed" || state.waitingForRoute;
  drawMap();
  renderRouteChoices();
}

function renderRouteChoices() {
  routeChoices.innerHTML = "";
  if (!state.waitingForRoute) return;

  routeOptions().slice(0, 3).forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${routeKeys[index]} ${directionLabel(index, option.to)}：${stations[option.to].name}`;
    button.addEventListener("click", () => chooseRoute(option.to));
    routeChoices.append(button);
  });
}

function routeOptions() {
  const options = graph[state.current].filter((edge) => edge.to !== state.previous);
  return options.length ? options : graph[state.current];
}

function directionLabel(index, to) {
  const current = stations[state.current];
  const target = stations[to];
  const dx = target.x - current.x;
  if (Math.abs(dx) < 35) return "直走";
  if (index === 0 && routeOptions().length === 1) return dx < 0 ? "左边" : "右边";
  return dx < 0 ? "左边" : index === 1 ? "直走" : "右边";
}

function chooseRoute(nextId) {
  state.next = nextId;
  state.waitingForRoute = false;
  addLog(`已选择开往 ${stations[nextId].name}。`);
  render();
}

function accelerate() {
  if (state.waitingForRoute || state.doorState !== "closed") return;
  if (!state.next) {
    state.waitingForRoute = true;
    render();
    return;
  }
  state.stoppedAtStation = false;
  state.speed = Math.min(82, state.speed + 14);
  addLog(`列车加速到 ${Math.round(state.speed)} km/h。`);
  render();
}

function brake() {
  state.speed = Math.max(0, state.speed - 22);
  if (state.speed === 0 && state.progress === 0) {
    state.stoppedAtStation = true;
  }
  addLog(state.speed === 0 ? "列车已停稳。" : `列车减速到 ${Math.round(state.speed)} km/h。`);
  render();
}

function openDoors() {
  if (!state.stoppedAtStation || state.doorState !== "closed") return;
  state.doorState = "opening";
  doorBtn.disabled = true;
  platformTrain.classList.add("doors-open");
  playDoorChime();
  addLog(`${stations[state.current].name} 开门。`);

  window.setTimeout(() => {
    state.doorState = "open";
    const boarded = Math.floor(18 + Math.random() * 46);
    state.passengers += boarded;
    addLog(`${boarded} 名乘客上车。`);
    render();
  }, 2500);

  window.setTimeout(() => {
    platformTrain.classList.remove("doors-open");
    state.doorState = "closing";
    playClosingBeeps();
    addLog("车门关闭。");
  }, 5200);

  window.setTimeout(() => {
    state.doorState = "closed";
    if (routeOptions().length > 1) {
      state.waitingForRoute = true;
      state.next = null;
    }
    render();
  }, 7800);
}

function tick(time) {
  if (!state.lastTime) state.lastTime = time;
  const delta = Math.min(0.05, (time - state.lastTime) / 1000);
  state.lastTime = time;

  if (state.speed > 0 && state.next && state.doorState === "closed") {
    const distance = distanceBetween(state.current, state.next);
    state.progress += (state.speed * delta * 0.42) / distance;
    state.speed = Math.max(0, state.speed - delta * 2.2);

    if (state.progress >= 1) {
      arriveAtStation();
    }

    drawTrain();
    speedText.textContent = `${Math.round(state.speed)} km/h`;
  }

  window.requestAnimationFrame(tick);
}

function arriveAtStation() {
  const arrived = state.next;
  state.previous = state.current;
  state.current = arrived;
  state.progress = 0;
  state.speed = 0;
  state.stoppedAtStation = true;

  const departingOptions = routeOptions();
  state.next = departingOptions[0]?.to || state.previous;
  if (departingOptions.length > 1) {
    state.waitingForRoute = true;
    state.next = null;
  }

  state.score = Math.max(0, state.score + 2);
  addLog(`到达 ${stations[state.current].name}。`);
  render();
}

function distanceBetween(from, to) {
  const a = stations[from];
  const b = stations[to];
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function ensureAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function tone(frequency, start, duration, type = "sine") {
  const ctx = ensureAudio();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime + start);
  oscillator.stop(ctx.currentTime + start + duration + 0.05);
}

function playDoorChime() {
  tone(659, 0, 0.23);
  tone(880, 0.26, 0.28);
}

function playClosingBeeps() {
  for (let index = 0; index < 6; index += 1) {
    tone(1040, index * 0.18, 0.1, "square");
  }
}

function handleKeyboard(event) {
  const key = event.key.toUpperCase();
  if (["A", "S", "D", "Q", "W", "E"].includes(key)) {
    event.preventDefault();
  }

  if (key === "A") {
    accelerate();
    return;
  }

  if (key === "S") {
    brake();
    return;
  }

  if (key === "D") {
    openDoors();
    return;
  }

  const routeIndex = routeKeys.indexOf(key);
  if (routeIndex >= 0 && state.waitingForRoute) {
    const option = routeOptions()[routeIndex];
    if (option) chooseRoute(option.to);
  }
}

accelerateBtn.addEventListener("click", accelerate);
brakeBtn.addEventListener("click", brake);
doorBtn.addEventListener("click", openDoors);
window.addEventListener("keydown", handleKeyboard);

addLog("列车停在裕廊东。");
render();
window.requestAnimationFrame(tick);
