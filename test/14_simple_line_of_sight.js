import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { Effects } from '../dist/effects.js';
import { LineEffect } from '../dist/line-effect.js';
import { RectBounds, LineSeg, Vec } from '../dist/geometry.js';
import { Camera, View } from '../dist/view.js';

const VISIBLE_COLOR = '#33cc66';
const BLOCKED_COLOR = '#dd3344';
const LABEL_COLOR = '#f5f5f5';
const MUTED_LABEL_COLOR = '#c7c7c7';
const LINE_WIDTH = 4;
const LINE_DURATION = 0.05;
const QUERY_PADDING = 90;

Camera.x = 0;
Camera.y = 0;
Camera.zoom = 0.9;

const scenarios = [
  createScenario(
    'Visible',
    'Nothing crosses the segment.',
    { x: -430, y: -220 },
    { x: 430, y: -220 },
    []
  ),
  createScenario(
    'Blocked',
    'One blocker sits directly on the segment.',
    { x: -430, y: 0 },
    { x: 430, y: 0 },
    [{ x: 0, y: 0, radius: 75 }]
  ),
  createScenario(
    'Nearest blocker',
    'Two blockers intersect; the nearer one should win.',
    { x: -430, y: 220 },
    { x: 430, y: 220 },
    [
      { x: -120, y: 220, radius: 65 },
      { x: 130, y: 220, radius: 85 },
      { x: 0, y: 320, radius: 65 },
    ]
  ),
];

Main.creatorsFunction = () => {
  for (const scenario of scenarios) {
    const state = evaluateLineOfSight(scenario.observer, scenario.target);
    if (state.blocker) {
      Effects.addForeground(
        new LineEffect(
          scenario.observer,
          state.blocker,
          BLOCKED_COLOR,
          LINE_WIDTH,
          LINE_DURATION
        )
      );
    } else {
      Effects.addForeground(
        new LineEffect(
          scenario.observer,
          scenario.target,
          VISIBLE_COLOR,
          LINE_WIDTH,
          LINE_DURATION
        )
      );
    }
  }

  drawLegend();
  drawScenarioLabels();
};

Main.run(60);

function createScenario(title, detail, observerPos, targetPos, blockerConfigs) {
  const observer = makeMarker(`${title}-observer`, Mien.Green, 3, 34, observerPos, 90);
  const target = makeMarker(`${title}-target`, Mien.Cyan, 6, 30, targetPos, 0);
  const blockers = blockerConfigs.map((config, index) => {
    return makeMarker(
      `${title}-blocker-${index + 1}`,
      Mien.Gray,
      18,
      config.radius,
      { x: config.x, y: config.y },
      0
    );
  });

  return {
    title,
    detail,
    observer,
    target,
    blockers,
    midpoint: midpoint(observerPos, targetPos),
  };
}

function makeMarker(name, mien, sides, radius, position, rotation) {
  const obj = new SimObject(name, 'never');
  const body = new Part(name + '-body', Polygon.regular(sides, radius, mien));
  body.addTo(obj, { x: 0, y: 0 }, rotation);
  obj.finalize();
  Sim.add(obj, position, rotation);
  return obj;
}

function evaluateLineOfSight(observer, target) {
  const bounds = segmentBounds(observer.worldPosition, target.worldPosition, QUERY_PADDING);
  const candidates = [];

  Sim.staticQuadtree.findInRange(bounds, candidates);
  Sim.dynamicQuadtree.findInRange(bounds, candidates);

  const seen = new Set();
  let nearestBlocker = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    if (candidate === observer || candidate === target) continue;
    if (seen.has(candidate.name)) continue;
    seen.add(candidate.name);

    const hitDistance = segmentBlockDistance(
      observer.worldPosition,
      target.worldPosition,
      candidate.worldPosition,
      candidate.radius
    );

    if (hitDistance === null) continue;
    if (hitDistance < nearestDistance) {
      nearestDistance = hitDistance;
      nearestBlocker = candidate;
    }
  }

  return { blocker: nearestBlocker };
}

function segmentBounds(start, end, padding) {
  return new RectBounds(
    Math.min(start.x, end.x) - padding,
    Math.min(start.y, end.y) - padding,
    Math.max(start.x, end.x) + padding,
    Math.max(start.y, end.y) + padding
  );
}

function segmentBlockDistance(start, end, circleCenter, radius) {
  const closest = LineSeg.closestPointOnSegment(start, end, circleCenter);
  const separation = Vec.dist(closest, circleCenter);
  if (separation > radius) return null;
  return Vec.dist(start, closest);
}

function drawLegend() {
  const gfx = View.context;
  gfx.fillStyle = LABEL_COLOR;
  gfx.font = '16px monospace';
  gfx.fillText('Simple line-of-sight test', 20, 28);
  gfx.font = '14px monospace';
  gfx.fillStyle = VISIBLE_COLOR;
  gfx.fillText('Green line: target is visible', 20, 54);
  gfx.fillStyle = BLOCKED_COLOR;
  gfx.fillText('Red line: nearest blocker stops sight', 20, 76);
  gfx.fillStyle = MUTED_LABEL_COLOR;
  gfx.fillText('Observer = green triangle, target = cyan hexagon, blockers = gray circles', 20, 98);
}

function drawScenarioLabels() {
  for (const scenario of scenarios) {
    const state = evaluateLineOfSight(scenario.observer, scenario.target);
    const result = state.blocker ? `Result: blocked by ${state.blocker.name}` : 'Result: visible';
    drawWorldLabel(
      { x: scenario.midpoint.x - 160, y: scenario.midpoint.y - 70 },
      scenario.title,
      LABEL_COLOR,
      'bold 16px monospace'
    );
    drawWorldLabel(
      { x: scenario.midpoint.x - 160, y: scenario.midpoint.y - 46 },
      scenario.detail,
      MUTED_LABEL_COLOR,
      '14px monospace'
    );
    drawWorldLabel(
      { x: scenario.midpoint.x - 160, y: scenario.midpoint.y - 22 },
      result,
      state.blocker ? BLOCKED_COLOR : VISIBLE_COLOR,
      '14px monospace'
    );
  }
}

function drawWorldLabel(worldPoint, text, color, font) {
  const screenPoint = View.worldToScreen(worldPoint);
  const gfx = View.context;
  gfx.font = font;
  gfx.fillStyle = color;
  gfx.fillText(text, screenPoint.x, screenPoint.y);
}

function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}