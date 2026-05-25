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

const ARENA_HALF = 10700;
const SHIP_SEPARATION = 10500;
const FIRE_INTERVAL_MS = 2000;
const FIRE_JITTER_MS = 450;
const MISSILE_INTERVAL_MS = 4200;
const MISSILE_JITTER_MS = 1800;
const SHELL_SPEED = 1660;
const SHELL_LIFE_SECONDS = 25.2;
const MISSILE_SPEED = 240;
const MISSILE_LIFE_SECONDS = 8.5;
const MISSILE_TURN_RATE = 46;
const MISSILE_PLUME_EMITS_PER_SECOND = 75;
const POINT_DEFENSE_INTERVAL_MS = 90;
const POINT_DEFENSE_SPEED = 980;
const POINT_DEFENSE_LIFE_SECONDS = 6;
const POINT_DEFENSE_TURN_RATE = 180;
const SHIP_MASS = 4000;
const SHELL_MASS = 0.3;
const MISSILE_MASS = 1.1;
const POINT_DEFENSE_MASS = 0.08;
const IMPACT_FLASH_SECONDS = 0.45;
const MUZZLE_FLASH_SECONDS = 0.2;
const MIN_SPEED = 65;
const MAX_SPEED = 205;
const MAX_RUDDER = 14;
const COURSE_CHANGE_MIN_MS = 5800;
const COURSE_CHANGE_MAX_MS = 40200;
const TURRET_TURN_RATE = 45;
const HULL_RADIUS = 112;

Camera.x = 0;
Camera.y = 0;
Camera.zoom = 0.52;

let nextShellId = 0;
const activeShells = [];
let nextMissileId = 0;
const activeMissiles = [];
let nextPointDefenseId = 0;
const activePointDefenseBullets = [];

const leftShip = createWarship({
  name: 'ember',
  team: 'red',
  hullMien: Mien.Red,
  shellTurretMien: Mien.Orange,
  shellMien: Mien.Yellow,
  missileMien: Mien.Magenta,
  pointDefenseMien: Mien.Yellow,
  shellColor: '#ffb347',
  impactColor: '#ff7a59',
  position: { x: -SHIP_SEPARATION / 2, y: -220 },
  rotation: 18,
});
const rightShip = createWarship({
  name: 'azure',
  team: 'blue',
  hullMien: Mien.Blue,
  shellTurretMien: Mien.Cyan,
  shellMien: Mien.White,
  missileMien: Mien.Cyan,
  pointDefenseMien: Mien.White,
  shellColor: '#9ee7ff',
  impactColor: '#9ee7ff',
  position: { x: SHIP_SEPARATION / 2, y: 220 },
  rotation: 198,
});

leftShip.target = rightShip;
rightShip.target = leftShip;

seedCourse(leftShip, leftShip.worldRotation);
seedCourse(rightShip, rightShip.worldRotation);

Main.creatorsFunction = () => {
  updateNavigation(leftShip, rightShip);
  updateNavigation(rightShip, leftShip);

  syncShipVelocity(leftShip);
  syncShipVelocity(rightShip);

  updateTurrets(leftShip, rightShip);
  updateTurrets(rightShip, leftShip);
  updatePointDefenseTurret(leftShip, rightShip);
  updatePointDefenseTurret(rightShip, leftShip);

  fireIfReady(leftShip, rightShip);
  fireIfReady(rightShip, leftShip);
  launchMissileIfReady(leftShip, rightShip);
  launchMissileIfReady(rightShip, leftShip);
  firePointDefenseIfReady(leftShip);
  firePointDefenseIfReady(rightShip);

  expireShells();
  expirePointDefenseBullets();
  updateMissiles();
  handleProjectileCollisions();
  drawArena();
  drawHud();
};

Main.run(60);

