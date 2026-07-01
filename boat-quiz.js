const canvas = document.querySelector("#boatCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const progressText = document.querySelector("#progressText");
const gateText = document.querySelector("#gateText");
const speedText = document.querySelector("#speedText");
const statusText = document.querySelector("#statusText");
const quizCard = document.querySelector("#quizCard");
const quizCategory = document.querySelector("#quizCategory");
const quizQuestion = document.querySelector("#quizQuestion");
const answerGrid = document.querySelector("#answerGrid");
const startBtn = document.querySelector("#startBtn");
const paddleBtn = document.querySelector("#paddleBtn");
const restartBtn = document.querySelector("#restartBtn");

const questions = [
  {
    category: "字母关",
    question: "解答题：英文里 gravity（重力）常用哪个字母表示？",
    answers: ["G", "P", "R", "M"],
    correct: "G"
  },
  {
    category: "名侦探知识",
    question: "侦探故事里，主角最常做的事情是什么？",
    answers: ["找线索推理", "一直睡觉", "只卖糖果", "不看现场"],
    correct: "找线索推理"
  },
  {
    category: "绿野仙踪",
    question: "绿野仙踪常见故事里，小女孩最想找到什么？",
    answers: ["回家的路", "一艘潜水艇", "火山口", "宇宙飞船"],
    correct: "回家的路"
  },
  {
    category: "重返奥兹国",
    question: "重返奥兹风格故事通常是什么类型？",
    answers: ["奇幻冒险", "纯数学考试", "做饭比赛", "普通停车"],
    correct: "奇幻冒险"
  },
  {
    category: "巨人题",
    question: "巨人题材动画里，城墙最常代表什么？",
    answers: ["保护和边界", "游泳池", "糖果盒", "普通铅笔"],
    correct: "保护和边界"
  },
  {
    category: "鬼灭题",
    question: "很多鬼怪故事里，鬼最怕哪一种自然光？",
    answers: ["太阳光", "台灯光", "手机光", "冰箱光"],
    correct: "太阳光"
  },
  {
    category: "小猪佩奇",
    question: "小猪佩奇的弟弟常见名字是什么？",
    answers: ["乔治", "亨利", "托托", "奥兹"],
    correct: "乔治"
  },
  {
    category: "寻秦记",
    question: "寻秦记这一类故事常见关键词是什么？",
    answers: ["穿越到古代", "滑雪比赛", "海底种树", "月亮修车"],
    correct: "穿越到古代"
  }
];

const gateMarks = [18, 42, 66, 86];
let progress = 0;
let speed = 0.045;
let running = false;
let pausedForQuiz = false;
let gateIndex = 0;
let currentQuestion = questions[0];
let message = "点“开始滑船”，小船就会往前滑。";
let lastTime = performance.now();
let boostUntil = 0;

function resetGame() {
  progress = 0;
  speed = 0.045;
  running = false;
  pausedForQuiz = false;
  gateIndex = 0;
  currentQuestion = questions[0];
  message = "重新回到起点。点开始滑船再来。";
  quizCard.hidden = true;
  updateHud();
}

function startGame() {
  if (progress >= 100) resetGame();
  running = true;
  pausedForQuiz = false;
  quizCard.hidden = true;
  message = "小船开始滑了，准备遇到问答门。";
  statusText.textContent = message;
}

function boostBoat() {
  if (!running || pausedForQuiz) {
    statusText.textContent = "先开始滑船，或者先答完题。";
    return;
  }
  boostUntil = performance.now() + 1600;
  message = "划快一点！水花变大了。";
  statusText.textContent = message;
}

function chooseQuestion() {
  if (gateIndex === 0) return questions[0];
  return questions[1 + ((gateIndex - 1) % (questions.length - 1))];
}

function openQuiz() {
  running = false;
  pausedForQuiz = true;
  currentQuestion = chooseQuestion();
  quizCategory.textContent = currentQuestion.category;
  quizQuestion.textContent = currentQuestion.question;
  answerGrid.innerHTML = "";
  shuffle([...currentQuestion.answers]).forEach((answer) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = answer;
    button.addEventListener("click", () => answerQuestion(answer, button));
    answerGrid.appendChild(button);
  });
  quizCard.hidden = false;
  message = `问答门 ${gateIndex + 1}：答对才能继续滑。`;
  statusText.textContent = message;
}

