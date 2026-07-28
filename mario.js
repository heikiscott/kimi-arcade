const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const statusText = document.querySelector("#statusText");
const restartBtn = document.querySelector("#restartBtn");
const recordsBtn = document.querySelector("#recordsBtn");
const recordsPanel = document.querySelector("#recordsPanel");
const recordsText = document.querySelector("#recordsText");
const soundToggleBtn = document.querySelector("#soundToggleBtn");
const musicImportBtn = document.querySelector("#musicImportBtn");
const musicImportInput = document.querySelector("#musicImportInput");
const introOverlay = document.querySelector("#introOverlay");
const startIntroBtn = document.querySelector("#startIntroBtn");
const introStatus = document.querySelector("#introStatus");
const mapButtons = document.querySelectorAll("[data-map]");

const keys = new Set();
const touchControls = new Set();
let audioContext = null;
let musicTimer = null;
let introTimer = null;
let gameStarted = false;
let won = false;
let sceneKey = "sky";
let selectedSceneKey = "sky";
let scene = null;
let cameraX = 0;
let lastTime = performance.now();
let doorHintTimer = 0;
let elevatorHintTimer = 0;

const W = canvas.width;
const H = canvas.height;
const statsKey = "marioAdventureStatsV2";
const playerIdKey = "marioAdventurePlayerId";
const audioMuteKey = "marioAdventureAudioMuted";
const audioFiles = {
  bgm: "assets/audio/mario-bgm.mp3",
  coin: "assets/audio/mario-coin.mp3",
  jump: "assets/audio/mario-jump.mp3",
  lavaDeath: "assets/audio/mario-lava-death.mp3",
  clear: "assets/audio/mario-clear.mp3"
};
function loadAudioEnabled() {
  try {
    return localStorage.getItem(audioMuteKey) !== "1";
  } catch {
    return true;
  }
}

const audioState = {
  enabled: loadAudioEnabled(),
  loading: false,
  loaded: false,
  buffers: {},
  musicSource: null,
  musicGain: null,
  customMusicName: ""
};

const player = {
  x: 72,
  y: 420,
  w: 36,
  h: 54,
  vx: 0,
  vy: 0,
  grounded: false,
  facing: 1,
  coins: 0,
  keys: 0,
  lives: 3,
  invincibleUntil: 0,
  starUntil: 0,
  power: "small",
  rideElevator: null,
  rideTrain: null
};

