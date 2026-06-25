const canvas = document.querySelector("#drawCanvas");
const ctx = canvas.getContext("2d");
const swatchesEl = document.querySelector("#swatches");
const colorPicker = document.querySelector("#colorPicker");
const sizeRange = document.querySelector("#sizeRange");
const sizeText = document.querySelector("#sizeText");
const statusEl = document.querySelector("#status");
const penBtn = document.querySelector("#penBtn");
const eraserBtn = document.querySelector("#eraserBtn");
const undoBtn = document.querySelector("#undoBtn");
const clearBtn = document.querySelector("#clearBtn");
const walkBtn = document.querySelector("#walkBtn");
const taxiBtn = document.querySelector("#taxiBtn");
const takeoffBtn = document.querySelector("#takeoffBtn");
const doorOpenBtn = document.querySelector("#doorOpenBtn");
const doorCloseBtn = document.querySelector("#doorCloseBtn");
const metroGoBtn = document.querySelector("#metroGoBtn");
const trainGoBtn = document.querySelector("#trainGoBtn");
const stopWalkBtn = document.querySelector("#stopWalkBtn");
const saveBtn = document.querySelector("#saveBtn");

const colors = ["#d93a32", "#245b8f", "#39a657", "#ffd15f", "#172632", "#ffffff", "#d94a78", "#7b4bb8", "#ff8a2f", "#57c7d4", "#8b5a2b", "#000000"];
let currentColor = "#d93a32";
let brushSize = 12;
let tool = "pen";
let drawing = false;
let lastPoint = null;
let history = [];
let animationFrame = null;
let animationSprite = null;
let animationBackground = null;
let animationStart = 0;
let animationMode = null;

function fillWhite() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function saveHistory() {
  stopAnimation(false);
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (history.length > 18) history.shift();
}

function restoreLast() {
  const last = history.pop();
  if (!last) {
    statusEl.textContent = "没有可以撤销的画了。";
    return;
  }
  ctx.putImageData(last, 0, 0);
  statusEl.textContent = "撤销了一步。";
}

function buildSwatches() {
  swatchesEl.innerHTML = "";
  colors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.style.background = color;
    button.classList.toggle("active", color === currentColor);
    button.setAttribute("aria-label", `颜色 ${color}`);
    button.addEventListener("click", () => {
      currentColor = color;
      colorPicker.value = color;
      tool = "pen";
      updateTools();
    });
    swatchesEl.append(button);
  });
}

function updateTools() {
  penBtn.classList.toggle("active", tool === "pen");
  eraserBtn.classList.toggle("active", tool === "eraser");
  sizeText.textContent = `${brushSize} px`;
  buildSwatches();
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height
  };
}

function startDraw(event) {
  event.preventDefault();
  saveHistory();
  drawing = true;
  lastPoint = canvasPoint(event);
  drawDot(lastPoint);
}

function moveDraw(event) {
  if (!drawing) return;
  event.preventDefault();
  const point = canvasPoint(event);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = brushSize;
  ctx.strokeStyle = tool === "eraser" ? "#ffffff" : currentColor;
  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  lastPoint = point;
}

function stopDraw() {
  if (!drawing) return;
  drawing = false;
  lastPoint = null;
  statusEl.textContent = tool === "eraser" ? "擦掉了一点。" : "画上去了。";
}

function drawDot(point) {
  ctx.fillStyle = tool === "eraser" ? "#ffffff" : currentColor;
  ctx.beginPath();
  ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
  ctx.fill();
}

function clearCanvas() {
  stopAnimation(false);
  saveHistory();
  fillWhite();
  statusEl.textContent = "画布清空了。";
}

function saveImage() {
  const link = document.createElement("a");
  link.download = "我的画.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
  statusEl.textContent = "图片已经下载。";
}

function findDrawingBounds(imageData) {
  const data = imageData.data;
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const index = (y * canvas.width + x) * 4;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const alpha = data[index + 3];
      const isWhite = red > 245 && green > 245 && blue > 245;
      if (alpha > 0 && !isWhite) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;
  return {
    x: Math.max(0, minX - 12),
    y: Math.max(0, minY - 12),
    w: Math.min(canvas.width - minX + 12, maxX - minX + 25),
    h: Math.min(canvas.height - minY + 12, maxY - minY + 25)
  };
}

function makeTransparentSprite(source, bounds) {
  const sprite = document.createElement("canvas");
  sprite.width = bounds.w;
  sprite.height = bounds.h;
  const spriteCtx = sprite.getContext("2d");
  const pixels = new ImageData(bounds.w, bounds.h);

  for (let y = 0; y < bounds.h; y += 1) {
    for (let x = 0; x < bounds.w; x += 1) {
      const sourceIndex = ((bounds.y + y) * canvas.width + bounds.x + x) * 4;
      const targetIndex = (y * bounds.w + x) * 4;
      const red = source.data[sourceIndex];
      const green = source.data[sourceIndex + 1];
      const blue = source.data[sourceIndex + 2];
      const alpha = source.data[sourceIndex + 3];
      const isWhite = red > 245 && green > 245 && blue > 245;
      pixels.data[targetIndex] = red;
      pixels.data[targetIndex + 1] = green;
      pixels.data[targetIndex + 2] = blue;
      pixels.data[targetIndex + 3] = isWhite ? 0 : alpha;
    }
  }

  spriteCtx.putImageData(pixels, 0, 0);
  return sprite;
}

