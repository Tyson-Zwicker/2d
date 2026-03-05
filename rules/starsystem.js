import Game from '../engine/game.js';
import GameObject from '../engine/gameobject.js';
import Mien from '../engine/mien.js';
import Part from '../engine/part.js'
import Polygon from '../engine/polygon.js';
import Planet from './planet.js';
import PlanetZone from './planetzone.js';

export default class StarSystem {
  name = 'unnamed';
  planets = [];
  gameObject = undefined;
  static {
    this.StarMien = new Mien('star-yellow');
    this.StarMien.setColors('#dd5', '#ff0', '#fff', 'normal');
    this.StarMien.setColors('#ff0', '#fff', '#000', 'hovered');
    this.StarMien.setColors('#f00', '#ff0', '#fff', 'pressed');
  }

  static Starter() {
    let s = new StarSystem();
    s.name = 'Home';
    Planet.attachStarter(s, Mien.Blue);
    Planet.attachStarterHelper(s,Mien.Gray);
    s.gameObject = StarSystem.getGameObject(s);
    return s;
  }

  static getGameObject(star) {
    
    let obj = new GameObject(star.name, true);
    let starPart = new Part('Sol-0', Polygon.regular(11, 150, StarSystem.StarMien));
    starPart.addTo (obj,{x:0,y:0});
    for (let i=0;i<star.planets.length;i++){
      let planet = new Part (star.name+'-'+i,Polygon.regular (11,20, star.planets[i].mien));
      planet.addTo(starPart,{x: 250+(i*150),y:0});
    }
    
    obj.finalize();
    Game.add (obj,{x:0,y:0},0);
    return obj;
    //let b = new Button('star-Home', false);
    //star.button = b;
    //b.gameObjectPart = star;

  }
}
