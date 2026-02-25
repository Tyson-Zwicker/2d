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
let fc_armGrey = new Facade('#b50', '#d72', '#fff', 2, fname, fsize);
let fc_tur = new Facade('#284', '#3a7', '#fff', fname, fsize);
let fc_eng = new Facade('#a00', '#e50', '#fff', fname, fsize);
let fc_rct = new Facade('#a60', '#e50', '#fff', fname, fsize);
let fc_nzl = new Facade('#530', '#850', '#fff', fname, fsize);
let ap_mid = new Appearance(fc_mid);
let ap_hull = new Appearance(fc_hullGrey);
let ap_arm = new Appearance(fc_armGrey);
let ap_tur = new Appearance(fc_tur);
let ap_eng = new Appearance(fc_eng);
let ap_rct = new Appearance(fc_rct)
let ap_nzl = new Appearance(fc_nzl);
let secSize = 10;
let armDep = 2;
let turSize = 7;
let brlLenMod = 4;
let secMass = 1;
let armMass = 1;
let midMass = 10;
let engMass = 2;
let thrMass = 0.2;

let fwdHullSections = 6;
let engSections = 3;

let ship = new GameObject('ship', true);


let pts_hull = [{ x: -secSize, y: -secSize }, { x: secSize, y: -secSize }, { x: secSize, y: secSize }, { x: -secSize, y: secSize }];
let pts_hull_arm = [{ x: -secSize, y: -armDep }, { x: secSize, y: -armDep }, { x: secSize, y: armDep }, { x: -secSize, y: armDep }];
let pts_tur = [{ x: -turSize, y: -turSize }, { x: turSize, y: -turSize * .7 }, { x: turSize, y: -turSize * .2 }, { x: turSize * brlLenMod, y: -turSize * .2 }, { x: turSize * brlLenMod, y: turSize * .2 }, { x: turSize, y: turSize * .2 }, { x: turSize, y: turSize * .7 }, { x: -turSize, y: turSize }];
let pts_mid = [{ x: -secSize * 3, y: -secSize }, { x: -secSize * .5, y: -secSize * 2 }, { x: secSize * .5, y: -secSize * 2 }, { x: secSize * 3, y: -secSize }, { x: secSize * 3, y: secSize }, { x: secSize * .5, y: secSize * 2 }, { x: -secSize * .5, y: secSize * 2 }, { x: -secSize * 3, y: secSize }];
let pts_eng = [{ x: -secSize, y: -secSize * 0.5 }, { x: -secSize * 0.5, y: -secSize }, { x: secSize * 0.5, y: -secSize }, { x: secSize, y: -secSize * 0.5 }, { x: secSize, y: 0 }, { x: -secSize, y: 0 }];
let pts_rct = [{ x: -3 * secSize, y: -secSize }, { x: 3 * secSize, y: -secSize }, { x: 3 * secSize, y: secSize }, { x: -3 * secSize, y: secSize }];
let pts_nzl = [
  { x: -secSize, y: -secSize * 0.2 },
  { x: secSize, y: -secSize },
  { x: secSize, y: secSize },
  { x: -secSize, y: secSize * 0.2 }
];
let pts_thr = [
  { x: -secSize * 0.3, y: -secSize * 0.1 },
  { x: secSize * 0.3, y: -secSize * 0.4 },
  { x: secSize * 0.3, y: secSize * 0.4 },
  { x: -secSize * 0.3, y: secSize * 0.1 }
]
//"Face" = {appearance: app, points:[...points...]}
let face_mid = { appearance: ap_mid, points: pts_mid };
let part_mid = new Part('mid-section', [face_mid], midMass);
part_mid.addTo(ship, { x: 0, y: 0 }, 0);

let face_hull = { appearance: ap_hull, points: pts_hull };
let face_hull_arm = { appearance: ap_arm, points: pts_hull_arm };
let face_thr = { appearance: ap_nzl, points: pts_thr };

let xoffset = secSize * 3 + secSize //fwd edge of midsections + 1/2 width of section
for (let i = 0; i < fwdHullSections; i++) {
  let part_hull = new Part(`hull-fwd${i}`, [face_hull], secMass);
  part_hull.addTo(part_mid, { x: xoffset + (i * secSize * 2), y: 0 }, 0);

  let part_hull_arm_stb = new Part(`hull-arm-stb{i}`, [face_hull_arm], armMass);
  part_hull_arm_stb.addTo(part_hull, { x: 0, y: secSize + armDep }, 0);

  let part_hull_arm_prt = new Part(`hull-arm-prt${i}`, [face_hull_arm], armMass);
  part_hull_arm_prt.addTo(part_hull, { x: 0, y: -secSize - armDep }, 0);
  if (i === 1 || i === 4) {
    let face_tur = { appearance: ap_tur, points: pts_tur };
    let part_turret = new Part(`turret-${i == 1 ? 'A' : 'B'}`, [face_tur], 0.5);
    part_turret.addTo(part_hull, { x: 0, y: 0 }, 0, 1);
  }
  if (i === fwdHullSections - 1) {
    let part_thr_fwd_prt = new Part('fwd-prt-thrust', [face_thr], thrMass); //TODO: particle gen..
    part_thr_fwd_prt.addTo(part_hull, { x: 0, y: -secSize - armDep * 4 }, 90);
    let part_thr_fwd_stb = new Part('fwd-stb-thrust', [face_thr], thrMass); //TODO: particle gen..
    part_thr_fwd_stb.addTo(part_hull, { x: 0, y: secSize + armDep * 4 }, -90);
  }
}

let face_eng = { appearance: ap_eng, points: pts_eng };

xoffset = -secSize * 3 - secSize;
for (let i = 0; i < engSections; i++) {
  let part_eng_prt = new Part(`engine-prt${i}`, [face_eng], engMass);
  part_eng_prt.addTo(part_mid, { x: xoffset - 2 * secSize * i, y: -secSize }, 0);
  let part_eng_stb = new Part(`engine-stb${i}`, [face_eng], engMass);
  part_eng_stb.addTo(part_mid, { x: xoffset - 2 * secSize * i, y: secSize }, 180);
  if (i === engSections - 1) {
    let part_thr_fwd_prt = new Part('fwd-prt-thrust', [face_thr], thrMass); //TODO: particle gen..
    part_thr_fwd_prt.addTo(part_eng_prt, { x: 0, y: -secSize*1.3 }, 90);
    let part_thr_fwd_stb = new Part('fwd-stb-thrust', [face_thr], thrMass); //TODO: particle gen..
    part_thr_fwd_stb.addTo(part_eng_stb, { x: 0, y: -secSize*1.3 }, 90);
  }
}

let face_rct = { appearance: ap_rct, points: pts_rct };
let prt_rct = new Part(`reactor`, [face_rct], 3);
prt_rct.addTo(part_mid, { x: -6 * secSize, y: 0 }, 0)

let face_nzl = { appearance: ap_nzl, points: pts_nzl };
let prt_nzl = new Part('engine-exhaust', [face_nzl], 0.5); //TODO:<--Give this particle generator params
prt_nzl.addTo(prt_rct, { x: -4 * secSize, y: 0 }, 0);

ship.finalize();
console.log(ship);
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


