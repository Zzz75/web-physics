# Web 物理学习计划

这份计划以“前端图形 / 物理”为主线，把学习拆成一层基础能力和两条互相支撑的路径：

- Foundation：先掌握数学和程序化随机，这是图形与物理共用的语言。
- Experiment：用 p5.js 作为快速草稿本，低成本验证数学和物理想法。
- Rendering：先把东西画出来，理解浏览器里的图形管线。
- Simulation：再让东西动起来，理解物理状态如何随时间演化。

目标不是一次性学完所有库，而是逐步建立一套能做 Web 物理作品、交互实验、小游戏和可视化 Demo 的能力。

## 学习树

```text
前端图形 / 物理
├─ Foundation
│  ├─ Vector
│  ├─ 三角函数
│  ├─ Lerp
│  └─ Noise
│     ├─ Perlin Noise
│     └─ Simplex Noise
├─ Experiment
│  └─ p5.js 快速实验层
│     ├─ 粒子
│     ├─ 力场
│     ├─ 波
│     ├─ 吸引 / 排斥
│     ├─ Steering Behavior
│     └─ Flocking
├─ Rendering
│  ├─ Canvas
│  ├─ WebGL
│  └─ Three.js
│     └─ GLSL
└─ Simulation
   ├─ 粒子
   ├─ PBD
   │  └─ 物理引擎
   │     ├─ Rapier
   │     ├─ Cannon
   │     └─ Ammo
   └─ XPBD
```

## 总体路线

建议按“能看见 -> 能控制 -> 能模拟 -> 能组合”的顺序学习。

1. Canvas + 图形数学可视化：用 Canvas 把向量、三角函数、插值和 Noise 画出来。
2. p5.js 快速实验层：用更低成本验证粒子、力场、波和群体运动。
3. Canvas 动画与基础物理：建立帧循环、输入交互和基础运动直觉。
4. WebGL：理解 GPU、缓冲区、Shader、纹理和渲染管线。
5. Three.js：用成熟 3D 框架快速搭建场景、材质、相机和光照。
6. GLSL：补上自定义视觉效果、粒子材质和后处理能力。
7. 粒子系统：进入物理仿真，用简单规则生成复杂运动。
8. PBD / XPBD：学习约束求解，理解布料、绳子、软体和稳定模拟。
9. 物理引擎：用 Rapier、Cannon、Ammo 做刚体、碰撞和工程化项目。

## 训练原则

这份蓝图不是线性刷课表。每个阶段都要经历“做出来 -> 出问题 -> 画出内部状态 -> 解释问题 -> 修正模型”的循环。

### 每个阶段的完成标准

不要只以“Demo 能跑”为完成标准，而要能解释至少一个失败现象。

| 阶段 | 应该能解释的失败现象 |
| --- | --- |
| Canvas + 图形数学可视化 | 为什么角度、坐标轴、归一化方向容易弄反 |
| p5.js 快速实验层 | 为什么随机运动和 Noise 驱动运动看起来完全不同 |
| Canvas 动画与基础物理 | 为什么不同刷新率下速度不一致，为什么切后台回来会炸 |
| WebGL / Three.js | 为什么相机、矩阵、坐标空间会导致物体位置不符合预期 |
| GLSL | 为什么 Shader 里的坐标、时间和颜色插值容易产生断层或闪烁 |
| 粒子系统 | 为什么粒子数量一多就卡，为什么简单积分会让系统发散 |
| PBD / XPBD | 为什么迭代次数影响刚度，为什么时间步变大会不稳定 |
| 物理引擎 | 为什么刚体穿透，为什么 Three.js 物体和物理世界不同步 |

### p5.js 的使用原则

p5.js 不是只在第 2 周使用，而是贯穿全程的草稿本。

- 想验证运动规律：先用 p5.js。
- 想理解底层绘制：回到 Canvas。
- 想做 3D 表达：迁移到 Three.js。
- 想做稳定刚体：接入 Rapier / Cannon。
- 想做高级视觉：补 WebGL / GLSL。

### 调试可视化优先

物理学习不能只看最终画面。每个 Demo 都应该尽量画出系统内部状态。

