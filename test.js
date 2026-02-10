import View from './view.js';
import Main from './main.js';
import Game from './game.js';
import GameObject from './gameobject.js';
import Body from './body.js';
import BodyPart from './bodypart.js';

View.initialize('#222');

const body = new Body('shipBody');
body.position = { x: 0, y: 0 };
body.velocity = { x: 0, y: 0 };
body.spin = 0;

const reactor = new BodyPart('reactor', 0, 20, true);
reactor.faces = [{ color: '#99F', points: [{ x: -30, y: -30 }, { x: 30, y: - 30 }, { x: 30, y: 30 }, { x: -30, y: 30 }] }]; //60
const leftRad = new BodyPart('left-rad', 0, 1, true);
leftRad.faces = [{ color: '#ffb', points: [{ x: -10, y: -30 }, { x: 10, y: -30 }, { x: 5, y: 20 }, { x: 0, y: 30 }, { x: -5, y: 20 }] }];
const leftRad2 = new BodyPart('left-rad2', 0, 1, true);
leftRad2.faces = [{ color: '#ffb', points: [{ x: -10, y: -30 }, { x: 10, y: -30 }, { x: 5, y: 20 }, { x: 0, y: 30 }, { x: -5, y: 20 }] }];
const rightRad = new BodyPart('right-rad', 0, 1, true);
rightRad.faces = [{ color: '#ffb', points: [{ x: 0, y: -30 }, { x: 5, y: -20 }, { x: 10, y: 30 }, { x: -10, y: 30 }, { x: -5, y: -20 }] }];
const rightRad2 = new BodyPart('right-rad2', 0, 1, true);
rightRad2.faces = [{ color: '#ffb', points: [{ x: 0, y: -30 }, { x: 5, y: -20 }, { x: 10, y: 30 }, { x: -10, y: 30 }, { x: -5, y: -20 }] }];
const rightEngine = new BodyPart('right-engine', 0, 10, true);
rightEngine.faces = [{ color: '#c62', points: [{ x: -10, y: -10 }, { x: 10, y: -3 }, { x: 10, y: 3 }, { x: -10, y: 10 }] }];//20
const leftEngine = new BodyPart('left-engine', 0, 10, true);
leftEngine.faces = [{ color: '#c62', points: [{ x: -10, y: -10 }, { x: 10, y: -3 }, { x: 10, y: 3 }, { x: -10, y: 10 }] }];//20

const radar = new BodyPart('radar', 0, 1, true);
radar.faces = [{ color: '#0f0', points: [{ x: -5, y: 0 }, { x: 5, y: -8 }, { x: 5, y: 8 }] }];
const hull = new BodyPart('hull', 0, 25, true);
hull.faces = [{ color: '#77d', points: [{ x: -70, y: -18 }, { x: 70, y: -9 }, { x: 70, y: 9 }, { x: -70, y: 18 }] }]; //100
const bow = new BodyPart('bow', 0, 10, true);
bow.faces = [{ color: '#99f', points: [{ x: -20, y: -35 }, { x: 20, y: -5 }, { x: 20, y: 5 }, { x: -20, y: 35 }] }]; //40
const leftFuel = new BodyPart('left-fuel', 0, 15);
leftFuel.faces = [{ color: '#ccf', points: [{ x: -12, y: -4 }, { x: -4, y: -12 }, { x: 4, y: -12 }, { x: 12, y: -4 }, { x: 12, y: 4 }, { x: 4, y: 12 }, { x: -4, y: 12 }, { x: -12, y: 4 }] }];
const rightFuel = new BodyPart('right-fuel', 0, 15);
rightFuel.faces = [{ color: '#ccf', points: [{ x: -12, y: -4 }, { x: -4, y: -12 }, { x: 4, y: -12 }, { x: 12, y: -4 }, { x: 12, y: 4 }, { x: 4, y: 12 }, { x: -4, y: 12 }, { x: -12, y: 4 }] }];
const turret1 = new BodyPart('turret1', -25, 5, true);
turret1.faces = [
  { color: '#ea5', points: [{ x: -10, y: -10 }, { x: 10, y: -7 }, { x: 10, y: 7 }, { x: -10, y: 10 }] },
  { color: '#f60', points: [{ x: 10, y: -6 }, { x: 30, y: - 5 }, { x: 30, y: -3 }, { x: 10, y: -2 }] },
  { color: '#f60', points: [{ x: 10, y: 6 }, { x: 30, y: 5 }, { x: 30, y: 3 }, { x: 10, y: 2 }] }
];
const turret2 = new BodyPart('turret2', 25, 5, true);
turret2.faces = [
  { color: '#ea5', points: [{ x: -10, y: -10 }, { x: 10, y: -7 }, { x: 10, y: 7 }, { x: -10, y: 10 }] },
  { color: '#f60', points: [{ x: 10, y: -6 }, { x: 30, y: - 5 }, { x: 30, y: -3 }, { x: 10, y: -2 }] },
  { color: '#f60', points: [{ x: 10, y: 6 }, { x: 30, y: 5 }, { x: 30, y: 3 }, { x: 10, y: 2 }] }
];
const lftBowThruster = new BodyPart('left-bow-thruster', -45, 5, true);
lftBowThruster.faces = [{ color: '#909', points: [{ x: -3, y: -3 }, { x: 3, y: -3 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: 3, y: 3 }, { x: -3, y: 3 }, { x: -1, y: 1 }, { x: -1, y: -1 }] }];
const rgtBowThruster = new BodyPart('right-bow-thruster', 45, 5, true);
rgtBowThruster.faces = [{ color: '#909', points: [{ x: -3, y: -3 }, { x: 3, y: -3 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: 3, y: 3 }, { x: -3, y: 3 }, { x: -1, y: 1 }, { x: -1, y: -1 }] }];
const lftAftThruster = new BodyPart('left-aft-thruster', -45, 5, true);
lftAftThruster.faces = [{ color: '#909', points: [{ x: -3, y: -3 }, { x: 3, y: -3 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: 3, y: 3 }, { x: -3, y: 3 }, { x: -1, y: 1 }, { x: -1, y: -1 }] }];
const rgtAftThruster = new BodyPart('right-aft-thruster', 45, 5, true);
rgtAftThruster.faces = [{ color: '#909', points: [{ x: -3, y: -3 }, { x: 3, y: -3 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: 3, y: 3 }, { x: -3, y: 3 }, { x: -1, y: 1 }, { x: -1, y: -1 }] }];

