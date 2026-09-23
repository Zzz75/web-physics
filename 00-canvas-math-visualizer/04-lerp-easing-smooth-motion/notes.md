# Day 04 Notes：Lerp、Easing 和平滑运动

本节通过一个鼠标跟随实验，比较“立即到达”“固定时长过渡”和“指数平滑”三种运动方式。重点不是记住某个动画函数，而是观察同一个目标位置如何因为更新规则不同而产生不同的运动节奏。

## 学习目标

完成本节后，应能：

- 用 `lerp(a, b, t)` 在两个数值之间插值。
- 用 `inverseLerp(a, b, value)` 把数值转换为进度。
- 用 `clamp()` 保证进度停留在 `0` 到 `1`。
- 区分固定时长插值和指数平滑。
- 使用 easing 函数改变“前进速度”，而不改变起点和终点。
- 理解为什么基于帧数的平滑会受到帧率影响，以及如何用 `deltaSeconds` 修正。

页面中有三个跟随点：红色点立即到达目标，蓝色点在设定时长内完成一次过渡，绿色点使用指数平滑持续靠近目标。移动画布中的指针即可改变目标位置。

## 运行方式与文件入口

在仓库根目录启动静态服务器，例如已安装 Python 时执行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8000/00-canvas-math-visualizer/04-lerp-easing-smooth-motion/`。页面使用 ES Modules，需要通过 HTTP 加载，直接双击 HTML 可能因浏览器模块访问限制而失败。

- [index.html](./index.html)：画布、参数和调试面板。
- [src/math.js](./src/math.js)：不依赖 Canvas 的数学工具。
- [src/main.js](./src/main.js)：输入、状态更新和绘制。
- [src/math.test.mjs](./src/math.test.mjs)：使用 Node 内置测试验证数学关系。

下面各阶段的片段用于逐步理解核心思路；完整事件绑定和初始化以 `src/main.js` 为准。

## 第 1 步：建立最小可见结果

最小版本只需要一个目标点和一个跟随点。目标点可以用十字线表示，跟随点直接复制目标坐标：

```js
const target = { x: 320, y: 180 };
const follower = { x: target.x, y: target.y };

function updateImmediate() {
  follower.x = target.x;
  follower.y = target.y;
}
```

这种写法没有延迟，目标移动到哪里，跟随点就立即出现在哪里。它是后续两种方法的参照物：如果其他点看起来“慢”，需要先和红色点比较，而不是凭感觉判断。

## 第 2 步：引入第一个问题：直接赋值没有过渡

如果目标由鼠标控制，直接赋值会让点的位置发生跳变。要在两个位置之间生成中间值，可以先处理一个坐标分量：

```js
function lerp(start, end, t) {
  return start + (end - start) * t;
}

