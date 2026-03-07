import GameState from './gamestate.js';
import StarSystem from './starsystem.js';

export default class GameEventHandler {
  static initialize(){
    //For now just make a single star system..
    let system = StarSystem.getStarter();
    GameState.starSystems.set (system.name, system);
  }
  static animate() {
    for (let starSystem of GameState.starSystems.values()) {
      starSystem.interface.animate();
    }
  }
}