function answerQuestion(answer, button) {
  const buttons = [...answerGrid.querySelectorAll("button")];
  buttons.forEach((item) => {
    item.disabled = true;
    if (item.textContent === currentQuestion.correct) item.classList.add("correct");
  });
  if (answer === currentQuestion.correct) {
    button.classList.add("correct");
    gateIndex += 1;
    message = "答对了！小船继续往前滑。";
    statusText.textContent = message;
    window.setTimeout(() => {
      quizCard.hidden = true;
      pausedForQuiz = false;
      running = true;
    }, 850);
  } else {
    button.classList.add("wrong");
    message = `答错了，正确答案是：${currentQuestion.correct}。要从头重玩。`;
    statusText.textContent = message;
    window.setTimeout(resetGame, 1500);
  }
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function updateHud() {
  progressText.textContent = `${Math.floor(progress)}%`;
  gateText.textContent = `${gateIndex} / ${gateMarks.length}`;
  speedText.textContent = performance.now() < boostUntil ? "加速" : "普通";
}

function update(now) {
  const delta = Math.min(50, now - lastTime);
  lastTime = now;
  if (running && !pausedForQuiz) {
    const currentSpeed = now < boostUntil ? speed * 2.1 : speed;
    progress = Math.min(100, progress + currentSpeed * delta);
    if (gateIndex < gateMarks.length && progress >= gateMarks[gateIndex]) {
      progress = gateMarks[gateIndex];
      openQuiz();
    }
    if (progress >= 100 && running) {
      running = false;
      message = "到达终点！你完成滑船问答闯关。";
      statusText.textContent = message;
      quizCard.hidden = true;
    }
  }
  updateHud();
  draw(now / 1000);
  requestAnimationFrame(update);
}

function draw(time) {
  drawSky();
  drawRiver(time);
  drawBanks(time);
  drawGates();
  drawBoat(time);
  drawFinish();
  drawMessage();
}

function drawSky() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#b9e9ff");
  sky.addColorStop(1, "#f4f1c8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff6c4";
  ctx.beginPath();
  ctx.arc(910, 95, 45, 0, Math.PI * 2);
  ctx.fill();
  drawCloud(120, 90, 1);
  drawCloud(355, 125, 0.8);
  drawCloud(700, 82, 0.9);
}

function drawRiver(time) {
  const water = ctx.createLinearGradient(0, 150, 0, H);
  water.addColorStop(0, "#51b9db");
  water.addColorStop(1, "#207fae");
  ctx.fillStyle = water;
  ctx.beginPath();
  ctx.moveTo(0, 230);
  ctx.bezierCurveTo(210, 190, 300, 270, 520, 235);
  ctx.bezierCurveTo(750, 200, 865, 245, W, 208);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.48)";
  ctx.lineWidth = 5;
  for (let i = 0; i < 12; i += 1) {
    const y = 295 + i * 25;
    const offset = (time * 70 + i * 47) % 180;
    ctx.beginPath();
    ctx.moveTo(-120 + offset, y);
    ctx.bezierCurveTo(30 + offset, y - 14, 110 + offset, y + 16, 240 + offset, y);
    ctx.stroke();
  }
}

