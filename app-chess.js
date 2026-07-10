const boardEl = document.querySelector("#board");
const statusText = document.querySelector("#statusText");
const blueScoreEl = document.querySelector("#blueScore");
const orangeScoreEl = document.querySelector("#orangeScore");
const turnText = document.querySelector("#turnText");
const hintBtn = document.querySelector("#hintBtn");
const restartBtn = document.querySelector("#restartBtn");

const SIZE = 7;
const startPieces = [
  { id: "b-home", team: "blue", label: "主", x: 3, y: 6, home: true },
  { id: "b-chat", team: "blue", label: "聊", x: 1, y: 6 },
  { id: "b-map", team: "blue", label: "图", x: 2, y: 5 },
  { id: "b-music", team: "blue", label: "音", x: 4, y: 5 },
  { id: "b-camera", team: "blue", label: "相", x: 5, y: 6 },
  { id: "o-home", team: "orange", label: "主", x: 3, y: 0, home: true },
  { id: "o-chat", team: "orange", label: "聊", x: 1, y: 0 },
  { id: "o-map", team: "orange", label: "图", x: 2, y: 1 },
  { id: "o-music", team: "orange", label: "音", x: 4, y: 1 },
  { id: "o-camera", team: "orange", label: "相", x: 5, y: 0 }
];

let pieces = [];
let selectedId = "";
let turn = "blue";
let blueScore = 0;
let orangeScore = 0;
let winner = "";

function resetGame() {
  pieces = startPieces.map((piece) => ({ ...piece }));
  selectedId = "";
  turn = "blue";
  blueScore = 0;
  orangeScore = 0;
  winner = "";
  say("蓝队先走。点自己的应用，再点附近一格移动；碰到对方应用就吃掉。");
  render();
}

function say(text) {
  statusText.textContent = text;
}

function pieceAt(x, y) {
  return pieces.find((piece) => piece.x === x && piece.y === y);
}

function isNear(piece, x, y) {
  return Math.max(Math.abs(piece.x - x), Math.abs(piece.y - y)) === 1;
}

function legalTargets(piece) {
  const targets = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (!isNear(piece, x, y)) continue;
      const target = pieceAt(x, y);
      if (!target || target.team !== piece.team) targets.push(`${x},${y}`);
    }
  }
  return targets;
}

function selectPiece(piece) {
  if (winner) return;
  if (piece.team !== turn) {
    say(`现在是${turn === "blue" ? "蓝队" : "橙队"}走，不能动对方应用。`);
    return;
  }
  selectedId = piece.id;
  say(`选中了${turn === "blue" ? "蓝队" : "橙队"}的“${piece.label}”应用。`);
  render();
}

function moveSelected(x, y) {
  if (winner || !selectedId) return;
  const piece = pieces.find((item) => item.id === selectedId);
  if (!piece || !isNear(piece, x, y)) {
    say("只能走到旁边一格，横、竖、斜都可以。");
    return;
  }
  const target = pieceAt(x, y);
  if (target && target.team === piece.team) {
    say("这里是自己队友，不能走到同一个格子。");
    return;
  }
  if (target) {
    pieces = pieces.filter((item) => item.id !== target.id);
    if (piece.team === "blue") blueScore += 1;
    else orangeScore += 1;
    if (target.home) {
      winner = piece.team;
      piece.x = x;
      piece.y = y;
      say(`${piece.team === "blue" ? "蓝队" : "橙队"}吃到主页，赢了！`);
      selectedId = "";
      render();
      return;
    }
  }
  piece.x = x;
  piece.y = y;
  if (blueScore >= 5 || orangeScore >= 5) {
    winner = blueScore >= 5 ? "blue" : "orange";
    say(`${winner === "blue" ? "蓝队" : "橙队"}先得 5 分，赢了！`);
  } else {
    turn = turn === "blue" ? "orange" : "blue";
    say(`轮到${turn === "blue" ? "蓝队" : "橙队"}走。`);
  }
  selectedId = "";
  render();
}

function handleCell(x, y) {
  const piece = pieceAt(x, y);
  if (selectedId) {
    if (piece && piece.team === turn && piece.id !== selectedId) selectPiece(piece);
    else moveSelected(x, y);
    return;
  }
  if (piece) selectPiece(piece);
  else say("先点一个自己队伍的应用。");
}

function render() {
  const selected = pieces.find((piece) => piece.id === selectedId);
  const targets = selected ? legalTargets(selected) : [];
  boardEl.innerHTML = "";
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      if (selected && selected.x === x && selected.y === y) cell.classList.add("selected");
      if (targets.includes(`${x},${y}`)) cell.classList.add("move");
      const piece = pieceAt(x, y);
      if (piece) {
        const marker = document.createElement("span");
        marker.className = `piece ${piece.team}${piece.home ? " home" : ""}`;
        marker.textContent = piece.label;
        cell.appendChild(marker);
      }
      cell.addEventListener("click", () => handleCell(x, y));
      boardEl.appendChild(cell);
    }
  }
  blueScoreEl.textContent = blueScore;
  orangeScoreEl.textContent = orangeScore;
  turnText.textContent = winner ? `${winner === "blue" ? "蓝队" : "橙队"}赢` : turn === "blue" ? "蓝队" : "橙队";
}

hintBtn.addEventListener("click", () => {
  say("提示：先保护自己的“主”应用，再用“聊、图、音、相”去吃对方应用。黄色格子是能走的位置。");
});
restartBtn.addEventListener("click", resetGame);

resetGame();
