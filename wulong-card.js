const colors = [
  { id: "red", name: "红" },
  { id: "yellow", name: "黄" },
  { id: "blue", name: "蓝" },
  { id: "green", name: "绿" }
];

const colorNames = Object.fromEntries(colors.map((color) => [color.id, color.name]));
const setupPanel = document.querySelector("#setupPanel");
const playArea = document.querySelector("#playArea");
const playerCountInput = document.querySelector("#playerCount");
const handSizeInput = document.querySelector("#handSize");
const dealerGenderInput = document.querySelector("#dealerGender");
const stackRuleInput = document.querySelector("#stackRule");
const playerSetupEl = document.querySelector("#playerSetup");
const startBtn = document.querySelector("#startBtn");
const newSetupBtn = document.querySelector("#newSetupBtn");
const tableSceneEl = document.querySelector("#tableScene");
const opponentRing = document.querySelector("#opponentRing");
const myHandEl = document.querySelector("#myHand");
const myCountEl = document.querySelector("#myCount");
const myTitleEl = document.querySelector("#myTitle");
const deckCountEl = document.querySelector("#deckCount");
const discardCardEl = document.querySelector("#discardCard");
const currentColorEl = document.querySelector("#currentColor");
const directionTextEl = document.querySelector("#directionText");
const penaltyTextEl = document.querySelector("#penaltyText");
const dealerAvatarEl = document.querySelector("#dealerAvatar");
const dealerTextEl = document.querySelector("#dealerText");
const messageEl = document.querySelector("#message");
const drawBtn = document.querySelector("#drawBtn");
const passBtn = document.querySelector("#passBtn");
const colorButtons = {
  red: document.querySelector("#wildRed"),
  yellow: document.querySelector("#wildYellow"),
  blue: document.querySelector("#wildBlue"),
  green: document.querySelector("#wildGreen")
};

let game = null;

const countries = ["中国", "美国", "日本", "韩国", "新加坡", "法国", "英国", "加拿大"];
const defaultNames = ["Kimi", "Emma", "Lucas", "Mia", "Noah", "Sofia"];

function makeDeck() {
  const deck = [];
  colors.forEach((color) => {
    deck.push({ color: color.id, type: "number", value: 0, label: "0" });
    for (let n = 1; n <= 9; n += 1) {
      deck.push({ color: color.id, type: "number", value: n, label: String(n) });
      deck.push({ color: color.id, type: "number", value: n, label: String(n) });
    }
    ["reverse", "skip", "draw2"].forEach((type) => {
      deck.push(makeActionCard(color.id, type));
      deck.push(makeActionCard(color.id, type));
    });
  });
  for (let i = 0; i < 4; i += 1) {
    deck.push({ color: "wild", type: "wild", label: "变色" });
    deck.push({ color: "wild", type: "draw4", label: "+4" });
  }
  return shuffle(deck);
}

