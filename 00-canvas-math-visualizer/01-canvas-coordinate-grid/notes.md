# Day 01 Notes：Canvas 坐标和绘图基础

本节通过一个逐步完成的 Canvas 坐标网格示例，学习 Canvas 的基础绘图流程、尺寸处理、坐标换算和鼠标交互。教材不会直接给出最终代码，而是按照初学者自然接触 Canvas 的顺序，从最小可见结果开始，一步一步引入新的问题和对应的改进。

## 学习目标

完成本节后，应能理解并实现以下能力：

- 使用 Canvas 2D Context 绘制基础图形。
- 区分 Canvas 的 CSS 显示尺寸和真实绘图缓冲区尺寸。
- 将浏览器鼠标坐标转换为 Canvas 坐标。
- 将 Canvas 左上角坐标系转换为中心原点的数学坐标系。
- 在高清屏上保持 Canvas 绘制清晰。
- 使用状态和 `render()` 函数组织一次完整重绘。

最终要实现的效果是：画布中心显示数学坐标轴，鼠标移动时显示当前位置的 Canvas 坐标和数学坐标。

## 第 1 步：确认 Canvas 可以绘制

学习 Canvas 的第一步不是立刻画完整坐标系，而是先确认页面中的 `canvas` 元素和绘图上下文可用。

```js
const canvas = document.querySelector("#mathCanvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "#fffdfa";
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

这段代码只做一件事：给画布填充背景色。只要背景色能显示，就说明 Canvas 的基础连接已经成功。

此时需要建立第一个重要概念：Canvas 有两套尺寸。

- CSS 尺寸：元素在页面中显示出来的大小。
- 绘图缓冲区尺寸：`canvas.width` 和 `canvas.height` 对应的实际像素画布。

初学阶段常见的问题是只设置 CSS 的 `width` 和 `height`，却没有同步 `canvas.width` 和 `canvas.height`。这样会导致绘图坐标和视觉尺寸不一致。

## 第 2 步：画出第一条坐标轴

确认 Canvas 能绘制后，可以先画一条横向坐标轴。这个阶段不需要封装函数，重点是熟悉 Canvas 的路径绘制流程。

```js
ctx.beginPath();
ctx.moveTo(0, canvas.height / 2);
ctx.lineTo(canvas.width, canvas.height / 2);
ctx.strokeStyle = "#c43e3e";
ctx.lineWidth = 2;
ctx.stroke();
```

Canvas 画线通常包含几个固定动作：

1. `beginPath()` 开始一条新路径。
2. `moveTo()` 移动画笔到起点。
3. `lineTo()` 添加终点。
4. 设置线条样式。
5. `stroke()` 真正把线画出来。

此时如果画布在页面中是响应式尺寸，就会出现一个新问题：`canvas.height / 2` 使用的是绘图缓冲区高度，不一定等于页面中看到的高度的一半。

因此需要增加一个 `resizeCanvas()`，让 Canvas 的真实尺寸跟随页面显示尺寸。

```js
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;

  render();
}
```

这个阶段先解决“画布大小对齐”的问题，高清屏适配稍后再处理。

## 第 3 步：把重复绘制整理成函数

当开始绘制 x 轴、y 轴和网格线时，直接重复书写 `beginPath()`、`moveTo()`、`lineTo()` 会让代码很快变乱。此时适合抽出一个最小绘图函数。

```js
function drawLine(x1, y1, x2, y2, color, width = 1) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}
```

有了 `drawLine()` 后，绘制两条坐标轴会更清楚。

```js
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

drawLine(0, centerY, canvas.width, centerY, "#c43e3e", 2);
drawLine(centerX, 0, centerX, canvas.height, "#286f54", 2);
```

这一步得到的是一个位于画布中心的十字轴。不过它仍然只是 Canvas 坐标中的图形，还没有完成数学坐标系的换算。

## 第 4 步：理解 Canvas 坐标和数学坐标的区别

浏览器鼠标事件提供的是视口坐标。例如 `event.clientX` 和 `event.clientY` 表示鼠标相对于浏览器窗口左上角的位置。要得到鼠标在 Canvas 内部的位置，需要减去 Canvas 元素本身的边界位置。

```js
function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}
```

这个函数得到的是 Canvas 坐标：

- 原点在左上角。
- x 向右增加。
- y 向下增加。

数学坐标通常希望：

- 原点在画布中心。
- x 向右增加。
- y 向上增加。

因此需要增加一个坐标转换函数。

```js
function toMathPoint(point, canvasWidth, canvasHeight) {
  return {
    x: point.x - canvasWidth / 2,
    y: canvasHeight / 2 - point.y,
  };
}
```

这里最容易出错的是 y 轴。Canvas 的 y 轴向下增加，而数学坐标的 y 轴向上增加，所以不能写成：

```js
y: point.y - canvasHeight / 2
```

正确写法应当是：

```js
y: canvasHeight / 2 - point.y
```

判断是否写对的简单方法是：鼠标向上移动时，数学 y 值应该变大。

## 第 5 步：引入状态对象

代码继续增长后，画布宽度、高度、DPR、鼠标位置和开关状态都会被多个函数使用。把这些值散落在不同变量中不利于维护，因此可以引入统一的状态对象。

```js
const state = {
  width: 0,
  height: 0,
  dpr: 1,
  mouse: null,
  showGrid: true,
  showLabels: true,
};
```

状态对象的作用不是增加复杂度，而是让所有绘制函数都基于同一份当前状态工作。

接下来可以建立统一的 `render()` 函数。

```js
function render() {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.fillStyle = "#fffdfa";
  ctx.fillRect(0, 0, state.width, state.height);

  drawGrid();
  drawAxes();
  drawMousePoint();
}
```

Canvas 是立即绘制模式。画到画布上的内容只是像素，不会像 DOM 元素那样保留结构。因此，当状态变化时，通常要清空画布并重新绘制当前画面。

## 第 6 步：处理高清屏 DPR

前面的版本可以正常运行，但在高清屏上可能出现模糊。原因是 CSS 像素和设备物理像素并不总是 1:1。高清屏上，一个 CSS 像素可能对应多个物理像素。

解决方式是在调整画布尺寸时，把真实绘图缓冲区放大到 CSS 尺寸乘以 `devicePixelRatio`。

```js
const rect = canvas.getBoundingClientRect();
const dpr = window.devicePixelRatio || 1;

