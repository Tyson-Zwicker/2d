const canvasEl = document.getElementById("playfield");
const ctx = canvasEl.getContext("2d");
const touchStatusEl = document.getElementById("touchStatus");

const rectangles = [
  { label: "A", color: "#5b8def", cx: 320, cy: 240, w: 560, h: 10, angle: Math.PI / 12 },
  { label: "B", color: "#f5537c", cx: 720, cy: 420, w: 100, h: 100, angle: -Math.PI / 8 },
];

let activeDrag = null;

function toCanvasPoint(event) {
  const rect = canvasEl.getBoundingClientRect();
  const scaleX = canvasEl.width / rect.width;
  const scaleY = canvasEl.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function getCorners(rect) {
  const hw = rect.w / 2;
  const hh = rect.h / 2;
  const cos = Math.cos(rect.angle);
  const sin = Math.sin(rect.angle);
  const corners = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ];
  return corners.map((p) => ({
    x: rect.cx + p.x * cos - p.y * sin,
    y: rect.cy + p.x * sin + p.y * cos,
  }));
}

function projectOntoAxis(points, axis) {
  let min = Infinity;
  let max = -Infinity;
  for (const p of points) {
    const proj = p.x * axis.x + p.y * axis.y;
    min = Math.min(min, proj);
    max = Math.max(max, proj);
  }
  return { min, max };
}

function satIntersect(rectA, rectB) {
  const cornersA = getCorners(rectA);
  const cornersB = getCorners(rectB);
  const axes = [];
  const pushAxes = (points) => {
    for (let i = 0; i < 2; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
      const len = Math.hypot(edge.x, edge.y) || 1;
      axes.push({ x: edge.x / len, y: edge.y / len });
    }
  };
  pushAxes(cornersA);
  pushAxes(cornersB);

  for (const axis of axes) {
    const projA = projectOntoAxis(cornersA, axis);
    const projB = projectOntoAxis(cornersB, axis);
    const separated = projA.max < projB.min || projB.max < projA.min;
    if (separated) return false;
  }
  return true;
}

function rotationHandle(rect) {
  const cos = Math.cos(rect.angle);
  const sin = Math.sin(rect.angle);
  const r = rect.w / 2 + 28;
  return {
    x: rect.cx + r * cos,
    y: rect.cy + r * sin,
  };
}

function updateStatus(touching) {
  touchStatusEl.textContent = touching ? "Touching" : "Not touching";
  touchStatusEl.classList.toggle("touching", touching);
}

function drawRect(rect, highlight) {
  const corners = getCorners(rect);
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i].x, corners[i].y);
  ctx.closePath();
  ctx.fillStyle = highlight ? `${rect.color}33` : `${rect.color}26`;
  ctx.strokeStyle = rect.color;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // Label
  ctx.fillStyle = "#0f172a";
  ctx.font = "14px sans-serif";
  ctx.fillText(`${rect.label} (${Math.round(rect.w)}×${Math.round(rect.h)})`, rect.cx - 30, rect.cy + 5);

  // Rotation handle
  const handle = rotationHandle(rect);
  ctx.beginPath();
  ctx.arc(handle.x, handle.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvasEl.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, canvasEl.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvasEl.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(canvasEl.width, y + 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  drawGrid();
  const touching = satIntersect(rectangles[0], rectangles[1]);
  rectangles.forEach((rect) => drawRect(rect, touching));
  if (touching) {
    ctx.fillStyle = "#b91c1c";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Polygons intersect", 20, canvasEl.height - 20);
  }
  updateStatus(touching);
}

function handlePointerDown(event) {
  const point = toCanvasPoint(event);
  for (let i = rectangles.length - 1; i >= 0; i--) {
    const rect = rectangles[i];
    const corners = getCorners(rect);
    const handle = rotationHandle(rect);
    const distToHandle = Math.hypot(point.x - handle.x, point.y - handle.y);
    if (distToHandle <= 12) {
      const startAngle = Math.atan2(point.y - rect.cy, point.x - rect.cx);
      activeDrag = { mode: "rotate", index: i, startAngle, rectAngle: rect.angle };
      canvasEl.setPointerCapture(event.pointerId);
      return;
    }
    if (pointInPolygon(point, corners)) {
      activeDrag = {
        mode: "move",
        index: i,
        offsetX: point.x - rect.cx,
        offsetY: point.y - rect.cy,
      };
      canvasEl.setPointerCapture(event.pointerId);
      return;
    }
  }
}

function handlePointerMove(event) {
  if (!activeDrag) return;
  const point = toCanvasPoint(event);
  const rect = rectangles[activeDrag.index];
  if (activeDrag.mode === "move") {
    rect.cx = point.x - activeDrag.offsetX;
    rect.cy = point.y - activeDrag.offsetY;
    rect.cx = clamp(rect.cx, 0, canvasEl.width);
    rect.cy = clamp(rect.cy, 0, canvasEl.height);
  } else if (activeDrag.mode === "rotate") {
    const angleNow = Math.atan2(point.y - rect.cy, point.x - rect.cx);
    rect.angle = activeDrag.rectAngle + (angleNow - activeDrag.startAngle);
  }
  render();
}

function handlePointerUp(event) {
  if (!activeDrag) return;
  canvasEl.releasePointerCapture(event.pointerId);
  activeDrag = null;
  render();
}

canvasEl.addEventListener("pointerdown", handlePointerDown);
canvasEl.addEventListener("pointermove", handlePointerMove);
canvasEl.addEventListener("pointerup", handlePointerUp);
canvasEl.addEventListener("pointerleave", handlePointerUp);

render();
