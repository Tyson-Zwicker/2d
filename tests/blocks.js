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

Keyboard.setKeyFunction("7", (event) => { //Fire left bow thruster.
  let f = 1;
  if (event.action === 'press' || event.action==='hold') {
    let bar = Game.get('Bar Of Blocks');
    let orangeBlk = bar.body.partGet ('orange');    
    let force  = Vec.scale (Vec.perp (Vec.norm (orangeBlk.bodyPosition)),f);
    bar.applyPointForce (force, orangeBlk);
    let result = bar.applyPointForce(force);
    console.log(result.linear, result.angular);
  }
});
Keyboard.setKeyFunction("9", (event) => {
  let f = 1;
  if (event.action === 'press' || event.action==='hold') {
    let bar = Game.get('Bar Of Blocks');
    let greenBlk = bar.body.partGet ('green');    
    let force  = Vec.scale (Vec.perp (Vec.norm (greenBlk.bodyPosition)),f);
    bar.applyPointForce (force, orangeBlk);
    let result = bar.applyPointForce(force);
    console.log(result.linear, result.angular);
  }
});
Keyboard.setKeyFunction("1", (event) => {
  
});
Keyboard.setKeyFunction("3", (event) => {
  
});

Main.creatorsFunction = function () {
  bar.bodyRotation +=1;
  
}
Main.run(60);
