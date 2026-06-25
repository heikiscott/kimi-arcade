const START_CASH = 300000;
const START_BANK = 200000;
const START_BILLS = 100000;
const CITY_PRICE_STEP = 100000;
const CITY_RENT_RATE = 0.1;
const PASS_START_BONUS = 50000;
const BAIL_AMOUNT = 25000;

const boardSpaces = [
  { name: "起点", type: "start", note: `经过或停留获得 ${money(PASS_START_BONUS)}` },
  { name: "香港", type: "property", color: "#8b5a3c" },
  { name: "机会", type: "chance" },
  { name: "新加坡", type: "property", color: "#8b5a3c" },
  { name: "城市税", type: "tax", amount: 50000 },
  { name: "东京", type: "property", color: "#4d5965" },
  { name: "首尔", type: "property", color: "#5d9cec" },
  { name: "命运", type: "chance" },
  { name: "曼谷", type: "property", color: "#5d9cec" },
  { name: "上海", type: "property", color: "#5d9cec" },
  { name: "探监", type: "jail", note: "只是路过" },
  { name: "迪拜", type: "property", color: "#d46bb3" },
  { name: "纽约", type: "property", color: "#e2a82f" },
  { name: "伦敦", type: "property", color: "#d46bb3" },
  { name: "巴黎", type: "property", color: "#d46bb3" },
  { name: "柏林", type: "property", color: "#4d5965" },
  { name: "悉尼", type: "property", color: "#f28b54" },
  { name: "机会", type: "chance" },
  { name: "墨尔本", type: "property", color: "#f28b54" },
  { name: "奥克兰", type: "property", color: "#f28b54" },
  { name: "免费停车", type: "free", note: "休息一回合也不错" },
  { name: "温哥华", type: "property", color: "#df4f45" },
  { name: "命运", type: "chance" },
  { name: "洛杉矶", type: "property", color: "#df4f45" },
  { name: "旧金山", type: "property", color: "#df4f45" },
  { name: "加拿大", type: "property", color: "#4d5965" },
  { name: "巴西", type: "property", color: "#60a96f" },
  { name: "阿根廷", type: "property", color: "#60a96f" },
  { name: "墨西哥", type: "property", color: "#2f9cbd" },
  { name: "智利", type: "property", color: "#60a96f" },
  { name: "入狱", type: "goToJail" },
  { name: "开罗", type: "property", color: "#2d75bb" },
  { name: "南非", type: "property", color: "#2d75bb" },
  { name: "机会", type: "chance" },
  { name: "印度", type: "property", color: "#2d75bb" },
  { name: "俄罗斯", type: "property", color: "#4d5965" },
  { name: "奢侈税", type: "tax", amount: 100000 },
  { name: "中国", type: "property", color: "#8f6fc9" },
  { name: "命运", type: "chance" },
  { name: "美国", type: "property", color: "#8f6fc9" }
];

const chanceCards = [
  { title: "城市分红", text: "你的城市项目分红到账。", amount: 50000 },
  { title: "道路维修", text: "你负责道路维修，需要支付一笔费用。", amount: -30000 },
  { title: "前进到起点", text: "城市庆典邀请你回到起点。", moveTo: 0, passStart: true },
  { title: "城市赞助", text: "每位对手给你一笔赞助金。", collectFromOthers: 20000 },
  { title: "停车罚单", text: "乱停被罚，需要支付罚金。", amount: -25000 },
  { title: "捷径", text: "沿小路前进 3 格。", moveBy: 3 },
  { title: "去探监", text: "移动到探监格，路上经过起点也照常结算。", moveTo: 10, passStart: true },
  { title: "租金补贴", text: "城市补贴你的物业。", amount: 40000 }
];

const players = [
  { id: 0, name: "超级马里奥", cash: START_CASH, bankCard: START_BANK, cashBills: START_BILLS, position: 0, color: "#d92b2b", avatar: "mario", avatarLetter: "M", inJail: false, jailTurns: 0, bankrupt: false },
  { id: 1, name: "路易斯", cash: START_CASH, bankCard: START_BANK, cashBills: START_BILLS, position: 0, color: "#26934f", avatar: "luigi", avatarLetter: "L", inJail: false, jailTurns: 0, bankrupt: false }
];

