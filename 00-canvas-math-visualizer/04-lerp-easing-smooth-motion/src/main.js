import {
  clamp,
  easeInQuad,
  easeInOutCubic,
  easeOutQuad,
  lerp,
  inverseLerp,
  smoothingAlpha,
} from "./math.js";

const canvas = document.querySelector("#motionCanvas");
const ctx = canvas.getContext("2d");

const dprText = document.querySelector("#dprText");
const sizeText = document.querySelector("#sizeText");
const fpsText = document.querySelector("#fpsText");
const durationInput = document.querySelector("#durationInput");
const smoothnessInput = document.querySelector("#smoothnessInput");
const easingSelect = document.querySelector("#easingSelect");
const durationValue = document.querySelector("#durationValue");
const smoothnessValue = document.querySelector("#smoothnessValue");
const curvesToggle = document.querySelector("#curvesToggle");
const trailsToggle = document.querySelector("#trailsToggle");
const resetButton = document.querySelector("#resetButton");
const targetText = document.querySelector("#targetText");
const progressText = document.querySelector("#progressText");
const easedText = document.querySelector("#easedText");
const alphaText = document.querySelector("#alphaText");

const easingFunctions = { linear: (t) => t, easeInQuad, easeOutQuad, easeInOutCubic };
const colors = {
  immediate: "#c43e3e",
  duration: "#1d5f8f",
  smooth: "#286f54",
  curve: "#7b4bb3",
  grid: "#e5ded3",
  ink: "#171717",
  muted: "#66615b",
};

const state = {
  width: 0,
  height: 0,
  dpr: 1,
  target: { x: 0, y: 0 },
  immediate: { x: 0, y: 0 },
  duration: { x: 0, y: 0 },
  smooth: { x: 0, y: 0 },
  durationStart: { x: 0, y: 0 },
  durationTarget: { x: 0, y: 0 },
  durationElapsed: 0,
  durationSeconds: 0.8,
  smoothness: 7,
  easing: "linear",
  showCurves: true,
  showTrails: true,
  trail: { immediate: [], duration: [], smooth: [] },
  lastTime: 0,
  fps: 0,
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
  // 尺寸变化后重置到可见区域，旧轨迹使用的是旧画布的像素坐标。
  resetMotion();
  updatePanel(1, 1, 0);
  render();
}

function readControls() {
  state.durationSeconds = Number(durationInput.value);
  state.smoothness = Number(smoothnessInput.value);
  state.easing = easingSelect.value;
  state.showCurves = curvesToggle.checked;
  state.showTrails = trailsToggle.checked;
  durationValue.textContent = `${state.durationSeconds.toFixed(1)} s`;
  smoothnessValue.textContent = `${state.smoothness.toFixed(1)} /s`;
}

function copyPoint(point) {
  return { x: point.x, y: point.y };
}

function resetMotion(point = { x: state.width / 2, y: state.height * 0.6 }) {
  state.target = copyPoint(point);
  state.immediate = copyPoint(point);
  state.duration = copyPoint(point);
  state.smooth = copyPoint(point);
  state.durationStart = copyPoint(point);
  state.durationTarget = copyPoint(point);
  state.durationElapsed = state.durationSeconds;
  state.trail = { immediate: [], duration: [], smooth: [] };
}

function setTarget(point) {
  const nextTarget = {
    x: clamp(point.x, 20, state.width - 20),
    y: clamp(point.y, state.height / 2 + 20, state.height - 20),
  };
  if (nextTarget.x === state.target.x && nextTarget.y === state.target.y) return;
  state.target = nextTarget;
  state.durationStart = copyPoint(state.duration);
  state.durationTarget = copyPoint(nextTarget);
  state.durationElapsed = 0;
  state.immediate = copyPoint(nextTarget);
}

function update(deltaSeconds) {
  state.immediate = copyPoint(state.target);

  state.durationElapsed = Math.min(
    state.durationElapsed + deltaSeconds,
    state.durationSeconds,
  );
  const progress = clamp(
    inverseLerp(0, state.durationSeconds, state.durationElapsed),
    0,
    1,
  );
  const easedProgress = easingFunctions[state.easing](progress);
  state.duration = {
    x: lerp(state.durationStart.x, state.durationTarget.x, easedProgress),
    y: lerp(state.durationStart.y, state.durationTarget.y, easedProgress),
  };

  const alpha = smoothingAlpha(state.smoothness, deltaSeconds);
  state.smooth.x = lerp(state.smooth.x, state.target.x, alpha);
  state.smooth.y = lerp(state.smooth.y, state.target.y, alpha);

  if (state.showTrails) {
    for (const [name, point] of Object.entries({
      immediate: state.immediate,
      duration: state.duration,
      smooth: state.smooth,
    })) {
      state.trail[name].push(copyPoint(point));
      if (state.trail[name].length > 180) state.trail[name].shift();
    }
  }

  updatePanel(progress, easedProgress, alpha);
}

function updatePanel(progress, easedProgress, alpha) {
  targetText.textContent = `(${state.target.x.toFixed(0)}, ${state.target.y.toFixed(0)})`;
  progressText.textContent = progress.toFixed(3);
  easedText.textContent = easedProgress.toFixed(3);
  alphaText.textContent = alpha.toFixed(3);
}

