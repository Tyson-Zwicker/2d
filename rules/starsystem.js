import Mien from '../engine/mien.js';
import StarInterface from './starinterface.js';
import Planet from './planet.js';

export default class StarSystem {
  name = 'unnamed';
  planets = [];
  gameObject = undefined;
  guiPanel = undefined;
  interface = undefined;
  constructor (name, planets, mien= StarInterface.StarMien){
    this.name = name;
    this.planets = planets;
    this.mien = mien;
    this.interface = new StarInterface(this);        
  }

  static Starter() {
    let planets = [Planet.getStarter('Terra', Mien.Blue), Planet.getStarterHelper('Other', Mien.Gray)];        
    let s = new StarSystem('Home',planets, StarInterface.StarMien);    
    return s;
  }
  static getRandom (){

  }
}