priceCities();

const state = {
  currentPlayer: 0,
  hasRolled: false,
  lastRoll: [1, 1],
  pendingBuy: false,
  runQueue: [],
  selectedPlayer: null,
  gameOver: false
};

const board = document.querySelector("#board");
const playersEl = document.querySelector("#players");
const miniLedger = document.querySelector("#miniLedger");
const propertyCard = document.querySelector("#propertyCard");
const logEl = document.querySelector("#log");
const rollBtn = document.querySelector("#rollBtn");
const buyBtn = document.querySelector("#buyBtn");
const skipBuyBtn = document.querySelector("#skipBuyBtn");
const endBtn = document.querySelector("#endBtn");
const resetBtn = document.querySelector("#resetBtn");
const dieOne = document.querySelector("#dieOne");
const dieTwo = document.querySelector("#dieTwo");
const turnTitle = document.querySelector("#turnTitle");
const turnDot = document.querySelector("#turnDot");
const modal = document.querySelector("#cardModal");
const modalLabel = document.querySelector("#modalLabel");
const modalTitle = document.querySelector("#modalTitle");
const modalText = document.querySelector("#modalText");
const modalClose = document.querySelector("#modalClose");

function isPurchasable(space) {
  return ["property", "station", "utility"].includes(space.type);
}

function activePlayer() {
  return players[state.currentPlayer];
}

function ownerOf(index) {
  return players.find((player) => player.properties?.includes(index));
}

function money(value) {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (absolute >= 10000) {
    const amount = absolute / 10000;
    return `${sign}${amount.toLocaleString("zh-CN", { maximumFractionDigits: 1 })}万`;
  }
  return `${sign}${absolute.toLocaleString("zh-CN")}`;
}

function priceCities() {
  let cityNumber = 1;
  boardSpaces.forEach((space) => {
    if (!isPurchasable(space)) return;
    space.price = cityNumber * CITY_PRICE_STEP;
    space.rent = Math.round(space.price * CITY_RENT_RATE);
    cityNumber += 1;
  });
}

function addLog(text) {
  const item = document.createElement("li");
  item.textContent = text;
  logEl.prepend(item);
  while (logEl.children.length > 9) {
    logEl.lastChild.remove();
  }
}

function renderBoard() {
  const oldSpaces = board.querySelectorAll(".space");
  oldSpaces.forEach((space) => space.remove());

  boardSpaces.forEach((space, index) => {
    const el = document.createElement("button");
    el.className = `space ${space.type}`;
    el.type = "button";
    el.dataset.index = index;
    el.style.gridArea = gridAreaFor(index);
    el.addEventListener("dragover", allowTokenDrop);
    el.addEventListener("drop", handleTokenDrop);
    el.addEventListener("dragenter", () => el.classList.add("drop-target"));
    el.addEventListener("dragleave", () => el.classList.remove("drop-target"));

    if (isPurchasable(space)) {
      const strip = document.createElement("span");
      strip.className = "color-strip";
      strip.style.background = space.color;
      el.append(strip);
    }

    const name = document.createElement("span");
    name.className = "space-name";
    name.textContent = space.name;

    const meta = document.createElement("span");
    meta.className = "space-meta";
    meta.textContent = space.price ? `${money(space.price)} / 租 ${money(space.rent)}` : labelFor(space);

    const tokenRail = document.createElement("span");
    tokenRail.className = "token-rail";

    el.append(name, meta, tokenRail);
    el.addEventListener("click", () => handleSpaceClick(index));
    board.append(el);
  });
}

function gridAreaFor(index) {
  if (index === 0) return "11 / 11";
  if (index < 10) return `11 / ${11 - index}`;
  if (index === 10) return "11 / 1";
  if (index < 20) return `${21 - index} / 1`;
  if (index === 20) return "1 / 1";
  if (index < 30) return `1 / ${index - 19}`;
  if (index === 30) return "1 / 11";
  return `${index - 29} / 11`;
}

