import Main from '../main.js';
import Game from '../game.js';
import GameObject from '../gameobject.js';
import BodyPart from '../bodypart.js';
import Keyboard from '../keyboard.js';
import Vec from '../vec.js';
let l = 10;

let block = [//rotates around center.
  { "x": -l, "y": -l },
  { "x": l, "y": -l },
  { "x": l, "y": l },
  { "x": -l, "y": l }
];

const greenBlock = new BodyPart('green', [{ "color": '#0f0', "points": block }], 10);
const blueBlock = new BodyPart('blue', [{ color: '#00f', points: block }], 10);
const redBlock = new BodyPart('red', [{ color: '#f00', points: block }], 10);
const cyanBlock = new BodyPart('cyan', [{ color: '#0dd', points: block }], 10);
const orangeBlock = new BodyPart('orange', [{ color: '#f90', points: block }], 10);


const bar0 = new GameObject('Bar Of Blocks', greenBlock,{x:0,y:0}, 0);
greenBlock.partAdd(blueBlock, { x: 2 * l, y: 0 }, 0);
blueBlock.partAdd(redBlock, { x: 2 * l, y: 0 }, 0);
redBlock.partAdd(cyanBlock, { x: 2 * l, y: 0 }, 0);
cyanBlock.partAdd(orangeBlock, { x: 2 * l, y: 0 }, 0);
Game.add(bar0);

/*
const bar1 = new GameObject('Bar Of Blocks', greenBlock,{x:0,y:0}, 60);
greenBlock.partAdd(blueBlock, { x: 2 * l, y: 0 }, 0);
blueBlock.partAdd(redBlock, { x: 2 * l, y: 0 }, 0);
redBlock.partAdd(cyanBlock, { x: 2 * l, y: 0 }, 0);
cyanBlock.partAdd(orangeBlock, { x: 2 * l, y: 0 }, 0);
Game.add(bar1);

const bar2 = new GameObject('Bar Of Blocks', greenBlock,{x:0,y:0}, 90);
greenBlock.partAdd(blueBlock, { x: 2 * l, y: 0 }, 0);
blueBlock.partAdd(redBlock, { x: 2 * l, y: 0 }, 0);
redBlock.partAdd(cyanBlock, { x: 2 * l, y: 0 }, 0);
cyanBlock.partAdd(orangeBlock, { x: 2 * l, y: 0 }, 0);
Game.add(bar2);

const bar3 = new GameObject('Bar Of Blocks', greenBlock,{x:0,y:0}, 135);
greenBlock.partAdd(blueBlock, { x: 2 * l, y: 0 }, 0);
blueBlock.partAdd(redBlock, { x: 2 * l, y: 0 }, 0);
redBlock.partAdd(cyanBlock, { x: 2 * l, y: 0 }, 0);
cyanBlock.partAdd(orangeBlock, { x: 2 * l, y: 0 }, 0);
Game.add(bar3);
*/

let deg0 = { "x": 1, "y": 0 };
let deg45 = { "x": 0.7071, "y": 0.7071 };
let deg90 = { "x": 0, "y": 1 };
let deg135 = { "x": -0.7071, "y": 0.7071 };

bar0.update();
/*
bar1.update();
bar2.update();
bar3.update();
*/

let norm = Vec.norm (orangeBlock.bodyPosition);
let perp = Vec.perp (norm);
let force = Vec.rotate (perp,30);

console.log ('block: norm',norm);
console.log ('block: perp',perp);

bar0.applyForce(force, orangeBlock);

Main.run();
