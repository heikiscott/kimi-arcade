const questionEl = document.querySelector("#question");
const answerGrid = document.querySelector("#answerGrid");
const resultEl = document.querySelector("#result");
const scoreEl = document.querySelector("#score");
const nextBtn = document.querySelector("#nextBtn");
const restartBtn = document.querySelector("#restartBtn");
const speechEl = document.querySelector("#speech");
const loveStage = document.querySelector(".love-stage");

const riddles = [
  {
    question: "宝贝，我给你买了一罐盐，你猜什么盐?",
    options: ["海盐", "爱你无需多言", "椒盐", "细盐"],
    answer: "爱你无需多言"
  },
  {
    question: "这饺子太好吃了，你猜什么馅?",
    options: ["猪肉白菜馅", "爱你已经冒馅儿了", "韭菜鸡蛋馅", "玉米虾仁馅"],
    answer: "爱你已经冒馅儿了"
  },
  {
    question: "我今天买了一瓶水，你猜什么水?",
    options: ["矿泉水", "想你想到心里都是水", "汽水", "柠檬水"],
    answer: "想你想到心里都是水"
  },
  {
    question: "我给你煮了一碗面，你猜什么面?",
    options: ["牛肉面", "想见你一面", "阳春面", "炸酱面"],
    answer: "想见你一面"
  },
  {
    question: "我送你一颗糖，你猜什么糖?",
    options: ["水果糖", "你笑起来最甜的糖", "奶糖", "棒棒糖"],
    answer: "你笑起来最甜的糖"
  },
  {
    question: "我种了一棵树，你猜什么树?",
    options: ["苹果树", "只想和你共度朝朝暮暮", "松树", "桃树"],
    answer: "只想和你共度朝朝暮暮"
  },
  {
    question: "我带了一把伞，你猜什么伞?",
    options: ["雨伞", "想和你一生一世不走散", "太阳伞", "花伞"],
    answer: "想和你一生一世不走散"
  },
  {
    question: "我买了一张票，你猜什么票?",
    options: ["电影票", "通往你心里的门票", "车票", "船票"],
    answer: "通往你心里的门票"
  }
];

let current = 0;
let correct = 0;
let answered = false;

function showRiddle() {
  answered = false;
  const riddle = riddles[current];
  questionEl.textContent = riddle.question;
  scoreEl.textContent = `第 ${current + 1} 题 / ${riddles.length} · 答对 ${correct} 题`;
  resultEl.textContent = "选一个答案看看甜不甜。";
  answerGrid.innerHTML = "";
  riddle.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => chooseAnswer(button, option));
    answerGrid.append(button);
  });
  speechEl.textContent = riddle.answer;
}

function chooseAnswer(button, option) {
  if (answered) return;
  answered = true;
  const riddle = riddles[current];
  const isCorrect = option === riddle.answer;
  button.classList.add(isCorrect ? "correct" : "wrong");

  answerGrid.querySelectorAll("button").forEach((answerButton) => {
    if (answerButton.textContent === riddle.answer) {
      answerButton.classList.add("correct");
    }
  });

  if (isCorrect) {
    correct += 1;
    resultEl.textContent = `猜对啦：${riddle.answer}`;
  } else {
    resultEl.textContent = `差一点，正确答案是：${riddle.answer}`;
  }

  speechEl.textContent = riddle.answer;
  loveStage.classList.remove("pop");
  void loveStage.offsetWidth;
  loveStage.classList.add("pop");
  scoreEl.textContent = `第 ${current + 1} 题 / ${riddles.length} · 答对 ${correct} 题`;
}

function nextRiddle() {
  if (current >= riddles.length - 1) {
    resultEl.textContent = `全部猜完啦，你答对了 ${correct} / ${riddles.length} 题。`;
    speechEl.textContent = correct >= 6 ? "你真的太会猜甜话了" : "再玩一次会更甜";
    loveStage.classList.add("pop");
    return;
  }
  current += 1;
  showRiddle();
}

function restart() {
  current = 0;
  correct = 0;
  showRiddle();
}

nextBtn.addEventListener("click", nextRiddle);
restartBtn.addEventListener("click", restart);

showRiddle();