function labelFor(space) {
  const labels = {
    start: `+${money(PASS_START_BONUS)}`,
    chance: "抽卡",
    tax: `缴 ${money(space.amount)}`,
    jail: "探监",
    free: "免费",
    goToJail: "入狱"
  };
  return labels[space.type] || "";
}

function renderTokens() {
  document.querySelectorAll(".token-rail").forEach((rail) => {
    rail.innerHTML = "";
  });

  players.forEach((player) => {
    if (player.bankrupt) return;
    const rail = document.querySelector(`.space[data-index="${player.position}"] .token-rail`);
    const token = createAvatarToken(player, `token ${state.selectedPlayer === player.id ? "selected" : ""}`);
    token.draggable = true;
    token.dataset.playerId = player.id;
    token.title = player.name;
    token.addEventListener("click", handleTokenSelect);
    token.addEventListener("dragstart", handleTokenDragStart);
    token.addEventListener("dragend", clearDropTargets);
    rail?.append(token);
  });
}

function createAvatarToken(player, className) {
  const token = document.createElement("span");
  token.className = `${className} avatar-token avatar-token--${player.avatar}`;
  token.style.setProperty("--player-color", player.color);
  token.setAttribute("aria-label", player.name);
  token.innerHTML = avatarMarkup(player);
  return token;
}

function avatarMarkup(player) {
  const capColor = player.color;
  const letter = player.avatarLetter;
  return `
    <svg class="avatar-svg" viewBox="0 0 60 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <!-- ears -->
      <ellipse cx="10" cy="36" rx="4.5" ry="6" fill="#f5c28f" stroke="#2a1a0e" stroke-width="1.5"/>
      <ellipse cx="50" cy="36" rx="4.5" ry="6" fill="#f5c28f" stroke="#2a1a0e" stroke-width="1.5"/>
      <!-- face -->
      <ellipse cx="30" cy="36" rx="18" ry="20" fill="#f5c28f" stroke="#2a1a0e" stroke-width="1.8"/>
      <!-- hair sides -->
      <path d="M 13 32 Q 14 26 18 24 L 18 32 Z" fill="#3a1d0a"/>
      <path d="M 47 32 Q 46 26 42 24 L 42 32 Z" fill="#3a1d0a"/>
      <!-- nose -->
      <ellipse cx="30" cy="40" rx="6" ry="5" fill="#e89b6a" stroke="#2a1a0e" stroke-width="1.5"/>
      <circle cx="28" cy="40" r="1.2" fill="#2a1a0e" opacity="0.5"/>
      <!-- eyes -->
      <ellipse cx="22" cy="31" rx="2.4" ry="3.2" fill="#fff" stroke="#2a1a0e" stroke-width="1"/>
      <ellipse cx="38" cy="31" rx="2.4" ry="3.2" fill="#fff" stroke="#2a1a0e" stroke-width="1"/>
      <ellipse cx="22.5" cy="32" rx="1.2" ry="1.8" fill="#1f3a8a"/>
      <ellipse cx="38.5" cy="32" rx="1.2" ry="1.8" fill="#1f3a8a"/>
      <!-- eyebrows -->
      <rect x="17" y="25" width="9" height="2.4" rx="1" fill="#3a1d0a"/>
      <rect x="34" y="25" width="9" height="2.4" rx="1" fill="#3a1d0a"/>
      <!-- mustache -->
      <path d="M 18 45 Q 22 47 30 46 Q 38 47 42 45 Q 40 52 32 52 Q 30 53 28 52 Q 20 52 18 45 Z"
            fill="#3a1d0a" stroke="#1a0d05" stroke-width="0.8"/>
      <!-- mouth -->
      <path d="M 27 50 Q 30 52 33 50" stroke="#2a1a0e" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <!-- cap brim -->
      <ellipse cx="30" cy="22" rx="22" ry="4" fill="${capColor}" stroke="#2a1a0e" stroke-width="1.8"/>
      <!-- cap dome -->
      <path d="M 12 22 Q 14 4 30 4 Q 46 4 48 22 Z" fill="${capColor}" stroke="#2a1a0e" stroke-width="1.8"/>
      <!-- cap emblem -->
      <circle cx="30" cy="15" r="6.5" fill="#fff" stroke="#2a1a0e" stroke-width="1.2"/>
      <text x="30" y="18.5" text-anchor="middle" font-family="Arial Black, sans-serif"
            font-size="9" font-weight="900" fill="${capColor}">${letter}</text>
    </svg>
  `;
}

