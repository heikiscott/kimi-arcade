const canvas = document.querySelector("#metroCrashCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.querySelector("#statusText");
const speedText = document.querySelector("#speedText");
const doorText = document.querySelector("#doorText");
const announcementText = document.querySelector("#announcementText");
const endingCard = document.querySelector("#endingCard");
const endingTitle = document.querySelector("#endingTitle");
const endingText = document.querySelector("#endingText");
const openPlatformBtn = document.querySelector("#openPlatformBtn");
const closePlatformBtn = document.querySelector("#closePlatformBtn");
const boardBtn = document.querySelector("#boardBtn");
const announceBtn = document.querySelector("#announceBtn");
const departBtn = document.querySelector("#departBtn");
const powerBtn = document.querySelector("#powerBtn");
const resetBtn = document.querySelector("#resetBtn");
const againBtn = document.querySelector("#againBtn");

let mode = "station";
let doorsOpen = false;
let boarded = false;
let powered = true;
let speed = 0;
let trainX = 120;
let trainAngle = 0;
let departAt = 0;
let travelProgress = 0;
let shake = 0;
let sparks = [];
let flyingToys = [];
let audioContext = null;

const robots = [
  { x: 196, y: 398, color: "#d93a32", label: "R1" },
  { x: 256, y: 398, color: "#ffd15f", label: "R2" },
  { x: 420, y: 398, color: "#39a657", label: "R3" },
  { x: 650, y: 398, color: "#8f5fd9", label: "R4" }
];

const routeStations = [
  { cn: "港湾", en: "HarbourFront", ms: "Pelabuhan", ta: "ஹார்பர்ஃப்ரண்ட்" },
  { cn: "欧南园", en: "Outram Park", ms: "Taman Outram", ta: "ஊட்ரம் பார்க்" },
  { cn: "牛车水", en: "Chinatown", ms: "Pecinan", ta: "சைனாடவுன்" },
  { cn: "克拉码头", en: "Clarke Quay", ms: "Clarke Quay", ta: "கிளார்க் கீ" }
];
const scenicSpots = ["滨海湾花园", "滨海湾金沙酒店", "滨海湾", "装义基石", "鱼尾狮公园 / 鱼尾狮"];
const routeDurations = [1200, 1200, 10000];
const totalRouteDuration = routeDurations.reduce((sum, duration) => sum + duration, 0);
const finalLegDistanceKm = 300;
const finalLegSpeedKmh = 108000;

function getAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(freq, start, duration, gainValue = 0.04, type = "square") {
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
  osc.stop(audio.currentTime + start + duration + 0.03);
}

function doorSound(open) {
  playTone(open ? 520 : 390, 0, 0.12, 0.035, "sine");
  playTone(open ? 650 : 300, 0.14, 0.12, 0.025, "sine");
}

function powerSound() {
  playTone(620, 0, 0.08, 0.04, "square");
  playTone(180, 0.15, 0.32, 0.06, "sawtooth");
  playTone(82, 0.45, 0.54, 0.07, "triangle");
}

function extractAnnouncementPart(text, startLabel, endLabel) {
  const start = text.indexOf(startLabel);
  if (start === -1) return "";
  const contentStart = start + startLabel.length;
  const end = endLabel ? text.indexOf(endLabel, contentStart) : -1;
  return text.slice(contentStart, end === -1 ? text.length : end).trim();
}

function speakAnnouncement(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const parts = [
    { lang: "zh-CN", text: extractAnnouncementPart(text, "中文：", "English:") },
    { lang: "en-US", text: extractAnnouncementPart(text, "English:", "Malay:") },
    { lang: "ms-MY", text: extractAnnouncementPart(text, "Malay:", "தமிழ்:") },
    { lang: "ta-IN", text: extractAnnouncementPart(text, "தமிழ்:", "") }
  ].filter((part) => part.text);

  parts.forEach((part) => {
    const utterance = new SpeechSynthesisUtterance(part.text);
    utterance.lang = part.lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  });
}

function playAnnouncement() {
  const route = getCurrentRouteState();
  const announcement = getAnnouncement(route);
  announcementText.textContent = announcement;
  statusText.textContent = "叮咚，正在播放四语广播。";
  playTone(660, 0, 0.1, 0.04, "sine");
  playTone(880, 0.13, 0.12, 0.04, "sine");
  speakAnnouncement(announcement);
}

function openDoors() {
  if (mode === "flipped") return;
  doorsOpen = true;
  speed = 0;
  mode = "station";
  statusText.textContent = "站台门打开，地铁车门也打开。玩偶机器人可以上车。";
  endingCard.classList.remove("show");
  doorSound(true);
}

function closeDoors() {
  if (mode === "flipped") return;
  doorsOpen = false;
  statusText.textContent = "站台门关闭，地铁车门也关闭。可以从港湾 HarbourFront 出发。";
  doorSound(false);
}

function boardRobots() {
  if (!doorsOpen || mode === "flipped") {
    statusText.textContent = "要先点站台门开，玩偶机器人才能进去。";
    return;
  }
  boarded = true;
  statusText.textContent = "几个假的玩偶机器人走进三节车厢了。";
  [440, 590, 740, 520].forEach((note, index) => playTone(note, index * 0.08, 0.07, 0.035, "sine"));
}

function depart() {
  if (mode === "flipped") reset();
  if (doorsOpen) closeDoors();
  if (!boarded) boarded = true;
  mode = "departing";
  powered = true;
  departAt = performance.now();
  travelProgress = 0;
  speed = 320;
  trainX = 120;
  trainAngle = 0;
  endingCard.classList.remove("show");
  statusText.textContent = "从港湾 HarbourFront 出发：欧南园和牛车水很近，牛车水到克拉码头有 300 公里，中间经过滨海湾景点。";
  playTone(330, 0, 0.12, 0.04, "sine");
  playTone(420, 0.14, 0.12, 0.04, "sine");
}

function powerOffFlip() {
  if (mode === "flipped") return;
  mode = "flipped";
  powered = false;
  speed = 0;
  trainAngle = 1.24;
  shake = 28;
  makeFlyingToys();
  makeSparks();
  statusText.textContent = "突然没电，灯灭了，三节地铁自己翻倒。里面是玩偶机器人和行李箱。";
  endingTitle.textContent = "断电翻倒";
  endingText.textContent = "没有墙，地铁是自己翻了。车厢里只有假玩偶机器人。";
  endingCard.classList.add("show");
  powerSound();
}

function reset() {
  mode = "station";
  doorsOpen = false;
  boarded = false;
  powered = true;
  speed = 0;
  trainX = 120;
  trainAngle = 0;
  departAt = 0;
  travelProgress = 0;
  shake = 0;
  sparks = [];
  flyingToys = [];
  endingCard.classList.remove("show");
  statusText.textContent = "港线：港湾 HarbourFront、欧南园 Outram Park、牛车水 Chinatown、克拉码头 Clarke Quay。每站都有四种语言。";
}

function makeFlyingToys() {
  const base = trainX + 260;
  flyingToys = [
    { x: base - 120, y: 350, vx: -6, vy: -12, r: 0, vr: -0.22, kind: "robot", color: "#d93a32", label: "R1" },
    { x: base - 30, y: 350, vx: 7, vy: -15, r: 0, vr: 0.25, kind: "case", color: "#245b8f", label: "箱" },
    { x: base + 70, y: 350, vx: -4, vy: -16, r: 0, vr: 0.2, kind: "robot", color: "#ffd15f", label: "R2" },
    { x: base + 150, y: 350, vx: 9, vy: -12, r: 0, vr: -0.18, kind: "case", color: "#8f5fd9", label: "箱" },
    { x: base + 210, y: 350, vx: -2, vy: -14, r: 0, vr: 0.28, kind: "robot", color: "#39a657", label: "R3" }
  ];
}

function makeSparks() {
  sparks = Array.from({ length: 42 }, () => ({
    x: trainX + 80 + Math.random() * 560,
    y: 360 + Math.random() * 88,
    vx: -7 + Math.random() * 14,
    vy: -8 + Math.random() * 7,
    life: 24 + Math.random() * 28
  }));
}

function update() {
  if (mode === "departing") {
    const elapsed = performance.now() - departAt;
    const route = getRouteState(elapsed);
    travelProgress = route.segmentProgress;
    speed = Math.round(route.isFinalLongLeg ? finalLegSpeedKmh : 3400 + Math.sin(elapsed / 180) * 320);
    trainX = 120 + Math.sin(elapsed / 130) * 8;
    statusText.textContent = route.isArrived
      ? "已经到达克拉码头 Clarke Quay。要翻倒的话，点断电翻倒。"
      : `从 ${stationTitle(route.from)} 开往 ${stationTitle(route.to)}${route.isFinalLongLeg ? `，距离 ${finalLegDistanceKm} 公里，经过滨海湾景点，超高速 10 秒到` : "，这一站很近"}`;
    if (route.isArrived) {
      mode = "arrived";
      speed = 0;
      travelProgress = 1;
    }
    if (Math.random() < 0.6) {
      sparks.push({
        x: 110 + Math.random() * 640,
        y: 430 + Math.random() * 24,
        vx: -14 - Math.random() * 16,
        vy: -2 - Math.random() * 5,
        life: 12 + Math.random() * 18
      });
    }
  }

  flyingToys.forEach((toy) => {
    toy.x += toy.vx;
    toy.y += toy.vy;
    toy.vy += 0.62;
    toy.r += toy.vr;
    if (toy.y > 535) {
      toy.y = 535;
      toy.vy *= -0.28;
      toy.vx *= 0.84;
    }
  });

  sparks.forEach((spark) => {
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vy += 0.24;
    spark.life -= 1;
  });
  sparks = sparks.filter((spark) => spark.life > 0);
  shake = Math.max(0, shake - 1);
  draw();
  requestAnimationFrame(update);
}

function getRouteState(elapsed) {
  if (elapsed >= totalRouteDuration) {
    const last = routeStations[routeStations.length - 1];
    return {
      from: last,
      to: last,
      segmentIndex: routeDurations.length - 1,
      segmentProgress: 1,
      isFinalLongLeg: false,
      isArrived: true
    };
  }

  let remaining = elapsed;
  for (let index = 0; index < routeDurations.length; index += 1) {
    const duration = routeDurations[index];
    if (remaining <= duration) {
      return {
        from: routeStations[index],
        to: routeStations[index + 1],
        segmentIndex: index,
        segmentProgress: remaining / duration,
        isFinalLongLeg: index === routeDurations.length - 1,
        isArrived: false
      };
    }
    remaining -= duration;
  }
  return getRouteState(totalRouteDuration);
}

function getCurrentRouteState() {
  if (mode === "departing") return getRouteState(performance.now() - departAt);
  if (mode === "arrived" || mode === "flipped") return getRouteState(totalRouteDuration);
  return {
    from: routeStations[0],
    to: routeStations[1],
    segmentIndex: 0,
    segmentProgress: 0,
    isFinalLongLeg: false,
    isArrived: false
  };
}

function draw() {
  ctx.save();
  if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake * 0.42);
  drawStation();
  drawPlatformDoors();
  drawTrain();
  if (!boarded && doorsOpen) robots.forEach((robot) => drawRobot(robot.x, robot.y, robot.color, robot.label));
  sparks.forEach(drawSpark);
  flyingToys.forEach(drawFlyingToy);
  drawHud();
  ctx.restore();
  speedText.textContent = `${Math.round(speed)} km/h`;
  doorText.textContent = doorsOpen ? "站台+车门打开" : "站台+车门关闭";
  announcementText.textContent = getAnnouncement(getCurrentRouteState());
}

