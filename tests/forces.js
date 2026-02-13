import Main from '.././main.js';
import Game from '.././game.js';
import GameObject from '.././gameobject.js';
import BodyPart from '.././bodypart.js';
import Keyboard from '.././keyboard.js';

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

const greenArrow = new BodyPart('green-arrow', [{ "color": '#0f0', "points": arrow }], 10);
greenArrow.ownRotation = 0;
greenArrow.offsetPosition = { "x": 0, "y": 0 };

//const blueArrow = new BodyPart('blue-arrow', [{ color: '#00f', points: arrow2 }]);
//const redArrow = new BodyPart('red-arrow', [{ color: '#f00', points: arrow2 }]);

//greenArrow.partAdd(blueArrow, { x: l, y: 0 }, 0);
//blueArrow.partAdd(redArrow, { x: l*2, y: 0 }, 0);

const testObj = new GameObject('test', greenArrow, { "x": 0, "y": 0 });
Game.add(testObj);
// event = { "key": e.key, "when": Date.now(), "duration": duration, "action": 'release' };
Keyboard.setKeyFunction("8", (event) => {
  if (event.action === 'release') {
    let test = Game.get('test');
    let result = test.applyPointForce(10,{"x":0,"y":1}, { "x": 0, "y": -w }, 90);
    console.log(result.linear, result.angular);
  };
});
Keyboard.setKeyFunction("7", (event) => {
  if (event.action === 'release') {
    let test = Game.get('test');
    let result = test.applyPointForce(10,{"x":.7071,"y":.7071}, { "x": 0, "y": -w }, 45);
    console.log(result.linear, result.angular);
  };
});
Keyboard.setKeyFunction("9", (event) => {
  if (event.action === 'release') {
    let test = Game.get('test');
    let result = test.applyPointForce(10,{"x":-.7071,"y":.7071}, { "x": 0, "y": -w }, 45);
    console.log(result.linear, result.angular);
  };
});
Keyboard.setKeyFunction("4", (event) => {
  if (event.action === 'release') {
    let test = Game.get('test');
    let result = test.applyPointForce(10,{"x":0,"y":1}, { "x": -l, "y": -w }, 90);
    console.log(result.linear, result.angular);
  };
});
//Main.creatorsFunction = function () {}

Main.run(60);
