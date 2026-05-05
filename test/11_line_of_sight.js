import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { Effects } from '../dist/effects.js';
import { LineEffect } from '../dist/line-effect.js';
import { RectBounds, LineSeg, Vec } from '../dist/geometry.js';

const BOUNDARY_SIZE = 520;
const MAX_OCCLUDER_RADIUS = 130;
const OCCLUDER_SIZE_SCALE = 0.2;

const EFFECTIVE_MAX_OCCLUDER_RADIUS = Math.round(
  MAX_OCCLUDER_RADIUS * OCCLUDER_SIZE_SCALE
);

const QUERY_PADDING = EFFECTIVE_MAX_OCCLUDER_RADIUS + 40;
const OCCLUDER_PLACEMENT_SCALE = BOUNDARY_SIZE * 0.9;

const seeker = makeMover(
  'los-seeker',
  Polygon.regular(3, 34, Mien.Green),
  { x: -360, y: -140 },
  { x: 118, y: 74 },
  60
);

const target = makeMover(
  'los-target',
  Polygon.regular(5, 30, Mien.Cyan),
  { x: 320, y: 210 },
  { x: -96, y: -68 },
  -50
);

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

const occluders = OCCLUDER_LAYOUT.map((item, index) => ({
  name: `los-occluder-${index + 1}`,
  position: {
    x: Math.round(item.nx * OCCLUDER_PLACEMENT_SCALE),
    y: Math.round(item.ny * OCCLUDER_PLACEMENT_SCALE),
  },
  radius: Math.round(item.size * EFFECTIVE_MAX_OCCLUDER_RADIUS),
  mien: item.mien,
}));

for (const item of occluders) {
  makeOccluder(item.name, item.mien, item.radius, item.position);
}

Main.creatorsFunction = () => {
  keepInBounds(seeker);
  keepInBounds(target);

  const state = evaluateLineOfSight(seeker, target);
  if (state.blocker) {
    Effects.addForeground(
      new LineEffect(seeker, state.blocker.worldPosition, '#ff3344', 4, 0.04)
    );
  } else {
    Effects.addForeground(
      new LineEffect(seeker, target, '#33ff88', 4, 0.04)
    );
  }
};

Main.run(60);

function makeMover(name, polygon, startPos, velocity, spin) {
  const obj = new SimObject(name, 'always');
  const body = new Part(name + '-body', polygon);
  body.addTo(obj, { x: 0, y: 0 }, 0);
  obj.velocity = velocity;
  obj.spin = spin;
  obj.finalize();
  Sim.add(obj, startPos, 0);
  return obj;
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
