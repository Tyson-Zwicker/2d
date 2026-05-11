import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { View, Camera } from '../dist/view.js';
import { Events } from '../dist/events.js';
import { GUI } from '../dist/gui.js';
import { Effects } from '../dist/effects.js';
import { ParticleEffect } from '../dist/particle-effect.js';
import { CircleEffect } from '../dist/circle-effect.js';
import { RadialEffect } from '../dist/radial-effect.js';
import { LineEffect } from '../dist/line-effect.js';
import { Rnd } from '../dist/rnd.js';
import { RectBounds } from '../dist/geometry.js';

// ─── STRESS CONFIG ────────────────────────────────────────────────────────────
const NUM_DYNAMIC   = 100;   // 'always'-moving objects
const NUM_STATIC    = 0;   // 'never'-moving objects (rebuilt once)
const NUM_ONSCREEN  = 0;      // 'onscreen'-only movers
const PARTS_PER_OBJ = 1;     // parts per dynamic object (1 root + extras)
const MAP_SIZE      = 5000;  // world half-extent
const BOUNCE_BOUNDS = 4000;  // objects bounce inside this radius
const PARTICLES_PER_FRAME  = 200;   // background particles added each frame
const RADIALS_PER_FRAME    = 20;    // radial rings added each frame
const LINES_PER_FRAME      = 20;    // line effects added each frame
const ENABLE_COLLISIONS    = true; // give objects collision radii
// ─────────────────────────────────────────────────────────────────────────────

// Timing accumulators (exponential moving average, α = 0.1)
const α = 0.1;
const timing = {
  clearEvents:  0,
  rebuildQt:    0,
  queryQt:      0,
  move:         0,
  renderSim:    0,
  creators:     0,
  gui:          0,
};
// Peak values
const peak = { ...timing };

// ─── SELECTION STATE ─────────────────────────────────────────────────────────
// Drag a rectangle to area-select objects via the quadtree.
// Note: camera panning also responds to the same drag — this is expected in
// the stress test context; the goal is to exercise QuadTree.findInRange().
let selStart    = null;   // screen {x,y} at mousedown
let selEnd      = null;   // screen {x,y} tracked while button held
let wasBtnDown  = false;  // edge detection
const highlighted = [];   // [{part, polyIdx, origMien}] — used to restore colors
let selQueryMs  = 0;
let selHitCount = 0;
const SEL_MIEN  = Mien.Magenta; // highlight color applied to selected objects

function restoreHighlights() {
  for (const { part, polyIdx, origMien } of highlighted) {
    part.polygons[polyIdx].mien = origMien;
  }
  highlighted.length = 0;
}

function applyHighlight(objs) {
  for (const obj of objs) {
    for (const part of obj.allParts) {
      for (let i = 0; i < part.polygons.length; i++) {
        highlighted.push({ part, polyIdx: i, origMien: part.polygons[i].mien });
        part.polygons[i].mien = SEL_MIEN;
      }
    }
  }
}

