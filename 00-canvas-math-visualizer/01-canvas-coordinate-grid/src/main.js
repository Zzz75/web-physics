const canvas = document.querySelector("#mathCanvas");
const ctx = canvas.getContext("2d");

const canvasPointText = document.querySelector("#canvasPoint");
const mathPointText = document.querySelector("#mathPoint");
const dprText = document.querySelector("#dprText");
const sizeText = document.querySelector("#sizeText");
const gridToggle = document.querySelector("#gridToggle");
const labelToggle = document.querySelector("#labelToggle");

const state = {
  width: 0,
  height: 0,
  dpr: 1,
  mouse: null,
  showGrid: true,
  showLabels: true,
};

/**
 * 根据 CSS 尺寸和 DPR 设置真实像素尺寸。
 * 关键点：canvas.width / height 是绘图缓冲区尺寸，style 尺寸是页面显示尺寸。
 */
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  state.width = Math.max(1, Math.floor(rect.width));
  state.height = Math.max(1, Math.floor(rect.height));
  state.dpr = Math.max(1, window.devicePixelRatio || 1);

  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);

  // 把绘图坐标重新映射回 CSS 像素，避免后续所有绘制都手动乘 DPR。
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

  dprText.textContent = `DPR ${state.dpr.toFixed(2)}`;
  sizeText.textContent = `${state.width} x ${state.height}`;
  render();
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const source = event.touches?.[0] ?? event;

  return {
    x: source.clientX - rect.left,
    y: source.clientY - rect.top,
  };
}

/**
 * Canvas 坐标转数学坐标。
 * Canvas 原点在左上角，y 向下；这里把原点移到中心，y 改成向上。
 */
function toMathPoint(point) {
  return {
    x: point.x - state.width / 2,
    y: state.height / 2 - point.y,
  };
}

function formatPoint(point) {
  if (!point) return "-";
  return `(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`;
}

function drawLine(x1, y1, x2, y2, color, width = 1) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawGrid() {
  if (!state.showGrid) return;

  const step = 40;
  const centerX = state.width / 2;
  const centerY = state.height / 2;

  ctx.strokeStyle = "#e5ded3";
  ctx.lineWidth = 1;

  // 竖向网格线从中心向两侧扩散，方便观察数学原点。
  for (let x = centerX % step; x <= state.width; x += step) {
    drawLine(x, 0, x, state.height, "#e5ded3");
  }

  // 横向网格线从中心向上下扩散。
  for (let y = centerY % step; y <= state.height; y += step) {
    drawLine(0, y, state.width, y, "#e5ded3");
  }
}

function drawAxes() {
  const centerX = state.width / 2;
  const centerY = state.height / 2;

  drawLine(0, centerY, state.width, centerY, "#c43e3e", 2);
  drawLine(centerX, 0, centerX, state.height, "#286f54", 2);

  // x 轴箭头指向右，y 轴数学正方向指向上。
  drawLine(state.width - 18, centerY - 6, state.width - 6, centerY, "#c43e3e", 2);
  drawLine(state.width - 18, centerY + 6, state.width - 6, centerY, "#c43e3e", 2);
  drawLine(centerX - 6, 18, centerX, 6, "#286f54", 2);
  drawLine(centerX + 6, 18, centerX, 6, "#286f54", 2);

  drawCircle(centerX, centerY, 4, "#171717");

  if (!state.showLabels) return;
  ctx.font = "12px Cascadia Mono, Consolas, monospace";
  ctx.fillStyle = "#c43e3e";
  ctx.fillText("+x", state.width - 28, centerY - 12);
  ctx.fillStyle = "#286f54";
  ctx.fillText("+y", centerX + 10, 20);
  ctx.fillStyle = "#171717";
  ctx.fillText("(0, 0)", centerX + 8, centerY - 8);
}

function drawMousePoint() {
  if (!state.mouse) return;

  const mathPoint = toMathPoint(state.mouse);
  const centerX = state.width / 2;
  const centerY = state.height / 2;

  drawLine(centerX, centerY, state.mouse.x, state.mouse.y, "#1d5f8f", 1.5);
  drawCircle(state.mouse.x, state.mouse.y, 6, "#d88719");

  if (!state.showLabels) return;
  ctx.font = "12px Cascadia Mono, Consolas, monospace";
  ctx.fillStyle = "#171717";
  ctx.fillText(
    `math ${formatPoint(mathPoint)}`,
    Math.min(state.mouse.x + 12, state.width - 150),
    Math.max(state.mouse.y - 12, 18)
  );
}

function render() {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.fillStyle = "#fffdfa";
  ctx.fillRect(0, 0, state.width, state.height);

  drawGrid();
  drawAxes();
  drawMousePoint();
}

function updateMouse(event) {
  event.preventDefault();
  state.mouse = getCanvasPoint(event);
  canvasPointText.textContent = formatPoint(state.mouse);
  mathPointText.textContent = formatPoint(toMathPoint(state.mouse));
  render();
}

function clearMouse() {
  state.mouse = null;
  canvasPointText.textContent = "-";
  mathPointText.textContent = "-";
  render();
}

canvas.addEventListener("mousemove", updateMouse);
canvas.addEventListener("mouseleave", clearMouse);
canvas.addEventListener("touchstart", updateMouse, { passive: false });
canvas.addEventListener("touchmove", updateMouse, { passive: false });
canvas.addEventListener("touchend", clearMouse);

gridToggle.addEventListener("change", () => {
  state.showGrid = gridToggle.checked;
  render();
});

labelToggle.addEventListener("change", () => {
  state.showLabels = labelToggle.checked;
  render();
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