function makeActionCard(color, type) {
  const labels = {
    reverse: "反转",
    skip: "禁止",
    draw2: "+2"
  };
  return { color, type, label: labels[type] };
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderPlayerSetup() {
  const total = Number(playerCountInput.value);
  playerSetupEl.innerHTML = "";
  for (let index = 0; index < total; index += 1) {
    const row = document.createElement("div");
    row.className = "player-row";
    row.innerHTML = `
      <strong>玩家${index + 1}</strong>
      <label>
        名字
        <input class="player-name" value="${defaultNames[index] || `玩家${index + 1}`}" />
      </label>
      <label>
        控制
        <select class="player-control">
          <option value="human" ${index === 0 ? "selected" : ""}>本机人工</option>
          <option value="bot" ${index !== 0 ? "selected" : ""}>电脑控制</option>
        </select>
      </label>
      <label>
        性别
        <select class="player-gender">
          <option value="male" ${index % 2 === 0 ? "selected" : ""}>男</option>
          <option value="female" ${index % 2 === 1 ? "selected" : ""}>女</option>
        </select>
      </label>
      <label>
        国家
        <select class="player-country">
          ${countries.map((country, countryIndex) => `<option value="${country}" ${countryIndex === index % countries.length ? "selected" : ""}>${country}</option>`).join("")}
        </select>
      </label>
    `;
    playerSetupEl.append(row);
  }
}

function readPlayerConfigs() {
  const rows = [...playerSetupEl.querySelectorAll(".player-row")];
  const configs = rows.map((row, index) => ({
    id: index === 0 ? "me" : `player-${index + 1}`,
    name: row.querySelector(".player-name").value.trim() || `玩家${index + 1}`,
    isHuman: row.querySelector(".player-control").value === "human",
    gender: row.querySelector(".player-gender").value,
    country: row.querySelector(".player-country").value,
    hand: []
  }));
  if (!configs.some((player) => player.isHuman)) configs[0].isHuman = true;
  return configs;
}

function startGame() {
  const players = readPlayerConfigs();
  const handSize = players.length === 2 ? 7 : 6;
  const stacking = stackRuleInput.checked;
  const deck = makeDeck();
  players.forEach((player) => {
    player.hand = deck.splice(0, handSize);
  });

  let first = deck.shift();
  while (first.color === "wild") {
    deck.push(first);
    first = deck.shift();
  }

  game = {
    players,
    deck,
    discard: [first],
    currentColor: first.color,
    turnIndex: 0,
    direction: 1,
    pendingDraw: 0,
    pendingSource: null,
    stacking,
    dealerGender: dealerGenderInput.value,
    over: false,
    waitingForColor: false
  };

  setupPanel.style.display = "none";
  playArea.classList.add("active");
  dealerAvatarEl.className = `dealer-avatar ${game.dealerGender}`;
  dealerAvatarEl.textContent = game.dealerGender === "male" ? "男" : "女";
  dealerTextEl.textContent = `${game.dealerGender === "male" ? "男" : "女"}发牌员升起来发牌`;
  setMessage(`发牌完成：一共 ${players.length} 人，${players.length === 2 ? "两人局每人 7 张" : "多人局每人 6 张"}。${stacking ? "已开启叠加玩法。" : "标准规则：+2/+4 直接让下家抽牌并跳过。"} 现在 ${currentPlayer().name} 先出。`);
  render();
  maybeBotTurn();
}

function resetToSetup() {
  game = null;
  setupPanel.style.display = "grid";
  playArea.classList.remove("active");
  setMessage("先设置总人数、玩家资料和发牌员。");
}

function topCard() {
  return game.discard[game.discard.length - 1];
}

function currentPlayer() {
  return game.players[game.turnIndex];
}

function nextIndex(from = game.turnIndex, steps = 1) {
  const count = game.players.length;
  return (from + game.direction * steps + count * 4) % count;
}

function setMessage(text) {
  messageEl.textContent = text;
}

function isDrawCard(card) {
  return card.type === "draw2" || card.type === "draw4";
}

function cardDrawValue(card) {
  if (card.type === "draw2") return 2;
  if (card.type === "draw4") return 4;
  return 0;
}

function canPlay(card) {
  if (!game || game.over || game.waitingForColor) return false;
  if (game.pendingDraw > 0) return game.stacking && isDrawCard(card);
  const top = topCard();
  if (card.color === "wild") return true;
  return card.color === game.currentColor || card.label === top.label;
}

function drawCards(player, count) {
  for (let i = 0; i < count; i += 1) {
    if (game.deck.length === 0) recycleDeck();
    const card = game.deck.shift();
    if (card) player.hand.push(card);
  }
}

function recycleDeck() {
  if (game.discard.length <= 1) return;
  const keep = game.discard.pop();
  game.deck = shuffle(game.discard);
  game.discard = [keep];
}

function playCard(player, cardIndex, chosenColor = null) {
  if (!game || game.over) return;
  if (player.id !== currentPlayer().id) return;
  const card = player.hand[cardIndex];
  if (!card || !canPlay(card)) {
    setMessage(game.pendingDraw > 0 ? `现在累计罚牌 ${game.pendingDraw} 张，只有开启叠加玩法时才能出 +2 或 +4 反打。` : "这张牌现在不能出，要颜色一样、数字一样、功能一样，或者出变色牌。");
    return;
  }

  player.hand.splice(cardIndex, 1);
  game.discard.push(card);
  if (card.color !== "wild") game.currentColor = card.color;
  if (chosenColor) game.currentColor = chosenColor;

  if (player.hand.length === 0) {
    game.over = true;
    setMessage(`${player.name} 出完了，${player.isHuman ? "你赢了!" : `${player.name} 赢了。`} 点“重新设置”再开一局。`);
    render();
    return;
  }

  const unoCall = player.hand.length === 1 ? ` ${player.name} 喊 UNO!` : "";
  applyCardEffect(player, card, chosenColor, unoCall);
}

function applyCardEffect(player, card, chosenColor, unoCall = "") {
  if (card.type === "reverse") {
    game.direction *= -1;
    advanceTurn(game.players.length === 2 ? 2 : 1);
    setMessage(`${player.name} 出了反转，${game.players.length === 2 ? "两人局里等于跳过对方。" : "顺序换方向了。"}${unoCall}`);
  } else if (card.type === "skip") {
    const skipped = game.players[nextIndex()];
    advanceTurn(2);
    setMessage(`${player.name} 出了禁止，${skipped.name} 被跳过。${unoCall}`);
  } else if (isDrawCard(card)) {
    const count = cardDrawValue(card);
    if (game.stacking) {
      game.pendingDraw += count;
      game.pendingSource = player.name;
      advanceTurn(1);
      setMessage(`${player.name} 出了 ${card.label}，累计罚牌变成 ${game.pendingDraw} 张。下家可以继续出 +2/+4 反打。${unoCall}`);
    } else {
      const punished = game.players[nextIndex()];
      drawCards(punished, count);
      advanceTurn(2);
      setMessage(`${player.name} 出了 ${card.label}，${punished.name} 抽 ${count} 张并跳过。${unoCall}`);
    }
  } else if (card.type === "wild") {
    if (player.isHuman && !chosenColor) {
      game.waitingForColor = true;
      setMessage("你出了变色牌，请点下面红、黄、蓝、绿选一个颜色。");
      render();
      return;
    }
    advanceTurn(1);
    setMessage(`${player.name} 出了变色，颜色变成${colorNames[game.currentColor]}。${unoCall}`);
  } else {
    advanceTurn(1);
    setMessage(`${player.name} 出了 ${cardText(card)}。${unoCall}`);
  }
  render();
  maybeBotTurn();
}

function chooseWildColor(color) {
  if (!game || !game.waitingForColor) return;
  game.currentColor = color;
  game.waitingForColor = false;
  advanceTurn(1);
  setMessage(`你选择了${colorNames[color]}色。`);
  render();
  maybeBotTurn();
}

function advanceTurn(steps) {
  game.turnIndex = nextIndex(game.turnIndex, steps);
}

function humanDrawOrPass() {
  if (!game || game.over || currentPlayer().id !== "me") return;
  const me = currentPlayer();
  if (game.pendingDraw > 0) {
    const count = game.pendingDraw;
    drawCards(me, count);
    game.pendingDraw = 0;
    game.pendingSource = null;
    advanceTurn(1);
    setMessage(`你抽了累计罚牌 ${count} 张，并跳过这一轮。`);
  } else {
    drawCards(me, 1);
    setMessage("你抽了一张牌。如果能出，可以直接点手牌出。");
  }
  render();
  if (currentPlayer().id !== "me") maybeBotTurn();
}

function maybeBotTurn() {
  if (!game || game.over || game.waitingForColor) return;
  const player = currentPlayer();
  if (player.isHuman) return;
  window.setTimeout(() => botTurn(player), 650);
}

function botTurn(player) {
  if (!game || game.over || currentPlayer().id !== player.id) return;
  let index = -1;
  if (game.pendingDraw > 0 && game.stacking) {
    index = player.hand.findIndex(isDrawCard);
  } else {
    index = chooseBotPlayableCard(player);
  }

  if (index >= 0) {
    const card = player.hand[index];
    const chosenColor = card.color === "wild" ? chooseBestColor(player) : null;
    playCard(player, index, chosenColor);
    if (chosenColor) setMessage(`${player.name} 出了 ${card.label}，颜色变成${colorNames[chosenColor]}。`);
    render();
    return;
  }

  if (game.pendingDraw > 0) {
    const count = game.pendingDraw;
    drawCards(player, count);
    game.pendingDraw = 0;
    game.pendingSource = null;
    advanceTurn(1);
    setMessage(`${player.name} 没有 +2/+4，抽了 ${count} 张牌。`);
  } else {
    drawCards(player, 1);
    advanceTurn(1);
    setMessage(`${player.name} 没有能出的牌，摸 1 张并跳过。`);
  }
  render();
  maybeBotTurn();
}

function chooseBotPlayableCard(player) {
  const playable = player.hand
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => canPlay(card));
  if (playable.length === 0) return -1;
  playable.sort((a, b) => cardPriority(b.card) - cardPriority(a.card));
  return playable[0].index;
}

