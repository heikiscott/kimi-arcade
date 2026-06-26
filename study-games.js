const game = document.body.dataset.game;
const scoreText = document.querySelector("#scoreText");
const roundText = document.querySelector("#roundText");
const questionText = document.querySelector("#questionText");
const hintText = document.querySelector("#hintText");
const answerGrid = document.querySelector("#answerGrid");
const statusText = document.querySelector("#statusText");
const nextBtn = document.querySelector("#nextBtn");
const restartBtn = document.querySelector("#restartBtn");
const typingInput = document.querySelector("#typingInput");

let score = 0;
let round = 1;
let current = null;
let locked = false;
let typed = 0;
let mistakes = 0;

const wordQuestions = [
  { zh: "苹果", answer: "apple", options: ["apple", "train", "cloud", "house"] },
  { zh: "飞机", answer: "airplane", options: ["subway", "airplane", "river", "pencil"] },
  { zh: "地铁", answer: "subway", options: ["subway", "banana", "window", "chair"] },
  { zh: "城市", answer: "city", options: ["city", "dog", "milk", "desk"] },
  { zh: "朋友", answer: "friend", options: ["friend", "garden", "school", "ship"] },
  { zh: "天空", answer: "sky", options: ["road", "sky", "bag", "cake"] },
  { zh: "房子", answer: "house", options: ["orange", "house", "book", "door"] },
  { zh: "快乐", answer: "happy", options: ["happy", "cold", "slow", "small"] }
];

const typingLines = [
  "I can build a house.",
  "The train is very fast.",
  "My airplane is ready.",
  "We go to the mall by subway.",
  "Clouds are outside the window.",
  "Practice makes typing better.",
  "Math games are fun.",
  "I like English words."
];

const mathQuestions = [
  { q: "8 + 7 = ?", answer: "15", hint: "算数题：先算 8 加 7。" },
  { q: "24 - 9 = ?", answer: "15", hint: "算数题：24 减 9。" },
  { q: "6 × 7 = ?", answer: "42", hint: "乘法题。" },
  { q: "36 ÷ 4 = ?", answer: "9", hint: "除法题。" },
  { q: "1 + 2 + ... + 10 = ?", answer: "55", hint: "高斯求和：头尾相加是 11。" },
  { q: "1 + 2 + ... + 20 = ?", answer: "210", hint: "高斯求和：20 × 21 ÷ 2。" },
  { q: "2, 4, 8, 16, 下一个是？", answer: "32", hint: "奥数找规律：每次乘 2。" },
  { q: "3, 6, 11, 18, 下一个是？", answer: "27", hint: "奥数找规律：加 3、5、7、9。" },
  { q: "一个正方形边长 6，周长是？", answer: "24", hint: "四条边一样长。" },
  { q: "5 个小朋友每人 3 个糖，一共？", answer: "15", hint: "应用题：5 × 3。" }
];

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function updateScore() {
  scoreText.textContent = String(score);
  roundText.textContent = game === "typing" ? accuracyText() : String(round);
}

function accuracyText() {
  const total = typed + mistakes;
  if (total === 0) return "100%";
  return `${Math.max(0, Math.round((typed / total) * 100))}%`;
}

function startWords() {
  locked = false;
  current = pick(wordQuestions);
  questionText.textContent = current.zh;
  hintText.textContent = "选出这个中文的英文单词。";
  answerGrid.innerHTML = "";
  shuffle(current.options).forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => answerChoice(button, option));
    answerGrid.appendChild(button);
  });
  updateScore();
}

function answerChoice(button, option) {
  if (locked) return;
  locked = true;
  const correct = option === current.answer;
  button.classList.add(correct ? "correct" : "wrong");
  if (correct) {
    score += 10;
    statusText.textContent = `答对了：${current.zh} = ${current.answer}。`;
  } else {
    statusText.textContent = `差一点，正确答案是 ${current.answer}。`;
    [...answerGrid.children].forEach((child) => {
      if (child.textContent === current.answer) child.classList.add("correct");
    });
  }
  round += 1;
  updateScore();
}

function startTyping() {
  current = pick(typingLines);
  questionText.textContent = current;
  hintText.textContent = "照着英文句子打出来，大小写和标点也要一样。";
  answerGrid.textContent = "准备好了就开始打。";
  typingInput.value = "";
  typingInput.focus();
  updateScore();
}

function handleTyping() {
  const value = typingInput.value;
  let preview = "";
  mistakes = 0;
  for (let i = 0; i < current.length; i += 1) {
    const target = current[i];
    const input = value[i];
    if (input == null) {
      preview += target;
    } else if (input === target) {
      preview += target;
    } else {
      preview += "□";
      mistakes += 1;
    }
  }
  typed = Math.max(typed, value.length - mistakes);
  answerGrid.textContent = preview;
  roundText.textContent = accuracyText();
  if (value === current) {
    score += 1;
    scoreText.textContent = String(score);
    statusText.textContent = "这一句打对了，自动换下一句。";
    setTimeout(startTyping, 650);
  } else if (mistakes > 0) {
    statusText.textContent = "有地方不一样，看小方块的位置再改。";
  } else {
    statusText.textContent = "很好，继续打。";
  }
}

function startMath() {
  locked = false;
  current = pick(mathQuestions);
  questionText.textContent = current.q;
  hintText.textContent = current.hint;
  answerGrid.innerHTML = "";
  const answerNumber = Number(current.answer);
  const options = new Set([current.answer]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 18) - 8;
    const value = answerNumber + offset || answerNumber + 3;
    if (value > 0) options.add(String(value));
  }
  shuffle([...options]).forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => answerChoice(button, option));
    answerGrid.appendChild(button);
  });
  updateScore();
}

function restart() {
  score = 0;
  round = 1;
  typed = 0;
  mistakes = 0;
  statusText.textContent = game === "typing"
    ? "输入框里打字。完全一样就自动进入下一句。"
    : game === "math"
      ? "点正确答案。题目会有加减乘除、找规律和高斯求和。"
      : "看中文，点正确的英文。答对会加分，答错也能继续练。";
  if (game === "words") startWords();
  if (game === "typing") startTyping();
  if (game === "math") startMath();
}

nextBtn.addEventListener("click", () => {
  if (game === "words") startWords();
  if (game === "typing") startTyping();
  if (game === "math") startMath();
});

restartBtn.addEventListener("click", restart);
if (typingInput) typingInput.addEventListener("input", handleTyping);

restart();
