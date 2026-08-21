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

const directions = [
  { name: "北", dr: -1, dc: 0 },
  { name: "东", dr: 0, dc: 1 },
  { name: "南", dr: 1, dc: 0 },
  { name: "西", dr: 0, dc: -1 }
];

const rows = maze.length;
const cols = maze[0].length;
const cell = Math.min(canvas.width / (cols + 2.2), canvas.height / (rows + 4.8));
const offsetX = (canvas.width - cols * cell) / 2;
const offsetY = 96;
const wallHeight = cell * 0.34;
const circleEntranceCol = 17;

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

function playBlessing() {
  [784, 988, 1174, 1568].forEach((note, index) => playTone(note, index * 0.06, 0.08, 0.035, "sine"));
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
      dir: 1,
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
      dir: 1,
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
      dir: 3,
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
      dir: 2,
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
  statusEl.textContent = "这是第一视角：你看着前方走迷宫，左/右可以转头，前/后可以移动。先过正方形迷宫，再进入下面圆形迷宫。";
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
  if (row >= 10) {
    const { cx, cy, radius } = getCircleMazeInfo();
    const angle = getCircleAngle(col);
    const ring = getCircleRowRadius(row, radius);
    return {
      x: cx + Math.cos(angle) * ring - cell / 2,
      y: cy + Math.sin(angle) * ring - cell / 2
    };
  }

  return {
    x: offsetX + col * cell,
    y: offsetY + row * cell
  };
}

function getCircleAngle(col) {
  const wrapped = (col - circleEntranceCol + cols) % cols;
  return -Math.PI / 2 + (wrapped / cols) * Math.PI * 2;
}

function getCircleMazeInfo() {
  return {
    cx: offsetX + cell * 12.5,
    cy: offsetY + cell * 15.45,
    radius: cell * 4.25
  };
}

function getCircleRowRadius(row, radius) {
  const localRow = Math.max(0, Math.min(8, row - 10));
  return radius * (0.92 - localRow * 0.085);
}

function isInsideLowerCircle(row, col) {
  if (row < 10) return true;
  const { cx, cy, radius } = getCircleMazeInfo();
  const { x, y } = tileToCanvas(row, col);
  const dx = x + cell / 2 - cx;
  const dy = y + cell / 2 - cy;
  return Math.hypot(dx, dy) <= radius * 1.08;
}