function drawBanks(time) {
  ctx.fillStyle = "#77b75f";
  ctx.beginPath();
  ctx.moveTo(0, 225);
  ctx.bezierCurveTo(240, 170, 330, 225, 515, 195);
  ctx.bezierCurveTo(740, 160, 870, 205, W, 170);
  ctx.lineTo(W, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4d8b4d";
  for (let i = 0; i < 12; i += 1) {
    const x = 45 + i * 92;
    const y = 178 + Math.sin(i + time) * 16;
    drawTree(x, y, 0.8 + (i % 3) * 0.16);
  }
}

function drawCloud(x, y, s) {
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(x, y, 25 * s, 0, Math.PI * 2);
  ctx.arc(x + 30 * s, y - 10 * s, 31 * s, 0, Math.PI * 2);
  ctx.arc(x + 65 * s, y, 24 * s, 0, Math.PI * 2);
  ctx.arc(x + 33 * s, y + 13 * s, 27 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawTree(x, y, s) {
  ctx.fillStyle = "#7b552e";
  ctx.fillRect(x - 7 * s, y + 18 * s, 14 * s, 36 * s);
  ctx.fillStyle = "#2f8f4f";
  ctx.beginPath();
  ctx.arc(x, y, 28 * s, 0, Math.PI * 2);
  ctx.arc(x - 18 * s, y + 18 * s, 22 * s, 0, Math.PI * 2);
  ctx.arc(x + 22 * s, y + 18 * s, 24 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawGates() {
  gateMarks.forEach((mark, index) => {
    const x = 120 + mark * 8.2 - progress * 8.2;
    if (x < -80 || x > W + 80) return;
    ctx.strokeStyle = index < gateIndex ? "#39a657" : "#ffd15f";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(x, 280);
    ctx.lineTo(x, 535);
    ctx.stroke();
    ctx.fillStyle = "#163040";
    ctx.font = "900 24px system-ui, sans-serif";
    ctx.fillText(`问答门 ${index + 1}`, x - 54, 268);
  });
}

function drawBoat(time) {
  const bob = Math.sin(time * 5) * 8;
  const x = 310;
  const y = 430 + bob;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#9b6238";
  ctx.beginPath();
  ctx.moveTo(-110, 0);
  ctx.lineTo(110, 0);
  ctx.lineTo(70, 52);
  ctx.lineTo(-72, 52);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#163040";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = "#f6d28f";
  ctx.fillRect(-45, -38, 90, 40);
  ctx.strokeRect(-45, -38, 90, 40);
  ctx.fillStyle = "#d94a44";
  ctx.beginPath();
  ctx.moveTo(0, -96);
  ctx.lineTo(0, -40);
  ctx.lineTo(70, -40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#163040";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -102);
  ctx.lineTo(0, 2);
  ctx.stroke();
  ctx.fillStyle = "#163040";
  ctx.font = "900 22px system-ui, sans-serif";
  ctx.fillText("QUIZ", -33, 38);
  if (performance.now() < boostUntil) {
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-120, 30);
    ctx.lineTo(-190, 42);
    ctx.moveTo(-118, 10);
    ctx.lineTo(-165, 12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFinish() {
  const x = 120 + 100 * 8.2 - progress * 8.2;
  if (x < -100 || x > W + 120) return;
  ctx.fillStyle = "#163040";
  ctx.fillRect(x, 260, 12, 260);
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = i % 2 ? "#163040" : "#ffffff";
    ctx.fillRect(x + 12, 260 + i * 28, 80, 28);
  }
  ctx.fillStyle = "#163040";
  ctx.font = "900 26px system-ui, sans-serif";
  ctx.fillText("终点", x - 12, 245);
}

function drawMessage() {
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.strokeStyle = "rgba(22,48,64,0.22)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(28, 525, 720, 70, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#163040";
  ctx.font = "900 28px system-ui, sans-serif";
  ctx.fillText(message, 48, 568);
}

startBtn.addEventListener("click", startGame);
paddleBtn.addEventListener("click", boostBoat);
restartBtn.addEventListener("click", resetGame);

updateHud();
requestAnimationFrame(update);
