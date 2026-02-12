import View from './view.js';
import Main from './main.js';
import Game from './game.js';
import GameObject from './gameobject.js';
import BodyPart from './bodypart.js';
import Keyboard from './keyboard.js';

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
const greenArrow = new BodyPart('green-arrow', [{ "color": '#0f0', "points": arrow }], 10);
greenArrow.ownRotation = 0;
greenArrow.offsetPosition = { "x": 0, "y": 0 };

//const blueArrow = new BodyPart('blue-arrow', [{ color: '#00f', points: arrow2 }]);
//const redArrow = new BodyPart('red-arrow', [{ color: '#f00', points: arrow2 }]);

//greenArrow.partAdd(blueArrow, { x: l, y: 0 }, 0);
//blueArrow.partAdd(redArrow, { x: l*2, y: 0 }, 0);

const testObj = new GameObject('test', greenArrow, { "x":0, "y":0});
Game.add(testObj);
// event = { "key": e.key, "when": Date.now(), "duration": duration, "action": 'release' };
Keyboard.setKeyFunction(" ", (event) => {
  //Apply a force of 1 newton to its center.
  if (event.action==='release'){
    console.log ('applying force...');
    let test = Game.get ('test');
    let result = test.applyPointForce(1,test.localPosition);
    console.log (result.linear);    
    console.log (result.angular);    
  };
});
//Main.creatorsFunction = function () {}

Main.run(60);
