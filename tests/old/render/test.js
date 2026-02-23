import Main from '../../../main.js';
import Game from '../../../game.js';
import GameObject from '../../../gameobject.js';
import Part from '../../../part.js';
import Appearance from '../../../appearance.js';

let blockPoints = [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }];
let redBlock = new Part('red-block', [{ appearance: Appearance.Red, points: blockPoints }], 1);
let greenBlock = new Part('green-block', [{ appearance: Appearance.Green, points: blockPoints }], 1);
let blueBlock = new Part('blue-block', [{ appearance: Appearance.Blue, points: blockPoints }], 1);
let gameObject = new GameObject('blocks');
redBlock.addTo(gameObject, { x: 0, y: 0 }, 0);
blueBlock.addTo(redBlock, { x: 20, y: 0 }, 45);
greenBlock.addTo(redBlock, { x: -20, y: 0 }, 0);
gameObject.finalize();
Game.add(gameObject, { x: 0, y: 0 }, 0);
Main.run();

