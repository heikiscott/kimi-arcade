const canvas = document.querySelector("#mazeCanvas");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");
const restartBtn = document.querySelector("#restartBtn");
const movieRestartBtn = document.querySelector("#movieRestartBtn");
const winMovie = document.querySelector("#winMovie");
const guestControlsEl = document.querySelector("#guestControls");
const selectPlayer1 = document.querySelector("#selectPlayer1");
const selectPlayer2 = document.querySelector("#selectPlayer2");

const maze = [
  "#########################",
  "#S....#.....#.....#..G..#",
  "#.###.#.###.#.###.#.###.#",
  "#...#...#...#...#...#...#",
  "###.#####.#####.#####.#.#",
  "#...#.....#.....#.....#.#",
  "#.###.###.#.###.#.#####.#",
  "#.....#...#...#.#.....#.#",
  "#.#####.#####.#.#####.#.#",
  "#...#.....C...#.....#...#",
  "###.#.###########.#.###.#",
  "#...#.....#.....#.#.....#",
  "#.#####.#.#.###.#.#####.#",
  "#.....#.#...#...#.....G.#",
  "#####.#.#####.#####.###.#",
  "#C....#.....#.....#...#.#",
  "#.#########.#.###.###.#.#",
  "#...........#...#.....#E#",
  "#########################"
];

const moves = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1]
};

const rows = maze.length;
const cols = maze[0].length;
const cell = Math.min(canvas.width / (cols + 2.2), canvas.height / (rows + 4.8));
const offsetX = (canvas.width - cols * cell) / 2;
const offsetY = 96;
const wallHeight = cell * 0.34;

let players;
let guests;
let cats;
let activePlayerId = "p1";
let won = false;
let audioContext = null;
let wanderTick = 0;

function getAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(freq, start, duration, gainValue = 0.045, type = "square") {
  const audio = getAudio();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.03);
}

function playStep() {
  playTone(420, 0, 0.045, 0.022);
}

function playInvite() {
  [523, 659, 784].forEach((note, index) => playTone(note, index * 0.07, 0.07, 0.04));
}

function playWall() {
  playTone(160, 0, 0.08, 0.032, "triangle");
}

function playWinMusic() {
  const melody = [523, 659, 784, 1046, 988, 784, 659, 784, 880, 1174, 1046, 880, 784, 1046, 1318, 1568];
  melody.forEach((note, index) => playTone(note, index * 0.15, 0.12, 0.05));
}

function createPlayers() {
  return {
    p1: {
      id: "p1",
      name: "1号男生",
      row: 1,
      col: 1,
      color: "#245b8f",
      shirt: "#2f77dc",
      hair: "#282018",
      step: 0,
      type: "boy"
    },
    p2: {
      id: "p2",
      name: "2号女生",
      row: 1,
      col: 2,
      color: "#d84c8b",
      shirt: "#ef6aa6",
      hair: "#4b2d20",
      step: 0,
      type: "girl"
    }
  };
}

function createGuests() {
  return [
    {
      id: "g1",
      name: "游客小俊",
      row: 1,
      col: 21,
      color: "#f59e0b",
      shirt: "#ffd15f",
      hair: "#4b2d20",
      joined: false,
      step: 0,
      type: "guest"
    },
    {
      id: "g2",
      name: "游客娜娜",
      row: 13,
      col: 21,
      color: "#7c4dff",
      shirt: "#9f7aea",
      hair: "#30231c",
      joined: false,
      step: 0,
      type: "guest"
    }
  ];
}

function createCats() {
  return [
    { row: 9, col: 10, direction: "right", phase: 0 },
    { row: 15, col: 1, direction: "left", phase: 1.4 }
  ];
}

function reset() {
  players = createPlayers();
  guests = createGuests();
  cats = createCats();
  activePlayerId = "p1";
  won = false;
  wanderTick = 0;
  winMovie.classList.remove("show");
  statusEl.textContent = "从上方入口商场出发，先走方形迷宫，再接到下面圆形迷宫。出口旁边是商场和巴士站。";
  updatePlayerButtons();
  renderGuestControls();
  draw();
}

function isWall(row, col) {
  if (row < 0 || row >= rows || col < 0 || col >= cols) return true;
  return maze[row][col] === "#";
}