const sceneTemplates = {
  sky: {
    title: "天空草地",
    width: 2300,
    theme: "sky",
    spawn: { x: 72, y: 420 },
    platforms: [
      { x: 0, y: 540, w: 760, h: 80, type: "grass" },
      { x: 820, y: 540, w: 450, h: 80, type: "grass" },
      { x: 1360, y: 540, w: 940, h: 80, type: "grass" },
      { x: 220, y: 438, w: 160, h: 28, type: "brick" },
      { x: 480, y: 356, w: 160, h: 28, type: "brick" },
      { x: 760, y: 428, w: 150, h: 28, type: "cloud" },
      { x: 1038, y: 360, w: 166, h: 28, type: "cloud" },
      { x: 1320, y: 446, w: 190, h: 28, type: "brick" },
      { x: 1680, y: 402, w: 170, h: 28, type: "brick" },
      { x: 1920, y: 326, w: 150, h: 28, type: "cloud" }
    ],
    blocks: [
      { x: 330, y: 332, w: 42, h: 42, type: "question", content: "mushroom", used: false, revealed: true, bump: 0 },
      { x: 412, y: 332, w: 42, h: 42, type: "brick", content: "coin", used: false, revealed: true, bump: 0 },
      { x: 682, y: 284, w: 42, h: 42, type: "hidden", content: "star", used: false, revealed: false, bump: 0 },
      { x: 1182, y: 280, w: 42, h: 42, type: "question", content: "coin", used: false, revealed: true, bump: 0 },
      { x: 1768, y: 322, w: 42, h: 42, type: "question", content: "star", used: false, revealed: true, bump: 0 }
    ],
    powerups: [],
    elevators: [
      { x: 1540, y: 510, w: 104, h: 22, minY: 326, maxY: 510, speed: 1.15, dir: -1, active: true }
    ],
    coins: [
      { x: 258, y: 390 }, { x: 520, y: 310 }, { x: 808, y: 382 }, { x: 1110, y: 312 },
      { x: 1420, y: 400 }, { x: 1740, y: 354 }, { x: 1988, y: 282 }
    ],
    enemies: [
      { x: 630, y: 500, vx: 0.9, minX: 560, maxX: 740, type: "mush" },
      { x: 1260, y: 500, vx: 1.0, minX: 1120, maxX: 1340, type: "mush" }
    ],
    doors: [
      { x: 940, y: 456, w: 58, h: 84, label: "进鬼屋", target: "ghost", spawn: "entry" },
      { x: 2140, y: 456, w: 58, h: 84, label: "进城堡", target: "castle", spawn: "entry" }
    ],
    keyItems: [
      { x: 1870, y: 282, got: false }
    ],
    goal: null
  },
  ghost: {
    title: "鬼屋里面",
    width: 1880,
    theme: "ghost",
    spawn: { x: 84, y: 438 },
    platforms: [
      { x: 0, y: 540, w: 1880, h: 80, type: "stone" },
      { x: 220, y: 426, w: 170, h: 26, type: "wood" },
      { x: 500, y: 344, w: 170, h: 26, type: "wood" },
      { x: 770, y: 438, w: 170, h: 26, type: "wood" },
      { x: 1060, y: 340, w: 180, h: 26, type: "wood" },
      { x: 1380, y: 430, w: 176, h: 26, type: "wood" }
    ],
    blocks: [
      { x: 380, y: 304, w: 42, h: 42, type: "hidden", content: "coin", used: false, revealed: false, bump: 0 },
      { x: 720, y: 300, w: 42, h: 42, type: "question", content: "star", used: false, revealed: true, bump: 0 },
      { x: 1320, y: 292, w: 42, h: 42, type: "brick", content: "mushroom", used: false, revealed: true, bump: 0 }
    ],
    powerups: [],
    elevators: [
      { x: 820, y: 504, w: 104, h: 22, minY: 278, maxY: 504, speed: 1.25, dir: -1, active: true }
    ],
    coins: [
      { x: 274, y: 382 }, { x: 552, y: 296 }, { x: 834, y: 392 }, { x: 1128, y: 292 }, { x: 1460, y: 384 }
    ],
    enemies: [
      { x: 430, y: 482, vx: 0.7, minX: 320, maxX: 560, type: "ghost" },
      { x: 1010, y: 482, vx: 0.8, minX: 900, maxX: 1240, type: "ghost" },
      { x: 1620, y: 482, vx: 0.9, minX: 1480, maxX: 1760, type: "ghost" }
    ],
    doors: [
      { x: 62, y: 456, w: 58, h: 84, label: "出鬼屋", target: "sky", spawn: "afterGhost" },
      { x: 1710, y: 456, w: 58, h: 84, label: "去城堡", target: "castle", spawn: "entry" }
    ],
    keyItems: [
      { x: 1200, y: 294, got: false }
    ],
    goal: null
  },
  castle: {
    title: "城堡电梯",
    width: 2100,
    theme: "castle",
    spawn: { x: 82, y: 438 },
    platforms: [
      { x: 0, y: 540, w: 2100, h: 80, type: "castle" },
      { x: 240, y: 428, w: 180, h: 26, type: "castle" },
      { x: 560, y: 336, w: 176, h: 26, type: "castle" },
      { x: 890, y: 430, w: 178, h: 26, type: "castle" },
      { x: 1220, y: 336, w: 176, h: 26, type: "castle" },
      { x: 1540, y: 428, w: 184, h: 26, type: "castle" }
    ],
    blocks: [
      { x: 420, y: 292, w: 42, h: 42, type: "question", content: "coin", used: false, revealed: true, bump: 0 },
      { x: 820, y: 250, w: 42, h: 42, type: "hidden", content: "mushroom", used: false, revealed: false, bump: 0 },
      { x: 1460, y: 292, w: 42, h: 42, type: "question", content: "star", used: false, revealed: true, bump: 0 }
    ],
    powerups: [],
    elevators: [
      { x: 760, y: 506, w: 116, h: 22, minY: 296, maxY: 506, speed: 1.35, dir: -1, active: true },
      { x: 1320, y: 506, w: 116, h: 22, minY: 250, maxY: 506, speed: 1.05, dir: -1, active: true }
    ],
    coins: [
      { x: 300, y: 382 }, { x: 620, y: 288 }, { x: 940, y: 382 }, { x: 1280, y: 288 }, { x: 1600, y: 382 }
    ],
    enemies: [
      { x: 480, y: 500, vx: 0.9, minX: 360, maxX: 650, type: "shell" },
      { x: 1120, y: 500, vx: 1.1, minX: 1000, maxX: 1300, type: "shell" },
      { x: 1760, y: 500, vx: 1.0, minX: 1580, maxX: 1940, type: "shell" }
    ],
    doors: [
      { x: 64, y: 456, w: 58, h: 84, label: "出城堡", target: "sky", spawn: "afterCastle" }
    ],
    keyItems: [],
    goal: { x: 1950, y: 404, w: 44, h: 136, requireKeys: 1 }
  },
  jungle: {
    title: "丛林藤蔓",
    width: 2360,
    theme: "jungle",
    spawn: { x: 72, y: 420 },
    platforms: [
      { x: 0, y: 540, w: 620, h: 80, type: "jungle" },
      { x: 700, y: 500, w: 230, h: 34, type: "vine" },
      { x: 1010, y: 452, w: 260, h: 34, type: "vine" },
      { x: 1360, y: 540, w: 360, h: 80, type: "jungle" },
      { x: 1810, y: 476, w: 220, h: 34, type: "vine" },
      { x: 2100, y: 540, w: 260, h: 80, type: "jungle" },
      { x: 260, y: 414, w: 150, h: 26, type: "vine" },
      { x: 560, y: 340, w: 146, h: 26, type: "vine" },
      { x: 1500, y: 380, w: 160, h: 26, type: "vine" }
    ],
    blocks: [
      { x: 330, y: 314, w: 42, h: 42, type: "question", content: "mushroom", used: false, revealed: true, bump: 0 },
      { x: 620, y: 250, w: 42, h: 42, type: "hidden", content: "star", used: false, revealed: false, bump: 0 },
      { x: 1120, y: 350, w: 42, h: 42, type: "brick", content: "coin", used: false, revealed: true, bump: 0 },
      { x: 1560, y: 286, w: 42, h: 42, type: "question", content: "star", used: false, revealed: true, bump: 0 }
    ],
    powerups: [],
    elevators: [
      { x: 1710, y: 502, w: 104, h: 22, minY: 330, maxY: 502, speed: 1.18, dir: -1, active: true }
    ],
    coins: [
      { x: 300, y: 370 }, { x: 590, y: 296 }, { x: 760, y: 450 }, { x: 1110, y: 404 },
      { x: 1480, y: 338 }, { x: 1900, y: 428 }, { x: 2170, y: 492 }
    ],
    enemies: [
      { x: 500, y: 500, vx: 1.0, minX: 390, maxX: 600, type: "mush" },
      { x: 1220, y: 410, vx: 0.8, minX: 1040, maxX: 1260, type: "monkey" },
      { x: 1940, y: 434, vx: 1.0, minX: 1820, maxX: 2020, type: "monkey" }
    ],
    doors: [
      { x: 82, y: 456, w: 58, h: 84, label: "回天空", target: "sky", spawn: "entry" }
    ],
    keyItems: [
      { x: 1660, y: 292, got: false }
    ],
    hazards: [],
    goal: { x: 2240, y: 404, w: 44, h: 136, requireKeys: 0 }
  },
  lava: {
    title: "岩浆火山",
    width: 2380,
    theme: "lava",
    spawn: { x: 72, y: 420 },
    platforms: [
      { x: 0, y: 540, w: 430, h: 80, type: "lavaRock" },
      { x: 540, y: 486, w: 210, h: 34, type: "lavaRock" },
      { x: 870, y: 420, w: 210, h: 34, type: "lavaRock" },
      { x: 1190, y: 500, w: 220, h: 34, type: "lavaRock" },
      { x: 1510, y: 432, w: 220, h: 34, type: "lavaRock" },
      { x: 1840, y: 540, w: 540, h: 80, type: "lavaRock" }
    ],
    blocks: [
      { x: 300, y: 330, w: 42, h: 42, type: "question", content: "star", used: false, revealed: true, bump: 0 },
      { x: 700, y: 382, w: 42, h: 42, type: "hidden", content: "coin", used: false, revealed: false, bump: 0 },
      { x: 1260, y: 392, w: 42, h: 42, type: "question", content: "mushroom", used: false, revealed: true, bump: 0 },
      { x: 1640, y: 326, w: 42, h: 42, type: "question", content: "star", used: false, revealed: true, bump: 0 }
    ],
    powerups: [],
    elevators: [
      { x: 1740, y: 504, w: 106, h: 22, minY: 348, maxY: 504, speed: 1.45, dir: -1, active: true }
    ],
    coins: [
      { x: 270, y: 492 }, { x: 610, y: 438 }, { x: 940, y: 372 }, { x: 1260, y: 452 },
      { x: 1580, y: 386 }, { x: 1960, y: 492 }, { x: 2140, y: 492 }
    ],
    enemies: [
      { x: 650, y: 444, vx: 0.8, minX: 560, maxX: 740, type: "fire" },
      { x: 1310, y: 458, vx: 1.0, minX: 1200, maxX: 1400, type: "fire" },
      { x: 2020, y: 500, vx: 1.2, minX: 1870, maxX: 2280, type: "shell" }
    ],
    doors: [
      { x: 82, y: 456, w: 58, h: 84, label: "回天空", target: "sky", spawn: "entry" }
    ],
    keyItems: [],
    hazards: [
      { x: 430, y: 564, w: 110, h: 56, type: "lava" },
      { x: 760, y: 564, w: 110, h: 56, type: "lava" },
      { x: 1090, y: 564, w: 100, h: 56, type: "lava" },
      { x: 1410, y: 564, w: 100, h: 56, type: "lava" },
      { x: 1730, y: 564, w: 110, h: 56, type: "lava" }
    ],
    goal: { x: 2260, y: 404, w: 44, h: 136, requireKeys: 0 }
  },
  mine: {
    title: "宝石矿洞",
    width: 2320,
    theme: "mine",
    spawn: { x: 72, y: 420 },
    platforms: [
      { x: 0, y: 540, w: 520, h: 80, type: "mine" },
      { x: 620, y: 500, w: 210, h: 32, type: "rail" },
      { x: 930, y: 438, w: 210, h: 32, type: "rail" },
      { x: 1240, y: 372, w: 220, h: 32, type: "rail" },
      { x: 1580, y: 468, w: 220, h: 32, type: "rail" },
      { x: 1900, y: 540, w: 420, h: 80, type: "mine" },
      { x: 260, y: 396, w: 160, h: 28, type: "crystal" }
    ],
    blocks: [
      { x: 360, y: 296, w: 42, h: 42, type: "question", content: "mushroom", used: false, revealed: true, bump: 0 },
      { x: 740, y: 392, w: 42, h: 42, type: "hidden", content: "coin", used: false, revealed: false, bump: 0 },
      { x: 1120, y: 330, w: 42, h: 42, type: "question", content: "star", used: false, revealed: true, bump: 0 },
      { x: 1660, y: 362, w: 42, h: 42, type: "brick", content: "coin", used: false, revealed: true, bump: 0 }
    ],
    powerups: [],
    elevators: [
      { x: 1466, y: 508, w: 108, h: 22, minY: 294, maxY: 508, speed: 1.3, dir: -1, active: true }
    ],
    coins: [
      { x: 310, y: 350 }, { x: 690, y: 452 }, { x: 990, y: 390 }, { x: 1320, y: 326 },
      { x: 1650, y: 420 }, { x: 1960, y: 492 }, { x: 2120, y: 492 }
    ],
    enemies: [
      { x: 720, y: 458, vx: 0.8, minX: 630, maxX: 820, type: "bat" },
      { x: 1360, y: 330, vx: 0.9, minX: 1250, maxX: 1450, type: "bat" },
      { x: 2040, y: 500, vx: 1.1, minX: 1910, maxX: 2240, type: "mush" }
    ],
    doors: [
      { x: 82, y: 456, w: 58, h: 84, label: "回天空", target: "sky", spawn: "entry" }
    ],
    keyItems: [
      { x: 1514, y: 246, got: false }
    ],
    hazards: [],
    goal: { x: 2200, y: 404, w: 44, h: 136, requireKeys: 0 }
  },
  metro: {
    title: "地铁站台",
    width: 3300,
    theme: "metro",
    spawn: { x: 72, y: 420 },
    platforms: [
      { x: 0, y: 540, w: 3300, h: 80, type: "station" },
      { x: 210, y: 428, w: 160, h: 26, type: "sign" },
      { x: 820, y: 392, w: 150, h: 26, type: "sign" },
      { x: 1390, y: 440, w: 180, h: 26, type: "sign" },
      { x: 2350, y: 420, w: 180, h: 26, type: "sign" },
      { x: 2760, y: 360, w: 170, h: 26, type: "sign" }
    ],
    blocks: [
      { x: 300, y: 324, w: 42, h: 42, type: "question", content: "mushroom", used: false, revealed: true, bump: 0 },
      { x: 920, y: 288, w: 42, h: 42, type: "hidden", content: "star", used: false, revealed: false, bump: 0 },
      { x: 1480, y: 338, w: 42, h: 42, type: "question", content: "coin", used: false, revealed: true, bump: 0 },
      { x: 2440, y: 318, w: 42, h: 42, type: "question", content: "star", used: false, revealed: true, bump: 0 }
    ],
    powerups: [],
    elevators: [
      { x: 2940, y: 506, w: 114, h: 22, minY: 322, maxY: 506, speed: 1.2, dir: -1, active: true }
    ],
    trains: [
      { x: 470, y: 476, w: 700, h: 70, minX: 470, maxX: 1940, speed: 0, dir: 1, active: false, arrived: false, label: "港湾线" }
    ],
    coins: [
      { x: 260, y: 384 }, { x: 610, y: 424 }, { x: 840, y: 346 }, { x: 1060, y: 424 },
      { x: 1460, y: 394 }, { x: 1850, y: 430 }, { x: 2250, y: 492 }, { x: 2860, y: 314 }
    ],
    enemies: [
      { x: 1320, y: 500, vx: 0.85, minX: 1210, maxX: 1510, type: "mush" },
      { x: 2500, y: 500, vx: 0.95, minX: 2320, maxX: 2690, type: "bat" }
    ],
    doors: [
      { x: 82, y: 456, w: 58, h: 84, label: "回天空", target: "sky", spawn: "entry" }
    ],
    keyItems: [
      { x: 3040, y: 278, got: false }
    ],
    hazards: [
      { x: 1740, y: 568, w: 130, h: 52, type: "track" },
      { x: 2100, y: 568, w: 130, h: 52, type: "track" }
    ],
    goal: { x: 3150, y: 404, w: 44, h: 136, requireKeys: 0 }
  }
};

