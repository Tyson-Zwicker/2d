import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { RectBounds, LineSeg, Vec } from '../dist/geometry.js';
import { Camera, View } from '../dist/view.js';

const OPEN_RAY_COLOR = '#33cc6644';
const BLOCKED_RAY_COLOR = '#dd334466';
const ACTIVE_OPEN_COLOR = '#77ff99';
const ACTIVE_BLOCKED_COLOR = '#ff5566';
const PULSE_COLOR = '#88ddffaa';
const LABEL_COLOR = '#f5f5f5';
const MUTED_LABEL_COLOR = '#bfc7c7';
const MAX_RANGE = 560;
const QUERY_PADDING = 90;
const RAY_STEP = 4;
const RAY_WIDTH = 1.5;
const ACTIVE_RAY_WIDTH = 4;
const PING_DEGREES_PER_SECOND = 45;
const PULSE_UNITS_PER_SECOND = 150;

Camera.x = 0;
Camera.y = 0;
Camera.zoom = 0.8;

const seeker = makeMarker('seeker', Mien.Green, 3, 34, { x: 0, y: 0 }, 90);

const blockers = [
  makeBlocker('North Rock', Mien.Gray, 58, { x: 0, y: -240 }),
  makeBlocker('East Pillar', Mien.Blue, 72, { x: 250, y: -35 }),
  makeBlocker('Near South', Mien.Yellow, 54, { x: 110, y: 210 }),
  makeBlocker('Far South', Mien.Magenta, 88, { x: 230, y: 330 }),
  makeBlocker('West Stack', Mien.Gray, 84, { x: -285, y: 45 }),
  makeBlocker('Northwest Arch', Mien.Cyan, 66, { x: -185, y: -220 }),
  makeBlocker('Southeast Node', Mien.Red, 62, { x: 355, y: 165 }),
];

Main.creatorsFunction = () => {
  const samples = buildPingSamples();
  const activeSample = pickActiveSample(samples);

  drawPulseRing();
  drawPingSamples(samples, activeSample);
  drawLegend(activeSample);
  drawObjectLabels();
};

Main.run(60);

function buildPingSamples() {
  const samples = [];
  // A full 360 scan is approximated by fixed-angle rays. This keeps the demo
  // deterministic and makes the visible/blocked sectors easy to inspect.
  for (let angle = 0; angle < 360; angle += RAY_STEP) {
    const offset = Vec.fromAngleAndMagnitude(angle, MAX_RANGE);
    const rayEnd = Vec.add(seeker.worldPosition, offset);
    const hit = evaluateRayLineOfSight(seeker, rayEnd);

    samples.push({
      angle,
      endPoint: hit ? hit.point : rayEnd,
      blocker: hit ? hit.blocker : null,
    });
  }
  return samples;
}

function pickActiveSample(samples) {
  // One highlighted sample turns the static radial field into a readable
  // "ping" without changing the underlying LOS result.
  const degrees = ((Date.now() / 1000) * PING_DEGREES_PER_SECOND) % 360;
  const index = Math.floor(degrees / RAY_STEP) % samples.length;
  return samples[index];
}

function drawPingSamples(samples, activeSample) {
  const gfx = View.context;
  const origin = View.worldToScreen(seeker.worldPosition);

  for (const sample of samples) {
    const end = View.worldToScreen(sample.endPoint);
    const isActive = sample === activeSample;

    gfx.strokeStyle = sample.blocker
      ? (isActive ? ACTIVE_BLOCKED_COLOR : BLOCKED_RAY_COLOR)
      : (isActive ? ACTIVE_OPEN_COLOR : OPEN_RAY_COLOR);
    gfx.lineWidth = isActive ? ACTIVE_RAY_WIDTH : RAY_WIDTH;
    gfx.beginPath();
    gfx.moveTo(origin.x, origin.y);
    gfx.lineTo(end.x, end.y);
    gfx.stroke();
  }
}

function drawPulseRing() {
  const gfx = View.context;
  const center = View.worldToScreen(seeker.worldPosition);
  const pulseRadius = (((Date.now() / 1000) * PULSE_UNITS_PER_SECOND) % MAX_RANGE) * Camera.zoom;

  gfx.strokeStyle = PULSE_COLOR;
  gfx.lineWidth = 2;
  gfx.beginPath();
  gfx.arc(center.x, center.y, pulseRadius, 0, Math.PI * 2);
  gfx.stroke();
}

