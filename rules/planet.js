import StarSystem from './starsystem.js';
import PlanetZone from './planetzone.js';
export default class Planet {
  zones = [];
  type = '';
  name = 'unnamed';
  mien = undefined;
  process() {
    for (let z of this.zones) {
      z.process();
    }
  }
  static attachStarter(star, mien) {

    let p = new Planet();
    p.mien = mien;
    p.type = "terran"
    p.name = star.name + star.planets.length;
    star.planets.push(p);
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
    }
    for (let i = 2; i < 4; i++) {
      let z = new PlanetZone();
      z.people = 0;
      z.food = 2;
      z.power = 2;
      z.ore = 2;
    }
    return p;
  }
  static attachStarterHelper(star, mien) {
    let p = new Planet();
    p.mien = mien;
    p.type = "rocky"
    p.name = star.name + star.planets.length;
    star.planets.push(p);
    for (let i = 0; i < 3; i++) {
      let z = new PlanetZone();
      z.resources.people = 0;
      z.resources.food = 0;
      z.resources.power = 2;
      z.resources.ore = 3;
      z.resources.gas = 2;
    }
    return p;
  }
}