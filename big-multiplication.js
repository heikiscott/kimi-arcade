const STORAGE_KEY = "kimi-big-multiplication-pass-v1";
const QUESTION_COUNT = 20;
const QUICK_SECONDS = 5;

const levels = [
  ...Array.from({ length: 9 }, (_, index) => ({
    id: `day-${index + 1}`,
    day: `Day ${index + 1}`,
    title: `${index + 11}的乘法表专项训练`,
    desc: `学习${index + 11}的乘法表`,
    type: "basic",
    factor: index + 11,
    passRate: 100,
    timed: false
  })),
  ...Array.from({ length: 9 }, (_, index) => {
    const start = index < 8 ? index + 11 : 11;
    const factors = index < 8 ? [start, start + 1] : [11, 14, 17, 19];
    return {
      id: `day-${index + 10}`,
      day: `Day ${index + 10}`,
      title: `${factors.join("、")}混合练习`,
      desc: "混合计算、逆向计算、应用题",
      type: "mixed",
      factors,
      passRate: 80,
      timed: true
    };
  }),
  { id: "day-19", day: "Day 19", title: "综合复习（一）", desc: "11-15 乘法综合复习", type: "review", factors: [11, 12, 13, 14, 15], passRate: 80, timed: false },
  { id: "day-20", day: "Day 20", title: "综合复习（二）", desc: "16-19 乘法综合复习", type: "review", factors: [16, 17, 18, 19], passRate: 80, timed: false },
  { id: "day-21", day: "Day 21", title: "逆向思维训练", desc: "看到答案，反推是哪两个数相乘", type: "reverse", factors: [11, 12, 13, 14, 15, 16, 17, 18, 19], passRate: 80, timed: true },
  { id: "exam-1", day: "过关卷（一）", title: "综合测试（一）", desc: "11-15 最终测试", type: "exam", factors: [11, 12, 13, 14, 15], passRate: 90, timed: true },
  { id: "exam-2", day: "过关卷（二）", title: "综合测试（二）", desc: "11-19 最终测试", type: "exam", factors: [11, 12, 13, 14, 15, 16, 17, 18, 19], passRate: 90, timed: true }
];

const state = {
  screen: "home",
  activeLevel: null,
  questions: [],
  index: 0,
  answers: [],
  hintOpen: false,
  secondsLeft: QUICK_SECONDS,
  timer: null,
  wrongPractice: false
};

