const stage = document.querySelector("#stage");
const playBtn = document.querySelector("#playBtn");
const resetBtn = document.querySelector("#resetBtn");
let audioContext = null;

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

function playMovie() {
  stage.classList.remove("playing");
  void stage.offsetWidth;
  stage.classList.add("playing");
  playSound();
  playBtn.textContent = "再播放一次";
}

function resetMovie() {
  stage.classList.remove("playing");
  playBtn.textContent = "播放短片";
}

playBtn.addEventListener("click", playMovie);
resetBtn.addEventListener("click", resetMovie);
