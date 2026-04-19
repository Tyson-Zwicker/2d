import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { Vec } from '../dist/geometry.js';
import { Effects } from '../dist/effects.js';
import { RadialEffect } from '../dist/radialeffect.js';

//Testing collisions... and Steering..

//Make two arrow using facing and steeering..
let arrow = [{ x: -50, y: -15 }, { x: 5, y: -15 }, { x: 5, y: -50 }, { x: 50, y: 0 }, { x: 5, y: 50 }, { x: 5, y: 15 }, { x: -50, y: 15 }];

//Green meanders and occaisonally changes course.

let greenRateOfTurn = 10;
let greenTurnFrequency = 10000;
let greenLastTurnTime = 0;
let greenSpeed = 10;
let green = makeGreen();

//Yellow chases Green, it is slower, but always seeks the direct path...
let yellowRateOfTurn = 1;
let yellowTurnFrequency = 1000;
let yellowLastTurnedTime = 0;
let yellowSpeed = 5;
let yellow = makeYellow();

// Make Missile

let nextMissileName = () => { return 'missile'; }//return 'missile ' + (missiles.length) }
let missile = undefined;
let missileTurnFrequency = 300;
let missileLastTurnTime = 0;
let missileSpeed = 20;
let missileRateOfTurn = 15;
let missileFired = false;

Main.creatorsFunction = () => {
  let now = Date.now();
  TurnGreen(now);
  let yp = yellow.worldPosition;
  let gp = green.worldPosition;
  TurnYellow(now, yp, gp);
  if (!missile) {
    missile = makeMissile();
    missileFired = true;
    missileLastTurnTime = now;
  }
  if (missile) {
    missile.missileAge -= Main.delta;
    if (now - missileLastTurnTime > missileTurnFrequency) {
      TurnMissile(now, gp);
    }
  }
}
function TurnGreen(now) {
  if (now - greenLastTurnTime > greenTurnFrequency) {
    green.rudder = (Math.random() - Math.random()) * greenRateOfTurn;
    greenLastTurnTime = now;
  }
}
function TurnYellow(now, yp, gp) {//yellow/greenposition
  if (now - yellowLastTurnedTime > yellowTurnFrequency) {
    let turn = Vec.turnToFace(yp.x, yp.y, gp.x, gp.y, yellow.worldRotation);
    yellow.rudder = Math.sign(turn) * yellowRateOfTurn;
    yellowLastTurnedTime = now;
  }
}
function TurnMissile(now, gp) {
  missile.missileAge -= Main.delta;
  //Now we need to steer them - get direction to face and turn rudder that way..
  let mpos = missile.worldPosition;
  let turn = Vec.turnToFace(mpos.x, mpos.y, gp.x, gp.y, missile.worldRotation);
  missile.rudder = Math.sign(turn) * missileRateOfTurn;
  missileLastTurnTime = now;
}

function makeMissile() {
  let name = nextMissileName();
  let newMissile = new SimObject(name, 'always');
  newMissile.missileAge = 20000; //twenty second<- remove when reaches zero..
  //get turntoFace angle
  //use the sign to create the offset initial rotation, set rudder =0  initially..
  let angleToGreen = Vec.turnToFace(yellow.worldPosition.x, yellow.worldPosition.y, green.worldPosition.x, green.worldPosition.y, yellow.worldRotation);
  let initialHeading = yellow.worldRotation + Math.sign(angleToGreen) * 90;
  newMissile.rudder = 0;
  newMissile.speed = missileSpeed;
  newMissile.steerable = true;
  newMissile.worldRotation = initialHeading;
  let offset = Vec.fromAngleAndMagnitude(initialHeading, yellow.radius);
  let cyanPoly = Polygon.scale(new Polygon(structuredClone(arrow), Mien.Cyan), 0.25);
  let m = new Part(name, cyanPoly);
  m.addTo(newMissile, { x: 0, y: 0 }, 0);
  let wpos = Vec.add(yellow.worldPosition, offset);
  newMissile.worldPosition = wpos;
  newMissile.finalize();
  Sim.add(newMissile, wpos, initialHeading);
  return newMissile;
}
function makeGreen() {
  let green = new SimObject('green', 'always');
  new Part('green', new Polygon(structuredClone(arrow), Mien.Green)).addTo(green, { x: 0, y: 0 }, 0);
  green.steerable = true;
  green.speed = greenSpeed;
  green.rudder = 10;
  green.finalize();
  Sim.add(green, { x: -300, y: -300 }, 45);
  return green;
}
function makeYellow() {
  let yellow = new SimObject('yellow', 'always');
  new Part('yellow', new Polygon(structuredClone(arrow), Mien.Yellow)).addTo(yellow, { x: 0, y: 0 }, 0);
  yellow.steerable = true;
  yellow.speed = yellowSpeed;
  yellow.rudder = 0;
  yellow.finalize();
  Sim.add(yellow, { x: 300, y: 300 }, 45);
  return yellow;
}

Main.run(60);