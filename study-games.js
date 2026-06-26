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
  { zh: "快乐", answer: "happy", options: ["happy", "cold", "slow", "small"] },
  { zh: "科学", answer: "science", options: ["science", "weather", "village", "ticket"] },
  { zh: "历史", answer: "history", options: ["history", "music", "market", "bridge"] },
  { zh: "工程师", answer: "engineer", options: ["engineer", "doctor", "driver", "artist"] },
  { zh: "环境", answer: "environment", options: ["environment", "entrance", "elevator", "exercise"] },
  { zh: "决定", answer: "decision", options: ["decision", "direction", "dictionary", "distance"] },
  { zh: "危险的", answer: "dangerous", options: ["dangerous", "delicious", "different", "difficult"] },
  { zh: "重要的", answer: "important", options: ["important", "impossible", "interesting", "international"] },
  { zh: "解决", answer: "solve", options: ["solve", "save", "send", "show"] },
  { zh: "练习", answer: "practice", options: ["practice", "promise", "picture", "problem"] },
  { zh: "勇敢的", answer: "brave", options: ["brave", "bright", "broken", "busy"] },
  { zh: "博物馆", answer: "museum", options: ["museum", "mountain", "minute", "machine"] },
  { zh: "图书馆", answer: "library", options: ["library", "laboratory", "language", "landmark"] },
  { zh: "乘客", answer: "passenger", options: ["passenger", "paragraph", "platform", "passport"] },
  { zh: "发现", answer: "discover", options: ["discover", "describe", "develop", "discuss"] },
  { zh: "完成", answer: "complete", options: ["complete", "compare", "continue", "control"] }
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
  { q: "1 + 2 + ... + 20 = ?", answer: "210", hint: "高斯求和：20 × 21 ÷ 2。" },
  { q: "1 + 2 + ... + 50 = ?", answer: "1275", hint: "高斯求和：50 × 51 ÷ 2。" },
  { q: "1 + 2 + ... + 100 = ?", answer: "5050", hint: "高斯求和：100 × 101 ÷ 2。" },
  { q: "18 × 24 = ?", answer: "432", hint: "算数题：20 × 24 减去 2 × 24。" },
  { q: "936 ÷ 24 = ?", answer: "39", hint: "算数题：24 × 40 = 960，再少 24。" },
  { q: "2, 4, 8, 16, 下一个是？", answer: "32", hint: "奥数找规律：每次乘 2。" },
  { q: "3, 6, 11, 18, 27, 下一个是？", answer: "38", hint: "奥数找规律：加 3、5、7、9、11。" },
  { q: "1, 1, 2, 3, 5, 8, 下一个是？", answer: "13", hint: "奥数找规律：前两个数相加。" },
  { q: "一个长方形长 18 米、宽 7 米，面积是？", answer: "126", hint: "几何题：长 × 宽。" },
  { q: "正方形面积 144 平方厘米，边长是？", answer: "12", hint: "几何题：想哪个数乘自己等于 144。" },
  { q: "一辆车 3 小时走 216 千米，平均速度是？", answer: "72", hint: "行程问题：路程 ÷ 时间。" },
  { q: "甲每小时做 6 个，乙每小时做 9 个，一起 4 小时做几个？", answer: "60", hint: "工程问题：先算一小时一共做 15 个。" },
  { q: "水池甲管 6 小时注满，乙管 3 小时注满，一起几小时注满？", answer: "2", hint: "工程问题：每小时完成 1/6 + 1/3 = 1/2。" },
  { q: "一项工程，甲 12 天完成，乙 18 天完成，一起做 4 天完成几分之几？", answer: "5/9", hint: "工程问题：4 × (1/12 + 1/18)。", options: ["5/9", "1/2", "7/12", "2/3"] },
  { q: "一件商品 240 元，打八折后多少钱？", answer: "192", hint: "百分数：八折就是 80%。" },
  { q: "48 的 3/4 是多少？", answer: "36", hint: "分数题：48 ÷ 4 × 3。" },
  { q: "7/8 - 1/4 = ?", answer: "5/8", hint: "分数题：1/4 = 2/8。", options: ["5/8", "6/8", "3/4", "1/2"] },
  { q: "鸡兔同笼共有 10 只，脚 28 只，兔有几只？", answer: "4", hint: "奥数题：都当鸡是 20 只脚，多 8 只脚，每只兔多 2 只脚。" },
  { q: "两数和 48，差 16，较大的数是？", answer: "32", hint: "和差问题：(和 + 差) ÷ 2。" },
  { q: "三角形三个角是 35°、65°、？，第三个角是？", answer: "80", hint: "几何题：三角形内角和 180°。" }
];

