const stage = document.querySelector("#stage");
const playBtn = document.querySelector("#playBtn");
const resetBtn = document.querySelector("#resetBtn");
const upBtn = document.querySelector("#upBtn");
const downBtn = document.querySelector("#downBtn");
const openBtn = document.querySelector("#openBtn");
const closeBtn = document.querySelector("#closeBtn");
const fallBtn = document.querySelector("#fallBtn");
const statusTag = document.querySelector("#statusTag");
let audioContext = null;
let floor = 1;
let doorOpen = false;
let broken = false;
let timers = [];

function getAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(freq, start, duration, gainValue = 0.045, type = "triangle") {
  const audio = getAudio();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.04);
}

function playSound() {
  playTone(260, 0.1, 4.8, 0.018, "sawtooth");
  playTone(720, 5.0, 0.08, 0.04, "square");
  playTone(180, 5.16, 0.45, 0.042, "sawtooth");
  playTone(80, 8.35, 0.62, 0.065, "triangle");
}

function clearTimers() {
  timers.forEach((timer) => clearTimeout(timer));
  timers = [];
}

function schedule(callback, delay) {
  const timer = setTimeout(callback, delay);
  timers.push(timer);
}

function updateStatus(text) {
  statusTag.textContent = text || `${floor} 楼 · ${doorOpen ? "门开" : "门关"}${broken ? " · 绳断" : ""}`;
}

function setElevatorPosition(nextFloor, duration = 1000) {
  floor = nextFloor;
  stage.style.setProperty("--elevator-top", nextFloor === 2 ? "5%" : "calc(100% - 92px)");
  stage.style.setProperty("--cable-height", nextFloor === 2 ? "14%" : "86%");
  const elevator = document.querySelector(".elevator");
  elevator.style.transitionDuration = `${duration}ms`;
  document.querySelectorAll(".cable").forEach((cable) => {
    cable.style.transitionDuration = `${duration}ms`;
  });
}

function goUp() {
  resetMovie(false);
  broken = false;
  doorOpen = false;
  stage.classList.remove("doors-open");
  setElevatorPosition(2, 1600);
  updateStatus("正在上升到 2 楼");
  schedule(() => updateStatus("2 楼 / 顶楼 · 门关"), 1650);
}

function goDown() {
  resetMovie(false);
  broken = false;
  doorOpen = false;
  stage.classList.remove("doors-open");
  setElevatorPosition(1, 1600);
  updateStatus("正在下降到 1 楼");
  schedule(() => updateStatus("1 楼 / 最下面 · 门关"), 1650);
}

function openDoor() {
  if (broken) return;
  doorOpen = true;
  stage.classList.add("doors-open");
  updateStatus();
}

function closeDoor() {
  doorOpen = false;
  stage.classList.remove("doors-open");
  updateStatus();
}

function playFallSound() {
  playTone(720, 0, 0.08, 0.04, "square");
  playTone(180, 0.16, 0.45, 0.042, "sawtooth");
  playTone(80, 2.35, 0.62, 0.065, "triangle");
}

function fallDown() {
  resetMovie(false);
  closeDoor();
  broken = true;
  stage.classList.add("broken");
  updateStatus("绳子断了，正在坠到 1 楼");
  playFallSound();
  schedule(() => {
    stage.classList.add("falling");
    setElevatorPosition(1, 2400);
  }, 120);
  schedule(() => {
    floor = 1;
    stage.classList.add("bump");
    updateStatus("1 楼 · 蹦!");
  }, 2600);
  schedule(() => stage.classList.remove("bump"), 3100);
}

function playMovie() {
  resetMovie(false);
  void stage.offsetWidth;
  stage.classList.add("playing");
  playSound();
  playBtn.textContent = "再播放一次";
  updateStatus("自动演示中：上升后断绳");
}

function resetMovie(full = true) {
  clearTimers();
  stage.classList.remove("playing", "doors-open", "broken", "falling", "bump");
  broken = false;
  doorOpen = false;
  if (full) {
    setElevatorPosition(1, 400);
    floor = 1;
    updateStatus("1 楼 · 门关");
  }
  playBtn.textContent = "自动演示";
}

playBtn.addEventListener("click", playMovie);
resetBtn.addEventListener("click", resetMovie);
upBtn.addEventListener("click", goUp);
downBtn.addEventListener("click", goDown);
openBtn.addEventListener("click", openDoor);
closeBtn.addEventListener("click", closeDoor);
fallBtn.addEventListener("click", fallDown);
