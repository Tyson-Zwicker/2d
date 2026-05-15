import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { RectBounds, LineSeg, Vec } from '../dist/geometry.js';
import { Camera, View } from '../dist/view.js';

// Visual encoding for the ping sweep: muted lines show the full sampled field,
// brighter colors emphasize the currently highlighted ray and UI overlays.
const OPEN_RAY_COLOR = '#2ec46a33';
const BLOCKED_RAY_COLOR = '#ff5b5b55';
const ACTIVE_OPEN_COLOR = '#7fff9f';
const ACTIVE_BLOCKED_COLOR = '#ff6b78';
const TARGET_COLOR = '#f7f0a8';
const LABEL_COLOR = '#f5f5f5';
const MUTED_LABEL_COLOR = '#bcc6c6';

// Sampling controls. MAX_RANGE is the farthest a ray can reach, QUERY_PADDING
// widens the quadtree search so nearby circles are not missed, and RAY_STEP
// trades angular precision for fewer LOS checks each frame.
const MAX_RANGE = 700;
const QUERY_PADDING = 90;
const RAY_STEP = 6;
const RAY_WIDTH = 1;
const ACTIVE_RAY_WIDTH = 3;
const PING_DEGREES_PER_SECOND = 60;

// Arena generation. The blocker field fills a large square grid while leaving
// a clear center so the seeker has room to move before entering dense clutter.
const ARENA_HALF_SIZE = 1600;
const GRID_STEP = 180;
const INNER_CLEAR_RADIUS = 280;

// Motion tuning for the seeker. Acceleration pulls toward the mouse, damping
// bleeds off velocity each frame, and max speed keeps the camera tracking demo
// readable instead of letting momentum grow without bound.
const SEEKER_ACCELERATION = 260;
const SEEKER_DAMPING = 0.985;
const SEEKER_MAX_SPEED = 240;

Camera.x = 0;
Camera.y = 0;
Camera.zoom = 0.7;

const seeker = makeMarker('seeker', Mien.Green, 3, 32, { x: 0, y: 0 }, 90, 'always');
const blockers = buildBlockField();

Main.creatorsFunction = () => {
  steerSeekerTowardMouse();
  Camera.x = seeker.worldPosition.x;
  Camera.y = seeker.worldPosition.y;

  const samples = buildPingSamples();
  const activeSample = pickActiveSample(samples);

  drawPingSamples(samples, activeSample);
  drawMouseTarget();
  drawLegend(activeSample);
};

Main.run(60);

function steerSeekerTowardMouse() {
  const mouseWorld = View.mouseToWorld();
  const toMouse = Vec.sub(mouseWorld, seeker.worldPosition);
  const distance = Vec.magnitude(toMouse);

  if (distance > 1e-6) {
    const direction = Vec.scale(toMouse, 1 / distance);
    const accelScale = Math.min(distance, 300) / 300;
    seeker.velocity.x += direction.x * SEEKER_ACCELERATION * accelScale * Main.delta;
    seeker.velocity.y += direction.y * SEEKER_ACCELERATION * accelScale * Main.delta;
  }

  seeker.velocity.x *= SEEKER_DAMPING;
  seeker.velocity.y *= SEEKER_DAMPING;

  const speed = Vec.magnitude(seeker.velocity);
  if (speed > SEEKER_MAX_SPEED) {
    const clampedVelocity = Vec.scale(seeker.velocity, SEEKER_MAX_SPEED / speed);
    seeker.velocity.x = clampedVelocity.x;
    seeker.velocity.y = clampedVelocity.y;
  }

  if (speed > 1e-6) {
    seeker.worldRotation = (Math.atan2(seeker.velocity.y, seeker.velocity.x) * 180) / Math.PI;
  }
}