- Velocity arrow。
- Force arrow。
- Acceleration arrow。
- Bounding box。
- Collision normal。
- Contact point。
- Constraint line。
- Spatial grid。
- FPS / step time。
- Solver iterations。

## 阶段零：Canvas + 图形数学可视化

### 学习目标

- 掌握 Canvas 坐标系、基础绘制 API 和高清屏适配。
- 用向量描述位置、方向、速度、加速度和力。
- 用三角函数描述圆周运动、波、振荡和周期变化。
- 用 Lerp / Easing 做平滑过渡、相机跟随和状态插值。
- 用 Perlin Noise / Simplex Noise 生成自然变化、流场、纹理和地形。
- 建立“先画出来再理解”的学习习惯。

### 关键知识

- Canvas：画点、线、圆、箭头、文本、坐标轴。
- Vector：加减、缩放、长度、归一化、点乘、叉乘。
- 三角函数：`sin`、`cos`、角度 / 弧度、周期、相位、振幅、频率。
- Lerp：线性插值、反向插值、Clamp、平滑插值、指数平滑。
- Noise：随机数、连续噪声、分形布朗运动、octave、frequency、amplitude。
- 应用连接：波浪、水面、摄像机缓动、粒子流场、地形高度、程序化纹理。

### 练习项目

- 向量可视化小工具。
- 正弦波和圆周运动 Demo。
- 鼠标跟随的 Lerp / Easing 对比。
- 一维 Noise 曲线。
- 二维 Noise 灰度图。
- Perlin Noise 流场粒子。
- Simplex Noise 高度图。

### 阶段输出

完成一个 `Canvas Math Visualizer`：支持可视化向量、波形、插值曲线、噪声贴图和流场粒子。

详细执行计划见：[stage-00-canvas-math-visualizer-plan.md](D:/project/my-project/web-physics/00-canvas-math-visualizer/stage-00-canvas-math-visualizer-plan.md)。

## 阶段 0.5：p5.js 快速物理实验

目标不是系统学习 p5.js，而是把它当成一个轻量实验工具：当你想验证一个数学或物理想法时，可以快速写出可交互 Demo。

### 学习目标

- 用 `setup()` / `draw()` 快速搭建实验循环。
- 用 p5.js 降低绘制、输入、随机数和 Noise 的样板代码成本。
- 快速验证粒子、力场、波、吸引、排斥和群体运动。
- 形成“先用 p5.js 试想法，再用 Canvas / Three.js 工程化”的节奏。

### 关键知识

- `createCanvas()`、`background()`、`line()`、`circle()`、`translate()`。
- `setup()`、`draw()`、`frameCount`、`deltaTime`。
- `createVector()`、`p5.Vector`、`mag()`、`normalize()`、`limit()`。
- `random()`、`noise()`、`map()`、`lerp()`。
- 鼠标输入、键盘输入和参数调节。

### 适合实验的主题

- 粒子系统。
- 力场和流场。
- 波和振荡。
- 吸引 / 排斥。
- 弹簧和摆。
- Steering Behavior。
- Flocking 群体运动。
- Noise 驱动运动。

### 阶段输出

完成一个 `p5 Physics Sketchbook`：收集多个小实验，每个实验只关注一个数学或物理概念。

## 阶段一：Canvas 动画与基础物理

### 学习目标

- 掌握 `requestAnimationFrame` 动画循环。
- 理解 delta time、固定时间步和不同刷新率下的动画差异。
- 处理鼠标、触摸、键盘等输入。
- 能写出基础运动、碰撞检测和简单交互 Demo。

### 关键知识

- 坐标系、像素、DPR 适配。
- 路径、形状、文本、图片绘制。
- 清屏、重绘、双缓冲思想。
- 速度、加速度、阻尼、弹性碰撞。
- 边界检测、圆形碰撞、矩形碰撞。

### 练习项目

- 弹跳小球。
- 鼠标吸引粒子。
- 简单台球碰撞。
- 画板和橡皮擦。
- 星云粒子背景。

### 阶段输出

完成一个 `Canvas Playground`：支持添加小球、拖拽、碰撞、重力和参数调节。

## 阶段二：WebGL 入门

### 学习目标