const greenArrow = new BodyPart ('green-arrow',0,1,false);
greenArrow.faces = [{color:'#0f0', points: [
  {x:-50,y:-8},
  {x: 20,y:-8},
  {x:0,y:-50},
  {x:50,y:0},
  {x:0,y:50},
  {x:20,y:8},
  {x:-50,y:8}
]}];
const blueArrow = new BodyPart ('blue-arrow',0,1,false);
blueArrow.faces = [{color:'#00f', points: [
  {x:-25,y:-5},
  {x: 10,y:-5},
  {x:0,y:-25},
  {x:25,y:0},
  {x:0,y:25},
  {x:10,y:5},
  {x:-25,y:5}
]}];
const redArrow = new BodyPart ('red-arrow',0,1,false);
redArrow.faces = [{color:'#f00', points: [
  {x:-20,y:-3},
  {x: 0,y:-3},
  {x:0,y:-15},
  {x:20,y:0},
  {x:0,y:15},
  {x:0,y:3},
  {x:-20,y:3}
]}];

body.partAdd(hull, { x: 60, y: 0 });
body.partAdd(bow, { x: 130, y: 0 });
body.partAdd(reactor, { x: -40, y: 0 });
body.partAdd(leftFuel, { x: -80, y: -12 });
body.partAdd(rightFuel, { x: -80, y: 12 });
body.partAdd(leftEngine, { x: -100, y: -12 });
body.partAdd(rightEngine, { x: -100, y: 12 });

bow.partAdd(greenArrow,{x:0,y:0});
greenArrow.partAdd (blueArrow, {x:75,y:0});
blueArrow.partAdd (redArrow, {x:40,y:0});


hull.partAdd(turret1, { x: -30, y: 0 });
hull.partAdd(turret2, { x: 25, y: 0 });
bow.partAdd(lftBowThruster, { x: 0, y: -20 });
bow.partAdd(rgtBowThruster, { x: 0, y: 20 });
leftFuel.partAdd(lftAftThruster, { x: 0, y: -12 });
rightFuel.partAdd(rgtAftThruster, { x: 0, y: 12 });
reactor.partAdd(rightRad, { x: -15, y: 60 })
reactor.partAdd(leftRad, { x: -15, y: -60 });
reactor.partAdd(rightRad2, { x: 15, y: 60 })
reactor.partAdd(leftRad2, { x: 15, y: -60 });
reactor.partAdd(radar, { x: 20, y: 0 });
radar.spin = 50;

console.log('moment of inertia:' + body.momentOfInertia);
console.log('total mass:' + body.totalMass);
console.log('center of mass: (' + body.centerOfMass.x + ',' + body.centerOfMass.y + ')');


const ship = new GameObject('ship', body);
Game.addGameObject(ship);
Main.creatorsFunction = function (){
  greenArrow.rotation +=1;
  blueArrow.rotation +=0;
  redArrow.rotation -=1;
  Main.tickMsg.push ('Green: '+greenArrow.rotation);
  Main.tickMsg.push ('Blue: '+greenArrow.rotation);
  Main.tickMsg.push ('Red: '+redArrow.rotation);
}
Main.run(10);