function drawLegend(activeSample) {
  const gfx = View.context;
  gfx.fillStyle = LABEL_COLOR;
  gfx.font = '16px monospace';
  gfx.fillText('360 degree LOS ping test', 20, 28);
  gfx.font = '14px monospace';
  gfx.fillStyle = MUTED_LABEL_COLOR;
  gfx.fillText('A central seeker samples every direction and stops each ray at the first blocker.', 20, 52);
  gfx.fillStyle = ACTIVE_OPEN_COLOR;
  gfx.fillText('Green rays: open space to max range', 20, 76);
  gfx.fillStyle = ACTIVE_BLOCKED_COLOR;
  gfx.fillText('Red rays: first occluder along that direction', 20, 98);

  const status = activeSample.blocker
    ? `Active ping ${activeSample.angle}\u00b0 hits ${activeSample.blocker.name}`
    : `Active ping ${activeSample.angle}\u00b0 reaches open space`;
  gfx.fillStyle = activeSample.blocker ? ACTIVE_BLOCKED_COLOR : ACTIVE_OPEN_COLOR;
  gfx.fillText(status, 20, 126);
}

function drawObjectLabels() {
  drawWorldLabel({ x: seeker.worldPosition.x - 42, y: seeker.worldPosition.y - 54 }, 'Seeker', LABEL_COLOR);

  for (const blocker of blockers) {
    drawWorldLabel(
      { x: blocker.worldPosition.x - blocker.radius, y: blocker.worldPosition.y - blocker.radius - 18 },
      blocker.name,
      LABEL_COLOR
    );
  }
}

function drawWorldLabel(worldPoint, text, color) {
  const screenPoint = View.worldToScreen(worldPoint);
  const gfx = View.context;
  gfx.font = '14px monospace';
  gfx.fillStyle = color;
  gfx.fillText(text, screenPoint.x, screenPoint.y);
}

function evaluateRayLineOfSight(observer, endPoint) {
  const bounds = segmentBounds(observer.worldPosition, endPoint, QUERY_PADDING);
  const candidates = [];

  // The quadtree narrows the work to objects near this ray before the more
  // exact segment-vs-circle test runs. That keeps the logic identical to the
  // simpler LOS demo while scaling better than checking every blocker.
  Sim.staticQuadtree.findInRange(bounds, candidates);
  Sim.dynamicQuadtree.findInRange(bounds, candidates);

  const seen = new Set();
  let nearestHit = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    if (candidate === observer) continue;
    if (seen.has(candidate.name)) continue;
    seen.add(candidate.name);

    const hit = segmentBlockHit(observer.worldPosition, endPoint, candidate.worldPosition, candidate.radius);
    if (!hit) continue;
    if (hit.distance < nearestDistance) {
      nearestDistance = hit.distance;
      nearestHit = { blocker: candidate, point: hit.point };
    }
  }

  return nearestHit;
}

function segmentBounds(start, end, padding) {
  // Rays are thin, but blockers have radius. Padding the query bounds avoids
  // missing circles that overlap the segment while sitting just outside the
  // segment's raw bounding box.
  return new RectBounds(
    Math.min(start.x, end.x) - padding,
    Math.min(start.y, end.y) - padding,
    Math.max(start.x, end.x) + padding,
    Math.max(start.y, end.y) + padding
  );
}

function segmentBlockHit(start, end, circleCenter, radius) {
  // First find the nearest point on the ray segment to the circle center.
  // If that closest approach is outside the radius, the ray cannot hit.
  const closest = LineSeg.closestPointOnSegment(start, end, circleCenter);
  const separation = Vec.dist(closest, circleCenter);
  if (separation > radius) return null;

  const segmentVector = Vec.sub(end, start);
  const segmentLength = Vec.magnitude(segmentVector);
  if (segmentLength < 1e-6) return null;

  // The closest point is not necessarily the first contact point. Once the ray
  // is known to pass through the circle, project backward by the half-chord
  // distance so the rendered endpoint lands on the circle boundary.
  const centerDistance = Vec.dist(start, closest);
  const entryOffset = Math.sqrt(Math.max(0, radius * radius - separation * separation));
  const hitDistance = Math.max(0, centerDistance - entryOffset);
  const direction = Vec.scale(segmentVector, 1 / segmentLength);

  return {
    distance: hitDistance,
    point: Vec.add(start, Vec.scale(direction, hitDistance)),
  };
}

function makeBlocker(name, mien, radius, position) {
  return makeMarker(name, mien, 18, radius, position, 0);
}

function makeMarker(name, mien, sides, radius, position, rotation) {
  const obj = new SimObject(name, 'never');
  const body = new Part(name + '-body', Polygon.regular(sides, radius, mien));
  body.addTo(obj, { x: 0, y: 0 }, rotation);
  obj.finalize();
  Sim.add(obj, position, rotation);
  return obj;
}