function prepareAnimation(emptyMessage) {
  stopAnimation(false);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bounds = findDrawingBounds(imageData);
  if (!bounds || bounds.w < 8 || bounds.h < 8) {
    statusEl.textContent = emptyMessage;
    return null;
  }

  saveHistory();
  animationBackground = ctx.getImageData(0, 0, canvas.width, canvas.height);
  animationSprite = makeTransparentSprite(imageData, bounds);
  fillWhite();
  animationStart = performance.now();
  return bounds;
}

function startMode(mode) {
  const messages = {
    walk: "先画一个小人，再点小人走路。",
    taxi: "先画一架飞机，再点飞机滑行。",
    takeoff: "先画一架飞机，再点飞机起飞。",
    doorOpen: "先画地铁和站台，再点地铁开门。",
    doorClose: "先画地铁和站台，再点地铁关门。",
    metroGo: "先画地铁和站台，再点地铁出发。",
    trainGo: "先画高铁，再点高铁出发。"
  };
  const bounds = prepareAnimation(messages[mode]);
  if (!bounds) return;
  animationMode = mode;
  statusEl.textContent = animationStatus(mode);
  animateScene();
}

function animationStatus(mode) {
  if (mode === "walk") return "小人开始走路了。";
  if (mode === "taxi") return "飞机在跑道上滑行。";
  if (mode === "takeoff") return "飞机滑行，然后起飞成功。";
  if (mode === "doorOpen") return "地铁停在站台，车门打开。";
  if (mode === "doorClose") return "地铁车门关上。";
  if (mode === "metroGo") return "地铁关门后加速开走。";
  if (mode === "trainGo") return "高铁加速出发。";
  return "动画开始。";
}

function animateScene(time = performance.now()) {
  if (!animationSprite || !animationMode) return;
  const elapsed = time - animationStart;
  fillWhite();

  if (animationMode === "walk") drawWalkingPerson(elapsed);
  if (animationMode === "taxi") drawPlaneTaxi(elapsed, false);
  if (animationMode === "takeoff") drawPlaneTaxi(elapsed, true);
  if (animationMode === "doorOpen") drawStationTrain(elapsed, "open");
  if (animationMode === "doorClose") drawStationTrain(elapsed, "close");
  if (animationMode === "metroGo") drawStationTrain(elapsed, "go");
  if (animationMode === "trainGo") drawStationTrain(elapsed, "fast");

  animationFrame = requestAnimationFrame(animateScene);
}