function handleSelection() {
  const mouse  = View.mouse;
  const btnDown = mouse.buttonDown;

  // Rising edge → start drag
  if (btnDown && !wasBtnDown) {
    selStart = { x: mouse.x, y: mouse.y };
    selEnd   = { x: mouse.x, y: mouse.y };
  }

  // While held → track end point
  if (btnDown && selStart) {
    selEnd = { x: mouse.x, y: mouse.y };
  }

  // Falling edge → commit selection
  if (!btnDown && wasBtnDown && selStart) {
    selEnd = { x: mouse.x, y: mouse.y };

    // Convert screen rect → world rect and query both quadtrees
    const w0 = View.screenToWorld(selStart.x, selStart.y);
    const w1 = View.screenToWorld(selEnd.x,   selEnd.y);
    const wb = new RectBounds(w0.x, w0.y, w1.x, w1.y);

    restoreHighlights();

    const tq = performance.now();
    const dynHits = Sim.dynamicQuadtree.findInRange(wb);
    const staHits = Sim.staticQuadtree.findInRange(wb);
    selQueryMs  = performance.now() - tq;
    selHitCount = dynHits.length + staHits.length;

    applyHighlight([...dynHits, ...staHits]);
    selStart = null;
  }

  wasBtnDown = btnDown;

  // Draw dashed selection rectangle while dragging
  if (btnDown && selStart && selEnd) {
    const gfx = View.context;
    gfx.save();
    gfx.strokeStyle = '#fff';
    gfx.lineWidth   = 1.5;
    gfx.setLineDash([5, 4]);
    gfx.strokeRect(
      selStart.x,
      selStart.y,
      selEnd.x - selStart.x,
      selEnd.y - selStart.y
    );
    gfx.restore();
  }

  // Draw selection status bar at bottom-centre
  if (selQueryMs > 0 || selHitCount > 0) {
    const gfx = View.context;
    gfx.save();
    gfx.font          = 'bold 12px monospace';
    gfx.textBaseline  = 'top';
    const label = `QT select: ${selHitCount} objects  query: ${selQueryMs.toFixed(3)} ms`;
    const tw    = gfx.measureText(label).width;
    const sx    = View.canvas.width  / 2 - tw / 2;
    const sy    = View.canvas.height - 44;
    gfx.fillStyle = 'rgba(0,0,0,0.65)';
    gfx.fillRect(sx - 8, sy - 3, tw + 16, 22);
    gfx.fillStyle = '#ff0';
    gfx.fillText(label, sx, sy);
    gfx.restore();
  }
}

// ─── POPULATE SCENE ───────────────────────────────────────────────────────────

// Dynamic objects
const dynamicObjs = [];
const miens = [Mien.Cyan, Mien.Yellow, Mien.Red, Mien.Green, Mien.Magenta, Mien.Blue, Mien.Gray];
for (let i = 0; i < NUM_DYNAMIC; i++) {
  const obj = new SimObject('dyn' + i, 'always');
  if (ENABLE_COLLISIONS) { obj.collides = true; obj.radius = 18; }
  obj.velocity = { x: Rnd.float(-80, 80), y: Rnd.float(-80, 80) };

  const rootMien = miens[Rnd.int(0, miens.length)];
  const rootSize = Rnd.int(12, 24);
  const rootPart = new Part('droot' + i, Polygon.regular(3 + (i % 6), rootSize, rootMien));
  rootPart.addTo(obj, { x: 0, y: 0 }, 0);

  for (let p = 1; p < PARTS_PER_OBJ; p++) {
    const childMien = miens[Rnd.int(0, miens.length)];
    const childSize = Rnd.int(6, 18);
    const offset    = { x: Rnd.float(-100, 100), y: Rnd.float(-100, 100) };
    const child = new Part('dchild' + i + '_' + p, Polygon.regular(3 + (p % 5), childSize, childMien));
    child.spin = Rnd.float(-8, 8);
    child.addTo(rootPart, offset, Rnd.float(0, 360));
  }

  obj.finalize();
  Sim.add(obj,
    { x: MAP_SIZE - Math.random() * 2 * MAP_SIZE, y: MAP_SIZE - Math.random() * 2 * MAP_SIZE },
    Math.random() * 360
  );
  dynamicObjs.push(obj);
}

// Static objects (cheap to query, expensive on first build)
for (let i = 0; i < NUM_STATIC; i++) {
  const obj = new SimObject('sta' + i, 'never');
  new Part('sp' + i, Polygon.regular(6, 12, Mien.Gray)).addTo(obj, { x: 0, y: 0 }, 0);
  obj.finalize();
  Sim.add(obj,
    { x: MAP_SIZE - Math.random() * 2 * MAP_SIZE, y: MAP_SIZE - Math.random() * 2 * MAP_SIZE },
    0
  );
}