function isExit(row, col) {
  return maze[row][col] === "E";
}

function tileToCanvas(row, col) {
  return {
    x: offsetX + col * cell,
    y: offsetY + row * cell
  };
}

function canvasToTile(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  return {
    row: Math.floor((y - offsetY) / cell),
    col: Math.floor((x - offsetX) / cell)
  };
}

function setActivePlayer(id) {
  if (!players[id]) return;
  activePlayerId = id;
  updatePlayerButtons();
  statusEl.textContent = `现在键盘控制 ${players[id].name}。手机上也可以直接按每个人自己的方向盘。`;
  draw();
}

function updatePlayerButtons() {
  selectPlayer1.classList.toggle("active", activePlayerId === "p1");
  selectPlayer2.classList.toggle("active", activePlayerId === "p2");
}

function renderGuestControls() {
  guestControlsEl.innerHTML = "";
  const joinedGuests = guests.filter((guest) => guest.joined);
  if (joinedGuests.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "还没有游客加入。去画面里点一个游客试试。";
    guestControlsEl.append(empty);
    return;
  }

  joinedGuests.forEach((guest) => {
    const panel = document.createElement("div");
    panel.className = "guest-controller";
    panel.innerHTML = `
      <strong>${guest.name}</strong>
      <div class="mobile-pad" aria-label="${guest.name}方向按钮">
        <button data-player="${guest.id}" data-move="up" type="button">上</button>
        <button data-player="${guest.id}" data-move="left" type="button">左</button>
        <button data-player="${guest.id}" data-move="right" type="button">右</button>
        <button data-player="${guest.id}" data-move="down" type="button">下</button>
      </div>
    `;
    guestControlsEl.append(panel);
  });
}

function inviteGuest(guest) {
  if (guest.joined) {
    setActivePlayer(guest.id);
    return;
  }
  guest.joined = true;
  players[guest.id] = guest;
  activePlayerId = guest.id;
  renderGuestControls();
  updatePlayerButtons();
  statusEl.textContent = `${guest.name} 加入了队伍，现在也有一个控制盘了。`;
  playInvite();
  draw();
}

function checkGuestCollision(character) {
  guests.forEach((guest) => {
    if (!guest.joined && guest.row === character.row && guest.col === character.col) {
      inviteGuest(guest);
    }
  });
}

function moveCharacter(id, dr, dc) {
  if (won) return;
  const character = players[id];
  if (!character) return;
  const nextRow = character.row + dr;
  const nextCol = character.col + dc;

  if (isWall(nextRow, nextCol)) {
    statusEl.textContent = `${character.name} 撞到树篱墙了，换一条路。`;
    playWall();
    draw();
    return;
  }

  character.row = nextRow;
  character.col = nextCol;
  character.step += 1;
  activePlayerId = id;
  updatePlayerButtons();
  checkGuestCollision(character);
  playStep();

  if (isExit(character.row, character.col)) {
    won = true;
    statusEl.textContent = `${character.name} 找到出口了，大家走到巴士站旁边，赢了!`;
    winMovie.classList.add("show");
    playWinMusic();
  } else {
    statusEl.textContent = `${character.name} 已经走了 ${character.step} 步。先穿过方形迷宫，再从圆形迷宫到右下角出口。`;
  }

  draw();
}

function moveWanderingGuests() {
  if (won) return;
  wanderTick += 1;
  guests.forEach((guest, index) => {
    if (guest.joined) return;
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1]
    ];
    const legal = directions.filter(([dr, dc]) => !isWall(guest.row + dr, guest.col + dc));
    if (legal.length === 0) return;
    const choice = legal[(wanderTick + index + Math.floor(Math.random() * legal.length)) % legal.length];
    guest.row += choice[0];
    guest.col += choice[1];
    guest.step += 1;
  });
  cats.forEach((cat, index) => {
    const options = index % 2 === 0 ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]];
    const current = options[wanderTick % 2];
    if (!isWall(cat.row + current[0], cat.col + current[1])) {
      cat.row += current[0];
      cat.col += current[1];
    }
    cat.phase += 0.5;
  });
  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawThemeParkLayout();
  drawParkSign();

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      drawTile(row, col, maze[row][col]);
    }
  }

  drawDecorations();
  drawMallAndBusStop();
  cats.forEach(drawCat);
  guests.filter((guest) => !guest.joined).forEach((guest) => drawPerson(guest, true));
  Object.values(players).forEach((player) => drawPerson(player, false));
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#7bcdf4");
  sky.addColorStop(0.62, "#dff7ff");
  sky.addColorStop(1, "#7acb72");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.76)";
  drawCloud(120, 86, 48);
  drawCloud(720, 76, 42);
  drawCloud(825, 152, 34);

  ctx.fillStyle = "rgba(31,107,80,0.18)";
  ctx.beginPath();
  ctx.arc(140, 680, 230, Math.PI, 0);
  ctx.arc(490, 690, 290, Math.PI, 0);
  ctx.arc(830, 680, 210, Math.PI, 0);
  ctx.fill();
}