const els = {
  homeScreen: document.querySelector("#homeScreen"),
  quizScreen: document.querySelector("#quizScreen"),
  resultScreen: document.querySelector("#resultScreen"),
  recordScreen: document.querySelector("#recordScreen"),
  completedDays: document.querySelector("#completedDays"),
  averageRate: document.querySelector("#averageRate"),
  levelList: document.querySelector("#levelList"),
  recordTopBtn: document.querySelector("#recordTopBtn"),
  levelsNav: document.querySelector("#levelsNav"),
  recordsNav: document.querySelector("#recordsNav"),
  backHomeBtn: document.querySelector("#backHomeBtn"),
  quizMeta: document.querySelector("#quizMeta"),
  quizTitle: document.querySelector("#quizTitle"),
  timerBox: document.querySelector("#timerBox"),
  progressBar: document.querySelector("#progressBar"),
  questionType: document.querySelector("#questionType"),
  questionText: document.querySelector("#questionText"),
  answerForm: document.querySelector("#answerForm"),
  answerInput: document.querySelector("#answerInput"),
  hintToggle: document.querySelector("#hintToggle"),
  hintPanel: document.querySelector("#hintPanel"),
  feedbackText: document.querySelector("#feedbackText"),
  doneCount: document.querySelector("#doneCount"),
  doneList: document.querySelector("#doneList"),
  resultBadge: document.querySelector("#resultBadge"),
  resultTitle: document.querySelector("#resultTitle"),
  resultTotal: document.querySelector("#resultTotal"),
  resultCorrect: document.querySelector("#resultCorrect"),
  resultRate: document.querySelector("#resultRate"),
  wrongList: document.querySelector("#wrongList"),
  retryBtn: document.querySelector("#retryBtn"),
  resultHomeBtn: document.querySelector("#resultHomeBtn"),
  exitRecordBtn: document.querySelector("#exitRecordBtn"),
  recordCompleted: document.querySelector("#recordCompleted"),
  recordAverage: document.querySelector("#recordAverage"),
  recordAttempts: document.querySelector("#recordAttempts"),
  historyTab: document.querySelector("#historyTab"),
  wrongTab: document.querySelector("#wrongTab"),
  historyPanel: document.querySelector("#historyPanel"),
  wrongPanel: document.querySelector("#wrongPanel")
};

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.best && saved.history && saved.wrongs) return saved;
  } catch {
    // Broken browser storage should not break the practice app.
  }
  return { best: {}, history: [], wrongs: {} };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatRate(value) {
  return `${Math.round(value)}%`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getUnlockedIndex(data) {
  let unlocked = 0;
  levels.forEach((level, index) => {
    if (index === 0 || data.best[levels[index - 1].id]?.passed) unlocked = index;
  });
  return unlocked;
}

function getStats(data) {
  const passedDays = levels.filter((level) => level.id.startsWith("day-") && data.best[level.id]?.passed).length;
  const rates = Object.values(data.best).map((item) => item.rate);
  const average = rates.length ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : 0;
  return { passedDays, average, attempts: data.history.length };
}

function showScreen(name) {
  clearInterval(state.timer);
  state.timer = null;
  state.screen = name;
  [els.homeScreen, els.quizScreen, els.resultScreen, els.recordScreen].forEach((screen) => screen.classList.remove("active"));
  document.querySelector(`#${name}Screen`).classList.add("active");
  els.levelsNav.classList.toggle("active", name === "home");
  els.recordsNav.classList.toggle("active", name === "record");
}

function renderHome() {
  const data = loadData();
  const { passedDays, average } = getStats(data);
  const unlockedIndex = getUnlockedIndex(data);
  els.completedDays.textContent = `${passedDays} 天`;
  els.averageRate.textContent = formatRate(average);
  els.levelList.innerHTML = "";

  levels.forEach((level, index) => {
    const best = data.best[level.id];
    const unlocked = index <= unlockedIndex;
    const card = document.createElement("button");
    card.type = "button";
    card.className = `level-card${best?.passed ? " passed" : ""}${unlocked ? "" : " locked"}`;
    card.disabled = !unlocked;
    card.innerHTML = `
      <span class="level-icon">${best?.passed ? "✓" : unlocked ? "▶" : "🔒"}</span>
      <span>
        <h3>${level.day}：${level.title}</h3>
        <p>${level.desc}</p>
        <span class="level-meta">
          <span>20 题</span>
          <span>${level.passRate}%通过</span>
          <span>${level.timed ? "每题5秒" : "不限时"}</span>
          <span>最佳成绩：${best ? formatRate(best.rate) : "--"}</span>
        </span>
      </span>
      <strong class="pass-stamp">${best?.passed ? "已通过" : unlocked ? "开始" : "未解锁"}</strong>
    `;
    card.addEventListener("click", () => startLevel(level));
    els.levelList.append(card);
  });
}

function questionKey(question) {
  return `${question.left}×${question.right}`;
}

function buildQuestion(left, right, mode = "direct") {
  const answer = left * right;
  if (mode === "reverse") {
    return { type: "逆向计算", prompt: `${answer} = ? × ${right}`, answer: left, left, right, display: `${left} × ${right} = ${answer}` };
  }
  if (mode === "word") {
    return { type: "应用题", prompt: `每排有 ${right} 个座位，一共有 ${left} 排，共有多少个座位？`, answer, left, right, display: `${left} × ${right} = ${answer}` };
  }
  return { type: "基础计算", prompt: `${left} × ${right} = ?`, answer, left, right, display: `${left} × ${right} = ${answer}` };
}

function buildLevelQuestions(level) {
  const questions = [];
  if (level.type === "basic") {
    for (let left = 1; left <= 19; left += 1) questions.push(buildQuestion(left, level.factor));
    questions.push(buildQuestion(level.factor, level.factor));
    return questions;
  }

  const factors = level.factors || [11, 12, 13, 14, 15, 16, 17, 18, 19];
  while (questions.length < QUESTION_COUNT) {
    const right = randomItem(factors);
    const left = Math.floor(Math.random() * 19) + 1;
    const modes = level.type === "reverse" ? ["reverse"] : ["direct", "reverse", "word"];
    questions.push(buildQuestion(left, right, randomItem(modes)));
  }
  return shuffle(questions).slice(0, QUESTION_COUNT);
}

function buildWrongPracticeQuestions(data) {
  const pool = Object.values(data.wrongs).filter((item) => item.count > 0);
  return shuffle(pool).slice(0, Math.min(QUESTION_COUNT, pool.length)).map((item) => buildQuestion(item.left, item.right, "direct"));
}

function hintList(question) {
  const { left, right, answer } = question;
  const smaller = Math.min(left, right);
  const larger = Math.max(left, right);
  const hints = [
    `分配律：${left} × ${right} = ${left} × 10 + ${left} × ${right - 10}。`,
    `连加法：如果知道 ${left} × ${right - 1} = ${left * (right - 1)}，再加 ${left} 就是 ${answer}。`
  ];
  if (left === right) hints.push(`平方数记忆：${left} × ${left} 是平方数，答案 ${answer} 要重点背。`);
  if (larger % smaller === 0 && smaller > 1) hints.push(`倍数关系：${larger} 是 ${smaller} 的倍数，可以先算小的再放大。`);
  const sound = { 121: "一二一，排队走", 144: "一四四，像十四十四", 169: "一路走", 196: "一九六，拐弯走", 225: "二二五，真清楚" }[answer];
  if (sound) hints.push(`联想记忆：${answer} 可以记成“${sound}”。`);
  return hints.slice(0, left === right ? 3 : 2);
}

function renderQuestion() {
  const question = state.questions[state.index];
  if (!question) {
    finishQuiz();
    return;
  }

  const completed = state.answers.length;
  els.quizMeta.textContent = state.wrongPractice ? "错题本练习" : state.activeLevel.day;
  els.quizTitle.textContent = state.wrongPractice ? "错题专项练习" : state.activeLevel.title;
  els.questionType.textContent = question.type;
  els.questionText.innerHTML = question.left === question.right && question.type === "基础计算" ? question.prompt.replace("?", "<strong>?</strong>") : question.prompt;
  els.answerInput.value = "";
  els.answerInput.focus();
  els.feedbackText.textContent = "";
  els.feedbackText.className = "feedback-text";
  els.hintPanel.classList.toggle("open", state.hintOpen);
  els.hintToggle.textContent = state.hintOpen ? "收起记忆提示" : "展开记忆提示";
  els.hintPanel.innerHTML = hintList(question).map((hint) => `<p>${hint}</p>`).join("");
  els.doneCount.textContent = `${completed}/${state.questions.length}`;
  els.progressBar.style.width = `${(completed / state.questions.length) * 100}%`;
  renderDoneList();
  resetTimer();
}

function resetTimer() {
  clearInterval(state.timer);
  state.timer = null;
  if (!state.activeLevel?.timed && !state.wrongPractice) {
    els.timerBox.textContent = "不限时";
    els.timerBox.classList.remove("warn");
    return;
  }

  state.secondsLeft = QUICK_SECONDS;
  updateTimerBox();
  state.timer = setInterval(() => {
    state.secondsLeft -= 1;
    updateTimerBox();
    if (state.secondsLeft <= 0) submitAnswer(true);
  }, 1000);
}

function updateTimerBox() {
  els.timerBox.textContent = `${state.secondsLeft}s`;
  els.timerBox.classList.toggle("warn", state.secondsLeft <= 3);
}

function renderDoneList() {
  els.doneList.innerHTML = "";
  state.answers.forEach((answer, index) => {
    const item = document.createElement("div");
    item.className = `done-item ${answer.correct ? "correct" : "wrong"}`;
    const square = answer.question.left === answer.question.right;
    item.innerHTML = `${index + 1}. ${answer.question.display.replace(String(answer.question.answer), square ? `<strong>${answer.question.answer}</strong>` : String(answer.question.answer))}`;
    els.doneList.append(item);
  });
}

function submitAnswer(timeout = false) {
  const question = state.questions[state.index];
  if (!question) return;
  clearInterval(state.timer);
  const raw = timeout ? "" : els.answerInput.value.trim();
  const userAnswer = raw === "" ? null : Number(raw);
  const correct = userAnswer === question.answer;
  state.answers.push({ question, userAnswer, correct, timeout });

  if (state.wrongPractice) updateWrongPracticeBook(question, correct);

  els.feedbackText.textContent = correct ? "太棒了！继续保持！" : "再接再厉，多练习就能掌握！";
  els.feedbackText.className = `feedback-text ${correct ? "good" : "bad"}`;
  state.index += 1;
  window.setTimeout(renderQuestion, state.wrongPractice ? 480 : 220);
}

function updateWrongPracticeBook(question, correct) {
  const data = loadData();
  const key = questionKey(question);
  const item = data.wrongs[key];
  if (!item) return;
  item.count += correct ? -1 : 1;
  item.lastWrongAt = correct ? item.lastWrongAt : new Date().toISOString();
  if (item.count <= 0) delete data.wrongs[key];
  saveData(data);
}

function finishQuiz() {
  clearInterval(state.timer);
  state.timer = null;
  const total = state.answers.length;
  const correct = state.answers.filter((item) => item.correct).length;
  const rate = total ? (correct / total) * 100 : 0;
  const passed = state.wrongPractice ? true : rate >= state.activeLevel.passRate;

  if (!state.wrongPractice) {
    const data = loadData();
    const oldBest = data.best[state.activeLevel.id];
    if (!oldBest || rate > oldBest.rate) data.best[state.activeLevel.id] = { rate, passed, at: new Date().toISOString() };
    if (oldBest?.passed && !passed) data.best[state.activeLevel.id].passed = true;
    data.history.unshift({ levelId: state.activeLevel.id, name: `${state.activeLevel.day}：${state.activeLevel.title}`, rate, correct, total, passed, at: new Date().toISOString() });
    state.answers.filter((item) => !item.correct).forEach(({ question }) => {
      const key = questionKey(question);
      data.wrongs[key] = data.wrongs[key] || { key, left: question.left, right: question.right, answer: question.left * question.right, count: 0, lastWrongAt: "" };
      data.wrongs[key].count += 1;
      data.wrongs[key].lastWrongAt = new Date().toISOString();
    });
    saveData(data);
  }

  renderResult({ total, correct, rate, passed });
  showScreen("result");
}

function renderResult(result) {
  els.resultBadge.textContent = result.passed ? "通过" : "未通过";
  els.resultBadge.classList.toggle("pass", result.passed);
  els.resultTitle.textContent = state.wrongPractice ? "错题本练习完成" : `${state.activeLevel.day} 成绩`;
  els.resultTotal.textContent = result.total;
  els.resultCorrect.textContent = result.correct;
  els.resultRate.textContent = formatRate(result.rate);
  const wrongs = state.answers.filter((item) => !item.correct);
  els.wrongList.innerHTML = wrongs.length
    ? wrongs.map((item) => `<div class="wrong-row"><strong>${item.question.display}</strong><span>你的答案：${item.timeout ? "超时" : item.userAnswer ?? "空"}；正确答案：${item.question.answer}</span></div>`).join("")
    : `<p class="empty-note">没有错题，太稳了。</p>`;
}

function startLevel(level) {
  state.activeLevel = level;
  state.questions = buildLevelQuestions(level);
  state.index = 0;
  state.answers = [];
  state.hintOpen = false;
  state.wrongPractice = false;
  showScreen("quiz");
  renderQuestion();
}

function startWrongPractice() {
  const data = loadData();
  const questions = buildWrongPracticeQuestions(data);
  if (!questions.length) return;
  state.activeLevel = { day: "错题本", title: "错题专项练习", passRate: 0, timed: false };
  state.questions = questions;
  state.index = 0;
  state.answers = [];
  state.hintOpen = true;
  state.wrongPractice = true;
  showScreen("quiz");
  renderQuestion();
}

function renderRecords(tab = "history") {
  const data = loadData();
  const { passedDays, average, attempts } = getStats(data);
  els.recordCompleted.textContent = passedDays;
  els.recordAverage.textContent = formatRate(average);
  els.recordAttempts.textContent = attempts;
  els.historyTab.classList.toggle("active", tab === "history");
  els.wrongTab.classList.toggle("active", tab === "wrong");
  els.historyPanel.classList.toggle("active", tab === "history");
  els.wrongPanel.classList.toggle("active", tab === "wrong");
  els.historyPanel.innerHTML = data.history.length
    ? data.history.map((item) => `<div class="history-row"><strong>${item.name}</strong><span>${formatRate(item.rate)} · ${item.correct}/${item.total} · ${new Date(item.at).toLocaleString()}</span></div>`).join("")
    : `<p class="empty-note">还没有完成记录。</p>`;
  const wrongs = Object.values(data.wrongs).filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
  els.wrongPanel.innerHTML = wrongs.length
    ? `<button class="start-wrong-btn" type="button" id="startWrongPracticeBtn">开始练习错题</button>${wrongs.map((item) => `<div class="wrong-row"><strong>${item.left} × ${item.right} = ${item.answer}</strong><span>错误次数：${item.count}；最后错误：${new Date(item.lastWrongAt).toLocaleString()}</span></div>`).join("")}`
    : `<p class="empty-note">错题本是空的，目标达成。</p>`;
  document.querySelector("#startWrongPracticeBtn")?.addEventListener("click", startWrongPractice);
}

els.answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAnswer(false);
});

els.hintToggle.addEventListener("click", () => {
  state.hintOpen = !state.hintOpen;
  els.hintPanel.classList.toggle("open", state.hintOpen);
  els.hintToggle.textContent = state.hintOpen ? "收起记忆提示" : "展开记忆提示";
});

els.backHomeBtn.addEventListener("click", () => {
  showScreen("home");
  renderHome();
});

els.resultHomeBtn.addEventListener("click", () => {
  showScreen("home");
  renderHome();
});

els.retryBtn.addEventListener("click", () => {
  if (state.wrongPractice) startWrongPractice();
  else startLevel(state.activeLevel);
});

[els.recordTopBtn, els.recordsNav].forEach((button) => {
  button.addEventListener("click", () => {
    showScreen("record");
    renderRecords("history");
  });
});

[els.exitRecordBtn, els.levelsNav].forEach((button) => {
  button.addEventListener("click", () => {
    showScreen("home");
    renderHome();
  });
});

els.historyTab.addEventListener("click", () => renderRecords("history"));
els.wrongTab.addEventListener("click", () => renderRecords("wrong"));

renderHome();
