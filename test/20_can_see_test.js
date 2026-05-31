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
const LINE_WIDTH = 3;
const BOUNDARY = 100000;

// Configuration
const NUM_BLOCKERS = 5000;
const NUM_SEEKERS = 16;
const SEEKER_SIZE = 30;
const BLOCKER_MIN_SIZE = 60;
const BLOCKER_MAX_SIZE = 100;
const SEEKER_COLORS = [Mien.Red, Mien.Green, Mien.Blue, Mien.Yellow, Mien.Cyan, Mien.Magenta];

Camera.x = 0;
Camera.y = 0;
Camera.zoom = 0.8;

// Create static blockers (icebergs) in a loop
const blockers = [];
for (let i = 0; i < NUM_BLOCKERS; i++) {
  const x = (Math.random() - 0.5) * 2 * BOUNDARY;
  const y = (Math.random() - 0.5) * 2 * BOUNDARY;
  const radius = BLOCKER_MIN_SIZE + Math.random() * (BLOCKER_MAX_SIZE - BLOCKER_MIN_SIZE);
  const blocker = createBlocker(`blocker-${i}`, x, y, radius);
  blockers.push(blocker);
}

// Create moving seekers (ships) in a loop with different colors
const seekers = [];
for (let i = 0; i < NUM_SEEKERS; i++) {
  const x = (Math.random() - 0.5) * 600;
  const y = (Math.random() - 0.5) * 600;
  const vx = (Math.random() - 0.5) * 200;
  const vy = (Math.random() - 0.5) * 200;
  const colorIndex = i % SEEKER_COLORS.length;
  const seeker = createSeeker(`seeker-${i}`, x, y, vx, vy, SEEKER_COLORS[colorIndex], SEEKER_SIZE);
  seeker.colorIndex = colorIndex; // Store color index for comparison
  seekers.push(seeker);
}

Main.creatorsFunction = () => {
  // Bounce all seekers off boundaries
  for (let i = 0; i < seekers.length; i++) {
    bounceOffBoundary(seekers[i]);
  }

  // Test if seekers of different colors can see each other
  for (let i = 0; i < seekers.length; i++) {
    for (let j = i + 1; j < seekers.length; j++) {
      const seekerA = seekers[i];
      const seekerB = seekers[j];
      
      // Only check visibility between seekers of different colors
      if (seekerA.colorIndex !== seekerB.colorIndex) {
        const canSee = Sim.canSee(seekerA, seekerB);
        const color = canSee ? VISIBLE_COLOR : BLOCKED_COLOR;
        
        Effects.addForeground(
          new LineEffect(
            seekerA,
            seekerB,
            color,
            LINE_WIDTH,
            0.005  // Just longer than one frame at 60fps
          )
        );
      }
    }
  }

  // Draw legend
  const gfx = View.context;
  gfx.fillStyle = '#ffffff';
  gfx.font = 'bold 20px monospace';
  gfx.fillText('Sim.canSee() Multi-Color Test', 20, 35);

  gfx.fillStyle = '#aaaaaa';
  gfx.font = '14px monospace';
  gfx.fillText(`${NUM_SEEKERS} colored ships (seekers, moving)`, 20, 65);
  gfx.fillText(`${NUM_BLOCKERS} white circles (blockers, static)`, 20, 85);
  gfx.fillText('Lines drawn only between different colored seekers', 20, 105);
  gfx.fillStyle = VISIBLE_COLOR;
  gfx.fillText('Blue = can see', 20, 125);
  gfx.fillStyle = BLOCKED_COLOR;
  gfx.fillText('Red = blocked', 20, 145);
};

Main.run(60);

function createSeeker(name, x, y, vx, vy, mienColor, size) {
  const seeker = new SimObject(name, 'always');
  const body = new Part(name + '-body', Polygon.regular(3, size, mienColor));
  body.addTo(seeker, { x: 0, y: 0 }, 0);
  seeker.finalize();
  seeker.radius = size;
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
