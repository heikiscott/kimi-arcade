const ranks = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2", "小王", "大王"];
const suits = ["♠", "♥", "♣", "♦"];
const redSuits = new Set(["♥", "♦"]);

const modeButtons = [...document.querySelectorAll(".mode-tabs button")];
const views = {
  landlord: document.querySelector("#landlordView"),
  fishing: document.querySelector("#fishingView"),
  duel: document.querySelector("#duelView")
};
const gameTitle = document.querySelector("#gameTitle");
const statusText = document.querySelector("#statusText");
const deckText = document.querySelector("#deckText");

let mode = "landlord";
let selectedLandlord = new Set();
let selectedDuel = null;

const ll = {
  mine: [],
  botA: [],
  botB: [],
  table: [],
  turn: "mine",
  lastRank: -1
};

const fish = {
  mine: [],
  bot: [],
  table: [],
  turn: "mine",
  over: false
};

const duel = {
  mine: [],
  bot: [],
  deck: [],
  table: [],
  leader: "mine",
  maxRank: 13,
  handSize: 5
};

function makeDeck(includeJokers = true) {
  const deck = [];
  suits.forEach((suit) => {
    ranks.slice(0, 13).forEach((rank, index) => deck.push({ rank, suit, value: index + 3 }));
  });
  if (includeJokers) {
    deck.push({ rank: "小王", suit: "☆", value: 16 });
    deck.push({ rank: "大王", suit: "★", value: 17 });
  }
  return shuffle(deck);
}

function makeNumberDeck(maxRank) {
  const deck = [];
  for (let copy = 0; copy < 4; copy += 1) {
    for (let value = 1; value <= maxRank; value += 1) {
      deck.push({ rank: String(value), suit: suits[copy], value });
    }
  }
  return shuffle(deck);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sortCards(cards) {
  cards.sort((a, b) => a.value - b.value || a.suit.localeCompare(b.suit));
}

function cardName(card) {
  return `${card.suit}${card.rank}`;
}

function setStatus(text) {
  statusText.textContent = text;
}

function renderCard(card, options = {}) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = `card ${redSuits.has(card.suit) ? "red" : ""} ${options.selected ? "selected" : ""}`;
  el.innerHTML = `<span>${card.rank}</span><small>${card.suit}</small>`;
  if (options.onClick) el.addEventListener("click", options.onClick);
  return el;
}

function renderBackCard(label = "背面") {
  const el = document.createElement("div");
  el.className = "card back";
  el.innerHTML = `<span>${label}</span><small>牌</small>`;
  return el;
}

function setMode(next) {
  mode = next;
  modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));
  Object.entries(views).forEach(([key, view]) => view.classList.toggle("active", key === mode));
  gameTitle.textContent = { landlord: "斗地主", fishing: "小猫钓鱼", duel: "五张接大牌" }[mode];
  renderAll();
}

function newLandlord() {
  const deck = makeDeck(true);
  ll.mine = deck.splice(0, 20);
  ll.botA = deck.splice(0, 17);
  ll.botB = deck.splice(0, 17);
  ll.table = [];
  ll.turn = "mine";
  ll.lastRank = -1;
  selectedLandlord.clear();
  sortCards(ll.mine);
  sortCards(ll.botA);
  sortCards(ll.botB);
  setStatus("斗地主开始：你是地主。点牌选中，想出几张都可以。");
  renderAll();
}

function playLandlordCards() {
  if (mode !== "landlord") return;
  const selected = ll.mine.filter((_, index) => selectedLandlord.has(index));
  if (selected.length === 0) {
    setStatus("先点选你要出的牌。");
    return;
  }
  ll.mine = ll.mine.filter((_, index) => !selectedLandlord.has(index));
  ll.table = selected;
  ll.lastRank = Math.max(...selected.map((card) => card.value));
  selectedLandlord.clear();
  setStatus(`你出了 ${selected.map(cardName).join("、")}。`);
  if (checkLandlordWin()) return;
  renderAll();
  window.setTimeout(() => botLandlordTurn("botA"), 550);
}

function passLandlord() {
  if (mode !== "landlord") return;
  setStatus("你选择不要，电脑继续。");
  window.setTimeout(() => botLandlordTurn("botA"), 350);
}

