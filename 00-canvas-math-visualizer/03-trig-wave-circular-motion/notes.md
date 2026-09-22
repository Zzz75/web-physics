# Day 03 Notes：三角函数、波和圆周运动

本节通过一个波形实验，把 `Math.sin()` 和 `Math.cos()` 从抽象公式转换为可观察的运动。前两节已经完成坐标系、鼠标坐标和向量箭头，本节继续使用 Canvas 作为数学黑板，观察圆周运动如何生成正弦波。

## 学习目标

完成本节后，应能理解并实现以下能力：

- 区分角度和弧度。
- 使用 `Math.sin()` 和 `Math.cos()` 计算圆周上的点。
- 用振幅控制波形上下摆动的范围。
- 用频率控制单位宽度内出现多少个周期。
- 用相位控制波形的水平偏移和动画进度。
- 把圆周运动中的 y 坐标投影到波形上，理解正弦波的来源。

最终要实现的效果是：画面左侧显示一条可调正弦波，右侧显示一个沿圆周运动的点；调整振幅、频率、相位和速度时，波形和圆周运动会同步变化。

## 第 1 步：建立最小可见结果

最小版本不需要先做动画，只要能画出一条静态正弦波即可。正弦波可以理解为：沿 x 方向前进时，不断把一个角度传给 `Math.sin()`，再把结果映射到 y 坐标。

```js
const baselineY = height / 2;
const amplitude = 80;

ctx.beginPath();
for (let x = 0; x <= width; x += 2) {
  const angle = x * 0.02;
  const y = baselineY - Math.sin(angle) * amplitude;

  if (x === 0) {
    ctx.moveTo(x, y);
  } else {
    ctx.lineTo(x, y);
  }
}
ctx.stroke();
```

这里的 `baselineY` 是波形的中线。`Math.sin(angle)` 的结果在 `-1` 到 `1` 之间变化，乘以 `amplitude` 后就得到上下摆动的像素距离。

需要注意 Canvas 的 y 轴向下增加。为了让 `sin(angle)` 为正时点向上移动，代码使用：

```js
const y = baselineY - Math.sin(angle) * amplitude;
```

如果写成加号，波形不会错，但会和数学坐标中的上下方向相反。

## 第 2 步：引入第一个问题：为什么要用弧度

初学时很容易写出这样的代码：

```js
Math.sin(90);
```

直觉上可能以为它会得到 `1`，因为 90 度的正弦值是 1。但 JavaScript 的三角函数使用弧度，不使用角度。90 度需要先转换为弧度：

```js
const radians = 90 * Math.PI / 180;
Math.sin(radians);
```

一整圈是 360 度，也就是 `2 * Math.PI` 弧度。代码中常把它保存为 `TAU`：

```js
const TAU = Math.PI * 2;
```

这样一个完整周期可以写成：

```js
const angle = progress * TAU;
```

其中 `progress` 从 `0` 增加到 `1`，表示一个周期从开始走到结束。

## 第 3 步：整理成振幅、频率和相位

当最小波形能画出来后，可以把公式拆成三个可调参数。

```js
const waveAngle = progress * frequency * TAU + phase;
const y = baselineY - Math.sin(waveAngle) * amplitude;
```

这三个参数分别负责不同问题：

- `amplitude`：控制波峰和波谷离中线多远。
- `frequency`：控制同一段宽度内出现多少个周期。
- `phase`：控制整条波当前走到周期中的哪一步。

此时可以给页面加入三个滑块，让每次输入变化都重新绘制画面。

```js
amplitudeInput.addEventListener("input", () => {
  amplitude = Number(amplitudeInput.value);
  render();
});
```

这一步体现了 Day 01 建立的 `render()` 思路：Canvas 不保存图形结构，参数变化后需要清屏并重画当前状态。

## 第 4 步：用圆周运动解释正弦波

正弦波不是凭空出现的。可以先画一个圆，再让一个点绕圆运动。

```js
const pointX = centerX + Math.cos(angle) * radius;
const pointY = centerY - Math.sin(angle) * radius;
```

这里 `cos` 负责水平位置，`sin` 负责垂直位置。由于 Canvas y 轴向下，垂直方向仍然使用减号。

当点绕圆转动时，它的 y 坐标会上下往复变化。把这个上下变化沿 x 方向展开，就得到正弦波。因此 demo 中右侧圆周点的高度，会和左侧波形起点的高度保持一致。

可以用一条辅助线把两者连起来：

```js
const wavePoint = {
  x: waveStartX,
  y: circlePoint.y,
};

drawLine(circlePoint.x, circlePoint.y, wavePoint.x, wavePoint.y, "#d88719");
```

这条线的作用是提示：圆周运动中的垂直投影，正是波形上的一个采样点。

## 第 5 步：引入状态和动画时间

静态相位只能手动拖动滑块。要让波形自己动起来，需要引入时间。

```js
const angle = phase + elapsed * speed;
```

这里的 `phase` 是手动设置的初始相位，`elapsed * speed` 是随时间增加的相位变化。`speed` 的单位可以理解为每秒增加多少弧度。

动画循环可以使用 `requestAnimationFrame()`：

```js
function tick(timestamp) {
  const deltaSeconds = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  elapsed += deltaSeconds;

  render();
  requestAnimationFrame(tick);
}
```

使用 `deltaSeconds` 的好处是动画和帧率解耦。帧率较高时每帧增加少一点，帧率较低时每帧增加多一点，整体速度更稳定。

## 第 6 步：加入调试信息

本节 demo 右侧会显示当前角度、`sin(angle)` 和 `cos(angle)`。这些数值能帮助观察公式和画面之间的对应关系。

```js
sinText.textContent = Math.sin(angle).toFixed(3);
cosText.textContent = Math.cos(angle).toFixed(3);
```

当圆周点在最上方时，`sin(angle)` 接近 `1`；当圆周点在最右侧时，`cos(angle)` 接近 `1`。这种对应关系比单独背公式更可靠。

## 常见问题

### 为什么传给 `Math.sin()` 的不是角度？

JavaScript 的三角函数使用弧度。角度是日常表达方式，弧度是用圆半径衡量弧长的数学表达方式。一整圈是 `2 * Math.PI` 弧度。

### 为什么频率太高时波形看起来断裂？

Canvas 画线是离散采样。本节代码每隔 2 像素计算一次波形点。如果频率很高，相邻采样点之间变化过大，线段连接后就会显得不够平滑。可以减少步长，例如从 `x += 2` 改成 `x += 1`，但绘制成本也会增加。

### 为什么相位变化会让波左右移动？

相位是在角度公式里整体加上的偏移：

```js
angle = progress * frequency * TAU + phase;
```

当 `phase` 增加时，同一个 x 位置会取到更靠后的周期状态，因此整条波看起来像在水平移动。

### 为什么圆周点和波形点上下方向容易写反？

数学坐标中 y 向上增加，Canvas 中 y 向下增加。因此把正弦值转换为 Canvas y 坐标时，需要使用：

```js
y = baselineY - sinValue * amplitude;
```

## 本节小结

- `Math.sin()` 和 `Math.cos()` 接收弧度。
- `amplitude` 控制波形高度。
- `frequency` 控制周期密度。
- `phase` 控制波形当前处于周期中的位置。
- 圆周运动的垂直投影可以生成正弦波。
- 动画中的相位可以由时间持续推进。

## 下一节方向

- 使用 `lerp(a, b, t)` 描述从 A 到 B 的线性过渡。
- 对比立即跟随、固定时长插值和指数平滑。
- 观察 easing 曲线如何改变运动节奏。
