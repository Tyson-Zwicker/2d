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

let fc_hullGrey1 = new Facade('#344', '#456', '#fff', 1, fname, fsize);
let fc_hullGrey2 = new Facade('#467', '#67a', '#fff', 11, GainNode, fsize);

let ap_hull1 = new Appearance(fc_hullGrey1);
let ap_hull2 = new Appearance(fc_hullGrey2);

let secSize = 10;
let secMass = 1;
let midMass = 10;
let ship = new GameObject('ship', true);

let pts_hull = [{ x: -secSize, y: -secSize }, { x: secSize, y: -secSize }, { x: secSize, y: secSize }, { x: -secSize, y: secSize }];
let pts_hull_stb = [{ x: -secSize, y: secSize * .7 }, { x: secSize, y: secSize * .7 }, { x: secSize, y: secSize }, { x: -secSize, y: secSize }];
let pts_hull_prt = [{ x: -secSize, y: -secSize }, { x: secSize, y: -secSize }, { x: secSize, y: -secSize * .7 }, { x: -secSize, y: -secSize * .7 }];
let pts_mid = [
  { x: -secSize * 3, y: -secSize }, { x: -secSize * .5, y: -secSize * 2 }, { x: secSize * .5, y: -secSize * 2 }, { x: secSize * 3, y: -secSize },
  , { x: secSize * 3, y: secSize }, { x: secSize * .5, y: secSize * 2 }, { x: -secSize * .5, y: secSize * 2 }, { x: -secSize * 3, y: secSize }
];
//"Face" = {appearance: app, points:[...points...]}
let face_mid = { appearance: ap_hull1, points: pts_mid };
let part_mid = new Part('mid-section', [face_mid], midMass);
part_mid.addTo(ship, { x: 0, y: 0 }, 0);

let face_hull = { appearance: ap_hull1, points: pts_hull };
let face_hull_stb = { appearance: ap_hull2, points: pts_hull_stb };
let face_hull_prt = { appearance: app_hull2, points: pts_hull_prt };
let fwdSections = 10;

for (let i = 0; i < hullSections; i++) {
  let part_hull = new Part('hull-center${i}', [face_hull], secMass);
  part_hull.addTo(part_mid, { x: (secSize * 3 + secSize / 2) + (i * secSize), y: 0 }, 0);
  //TODO: define stb and prt parts and add them at 90 and -90 rotation offset x:0, y:secSize/(+/-)2
  //these parts also have 2 faces: hull and either stb_
}

Game.add(ship, { x: 0, y: 0 }, 0);

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
Main.run(60);


