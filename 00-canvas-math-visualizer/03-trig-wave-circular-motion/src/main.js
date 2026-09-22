const canvas = document.querySelector("#waveCanvas");
const ctx = canvas.getContext("2d");

const dprText = document.querySelector("#dprText");
const sizeText = document.querySelector("#sizeText");
const amplitudeInput = document.querySelector("#amplitudeInput");
const frequencyInput = document.querySelector("#frequencyInput");
const phaseInput = document.querySelector("#phaseInput");
const speedInput = document.querySelector("#speedInput");
const amplitudeValue = document.querySelector("#amplitudeValue");
const frequencyValue = document.querySelector("#frequencyValue");
const phaseValue = document.querySelector("#phaseValue");
const speedValue = document.querySelector("#speedValue");
const angleText = document.querySelector("#angleText");
const sinText = document.querySelector("#sinText");
const cosText = document.querySelector("#cosText");
const circleToggle = document.querySelector("#circleToggle");
const projectionToggle = document.querySelector("#projectionToggle");
const animateToggle = document.querySelector("#animateToggle");
const resetButton = document.querySelector("#resetButton");

const TAU = Math.PI * 2;

const state = {
  width: 0,
  height: 0,
  dpr: 1,
  amplitude: 80,
  frequency: 2,
  phase: 0,
  speed: 1,
  elapsed: 0,
  lastTime: 0,
  showCircle: true,
  showProjection: true,
  animate: true,
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
  render();
}

function readControls() {
  state.amplitude = Number(amplitudeInput.value);
  state.frequency = Number(frequencyInput.value);
  state.phase = Number(phaseInput.value);
  state.speed = Number(speedInput.value);
  state.showCircle = circleToggle.checked;
  state.showProjection = projectionToggle.checked;
  state.animate = animateToggle.checked;
}

function updatePanel(angle) {
  const normalizedAngle = ((angle % TAU) + TAU) % TAU;
  const degrees = normalizedAngle * 180 / Math.PI;

  amplitudeValue.textContent = `${state.amplitude.toFixed(0)} px`;
  frequencyValue.textContent = `${state.frequency.toFixed(2)} cycles`;
  phaseValue.textContent = `${state.phase.toFixed(2)} rad`;
  speedValue.textContent = `${state.speed.toFixed(1)} rad/s`;
  angleText.textContent = `${normalizedAngle.toFixed(2)} rad / ${degrees.toFixed(0)} deg`;
  sinText.textContent = Math.sin(normalizedAngle).toFixed(3);
  cosText.textContent = Math.cos(normalizedAngle).toFixed(3);
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
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawGrid() {
  const step = 40;

  for (let x = step; x < state.width; x += step) {
    drawLine(x, 0, x, state.height, "#e5ded3");
  }

  for (let y = step; y < state.height; y += step) {
    drawLine(0, y, state.width, y, "#e5ded3");
  }
}

function drawWaveArea(baselineY, waveStartX, waveEndX) {
  drawLine(waveStartX, baselineY, waveEndX, baselineY, "#5f665f", 1.5);

  ctx.font = "12px Cascadia Mono, Consolas, monospace";
  ctx.fillStyle = "#66615b";
  ctx.fillText("wave baseline", waveStartX, baselineY - 10);
}

function drawSineWave(baselineY, waveStartX, waveEndX, angle) {
  const waveWidth = waveEndX - waveStartX;

  ctx.beginPath();
  for (let x = waveStartX; x <= waveEndX; x += 2) {
    const progress = (x - waveStartX) / waveWidth;
    const waveAngle = progress * state.frequency * TAU + angle;
    const y = baselineY - Math.sin(waveAngle) * state.amplitude;

    if (x === waveStartX) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.strokeStyle = "#1d5f8f";
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function drawCircularMotion(centerX, centerY, angle) {
  if (!state.showCircle) return null;

  const radius = state.amplitude;
  const pointX = centerX + Math.cos(angle) * radius;
  const pointY = centerY - Math.sin(angle) * radius;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, TAU);
  ctx.strokeStyle = "#7b4bb3";
  ctx.lineWidth = 2;
  ctx.stroke();

  drawLine(centerX, centerY, pointX, pointY, "#7b4bb3", 2);
  drawCircle(centerX, centerY, 4, "#171717");
  drawCircle(pointX, pointY, 6, "#7b4bb3");

  ctx.font = "12px Cascadia Mono, Consolas, monospace";
  ctx.fillStyle = "#7b4bb3";
  ctx.fillText("circle point", pointX + 10, pointY - 10);

  return { x: pointX, y: pointY };
}

function drawProjection(circlePoint, waveStartX, baselineY) {
  if (!state.showProjection || !circlePoint) return;

  const wavePoint = {
    x: waveStartX,
    y: circlePoint.y,
  };

  ctx.save();
  ctx.setLineDash([6, 6]);
  drawLine(circlePoint.x, circlePoint.y, wavePoint.x, wavePoint.y, "#d88719", 1.5);
  drawLine(waveStartX, baselineY, wavePoint.x, wavePoint.y, "#d88719", 1.5);
  ctx.restore();

  drawCircle(wavePoint.x, wavePoint.y, 5, "#d88719");

  ctx.font = "12px Cascadia Mono, Consolas, monospace";
  ctx.fillStyle = "#d88719";
  ctx.fillText("sin(angle) x amplitude", wavePoint.x + 10, wavePoint.y - 10);
}

function render() {
  const angle = state.phase + state.elapsed * state.speed;
  const baselineY = state.height / 2;
  const padding = 48;
  const circleX = Math.max(state.width - 180, state.width * 0.72);
  const waveStartX = padding;
  const waveEndX = Math.max(waveStartX + 120, circleX - state.amplitude - 42);

  ctx.clearRect(0, 0, state.width, state.height);
  ctx.fillStyle = "#fffdfa";
  ctx.fillRect(0, 0, state.width, state.height);

  drawGrid();
  drawWaveArea(baselineY, waveStartX, waveEndX);
  drawSineWave(baselineY, waveStartX, waveEndX, angle);

  const circlePoint = drawCircularMotion(circleX, baselineY, angle);
  drawProjection(circlePoint, waveStartX, baselineY);
  updatePanel(angle);
}

function tick(timestamp) {
  if (state.lastTime === 0) {
    state.lastTime = timestamp;
  }

  const deltaSeconds = (timestamp - state.lastTime) / 1000;
  state.lastTime = timestamp;

  if (state.animate) {
    state.elapsed += deltaSeconds;
  }

  render();
  requestAnimationFrame(tick);
}

function handleControlInput() {
  readControls();
  render();
}

[
  amplitudeInput,
  frequencyInput,
  phaseInput,
  speedInput,
  circleToggle,
  projectionToggle,
  animateToggle,
].forEach((control) => {
  control.addEventListener("input", handleControlInput);
  control.addEventListener("change", handleControlInput);
});

resetButton.addEventListener("click", () => {
  state.elapsed = 0;
  state.phase = 0;
  phaseInput.value = "0";
  render();
});

window.addEventListener("resize", resizeCanvas);
readControls();
resizeCanvas();
requestAnimationFrame(tick);
