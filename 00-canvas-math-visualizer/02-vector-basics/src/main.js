const canvas = document.querySelector("#vectorCanvas");
const ctx = canvas.getContext("2d");

const dprText = document.querySelector("#dprText");
const sizeText = document.querySelector("#sizeText");
const mouseVectorText = document.querySelector("#mouseVectorText");
const lengthText = document.querySelector("#lengthText");
const unitText = document.querySelector("#unitText");
const fixedVectorText = document.querySelector("#fixedVectorText");
const dotText = document.querySelector("#dotText");
const angleText = document.querySelector("#angleText");
const unitToggle = document.querySelector("#unitToggle");
const projectionToggle = document.querySelector("#projectionToggle");

class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector) {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  }

  scale(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  magnitude() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const length = this.magnitude();
    if (length === 0) return new Vector2(0, 0);
    return this.scale(1 / length);
  }

  dot(vector) {
    return this.x * vector.x + this.y * vector.y;
  }
}

const state = {
  width: 0,
  height: 0,
  dpr: 1,
  mouse: null,
  fixedVector: new Vector2(180, 70),
  showUnit: true,
  showProjection: true,
};

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  state.width = Math.max(1, Math.floor(rect.width));
  state.height = Math.max(1, Math.floor(rect.height));
  state.dpr = Math.max(1, window.devicePixelRatio || 1);

  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

  dprText.textContent = `DPR ${state.dpr.toFixed(2)}`;
  sizeText.textContent = `${state.width} x ${state.height}`;
  updatePanel();
  render();
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const source = event.touches?.[0] ?? event;

  return new Vector2(source.clientX - rect.left, source.clientY - rect.top);
}

function toMathVector(canvasPoint) {
  return new Vector2(
    canvasPoint.x - state.width / 2,
    state.height / 2 - canvasPoint.y
  );
}

function toCanvasPoint(mathVector) {
  return new Vector2(
    state.width / 2 + mathVector.x,
    state.height / 2 - mathVector.y
  );
}

function formatVector(vector) {
  if (!vector) return "-";
  return `(${vector.x.toFixed(1)}, ${vector.y.toFixed(1)})`;
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

function drawArrow(vector, color, label, width = 2) {
  const origin = new Vector2(state.width / 2, state.height / 2);
  const end = toCanvasPoint(vector);
  const direction = end.subtract(origin).normalize();
  const normal = new Vector2(-direction.y, direction.x);
  const headLength = 14;
  const headWidth = 7;
  const left = end
    .subtract(direction.scale(headLength))
    .add(normal.scale(headWidth));
  const right = end
    .subtract(direction.scale(headLength))
    .subtract(normal.scale(headWidth));

  drawLine(origin.x, origin.y, end.x, end.y, color, width);
  drawLine(end.x, end.y, left.x, left.y, color, width);
  drawLine(end.x, end.y, right.x, right.y, color, width);
  drawCircle(end.x, end.y, 4, color);

  ctx.font = "12px Cascadia Mono, Consolas, monospace";
  ctx.fillStyle = color;
  ctx.fillText(label, end.x + 10, end.y - 10);
}

function drawGrid() {
  const step = 40;
  const centerX = state.width / 2;
  const centerY = state.height / 2;

  for (let x = centerX % step; x <= state.width; x += step) {
    drawLine(x, 0, x, state.height, "#e5ded3");
  }

  for (let y = centerY % step; y <= state.height; y += step) {
    drawLine(0, y, state.width, y, "#e5ded3");
  }
}

function drawAxes() {
  const centerX = state.width / 2;
  const centerY = state.height / 2;

  drawLine(0, centerY, state.width, centerY, "#c43e3e", 2);
  drawLine(centerX, 0, centerX, state.height, "#286f54", 2);
  drawCircle(centerX, centerY, 4, "#171717");

  ctx.font = "12px Cascadia Mono, Consolas, monospace";
  ctx.fillStyle = "#171717";
  ctx.fillText("(0, 0)", centerX + 8, centerY - 8);
}

function drawUnitVector(mouseVector) {
  if (!state.showUnit) return;

  const unitVector = mouseVector.normalize();
  const visibleUnit = unitVector.scale(80);
  drawArrow(visibleUnit, "#d88719", "unit x 80", 2);
}

function drawProjection(mouseVector) {
  if (!state.showProjection) return;

  const fixedUnit = state.fixedVector.normalize();
  const projectionLength = mouseVector.dot(fixedUnit);
  const projection = fixedUnit.scale(projectionLength);
  const projectionPoint = toCanvasPoint(projection);
  const mousePoint = toCanvasPoint(mouseVector);

  drawLine(mousePoint.x, mousePoint.y, projectionPoint.x, projectionPoint.y, "#4e768b", 1);
  drawCircle(projectionPoint.x, projectionPoint.y, 5, "#4e768b");
}

function drawVectors() {
  drawArrow(state.fixedVector, "#7b4bb3", "fixed", 2);

  if (!state.mouse) return;

  drawArrow(state.mouse, "#1d5f8f", "mouse", 2.5);
  drawUnitVector(state.mouse);
  drawProjection(state.mouse);
}

function render() {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.fillStyle = "#fffdfa";
  ctx.fillRect(0, 0, state.width, state.height);

  drawGrid();
  drawAxes();
  drawVectors();
}

function angleBetween(vectorA, vectorB) {
  const lengthProduct = vectorA.magnitude() * vectorB.magnitude();
  if (lengthProduct === 0) return null;

  const cosine = Math.max(-1, Math.min(1, vectorA.dot(vectorB) / lengthProduct));
  return Math.acos(cosine) * 180 / Math.PI;
}

function updatePanel() {
  fixedVectorText.textContent = formatVector(state.fixedVector);

  if (!state.mouse) {
    mouseVectorText.textContent = "-";
    lengthText.textContent = "-";
    unitText.textContent = "-";
    dotText.textContent = "-";
    angleText.textContent = "-";
    return;
  }

  const unitVector = state.mouse.normalize();
  const dot = state.mouse.dot(state.fixedVector);
  const angle = angleBetween(state.mouse, state.fixedVector);

  mouseVectorText.textContent = formatVector(state.mouse);
  lengthText.textContent = state.mouse.magnitude().toFixed(2);
  unitText.textContent = formatVector(unitVector);
  dotText.textContent = dot.toFixed(2);
  angleText.textContent = angle === null ? "-" : `${angle.toFixed(1)} deg`;
}

function updateMouse(event) {
  event.preventDefault();
  state.mouse = toMathVector(getCanvasPoint(event));
  updatePanel();
  render();
}

function clearMouse() {
  state.mouse = null;
  updatePanel();
  render();
}

canvas.addEventListener("mousemove", updateMouse);
canvas.addEventListener("mouseleave", clearMouse);
canvas.addEventListener("touchstart", updateMouse, { passive: false });
canvas.addEventListener("touchmove", updateMouse, { passive: false });
canvas.addEventListener("touchend", clearMouse);

unitToggle.addEventListener("change", () => {
  state.showUnit = unitToggle.checked;
  render();
});

projectionToggle.addEventListener("change", () => {
  state.showProjection = projectionToggle.checked;
  render();
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
