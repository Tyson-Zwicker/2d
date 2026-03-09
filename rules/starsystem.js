import Mien from '../engine/mien.js';
import StarInterface from './starinterface.js';
import Planet from './planet.js';

export default class StarSystem {
  name = 'unnamed';
  planets = [];
  gameObject = undefined;
  guiPanel = undefined;
  interface = undefined;
  constructor(name, planets, mien = StarInterface.StarMien) {
    this.name = name;
    this.planets = planets;
    this.mien = mien;
    this.interface = new StarInterface(this);
  }
  get population() {
    let pop = 0;
    for (let planet of this.planets) pop += planet.population;
    return pop;
  }
  get industry() {
    let ind = 0;
    for (let planet of this.planets) pop += planet.industry;
    return industry;
  }
  get populationGrowth() {
    let grw = 0;
    for (let planet of this.planets) grw += planet.industry;
    return grw;
  }
  static getStarter() {
    let planets = [Planet.getStarter('Terra', Mien.Blue), Planet.getStarterHelper('Other', Mien.Gray)];
    let s = new StarSystem('Home', planets, StarInterface.StarMien);
    return s;
  }
  static getRandom() {

  }
}