- 理解 WebGL 为什么比 Canvas 更接近 GPU。
- 掌握顶点着色器、片元着色器和缓冲区。
- 能绘制基础 2D / 3D 图形。
- 理解矩阵变换、相机和投影。

### 关键知识

- WebGL 上下文。
- 顶点、索引、attribute、uniform。
- Vertex Shader 和 Fragment Shader。
- 纹理采样。
- MVP 矩阵：Model、View、Projection。
- 深度测试、混合、视口。

### 练习项目

- 绘制三角形和矩形。
- 颜色渐变平面。
- 图片纹理变形。
- 旋转立方体。
- 简单 GPU 粒子。

### 阶段输出

完成一个 `WebGL Mini Renderer`：能渲染带纹理的旋转立方体，并支持鼠标控制视角。

## 阶段三：Three.js 实战

### 学习目标

- 用 Three.js 快速完成 3D 场景搭建。
- 理解 scene、camera、renderer、mesh、geometry、material。
- 掌握光照、阴影、模型加载和交互控制。
- 为后续物理引擎接入打基础。

### 关键知识

- 场景图。
- PerspectiveCamera / OrthographicCamera。
- BufferGeometry。
- 基础材质、PBR 材质。
- DirectionalLight、PointLight、AmbientLight。
- OrbitControls。
- glTF / GLB 模型加载。
- Raycaster 拾取。

### 练习项目

- 3D 太阳系。
- 可点击的方块矩阵。
- 简单材质实验室。
- 模型查看器。
- Three.js 粒子星空。

### 阶段输出

完成一个 `Three Physics Sandbox` 的视觉部分：包含地面、相机控制、灯光、调试网格和可点击物体。

## 阶段四：GLSL 与视觉效果

### 学习目标

- 能读懂和编写基础 GLSL Shader。
- 理解坐标、时间、噪声、颜色混合和 SDF。
- 能为 Three.js 写自定义 ShaderMaterial。
- 能做出物理项目需要的可视化效果。

### 关键知识

- `vec2`、`vec3`、`vec4`。
- `uniform`、`varying` / `in`、`out`。
- `sin`、`cos`、`step`、`smoothstep`、`mix`。
- UV 坐标。
- 噪声和扰动。
- Signed Distance Field。
- 后处理基础。

### 练习项目

- 波纹 Shader。
- 火焰 / 能量场效果。
- 水面扰动。
- 粒子发光材质。
- SDF 圆形、线段和基础图案。

### 阶段输出

完成一个 `Shader Lab`：可以切换多个 Shader 示例，并实时调整参数。

## 阶段五：粒子系统

### 学习目标

- 理解粒子作为最小模拟单元的思想。
- 掌握位置、速度、力、质量、寿命等状态更新。
- 能实现吸引、斥力、弹簧、流场等行为。
- 能把粒子模拟和 Canvas / Three.js 渲染结合。

### 关键知识

- Euler 积分。
- Verlet 积分。
- 力、速度、加速度。
- 万有引力简化模型。
- 弹簧和阻尼。
- 空间划分的基本思路。
- 粒子生命周期。

### 练习项目

- 烟花。
- 流场粒子。
- 弹簧质点系统。
- 鼠标引力场。
- 简单 N-body 模拟。

### 阶段输出

完成一个 `Particle Playground`：支持不同力场、发射器、颜色、寿命和数量控制。

## 阶段六：PBD 与 XPBD

### 学习目标

- 理解 Position Based Dynamics 的核心思想。
- 掌握“预测位置 -> 求解约束 -> 更新速度”的流程。
- 能实现距离约束、碰撞约束和固定点约束。
- 理解 XPBD 如何通过 compliance 改善刚度和时间步稳定性。

### 关键知识

- PBD 求解流程。
- 约束投影。
- 距离约束。
- 碰撞约束。
- 迭代次数和稳定性。
- Verlet / Semi-implicit Euler。
- XPBD compliance。
- 布料、绳子、软体的基本建模方式。

### 练习项目

- 绳子模拟。
- 布料模拟。
- 软体圆形。
- 可拖拽约束点。
- XPBD 弹性参数对比。

### 阶段输出

