const floorNames = ["8楼", "7楼", "6楼", "5楼", "4楼", "3楼", "2楼", "1楼", "B1", "B2"];
const floorsBottomOrder = ["B2", "B1", "1楼", "2楼", "3楼", "4楼", "5楼", "6楼", "7楼", "8楼"];
const floorLabels = document.querySelector("#floorLabels");
const statusText = document.querySelector("#statusText");
const cars = [document.querySelector("#carOne"), document.querySelector("#carTwo")];
const peopleBoxes = [document.querySelector("#peopleOne"), document.querySelector("#peopleTwo")];
const infos = [document.querySelector("#infoOne"), document.querySelector("#infoTwo")];
const floorButtons = [document.querySelector("#floorsOne"), document.querySelector("#floorsTwo")];
const stopBtn = document.querySelector("#stopBtn");
const resumeBtn = document.querySelector("#resumeBtn");
const resetBtn = document.querySelector("#resetBtn");

const elevators = [
  { name: "1号电梯", floor: 2, target: 2, position: 2, people: 0, limit: 4, open: false, stopped: false },
  { name: "2号电梯", floor: 2, target: 2, position: 2, people: 0, limit: 6, open: false, stopped: false }
];

let lastTime = performance.now();

function renderFloorLabels() {
  floorLabels.innerHTML = "";
  floorNames.forEach((name) => {
    const label = document.createElement("div");
    label.className = "floor-label";
    label.textContent = name;
    floorLabels.appendChild(label);
  });
}

function renderFloorButtons() {
  floorButtons.forEach((box, id) => {
    box.innerHTML = "";
    floorNames.forEach((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = name;
      button.addEventListener("click", () => goToFloor(id, floorsBottomOrder.indexOf(name)));
      box.appendChild(button);
    });
  });
}

function say(text) {
  statusText.textContent = text;
}

function goToFloor(id, target) {
  const elevator = elevators[id];
  if (elevator.stopped) {
    say(`${elevator.name} 已经紧急停止，先点恢复运行。`);
    return;
  }
  if (elevator.open) {
    say(`${elevator.name} 门还开着，先关门才能运行。`);
    return;
  }
  if (elevator.people > elevator.limit) {
    say(`${elevator.name} 超载了，先让玩偶下人。`);
    return;
  }
  elevator.target = target;
  say(`${elevator.name} 正在去 ${floorsBottomOrder[target]}。`);
}

function openDoor(id) {
  const elevator = elevators[id];
  if (Math.abs(elevator.position - elevator.target) > 0.04) {
    say(`${elevator.name} 还在运行中，停稳以后才能开门。`);
    return;
  }
  elevator.open = true;
  say(`${elevator.name} 已开门，玩偶可以上下。`);
}

function closeDoor(id) {
  elevators[id].open = false;
  say(`${elevators[id].name} 已关门。`);
}

function addPerson(id) {
  const elevator = elevators[id];
  if (!elevator.open) {
    say(`${elevator.name} 门没开，玩偶不能上电梯。`);
    return;
  }
  elevator.people += 1;
  if (elevator.people > elevator.limit) say(`${elevator.name} 超载！限制 ${elevator.limit} 个玩偶。`);
  else say(`一个玩偶进入 ${elevator.name}。`);
}

function removePerson(id) {
  const elevator = elevators[id];
  if (!elevator.open) {
    say(`${elevator.name} 门没开，玩偶不能下电梯。`);
    return;
  }
  elevator.people = Math.max(0, elevator.people - 1);
  say(`一个玩偶离开 ${elevator.name}。`);
}

function moveOneFloor(id, direction) {
  const elevator = elevators[id];
  const next = Math.max(0, Math.min(floorsBottomOrder.length - 1, elevator.floor + direction));
  goToFloor(id, next);
}

function emergencyStop() {
  elevators.forEach((elevator) => {
    elevator.stopped = true;
    elevator.target = elevator.floor;
  });
  say("两台电梯都紧急停止了。");
}

function resume() {
  elevators.forEach((elevator) => {
    elevator.stopped = false;
  });
  say("已经恢复运行，可以继续按楼层。");
}

function reset() {
  elevators.forEach((elevator) => {
    elevator.floor = 2;
    elevator.target = 2;
    elevator.position = 2;
    elevator.people = 0;
    elevator.open = false;
    elevator.stopped = false;
  });
  say("双电梯游戏重新开始。");
  updateView();
}

function update(dt) {
  elevators.forEach((elevator) => {
    if (elevator.stopped || elevator.open || elevator.people > elevator.limit) return;
    const distance = elevator.target - elevator.position;
    if (Math.abs(distance) < 0.02) {
      elevator.position = elevator.target;
      elevator.floor = elevator.target;
      return;
    }
    const speed = 1.85 * dt;
    elevator.position += Math.sign(distance) * Math.min(Math.abs(distance), speed);
    elevator.floor = Math.round(elevator.position);
  });
}

function updateView() {
  elevators.forEach((elevator, id) => {
    const maxFloorIndex = floorsBottomOrder.length - 1;
    const travelHeight = cars[id].parentElement.clientHeight - cars[id].offsetHeight - 36;
    const bottom = 18 + (elevator.position / maxFloorIndex) * travelHeight;
    cars[id].style.bottom = `${bottom}px`;
    cars[id].classList.toggle("open", elevator.open);
    cars[id].classList.toggle("overload", elevator.people > elevator.limit);
    infos[id].textContent = `${floorsBottomOrder[elevator.floor]} · ${elevator.people}/${elevator.limit} 人${elevator.stopped ? " · 停止" : ""}`;
    peopleBoxes[id].innerHTML = "";
    for (let i = 0; i < elevator.people; i += 1) {
      const doll = document.createElement("span");
      doll.className = "doll";
      peopleBoxes[id].appendChild(doll);
    }
  });
}

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  updateView();
  requestAnimationFrame(frame);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  if (action === "open") openDoor(id);
  if (action === "close") closeDoor(id);
  if (action === "add") addPerson(id);
  if (action === "remove") removePerson(id);
  if (action === "up") moveOneFloor(id, 1);
  if (action === "down") moveOneFloor(id, -1);
});

stopBtn.addEventListener("click", emergencyStop);
resumeBtn.addEventListener("click", resume);
resetBtn.addEventListener("click", reset);

renderFloorLabels();
renderFloorButtons();
updateView();
requestAnimationFrame(frame);