state.width = Math.floor(rect.width);
state.height = Math.floor(rect.height);
state.dpr = Math.max(1, dpr);

canvas.width = Math.floor(state.width * state.dpr);
canvas.height = Math.floor(state.height * state.dpr);
ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
```

这段代码包含两个关键动作：

- `canvas.width` 和 `canvas.height` 使用更高的真实像素尺寸。
- `ctx.setTransform()` 把后续绘图坐标重新映射回 CSS 像素。

这样后续绘图仍然可以使用 `state.width` 和 `state.height` 作为普通 CSS 像素尺寸，不需要在每一次绘制时手动乘以 DPR。

## 第 7 步：用鼠标事件驱动画面更新

最后一步是把鼠标移动接入状态和重绘流程。鼠标移动时，先计算 Canvas 坐标，再计算数学坐标，最后触发重绘。

```js
function updateMouse(event) {
  event.preventDefault();
  state.mouse = getCanvasPoint(event);
  canvasPointText.textContent = formatPoint(state.mouse);
  mathPointText.textContent = formatPoint(toMathPoint(state.mouse));
  render();
}

canvas.addEventListener("mousemove", updateMouse);
canvas.addEventListener("mouseleave", clearMouse);
```

完整交互流程如下：

1. 浏览器触发鼠标事件。
2. `getCanvasPoint()` 把视口坐标转换为 Canvas 坐标。
3. `toMathPoint()` 把 Canvas 坐标转换为数学坐标。
4. 页面文本显示两套坐标。
5. `render()` 清空画布并重画网格、坐标轴和鼠标点。

到这里，一个从静态画布逐步演进出来的坐标网格就完成了。

## 最终代码结构

最终代码可以分为几个职责清晰的小部分：

- `resizeCanvas()`：同步 CSS 尺寸、真实像素尺寸和 DPR。
- `getCanvasPoint()`：把浏览器事件坐标转换为 Canvas 坐标。
- `toMathPoint()`：把 Canvas 坐标转换为数学坐标。
- `drawGrid()` / `drawAxes()` / `drawMousePoint()`：负责具体绘制。
- `render()`：负责统一清屏和重绘。

这些函数不是一开始就必须全部设计好。更适合初学者的方式是：先写出能看见的最小结果，再在遇到重复、尺寸错误、坐标混乱和高清模糊时逐步整理代码。

## 常见问题

### Canvas 在高清屏上模糊

只设置 CSS 宽高时，Canvas 的实际绘图缓冲区可能太小。应在 `resizeCanvas()` 中把 `canvas.width` 和 `canvas.height` 设置为 CSS 尺寸乘以 `devicePixelRatio`。

### 窗口缩放后坐标不准

窗口 resize 后，Canvas 的显示尺寸会发生变化。应重新读取 `getBoundingClientRect()`，更新 `state.width` 和 `state.height`，然后重新绘制。

### y 轴方向和数学直觉相反

Canvas 的 y 坐标向下增加。转换到数学坐标时，需要使用：

```js
mathY = canvasHeight / 2 - canvasY;
```

## 本节小结

- Canvas 是立即绘制模式，画面变化通常需要清空后重画。
- Canvas 的 CSS 显示尺寸和真实绘图缓冲区尺寸是两套概念。
- 鼠标位置需要先从浏览器视口坐标转换为 Canvas 坐标。
- 数学坐标系需要把原点移动到中心，并反转 y 轴方向。
- 渐进式编码的重点是让每一步都解决一个明确问题，而不是一开始追求完整架构。

## 下一节方向

- 将绘图工具函数拆分到 `draw.js`。
- 将坐标换算逻辑拆分到 `canvas.js`。
- 引入 `Vector2`，把“从原点到鼠标”的连线升级为真正的向量箭头。
