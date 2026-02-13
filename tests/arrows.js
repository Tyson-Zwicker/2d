import Main from '.././main.js';
import Game from '.././game.js';
import GameObject from '.././gameobject.js';
import BodyPart from '.././bodypart.js';

let l = 100;
let w = 20;

let arrow = [//rotates around center.
  { "x": -l, "y": -w },
  { x: 0, y: -w },
  { x: 0, y: -w * 2 },
  { x: l, y: 0 },
  { x: 0, y: w * 2 },
  { x: 0, y: w },
  { x: -l, y: w }
];
let arrow2 = [ //rotates around base.
  { "x": 0, "y": -w },
  { x: l, y: -w },
  { x: l, y: -w * 2 },
  { x: 2 * l, y: 0 },
  { x: l, y: w * 2 },
  { x: l, y: w },
  { x: 0, y: w }
];

const greenArrow = new BodyPart('green-arrow', [{ "color": '#0f0', "points": arrow }],10);
greenArrow.ownRotation = 0;
greenArrow.offsetPosition = { "x": 0, "y": 0 };

const blueArrow = new BodyPart('blue-arrow', [{ color: '#00f', points: arrow2 }], 10);
const redArrow = new BodyPart('red-arrow', [{ color: '#f00', points: arrow2 }], 10);
const cyanArrow = new BodyPart('cyan-arrow', [{ color: '#0ff', points: arrow2 }], 10);
const ship = new GameObject('arrows', greenArrow);
greenArrow.partAdd(blueArrow, { x: l, y: 0 }, 30);
blueArrow.partAdd(redArrow, { x: l * 2, y: 0 }, 0);
redArrow.partAdd(cyanArrow, { x: l * 2, y: 0 }, 0);

Game.add(ship);

Main.creatorsFunction = function () {
  greenArrow.ownRotation += .1;
  blueArrow.ownRotation += -0.3;
  redArrow.ownRotation += .6;
  cyanArrow.ownRotation += -1;
}
Main.run(60);