function drawStation() {
  const route = getCurrentRouteState();
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, powered ? "#d7edf7" : "#26313b");
  gradient.addColorStop(0.56, powered ? "#edf6fa" : "#18222b");
  gradient.addColorStop(1, powered ? "#9fb0b9" : "#0f151b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = powered ? "#eef7fa" : "#2d3842";
  ctx.fillRect(0, 236, canvas.width, 112);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 25px system-ui";
  drawStationName(route.isArrived ? routeStations[routeStations.length - 1] : route.from, 34, 282);
  ctx.fillStyle = "#ffd15f";
  ctx.fillText(route.isArrived ? "已到 Clarke Quay" : `下一站 ${stationTitle(route.to)}`, 590, 60);
  drawRouteRibbon(route);

  ctx.fillStyle = "#596a75";
  ctx.fillRect(0, 448, canvas.width, 46);
  ctx.fillStyle = "#1d2a34";
  ctx.fillRect(0, 494, canvas.width, 126);
  ctx.strokeStyle = "#c5b58d";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, 468);
  ctx.lineTo(canvas.width, 468);
  ctx.moveTo(0, 528);
  ctx.lineTo(canvas.width, 528);
  ctx.stroke();

  ctx.fillStyle = "#f4d16e";
  for (let x = 0; x < canvas.width; x += 48) {
    ctx.fillRect(x, 430, 28, 10);
  }

  if (mode === "departing") {
    ctx.strokeStyle = "rgba(255, 209, 95, 0.42)";
    ctx.lineWidth = 3;
    for (let line = 0; line < 16; line += 1) {
      const y = 110 + line * 22;
      ctx.beginPath();
      ctx.moveTo(20 + Math.random() * 80, y);
      ctx.lineTo(360 + Math.random() * 440, y + Math.random() * 18);
      ctx.stroke();
    }
  }

  if (route.isFinalLongLeg) {
    drawScenicSpots(route.segmentProgress);
  }
}