完成一个 `PBD Cloth Demo`：支持拖拽布料、调整重力、迭代次数、刚度和固定点。

## 阶段七：物理引擎

### 学习目标

- 理解什么时候应该自己写模拟，什么时候应该使用引擎。
- 掌握刚体、碰撞体、质量、摩擦、反弹、约束和关节。
- 能把物理世界和 Three.js 渲染世界同步。
- 比较 Rapier、Cannon、Ammo 的使用体验和适用场景。

### 引擎选择建议

| 引擎 | 适合场景 | 学习重点 |
| --- | --- | --- |
| Rapier | 现代 Web 项目、性能敏感、WASM、2D/3D 刚体 | 碰撞体、刚体、事件、关节 |
| Cannon | 学习成本低、轻量 3D 刚体、经典 Three.js 示例 | 基础刚体、约束、调试 |
| Ammo | Bullet 移植、复杂刚体、车辆、较重项目 | Bullet 概念、WASM 集成 |

建议学习顺序：

1. Cannon：先理解最基础的物理引擎工作方式。
2. Rapier：作为现代项目的主力方案深入学习。
3. Ammo：在需要 Bullet 能力或复杂案例时再补。

### 关键知识

- Physics World。
- Rigid Body。
- Collider。
- Shape：Box、Sphere、Capsule、Mesh。
- Mass、Friction、Restitution。
- Fixed timestep。
- Broad phase / Narrow phase。
- Collision events。
- Constraints / Joints。
- Debug renderer。

### 练习项目

- 掉落方块塔。
- 多米诺骨牌。
- 斜坡小球。
- 简单车辆。
- 可破坏积木墙。
- 物理角色控制器。

### 阶段输出

完成一个 `Physics Engine Sandbox`：支持添加刚体、切换形状、调整摩擦和反弹，并显示碰撞调试信息。

## 推荐项目路线

### 项目 1：Canvas 数学可视化器

用 Canvas 把向量、波、插值和 Noise 画出来，让抽象概念变成可观察对象。

核心功能：

- 坐标轴、点、线、圆和箭头。
- 向量加减、长度、归一化。
- 正弦波、圆周运动、振幅、频率和相位。
- Lerp / Easing 曲线对比。
- 一维 Noise 曲线、二维 Noise 贴图和流场箭头。

### 项目 2：p5.js 物理草稿本

用 p5.js 快速验证想法，不追求工程结构，只追求高频实验。

核心功能：

- 粒子、力场、波、吸引和排斥。
- Noise 驱动运动。
- Steering Behavior：Seek、Flee、Arrive、Wander。
- Flocking：Separation、Alignment、Cohesion。
- 每个 sketch 只解释一个现象。

### 项目 3：Canvas 物理实验室

用 Canvas 实现基础粒子和碰撞，让你先把“运动”和“交互”的直觉建立起来。

核心功能：

- 添加、删除、拖拽粒子。
- 重力、阻尼、反弹参数调节。
- 圆形碰撞。
- 暂停、单步、重置。
- 速度箭头、力箭头、碰撞法线和 FPS 显示。

### 项目 4：Three.js 可视化场景

用 Three.js 建立 3D 场景能力，为后续物理引擎准备渲染层。

核心功能：

- 相机控制。
- 光照和阴影。
- 网格地面。
- 可点击物体。
- 参数面板。

### 项目 5：PBD 布料模拟

用自己实现的 PBD 约束系统学习物理求解本质。

核心功能：

- 网格质点。
- 距离约束。
- 固定点。
- 鼠标拖拽。
- 参数对比：迭代次数、刚度、重力。
- 约束线、固定点、碰撞点和求解迭代可视化。

### 项目 6：Rapier 物理沙盒

把成熟物理引擎接入 Three.js，做一个真正可扩展的 Web 物理项目。

核心功能：

- 动态刚体和静态地面。
- 方块、球、胶囊体。
- 碰撞事件。
- Debug 可视化。
- 固定时间步同步。

### 副线 A：Autonomous Agents

这条副线连接向量、力、粒子、群体行为、游戏 AI 和交互艺术，适合作为区别于传统前端能力的长期方向。

核心主题：