function botLandlordTurn(name) {
  const hand = ll[name];
  let cardIndex = hand.findIndex((card) => card.value > ll.lastRank);
  if (cardIndex < 0 && Math.random() < 0.35) cardIndex = Math.floor(Math.random() * hand.length);
  if (cardIndex >= 0) {
    const [card] = hand.splice(cardIndex, 1);
    ll.table = [card];
    ll.lastRank = card.value;
    setStatus(`${name === "botA" ? "电脑一" : "电脑二"}出了 ${cardName(card)}。`);
  } else {
    setStatus(`${name === "botA" ? "电脑一" : "电脑二"}不要。`);
  }
  if (checkLandlordWin()) return;
  renderAll();
  if (name === "botA") window.setTimeout(() => botLandlordTurn("botB"), 550);
}

function checkLandlordWin() {
  const winner = ll.mine.length === 0 ? "你赢了斗地主" : ll.botA.length === 0 ? "电脑一赢了" : ll.botB.length === 0 ? "电脑二赢了" : "";
  if (!winner) return false;
  setStatus(`${winner}！点“重新发牌”再玩。`);
  renderAll();
  return true;
}

function renderLandlord() {
  document.querySelector("#llBotA").textContent = `${ll.botA.length} 张`;
  document.querySelector("#llBotB").textContent = `${ll.botB.length} 张`;
  document.querySelector("#llMineCount").textContent = `${ll.mine.length} 张`;
  const table = document.querySelector("#llTable");
  table.innerHTML = "";
  ll.table.forEach((card) => table.appendChild(renderCard(card)));
  const mine = document.querySelector("#llMine");
  mine.innerHTML = "";
  ll.mine.forEach((card, index) => {
    mine.appendChild(renderCard(card, {
      selected: selectedLandlord.has(index),
      onClick: () => {
        if (selectedLandlord.has(index)) selectedLandlord.delete(index);
        else selectedLandlord.add(index);
        renderLandlord();
      }
    }));
  });
}

function newFishing() {
  const deck = makeDeck(false);
  fish.mine = deck.splice(0, 26);
  fish.bot = deck.splice(0, 26);
  fish.table = [];
  fish.turn = "mine";
  fish.over = false;
  setStatus("小猫钓鱼开始：你翻一张，电脑也翻一张，相同点数就钓走中间的牌。");
  renderAll();
}

function fishPlayOne(player) {
  if (fish.over) return;
  const pile = player === "mine" ? fish.mine : fish.bot;
  if (pile.length === 0) {
    fish.over = true;
    setStatus(`${player === "mine" ? "你没有牌了，电脑赢了" : "电脑没有牌了，你赢了"}！`);
    renderAll();
    return;
  }
  const card = pile.shift();
  const matchIndex = fish.table.findIndex((item) => item.rank === card.rank);
  fish.table.push(card);
  if (matchIndex >= 0) {
    const won = fish.table.splice(matchIndex);
    pile.push(...won);
    setStatus(`${player === "mine" ? "你" : "电脑"}翻到 ${cardName(card)}，钓走 ${won.length} 张牌。`);
  } else {
    setStatus(`${player === "mine" ? "你" : "电脑"}翻出 ${cardName(card)}。`);
  }
  fish.turn = player === "mine" ? "bot" : "mine";
  renderAll();
}

function fishPlayerTurn() {
  if (fish.turn !== "mine") {
    setStatus("现在轮到电脑，点“自动玩一轮”。");
    return;
  }
  fishPlayOne("mine");
}

function fishAutoRound() {
  if (fish.turn === "mine") {
    fishPlayOne("mine");
    window.setTimeout(() => fishPlayOne("bot"), 600);
  } else {
    fishPlayOne("bot");
  }
}

function renderFishing() {
  document.querySelector("#fishMineCount").textContent = `${fish.mine.length} 张`;
  document.querySelector("#fishBotCount").textContent = `${fish.bot.length} 张`;
  const table = document.querySelector("#fishTable");
  table.innerHTML = "";
  fish.table.slice(-18).forEach((card) => table.appendChild(renderCard(card)));
}

