const canvas = document.querySelector("#motionCanvas");
const ctx = canvas.getContext("2d");
const dprText = document.querySelector("#dprText");
const sizeText = document.querySelector("#sizeText");
const fpsText = document.querySelector("#fpsText");

const target = { x: 320, y: 180 };
const follower = { x: target.x, y: target.y };

let width = 0;
let height = 0;
let dpr = 1;
let lastTime = 0;

function updateImmediate() {
    follower.x = target.x;
    follower.y = target.y;
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    dpr = Math.max(1, window.devicePixelRatio || 1);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    target.x = Math.min(target.x, width - 20);
    target.y = Math.min(target.y, height - 20);
    updateImmediate();
    dprText.textContent = `DPR ${dpr.toFixed(2)}`;
    sizeText.textContent = `${width} × ${height}`;
}

function drawGrid() {
    ctx.strokeStyle = "#e5ded3";
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
        drawLine(x, 0, x, height);
    }
    for (let y = 40; y < height; y += 40) {
        drawLine(0, y, width, y);
    }
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawPoint(point, color, radius) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawTarget() {
    ctx.strokeStyle = "#171717";
    ctx.lineWidth = 1.5;
    drawLine(target.x - 11, target.y, target.x + 11, target.y);
    drawLine(target.x, target.y - 11, target.x, target.y + 11);
}

function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fffdfa";
    ctx.fillRect(0, 0, width, height);
    
    ();
    drawTarget();
    drawPoint(follower, "#c43e3e", 9);

    ctx.fillStyle = "#c43e3e";
    ctx.font = "12px Cascadia Mono, Consolas, monospace";
    ctx.fillText("follower = target", Math.min(follower.x + 14, width - 130), follower.y - 14);
}

function setTarget(x, y) {
    target.x = Math.max(20, Math.min(x, width - 20));
    target.y = Math.max(20, Math.min(y, height - 20));
}

function handlePointer(event) {
    const rect = canvas.getBoundingClientRect();
    setTarget(
        (event.clientX - rect.left) * width / rect.width,
        (event.clientY - rect.top) * height / rect.height,
    );
}

function tick(timestamp) {
    const deltaSeconds = lastTime === 0 ? 0 : (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    fpsText.textContent = `${deltaSeconds > 0 ? (1 / deltaSeconds).toFixed(0) : 0} FPS`;
    updateImmediate();
    render();
    requestAnimationFrame(tick);
}

canvas.addEventListener("pointermove", handlePointer);
canvas.addEventListener("pointerdown", handlePointer);
canvas.addEventListener("keydown", (event) => {
    const directions = {
        ArrowLeft: [-20, 0],
        ArrowRight: [20, 0],
        ArrowUp: [0, -20],
        ArrowDown: [0, 20],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    setTarget(target.x + direction[0], target.y + direction[1]);
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(tick);