- Seek / Flee。
- Arrive。
- Wander。
- Pursuit / Evade。
- Separation / Alignment / Cohesion。
- Flow Field Following。

阶段输出：

完成一个 `Autonomous Agents Gallery`：展示多个可切换的群体运动和转向行为。

### 副线 B：Creative Physics Portfolio

这条副线把物理能力变成可展示作品，不只是参数面板和技术 Demo。

作品方向：

- 交互艺术。
- 教学模拟器。
- 物理小游戏。
- 数据驱动的物理可视化。
- Shader + 粒子视觉作品。
- 可分享的单页实验。

阶段输出：

完成一个 `Creative Physics Portfolio`：精选 3-5 个作品型 Demo，每个作品有明确主题、交互和视觉完成度。

## 每周学习节奏

### 第 1 周：Canvas + 图形数学可视化

- 学 Canvas 基础绘制、向量、三角函数、Lerp 和 Noise。
- 写向量可视化、波形、插值曲线、噪声贴图和流场 Demo。
- 整理一个基础数学笔记：位置、方向、速度、加速度、力、波和噪声。

### 第 2 周：p5.js 快速物理实验

- 用 p5.js 快速写粒子、力场、波、吸引和排斥 Demo。
- 尝试 Steering Behavior 和 Flocking 群体运动。
- 记录哪些想法适合留在草稿本，哪些值得迁移到 Canvas / Three.js。

### 第 3-4 周：Canvas 动画与基础物理

- 学动画循环、delta time、输入和基础物理状态更新。
- 写弹跳小球、碰撞、拖拽。

### 第 5-6 周：WebGL 和 Three.js

- 学 WebGL 渲染管线。
- 用 Three.js 搭建 3D 场景。
- 写一个模型查看器或 3D 粒子场景。

### 第 7-8 周：GLSL 和视觉效果

- 学 Shader 基础。
- 写波纹、水面、发光粒子。
- 把 ShaderMaterial 接入 Three.js。

### 第 9-10 周：粒子系统

- 学 Euler、Verlet、弹簧、力场。
- 写粒子实验室。
- 尝试性能优化：对象池、空间划分、GPU 粒子。

### 第 11-12 周：PBD / XPBD

- 实现绳子和布料。
- 对比不同迭代次数、刚度和时间步。
- 写 XPBD 版本，观察稳定性变化。

### 第 13-14 周：物理引擎

- 先用 Cannon 做基础刚体 Demo。
- 再用 Rapier 做完整物理沙盒。
- 记录引擎选择、性能、API 体验和踩坑。

### 长期循环：作品打磨与副线拓展

- 每完成 2-3 个技术 Demo，挑 1 个升级成作品型 Demo。
- 用 p5.js 快速试 Autonomous Agents 新想法。
- 用 Three.js / GLSL 提升视觉表达。
- 用调试可视化解释失败现象，再决定是否迁移到工程化实现。

## 学习笔记模板

每学一个主题，建议按这个结构记录：

```markdown
# 主题名称

## 我想解决的问题

## 核心概念

## 最小 Demo

## 关键代码

## 容易踩坑的地方

## 下一步
```

## Demo 命名建议

```text
demos/
├─ 01-canvas-math-visualizer/
├─ 02-p5-physics-sketchbook/
├─ 03-canvas-bouncing-ball/
├─ 04-canvas-particles/
├─ 05-webgl-cube/
├─ 06-three-scene/
├─ 07-shader-lab/
├─ 08-particle-playground/
├─ 09-pbd-rope/
├─ 10-pbd-cloth/
├─ 11-cannon-sandbox/
├─ 12-rapier-sandbox/
├─ 13-autonomous-agents-gallery/
└─ 14-creative-physics-portfolio/
```

## 能力检查清单

### Foundation

- [ ] 我能用 Canvas 画坐标轴、点、线、圆和箭头。
- [ ] 我能用向量描述位置、方向、速度和力。
- [ ] 我能用三角函数做波形、圆周运动和周期动画。
- [ ] 我能用 Lerp / Easing 实现平滑过渡。
- [ ] 我能用 Perlin Noise / Simplex Noise 生成连续变化。

### Experiment