const x = lerp(100, 300, 0.25); // 150
```

`t` 表示进度：`0` 对应起点，`1` 对应终点，`0.25` 表示已经走过四分之一。二维点只需要分别对 `x` 和 `y` 插值：

```js
const point = {
  x: lerp(start.x, target.x, t),
  y: lerp(start.y, target.y, t),
};
```

此时仍然需要一个随时间增加的 `t`。如果每帧简单写 `t += 0.02`，动画速度就会依赖帧率，这个问题会在第 5 步专门处理。

## 第 3 步：整理重复代码：进度、反向插值和边界

固定时长过渡需要把已经经过的时间转换为进度。`inverseLerp()` 正好完成这个方向的转换：

```js
const progress = inverseLerp(0, durationSeconds, elapsedSeconds);
```

当经过的时间超过时长时，进度会超过 `1`。如果不处理，`lerp()` 会继续向终点之外移动，形成过冲。将进度限制在合法区间：

```js
const safeProgress = clamp(progress, 0, 1);
```

固定时长跟随的核心流程可以缩写为：

```js
elapsed += deltaSeconds;
const progress = clamp(inverseLerp(0, duration, elapsed), 0, 1);
position = lerp(start, target, progress);
```

当目标再次移动时，新的过渡必须从“当前蓝色点”开始，而不是从上一次目标开始。因此示例会保存 `durationStart`、`durationTarget` 和 `durationElapsed` 三个状态。

```js
state.durationStart = { ...state.duration };
state.durationTarget = { ...nextTarget };
state.durationElapsed = 0;
```

这里必须复制坐标，避免起点和运动点引用同一个对象。一次过渡期间，起点保持固定，只有进度增加。反复把当前值当作起点，得到的就不再是固定起点的匀速过渡。

“固定时长”从最后一次目标改变开始计算。持续移动指针会不断重启过渡，尤其选择 ease-in 时，蓝色点可能明显落后。停下指针，才能检查它是否在设定时长内到达。改变 Duration 或 Easing 也会从蓝色点当前位置重新开始，避免位置突然跳变。

## 第 4 步：处理核心概念：Easing 只改变节奏

线性插值的进度曲线是一条直线：每一小段时间前进相同的比例。Easing 函数接收线性进度，再返回新的进度：

```js
const easedProgress = easing(progress);
position = lerp(start, target, easedProgress);
```

本节提供三条曲线：

```js
const easeInQuad = (t) => t * t;
const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
const easeInOutCubic = (t) => {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
};
```

- `ease-in`：开始慢，后半段加速。
- `ease-out`：开始快，接近终点时减速。
- `ease-in-out`：两端慢，中间快。

曲线图显示的是“时间进度 → 位置进度”的关系。曲线仍然要经过 `(0, 0)` 和 `(1, 1)`；如果端点改变，运动就可能无法准确开始或结束。

页面默认选择 `linear`，即 `t => t`，便于先观察匀速过渡。图中同时画出线性参考线和三种 easing，当前选择的曲线加粗显示。横轴是时间进度，纵轴是位置进度；纵向坐标使用 `bottom - value * height`，把向上增加的数学数值转换为向下增加的 Canvas 坐标。

## 第 5 步：引入指数平滑和帧率问题

另一种常见写法是每帧只走向目标的一部分：

```js
current += (target - current) * factor;
```

它实现简单，但 `factor` 实际上是“每帧比例”。60 FPS 时每秒更新 60 次，30 FPS 时只更新 30 次，因此两种帧率下的运动速度不同。

示例把比例改写为基于时间的 `alpha`：

```js
function smoothingAlpha(sharpness, deltaSeconds) {
  return 1 - Math.exp(-sharpness * deltaSeconds);
}