// Onscreen-only movers
const onscreenObjs = [];
for (let i = 0; i < NUM_ONSCREEN; i++) {
  const obj = new SimObject('ons' + i, 'onscreen');
  obj.velocity = { x: Rnd.float(-60, 60), y: Rnd.float(-60, 60) };
  new Part('osp' + i, Polygon.regular(3, 10, Mien.Green)).addTo(obj, { x: 0, y: 0 }, 0);
  obj.finalize();
  Sim.add(obj,
    { x: (MAP_SIZE / 2) - Math.random() * MAP_SIZE, y: (MAP_SIZE / 2) - Math.random() * MAP_SIZE },
    0
  );
  onscreenObjs.push(obj);
}

// ─── MONKEY-PATCH Main.doWork WITH PER-STAGE TIMERS ──────────────────────────

Main.doWork = function () {
  const tTotal = performance.now();
  try {

    // Stage 1 – clear
    let t = performance.now();
    Events.reset();
    View.clear();
    const dtClear = performance.now() - t;

    let dtRebuild = 0, dtQuery = 0, dtMove = 0, dtRender = 0, dtCreators = 0;

    if (!Main.pauseSim) {

      // Stage 2 – rebuild quadtrees
      t = performance.now();
      Sim.rebuildQuadTrees();
      dtRebuild = performance.now() - t;

      // Stage 3 – frustum queries
      t = performance.now();
      const dynamicOnScreen = Sim.dynamicQuadtree.findInRange(Camera.cameraBounds);
      const staticOnScreen  = Sim.staticQuadtree.findInRange(Camera.cameraBounds);
      dtQuery = performance.now() - t;

      // Stage 4 – move
      t = performance.now();
      Main.moveCameraAndSimObjects(dynamicOnScreen, staticOnScreen);
      dtMove = performance.now() - t;

      // Stage 5 – render sim + effects + collisions
      t = performance.now();
      Main.renderSimAndEffects(dynamicOnScreen, staticOnScreen);
      dtRender = performance.now() - t;

      // Stage 6 – user creators function
      t = performance.now();
      if (Main.creatorsFunction) Main.creatorsFunction();
      dtCreators = performance.now() - t;
    }

    // Stage 7 – GUI + mouse
    t = performance.now();
    GUI.render();
    Main.checkMouse();
    const dtGui = performance.now() - t;

    // EMA update
    timing.clearEvents = timing.clearEvents + α * (dtClear    - timing.clearEvents);
    timing.rebuildQt   = timing.rebuildQt   + α * (dtRebuild  - timing.rebuildQt);
    timing.queryQt     = timing.queryQt     + α * (dtQuery    - timing.queryQt);
    timing.move        = timing.move        + α * (dtMove      - timing.move);
    timing.renderSim   = timing.renderSim   + α * (dtRender    - timing.renderSim);
    timing.creators    = timing.creators    + α * (dtCreators  - timing.creators);
    timing.gui         = timing.gui         + α * (dtGui       - timing.gui);

    for (const k of Object.keys(timing)) {
      if (timing[k] > (peak[k] ?? 0)) peak[k] = timing[k];
    }

    Main.showDelta();
    drawTimingOverlay();

    Main.loopTime = performance.now() - tTotal;
    if (Main.loopTime > Main.maxLoopTime && Main.currentFrame > 10) {
      Main.maxLoopTime = Main.loopTime;
    }
  } catch (err) {
    Main.continue = false;
    throw err;
  }
};

// ─── TIMING OVERLAY ──────────────────────────────────────────────────────────

function bar(ms, maxMs, width) {
  const filled = Math.round((ms / maxMs) * width);
  return '█'.repeat(Math.min(filled, width)) + '░'.repeat(Math.max(width - filled, 0));
}

