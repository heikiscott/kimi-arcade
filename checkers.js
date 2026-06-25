const boardEl = document.querySelector("#checkerBoard");
const turnText = document.querySelector("#turnText");
const statusText = document.querySelector("#statusText");
const logEl = document.querySelector("#log");

let pieces;
let current = "red";
let selected = null;
let gameOver = false;

function startPieces() {
  const list = [];
  for (let y = 0; y < 3; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      if ((x + y) % 2 === 1) list.push({ color: "blue", x, y });
    }
  }
  for (let y = 5; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      if ((x + y) % 2 === 1) list.push({ color: "red", x, y });
    }
  }
  return list;
}

function addLog(text) {
  const li = document.createElement("li");
  li.textContent = text;
  logEl.prepend(li);
}

function pieceAt(x, y) {
  return pieces.find((piece) => piece.x === x && piece.y === y);
}

function render() {
  boardEl.innerHTML = "";
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const cell = document.createElement("button");
      cell.className = `checker-cell ${(x + y) % 2 ? "dark" : "light"}`;
      cell.type = "button";
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.addEventListener("click", () => clickCell(x, y));
      const piece = pieceAt(x, y);
      if (piece) {
        const token = document.createElement("span");
        token.className = `piece ${piece.color} ${selected === piece ? "selected" : ""}`;
        token.textContent = piece.color === "red" ? "红" : "蓝";
        cell.append(token);
      }
      boardEl.append(cell);
    }
  }
  turnText.textContent = current === "red" ? "红方" : "蓝方";
}

function clickCell(x, y) {
  if (gameOver) return;
  const piece = pieceAt(x, y);
  if (piece && piece.color === current) {
    selected = piece;
    render();
    return;
  }
  if (!selected) return;

  const dx = x - selected.x;
  const dy = y - selected.y;
  const forward = current === "red" ? -1 : 1;
  const targetOccupied = Boolean(pieceAt(x, y));
  const simpleMove = Math.abs(dx) === 1 && dy === forward && !targetOccupied;
  const jumpMove = Math.abs(dx) === 2 && dy === forward * 2 && !targetOccupied;

  if (simpleMove) {
    selected.x = x;
    selected.y = y;
    addLog(`${nameOf(current)} 移动一步。`);
    nextTurn();
    return;
  }

  if (jumpMove) {
    const middle = pieceAt(selected.x + dx / 2, selected.y + dy / 2);
    if (middle && middle.color !== current) {
      pieces = pieces.filter((item) => item !== middle);
      selected.x = x;
      selected.y = y;
      addLog(`${nameOf(current)} 跳吃一枚棋子。`);
      checkWin();
      nextTurn();
      return;
    }
  }

  lose(`${nameOf(current)} 犯规，${nameOf(otherColor())} 获胜。`);
}

function nextTurn() {
  selected = null;
  current = otherColor();
  render();
}

function otherColor() {
  return current === "red" ? "blue" : "red";
}

function nameOf(color) {
  return color === "red" ? "红方" : "蓝方";
}

function lose(text) {
  gameOver = true;
  statusText.textContent = text;
  addLog(text);
  render();
}

function checkWin() {
  const redLeft = pieces.some((piece) => piece.color === "red");
  const blueLeft = pieces.some((piece) => piece.color === "blue");
  if (!redLeft || !blueLeft) {
    gameOver = true;
    statusText.textContent = redLeft ? "红方获胜。" : "蓝方获胜。";
  }
}

function reset() {
  pieces = startPieces();
  current = "red";
  selected = null;
  gameOver = false;
  statusText.textContent = "点自己的棋子，再点目标格。走错就是犯规判负。";
  logEl.innerHTML = "";
  addLog("新一局开始。");
  render();
}

document.querySelector("#resetBtn").addEventListener("click", reset);
reset();
