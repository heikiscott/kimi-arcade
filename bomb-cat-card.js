const playerRing = document.querySelector("#playerRing");
const myHandEl = document.querySelector("#myHand");
const deckCountEl = document.querySelector("#deckCount");
const discardTopEl = document.querySelector("#discardTop");
const turnText = document.querySelector("#turnText");
const statusText = document.querySelector("#statusText");
const handCount = document.querySelector("#handCount");
const drawBtn = document.querySelector("#drawBtn");
const newGameBtn = document.querySelector("#newGameBtn");
const autoBtn = document.querySelector("#autoBtn");

const cardNames = {
  cat: "猫咪牌",
  skip: "跳过",
  attack: "攻击",
  peek: "预知",
  shuffle: "洗牌",
  defuse: "防爆鱼",
  bomb: "黑色炸猫"
};

const cardIcons = {
  cat: "🐱",
  skip: "⏭",
  attack: "⚡",
  peek: "🔮",
  shuffle: "🔀",
  defuse: "🐟",
  bomb: "💣"
};

const seats = ["me", "left", "top", "right"];
let players = [];
let deck = [];
let discard = [];
let current = 0;
let extraTurns = 0;
let waiting = false;
let gameOver = false;

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function makeCard(type) {
  return { id: `${type}-${crypto.randomUUID?.() || Math.random().toString(16).slice(2)}`, type };
}

function makeDeck() {
  const safeCards = [];
  [
    ["cat", 16],
    ["skip", 5],
    ["attack", 4],
    ["peek", 4],
    ["shuffle", 4],
    ["defuse", 2]
  ].forEach(([type, count]) => {
    for (let i = 0; i < count; i += 1) safeCards.push(makeCard(type));
  });
  shuffle(safeCards);
  return safeCards;
}

function startGame() {
  players = [
    { name: "我", hand: [], alive: true, mood: "认真看牌" },
    { name: "电脑小红", hand: [], alive: true, mood: "偷笑中" },
    { name: "电脑小蓝", hand: [], alive: true, mood: "有点紧张" },
    { name: "电脑小黄", hand: [], alive: true, mood: "准备摸牌" }
  ];
  deck = makeDeck();
  discard = [];
  current = 0;
  extraTurns = 0;
  waiting = false;
  gameOver = false;

  players.forEach((player) => {
    player.hand.push(makeCard("defuse"));
    for (let i = 0; i < 5; i += 1) player.hand.push(deck.pop());
  });
  for (let i = 0; i < players.length - 1; i += 1) deck.push(makeCard("bomb"));
  shuffle(deck);

  statusText.textContent = "开局了。你可以先出功能牌，也可以直接摸牌。";
  render();
}

function activePlayers() {
  return players.filter((player) => player.alive);
}

function nextAliveIndex(from) {
  let index = from;
  for (let i = 0; i < players.length; i += 1) {
    index = (index + 1) % players.length;
    if (players[index].alive) return index;
  }
  return from;
}

function endTurn(extraForNext = 0) {
  if (gameOver) return;
  const winner = activePlayers();
  if (winner.length === 1) {
    gameOver = true;
    turnText.textContent = `${winner[0].name} 赢了！`;
    statusText.textContent = "最后没有被黑色炸猫炸到的人获胜。";
    render();
    return;
  }
  if (extraTurns > 0) {
    extraTurns -= 1;
  } else {
    current = nextAliveIndex(current);
    extraTurns = extraForNext;
  }
  render();
  if (current !== 0 && !gameOver) {
    waiting = true;
    setTimeout(botTurn, 750);
  }
}

function drawCard(playerIndex) {
  if (!deck.length) {
    statusText.textContent = "摸牌堆空了，重新洗入普通猫咪牌。";
    for (let i = 0; i < 8; i += 1) deck.push(makeCard("cat"));
    shuffle(deck);
  }
  const card = deck.pop();
  const player = players[playerIndex];
  if (card.type !== "bomb") {
    player.hand.push(card);
    statusText.textContent = `${player.name} 摸到一张安全牌。`;
    return true;
  }

  const defuseIndex = player.hand.findIndex((item) => item.type === "defuse");
  if (defuseIndex >= 0) {
    discard.push(player.hand.splice(defuseIndex, 1)[0], card);
    statusText.textContent = `${player.name} 抽到黑色炸猫，但是防爆鱼救了他！`;
    return true;
  }

  player.alive = false;
  discard.push(card);
  statusText.textContent = `${player.name} 抽到黑色炸猫，被淘汰了。`;
  return false;
}

