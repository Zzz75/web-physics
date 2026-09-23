import test from "node:test";
import assert from "node:assert/strict";

import {
  clamp,
  easeInOutCubic,
  easeInQuad,
  easeOutQuad,
  inverseLerp,
  lerp,
  smoothingAlpha,
} from "./math.js";

test("clamp 将数值限制在指定区间", () => {
  assert.equal(clamp(-2, 0, 1), 0);
  assert.equal(clamp(0.4, 0, 1), 0.4);
  assert.equal(clamp(3, 0, 1), 1);
});

test("lerp 和 inverseLerp 可以在数值与进度之间转换", () => {
  assert.equal(lerp(10, 30, 0.25), 15);
  assert.equal(inverseLerp(10, 30, 15), 0.25);
  assert.equal(inverseLerp(10, 10, 15), 0);
});

test("easing 曲线保留 0 和 1 两个端点", () => {
  for (const easing of [easeInQuad, easeOutQuad, easeInOutCubic]) {
    assert.equal(easing(0), 0);
    assert.equal(easing(1), 1);
  }
});

test("三种 easing 在中段表现出不同节奏", () => {
  assert.ok(easeInQuad(0.25) < 0.25);
  assert.ok(easeOutQuad(0.25) > 0.25);
  assert.equal(easeInOutCubic(0.5), 0.5);
});

test("基于时间的指数平滑在不同帧切分下得到相同结果", () => {
  const advance = (value, target, deltaSeconds) => {
    return lerp(value, target, smoothingAlpha(8, deltaSeconds));
  };

  const oneFrame = advance(0, 100, 1 / 30);
  const firstHalf = advance(0, 100, 1 / 60);
  const twoFrames = advance(firstHalf, 100, 1 / 60);

  assert.ok(Math.abs(oneFrame - twoFrames) < 1e-10);
});
