const words = [
  {
    word: "cucumber",
    meaning: "n. 黄瓜",
    detail: "词性：名词。食物类名词，无变形。",
    example: "In Weihai, I put cucumber in my lunch box before the math thinking contest. 在威海参加数学思维竞赛前，我把黄瓜放进午餐盒。"
  },
  {
    word: "spill",
    meaning: "v./n. 液体洒出、泼洒",
    detail: "词性：动词/名词。过去式 spilled/spilt，侧重液体、粉末不小心洒出来。",
    example: "Do not spill the magic ink while coding the mini game. 编小游戏时，别把魔术墨水洒出来。"
  },
  {
    word: "split",
    meaning: "v./n. 劈开、拆分、分裂、分摊",
    detail: "词性：动词/名词。过去式 split 不变。spill 是液体洒；split 是切开、分摊、分裂。",
    example: "We split the hard math problem into three small steps. 我们把难数学题拆成三个小步骤。"
  },
  {
    word: "maintain",
    meaning: "v. 维持；保持；维护；坚持观点",
    detail: "词性：动词。搭配：maintain balance，maintain a building。",
    example: "I maintain my study plan and fix bugs in my arcade every day. 我每天坚持学习计划，也维护自己的小游戏大厅。"
  },
  {
    word: "mountain",
    meaning: "n. 大山，山脉",
    detail: "词性：名词。hill 是小山；mountain 是高山。",
    example: "From the Weihai beach, the green mountain looks like a giant magic prop. 从威海海边看，那座青山像一个巨大的魔术道具。"
  },
  {
    word: "feature",
    meaning: "n. 特征，特点；v. 以...为特色",
    detail: "词性：名词/动词。搭配：main feature 主要特点。",
    example: "The best feature of my mini game is the magic door. 我做的小游戏最大特点是魔法门。"
  },
  {
    word: "future",
    meaning: "n./adj. 未来，将来；未来的",
    detail: "词性：名词/形容词。固定：in the future 在将来。",
    example: "In the future, I want to build smarter games with code. 将来我想用代码做出更聪明的游戏。"
  },
  {
    word: "break",
    meaning: "v. 打破、弄坏、中断；n. 休息",
    detail: "词性：动词/名词。break -> broke -> broken。短语：break down，break the rule，take a break。",
    example: "Take a break after you solve five math puzzles. 解完五道数学题后休息一下。"
  },
  {
    word: "breath",
    meaning: "n. 呼吸；一口气",
    detail: "词性：名词。breath 是名词；breathe 是动词。take a deep breath = 深呼吸。",
    example: "Before the magic show, I take a deep breath and check my cards. 魔术表演前，我深呼吸并检查扑克牌。"
  }
];

const quizQuestions = [
  { word: "cucumber", question: "威海旅行时，午餐盒里放了一根黄瓜。这个“黄瓜”选哪个词？" },
  { word: "spill", question: "魔术墨水不小心洒在桌上，“洒出”选哪个词？" },
  { word: "split", question: "数学思维竞赛里，把难题拆成三步，“拆分”选哪个词？" },
  { word: "maintain", question: "每天维护自己的小游戏网页，“维护、保持”选哪个词？" },
  { word: "mountain", question: "在威海看到一座高山，“高山”选哪个词？" },
  { word: "feature", question: "你的小游戏最大特点是魔法门，“特点”选哪个词？" },
  { word: "future", question: "将来想用编程做更厉害的游戏，“未来”选哪个词？" },
  { word: "break", question: "做完五道数学题后休息一下，“休息”选哪个词？" },
  { word: "breath", question: "魔术表演前深呼吸，“一口气、呼吸”这个名词选哪个词？" }
];

const storageKey = "kimiWordCheckinCore9V1";
const diaryTemplate = "今日完成单词单选练习，错题记录：______，学习总结：______。";
const today = new Date().toISOString().slice(0, 10);

const wordText = document.querySelector("#wordText");
const meaningText = document.querySelector("#meaningText");
const detailText = document.querySelector("#detailText");
const exampleText = document.querySelector("#exampleText");
const cardIndex = document.querySelector("#cardIndex");
const todayStatus = document.querySelector("#todayStatus");
const streakText = document.querySelector("#streakText");
const progressText = document.querySelector("#progressText");
const quizQuestion = document.querySelector("#quizQuestion");
const answerGrid = document.querySelector("#answerGrid");
const quizResult = document.querySelector("#quizResult");
const wordList = document.querySelector("#wordList");
const diaryText = document.querySelector("#diaryText");
const diaryStatus = document.querySelector("#diaryStatus");

let index = 0;
let quizWord = null;
let currentQuiz = null;
let quizLocked = false;

function loadState() {
  try {
    return {
      known: {},
      unsure: {},
      checkins: [],
      quizCorrect: 0,
      quizTotal: 0,
      quizCursor: 0,
      diary: diaryTemplate,
      ...JSON.parse(localStorage.getItem(storageKey) || "{}")
    };
  } catch {
    return { known: {}, unsure: {}, checkins: [], quizCorrect: 0, quizTotal: 0, quizCursor: 0, diary: diaryTemplate };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Private browsing may block saving; practice still works.
  }
}