const spawns = {
  sky: {
    entry: { x: 72, y: 420 },
    afterGhost: { x: 1038, y: 420 },
    afterCastle: { x: 218, y: 420 }
  },
  ghost: {
    entry: { x: 84, y: 438 }
  },
  castle: {
    entry: { x: 82, y: 438 }
  },
  jungle: {
    entry: { x: 72, y: 420 }
  },
  lava: {
    entry: { x: 72, y: 420 }
  },
  mine: {
    entry: { x: 72, y: 420 }
  },
  metro: {
    entry: { x: 72, y: 420 }
  }
};

function cloneScene(key) {
  const template = sceneTemplates[key];
  return {
    ...template,
    platforms: template.platforms.map((item) => ({ ...item })),
    blocks: template.blocks.map((item) => ({ ...item })),
    powerups: template.powerups.map((item) => ({ ...item })),
    elevators: template.elevators.map((item) => ({ ...item })),
    trains: (template.trains || []).map((item) => ({ ...item })),
    coins: template.coins.map((item) => ({ ...item, got: false })),
    enemies: template.enemies.map((item) => ({ ...item })),
    doors: template.doors.map((item) => ({ ...item })),
    keyItems: template.keyItems.map((item) => ({ ...item })),
    hazards: (template.hazards || []).map((item) => ({ ...item })),
    goal: template.goal ? { ...template.goal } : null
  };
}

const progress = Object.fromEntries(Object.keys(sceneTemplates).map((key) => [key, cloneScene(key)]));

function loadScene(key, spawnName = "entry") {
  sceneKey = key;
  scene = progress[key];
  const spawn = spawns[key]?.[spawnName] || scene.spawn;
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.rideElevator = null;
  cameraX = Math.max(0, Math.min(scene.width - W, player.x - 220));
  statusText.textContent = `${scene.title}：${getSceneHelp()}`;
  playDoorSound();
  updateScore();
}

function getSceneHelp() {
  if (sceneKey === "sky") return "往右走，门可以进鬼屋，也可以继续去城堡。";
  if (sceneKey === "ghost") return "里面比较暗，躲开幽灵，坐电梯拿钥匙，再从门出去。";
  if (sceneKey === "castle") return "城堡里有两个升降电梯，拿够钥匙后到最右边旗台通关。";
  if (sceneKey === "jungle") return "跳藤蔓和树台，顶隐藏星星，越过丛林缺口。";
  if (sceneKey === "lava") return "岩浆会烫伤，踩火山石和电梯过去，星星可以救命。";
  if (sceneKey === "mine") return "矿洞里有宝石、铁轨平台和蝙蝠，往右到出口。";
  if (sceneKey === "metro") return "站到地铁车门旁，按 E 或点进/出，列车会开到下一站。";
  return "往右走，顶机关，拿道具，到终点。";
}

function reset() {
  window.clearTimeout(introTimer);
  stopMusic();
  keys.clear();
  touchControls.clear();
  Object.keys(progress).forEach((key) => {
    progress[key] = cloneScene(key);
  });
  selectedSceneKey = "sky";
  sceneKey = selectedSceneKey;
  scene = progress[selectedSceneKey];
  player.x = 72;
  player.y = 420;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.facing = 1;
  player.coins = 0;
  player.keys = 0;
  player.lives = 3;
  player.invincibleUntil = 0;
  player.starUntil = 0;
  player.power = "small";
  player.w = 36;
  player.h = 54;
  player.rideElevator = null;
  player.rideTrain = null;
  cameraX = 0;
  gameStarted = false;
  won = false;
  introOverlay.classList.remove("hidden");
  startIntroBtn.disabled = false;
  startIntroBtn.textContent = "开始冒险";
  introStatus.textContent = "先选一个地方：长关卡、机关、星星和地铁都有";
  statusText.textContent = "先选地图，再点开始冒险。A/D 移动，空格跳，E 或 ↓ 进门/坐地铁，S 电梯。";
  updateMapButtons();
  updateScore();
  updateRecordsPanel();
}

