const stage = document.querySelector("#stage");
const playBtn = document.querySelector("#playBtn");
const outsideBtn = document.querySelector("#outsideBtn");
const insideBtn = document.querySelector("#insideBtn");
const house = document.querySelector(".house");
let audioContext = null;
let musicStopTimer = null;

function getAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(freq, start, duration, gainValue = 0.035) {
  const audio = getAudio();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.04);
}

function stopDreamMusic() {
  if (musicStopTimer) {
    window.clearTimeout(musicStopTimer);
    musicStopTimer = null;
  }
}

function playDreamMusic() {
  stopDreamMusic();
  const melody = [392, 440, 523, 659, 587, 523, 440, 392, 349, 392, 440, 523, 494, 440, 392, 330];
  const harmony = [196, 220, 262, 247, 220, 196, 175, 196];
  melody.forEach((note, index) => {
    playTone(note, index * 0.42, 0.34, 0.032);
  });
  harmony.forEach((note, index) => {
    playTone(note, index * 0.84, 0.72, 0.018);
  });
  musicStopTimer = window.setTimeout(() => {
    musicStopTimer = null;
  }, 7600);
}

function restartDream() {
  playDreamMusic();
  stage.classList.remove("playing");
  void stage.offsetWidth;
  stage.classList.add("playing");
  playBtn.textContent = "再播放一次";
}

function setView(view) {
  stopDreamMusic();
  stage.dataset.view = view;
  outsideBtn.classList.toggle("active", view === "outside");
  insideBtn.classList.toggle("active", view === "inside");
  stage.classList.remove("playing");
  playBtn.textContent = "播放梦境";
}

window.setDreamView = setView;
outsideBtn.addEventListener("click", () => setView("outside"));
insideBtn.addEventListener("click", () => setView("inside"));
house.addEventListener("click", () => setView("inside"));
playBtn.addEventListener("click", restartDream);
