import Main from '../main.js';
import Game from '../game.js';
import GameObject from '../gameobject.js';
import BodyPart from '../bodypart.js';


let l = 10;

let block = [//rotates around center.
  { "x": -l, "y": -l },
  { "x": l, "y": -l },
  { "x": l, "y": l },
  { "x": -l, "y": l }
];

const greenBlock = new BodyPart('green', [{ "color": '#0f0', "points": block }],10);
const blueBlock = new BodyPart('blue', [{ color: '#00f', points: block }], 10);
const redBlock = new BodyPart('red', [{ color: '#f00', points: block }], 10);
const cyanBlock = new BodyPart('cyan', [{ color: '#0dd', points: block }], 10);
const orangeBlock = new BodyPart('orange', [{ color: '#f90', points: block }], 10);


const bar = new GameObject('Bar Of Blocks', greenBlock);
greenBlock.partAdd(blueBlock, { x: 2*l, y: 0 }, 0);
blueBlock.partAdd(redBlock, { x: 2*l, y: 0 }, 0);
redBlock.partAdd(cyanBlock, { x: 2*l, y: 0 }, 0);
cyanBlock.partAdd(orangeBlock, { x: 2*l, y: 0 }, 0);
Game.add(bar);

Main.creatorsFunction = function () {
  bar.bodyRotation +=1;
  
}
Main.run(60);