function renderPlayers() {
  playersEl.innerHTML = "";
  players.forEach((player) => {
    const card = document.createElement("article");
    card.className = `player-card ${player.id === state.currentPlayer && !state.gameOver ? "active" : ""}`;
    card.style.setProperty("--player-color", player.color);
    const owned = player.properties?.length || 0;
    card.innerHTML = `
      <div class="player-top">
        <span class="player-token avatar-token avatar-token--${player.avatar}" aria-label="${player.name}">
          ${avatarMarkup(player)}
        </span>
        <strong>${player.name}</strong>
        <span class="cash">${money(player.cash)}</span>
      </div>
      <div class="wallet">
        <span class="wallet-pill bank" title="银行卡余额">💳 ${money(player.bankCard)}</span>
        <span class="wallet-pill bills" title="纸币现金">💵 ${money(player.cashBills)}</span>
      </div>
      <div class="player-stats">
        <span>位置：${boardSpaces[player.position].name}</span>
        <span>城市：${owned}</span>
        <span>${player.inJail ? `监狱 ${player.jailTurns}/2` : player.bankrupt ? "破产" : "自由行动"}</span>
      </div>
    `;
    playersEl.append(card);
  });
}

function renderMiniLedger() {
  miniLedger.innerHTML = "";
  players.forEach((player) => {
    const line = document.createElement("div");
    line.innerHTML = `<span style="background:${player.color}"></span>${player.name}: ${money(player.cash)}`;
    miniLedger.append(line);
  });
}

function renderControls() {
  const player = activePlayer();
  turnTitle.textContent = state.gameOver ? "游戏结束" : player.name;
  turnDot.style.background = player.color;
  dieOne.textContent = state.lastRoll[0];
  dieTwo.textContent = state.lastRoll[1];
  rollBtn.disabled = state.hasRolled || state.gameOver;
  buyBtn.disabled = !state.pendingBuy || state.gameOver;
  skipBuyBtn.disabled = !state.pendingBuy || state.gameOver;
  endBtn.disabled = !state.hasRolled || state.gameOver;
}

function render() {
  renderTokens();
  renderPlayers();
  renderMiniLedger();
  renderControls();
  showProperty(activePlayer().position);
  playQueuedRuns();
}

function queueRun(player, fromIndex, toIndex) {
  if (!player || fromIndex === toIndex || !Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) return;
  const existing = state.runQueue.find((run) => run.playerId === player.id);
  if (existing) {
    existing.toIndex = toIndex;
    return;
  }
  state.runQueue.push({ playerId: player.id, fromIndex, toIndex });
}

function playQueuedRuns() {
  const runs = state.runQueue.splice(0);
  runs.forEach((run) => requestAnimationFrame(() => playRun(run)));
}