function cardPriority(card) {
  const values = { draw4: 7, draw2: 6, skip: 5, reverse: 4, wild: 3, number: 1 };
  return values[card.type] || 1;
}

function chooseBestColor(player) {
  const counts = { red: 0, yellow: 0, blue: 0, green: 0 };
  player.hand.forEach((card) => {
    if (counts[card.color] != null) counts[card.color] += 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function cardText(card) {
  if (!card) return "";
  if (card.color === "wild") return card.label;
  return `${colorNames[card.color]}${card.label}`;
}

function render() {
  if (!game) return;
  renderTableScene();
  renderOpponents();
  renderCenter();
  renderMyHand();
}

function renderTableScene() {
  const current = currentPlayer();
  const seats = game.players.map((player, index) => {
    const angle = (360 / game.players.length) * index;
    const face = player.gender === "male" ? "男" : "女";
    return `
      <div class="table-seat ${current.id === player.id ? "active" : ""}" style="--angle:${angle}deg">
        <div class="chair-back"></div>
        <div class="person-3d ${player.gender}">
          <div class="person-head"><span>${face}</span></div>
          <div class="person-body"></div>
          <div class="person-arm left"></div>
          <div class="person-arm right"></div>
        </div>
        <div class="seat-name">${player.name}</div>
        <div class="seat-cards">${player.hand.length} 张</div>
      </div>
    `;
  }).join("");
  tableSceneEl.innerHTML = `
    <div class="table-arena">
      <div class="room-backdrop"></div>
      <div class="round-table">
        <div class="felt-rim"></div>
        <div class="felt-surface">
          <div class="table-center-hole">
            <div class="dealer-3d ${game.dealerGender}">
              <div class="dealer-head">${game.dealerGender === "male" ? "男" : "女"}</div>
              <div class="dealer-body"></div>
            </div>
          </div>
          <div class="mini-card-pile draw-mini"></div>
          <div class="mini-card-pile discard-mini ${topCard().color}">${topCard().label}</div>
        </div>
      </div>
      ${seats}
    </div>
  `;
}

function renderOpponents() {
  opponentRing.innerHTML = "";
  game.players.forEach((player) => {
    const chip = document.createElement("div");
    chip.className = `player-chip ${player.isHuman ? "human" : "bot"} ${currentPlayer().id === player.id ? "active" : ""}`;
    chip.innerHTML = `
      <strong>${player.name}</strong>
      <span>${player.hand.length} 张牌</span>
      <div class="player-meta">
        <em>${player.isHuman ? "人工" : "电脑"}</em>
        <em>${player.gender === "male" ? "男" : "女"}</em>
        <em>${player.country}</em>
      </div>
    `;
    opponentRing.append(chip);
  });
}

function renderCenter() {
  const card = topCard();
  deckCountEl.textContent = `${game.deck.length} 张`;
  discardCardEl.className = `card big-card ${card.color}`;
  discardCardEl.innerHTML = cardMarkup(card);
  currentColorEl.textContent = `当前颜色：${colorNames[game.currentColor]}`;
  directionTextEl.textContent = game.direction === 1 ? "顺时针" : "逆时针";
  penaltyTextEl.textContent = game.pendingDraw > 0 ? `累计 +${game.pendingDraw} 张` : "没有罚牌";
  const current = currentPlayer();
  myTitleEl.textContent = current.isHuman ? "轮到你了" : `等待 ${current.name}`;
}

function renderMyHand() {
  const current = currentPlayer();
  const visiblePlayer = current.isHuman ? current : game.players.find((player) => player.isHuman) || game.players[0];
  myTitleEl.textContent = current.isHuman ? `${visiblePlayer.name} 的手牌` : `等待 ${current.name} 自动出牌`;
  myCountEl.textContent = `${visiblePlayer.hand.length} 张`;
  myHandEl.innerHTML = "";
  visiblePlayer.hand.forEach((card, index) => {
    const playable = current.id === visiblePlayer.id && visiblePlayer.isHuman && canPlay(card);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `card ${card.color} ${playable ? "playable" : "disabled"}`;
    button.innerHTML = cardMarkup(card);
    button.addEventListener("click", () => {
      if (card.color === "wild" && playable) {
        game.waitingForColor = true;
        game.pendingWildIndex = index;
        game.pendingWildPlayerId = visiblePlayer.id;
        setMessage(`你选中了 ${card.label}，请先点红、黄、蓝、绿。`);
        render();
      } else {
        playCard(visiblePlayer, index);
      }
    });
    myHandEl.append(button);
  });
}

function cardMarkup(card) {
  const corner = card.color === "wild" ? "彩" : colorNames[card.color];
  const typeName = card.type === "number" ? "数字" : "功能";
  return `<span class="corner top">${corner}</span><strong class="center-symbol">${card.label}</strong><small class="corner bottom">${typeName}</small>`;
}

Object.entries(colorButtons).forEach(([color, button]) => {
  button.addEventListener("click", () => {
    if (!game || game.over) return;
    if (typeof game.pendingWildIndex === "number") {
      const index = game.pendingWildIndex;
      const player = game.players.find((item) => item.id === game.pendingWildPlayerId) || currentPlayer();
      game.pendingWildIndex = null;
      game.pendingWildPlayerId = null;
      game.waitingForColor = false;
      playCard(player, index, color);
    } else {
      chooseWildColor(color);
    }
  });
});

playerCountInput.addEventListener("change", renderPlayerSetup);
startBtn.addEventListener("click", startGame);
newSetupBtn.addEventListener("click", resetToSetup);
drawBtn.addEventListener("click", humanDrawOrPass);
passBtn.addEventListener("click", humanDrawOrPass);

renderPlayerSetup();
resetToSetup();
