import PlanetZone from './planetzone.js';
import Rnd from '../engine/rnd.js';
import StarInterface from './starinterface.js';
export default class Planet {
  zones = [];
  type = '';
  name = 'unnamed';
  mien = undefined;
  process() {
    for (let z of this.zones) {
      z.process();
    }
    //TODO: planetary redistribution..
    //FIXME: calculate planet wide stats from individual sectors (or add getters...)
  }
  static getRandom(star) {
    let p = new Planet();
    p.mien = mien;
    p.name = star.name + star.planets.length;
    let t = Rnd.int(0, 4);

    let zones = Rnd.int(2, 8);
    for (let zone = 0; zone < zones; zone++) {
      let z = new PlanetZone();
      switch (t) {
        case 0: {
          p.type = 'terran';
          p.mien = StarInterface.TerranMien;
          z.resources.food = Rnd.int(1, 4);
          z.resources.power = Rnd.int(1, 2);
          z.resources.ore = Rnd.int(0, 1);
          z.resources.gas = 0;
        }
          break;
        case 1: {
          p.type = 'rocky';
          p.mien = StarInterface.RockyMien;
          z.resources.food = Rnd.int(0, 2);
          z.resources.power = Rnd.int(2, 3);
          z.resources.ore = Rnd.int(2, 3);
          z.resources.gas = Rnd.int(1, 2);
        } break;
        case 2: {
          p.type = 'tundra'
          p.mien = StarInterface.TundraMien;
          z.resources.food = Rnd.int(0, 1);
          z.resources.power = Rnd.int(0, 2);
          z.resources.ore = Rnd.int(1, 3);
          z.resources.gas = Rnd.int(0, 3);
        } break;
        case 3: {
          p.type = 'gas';
          p.mien = StarInterface.GasMien;
          z.resources.food = 0;
          z.resources.power = Rnd.int(2, 3);
          z.resources.ore = 0;
          z.resources.gas = Rnd.int(3, 6);
        } break;
      }
    }
  }
  static getStarter(starName, mien) {
    let p = new Planet();
    p.mien = StarInterface.TerranMien;
    p.type = "terran"
    p.name = starName.name;
    for (let i = 0; i < 2; i++) {
      let z = new PlanetZone();
      z.resources.people = 6; //require 6 food.
      z.resources.food = 4; //2 make enough food with 2 farms. (-3 power)
      z.resources.power = 2; //2 of them make enough for 4 farms..
      z.resources.ore = 1; //1 left and 1 power
      z.resources.gas = 0;
      z.infrastructure.farms = 2;
      z.infrastructure.power = 2;
      z.infrastructure.mine = 1;
      p.zones.push(z);
    }
    for (let i = 2; i < 4; i++) {
      let z = new PlanetZone();
      z.people = 0;
      z.resources.food = 2;
      z.resources.power = 2;
      z.resources.ore = 2;
      p.zones.push(z);
    }
    return p;
  }
  static getStarterHelper(starName, mien) {
    let p = new Planet();
    p.mien = mien;
    p.type = "rocky"
    p.mien = StarInterface.RockyMien;
    p.name = starName;
    
    for (let i = 0; i < 3; i++) {
      let z = new PlanetZone();
      z.resources.people = 0;
      z.resources.food = 0;
      z.resources.power = 2;
      z.resources.ore = 3;
      z.resources.gas = 3;
    }
    return p;
  }
}