function playRun(run) {
  const player = players[run.playerId];
  const targetToken = document.querySelector(`.token[data-player-id="${run.playerId}"]`);
  if (!player || !targetToken) return;

  const path = [];
  const total = boardSpaces.length;
  let cursor = run.fromIndex;
  while (cursor !== run.toIndex) {
    cursor = (cursor + 1) % total;
    path.push(cursor);
    if (path.length > total) break;
  }
  if (path.length === 0) return;

  const boardRect = board.getBoundingClientRect();
  const pointAt = (index) => {
    const space = document.querySelector(`.space[data-index="${index}"]`);
    if (!space) return null;
    const rect = space.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - boardRect.left,
      y: rect.top + rect.height - 17 - boardRect.top
    };
  };

  const startPoint = pointAt(run.fromIndex);
  if (!startPoint) return;

  const runner = createAvatarToken(player, "token board-runner is-running");
  runner.style.left = `${startPoint.x}px`;
  runner.style.top = `${startPoint.y}px`;
  board.append(runner);
  targetToken.style.opacity = "0";

  const stepDuration = 220;
  let prevX = 0;
  let prevY = 0;

  const stepThrough = async () => {
    for (const index of path) {
      const point = pointAt(index);
      if (!point) continue;
      const dx = point.x - startPoint.x;
      const dy = point.y - startPoint.y;
      const facing = dx < prevX - 0.5 ? -1 : dx > prevX + 0.5 ? 1 : 0;
      if (facing !== 0) runner.style.setProperty("--facing", facing);
      const animation = runner.animate(
        [
          { transform: `translate(-50%, -50%) translate(${prevX}px, ${prevY}px) scaleX(var(--facing, 1)) translateY(0)` },
          { transform: `translate(-50%, -50%) translate(${(prevX + dx) / 2}px, ${(prevY + dy) / 2}px) scaleX(var(--facing, 1)) translateY(-10px)`, offset: 0.5 },
          { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scaleX(var(--facing, 1)) translateY(0)` }
        ],
        { duration: stepDuration, easing: "ease-in-out", fill: "forwards" }
      );
      await animation.finished.catch(() => {});
      prevX = dx;
      prevY = dy;
    }
    runner.remove();
    targetToken.style.opacity = "";
    targetToken.classList.add("is-running");
    setTimeout(() => targetToken.classList.remove("is-running"), 360);
  };

  stepThrough();
}

function showProperty(index) {
  const space = boardSpaces[index];
  const owner = ownerOf(index);
  const ownerText = owner ? `<p><strong>拥有者：</strong>${owner.name}</p>` : "";
  const buyText = isPurchasable(space)
    ? `<p><strong>价格：</strong>${money(space.price)}　<strong>租金：</strong>${money(space.rent)}</p>`
    : `<p>${space.note || labelFor(space)}</p>`;

  propertyCard.innerHTML = `
    <p class="label">当前城市/国家</p>
    <h3>${space.name}</h3>
    ${buyText}
    ${ownerText}
  `;
}

function handleSpaceClick(index) {
  if (state.selectedPlayer !== null) {
    const player = players[state.selectedPlayer];
    state.selectedPlayer = null;
    moveTokenTo(player, index);
    return;
  }

  showProperty(index);
}

function updateCash(player, amount) {
  player.cash += amount;
  if (amount >= 0) {
    player.bankCard += amount;
  } else {
    let remaining = -amount;
    const fromBills = Math.min(player.cashBills, remaining);
    player.cashBills -= fromBills;
    remaining -= fromBills;
    player.bankCard -= remaining;
  }
  if (player.cash < 0) {
    player.bankrupt = true;
    addLog(`${player.name} 资金不足，破产了。`);
    releaseProperties(player);
    checkWinner();
  }
}

function handleTokenSelect(event) {
  event.stopPropagation();
  const playerId = Number(event.currentTarget.dataset.playerId);
  const player = players[playerId];
  if (!player || player.bankrupt || state.gameOver) return;
  state.selectedPlayer = state.selectedPlayer === playerId ? null : playerId;
  render();
}

function allowTokenDrop(event) {
  event.preventDefault();
}

function handleTokenDragStart(event) {
  event.dataTransfer.setData("text/plain", event.currentTarget.dataset.playerId);
  event.dataTransfer.effectAllowed = "move";
}

function clearDropTargets() {
  document.querySelectorAll(".drop-target").forEach((space) => {
    space.classList.remove("drop-target");
  });
}

function handleTokenDrop(event) {
  event.preventDefault();
  clearDropTargets();
  if (state.gameOver) return;

  const playerId = Number(event.dataTransfer.getData("text/plain"));
  const targetIndex = Number(event.currentTarget.dataset.index);
  const player = players[playerId];
  if (!player || player.bankrupt || !Number.isInteger(targetIndex)) return;

  moveTokenTo(player, targetIndex);
}

function moveTokenTo(player, targetIndex) {
  if (!player || player.bankrupt || state.gameOver) return;

  state.currentPlayer = player.id;
  state.hasRolled = true;
  state.pendingBuy = false;
  state.selectedPlayer = null;
  const oldPosition = player.position;
  player.position = targetIndex;
  queueRun(player, oldPosition, player.position);

  if (targetIndex !== 10) {
    player.inJail = false;
    player.jailTurns = 0;
  }

  if (targetIndex < oldPosition) {
    updateCash(player, PASS_START_BONUS);
    addLog(`${player.name} 经过起点，获得 ${money(PASS_START_BONUS)}。`);
  }

  addLog(`${player.name} 被手动移动到 ${boardSpaces[targetIndex].name}。`);
  resolveLanding(player);
  render();
}

function releaseProperties(player) {
  player.properties = [];
}

function rollDice() {
  if (state.hasRolled || state.gameOver) return;
  const player = activePlayer();
  state.lastRoll = [randomDie(), randomDie()];
  state.hasRolled = true;

  if (player.inJail) {
    handleJailRoll(player);
  } else {
    const steps = state.lastRoll[0] + state.lastRoll[1];
    movePlayer(player, steps);
    resolveLanding(player);
  }

  render();
}

function randomDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function handleJailRoll(player) {
  const isDouble = state.lastRoll[0] === state.lastRoll[1];
  player.jailTurns += 1;

  if (isDouble) {
    player.inJail = false;
    player.jailTurns = 0;
    addLog(`${player.name} 掷出对子，离开监狱。`);
    movePlayer(player, state.lastRoll[0] + state.lastRoll[1]);
    resolveLanding(player);
  } else if (player.jailTurns >= 2) {
    updateCash(player, -BAIL_AMOUNT);
    player.inJail = false;
    player.jailTurns = 0;
    addLog(`${player.name} 支付 ${money(BAIL_AMOUNT)} 保释金离开监狱。`);
  } else {
    addLog(`${player.name} 没有掷出对子，本回合留在监狱。`);
  }
}

function movePlayer(player, steps) {
  const oldPosition = player.position;
  player.position = (player.position + steps) % boardSpaces.length;
  queueRun(player, oldPosition, player.position);
  if (player.position < oldPosition) {
    updateCash(player, PASS_START_BONUS);
    addLog(`${player.name} 经过起点，获得 ${money(PASS_START_BONUS)}。`);
  }
  addLog(`${player.name} 前进 ${steps} 格，到达 ${boardSpaces[player.position].name}。`);
}

function moveTo(player, target, collectStart) {
  const oldPosition = player.position;
  player.position = target;
  queueRun(player, oldPosition, player.position);
  if (collectStart && target <= oldPosition) {
    updateCash(player, PASS_START_BONUS);
    addLog(`${player.name} 经过起点，获得 ${money(PASS_START_BONUS)}。`);
  }
  addLog(`${player.name} 移动到 ${boardSpaces[player.position].name}。`);
}

function resolveLanding(player) {
  if (player.bankrupt) return;
  state.pendingBuy = false;
  const space = boardSpaces[player.position];
  const owner = ownerOf(player.position);

  if (isPurchasable(space)) {
    if (!owner) {
      if (player.cash >= space.price) {
        state.pendingBuy = true;
        addLog(`${space.name} 尚未出售，${player.name} 可以购买。`);
      } else {
        addLog(`${player.name} 现金不足，买不起 ${space.name}。`);
      }
    } else if (owner.id !== player.id) {
      updateCash(player, -space.rent);
      updateCash(owner, space.rent);
      addLog(`${player.name} 向 ${owner.name} 支付 ${space.name} 租金 ${money(space.rent)}。`);
    } else {
      addLog(`${player.name} 回到自己的 ${space.name}。`);
    }
    return;
  }

  if (space.type === "tax") {
    updateCash(player, -space.amount);
    addLog(`${player.name} 支付 ${space.name} ${money(space.amount)}。`);
  }

  if (space.type === "chance") {
    drawChance(player);
  }

  if (space.type === "goToJail") {
    sendToJail(player);
  }
}

function drawChance(player) {
  const card = chanceCards[Math.floor(Math.random() * chanceCards.length)];
  modalLabel.textContent = "机会卡";
  modalTitle.textContent = card.title;
  modalText.textContent = card.text;
  modal.hidden = false;

  if (card.amount) {
    updateCash(player, card.amount);
  }

  if (card.collectFromOthers) {
    players.forEach((other) => {
      if (other.id !== player.id && !other.bankrupt) {
        updateCash(other, -card.collectFromOthers);
        updateCash(player, card.collectFromOthers);
      }
    });
  }

  if (Number.isInteger(card.moveTo)) {
    moveTo(player, card.moveTo, Boolean(card.passStart));
    resolveLanding(player);
  }

  if (card.moveBy) {
    movePlayer(player, card.moveBy);
    resolveLanding(player);
  }

  addLog(`${player.name} 抽到「${card.title}」。`);
}

function sendToJail(player) {
  const oldPosition = player.position;
  player.position = 10;
  queueRun(player, oldPosition, player.position);
  player.inJail = true;
  player.jailTurns = 0;
  addLog(`${player.name} 被送入监狱。`);
}

function buyCurrentProperty() {
  if (!state.pendingBuy || state.gameOver) return;
  const player = activePlayer();
  const index = player.position;
  const space = boardSpaces[index];
  if (!isPurchasable(space) || ownerOf(index) || player.cash < space.price) return;

  updateCash(player, -space.price);
  player.properties = [...(player.properties || []), index];
  state.pendingBuy = false;
  addLog(`${player.name} 购买了 ${space.name}。`);
  render();
}

function skipCurrentProperty() {
  if (!state.pendingBuy || state.gameOver) return;
  const player = activePlayer();
  const space = boardSpaces[player.position];
  state.pendingBuy = false;
  addLog(`${player.name} 没有购买 ${space.name}，没有扣钱。`);
  render();
}

function endTurn() {
  if (!state.hasRolled || state.gameOver) return;
  state.hasRolled = false;
  state.pendingBuy = false;

  let next = (state.currentPlayer + 1) % players.length;
  while (players[next].bankrupt) {
    next = (next + 1) % players.length;
  }
  state.currentPlayer = next;
  addLog(`轮到 ${activePlayer().name}。`);
  render();
}

function checkWinner() {
  const alive = players.filter((player) => !player.bankrupt);
  if (alive.length === 1) {
    state.gameOver = true;
    state.pendingBuy = false;
    modalLabel.textContent = "游戏结束";
    modalTitle.textContent = `${alive[0].name} 获胜`;
    modalText.textContent = "对手已经破产，你成为财富街区的新主人。";
    modal.hidden = false;
    addLog(`${alive[0].name} 获胜。`);
  }
}

function resetGame() {
  players.forEach((player) => {
    player.cash = START_CASH;
    player.position = 0;
    player.inJail = false;
    player.jailTurns = 0;
    player.bankrupt = false;
    player.properties = [];
  });
  state.currentPlayer = 0;
  state.hasRolled = false;
  state.pendingBuy = false;
  state.runQueue = [];
  state.selectedPlayer = null;
  state.gameOver = false;
  state.lastRoll = [1, 1];
  logEl.innerHTML = "";
  modal.hidden = true;
  addLog("新游戏开始。");
  render();
}

rollBtn.addEventListener("click", rollDice);
buyBtn.addEventListener("click", buyCurrentProperty);
skipBuyBtn.addEventListener("click", skipCurrentProperty);
endBtn.addEventListener("click", endTurn);
resetBtn.addEventListener("click", resetGame);
modalClose.addEventListener("click", () => {
  modal.hidden = true;
});

renderBoard();
resetGame();