function drawPlatformDoors() {
  const route = getCurrentRouteState();
  const progress = route.segmentProgress;
  drawPlatformDoorSet(-progress * 760, `${route.from.cn} 三扇门`);
  drawPlatformDoorSet(760 - progress * 760, `${route.to.cn} 三扇门`);
  const nextStation = routeStations[Math.min(route.segmentIndex + 2, routeStations.length - 1)];
  if (nextStation !== route.to) {
    drawPlatformDoorSet(1520 - progress * 760, `${nextStation.cn} 三扇门`);
  }
}

function getTravelProgress() {
  if (mode === "departing") return travelProgress;
  if (mode === "flipped") return travelProgress;
  return 0;
}

function drawPlatformDoorSet(offsetX, label) {
  const doorXs = [226, 438, 650];
  ctx.save();
  ctx.translate(offsetX, 0);
  ctx.fillStyle = "rgba(255,250,240,0.9)";
  ctx.fillRect(132, 218, 608, 30);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 16px system-ui";
  ctx.fillText(label, 148, 240);
  doorXs.forEach((x) => {
    ctx.fillStyle = "rgba(23,38,50,0.1)";
    ctx.fillRect(x - 58, 276, 152, 176);
    ctx.strokeStyle = "rgba(23,38,50,0.26)";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 58, 276, 152, 176);

    ctx.fillStyle = "rgba(23,38,50,0.14)";
    ctx.fillRect(x - 76, 254, 152, 176);
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 4;
    ctx.strokeRect(x - 76, 254, 152, 176);
    ctx.fillStyle = powered ? "#c7d9e2" : "#40505c";
    if (doorsOpen) {
      ctx.fillRect(x - 76, 254, 32, 176);
      ctx.fillRect(x + 44, 254, 32, 176);
    } else {
      ctx.fillRect(x - 74, 254, 74, 176);
      ctx.fillRect(x, 254, 74, 176);
    }
  });
  ctx.restore();
}

