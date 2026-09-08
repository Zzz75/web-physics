# Day 02 Notes：Vector 向量基础

本节在 Day 01 的坐标网格基础上继续前进：上一节已经能从原点到鼠标画一条线，本节要把这条线升级成“向量”。向量不只是屏幕上的一段线，它同时表达方向和大小，是后续学习速度、加速度、力和流场的基础。

## 学习目标

完成本节后，应能理解并实现以下能力：

- 用 `x` 和 `y` 表示一个二维向量。
- 实现向量加法、减法和缩放。
- 计算向量长度。
- 将向量归一化为单位方向向量。
- 计算两个向量之间的点乘。
- 在 Canvas 中把向量画成箭头，并显示长度、单位向量和夹角趋势。

最终要实现的效果是：鼠标移动时，从坐标原点指向鼠标位置绘制一支箭头，同时显示该向量的长度、单位方向向量、与固定向量的点乘和夹角。

## 第 1 步：先把鼠标位置当成一组数字

最小版本可以延续 Day 01 的做法：鼠标移动时，得到它相对于画布中心的数学坐标。

```js
function toMathVector(canvasPoint) {
  return {
    x: canvasPoint.x - width / 2,
    y: height / 2 - canvasPoint.y,
  };
}
```

这段代码得到的 `{ x, y }` 已经可以看作一个向量。它表示“从原点出发，到鼠标位置要沿 x 方向走多少、沿 y 方向走多少”。

此时需要注意：点和向量在数据上都可能是 `{ x, y }`，但含义不同。

- 点表示一个位置。
- 向量表示一段位移、一个方向和一个大小。

在本节 demo 中，鼠标向量表示的是“从原点到鼠标”的位移。

## 第 2 步：把 `{ x, y }` 整理成 `Vector2`

当只显示鼠标坐标时，普通对象已经够用。但接下来要频繁做加法、缩放、长度、归一化和点乘，如果每次都手写公式，代码会很快变乱。

因此可以引入一个最小的 `Vector2` 类。

```js
class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
```

这个阶段先不急着加入所有方法，只把“向量是两个数”这个概念固定下来。接下来每遇到一个真实需求，再给它增加一个方法。

## 第 3 步：用向量减法理解“从哪里指向哪里”

如果有两个点 `a` 和 `b`，从 `a` 指向 `b` 的向量可以用 `b - a` 得到。

```js
subtract(vector) {
  return new Vector2(this.x - vector.x, this.y - vector.y);
}
```

例如：

```js
const origin = new Vector2(0, 0);
const mouse = new Vector2(120, 80);
const direction = mouse.subtract(origin);
```

在本节 demo 中，原点永远是 `(0, 0)`，所以鼠标数学坐标本身就可以直接当成“从原点到鼠标”的向量。

常见误区是把 Canvas 坐标直接拿来当数学向量。Canvas 坐标的原点在左上角，y 轴向下；数学向量的原点在中心，y 轴向上。向量计算应尽量在同一个坐标系中完成。

## 第 4 步：计算向量长度

向量长度表示它的大小。二维向量 `(x, y)` 的长度来自勾股定理：

```js
magnitude() {
  return Math.hypot(this.x, this.y);
}
```

`Math.hypot(x, y)` 等价于：

```js
Math.sqrt(x * x + y * y)
```

当鼠标离原点越远，向量长度越大；鼠标靠近原点时，长度接近 0。

这一步能帮助区分两个概念：

- 方向：箭头朝哪里。
- 大小：箭头有多长。

## 第 5 步：归一化得到单位方向

有时只关心方向，不希望长度影响计算。例如角色朝鼠标方向移动时，鼠标离得远不应该让角色突然变得更快。此时需要把向量归一化。

```js
normalize() {
  const length = this.magnitude();
  if (length === 0) return new Vector2(0, 0);
  return this.scale(1 / length);
}
```

归一化会保留方向，但把长度变成 1。实现它之前需要先有缩放方法。

```js
scale(scalar) {
  return new Vector2(this.x * scalar, this.y * scalar);
}
```

这里必须处理零向量。零向量 `(0, 0)` 没有方向，长度也是 0。如果直接除以 0，会得到无效数值。

在画面中，单位向量长度只有 1 像素，几乎看不见。因此 demo 会把单位向量乘以 80 再画出来：

