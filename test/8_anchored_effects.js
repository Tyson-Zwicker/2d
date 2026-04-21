import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { CircleEffect } from '../dist/circle-effect.js';
import { ParticleEffect } from '../dist/particle-effect.js';
import { RadialEffect } from '../dist/radial-effect.js';
import { LineEffect } from '../dist/line-effect.js';
import { Effects } from '../dist/effects.js';

const bounds = 500;
const emitEveryMs = 180;
let lastEmit = 0;

const movers = [
  makeMover('red-mover', Mien.Red, { x: -280, y: -180 }, { x: 70, y: 55 }),
  makeMover('green-mover', Mien.Green, { x: 260, y: -120 }, { x: -80, y: 65 }),
  makeMover('blue-mover', Mien.Blue, { x: -140, y: 250 }, { x: 95, y: -70 })
];

Main.creatorsFunction = () => {
  keepInBounds(movers[0]);
  keepInBounds(movers[1]);
  keepInBounds(movers[2]);

  const now = Date.now();
  if (now - lastEmit > emitEveryMs) {
    lastEmit = now;

    // Circle and radial effects are anchored directly to moving objects.
    Effects.addForeground(new CircleEffect(movers[0], 8, 120, '#f66', 0.45));
    Effects.addForeground(new RadialEffect(movers[1], 4, 90, '#6ff', 2, 0.4, 0, 300));
    Effects.addForeground(new RadialEffect(movers[2], 5, 110, '#88f', 2, 0.35, 30, 330));

    // Line endpoints are object-anchored, so line follows object positions each frame while alive.
    Effects.addForeground(new LineEffect(movers[0], movers[1], '#fff', 2, 0.25));

    // Particle groups also anchored to object origins.
    Effects.addBackground(
      ParticleEffect.generateGroup(movers[0], 90, 120, 20, 55, 2, '#f00', 6, 0.35, 0.8)
    );
    Effects.addBackground(
      ParticleEffect.generateGroup(movers[1], 210, 120, 20, 55, 2, '#0f0', 6, 0.35, 0.8)
    );
    Effects.addBackground(
      ParticleEffect.generateGroup(movers[2], 330, 120, 20, 55, 2, '#09f', 6, 0.35, 0.8)
    );
  }
};

Main.run(60);

function makeMover(name, mien, startPos, velocity) {
  const obj = new SimObject(name, 'always');
  const body = new Part(name + '-body', Polygon.regular(3, 42, mien));
  body.addTo(obj, { x: 0, y: 0 }, 0);
  obj.velocity = velocity;
  obj.spin = 80;
  obj.finalize();
  Sim.add(obj, startPos, 0);
  return obj;
}

function keepInBounds(obj) {
  if (obj.worldPosition.x > bounds || obj.worldPosition.x < -bounds) {
    obj.velocity.x *= -1;
  }
  if (obj.worldPosition.y > bounds || obj.worldPosition.y < -bounds) {
    obj.velocity.y *= -1;
  }
}
