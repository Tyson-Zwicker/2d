import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { Effects } from '../dist/effects.js';
import { LineEffect } from '../dist/line-effect.js';
import { RectBounds, LineSeg, Vec } from '../dist/geometry.js';

const BOUNDARY_SIZE = 5020;
const MAX_OCCLUDER_RADIUS = 130;
const OCCLUDER_SIZE_SCALE = 0.2;
const LOS_LINE_WIDTH = 4;
const LOS_LINE_DURATION = 0.04;
const BLOCKED_LINE_COLOR = '#ff3344';
const VISIBLE_LINE_COLOR = '#33ff88';
const NUM_DETECTORS = 1;
const NUM_OCCLUDERS = 1000;
const DETECTOR_RING_RADIUS = 340;
const DETECTOR_RING_STEP = 170;

const DETECTOR_TEMPLATES = [
  {
    name: 'los-detector-1',
    sides: 3,
    radius: 34,
    mien: Mien.Green,
    startPos: { x: -360, y: -140 },
    velocity: { x: 118, y: 74 },
    spin: 60,
  },
  {
    name: 'los-detector-2',
    sides: 4,
    radius: 28,
    mien: Mien.Yellow,
    startPos: { x: -300, y: 180 },
    velocity: { x: 104, y: -58 },
    spin: -45,
  },
  {
    name: 'los-detector-3',
    sides: 6,
    radius: 24,
    mien: Mien.Magenta,
    startPos: { x: -180, y: -280 },
    velocity: { x: 86, y: 92 },
    spin: 35,
  },
];

const TARGET_CONFIG = {
  name: 'los-target',
  sides: 5,
  radius: 30,
  mien: Mien.Cyan,
  startPos: { x: 320, y: 210 },
  velocity: { x: -96, y: -68 },
  spin: -50,
};

const EFFECTIVE_MAX_OCCLUDER_RADIUS = Math.round(
  MAX_OCCLUDER_RADIUS * OCCLUDER_SIZE_SCALE
);

const QUERY_PADDING = EFFECTIVE_MAX_OCCLUDER_RADIUS + 40;
const OCCLUDER_PLACEMENT_SCALE = BOUNDARY_SIZE * 0.9;

const detectors = buildDetectors(NUM_DETECTORS).map(makeMover);
const target = makeMover(TARGET_CONFIG);

const OCCLUDER_LAYOUT = [
  { nx: -0.78, ny: -0.66, size: 0.73, mien: Mien.Gray },
  { nx: -0.48, ny: -0.22, size: 1.0, mien: Mien.Blue },
  { nx: -0.18, ny: 0.18, size: 0.92, mien: Mien.Magenta },
  { nx: 0.23, ny: -0.38, size: 0.96, mien: Mien.Yellow },
  { nx: 0.52, ny: 0.05, size: 0.84, mien: Mien.Gray },
  { nx: 0.76, ny: 0.54, size: 0.8, mien: Mien.Blue },
  { nx: 0.02, ny: -0.74, size: 0.88, mien: Mien.Gray },
  { nx: -0.05, ny: 0.66, size: 0.92, mien: Mien.Magenta },
  { nx: 0.82, ny: -0.52, size: 0.75, mien: Mien.Yellow },
  { nx: -0.84, ny: 0.56, size: 0.69, mien: Mien.Gray },
];

const occluders = buildOccluders(NUM_OCCLUDERS);

for (const item of occluders) {
  makeOccluder(item.name, item.mien, item.radius, item.position);
}

Main.creatorsFunction = () => {
  for (const detector of detectors) {
    keepInBounds(detector);
  }
  keepInBounds(target);

  for (const detector of detectors) {
    const state = evaluateLineOfSight(detector, target);
    if (state.blocker) {
      Effects.addForeground(
        new LineEffect(
          detector,
          state.blocker.worldPosition,
          BLOCKED_LINE_COLOR,
          LOS_LINE_WIDTH,
          LOS_LINE_DURATION
        )
      );
    } else {
      Effects.addForeground(
        new LineEffect(
          detector,
          target,
          VISIBLE_LINE_COLOR,
          LOS_LINE_WIDTH,
          LOS_LINE_DURATION
        )
      );
    }
  }
};