function stationTitle(station) {
  return `${station.cn} ${station.en}`;
}

function drawStationName(station, x, y) {
  ctx.fillStyle = "#172632";
  ctx.font = "bold 22px system-ui";
  ctx.fillText(`${station.cn} / ${station.en}`, x, y);
  ctx.font = "bold 16px system-ui";
  ctx.fillText(`${station.ms} / ${station.ta}`, x, y + 26);
}

function drawRouteRibbon(route) {
  ctx.fillStyle = "rgba(255,250,240,0.88)";
  ctx.fillRect(24, 118, 474, 78);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 15px system-ui";
  ctx.fillText("港线 Harbour Line", 42, 144);
  ctx.fillText("港湾 HarbourFront / Pelabuhan / ஹார்பர்ஃப்ரண்ட்", 42, 168);
  ctx.fillText("欧南园 Outram Park / Taman Outram / ஊட்ரம் பார்க்", 42, 190);
  ctx.fillText("牛车水 Chinatown / Pecinan / சைனாடவுன்", 42, 212);
  if (route.isFinalLongLeg) {
    ctx.fillStyle = "#8b1e2d";
    ctx.fillText("牛车水到克拉码头：300 km long run", 42, 234);
  }
}

function drawScenicSpots(progress) {
  const baseX = 850 - progress * 620;
  const spots = scenicSpots.map((name, index) => ({
    name,
    x: baseX + index * 126,
    y: 158 + (index % 2) * 54
  }));
  spots.forEach((spot, index) => {
    if (spot.x < -120 || spot.x > canvas.width + 120) return;
    ctx.fillStyle = index % 2 === 0 ? "#39a657" : "#d7a249";
    ctx.beginPath();
    ctx.roundRect(spot.x - 44, spot.y - 24, 88, 48, 8);
    ctx.fill();
    ctx.fillStyle = "#172632";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(spot.name, spot.x, spot.y + 5);
    ctx.textAlign = "left";
  });
}