function buildPingSamples() {
  const samples = [];
  // A full scan is approximated by fixed-angle rays. Rebuilding the set every
  // frame keeps the LOS field aligned with the seeker's current position.
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
  // The highlighted sample is purely presentational: it sweeps around the
  // already computed ray set to make the 360-degree scan feel like a ping.
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

function drawMouseTarget() {
  const mouseWorld = View.mouseToWorld();
  const screenPoint = View.worldToScreen(mouseWorld);
  const gfx = View.context;

  gfx.strokeStyle = TARGET_COLOR;
  gfx.lineWidth = 2;
  gfx.beginPath();
  gfx.arc(screenPoint.x, screenPoint.y, 10, 0, Math.PI * 2);
  gfx.stroke();
  gfx.beginPath();
  gfx.moveTo(screenPoint.x - 16, screenPoint.y);
  gfx.lineTo(screenPoint.x + 16, screenPoint.y);
  gfx.moveTo(screenPoint.x, screenPoint.y - 16);
  gfx.lineTo(screenPoint.x, screenPoint.y + 16);
  gfx.stroke();
}

function drawLegend(activeSample) {
  const gfx = View.context;
  gfx.fillStyle = LABEL_COLOR;
  gfx.font = '16px monospace';
  gfx.fillText('Moving 360 degree LOS ping test', 20, 28);
  gfx.font = '14px monospace';
  gfx.fillStyle = MUTED_LABEL_COLOR;
  gfx.fillText('The seeker accelerates gently toward the mouse while pinging all directions.', 20, 52);
  gfx.fillText(`Blockers in field: ${blockers.length}`, 20, 74);
  gfx.fillText(`Seeker speed: ${Vec.magnitude(seeker.velocity).toFixed(1)}`, 20, 96);

  const status = activeSample.blocker
    ? `Active ping ${activeSample.angle}° hits ${activeSample.blocker.name}`
    : `Active ping ${activeSample.angle}° reaches open space`;
  gfx.fillStyle = activeSample.blocker ? ACTIVE_BLOCKED_COLOR : ACTIVE_OPEN_COLOR;
  gfx.fillText(status, 20, 120);
}

function evaluateRayLineOfSight(observer, endPoint) {
  const bounds = segmentBounds(observer.worldPosition, endPoint, QUERY_PADDING);
  const candidates = [];

  // First gather only objects near the ray, then run precise geometry on that
  // reduced set. This keeps the logic scalable when the arena is crowded.
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
  // The ray itself has no width, but blockers do. Padding the query bounds by
  // at least the blocker radius keeps near-miss circles in the candidate set.
  return new RectBounds(
    Math.min(start.x, end.x) - padding,
    Math.min(start.y, end.y) - padding,
    Math.max(start.x, end.x) + padding,
    Math.max(start.y, end.y) + padding
  );
}

function segmentBlockHit(start, end, circleCenter, radius) {
  // Project the circle center onto the segment. If that closest point lies
  // outside the radius, the ray misses the blocker entirely.
  const closest = LineSeg.closestPointOnSegment(start, end, circleCenter);
  const separation = Vec.dist(closest, circleCenter);
  if (separation > radius) return null;

  const segmentVector = Vec.sub(end, start);
  const segmentLength = Vec.magnitude(segmentVector);
  if (segmentLength < 1e-6) return null;

  // The closest point is usually inside the blocker, not the place where sight
  // first enters it. Moving backward along the ray by the right-triangle offset
  // gives the first contact point, which is what the ping should stop at.
  const centerDistance = Vec.dist(start, closest);
  const entryOffset = Math.sqrt(Math.max(0, radius * radius - separation * separation));
  const hitDistance = Math.max(0, centerDistance - entryOffset);
  const direction = Vec.scale(segmentVector, 1 / segmentLength);

  return {
    distance: hitDistance,
    point: Vec.add(start, Vec.scale(direction, hitDistance)),
  };
}

function buildBlockField() {
  const built = [];
  let count = 0;

  // The grid makes occlusion patterns easy to read, while the skipped center
  // and periodic gaps prevent the arena from turning into a solid wall.
  for (let x = -ARENA_HALF_SIZE; x <= ARENA_HALF_SIZE; x += GRID_STEP) {
    for (let y = -ARENA_HALF_SIZE; y <= ARENA_HALF_SIZE; y += GRID_STEP) {
      const distanceFromCenter = Math.hypot(x, y);
      if (distanceFromCenter < INNER_CLEAR_RADIUS) continue;
      if ((x + y) % (GRID_STEP * 4) === 0) continue;

      const radius = 28 + (Math.abs((x / GRID_STEP) * 17 + (y / GRID_STEP) * 11) % 4) * 10;
      const mien = pickMien(count);
      built.push(makeMarker(`blocker-${count + 1}`, mien, 18, radius, { x, y }, 0, 'never'));
      count++;
    }
  }

  return built;
}

function pickMien(index) {
  const palette = [Mien.Gray, Mien.Blue, Mien.Yellow, Mien.Magenta, Mien.Cyan, Mien.Red];
  return palette[index % palette.length];
}

function makeMarker(name, mien, sides, radius, position, rotation, canMove) {
  const obj = new SimObject(name, canMove);
  const body = new Part(name + '-body', Polygon.regular(sides, radius, mien));
  body.addTo(obj, { x: 0, y: 0 }, rotation);
  obj.finalize();
  Sim.add(obj, position, rotation);
  return obj;
}