function drawThemeParkLayout() {
  const squareX = offsetX + cell * 0.55;
  const squareY = offsetY + cell * 0.55;
  const squareW = cell * 23.9;
  const squareH = cell * 9.1;
  const roundCx = offsetX + cell * 12.5;
  const roundCy = offsetY + cell * 14.1;
  const roundR = cell * 6.05;

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.36)";
  roundRect(squareX, squareY, squareW, squareH, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(23,38,50,0.28)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,239,198,0.44)";
  ctx.beginPath();
  ctx.arc(roundCx, roundCy, roundR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(23,38,50,0.3)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "rgba(31,107,80,0.2)";
  ctx.beginPath();
  ctx.arc(roundCx, roundCy, roundR * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(23,38,50,0.72)";
  ctx.font = "900 18px system-ui";
  ctx.fillText("方形迷宫", squareX + 14, squareY + 27);
  ctx.fillText("圆形迷宫", roundCx - 42, roundCy - roundR + 31);

  ctx.strokeStyle = "rgba(184,67,49,0.45)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(roundCx, squareY + squareH);
  ctx.lineTo(roundCx, roundCy - roundR + 6);
  ctx.stroke();
  ctx.restore();
}

function drawCloud(x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size * 0.44, y - size * 0.18, size * 0.42, 0, Math.PI * 2);
  ctx.arc(x + size * 0.9, y, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawParkSign() {
  ctx.save();
  ctx.translate(36, 26);
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  roundRect(0, 0, 280, 62, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 22px system-ui";
  ctx.fillText("济州岛迷宫主题乐园", 18, 28);
  ctx.fillStyle = "#b84331";
  ctx.font = "800 14px system-ui";
  ctx.fillText("제주 미로 테마파크  |  方形迷宫接圆形迷宫", 18, 50);
  ctx.restore();
}

function drawTile(row, col, tile) {
  const { x, y } = tileToCanvas(row, col);
  if (tile === "#") {
    drawHedgeBlock(x, y);
    return;
  }

  const inRoundMaze = row >= 10;
  const shade = inRoundMaze
    ? ((row + col) % 2 === 0 ? "#f5e1b2" : "#eed29a")
    : ((row + col) % 2 === 0 ? "#f8e7bd" : "#f3dca9");
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, cell, cell);
  ctx.strokeStyle = "rgba(23,38,50,0.08)";
  ctx.strokeRect(x, y, cell, cell);

  ctx.fillStyle = "rgba(116,92,52,0.08)";
  ctx.beginPath();
  ctx.moveTo(x, y + cell);
  ctx.lineTo(x + cell, y + cell * 0.86);
  ctx.lineTo(x + cell, y + cell);
  ctx.closePath();
  ctx.fill();

  if (tile === "S") drawStart(x, y);
  if (tile === "E") drawExit(x, y);
}

function drawHedgeBlock(x, y) {
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x + 5, y + cell - 5, cell - 2, 8);
  ctx.fillStyle = "#164733";
  ctx.fillRect(x, y + wallHeight, cell, cell - wallHeight);
  ctx.fillStyle = "#23825b";
  roundRect(x + 2, y, cell - 4, cell - wallHeight + 6, 5);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x + 6, y + 8, cell - 12, 5);
  ctx.fillStyle = "rgba(10,44,31,0.26)";
  ctx.fillRect(x + cell - 8, y + wallHeight, 8, cell - wallHeight);
}