function getAnnouncement(route) {
  if (mode === "flipped") {
    return "中文：列车断电，请保持冷静。 English: Power failure, please stay calm. Malay: Bekalan kuasa terputus, sila bertenang. தமிழ்: மின்சாரம் நிறுத்தப்பட்டது, அமைதியாக இருங்கள்.";
  }
  if (doorsOpen) {
    return `中文：本站 ${route.from.cn}，请小心上下车。 English: This is ${route.from.en}, please mind the doors. Malay: Ini ${route.from.ms}, sila berhati-hati. தமிழ்: இது ${route.from.ta}, கதவுகளைக் கவனியுங்கள்.`;
  }
  if (route.isArrived) {
    return "中文：终点站克拉码头到了。 English: We have arrived at Clarke Quay. Malay: Kita telah tiba di Clarke Quay. தமிழ்: கிளார்க் கீ வந்துவிட்டோம்.";
  }
  if (route.isFinalLongLeg) {
    return "中文：下一站克拉码头，本段 300 公里，途经滨海湾花园、滨海湾金沙酒店、滨海湾、装义基石、鱼尾狮公园。 English: Next station Clarke Quay, a 300 km express sector via Marina Bay sights. Malay: Stesen seterusnya Clarke Quay, laluan ekspres 300 km melalui tarikan Marina Bay. தமிழ்: அடுத்த நிலையம் கிளார்க் கீ, 300 கி.மீ வேகப் பயணம்.";
  }
  return `中文：下一站 ${route.to.cn}。 English: Next station ${route.to.en}. Malay: Stesen seterusnya ${route.to.ms}. தமிழ்: அடுத்த நிலையம் ${route.to.ta}.`;
}

function drawTrain() {
  ctx.save();
  ctx.translate(trainX + 300, 356);
  ctx.rotate(trainAngle);
  ctx.translate(-300, -58);
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(300, 148, 322, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let car = 0; car < 3; car += 1) {
    drawCarriage(car * 204, car);
  }
  if (boarded && mode !== "flipped") drawOnboardRobots();
  ctx.restore();
}

