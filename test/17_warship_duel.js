import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { Vec } from '../dist/geometry.js';
import { View, Camera } from '../dist/view.js';
import { Effects } from '../dist/effects.js';
import { RadialEffect } from '../dist/radial-effect.js';
import { ParticleEffect } from '../dist/particle-effect.js';

const SHIP_SEPARATION = 1500;
const FIRE_INTERVAL_MS = 850;
const FIRE_JITTER_MS = 350;
const SHELL_SPEED = 620;
const SHELL_LIFE_SECONDS = 4.5;
const SHIP_MASS = 4000;
const SHELL_MASS = 0.3;
const IMPACT_FLASH_SECONDS = 0.45;
const MUZZLE_FLASH_SECONDS = 0.2;

Camera.x = 0;
Camera.y = 0;
Camera.zoom = 0.6;

let nextShellId = 0;
const activeShells = [];

const leftShip = createWarship({
  name: 'ember',
  team: 'red',
  hullMien: Mien.Red,
  gunMien: Mien.Orange,
  shellColor: '#ffb347',
  impactColor: '#ff7a59',
  position: { x: -SHIP_SEPARATION / 2, y: -110 },
  rotation: 0,
});
const rightShip = createWarship({
  name: 'azure',
  team: 'blue',
  hullMien: Mien.Blue,
  gunMien: Mien.Cyan,
  shellColor: '#9ee7ff',
  impactColor: '#9ee7ff',
  position: { x: SHIP_SEPARATION / 2, y: 110 },
  rotation: 180,
});

leftShip.target = rightShip;
rightShip.target = leftShip;

Main.creatorsFunction = () => {
  updateTurrets(leftShip, rightShip);
  updateTurrets(rightShip, leftShip);

  fireIfReady(leftShip, rightShip);
  fireIfReady(rightShip, leftShip);

  expireShells();
  handleShellCollisions();
  drawHud();
};

Main.run(60);

function createWarship(config) {
  const ship = new SimObject(config.name, 'always', SHIP_MASS);
  ship.kind = 'warship';
  ship.team = config.team;
  ship.shellColor = config.shellColor;
  ship.impactColor = config.impactColor;
  ship.lastFireAt = 0;
  ship.fireDelay = FIRE_INTERVAL_MS + Math.random() * FIRE_JITTER_MS;
  ship.hitsTaken = 0;

  const hull = new Part(`${config.name}-hull`, new Polygon(makeHullPoints(), config.hullMien));
  hull.addTo(ship, { x: 0, y: 0 }, 0);

  const turrets = [
    createTurret(`${config.name}-turret-fore`, config.gunMien, hull, { x: 55, y: -12 }),
    createTurret(`${config.name}-turret-mid`, config.gunMien, hull, { x: 0, y: 0 }),
    createTurret(`${config.name}-turret-aft`, config.gunMien, hull, { x: -58, y: 13 }),
  ];

  ship.finalize();
  ship.collides = true;
  ship.radius = 112;
  ship.turrets = turrets;

  Sim.add(ship, config.position, config.rotation);
  return ship;
}

function createTurret(name, mien, parent, offset) {
  const base = Polygon.regular(10, 14, mien);
  const barrel = new Polygon([
    { x: -4, y: -5 },
    { x: 30, y: -5 },
    { x: 30, y: 5 },
    { x: -4, y: 5 },
  ], mien);
  const turret = new Part(name, [base, barrel]);
  turret.addTo(parent, offset, 0);
  return turret;
}

function makeHullPoints() {
  return [
    { x: -118, y: -22 },
    { x: -92, y: -40 },
    { x: 60, y: -40 },
    { x: 112, y: -20 },
    { x: 138, y: 0 },
    { x: 112, y: 20 },
    { x: 60, y: 40 },
    { x: -92, y: 40 },
    { x: -118, y: 22 },
    { x: -108, y: 0 },
  ];
}

function updateTurrets(ship, target) {
  for (const turret of ship.turrets) {
    const turn = Vec.turnToFace(
      turret.worldPosition.x,
      turret.worldPosition.y,
      target.worldPosition.x,
      target.worldPosition.y,
      turret.worldRotation
    );
    turret.ownRotation += turn;
    turret.calculateLocals();
  }
}

function fireIfReady(ship, target) {
  const now = Date.now();
  if (now - ship.lastFireAt < ship.fireDelay) return;

  ship.lastFireAt = now;
  ship.fireDelay = FIRE_INTERVAL_MS + Math.random() * FIRE_JITTER_MS;

  for (const turret of ship.turrets) {
    spawnShell(ship, target, turret);
    spawnMuzzleFlash(ship, turret);
  }
}

