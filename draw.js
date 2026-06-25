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
const stopWalkBtn = document.querySelector("#stopWalkBtn");
const saveBtn = document.querySelector("#saveBtn");

const colors = ["#d93a32", "#245b8f", "#39a657", "#ffd15f", "#172632", "#ffffff", "#d94a78", "#7b4bb8", "#ff8a2f", "#57c7d4", "#8b5a2b", "#000000"];
let currentColor = "#d93a32";
let brushSize = 12;
let tool = "pen";
let drawing = false;
let lastPoint = null;
let history = [];
let walkFrame = null;
let walkSprite = null;
let walkBackground = null;
let walkStart = 0;

function fillWhite() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function saveHistory() {
  stopWalk(false);
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
  stopWalk(false);
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

function startWalk() {
  stopWalk(false);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bounds = findDrawingBounds(imageData);
  if (!bounds || bounds.w < 8 || bounds.h < 8) {
    statusEl.textContent = "先画一个小人，再点小人走路。";
    return;
  }

  saveHistory();
  walkBackground = ctx.getImageData(0, 0, canvas.width, canvas.height);
  walkSprite = makeTransparentSprite(imageData, bounds);
  fillWhite();
  walkStart = performance.now();
  statusEl.textContent = "小人开始走路了。";
  animateWalk();
}

function animateWalk(time = performance.now()) {
  if (!walkSprite) return;
  const elapsed = time - walkStart;
  const walkWidth = Math.max(1, canvas.width - walkSprite.width - 40);
  const progress = (elapsed * 0.00016) % 2;
  const goingRight = progress < 1;
  const t = goingRight ? progress : 2 - progress;
  const x = 20 + walkWidth * t;
  const groundY = canvas.height - walkSprite.height - 42;
  const bob = Math.sin(elapsed * 0.012) * 10;
  const step = Math.sin(elapsed * 0.018);

  fillWhite();
  ctx.save();
  ctx.translate(x + walkSprite.width / 2, groundY + bob + walkSprite.height / 2);
  if (!goingRight) ctx.scale(-1, 1);
  ctx.drawImage(walkSprite, -walkSprite.width / 2, -walkSprite.height / 2);
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = Math.max(4, Math.min(12, walkSprite.width / 18));
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-walkSprite.width * 0.15, walkSprite.height * 0.38);
  ctx.lineTo(-walkSprite.width * 0.24 - step * 12, walkSprite.height * 0.5);
  ctx.moveTo(walkSprite.width * 0.15, walkSprite.height * 0.38);
  ctx.lineTo(walkSprite.width * 0.24 + step * 12, walkSprite.height * 0.5);
  ctx.stroke();
  ctx.restore();

  walkFrame = requestAnimationFrame(animateWalk);
}

function stopWalk(restore = true) {
  if (walkFrame) {
    cancelAnimationFrame(walkFrame);
    walkFrame = null;
  }
  if (restore && walkBackground) {
    ctx.putImageData(walkBackground, 0, 0);
    statusEl.textContent = "小人停下来了。";
  }
  walkSprite = null;
  walkBackground = null;
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
walkBtn.addEventListener("click", startWalk);
stopWalkBtn.addEventListener("click", () => stopWalk(true));
saveBtn.addEventListener("click", saveImage);

fillWhite();
saveHistory();
updateTools();
