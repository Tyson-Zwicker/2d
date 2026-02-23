import RectBounds from "../../../rectBounds.js";

const canvasEl = document.getElementById("playfield");
const ctx = canvasEl.getContext("2d");
const touchStatusEl = document.getElementById("touchStatus");

const rectangles = [
  { label: "A", color: "#5b8def", bound: RectBounds.make(140, 140, 680, 300) },
  { label: "B", color: "#f5537c", bound: RectBounds.make(540, 260, 860, 500) },
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

function updateStatus(touching) {
  touchStatusEl.textContent = touching ? "Touching" : "Not touching";
  touchStatusEl.classList.toggle("touching", touching);
}

function drawRect(rect, highlight) {
  const { x0, y0, x1, y1 } = rect.bound;
  const width = RectBounds.width(rect.bound);
  const height = RectBounds.height(rect.bound);

  ctx.fillStyle = highlight ? `${rect.color}33` : `${rect.color}26`;
  ctx.strokeStyle = rect.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(x0, y0, width, height);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#0f172a";
  ctx.font = "14px sans-serif";
  ctx.fillText(`${rect.label} (${Math.round(width)}×${Math.round(height)})`, x0 + 8, y0 + 20);
}

function render() {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

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

  const touching = RectBounds.touches(rectangles[0].bound, rectangles[1].bound);
  rectangles.forEach((rect) => drawRect(rect, touching));

  if (touching) {
    ctx.fillStyle = "#b91c1c";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Boundaries intersect", 20, canvasEl.height - 20);
  }

  updateStatus(touching);
}

function handlePointerDown(event) {
  const point = toCanvasPoint(event);
  const hitIndex = rectangles.findIndex((rect) =>
    RectBounds.isPointInside(point.x, point.y, rect.bound) ||
    RectBounds.isPointOnEdge(point.x, point.y, rect.bound)
  );
  if (hitIndex === -1) return;
  const bound = rectangles[hitIndex].bound;
  activeDrag = {
    index: hitIndex,
    offsetX: point.x - bound.x0,
    offsetY: point.y - bound.y0,
    width: RectBounds.width(bound),
    height: RectBounds.height(bound),
  };
  canvasEl.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  if (!activeDrag) return;
  const point = toCanvasPoint(event);
  const newX0 = point.x - activeDrag.offsetX;
  const newY0 = point.y - activeDrag.offsetY;
  const rect = rectangles[activeDrag.index];
  rect.bound = RectBounds.make(newX0, newY0, newX0 + activeDrag.width, newY0 + activeDrag.height);
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
