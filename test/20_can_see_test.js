import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { Effects } from '../dist/effects.js';
import { LineEffect } from '../dist/line-effect.js';
import { Camera, View } from '../dist/view.js';

const VISIBLE_COLOR = '#00f';
const BLOCKED_COLOR = '#f00';
const LINE_WIDTH = 4;
const BOUNDARY = 800;

Camera.x = 0;
Camera.y = 0;
Camera.zoom = 0.8;

// Create static blockers (icebergs)
createBlocker('blocker-1', 0, 0, 90);
createBlocker('blocker-2', -200, 250, 70);
createBlocker('blocker-3', 200, -200, 80);

// Create moving seekers (ships)
const seeker1 = createSeeker('seeker-1', -400, 150, 120, -60);
const seeker2 = createSeeker('seeker-2', 400, -100, -100, 80);

Main.creatorsFunction = () => {
  // Bounce seekers off boundaries
  bounceOffBoundary(seeker1);
  bounceOffBoundary(seeker2);

  // Test if seekers can see each other
  const canSee = Sim.canSee(seeker1, seeker2);

  // Draw line between seekers
  //if (canSee) {
    const color = canSee ? VISIBLE_COLOR : BLOCKED_COLOR;
    Effects.addForeground(
      new LineEffect(
        seeker1,
        seeker2,
        color,
        LINE_WIDTH,
        0.005  // Just longer than one frame at 60fps
      )
    );
  //}

  // Draw legend
  const gfx = View.context;
  gfx.fillStyle = '#ffffff';
  gfx.font = 'bold 20px monospace';
  gfx.fillText('Sim.canSee() Test', 20, 35);

  gfx.font = '16px monospace';
  gfx.fillStyle = canSee ? VISIBLE_COLOR : BLOCKED_COLOR;
  gfx.fillText(`Status: ${canSee ? 'CAN SEE' : 'BLOCKED'}`, 20, 65);

  gfx.fillStyle = '#aaaaaa';
  gfx.font = '14px monospace';
  gfx.fillText('Green ships = seekers (moving)', 20, 95);
  gfx.fillText('White circles = blockers (static)', 20, 115);
};

Main.run(60);

function createSeeker(name, x, y, vx, vy) {
  const seeker = new SimObject(name, 'always');
  const body = new Part(name + '-body', Polygon.regular(3, 30, Mien.Green));
  body.addTo(seeker, { x: 0, y: 0 }, 0);
  seeker.finalize();
  seeker.radius = 30;
  Sim.add(seeker, { x, y }, 0);
  seeker.velocity = { x: vx, y: vy };
  seeker.spin = 45;
  return seeker;
}

function createBlocker(name, x, y, radius) {
  const blocker = new SimObject(name, 'never');
  const body = new Part(name + '-body', Polygon.regular(8, radius, Mien.White));
  body.addTo(blocker, { x: 0, y: 0 }, 0);
  blocker.finalize();
  blocker.radius = radius;
  Sim.add(blocker, { x, y }, 0);
  return blocker;
}

function bounceOffBoundary(obj) {
  const pos = obj.worldPosition;
  const vel = obj.velocity;

  if (Math.abs(pos.x) > BOUNDARY) {
    vel.x = -vel.x;
  }
  if (Math.abs(pos.y) > BOUNDARY) {
    vel.y = -vel.y;
  }
}
