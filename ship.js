import View from './view.js';
import Main from './main.js';
import Game from './game.js';
import GameObject from './gameobject.js';
import BodyPart from './bodypart.js';

const body = new BodyPart ('body',[{"color":'#000', "points":[{"x":0,"y":0}]}]);
const reactor = new BodyPart('reactor', [{ color: '#99F', points: [{ x: -30, y: -30 }, { x: 30, y: - 30 }, { x: 30, y: 30 }, { x: -30, y: 30 }] }]); 
const leftRad = new BodyPart('left-rad',[{ color: '#ffb', points: [{ x: -10, y: -30 }, { x: 10, y: -30 }, { x: 5, y: 20 }, { x: 0, y: 30 }, { x: -5, y: 20 }] }]);
const leftRad2 = new BodyPart('left-rad2', [{ color: '#ffb', points: [{ x: -10, y: -30 }, { x: 10, y: -30 }, { x: 5, y: 20 }, { x: 0, y: 30 }, { x: -5, y: 20 }] }]);
const rightRad = new BodyPart('right-rad', [{ color: '#ffb', points: [{ x: 0, y: -30 }, { x: 5, y: -20 }, { x: 10, y: 30 }, { x: -10, y: 30 }, { x: -5, y: -20 }] }]);
const rightRad2 = new BodyPart('right-rad2',[{ color: '#ffb', points: [{ x: 0, y: -30 }, { x: 5, y: -20 }, { x: 10, y: 30 }, { x: -10, y: 30 }, { x: -5, y: -20 }] }]);
const rightEngine = new BodyPart('right-engine', [{ color: '#c62', points: [{ x: -10, y: -10 }, { x: 10, y: -3 }, { x: 10, y: 3 }, { x: -10, y: 10 }] }]);
const leftEngine = new BodyPart('left-engine', [{ color: '#c62', points: [{ x: -10, y: -10 }, { x: 10, y: -3 }, { x: 10, y: 3 }, { x: -10, y: 10 }] }]);

const radar = new BodyPart('radar', [{ color: '#0f0', points: [{ x: -5, y: 0 }, { x: 5, y: -8 }, { x: 5, y: 8 }] }]);
const hull = new BodyPart('hull', [{ color: '#77d', points: [{ x: -70, y: -18 }, { x: 70, y: -9 }, { x: 70, y: 9 }, { x: -70, y: 18 }] }]);
const bow = new BodyPart('bow', [{ color: '#99f', points: [{ x: -20, y: -35 }, { x: 20, y: -5 }, { x: 20, y: 5 }, { x: -20, y: 35 }] }]); 
const leftFuel = new BodyPart('left-fuel', [{ color: '#ccf', points: [{ x: -12, y: -4 }, { x: -4, y: -12 }, { x: 4, y: -12 }, { x: 12, y: -4 }, { x: 12, y: 4 }, { x: 4, y: 12 }, { x: -4, y: 12 }, { x: -12, y: 4 }] }]);
const rightFuel = new BodyPart('right-fuel', [{ color: '#ccf', points: [{ x: -12, y: -4 }, { x: -4, y: -12 }, { x: 4, y: -12 }, { x: 12, y: -4 }, { x: 12, y: 4 }, { x: 4, y: 12 }, { x: -4, y: 12 }, { x: -12, y: 4 }] }]);
const turret1 = new BodyPart('turret1', [
  { color: '#ea5', points: [{ x: -10, y: -10 }, { x: 10, y: -7 }, { x: 10, y: 7 }, { x: -10, y: 10 }] },
  { color: '#f60', points: [{ x: 10, y: -6 }, { x: 30, y: - 5 }, { x: 30, y: -3 }, { x: 10, y: -2 }] },
  { color: '#f60', points: [{ x: 10, y: 6 }, { x: 30, y: 5 }, { x: 30, y: 3 }, { x: 10, y: 2 }] }
]);
const turret2 = new BodyPart('turret2', [
  { color: '#ea5', points: [{ x: -10, y: -10 }, { x: 10, y: -7 }, { x: 10, y: 7 }, { x: -10, y: 10 }] },
  { color: '#f60', points: [{ x: 10, y: -6 }, { x: 30, y: - 5 }, { x: 30, y: -3 }, { x: 10, y: -2 }] },
  { color: '#f60', points: [{ x: 10, y: 6 }, { x: 30, y: 5 }, { x: 30, y: 3 }, { x: 10, y: 2 }] }
]);
const thruster = [{ color: '#909', points: [{ x: -3, y: -3 }, { x: 3, y: -3 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: 3, y: 3 }, { x: -3, y: 3 }, { x: -1, y: 1 }, { x: -1, y: -1 }] }];
const lftBowThruster = new BodyPart('left-bow-thruster', thruster);
const rgtBowThruster = new BodyPart('right-bow-thruster', thruster);
const lftAftThruster = new BodyPart('left-aft-thruster', thruster);
const rgtAftThruster = new BodyPart('right-aft-thruster', thruster);

body.partAdd(hull, { x: 60, y: 0 },0);
body.partAdd(bow, { x: 130, y: 0 },0);
body.partAdd(reactor, { x: -40, y: 0 },0);
body.partAdd(leftFuel, { x: -80, y: -12 },0);
body.partAdd(rightFuel, { x: -80, y: 12 },0);
body.partAdd(leftEngine, { x: -100, y: -12 },0);
body.partAdd(rightEngine, { x: -100, y: 12 },0);
hull.partAdd(turret1, { x: -30, y: 0 },45);
hull.partAdd(turret2, { x: 25, y: 0 },-45);
bow.partAdd(lftBowThruster, { x: 0, y: -20 },0);
bow.partAdd(rgtBowThruster, { x: 0, y: 20 },0);
leftFuel.partAdd(lftAftThruster, { x: 0, y: -12 },0);
rightFuel.partAdd(rgtAftThruster, { x: 0, y: 12 },0);
reactor.partAdd(rightRad, { x: -15, y: 60 },0);
reactor.partAdd(leftRad, { x: -15, y: -60 },0);
reactor.partAdd(rightRad2, { x: 15, y: 60 },0);
reactor.partAdd(leftRad2, { x: 15, y: -60 },0);
reactor.partAdd(radar, { x: 20, y: 0 },0);
radar.spin = 360;

const ship = new GameObject('ship',body, {"x":0,"y":0},0);
Game.add(ship);

Main.creatorsFunction =()=>{
  ship.localRotation += -4*Main.delta;
}

Main.run(100);