function playCard(index) {
  if (gameOver || current !== 0) return;
  const card = players[0].hand[index];
  if (!card || card.type === "defuse") {
    statusText.textContent = "防爆鱼先留着，抽到黑色炸猫时会自动救你。";
    return;
  }
  players[0].hand.splice(index, 1);
  discard.push(card);
  applyCard(card, 0);
  render();
}

function applyCard(card, playerIndex) {
  const player = players[playerIndex];
  if (card.type === "cat") {
    statusText.textContent = `${player.name} 打出普通猫咪牌，桌面更热闹了。`;
  }
  if (card.type === "peek") {
    const top = deck.slice(-3).reverse().map((item) => cardNames[item.type]).join("、") || "没有牌";
    statusText.textContent = `${player.name} 偷看顶部三张：${top}`;
  }
  if (card.type === "shuffle") {
    shuffle(deck);
    statusText.textContent = `${player.name} 把摸牌堆洗乱了。`;
  }
  if (card.type === "skip") {
    statusText.textContent = `${player.name} 跳过摸牌，安全结束这一回合。`;
    endTurn();
  }
  if (card.type === "attack") {
    statusText.textContent = `${player.name} 发动攻击，下一个人要连续玩两回合。`;
    endTurn(1);
  }
}

function humanDraw() {
  if (gameOver || current !== 0) return;
  drawCard(0);
  endTurn();
}

function botTurn() {
  if (gameOver || current === 0) {
    waiting = false;
    render();
    return;
  }
  const player = players[current];
  const playable = player.hand
    .map((card, index) => ({ card, index }))
    .filter((item) => item.card.type !== "defuse");
  const action = playable.find((item) => ["skip", "attack", "shuffle", "peek"].includes(item.card.type)) || playable[Math.floor(Math.random() * playable.length)];
  if (action && Math.random() > 0.34) {
    player.hand.splice(action.index, 1);
    discard.push(action.card);
    applyCard(action.card, current);
    if (["skip", "attack"].includes(action.card.type)) {
      waiting = false;
      render();
      return;
    }
  }
  drawCard(current);
  waiting = false;
  endTurn();
}

function renderPlayers() {
  playerRing.innerHTML = players.map((player, index) => `
    <div class="seat ${seats[index]} ${player.alive ? "" : "out"}">
      <div class="chair"></div>
      <div class="person" aria-hidden="true">
        <div class="head"></div>
        <div class="body"></div>
      </div>
      <strong>${player.name}</strong>
      <small>${player.alive ? `${player.hand.length} 张 · ${player.mood}` : "已淘汰"}</small>
    </div>
  `).join("");
}

function renderHand() {
  const mine = players[0]?.hand || [];
  myHandEl.innerHTML = mine.map((card, index) => `
    <button class="card-btn ${card.type}" type="button" data-index="${index}" ${current === 0 && !gameOver ? "" : "disabled"}>
      <span>${cardIcons[card.type]}</span>
      <strong>${cardNames[card.type]}</strong>
      <small>${card.type === "defuse" ? "自动救命" : "点击打出"}</small>
    </button>
  `).join("");
  handCount.textContent = `${mine.length} 张`;
  myHandEl.querySelectorAll(".card-btn").forEach((button) => {
    button.addEventListener("click", () => playCard(Number(button.dataset.index)));
  });
}

function render() {
  renderPlayers();
  renderHand();
  deckCountEl.textContent = deck.length;
  const top = discard[discard.length - 1];
  discardTopEl.textContent = top ? `${cardIcons[top.type]} ${cardNames[top.type]}` : "空";
  const player = players[current];
  turnText.textContent = gameOver ? turnText.textContent : `轮到：${player.name}${extraTurns ? `（还要 ${extraTurns + 1} 回合）` : ""}`;
  drawBtn.disabled = gameOver || current !== 0 || waiting;
  drawBtn.querySelector("span").textContent = current === 0 ? "摸牌结束" : "等电脑";
}

newGameBtn.addEventListener("click", startGame);
drawBtn.addEventListener("click", humanDraw);
autoBtn.addEventListener("click", () => {
  if (current !== 0 && !waiting) botTurn();
});

startGame();
