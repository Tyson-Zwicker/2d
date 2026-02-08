import View from './view.js';
import Main from './main.js';
import Game from './game.js';
import GameObject from './gameobject.js';
import Body from './body.js';
import BodyPart from './bodypart.js';

View.initialize('#222');

const body = new Body('ship');
body.faces = [
	{
		color: '#f4b',
		points: [
			{ x: -20, y: -10 },
			{ x: 20, y: 0 },
			{ x: -20, y: 10 }
		]
	}
];
body.position = { x: View.screenCenter.x, y: View.screenCenter.y };
body.velocity = { x: 0.03, y: 0.02 };

const leftWing = new BodyPart('leftWing', 0, 1, true);
leftWing.faces = [
	{
		color: '#7cf',
		points: [
			{ x: -30, y: -6 },
			{ x: -8, y: -2 },
			{ x: -8, y: 2 },
			{ x: -30, y: 6 }
		]
	}
];

const rightWing = new BodyPart('rightWing', 0, 1, true);
rightWing.faces = [
	{
		color: '#7cf',
		points: [
			{ x: 8, y: -2 },
			{ x: 30, y: -6 },
			{ x: 30, y: 6 },
			{ x: 8, y: 2 }
		]
	}
];

const engine = new BodyPart('engine', 0, 1, false);
engine.faces = [
	{
		color: '#fd6',
		points: [
			{ x: -6, y: -8 },
			{ x: 6, y: -8 },
			{ x: 6, y: 8 },
			{ x: -6, y: 8 }
		]
	}
];

body.partAdd(leftWing, { x: -10, y: 0 });
body.partAdd(rightWing, { x: 10, y: 0 });
body.partAdd(engine, { x: -18, y: 0 });

const ship = new GameObject('ship', body);
Game.addGameObject(ship);

Main.run();
