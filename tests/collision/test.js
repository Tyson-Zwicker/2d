import Collision from '../../collision.js';
import Game from '../../game.js';
import GameObject from '../../gameobject.js';
import Part from '../../part.js';
import RectBounds from '../../rectbounds.js';
import QuadTree from '../../quadtree.js';
import Vec from '../../vec.js';

const canvasEl = document.getElementById('playfield');
const ctx = canvasEl.getContext('2d');
const collisionStatusEl = document.getElementById('collisionStatus');
const treeStatusEl = document.getElementById('treeStatus');
const distanceEl = document.getElementById('distanceValue');
const overlapEl = document.getElementById('overlapValue');
const impulseEl = document.getElementById('impulseValue');
const resetBtn = document.getElementById('resetBtn');
const scatterBtn = document.getElementById('scatterBtn');
const alphaVxInput = document.getElementById('alphaVx');
const alphaVyInput = document.getElementById('alphaVy');
const bravoVxInput = document.getElementById('bravoVx');
const bravoVyInput = document.getElementById('bravoVy');
const applyVelocityBtn = document.getElementById('applyVelocityBtn');

const palette = [
  { fill: '#0ea5e9', stroke: '#0369a1' },
  { fill: '#f97316', stroke: '#c2410c' },
];

const state = {
  objects: [],
  quadTree: null,
  drag: null,
  collisions: [],
};

function squarePoints(radius) {
  return [
    { x: -radius, y: -radius },
    { x: radius, y: -radius },
    { x: radius, y: radius },
    { x: -radius, y: radius },
  ];
}

function createDisc(name, colorIndex, position, radius = 60, mass = 2) {
  const face = { appearance: { normal: {} }, points: squarePoints(radius) };
  const part = new Part(`${name}-part`, [face], mass);
  const obj = new GameObject(name);
  part.addTo(obj, { x: 0, y: 0 }, 0);
  obj.finalize();
  obj.worldPosition = { ...position };
  obj.worldRotation = 0;
  obj.velocity = { x: 0, y: 0 };
  part.velocity = obj.velocity; // expose velocity to collision helper via part
  return { object: obj, color: palette[colorIndex % palette.length] };
}

function initScene() {
  state.quadTree = new QuadTree(RectBounds.make(0, 0, canvasEl.width, canvasEl.height), 4, 24);
  Game.dynamicQuadtree = state.quadTree;
  Game.staticQuadtree = state.quadTree;
  Game.quadTree = state.quadTree;

  state.objects = [
    createDisc('Alpha', 0, { x: 340, y: 300 }, 64, 2),
    createDisc('Bravo', 1, { x: 740, y: 340 }, 86, 3),
  ];
  step();
}

function rebuildQuadTree() {
  state.quadTree.clear();
  for (const entry of state.objects) {
    const obj = entry.object;
    const qtObject = { ref: obj, position: obj.worldPosition, radius: obj.radius };
    state.quadTree.insert(qtObject);
  }
}

function runCollisionPass() {
  Collision.collisions.clear();
  state.collisions = [];
  for (const entry of state.objects) {
    Collision.check(entry.object);
  }
  state.collisions = Array.from(Collision.collisions.values());
}

function clampToCanvas(point, radius) {
  return {
    x: Math.min(Math.max(radius, point.x), canvasEl.width - radius),
    y: Math.min(Math.max(radius, point.y), canvasEl.height - radius),
  };
}