function spawnShell(ship, target, turret) {
  const name = `${ship.name}-shell-${nextShellId++}`;
  const shell = new SimObject(name, 'always', SHELL_MASS);
  shell.kind = 'shell';
  shell.team = ship.team;
  shell.owner = ship.name;
  shell.target = target.name;
  shell.life = SHELL_LIFE_SECONDS;
  shell.collides = true;

  const shellPart = new Part(`${name}-body`, Polygon.regular(6, 6, ship.team === 'red' ? Mien.Yellow : Mien.White));
  shellPart.addTo(shell, { x: 0, y: 0 }, 0);
  shell.finalize();
  shell.radius = 7;

  const muzzle = Vec.add(turret.worldPosition, Vec.fromAngleAndMagnitude(turret.worldRotation, 62));
  const velocity = Vec.fromAngleAndMagnitude(turret.worldRotation, SHELL_SPEED);
  shell.velocity.x = velocity.x;
  shell.velocity.y = velocity.y;

  Sim.add(shell, muzzle, turret.worldRotation);
  activeShells.push(shell);
}

function spawnMuzzleFlash(ship, turret) {
  const muzzle = Vec.add(turret.worldPosition, Vec.fromAngleAndMagnitude(turret.worldRotation, 54));
  Effects.addForeground(new RadialEffect(muzzle, 6, 70, ship.shellColor, 2, MUZZLE_FLASH_SECONDS));
  Effects.addForeground(
    ParticleEffect.generateGroup(muzzle, turret.worldRotation, 30, 40, 120, 2, ship.shellColor, 8, 0.08, 0.22)
  );
}

function expireShells() {
  for (let i = activeShells.length - 1; i >= 0; i--) {
    const shell = activeShells[i];
    shell.life -= Main.delta;
    if (shell.life > 0) continue;
    removeShell(shell.name);
  }
}

function handleShellCollisions() {
  const pairs = Sim.detectDynamicCollisions();
  const spentShells = new Set();

  for (const { objectA, objectB } of pairs) {
    const shellHullHit = getShellHullHit(objectA, objectB);
    if (shellHullHit) {
      const { shell, hull } = shellHullHit;
      if (spentShells.has(shell.name)) continue;
      spentShells.add(shell.name);
      hull.hitsTaken += 1;
      spawnImpactEffect(shell.worldPosition, hull.impactColor, shell.velocity);
      continue;
    }

    const shellShellHit = getShellShellHit(objectA, objectB);
    if (!shellShellHit) continue;

    const { shellA, shellB } = shellShellHit;
    if (spentShells.has(shellA.name) || spentShells.has(shellB.name)) continue;
    spentShells.add(shellA.name);
    spentShells.add(shellB.name);
    spawnImpactEffect(midpoint(shellA.worldPosition, shellB.worldPosition), '#fff4a3', {
      x: (shellA.velocity.x + shellB.velocity.x) / 2,
      y: (shellA.velocity.y + shellB.velocity.y) / 2,
    });
  }

  for (const shellName of spentShells) {
    removeShell(shellName);
  }
}

function getShellHullHit(objectA, objectB) {
  if (objectA.kind === 'shell' && objectB.kind === 'warship' && objectA.team !== objectB.team) {
    return { shell: objectA, hull: objectB };
  }
  if (objectB.kind === 'shell' && objectA.kind === 'warship' && objectB.team !== objectA.team) {
    return { shell: objectB, hull: objectA };
  }
  return null;
}

function getShellShellHit(objectA, objectB) {
  if (objectA.kind !== 'shell' || objectB.kind !== 'shell') return null;
  if (objectA.team === objectB.team) return null;
  return { shellA: objectA, shellB: objectB };
}

function spawnImpactEffect(position, color, velocity) {
  const impactAngle = Math.atan2(velocity.y, velocity.x) * 180 / Math.PI;
  Effects.addForeground(new RadialEffect(position, 10, 180, color, 3, IMPACT_FLASH_SECONDS));
  Effects.addForeground(
    ParticleEffect.generateGroup(position, impactAngle, 120, 60, 180, 2, color, 18, 0.2, 0.55)
  );
}

function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

function removeShell(shellName) {
  const index = activeShells.findIndex((shell) => shell.name === shellName);
  if (index === -1) return;
  const [shell] = activeShells.splice(index, 1);
  Sim.remove(shell.name);
}

function drawHud() {
  const gfx = View.context;
  gfx.fillStyle = '#ffffff';
  gfx.font = '14px monospace';
  gfx.fillText('Warship Duel Demo', 10, 20);
  gfx.fillText(`Active shells: ${activeShells.length}`, 10, 40);
  gfx.fillText(`${leftShip.name} hits taken: ${leftShip.hitsTaken}`, 10, 60);
  gfx.fillText(`${rightShip.name} hits taken: ${rightShip.hitsTaken}`, 10, 80);
}
