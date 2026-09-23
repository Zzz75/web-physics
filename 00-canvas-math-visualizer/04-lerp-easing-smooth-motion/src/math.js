export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function inverseLerp(start, end, value) {
  if (start === end) return 0;
  return (value - start) / (end - start);
}

export function easeInQuad(t) {
  return t * t;
}

export function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

export function easeInOutCubic(t) {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function smoothingAlpha(sharpness, deltaSeconds) {
  // 把“每帧靠近一点”改写成基于时间的比例，减少帧率差异。
  return 1 - Math.exp(-sharpness * deltaSeconds);
}
