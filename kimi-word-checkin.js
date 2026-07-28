const words = [
  {
    word: "cucumber",
    meaning: "n. 黄瓜",
    detail: "食物类名词，无变形。",
    example: "I eat cucumber every day. 我每天吃黄瓜。"
  },
  {
    word: "spill",
    meaning: "v./n. 液体洒出、泼洒",
    detail: "过去式 spilled/spilt，侧重液体、粉末不小心洒出来。",
    example: "Don't spill milk on the table. 别把牛奶洒桌上。"
  },
  {
    word: "split",
    meaning: "v./n. 劈开、拆分、分裂、分摊",
    detail: "过去式 split 不变。spill 是液体洒；split 是切开、分摊、分裂。",
    example: "We split the bill. 我们分摊账单。"
  },
  {
    word: "maintain",
    meaning: "v. 维持；保持；维护；坚持观点",
    detail: "搭配：maintain balance，maintain a building。",
    example: "He maintains a healthy lifestyle. 他保持健康的生活。"
  },
  {
    word: "mountain",
    meaning: "n. 大山，山脉",
    detail: "hill 是小山；mountain 是高山。",
    example: "There is a lake near the mountain. 山边有一片湖。"
  },
  {
    word: "feature",
    meaning: "n. 特征，特点；v. 以...为特色",
    detail: "搭配：main feature 主要特点。",
    example: "The phone's best feature is its camera. 这款手机最大亮点是摄像头。"
  },
  {
    word: "future",
    meaning: "n./adj. 未来，将来；未来的",
    detail: "固定：in the future 在将来。",
    example: "I plan to study abroad in the future. 我计划将来出国留学。"
  },
  {
    word: "break",
    meaning: "v. 打破、弄坏、中断；n. 休息",
    detail: "break -> broke -> broken。短语：break down，break the rule，take a break。",
    example: "Don't break the glass. 别打碎玻璃杯。"
  },
  {
    word: "breath",
    meaning: "n. 呼吸；一口气",
    detail: "breath 是名词；breathe 是动词。take a deep breath = 深呼吸。",
    example: "Take a breath and calm down. 深呼吸冷静一下。"
  },
  { word: "abandon", meaning: "v. 放弃，抛弃", detail: "常用于放弃计划、地方或人。", example: "Do not abandon your plan too quickly." },
  { word: "ruin", meaning: "n. 废墟；v. 毁坏，毁灭", detail: "可指建筑废墟，也可指把事情毁掉。", example: "The storm ruined the road." },
  { word: "destroy", meaning: "v. 破坏，摧毁", detail: "比 damage 程度更重，常指彻底摧毁。", example: "The fire destroyed the old house." },
  { word: "damage", meaning: "v./n. 损坏", detail: "损坏但不一定完全毁掉。", example: "The rain damaged the book." },
  { word: "crumble", meaning: "v. 崩溃，崩裂，瓦解", detail: "可指墙体碎裂，也可指计划瓦解。", example: "The old wall began to crumble." },
  { word: "complete", meaning: "v./adj. 完成；完整的", detail: "complete the homework = 完成作业。", example: "I will complete the task today." },
  { word: "mansion", meaning: "n. 公馆，豪宅", detail: "比普通 house 更大、更豪华。", example: "They live in a big mansion." },
  { word: "release", meaning: "v./n. 释放，发布，发行", detail: "可指释放人、发布消息、发行电影。", example: "The company will release a new game." },
  { word: "explore", meaning: "v. 探索，考察，探险", detail: "explore a city/forest/cave。", example: "We explore the forest together." },
  { word: "scatter", meaning: "v. 撒，四散，驱散", detail: "表示散开或把东西撒开。", example: "The wind scattered the leaves." },
  { word: "display", meaning: "v./n. 陈列，展示", detail: "display pictures/products。", example: "The museum displays old tools." },
  { word: "abolish", meaning: "v. 废除，除去", detail: "常用于废除制度、规则。", example: "The rule was abolished." },
  { word: "get rid of", meaning: "phr. 去除，去掉，免除", detail: "常用于摆脱不需要的东西。", example: "We should get rid of bad habits." },
  { word: "remove", meaning: "v. 去除，移开，免除", detail: "remove 可用于移走物体或删除内容。", example: "Please remove the box from the door." },
  { word: "establish", meaning: "v. 建立，确立，设立", detail: "establish a school/company/rule。", example: "They established a new school." },
  { word: "exist", meaning: "v. 存在", detail: "表示真实存在。", example: "Does this animal still exist?" },
  { word: "survive", meaning: "v. 生存，存活，继续存在", detail: "survive a storm/accident。", example: "The plant survived the winter." },
  { word: "disappear", meaning: "v. 消失，灭绝", detail: "appear 出现；disappear 消失。", example: "The sun disappeared behind the clouds." },
  { word: "prohibit", meaning: "v. 阻止，禁止", detail: "尤指以规则或法令禁止。", example: "The sign prohibits parking here." },
  { word: "prevent", meaning: "v. 阻止，防止", detail: "prevent accidents/disease。", example: "Careful driving can prevent accidents." }
];

const storageKey = "kimiWordCheckin0728";
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
let quizLocked = false;

function loadState() {
  try {
    return {
      known: {},
      unsure: {},
      checkins: [],
      quizCorrect: 0,
      quizTotal: 0,
      diary: "",
      ...JSON.parse(localStorage.getItem(storageKey) || "{}")
    };
  } catch {
    return { known: {}, unsure: {}, checkins: [], quizCorrect: 0, quizTotal: 0, diary: "" };
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
  quizWord = words[Math.floor(Math.random() * words.length)];
  const askEnglish = Math.random() > 0.5;
  quizQuestion.textContent = askEnglish ? `${quizWord.meaning} 的英文是？` : `${quizWord.word} 的中文意思是？`;
  const correct = askEnglish ? quizWord.word : quizWord.meaning;
  const options = shuffle([
    correct,
    ...shuffle(words.filter((item) => item.word !== quizWord.word)).slice(0, 3).map((item) => (askEnglish ? item.word : item.meaning))
  ]);
  answerGrid.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => answerQuiz(button, option, correct));
    answerGrid.appendChild(button);
  });
  quizResult.textContent = "点一个答案。";
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
    quizResult.textContent = `答对了：${quizWord.word}。`;
  } else {
    data.unsure[quizWord.word] = true;
    button.classList.add("wrong");
    quizResult.textContent = `正确答案：${correct}`;
    [...answerGrid.children].forEach((child) => {
      if (child.textContent === correct) child.classList.add("correct");
    });
  }
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