```js
const unitVector = mouseVector.normalize();
const visibleUnit = unitVector.scale(80);
```

这并不改变单位向量的概念，只是为了让方向更容易观察。

## 第 6 步：用箭头表现向量

线段只能表示“连接”，箭头才能表达“方向”。画箭头时，需要知道箭头终点、方向和垂直方向。

```js
function drawArrow(vector, color, label) {
  const origin = new Vector2(width / 2, height / 2);
  const end = toCanvasPoint(vector);
  const direction = end.subtract(origin).normalize();
  const normal = new Vector2(-direction.y, direction.x);
}
```

这里出现了一个新的辅助向量 `normal`。如果 `direction` 表示箭头向前，那么 `normal` 表示它的侧向。箭头两侧的小斜线可以通过“终点往回退一点，再左右偏移一点”得到。

```js
const left = end
  .subtract(direction.scale(headLength))
  .add(normal.scale(headWidth));

const right = end
  .subtract(direction.scale(headLength))
  .subtract(normal.scale(headWidth));
```

这一步体现了向量运算的实际价值：箭头形状不是靠猜坐标，而是用方向、反方向和侧方向组合出来。

## 第 7 步：用点乘观察两个向量的关系

本节 demo 中有一个固定向量和一个鼠标向量。点乘可以用来判断两个向量的大致方向关系。

```js
dot(vector) {
  return this.x * vector.x + this.y * vector.y;
}
```

点乘的直观意义：

- 点乘大于 0：两个向量大致同向。
- 点乘等于 0：两个向量大致垂直。
- 点乘小于 0：两个向量大致反向。

如果需要计算夹角，可以使用：

```js
const cosine = a.dot(b) / (a.magnitude() * b.magnitude());
const angle = Math.acos(cosine);
```

实际代码中要把 `cosine` 限制在 `-1` 到 `1` 之间，避免浮点误差让 `Math.acos()` 得到无效输入。

```js
const safeCosine = Math.max(-1, Math.min(1, cosine));
```

## 最终代码结构

最终代码可以分为几个职责清晰的小部分：

- `Vector2`：封装向量的基本运算。
- `toMathVector()`：把 Canvas 坐标转换为数学向量。
- `toCanvasPoint()`：把数学向量转换回 Canvas 绘制位置。
- `drawArrow()`：把向量可视化为箭头。
- `drawUnitVector()`：显示鼠标向量的单位方向。
- `drawProjection()`：显示鼠标向量在固定向量方向上的投影趋势。
- `updatePanel()`：显示长度、单位向量、点乘和夹角。

这种结构不是一开始就必须完整设计好。更自然的路径是：先把鼠标点画出来，再发现“点到原点的线”其实可以表示方向，接着把重复出现的计算整理成 `Vector2`。

## 常见问题

### 为什么归一化后长度变成 1？

归一化的做法是把向量除以自己的长度。一个长度为 120 的向量除以 120 后，新向量长度就变成 1。方向不变，大小被标准化。

### 为什么零向量不能正常归一化？

零向量长度为 0。归一化需要除以长度，因此零向量会出现除以 0 的问题。更重要的是，零向量本身没有方向，所以无法得到“单位方向”。

### 为什么方向对了，但运动看起来太快或太慢？

如果直接把“从物体到鼠标”的向量当速度使用，鼠标离得越远，速度就越大。更常见的做法是先归一化得到方向，再乘以一个固定速度。

```js
const velocity = direction.normalize().scale(speed);
```

### 为什么点乘数值很大，不像夹角？

点乘不是角度。它同时受到两个向量长度和夹角影响。如果要得到夹角，需要先除以两个向量长度的乘积，再使用 `Math.acos()`。

## 本节小结

- 向量同时表达方向和大小。
- 向量长度可以用勾股定理计算。
- 归一化可以保留方向并把长度变成 1。
- 零向量没有方向，归一化时必须单独处理。
- 点乘可以判断两个向量同向、垂直或反向的趋势。
- 在 Canvas 中做向量计算时，应先确认当前使用的是 Canvas 坐标还是数学坐标。

## 下一节方向

- 引入角度和弧度。
- 使用 `Math.sin()` 和 `Math.cos()` 生成圆周运动。
- 把圆周运动展开成正弦波，观察振幅、频率和相位。