const chineseQuestions = [
  { q: "“聚精会神”的意思最接近哪一个？", answer: "注意力很集中", hint: "成语理解：看“会神”。", options: ["注意力很集中", "跑得非常快", "声音很响", "天气很热"] },
  { q: "下列词语中，哪一个是近义词搭配？", answer: "安静—宁静", hint: "词语辨析：意思相近。", options: ["安静—宁静", "勇敢—胆小", "炎热—寒冷", "认真—马虎"] },
  { q: "“他像离弦的箭一样冲出去。”用了什么修辞？", answer: "比喻", hint: "把人比作箭。", options: ["比喻", "拟人", "排比", "反问"] },
  { q: "“小溪唱着歌向前跑。”用了什么修辞？", answer: "拟人", hint: "小溪像人一样唱歌。", options: ["拟人", "夸张", "设问", "对比"] },
  { q: "下面哪个句子标点更合适？", answer: "妈妈问：“你写完作业了吗？”", hint: "人物说话要用冒号和引号。", options: ["妈妈问：“你写完作业了吗？”", "妈妈问，你写完作业了吗。", "妈妈问“你写完作业了吗”。", "妈妈问：你写完作业了吗"] },
  { q: "“因为下雨，所以运动会推迟了。”这句话表示什么关系？", answer: "因果关系", hint: "因为……所以……", options: ["因果关系", "转折关系", "并列关系", "选择关系"] },
  { q: "作文写景时，哪一种顺序最清楚？", answer: "从远到近", hint: "写景可以按观察顺序。", options: ["从远到近", "想到哪写到哪", "只写颜色", "只写声音"] },
  { q: "阅读短文时，概括主要内容最好先找什么？", answer: "人物、事情、结果", hint: "谁做了什么，结果怎样。", options: ["人物、事情、结果", "所有生字", "最长句子", "标点符号"] },
  { q: "“书山有路勤为径”告诉我们什么？", answer: "学习要勤奋", hint: "看关键词“勤”。", options: ["学习要勤奋", "爬山很危险", "书很重", "路很宽"] },
  { q: "下列哪一组适合写观察日记？", answer: "日期、天气、变化", hint: "观察日记要记录变化。", options: ["日期、天气、变化", "姓名、电话、地址", "价格、重量、颜色", "速度、距离、车票"] }
];

const grammarQuestions = [
  { q: "I ___ a student.", answer: "am", hint: "主语是 I，用 am。", options: ["am", "is", "are", "be"] },
  { q: "She ___ my friend.", answer: "is", hint: "主语是 she，用 is。", options: ["is", "am", "are", "be"] },
  { q: "They ___ playing football.", answer: "are", hint: "主语是 they，用 are。", options: ["are", "is", "am", "be"] },
  { q: "There ___ an apple on the table.", answer: "is", hint: "an apple 是单数，用 is。", options: ["is", "are", "am", "be"] },
  { q: "There ___ many books in the bag.", answer: "are", hint: "many books 是复数，用 are。", options: ["are", "is", "am", "was"] },
  { q: "I saw ___ elephant at the zoo.", answer: "an", hint: "elephant 开头是元音音素，用 an。", options: ["an", "a", "the", "no"] },
  { q: "He goes to school ___ bus.", answer: "by", hint: "by bus 表示坐公交。", options: ["by", "on", "in", "at"] },
  { q: "We have English ___ Monday.", answer: "on", hint: "星期几前面用 on。", options: ["on", "in", "at", "by"] },
  { q: "My birthday is ___ June.", answer: "in", hint: "月份前面用 in。", options: ["in", "on", "at", "to"] },
  { q: "This book is ___.", answer: "mine", hint: "表示“我的书”，句末用名词性物主代词 mine。", options: ["mine", "my", "me", "I"] },
  { q: "Yesterday, I ___ to the park.", answer: "went", hint: "yesterday 是过去时间，go 的过去式是 went。", options: ["went", "go", "goes", "going"] },
  { q: "She ___ breakfast every morning.", answer: "has", hint: "she 是第三人称单数，用 has。", options: ["has", "have", "having", "had"] },
  { q: "Look! The plane ___ flying.", answer: "is", hint: "现在进行时：is flying。", options: ["is", "are", "was", "be"] },
  { q: "Tom is taller ___ Mike.", answer: "than", hint: "比较级常用 than。", options: ["than", "then", "that", "this"] },
  { q: "This is the ___ book in the shop.", answer: "best", hint: "the 后面可以接最高级 best。", options: ["best", "better", "good", "well"] },
  { q: "I don't ___ milk.", answer: "like", hint: "don't 后面用动词原形。", options: ["like", "likes", "liked", "liking"] },
  { q: "Can you ___ a bike?", answer: "ride", hint: "can 后面用动词原形。", options: ["ride", "rides", "rode", "riding"] },
  { q: "How ___ water do you need?", answer: "much", hint: "water 不可数，用 how much。", options: ["much", "many", "old", "long"] }
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
    statusText.textContent = current.zh
      ? `答对了：${current.zh} = ${current.answer}。`
      : `答对了，答案是 ${current.answer}。`;
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
  const options = new Set(current.options || [current.answer]);
  while (!current.options && options.size < 4) {
    const offset = Math.floor(Math.random() * 36) - 16;
    const value = answerNumber + offset || answerNumber + 11;
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

function startChinese() {
  locked = false;
  current = pick(chineseQuestions);
  questionText.textContent = current.q;
  hintText.textContent = current.hint;
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

function startGrammar() {
  locked = false;
  current = pick(grammarQuestions);
  questionText.textContent = current.q;
  hintText.textContent = current.hint;
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

function restart() {
  score = 0;
  round = 1;
  typed = 0;
  mistakes = 0;
  statusText.textContent = game === "typing"
    ? "输入框里打字。完全一样就自动进入下一句。"
    : game === "math"
      ? "点正确答案。题目有工程问题、奥数题、高斯题、分数题、几何题。"
      : game === "chinese"
        ? "这是原创四年级语文练习：成语、修辞、标点、阅读和作文方法。"
        : game === "grammar"
          ? "选择正确单词，练 am/is/are、时态、冠词、介词、代词和比较级。"
          : "看中文，点正确的英文。答对会加分，答错也能继续练。";
  if (game === "words") startWords();
  if (game === "typing") startTyping();
  if (game === "math") startMath();
  if (game === "chinese") startChinese();
  if (game === "grammar") startGrammar();
}

nextBtn.addEventListener("click", () => {
  if (game === "words") startWords();
  if (game === "typing") startTyping();
  if (game === "math") startMath();
  if (game === "chinese") startChinese();
  if (game === "grammar") startGrammar();
});

restartBtn.addEventListener("click", restart);
if (typingInput) typingInput.addEventListener("input", handleTyping);

restart();