function updateScore() {
  const totalCoins = Object.values(progress).reduce((sum, item) => sum + item.coins.length, 0);
  const gotCoins = Object.values(progress).reduce((sum, item) => sum + item.coins.filter((coin) => coin.got).length, 0);
  const powerName = performance.now() < player.starUntil ? "星星无敌" : player.power === "big" ? "变大" : "普通";
  scoreEl.textContent = `金币 ${gotCoins} / ${totalCoins} · 钥匙 ${player.keys} · ${powerName} · 生命 ${player.lives}${won ? " · 通关!" : ""}`;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerRect() {
  return { x: player.x, y: player.y, w: player.w, h: player.h };
}

function getPlayerId() {
  try {
    let id = localStorage.getItem(playerIdKey);
    if (!id) {
      id = `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(playerIdKey, id);
    }
    return id;
  } catch {
    return "player-private";
  }
}

function defaultStats() {
  return {
    playerId: getPlayerId(),
    visits: 0,
    starts: 0,
    wins: 0,
    metroRides: 0,
    maps: {},
    lastMap: "sky",
    lastPlayed: ""
  };
}

function loadStats() {
  try {
    return { ...defaultStats(), ...JSON.parse(localStorage.getItem(statsKey) || "{}") };
  } catch {
    return defaultStats();
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(statsKey, JSON.stringify(stats));
  } catch {
    // Some private browsers block localStorage; the game still works without records.
  }
}

function mapTitle(key) {
  return sceneTemplates[key]?.title || key;
}

function updateRecordsPanel() {
  if (window.KimiArcadeStats?.summaryText) {
    recordsText.textContent = window.KimiArcadeStats.summaryText();
    return;
  }
  const stats = loadStats();
  const favorite = Object.entries(stats.maps).sort((a, b) => b[1] - a[1])[0];
  const favoriteText = favorite ? `${mapTitle(favorite[0])} ${favorite[1]} 次` : "还没有最常玩地图";
  const shortId = stats.playerId.split("-").slice(-1)[0] || "local";
  recordsText.textContent = `这台设备访问 ${stats.visits} 次，开始玩 ${stats.starts} 次，通关 ${stats.wins} 次，坐地铁 ${stats.metroRides} 次。玩家编号：${shortId}。最常玩：${favoriteText}。公开总人数：GitHub Pages 需要接 GoatCounter 或 Google Analytics 后，才能统计别人手机的总人数和总次数。`;
}

function sendSharedStat(eventName, details = {}) {
  if (window.goatcounter?.count) {
    window.goatcounter.count({
      path: `/mario/${eventName}/${details.map || sceneKey}`,
      title: `马聊冒险 ${eventName} ${mapTitle(details.map || sceneKey)}`,
      event: true
    });
  }
}

function recordEvent(eventName, details = {}) {
  const stats = loadStats();
  const map = details.map || sceneKey;
  if (eventName === "visit") stats.visits += 1;
  if (eventName === "start") {
    stats.starts += 1;
    stats.maps[map] = (stats.maps[map] || 0) + 1;
    stats.lastMap = map;
    stats.lastPlayed = new Date().toISOString();
  }
  if (eventName === "win") stats.wins += 1;
  if (eventName === "metro") stats.metroRides += 1;
  saveStats(stats);
  updateRecordsPanel();
  sendSharedStat(eventName, { ...details, map });
}

function isPressed(name) {
  if (touchControls.has(name)) return true;
  if (name === "left") return keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
  if (name === "right") return keys.has("ArrowRight") || keys.has("d") || keys.has("D");
  if (name === "jump") return keys.has(" ") || keys.has("ArrowUp") || keys.has("w") || keys.has("W");
  if (name === "door") return keys.has("ArrowDown") || keys.has("e") || keys.has("E");
  if (name === "elevator") return keys.has("s") || keys.has("S");
  return false;
}

function tick(now = performance.now()) {
  const dt = Math.min(32, now - lastTime) / 16.67;
  lastTime = now;
  if (gameStarted && !won) update(dt);
  draw();
  requestAnimationFrame(tick);
}

function update(dt) {
  if (player.starUntil && performance.now() > player.starUntil) {
    player.starUntil = 0;
    player.invincibleUntil = Math.max(player.invincibleUntil, performance.now() + 500);
    updateScore();
  }
  updateElevators(dt);
  updateTrains(dt);
  updatePlayer(dt);
  updatePowerups(dt);
  updateEnemies(dt);
  collectItems();
  checkHazards();
  checkMetroRide();
  checkDoors();
  checkGoal();
  cameraX += (Math.max(0, Math.min(scene.width - W, player.x - W * 0.42)) - cameraX) * 0.12;
}

function updateElevators(dt) {
  scene.elevators.forEach((elevator) => {
    if (!elevator.active) return;
    const oldY = elevator.y;
    elevator.y += elevator.speed * elevator.dir * dt;
    if (elevator.y < elevator.minY) {
      elevator.y = elevator.minY;
      elevator.dir = 1;
    }
    if (elevator.y > elevator.maxY) {
      elevator.y = elevator.maxY;
      elevator.dir = -1;
    }
    elevator.deltaY = elevator.y - oldY;
  });
}

function updateTrains(dt) {
  (scene.trains || []).forEach((train) => {
    const oldX = train.x;
    if (train.active && !train.arrived) {
      train.speed = Math.min(8.5, (train.speed || 0) + 0.08 * dt);
      train.x += train.speed * train.dir * dt;
      if (train.x >= train.maxX) {
        train.x = train.maxX;
        train.speed = 0;
        train.arrived = true;
        statusText.textContent = "到下一站了！下车继续往右走，到黄色终点线就赢。";
        playDoorSound();
      }
    }
    train.deltaX = train.x - oldX;
  });
}

function updatePlayer(dt) {
  const left = isPressed("left");
  const right = isPressed("right");
  const jump = isPressed("jump");
  const maxSpeed = player.grounded ? 5.1 : 4.6;
  if (left) {
    player.vx -= 0.72 * dt;
    player.facing = -1;
  }
  if (right) {
    player.vx += 0.72 * dt;
    player.facing = 1;
  }
  if (!left && !right) player.vx *= player.grounded ? 0.72 : 0.94;
  player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));

  if (jump && player.grounded) {
    player.vy = -13.5;
    player.grounded = false;
    player.rideElevator = null;
    playJump();
  }

  if (isPressed("elevator") && player.rideElevator) {
    player.rideElevator.dir *= -1;
    elevatorHintTimer = performance.now() + 900;
    statusText.textContent = "电梯换方向了：可以上去，也可以下来。";
    touchControls.delete("elevator");
    keys.delete("s");
    keys.delete("S");
  }

  player.vy += 0.72 * dt;
  const prevY = player.y;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.grounded = false;
  player.rideElevator = null;
  player.rideTrain = null;

  handleBlockHits(prevY);
  resolvePlatforms();
  player.x = Math.max(0, Math.min(scene.width - player.w, player.x));
  if (player.y > H + 120) hurtPlayer("掉下去了，回到这个场景入口。");
}

function resolvePlatforms() {
  const prevBottom = player.y + player.h - player.vy;
  const solidBlocks = scene.blocks.filter((block) => block.revealed);
  const trains = scene.trains || [];
  [...scene.platforms, ...scene.elevators, ...trains, ...solidBlocks].forEach((platform) => {
    const r = { x: platform.x, y: platform.y, w: platform.w, h: platform.h };
    if (rectsOverlap(playerRect(), r) && player.vy >= 0 && prevBottom <= platform.y + 10) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.grounded = true;
      if (scene.elevators.includes(platform)) {
        player.rideElevator = platform;
        player.y += platform.deltaY || 0;
        if (performance.now() > elevatorHintTimer) {
          statusText.textContent = "你坐上电梯了，按 S 或点“电梯”可以让它换方向。";
          elevatorHintTimer = performance.now() + 2800;
        }
      }
      if (trains.includes(platform)) {
        player.rideTrain = platform;
        player.x += platform.deltaX || 0;
        if (!platform.active && performance.now() > doorHintTimer) {
          statusText.textContent = "你站到地铁上了，按 E / ↓ / 点“进/出”让地铁开车。";
          doorHintTimer = performance.now() + 1800;
        }
      }
    }
  });
}

function handleBlockHits(prevY) {
  if (player.vy >= 0) return;
  const headNow = player.y;
  const headBefore = prevY;
  scene.blocks.forEach((block) => {
    const blockBottom = block.y + block.h;
    const overlapX = player.x + player.w > block.x + 4 && player.x < block.x + block.w - 4;
    if (!overlapX || headBefore < blockBottom || headNow > blockBottom + 8) return;
    if (!block.revealed && block.type === "hidden") {
      block.revealed = true;
      statusText.textContent = "顶到隐藏机关了！隐藏砖块出现。";
    }
    if (!block.revealed) return;
    player.y = blockBottom + 1;
    player.vy = 2.8;
    block.bump = 12;
    activateBlock(block);
  });
}

function activateBlock(block) {
  if (block.used) {
    playBlockSound();
    return;
  }
  if (block.type === "brick" && player.power === "big" && block.content === "coin") {
    block.used = true;
    block.revealed = false;
    player.coins += 1;
    statusText.textContent = "变大后把砖块顶碎了，里面掉出金币。";
    playCoin();
    updateScore();
    return;
  }
  block.used = true;
  block.revealed = true;
  if (block.content === "coin") {
    player.coins += 1;
    statusText.textContent = block.type === "hidden" ? "隐藏砖里冒出金币！" : "问号砖块冒出金币！";
    playCoin();
    updateScore();
  } else {
    spawnPowerup(block);
    statusText.textContent = block.content === "star" ? "星星出来了！碰到它会无敌一会儿。" : "变大道具出来了！碰到它会变大。";
    playKeySound();
  }
}

function spawnPowerup(block) {
  scene.powerups.push({
    x: block.x + 7,
    y: block.y - 28,
    w: 28,
    h: 28,
    vx: block.content === "star" ? 2.2 : 1.2,
    vy: -2,
    type: block.content,
    born: performance.now()
  });
}

function updatePowerups(dt) {
  scene.blocks.forEach((block) => {
    if (block.bump > 0) block.bump = Math.max(0, block.bump - 0.8 * dt);
  });
  scene.powerups.forEach((item) => {
    item.vy += 0.42 * dt;
    item.x += item.vx * dt;
    item.y += item.vy * dt;
    let landed = false;
    scene.platforms.forEach((platform) => {
      const box = { x: item.x, y: item.y, w: item.w, h: item.h };
      if (rectsOverlap(box, platform) && item.vy >= 0 && item.y + item.h - item.vy <= platform.y + 10) {
        item.y = platform.y - item.h;
        item.vy = item.type === "star" ? -7.5 : 0;
        landed = true;
      }
    });
    if (!landed && item.y > H + 80) item.got = true;
    if (item.x < 0 || item.x > scene.width - item.w) item.vx *= -1;
  });
  scene.powerups = scene.powerups.filter((item) => !item.got);
}

function updateEnemies(dt) {
  scene.enemies.forEach((enemy) => {
    enemy.x += enemy.vx * dt;
    if (enemy.x < enemy.minX || enemy.x > enemy.maxX) enemy.vx *= -1;
    const enemyBox = { x: enemy.x - 18, y: enemy.y - 34, w: 36, h: 34 };
    if (!rectsOverlap(playerRect(), enemyBox)) return;
    if (performance.now() < player.starUntil) {
      enemy.x = -9999;
      player.coins += 1;
      statusText.textContent = "星星无敌！直接撞飞怪物。";
      playCoin();
      updateScore();
      return;
    }
    if (player.vy > 1.8 && player.y + player.h - player.vy <= enemyBox.y + 10) {
      enemy.x = -9999;
      player.vy = -8;
      player.coins += 1;
      playCoin();
      updateScore();
    } else {
      hurtPlayer("碰到怪物了，重新站好继续玩。");
    }
  });
}

function collectItems() {
  scene.powerups.forEach((item) => {
    if (item.got) return;
    if (!rectsOverlap(playerRect(), { x: item.x, y: item.y, w: item.w, h: item.h })) return;
    item.got = true;
    if (item.type === "star") {
      player.starUntil = performance.now() + 9000;
      player.invincibleUntil = player.starUntil;
      statusText.textContent = "吃到星星了！现在短时间无敌，碰到怪物也不怕。";
      playStarSound();
    } else {
      growPlayer();
      statusText.textContent = "吃到变大道具了！小人变大，顶砖更厉害。";
      playKeySound();
    }
    updateScore();
  });
  scene.coins.forEach((coin) => {
    if (coin.got) return;
    if (rectsOverlap(playerRect(), { x: coin.x - 14, y: coin.y - 18, w: 28, h: 36 })) {
      coin.got = true;
      player.coins += 1;
      playCoin();
      updateScore();
    }
  });
  scene.keyItems.forEach((key) => {
    if (key.got) return;
    if (rectsOverlap(playerRect(), { x: key.x - 16, y: key.y - 18, w: 32, h: 36 })) {
      key.got = true;
      player.keys += 1;
      statusText.textContent = "拿到一把钥匙！城堡终点会更容易打开。";
      playKeySound();
      updateScore();
    }
  });
}

function growPlayer() {
  if (player.power === "big") return;
  const foot = player.y + player.h;
  player.power = "big";
  player.w = 42;
  player.h = 66;
  player.y = foot - player.h;
  player.invincibleUntil = performance.now() + 900;
}

function nearestDoor() {
  return scene.doors.find((door) => {
    const nearBox = { x: door.x - 24, y: door.y - 24, w: door.w + 48, h: door.h + 48 };
    return rectsOverlap(playerRect(), nearBox);
  });
}

function nearestTrain() {
  return (scene.trains || []).find((train) => {
    const nearBox = { x: train.x - 44, y: train.y - 80, w: train.w + 88, h: train.h + 110 };
    return rectsOverlap(playerRect(), nearBox);
  });
}

function checkMetroRide() {
  const train = nearestTrain();
  if (!train) return;
  if (!train.active && performance.now() > doorHintTimer) {
    statusText.textContent = "地铁停在站台：按 E / ↓ / 点“进/出”上车开往下一站。";
    doorHintTimer = performance.now() + 1800;
  }
  if (!isPressed("door") || train.active) return;
  touchControls.delete("door");
  keys.delete("e");
  keys.delete("E");
  keys.delete("ArrowDown");
  train.active = true;
  train.speed = 1.8;
  player.x = train.x + 84;
  player.y = train.y - player.h;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;
  player.rideTrain = train;
  statusText.textContent = "地铁开车了！站稳，它会载你去下一站。";
  recordEvent("metro", { map: sceneKey });
  playMetroSound();
}

function checkDoors() {
  const door = nearestDoor();
  if (door && performance.now() > doorHintTimer) {
    statusText.textContent = `站在门口：按 E / ↓ / 点“进/出”可以${door.label}。`;
    doorHintTimer = performance.now() + 1600;
  }
  if (!door || !isPressed("door")) return;
  touchControls.delete("door");
  keys.delete("e");
  keys.delete("E");
  keys.delete("ArrowDown");
  loadScene(door.target, door.spawn || "entry");
}

function checkGoal() {
  if (!scene.goal || !rectsOverlap(playerRect(), scene.goal)) return;
  const neededKeys = scene.goal.requireKeys ?? 1;
  if (player.keys < neededKeys) {
    statusText.textContent = `这个终点需要至少 ${neededKeys} 把钥匙，先去找钥匙或隐藏机关。`;
    return;
  }
  won = true;
  stopMusic();
  recordEvent("win", { map: sceneKey });
  updateScore();
  statusText.textContent = `${scene.title}通关成功！你完成了这个地方。`;
  playVictory();
}

function checkHazards() {
  if (performance.now() < player.starUntil) return;
  (scene.hazards || []).forEach((hazard) => {
    if (!rectsOverlap(playerRect(), hazard)) return;
    if (hazard.type === "track") hurtPlayer("掉到轨道里了！要站在站台或地铁车顶上。", "track");
    else hurtPlayer("碰到岩浆了！先退回来，找石头平台跳过去。", "lava");
  });
}

function hurtPlayer(message, reason = "hurt") {
  if (performance.now() < player.invincibleUntil) return;
  if (player.power === "big") {
    const foot = player.y + player.h;
    player.power = "small";
    player.w = 36;
    player.h = 54;
    player.y = foot - player.h;
    player.invincibleUntil = performance.now() + 1200;
    statusText.textContent = "被碰到了，先从大人变回小人，还没有输。";
    updateScore();
    if (reason === "lava") playLavaDeath();
    else playHurt();
    return;
  }
  player.lives -= 1;
  player.invincibleUntil = performance.now() + 1100;
  if (player.lives <= 0) {
    player.lives = 3;
    player.coins = Math.max(0, player.coins - 3);
    loadScene(sceneKey, "entry");
    statusText.textContent = "生命用完了，回到这个场景入口重新来。";
  } else {
    const spawn = scene.spawn;
    player.x = Math.max(40, player.x - 80);
    player.y = spawn.y;
    player.vx = 0;
    player.vy = 0;
    statusText.textContent = message;
  }
  updateScore();
  if (reason === "lava") playLavaDeath();
  else playHurt();
}

function draw() {
  drawBackground();
  ctx.save();
  ctx.translate(-cameraX, 0);
  drawSceneObjects();
  drawPlayer();
  ctx.restore();
  drawOverlay();
}

function drawBackground() {
  if (scene.theme === "sky") drawSkyBackground();
  if (scene.theme === "ghost") drawGhostBackground();
  if (scene.theme === "castle") drawCastleBackground();
  if (scene.theme === "jungle") drawJungleBackground();
  if (scene.theme === "lava") drawLavaBackground();
  if (scene.theme === "mine") drawMineBackground();
  if (scene.theme === "metro") drawMetroBackground();
}

function drawSkyBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#7ecbf2");
  g.addColorStop(0.55, "#e4f8ff");
  g.addColorStop(1, "#88c96a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  drawCloud(140, 88, 1);
  drawCloud(520, 130, 0.86);
  drawCloud(870, 78, 1.08);
  ctx.fillStyle = "rgba(255,210,95,0.82)";
  ctx.beginPath();
  ctx.arc(910, 116, 42, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 6; i += 1) drawHill(i * 220 - (cameraX * 0.25) % 220, 520, 120 + (i % 2) * 34);
}

function drawGhostBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#17182a");
  g.addColorStop(0.62, "#32314d");
  g.addColorStop(1, "#13141f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.beginPath();
  ctx.arc(846, 92, 54, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.18 + (i % 3) * 0.08})`;
    ctx.beginPath();
    ctx.arc(80 + i * 116, 58 + (i * 41) % 170, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  drawGhostWindow(160 - cameraX * 0.1, 120);
  drawGhostWindow(620 - cameraX * 0.1, 160);
}

function drawCastleBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#5d728e");
  g.addColorStop(0.6, "#c5d0d9");
  g.addColorStop(1, "#8b6b52");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(86,72,68,0.34)";
  for (let i = 0; i < 7; i += 1) {
    const x = i * 180 - (cameraX * 0.18) % 180;
    ctx.fillRect(x, 226, 120, 256);
    ctx.fillStyle = "rgba(42,45,54,0.42)";
    ctx.fillRect(x + 22, 270, 24, 54);
    ctx.fillRect(x + 72, 270, 24, 54);
    ctx.fillStyle = "rgba(86,72,68,0.34)";
  }
}

function drawJungleBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#69c7e8");
  g.addColorStop(0.52, "#bff3d0");
  g.addColorStop(1, "#2f743f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  drawCloud(160, 96, 0.8);
  drawCloud(730, 86, 0.9);
  for (let i = 0; i < 9; i += 1) {
    const x = i * 150 - (cameraX * 0.22) % 150;
    ctx.fillStyle = "#7b512e";
    ctx.fillRect(x + 46, 256, 28, 290);
    ctx.fillStyle = i % 2 ? "#2f9650" : "#3ebd69";
    ctx.beginPath();
    ctx.arc(x + 60, 246, 62, 0, Math.PI * 2);
    ctx.arc(x + 18, 284, 45, 0, Math.PI * 2);
    ctx.arc(x + 108, 286, 48, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(20,90,38,0.42)";
  ctx.lineWidth = 6;
  for (let i = 0; i < 6; i += 1) {
    const x = 90 + i * 190 - (cameraX * 0.16) % 190;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 34, 120, x - 38, 230, x + 18, 360);
    ctx.stroke();
  }
}

function drawLavaBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2c2030");
  g.addColorStop(0.52, "#7f2f28");
  g.addColorStop(1, "#220c13");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 5; i += 1) {
    const x = i * 260 - (cameraX * 0.12) % 260;
    ctx.fillStyle = "rgba(35,24,30,0.86)";
    ctx.beginPath();
    ctx.moveTo(x - 20, 540);
    ctx.lineTo(x + 80, 220);
    ctx.lineTo(x + 180, 540);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,118,43,0.66)";
    ctx.beginPath();
    ctx.moveTo(x + 68, 252);
    ctx.lineTo(x + 94, 322);
    ctx.lineTo(x + 116, 252);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,94,31,0.35)";
  for (let i = 0; i < 24; i += 1) {
    ctx.beginPath();
    ctx.arc((i * 97 - cameraX * 0.35) % (W + 120), 120 + (i * 53) % 360, 3 + (i % 4), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMineBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1c2532");
  g.addColorStop(0.58, "#29364a");
  g.addColorStop(1, "#151a22");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,209,95,0.12)";
  ctx.lineWidth = 5;
  for (let i = 0; i < 8; i += 1) {
    const x = i * 160 - (cameraX * 0.16) % 160;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 80, H);
    ctx.stroke();
  }
  for (let i = 0; i < 14; i += 1) {
    const x = 54 + i * 86 - (cameraX * 0.23) % 86;
    const y = 78 + (i * 71) % 360;
    ctx.fillStyle = ["rgba(95,220,255,0.5)", "rgba(180,115,255,0.42)", "rgba(255,209,95,0.46)"][i % 3];
    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x + 14, y);
    ctx.lineTo(x, y + 18);
    ctx.lineTo(x - 14, y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawMetroBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#c8d9e6");
  g.addColorStop(0.55, "#eef4f7");
  g.addColorStop(1, "#8494a1");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  for (let x = -((cameraX * 0.2) % 130); x < W; x += 130) {
    ctx.fillRect(x, 88, 88, 36);
    ctx.fillRect(x + 16, 180, 116, 18);
  }
  ctx.fillStyle = "#536576";
  ctx.fillRect(0, 510, W, 12);
  ctx.fillStyle = "#2f3a45";
  ctx.fillRect(0, 566, W, 24);
  ctx.strokeStyle = "#f2d15b";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 540);
  ctx.lineTo(W, 540);
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 22px system-ui";
  ctx.fillText("地铁站台  Platform", 42, 64);
  ctx.font = "800 15px system-ui";
  ctx.fillText("站到车门旁，按进/出开车", 42, 90);
}

function drawSceneObjects() {
  (scene.hazards || []).forEach(drawHazard);
  scene.platforms.forEach(drawPlatform);
  (scene.trains || []).forEach(drawTrain);
  scene.blocks.forEach(drawBlock);
  scene.elevators.forEach(drawElevator);
  scene.doors.forEach(drawDoor);
  scene.powerups.forEach(drawPowerup);
  scene.coins.forEach(drawCoin);
  scene.keyItems.forEach(drawKey);
  scene.enemies.forEach(drawEnemy);
  if (scene.goal) drawGoal(scene.goal);
}

function drawHazard(hazard) {
  if (hazard.type === "track") {
    ctx.save();
    ctx.translate(hazard.x, hazard.y);
    ctx.fillStyle = "#2f3a45";
    ctx.fillRect(0, 0, hazard.w, hazard.h);
    ctx.strokeStyle = "#d5dee8";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(8, 10);
    ctx.lineTo(hazard.w - 8, 10);
    ctx.moveTo(8, 34);
    ctx.lineTo(hazard.w - 8, 34);
    ctx.stroke();
    ctx.fillStyle = "#ffd15f";
    ctx.font = "900 15px system-ui";
    ctx.fillText("轨道", 38, -8);
    ctx.restore();
    return;
  }
  if (hazard.type !== "lava") return;
  const wave = Math.sin(performance.now() * 0.01 + hazard.x) * 4;
  ctx.save();
  ctx.translate(hazard.x, hazard.y);
  ctx.fillStyle = "#ff5a2b";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let x = 0; x <= hazard.w; x += 16) {
    ctx.lineTo(x, Math.sin(x * 0.12 + performance.now() * 0.01) * 7 + wave);
  }
  ctx.lineTo(hazard.w, hazard.h);
  ctx.lineTo(0, hazard.h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,209,95,0.72)";
  for (let x = 12; x < hazard.w; x += 34) {
    ctx.beginPath();
    ctx.arc(x, 18 + Math.sin(x + performance.now() * 0.006) * 6, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBlock(block) {
  if (!block.revealed) return;
  const y = block.y - (block.bump || 0);
  const used = block.used;
  ctx.save();
  ctx.translate(block.x, y);
  if (used) {
    ctx.fillStyle = "#9b7b62";
  } else if (block.type === "question") {
    ctx.fillStyle = "#ffd15f";
  } else if (block.type === "hidden") {
    ctx.fillStyle = "#f7fbff";
  } else {
    ctx.fillStyle = "#c06b32";
  }
  ctx.beginPath();
  roundedRect(0, 0, block.w, block.h, 6);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = used ? "#5e4939" : "#172632";
  ctx.font = "900 26px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (block.type === "question" && !used) ctx.fillText("?", block.w / 2, block.h / 2 + 1);
  if (block.type === "hidden" && !used) ctx.fillText("!", block.w / 2, block.h / 2 + 1);
  if (block.type === "brick") {
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(block.w, 14);
    ctx.moveTo(0, 28);
    ctx.lineTo(block.w, 28);
    ctx.moveTo(14, 0);
    ctx.lineTo(14, block.h);
    ctx.moveTo(30, 14);
    ctx.lineTo(30, block.h);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTrain(train) {
  ctx.save();
  ctx.translate(train.x, train.y);
  ctx.fillStyle = "#d9edf7";
  ctx.beginPath();
  roundedRect(0, 0, train.w, train.h, 18);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#2187c9";
  ctx.fillRect(18, 14, train.w - 36, 10);
  ctx.fillStyle = "#172632";
  ctx.font = "900 17px system-ui";
  ctx.fillText(train.label, 34, -12);
  for (let x = 60; x < train.w - 120; x += 86) {
    ctx.fillStyle = "#9ed7f2";
    ctx.beginPath();
    roundedRect(x, 28, 56, 24, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(23,38,50,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  for (let x = 120; x < train.w - 80; x += 220) {
    ctx.fillStyle = train.active ? "#ffd15f" : "#f7fbff";
    ctx.beginPath();
    roundedRect(x, 34, 52, 34, 6);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 26, 36);
    ctx.lineTo(x + 26, 66);
    ctx.stroke();
  }
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(90, train.h + 2, 12, 0, Math.PI * 2);
  ctx.arc(train.w - 90, train.h + 2, 12, 0, Math.PI * 2);
  ctx.fill();
  if (train.active && !train.arrived) {
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-20 - i * 28, 18 + i * 5);
      ctx.lineTo(-70 - i * 30, 18 + i * 5);
      ctx.stroke();
    }
  }
  if (train.arrived) {
    ctx.fillStyle = "#2f9d58";
    ctx.font = "900 18px system-ui";
    ctx.fillText("下一站到了", train.w - 150, -12);
  }
  ctx.restore();
}

function drawPowerup(item) {
  ctx.save();
  ctx.translate(item.x + item.w / 2, item.y + item.h / 2);
  if (item.type === "star") {
    const spin = performance.now() * 0.008;
    ctx.rotate(spin);
    ctx.fillStyle = "#ffd15f";
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? 18 : 8;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#172632";
    ctx.fillRect(-6, -3, 3, 4);
    ctx.fillRect(4, -3, 3, 4);
  } else {
    ctx.fillStyle = "#d83d35";
    ctx.beginPath();
    ctx.arc(0, -4, 16, Math.PI, 0);
    ctx.lineTo(16, 6);
    ctx.lineTo(-16, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#f0bf8a";
    ctx.beginPath();
    roundedRect(-12, 4, 24, 16, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-8, -4, 4, 0, Math.PI * 2);
    ctx.arc(8, -4, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlatform(platform) {
  const colors = {
    grass: ["#6eb85d", "#7b4f2e"],
    brick: ["#d08a42", "#8d5228"],
    cloud: ["#f8fdff", "#c8eaf8"],
    stone: ["#5c6172", "#2c3041"],
    wood: ["#9a6429", "#59351c"],
    castle: ["#888f9c", "#49515e"],
    jungle: ["#4dc96b", "#2f743f"],
    vine: ["#65d46e", "#25763d"],
    lavaRock: ["#4b4650", "#241f29"],
    mine: ["#5b6573", "#242b35"],
    rail: ["#9ca7b5", "#343b45"],
    crystal: ["#7ee7ff", "#7349c6"],
    station: ["#d6dee7", "#8895a1"],
    sign: ["#ffd15f", "#3b4a57"]
  };
  const [top, side] = colors[platform.type] || colors.grass;
  ctx.fillStyle = side;
  ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
  ctx.fillStyle = top;
  ctx.fillRect(platform.x, platform.y, platform.w, Math.min(10, platform.h));
  ctx.strokeStyle = "rgba(23,38,50,0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(platform.x, platform.y, platform.w, platform.h);
  if (platform.type === "brick" || platform.type === "castle" || platform.type === "mine") {
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    for (let x = platform.x + 18; x < platform.x + platform.w; x += 38) {
      ctx.beginPath();
      ctx.moveTo(x, platform.y + 8);
      ctx.lineTo(x, platform.y + platform.h - 2);
      ctx.stroke();
    }
  }
  if (platform.type === "vine") {
    ctx.strokeStyle = "rgba(23,96,45,0.5)";
    ctx.lineWidth = 4;
    for (let x = platform.x + 16; x < platform.x + platform.w; x += 34) {
      ctx.beginPath();
      ctx.arc(x, platform.y + 12, 12, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (platform.type === "rail") {
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(platform.x + 8, platform.y + 8);
    ctx.lineTo(platform.x + platform.w - 8, platform.y + 8);
    ctx.moveTo(platform.x + 8, platform.y + platform.h - 6);
    ctx.lineTo(platform.x + platform.w - 8, platform.y + platform.h - 6);
    ctx.stroke();
  }
  if (platform.type === "crystal") {
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    for (let x = platform.x + 16; x < platform.x + platform.w; x += 34) {
      ctx.beginPath();
      ctx.moveTo(x, platform.y + 4);
      ctx.lineTo(x + 12, platform.y + platform.h / 2);
      ctx.lineTo(x, platform.y + platform.h - 4);
      ctx.lineTo(x - 12, platform.y + platform.h / 2);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawElevator(elevator) {
  ctx.fillStyle = "#172632";
  ctx.fillRect(elevator.x - 8, elevator.minY - 8, 6, elevator.maxY - elevator.minY + 54);
  ctx.fillRect(elevator.x + elevator.w + 2, elevator.minY - 8, 6, elevator.maxY - elevator.minY + 54);
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  roundedRect(elevator.x, elevator.y, elevator.w, elevator.h, 6);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("电梯", elevator.x + elevator.w / 2, elevator.y - 8);
  ctx.textAlign = "left";
}

function drawDoor(door) {
  const open = nearestDoor() === door;
  ctx.fillStyle = open ? "#ffd15f" : "#6e3c2a";
  ctx.beginPath();
  roundedRect(door.x, door.y, door.w, door.h, 10);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(door.x + door.w - 13, door.y + door.h / 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "900 15px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(door.label, door.x + door.w / 2, door.y - 10);
  ctx.textAlign = "left";
}

function drawCoin(coin) {
  if (coin.got) return;
  ctx.save();
  ctx.translate(coin.x, coin.y);
  if (scene.theme === "mine") {
    ctx.scale(0.9 + Math.sin(performance.now() * 0.006 + coin.x) * 0.08, 0.9);
    ctx.fillStyle = ["#6ee7ff", "#b678ff", "#ffd15f"][Math.floor(coin.x / 70) % 3];
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(16, -4);
    ctx.lineTo(10, 18);
    ctx.lineTo(-10, 18);
    ctx.lineTo(-16, -4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillRect(-4, -12, 5, 20);
    ctx.restore();
    return;
  }
  ctx.scale(0.85 + Math.sin(performance.now() * 0.006 + coin.x) * 0.12, 1);
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#a66a18";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(-3, -10, 5, 20);
  ctx.restore();
}

function drawKey(key) {
  if (key.got) return;
  ctx.save();
  ctx.translate(key.x, key.y + Math.sin(performance.now() * 0.006) * 4);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.fillStyle = "#ffd15f";
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillRect(10, -4, 34, 8);
  ctx.fillRect(32, 4, 8, 12);
  ctx.restore();
}

function drawEnemy(enemy) {
  if (enemy.x < -9000) return;
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  if (enemy.type === "ghost") {
    ctx.fillStyle = "#f3f4ff";
    ctx.beginPath();
    ctx.arc(0, -18, 22, Math.PI, 0);
    ctx.lineTo(22, 12);
    ctx.quadraticCurveTo(12, 4, 4, 12);
    ctx.quadraticCurveTo(-4, 4, -12, 12);
    ctx.quadraticCurveTo(-20, 4, -22, 12);
    ctx.lineTo(-22, -18);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#172632";
    ctx.fillRect(-9, -16, 5, 7);
    ctx.fillRect(6, -16, 5, 7);
  } else if (enemy.type === "fire") {
    ctx.fillStyle = "#ff5a2b";
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.bezierCurveTo(26, -18, 18, 12, 0, 12);
    ctx.bezierCurveTo(-24, 12, -22, -18, 0, -42);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#ffd15f";
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.bezierCurveTo(12, -8, 8, 7, 0, 7);
    ctx.bezierCurveTo(-12, 7, -10, -8, 0, -24);
    ctx.fill();
  } else if (enemy.type === "bat") {
    ctx.fillStyle = "#2a2136";
    ctx.beginPath();
    ctx.arc(0, -18, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -20);
    ctx.lineTo(-34, -34);
    ctx.lineTo(-26, -10);
    ctx.lineTo(-10, -15);
    ctx.moveTo(10, -20);
    ctx.lineTo(34, -34);
    ctx.lineTo(26, -10);
    ctx.lineTo(10, -15);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#ffd15f";
    ctx.fillRect(-6, -20, 3, 4);
    ctx.fillRect(4, -20, 3, 4);
  } else if (enemy.type === "monkey") {
    ctx.fillStyle = "#8b572e";
    ctx.beginPath();
    ctx.arc(0, -18, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#e0a36c";
    ctx.beginPath();
    ctx.arc(0, -12, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.fillRect(-8, -23, 4, 5);
    ctx.fillRect(5, -23, 4, 5);
  } else if (enemy.type === "shell") {
    ctx.fillStyle = "#48a868";
    ctx.beginPath();
    ctx.ellipse(0, -14, 25, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#ffd15f";
    ctx.fillRect(-18, -16, 36, 5);
    ctx.fillStyle = "#172632";
    ctx.fillRect(-16, 2, 8, 6);
    ctx.fillRect(8, 2, 8, 6);
  } else {
    ctx.fillStyle = "#b86a3b";
    ctx.beginPath();
    ctx.ellipse(0, -12, 24, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#172632";
    ctx.fillRect(-14, 2, 9, 6);
    ctx.fillRect(5, 2, 9, 6);
  }
  ctx.restore();
}

function drawGoal(goal) {
  ctx.fillStyle = "#172632";
  ctx.fillRect(goal.x + 18, goal.y, 8, goal.h);
  ctx.fillStyle = "#d83d35";
  ctx.beginPath();
  ctx.moveTo(goal.x + 26, goal.y + 16);
  ctx.lineTo(goal.x + 104, goal.y + 42);
  ctx.lineTo(goal.x + 26, goal.y + 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffd15f";
  ctx.font = "900 18px system-ui";
  ctx.fillText("终点", goal.x - 2, goal.y - 8);
}

function drawPlayer() {
  const t = performance.now();
  const blink = t < player.invincibleUntil && Math.floor(t / 80) % 2 === 0;
  if (blink) return;
  const x = player.x;
  const y = player.y;
  const star = t < player.starUntil;
  const big = player.power === "big";
  const run = Math.sin(t * 0.024) * (Math.abs(player.vx) > 0.3 && player.grounded ? 1 : 0);
  const squash = player.grounded ? 1 : 0.96;
  const bodyColor = star ? ["#ffd15f", "#f06aa3", "#32a7e2", "#60c878"][Math.floor(t / 90) % 4] : "#245bb8";
  const shirtColor = star ? ["#f7fbff", "#ffd15f", "#8f5fd9"][Math.floor(t / 120) % 3] : "#d83d35";
  ctx.save();
  ctx.translate(x + player.w / 2, y + player.h);
  ctx.scale(player.facing, 1);
  ctx.scale(big ? 1.08 : 1, squash);
  if (star) {
    ctx.strokeStyle = "rgba(255,255,255,0.82)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 7; i += 1) {
      const a = t * 0.006 + i * 0.9;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 28, -34 + Math.sin(a) * 28);
      ctx.lineTo(Math.cos(a) * 38, -34 + Math.sin(a) * 38);
      ctx.stroke();
    }
  }
  ctx.fillStyle = "#49301f";
  ctx.fillRect(-17, -8 + run * 4, 14, 8);
  ctx.fillRect(5, -8 - run * 4, 14, 8);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-10, -28);
  ctx.lineTo(-26, -15 + run * 3);
  ctx.moveTo(10, -28);
  ctx.lineTo(26, -15 - run * 3);
  ctx.stroke();
  ctx.fillStyle = "#f7fbff";
  ctx.beginPath();
  ctx.arc(-27, -14 + run * 3, 6, 0, Math.PI * 2);
  ctx.arc(27, -14 - run * 3, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  roundedRect(-16, -36, 32, 34, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = shirtColor;
  ctx.beginPath();
  roundedRect(-16, -43, 32, 18, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffd15f";
  ctx.fillRect(-8, -33, 5, 8);
  ctx.fillRect(4, -33, 5, 8);
  ctx.fillStyle = "#f0bf8a";
  ctx.beginPath();
  roundedRect(-17, -62, 34, 28, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = shirtColor;
  ctx.beginPath();
  roundedRect(-22, -72, 44, 13, 6);
  ctx.fill();
  ctx.fillRect(-11, -80, 22, 12);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("M", 0, -66);
  ctx.fillStyle = "#172632";
  ctx.fillRect(-9, -51, 4, 5);
  ctx.fillRect(6, -51, 4, 5);
  ctx.fillStyle = "#2a1d16";
  ctx.fillRect(-4, -45, 18, 5);
  ctx.fillRect(6, -41, 10, 4);
  ctx.fillStyle = "#f0bf8a";
  ctx.fillRect(12, -49, 5, 7);
  ctx.restore();
}

function drawOverlay() {
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  roundedRect(22, 20, 310, 72, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(23,38,50,0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#172632";
  ctx.font = "900 25px system-ui";
  ctx.fillText(scene.title, 42, 53);
  ctx.font = "800 14px system-ui";
  ctx.fillText(getSceneHelp(), 42, 78);

  if (won) {
    ctx.fillStyle = "rgba(255, 250, 240, 0.94)";
    ctx.beginPath();
    roundedRect(320, 176, 420, 146, 12);
    ctx.fill();
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#172632";
    ctx.font = "900 46px system-ui";
    ctx.fillText("通关成功!", 404, 240);
    ctx.font = "800 18px system-ui";
    ctx.fillText("天空 -> 鬼屋 -> 城堡 -> 电梯，全都完成了。", 356, 280);
  }
}

function drawCloud(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.beginPath();
  ctx.ellipse(-28, 8, 34, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(4, -2, 40, 26, 0, 0, Math.PI * 2);
  ctx.ellipse(42, 10, 34, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHill(x, y, w) {
  ctx.fillStyle = "rgba(56,143,70,0.32)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y, w / 2, 72, 0, Math.PI, 0);
  ctx.fill();
}

function drawGhostWindow(x, y) {
  ctx.fillStyle = "rgba(255,209,95,0.22)";
  ctx.beginPath();
  roundedRect(x, y, 110, 76, 10);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 55, y + 6);
  ctx.lineTo(x + 55, y + 70);
  ctx.moveTo(x + 8, y + 38);
  ctx.lineTo(x + 102, y + 38);
  ctx.stroke();
}

function roundedRect(x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function getAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function updateSoundToggle() {
  if (!soundToggleBtn) return;
  soundToggleBtn.textContent = audioState.enabled ? "音效开" : "静音";
  soundToggleBtn.classList.toggle("muted", !audioState.enabled);
  soundToggleBtn.setAttribute("aria-pressed", String(!audioState.enabled));
  soundToggleBtn.title = audioState.enabled ? "点击静音" : "点击开启音效";
  if (musicImportBtn) {
    musicImportBtn.textContent = audioState.customMusicName ? "已导入" : "导入音乐";
    musicImportBtn.title = audioState.customMusicName ? `当前音乐：${audioState.customMusicName}` : "选择你自己本机里的 MP3";
  }
}

function setSoundEnabled(nextEnabled) {
  audioState.enabled = nextEnabled;
  try {
    localStorage.setItem(audioMuteKey, nextEnabled ? "0" : "1");
  } catch {
    // The mute button still works for the current page if storage is blocked.
  }
  if (!nextEnabled) {
    stopMusic();
  } else {
    preloadAudioAssets();
    if (gameStarted && !won) startMusic();
  }
  updateSoundToggle();
}

function preloadAudioAssets() {
  if (!audioState.enabled || audioState.loading || audioState.loaded) return;
  if (location.protocol === "file:") {
    audioState.loaded = true;
    return;
  }
  let audio;
  try {
    audio = getAudio();
  } catch {
    return;
  }
  audioState.loading = true;
  Promise.all(
    Object.entries(audioFiles).map(async ([name, src]) => {
      try {
        const response = await fetch(src, { cache: "force-cache" });
        if (!response.ok) throw new Error(`Missing audio: ${src}`);
        const bytes = await response.arrayBuffer();
        audioState.buffers[name] = await audio.decodeAudioData(bytes);
      } catch {
        // Missing or blocked files fall back to generated chiptune sounds.
      }
    })
  ).finally(() => {
    audioState.loading = false;
    audioState.loaded = true;
    if (gameStarted && !won && audioState.enabled && audioState.buffers.bgm && !audioState.musicSource) {
      stopMusic();
      startMusic();
    }
  });
}

function playBuffer(name, options = {}) {
  if (!audioState.enabled) return false;
  const buffer = audioState.buffers[name];
  if (!buffer) return false;
  const audio = getAudio();
  const source = audio.createBufferSource();
  const gain = audio.createGain();
  source.buffer = buffer;
  source.loop = Boolean(options.loop);
  gain.gain.value = options.volume ?? 0.72;
  source.connect(gain);
  gain.connect(audio.destination);
  if (options.duration) source.start(audio.currentTime, options.offset || 0, options.duration);
  else source.start(audio.currentTime, options.offset || 0);
  if (options.loop) {
    audioState.musicSource = source;
    audioState.musicGain = gain;
  }
  return true;
}

async function importLocalMusic(file) {
  if (!file) return;
  try {
    const audio = getAudio();
    const bytes = await file.arrayBuffer();
    const decoded = await audio.decodeAudioData(bytes);
    audioState.buffers.bgm = decoded;
    audioState.customMusicName = file.name;
    audioState.loaded = true;
    setSoundEnabled(true);
    stopMusic();
    if (gameStarted && !won) startMusic();
    introStatus.textContent = `已导入本机音乐：${file.name}`;
    statusText.textContent = "本机音乐已经导入。公开网页不会保存这首歌，别人打开时需要自己导入。";
  } catch {
    statusText.textContent = "这个音频没导入成功，换一个 mp3 或 wav 再试。";
  } finally {
    updateSoundToggle();
    if (musicImportInput) musicImportInput.value = "";
  }
}

function playTone(freq, start, duration, gainValue = 0.055, type = "square") {
  if (!audioState.enabled) return;
  const audio = getAudio();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.03);
}

function playCoin() {
  if (playBuffer("coin", { volume: 0.78 })) return;
  playTone(880, 0, 0.08, 0.045);
  playTone(1320, 0.08, 0.1, 0.045);
}

function playJump() {
  if (playBuffer("jump", { volume: 0.66 })) return;
  playTone(420, 0, 0.08, 0.035, "triangle");
  playTone(720, 0.08, 0.1, 0.035, "triangle");
}

function playDoorSound() {
  playTone(260, 0, 0.12, 0.04, "sawtooth");
  playTone(520, 0.12, 0.12, 0.04, "triangle");
}

function playKeySound() {
  [740, 980, 1240].forEach((note, i) => playTone(note, i * 0.08, 0.1, 0.042, "triangle"));
}

function playBlockSound() {
  playTone(196, 0, 0.08, 0.035, "square");
  playTone(330, 0.08, 0.08, 0.035, "square");
}

function playStarSound() {
  [784, 988, 1174, 1568, 1174, 988].forEach((note, i) => playTone(note, i * 0.08, 0.08, 0.045, "triangle"));
}

function playHurt() {
  playTone(180, 0, 0.16, 0.045, "sawtooth");
  playTone(120, 0.16, 0.2, 0.04, "sawtooth");
}

function playLavaDeath() {
  if (playBuffer("lavaDeath", { volume: 0.8 })) return;
  [220, 196, 165, 130, 98].forEach((note, i) => playTone(note, i * 0.08, 0.14, 0.052, "sawtooth"));
  playTone(62, 0.22, 0.55, 0.042, "triangle");
}

function playVictory() {
  if (playBuffer("clear", { volume: 0.78 })) return;
  const notes = [523, 659, 784, 1046, 784, 1046, 1318, 1568, 1318, 1046, 1568];
  notes.forEach((note, i) => playTone(note, i * 0.13, 0.12, 0.055, "triangle"));
}

function playMetroSound() {
  [220, 277, 330, 440, 554, 659].forEach((note, i) => playTone(note, i * 0.08, 0.08, 0.038, "sawtooth"));
  playTone(92, 0.05, 0.5, 0.035, "triangle");
}

function playOpeningMusic() {
  if (playBuffer("bgm", { volume: 0.18, duration: 4.2 })) return;
  const notes = [
    523, 659, 784, 1046, 0, 988, 784, 659,
    587, 740, 880, 1174, 0, 1046, 880, 740,
    659, 784, 988, 1318, 1174, 988, 784, 659,
    587, 659, 784, 988, 1046, 988, 784, 659,
    523, 659, 784, 1046, 1318, 1174, 1046, 784
  ];
  notes.forEach((note, index) => {
    if (!note) return;
    playTone(note, index * 0.105, 0.085, 0.04, "triangle");
    if (index % 8 === 0) playTone(note / 2, index * 0.105, 0.18, 0.018, "square");
  });
}

function playMusicBar() {
  if (won || !gameStarted || !audioState.enabled) return;
  const sceneMelodies = {
    sky: [659, 659, 0, 659, 0, 523, 659, 0, 784, 0, 392, 0, 523, 587, 659, 523, 587, 659, 784, 880, 784, 659, 587, 523, 440, 523, 587, 659, 587, 523, 494, 523, 659, 784, 988, 1046, 988, 784, 659, 587, 523, 587, 659, 784, 880, 784, 659, 523, 587, 740, 880, 988, 880, 740, 587, 523, 659, 784, 1046, 1174, 1046, 784, 659, 523],
    ghost: [220, 277, 330, 311, 277, 247, 220, 185, 220, 262, 311, 349, 311, 262, 220, 196, 185, 220, 277, 330, 392, 330, 277, 220, 196, 247, 294, 349, 330, 294, 247, 220],
    castle: [262, 330, 392, 523, 392, 330, 294, 349, 392, 523, 659, 784, 659, 523, 392, 330, 349, 440, 523, 698, 784, 698, 523, 440, 392, 349, 330, 294, 330, 392, 523, 392, 440, 523, 659, 880, 784, 659, 523, 440, 392, 494, 587, 784, 698, 587, 494, 392],
    jungle: [392, 494, 587, 659, 587, 494, 440, 523, 587, 659, 784, 659, 587, 523, 494, 392, 440, 523, 659, 784, 880, 784, 659, 587, 523, 494, 440, 392, 440, 523, 587, 659, 784, 880, 988, 880, 784, 659, 587, 523, 494, 587, 659, 784, 659, 587, 494, 392],
    lava: [196, 262, 330, 392, 330, 262, 220, 196, 247, 330, 392, 494, 392, 330, 247, 220, 196, 247, 294, 370, 440, 370, 294, 247, 220, 262, 330, 392, 330, 262, 220, 196, 247, 294, 370, 494, 440, 370, 294, 247],
    mine: [294, 370, 440, 554, 440, 370, 330, 494, 554, 659, 554, 494, 440, 370, 330, 294, 330, 415, 494, 622, 554, 494, 415, 370, 330, 294, 247, 294, 330, 370, 440, 494, 554, 622, 740, 659, 554, 494, 440, 370],
    metro: [330, 392, 494, 659, 494, 392, 330, 262, 294, 370, 494, 587, 494, 370, 294, 247, 262, 330, 392, 523, 659, 523, 392, 330, 294, 370, 440, 587, 523, 440, 370, 330, 392, 494, 659, 784, 659, 494, 392, 330, 294, 370, 494, 659, 587, 494, 370, 294]
  };
  const melody = sceneMelodies[sceneKey] || sceneMelodies.sky;
  melody.forEach((note, i) => {
    if (!note) return;
    const at = i * 0.105;
    playTone(note, at, 0.078, 0.018, sceneKey === "ghost" || sceneKey === "mine" ? "sine" : "square");
    if (i % 4 === 0) playTone(note / 2, at, 0.13, 0.012, "triangle");
    if (sceneKey === "sky" && i % 16 === 12) playTone(note * 1.5, at + 0.035, 0.06, 0.012, "triangle");
  });
}

function startMusic() {
  if (!audioState.enabled || audioState.musicSource || musicTimer || won) return;
  preloadAudioAssets();
  if (audioState.buffers.bgm) {
    playBuffer("bgm", { loop: true, volume: 0.24 });
    return;
  }
  playMusicBar();
  musicTimer = window.setInterval(playMusicBar, 6800);
}

function stopMusic() {
  if (musicTimer) window.clearInterval(musicTimer);
  musicTimer = null;
  if (audioState.musicSource) {
    try {
      audioState.musicSource.stop();
    } catch {
      // Already stopped.
    }
  }
  audioState.musicSource = null;
  audioState.musicGain = null;
}

function beginGame() {
  loadScene(selectedSceneKey, "entry");
  gameStarted = true;
  introOverlay.classList.add("hidden");
  statusText.textContent = `${scene.title}开始！往右走，顶问号砖和隐藏机关。`;
  recordEvent("start", { map: sceneKey });
  startMusic();
}

function updateMapButtons() {
  mapButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.map === selectedSceneKey);
  });
}

function chooseMap(key) {
  if (!sceneTemplates[key] || gameStarted) return;
  selectedSceneKey = key;
  loadScene(key, "entry");
  introStatus.textContent = `已选择：${sceneTemplates[key].title}。${getSceneHelp()}`;
  updateMapButtons();
}

function startIntro() {
  if (gameStarted) return;
  if (audioState.enabled) {
    getAudio();
    preloadAudioAssets();
  }
  startIntroBtn.disabled = true;
  startIntroBtn.textContent = "准备中";
  introStatus.textContent = audioState.enabled ? "音效准备中，开始后会播放背景音乐" : "静音模式，开始后不会播放音效";
  playOpeningMusic();
  introTimer = window.setTimeout(beginGame, 4300);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key);
  if (event.key === "r" || event.key === "R") reset();
  if (!gameStarted && (event.key === "Enter" || event.key === " ")) {
    startIntro();
    event.preventDefault();
    return;
  }
  if (gameStarted) startMusic();
  if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();
});

window.addEventListener("keyup", (event) => keys.delete(event.key));

mapButtons.forEach((button) => {
  button.addEventListener("click", () => chooseMap(button.dataset.map));
});

document.querySelectorAll("[data-control]").forEach((button) => {
  const control = button.dataset.control;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (!gameStarted) startIntro();
    touchControls.add(control);
    startMusic();
  });
  const release = () => touchControls.delete(control);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
});

canvas.addEventListener("pointerdown", () => {
  if (!gameStarted) startIntro();
  startMusic();
});

recordsBtn.addEventListener("click", () => {
  recordsPanel.hidden = !recordsPanel.hidden;
  updateRecordsPanel();
});

soundToggleBtn.addEventListener("click", () => {
  setSoundEnabled(!audioState.enabled);
});

musicImportBtn.addEventListener("click", () => {
  musicImportInput.click();
});

musicImportInput.addEventListener("change", () => {
  importLocalMusic(musicImportInput.files?.[0]);
});

startIntroBtn.addEventListener("click", startIntro);
restartBtn.addEventListener("click", reset);

updateSoundToggle();
recordEvent("visit", { map: selectedSceneKey });
reset();
tick();