function createWarship(config) {
  const ship = new SimObject(config.name, 'always', SHIP_MASS);
  ship.kind = 'warship';
  ship.team = config.team;
  ship.shellMien = config.shellMien;
  ship.missileMien = config.missileMien;
  ship.pointDefenseMien = config.pointDefenseMien;
  ship.shellColor = config.shellColor;
  ship.impactColor = config.impactColor;
  ship.lastFireAt = 0;
  ship.fireDelay = FIRE_INTERVAL_MS + Math.random() * FIRE_JITTER_MS;
  ship.lastMissileAt = 0;
  ship.missileDelay = MISSILE_INTERVAL_MS + Math.random() * MISSILE_JITTER_MS;
  ship.lastPointDefenseAt = 0;
  ship.hitsTaken = 0;
  ship.nextCourseChangeAt = 0;
  ship.steerable = true;
  ship.speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
  ship.rudder = 0;

  const hull = new Part(`${config.name}-hull`, new Polygon(makeHullPoints(), config.hullMien));
  hull.addTo(ship, { x: 0, y: 0 }, 0);

  const turrets = [
    createTurret(`${config.name}-turret-fore`, config.shellTurretMien, hull, { x: 55, y: -12 }),
    createTurret(`${config.name}-turret-mid`, config.shellTurretMien, hull, { x: 0, y: 0 }),
    createTurret(`${config.name}-turret-aft`, config.shellTurretMien, hull, { x: -58, y: 13 }),
  ];
  const pointDefenseTurret = createPointDefenseTurret(
    `${config.name}-point-defense`,
    config.pointDefenseMien,
    hull,
    { x: -8, y: config.team === 'red' ? -26 : 26 }
  );
  const missileLaunchers = [
    createMissileLauncher(`${config.name}-launcher-port`, config.missileMien, hull, { x: -20, y: -18 }),
    createMissileLauncher(`${config.name}-launcher-starboard`, config.missileMien, hull, { x: -20, y: 18 }),
  ];

  ship.finalize();
  ship.collides = true;
  ship.radius = HULL_RADIUS;
  ship.turrets = turrets;
  ship.pointDefenseTurret = pointDefenseTurret;
  ship.pointDefenseTarget = undefined;
  ship.missileLaunchers = missileLaunchers;
  ship.nextLauncherIndex = 0;

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
  turret.muzzle = createMuzzleMarker(`${name}-muzzle`, mien, turret, { x: 30, y: 0 });
  return turret;
}

function createPointDefenseTurret(name, mien, parent, offset) {
  const base = Polygon.regular(8, 9, mien);
  const barrel = new Polygon([
    { x: -2, y: -3 },
    { x: 22, y: -3 },
    { x: 22, y: 3 },
    { x: -2, y: 3 },
  ], mien);
  const turret = new Part(name, [base, barrel]);
  turret.addTo(parent, offset, 0);
  turret.muzzle = createMuzzleMarker(`${name}-muzzle`, mien, turret, { x: 22, y: 0 });
  return turret;
}

function createMissileLauncher(name, mien, parent, offset) {
  const launcher = new Part(name, new Polygon([
    { x: -14, y: -5 },
    { x: 10, y: -5 },
    { x: 10, y: 5 },
    { x: -14, y: 5 },
  ], mien));
  launcher.addTo(parent, offset, 0);
  launcher.muzzle = createMuzzleMarker(`${name}-muzzle`, mien, launcher, { x: 14, y: 0 });
  return launcher;
}

