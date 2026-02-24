import Main from '../../main.js';
import Game from '../../game.js';
import GameObject from '../../gameobject.js';
import Part from '../../part.js';
import Keyboard from '../../keyboard.js';
import Vec from '../../vec.js';
import Appearance from '../../appearance.js';
import Facade from '../../facade.js';
let fname = 'Arial'
let fsize = 12;

let fc_mid = new Facade('#899', '#9bb', '#fff', 2, fname, fsize);
let fc_hullGrey = new Facade('#789', '#9aa', '#fff', 2, fname, fsize);
let fc_armGrey = new Facade('#a77', '#a77', '#fff', 2, fname, fsize);
let fc_tur = new Facade('#284', '#3a7', '#fff', fname, fsize);
let ap_mid = new Appearance(fc_mid);
let ap_hull = new Appearance(fc_hullGrey);
let ap_arm = new Appearance(fc_armGrey);
let ap_tur = new Appearance(fc_tur);

let secSize = 10;
let armDep = 2;
let turSize = 7;
let secMass = 1;
let armMass = 1;
let midMass = 10;

let ship = new GameObject('ship', true);
let fwdHullSections = 6;

let pts_hull = [{ x: -secSize, y: -secSize }, { x: secSize, y: -secSize }, { x: secSize, y: secSize }, { x: -secSize, y: secSize }];
let pts_hull_arm = [{ x: -secSize, y: -armDep }, { x: secSize, y: -armDep }, { x: secSize, y: armDep }, { x: -secSize, y: armDep }];
let pts_tur = [
  { x: -turSize, y: -turSize },    //back top
  { x: turSize, y: -turSize * .7 }, //front top
  { x: turSize, y: -turSize * .2 }, // front top to barrel base
  { x: turSize * 6, y: -turSize * .2 }, //barrel out to tip
  { x: turSize * 6, y: turSize * .2 }, //barrel tip
  { x: turSize, y: turSize * .2 }, //barrel back to base
  { x: turSize, y: turSize * .7 }, //barrel base to front bottom
  { x: -turSize, y: turSize } //front bottom to back bottom 
]
let pts_mid = [{ x: -secSize * 3, y: -secSize }, { x: -secSize * .5, y: -secSize * 2 }, { x: secSize * .5, y: -secSize * 2 }, { x: secSize * 3, y: -secSize }, { x: secSize * 3, y: secSize }, { x: secSize * .5, y: secSize * 2 }, { x: -secSize * .5, y: secSize * 2 }, { x: -secSize * 3, y: secSize }];
//"Face" = {appearance: app, points:[...points...]}
let face_mid = { appearance: ap_mid, points: pts_mid };
let part_mid = new Part('mid-section', [face_mid], midMass);
part_mid.addTo(ship, { x: 0, y: 0 }, 0);

let face_hull = { appearance: ap_hull, points: pts_hull };
let face_hull_arm = { appearance: ap_arm, points: pts_hull_arm };

let xoffset = secSize * 3 + secSize //fwd edge of midsections + 1/2 width of section
for (let i = 0; i < fwdHullSections; i++) {
  let part_hull = new Part(`hull-center-fwd${i}`, [face_hull], secMass);
  part_hull.addTo(part_mid, { x: xoffset + (i * secSize * 2), y: 0 }, 0);

  let part_hull_arm_stb = new Part(`hull-arm-stb{i}`, [face_hull_arm], armMass);
  part_hull_arm_stb.addTo(part_hull, { x: 0, y: secSize + armDep }, 0);

  let part_hull_arm_prt = new Part(`hull-arm-prt${i}`, [face_hull_arm], armMass);
  part_hull_arm_prt.addTo(part_hull, { x: 0, y: -secSize - armDep }, 0);
  //FIXME:  The turrets are being drawn first.  Drawing order needs to be reversed... kids first.
  if (i === 1 || i === 4) {
    let face_tur = { appearance: ap_tur, points: pts_tur };
    let part_turret = new Part(`turret-${i == 1 ? 'A' : 'B'}`, [face_tur], 0.5);
    part_turret.addTo(part_hull,{x:0,y:0},45);
  }
}

ship.finalize();
console.log (ship);
Game.add(ship, { x: 0, y: 0 }, 0);
/*
Keyboard.setKeyFunction('7', () => {
  for (let i = 0; i < 4; i++) {
    let obj = Game.get('blocks' + i);
    let part = obj.getPart('green-block9');
    let position = part.localPosition;
    let force = 20;
    let rotatedPos = Vec.rotate(position, obj.worldRotation);
    let forceVector = Vec.scale(Vec.perp(Vec.norm(rotatedPos)), force);
    obj.applyForce(forceVector, position);
  }
});

Keyboard.setKeyFunction('9', () => {
  for (let i = 0; i < 4; i++) {
    let obj = Game.get('blocks' + i);
    let part = obj.getPart('green-block9');
    let position = part.localPosition;
    let force = -20;
    let rotatedPos = Vec.rotate(position, obj.worldRotation);
    let forceVector = Vec.scale(Vec.perp(Vec.norm(rotatedPos)), force);
    obj.applyForce(forceVector, position);
  }
});

Keyboard.setKeyFunction('1', () => {
  for (let i = 0; i < 4; i++) {
    let obj = Game.get('blocks' + i);
    let part = obj.getPart('blue-block9');
    let position = part.localPosition;
    let force = 20;
    let rotatedPos = Vec.rotate(position, obj.worldRotation);
    let forceVector = Vec.scale(Vec.perp(Vec.norm(rotatedPos)), force);
    obj.applyForce(forceVector, position);
  }
});

Keyboard.setKeyFunction('3', () => {
  for (let i = 0; i < 4; i++) {
    let obj = Game.get('blocks' + i);
    let part = obj.getPart('blue-block9');
    let position = part.localPosition;
    let force = -20;
    let rotatedPos = Vec.rotate(position, obj.worldRotation);
    let forceVector = Vec.scale(Vec.perp(Vec.norm(rotatedPos)), force);
    obj.applyForce(forceVector, position);
  }
});
Keyboard.setKeyFunction(' ', () => {
  for (let i = 0; i < 4; i++) {
    let obj = Game.get('blocks' + i);
    let part = obj.getPart('blue-block9');
    let position = part.localPosition;
    let force = -100;
    let rotatedPos = Vec.rotate(position, obj.worldRotation);
    let forceVector = Vec.scale(Vec.norm(rotatedPos), force);
    obj.applyForce(forceVector, position);
  }
});
*/
Main.run();