- [ ] 我能用 p5.js 在很短时间内写出一个物理草稿 Demo。
- [ ] 我能用 p5.js 验证粒子、力场、波、吸引和排斥。
- [ ] 我能区分“实验用 p5.js”和“工程化用 Canvas / Three.js”。
- [ ] 我能实现一个基础 Steering Behavior 或 Flocking Demo。

### Debugging

- [ ] 我能画出速度、加速度和力的方向。
- [ ] 我能画出碰撞边界、碰撞点和碰撞法线。
- [ ] 我能画出 PBD 约束线、固定点和迭代效果。
- [ ] 我能记录 FPS、step time 和 solver iterations。
- [ ] 我能解释一个 Demo 失败的原因，而不只是调参数让它看起来正常。

### Rendering

- [ ] 我能用 Canvas 写基础动画。
- [ ] 我能解释 `requestAnimationFrame` 的作用。
- [ ] 我能用 WebGL 绘制一个带纹理的图形。
- [ ] 我能解释 vertex shader 和 fragment shader 的职责。
- [ ] 我能用 Three.js 搭建带光照、阴影和相机控制的 3D 场景。
- [ ] 我能写一个简单 GLSL 效果并接入 Three.js。

### Simulation

- [ ] 我能实现基础粒子系统。
- [ ] 我能解释 Euler 和 Verlet 积分的区别。
- [ ] 我能实现弹簧质点系统。
- [ ] 我能实现 PBD 距离约束。
- [ ] 我能做一个可交互布料 Demo。
- [ ] 我能解释 XPBD 的 compliance 解决了什么问题。
- [ ] 我能把 Rapier 或 Cannon 的物理世界同步到 Three.js 场景。

### Creative Output

- [ ] 我能把一个技术 Demo 打磨成可展示作品。
- [ ] 我能做一个 Autonomous Agents 或 Flocking 作品。
- [ ] 我能为作品选择合适的交互、视觉风格和参数范围。
- [ ] 我能说明作品背后的物理规则，而不只展示效果。

## 推荐学习顺序小结

如果只想走最高效路线：

1. Canvas + 图形数学可视化：用可见反馈学习向量、波、插值和 Noise。
2. p5.js 快速实验层：用草稿本验证粒子、力场、波和群体运动。
3. Canvas 动画与基础物理：动画、输入、基础运动。
4. Three.js：3D 场景和交互。
5. 粒子系统：从规则模拟入门。
6. PBD：理解约束求解。
7. Rapier：做工程化物理项目。
8. Autonomous Agents：拓展群体运动和交互行为。
9. WebGL / GLSL：反过来补底层渲染和高级视觉效果。
10. Creative Physics Portfolio：挑选 Demo 打磨成作品。

如果你更想打扎实基础：

1. Canvas + 图形数学可视化。
2. p5.js 快速实验层。
3. Canvas 动画与基础物理。
4. WebGL。
5. Three.js。
6. GLSL。
7. 粒子。
8. PBD。
9. XPBD。
10. Rapier / Cannon / Ammo。
11. Autonomous Agents。
12. Creative Physics Portfolio。

## 最终目标

最终目标分成两层：能力型目标和作品型目标。

### 能力型目标：Web Physics Lab

它证明你能搭建、调试和解释 Web 物理系统。

应该包含：

- Canvas 粒子实验。
- Canvas 数学与 Noise 可视化实验。
- p5.js 物理草稿本。
- Three.js 3D 场景。
- GLSL 视觉效果。
- PBD 布料或绳子。
- Rapier 刚体物理沙盒。
- 参数面板、暂停、单步、重置、调试显示。
- 速度、力、碰撞、约束、FPS 和 step time 可视化。

### 作品型目标：Creative Physics Portfolio

它证明你能把物理系统变成有表达力的作品，而不只是传统前端组件或参数面板。

可以包含：

- 一个交互艺术作品。
- 一个 Autonomous Agents / Flocking 作品。
- 一个教学模拟器。
- 一个小型物理游戏。
- 一个 Shader + 粒子视觉作品。

做到这里，你就不只是“会用某个库”，而是已经形成了 Web 图形、物理仿真、调试可视化和创意表达的完整学习闭环。