function drawStart(x, y) {
  ctx.fillStyle = "#39a657";
  ctx.fillRect(x + cell * 0.22, y + cell * 0.25, cell * 0.56, cell * 0.52);
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${cell * 0.34}px system-ui`;
  ctx.fillText("入口", x + cell * 0.1, y + cell * 0.62);
}

function drawExit(x, y) {
  ctx.fillStyle = "#803420";
  roundRect(x + cell * 0.18, y + cell * 0.18, cell * 0.64, cell * 0.68, 5);
  ctx.fill();
  ctx.fillStyle = "#ffd15f";
  ctx.fillRect(x + cell * 0.28, y + cell * 0.1, cell * 0.44, cell * 0.16);
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${cell * 0.24}px system-ui`;
  ctx.fillText("出口", x + cell * 0.25, y + cell * 0.61);
}

function drawDecorations() {
  drawHanokRoof(offsetX + cell * 9.5, offsetY - 28, cell * 3);
  drawLantern(offsetX + cell * 2.2, offsetY + cell * 4.5);
  drawLantern(offsetX + cell * 19.4, offsetY + cell * 11.5);
  drawDolHareubang(offsetX + cell * 22.8, offsetY + cell * 2.8);
  drawDolHareubang(offsetX + cell * 1.8, offsetY + cell * 16.2);
}

function drawMallAndBusStop() {
  drawMall(offsetX + cell * 0.6, 28, cell * 5.2, "入口商场");
  drawMall(offsetX + cell * 16.8, offsetY + cell * 18.25, cell * 4.7, "出口商场");
  drawBusStop(offsetX + cell * 21.7, offsetY + cell * 18.2);
}

function drawMall(x, y, width, label) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  roundRect(x, y, width, 48, 8);
  ctx.fill();
  ctx.fillStyle = "#d93a32";
  ctx.fillRect(x + 10, y + 26, width - 20, 8);
  ctx.fillStyle = "#245b8f";
  ctx.font = "900 15px system-ui";
  ctx.fillText(label, x + 12, y + 20);
  ctx.fillStyle = "#ffd15f";
  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(x + 16 + i * 30, y + 31, 17, 10);
  }
  ctx.restore();
}

function drawBusStop(x, y) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  roundRect(x, y, cell * 2.35, 50, 8);
  ctx.fill();
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(x + 12, y + 9, 28, 25);
  ctx.fillStyle = "#fff";
  ctx.font = "900 14px system-ui";
  ctx.fillText("BUS", x + 9, y + 47);
  ctx.fillStyle = "#172632";
  ctx.font = "900 13px system-ui";
  ctx.fillText("巴士站", x + 45, y + 22);
  ctx.fillStyle = "#51616c";
  ctx.font = "800 10px system-ui";
  ctx.fillText("济州岛没有地铁", x + 45, y + 38);
  ctx.restore();
}

function drawHanokRoof(x, y, width) {
  ctx.fillStyle = "#b84331";
  ctx.beginPath();
  ctx.moveTo(x, y + 24);
  ctx.quadraticCurveTo(x + width / 2, y - 18, x + width, y + 24);
  ctx.lineTo(x + width - 10, y + 36);
  ctx.lineTo(x + 10, y + 36);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.fillRect(x + 18, y + 36, width - 36, 9);
}