function drawCarriage(x, car) {
  ctx.fillStyle = powered ? "#d9e6ec" : "#87939b";
  ctx.beginPath();
  ctx.roundRect(x, 0, 196, 116, 22);
  ctx.fill();
  ctx.fillStyle = "#245b8f";
  ctx.fillRect(x + 14, 63, 168, 18);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 17px system-ui";
  ctx.fillText(car === 0 ? "闪电号" : `车厢 ${car + 1}`, x + 20, 42);
  for (let win = 0; win < 2; win += 1) {
    ctx.fillStyle = powered ? "#7ec5df" : "#40505c";
    ctx.beginPath();
    ctx.roundRect(x + 98 + win * 50, 20, 36, 30, 7);
    ctx.fill();
  }
  drawTrainDoor(x + 52, doorsOpen);
  ctx.fillStyle = "#111821";
  ctx.beginPath();
  ctx.arc(x + 44, 118, 17, 0, Math.PI * 2);
  ctx.arc(x + 154, 118, 17, 0, Math.PI * 2);
  ctx.fill();
}

function drawTrainDoor(x, open) {
  ctx.fillStyle = powered ? "#b8cbd4" : "#586672";
  if (open) {
    ctx.fillRect(x - 34, 20, 18, 70);
    ctx.fillRect(x + 16, 20, 18, 70);
  } else {
    ctx.fillRect(x - 26, 20, 52, 70);
  }
  ctx.strokeStyle = "rgba(23,38,50,0.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 26, 20, 52, 70);
}

function drawOnboardRobots() {
  [
    { x: 132, y: 84, color: "#d93a32", label: "R1" },
    { x: 292, y: 84, color: "#ffd15f", label: "R2" },
    { x: 446, y: 84, color: "#39a657", label: "R3" },
    { x: 548, y: 84, color: "#8f5fd9", label: "R4" }
  ].forEach((robot) => drawRobot(robot.x, robot.y, robot.color, robot.label, 0.72));
}

function drawRobot(x, y, color, label, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-18, -24, 36, 34, 8);
  ctx.fill();
  ctx.fillStyle = "#172632";
  ctx.beginPath();
  ctx.arc(-7, -10, 3, 0, Math.PI * 2);
  ctx.arc(7, -10, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#64717b";
  ctx.fillRect(-12, 12, 24, 30);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, 0, 32);
  ctx.restore();
}

function drawSpark(spark) {
  ctx.fillStyle = spark.life % 2 > 1 ? "#ffd15f" : "#f08a2d";
  ctx.beginPath();
  ctx.arc(spark.x, spark.y, 3 + spark.life * 0.03, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlyingToy(toy) {
  ctx.save();
  ctx.translate(toy.x, toy.y);
  ctx.rotate(toy.r);
  if (toy.kind === "case") {
    ctx.fillStyle = toy.color;
    ctx.fillRect(-24, -18, 48, 36);
    ctx.strokeStyle = "#172632";
    ctx.lineWidth = 4;
    ctx.strokeRect(-24, -18, 48, 36);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(toy.label, 0, 5);
  } else {
    drawRobot(0, 0, toy.color, toy.label, 1);
  }
  ctx.restore();
}

function drawHud() {
  ctx.fillStyle = "rgba(255,250,240,0.92)";
  ctx.fillRect(22, 20, 276, 92);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 19px system-ui";
  ctx.fillText("三节玩具地铁", 40, 52);
  ctx.fillText(powered ? `${Math.round(speed)} km/h` : "断电", 40, 84);
}

openPlatformBtn.addEventListener("click", openDoors);
closePlatformBtn.addEventListener("click", closeDoors);
boardBtn.addEventListener("click", boardRobots);
announceBtn.addEventListener("click", playAnnouncement);
departBtn.addEventListener("click", depart);
powerBtn.addEventListener("click", powerOffFlip);
resetBtn.addEventListener("click", reset);
againBtn.addEventListener("click", reset);

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (key === "o") openDoors();
  if (key === "c") closeDoors();
  if (key === "b") boardRobots();
  if (key === "a") playAnnouncement();
  if (key === "d") depart();
  if (key === "p" || key === " ") powerOffFlip();
  if (["o", "c", "b", "a", "d", "p", " "].includes(key)) event.preventDefault();
});

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, w, h, r) {
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };
}

reset();
update();
