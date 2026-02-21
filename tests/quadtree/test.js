import QuadTree from "../../quadtree.js";
import RectBounds from "../../rectBounds.js";

const canvasEl = document.getElementById("playfield");
const ctx = canvasEl.getContext("2d");

const ui = {
  radiusInput: document.getElementById("radiusInput"),
  radiusValue: document.getElementById("radiusValue"),
  queryRadiusInput: document.getElementById("queryRadiusInput"),
  queryRadiusValue: document.getElementById("queryRadiusValue"),
  capacityInput: document.getElementById("capacityInput"),
  capacityValue: document.getElementById("capacityValue"),
  minSizeInput: document.getElementById("minSizeInput"),
  minSizeValue: document.getElementById("minSizeValue"),
  scatterBtn: document.getElementById("scatterBtn"),
  clearBtn: document.getElementById("clearBtn"),
  summaryText: document.getElementById("summaryText"),
  hitList: document.getElementById("hitList"),
};

const state = {
  objects: [],
  nextId: 1,
  insertRadius: Number(ui.radiusInput.value),
  queryRadius: Number(ui.queryRadiusInput.value),
  capacity: Number(ui.capacityInput.value),
  minSize: Number(ui.minSizeInput.value),
  queryPos: { x: canvasEl.width / 2, y: canvasEl.height / 2 },
  quadtree: null,
};

function updateLabels() {
  ui.radiusValue.textContent = state.insertRadius;
  ui.queryRadiusValue.textContent = state.queryRadius;
  ui.capacityValue.textContent = state.capacity;
  ui.minSizeValue.textContent = state.minSize;
}

function rebuildTree() {
  const bounds = RectBounds.make(0, 0, canvasEl.width, canvasEl.height);
  state.quadtree = new QuadTree(bounds, state.capacity, state.minSize);
  for (const obj of state.objects) {
    state.quadtree.insert(obj);
  }
}

function addObject(x, y, radius = state.insertRadius) {
  const clampedX = Math.min(Math.max(radius, x), canvasEl.width - radius);
  const clampedY = Math.min(Math.max(radius, y), canvasEl.height - radius);
  const obj = {
    id: state.nextId++,
    position: { x: clampedX, y: clampedY },
    radius,
  };
  state.objects.push(obj);
  state.quadtree.insert(obj);
}

function scatter(count = 16) {
  for (let i = 0; i < count; i += 1) {
    const radius = 6 + Math.random() * 60;
    const x = radius + Math.random() * (canvasEl.width - radius * 2);
    const y = radius + Math.random() * (canvasEl.height - radius * 2);
    addObject(x, y, radius);
  }
}

function toCanvasPoint(event) {
  const rect = canvasEl.getBoundingClientRect();
  const scaleX = canvasEl.width / rect.width;
  const scaleY = canvasEl.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function bindUi() {
  ui.radiusInput.addEventListener("input", () => {
    state.insertRadius = Number(ui.radiusInput.value);
    updateLabels();
  });
  ui.queryRadiusInput.addEventListener("input", () => {
    state.queryRadius = Number(ui.queryRadiusInput.value);
    updateLabels();
    render();
  });
  ui.capacityInput.addEventListener("input", () => {
    state.capacity = Number(ui.capacityInput.value);
    updateLabels();
    rebuildTree();
    render();
  });
  ui.minSizeInput.addEventListener("input", () => {
    state.minSize = Number(ui.minSizeInput.value);
    updateLabels();
    rebuildTree();
    render();
  });
  ui.scatterBtn.addEventListener("click", () => {
    scatter(16);
    render();
  });
  ui.clearBtn.addEventListener("click", () => {
    state.objects = [];
    state.nextId = 1;
    rebuildTree();
    render();
  });

  canvasEl.addEventListener("pointermove", (event) => {
    state.queryPos = toCanvasPoint(event);
    render();
  });

  canvasEl.addEventListener("pointerdown", (event) => {
    const point = toCanvasPoint(event);
    addObject(point.x, point.y);
    render();
  });
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

function drawQuad(node) {
  const { x0, y0, x1, y1 } = node.bounds;
  ctx.save();
  ctx.strokeStyle = "#2dd4bf";
  ctx.lineWidth = 1;
  ctx.strokeRect(x0 + 0.5, y0 + 0.5, x1 - x0, y1 - y0);
  ctx.restore();
  if (node.divided) {
    drawQuad(node.northwest);
    drawQuad(node.northeast);
    drawQuad(node.southwest);
    drawQuad(node.southeast);
  }
}

function queryObjects() {
  const { x, y } = state.queryPos;
  const r = state.queryRadius;
  const searchRect = RectBounds.make(x - r, y - r, x + r, y + r);
  const candidates = state.quadtree.findInRange(searchRect, []);
  const hits = candidates.filter((obj) => {
    const dx = obj.position.x - x;
    const dy = obj.position.y - y;
    return Math.hypot(dx, dy) <= r;
  });
  return { hits, searchRect };
}

function drawObjects(hitSet) {
  ctx.save();
  for (const obj of state.objects) {
    const isHit = hitSet.has(obj.id);
    ctx.fillStyle = isHit ? "#fb923c" : "#0ea5e9";
    ctx.strokeStyle = isHit ? "#9a3412" : "#075985";
    ctx.lineWidth = isHit ? 2 : 1.5;
    ctx.beginPath();
    ctx.arc(obj.position.x, obj.position.y, obj.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "12px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`#${obj.id}`, obj.position.x, obj.position.y);
  }
  ctx.restore();
}

function drawQueryCircle() {
  const { x, y } = state.queryPos;
  const r = state.queryRadius;
  ctx.save();
  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function updateSummary(hits) {
  if (!state.objects.length) {
    ui.summaryText.textContent = "No objects yet.";
    ui.hitList.innerHTML = "";
    return;
  }
  const base = `${state.objects.length} object${state.objects.length === 1 ? "" : "s"} in the tree.`;
  if (!hits.length) {
    ui.summaryText.textContent = `${base} No objects inside the query circle.`;
    ui.hitList.innerHTML = "";
    return;
  }
  ui.summaryText.textContent = `${base} ${hits.length} inside the query circle.`;
  ui.hitList.innerHTML = hits
    .map((obj) => `<li>#${obj.id} — r:${obj.radius.toFixed(0)} @ (${obj.position.x.toFixed(0)}, ${obj.position.y.toFixed(0)})</li>`) 
    .join("");
}

function render() {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  drawGrid();
  drawQuad(state.quadtree);
  const { hits } = queryObjects();
  const hitSet = new Set(hits.map((h) => h.id));
  drawObjects(hitSet);
  drawQueryCircle();
  updateSummary(hits);
}

function init() {
  updateLabels();
  rebuildTree();
  bindUi();
  render();
}

init();