function drawLantern(x, y) {
  ctx.fillStyle = "#d93a32";
  ctx.beginPath();
  ctx.ellipse(x, y, 11, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffd15f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 18);
  ctx.lineTo(x, y - 34);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawDolHareubang(x, y) {
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x + 12, y + 46, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5d6466";
  roundRect(x, y + 12, 24, 34, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 12, y + 10, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.fillRect(x + 7, y + 8, 3, 3);
  ctx.fillRect(x + 15, y + 8, 3, 3);
  ctx.fillRect(x + 9, y + 18, 8, 3);
}

function drawPerson(person, isWandering) {
  const { x, y } = tileToCanvas(person.row, person.col);
  const bob = Math.sin(person.step * 0.8) * 2;
  const cx = x + cell / 2;
  const floor = y + cell * 0.82 + bob;

  if (person.id === activePlayerId) {
    ctx.strokeStyle = "#ffd15f";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, y + cell * 0.48, cell * 0.39, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(cx, floor + 2, cell * 0.22, cell * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = person.shirt;
  roundRect(cx - cell * 0.16, y + cell * 0.42 + bob, cell * 0.32, cell * 0.28, 5);
  ctx.fill();

  ctx.fillStyle = "#f1bd8c";
  ctx.beginPath();
  ctx.arc(cx, y + cell * 0.31 + bob, cell * 0.16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = person.hair;
  ctx.beginPath();
  ctx.arc(cx, y + cell * 0.24 + bob, cell * 0.17, Math.PI, Math.PI * 2);
  ctx.fill();

  if (person.type === "girl") {
    ctx.fillStyle = "#ef6aa6";
    ctx.beginPath();
    ctx.arc(cx + cell * 0.16, y + cell * 0.26 + bob, cell * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#101820";
  ctx.fillRect(cx - cell * 0.06, y + cell * 0.31 + bob, 3, 3);
  ctx.fillRect(cx + cell * 0.05, y + cell * 0.31 + bob, 3, 3);

  ctx.strokeStyle = "#101820";
  ctx.beginPath();
  ctx.arc(cx, y + cell * 0.35 + bob, cell * 0.055, 0.15, Math.PI - 0.15);
  ctx.stroke();

  ctx.fillStyle = "#3b2a1f";
  ctx.fillRect(cx - cell * 0.16, floor - cell * 0.06, cell * 0.12, cell * 0.06);
  ctx.fillRect(cx + cell * 0.04, floor - cell * 0.06, cell * 0.12, cell * 0.06);

  ctx.fillStyle = person.color;
  ctx.font = `900 ${cell * 0.18}px system-ui`;
  ctx.textAlign = "center";
  ctx.fillText(isWandering ? "点我" : person.name.replace("号", ""), cx, y + cell * 0.12);
  ctx.textAlign = "start";
}

function drawCat(cat) {
  const { x, y } = tileToCanvas(cat.row, cat.col);
  const cx = x + cell / 2;
  const cy = y + cell * 0.62 + Math.sin(cat.phase) * 2;
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + cell * 0.16, cell * 0.22, cell * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f5a94d";
  ctx.beginPath();
  ctx.ellipse(cx, cy, cell * 0.22, cell * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - cell * 0.18, cy - cell * 0.08, cell * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - cell * 0.25, cy - cell * 0.16);
  ctx.lineTo(cx - cell * 0.2, cy - cell * 0.31);
  ctx.lineTo(cx - cell * 0.12, cy - cell * 0.16);
  ctx.fill();
  ctx.strokeStyle = "#f5a94d";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx + cell * 0.25, cy - cell * 0.05, cell * 0.14, -0.4, 1.8);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

window.addEventListener("keydown", (event) => {
  if (event.key === "1") {
    setActivePlayer("p1");
    return;
  }
  if (event.key === "2") {
    setActivePlayer("p2");
    return;
  }

  const keyMoves = {
    ArrowUp: moves.up,
    w: moves.up,
    ArrowDown: moves.down,
    s: moves.down,
    ArrowLeft: moves.left,
    a: moves.left,
    ArrowRight: moves.right,
    d: moves.right
  };
  const moveBy = keyMoves[event.key];
  if (!moveBy) return;
  event.preventDefault();
  moveCharacter(activePlayerId, moveBy[0], moveBy[1]);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-move]");
  if (!button) return;
  const moveBy = moves[button.dataset.move];
  moveCharacter(button.dataset.player || activePlayerId, moveBy[0], moveBy[1]);
});

canvas.addEventListener("click", (event) => {
  const tile = canvasToTile(event.clientX, event.clientY);
  const guest = guests.find((item) => !item.joined && item.row === tile.row && item.col === tile.col);
  if (guest) {
    inviteGuest(guest);
  }
});

selectPlayer1.addEventListener("click", () => setActivePlayer("p1"));
selectPlayer2.addEventListener("click", () => setActivePlayer("p2"));
restartBtn.addEventListener("click", reset);
movieRestartBtn.addEventListener("click", reset);
setInterval(moveWanderingGuests, 700);

reset();
