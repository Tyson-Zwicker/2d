import View from './view.js';
import Main from './main.js';
import Game from './game.js';
import GameObject from './gameobject.js';
import Body from './body.js';
import BodyPart from './bodypart.js';

View.initialize('#222');

const body = new Body('ship');
body.position = { x: 0, y: 0 };
body.velocity = { x: 0, y: 0 };
body.spin = 1;
const leftRad = new BodyPart('leftRad', 0, 1, true);
leftRad.faces = [
  {
    color: '#600',
    points: [
      { x: -10, y: -30 },
      { x: 10, y: -30 },
      { x: 10, y: 20 },
      { x: 0, y: 30 },
      { x: -10, y: 20 },
      //{x: -10, y: -30 }
    ]
  }
];
body.partAdd(leftRad, { x: 0, y: -60 });
const rightRad = new BodyPart('rightRad', 0, 1, true);
rightRad.faces = [
  {
    color: '#f20',
    points: [
      { x: 0, y: -30 },
      { x: 10, y: -20 },
      { x: 10, y: 30 },
      { x: -10, y: 30 },
      { x: -10, y: -20 },
      //{ x: 0, y: 0 }
    ]
  }
];
body.partAdd(rightRad, { x: 0, y: 60 });

const hull = new BodyPart('hull', 0, 1, true);
hull.faces = [
  {
    color: '#99F',
    points: [
      { x: -30, y: -30 },
      { x: 30, y: - 30 },
      { x: 30, y: 30 },
      { x: -30, y: 30 }
    ]
  }
];
body.partAdd(hull, { x: 0, y: 0 });

const engine = new BodyPart('engine', 0, 1, true);
engine.faces = [
  {
    color: '#fd6',
    points: [
      { x: -10, y: -20 },
      { x: 10, y: -5 },
      { x: 10, y: 5 },
      { x: -10, y: 20 }
    ]
  }
];
body.partAdd(engine, { x: -40, y: 0 });

const ship = new GameObject('ship', body);
Game.addGameObject(ship);

Main.run(30);