function drawWalkingPerson(elapsed) {
  const walkWidth = Math.max(1, canvas.width - animationSprite.width - 40);
  const progress = (elapsed * 0.00016) % 2;
  const goingRight = progress < 1;
  const t = goingRight ? progress : 2 - progress;
  const x = 20 + walkWidth * t;
  const groundY = canvas.height - animationSprite.height - 42;
  const bob = Math.sin(elapsed * 0.012) * 10;
  const step = Math.sin(elapsed * 0.018);

  drawGround("小人路面");
  ctx.save();
  ctx.translate(x + animationSprite.width / 2, groundY + bob + animationSprite.height / 2);
  if (!goingRight) ctx.scale(-1, 1);
  ctx.drawImage(animationSprite, -animationSprite.width / 2, -animationSprite.height / 2);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = Math.max(4, Math.min(12, animationSprite.width / 18));
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-animationSprite.width * 0.15, animationSprite.height * 0.38);
  ctx.lineTo(-animationSprite.width * 0.24 - step * 12, animationSprite.height * 0.5);
  ctx.moveTo(animationSprite.width * 0.15, animationSprite.height * 0.38);
  ctx.lineTo(animationSprite.width * 0.24 + step * 12, animationSprite.height * 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawGround(label) {
  ctx.fillStyle = "#eaf6fb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#5b7485";
  ctx.fillRect(0, canvas.height - 64, canvas.width, 64);
  ctx.fillStyle = "rgba(255,255,255,0.74)";
  ctx.fillRect(0, canvas.height - 36, canvas.width, 8);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 22px system-ui";
  ctx.fillText(label, 26, 44);
}

function drawRunway() {
  ctx.fillStyle = "#9ed8f0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#6d7580";
  ctx.fillRect(0, canvas.height - 150, canvas.width, 150);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 8;
  ctx.setLineDash([44, 30]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 76);
  ctx.lineTo(canvas.width, canvas.height - 76);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 22px system-ui";
  ctx.fillText("机场跑道", 26, 44);
}

function drawPlaneTaxi(elapsed, takeoff) {
  drawRunway();
  const duration = takeoff ? 5200 : 4200;
  const t = Math.min(1, (elapsed % duration) / duration);
  const x = -animationSprite.width + (canvas.width + animationSprite.width * 1.5) * t;
  let y = canvas.height - 170 - animationSprite.height;
  let angle = 0;

  if (takeoff && t > 0.48) {
    const fly = (t - 0.48) / 0.52;
    y -= fly * 430;
    angle = -0.38 * fly;
  }

  ctx.save();
  ctx.translate(x + animationSprite.width / 2, y + animationSprite.height / 2);
  ctx.rotate(angle);
  ctx.drawImage(animationSprite, -animationSprite.width / 2, -animationSprite.height / 2);
  ctx.restore();

  if (takeoff && t > 0.86) {
    drawSuccess("起飞成功");
  }
}

function drawStationBackground(trainType) {
  ctx.fillStyle = "#dbe8ef";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#506979";
  ctx.fillRect(0, canvas.height - 150, canvas.width, 150);
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(0, canvas.height - 198, canvas.width, 46);
  ctx.fillStyle = "#172632";
  ctx.fillRect(0, canvas.height - 152, canvas.width, 9);
  ctx.fillStyle = "#245b8f";
  ctx.font = "bold 22px system-ui";
  ctx.fillText(trainType === "fast" ? "高铁站台" : "地铁站台 platform", 26, 44);
}

function drawStationTrain(elapsed, mode) {
  drawStationBackground(mode);
  const go = mode === "go" || mode === "fast";
  const speed = mode === "fast" ? 0.34 : 0.24;
  const goT = go ? Math.min(1, elapsed * 0.00022) : 0;
  const x = go ? 180 + goT * canvas.width * speed * 4.2 : 180;
  const y = canvas.height - 240 - animationSprite.height * 0.52;
  const scale = Math.min(1.2, Math.max(0.55, 420 / animationSprite.width));
  const doorAmount = mode === "open" ? Math.min(1, elapsed * 0.0012) : mode === "close" || go ? Math.max(0, 1 - elapsed * 0.0016) : 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.drawImage(animationSprite, 0, 0);
  drawTrainDoors(animationSprite.width, animationSprite.height, doorAmount);
  ctx.restore();

  if (mode === "open" && doorAmount >= 1) drawSuccess("开门成功");
  if (mode === "close" && doorAmount <= 0.05 && elapsed > 800) drawSuccess("关门成功");
  if (go && goT >= 1) drawSuccess(mode === "fast" ? "高铁出发成功" : "地铁出发成功");
}

function drawTrainDoors(w, h, amount) {
  const doorW = Math.max(24, w * 0.12);
  const doorH = Math.max(40, h * 0.55);
  const doorY = h * 0.24;
  const center = w * 0.5;
  const gap = amount * doorW * 0.78;
  ctx.fillStyle = "rgba(230, 240, 244, 0.88)";
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = Math.max(2, w / 120);
  ctx.fillRect(center - doorW - gap, doorY, doorW, doorH);
  ctx.strokeRect(center - doorW - gap, doorY, doorW, doorH);
  ctx.fillRect(center + gap, doorY, doorW, doorH);
  ctx.strokeRect(center + gap, doorY, doorW, doorH);
}

function drawSuccess(text) {
  ctx.fillStyle = "rgba(255,250,240,0.92)";
  ctx.fillRect(canvas.width / 2 - 170, 78, 340, 74);
  ctx.fillStyle = "#172632";
  ctx.font = "bold 34px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, 126);
  ctx.textAlign = "left";
}

function stopAnimation(restore = true) {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  if (restore && animationBackground) {
    ctx.putImageData(animationBackground, 0, 0);
    statusEl.textContent = "动画停下来了。";
  }
  animationSprite = null;
  animationBackground = null;
  animationMode = null;
}

canvas.addEventListener("pointerdown", startDraw);
canvas.addEventListener("pointermove", moveDraw);
window.addEventListener("pointerup", stopDraw);
window.addEventListener("pointercancel", stopDraw);

colorPicker.addEventListener("input", () => {
  currentColor = colorPicker.value;
  tool = "pen";
  updateTools();
});

sizeRange.addEventListener("input", () => {
  brushSize = Number(sizeRange.value);
  updateTools();
});

penBtn.addEventListener("click", () => {
  tool = "pen";
  updateTools();
});

eraserBtn.addEventListener("click", () => {
  tool = "eraser";
  updateTools();
});

undoBtn.addEventListener("click", restoreLast);
clearBtn.addEventListener("click", clearCanvas);
walkBtn.addEventListener("click", () => startMode("walk"));
taxiBtn.addEventListener("click", () => startMode("taxi"));
takeoffBtn.addEventListener("click", () => startMode("takeoff"));
doorOpenBtn.addEventListener("click", () => startMode("doorOpen"));
doorCloseBtn.addEventListener("click", () => startMode("doorClose"));
metroGoBtn.addEventListener("click", () => startMode("metroGo"));
trainGoBtn.addEventListener("click", () => startMode("trainGo"));
stopWalkBtn.addEventListener("click", () => stopAnimation(true));
saveBtn.addEventListener("click", saveImage);

fillWhite();
saveHistory();
updateTools();