function step() {
  rebuildQuadTree();
  runCollisionPass();
  render();
  updateUi();
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

function onPointerDown(event) {
  const point = toCanvasPoint(event);
  for (let i = state.objects.length - 1; i >= 0; i -= 1) {
    const obj = state.objects[i].object;
    const dist = Vec.dist(point, obj.worldPosition);
    if (dist <= obj.radius) {
      state.drag = {
        index: i,
        offset: { x: point.x - obj.worldPosition.x, y: point.y - obj.worldPosition.y },
      };
      canvasEl.setPointerCapture(event.pointerId);
      break;
    }
  }
}

function onPointerMove(event) {
  if (!state.drag) return;
  const point = toCanvasPoint(event);
  const entry = state.objects[state.drag.index];
  const obj = entry.object;
  const target = clampToCanvas(
    { x: point.x - state.drag.offset.x, y: point.y - state.drag.offset.y },
    obj.radius
  );
  obj.worldPosition = target;
  step();
}

function onPointerUp(event) {
  if (!state.drag) return;
  canvasEl.releasePointerCapture(event.pointerId);
  state.drag = null;
}

function resetPositions() {
  state.objects[0].object.worldPosition = { x: 340, y: 300 };
  state.objects[1].object.worldPosition = { x: 740, y: 340 };
  step();
}

function scatterPositions() {
  for (const entry of state.objects) {
    const radius = entry.object.radius;
    const randomPoint = clampToCanvas(
      {
        x: Math.random() * canvasEl.width,
        y: Math.random() * canvasEl.height,
      },
      radius
    );
    entry.object.worldPosition = randomPoint;
  }
  step();
}

function applyVelocities() {
  const [alpha, bravo] = state.objects;
  alpha.object.velocity = {
    x: Number(alphaVxInput.value) || 0,
    y: Number(alphaVyInput.value) || 0,
  };
  alpha.object.allParts.forEach((p) => { p.velocity = alpha.object.velocity; });
  bravo.object.velocity = {
    x: Number(bravoVxInput.value) || 0,
    y: Number(bravoVyInput.value) || 0,
  };
  bravo.object.allParts.forEach((p) => { p.velocity = bravo.object.velocity; });
  step();
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
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

function drawArrow(from, to, color) {
  const head = 10;
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - head * Math.cos(angle - Math.PI / 6), to.y - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(to.x - head * Math.cos(angle + Math.PI / 6), to.y - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCollisionOverlay() {
  if (!state.collisions.length) return;
  const details = state.collisions[0].data;
  if (!details?.part1 || !details?.part2) return;
  const p1 = details.part1.worldPosition;
  const p2 = details.part2.worldPosition;

  ctx.save();
  ctx.setLineDash([10, 6]);
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.setLineDash([]);

  const midpoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  if (details.normal) {
    const tip = Vec.add(midpoint, Vec.scale(details.normal, 60));
    drawArrow(midpoint, tip, '#f43f5e');
  }
  ctx.restore();
}

function renderBodies() {
  for (const entry of state.objects) {
    const { object, color } = entry;
    ctx.save();
    ctx.fillStyle = color.fill;
    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(object.worldPosition.x, object.worldPosition.y, object.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0b1224';
    ctx.font = "700 16px 'Space Grotesk', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(object.name, object.worldPosition.x, object.worldPosition.y);
    ctx.restore();
  }
}

function render() {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  drawGrid();
  renderBodies();
  drawCollisionOverlay();
}

function updateUi() {
  const [a, b] = state.objects;
  const dx = b.object.worldPosition.x - a.object.worldPosition.x;
  const dy = b.object.worldPosition.y - a.object.worldPosition.y;
  const centerDistance = Math.hypot(dx, dy);
  const overlap = centerDistance - (a.object.radius + b.object.radius);
  distanceEl.textContent = `${centerDistance.toFixed(1)} px`;
  overlapEl.textContent = overlap >= 0 ? `${overlap.toFixed(1)} px apart` : `${Math.abs(overlap).toFixed(1)} px overlap`;

  const collided = state.collisions.length > 0;
  collisionStatusEl.textContent = collided ? 'Colliding' : 'Clear';
  collisionStatusEl.classList.toggle('on', collided);
  treeStatusEl.textContent = `${state.objects.length} bodies in QuadTree`;

  const details = state.collisions[0]?.data;
  if (details?.forceOnPart1) {
    const mag = Vec.magnitude(details.forceOnPart1);
    impulseEl.textContent = `${mag.toFixed(3)} units`;
  } else {
    impulseEl.textContent = '--';
  }
}

canvasEl.addEventListener('pointerdown', onPointerDown);
canvasEl.addEventListener('pointermove', onPointerMove);
canvasEl.addEventListener('pointerup', onPointerUp);
canvasEl.addEventListener('pointerleave', onPointerUp);
resetBtn.addEventListener('click', resetPositions);
scatterBtn.addEventListener('click', scatterPositions);
applyVelocityBtn.addEventListener('click', applyVelocities);

initScene();