Main.run(60);

function makeMover(config) {
  const obj = new SimObject(config.name, 'always');
  const body = new Part(
    config.name + '-body',
    Polygon.regular(config.sides, config.radius, config.mien)
  );
  body.addTo(obj, { x: 0, y: 0 }, 0);
  obj.velocity = config.velocity;
  obj.spin = config.spin;
  obj.finalize();
  Sim.add(obj, config.startPos, 0);
  return obj;
}

function buildDetectors(count) {
  return Array.from({ length: count }, (_, index) => {
    const template = DETECTOR_TEMPLATES[index % DETECTOR_TEMPLATES.length];
    if (index < DETECTOR_TEMPLATES.length) {
      return {
        ...template,
        startPos: { ...template.startPos },
        velocity: { ...template.velocity },
      };
    }

    const ringIndex = Math.floor(index / DETECTOR_TEMPLATES.length);
    const angle = (index / count) * Math.PI * 2;
    const radius = DETECTOR_RING_RADIUS + ringIndex * DETECTOR_RING_STEP;

    return {
      ...template,
      name: `los-detector-${index + 1}`,
      startPos: {
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius),
      },
      velocity: { ...template.velocity },
    };
  });
}

function buildOccluders(count) {
  return Array.from({ length: count }, (_, index) => {
    const layout = OCCLUDER_LAYOUT[index % OCCLUDER_LAYOUT.length];

    return {
      name: `los-occluder-${index + 1}`,
      position: {
        x: randomWorldCoordinate(),
        y: randomWorldCoordinate(),
      },
      radius: Math.max(8, Math.round(layout.size * EFFECTIVE_MAX_OCCLUDER_RADIUS)),
      mien: layout.mien,
    };
  });
}

function randomWorldCoordinate() {
  return Math.round((Math.random() * 2 - 1) * OCCLUDER_PLACEMENT_SCALE);
}

function makeOccluder(name, mien, radius, position) {
  const obj = new SimObject(name, 'never');
  const body = new Part(name + '-body', Polygon.regular(12, radius, mien));
  body.addTo(obj, { x: 0, y: 0 }, 0);
  obj.finalize();
  Sim.add(obj, position, 0);
  return obj;
}

function keepInBounds(obj) {
  if (obj.worldPosition.x > BOUNDARY_SIZE || obj.worldPosition.x < -BOUNDARY_SIZE) {
    obj.velocity.x *= -1;
  }
  if (obj.worldPosition.y > BOUNDARY_SIZE || obj.worldPosition.y < -BOUNDARY_SIZE) {
    obj.velocity.y *= -1;
  }
}

function evaluateLineOfSight(observer, watched) {
  const bounds = segmentBounds(observer.worldPosition, watched.worldPosition, QUERY_PADDING);
  const candidates = [];

  Sim.staticQuadtree.findInRange(bounds, candidates);
  Sim.dynamicQuadtree.findInRange(bounds, candidates);

  const seen = new Set();
  let nearestBlocker = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    if (candidate === observer || candidate === watched) continue;
    if (seen.has(candidate.name)) continue;
    seen.add(candidate.name);

    const hitDistance = segmentBlockDistance(
      observer.worldPosition,
      watched.worldPosition,
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
  const x0 = Math.min(start.x, end.x) - padding;
  const y0 = Math.min(start.y, end.y) - padding;
  const x1 = Math.max(start.x, end.x) + padding;
  const y1 = Math.max(start.y, end.y) + padding;
  return new RectBounds(x0, y0, x1, y1);
}

function segmentBlockDistance(start, end, circleCenter, radius) {
  const closest = LineSeg.closestPointOnSegment(start, end, circleCenter);
  const separation = Vec.dist(closest, circleCenter);
  if (separation > radius) return null;
  return Vec.dist(start, closest);
}