function drawLine(x1, y1, x2, y2, color, width = 1) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawPoint(point, color, radius = 6) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawGrid() {
  const step = 40;
  for (let x = step; x < state.width; x += step) drawLine(x, 0, x, state.height, colors.grid);
  for (let y = step; y < state.height; y += step) drawLine(0, y, state.width, y, colors.grid);
  drawLine(0, state.height / 2, state.width, state.height / 2, "#b8b0a5", 1.5);
}

function drawTrail(points, color) {
  if (points.length < 2) return;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawFollower(point, color, label, radius, labelOffset) {
  drawPoint(point, color, radius);
  ctx.font = "12px Cascadia Mono, Consolas, monospace";
  ctx.fillStyle = color;
  const labelX = clamp(point.x + 14, 8, state.width - ctx.measureText(label).width - 8);
  ctx.fillText(label, labelX, point.y + labelOffset);
}

function drawEasingCurves() {
  if (!state.showCurves) return;
  const box = { x: 24, y: 24, width: 190, height: 130 };
  ctx.strokeStyle = "#cfc7bc";
  ctx.lineWidth = 1;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  drawLine(box.x, box.y + box.height, box.x + box.width, box.y + box.height, colors.muted);
  drawLine(box.x, box.y, box.x, box.y + box.height, colors.muted);

  for (const [name, easing] of Object.entries(easingFunctions)) {
    ctx.beginPath();
    for (let i = 0; i <= 60; i += 1) {
      const t = i / 60;
      const value = easing(t);
      const x = box.x + t * box.width;
      const y = box.y + box.height - value * box.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = name === state.easing ? colors.curve : "#aaa298";
    ctx.lineWidth = name === state.easing ? 3 : 1;
    ctx.stroke();
  }
  ctx.font = "11px Cascadia Mono, Consolas, monospace";
  ctx.fillStyle = colors.muted;
  ctx.fillText(state.easing, box.x + 8, box.y + 16);
  ctx.fillText("0", box.x - 2, box.y + box.height + 14);
  ctx.fillText("1", box.x + box.width - 4, box.y + box.height + 14);
}

function render() {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.fillStyle = "#fffdfa";
  ctx.fillRect(0, 0, state.width, state.height);
  drawGrid();
  drawEasingCurves();

  if (state.showTrails) {
    drawTrail(state.trail.immediate, colors.immediate);
    drawTrail(state.trail.duration, colors.duration);
    drawTrail(state.trail.smooth, colors.smooth);
  }

  drawLine(state.target.x - 10, state.target.y, state.target.x + 10, state.target.y, colors.ink, 1.5);
  drawLine(state.target.x, state.target.y - 10, state.target.x, state.target.y + 10, colors.ink, 1.5);
  ctx.font = "12px Cascadia Mono, Consolas, monospace";
  ctx.fillStyle = colors.ink;
  drawFollower(state.immediate, colors.immediate, "immediate", 10, -36);
  drawFollower(state.duration, colors.duration, "fixed duration", 7, -22);
  drawFollower(state.smooth, colors.smooth, "exponential", 4, -8);
}

function tick(timestamp) {
  if (state.lastTime === 0) state.lastTime = timestamp;
  const deltaSeconds = Math.min((timestamp - state.lastTime) / 1000, 0.1);
  state.lastTime = timestamp;
  if (deltaSeconds > 0) state.fps = 1 / deltaSeconds;
  fpsText.textContent = `${state.fps.toFixed(0)} FPS`;
  update(deltaSeconds);
  render();
  requestAnimationFrame(tick);
}

function handlePointer(event) {
  const rect = canvas.getBoundingClientRect();
  if (event.clientY - rect.top < rect.height / 2) return;
  setTarget({
    x: (event.clientX - rect.left) * state.width / rect.width,
    y: (event.clientY - rect.top) * state.height / rect.height,
  });
}
canvas.addEventListener("pointermove", handlePointer);
canvas.addEventListener("pointerdown", handlePointer);
canvas.addEventListener("keydown", (event) => {
  const directions = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] };
  const direction = directions[event.key];
  if (!direction) return;
  event.preventDefault();
  setTarget({ x: state.target.x + direction[0], y: state.target.y + direction[1] });
});

[durationInput, smoothnessInput, easingSelect, curvesToggle, trailsToggle].forEach((control) => {
  control.addEventListener("input", () => {
    readControls();
    if (control === durationInput || control === easingSelect) {
      state.durationStart = copyPoint(state.duration);
      state.durationElapsed = 0;
    }
    if (control === trailsToggle) state.trail = { immediate: [], duration: [], smooth: [] };
    render();
  });
});

resetButton.addEventListener("click", () => {
  resetMotion();
  updatePanel(1, 1, 0);
  render();
});

window.addEventListener("resize", resizeCanvas);
document.addEventListener("visibilitychange", () => { state.lastTime = 0; });
readControls();
resizeCanvas();
requestAnimationFrame(tick);