function canvasToTile(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  const { cx, cy, radius } = getCircleMazeInfo();
  const dx = x - cx;
  const dy = y - cy;
  const distance = Math.hypot(dx, dy);

  if (distance <= radius + cell * 0.7) {
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;
    const colOffset = Math.round((angle / (Math.PI * 2)) * cols) % cols;
    const col = (colOffset + circleEntranceCol) % cols;
    let bestRow = 10;
    let bestDistance = Infinity;
    for (let row = 10; row < rows; row += 1) {
      const gap = Math.abs(distance - getCircleRowRadius(row, radius));
      if (gap < bestDistance) {
        bestDistance = gap;
        bestRow = row;
      }
    }
    return { row: bestRow, col };
  }

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
        <button data-player="${guest.id}" data-move="up" type="button">前</button>
        <button data-player="${guest.id}" data-move="left" type="button">左转</button>
        <button data-player="${guest.id}" data-move="right" type="button">右转</button>
        <button data-player="${guest.id}" data-move="down" type="button">后退</button>
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

function moveCharacter(id, action) {
  if (won) return;
  const character = players[id];
  if (!character) return;
  if (action === "turnLeft" || action === "turnRight") {
    character.dir = (character.dir + (action === "turnLeft" ? 3 : 1)) % directions.length;
    activePlayerId = id;
    updatePlayerButtons();
    statusEl.textContent = `${character.name} 把头转向${directions[character.dir].name}边。现在看到的是前方的迷宫路。`;
    playStep();
    draw();
    return;
  }

  const direction = directions[character.dir];
  const sign = action === "backward" ? -1 : 1;
  const nextRow = character.row + direction.dr * sign;
  const nextCol = character.col + direction.dc * sign;

  if (isWall(nextRow, nextCol)) {
    statusEl.textContent = `${character.name} 前面是很高的树篱墙，先左转或右转找路。`;
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
    statusEl.textContent = `${character.name} 已经走了 ${character.step} 步。现在朝${directions[character.dir].name}，继续往前看路。`;
  }

  draw();
}

function moveWanderingGuests() {
  if (won) return;
  wanderTick += 1;
  guests.forEach((guest, index) => {
    if (guest.joined) return;
    const wanderDirections = [
      [-1, 0, 0],
      [0, 1, 1],
      [1, 0, 2],
      [0, -1, 3]
    ];
    const legal = wanderDirections.filter(([dr, dc]) => !isWall(guest.row + dr, guest.col + dc));
    if (legal.length === 0) return;
    const choice = legal[(wanderTick + index + Math.floor(Math.random() * legal.length)) % legal.length];
    guest.row += choice[0];
    guest.col += choice[1];
    guest.dir = choice[2];
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
  drawFirstPersonScene(players[activePlayerId] || players.p1);
}

function getRelativeTile(viewer, depth, lateral) {
  const forward = directions[viewer.dir];
  const right = directions[(viewer.dir + 1) % directions.length];
  return {
    row: viewer.row + forward.dr * depth + right.dr * lateral,
    col: viewer.col + forward.dc * depth + right.dc * lateral
  };
}

function getRelativePosition(viewer, row, col) {
  const forward = directions[viewer.dir];
  const right = directions[(viewer.dir + 1) % directions.length];
  const dr = row - viewer.row;
  const dc = col - viewer.col;
  return {
    depth: dr * forward.dr + dc * forward.dc,
    lateral: dr * right.dr + dc * right.dc
  };
}

function getProjection(depth, lateral) {
  const safeDepth = Math.max(0.34, depth);
  const scale = 1 / (safeDepth * 0.78 + 0.22);
  return {
    x: canvas.width / 2 + lateral * 184 * scale,
    y: 360 + 220 * scale,
    scale
  };
}

function drawFirstPersonScene(viewer) {
  draw3DBackground(viewer);
  draw3DParkSign(viewer);

  for (let depth = 8; depth >= 1; depth -= 1) {
    for (let lateral = -depth - 2; lateral <= depth + 2; lateral += 1) {
      const tile = getRelativeTile(viewer, depth, lateral);
      draw3DGroundTile(tile.row, tile.col, depth, lateral);
    }
  }

  const visibleSprites = [
    ...cats.map((cat) => ({ kind: "cat", item: cat, row: cat.row, col: cat.col })),
    ...guests.filter((guest) => !guest.joined).map((guest) => ({ kind: "guest", item: guest, row: guest.row, col: guest.col })),
    ...Object.values(players)
      .filter((player) => player.id !== viewer.id)
      .map((player) => ({ kind: "person", item: player, row: player.row, col: player.col }))
  ]
    .map((sprite) => ({ ...sprite, ...getRelativePosition(viewer, sprite.row, sprite.col) }))
    .filter((sprite) => sprite.depth > 0 && sprite.depth <= 8 && Math.abs(sprite.lateral) <= sprite.depth + 1.4)
    .sort((a, b) => b.depth - a.depth);

  for (let depth = 8; depth >= 1; depth -= 1) {
    for (let lateral = -depth - 2; lateral <= depth + 2; lateral += 1) {
      const tile = getRelativeTile(viewer, depth, lateral);
      if (isWall(tile.row, tile.col)) {
        draw3DHedge(depth, lateral);
      } else if (tile.row >= 0 && tile.row < rows && tile.col >= 0 && tile.col < cols) {
        const symbol = maze[tile.row][tile.col];
        if (symbol === "S" || symbol === "E" || symbol === "C" || symbol === "G") {
          draw3DMarker(symbol, depth, lateral, tile.row);
        }
      }
    }
    visibleSprites.filter((sprite) => Math.round(sprite.depth) === depth).forEach(draw3DSprite);
  }

  drawViewerHands(viewer);
  drawCompass(viewer);
}

function draw3DBackground(viewer) {
  const sky = ctx.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, "#6dc7f5");
  sky.addColorStop(0.72, "#dff8ff");
  sky.addColorStop(1, "#f9eec7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, 390);

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  drawCloud(140, 78, 54);
  drawCloud(650, 96, 42);
  drawCloud(820, 170, 28);

  const ground = ctx.createLinearGradient(0, 320, 0, canvas.height);
  ground.addColorStop(0, "#d7c082");
  ground.addColorStop(0.28, "#f1d9a1");
  ground.addColorStop(1, "#9f7a43");
  ctx.fillStyle = ground;
  ctx.fillRect(0, 330, canvas.width, canvas.height - 330);

  ctx.fillStyle = "rgba(31,107,80,0.18)";
  ctx.beginPath();
  ctx.moveTo(0, 342);
  ctx.quadraticCurveTo(250, 280, 480, 342);
  ctx.quadraticCurveTo(710, 402, 960, 330);
  ctx.lineTo(960, 402);
  ctx.lineTo(0, 402);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(23,38,50,0.72)";
  ctx.font = "900 18px system-ui";
  const place = viewer.row >= 10 ? "圆形迷宫区" : "正方形迷宫区";
  ctx.fillText(`${place} · 第一视角`, 28, 42);
}

function draw3DParkSign(viewer) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  roundRect(26, 54, 350, 68, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 22px system-ui";
  ctx.fillText("济州岛 3D 迷宫主题乐园", 44, 84);
  ctx.fillStyle = "#1f6b50";
  ctx.font = "850 14px system-ui";
  ctx.fillText(`当前控制：${viewer.name} · 朝${directions[viewer.dir].name} · 左右键转头`, 44, 106);
  ctx.restore();
}

function draw3DGroundTile(row, col, depth, lateral) {
  const nearLeft = getProjection(depth - 0.48, lateral - 0.52);
  const nearRight = getProjection(depth - 0.48, lateral + 0.52);
  const farRight = getProjection(depth + 0.48, lateral + 0.52);
  const farLeft = getProjection(depth + 0.48, lateral - 0.52);
  const isKnown = row >= 0 && row < rows && col >= 0 && col < cols;
  const inRound = row >= 10;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(nearLeft.x, nearLeft.y);
  ctx.lineTo(nearRight.x, nearRight.y);
  ctx.lineTo(farRight.x, farRight.y);
  ctx.lineTo(farLeft.x, farLeft.y);
  ctx.closePath();
  ctx.fillStyle = !isKnown
    ? "#7dbb73"
    : inRound
      ? ((row + col) % 2 === 0 ? "#e9cf8d" : "#f5dfaa")
      : ((row + col) % 2 === 0 ? "#f2d696" : "#f8e9bc");
  ctx.fill();
  ctx.strokeStyle = "rgba(79,60,34,0.18)";
  ctx.lineWidth = Math.max(1, 3 / depth);
  ctx.stroke();
  ctx.restore();
}

function draw3DHedge(depth, lateral) {
  const projection = getProjection(depth, lateral);
  const width = 164 * projection.scale;
  const height = 310 * projection.scale;
  const x = projection.x - width / 2;
  const y = projection.y - height;
  const side = 22 * projection.scale;

  ctx.save();
  const hedge = ctx.createLinearGradient(x, y, x, y + height);
  hedge.addColorStop(0, "#2fa96e");
  hedge.addColorStop(0.55, "#1f6b50");
  hedge.addColorStop(1, "#164733");
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  roundRect(x + side * 0.45, y + side, width, height, Math.max(4, 12 * projection.scale));
  ctx.fill();
  ctx.fillStyle = hedge;
  roundRect(x, y, width, height, Math.max(5, 12 * projection.scale));
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(x + width * 0.1, y + height * 0.12, width * 0.78, Math.max(2, 8 * projection.scale));
  ctx.fillStyle = "rgba(8,55,31,0.28)";
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.arc(x + width * (0.2 + i * 0.16), y + height * (0.22 + (i % 2) * 0.2), Math.max(3, 13 * projection.scale), 0, Math.PI * 2);
    ctx.fill();
  }

  const flowerColors = ["#ffd15f", "#ff6fae", "#ffffff", "#ff8c3a"];
  flowerColors.forEach((color, index) => {
    draw3DFlower(x + width * (0.18 + index * 0.2), y + height * (0.56 + (index % 2) * 0.16), color, projection.scale);
  });
  ctx.restore();
}

function draw3DFlower(x, y, color, scale) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i += 1) {
    const angle = (Math.PI * 2 * i) / 5;
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * 5 * scale, y + Math.sin(angle) * 5 * scale, Math.max(1.8, 5 * scale), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.8, 3.4 * scale), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function draw3DMarker(symbol, depth, lateral, row) {
  const projection = getProjection(depth, lateral);
  const width = 110 * projection.scale;
  const height = 64 * projection.scale;
  const x = projection.x - width / 2;
  const y = projection.y - 142 * projection.scale;
  const label = symbol === "E" ? "出口巴士站" : symbol === "S" ? "入口商场" : symbol === "C" ? "猫猫通道" : "游客点";
  ctx.save();
  ctx.fillStyle = symbol === "E" ? "#803420" : symbol === "S" ? "#39a657" : "#245b8f";
  roundRect(x, y, width, height, Math.max(4, 9 * projection.scale));
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${Math.max(10, 22 * projection.scale)}px system-ui`;
  ctx.textAlign = "center";
  ctx.fillText(label, projection.x, y + height * 0.58);
  if (row >= 10) {
    ctx.fillStyle = "rgba(255,209,95,0.9)";
    ctx.fillText("圆形迷宫", projection.x, y + height + 18 * projection.scale);
  }
  ctx.textAlign = "start";
  ctx.restore();
}

function draw3DSprite(sprite) {
  const projection = getProjection(sprite.depth, sprite.lateral);
  const size = sprite.kind === "cat" ? 58 * projection.scale : 96 * projection.scale;
  const x = projection.x;
  const y = projection.y - size * 0.72;

  if (sprite.kind === "cat") {
    draw3DCat(x, y, size);
    return;
  }
  draw3DPerson(sprite.item, x, y, size, sprite.kind === "guest");
}

function draw3DPerson(person, x, y, size, isGuest) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.86, size * 0.26, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = person.shirt;
  roundRect(x - size * 0.18, y + size * 0.34, size * 0.36, size * 0.36, size * 0.07);
  ctx.fill();
  ctx.fillStyle = "#f1bd8c";
  ctx.beginPath();
  ctx.arc(x, y + size * 0.18, size * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = person.hair;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.11, size * 0.18, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#101820";
  ctx.fillRect(x - size * 0.06, y + size * 0.16, Math.max(2, size * 0.02), Math.max(2, size * 0.02));
  ctx.fillRect(x + size * 0.05, y + size * 0.16, Math.max(2, size * 0.02), Math.max(2, size * 0.02));
  ctx.strokeStyle = "#101820";
  ctx.lineWidth = Math.max(1, size * 0.018);
  ctx.beginPath();
  ctx.arc(x, y + size * 0.22, size * 0.06, 0.18, Math.PI - 0.18);
  ctx.stroke();
  ctx.fillStyle = person.color;
  ctx.font = `900 ${Math.max(10, size * 0.13)}px system-ui`;
  ctx.textAlign = "center";
  ctx.fillText(isGuest ? "点我加入" : person.name, x, y - size * 0.06);
  ctx.textAlign = "start";
  ctx.restore();
}

function draw3DCat(x, y, size) {
  ctx.save();
  ctx.fillStyle = "#f5a94d";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.36, size * 0.32, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - size * 0.24, y + size * 0.22, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y + size * 0.09);
  ctx.lineTo(x - size * 0.3, y - size * 0.08);
  ctx.lineTo(x - size * 0.21, y + size * 0.08);
  ctx.fill();
  ctx.strokeStyle = "#f5a94d";
  ctx.lineWidth = Math.max(3, size * 0.08);
  ctx.beginPath();
  ctx.arc(x + size * 0.34, y + size * 0.25, size * 0.22, -0.5, 1.8);
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.fillRect(x - size * 0.29, y + size * 0.2, size * 0.04, size * 0.04);
  ctx.restore();
}

function drawViewerHands(viewer) {
  ctx.save();
  ctx.fillStyle = "rgba(23,38,50,0.22)";
  ctx.beginPath();
  ctx.ellipse(480, 702, 210, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = viewer.shirt;
  roundRect(330, 636, 90, 58, 18);
  roundRect(540, 636, 90, 58, 18);
  ctx.fill();
  ctx.fillStyle = "#f1bd8c";
  ctx.beginPath();
  ctx.arc(425, 652, 28, 0, Math.PI * 2);
  ctx.arc(535, 652, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCompass(viewer) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  roundRect(700, 34, 224, 76, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.font = "900 17px system-ui";
  ctx.fillText("方向", 720, 62);
  ctx.fillStyle = "#245b8f";
  ctx.font = "950 28px system-ui";
  ctx.fillText(directions[viewer.dir].name, 720, 94);
  ctx.fillStyle = "#51616c";
  ctx.font = "800 12px system-ui";
  ctx.fillText("A/D 或左右按钮转头", 770, 92);
  ctx.restore();
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
  const { cx: roundCx, cy: roundCy, radius: roundR } = getCircleMazeInfo();

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.54)";
  roundRect(squareX, squareY, squareW, squareH, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(23,38,50,0.5)";
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = "rgba(226,244,202,0.72)";
  ctx.beginPath();
  ctx.arc(roundCx, roundCy, roundR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(31,107,80,0.82)";
  ctx.lineWidth = 10;
  ctx.stroke();

  drawFlowerMeadow(roundCx, roundCy, roundR);

  ctx.strokeStyle = "rgba(31,107,80,0.35)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(roundCx, roundCy, roundR * 0.72, 0.15, Math.PI * 2 - 0.35);
  ctx.stroke();

  ctx.fillStyle = "rgba(23,38,50,0.82)";
  ctx.font = "900 18px system-ui";
  ctx.fillText("上面：正方形迷宫", squareX + 14, squareY + 27);
  ctx.fillStyle = "#1f6b50";
  ctx.fillText("下面：圆形迷宫", roundCx - 64, roundCy - roundR + 26);

  ctx.strokeStyle = "rgba(31,107,80,0.72)";
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(roundCx, squareY + squareH);
  ctx.lineTo(roundCx, roundCy - roundR + 6);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,244,204,0.9)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(roundCx, squareY + squareH + 2);
  ctx.lineTo(roundCx, roundCy - roundR + 8);
  ctx.stroke();
  ctx.restore();
}

function drawCircularMazeGardenOverlay() {
  const { cx, cy } = getCircleMazeInfo();
  const rings = [cell * 4.12, cell * 3.05, cell * 2.02, cell * 1.05];

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  rings.forEach((radius, index) => {
    ctx.strokeStyle = index % 2 === 0 ? "rgba(31,107,80,0.92)" : "rgba(57,166,87,0.84)";
    ctx.lineWidth = index === 0 ? 10 : 8;
    const startGap = 0.35 + index * 0.45;
    const endGap = 0.82 + index * 0.32;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startGap, Math.PI * 2 - endGap);
    ctx.stroke();
  });

  ctx.strokeStyle = "rgba(31,107,80,0.86)";
  ctx.lineWidth = 8;
  [
    [-Math.PI / 2, cell * 3.05, cell * 4.12],
    [0.05, cell * 1.05, cell * 4.12],
    [Math.PI * 0.55, cell * 1.05, cell * 3.05],
    [Math.PI * 1.18, cell * 2.02, cell * 4.12]
  ].forEach(([angle, inner, outer]) => {
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.stroke();
  });

  ctx.strokeStyle = "rgba(255,244,204,0.9)";
  ctx.lineWidth = 4;
  [
    [-Math.PI / 2, cell * 3.05, cell * 4.12],
    [0.05, cell * 1.05, cell * 4.12],
    [Math.PI * 0.55, cell * 1.05, cell * 3.05],
    [Math.PI * 1.18, cell * 2.02, cell * 4.12]
  ].forEach(([angle, inner, outer]) => {
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.stroke();
  });

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  roundRect(cx - cell * 2.45, cy - cell * 0.48, cell * 4.9, cell * 0.96, 10);
  ctx.fill();
  ctx.fillStyle = "#1f6b50";
  ctx.font = `900 ${cell * 0.32}px system-ui`;
  ctx.textAlign = "center";
  ctx.fillText("圆形迷宫", cx, cy + cell * 0.12);
  ctx.textAlign = "start";
  ctx.restore();
}

function drawFlowerMeadow(cx, cy, radius) {
  ctx.save();
  ctx.fillStyle = "rgba(188,225,151,0.62)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius * 1.18, radius * 1.08, 0, 0, Math.PI * 2);
  ctx.fill();

  const flowers = [
    [-4.9, -0.8, "#ff6fae"], [-4.25, 1.1, "#ffd15f"], [-3.6, 2.6, "#ffffff"],
    [-2.8, -3.65, "#ff8c3a"], [-1.9, 3.85, "#ff6fae"], [-1.1, -4.45, "#ffffff"],
    [-0.2, 4.35, "#ffd15f"], [0.9, -3.85, "#ff6fae"], [1.8, 3.45, "#ff8c3a"],
    [2.7, -2.95, "#ffffff"], [3.45, 2.0, "#ffd15f"], [4.35, -0.95, "#ff6fae"],
    [4.95, 0.95, "#ffffff"], [-0.1, -1.35, "#ff8c3a"], [1.15, 1.3, "#ff6fae"],
    [-1.45, 1.05, "#ffd15f"]
  ];
  flowers.forEach(([gx, gy, color], index) => {
    drawTinyFlower(cx + gx * cell, cy + gy * cell, color, index % 3);
  });
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
  ctx.fillText("제주 미로 테마파크  |  俯视图：上方形下圆形", 18, 50);
  ctx.restore();
}

function drawTile(row, col, tile) {
  if (row >= 10 && !isInsideLowerCircle(row, col) && tile !== "E") {
    return;
  }

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
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  roundRect(x + 3, y + 3, cell - 2, cell - 2, 6);
  ctx.fill();
  ctx.fillStyle = "#23825b";
  roundRect(x + 2, y + 2, cell - 4, cell - 4, 6);
  ctx.fill();
  ctx.fillStyle = "#164733";
  ctx.beginPath();
  ctx.arc(x + cell * 0.28, y + cell * 0.3, cell * 0.13, 0, Math.PI * 2);
  ctx.arc(x + cell * 0.58, y + cell * 0.45, cell * 0.15, 0, Math.PI * 2);
  ctx.arc(x + cell * 0.42, y + cell * 0.7, cell * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 5, y + 5, cell - 10, cell - 10);
  ctx.lineWidth = 1;

  [
    [0.22, 0.23, "#ffd15f"],
    [0.68, 0.28, "#ff6fae"],
    [0.36, 0.62, "#ffffff"],
    [0.75, 0.72, "#ff8c3a"]
  ].forEach(([fx, fy, color], index) => {
    drawTinyFlower(x + cell * fx, y + cell * fy, color, index);
  });
}

function drawTinyFlower(x, y, color, phase = 0) {
  ctx.save();
  ctx.fillStyle = "#236b42";
  ctx.fillRect(x - 1, y + 2, 2, 7);
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i += 1) {
    const angle = (Math.PI * 2 * i) / 5 + phase * 0.18;
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * 4, y + Math.sin(angle) * 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.arc(x, y, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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
    ArrowUp: "forward",
    w: "forward",
    ArrowDown: "backward",
    s: "backward",
    ArrowLeft: "turnLeft",
    a: "turnLeft",
    ArrowRight: "turnRight",
    d: "turnRight"
  };
  const action = keyMoves[event.key];
  if (!action) return;
  event.preventDefault();
  moveCharacter(activePlayerId, action);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-move]");
  if (!button) return;
  const actions = {
    up: "forward",
    down: "backward",
    left: "turnLeft",
    right: "turnRight"
  };
  moveCharacter(button.dataset.player || activePlayerId, actions[button.dataset.move]);
});

canvas.addEventListener("click", (event) => {
  const viewer = players[activePlayerId] || players.p1;
  const visibleGuests = guests
    .filter((item) => !item.joined)
    .map((item) => ({ guest: item, ...getRelativePosition(viewer, item.row, item.col) }))
    .filter((item) => item.depth > 0 && item.depth <= 3 && Math.abs(item.lateral) <= 1);
  const guest = visibleGuests[0]?.guest;
  if (guest) {
    inviteGuest(guest);
    return;
  }
  const frontTile = getRelativeTile(viewer, 1, 0);
  if (isWall(frontTile.row, frontTile.col)) {
    statusEl.textContent = "你点到了前方树篱上的花朵：祝你顺利走出济州岛迷宫!";
    playBlessing();
  }
});

selectPlayer1.addEventListener("click", () => setActivePlayer("p1"));
selectPlayer2.addEventListener("click", () => setActivePlayer("p2"));
restartBtn.addEventListener("click", reset);
movieRestartBtn.addEventListener("click", reset);
setInterval(moveWanderingGuests, 700);

reset();