function drawTimingOverlay() {
  const gfx = View.context;
  gfx.save();

  const x = 20;
  let y = 50;
  const lineH = 18;
  const BAR_W = 80;
  const maxBar = Math.max(16, Main.maxLoopTime); // auto-scales to worst frame seen

  gfx.font = 'bold 12px monospace';
  gfx.textBaseline = 'top';

  const rows = [
    ['clear+events', timing.clearEvents, peak.clearEvents],
    ['rebuild qt   ', timing.rebuildQt,  peak.rebuildQt],
    ['query qt     ', timing.queryQt,    peak.queryQt],
    ['move         ', timing.move,       peak.move],
    ['render+fx    ', timing.renderSim,  peak.renderSim],
    ['creators     ', timing.creators,   peak.creators],
    ['gui+mouse    ', timing.gui,        peak.gui],
  ];

  // background panel
  gfx.fillStyle = 'rgba(0,0,0,0.55)';
  gfx.fillRect(x - 4, y - 4, 440, rows.length * lineH + 28);

  // header
  gfx.fillStyle = '#fff';
  gfx.fillText(
    `STRESS: dyn=${NUM_DYNAMIC} sta=${NUM_STATIC} ons=${NUM_ONSCREEN}`
    + `  fx-bg=${Effects.background.length} fx-fg=${Effects.foreground.length}`,
    x, y
  );
  y += lineH + 2;

  for (const [label, avg, pk] of rows) {
    const color = avg > 4 ? '#f66' : avg > 2 ? '#fa0' : '#4f8';
    gfx.fillStyle = color;
    const avgStr  = avg.toFixed(2).padStart(5);
    const peakStr = (pk ?? 0).toFixed(2).padStart(5);
    const b = bar(avg, maxBar, 20);
    gfx.fillText(`${label}  avg:${avgStr}ms  pk:${peakStr}ms  ${b}`, x, y);
    y += lineH;
  }

  gfx.restore();
}

// ─── CREATORS FUNCTION: spawn effects + bounce objects ───────────────────────

Main.creatorsFunction = () => {

  handleSelection();

  // Bounce dynamic objects inside bounds
  for (const obj of dynamicObjs) {
    const p = obj.worldPosition;
    const v = obj.velocity;
    if (Math.abs(p.x) > BOUNCE_BOUNDS) { v.x *= -1; p.x = Math.sign(p.x) * BOUNCE_BOUNDS; }
    if (Math.abs(p.y) > BOUNCE_BOUNDS) { v.y *= -1; p.y = Math.sign(p.y) * BOUNCE_BOUNDS; }
  }

  // Batch particles from random dynamic objects
  for (let i = 0; i < PARTICLES_PER_FRAME; i++) {
    const src = dynamicObjs[Math.floor(Math.random() * dynamicObjs.length)];
    Effects.addBackground(
      ParticleEffect.generateGroup(
        { ...src.worldPosition },
        Math.random() * 360, 120,
        20, 50, 1.5,
        Rnd.color(6), 3,
        0.3, 1.2
      )
    );
  }

  // Radial rings at random object positions
  for (let i = 0; i < RADIALS_PER_FRAME; i++) {
    const src = dynamicObjs[Math.floor(Math.random() * dynamicObjs.length)];
    Effects.addForeground(new RadialEffect(
      { ...src.worldPosition },
      4, 60, Rnd.color(6), 2, 0.8, 0, 360
    ));
  }

  // Line effects between random pairs
  for (let i = 0; i < LINES_PER_FRAME; i++) {
    const a = dynamicObjs[Math.floor(Math.random() * dynamicObjs.length)];
    const b = dynamicObjs[Math.floor(Math.random() * dynamicObjs.length)];
    if (a !== b) {
      Effects.addForeground(new LineEffect(
        { ...a.worldPosition }, { ...b.worldPosition },
        Rnd.color(6), 1, 0.4
      ));
    }
  }

  // One circle burst per second at a random object
  if (Main.currentFrame % 60 === 0) {
    const src = dynamicObjs[Math.floor(Math.random() * dynamicObjs.length)];
    Effects.addBackground(new CircleEffect(
      { ...src.worldPosition }, 2, 200, '#fff', 0.6, 0, 360
    ));
  }
};

// ─── GO ───────────────────────────────────────────────────────────────────────
Main.run(60);