const alpha = smoothingAlpha(sharpness, deltaSeconds);
current = lerp(current, target, alpha);
```

`sharpness` 越大，靠近目标越快；`deltaSeconds` 越大，单帧允许前进的比例也会相应增加。这样把一秒拆成一帧或多帧时，整体响应速度更接近。

在目标不变时，剩余距离乘以 `exp(-sharpness * deltaSeconds)`。两段时间的衰减相乘，等于总时间的衰减，因此不同帧切分能得到相同结果。如果目标在帧间持续改变，采样时刻不同仍会产生差异。

需要注意，指数平滑是“无限接近”，不是在某个时刻严格到达。数值上会越来越接近目标，但通常不会正好等于目标。这个特性适合摄像机跟随、鼠标指针和 UI 参数过渡，不等同于有明确结束时间的物理运动。

## 第 6 步：加入状态和重绘流程

Canvas 只保存像素，不保存“哪个点属于哪种跟随方式”。因此页面把参数和运动数据集中在 `state` 中，并在每一帧执行更新和重绘：

```js
function tick(timestamp) {
  if (lastTime === 0) lastTime = timestamp;
  const deltaSeconds = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  update(deltaSeconds);
  render();
  requestAnimationFrame(tick);
}
```

`update()` 只负责改变目标、进度和三个点的位置；`render()` 负责清屏、画网格、轨迹、目标和跟随点。把“计算”和“绘制”分开后，调节参数或调整窗口大小时可以安全地调用 `render()`，不必复制运动逻辑。

完整版本还会在更新后同步调试面板。首次回调先初始化时间；切换标签页时清除上次时间，防止恢复后一次跨过很长距离。单帧时间最多计入 `0.1` 秒，这意味着严重卡顿时演示会放慢，而不是严格追赶墙上时钟。

### 沿用高清画布与指针坐标转换

绘制坐标使用 CSS 像素，画布位图按 DPR 放大，并用 `setTransform(dpr, 0, 0, dpr, 0, 0)` 恢复绘制比例。指针事件是视口坐标，应先减去画布左上角：

```js
const rect = canvas.getBoundingClientRect();
const point = {
  x: (event.clientX - rect.left) * state.width / rect.width,
  y: (event.clientY - rect.top) * state.height / rect.height,
};
```

此处不乘 DPR，因为 `state.width` 和 `state.height` 仍使用 CSS 像素。示例仅接收下半区输入，并留出边缘空间；上半区用于曲线。窗口尺寸变化后会将三个点重置到可见区域并清空旧轨迹，参数保持不变。

轨迹默认保留最近 180 帧的位置，其代表的时间长度随帧率变化。关闭 `Motion trails` 会清空轨迹；重新开启后从当前位置开始记录。重合时三个不同半径的点形成同心圆，标签错开显示。

## 动手观察与故意制造错误

1. 保持 `linear` 和 `0.8 s`，在下半区点击远处后停下。观察红点立即到达、蓝点匀速到达、绿点逐渐减速。也可聚焦画布后按方向键，以固定步长改变目标。
2. 依次切换三种 easing，重复同样的单次移动。比较曲线斜率与运动快慢，同时检查两个进度最终都为 `1.000`。
3. 在控制台计算 `lerp(0, 10, 1.2)` 的等价表达式 `0 + (10 - 0) * 1.2`，观察结果 `12`，再加上进度限制得到 `10`。
4. 暂时把平滑比例换成固定 `0.1`，比较一秒更新 30 次和 60 次时的剩余距离：`100 * 0.9 ** 30` 约为 `4.24`，`100 * 0.9 ** 60` 约为 `0.18`。恢复时间公式后，在目标不变时两者都等于 `100 * Math.exp(-7)`，约为 `0.091`。
5. 连续移动指针，然后停下，解释蓝点为何反复从进度零开始。缩小窗口，确认点仍可见、参数保留且旧轨迹被清空。

修改实验代码后恢复原实现，再从仓库根目录运行数学测试：

```sh
node --test 00-canvas-math-visualizer/04-lerp-easing-smooth-motion/src/math.test.mjs
```

## 常见问题

### 为什么 `t` 超过 1 后会过冲？

`lerp()` 本身允许外推：`lerp(0, 10, 1.2)` 的结果是 `12`。这在某些数学计算中是有用的，但固定时长动画通常只需要区间内插值，所以应在传给 `lerp()` 前使用 `clamp()`。

### 为什么指数平滑永远不会真正到达目标？

每次只消除剩余距离的一部分，剩余距离会按比例缩小，但不会在有限次数内变成零。若业务需要明确结束时刻，应使用固定时长插值；若需要持续跟随和自然减速，指数平滑更合适。

### 为什么不同帧率下平滑速度可能不一致？

直接使用固定 `factor` 时，比例绑定的是“每帧”而不是“每秒”。使用 `smoothingAlpha(sharpness, deltaSeconds)` 后，比例由经过的时间计算，能显著减少帧率差异。

### 为什么目标移动后蓝色点会从当前位置开始？

新的固定时长过渡需要把当前蓝色点保存为 `durationStart`。如果错误地使用上一次的起点，目标连续移动时会出现回弹或跳跃。

### 为什么鼠标移出画布后目标不会自动回到中心？

示例在下半区收到 `pointermove` 或 `pointerdown` 时更新目标，移出画布后保留最后一个目标位置。这让固定时长过渡可以继续完成。方向键也能更新目标，Reset motion 则将三个点重置到下半区中心附近。

### 平滑运动和物理运动有什么区别？

本节根据起点、目标和进度直接计算位置，没有质量、力、速度积分或碰撞响应。Easing 中视觉上的加速来自曲线斜率变化。要模拟惯性、弹簧或受力运动，还需要显式记录速度、加速度并建立运动方程；调整 easing 不能自动得到这些物理行为。

### `inverseLerp()` 两个端点相同怎么办？

此时分母为零，数学上不能唯一确定进度。工具函数约定返回 `0`，这是避免无效数值的工程选择；Duration 滑块最小为 `0.2 s`，正常动画不会走到这个分支。

## 本节小结

- `lerp()` 把两个值和一个进度组合成中间值。
- `inverseLerp()` 把数值转换为进度，`clamp()` 负责保护进度边界。
- Easing 改变运动节奏，起点和终点仍由插值区间决定。
- 固定时长插值适合需要明确完成时间的过渡。
- 指数平滑适合持续跟随，但不会在有限时间内严格到达目标。
- 用 `deltaSeconds` 计算平滑比例，可以减少帧率变化造成的速度差异。
- `update()` 和 `render()` 分离后，动画状态更容易观察和调试。

## 下一节方向

下一节将从“确定的插值曲线”转向“连续但不可预测的变化”：比较 `Math.random()` 生成的离散随机值与 Noise 曲线，观察频率、振幅和多层叠加如何影响连续性。