function newDuel() {
  duel.maxRank = Math.max(8, Math.min(30, Number(document.querySelector("#duelMaxRank").value) || 13));
  duel.handSize = Math.max(3, Math.min(8, Number(document.querySelector("#duelHandSize").value) || 5));
  duel.deck = makeNumberDeck(duel.maxRank);
  duel.mine = duel.deck.splice(0, duel.handSize);
  duel.bot = duel.deck.splice(0, duel.handSize);
  duel.table = [];
  duel.leader = "mine";
  selectedDuel = null;
  sortCards(duel.mine);
  sortCards(duel.bot);
  setStatus(`五张接大牌开始：最大点数 ${duel.maxRank}，每人 ${duel.handSize} 张。你先出。`);
  renderAll();
}

function playDuelCard() {
  if (selectedDuel == null) {
    setStatus("先点选一张你要出的牌。");
    return;
  }
  const [card] = duel.mine.splice(selectedDuel, 1);
  selectedDuel = null;
  duel.table = [card];
  setStatus(`你出了 ${cardName(card)}，电脑要出更大的牌。`);
  renderAll();
  if (duel.mine.length === 0) {
    setStatus("你的手牌出完了，你赢了！");
    return;
  }
  window.setTimeout(() => botDuelRespond(card), 650);
}

function botDuelRespond(playerCard) {
  sortCards(duel.bot);
  const index = duel.bot.findIndex((card) => card.value > playerCard.value);
  if (index >= 0) {
    const [card] = duel.bot.splice(index, 1);
    duel.table.push(card);
    setStatus(`电脑接了 ${cardName(card)}。你要出更大的，或者摸一张。`);
    if (duel.bot.length === 0) setStatus("电脑手牌出完了，电脑赢了。点重新发牌再来。");
  } else {
    const drawn = duel.deck.shift();
    if (drawn) {
      duel.bot.push(drawn);
      setStatus(`电脑没有更大的牌，摸了一张。你继续出牌。`);
    } else {
      setStatus("电脑没有更大的牌，牌堆也空了。你继续出牌。");
    }
  }
  sortCards(duel.bot);
  renderAll();
}

function duelDraw() {
  const card = duel.deck.shift();
  if (!card) {
    setStatus("摸牌堆空了。");
    return;
  }
  duel.mine.push(card);
  sortCards(duel.mine);
  setStatus(`你摸到一张 ${cardName(card)}。`);
  renderAll();
}

function renderDuel() {
  document.querySelector("#duelBotCount").textContent = `${duel.bot.length} 张`;
  document.querySelector("#duelDeckCount").textContent = `${duel.deck.length} 张`;
  document.querySelector("#duelMineCount").textContent = `${duel.mine.length} 张`;
  const table = document.querySelector("#duelTable");
  table.innerHTML = "";
  duel.table.forEach((card) => table.appendChild(renderCard(card)));
  const mine = document.querySelector("#duelMine");
  mine.innerHTML = "";
  duel.mine.forEach((card, index) => {
    mine.appendChild(renderCard(card, {
      selected: selectedDuel === index,
      onClick: () => {
        selectedDuel = selectedDuel === index ? null : index;
        renderDuel();
      }
    }));
  });
  if (duel.bot.length > 0) {
    for (let i = 0; i < Math.min(duel.bot.length, 8); i += 1) {
      // Count is shown in the box; backs stay hidden to keep the opponent random.
    }
  }
}

function renderAll() {
  deckText.textContent = mode === "landlord"
    ? "牌堆：斗地主已发完"
    : mode === "fishing"
      ? `桌面：${fish.table.length} 张`
      : `牌堆：${duel.deck.length} 张`;
  renderLandlord();
  renderFishing();
  renderDuel();
}

modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
document.querySelector("#llPlayBtn").addEventListener("click", playLandlordCards);
document.querySelector("#llPassBtn").addEventListener("click", passLandlord);
document.querySelector("#llNewBtn").addEventListener("click", newLandlord);
document.querySelector("#fishPlayBtn").addEventListener("click", fishPlayerTurn);
document.querySelector("#fishAutoBtn").addEventListener("click", fishAutoRound);
document.querySelector("#fishNewBtn").addEventListener("click", newFishing);
document.querySelector("#duelPlayBtn").addEventListener("click", playDuelCard);
document.querySelector("#duelDrawBtn").addEventListener("click", duelDraw);
document.querySelector("#duelNewBtn").addEventListener("click", newDuel);

newLandlord();
newFishing();
newDuel();
setMode("landlord");