function state() {
  return loadState();
}

function renderCard() {
  const item = words[index];
  wordText.textContent = item.word;
  meaningText.textContent = item.meaning;
  detailText.textContent = item.detail;
  exampleText.textContent = item.example;
  cardIndex.textContent = `${index + 1} / ${words.length}`;
  renderStats();
  renderList();
}

function renderStats() {
  const data = state();
  const knownCount = Object.keys(data.known || {}).length;
  todayStatus.textContent = (data.checkins || []).includes(today) ? "已打卡" : "还没打卡";
  streakText.textContent = `${calcStreak(data.checkins || [])} 天`;
  progressText.textContent = `${knownCount} / ${words.length}`;
}

function calcStreak(checkins) {
  const set = new Set(checkins);
  let count = 0;
  const date = new Date();
  while (set.has(date.toISOString().slice(0, 10))) {
    count += 1;
    date.setDate(date.getDate() - 1);
  }
  return count;
}

function markKnown(known) {
  const data = state();
  const item = words[index];
  if (known) {
    data.known[item.word] = true;
    delete data.unsure[item.word];
  } else {
    data.unsure[item.word] = true;
    delete data.known[item.word];
  }
  saveState(data);
  renderStats();
  renderList();
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function newQuiz() {
  quizLocked = false;
  const data = state();
  currentQuiz = quizQuestions[(data.quizCursor || 0) % quizQuestions.length];
  quizWord = words.find((item) => item.word === currentQuiz.word);
  quizQuestion.textContent = currentQuiz.question;
  const correct = currentQuiz.word;
  const options = shuffle([correct, ...shuffle(words.filter((item) => item.word !== correct)).slice(0, 3).map((item) => item.word)]);
  answerGrid.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => answerQuiz(button, option, correct));
    answerGrid.appendChild(button);
  });
  quizResult.textContent = `第 ${((data.quizCursor || 0) % quizQuestions.length) + 1} / 9 题，点一个答案。`;
}

function answerQuiz(button, option, correct) {
  if (quizLocked) return;
  quizLocked = true;
  const data = state();
  data.quizTotal += 1;
  if (option === correct) {
    data.quizCorrect += 1;
    data.known[quizWord.word] = true;
    delete data.unsure[quizWord.word];
    button.classList.add("correct");
    quizResult.textContent = `答对了，标准答案：${quizWord.word}。`;
  } else {
    data.unsure[quizWord.word] = true;
    button.classList.add("wrong");
    quizResult.textContent = `答错了，标准答案：${correct}`;
    [...answerGrid.children].forEach((child) => {
      if (child.textContent === correct) child.classList.add("correct");
    });
  }
  data.quizCursor = (data.quizCursor + 1) % quizQuestions.length;
  saveState(data);
  renderStats();
  renderList();
}

function checkIn() {
  const data = state();
  if (!data.checkins.includes(today)) data.checkins.push(today);
  data.checkins = data.checkins.slice(-60);
  saveState(data);
  todayStatus.textContent = "已打卡";
  quizResult.textContent = `今日打卡成功：会 ${Object.keys(data.known || {}).length} 个，小测 ${data.quizCorrect}/${data.quizTotal}。`;
  renderStats();
}

function saveDiary() {
  const data = state();
  data.diary = diaryText.value.trim();
  data.diarySavedAt = new Date().toISOString();
  saveState(data);
  diaryStatus.textContent = data.diary ? "7月28日练习日记已保存。" : "日记已清空，可以重新写。";
}

function renderList() {
  const data = state();
  wordList.innerHTML = "";
  words.forEach((item, itemIndex) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `word-chip${data.known?.[item.word] ? " done" : ""}`;
    chip.innerHTML = `<strong></strong><span></span>`;
    chip.querySelector("strong").textContent = item.word;
    chip.querySelector("span").textContent = data.known?.[item.word] ? "已会" : data.unsure?.[item.word] ? "还不会" : item.meaning;
    chip.addEventListener("click", () => {
      index = itemIndex;
      renderCard();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    wordList.appendChild(chip);
  });
}

document.querySelector("#prevBtn").addEventListener("click", () => {
  index = (index - 1 + words.length) % words.length;
  renderCard();
});

document.querySelector("#nextBtn").addEventListener("click", () => {
  index = (index + 1) % words.length;
  renderCard();
});

document.querySelector("#knowBtn").addEventListener("click", () => markKnown(true));
document.querySelector("#unsureBtn").addEventListener("click", () => markKnown(false));
document.querySelector("#newQuizBtn").addEventListener("click", newQuiz);
document.querySelector("#checkinBtn").addEventListener("click", checkIn);
document.querySelector("#saveDiaryBtn").addEventListener("click", saveDiary);

renderCard();
diaryText.value = state().diary || "";
newQuiz();