function createMuzzleMarker(name, mien, parent, offset) {
  const marker = new Part(name, Polygon.regular(4, 2.5, mien));
  marker.addTo(parent, offset, 0, 1);
  return marker;
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

function seedCourse(ship, preferredHeading) {
  ship.speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
  ship.worldRotation = preferredHeading;
  ship.rudder = (Math.random() * 2 - 1) * MAX_RUDDER * 0.45;
  ship.nextCourseChangeAt = Date.now() + randomBetween(COURSE_CHANGE_MIN_MS, COURSE_CHANGE_MAX_MS);
}

function updateNavigation(ship, target) {
  const now = Date.now();
  if (now >= ship.nextCourseChangeAt) {
    chooseRandomCourse(ship, target, now);
  }

  const edge = ARENA_HALF - 180;
  const { x, y } = ship.worldPosition;
  if (Math.abs(x) > edge || Math.abs(y) > edge) {
    const turnToCenter = Vec.turnToFace(x, y, 0, 0, ship.worldRotation);
    ship.rudder = Math.sign(turnToCenter || 1) * MAX_RUDDER;
    ship.speed = MAX_SPEED;
    ship.nextCourseChangeAt = now + 900;
  }
}

function chooseRandomCourse(ship, target, now) {
  const leadAngle = Vec.turnToFace(
    ship.worldPosition.x,
    ship.worldPosition.y,
    target.worldPosition.x,
    target.worldPosition.y,
    ship.worldRotation
  );
  const bias = Math.sign(leadAngle) * (3 + Math.random() * 4);
  const drift = (Math.random() * 2 - 1) * MAX_RUDDER;
  ship.rudder = clamp(bias + drift, -MAX_RUDDER, MAX_RUDDER);
  ship.speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
  ship.nextCourseChangeAt = now + randomBetween(COURSE_CHANGE_MIN_MS, COURSE_CHANGE_MAX_MS);
}

function updateTurrets(ship, target) {
  const maxStep = TURRET_TURN_RATE * Main.delta;
  for (const turret of ship.turrets) {
    const turn = Vec.turnToFace(
      turret.worldPosition.x,
      turret.worldPosition.y,
      target.worldPosition.x,
      target.worldPosition.y,
      turret.worldRotation
    );
    turret.ownRotation += clamp(turn, -maxStep, maxStep);
    turret.calculateLocals();
  }
}

function updatePointDefenseTurret(ship) {
  const turret = ship.pointDefenseTurret;
  if (!turret) return;

  const missileTarget = findNearestEnemyMissile(ship);
  ship.pointDefenseTarget = missileTarget;
  if (!missileTarget) return;

  const maxStep = POINT_DEFENSE_TURN_RATE * Main.delta;
  const turn = Vec.turnToFace(
    turret.worldPosition.x,
    turret.worldPosition.y,
    missileTarget.worldPosition.x,
    missileTarget.worldPosition.y,
    turret.worldRotation
  );
  turret.ownRotation += clamp(turn, -maxStep, maxStep);
  turret.calculateLocals();
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

function launchMissileIfReady(ship, target) {
  const now = Date.now();
  const hasActiveMissile = activeMissiles.some((missile) => missile.owner === ship.name);
  if (hasActiveMissile) return;
  if (now - ship.lastMissileAt < ship.missileDelay) return;

  ship.lastMissileAt = now;
  ship.missileDelay = MISSILE_INTERVAL_MS + Math.random() * MISSILE_JITTER_MS;
  spawnMissile(ship, target);
}

function firePointDefenseIfReady(ship) {
  const turret = ship.pointDefenseTurret;
  const target = ship.pointDefenseTarget;
  if (!turret || !target) return;

  const now = Date.now();
  if (now - ship.lastPointDefenseAt < POINT_DEFENSE_INTERVAL_MS) return;

  ship.lastPointDefenseAt = now;
  spawnPointDefenseBullet(ship, turret, target);
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

  const shellPart = new Part(`${name}-body`, Polygon.regular(6, 6, ship.shellMien));
  shellPart.addTo(shell, { x: 0, y: 0 }, 0);
  shell.finalize();
  shell.radius = 7;

  const muzzleAnchor = turret.muzzle ?? turret;
  const muzzle = { x: muzzleAnchor.worldPosition.x, y: muzzleAnchor.worldPosition.y };
  const shellVelocity = Vec.fromAngleAndMagnitude(turret.worldRotation, SHELL_SPEED);
  shell.velocity.x = shellVelocity.x + ship.velocity.x;
  shell.velocity.y = shellVelocity.y + ship.velocity.y;

  Sim.add(shell, muzzle, turret.worldRotation);
  activeShells.push(shell);
}

function spawnMuzzleFlash(ship, turret) {
  const muzzleAnchor = turret.muzzle ?? turret;
  const muzzle = { x: muzzleAnchor.worldPosition.x, y: muzzleAnchor.worldPosition.y };
  Effects.addForeground(new RadialEffect(muzzle, 6, 70, ship.shellColor, 2, MUZZLE_FLASH_SECONDS));
  Effects.addForeground(
    ParticleEffect.generateGroup(muzzle, turret.worldRotation, 30, 40, 120, 2, ship.shellColor, 8, 0.08, 0.22)
  );
}

function spawnMissile(ship, target) {
  const name = `${ship.name}-missile-${nextMissileId++}`;
  const missile = new SimObject(name, 'always', MISSILE_MASS);
  missile.kind = 'missile';
  missile.team = ship.team;
  missile.owner = ship.name;
  missile.target = target;
  missile.life = MISSILE_LIFE_SECONDS;
  missile.collides = true;
  missile.steerable = true;
  missile.speed = MISSILE_SPEED;
  missile.rudder = 0;
  missile.plumeAccumulator = 0;
  missile.turnRate = MISSILE_TURN_RATE;

  const body = new Part(
    `${name}-body`,
    new Polygon([
      { x: -18, y: -5 },
      { x: 6, y: -5 },
      { x: 18, y: 0 },
      { x: 6, y: 5 },
      { x: -18, y: 5 },
      { x: -10, y: 0 },
    ], ship.missileMien)
  );
  body.addTo(missile, { x: 0, y: 0 }, 0);
  missile.finalize();
  missile.radius = 10;

  const launcher = ship.missileLaunchers[ship.nextLauncherIndex % ship.missileLaunchers.length];
  ship.nextLauncherIndex += 1;
  const launchHeading = launcher.worldRotation;
  const muzzleAnchor = launcher.muzzle ?? launcher;
  const launchPosition = {
    x: muzzleAnchor.worldPosition.x,
    y: muzzleAnchor.worldPosition.y,
  };

  Sim.add(missile, launchPosition, launchHeading);
  syncMissileVelocity(missile);
  activeMissiles.push(missile);

  Effects.addForeground(new RadialEffect(launchPosition, 9, 90, ship.shellColor, 2, MUZZLE_FLASH_SECONDS));
}

function spawnPointDefenseBullet(ship, turret, target) {
  const name = `${ship.name}-pd-${nextPointDefenseId++}`;
  const bullet = new SimObject(name, 'always', POINT_DEFENSE_MASS);
  bullet.kind = 'pd-bullet';
  bullet.team = ship.team;
  bullet.owner = ship.name;
  bullet.target = target.name;
  bullet.life = POINT_DEFENSE_LIFE_SECONDS;
  bullet.collides = true;

  const body = new Part(`${name}-body`, Polygon.regular(4, 2.5, ship.pointDefenseMien));
  body.addTo(bullet, { x: 0, y: 0 }, 0);
  bullet.finalize();
  bullet.radius = 3;

  const muzzleAnchor = turret.muzzle ?? turret;
  const muzzle = { x: muzzleAnchor.worldPosition.x, y: muzzleAnchor.worldPosition.y };
  const bulletVelocity = Vec.fromAngleAndMagnitude(turret.worldRotation, POINT_DEFENSE_SPEED);
  bullet.velocity.x = bulletVelocity.x + ship.velocity.x;
  bullet.velocity.y = bulletVelocity.y + ship.velocity.y;

  Sim.add(bullet, muzzle, turret.worldRotation);
  activePointDefenseBullets.push(bullet);

  Effects.addForeground(new RadialEffect(muzzle, 3, 40, ship.shellColor, 1.5, 0.08));
}

function expireShells() {
  for (let i = activeShells.length - 1; i >= 0; i--) {
    const shell = activeShells[i];
    shell.life -= Main.delta;
    if (shell.life > 0) continue;
    removeShell(shell.name);
  }
}

function expirePointDefenseBullets() {
  for (let i = activePointDefenseBullets.length - 1; i >= 0; i--) {
    const bullet = activePointDefenseBullets[i];
    bullet.life -= Main.delta;
    if (bullet.life > 0) continue;
    removePointDefenseBullet(bullet.name);
  }
}

function updateMissiles() {
  for (let i = activeMissiles.length - 1; i >= 0; i--) {
    const missile = activeMissiles[i];
    missile.life -= Main.delta;
    if (missile.life <= 0) {
      removeMissile(missile.name);
      continue;
    }

    const target = missile.target;
    if (!target || !Sim.simObjects.has(target.name)) {
      removeMissile(missile.name);
      continue;
    }

    const turn = Vec.turnToFace(
      missile.worldPosition.x,
      missile.worldPosition.y,
      target.worldPosition.x,
      target.worldPosition.y,
      missile.worldRotation
    );
    missile.rudder = clamp(turn, -missile.turnRate, missile.turnRate);
    syncMissileVelocity(missile);
    emitMissilePlume(missile);
  }
}

function handleProjectileCollisions() {
  const pairs = Sim.detectDynamicCollisions();
  const spentProjectiles = new Set();

  for (const { objectA, objectB } of pairs) {
    const pointDefenseHit = getPointDefenseHit(objectA, objectB);
    if (pointDefenseHit) {
      const { bullet, missile } = pointDefenseHit;
      if (spentProjectiles.has(bullet.name) || spentProjectiles.has(missile.name)) continue;
      spentProjectiles.add(bullet.name);
      spentProjectiles.add(missile.name);
      spawnPointDefenseImpact(midpoint(bullet.worldPosition, missile.worldPosition), missile.team);
      continue;
    }

    const projectileHullHit = getProjectileHullHit(objectA, objectB);
    if (projectileHullHit) {
      const { projectile, hull } = projectileHullHit;
      if (spentProjectiles.has(projectile.name)) continue;
      spentProjectiles.add(projectile.name);
      hull.hitsTaken += 1;
      spawnImpactEffect(projectile.worldPosition, hull.impactColor, projectile.velocity);
      continue;
    }

    const projectileProjectileHit = getProjectileProjectileHit(objectA, objectB);
    if (!projectileProjectileHit) continue;

    const { projectileA, projectileB } = projectileProjectileHit;
    if (spentProjectiles.has(projectileA.name) || spentProjectiles.has(projectileB.name)) continue;
    spentProjectiles.add(projectileA.name);
    spentProjectiles.add(projectileB.name);
    spawnImpactEffect(midpoint(projectileA.worldPosition, projectileB.worldPosition), '#fff4a3', {
      x: (projectileA.velocity.x + projectileB.velocity.x) / 2,
      y: (projectileA.velocity.y + projectileB.velocity.y) / 2,
    });
  }

  for (const projectileName of spentProjectiles) {
    removeProjectile(projectileName);
  }
}

function getProjectileHullHit(objectA, objectB) {
  if (isStrikeProjectile(objectA) && objectB.kind === 'warship' && objectA.team !== objectB.team) {
    return { projectile: objectA, hull: objectB };
  }
  if (isStrikeProjectile(objectB) && objectA.kind === 'warship' && objectB.team !== objectA.team) {
    return { projectile: objectB, hull: objectA };
  }
  return null;
}

function getProjectileProjectileHit(objectA, objectB) {
  if (!isStrikeProjectile(objectA) || !isStrikeProjectile(objectB)) return null;
  if (objectA.team === objectB.team) return null;
  return { projectileA: objectA, projectileB: objectB };
}

function getPointDefenseHit(objectA, objectB) {
  if (objectA.kind === 'pd-bullet' && objectB.kind === 'missile' && objectA.team !== objectB.team) {
    return { bullet: objectA, missile: objectB };
  }
  if (objectB.kind === 'pd-bullet' && objectA.kind === 'missile' && objectB.team !== objectA.team) {
    return { bullet: objectB, missile: objectA };
  }
  return null;
}

function spawnImpactEffect(position, color, velocity) {
  const impactAngle = (Math.atan2(velocity.y, velocity.x) * 180) / Math.PI;
  Effects.addForeground(new RadialEffect(position, 10, 180, color, 3, IMPACT_FLASH_SECONDS));
  Effects.addForeground(
    ParticleEffect.generateGroup(position, impactAngle, 120, 60, 180, 2, color, 18, 0.2, 0.55)
  );
}

function spawnPointDefenseImpact(position, missileTeam) {
  const color = missileTeam === 'red' ? '#ffb347' : '#9ee7ff';
  Effects.addForeground(new RadialEffect(position, 7, 140, color, 2.5, 0.22));
  Effects.addForeground(
    ParticleEffect.generateGroup(position, 180, 360, 50, 170, 2, color, 14, 0.12, 0.35)
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

function removeMissile(missileName) {
  const index = activeMissiles.findIndex((missile) => missile.name === missileName);
  if (index === -1) return;
  const [missile] = activeMissiles.splice(index, 1);
  Sim.remove(missile.name);
}

function removePointDefenseBullet(bulletName) {
  const index = activePointDefenseBullets.findIndex((bullet) => bullet.name === bulletName);
  if (index === -1) return;
  const [bullet] = activePointDefenseBullets.splice(index, 1);
  Sim.remove(bullet.name);
}

function removeProjectile(projectileName) {
  if (projectileName.includes('-missile-')) {
    removeMissile(projectileName);
    return;
  }
  if (projectileName.includes('-pd-')) {
    removePointDefenseBullet(projectileName);
    return;
  }
  removeShell(projectileName);
}

function drawArena() {
  const gfx = View.context;
  const topLeft = View.worldToScreen({ x: -ARENA_HALF, y: -ARENA_HALF });
  const bottomRight = View.worldToScreen({ x: ARENA_HALF, y: ARENA_HALF });
  gfx.strokeStyle = '#446';
  gfx.lineWidth = 2;
  gfx.strokeRect(
    topLeft.x,
    topLeft.y,
    bottomRight.x - topLeft.x,
    bottomRight.y - topLeft.y
  );
}

function drawHud() {
  const gfx = View.context;
  gfx.fillStyle = '#ffffff';
  gfx.font = '14px monospace';
  gfx.fillText('Moving Warship Duel', 10, 20);
  gfx.fillText(`Active shells: ${activeShells.length}`, 10, 40);
  gfx.fillText(`Active missiles: ${activeMissiles.length}`, 10, 60);
  gfx.fillText(`Point-defense bursts: ${activePointDefenseBullets.length}`, 10, 80);
  gfx.fillText(`${leftShip.name} speed: ${leftShip.speed.toFixed(1)} hits: ${leftShip.hitsTaken}`, 10, 100);
  gfx.fillText(`${rightShip.name} speed: ${rightShip.speed.toFixed(1)} hits: ${rightShip.hitsTaken}`, 10, 120);
}

function syncShipVelocity(ship) {
  const headingVelocity = Vec.fromAngleAndMagnitude(ship.worldRotation, ship.speed);
  ship.velocity.x = headingVelocity.x;
  ship.velocity.y = headingVelocity.y;
}

function syncMissileVelocity(missile) {
  const headingVelocity = Vec.fromAngleAndMagnitude(missile.worldRotation, missile.speed);
  missile.velocity.x = headingVelocity.x;
  missile.velocity.y = headingVelocity.y;
}

function emitMissilePlume(missile) {
  missile.plumeAccumulator += Main.delta;
  const emissionStep = 1 / MISSILE_PLUME_EMITS_PER_SECOND;
  if (missile.plumeAccumulator < emissionStep) return;

  while (missile.plumeAccumulator >= emissionStep) {
    missile.plumeAccumulator -= emissionStep;

    const exhaust = {
      x: missile.worldPosition.x,
      y: missile.worldPosition.y,
    };
    Effects.addForeground(
      ParticleEffect.generateGroup(
        exhaust,
        missile.worldRotation + 180,
        22,
        30,
        95,
        4,
        '#ffffff',
        6,
        0.22,
        0.6
      )
    );
  }
}

function isProjectile(obj) {
  return obj.kind === 'shell' || obj.kind === 'missile';
}

function isStrikeProjectile(obj) {
  return obj.kind === 'shell' || obj.kind === 'missile';
}

function findNearestEnemyMissile(ship) {
  let nearestMissile = undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const missile of activeMissiles) {
    if (missile.team === ship.team) continue;
    const distance = Vec.dist(ship.worldPosition, missile.worldPosition);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestMissile = missile;
    }
  }

  return nearestMissile;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
